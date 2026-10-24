// ==================== 3F D 倉（ESS 儲位佈局，F103 數據驅動；非 2F 克隆）— 每倉一個 JS ====================
let d3Group = null;   // D 三樓 group
let d3AgvMesh = null; // AGV 點位 instanced mesh
let d3SlotMeshA = null; // 儲位 1 層 (A)
let d3SlotMeshB = null; // 儲位 2 層 (B)
let d3PostMesh = null;  // 鋼架立柱
let d3BeamMesh = null;  // 鋼架橫樑
let d3TopA = null;      // A 層頂蓋 (tote_top)
let d3TopB = null;      // B 層頂蓋 (tote_top)

const DW3_AGV_URL = 'D 倉_agv.json';
const DW3_SLOT_URL = 'D 倉_儲位.json';
const D3_API = 'http://10.176.33.211:1106/public/index.php/sems/pcba_all';   // F103 = 3F-D 真實貨物/佔用資料
let _d3AgvLoading = false;
let _d3SlotLoading = false;
let _d3DataLoading = false;
let d3SlotData = null;      // Map<code, {occ, container, type, locked, abnormal, abnormalReason}>
let _d3AList = null, _d3BList = null;                  // 供佔用過濾（空位隱藏）對照用
let _d3AMats = null, _d3BMats = null;                  // A/B 層 tote 本體原始矩陣
let _d3ATopMats = null, _d3BTopMats = null;            // A/B 層 tote 頂蓋原始矩陣
const _d3HideM4 = new THREE.Matrix4().makeScale(1e-6, 1e-6, 1e-6);   // 空位：縮到趨近 0（不可見、不可點）
const D3_AGV_X_OFF = 1;   // AGV 停靠點 X 方向偏移（微調避開與儲位重疊；改此值即可）
var D3_CHARGER_TEX_URL = 'lib/charger.png?v=1';   // AI 生成之充電樁貼圖
var _d3ChargerTex = null;
var D3_CHARGE_Y = 1.350;                           // 充電排（公尺）

// === 出庫口區域常數（黑白色 hazard 警示邊框）===
// 根據觀測出庫/停靠點座標（x≈5.48..7.87 m, y≈1.74 m）換算為 local 座標：
// localX = 17.5 - x_m + D3_AGV_X_OFF, localZ = y_m - 17.5
// 得出 local 矩形範圍：x∈[10.0,13.6], z∈[-16.9,-14.5]
const D3_OUT_X0 = 10.0;     // 出庫口區域西側邊界 (local X)
const D3_OUT_X1 = 13.6;     // 出庫口區域東側邊界 (local X)
const D3_OUT_Z0 = -16.9;    // 出庫口區域北側邊界 (local Z)
const D3_OUT_Z1 = -14.5;    // 出庫口區域南側邊界 (local Z)
const D3_OUT_STRIPE = 0.6;  // 警示條紋重複間距（公尺）
const D3_OUT_T = 0.22;      // 邊框條厚度（X/Z 方向）
const D3_OUT_H = 0.03;      // 邊框條高度（Y 方向）

// 出庫口 hazard 警示紋理生成器：64x64 canvas，45° 黑白條紋
function getD3ChargerTex() {
    if (_d3ChargerTex) return _d3ChargerTex;
    _d3ChargerTex = new THREE.TextureLoader().load(D3_CHARGER_TEX_URL);
    if (THREE.SRGBColorSpace !== undefined) _d3ChargerTex.colorSpace = THREE.SRGBColorSpace;
    return _d3ChargerTex;
}

function mkD3HazardTex() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // 45° 黑色條紋（diagonal stripes）
    ctx.fillStyle = '#111111';
    ctx.save();
    ctx.rotate(-Math.PI / 4);
    const stripeWidth = size * 0.5;
    for (let i = -size * 2; i < size * 2; i += stripeWidth * 2) {
        ctx.fillRect(i, -size, stripeWidth, size * 3);
    }
    ctx.restore();
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    if (typeof THREE.SRGBColorSpace !== 'undefined') {
        tex.colorSpace = THREE.SRGBColorSpace;
    }
    return tex;
}

