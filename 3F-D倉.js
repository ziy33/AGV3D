// ==================== 3F D 倉（ESS 儲位佈局，F103 數據驅動；非 2F 克隆）— 每倉一個 JS ====================
let d3Group = null;   // D 三樓 group
let d3AgvMesh = null; // AGV 點位 instanced mesh
let d3SlotMeshA = null; // 儲位 1層 (A)
let d3SlotMeshB = null; // 儲位 2層 (B)
let d3PostMesh = null;  // 鋼架立柱
let d3BeamMesh = null;  // 鋼架橫樑
let d3TopA = null;      // A 層頂蓋 (tote_top)
let d3TopB = null;      // B 層頂蓋 (tote_top)
let d3Slots = [];       // 3F-D 可點擊儲位 mesh（供核心.js raycastMeshes 拾取）

const DW3_AGV_URL = 'D倉_agv.json';
const DW3_SLOT_URL = 'D倉_儲位.json';
const D3_API = 'http://10.176.33.77:9003/ess-api/monitor/location/query';   // HAI ESS 儲位查詢（取代 SEMS pcba_all）— F103 = 3F-D
const D3_API_CODE = 'F103';   // 3F-D = HAI ESS 區域3（F103）
const D3_API_PAGE = 50;       // ESS /monitor/location/query 單頁上限
let _d3AgvLoading = false;
let _d3SlotLoading = false;
let _d3DataLoading = false;
let d3SlotData = null;      // Map<code, {occ, container, type, locked, abnormal, abnormalReason}>
let _d3AList = null, _d3BList = null;                  // 供佔用過濾（空位隱藏）對照用
let _d3AMats = null, _d3BMats = null;                  // A/B 層 tote 本體原始矩陣
let _d3ATopMats = null, _d3BTopMats = null;            // A/B 層 tote 頂蓋原始矩陣
const _d3HideM4 = new THREE.Matrix4().makeScale(1e-6, 1e-6, 1e-6);   // 空位：縮到趨近 0（不可見、不可點）
const D3_AGV_X_OFF = 1;   // AGV 停靠點 X 方向偏移（微調避開與儲位重疊；改此值即可）

// === D 倉「裝卸區」區域（局部座標）===
// 裝貨/卸貨點：D 倉點位 POINT:*:1742@3（Y 固定 1742mm，X 由 3949 → 34820mm）→ 沿南側一整條線
// 轉局部：localX = 17.5 - x + D3_AGV_X_OFF、localZ = y - 17.5
//   x 3.949 ~ 34.820 m → localX 14.55 ~ -16.32；y 1.742 m → localZ -15.76（帶狀取 z∈[-16.9,-14.5]）
const D3_OUT_X0 = -16.32, D3_OUT_X1 = 14.55;  // 裝卸區（局部 x 範圍；覆蓋整條裝卸點）
const D3_OUT_Z0 = -16.9, D3_OUT_Z1 = -14.5;   // 裝卸區（局部 z 範圍；沿 Y=1742mm 帶狀）
const D3_OUT_Z_OFF = -0.5;                    // 裝卸區警示線沿 Z 偏移（公尺；負=往南）
const D3_OUT_STRIPE = 0.6;   // 黑白條紋週期（公尺）
const D3_OUT_T = 0.22;       // 邊框線厚（公尺）
const D3_OUT_H = 0.03;       // 邊框線高（公尺）

// === 裝卸區流水線（每個工作位一條「南北向(Z)」短皮帶；OUTPUT 往南 -z、INPUT 往北 +z）===
const D3_CONV_W = 0.9;       // 皮帶寬度（x 方向，公尺）
const D3_CONV_LEN = 1.26;    // 皮帶長度（z 方向，公尺）
const D3_CONV_TOP = 0.5;     // 皮帶面高度（公尺）
const D3_CONV_Z_OFF = -0.7;  // 輸送帶整體沿 Z 偏移（公尺；負=往南/朝牆，正=往北/朝貨架）
const D3_CONV_MESHZ = -0.15; // 皮帶面/導軌/支腿在群組內沿 z 偏移（負=使加長偏向 -Z）
let _d3ConvTexOut = null;    // OUTPUT 皮帶貼圖（往 -z 流；供捲動動畫）
let _d3ConvTexIn = null;     // INPUT 皮帶貼圖（往 +z 流；供捲動動畫）

// === 流水線工作位（HAI ESS location API：LT_CONVEYOR_OUTPUT + LT_CONVEYOR_INPUT；zone3 = 點位碼 @3）===
const D3_LOC_API = 'http://10.176.33.77:9003/ess-api/location/query';   // HAI ESS 庫位/站點查詢（CORS: *）
let _d3LocLoading = false;
let d3ConvPoints = null;        // 最近一次查到的流水線出庫點（原始 location 陣列）
let d3ConvMarkerGroup = null;   // 輸送帶上的出庫點標記群組

