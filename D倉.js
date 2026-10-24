const DW_API = 'http://10.176.33.211:1106/public/index.php/sems/pcba_all';
// D 倉鋼架布局（平面图1.xlsx 工作表3，權威版 45×45）：R=鋼架(上下2層) P=柱子 T=貨運軌道 J=接駁臺 空格=走道/空
const DW_GRID = [
    'PR R RR RR PP R R RR RR PP R R RR RR PP R RR ',
    'PR R RR RR PP R R RR RR PP R R RR RR PP R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    'PR R RR RR PP R R RR RR PP R R RR RR PP R RR ',
    'PR R RR RR PP R R RR RR PP R R RR RR PP R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR RR R R RR RR RR R R RR RR RR R RR ',
    ' R R RR RR PP R R RR RR PP R R RR RR PP R RR ',
    ' R R RR RR PP R R RR RR PP R R RR RR PP R RR ',
    '                                             ',
    '                                             ',
    '                                             ',
    '                                             ',
    'JJ T T  T T  T T  T T  T T  T T  T T         ',
    'JJ T T  T T  T T  T T  T T  T T  T T         ',
    '   T T  T T  T T  T T  T T  T T  T T         ',
    '   T T  T T  T T  T T  T T  T T  T T         '
];
// 欄號(1..27) → DW_GRID 欄索引（B01 D02 F03 G04 I05 J06 L07 M08 O09 Q10 S11 T12 V13 W14 Y15 Z16 AB17 AD18 AF19 AG20 AI21 AJ22 AL23 AM24 AO25 AQ26 AR27）
const DW_COLMAP = { "1": 1, "2": 3, "3": 5, "4": 6, "5": 8, "6": 9, "7": 11, "8": 12, "9": 14, "10": 16, "11": 18, "12": 19, "13": 21, "14": 22, "15": 24, "16": 25, "17": 27, "18": 29, "19": 31, "20": 32, "21": 34, "22": 35, "23": 37, "24": 38, "25": 40, "26": 42, "27": 43 };
const DW_ROWS = DW_GRID.length;          // 45（列）
const DW_COLS = DW_GRID[0].length;       // 45（欄）
const DW_PITCH_X = 0.8;                  // x 格距＝鋼架單元寬（m）：短邊，朝軌道
const DW_PITCH_Z = 1.4;                  // z 格距＝鋼架單元長（m）：長邊，平行軌道
const DW_LEVEL_H = 1.5;                  // 每層架高 1.5m，共 2 層＝3m（鋼架回到 3 米）
const DW_CENTER_X = 150;     // D 倉中心世界 x（使用者點擊處）
const DW_CENTER_Z = 85.59;    // D 倉中心世界 z（使用者點擊處）
const DW_RX = 60;             // D 倉判斷半徑 x（含接駁臺/廣告牌）
const DW_RZ = 52;             // D 倉判斷半徑 z
function inDWorld(x, z) {     // 世界座標是否在 D 倉範圍（2D，因 C/D 方位已非純南北）
    return Math.abs(x - DW_CENTER_X) <= DW_RX && Math.abs(z - DW_CENTER_Z) <= DW_RZ;
}
const DW_WALK_ROWS = 3;                  // walkway rows under track (walls enclose it)
const DW_WALL_H = 4.5;                  // 四周透明圍牆高（與 C 倉一致）
                  // 鏡頭 z > 此值＝在 D 倉
let dwData = null;                       // [{code, occ, col, row, layer}]  （layer:'A' 下 / 'B' 上）
let dwGroup = null;
let dwLoading = false;
let dwOcc = null;                        // Map "col_row_layer" → occ
let dwMeta = null;                       // Map "col_row_layer" → {container,type}
let currentWH = 'C';                     // 'C' | 'D'
let dwSlots = [];                        // D 倉可點擊的儲位盒 mesh（raycast 用）
let dwBillboards = [];                   // D 倉廣告牌（每幀面向鏡頭，billboard 用）
const DW_COL_REV = (() => { const o = {}; for (const k in DW_COLMAP) o[DW_COLMAP[k]] = parseInt(k, 10); return o; })();

function dwSlotKey(col, row, layer) { return col + '_' + row + '_' + layer; }

async function loadDWarehouse() {
    if (dwLoading) return;
    dwLoading = true;
    try {
        const resp = await fetch(DW_API);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const d = await resp.json();
        const arr = Array.isArray(d) ? d : (d && Array.isArray(d.data) ? d.data : null);
        if (!arr || arr.length < 100) throw new Error('bad payload');
        const out = [];
        const occMap = new Map();
        const metaMap = new Map();
        for (const r of arr) {
            const code = String(r['库位编码'] || '');
            const m = /^F102(\d{2})(\d{2})([AB])?$/.exec(code);
            if (!m) continue;
            const col = DW_COLMAP[parseInt(m[1], 10)];      // 欄 01..27 → 圖面欄索引
            const row = 37 - parseInt(m[2], 10);            // 列 01..37 → 圖面列索引（上→下）
            if (col === undefined || row < 0 || row >= DW_ROWS) continue;
            const layer = m[3] || 'A';
            if (DW_GRID[row][col] !== 'R') continue;        // 只在鋼架格（R）；柱子/走道不收
            const occ = String(r['占用'] || '') !== '否';
            out.push({ code: code, occ: occ, col: col, row: row, layer: layer,
                       type: String(r['库位类型'] || ''), container: String(r['容器编码'] || '') });
            occMap.set(dwSlotKey(col, row, layer), occ);
            metaMap.set(dwSlotKey(col, row, layer), { container: String(r['容器编码'] || ''), type: String(r['库位类型'] || '') });
        }
        dwData = out;
        dwOcc = occMap;
        dwMeta = metaMap;
        buildDWarehouse();
    } catch (err) { /* 抓不到就保留上次資料 */ }
    dwLoading = false;
}