// 建立出庫口警示區域：4 條邊框＋地面標籤「出庫口」
function buildD3OutboundZone() {
    if (!d3Group) return;
    
    const lenX = D3_OUT_X1 - D3_OUT_X0;  // 3.6
    const lenZ = D3_OUT_Z1 - D3_OUT_Z0;  // 2.4
    const centerX = (D3_OUT_X0 + D3_OUT_X1) / 2;
    const centerZ = (D3_OUT_Z0 + D3_OUT_Z1) / 2;
    
    const baseTex = mkD3HazardTex();
    
    // 北邊框 (north edge)
    const northTex = baseTex.clone();
    northTex.repeat.set(lenX / D3_OUT_STRIPE, 1);
    northTex.needsUpdate = true;
    const northGeo = new THREE.BoxGeometry(lenX + D3_OUT_T, D3_OUT_H, D3_OUT_T);
    const northMat = new THREE.MeshLambertMaterial({ map: northTex, transparent: true });
    const northStrip = new THREE.Mesh(northGeo, northMat);
    northStrip.position.set(centerX, 0.02, D3_OUT_Z0);
    northStrip.userData.cat = 'outboundZone';
    d3Group.add(northStrip);
    
    // 南邊框 (south edge)
    const southTex = baseTex.clone();
    southTex.repeat.set(lenX / D3_OUT_STRIPE, 1);
    southTex.needsUpdate = true;
    const southGeo = new THREE.BoxGeometry(lenX + D3_OUT_T, D3_OUT_H, D3_OUT_T);
    const southMat = new THREE.MeshLambertMaterial({ map: southTex, transparent: true });
    const southStrip = new THREE.Mesh(southGeo, southMat);
    southStrip.position.set(centerX, 0.02, D3_OUT_Z1);
    southStrip.userData.cat = 'outboundZone';
    d3Group.add(southStrip);
    
    // 西邊框 (west edge)
    const westTex = baseTex.clone();
    westTex.repeat.set(lenZ / D3_OUT_STRIPE, 1);
    westTex.needsUpdate = true;
    const westGeo = new THREE.BoxGeometry(D3_OUT_T, D3_OUT_H, lenZ + D3_OUT_T);
    const westMat = new THREE.MeshLambertMaterial({ map: westTex, transparent: true });
    const westStrip = new THREE.Mesh(westGeo, westMat);
    westStrip.position.set(D3_OUT_X0, 0.02, centerZ);
    westStrip.userData.cat = 'outboundZone';
    d3Group.add(westStrip);
    
    // 東邊框 (east edge)
    const eastTex = baseTex.clone();
    eastTex.repeat.set(lenZ / D3_OUT_STRIPE, 1);
    eastTex.needsUpdate = true;
    const eastGeo = new THREE.BoxGeometry(D3_OUT_T, D3_OUT_H, lenZ + D3_OUT_T);
    const eastMat = new THREE.MeshLambertMaterial({ map: eastTex, transparent: true });
    const eastStrip = new THREE.Mesh(eastGeo, eastMat);
    eastStrip.position.set(D3_OUT_X1, 0.02, centerZ);
    eastStrip.userData.cat = 'outboundZone';
    d3Group.add(eastStrip);
    
    // 地面標籤「出庫口」
    const labelCanvas = document.createElement('canvas');
    const labelSize = 512;
    labelCanvas.width = labelSize;
    labelCanvas.height = labelSize * 0.33;  // 長寬比約 3:1
    const lctx = labelCanvas.getContext('2d');
    
    // 透明背景
    lctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    
    // 文字：白色粗體＋黑色描邊
    lctx.font = 'bold 200px "Microsoft JhengHei", sans-serif';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    
    // 黑色描邊
    lctx.strokeStyle = '#000000';
    lctx.lineWidth = 12;
    lctx.strokeText('出庫口', labelSize / 2, labelSize * 0.165);
    
    // 白色填充
    lctx.fillStyle = '#ffffff';
    lctx.fillText('出庫口', labelSize / 2, labelSize * 0.165);
    
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    if (typeof THREE.SRGBColorSpace !== 'undefined') {
        labelTex.colorSpace = THREE.SRGBColorSpace;
    }
    const labelGeo = new THREE.PlaneGeometry(2.4, 0.8);
    const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.rotation.x = -Math.PI / 2;
    labelMesh.position.set(centerX, 0.035, centerZ);
    labelMesh.userData.cat = 'outboundZone';
    d3Group.add(labelMesh);
}