// === 充電樁（AI 生成貼圖；D倉_agv.json 充電排只有 POINT:809/2279:1350@3 兩點）===
const D3_CHARGER_TEX_URL = 'lib/charger.png?v=1';   // AI 生成之充電樁貼圖（650x1315）
const D3_CHARGE_Y = 1.350;                          // 充電排 Y（公尺）
const D3_CHARGER_Z_OFF = -0.5;                      // 充電樁 Z 偏移（避免與停在充電點的 AGV 重疊；可調）
let _d3ChargerTex = null;
function getD3ChargerTex() {
    if (_d3ChargerTex) return _d3ChargerTex;
    _d3ChargerTex = new THREE.TextureLoader().load(D3_CHARGER_TEX_URL);
    if (THREE.SRGBColorSpace !== undefined) _d3ChargerTex.colorSpace = THREE.SRGBColorSpace;
    return _d3ChargerTex;
}
function buildD3Chargers(chargerPts) {
    if (!d3Group) return;
    const W = 0.5, D = 0.35, H = 1.0;   // 立面 0.5×1.0 ≈ 貼圖 1:2
    const sideMat = new THREE.MeshLambertMaterial({ map: getD3ChargerTex() });
    const capMat = new THREE.MeshLambertMaterial({ color: 0x2b3138 });
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x1f242a });
    for (let i = 0; i < chargerPts.length; i++) {
        const p = chargerPts[i];
        const lx = 17.5 - p.x + D3_AGV_X_OFF;   // 與 AGV 點位同一局部映射
        const lz = p.y - 17.5 + D3_CHARGER_Z_OFF;   // 往 Z 移開，避免與 AGV 重疊
        const box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D),
            [sideMat, sideMat, capMat, capMat, sideMat, sideMat]);   // 面序 +X,-X,+Y,-Y,+Z,-Z
        box.position.set(lx, H / 2, lz);
        box.userData.cat = 'charger';
        d3Group.add(box);
        const base = new THREE.Mesh(new THREE.BoxGeometry(W + 0.14, 0.08, D + 0.14), baseMat);
        base.position.set(lx, 0.04, lz);
        base.userData.cat = 'charger';
        d3Group.add(base);
    }
}

// 周轉箱 6 面材質（沿用全域 tote 貼圖；若尚未載入則用近似色）
function mkD3ToteMats() {
    const side = (typeof toteSideTex !== 'undefined' && toteSideTex) ? toteSideTex : null;
    const top = (typeof toteTopTex !== 'undefined' && toteTopTex) ? toteTopTex : null;
    const sm = new THREE.MeshLambertMaterial(side ? { map: side } : { color: 0xc9a06a });
    const tm = new THREE.MeshLambertMaterial(top ? { map: top } : { color: 0xb8905a });
    return [sm, sm, tm, tm, sm, sm];   // 面序 +X,-X,+Y,-Y,+Z,-Z
}

// 皮帶板條貼圖（沿 z 重複；kind='out' 往 -z 流、'in' 往 +z 流，各一份供捲動）
function getD3ConvTex(kind) {
    if (kind === 'out' && _d3ConvTexOut) return _d3ConvTexOut;
    if (kind === 'in' && _d3ConvTexIn) return _d3ConvTexIn;
    const cc = document.createElement('canvas'); cc.width = 64; cc.height = 64;
    const g = cc.getContext('2d');
    g.fillStyle = '#3b4753'; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#2a333d'; for (let y = 0; y < 64; y += 16) g.fillRect(0, y, 64, 8);
    g.fillStyle = 'rgba(255,255,255,0.06)'; for (let y = 0; y < 64; y += 16) g.fillRect(0, y + 8, 64, 2);
    const t = new THREE.CanvasTexture(cc);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, Math.max(1, Math.round(D3_CONV_LEN / 0.6)));
    if (THREE.SRGBColorSpace !== undefined) t.colorSpace = THREE.SRGBColorSpace;
    if (kind === 'out') _d3ConvTexOut = t; else _d3ConvTexIn = t;
    return t;
}

// 皮帶捲動動畫（僅在 3F-D 顯示時更新，省資源）
function _d3ConvAnim() {
    requestAnimationFrame(_d3ConvAnim);
    if (!d3Group || !d3Group.visible) return;
    if (_d3ConvTexOut) _d3ConvTexOut.offset.y -= 0.0035;   // OUTPUT 皮帶往 -z 流
    if (_d3ConvTexIn) _d3ConvTexIn.offset.y += 0.0035;     // INPUT 皮帶往 +z 流
}