function buildDWarehouse() {
    if (!scene) return;
    const matSteel = new THREE.MeshLambertMaterial({ color: 0xa8bac8, transparent: true, opacity: 0.3 });   // 鋼架 70% 透明
    const matLeg = new THREE.MeshLambertMaterial({ color: 0x8da0b0 });
    // 銀色刷紋金屬（鋼架立柱）：程序化 canvas 紋理＋Phong 高光
    const silverCv = document.createElement('canvas'); silverCv.width = silverCv.height = 128;
    const sctx = silverCv.getContext('2d');
    sctx.fillStyle = '#dfe4ea'; sctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 260; i++) {
        sctx.strokeStyle = 'rgba(255,255,255,' + (0.03 + Math.random() * 0.16).toFixed(3) + ')';
        sctx.beginPath(); sctx.moveTo(Math.random() * 128, 0); sctx.lineTo(Math.random() * 128, 128); sctx.stroke();
    }
    for (let i = 0; i < 160; i++) {
        sctx.strokeStyle = 'rgba(70,82,100,' + (0.03 + Math.random() * 0.14).toFixed(3) + ')';
        sctx.beginPath(); sctx.moveTo(Math.random() * 128, 0); sctx.lineTo(Math.random() * 128, 128); sctx.stroke();
    }
    const silverTex = new THREE.Texture(silverCv); silverTex.needsUpdate = true;
    const matLegMet = new THREE.MeshPhongMaterial({ color: 0xeef1f5, specular: 0xffffff, shininess: 90, map: silverTex, transparent: true, opacity: 0.3 });   // 立柱 70% 透明
    const matPillW = new THREE.MeshLambertMaterial({ color: 0xffffff });   // 大柱純白
    const matOcc = new THREE.MeshLambertMaterial({ color: 0xe8b34a, emissive: 0x8a6410, emissiveIntensity: 0.3 });
    const matFree = new THREE.MeshLambertMaterial({ color: 0x4f6b7d, transparent: true, opacity: 0.65 });
    const matFloor = new THREE.MeshLambertMaterial({ color: 0x626f7c });
    const matTrack = new THREE.MeshLambertMaterial({ color: 0x39424c });
    const matDock = new THREE.MeshLambertMaterial({ color: 0x9aa768 });
    const legGeo = new THREE.BoxGeometry(0.16, DW_LEVEL_H * 2, 0.16);   // 鋼架四角立柱
    const plateGeo = new THREE.BoxGeometry(DW_PITCH_X * 0.97, 0.06, DW_PITCH_Z * 0.97);
    // 黑色周轉箱（托盤）：每層 1 個，長寬 1.4m、高 1.1m（四周大間隙）
    const TOTE_W = 0.4, TOTE_D = 0.6, TOTE_H = 1.1, TOTE_TOTAL_H = 1.1;
    const hitGeo = new THREE.BoxGeometry(TOTE_W, TOTE_TOTAL_H, TOTE_D);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const pillarGeo = new THREE.BoxGeometry(0.12, DW_LEVEL_H * 2, 0.12);
    const trackGeo = new THREE.BoxGeometry(1.2, 0.12, DW_PITCH_Z * 0.55);
    const dockGeo = new THREE.BoxGeometry(DW_PITCH_X * 0.85, 0.14, DW_PITCH_Z * 0.85);

    if (dwGroup) { scene.remove(dwGroup); dwGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); }); dwGroup = null; }
    dwGroup = new THREE.Group();
    dwSlots = [];
    // 黑色周轉箱（托盤）實例收集
    const instOcc = { A: [], B: [] }, instEmpty = { A: [], B: [] };
    const instAllA = [];   // 每個 R 格之 A 層（放層板）
    const instTrack = [];    // 貨運軌道格（傳送帶分段用）

    // 地板（45×45，局部座標：以 D 倉中心為原點）
    const floor = new THREE.Mesh(new THREE.BoxGeometry(DW_COLS * DW_PITCH_X, 0.14, DW_ROWS * DW_PITCH_Z), matFloor);
    floor.position.set(0, -0.07, 0);
    dwGroup.add(floor);

    const halfX = (DW_COLS - 1) / 2, halfZ = (DW_ROWS - 1) / 2;
    for (let row = 0; row < DW_ROWS; row++) {
        for (let col = 0; col < DW_COLS; col++) {
            const ch = DW_GRID[row][col];
            const wx = (col - halfX) * DW_PITCH_X;
            const wz = (row - halfZ) * DW_PITCH_Z;
            if (ch === 'R') {
                // 鋼架單元：四角立柱（黑箱堆外側空隙，可見）＋層板＋A(下)/B(上) 格
                [- (DW_PITCH_X / 2 - 0.08), DW_PITCH_X / 2 - 0.08].forEach(
                                        ox => [-(DW_PITCH_Z / 2 - 0.08), DW_PITCH_Z / 2 - 0.08].forEach(oz => {
                    const leg = new THREE.Mesh(legGeo, matLegMet);
                    leg.position.set(wx + ox, DW_LEVEL_H, wz + oz);
                    dwGroup.add(leg);
                }));
                // 建立 A/B 層：隱形點擊體 ＋ 收集周轉箱實例位置（有貨＝黑箱，無貨＝灰空板）
                const mkSlot = (layer, yBase) => {
                    const occ = !!(dwOcc && dwOcc.get(dwSlotKey(col, row, layer)));
                    const cc = DW_COL_REV[col] || (col + 1);
                    const rr = 37 - row;
                    const pad = n => String(n).padStart(2, '0');
                    const code = 'F102' + pad(cc) + pad(rr) + layer;
                    const meta = dwMeta ? dwMeta.get(dwSlotKey(col, row, layer)) : null;
                    const hit = new THREE.Mesh(hitGeo, hitMat);
                    hit.position.set(wx, yBase + TOTE_TOTAL_H / 2, wz);
                    hit.userData.cat = 'dwslot';
                    hit.userData.entry = {
                        cell: {
                            location: code,
                            kind: 'D',
                            layer: layer,                       // 'A' 下 / 'B' 上
                            state: occ ? 'used' : 'empty',
                            container: (meta && meta.container) || '',
                            stype: (meta && meta.type) || '',
                            material: (meta && meta.container) || '',
                            qty: 0,
                            boxes: []
                        },
                        boxes: [hit],
                        footer: null,
                        x: -wz * 1.5 + DW_CENTER_X, z: wx * 1.5 + DW_CENTER_Z,   // 世界座標（group scale 1.5＋旋轉 -90°）
                        y: 0,
                        stackMid: yBase + TOTE_TOTAL_H / 2,
                        baseMat: null
                    };
                    dwGroup.add(hit);
                    dwSlots.push(hit);
                    (occ ? instOcc[layer] : instEmpty[layer]).push({ x: wx, z: wz });
                    if (layer === 'A') instAllA.push({ x: wx, z: wz });
                };
                mkSlot('A', 0.2);   // A 層（第一層）離地 20cm 置於層板上
                const plate = new THREE.Mesh(plateGeo, matSteel);
                plate.position.set(wx, DW_LEVEL_H + 0.03, wz);
                dwGroup.add(plate);
                mkSlot('B', DW_LEVEL_H);
            } else if (ch === 'P') {
                // 柱子已由下方「連通合併大柱」統一處理（此處跳過單格小柱）
            } else if (ch === 'T') {
                instTrack.push({ col: col, row: row });   // 收集，傳送帶在主迴圈後建置
            } else if (ch === 'J') {
                const dk = new THREE.Mesh(dockGeo, matDock);
                dk.position.set(wx, 0.06, wz);
                dwGroup.add(dk);
            }
        }
    }
    // 黑色周轉箱實例（有貨層：每格 20 個＝2×2 排×5 疊高 1.1m；空層：灰色薄板）
    {
        const toteGeo = new THREE.BoxGeometry(TOTE_W, TOTE_H, TOTE_D);
        const blackMat = new THREE.MeshLambertMaterial({ color: 0x23262b });
        const plateGeo2 = new THREE.BoxGeometry(DW_PITCH_X - 0.04, 0.04, DW_PITCH_Z - 0.04);
        const emptyMat = new THREE.MeshLambertMaterial({ color: 0x3d4650, transparent: true, opacity: 0.5 });
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), vs = new THREE.Vector3(1, 1, 1);
        const hasIM = typeof THREE.InstancedMesh === 'function';
        ['A', 'B'].forEach(layer => {
            const baseY = layer === 'A' ? 0.2 : DW_LEVEL_H;   // A 層離地 20cm
            const occL = instOcc[layer], empL = instEmpty[layer];
            if (occL.length) {
                if (hasIM) {
                    const im = new THREE.InstancedMesh(toteGeo, blackMat, occL.length);   // 每層 1 個
                    let i = 0;
                    occL.forEach(p => {
                        m4.compose(new THREE.Vector3(p.x, baseY + TOTE_H / 2, p.z), q, vs);
                        im.setMatrixAt(i++, m4);
                    });
                    im.instanceMatrix.needsUpdate = true;
                    dwGroup.add(im);
                } else {
                    occL.forEach(p => {
                        const tb = new THREE.Mesh(toteGeo, blackMat);
                        tb.position.set(p.x, baseY + TOTE_H / 2, p.z);
                        dwGroup.add(tb);
                    });
                }
            }
            if (empL.length) {
                if (hasIM) {
                    const ip = new THREE.InstancedMesh(plateGeo2, emptyMat, empL.length);
                    let i = 0;
                    empL.forEach(p => { m4.compose(new THREE.Vector3(p.x, baseY + 0.02, p.z), q, vs); ip.setMatrixAt(i++, m4); });
                    ip.instanceMatrix.needsUpdate = true;
                    dwGroup.add(ip);
                } else {
                    empL.forEach(p => {
                        const pd = new THREE.Mesh(plateGeo2, emptyMat);
                        pd.position.set(p.x, baseY + 0.02, p.z);
                        dwGroup.add(pd);
                    });
                }
            }
        });
        // A 層（第一層）層板：離地 20cm，置放黑箱/空板
        if (instAllA.length) {
            if (hasIM) {
                const ipA = new THREE.InstancedMesh(plateGeo, matSteel, instAllA.length);
                let i = 0;
                instAllA.forEach(qq => { m4.compose(new THREE.Vector3(qq.x, 0.2, qq.z), q, vs); ipA.setMatrixAt(i++, m4); });
                ipA.instanceMatrix.needsUpdate = true;
                dwGroup.add(ipA);
            } else {
                instAllA.forEach(qq => {
                    const pd = new THREE.Mesh(plateGeo, matSteel);
                    pd.position.set(qq.x, 0.2, qq.z);
                    dwGroup.add(pd);
                });
            }
        }
    }
    initToteTextures();   // 套用 AI 生成周轉箱紋理（load 完成後覆寫黑箱材質）
    initBeltTexture();      // 套用輸送帶帶面紋理

    // 貨運軌道＝輸送帶：雙側金屬側板＋紋理橡膠帶面＋外露滾筒＋支架（非棺材盒）
    if (instTrack.length) {
        const mSide = new THREE.MeshLambertMaterial({ color: 0x39424c });
        const mRail = new THREE.MeshLambertMaterial({ color: 0xaab3bb });
        const mBeltTopI = new THREE.MeshPhongMaterial({ color: 0x6d7a86, shininess: 40 });
        const mRoller = new THREE.MeshLambertMaterial({ color: 0xb0b8c0 });
        const mLegB = new THREE.MeshLambertMaterial({ color: 0x5d6972 });
        const sideGeo = new THREE.BoxGeometry(0.06, 0.3, 1);
        const railGeo = new THREE.BoxGeometry(0.05, 0.18, 1);
        const beltTopGeo = new THREE.BoxGeometry(0.8, 0.06, 1);
        const rollerGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.74, 12);
        const legGeo2 = new THREE.BoxGeometry(0.12, 0.5, 0.12);
        const byRow = {};
        instTrack.forEach(o => { (byRow[o.row] = byRow[o.row] || []).push(o.col); });
        Object.keys(byRow).forEach(rs => {
            const cols = byRow[rs].slice().sort((a, b) => a - b);
            let start = cols[0], prev = cols[0];
            const flush = () => {
                const len = (prev - start + 1) * DW_PITCH_Z;
                const cx = ((start + prev) / 2 - halfX) * DW_PITCH_X;
                const cz = (parseInt(rs, 10) - halfZ) * DW_PITCH_Z;
                [-0.43, 0.43].forEach(xx => {          // 兩側金屬側板（中間鏤空露滾筒）
                    const sd = new THREE.Mesh(sideGeo, mSide);
                    sd.scale.set(1, 1, len);
                    sd.position.set(cx + xx, 0.31, cz);
                    dwGroup.add(sd);
                });
                [-0.415, 0.415].forEach(xx => {          // 凸起金屬導軌（明確邊框）
                    const rd = new THREE.Mesh(railGeo, mRail);
                    rd.scale.set(1, 1, len);
                    rd.position.set(cx + xx, 0.59, cz);
                    dwGroup.add(rd);
                });
                const top = new THREE.Mesh(beltTopGeo, mBeltTopI);   // 帶面（紋理）
                top.scale.set(1, 1, len - 0.06);
                top.position.set(cx, 0.52, cz);
                top.userData.beltTop = true;
                dwGroup.add(top);
                for (let zz = -len / 2 + 0.28; zz <= len / 2 - 0.05; zz += 0.42) {
                    const rl = new THREE.Mesh(rollerGeo, mRoller);
                    rl.rotation.z = Math.PI / 2;           // 滾筒軸沿 x（橫放、沿 z 滾動）
                    rl.position.set(cx, 0.45, cz + zz);
                    dwGroup.add(rl);
                }
                [-len / 2 + 0.25, len / 2 - 0.25].forEach(zz => {
                    [-0.43, 0.43].forEach(xx => {
                        const lg = new THREE.Mesh(legGeo2, mLegB);
                        lg.position.set(cx + xx, 0.25, cz + zz);
                        dwGroup.add(lg);
                    });
                });
            };
            for (let i = 1; i < cols.length; i++) {
                if (cols[i] - prev > 1) { flush(); start = cols[i]; }
                prev = cols[i];
            }
            flush();
        });
    }

    // 空白格結構柱：把連續相鄰的柱子（4 鄰域）合併成 1 根大柱（取代 4 根小柱成群）
    const visP = DW_GRID.map(r => r.split(''));
    const pGroups = [];
    for (let r0 = 0; r0 < DW_ROWS; r0++) {
        for (let c0 = 0; c0 < DW_COLS; c0++) {
            if (visP[r0][c0] !== 'P') continue;
            const stack = [[r0, c0]]; visP[r0][c0] = 'x';
            let minr = r0, maxr = r0, minc = c0, maxc = c0;
            while (stack.length) {
                const [r, c] = stack.pop();
                if (r < minr) minr = r; if (r > maxr) maxr = r;
                if (c < minc) minc = c; if (c > maxc) maxc = c;
                [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].forEach(([rr, cc]) => {
                    if (rr >= 0 && rr < DW_ROWS && cc >= 0 && cc < DW_COLS && visP[rr][cc] === 'P') {
                        visP[rr][cc] = 'x'; stack.push([rr, cc]);
                    }
                });
            }
            pGroups.push({ minr: minr, maxr: maxr, minc: minc, maxc: maxc });
        }
    }
    pGroups.forEach(g => {
        // 每柱群在 4 格中間放 1 根柱：寬 0.4m、高 8m（配合真實小格；不填滿整個 group 外框）
        const p = new THREE.Mesh(new THREE.BoxGeometry(1.824, 8.0, 1.824), matPillW);   // 長寬同 C 倉柱（世界 2.736m）
        p.position.set(((g.minc + g.maxc) / 2 - halfX) * DW_PITCH_X, 4.0, ((g.minr + g.maxr) / 2 - halfZ) * DW_PITCH_Z);
        p.userData.cat = 'pillar';
        dwGroup.add(p);
    });

    // 軌道下方再拓展 4 行人行道（淺灰地磚帶，局部 z=+45..+53，旋轉後位處世界西側）
    {
        const matWalk = new THREE.MeshLambertMaterial({ color: 0x626f7c });   // 與地板同色
        const wkGeo = new THREE.BoxGeometry(DW_PITCH_X - 0.04, 0.06, DW_PITCH_Z - 0.04);
        const wkOff = DW_ROWS * DW_PITCH_Z / 2;
        const wkRows = DW_WALK_ROWS;
        if (typeof THREE.InstancedMesh === 'function') {
            const imW = new THREE.InstancedMesh(wkGeo, matWalk, DW_COLS * wkRows);
            const mW = new THREE.Matrix4(), qW = new THREE.Quaternion(), vsW = new THREE.Vector3(1, 1, 1);
            let i = 0;
            for (let r = 0; r < wkRows; r++) {
                for (let c = 0; c < DW_COLS; c++) {
                    mW.compose(new THREE.Vector3((c - halfX) * DW_PITCH_X, 0.03, wkOff + (r + 0.5) * DW_PITCH_Z), qW, vsW);
                    imW.setMatrixAt(i++, mW);
                }
            }
            imW.instanceMatrix.needsUpdate = true;
            dwGroup.add(imW);
        } else {
            for (let r = 0; r < wkRows; r++) {
                for (let c = 0; c < DW_COLS; c++) {
                    const wk = new THREE.Mesh(wkGeo, matWalk);
                    wk.position.set((c - halfX) * DW_PITCH_X, 0.03, wkOff + (r + 0.5) * DW_PITCH_Z);
                    dwGroup.add(wk);
                }
            }
        }
    }

    // 四周透明圍牆（以地板邊緣為界；隨 D 倉整體一起旋轉）
    const matWallT = new THREE.MeshLambertMaterial({ color: 0xbddcff, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false });
    const hfX = (DW_COLS * DW_PITCH_X) / 2;    // 地板左右半寬＝9.0
    const hfZ = (DW_ROWS * DW_PITCH_Z) / 2;    // 地板前後半長＝18.0
    const wallGeoNS = new THREE.BoxGeometry(DW_COLS * DW_PITCH_X, DW_WALL_H, 0.1);
    const wallGeoEW = new THREE.BoxGeometry(0.1, DW_WALL_H, DW_ROWS * DW_PITCH_Z + DW_WALK_ROWS * DW_PITCH_Z);
    [-hfZ, hfZ + DW_WALK_ROWS * DW_PITCH_Z].forEach(z => {
        const wN = new THREE.Mesh(wallGeoNS, matWallT);
        wN.position.set(0, DW_WALL_H / 2, z);
        dwGroup.add(wN);
    });
    [-hfX, hfX].forEach(x => {
        const wE = new THREE.Mesh(wallGeoEW, matWallT);
        wE.position.set(x, DW_WALL_H / 2, DW_WALK_ROWS * DW_PITCH_Z / 2);
        dwGroup.add(wE);
    });

    {   // 接駁臺監控桌＋電腦＋滑鼠（第一人稱可互動 → 傳送）
        const dxD = 16.2, dzD = 32.6;                 // 東側接駁臺旁（局部座標，不擋 AGV 動線）
        const dockG = new THREE.Group();
        const topMat = new THREE.MeshLambertMaterial({ color: 0x8a6a42 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0x5a4630 });
        const monMat = new THREE.MeshLambertMaterial({ color: 0x20262c });
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.07, 0.9), topMat);
        top.position.y = 0.74; dockG.add(top);
        [-0.85, 0.85].forEach(lx => [-0.36, 0.36].forEach(lz => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.74, 0.07), legMat);
            leg.position.set(lx, 0.37, lz); dockG.add(leg);
        }));
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.13, 0.07), monMat);
        stand.position.y = 0.82; dockG.add(stand);
        const scr = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.06), monMat);
        scr.position.y = 1.14; dockG.add(scr);
        const scrTex = (function () {
            const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360;
            const c = cv.getContext('2d');
            c.fillStyle = '#3a6ea5'; c.fillRect(0, 0, 640, 46);
            c.fillStyle = 'rgba(255,255,255,0.92)'; c.font = '20px "Segoe UI",sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
            c.fillText('SEMS-D 監控', 14, 23);
            c.fillStyle = '#ffffff'; c.fillRect(8, 56, 624, 32);
            c.fillStyle = '#1a1a1a'; c.font = '600 22px Consolas,monospace';
            c.fillText('http://10.176.33.211:1106/sems/pcba_all', 18, 73);
            c.fillStyle = '#0f2433'; c.fillRect(0, 100, 640, 260);
            c.fillStyle = '#9fd6ff'; c.font = 'bold 42px "Segoe UI",sans-serif'; c.fillText('D 倉 · PCBA 鋼架庫', 26, 168);
            c.fillStyle = '#7fa7c0'; c.font = '26px "Segoe UI",sans-serif'; c.fillText('AGV 無人搬運監控 ｜ 按 E 傳送至 C 倉電腦', 26, 226);
            const t = new THREE.CanvasTexture(cv); t.minFilter = THREE.LinearFilter; return t;
        })();
        const face = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.48), new THREE.MeshBasicMaterial({ map: scrTex }));
        face.position.z = 0.032; scr.add(face);
        scr.userData.interact = 'pcD';
        const kbd = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.2), monMat);
        kbd.position.set(0.1, 0.79, -0.28); dockG.add(kbd);
        const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.16), monMat);   // 滑鼠
        mouse.position.set(-0.42, 0.795, 0.18); dockG.add(mouse);
        dockG.position.set(dxD, 0, dzD);
        dockG.userData.cat = 'sign';
        dwGroup.add(dockG);
    }


    {   // D 倉廣告牌（接駁臺上方，面朝倉內）
        const bill = new THREE.Group();
        const blkF = new THREE.MeshLambertMaterial({ color: 0x1c3145 });
        const blkT = new THREE.MeshLambertMaterial({ color: 0x0b0b0d });
        // canvas 面板字
        const signTex = (function () {
            const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 640;
            const c = cv.getContext('2d');
            const gr = c.createLinearGradient(0, 0, 0, 640);
            gr.addColorStop(0, '#123a5c'); gr.addColorStop(0.55, '#0f2740'); gr.addColorStop(1, '#0a1730');
            c.fillStyle = gr; c.fillRect(0, 0, 1280, 640);
            // 邊框
            c.strokeStyle = '#e0a33c'; c.lineWidth = 14; c.strokeRect(22, 22, 1236, 596);
            c.lineWidth = 4; c.strokeStyle = 'rgba(255,230,150,0.85)'; c.strokeRect(40, 40, 1200, 560);
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillStyle = '#ffd866';
            c.font = '900 400px "Microsoft JhengHei","Segoe UI",sans-serif';
            c.fillText('D 倉', 640, 322);
            const t = new THREE.CanvasTexture(cv); t.minFilter = THREE.LinearFilter; return t;
        })();
        // 面板（平面，無黑框柱架）
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 4.5),
            new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
        bill.add(panel);
        // 吊於接駁臺上方、面朝倉內（局部 -z）
        bill.position.set(20.1, 4.0, -37.67);   // 廣告牌移到世界 (56.5, 6, 142.9)（使用者點擊處）
        bill.userData.cat = 'sign';
        bill.userData.isBoard = true;
        dwGroup.add(bill);
        dwBillboards = [bill];   // 每幀面向鏡頭（billboard，避免鏡像）
    }


    {   // 100 吋電視：掛在 P 柱上（局部 x=-9.2/z=17.5），柱南側柱面，面對傳送帶
        let pv = null, bd = 1e9;
        dwGroup.children.forEach(o => {
            if (o.userData && o.userData.cat === 'pillar') {
                const dd = Math.abs(o.position.x - (-9.2)) + Math.abs(o.position.z - 17.5);
                if (dd < bd) { bd = dd; pv = o; }
            }
        });
        if (pv) {
            const tvM = pv;                       // 掛到柱子 mesh 上
            const tv = new THREE.Group();
            const scrMat = new THREE.MeshBasicMaterial({ color: 0x1c2733, side: THREE.DoubleSide });
            const scr = new THREE.Mesh(new THREE.PlaneGeometry(4.42, 2.48), scrMat);   // 變大 2 倍
            tv.add(scr);                          // 螢幕正面朝 +z → 面對傳送帶
            const backBar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, 0.05),
                new THREE.MeshLambertMaterial({ color: 0x1c2733 }));
            tv.add(backBar);                      // 細背條固定於柱面
            tv.position.set(0, 2.0, 0.912 + 0.03);   // 中心高＝鋼架同高 3m（世界 2.0*1.5）   // 柱南面（半深 0.912）外貼
            tv.userData.cat = 'sign';
            tvM.add(tv);
            try {
                new THREE.TextureLoader().load('lib/tv_d.png?v=2', t => {
                    const m = new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide });
                    scr.material = m; scr.material.needsUpdate = true;
                }, undefined, function () { /* 圖片載不到保持深底 */ });
            } catch (e) { /* 忽略 */ }
        }
    }

    {   // 車道北側護欄：跨全寬 x=-16..16、於鋼架倉前沿 z≈19.6（雙欄杆＋多柱）
        const f = new THREE.Group();
        const rMat = new THREE.MeshLambertMaterial({ color: 0x8fa0ae });
        const pMat = new THREE.MeshLambertMaterial({ color: 0x56626e });
        const X0 = -16, X1 = 16, ZZ = 26.9;   // 貼著傳送帶北緣（帶面 ~27.0）
        [1.08, 1.42].forEach(y => {          // 抬高：不碰傳送帶，人能擋、AGV 從下方穿過
            const r = new THREE.Mesh(new THREE.BoxGeometry((X1 - X0), 0.08, 0.06), rMat);
            r.position.y = y; f.add(r);
        });
        [X0, X1].forEach(x => {                       // 只留兩端柱
            const ps = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.5, 0.09), pMat);
            ps.position.set(x, 0.75, 0); f.add(ps);
        });
        f.position.set(0, 0, ZZ);
        f.userData.cat = 'sign';
        dwGroup.add(f);
    }


    {   // 接駁臺綠格標籤：4 個 J 格各寫一個字 → 任務大廳
        const jc = [];
        const hX2 = (DW_COLS - 1) / 2, hZ2 = (DW_ROWS - 1) / 2;
        for (let rr = 0; rr < DW_ROWS; rr++) {
            for (let cc = 0; cc < DW_COLS; cc++) {
                if (DW_GRID[rr][cc] === 'J') {
                    jc.push([(cc - hX2) * DW_PITCH_X, (rr - hZ2) * DW_PITCH_Z]);
                }
            }
        }
        const chs = ['任', '務', '大', '廳'];
        jc.forEach((pt, i) => {
            const lb = makeLabelSprite(chs[i % chs.length], '#67e08a', 4.4, 1.1);
            lb.position.set(pt[0], 0.72, pt[1]);   // 一格一字
            dwGroup.add(lb);
        });
    }

    // D 倉整體旋轉 90°：讓接駁臺由朝南改為朝西（局部 +z 端 → 世界 -x）
    dwGroup.position.set(DW_CENTER_X, 0, DW_CENTER_Z);
    dwGroup.rotation.y = -Math.PI / 2;
    dwGroup.scale.set(1.5, 1.5, 1.5);   // 整倉 ×1.5（與 C 倉世界比例一致）
    scene.add(dwGroup);
    buildAgv();
}

