let FLOOR_PLAN = []; // 由 API (DB) 載入，不再硬編碼


let GRID_ROWS = 24;
let GRID_COLS = 40;
let dynGrid = null; // dynamic grid from API (overrides FLOOR_PLAN when set)
const RACK_LEVELS = 5;                          // C 貨架：一組 C# = 3 格（架1/2/3），每格 5 層（L1~L5）
const RACK_LVL_H = 0.45;                        // 鋼架層高（每層 0.45 米）
const RACK_H = 2.4;                             // 鋼架總高（2.4 米）
const RACK_SPAN_Y = RACK_H + 0.15;              // 一組 5 層 + 層間隙 → 頂區 3 座疊起（7.2m）
const REFRESH_INTERVAL = 60000;

const CELL_W = 1.05, CELL_D = 1.05;
const COL_GAP = 0.85, ROW_GAP = 0.85;   // 儲位間距加大：世界淨空 ~1.2（行人寬 0.84 可通過）
const PITCH_X = CELL_W + COL_GAP;               // 1.90
const PITCH_Z = CELL_D + ROW_GAP;               // 1.90

function cellKind(r, c) {
    if (dynGrid && dynGrid[r] && dynGrid[r][c] !== undefined) return dynGrid[r][c];
    if (FLOOR_PLAN[r] && FLOOR_PLAN[r][c] !== undefined) return FLOOR_PLAN[r][c]; return '.';
}
function isWalk(r, c) { return cellKind(r, c) === 'W'; }

// 計算統計（API 載入後更新）
let RACK_CELLS = 0, PALLET_CELLS = 0;
let TOTAL = 0, C_RACK_CODE_CNT = 0, C_PALLET_CODE_CNT = 0;
(function () {
    for (let r = 0; r < GRID_ROWS; r++)
        for (let c = 0; c < GRID_COLS; c++) {
            const k = cellKind(r, c);
            if (k === 'R') RACK_CELLS++;
            else if (k === 'P') PALLET_CELLS++;
        }
    TOTAL = RACK_CELLS * RACK_LEVELS + PALLET_CELLS;
})();


// ==================== 對接儲位出入庫系統（即時庫存，同源 HTTP 掛載） ====================
// HTTPS 頁面無法直連 HTTP-only 的 wh_cang API（mixed content 會被瀏覽器擋掉）；
// 故 HTTPS 走同源代理 wh_api.php（server-side 轉發），HTTP 則直連。
const WH_API_URL = (location.protocol === 'https:')
    ? 'wh_api.php?action=dashboard'
    : 'http://10.176.33.211:1102/wh_cang/api/api.php?action=dashboard';
let liveEntries = null;       // 最新一批真實資料（loc 已是看板命名 C/D/A/B）

let lastGridKey = '';
let axisLabelGroup = null, zoneLabelGroup = null;
let workersInited = false;

function rebuildStaticProps() {
    if (typeof world !== 'undefined' && propGroup && world.children.indexOf(propGroup) !== -1) {
        world.remove(propGroup);
    }
    // clear ghostStatic arrays
    Object.keys(ghostStatic).forEach(k => { ghostStatic[k].length = 0; });
    try { buildStaticProps(); }
    catch (e) { console.error('[3D buildStaticProps] 部分建構失敗:', e); }
    finally { if (typeof world !== 'undefined' && propGroup) world.add(propGroup); }
    // rebuild labels + workers (need FLOOR_PLAN populated)
    buildAxisLabels();
    buildZoneLabel();
    if (!workersInited) { workersInited = true; initWorkers(); }
}

async function refreshLive() {
    try {
        const resp = await fetch(WH_API_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const d = await resp.json();
        if (d && Array.isArray(d.entries) && d.entries.length >= 100) {
            liveEntries = d.entries;
            // sync dynamic grid from API
            if (Array.isArray(d.grid) && d.grid.length > 0) {
                // normalize: API may return array-of-arrays or array-of-strings
                dynGrid = d.grid.map(r => Array.isArray(r) ? r : r.split(''));
                FLOOR_PLAN = dynGrid; // sync for all FLOOR_PLAN references
                const gridKey = dynGrid.map(r => r.join('')).join('|');
                if (gridKey !== lastGridKey) {
                    lastGridKey = gridKey;
                    GRID_ROWS = dynGrid.length;
                    GRID_COLS = dynGrid[0].length;
                    RACK_CELLS = 0; PALLET_CELLS = 0;
                    for (let r = 0; r < GRID_ROWS; r++)
                        for (let c = 0; c < GRID_COLS; c++) {
                            const k = cellKind(r, c);
                            if (k === 'R') RACK_CELLS++;
                            else if (k === 'P') PALLET_CELLS++;
                        }
                    TOTAL = RACK_CELLS * RACK_LEVELS + PALLET_CELLS;
                    C_RACK_CODE_CNT = 0; C_PALLET_CODE_CNT = 0;
                    if (Array.isArray(liveEntries)) {
                        const rackSet = new Set(), palletSet = new Set();
                        liveEntries.forEach(e => {
                            const kk = (e.kind || '').toUpperCase();
                            if (kk === 'R') rackSet.add(e.location);
                            else if (kk === 'P') palletSet.add(e.location);
                        });
                        C_RACK_CODE_CNT = rackSet.size;
                        C_PALLET_CODE_CNT = palletSet.size;
                    }
                    try { rebuildStaticProps(); } catch (e) { console.error('[3D rebuildStaticProps] 失敗:', e); }
                }
            }
            return true;
        }
        throw new Error('bad payload');
    } catch (err) {
        // 真實資料優先：失敗時保留上次資料；從未有過則顯示空（絕不製造假資料）
        console.error('[3D refreshLive] 失敗:', (err && err.message) ? err.message : err, WH_API_URL);
        if (!Array.isArray(liveEntries)) liveEntries = [];
        return false;
    }
}

function gridPos(r, c) {
    return { x: (c - (GRID_COLS - 1) / 2) * PITCH_X, z: (r - (GRID_ROWS - 1) / 2) * PITCH_Z };
}

// 棧板區欄號規則：只在大馬路（最寬走道）重設、分左右；小走道跨越繼續數
const PALLET_COL_SCHEME = (function () {
    if (!FLOOR_PLAN.length) return {};
    const repRow = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0); // 找棧板代表列
    if (repRow < 0) return {};
    const row = FLOOR_PLAN[repRow];
    const runs = [];
    let start = -1;
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && row[c] === 'W';
        if (isW && start < 0) start = c;
        else if (!isW && start >= 0) { runs.push([start, c - 1]); start = -1; }
    }
    if (!runs.length) return {};   // 新 2F-C 平面圖走道為 '.'，無 'W' 大馬路段 → 空 scheme（軸標籤跳過）
    const maxLen = Math.max.apply(null, runs.map(rr => rr[1] - rr[0] + 1));
    const big = runs.find(rr => (rr[1] - rr[0] + 1) === maxLen);
    if (!big) return {};
    const scheme = {};
    let counter = 1;
    for (let c = 0; c < big[0]; c++) if (row[c] !== 'W') scheme[c] = { no: counter++, side: '左' };
    counter = 1;
    for (let c = big[1] + 1; c < GRID_COLS; c++) if (row[c] !== 'W') scheme[c] = { no: counter++, side: '右' };
    return scheme;
})();
function colNo(c) { const s = PALLET_COL_SCHEME[c]; return s ? s.no : null; }
function colSide(c) { const s = PALLET_COL_SCHEME[c]; return s ? s.side : ''; }

// 鋼架欄號方案：棧板區的小走道欄在鋼架區是鋼架，需列入編號；同樣只在大馬路重設、分左右
const RACK_COL_SCHEME = (function () {
    if (!FLOOR_PLAN.length || !FLOOR_PLAN[1]) return {};
    const row = FLOOR_PLAN[1]; // 鋼架代表列（左右皆鋼架）
    // 找鋼架列中最寬的 W 段當「大馬路」分界
    let st = -1, bigR = [0, 0];
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && row[c] === 'W';
        if (isW && st < 0) st = c;
        else if (!isW && st >= 0) { const len = c - 1 - st; if (len > (bigR[1] - bigR[0])) bigR = [st, c - 1]; st = -1; }
    }
    const scheme = {};
    let counter = 1;
    for (let c = 0; c < bigR[0]; c++) if (row[c] === 'R') scheme[c] = { no: counter++, side: '左' };
    counter = 1;
    for (let c = bigR[1] + 1; c < GRID_COLS; c++) if (row[c] === 'R') scheme[c] = { no: counter++, side: '右' };
    return scheme;
})();