// 抓取 HAI ESS「流水線工作位」(OUTPUT + INPUT，取 zone3) → 於各工作位建南北向皮帶 + 標記
async function loadD3ConveyorLocs() {
    if (_d3LocLoading) return;
    _d3LocLoading = true;
    try {
        const types = ['LT_CONVEYOR_OUTPUT', 'LT_CONVEYOR_INPUT'];
        let all = [];
        for (let t = 0; t < types.length; t++) {
            const resp = await fetch(D3_LOC_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locationTypeCode: types[t], limit: 50 })
            });
            if (!resp.ok) continue;
            const j = await resp.json();
            const list = (j && j.data && j.data.locations) ? j.data.locations : [];
            all = all.concat(list.filter(x => x.link && x.link[0] && /@3$/.test(x.link[0].pointCode || '')));
        }
        all.sort((a, b) => (parseFloat(a.position.x) - parseFloat(b.position.x)));
        d3ConvPoints = all;
        buildD3ConvMarkers(all);
    } catch (e) { }
    _d3LocLoading = false;
}

// 每個工作位建一條「南北向(Z)」短皮帶 + 定位圓盤(有貨綠/無貨藍) + 方向箭頭(OUTPUT 往 -z、INPUT 往 +z) + 有貨擺周轉箱
function buildD3ConvMarkers(locs) {
    if (!d3Group) return;
    if (!d3ConvMarkerGroup) {
        d3ConvMarkerGroup = new THREE.Group();
        d3ConvMarkerGroup.name = 'd3ConvMarkers';
        d3Group.add(d3ConvMarkerGroup);
    }
    while (d3ConvMarkerGroup.children.length) {   // 清空舊的（皮帶 + 標記）
        const c = d3ConvMarkerGroup.children.pop();
        d3ConvMarkerGroup.remove(c);
        c.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    }
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x4a5763 });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x2f3a43 });
    const toteMats = mkD3ToteMats();
    const yTop = D3_CONV_TOP + 0.05;
    const texOut = getD3ConvTex('out');
    const texIn = getD3ConvTex('in');
    for (let i = 0; i < locs.length; i++) {
        const loc = locs[i];
        const pos = loc.position || {};
        const xm = parseFloat(pos.x) / 1000, ym = parseFloat(pos.y) / 1000;
        if (isNaN(xm) || isNaN(ym)) continue;
        const lx = 17.5 - xm + D3_AGV_X_OFF;   // 與 AGV 點位同一局部映射
        const lz = ym - 17.5 + D3_CONV_Z_OFF;
        const isOut = String(loc.locationTypeCode || '').indexOf('OUTPUT') >= 0;
        const hasTote = !!(loc.containerCode && String(loc.containerCode).length);
        const flowSign = isOut ? -1 : 1;       // OUTPUT 往 -z（南/朝 AGV）；INPUT 往 +z（北/朝貨架）

        const g2 = new THREE.Group();
        g2.position.set(lx, 0, lz);
        g2.userData.cat = 'convLoc';
        d3ConvMarkerGroup.add(g2);

        // 南北向短皮帶（皮帶面 + 兩側導軌 + 四角支腿）
        const belt = new THREE.Mesh(new THREE.BoxGeometry(D3_CONV_W, 0.05, D3_CONV_LEN),
            new THREE.MeshLambertMaterial({ map: isOut ? texOut : texIn }));
        belt.position.set(0, D3_CONV_TOP, D3_CONV_MESHZ);
        belt.userData.cat = 'conveyor';
        g2.add(belt);
        [-1, 1].forEach(sg => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, D3_CONV_LEN), frameMat);
            rail.position.set(sg * (D3_CONV_W / 2 + 0.03), D3_CONV_TOP + 0.02, D3_CONV_MESHZ);
            rail.userData.cat = 'conveyor';
            g2.add(rail);
        });
        [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, D3_CONV_TOP, 0.06), darkMat);
            leg.position.set(sx * (D3_CONV_W / 2 - 0.05), D3_CONV_TOP / 2, D3_CONV_MESHZ + sz * (D3_CONV_LEN / 2 - 0.08));
            leg.userData.cat = 'conveyor';
            g2.add(leg);
        }));

        // 定位圓盤（有貨＝綠、無貨＝藍）
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16),
            new THREE.MeshBasicMaterial({ color: hasTote ? 0x35c24a : 0x2f6fb0 }));
        pad.position.set(0, yTop, 0);
        g2.add(pad);

        // 方向箭頭（沿 z；OUTPUT 往 -z、INPUT 往 +z）
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 4),
            new THREE.MeshBasicMaterial({ color: hasTote ? 0xbaffc8 : 0x9fd0ff }));
        arrow.rotation.x = flowSign > 0 ? Math.PI / 2 : -Math.PI / 2;
        arrow.position.set(0, yTop + 0.01, flowSign * 0.36);
        g2.add(arrow);

        // 有貨 → 皮帶上擺一個周轉箱
        if (hasTote) {
            const bx = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.46), toteMats);
            bx.position.set(0, yTop + 0.19, 0);
            g2.add(bx);
        }
    }
    if (!buildD3ConvMarkers._anim) { buildD3ConvMarkers._anim = true; _d3ConvAnim(); }
}