// ============ AGV 無人堆高車劇本：1號傳送帶整疊 20 個托盤 → 搬至 4號傳送帶 ============
let agvList = [];
function buildAgv() {
    if (!dwGroup) return;
    agvList.forEach(g => { if (g.group.parent) g.group.parent.remove(g.group); });
    agvList = [];
    const matRed   = new THREE.MeshLambertMaterial({ color: 0x2e6db4 });   // 藍主體
    const matBlack = new THREE.MeshLambertMaterial({ color: 0x1d1e22 });
    const matTire  = new THREE.MeshLambertMaterial({ color: 0x0b0b0d });
    const matFork  = new THREE.MeshLambertMaterial({ color: 0x16181c });
    const matScan  = new THREE.MeshLambertMaterial({ color: 0x8fd0ff, emissive: 0x2a6ba8 });
    const matCargo = new THREE.MeshLambertMaterial({ color: 0xaab8c4 });   // 托盤貨（淺鋼灰）
    const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    const put = (g, x, y, z, mesh) => { mesh.position.set(x, y, z); g.add(mesh); return mesh; };
    // ── 貨點（局部）：傳送帶1 row42、傳送帶4 row45（已南移半格） ──
    const belt1 = { x: -10.0, zRow: 32.2 };   // 1號帶取貨點＝傳送帶南緣（人行道第一行旁）
    const belt4 = { x:  10.0, zRow: 34.4 };   // 4號帶放貨點＝人行道第三行
    const AISLE_Z = 35.0;   // 行車道＝人行道第三行（護欄在 33.6 中間，車走南側不重疊）
    const PICK_Z1 = belt1.zRow - 0.55;
    const PICK_Z4 = belt4.zRow - 0.55;
    // ── 貨堆＝20 個托盤垂直堆疊成一組（像貨架上那種整疊） ──
    const N = 20, TH = 0.105;                 // 每層高（盒高 0.10 + 微縫）
    const mkStack = (g, baseX, baseZ) => {
        const grp = new THREE.Group();
        for (let i = 0; i < N; i++) {
            const m = put(grp, baseX, 0.62 + i * TH, baseZ, box(0.36, 0.10, 0.50, matCargo));
            m.userData = { scenTote: true };   // 標記套用周轉箱材質包
        }
        g.add(grp);
        return grp;
    };
    const srcStack = mkStack(dwGroup, belt1.x, belt1.zRow);
    const dstStack = mkStack(dwGroup, belt4.x, belt4.zRow);
    dstStack.visible = false;
    // ── 單一台無人電動堆高車 ──
    const g = new THREE.Group();
    put(g, 0, 0.10, 0, box(0.80, 0.10, 1.22, matBlack));
    put(g, 0, 0.32, 0.42, box(0.82, 0.30, 0.14, matBlack));
    put(g, 0, 0.34, -0.14, box(0.82, 0.44, 0.80, matRed));
    put(g, 0, 0.68, -0.14, box(0.52, 0.22, 0.32, matBlack));
    [-0.26, 0.26].forEach(sx => put(g, sx, 1.06, 0.52, box(0.09, 1.44, 0.10, matBlack)));
    put(g, 0, 1.78, 0.52, box(0.64, 0.07, 0.10, matBlack));
    const forkGrp = new THREE.Group();
    forkGrp.position.set(0, 0.22, 0.52);
    put(forkGrp, 0, 0.18, -0.02, box(0.54, 0.46, 0.06, matBlack));
    [-0.14, 0.14].forEach(fx => put(forkGrp, fx, -0.015, 0.33, box(0.07, 0.05, 0.76, matFork)));
    // 載貨整疊（依附門架，隨叉升起）
    const carryStack = new THREE.Group();
    for (let i = 0; i < N; i++) {
        const m = put(carryStack, 0, 0.50 + i * TH, 0.06, box(0.36, 0.10, 0.50, matCargo));
        m.userData = { scenTote: true };   // 標記套用周轉箱材質包
    }
    carryStack.visible = false;
    forkGrp.add(carryStack);
    g.add(forkGrp);
    [[-0.34, 0.44], [0.34, 0.44], [-0.34, -0.44], [0.34, -0.44]].forEach(pt => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 10), matTire);
        w.rotation.z = Math.PI / 2; w.position.set(pt[0], 0.10, pt[1]); g.add(w);
    });
    put(g, 0, 0.16, -0.64, box(0.34, 0.05, 0.04, matBlack));
    put(g, 0, 0.16, 0.62, box(0.34, 0.05, 0.04, matBlack));
    const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.14, 10), matBlack);
    lidar.position.set(0, 0.92, -0.16); g.add(lidar);
    lidar.add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.20), matScan));
    g.position.y = 0.35;
    dwGroup.add(g);
    const car = { group: g, forkGrp, carryStack, lidar,
        belt1, belt4, AISLE_Z, PICK_Z1, PICK_Z4, srcStack, dstStack,
        st: 'P1', stT: 0, vx: 0, vz: 0 };
    g.position.set(car.belt1.x, 0.35, car.AISLE_Z);
    agvList.push(car);
    setWhVisible(activeWh);   // async 重建完成後依目前選倉套用可見性（預設 C → D 隱藏）
}
function updateAgv(dt) {
    if (!renderer || !agvList.length) return;
    const a = agvList[0];
    a.lidar.rotation.y += dt * 1.5;
    a.stT += dt;
    const K = 2.2, Kz = 1.2;
    const moveX = (t, sp) => {
        const d = t - a.group.position.x;
        const s = Math.max(-1, Math.min(1, d * 10));
        if (Math.abs(d) < 0.15) { a.vx = 0; return true; }
        a.group.position.x += s * sp * dt; a.vx = s; a.vz = 0;
        return false;
    };
    const moveZ = (t, sp) => {
        const d = t - a.group.position.z;
        const s = Math.max(-1, Math.min(1, d * 10));
        if (Math.abs(d) < 0.12) { a.vz = 0; return true; }
        a.group.position.z += s * sp * dt; a.vz = s; a.vx = 0;
        return false;
    };
    a.vx = a.vx || 0; a.vz = a.vz || 0;
    // 防穿模：深入皮帶區時車身抬到皮帶高度
    const dynY = (Math.abs(a.group.position.z - a.AISLE_Z) > 2.0) ? 0.62 : 0.35;
    a.group.position.y += (dynY - a.group.position.y) * Math.min(1, dt * 4);
    switch (a.st) {
        case 'P1':      // 前往 1 號帶貨堆
            if (moveX(a.belt1.x, K)) a.st = 'P1z', a.stT = 0;
            break;
        case 'P1z':     // 推進對準
            if (moveZ(a.PICK_Z1, Kz)) a.st = 'L1', a.stT = 0;
            break;
        case 'L1':      // 抬叉取整疊（源疊先隱、載疊浮現 → 不穿模）
            a.forkGrp.position.y += (1.65 - a.forkGrp.position.y) * 0.15;
            if (a.forkGrp.position.y >= 0.90) { a.srcStack.visible = false; a.carryStack.visible = true; }
            if (a.stT > 1.8) a.st = 'T14', a.stT = 0;
            break;
        case 'T14':     // 橫移送往 4 號帶
            if (moveX(a.belt4.x, K)) a.st = 'P4z', a.stT = 0;
            break;
        case 'P4z':     // 推進對準 4 號帶
            if (moveZ(a.PICK_Z4, Kz)) a.st = 'L4', a.stT = 0;
            break;
        case 'L4':      // 降叉放整疊
            a.forkGrp.position.y += (0.22 - a.forkGrp.position.y) * 0.15;
            if (a.forkGrp.position.y <= 0.90) { a.carryStack.visible = false; a.dstStack.visible = true; }
            if (a.stT > 1.8) {
                a.srcStack.visible = true; a.dstStack.visible = false;   // 補新批
                a.st = 'O4', a.stT = 0;                                  // 放完先往東收尾
            }
            break;
        case 'O4':      // 放貨後續往東行進一段，再繞回 1 號帶
            if (moveX(15.0, K)) a.st = 'P1', a.stT = 0;
            break;
    }
    let tYaw = a.group.rotation.y;                    // 靜止：保持原朝向（不亂轉）
    if (Math.abs(a.vx) > Math.abs(a.vz)) tYaw = (a.vx >= 0 ? 1 : -1) * Math.PI / 2;
    else if (a.vz > 0.0001) tYaw = 0;                 // 往南
    else if (a.vz < -0.0001) tYaw = Math.PI;          // 往北
    const sK = Math.min(1, dt * 5);
    a.group.rotation.y += (tYaw - a.group.rotation.y) * sK;
}