function buildFloor3D() {
    if (!floor3Group || d3Group) return;
    d3Group = new THREE.Group();
    d3Group.position.set(DW_CENTER_X, 5, DW_CENTER_Z);
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

    // 出庫口警示區域（hazard 黑白條紋邊框＋地面標籤）
    buildD3OutboundZone();

    loadD3AgvPoints();
    loadD3Slots();
    loadD3SlotData();
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

function buildD3Chargers(chargerPts) {
    if (!d3Group) return;
    var W = 0.5, D = 0.35, H = 1.0;                       // 立面 0.5x1.0 ≈ 貼圖 1:2
    var sideMat = new THREE.MeshLambertMaterial({ map: getD3ChargerTex() });
    var capMat = new THREE.MeshLambertMaterial({ color: 0x2b3138 });
    var baseMat = new THREE.MeshLambertMaterial({ color: 0x1f242a });
    for (var i = 0; i < chargerPts.length; i++) {
        var p = chargerPts[i];
        var lx = 17.5 - p.x + D3_AGV_X_OFF;              // 與 AGV 點位同一局部映射
        var lz = p.y - 17.5;
        var box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D),
            [sideMat, sideMat, capMat, capMat, sideMat, sideMat]);   // 面序 +X,-X,+Y,-Y,+Z,-Z
        box.position.set(lx, H / 2, lz);
        box.userData.cat = 'charger';
        d3Group.add(box);
        var base = new THREE.Mesh(new THREE.BoxGeometry(W + 0.14, 0.08, D + 0.14), baseMat);
        base.position.set(lx, 0.04, lz);
        base.userData.cat = 'charger';
        d3Group.add(base);
    }
}

function buildD3AgvPoints(pts) {
    if (!d3Group) return;
    // 清除舊的
    if (d3AgvMesh) { d3Group.remove(d3AgvMesh); d3AgvMesh.geometry.dispose(); d3AgvMesh.material.dispose(); d3AgvMesh = null; }

    // AGV 點位坐標映射：Excel 用 0~35m，2F grid local 用 -17.6~+17.6 (X) / -30.8~+30.8 (Z)
    // 直接 centering：x_local = agv_x - 17.5, z_local = agv_y - 17.5
    const COUNT = pts.length;
    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85 });
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
    var chargerPts = pts.filter(function (p) { return Math.abs(p.y - D3_CHARGE_Y) < 0.1; });
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

    // === 1. 鋼架立柱（每位置 2 根：左 + 右）===
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

    // === 2. 鋼架橫樑（每位置 2 根：A 層+B 層）===
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

// ==================== 3F-D 真實貨物資料（SEMS pcba_all，F103）====================
async function loadD3SlotData() {
    if (_d3DataLoading) return;
    _d3DataLoading = true;
    try {
        const resp = await fetch(D3_API);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const d = await resp.json();
        const arr = Array.isArray(d) ? d : (d && Array.isArray(d.data) ? d.data : null);
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
    } catch (e) { /* 抓不到就保留上次資料 */ }
    _d3DataLoading = false;
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

// dest 點位（公尺，同 D 倉_儲位 座標系）→ 最近儲位（供「正在出庫」判定）
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