function buildFloor3D() {
    if (!floor3Group || d3Group) return;
    d3Group = new THREE.Group();
    d3Group.position.set(128, FLOOR_Y + 5, -50);   // 3F-D 移到空地（不壓在 2F-D 上方）
    d3Group.name = 'd3Group';
    floor3Group.add(d3Group);

    // 地板（實心，跟 2F 同色同厚）— 覆蓋 F103 儲位 + AGV 點位全範圍
    const floorGeo = new THREE.BoxGeometry(38, 0.14, 38);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x626f7c });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.07, 0.5);
    floorMesh.userData.cat = 'd3Floor';
    d3Group.add(floorMesh);

    // === 四周透明圍牆（50% 透明玻璃感；沿地板邊緣圍起，含四角）===
    const D3_WALL_H = 3.0;    // 圍牆高（局部公尺）
    const D3_WALL_T = 0.12;   // 牆厚
    const D3_HALF = 19, D3_CZ = 0.5;                 // 地板：x∈[-19,19]、z 中心 0.5
    const D3_WALL_LEN = 38 + 2 * D3_WALL_T;          // 略長以封住四角
    const wallMatD3 = new THREE.MeshLambertMaterial({ color: 0xbddcff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    const mkD3Wall = (geo, gx, gz) => {
        const w = new THREE.Mesh(geo, wallMatD3);
        w.position.set(gx, D3_WALL_H / 2, gz);
        w.userData.cat = 'wall';
        if (typeof ghostStatic !== 'undefined' && ghostStatic.wall) ghostStatic.wall.push(w);
        d3Group.add(w);
    };
    mkD3Wall(new THREE.BoxGeometry(D3_WALL_LEN, D3_WALL_H, D3_WALL_T), 0, D3_CZ - D3_HALF);                 // 北牆
    mkD3Wall(new THREE.BoxGeometry(D3_WALL_LEN, D3_WALL_H, D3_WALL_T), 0, D3_CZ + D3_HALF);                 // 南牆
    mkD3Wall(new THREE.BoxGeometry(D3_WALL_T, D3_WALL_H, D3_WALL_LEN), -(D3_HALF), D3_CZ);                  // 西牆
    mkD3Wall(new THREE.BoxGeometry(D3_WALL_T, D3_WALL_H, D3_WALL_LEN), +(D3_HALF), D3_CZ);                  // 東牆

    buildD3OutboundZone();   // 裝卸區：黑白警示線框 + 地面標籤
    loadD3ConveyorLocs();    // 流水線工作位（HAI ESS location API）→ 建南北向皮帶 + 標記

    loadD3AgvPoints();
    loadD3Slots();
    loadD3SlotData();
}

// 黑白警示條紋貼圖（canvas，45° 斜紋）
function mkD3HazardTex() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#111111';
    for (let i = -64; i < 64; i += 32) {   // 一半黑一半白的斜紋
        ctx.beginPath();
        ctx.moveTo(i, 64); ctx.lineTo(i + 16, 64);
        ctx.lineTo(i + 80, 0); ctx.lineTo(i + 64, 0);
        ctx.closePath(); ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

// 裝卸區：黑白警示線框（貼地）+「裝卸區」地面字樣
function buildD3OutboundZone() {
    if (!d3Group) return;
    const X0 = D3_OUT_X0, X1 = D3_OUT_X1, Z0 = D3_OUT_Z0 + D3_OUT_Z_OFF, Z1 = D3_OUT_Z1 + D3_OUT_Z_OFF;
    const lenX = X1 - X0, lenZ = Z1 - Z0, t = D3_OUT_T, h = D3_OUT_H, yv = 0.02;
    const base = mkD3HazardTex();
    const mkEdge = (geo, gx, gz, rep) => {
        const tex = base.clone(); tex.needsUpdate = true;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(rep, 1);
        const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, transparent: true }));
        mesh.position.set(gx, yv, gz);
        mesh.userData.cat = 'outboundZone';
        d3Group.add(mesh);
    };
    mkEdge(new THREE.BoxGeometry(lenX + t, h, t), (X0 + X1) / 2, Z0, lenX / D3_OUT_STRIPE);   // 北邊
    mkEdge(new THREE.BoxGeometry(lenX + t, h, t), (X0 + X1) / 2, Z1, lenX / D3_OUT_STRIPE);   // 南邊
    mkEdge(new THREE.BoxGeometry(t, h, lenZ + t), X0, (Z0 + Z1) / 2, lenZ / D3_OUT_STRIPE);   // 西邊
    mkEdge(new THREE.BoxGeometry(t, h, lenZ + t), X1, (Z0 + Z1) / 2, lenZ / D3_OUT_STRIPE);   // 東邊
    // 地面標籤「裝卸區」：沿整條帶狀區放 3 個（左／中／右）
    const lc = document.createElement('canvas');
    lc.width = 256; lc.height = 96;
    const lx = lc.getContext('2d');
    lx.font = 'bold 56px sans-serif';
    lx.textAlign = 'center'; lx.textBaseline = 'middle';
    lx.lineWidth = 8; lx.strokeStyle = '#111111'; lx.strokeText('裝卸區', 128, 50);
    lx.fillStyle = '#ffffff'; lx.fillText('裝卸區', 128, 50);
    const ltex = new THREE.CanvasTexture(lc);
    if (THREE.SRGBColorSpace !== undefined) ltex.colorSpace = THREE.SRGBColorSpace;
    const lgeo = new THREE.PlaneGeometry(2.4, 0.9);
    const lmat = new THREE.MeshBasicMaterial({ map: ltex, transparent: true, depthWrite: false });
    const lcz = (Z0 + Z1) / 2;
    [0.2, 0.5, 0.8].forEach(tf => {
        const lmesh = new THREE.Mesh(lgeo, lmat);
        lmesh.rotation.x = -Math.PI / 2;
        lmesh.position.set(X0 + (X1 - X0) * tf, 0.045, lcz);
        lmesh.userData.cat = 'outboundZone';
        d3Group.add(lmesh);
    });
}