function initBeltTexture() {
    if (typeof THREE.TextureLoader !== 'function' || !dwGroup) return;
    if (beltTopTex) { applyBeltTex(); return; }
    if (beltLoading) return;
    beltLoading = true;
    new THREE.TextureLoader().load('lib/belt_top.png?v=3', t => {
        beltTopTex = t;
        try { beltTopTex.wrapS = beltTopTex.wrapT = THREE.ClampToEdgeWrapping; } catch (e) { /* old three */ }
        applyBeltTex();
    });
}
function applyBeltTex() {
    if (!beltTopTex || !dwGroup) return;
    dwGroup.traverse(o => {
        if (o.userData && o.userData.beltTop) {
            o.material = new THREE.MeshPhongMaterial({ map: beltTopTex, shininess: 40 });
            o.material.needsUpdate = true;
        }
    });
}

// 載入 AI 生成周轉箱紋理並套用（非同步）
let toteLoading = false;
function initToteTextures() {
    if (typeof THREE.TextureLoader !== 'function' || !dwGroup) return;
    if (toteSideTex && toteTopTex) { applyToteTex(); return; }   // 已載入 → 重新套用到最新 dwGroup
    if (toteLoading) return;
    toteLoading = true;
    const L = new THREE.TextureLoader();
    const W = (typeof THREE.ClampToEdgeWrapping !== 'undefined') ? THREE.ClampToEdgeWrapping : (THREE.ClampToEdgeWrapping || THREE.ClampToEdgeWrapping);
    L.load('lib/tote_side.png?v=7', t => {
        toteSideTex = t;
        try { toteSideTex.wrapS = toteSideTex.wrapT = W; } catch (e) { /* old three */ }
        applyToteTex();
    });
    L.load('lib/tote_top.png?v=7', t => {
        toteTopTex = t;
        try { toteTopTex.wrapS = toteTopTex.wrapT = W; } catch (e) { /* old three */ }
        applyToteTex();
    });
}
function applyToteTex() {
    if (!toteSideTex || !toteTopTex || !dwGroup) return;
    const mtT = { transparent: true };   // 紋理含透明底（PNG alpha）
    const mats = [
        new THREE.MeshLambertMaterial(Object.assign({ map: toteSideTex }, mtT)),   // +X
        new THREE.MeshLambertMaterial(Object.assign({ map: toteSideTex }, mtT)),   // -X
        new THREE.MeshLambertMaterial(Object.assign({ map: toteTopTex }, mtT)),    // +Y 頂
        new THREE.MeshLambertMaterial(Object.assign({ map: toteTopTex }, mtT)),    // -Y 底
        new THREE.MeshLambertMaterial(Object.assign({ map: toteSideTex }, mtT)),   // +Z
        new THREE.MeshLambertMaterial(Object.assign({ map: toteSideTex }, mtT))    // -Z
    ];
    dwGroup.traverse(o => {
        if (o.isInstancedMesh && o.geometry && o.geometry.parameters &&
            Math.abs(o.geometry.parameters.height - 1.1) < 0.01) {   // 黑箱高 1.1m
            o.material = mats;
        } else if (o.userData && o.userData.scenTote) {             // 劇本托盤（整疊）
            o.material = mats;
        }
    });
}