// ==================== DATA（嚴格按 DB/API，不產生假資料） ====================
function generateMockData() { return []; }

// ==================== THREE.JS SCENE ====================
const workers = [];

function makeWorker() {
    const g = new THREE.Group();
    const matBody = new THREE.MeshLambertMaterial({ color: 0x2E6DC4 }); // 藍色工作服
    const matSkin = new THREE.MeshLambertMaterial({ color: 0xe8b386 });
    const matPants = new THREE.MeshLambertMaterial({ color: 0x2a3a52 });
    const matHat = new THREE.MeshLambertMaterial({ color: 0x2456a8 });   // 小藍帽
    const matTablet = new THREE.MeshLambertMaterial({ color: 0x2b3240 });
    const matScreen = new THREE.MeshLambertMaterial({ color: 0xcfe3f5 });

    const makeLeg = (sx) => {
        const pivot = new THREE.Group();
        pivot.position.set(sx, 0.52, 0);
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.13), matPants);
        leg.position.y = -0.26;
        pivot.add(leg);
        g.add(pivot);
        return pivot;
    };
    const legL = makeLeg(-0.09);
    const legR = makeLeg(0.09);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.52, 0.22), matBody);
    torso.position.y = 0.82;
    g.add(torso);
    // 胸前反光帶（前方 +Z）
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.345, 0.10, 0.014),
        new THREE.MeshLambertMaterial({ color: 0xffe066 }));
    chest.position.set(0, 0.84, 0.108);
    g.add(chest);

    // 頭：低頭看平板（頭群組向前傾）
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.12, 0);
    headGroup.rotation.x = 0.55;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), matSkin);
    head.position.y = 0.18;
    headGroup.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), matHat);
    cap.position.y = 0.33;
    headGroup.add(cap);
    // 長帽簷朝前 (+Z)
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.028, 0.22), matHat);
    brim.position.set(0, 0.30, 0.10);
    headGroup.add(brim);
    g.add(headGroup);

    // 手臂（向前下方伸、手持平板）
    const armGeo = new THREE.BoxGeometry(0.07, 0.42, 0.09);
    const makeArm = (sx) => {
        const pivot = new THREE.Group();
        pivot.position.set(sx, 1.06, 0.02);
        pivot.rotation.x = -0.9;
        const arm = new THREE.Mesh(armGeo, matBody);
        arm.position.y = -0.21;
        pivot.add(arm);
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.09), matSkin);
        hand.position.set(0, -0.45, 0.0);
        pivot.add(hand);
        g.add(pivot);
    };
    makeArm(-0.22);
    makeArm(0.22);

    // 平板電腦（雙手持、低頭看 = 盤點）
    const tablet = new THREE.Group();
    tablet.position.set(0, 0.86, 0.34);
    tablet.rotation.x = -0.4;
    const pid = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.21, 0.025), matTablet);
    tablet.add(pid);
    const scr = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.18, 0.012), matScreen);
    scr.position.set(0, 0, 0.014);
    tablet.add(scr);
    g.add(tablet);

    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    g.userData = { legL: legL, legR: legR };
    return g;
}

function initWorkers() {
    if (!FLOOR_PLAN.length) return;
    // 走道動態偵測：全 W 列 = 橫向人行道；棧板區代表列的最寬 W 段 = 大馬路；其餘小走道
    const walkRows = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        if (FLOOR_PLAN[r].every(ch => ch === '.')) walkRows.push(r);
    }
    const zHor = walkRows.length ? (walkRows[0] - (GRID_ROWS - 1) / 2) * PITCH_Z : 0;     // 第一條橫向人行道
    const zHor2 = (walkRows.length > 1) ? ((walkRows[1] - (GRID_ROWS - 1) / 2) * PITCH_Z) : zHor;
    const repRowW = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
    const prow = FLOOR_PLAN[repRowW];
    const wRuns = [];
    let wst = -1;
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && prow[c] === '.';
        if (isW && wst < 0) wst = c;
        else if (!isW && wst >= 0) { wRuns.push([wst, c - 1]); wst = -1; }
    }
    wRuns.sort((a, b) => ((b[1] - b[0]) - (a[1] - a[0])));
    const bigW = wRuns[0];
    const xBig = bigW ? (((bigW[0] + bigW[1]) / 2) - (GRID_COLS - 1) / 2) * PITCH_X : 0; // 大馬路
    const smallRuns = wRuns.slice(1);
    const zP0 = (repRowW - (GRID_ROWS - 1) / 2) * PITCH_Z - 0.2;   // 棧板區起
    const zP1 = ((GRID_ROWS - 1) - (GRID_ROWS - 1) / 2) * PITCH_Z + 0.2;

    const xSpan = (GRID_COLS / 2) * PITCH_X - 2;
    const zSpan = (GRID_ROWS / 2) * PITCH_Z - 2;
    const paths = [
        { a: [-xSpan, 0, zHor], b: [xSpan, 0, zHor] },            // 橫向人行道（上）
        { a: [-xSpan, 0, zHor2], b: [xSpan, 0, zHor2] },          // 橫向人行道（下）
        { a: [xBig, 0, -zSpan], b: [xBig, 0, zSpan] },            // 縱向大馬路
        ...smallRuns.map(rr => ({ a: [(((rr[0] + rr[1]) / 2) - (GRID_COLS - 1) / 2) * PITCH_X, 0, zP0], b: [(((rr[0] + rr[1]) / 2) - (GRID_COLS - 1) / 2) * PITCH_X, 0, zP1] })) // 小走道
    ];

    paths.forEach((pt, i) => {
        const worker = makeWorker();
        worker.position.set(pt.a[0], 0, pt.a[2]);
        const isH = pt.a[2] === pt.b[2];   // 水平走道 vs 垂直走道
        workers.push({
            group: worker,
            a: new THREE.Vector3(pt.a[0], 0, pt.a[2]),
            b: new THREE.Vector3(pt.b[0], 0, pt.b[2]),
            dist: (i * 7) % (2 * 26),
            speed: 0.8 + (i % 3) * 0.35,
            freq: 4 + (i % 3) * 0.6,
            // 盤點停點
            travel: (i * 0.9) % 1.7,          // 已走距離（用來算下一個停點）
            spacing: 1.7,                     // 每走 1.7 停一次
            dwell: 1.2 + (i % 4) * 0.35,      // 停留時間
            pauseT: 0,
            faceAngle: 0,
            sideIdx: i % 2,
            sideAngles: isH ? [0, Math.PI] : [-Math.PI / 2, Math.PI / 2] // 面向儲位方向
        });
        world.add(worker);
    });
}