async function loadD3AgvPoints() {
    if (!d3Group || _d3AgvLoading) return;
    _d3AgvLoading = true;
    try {
        const resp = await fetch(DW3_AGV_URL + '?v=' + Date.now());
        if (!resp.ok) return;
        const pts = await resp.json();
        if (!Array.isArray(pts) || pts.length === 0) return;
        buildD3AgvPoints(pts);
    } catch (e) { }
    _d3AgvLoading = false;
}

function buildD3AgvPoints(pts) {
    if (!d3Group) return;
    // 清除舊的
    if (d3AgvMesh) { d3Group.remove(d3AgvMesh); d3AgvMesh.geometry.dispose(); d3AgvMesh.material.dispose(); d3AgvMesh = null; }

    // AGV 點位坐標映射：Excel 用 0~35m，2F grid local 用 -17.6~+17.6 (X) / -30.8~+30.8 (Z)
    // 直接 centering：x_local = agv_x - 17.5, z_local = agv_y - 17.5
    const COUNT = pts.length;
    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.5 });
    const im = new THREE.InstancedMesh(geo, mat, COUNT);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const vs = new THREE.Vector3(1, 1, 1);
    const vp = new THREE.Vector3();
    for (let i = 0; i < COUNT; i++) {
        const p = pts[i];
        vp.set(17.5 - p.x + D3_AGV_X_OFF, 0.08, p.y - 17.5);   // 左右鏡射 + AGV 點位 X 偏移
        m4.compose(vp, q, vs);
        im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true;
    im.userData.cat = 'agvPoint';
    im.userData.pointCodes = pts.map(p => p.code);
    d3Group.add(im);
    d3AgvMesh = im;
    if (typeof d3Slots !== 'undefined') d3Slots.push(im);
    // 充電排（y≈1.350m）→ 建充電樁
    const chargerPts = pts.filter(p => Math.abs(p.y - D3_CHARGE_Y) < 0.1);
    if (chargerPts.length) buildD3Chargers(chargerPts);
}

async function loadD3Slots() {
    if (!d3Group || _d3SlotLoading) return;
    _d3SlotLoading = true;
    try {
        const resp = await fetch(DW3_SLOT_URL + '?v=' + Date.now());
        if (!resp.ok) return;
        const slots = await resp.json();
        if (!Array.isArray(slots) || slots.length === 0) return;
        buildD3Slots(slots);
    } catch (e) { }
    _d3SlotLoading = false;
}