function renderDWSummary() {
    const cells = dwData || [];
    const total = cells.length;
    const used = cells.filter(c => c.occ).length;
    const empty = total - used;
    document.getElementById('sumTotal').textContent = total;
    document.getElementById('sumTotalSub').textContent = '鋼架上下 2 層・共 3m（A 下 / B 上）';
    document.getElementById('sumUsed').textContent = used;
    document.getElementById('sumUsedPct').textContent = total ? Math.round(used / total * 100) + '%' : '0%';
    document.getElementById('sumEmpty').textContent = empty;
    document.getElementById('sumEmptyPct').textContent = total ? Math.round(empty / total * 100) + '%' : '0%';
    document.getElementById('sumSpecial').textContent = 0;
    document.getElementById('sumSpecialSub').textContent = 'D 倉無出庫機制';
    const utilPct = total ? Math.round(used / total * 100) : 0;
    const circumference = 2 * Math.PI * 48;
    const ringFill = document.getElementById('utilRingFill');
    ringFill.setAttribute('stroke-dashoffset', circumference - circumference * utilPct / 100);
    let ringColor = '#8BA5B5';
    if (utilPct > 80) ringColor = 'rgb(240,193,68)';
    else if (utilPct < 40) ringColor = '#35B835';
    ringFill.setAttribute('stroke', ringColor);
    document.getElementById('utilRingText').textContent = utilPct + '%';
    const sdEl = document.getElementById('specialDetail');
    sdEl.classList.remove('special-grid');
    sdEl.textContent = 'D 倉無出庫中物料';
}

// ==================== RESIZE ====================