function updateWorkers(dt, t) {
    workers.forEach(w => {
        // 停留：面向儲位（走道側邊），微微搖擺
        if (w.pauseT > 0) {
            w.pauseT -= dt;
            const target = w.faceAngle;
            let cur = w.group.rotation.y;
            const diff = ((((target - cur) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
            w.group.rotation.y = cur + diff * Math.min(1, dt * 6);
            const sw = Math.sin(t * 2) * 0.06;
            w.group.userData.legL.rotation.x = sw;
            w.group.userData.legR.rotation.x = -sw;
            w.group.position.y = 0.02;
            return;
        }
        // 行走
        const len = w.a.distanceTo(w.b);
        const prev = w.group.position.clone();
        w.dist += w.speed * dt;
        const period = 2 * len;
        const d = w.dist % period;
        const fwd = d <= len;
        const tt = (fwd ? d : period - d) / len;
        w.group.position.lerpVectors(w.a, w.b, tt);
        // 面向行進方向（帽簷→前方）
        const dirV = w.group.position.clone().sub(prev);
        if (dirV.lengthSq() > 1e-8) {
            w.group.rotation.y = Math.atan2(dirV.x, dirV.z);
        }
        const ph = w.dist * w.freq;
        w.group.userData.legL.rotation.x = Math.sin(ph) * 0.55;
        w.group.userData.legR.rotation.x = Math.sin(ph + Math.PI) * 0.55;
        w.group.position.y = Math.abs(Math.cos(ph)) * 0.035;
        // 走到間距 → 停點（面向下一個儲位）
        w.travel += w.speed * dt;
        if (w.travel >= w.spacing) {
            w.travel = 0;
            w.pauseT = w.dwell;
            w.faceAngle = w.sideAngles[w.sideIdx % 2];
            w.sideIdx++;
        }
    });
}

// ==================== 靜態場景（平台/走道/鋼架框架/格線） ====================
function buildStaticProps() {
    propGroup = new THREE.Group();

    // 外圍大地基尺寸（供馬路/格線/地標參考）
    const platW = GRID_COLS * PITCH_X + 0.6;
    const platD = GRID_ROWS * PITCH_Z + 0.6;
    // 平台底板（外圍大地基）— 整片用人行道（馬路）混凝土色，做為全場地板
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(platW, 0.2, platD),
        new THREE.MeshLambertMaterial({ color: 0x76828c })
    );
    platform.position.y = -0.1;
    platform.receiveShadow = true;
    propGroup.add(platform);

    // 對齊格線
    const halfW = platW / 2, halfD = platD / 2;
    const pts = [];
    for (let c = 0; c <= GRID_COLS; c++) {
        const x = (c - GRID_COLS / 2) * PITCH_X;
        pts.push(x, 0, -halfD, x, 0, halfD);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
        const z = (r - GRID_ROWS / 2) * PITCH_Z;
        pts.push(-halfW, 0, z, halfW, 0, z);
    }
    const gl = new THREE.BufferGeometry();
    gl.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const gridLines = new THREE.LineSegments(gl, new THREE.LineBasicMaterial({ color: 0x1c3646 }));
    gridLines.position.y = 0.012;
    propGroup.add(gridLines);

    // 鋼架框架（固定，每次刷新不重建）：同一排連續 R 連成一條長貨架（長邊沿列 X，深度維持 1.30）
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x1B7FA8 }); // 橫樑：深藍
    const postMat  = new THREE.MeshLambertMaterial({ color: 0x14663a }); // 立柱：深綠
    const slabMat  = new THREE.MeshLambertMaterial({ color: 0x1c7a43 }); // 層板（板子）深綠
    const runPostGeo = new THREE.BoxGeometry(0.12, RACK_H, 0.12);
    const runSlabGeo = new THREE.BoxGeometry(1, 0.07, 1.30);   // 長度 1，使用 scale.x=runLen（沿列連成長條，旋轉 90°）
    const runBeamGeo = new THREE.BoxGeometry(1, 0.05, 0.06);
    const runHalfD = 0.65;                                     // 深度一半（維持 1.30 前後）
    for (let r = 0; r < GRID_ROWS; r++) {
        let c = 0;
        while (c < GRID_COLS) {
            if (cellKind(r, c) !== 'R') { c++; continue; }
            const c0 = c; while (c < GRID_COLS && cellKind(r, c) === 'R') c++;
            const cEnd = c, runCols = cEnd - c0;
            const pa = gridPos(r, c0), pb = gridPos(r, cEnd - 1);
            const cx = (pa.x + pb.x) / 2, cz = pa.z;
            const L = (runCols - 1) * PITCH_X + CELL_W * 0.94;   // 連續長度（略縮，避免碰鄰排）
            const g = new THREE.Group();
            g.position.set(cx, 0, cz);
            g.userData.cat = 'rack';
            ghostStatic.rack.push(g);
            // 立柱：整排等距分佈（前後兩側），保留「一格一柱」節奏
            for (let i = 0; i <= runCols; i++) {
                const px = -L / 2 + (i / runCols) * L;
                [-runHalfD, runHalfD].forEach(oz => {
                    const post = new THREE.Mesh(runPostGeo, postMat);
                    post.position.set(px, RACK_H / 2, oz);
                    g.add(post);
                });
            }
            for (let lv = 0; lv < RACK_LEVELS; lv++) {
                const yTop = lv * RACK_LVL_H;
                const slab = new THREE.Mesh(runSlabGeo, slabMat);
                slab.scale.x = L; slab.position.set(0, yTop + 0.035, 0);
                g.add(slab);
                const fb = new THREE.Mesh(runBeamGeo, frameMat);
                fb.scale.x = L; fb.position.set(0, yTop + 0.035, -runHalfD);
                g.add(fb);
                const bb = new THREE.Mesh(runBeamGeo, frameMat);
                bb.scale.x = L; bb.position.set(0, yTop + 0.035, runHalfD);
                g.add(bb);
            }
            propGroup.add(g);
        }
    }
    const PILLAR_H = 4.5;   // 頂區 3 排 5 層貨架並排，牆/承重柱維持 4.5m
    const PILLAR_W = CELL_W * 0.96 * 1.5;
    const PILLAR_D = CELL_D * 0.96 * 1.5;
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xf0f2f4 });
    const pillarGeo = new THREE.BoxGeometry(PILLAR_W, PILLAR_H, PILLAR_D);
    const pillarCells = [];   // 柱子依 ID 順序（A1..A12）
    let pillarId = 1;
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (cellKind(r, c) === 'C') {
                pillarCells.push([r, c]);
                const pp = gridPos(r, c);
                const pil = new THREE.Mesh(pillarGeo, pillarMat);
                pil.position.set(pp.x, PILLAR_H / 2, pp.z);
                pil.userData.cat = 'pillar';
                ghostStatic.pillar.push(pil);
                propGroup.add(pil);
                const lbl = makeLabelSprite('A' + (pillarId++), '#ff4d4f', 1.3, 0.55);
                lbl.position.set(pp.x, PILLAR_H + 0.15, pp.z);
                propGroup.add(lbl);
            }
        }
    }

    // 2F-C 設施區（F 碼）：薄板＋名牌
    (function () {
        const fzDefs = [
            { r0: 0, r1: 0, c0: 0, c1: 2, name: '分料拆解區' },
            { r0: 0, r1: 0, c0: 37, c1: 39, name: 'IQC檢驗區' },
            { r0: 19, r1: 23, c0: 10, c1: 13, name: 'NG收料區' }
        ];
        fzDefs.forEach(function (fz) {
            const pa = gridPos(fz.r0, fz.c0), pb = gridPos(fz.r1, fz.c1);
            const fx = (pa.x + pb.x) / 2, fzm = (pa.z + pb.z) / 2;
            const w = Math.abs(pb.x - pa.x) + CELL_W, dd = Math.abs(pb.z - pa.z) + CELL_D;
            const mat = new THREE.MeshLambertMaterial({ color: 0x2a3540, transparent: true, opacity: 0.85 });
            const m2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, dd), mat);
            m2.position.set(fx, 0.03, fzm); propGroup.add(m2);
            const lb = makeLabelSprite(fz.name, '#eaffff', Math.min(4.5, w * 0.62), 0.6);
            lb.position.set(fx, 0.5, fzm); propGroup.add(lb);
        });
    })();

    // 四周圍牆：白色、與承重柱同高；北牆（貨架區）原位不動＋留有出入口開口，
    // 其餘三面往外延展 1 格，且長度沿新輪廓加長，四角完整接合圍起
    {
        const T = 0.3;
        const ex = PITCH_X, ez = PITCH_Z;              // 延展量 = 1 格
        const wallMat = new THREE.MeshLambertMaterial({ color: 0x9ed0f0 });   // 天藍玻璃色：50% 透明時仍比近白明顯
        const ewLen = 2 * halfD + ez + 2 * T;          // 東西牆：北牆線 ~ 南牆外緣
        const nsLen = 2 * (halfW + ex) + 2 * T;        // 南牆：西牆外緣 ~ 東牆外緣
        const ewGeo = new THREE.BoxGeometry(T, PILLAR_H, ewLen);
        const nsGeo = new THREE.BoxGeometry(nsLen, PILLAR_H, T);
        const mkWall = (geo, gx, gz) => {
            const w = new THREE.Mesh(geo, wallMat);
            w.position.set(gx, PILLAR_H / 2, gz);
            w.userData.cat = 'wall';
            ghostStatic.wall.push(w);
            propGroup.add(w);
        };
        // 北牆（貨架區，z 線不變）：拆兩段、留出入口開口 → 對準「大馬路」（最寬走道）中央並涵蓋整條走道寬
        const _rep = FLOOR_PLAN.findIndex(function (rr) { return rr.indexOf('P') >= 0; });
        const _rw = FLOOR_PLAN[_rep];
        const _runs = []; let _s = -1;
        for (let c = 0; c <= GRID_COLS; c++) {
            const isW = (c < GRID_COLS) && _rw[c] === 'W';
            if (isW && _s < 0) _s = c;
            else if (!isW && _s >= 0) { _runs.push([_s, c - 1]); _s = -1; }
        }
        _runs.sort(function (a, b) { return (b[1] - b[0]) - (a[1] - a[0]); });
        const _big = _runs[0];
        // 網格若無走道('W')：入口置中、開口 1 格（避免 _big undefined 崩潰）
        const entranceX = _big ? ((_big[0] + _big[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X : 0;   // 大馬路中心
        const gapW = _big ? ((_big[1] - _big[0] + 1) * PITCH_X + PITCH_X) : PITCH_X;               // 走道寬 + 1 格餘裕
        const wallL2 = halfW + ex + T;   // 伸到東西牆外緣，轉角接合
        const mkSeg = (x0, x1) => {
            const L = Math.abs(x1 - x0);
            const segGeo = new THREE.BoxGeometry(L, PILLAR_H, T);
            const w = new THREE.Mesh(segGeo, wallMat);
            w.position.set((x0 + x1) / 2, PILLAR_H / 2, -halfD);
            w.userData.cat = 'wall';
            ghostStatic.wall.push(w);
            propGroup.add(w);
        };
        mkSeg(-wallL2, entranceX - gapW / 2);          // 北牆-入口左段
        mkSeg(entranceX + gapW / 2, wallL2);           // 北牆-入口右段

        mkWall(nsGeo, 0, halfD + ez);                  // 南牆：外延 1 格、加長到整段
        mkWall(ewGeo, -(halfW + ex), ez / 2);         // 西牆：中心 z=+ez/2，兩端咬住北/南牆
        mkWall(ewGeo,  halfW + ex, ez / 2);          // 東牆：中心 z=+ez/2，兩端咬住北/南牆
    }

    // 電視：掛南牆內側、面朝北（大門口方向），人一進門正前方即見
    const tvFrameMat = new THREE.MeshBasicMaterial({ color: 0x14181c });
    {
        const halfD2 = ((GRID_ROWS - 1) / 2) * PITCH_Z;
        const southInner = halfD2 + PITCH_Z - 0.2 / 2 - 0.05;   // 南牆內側面（半深+延格-半厚-0.05）
        const tv = new THREE.Group();
        tv.position.set(-3.4, 4.0, southInner);   // 人行道中間略靠 A 區
        const frame = new THREE.Mesh(new THREE.BoxGeometry(TV_W, TV_H, 0.10), tvFrameMat);
        tv.add(frame);
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(TV_W * 0.92, TV_H * 0.86),
            new THREE.MeshBasicMaterial({ map: tvTex })
        );
        screen.position.z = 0.058;
        tv.add(screen);
        tv.rotation.y = Math.PI;   // 面向北（-z，大門口）
        tv.userData.cat = 'tv';
        ghostStatic.tv.push(tv);
        propGroup.add(tv);
    }

    // 電視（A8 柱東面／2FCA 側）：貼 A8 柱東側面、面向東（+x），顯示同一出庫指示畫面
    {
        const pc8a = (function () {   // A5 柱（掃描第 5 個 'C' 柱）
            let n = 0, pp = null;
            for (let r = 0; r < GRID_ROWS && !pp; r++) for (let c = 0; c < GRID_COLS; c++) {
                if (cellKind(r, c) === 'C') { n++; if (n === 5) { pp = gridPos(r, c); break; } }
            }
            return pp || gridPos(12, 18);
        })();   // 第二台電視 → A5
        const pw8a = CELL_W * 0.96 * 1.5, pd8a = CELL_D * 0.96 * 1.5;
        const tw = 2.6, th = tw * 9 / 16;                       // 電視加大（柱側上段）
        const tv8 = new THREE.Group();
        tv8.position.set(pc8a.x + pw8a / 2 + 0.05, 3.7, pc8a.z);   // A8 柱東面、上段（避開方位牌）
        const frame8 = new THREE.Mesh(new THREE.BoxGeometry(0.08, th, tw), tvFrameMat);  // 厚沿 x（東西）
        tv8.add(frame8);
        const screen8 = new THREE.Mesh(
            new THREE.PlaneGeometry(tw * 0.92, th * 0.86),
            new THREE.MeshBasicMaterial({ map: tvTex })
        );
        screen8.raycast = () => {};   // 擋光線拾取，避免擋到下方儲位點擊
        screen8.rotation.y = Math.PI / 2;  // plane +z 法線 → +x（面向東）
        screen8.position.x = 0.05;         // 朝東凸出
        tv8.add(screen8);
        tv8.userData.cat = 'tv';
        ghostStatic.tv.push(tv8);
        propGroup.add(tv8);
    }

    // A8 柱四面方位標（東/南/西/北）：柱身中段各貼一面字牌、朝外，方便溝通方位
    {
        const mkLabelTex = (ch, fg) => {
            const cv = document.createElement('canvas');
            cv.width = cv.height = 256;
            const c = cv.getContext('2d');
            c.fillStyle = '#143342';
            c.fillRect(0, 0, 256, 256);
            c.strokeStyle = 'rgba(255,255,255,0.75)';
            c.lineWidth = 8;
            c.strokeRect(8, 8, 240, 240);
            c.fillStyle = fg;
            c.font = 'bold 140px "Microsoft JhengHei", "Segoe UI", sans-serif';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(ch, 128, 133);
            const t = new THREE.CanvasTexture(cv);
            t.minFilter = THREE.LinearFilter;
            return t;
        };
        const pc8 = (function () {   // A5 柱（掃描第 5 個 'C' 柱）
            let n = 0, pp = null;
            for (let r = 0; r < GRID_ROWS && !pp; r++) for (let c = 0; c < GRID_COLS; c++) {
                if (cellKind(r, c) === 'C') { n++; if (n === 5) { pp = gridPos(r, c); break; } }
            }
            return pp || gridPos(12, 18);
        })();              // 方位牌中心 → A5
        const pw8 = CELL_W * 0.96 * 1.5;          // 柱寬（x）
        const pd8 = CELL_D * 0.96 * 1.5;          // 柱深（z）
        const yL8 = 2.4, off8 = 0.04;             // 柱身中段、貼面外 4cm
        const mkF = (ch, rotY, x, z) => {
            const m = new THREE.Mesh(
                new THREE.PlaneGeometry(0.9, 0.9),
                new THREE.MeshBasicMaterial({ map: mkLabelTex(ch, '#ffd24d'), side: THREE.DoubleSide })
            );
            m.position.set(x, yL8, z);
            m.rotation.y = rotY;
            m.userData.cat = 'sign';
            ghostStatic.sign.push(m);
            propGroup.add(m);
        };
        mkF('東',  Math.PI / 2,  pc8.x + pw8 / 2 + off8, pc8.z);   // 面朝 +x（東）
        mkF('南',  0,             pc8.x, pc8.z + pd8 / 2 + off8);  // 面朝 +z（南）
        mkF('西', -Math.PI / 2,  pc8.x - pw8 / 2 - off8, pc8.z);   // 面朝 -x（西）
        mkF('北',  Math.PI,       pc8.x, pc8.z - pd8 / 2 - off8);  // 面朝 -z（北）
    }

    // 監控桌＋電腦（依除錯點擊 x=47.79 z=-30.27 世界 → 局部 /1.5）
    {
        const dx = 47.79 / 1.5, dz = -30.27 / 1.5;
        const deskG = new THREE.Group();
        const topMat = new THREE.MeshLambertMaterial({ color: 0x8a6a42 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0x5a4630 });
        const monMat = new THREE.MeshLambertMaterial({ color: 0x20262c });
        // 桌面＋四腳
        const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.1), topMat);
        top.position.y = 0.74;
        deskG.add(top);
        [-0.95, 0.95].forEach(lx => [-0.45, 0.45].forEach(lz => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.74, 0.07), legMat);
            leg.position.set(lx, 0.37, lz);
            deskG.add(leg);
        }));
        // 電腦螢幕（立於桌面、面朝倉內）＋鍵盤；螢幕顯示 EIP 入口網站
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.06), monMat);
        stand.position.y = 0.82;
        deskG.add(stand);
        const eipTex = (function () {
            const cv = document.createElement('canvas');
            cv.width = 640; cv.height = 360;
            const c = cv.getContext('2d');
            // 瀏覽器工具列
            c.fillStyle = '#3a6ea5';
            c.fillRect(0, 0, 640, 46);
            c.fillStyle = 'rgba(255,255,255,0.85)';
            c.font = '20px "Segoe UI", sans-serif';
            c.textAlign = 'left'; c.textBaseline = 'middle';
            c.fillText('EIP', 14, 23);
            // 網址列（顯示指定網址）
            c.fillStyle = '#ffffff';
            c.fillRect(8, 56, 624, 32);
            c.fillStyle = '#1a1a1a';
            c.font = '600 22px Consolas, "Courier New", monospace';
            c.fillText('https://eip.tb.pegatroncorp.com/eip/', 18, 73);
            // 頁面
            c.fillStyle = '#f4f7f9';
            c.fillRect(0, 100, 640, 260);
            c.fillStyle = '#0e3a5d';
            c.font = 'bold 44px "Segoe UI", sans-serif';
            c.fillText('Employee Internet Portal', 28, 170);
            c.fillStyle = '#4a6a80';
            c.font = '28px "Segoe UI", sans-serif';
            c.fillText('EIP 企業入口網站', 28, 226);
            const t = new THREE.CanvasTexture(cv);
            t.minFilter = THREE.LinearFilter;
            return t;
        })();
        const scr = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.05), monMat);
        scr.position.y = 1.16;
        scr.rotation.y = 0.06;
        deskG.add(scr);
        const face = new THREE.Mesh(
            new THREE.PlaneGeometry(0.78, 0.43),
            new THREE.MeshBasicMaterial({ map: eipTex })
        );
        face.position.z = 0.027;   // 貼在螢幕面板前方
        scr.add(face);
        const kbd = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.22), monMat);
        kbd.position.set(0.12, 0.785, -0.3);
        deskG.add(kbd);
        deskG.position.set(dx, 0, dz);
        scr.userData.interact = 'pcC';                // 第一人稱看 C 倉螢幕可傳送
        deskG.userData.cat = 'sign';
        deskG.traverse(o => { if (o.isMesh) o.castShadow = true; });
        ghostStatic.sign.push(deskG);
        propGroup.add(deskG);
    }

    // C 倉右下角廣告牌（同 D 倉「C 倉」大看板樣式，面向鏡頭）
    {
        const billC = new THREE.Group();
        const signTexC = (function () {
            const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 640;
            const c = cv.getContext('2d');
            const gr = c.createLinearGradient(0, 0, 0, 640);
            gr.addColorStop(0, '#8a5a1f'); gr.addColorStop(0.5, '#6f3f10'); gr.addColorStop(1, '#4a2608');
            c.fillStyle = gr; c.fillRect(0, 0, 1280, 640);
            c.strokeStyle = '#ffd866'; c.lineWidth = 14; c.strokeRect(22, 22, 1236, 596);
            c.lineWidth = 4; c.strokeStyle = 'rgba(255,230,150,0.85)'; c.strokeRect(40, 40, 1200, 560);
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillStyle = '#ffe9a8'; c.font = '900 400px "Microsoft JhengHei","Segoe UI",sans-serif';
            c.fillText('C 倉', 640, 322);
            const t = new THREE.CanvasTexture(cv); t.minFilter = THREE.LinearFilter; return t;
        })();
        const panelC = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 4.5),
            new THREE.MeshBasicMaterial({ map: signTexC, side: THREE.DoubleSide }));
        billC.add(panelC);
        billC.position.set(38.5, 2.9, 19.5);       // C 倉東南隅（世界 x≈58 z≈29）
        billC.userData.isBoard = true;
        propGroup.add(billC);
        (window.__dbb = window.__dbb || []).push(billC);   // 早期建置（C 倉怕 TDZ）
    }

    // 電視（A8 柱西面）：貼 A8 柱西側面、面向西（-x），顯示同一出庫指示畫面
    {
        const pc8b = (function () {   // A5 柱（掃描第 5 個 'C' 柱）
            let n = 0, pp = null;
            for (let r = 0; r < GRID_ROWS && !pp; r++) for (let c = 0; c < GRID_COLS; c++) {
                if (cellKind(r, c) === 'C') { n++; if (n === 5) { pp = gridPos(r, c); break; } }
            }
            return pp || gridPos(12, 18);
        })();
        const pw8b = CELL_W * 0.96 * 1.5, pd8b = CELL_D * 0.96 * 1.5;
        const tw = 2.6, th = tw * 9 / 16;                        // 電視加大（柱側上段）
        const tv9 = new THREE.Group();
        tv9.position.set(pc8b.x - pw8b / 2 - 0.05, 3.7, pc8b.z);   // A8 柱西面、上段（避開方位牌）
        const frame9 = new THREE.Mesh(new THREE.BoxGeometry(0.08, th, tw), tvFrameMat);  // 厚沿 x（東西）
        tv9.add(frame9);
        const screen9 = new THREE.Mesh(
            new THREE.PlaneGeometry(tw * 0.92, th * 0.86),
            new THREE.MeshBasicMaterial({ map: tvTex })
        );
        screen9.raycast = () => {};   // 擋光線拾取，避免擋到下方儲位點擊
        screen9.rotation.y = -Math.PI / 2;  // plane +z 法線 → -x（面向西）
        screen9.position.x = -0.05;         // 朝西凸出
        tv9.add(screen9);
        tv9.userData.cat = 'tv';
        ghostStatic.tv.push(tv9);
        propGroup.add(tv9);
    }

    // 馬路：連續一體的灰色混凝土帶（不用格子）
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x76828c });
    const roadY = 0.014;
    // 0) 找出全部「全 W 列」＝橫向人行道
    const walkRows = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        if (FLOOR_PLAN[r].every(ch => ch === '.')) walkRows.push(r);
    }
    // 1) 水平大馬路：每一條全 W 列
    walkRows.forEach(zr => {
        const zR = (zr - (GRID_ROWS - 1) / 2) * PITCH_Z;
        const h = new THREE.Mesh(new THREE.BoxGeometry(platW * 0.98, 0.02, PITCH_Z * 0.96), roadMat);
        h.userData.cat = 'road';
        ghostStatic.road.push(h);
        h.position.set(0, roadY, zR);
        propGroup.add(h);
    });
    // 2) 垂直馬路：最寬 = 大馬路（全場貫穿）；其餘小走道只涵蓋棧板區
    {
        const repRow = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
        const lastPRow = (() => { for (let r = GRID_ROWS - 1; r >= 0; r--) if (FLOOR_PLAN[r].indexOf('P') >= 0) return r; return repRow; })();
        const row = FLOOR_PLAN[repRow];
        const runs = [];
        let start = -1;
        for (let c = 0; c <= GRID_COLS; c++) {
            const isW = (c < GRID_COLS) && row[c] === '.';
            if (isW && start < 0) start = c;
            else if (!isW && start >= 0) { runs.push([start, c - 1]); start = -1; }
        }
        runs.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]));
        const big = runs[0];
        const bigCx = big ? ((big[0] + big[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X : 0;
        const bigW = big ? (big[1] - big[0] + 1) * PITCH_X * 0.98 : PITCH_X;
        const vBig = new THREE.Mesh(new THREE.BoxGeometry(bigW, 0.02, platD * 0.98), roadMat);
        vBig.userData.cat = 'road';
        ghostStatic.road.push(vBig);
        vBig.position.set(bigCx, roadY + 0.002, 0);
        propGroup.add(vBig);
        const z0 = (repRow - (GRID_ROWS - 1) / 2) * PITCH_Z;
        const z1 = ((lastPRow) - (GRID_ROWS - 1) / 2) * PITCH_Z;
        runs.slice(1).forEach(rr => {
            const cxx = ((rr[0] + rr[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
            const ww = (rr[1] - rr[0] + 1) * PITCH_X * 0.98;
            const vv = new THREE.Mesh(new THREE.BoxGeometry(ww, 0.02, (z1 - z0) + PITCH_Z * 0.9), roadMat);
        vv.userData.cat = 'road';
        ghostStatic.road.push(vv);
            vv.position.set(cxx, roadY + 0.002, (z0 + z1) / 2);
            propGroup.add(vv);
        });
    }

    // 人行道邊緣斑馬紋（黑／黃長條虛線；十字路口不畫）
    const zebraMats = [
        new THREE.MeshLambertMaterial({ color: 0x151C26 }),
        new THREE.MeshLambertMaterial({ color: 0xFFC926 })
    ];
    const zebraGeo = new THREE.BoxGeometry(0.30, 0.022, 0.72);
    const zebraY = 0.026;
    // 垂直馬道分列（大馬路 / 小走道）
    const repRow = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
    const lastPRow = (() => { for (let r = GRID_ROWS - 1; r >= 0; r--) if (FLOOR_PLAN[r].indexOf('P') >= 0) return r; return repRow; })();
    const prow = FLOOR_PLAN[repRow];
    const zruns = [];
    let zstart = -1;
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && prow[c] === '.';
        if (isW && zstart < 0) zstart = c;
        else if (!isW && zstart >= 0) { zruns.push([zstart, c - 1]); zstart = -1; }
    }
    zruns.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]));
    const zbig = zruns[0];
    const zbigCx = zbig ? ((zbig[0] + zbig[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X : 0;
    const walkRows2 = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        if (FLOOR_PLAN[r].every(ch => ch === '.')) walkRows2.push(r);
    }
    const zHorR = walkRows2.length ? (walkRows2[0] - (GRID_ROWS - 1) / 2) * PITCH_Z : 0;   // 第一條橫向人行道
    const zEntr = (repRow - (GRID_ROWS - 1) / 2) * PITCH_Z;        // 小走道入口（棧板區起）
    // 十字路口（大馬路 × 橫向人行道）：交會矩形內全不畫
    // T 字路口（小走道 × 橫向人行道）：走道帶 + 小走道入口處全不畫
    const clearRects = [
        { x: zbigCx, z: zHorR, hx: (zbig ? ((zbig[1] - zbig[0]) + 1) : 1) * PITCH_X * 0.5, hz: PITCH_Z * 0.5 }
    ];
    {
        const row4C = zEntr;                                   // 小走道入口中心 z
        zruns.slice(1).forEach(rr => {
            const cxx = ((rr[0] + rr[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
            clearRects.push({ x: cxx, z: zHorR, hx: PITCH_X * 0.55, hz: PITCH_Z * 0.5 });  // 走道帶
            clearRects.push({ x: cxx, z: row4C, hx: PITCH_X * 0.55, hz: PITCH_Z * 0.5 });  // 小走道入口
        });
    }
    const addZebra = (cx, cz, axisLen, edgeOff, alongX) => {
        const step = 1.0;
        const n = Math.floor(axisLen / step);
        const startOff = -(axisLen / 2) + 0.5;
        for (let i = 0; i < n; i++) {
            const pos = startOff + i * step;
            [-1, 1].forEach(s => {
                const x = alongX ? cx + pos : cx + s * edgeOff;
                const z = alongX ? cz + s * edgeOff : cz + pos;
                if (clearRects.some(R => x > R.x - R.hx && x < R.x + R.hx && z > R.z - R.hz && z < R.z + R.hz)) return;
                const st = new THREE.Mesh(zebraGeo, zebraMats[i % 2]);
                st.position.set(x, zebraY, z);
                st.rotation.y = alongX ? Math.PI / 2 : 0;   // 長軸沿走道方向
                propGroup.add(st);
            });
        }
    };
    // 橫向人行道（第一條全 W 列）兩側
    addZebra(0, zHorR, GRID_COLS * PITCH_X, PITCH_Z * 0.44, true);
    // 垂直大馬路（最寬走道，貫穿全場）兩側
    addZebra(zbigCx, 0, GRID_ROWS * PITCH_Z, (zbig ? ((zbig[1] - zbig[0]) + 1) : 1) * PITCH_X * 0.5 - 0.05, false);
    // 小走道（棧板區範圍）兩側
    {
        const zMid = ((repRow + lastPRow) / 2 - (GRID_ROWS - 1) / 2) * PITCH_Z;
        const zLen = (lastPRow - repRow) * PITCH_Z;
        zruns.slice(1).forEach(rr => {
            const cxx = ((rr[0] + rr[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
            const halfW = ((rr[1] - rr[0]) + 1) * PITCH_X * 0.5 - 0.05;
            addZebra(cxx, zMid, zLen, halfW, false);
        });
    }

    // 四區廣告牌：立牌說明分區（新版平面圖：C 貨架 / 2FCA / 2FCB / NG・Z）
    // 依 38 列新佈局調整位置：C 在貨架區中央頭側、2FCA/2FCB 在棧板區兩端、NG/Z 在底部
    addZoneSign('C', 0x3d7ec9, 'C 貨架區 (C1-01..15)', -4.5, -24, 0);
    addZoneSign('2FCA', 0xe0a53c, '2FCA 棧板區', -17, 6, 0, false);
    addZoneSign('2FCB', 0x3fae5f, '2FCB 棧板區', 11, 6, 0, false);
    addZoneSign('NG/Z', 0xB06CF7, 'NG 不良品 / Z 暫存區', -10.45, 19.95, 0, false);

    world.add(propGroup);
}

// ==================== 座標地標 A01~A20 / 01~32 ====================
function buildAxisLabels() {
    if (!FLOOR_PLAN.length) return;
    if (axisLabelGroup && axisLabelGroup.parent) axisLabelGroup.parent.remove(axisLabelGroup);
    const halfX = ((GRID_COLS - 1) / 2) * PITCH_X;
    const halfZ = ((GRID_ROWS - 1) / 2) * PITCH_Z;
    const off = 1.7, y = 0.35;
    const group = new THREE.Group();
    // 列地標：棧板區（含 2FCA/2FCB/NG/Z）左側為 B 區、右側為 A 區
    const zRep = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
    if (zRep >= 0) {
        for (let r = zRep; r < GRID_ROWS; r++) {
            if (FLOOR_PLAN[r].indexOf('P') < 0) continue;
            const z = (r - (GRID_ROWS - 1) / 2) * PITCH_Z;
            const aL = makeLabelSprite('B' + pad2(r + 1), null, 1.5, 0.38); aL.position.set(-halfX - off, y, z); group.add(aL);
            const aR = makeLabelSprite('A' + pad2(r + 1), null, 1.5, 0.38); aR.position.set(halfX + off, y, z); group.add(aR);
        }
    }
    // 欄地標：棧板區欄號，只在大馬路重設、分左右；走道不標
    for (let c = 0; c < GRID_COLS; c++) {
        const s = PALLET_COL_SCHEME[c];
        if (!s) continue;
        const x = (c - (GRID_COLS - 1) / 2) * PITCH_X;
        const lbl = pad2(s.no);
        const cF = makeLabelSprite(lbl, null, 1.3, 0.34); cF.position.set(x, y, -halfZ - off); group.add(cF);
        const cB = makeLabelSprite(lbl, null, 1.3, 0.34); cB.position.set(x, y, halfZ + off); group.add(cB);
    }
    world.add(group);
    axisLabelGroup = group;
}

// ==================== 區域地標：C倉（大馬路入口處） ====================
function buildZoneLabel() {
    if (!FLOOR_PLAN.length) return;
    // 標在大馬路（棧板區最寬走道）另一頭入口：列 0（-z 頂邊）
    const repRowZL = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
    if (repRowZL < 0) return;
    const rowL = FLOOR_PLAN[repRowZL];
    let zst = -1, zbigRun = [0, 0];
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && rowL[c] === 'W';
        if (isW && zst < 0) zst = c;
        else if (!isW && zst >= 0) { if ((c - 1 - zst) > (zbigRun[1] - zbigRun[0])) zbigRun = [zst, c - 1]; zst = -1; }
    }
    const zx = ((zbigRun[0] + zbigRun[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
    const zz = -((GRID_ROWS - 1) / 2) * PITCH_Z + 0.6;
    const zl = makeLabelSprite('C 貨架區', '#ffd866', 9.5, 2.3);
    zl.position.set(zx, 0.35, zz);
    zl.raycast = () => {}; // 擋掉光線拾取，避免擋到下方儲位點擊
    propGroup.add(zl);
}

// ==================== 棧板（地板區） ====================
const PALLET_H = 0.12;
const PALLET_W = CELL_W * 0.9;
const PALLET_D = CELL_D * 0.9;
const BOX_SIZE = 0.46;    // 正方體紙箱（快遞箱）尺寸：一層可左右放 2 箱
const BOX_H = BOX_SIZE, BOX_W = BOX_SIZE, BOX_D = BOX_SIZE;
const BOX_GAP = 0.03;     // 箱與箱之間隙
const BOX_STEP = 7;       // 每箱代表 qty 約 7 單位（無限堆疊：qty 越高疊越高）
function boxCount(q) { return Math.max(1, Math.ceil(q / BOX_STEP)); } // 箱數
function cellBoxCount(cell) { return (cell.box_count != null) ? cell.box_count : boxCount(cell.qty); } // 真實箱數優先
const BOX_XOFF = BOX_SIZE * 0.58; // 左右兩箱的中心偏移
const BOX_ZOFF = BOX_SIZE * 0.58; // 前後兩箱的中心偏移（棧板每層 4 箱 2×2）

const T_BOARD = 0.030, STR_H = 0.060, BRD_W = 0.16, BRD_N = 5;
const STR_OFFS = [-0.34, 0, 0.34];
const geoTopB = new THREE.BoxGeometry(BRD_W, T_BOARD, PALLET_D);
const geoBotB = new THREE.BoxGeometry(0.14, T_BOARD, PALLET_D * 0.55);
const geoStr  = new THREE.BoxGeometry(0.10, STR_H, PALLET_D);

function makeWoodTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#9c7a45';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 46; i++) {
        const y = Math.random() * 512;
        ctx.strokeStyle = 'rgba(74,49,22,' + (0.08 + Math.random() * 0.18).toFixed(2) + ')';
        ctx.lineWidth = 1 + Math.random() * 3;
        ctx.beginPath(); ctx.moveTo(0, y); let x = 0;
        while (x < 512) {
            x += 30 + Math.random() * 55;
            ctx.bezierCurveTo(x - 20, y + (Math.random() * 7 - 3.5), x - 5, y + (Math.random() * 7 - 3.5), x, y + (Math.random() * 7 - 3.5));
        }
        ctx.stroke();
    }
    for (let i = 0; i < 20; i++) {
        const y = Math.random() * 512;
        ctx.strokeStyle = 'rgba(219,190,140,' + (0.05 + Math.random() * 0.08).toFixed(2) + ')';
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath(); ctx.moveTo(0, y);
        ctx.bezierCurveTo(128, y + Math.random() * 5 - 2.5, 384, y + Math.random() * 5 - 2.5, 512, y);
        ctx.stroke();
    }
    [[90, 90], [400, 330], [180, 460]].forEach(k => {
        ctx.fillStyle = 'rgba(61,40,18,0.5)';
        ctx.beginPath(); ctx.ellipse(k[0], k[1], 26, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(40,26,12,0.5)';
        ctx.beginPath(); ctx.ellipse(k[0], k[1], 11, 5, 0, 0, Math.PI * 2); ctx.fill();
    });
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
}
const woodTex = makeWoodTexture();
const woodBaseMat = new THREE.MeshLambertMaterial({ map: woodTex, color: 0xffffff });
const woodRackMat = woodBaseMat.clone();
woodRackMat.color.setHex(0x1c7a43);   // 貨架層板（板子）深綠

// C倉箱子材質（原始色）
function cangBoxMatFor(state) {
    return baseMatFor(state);
}

function buildSlattedPallet(localGroup, mat) {
    const meshes = [];
    const topY = PALLET_H - T_BOARD / 2;
    const stepX = (PALLET_W - BRD_W) / (BRD_N - 1);
    for (let i = 0; i < BRD_N; i++) {
        const b = new THREE.Mesh(geoTopB, mat);
        b.position.set(-PALLET_W / 2 + BRD_W / 2 + i * stepX, topY, 0);
        b.castShadow = true; meshes.push(b);
    }
    const strY = T_BOARD + STR_H / 2;
    STR_OFFS.forEach(ox => { const st = new THREE.Mesh(geoStr, mat); st.position.set(ox, strY, 0); st.castShadow = true; meshes.push(st); });
    STR_OFFS.forEach(ox => { const bb = new THREE.Mesh(geoBotB, mat); bb.position.set(ox, T_BOARD / 2, 0); bb.castShadow = true; meshes.push(bb); });
    meshes.forEach(m => localGroup.add(m));
    return meshes;
}

// ==================== BUILD CELLS ====================
let cellGroup = null;
const geoBox    = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D);
const geoRackPlate = new THREE.BoxGeometry(CELL_W * 0.70, 0.06, 1.30);   // 層板縱向長條（深 1.30）
const RACK_BOX = 0.30;                        // 架位小箱（正方形，配合層高 0.45m）
const RACK_ZOFF = 0.32;                       // 前後（Z）兩排偏移
const RACK_XOFF = 0.18;                       // 左右（X）兩排偏移（每層 4 箱：2×2）
const geoRackBox = new THREE.BoxGeometry(RACK_BOX, RACK_BOX, RACK_BOX);

/* ── 靜態 instancing（效能）：棧板木條/層板改用 InstancedMesh，互動用透明 proxy 熱盒 ── */
const _instT = { top: [], str: [], bot: [], plate: [], topE: [], strE: [], botE: [], plateE: [] };  // 每項 6 數；E=空位灰色
const _instC = new THREE.Color();
const _instQ = new THREE.Quaternion(), _instS = new THREE.Vector3(1, 1, 1),
      _instM = new THREE.Matrix4(), _instP = new THREE.Vector3();
const geoProxyP = new THREE.BoxGeometry(CELL_W * 0.9, 0.08, CELL_D * 0.9);   // 棧板透明代理
const proxyMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });

function clearCells() {
    if (cellGroup && cellGroup.parent) cellGroup.parent.remove(cellGroup);   // 父層是 world（非 scene）；依父層移除才真正移出場景，否則每次刷新會疊一層造成卡頓
    cellGroup = null;
    cellMeshes = [];
    Object.keys(ghostDyn).forEach(k => ghostDyn[k].length = 0);   // 動態穿透登記重設
    picked = null;
    hovered = null;
    updateSelectedInfo(null);
    selOutline.visible = false;
    if (selBeacon) selBeacon.visible = false;
}

function buildCells(gridData) {
    clearCells();
    cellGroup = new THREE.Group();
    const pitch = BOX_H + BOX_GAP;

    gridData.forEach(cell => {
        const p = gridPos(cell.row, cell.col);
        const entry = { boxes: [], pallet: [], footer: null, woodMat: null, cell: cell, x: p.x, z: p.z, stackMid: 0 };

        if (cell.kind === 'P') {
            // 地板棧板區（木條 → InstancedMesh；互動用透明 proxy 熱盒）
            const baseY = 0;
            const g = new THREE.Group();
            g.position.set(p.x, baseY, p.z);
            const theta = (Math.random() - 0.5) * 0.05;
            g.rotation.y = theta;
            g.userData.cat = 'pallet';
            ghostDyn.pallet.push(g);
            const ts = 0.78 + Math.random() * 0.24;
            const cxx = Math.cos(theta), snn = Math.sin(theta);
            const topY2 = PALLET_H - T_BOARD / 2, strY2 = T_BOARD + STR_H / 2, botY2 = T_BOARD / 2;
            const stepX2 = (PALLET_W - BRD_W) / (BRD_N - 1) || 1;
            const addPl = (arr, lx, y, lz) => {
                arr.push(p.x + lx * cxx - lz * snn, y, p.z + lx * snn + lz * cxx,
                         ts, ts * 0.95, ts * 0.80);
            };
            // 棧板固定黑色防靜電色（不再依空/有貨切換木紋；避免自動旋轉時光照造成黑黃閃爍）
            const tT = _instT.topE;
            const tS = _instT.strE;
            const tB = _instT.botE;
            for (let i = 0; i < BRD_N; i++) addPl(tT, -PALLET_W / 2 + BRD_W / 2 + i * stepX2, topY2, 0);
            STR_OFFS.forEach(ox => addPl(tS, ox, strY2, 0));
            STR_OFFS.forEach(ox => addPl(tB, ox, botY2, 0));
            const proxy = new THREE.Mesh(geoProxyP, proxyMat);
            proxy.position.set(p.x, 0.04, p.z);
            proxy.userData = { entry: entry, cat: 'pallet' };
            cellGroup.add(proxy);
            entry.proxy = [proxy];
            entry.pallet = [];
            entry.woodMat = woodBaseMat;
            if (cell.state !== 'empty') {
                // 棧板上每層 4 箱（左右 2 × 前後 2），往上疊；顯示真實箱數（上限 24 箱＝6 層，避免爆量）
                const N = Math.min(24, cellBoxCount(cell));
                const perLayer = 4;
                const m = cangBoxMatFor(cell.state);
                entry.restMat = m;
                for (let k = 1; k <= N; k++) {
                    const layer = Math.floor((k - 1) / perLayer);
                    const slot = (k - 1) % perLayer;
                    const sx = (slot % 2 === 0) ? -1 : 1;   // 左、右
                    const sz = (slot < 2) ? -1 : 1;          // 前排、後排
                    const box = new THREE.Mesh(geoBox, m);
                    box.position.set(sx * BOX_XOFF, PALLET_H + BOX_H / 2 + layer * pitch, sz * BOX_ZOFF);
                    box.castShadow = true;
                    box.userData.cat = 'box';
                    ghostDyn.box.push(box);
                    g.add(box);
                    entry.boxes.push(box);
                }
                const topLayer = Math.floor((N - 1) / perLayer);
                entry.stackMid = PALLET_H + (topLayer * pitch + BOX_H) / 2;
            } else {
                entry.stackMid = PALLET_H / 2;
            }
            cellGroup.add(g);
        } else if (cell.kind === 'R') {
            // 鋼架儲位：每層都有棧板片，空的就放空的（單排 5 層，3 排並排不疊）
            // 層號對映已反轉：1=最上層（y 最高）、5=最下層（y=0）
            const baseY = (RACK_LEVELS - cell.level) * RACK_LVL_H;
            const rg = new THREE.Group();
            rg.position.set(p.x, baseY, p.z);
            rg.userData.cat = 'rack';
            ghostDyn.rack.push(rg);
            (cell.state === 'empty' ? _instT.plateE : _instT.plate).push(p.x, baseY + 0.03, p.z, 0, 0, 0);   // 層板（空位→灰色）
            const proxy = new THREE.Mesh(geoRackPlate, proxyMat);
            proxy.position.set(0, 0.03, 0);
            proxy.userData = { entry: entry, cat: 'rack' };
            rg.add(proxy);
            entry.proxy = [proxy];
            entry.pallet = [];
            entry.woodMat = woodRackMat;
            if (cell.state !== 'empty') {
                // 層高 0.45m：單層至多 4 箱（左右 2 × 前後 2），箱數隨真實/模擬箱數變化（拾取後會變少，空了變空格）
                const N = Math.min(4, Math.max(1, cellBoxCount(cell)));
                const m = cangBoxMatFor(cell.state);
                entry.restMat = m;
                for (let k = 0; k < N; k++) {
                    const sx = (k % 2 === 0) ? -1 : 1;   // 左、右
                    const sz = (k < 2) ? -1 : 1;          // 前排、後排
                    const box = new THREE.Mesh(geoRackBox, m);
                    // 後排墊高半箱高，正面角度也看得到全部 4 箱
                    const y = 0.06 + RACK_BOX / 2 + (k < 2 ? 0 : 0.14);
                    box.position.set(sx * RACK_XOFF, y, sz * RACK_ZOFF);
                    box.castShadow = true;
                    box.userData.cat = 'box';
                    ghostDyn.box.push(box);
                    rg.add(box);
                    entry.boxes.push(box);
                }
                entry.stackMid = baseY + 0.06 + RACK_BOX / 2;
            } else {
                entry.stackMid = baseY + 0.03;
            }
            cellGroup.add(rg);
        }
        cellMeshes.push(entry);
    });

    // 靜態 instancing：棧板頂/枕/底木條與貨架層板各合成一個 InstancedMesh（draw call 大跌）
    const mkStatic = function (geo, mat, arr) {
        if (!arr.length) return null;
        const n = arr.length / 6;
        const im = new THREE.InstancedMesh(geo, mat, n);
        for (let i = 0; i < n; i++) {
            _instP.set(arr[i * 6], arr[i * 6 + 1], arr[i * 6 + 2]);
            _instM.compose(_instP, _instQ, _instS);
            im.setMatrixAt(i, _instM);
            // 一律建立 instanceColor（無色者填白）：避免同一材質同時被「有/無 instanceColor」的 InstancedMesh 共用時，
            // three.js 在 setupVertexAttributes 對 null 取屬性丟錯 → 整幀 render 中止（所有透明物件連牆面一起消失）
            const cr = arr[i * 6 + 3], cg = arr[i * 6 + 4], cb = arr[i * 6 + 5];
            im.setColorAt(i, (cr || cg || cb) ? new THREE.Color(cr, cg, cb) : new THREE.Color(1, 1, 1));
        }
        im.instanceMatrix.needsUpdate = true;
        if (im.instanceColor) im.instanceColor.needsUpdate = true;
        im.castShadow = true;
        return im;
    };
    const grayFloorMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });   // 黑色防靜電塑膠棧板
    [mkStatic(geoTopB, woodBaseMat, _instT.top),
     mkStatic(geoStr, woodBaseMat, _instT.str),
     mkStatic(geoBotB, woodBaseMat, _instT.bot),
     mkStatic(geoRackPlate, woodRackMat, _instT.plate),
     mkStatic(geoTopB, grayFloorMat, _instT.topE),
     mkStatic(geoStr, grayFloorMat, _instT.strE),
     mkStatic(geoBotB, grayFloorMat, _instT.botE),
     mkStatic(geoRackPlate, grayFloorMat, _instT.plateE)].forEach(function (im) { if (im) cellGroup.add(im); });
    _instT.top.length = _instT.str.length = _instT.bot.length = _instT.plate.length = 0;
    _instT.topE.length = _instT.strE.length = _instT.botE.length = _instT.plateE.length = 0;

    // 綁定互動
    cellMeshes.forEach(e => {
        const meshes = e.boxes.slice().concat(e.pallet).concat(e.proxy || []);
        if (e.footer) meshes.push(e.footer);
        meshes.forEach(msh => { msh.userData = { entry: e, cat: msh.userData.cat }; });   // 保留 cat（箱子等）
    });
    world.add(cellGroup);
}

// ==================== 自製上帝視角控制器（拖曳旋轉 / Shift|右鍵平移 / 滾輪縮放 / 自動旋轉） ====================
const simOverlay = new Map();
function effectiveEntries() {
    if (!Array.isArray(liveEntries)) return [];
    return liveEntries.map(cell => {
        const ov = simOverlay.get(cell.location);
        return ov ? Object.assign({}, cell, ov) : cell;
    });
}

// ==================== LOAD ====================
function cPlanCells() {   // C 倉儲位清單：嚴格用 DB entries 的明確 row/col
    if (Array.isArray(liveEntries) && liveEntries.length > 0) {
        return liveEntries.map(function (e) {
            return {
                state: e.state || 'empty',
                material: e.material || '',
                qty: e.qty || 0,
                location: e.location,
                row: (e.row || 1) - 1,
                col: (e.col || 1) - 1,
                level: e.level || 1,
                rackGroup: e.level ? Math.ceil(e.level / 5) : 1,
                kind: e.kind || 'R',
                box_count: e.box_count || 0,
                boxes: e.boxes || [],
                item: e.item || '',
                itemnm: e.itemnm || ''
            };
        });
    }
    return []; // 無 DB 資料時不顯示任何格子
}
function loadData(isManual) {
    const byCode = {};
    effectiveEntries().forEach(function (c) { const k = normCode(c.location); if (k) byCode[k] = c; });
    const gridData = cPlanCells().map(function (b) {   // 真實資料 overlay：碼對上才灌庫存狀態
        const l = byCode[normCode(b.location)];
        return l ? Object.assign({}, b, { state: l.state, material: l.material, qty: l.qty, box_count: l.box_count, boxes: l.boxes, item: l.item, itemnm: l.itemnm }) : b;
    });
    lastGridData = gridData;
    if (!renderer) return;
    buildCells(gridData);
    assignIds();                       // 重建後為新增格子補 oid（除錯定位用）
    setWhVisible(activeWh);   // 資料重建後維持目前選倉可見性（C 也會被隱藏）
    renderSummary(gridData);
    if (currentWH === 'D' && typeof renderDWSummary === 'function') renderDWSummary();   // 在 D 倉時 refresh 後仍顯示 D 統計
    if (isManual) {
        const btn = document.getElementById('btnRefresh');
        btn.textContent = '已更新 ✔';
        setTimeout(() => { btn.textContent = '重新整理'; }, 900);
    }
}

// ==================== A 倉（平面圖：Denah terbaru store，107×54；19 行以上=貨架 R、以下=SMT 圓盤料架 P、19 行=鐵籠 C） ====================
// 由 Denah terbaru store.xlsx 自動產生（107 欄 × 54 列；19 行以上=貨架 R，以下=棧板 P，19 行=鐵籠 C） W柱子
const TV_W = 3 * PITCH_X, TV_H = TV_W * 9 / 16;   // 電視寬＝大馬路(人行道)3欄寬；16:9