function buildD3Slots(slots) {
    if (!d3Group) return;
    // 清除舊的
    [d3SlotMeshA, d3SlotMeshB, d3PostMesh, d3BeamMesh].forEach(m => {
        if (m) { d3Group.remove(m); m.geometry.dispose(); m.material.dispose(); }
    });
    d3SlotMeshA = d3SlotMeshB = d3PostMesh = d3BeamMesh = null;

    // 取得唯一貨架位置（每位置有 A+B 兩層）
    const posMap = {};
    slots.forEach(s => {
        const key = s.x + ',' + s.y;
        if (!posMap[key]) posMap[key] = { x: s.x, y: s.y };
    });
    const positions = Object.values(posMap); // 1143 個位置
    const aList = slots.filter(s => s.layer === 'A');
    const bList = slots.filter(s => s.layer === 'B');
    _d3AList = aList; _d3BList = bList;   // 供佔用上色對照

    const CX = 17.5; // centering offset
    const POST_W = 0.05, POST_H = 2.0, POST_D = 0.05;
    const BEAM_W = 0.7, BEAM_H = 0.04, BEAM_D = 0.04;
    const TOTE_W = 0.55, TOTE_H = 0.55, TOTE_D = 0.55;
    const LEVEL_A_Y = 0.55;  // A 層 tote 中心
    const LEVEL_B_Y = 1.55;  // B 層 tote 中心
    const SPACING_X = 0.35;  // post 左右偏移

    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const vs = new THREE.Vector3(1, 1, 1);
    const vp = new THREE.Vector3();

    // === 1. 鋼架立柱（每位置 2 根：左+右）===
    const postCount = positions.length * 2;
    const postGeo = new THREE.BoxGeometry(POST_W, POST_H, POST_D);
    const postMat = new THREE.MeshLambertMaterial({ color: 0x607080 });
    const postIM = new THREE.InstancedMesh(postGeo, postMat, postCount);
    let pi = 0;
    for (const p of positions) {
        const lx = CX - p.x, lz = p.y - CX;
        // 左柱
        vp.set(lx - SPACING_X, POST_H / 2, lz);
        m4.compose(vp, q, vs); postIM.setMatrixAt(pi++, m4);
        // 右柱
        vp.set(lx + SPACING_X, POST_H / 2, lz);
        m4.compose(vp, q, vs); postIM.setMatrixAt(pi++, m4);
    }
    postIM.instanceMatrix.needsUpdate = true;
    postIM.userData.cat = 'd3Post';
    d3Group.add(postIM);
    d3PostMesh = postIM;

    // === 2. 鋼架橫樑（每位置 2 根：A層+B層）===
    const beamCount = positions.length * 2;
    const beamGeo = new THREE.BoxGeometry(BEAM_W, BEAM_H, BEAM_D);
    const beamMat = new THREE.MeshLambertMaterial({ color: 0x8898a8 });
    const beamIM = new THREE.InstancedMesh(beamGeo, beamMat, beamCount);
    let bi = 0;
    for (const p of positions) {
        const lx = CX - p.x, lz = p.y - CX;
        // A 層橫樑
        vp.set(lx, LEVEL_A_Y - TOTE_H / 2, lz);
        m4.compose(vp, q, vs); beamIM.setMatrixAt(bi++, m4);
        // B 層橫樑
        vp.set(lx, LEVEL_B_Y - TOTE_H / 2, lz);
        m4.compose(vp, q, vs); beamIM.setMatrixAt(bi++, m4);
    }
    beamIM.instanceMatrix.needsUpdate = true;
    beamIM.userData.cat = 'd3Beam';
    d3Group.add(beamIM);
    d3BeamMesh = beamIM;

    // === 3. A 層 Tote（下層）— SEMS 貨物貼圖 ===
    if (aList.length > 0) {
        const geo = new THREE.BoxGeometry(TOTE_W, TOTE_H, TOTE_D);
        const mat = new THREE.MeshLambertMaterial({ color: 0xd4c5a0, transparent: true, opacity: 0.92 });
        const im = new THREE.InstancedMesh(geo, mat, aList.length);
        _d3AMats = [];
        for (let i = 0; i < aList.length; i++) {
            vp.set(CX - aList[i].x, LEVEL_A_Y, aList[i].y - CX);
            m4.compose(vp, q, vs);
            im.setMatrixAt(i, m4);
            _d3AMats.push(m4.clone());
        }
        im.instanceMatrix.needsUpdate = true;
        im.userData.cat = 'slotA';
        im.userData.slotCodes = aList.map(s => s.code);
        d3Group.add(im);
        d3SlotMeshA = im;
        if (typeof d3Slots !== 'undefined') d3Slots.push(im);
        applyD3ToteTexture(im);
    }

    // === 4. B 層 Tote（上層）— SEMS 貨物貼圖 ===
    if (bList.length > 0) {
        const geo = new THREE.BoxGeometry(TOTE_W, TOTE_H, TOTE_D);
        const mat = new THREE.MeshLambertMaterial({ color: 0xd4c5a0, transparent: true, opacity: 0.92 });
        const im = new THREE.InstancedMesh(geo, mat, bList.length);
        _d3BMats = [];
        for (let i = 0; i < bList.length; i++) {
            vp.set(CX - bList[i].x, LEVEL_B_Y, bList[i].y - CX);
            m4.compose(vp, q, vs);
            im.setMatrixAt(i, m4);
            _d3BMats.push(m4.clone());
        }
        im.instanceMatrix.needsUpdate = true;
        im.userData.cat = 'slotB';
        im.userData.slotCodes = bList.map(s => s.code);
        d3Group.add(im);
        d3SlotMeshB = im;
        if (typeof d3Slots !== 'undefined') d3Slots.push(im);
        applyD3ToteTexture(im);
    }

    // === 5. A 層頂蓋（tote_top 貼圖）===
    if (aList.length > 0) {
        const topGeo = new THREE.PlaneGeometry(TOTE_W, TOTE_D);
        const topMat = new THREE.MeshLambertMaterial({ color: 0xd4c5a0, transparent: true, opacity: 0.92 });
        const topIM = new THREE.InstancedMesh(topGeo, topMat, aList.length);
        const qDown = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        _d3ATopMats = [];
        for (let i = 0; i < aList.length; i++) {
            vp.set(CX - aList[i].x, LEVEL_A_Y + TOTE_H / 2 + 0.001, aList[i].y - CX);
            m4.compose(vp, qDown, vs);
            topIM.setMatrixAt(i, m4);
            _d3ATopMats.push(m4.clone());
        }
        topIM.instanceMatrix.needsUpdate = true;
        topIM.userData.cat = 'd3TopA';
        d3Group.add(topIM);
        d3TopA = topIM;
        applyD3ToteTexture(topIM, true);
    }

    // === 6. B 層頂蓋（tote_top 貼圖）===
    if (bList.length > 0) {
        const topGeo = new THREE.PlaneGeometry(TOTE_W, TOTE_D);
        const topMat = new THREE.MeshLambertMaterial({ color: 0xd4c5a0, transparent: true, opacity: 0.92 });
        const topIM = new THREE.InstancedMesh(topGeo, topMat, bList.length);
        const qDown = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        _d3BTopMats = [];
        for (let i = 0; i < bList.length; i++) {
            vp.set(CX - bList[i].x, LEVEL_B_Y + TOTE_H / 2 + 0.001, bList[i].y - CX);
            m4.compose(vp, qDown, vs);
            topIM.setMatrixAt(i, m4);
            _d3BTopMats.push(m4.clone());
        }
        topIM.instanceMatrix.needsUpdate = true;
        topIM.userData.cat = 'd3TopB';
        d3Group.add(topIM);
        d3TopB = topIM;
        applyD3ToteTexture(topIM, true);
    }

    applyD3Occupancy();   // 依真實佔用資料上色（若資料尚未到，載入後會再上色）
    if (activeFloor === 'L3' && typeof renderSelectionSummary === 'function') renderSelectionSummary();
}

function applyD3ToteTexture(im, isTop) {
    if (!im) return;
    const texName = isTop ? 'toteTopTex' : 'toteSideTex';
    const url = isTop ? 'lib/tote_top.png?v=7' : 'lib/tote_side.png?v=7';
    // 如果 2F 已載入紋理，直接套用
    const existing = (typeof window !== 'undefined') ? window[texName] : undefined;
    const globalTex = isTop ? (typeof toteTopTex !== 'undefined' ? toteTopTex : null) : (typeof toteSideTex !== 'undefined' ? toteSideTex : null);
    if (globalTex) {
        im.material.map = globalTex;
        im.material.needsUpdate = true;
        return;
    }
    // 否則自行載入
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
        if (im && im.parent) {
            im.material.map = tex;
            im.material.needsUpdate = true;
        }
    });
}

// ==================== 3F-D 真實貨物資料（HAI ESS /monitor/location/query，F103）====================
// 分頁抓 3F-D（F103）全部儲位，轉成原 SEMS 形狀（库位编码/占用/容器编码/库位类型/已锁定/异常/异常原因）
async function d3FetchEssRows(codePrefix) {
    const SIZE = D3_API_PAGE, CONC = 6;
    async function getPage(n) {
        try {
            const r = await fetch(D3_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isShelfStorage: true, code: codePrefix, page: n, size: SIZE })
            });
            if (!r.ok) return { total: 0, locations: [] };
            const j = await r.json();
            const dd = (j && j.data) || {};
            return { total: Number(dd.total || 0), locations: Array.isArray(dd.locations) ? dd.locations : [] };
        } catch (e) { return { total: 0, locations: [] }; }
    }
    const first = await getPage(1);
    if (!first.locations.length) throw new Error('ESS empty');
    const pages = Math.max(1, Math.ceil((first.total || first.locations.length) / SIZE));
    let rows = first.locations.slice();
    for (let s = 2; s <= pages; s += CONC) {
        const jobs = [];
        for (let p = s; p < s + CONC && p <= pages; p++) jobs.push(getPage(p));
        const res = await Promise.all(jobs);
        for (let i = 0; i < res.length; i++) if (res[i].locations.length) rows = rows.concat(res[i].locations);
    }
    return rows.map(l => ({
        '库位编码': String(l.code || ''),
        '占用': (l.containerCode && String(l.containerCode).length) ? '是' : '否',
        '容器编码': String(l.containerCode || ''),
        '库位类型': String(l.locationTypeCode || ''),
        '已锁定': l.isLocked ? '是' : '否',
        '异常': l.isAbnormal ? '是' : '否',
        '异常原因': String(l.abnormalReason || '')
    }));
}

async function loadD3SlotData() {
    if (_d3DataLoading) return;
    _d3DataLoading = true;
    try {
        const arr = await d3FetchEssRows(D3_API_CODE);
        if (!arr || arr.length < 100) throw new Error('bad payload');
        const map = new Map();
        for (const r of arr) {
            const code = String(r['库位编码'] || '');
            if (code.indexOf('F103') !== 0) continue;
            map.set(code, {
                occ: String(r['占用'] || '') !== '否',
                container: String(r['容器编码'] || ''),
                type: String(r['库位类型'] || ''),
                locked: String(r['已锁定'] || '') === '是',
                abnormal: String(r['异常'] || '') === '是',
                abnormalReason: String(r['异常原因'] || '')
            });
        }
        d3SlotData = map;
        applyD3Occupancy();
        if (activeFloor === 'L3' && typeof renderSelectionSummary === 'function') renderSelectionSummary();
    } catch (e) { /* 抓不到就保留上次資料 */ }
    _d3DataLoading = false;
}

// 3F-D 統計（供左側摘要）：總儲位 = A 層 + B 層；已使用 = 佔用格數
function d3Summary() {
    const aN = _d3AList ? _d3AList.length : 0;
    const bN = _d3BList ? _d3BList.length : 0;
    let used = 0;
    const cnt = function (L) {
        if (!L || !d3SlotData) return;
        for (let i = 0; i < L.length; i++) { const r = d3SlotData.get(L[i].code); if (r && r.occ) used++; }
    };
    cnt(_d3AList); cnt(_d3BList);
    return { total: aN + bN, used: used, aN: aN, bN: bN };
}

// 點擊 3F-D 儲位 → 產生明細 cell（kind:'D'，供 updateSelectedInfo / openLocModal 用）
function d3CellFor(code) {
    const s = String(code || '');
    const rec = d3SlotData ? d3SlotData.get(s) : null;
    const layer = (s.slice(-1) === 'B') ? 'B' : 'A';
    return {
        location: s,
        kind: 'D',
        layer: layer,
        state: rec ? (rec.occ ? 'used' : 'empty') : 'empty',
        container: rec ? rec.container : '',
        stype: rec ? rec.type : '',
        material: rec ? rec.container : '',
        locked: rec ? rec.locked : false,
        abnormal: rec ? rec.abnormal : false,
        abnormalReason: rec ? rec.abnormalReason : '',
        qty: 0,
        boxes: []
    };
}

// dest 點位（公尺，同 D倉_儲位 座標系）→ 最近儲位（供「正在出庫」判定）
function d3SlotAt(xm, ym, maxDist) {
    const lim = (maxDist == null) ? 0.35 : maxDist;
    let best = null, bd = lim;
    const lists = [_d3AList, _d3BList];
    for (let li = 0; li < lists.length; li++) {
        const L = lists[li]; if (!L) continue;
        for (let i = 0; i < L.length; i++) {
            const s = L[i];
            const d = Math.hypot(s.x - xm, s.y - ym);
            if (d < bd) { bd = d; best = s; }
        }
    }
    return best;   // {code,x,y,layer} 或 null
}

// F103 儲位 → 世界座標（供點擊出庫 chip 定位；d3Group 無旋轉/縮放）
function d3SlotWorld(code) {
    const lists = [_d3AList, _d3BList];
    for (let li = 0; li < lists.length; li++) {
        const L = lists[li]; if (!L) continue;
        for (let i = 0; i < L.length; i++) {
            if (L[i].code === code) {
                return { x: DW_CENTER_X + (17.5 - L[i].x), z: DW_CENTER_Z + (L[i].y - 17.5), layer: L[i].layer };
            }
        }
    }
    return null;
}

// 依真實佔用：沒貨的儲位整格隱藏（空著）；有貨才顯示 tote
function applyD3Occupancy() {
    if (!d3SlotData) return;
    const apply = (im, list, mats) => {
        if (!im || !list || !mats) return;
        for (let i = 0; i < list.length; i++) {
            const rec = d3SlotData.get(list[i].code);
            im.setMatrixAt(i, (rec && rec.occ) ? mats[i] : _d3HideM4);
        }
        im.instanceMatrix.needsUpdate = true;
    };
    apply(d3SlotMeshA, _d3AList, _d3AMats);
    apply(d3SlotMeshB, _d3BList, _d3BMats);
    apply(d3TopA, _d3AList, _d3ATopMats);
    apply(d3TopB, _d3BList, _d3BTopMats);
}
