function normCode(loc) { return String(loc || '').replace(/\s*L\d+$/i, '').replace(/-0+(\d+)\b/g, '-$1').trim().toUpperCase(); }
function pad2(n) { return String(n).padStart(2, '0'); }
let renderer, scene, camera, raycaster, ndc;
let cellMeshes = [];          // 每個儲位 entry
let lastGridData = null;       // 最近一次 loadData 的 entries（供貨架群組 L1~L5 明細）
let propGroup;                 // 靜態物件（平台/走道/鋼架/地標）
let world;                     // 全倉縮放根節點（scale 1.5 = 放大 1.5 倍）
let picked = null;
let hovered = null;
let toteSideTex = null, toteTopTex = null;   // AI 生成周轉箱紋理（lib/tote_side.png / tote_top.png）
let beltTopTex = null, beltLoading = false;    // AI 生成輸送帶帶面紋理（lib/belt_top.png）
let selOutline;
let selBeacon;                  // 選取指示線（垂直高塔）
let beaconBall;
let locMarker = null, locMarkerBall = null, locLabel = null;   // 搜尋定位高亮（掛 scene，不受 world 縮放影響）
let camAnim = null;             // 鏡頭飛行補間 {beg,dur,p0,p1,t0,t1}
let animateClock = new THREE.Clock();
let tooltipTimer = null;

const view3d = document.getElementById('view3d');
const tooltipEl = document.getElementById('cellTooltip');
const compassNeedle = document.getElementById('compassNeedle');

// --- Materials ---
const matEmpty   = new THREE.MeshBasicMaterial({ color: 0x35B835, transparent: true, opacity: 0.35, depthWrite: false });
const matUsed    = new THREE.MeshLambertMaterial({ color: 0x8BA5B5 });
const matSpecial = new THREE.MeshLambertMaterial({ color: 0xB06CF7, emissive: 0xB06CF7, emissiveIntensity: 0.4, transparent: true, opacity: 0.94 });

// 紙箱材質（精緻快遞箱貼圖：牛皮紙立體漸層 + 瓦楞肋 + 摺線/膠帶 + 物流標籤 + 狀態色調）
function makeCartonTexture() {
    const S = 512;
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = S;
    const ctx = cvs.getContext('2d');

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    // 1) 牛皮紙底色（左上亮、右下暗，立體感）
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, '#cda768');
    g.addColorStop(0.5, '#bd935a');
    g.addColorStop(1, '#a37a4a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    // 2) 瓦楞肋紋（垂直凹凸肋）
    for (let x = 0; x < S; x += 6) {
        const j1 = Math.random() * 4 - 2, j2 = Math.random() * 4 - 2;
        ctx.strokeStyle = 'rgba(112,80,44,' + (0.10 + Math.random() * 0.10).toFixed(2) + ')';
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath(); ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + j1, S * 0.33, x + j2, S * 0.66, x, S);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,232,176,' + (0.06 + Math.random() * 0.08).toFixed(2) + ')';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(x + 3, 0);
        ctx.bezierCurveTo(x + 3 + j1, S * 0.33, x + 3 + j2, S * 0.66, x + 3, S);
        ctx.stroke();
    }

    // 3) 紙張纖維雜質
    for (let i = 0; i < 1100; i++) {
        const px = Math.random() * S, py = Math.random() * S;
        ctx.fillStyle = Math.random() < 0.5
            ? 'rgba(96,68,38,' + (Math.random() * 0.12).toFixed(2) + ')'
            : 'rgba(250,222,168,' + (Math.random() * 0.12).toFixed(2) + ')';
        ctx.fillRect(px, py, 1 + Math.random() * 1.6, 1 + Math.random() * 1.6);
    }

    // 4) 紙箱面板邊框（摺線 / 接縫，內縮框 + 亮邊）
    const B = 28;
    ctx.strokeStyle = 'rgba(84,58,32,0.45)';
    ctx.lineWidth = 6;
    ctx.strokeRect(B, B, S - 2 * B, S - 2 * B);
    ctx.strokeStyle = 'rgba(255,236,190,0.28)';
    ctx.lineWidth = 2;
    ctx.strokeRect(B + 5, B + 5, S - 2 * B - 10, S - 2 * B - 10);

    // 5) 中央兩瓣摺線 + 膠帶
    ctx.strokeStyle = 'rgba(84,58,32,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(S / 2 - 16, B + 6); ctx.lineTo(S / 2 - 16, S - B - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S / 2 + 16, B + 6); ctx.lineTo(S / 2 + 16, S - B - 6); ctx.stroke();
    const tape = ctx.createLinearGradient(S / 2 - 38, 0, S / 2 + 38, 0);
    tape.addColorStop(0, 'rgba(222,200,150,0)');
    tape.addColorStop(0.5, 'rgba(232,210,162,0.85)');
    tape.addColorStop(1, 'rgba(222,200,150,0)');
    ctx.fillStyle = tape;
    ctx.fillRect(S / 2 - 38, B, 76, S - 2 * B);
    ctx.fillStyle = 'rgba(160,136,92,0.45)';
    ctx.fillRect(S / 2 - 40, B, 4, S - 2 * B);
    ctx.fillRect(S / 2 + 36, B, 4, S - 2 * B);
    ctx.strokeStyle = 'rgba(255,242,205,0.35)';
    ctx.lineWidth = 1;
    for (let i = B + 10; i < S - B - 6; i += 18) {
        ctx.beginPath(); ctx.moveTo(S / 2 - 32, i); ctx.lineTo(S / 2 + 32, i); ctx.stroke();
    }

    // 6) 物流標籤（白底 + 陰影 + 條碼 + 文字）
    const lx = S * 0.11, ly = S * 0.12, lw = S * 0.34, lh = S * 0.40;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 9;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#f8f4e8';
    roundRect(lx, ly, lw, lh, 8); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#d6cbb0';
    ctx.lineWidth = 2;
    roundRect(lx, ly, lw, lh, 8); ctx.stroke();
    ctx.fillStyle = '#5a5240'; ctx.fillRect(lx + 12, ly + 12, lw - 24, 7);
    ctx.fillStyle = '#a99f86'; ctx.fillRect(lx + 12, ly + 25, lw - 24, 5);
    ctx.fillStyle = '#2c2a26';
    let bx = lx + 12;
    for (let b = 0; b < 26 && bx < lx + lw - 18; b++) {
        const bw = 1 + Math.floor(Math.random() * 3);
        ctx.fillRect(bx, ly + 40, bw, lh * 0.36);
        bx += bw + 1 + Math.random() * 2;
    }
    ctx.fillStyle = '#8e8570';
    for (let li = 0; li < 3; li++) {
        ctx.fillRect(lx + 12, ly + lh - 22 - li * 10, lw * (0.45 + Math.random() * 0.35), 4);
    }

    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
    return tex;
}
const cartonTex = makeCartonTexture();
const matUsedBox    = new THREE.MeshLambertMaterial({ map: cartonTex, color: 0xd6e0e5 });
const matSpecialBox = new THREE.MeshLambertMaterial({ map: cartonTex, color: 0xe6c8ff, emissive: 0xB06CF7, emissiveIntensity: 0.4, transparent: true, opacity: 0.96 });

function baseMatFor(state) {
    if (state === 'special') return matSpecialBox;
    return matUsedBox;
}

const FLOOR_Y = 5;
const FL1_Y = 0;   // 1F ground level: raw-material A/B/C/D shown here                 // 樓層高（場景米）：2L 地板頂、1L 放 BCD 成品倉

function init3D() {
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
        document.getElementById('webglFallback').style.display = 'flex';
        document.getElementById('viewerNote').style.display = 'none';
        return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));   // 效能：解析度上限 1.5x
    renderer.setSize(view3d.clientWidth, view3d.clientHeight);
    renderer.shadowMap.enabled = false;   // 效能：關閉陰影（PCFSoft 很貴，看板不需要）
    view3d.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1e2a);

    // 全倉放大 1.5 倍：包一層 root group，所有物件（含儲位/人/地標）等比縮放
    world = new THREE.Group();
    world.scale.setScalar(1.5);
    scene.add(world);
    world.position.y = FLOOR_Y;          // 2L：現有 A/B/C/D 全抬到 FLOOR_Y，1L 放 BCD 成品倉
    deckGroup = new THREE.Group();       // 2L 樓板（獨立於 world，含各自倉平台）
    scene.add(deckGroup);

    camera = new THREE.PerspectiveCamera(45, view3d.clientWidth / view3d.clientHeight, 0.1, 500);
    // 預設上帝視角；bindGod() 在下方建立控制器並套用初始 framing

    // Lights
    scene.add(new THREE.AmbientLight(0x44566a, 0.75));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(24, 46, 16);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.left = -34;
    dir.shadow.camera.right = 34;
    dir.shadow.camera.top = 34;
    dir.shadow.camera.bottom = -34;
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 160;
    dir.shadow.bias = -0.001;
    scene.add(dir);
    const hemi = new THREE.HemisphereLight(0x9fc4e0, 0x0b1e2a, 0.5);   // 天/地半球光（修復遺失）
    scene.add(hemi);

    // 地面（超大地板 120×120）— 暫移除以符合虛空背景；要還原取消註解（此地板也是陰影接收面）
    // const floor = new THREE.Mesh(
    //     new THREE.PlaneGeometry(120, 120),
    //     new THREE.MeshLambertMaterial({ color: 0x0d2230 })
    // );
    // floor.rotation.x = -Math.PI / 2;
    // floor.position.y = -0.02;
    // floor.receiveShadow = true;
    // scene.add(floor);

    raycaster = new THREE.Raycaster();
    ndc = new THREE.Vector2();

    propGroup = new THREE.Group();
    world.add(propGroup);
    // buildStaticProps(); // 不再用硬編碼 FLOOR_PLAN，等 API 回傳 DB grid 後再建
    buildAxisLabels();
    buildZoneLabel();
    setCatGhost('wall', true);   // 牆壁預設透明
    bindGod();
    initWorkers();
    bindEvents();
    animate();
    return true;
}

// ==================== 員工 / 人行道行人（盤點：持平板、低頭看） ====================
function makeLabelSprite(text, color, scaleW, scaleH) {
    const s = 4;
    const cvs = document.createElement('canvas');
    cvs.width = Math.max(128, text.length * 22) * s; cvs.height = 32 * s;   // 依字數加寬，避免長標題左右被裁
    const ctx = cvs.getContext('2d');
    ctx.font = '600 ' + (17 * s) + 'px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(8,35,52,0.95)'; ctx.lineWidth = 4 * s;
    ctx.strokeText(text, cvs.width / 2, cvs.height / 2);
    ctx.fillStyle = color || '#9dbdd1';
    ctx.fillText(text, cvs.width / 2, cvs.height / 2);
    const tex = new THREE.CanvasTexture(cvs);
    tex.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, depthWrite: false
    }));
    sprite.scale.set(scaleW || 1.8, scaleH || 0.45, 1);
    return sprite;
}

const godTarget = new THREE.Vector3(0, 2.4, 0);
const _gv = new THREE.Vector3(), _gr = new THREE.Vector3(), _gu = new THREE.Vector3(), _gup = new THREE.Vector3(0, 1, 0);
let godTheta = 0.65, godPhi = 1.03, godRadius = 80;
let godDrag = false, godPan = false, godLastX = 0, godLastY = 0;
let godMoveAcc = 0, godDragMoved = false;   // 拖曳距離>6px 視為旋轉，鬆手後 50ms 內不觸發點選
let autoRotate = false;                      // 自動旋轉（點 #btnRotate 切換；拖曳仍可介入，會從當前角度繼續）
let activeWh = 'C';
let f1Group = null, deckGroup = null, raw1Group = null, activeFloor = 'L2';                          // 目前 A/C/D 切倉按鈕的啟動狀態
let fgLabels = [], fgClickTargets = [];   // 成品倉：橫梁名牌（LOD 靠近才出現）＋儲位點擊熱區
// floor3Group/deck3Group/a3-b3-c3-d3Group → 3L倉.js（三樓複本 L3）

// ── 物件唯一 ID（除錯用）────────────────────────────
let __oidSeq = 0;                                     // 全場景物件通用 oid 計數
function assignIds(root) {                            // 掃描：凡缺 userData.oid 者依 cat 補唯一 ID
    (root || scene).traverse(function (o) {
        if (!o.userData || typeof o.userData !== 'object') return;
        if (!o.userData.oid) o.userData.oid = (o.userData.cat || 'obj') + '_' + (++__oidSeq);
    });
}
function __find(oid) {                                // 依 oid 找出物件（無則 null）
    var f = null;
    (scene || f1Group).traverse(function (o) { if (o.userData && o.userData.oid === oid) f = o; });
    return f;
}
function __rm(oid) {                                  // 依 oid 直接從父群組移除（除錯用）
    var o = __find(oid);
    if (o && o.parent) { o.parent.remove(o); return true; }
    return false;
}
window.__sd3d_debug = { assignIds: assignIds, find: __find, rm: __rm };

function bindGod() {
    focusWarehouse('C');   // 網頁預設使用 C 倉視角（離開第一人稱也回到 C 倉）
}
function applyGod() {
    godRadius = Math.max(2, Math.min(300, godRadius));
    const s = Math.sin(godPhi), c = Math.cos(godPhi);
    camera.position.set(
        godTarget.x + godRadius * s * Math.sin(godTheta),
        godTarget.y + godRadius * c,
        godTarget.z + godRadius * s * Math.cos(godTheta)
    );
    camera.lookAt(godTarget);
}
function rotateGod(dx, dy) {
    godTheta -= dx * 0.004;
    godPhi -= dy * 0.004;
    godPhi = Math.max(0.05, Math.min(Math.PI - 0.05, godPhi));
}
function panGod(dx, dy) {
    _gv.copy(camera.position).sub(godTarget).normalize();   // 相機→目標
    _gr.crossVectors(_gv, _gup).normalize();                // 右向量
    _gu.crossVectors(_gr, _gv).normalize();                 // 上向量
    const k = godRadius * 0.001;
    godTarget.addScaledVector(_gr, -dx * k).addScaledVector(_gu, dy * k);
    applyGod();
}

// 一鍵切倉（A / C / D）：fit 演算法把「目標倉整座（含牆高）塞滿取景框」，鄰倉自然出框
function whFitRect(which) {   // 延遲讀取（A/D 中心常數宣告在檔案後段，避免 TDZ）；phi 較低＝少俯視→地面涵蓋小，鄰倉出框
    if (which === 'A') return { cx: A_CENTER_X, cz: A_CENTER_Z, hx: 24, hz: 26, phi: 0.85, ty: 17 };
    if (which === 'B') return { cx: B_CENTER_X, cz: B_CENTER_Z, hx: 19, hz: 15, phi: 0.85, ty: 17 };
    if (which === 'D') return { cx: DW_CENTER_X, cz: DW_CENTER_Z, hx: 15, hz: 15, phi: 0.78, ty: 19 };
    if (which === 'raw') return { cx: -180, cz: 0, hx: 42, hz: 56, phi: 0.78, ty: 14 };   // 1L raw
    if (which === '1') return { cx: 300, cz: 0, hx: 60, hz: 24, phi: 0.72, ty: 14 };
    if (which === '1') return { cx: 300, cz: 0, hx: 60, hz: 24, phi: 0.72, ty: 14 };   // 1L BCD 成品倉
    return { cx: 0, cz: 0, hx: 24, hz: 20, phi: 0.9, ty: 9 };
}
const _fitUp = new THREE.Vector3(0, 1, 0), _fitA = new THREE.Vector3(), _fitB = new THREE.Vector3(), _fitC = new THREE.Vector3();
// 最小 R：讓矩形 8 角落（地面/牆頂）都在視錐內 → 倉體塞滿畫面
function fitRadiusToBounds(cx, cz, hx, hz, theta, phi, ty) {
    const asp = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    const hF = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const tanH = hF * asp, tanV = hF;
    const s = Math.sin(phi), c = Math.cos(phi);
    const pts = [];
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(p => pts.push(p));
    for (let R = 22; R <= 420; R += 1) {
        const ex = cx + R * s * Math.sin(theta), ey = ty + R * c, ez = cz + R * s * Math.cos(theta);
        _fitA.set(cx - ex, ty - ey, cz - ez).normalize();            // fwd
        _fitB.crossVectors(_fitA, _fitUp).normalize();               // rgt
        _fitC.crossVectors(_fitB, _fitA).normalize();                // up
        let ok = true;
        for (const [px, pz] of pts) {
            for (const py of [0, 12]) {                              // 地面與牆頂
                const vx = cx + px * hx - ex, vy = py - ey, vz = cz + pz * hz - ez;
                const f = vx * _fitA.x + vy * _fitA.y + vz * _fitA.z;
                const r = vx * _fitB.x + vy * _fitB.y + vz * _fitB.z;
                const u = vx * _fitC.x + vy * _fitC.y + vz * _fitC.z;
                if (f <= 2 || Math.abs(r) > f * tanH || Math.abs(u) > f * tanV) { ok = false; break; }
            }
            if (!ok) break;
        }
        if (ok) return R;
    }
    return 120;
}
// focusWarehouse / setWhVisible → 2L倉.js（2L ABCD 切倉視角＋顯隱）
function updateWarehouseLabel() {   // 標題「目前倉別」跟隨所選倉/樓層
    const el = document.getElementById('summaryWh'); if (!el) return;
    if (activeFloor === 'L3') {
        const map3 = { A: 'A 倉', B: 'B 倉', C: 'C 倉', D: 'D 倉', ALL: '三樓全景' };
        el.innerHTML = '目前倉別：三樓（' + (map3[activeWh] || 'A/B/C/D') + '）';
        return;
    }
    if (activeFloor === 'L1') {
        const rawOn = document.getElementById('whR').classList.contains('active');
        if (rawOn) el.innerHTML = '目前倉別：原料倉（1F）<small>重型鋼架＋棧板／A-C 欄直接紙箱</small>';
        else el.innerHTML = '目前倉別：成品倉（1F）<small>自動化回型打包流水線</small>';
        return;
    }
    const map = { A: 'A 倉（貨架＋棧板）', B: 'B 倉（棧板＋紙盒）', C: 'C 倉（儲位看板）', D: 'D 倉（SEMS 鋼架庫）', ALL: '全景（四倉一覽）' };
    el.innerHTML = '目前倉別：' + (map[activeWh] || 'C 倉（儲位看板）');
}
function setActiveChip(wh) {
    activeWh = wh;
    if (window.ensureWhLoaded) {   // 延遲載入：切到哪個倉才載入該倉資料（避免開頁全部抓）
        if (wh === 'ALL') window.ensureWhLoaded('ALL'); else window.ensureWhLoaded(wh);
    }
    ['whA', 'whB', 'whC', 'whD', 'whAll'].forEach(function (id) {
        const on = (wh === 'A' && id === 'whA') || (wh === 'B' && id === 'whB') || (wh === 'C' && id === 'whC') ||
                   (wh === 'D' && id === 'whD') || (wh === 'ALL' && id === 'whAll');
        document.getElementById(id).classList.toggle('active', on);
    });
    updateWarehouseLabel();
    renderSelectionSummary();
}
function focusRawMaterials() {   // 1F raw-material: ABCD all four
    godTarget.set(0, 5, 0); godRadius = 215; godTheta = 0.65; godPhi = 0.78; applyGod();
}
function setWhOption(opt) {        // L1 two options: raw = raw-material building / fg = finished goods
    const raw = (opt === 'raw');
    if (window.ensureWhLoaded) window.ensureWhLoaded(raw ? 'RAW' : 'FG');   // 切到該 1F 視圖才載入該倉資料
    if (!raw && window.ensureWhLoaded) window.ensureWhLoaded('AGV');    // 延遲載入：成品倉才載入 AGV 車隊
    if (!raw && typeof loadDockData === 'function') loadDockData();     // 成品倉才拉碼頭卡車狀態
    if (world) world.visible = false;
    if (awnGroup) awnGroup.visible = false;   // A/B/D 為 scene 直掛：1F 一律隱藏
    if (bwnGroup) bwnGroup.visible = false;
    if (dwGroup) dwGroup.visible = false;
    if (raw1Group) raw1Group.visible = raw;
    if (f1Group) f1Group.visible = !raw;
    document.getElementById('whR').classList.toggle('active', raw);
    document.getElementById('whG').classList.toggle('active', !raw);
    if (raw) focusWarehouse('raw'); else focusWarehouse('1');
    updateWarehouseLabel();
    renderSelectionSummary();
}
function setFloor(f) {
    activeFloor = f;
    const onL2 = (f === 'L2');
    if (world) world.visible = onL2;
    if (world) world.position.y = onL2 ? FLOOR_Y : FL1_Y;
    if (deckGroup) deckGroup.visible = onL2;
    if (f1Group) f1Group.visible = false;
    if (raw1Group) raw1Group.visible = false;
    if (floor3Group) floor3Group.visible = (f === 'L3');   // 離開三樓一律隱藏 3F 複本（防殘留顯示）
    if (!onL2) {   // A/B/D 為 scene 直掛：離開 2L 一律隱藏（防與 1F 穿模）
        if (awnGroup) awnGroup.visible = false;
        if (bwnGroup) bwnGroup.visible = false;
        if (dwGroup) dwGroup.visible = false;
    }   // 非 1L 一律隱藏原料倉（避免與 2F A/B/C/D 殘留穿模）
    ['fl1', 'fl2', 'fl3'].forEach(function (id) {
        const on = (id === 'fl1' && f === 'L1') || (id === 'fl2' && f === 'L2') || (id === 'fl3' && f === 'L3');
        document.getElementById(id).classList.toggle('active', on);
    });
    const l1 = (f === 'L1'), l3 = (f === 'L3');
    ['whA', 'whB', 'whC', 'whD', 'whAll'].forEach(function (id) {
        const el = document.getElementById(id); if (el) el.style.display = (l1 || (l3 && id === 'whA')) ? 'none' : '';   // L1 隱藏；L3 不顯示 A（3F 無 A 倉）
    });
    ['whR', 'whG'].forEach(function (id) {
        const el = document.getElementById(id); if (el) el.style.display = (l1 && !l3) ? '' : 'none';
    });
    if (f === 'L1') { setWhOption('raw'); }
    else if (f === 'L2') {
        document.getElementById('whR').classList.remove('active');
        document.getElementById('whG').classList.remove('active');
        let w2 = activeWh; if (w2 === 'raw' || w2 === '1' || w2 === 'fg') w2 = 'C';   // 1F 殘留標記 → 回 C
        setWhVisible(w2);
        setActiveChip(w2);
        focusWarehouse(w2);
    }
    else {   // L3：三樓 A/B/C/D（依 2F 同佈局往上 +5 複製）
        if (world) world.visible = false;
        if (deckGroup) deckGroup.visible = false;
        if (awnGroup) awnGroup.visible = false;
        if (bwnGroup) bwnGroup.visible = false;
        if (dwGroup) dwGroup.visible = false;
        if (f1Group) f1Group.visible = false;
        if (raw1Group) raw1Group.visible = false;
        if (!floor3Group) buildFloor3();
        if (floor3Group) floor3Group.visible = true;
        if (!d3Group) buildFloor3D();   // D 倉可能較晚建立（非同步）→ 補建 3F 複本（邏輯在 3F-D倉.js）
        let w3 = activeWh; if (w3 === 'raw' || w3 === '1' || w3 === 'fg') w3 = 'C';
        setVisibleFloor3(w3);
        setActiveChip(w3);
        focusWarehouse3(w3);
    }
    updateWarehouseLabel();
    renderSelectionSummary();
}

// 3L ABCD（floor3Group/safeClone/buildFloor3/setVisibleFloor3/focusWarehouse3）→ 3L倉.js

// ==================== FIRST-PERSON（V 切換：WASD 移動＋滑鼠拖曳轉視野） ====================
const FPS_CFG = {
    eye: 2.3,        // 眼睛高度（世界單位）
    half: 0.42,      // 玩家碰撞半寬
    speed: 2.8, sprint: 5.8,
    sens: 0.0022,    // 滑鼠靈敏度 rad/px
    gravity: 15, jump: 5.4,
    interactDist: 3.6
};
let fpsMode = false, fpsLocked = false, fpsDrag = false, fpsDragX = 0, fpsDragY = 0;
let fpsPos = { x: 0, z: -6 };
let fpsYaw = 0, fpsPitch = 0, fpsFeet = 0, fpsVy = 0;
const _fpsEuler = new THREE.Euler();   // 重用，避免每幀 new
const _fpsDir = new THREE.Vector3();
const fpsKeys = {};
let fpsColliders = [];     // C 倉內 鋼架/棧板/柱 碰撞 AABB（世界）
let fpsInteractEntry = null, fpsInteractKind = null;
const _handE = new THREE.Euler(), _handQ = new THREE.Quaternion();   // 3D 右手：每幀重算用暫存
const _pv = new THREE.Vector3(), _mirr = new THREE.Vector3(), _mx = new THREE.Matrix4();
const _desQ = new THREE.Quaternion(), _parQ = new THREE.Quaternion(), _worldUpV = new THREE.Vector3(0, 1, 0);   // PDA 面向鏡頭

function buildFpsColliders() {
    // 不設任何物件碰撞：可以自由走進所有儲位/穿過柱子；只保留 applyFpsBounds 的倉界夾
    fpsColliders = [];
}
// ---- 第一人稱右手：3D 五指握拳模型（Minecraft 風、淺膚色貼圖）；?csshand 可退回 CSS 版 ----
let fpsSwing = 0;
let fpsHand3D = null;
let fpsPda = null;        // 手持工業 PDA（掃碼槍）
const FPS_HAND_POS = new THREE.Vector3(0.09, -0.07, -0.50);   // 相機座標＝FOV45° 右下可見處；要字面 (10,0,5) 改這裡
const FPS_HAND_SCALE = 0.6;   // 縮小 3D 手（不超過準星區）
// 手臂對角方向：螢幕左上→右下（相機座標：右+0.5、下-0.6、前+0.6）
const _handDirV = new THREE.Vector3(0.5, -0.14, 0.66);   // 偏水平手臂：PDA 高、不貼底
const _handUpV = new THREE.Vector3(0, 1, 0);
const _swingAx = new THREE.Vector3();
const fpsCSSHandMode = /[?&]csshand/.test(location.search);
const fpsFlipX = /[?&]fliph/.test(location.search);   // 手感左右翻轉（測試用）
const fpsFlipY = /[?&]flipv/.test(location.search);   // 手感上下翻轉（測試用）
function buildFpsHand3D() {
    const G = new THREE.Group();
    G.scale.setScalar(FPS_HAND_SCALE);   // 縮小，避免伸到準星
    // 淺膚色（toon 平滑）：Canvas 暈染＋掌紋暗線
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
    const px = cv.getContext('2d');
    px.fillStyle = '#eec39a'; px.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 480; i++) { px.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.05) + ')'; px.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); }
    const texM = new THREE.CanvasTexture(cv);
    const skinM  = new THREE.MeshLambertMaterial({ map: texM });
    const skinDk = new THREE.MeshLambertMaterial({ map: texM, color: 0xc99b6c });
    const bx = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    // 槍式握把 PDA（握把＋機身）＝子物件，先建模、手再包握把
    fpsPda = buildFpsPda();               // 握把中軸在 (0,0,0) 附近，機身在上
    fpsPda.visible = true;
    G.add(fpsPda);
    // ---- 右手（無袖，手腕直接切斷）：
    // 手腕從畫面右下伸入
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.044, 0.11, 12), skinM);
    wrist.position.set(0.085, -0.115, -0.03); wrist.rotation.z = 0.85; G.add(wrist);
    // 手掌：包在握把左後
    const palm = new THREE.Mesh(bx(0.075, 0.10, 0.06), skinM); palm.position.set(-0.012, -0.03, -0.028); G.add(palm);
    // 四指（食/中/無名/小）從左側貼握把環抱到前方（toon 方塊）
    const fingerBox = (w, h, d, mat) => { const m = new THREE.Mesh(bx(w, h, d), mat); m.castShadow = false; return m; };
    [-0.004, -0.03, -0.056, -0.082].forEach((fy) => {
        const fp = fingerBox(0.03, 0.022, 0.05, skinM);
        fp.position.set(-0.055, fy, 0.012); fp.rotation.z = 0.4; G.add(fp);      // 指節側（間距→可辨握把）
        const tip = fingerBox(0.025, 0.019, 0.042, skinDk);
        tip.position.set(-0.042, fy, 0.036); tip.rotation.z = 0.4; G.add(tip);   // 指尖包到前方
    });
    G.position.set(0, 0, 0);
    G.frustumCulled = false;
    return G;
}

function buildFpsPda() {
    const P = new THREE.Group();
    const bx = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const dark  = new THREE.MeshLambertMaterial({ color: 0x2b2e33 });
    const dark2 = new THREE.MeshLambertMaterial({ color: 0x1a1c20 });
    const scrM  = new THREE.MeshBasicMaterial({ color: 0x58c7ff });
    const redM  = new THREE.MeshBasicMaterial({ color: 0xff5a3c });
    const yelM  = new THREE.MeshLambertMaterial({ color: 0xffd23f });
    // 握把（下方垂直圓柱）
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.15, 12), dark);
    grip.position.set(0, -0.08, 0.01); P.add(grip);
    const yoke = new THREE.Mesh(bx(0.06, 0.03, 0.06), dark2);   // 握把與機身接合
    yoke.position.set(0, -0.005, -0.01); P.add(yoke);
    // 主機身（上半，槍式傾斜平板）
    const body = new THREE.Mesh(bx(0.085, 0.10, 0.05), dark); body.position.set(0, 0.05, -0.008); P.add(body);
    // 螢幕（藍介面，面向玩家 +z）
    const screen = new THREE.Mesh(bx(0.066, 0.048, 0.006), scrM); screen.position.set(0, 0.085, 0.028); P.add(screen);
    // 鍵盤區（中段）：黑數字鍵 2 排
    [0.02, 0.0].forEach(yy => { const kb = new THREE.Mesh(bx(0.05, 0.016, 0.006), dark2); kb.position.set(0, yy, 0.028); P.add(kb); });
    // 黃色大掃描鍵（左）＋黃色功能鍵（中）
    const yk1 = new THREE.Mesh(bx(0.024, 0.014, 0.006), yelM); yk1.position.set(-0.024, 0.002, 0.028); P.add(yk1);
    const yk2 = new THREE.Mesh(bx(0.02, 0.014, 0.006), yelM);  yk2.position.set(0.02, 0.002, 0.028); P.add(yk2);
    // 側邊紅色小按鈕（機身右緣，拇指下）
    const rbtn = new THREE.Mesh(bx(0.012, 0.012, 0.006), redM); rbtn.position.set(0.05, 0.05, 0); P.add(rbtn);
    // 左緣黃飾條
    const stripe = new THREE.Mesh(bx(0.006, 0.075, 0.012), yelM); stripe.position.set(-0.048, 0.045, 0); P.add(stripe);
    // 握把黃色薄環（底部）
    const grBand = new THREE.Mesh(bx(0.052, 0.014, 0.052), yelM); grBand.position.set(0, -0.135, 0.01); P.add(grBand);
    // 頂部掃描頭＋紅光發射窗（條碼/二維碼）
    const head = new THREE.Mesh(bx(0.055, 0.05, 0.052), dark2); head.position.set(0, 0.125, 0.015); P.add(head);
    const laser = new THREE.Mesh(bx(0.02, 0.022, 0.01), redM); laser.position.set(0, 0.125, 0.05); P.add(laser);
    P.userData = { laser: laser, screen: screen };   // 供掃描燈脈動
    return P;
}

function syncFpsHoldTag() {
    let txt = '';
    if (fpsMode && typeof currentScanEntry === 'function') {
        const en = currentScanEntry();
        if (en && en.cell) txt = '掃描 ' + en.cell.location;   // PDA 掃到儲位
    }
    const flo = document.getElementById('fpsHoldFloating');
    if (flo) { flo.style.display = (!fpsCSSHandMode && fpsMode && txt) ? 'block' : 'none'; flo.textContent = txt; }
}
function moveFpsAxis(ax, amt) {
    if (amt === 0) return;
    fpsPos[ax] += amt;
    const half = FPS_CFG.half;
    const box = ax === 'x'
        ? (b) => fpsPos.x + half > b.x0 && fpsPos.x - half < b.x1 && fpsPos.z + half > b.z0 && fpsPos.z - half < b.z1
        : (b) => fpsPos.z + half > b.z0 && fpsPos.z - half < b.z1 && fpsPos.x + half > b.x0 && fpsPos.x - half < b.x1;
    for (const b of fpsColliders) {
        if (!box(b)) continue;
        if (ax === 'x') fpsPos.x = amt > 0 ? b.x0 - half : b.x1 + half;
        else fpsPos.z = amt > 0 ? b.z0 - half : b.z1 + half;
    }
}
function applyFpsBounds() {
    // D 倉：寬鬆邊界（2D 判斷；移動/傳送都有用）
    if (dwGroup && inDWorld(fpsPos.x, fpsPos.z)) {
        fpsPos.x = Math.max(DW_CENTER_X - 59 + FPS_CFG.half, Math.min(DW_CENTER_X + 59 - FPS_CFG.half, fpsPos.x));
        fpsPos.z = Math.max(DW_CENTER_Z - 51, Math.min(DW_CENTER_Z + 51, fpsPos.z));
        fpsFeet = Math.max(FLOOR_Y, fpsFeet);
        return;
    }
    // A 倉：平面圖範圍
    if (awnGroup && inAWorld(fpsPos.x, fpsPos.z)) {
        const hx = (A_C * A_PITCH_X * 1.5) / 2 - 0.6;
        const hz = (A_R * A_PITCH_Z * 1.5) / 2 - 0.6;
        fpsPos.x = Math.max(A_CENTER_X - hx + FPS_CFG.half, Math.min(A_CENTER_X + hx - FPS_CFG.half, fpsPos.x));
        fpsPos.z = Math.max(A_CENTER_Z - hz + FPS_CFG.half, Math.min(A_CENTER_Z + hz - FPS_CFG.half, fpsPos.z));
        fpsFeet = Math.max(FLOOR_Y, fpsFeet);
        return;
    }
    // C 倉：內牆夾；北牆大門開口才可出去
    const hW = ((GRID_COLS) / 2) * PITCH_X * 1.5 - 0.6;
    const hD = ((GRID_ROWS) / 2) * PITCH_Z * 1.5 - 0.6;
    fpsPos.x = Math.max(-hW + FPS_CFG.half, Math.min(hW - FPS_CFG.half, fpsPos.x));
    const inOpening = fpsPos.x > -7.03 - 0.6 && fpsPos.x < -2.03 + 0.6;
    const doorZ = -18;
    if (inOpening) fpsPos.z = Math.max(doorZ, Math.min(hD - FPS_CFG.half, fpsPos.z));
    else fpsPos.z = Math.max(-hD + FPS_CFG.half, Math.min(hD - FPS_CFG.half, fpsPos.z));
}
function updateFps(dt) {
    const hint = document.getElementById('fpsLockHint');
    const cross = document.getElementById('fpsCrosshair');
    if (!fpsMode) return;
    updateFpsScanTarget();
    // 移動：不分鎖定狀態都有效（瀏覽器/iframe 擋 pointer lock 也能走，避免「空氣墻」感）
    const sp = fpsKeys['shift'] ? FPS_CFG.sprint : FPS_CFG.speed;
    let fx = 0, fz = 0;
    if (fpsKeys['w'] || fpsKeys['arrowup']) fz -= 1;
    if (fpsKeys['s'] || fpsKeys['arrowdown']) fz += 1;
    if (fpsKeys['a'] || fpsKeys['arrowleft']) fx -= 1;
    if (fpsKeys['d'] || fpsKeys['arrowright']) fx += 1;
    const sinY = Math.sin(fpsYaw), cosY = Math.cos(fpsYaw);
    const fwdx = -sinY, fwdz = -cosY, rgtx = cosY, rgtz = -sinY;
    let wx = fwdx * (-fz) + rgtx * fx, wz = fwdz * (-fz) + rgtz * fx;
    const ln = Math.hypot(wx, wz);
    if (ln > 0) { wx /= ln; wz /= ln; }
    moveFpsAxis('x', wx * sp * dt); moveFpsAxis('z', wz * sp * dt);
    applyFpsBounds();
    if (fpsKeys[' '] && fpsFeet <= FLOOR_Y + 0.001) fpsVy = FPS_CFG.jump;
    fpsVy -= FPS_CFG.gravity * dt; fpsFeet += fpsVy * dt;
    if (fpsFeet < FLOOR_Y) { fpsFeet = FLOOR_Y; fpsVy = 0; }
    camera.position.set(fpsPos.x, fpsFeet + FPS_CFG.eye, fpsPos.z);
    camera.quaternion.setFromEuler(_fpsEuler.set(fpsPitch, fpsYaw, 0, 'YXZ'));
    updateFpsInteract();
    // 提示/準星依鎖定狀態
    if (fpsLocked) { hint.style.display = 'none'; cross.style.display = 'block'; }
    else { hint.style.display = 'flex'; cross.style.display = 'none'; }
    // 右手：3D 五指模型（預設）／CSS 版（?csshand）；走路甩動＋靜止微起伏
    const mv = !!(fpsKeys['w'] || fpsKeys['s'] || fpsKeys['a'] || fpsKeys['d'] ||
        fpsKeys['arrowup'] || fpsKeys['arrowdown'] || fpsKeys['arrowleft'] || fpsKeys['arrowright']);
    if (mv) fpsSwing += dt * 8; else fpsSwing = 0;
    if (fpsCSSHandMode) {
        const hd = document.getElementById('fpsHand');
        if (hd) {
            const sw = mv ? Math.sin(fpsSwing) * 3.2 : 0;
            const bob = mv ? Math.abs(Math.cos(fpsSwing)) * -3 : -1;
            hd.style.transform = 'rotate(' + (-9 + sw) + 'deg) translateY(' + bob + 'vh)';
            const holdEl = hd.querySelector('.fh-hold');
            const csb = invSlots[invSel];
            if (holdEl) holdEl.classList.toggle('on', !!csb);
        }
        const ht = document.getElementById('fpsHoldTag');
        const cs2 = invSlots[invSel];
        if (ht) ht.textContent = cs2 ? ((cs2.itemnm || cs2.item) + ' ×' + cs2.qty) : '';
    } else if (fpsHand3D) {
        const sw = mv ? Math.sin(fpsSwing) : 0;
        const bob = mv ? Math.abs(Math.cos(fpsSwing)) : 0;
        camera.updateMatrixWorld(true);
        const e = camera.matrixWorld.elements;
        const ox = FPS_HAND_POS.x, oy = (FPS_HAND_POS.y - bob * 0.06), oz = FPS_HAND_POS.z;
        // whole group 以相機基向量定位（right/up/forward）＝手＋PDA 一起動
        fpsHand3D.position.set(
            camera.position.x + e[0] * ox + e[4] * oy + e[8] * oz,
            camera.position.y + e[1] * ox + e[5] * oy + e[9] * oz,
            camera.position.z + e[2] * ox + e[6] * oy + e[10] * oz
        );
        // 整個 group billboard 用鏡像 lookAt：局部 +z 正對鏡頭（PDA 前、手掌指頭後），+y 保持朝上
        _pv.copy(fpsHand3D.position);
        _mirr.copy(_pv).multiplyScalar(2).sub(camera.position);
        _mx.lookAt(_pv, _mirr, _worldUpV);
        fpsHand3D.quaternion.setFromRotationMatrix(_mx);
        fpsHand3D.rotateZ(0.42);   // 整手+PDA 斜持（像參考圖右上→左下握掃描槍），螢幕面仍朝鏡頭
        // 走路甩動：繞相機右軸前後擺（像自然擺臂）
        _swingAx.set(e[0], e[1], e[2]);
        fpsHand3D.rotateOnWorldAxis(_swingAx, sw * 0.1);
        fpsHand3D.visible = true;
        fpsPda.visible = true;   // PDA 是子物件，跟隨手；螢幕面（+z）已朝鏡頭
        // 掃描燈效：準星對到可掃儲位 → 紅雷射脈動＋螢幕閃藍（像真掃描槍）
        if (fpsPda.userData) {
            const scur = (typeof currentScanEntry === 'function') ? currentScanEntry() : null;
            const scOn = !!(scur && scur.cell && cellHasStock(scur.cell));   // 沒貨不閃
            const tt = animateClock ? animateClock.elapsedTime : 0;
            const _L = fpsPda.userData.laser, _Sc = fpsPda.userData.screen;
            const pl = Math.sin(tt * 18);
            if (_L) _L.material.color.setHex(scOn ? (pl > 0 ? 0xff5a3c : 0x9c2f1a) : 0x241209);
            // 螢幕：有貨→顯示該儲位碼二維碼（每碼畫一次）；沒貨→純藍
            if (_Sc) {
                if (scOn) {
                    const code = (scur.cell && (scur.cell.location || scur.cell.code)) || ((scur.cell.row + '_' + scur.cell.col));
                    ensureQrTex();
                    drawQrCode(String(code));
                    if (!_Sc.material.userData || !_Sc.material.userData.qrM) { _Sc.material = _Sc.material.clone(); _Sc.material.userData = { qrM: true }; }
                    _Sc.material.map = _qrTex; _Sc.material.color.setHex(0xffffff); _Sc.material.needsUpdate = true;
                } else if (_Sc.material.map) {
                    _Sc.material.map = null; _Sc.material.color.setHex(0x8fd9ff); _Sc.material.needsUpdate = true;
                }
            }
        }
    }
    syncFpsHoldTag();
}
function findPcMesh(kind) {
    let out = null;
    scene.traverse(o => { if (!out && o.userData && o.userData.interact === kind) out = o; });
    return out;
}
function updateFpsInteract() {
    const pe = document.getElementById('fpsInteract');
    fpsInteractEntry = null; fpsInteractKind = null;
    camera.getWorldDirection(_fpsDir);
    raycaster.set(camera.position, _fpsDir);
    raycaster.far = FPS_CFG.interactDist;
    const targets = [];
    targets.push.apply(targets, raycastMeshes());
    Object.keys(ghostStatic).forEach(k => targets.push.apply(targets, ghostStatic[k]));
    const hits = raycaster.intersectObjects(targets, true);
    if (hits.length) {
        let obj = hits[0].object;
        while (obj) {
            if (obj.userData && obj.userData.interact) { fpsInteractKind = obj.userData.interact; break; }
            obj = obj.parent;
        }
        const cell = hits[0].object.userData ? hits[0].object.userData.entry : null;
        fpsInteractEntry = cell ? cell.entry : null;
        if (fpsInteractKind === 'pcC') pe.textContent = '[ E ] 傳送至 C 倉電腦';
        else if (fpsInteractKind === 'pcD') pe.textContent = '[ E ] 傳送至 D 倉電腦';
        else pe.textContent = '[ E 儲位明細 ]';
        pe.style.display = 'block';
    } else pe.style.display = 'none';
    raycaster.far = Infinity;
}
let fpsFallbackEntry = null;
function cellHasStock(cell) {
    if (!cell) return false;
    if (cell.state) return cell.state === 'used' || cell.state === 'special';   // 空＝empty
    if (typeof cell.qty === 'number') return cell.qty > 0;
    if (cell.boxes && cell.boxes.length) return true;
    return false;
}
// ── 掃描時 PDA 螢幕顯示該儲位碼的偽二維碼（離屏 Canvas；同碼只重畫一次） ──
let _qrCv = null, _qrCx = null, _qrTex = null, _qrSeed = '';
function ensureQrTex() {
    if (_qrCv) return;
    _qrCv = document.createElement('canvas'); _qrCv.width = 256; _qrCv.height = 256;
    _qrCx = _qrCv.getContext('2d');
    _qrTex = new THREE.CanvasTexture(_qrCv);
    _qrTex.magFilter = THREE.NearestFilter; _qrTex.minFilter = THREE.LinearFilter;
}
function _qrHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
function drawQrCode(str) {
    if (str === _qrSeed || !_qrCx) return; _qrSeed = str;
    const N = 25, cell = 7, offX = 256 - N * cell, offY = 256 - N * cell;   // 貼右下角（黑塊右下緣貼邊）
    let h = _qrHash(str);
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967295; };
    const cv = _qrCv, cx = _qrCx;
    cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, 256, 256);
    const finder = (ox, oy) => {   // 左上/右上/左下定位角
        for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
            const b = (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
            cx.fillStyle = b ? '#0b0b0b' : '#ffffff';
            cx.fillRect(offX + (ox + x) * cell, offY + (oy + y) * cell, cell, cell);
        }
    };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const inFP = (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
        if (inFP) continue;
        cx.fillStyle = rnd() > 0.55 ? '#0b0b0b' : '#ffffff';
        cx.fillRect(offX + x * cell, offY + y * cell, cell, cell);
    }
    _qrTex.needsUpdate = true;
}
function currentScanEntry() {
    if (!fpsMode) return null;
    return fpsFallbackEntry || fpsInteractEntry;
}
function updateFpsScanTarget() {   // 每幀：準星前方 5m 投影 → 最近儲位；精準命中有就優先
    fpsFallbackEntry = null;
    if (!fpsMode) return;
    if (fpsInteractEntry) return;
    const D = 5.0;
    camera.getWorldDirection(_fpsDir);
    const px = camera.position.x + _fpsDir.x * D;
    const pz = camera.position.z + _fpsDir.z * D;
    const gc = Math.round((GRID_COLS - 1) / 2 + (px / 1.5) / PITCH_X);
    const gr = Math.round((GRID_ROWS - 1) / 2 + (pz / 1.5) / PITCH_Z);
    if (gr < 0 || gr >= GRID_ROWS || gc < 0 || gc >= GRID_COLS) return;
    let best = null, bd = Infinity;
    for (const e of cellMeshes) {
        if (!e || !e.cell) continue;
        const dx = e.cell.col - gc, dz = e.cell.row - gr;
        const dd = dx * dx + dz * dz;
        if (dd < bd) { bd = dd; best = e; }
    }
    if (best && bd <= 1.21) fpsFallbackEntry = best;   // 半徑約 1.1 格內才算
}
function doFpsInteract() {
    if (fpsInteractKind === 'pcC' || fpsInteractKind === 'pcD') { teleportPc(fpsInteractKind === 'pcD' ? 'C' : 'D'); return; }
    const en = currentScanEntry();
    if (!en || !en.cell) return;
    if (en.cell.kind === 'R' || en.cell.kind === 'P') { hotbarAutoStep(); return; }   // 拾取/放置
    if (en.cell.kind === 'D') { try { selectEntry(en); openLocModal(en.cell); } catch (e) {} return; }
    if (en.cell.kind !== 'C') { try { selectEntry(en); openLocModal(en.cell); } catch (e) {} }
}
function teleportPc(dest) {   // dest：'C'＝傳到 C 倉電腦；'D'＝傳到 D 倉電腦
    try {
        const pc = findPcMesh(dest === 'D' ? 'pcD' : 'pcC');
        if (!pc) return;
        const m = new THREE.Vector3(); pc.getWorldPosition(m);
        if (dest === 'D') { fpsPos.x = m.x + 1.9; fpsPos.z = m.z; fpsYaw = Math.PI / 2; }
        else { fpsPos.x = m.x; fpsPos.z = m.z - 1.9; fpsYaw = Math.PI; }
        fpsPitch = 0;
        applyFpsBounds();
        setWhVisible(dest); setActiveChip(dest);   // 傳送後切到目標倉（顯示＋chip）
        camera.position.set(fpsPos.x, fpsFeet + FPS_CFG.eye, fpsPos.z);
        camera.quaternion.setFromEuler(_fpsEuler.set(fpsPitch, fpsYaw, 0, 'YXZ'));
    } catch (err) { /* 忽略 */ }
}
// 出生點：指定的儲位碼旁的馬路（每次進入第一人稱都在這裡重生、面向該儲位）
let fpsSpawnLoc = '2FCA9-16';
function getFpsSpawn() {
    if (!fpsSpawnLoc) return null;
    const e = cellMeshes.find(x => x && x.cell && String(x.cell.location) === fpsSpawnLoc);
    if (!e || !e.cell) return null;
    const cr = e.cell.row, cc = e.cell.col;
    const gp = gridPos(cr, cc);
    const cx = gp.x * 1.5, cz = gp.z * 1.5;
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let bd = Infinity, best = null;
    for (const [dr, dc] of dirs) {
        const r = cr + dr, c = cc + dc;
        if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
        const k = (FLOOR_PLAN[r] && FLOOR_PLAN[r][c]) || '';
        const isRoad = (k === 'W' || k === '.');
        const p2 = gridPos(r, c);
        const wx = p2.x * 1.5, wz = p2.z * 1.5;
        const d = (wx - cx) * (wx - cx) + (wz - cz) * (wz - cz);
        const score = d - (isRoad ? 1e9 : 0);   // 優先馬路(W)/開放(.)
        if (score < bd) { bd = score; best = { wx: wx, wz: wz }; }
    }
    const sx = best ? best.wx : cx, sz = best ? best.wz : cz;
    // 面向該儲位（yaw：forward=(-sinY,-cosY) 指向目標）
    const dx = cx - sx, dz = cz - sz;
    const yaw = Math.atan2(-dx, -dz);
    return { x: sx, z: sz, yaw: yaw, row: cr, col: cc };
}
function enterFps() {   // 切到第一人稱（V / 按鈕）
    if (fpsMode) return;
    if (activeFloor !== 'L2') setFloor('L2');   // 第一人稱在看 2L A/B/C/D
    fpsMode = true;
    fpsPos.x = camera.position.x; fpsPos.z = camera.position.z;      // 水平位置承襲上帝相機
    fpsFeet = FLOOR_Y;                                                  // 站在 2L 樓板（避免高空繼承）
    fpsVy = 0;
    _fpsDir.set(0, 0, -1).applyQuaternion(camera.quaternion);         // 承襲目前朝向
    fpsYaw = Math.atan2(-_fpsDir.x, -_fpsDir.z);
    fpsPitch = Math.max(-0.7, Math.min(0.7, Math.asin(Math.max(-1, Math.min(1, _fpsDir.y)))));   // 起始俯角限 ±0.7，別一進去就看地板
    const _sp = getFpsSpawn();                     // 出生點：站在儲位旁的馬路上、面向儲位
    if (_sp) { fpsPos.x = _sp.x; fpsPos.z = _sp.z; fpsYaw = _sp.yaw; fpsPitch = 0; fpsFeet = FLOOR_Y; }
    applyFpsBounds();
    document.getElementById('fpsLockHint').style.display = 'flex';
    document.getElementById('fpsCrosshair').style.display = 'none';
    document.getElementById('invHotbar').classList.add('show');
    renderInv();
    if (fpsCSSHandMode) document.getElementById('fpsHand').classList.add('on');
    if (fpsHand3D && !fpsCSSHandMode) { fpsHand3D.visible = true; if (fpsPda) fpsPda.visible = true; }
    console.info('[FPS-HAND] 右手：' + (fpsCSSHandMode ? 'CSS fallback（?csshand）' : '3D 五指握拳模型'));
    syncFpsChip();
    try { renderer.domElement.requestPointerLock(); } catch (err) { /* 拖曳轉視野 fallback */ }
    camera.position.set(fpsPos.x, fpsFeet + FPS_CFG.eye, fpsPos.z);
    camera.quaternion.setFromEuler(_fpsEuler.set(fpsPitch, fpsYaw, 0, 'YXZ'));
}
function leaveFps() {   // 切回上帝視角（V / 按鈕 / Esc）
    if (!fpsMode) return;
    fpsMode = false;
    document.exitPointerLock && document.exitPointerLock();
    document.getElementById('fpsLockHint').style.display = 'none';
    document.getElementById('fpsCrosshair').style.display = 'none';
    document.getElementById('fpsInteract').style.display = 'none';
    document.getElementById('invHotbar').classList.remove('show');
    document.getElementById('invToast').style.display = 'none';
    document.getElementById('fpsHand').classList.remove('on');
    if (fpsHand3D) fpsHand3D.visible = false;
    if (fpsPda) fpsPda.visible = false;
    var _flo = document.getElementById('fpsHoldFloating'); if (_flo) _flo.style.display = 'none';
    syncFpsChip();
    bindGod();
}
function syncFpsChip() {
    const el = document.getElementById('btnFps');
    if (!el) return;
    el.textContent = fpsMode ? '上帝全景' : '第一人稱';
    el.classList.toggle('active', !fpsMode);
}
// ---- 第一人稱 9 格物品欄（本地模擬：拾取/放置 → 只改 overlay，不動資料庫） ----
let invSlots = Array(9).fill(null);
let invSel = 0;
let invToastTimer = null;
let _actx = null;
function beep(ok) {
    try {
        if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
        const o = _actx.createOscillator(), g = _actx.createGain();
        o.connect(g); g.connect(_actx.destination);
        o.frequency.value = ok ? 880 : 220; o.type = 'square';
        g.gain.setValueAtTime(0.0001, _actx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.08, _actx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, _actx.currentTime + 0.18);
        o.start(); o.stop(_actx.currentTime + 0.2);
    } catch (err) { /* 忽略 */ }
}
function renderInv() {
    const el = document.getElementById('invHotbar');
    if (!el) return;
    el.innerHTML = invSlots.map((s, i) => {
        const key = (i + 1) % 10;
        const sel = i === invSel ? ' sel' : '';
        if (!s) {
            return '<div class="inv-slot' + sel + '" data-i="' + i + '" title="空格 ' + key + '">' +
                '<div class="inv-empty">▢</div><span class="inv-key">' + key + '</span></div>';
        }
        return '<div class="inv-slot' + sel + '" data-i="' + i + '" title="' + esc(s.item) + ' ×' + s.qty + (s.itemnm ? ' · ' + esc(s.itemnm) : '') + '">' +
            '<div class="inv-ic"><div class="inv-box"></div></div>' +
            '<span class="inv-qty">' + s.qty + '</span><span class="inv-key">' + key + '</span></div>';
    }).join('');
    el.querySelectorAll('.inv-slot').forEach(sl => {
        sl.addEventListener('click', () => { invSel = parseInt(sl.dataset.i, 10); renderInv(); });
    });
}
function invToast(msg, ok) {
    const t = document.getElementById('invToast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'inv-toast' + (ok ? '' : ' err');
    t.style.display = 'block';
    clearTimeout(invToastTimer);
    invToastTimer = setTimeout(() => { t.style.display = 'none'; }, 1400);
}
function localPlaceBox(cell, box) {
    if (!cell || !cell.location) return false;
    simOverlay.set(cell.location, {
        state: 'used', item: box.item, itemnm: box.itemnm,
        material: box.item + (box.itemnm ? ' ' + box.itemnm : ''),
        qty: box.qty, box_count: 1,
        boxes: [{ box_no: box.boxNo, item: box.item, itemnm: box.itemnm, qty: box.qty, date_code: '', in_time: '' }]
    });
    return true;
}
function localPickBox(cell, boxNo, qty) {
    if (!cell || !cell.location) return null;
    const eff = effectiveEntries().find(x => x.location === cell.location);
    if (!eff || eff.state === 'empty' || !eff.boxes || !eff.boxes.length) return null;
    const boxes = eff.boxes.slice();
    let idx = -1;
    for (let i = 0; i < boxes.length; i++) { if (boxNo ? (boxes[i].box_no === boxNo) : true) { idx = i; break; } }
    if (idx < 0) return null;
    let take;
    if (boxNo) {
        const b = boxes[idx];
        const takeQ = (qty > 0) ? Math.min(qty, b.qty) : b.qty;
        take = { box_no: b.box_no, item: b.item, itemnm: b.itemnm, qty: takeQ };
        const remain = b.qty - takeQ;
        if (remain <= 0) boxes.splice(idx, 1); else boxes[idx] = Object.assign({}, b, { qty: remain });
    } else {
        const b = boxes[idx];
        take = { box_no: b.box_no, item: b.item, itemnm: b.itemnm, qty: b.qty };
        boxes.splice(idx, 1);
    }
    const cnt = boxes.length;
    const total = boxes.reduce((acc, x) => acc + x.qty, 0);
    if (cnt === 0) {
        simOverlay.set(eff.location, { state: 'empty', item: '', itemnm: '', material: '', qty: 0, box_count: 0, boxes: [] });
    } else {
        const f = boxes[0];
        simOverlay.set(eff.location, { state: 'used', item: f.item, itemnm: f.itemnm, material: f.item + (f.itemnm ? ' ' + f.itemnm : ''), qty: total, box_count: cnt, boxes: boxes });
    }
    return { take: take, remainCount: cnt, eff: eff };
}
function stripVisibleBox(location, n) {
    const e = cellMeshes.find(x => x.cell && x.cell.location === location);
    if (!e) return;
    for (let i = 0; i < n && e.boxes.length; i++) {
        const b = e.boxes.pop();
        if (b.parent) b.parent.remove(b);
        const gi = ghostDyn.box.indexOf(b);
        if (gi >= 0) ghostDyn.box.splice(gi, 1);
    }
}
function hotbarTake(cell) {
    const r = localPickBox(cell, null, 0);
    if (!r) { invToast('此格無箱子可拾取', false); beep(false); return; }
    const take = r.take;
    const cur = invSlots[invSel];
    if (cur && cur.item.toUpperCase() !== take.item.toUpperCase()) {
        invToast('此格已有「' + cur.item + '」，請滾輪換格', false); beep(false); return;
    }
    if (cur) invSlots[invSel] = Object.assign({}, cur, { qty: cur.qty + take.qty });
    else invSlots[invSel] = { item: take.item, itemnm: take.itemnm, qty: take.qty, boxNo: take.box_no };
    invToast('✓ 已拾取 ' + take.item + ' ×' + take.qty, true); beep(true);
    stripVisibleBox(cell.location, 1);
    renderInv();
    loadData(true);
}
function hotbarPlace(cell) {
    const s = invSlots[invSel];
    if (!s) { invToast('空手：請先按 E 拾取箱子', false); beep(false); return; }
    if (cell.state !== 'empty') { invToast('此格已有物品，先按 E 拾取', false); beep(false); return; }
    const box = { item: s.item, itemnm: s.itemnm, qty: s.qty, boxNo: s.boxNo || ('SIM' + Date.now().toString(36).toUpperCase()) };
    if (!localPlaceBox(cell, box)) { invToast('放置失敗', false); beep(false); return; }
    invSlots[invSel] = null;
    invToast('✓ 已放置 ' + box.item + ' ×' + box.qty + ' → ' + cell.location, true); beep(true);
    renderInv();
    loadData(true);
}
function hotbarAutoStep() {
    const en = currentScanEntry();
    if (!en || !en.cell) return;
    if (en.cell.kind === 'R' || en.cell.kind === 'P') {
        if (en.cell.state === 'empty') hotbarPlace(en.cell);
        else hotbarTake(en.cell);
    }
}


// ==================== INTERACTION ====================
// ---- 穿透設定（分類/單個透明） ----
const GHOST_CATS = { wall:'牆壁', rack:'鋼架', pillar:'柱子', road:'走道/馬路', pallet:'棧板', box:'箱子', door:'大門', sign:'廣告牌', tv:'電視' };
const ghostStatic = { wall:[], rack:[], pillar:[], road:[], pallet:[], box:[], door:[], sign:[], tv:[] };
const ghostDyn = { rack:[], pallet:[], box:[] };
const catOn = {};
let ghostMode = false;      // 穿透設定模式
let ghostSel = null;        // { obj, cat }

function forEachObj(obj, fn) {
    if (obj && obj.isMesh) { fn(obj); }
    else if (obj && obj.children) { for (let i = 0; i < obj.children.length; i++) forEachObj(obj.children[i], fn); }
}
function ghostIsOn(obj) {
    let on = false;
    forEachObj(obj, m => { if (m.userData.__ghost && m.material === m.userData.__ghost) on = true; });
    return on;
}
function setGhost(obj, on) {
    forEachObj(obj, m => {
        if (on) {
            if (!m.userData.__orig) m.userData.__orig = m.material;
            if (!m.userData.__ghost) {
                const c = m.userData.__orig.clone();
                c.transparent = true; c.opacity = 0.5; c.depthWrite = false;
                m.userData.__ghost = c;
            }
            m.material = m.userData.__ghost;
        } else if (m.userData.__orig) {
            m.material = m.userData.__orig;
        }
    });
}
function setCatGhost(cat, on) {
    (ghostStatic[cat] || []).forEach(o => setGhost(o, on));
    (ghostDyn[cat] || []).forEach(o => setGhost(o, on));
    catOn[cat] = on;
}
function clearAllGhost() {
    Object.keys(ghostStatic).forEach(c => setCatGhost(c, false));
    Object.keys(ghostDyn).forEach(c => setCatGhost(c, false));
    updateGhostState();
}
function ghostPick(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const targets = [];
    Object.keys(ghostStatic).forEach(k => targets.push.apply(targets, ghostStatic[k]));
    Object.keys(ghostDyn).forEach(k => targets.push.apply(targets, ghostDyn[k]));
    targets.push.apply(targets, raycastMeshes());
    const hits = raycaster.intersectObjects(targets, true);
    if (!hits.length) return null;
    let obj = hits[0].object;
    while (obj && !obj.userData.cat) obj = obj.parent;
    return obj;
}
function showGhostMenu(obj, x, y) {
    ghostSel = { obj: obj, cat: obj.userData.cat };
    document.getElementById('ghostTitle').textContent = (GHOST_CATS[ghostSel.cat] || ghostSel.cat) + '（穿透設定）';
    const menu = document.getElementById('ghostMenu');
    menu.style.left = (x + 10) + 'px';
    menu.style.top = (y - 8) + 'px';
    menu.style.display = 'block';
    updateGhostState();
}
function hideGhostMenu() { document.getElementById('ghostMenu').style.display = 'none'; }
function updateGhostState() {
    if (!ghostSel) return;
    const on = !!catOn[ghostSel.cat];
    const o = ghostIsOn(ghostSel.obj);
    document.getElementById('ghostState').textContent =
        '此物件：' + (o ? '透明' : '正常') + '　／　整類：' + (on ? '透明' : '正常');
}

let _meshesKey = null;
const _rayCache = [];
const _rayVis = [];   // 依可見性過濾後的重用陣列（避免每次 raycast 重新配置）
function _ancestorVisible(o) {   // 任一祖先 visible=false → 不可點（避免點到隱藏樓層）
    let n = o;
    while (n) { if (n.visible === false) return false; n = n.parent; }
    return true;
}
function raycastMeshes() {
    // 以首個 mesh 物件參照當 key：資料重建後自動失效重抓
    const k = (cellMeshes[0] && cellMeshes[0].boxes[0]) + '|' + (dwSlots && dwSlots[0]) + '|' + (dwSlots && dwSlots.length)
        + '|' + (typeof d3Slots !== 'undefined' && d3Slots[0]) + '|' + (typeof d3Slots !== 'undefined' && d3Slots.length);
    if (k !== _meshesKey) {
        _meshesKey = k;
        _rayCache.length = 0;
        cellMeshes.forEach(e => {
            _rayCache.push.apply(_rayCache, e.boxes);
            _rayCache.push.apply(_rayCache, e.pallet);
            if (e.proxy && e.proxy.length) _rayCache.push.apply(_rayCache, e.proxy);
            if (e.footer) _rayCache.push(e.footer);
        });
        if (dwSlots && dwSlots.length) _rayCache.push.apply(_rayCache, dwSlots);   // D 倉鋼架儲位
        if (typeof d3Slots !== 'undefined' && d3Slots.length) _rayCache.push.apply(_rayCache, d3Slots);   // 3F D 倉儲位 (F103)
    }
    // 樓層可見性過濾：隱藏樓層的 mesh（如 3F 視圖下的 2F 儲位）不可被點到
    _rayVis.length = 0;
    for (let i = 0; i < _rayCache.length; i++) {
        if (_ancestorVisible(_rayCache[i])) _rayVis.push(_rayCache[i]);
    }
    return _rayVis;
}

function restoreEntry(e) {
    if (!e) return;
    if (e.cell && e.cell.kind === 'D') {                 // D 倉：還原原占用色
        if (e.baseMat) e.boxes.forEach(b => b.material = e.baseMat);
        return;
    }
    e.boxes.forEach(b => b.material = e.restMat || baseMatFor(e.cell.state));
    if (e.footer) e.footer.material = matEmpty;
    if (e.cell.state === 'empty') e.pallet.forEach(m => { m.material = e.woodMat; });
}

function setStackMat(e, mat) {
    if (!e) return;
    if (e.cell && e.cell.kind === 'D') return;   // D 倉黑箱：hover/選取不換材質（避免現形紙箱貼圖）
    e.boxes.forEach(b => b.material = mat);
    if (e.footer) e.footer.material = mat;
    if (e.cell.state === 'empty') e.pallet.forEach(m => { m.material = mat; });
}

let _lastHoverT = 0;
function onPointerMove(e) {
    const now = performance.now();
    if (now - _lastHoverT < 33) return;   // hover 節流 ≈30Hz（省 raycast）
    _lastHoverT = now;
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    renderer.domElement.style.cursor = 'grab';
    const hits = raycaster.intersectObjects(raycastMeshes(), false);
    const hit = hits.length > 0 ? hits[0] : null;

    if (hovered) { if (hovered !== picked) restoreEntry(hovered); hovered = null; }
    if (hit) {
        const entry = hit.object.userData && hit.object.userData.entry;
        if (entry) {
            hovered = entry;
            if (entry !== picked) setStackMat(entry, hoverMatFor(entry.cell.state));
            if (fpsMode && typeof fpsMode === 'boolean' && fpsMode) {
                const rr = renderer.domElement.getBoundingClientRect();   // 第一人稱：貼準星（螢幕中心）顯示，不掉角落
                showTooltip(rr.left + rr.width / 2, rr.top + rr.height / 2, entry.cell);
            } else {
                showTooltip(e.clientX, e.clientY, entry.cell);
            }
            renderer.domElement.style.cursor = 'pointer';
        } else { hideTooltip(); }
    } else { hideTooltip(); }
}

function hoverMatFor(state) {
    if (state === 'empty') return new THREE.MeshBasicMaterial({ color: 0x7dff7d, transparent: true, opacity: 0.75, depthWrite: false });
    if (state === 'special') return new THREE.MeshLambertMaterial({ map: cartonTex, color: 0xf0dcff, emissive: 0xB06CF7, emissiveIntensity: 0.55, transparent: true, opacity: 0.97 });
    return new THREE.MeshLambertMaterial({ map: cartonTex, color: 0xf2f7fa, emissive: 0xffffff, emissiveIntensity: 0.15 });
}

function onClick(e) {
    if (godDragMoved) return;   // 上帝拖曳旋轉後鬆手，不誤選格子
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);

    // 除錯模式：把點擊位置的世界座標（打在 y=0 地面平面）印到 console
    if (debugPick) {
        // 新增：依點擊射線列出命中物件（oid/cat/geo/color/code），方便「座標→精準刪除」
        try {
            const _hits = raycaster.intersectObjects(raycastMeshes(), false);
            if (_hits.length) {
                const _o = _hits[0].object, _g = _o.geometry, _u = _o.userData || {};
                const _gd = (_g && _g.parameters) ?
                    [Math.round((_g.parameters.width || 0) * 100) / 100, Math.round((_g.parameters.height || 0) * 100) / 100, Math.round((_g.parameters.depth || 0) * 100) / 100].join('x') :
                    (_g ? _g.type : '');
                const _col = (_o.material && _o.material.color) ? '#' + _o.material.color.getHexString().toUpperCase() : '';
                console.log('[DBG] HIT oid=' + (_u.oid || '(no-oid)') + ' cat=' + (_u.cat || '') +
                    ' geo=' + _gd + ' color=' + _col + ' code=' + (_u.code || '') +
                    ' parent=' + ((_o.parent && _o.parent.userData && _o.parent.userData.oid) || (_o.parent ? _o.parent.type : '')) +
                    ' totalHits=' + _hits.length);
            } else { console.log('[DBG] HIT none'); }
        } catch (e) { console.log('[DBG] pick err: ' + (e && e.message)); }
        const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const pt = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(ground, pt)) {
            // 依所在倉別換算：A 倉（平面圖）優先 → D 倉 → C 倉；用各自群組逆變換對到格線
            const inA = inAWorld(pt.x, pt.z);
            const inD = inDWorld(pt.x, pt.z) && dwData && dwGroup;
            const inRaw = !!(raw1Group && raw1Group.visible && pt.x > RAW1_CX - 23 && pt.x < RAW1_CX + 30 && pt.z > -56 && pt.z < 100);
            const inFg = !!(f1Group && f1Group.visible) &&
                Math.abs(pt.x - f1Group.position.x) <= ((BCD_GRID[0].length - 1) / 2) * 2.9 &&
                Math.abs(pt.z - f1Group.position.z) <= ((BCD_GRID.length - 1) / 2) * 1.4;
            let gr, gc, kind = '';
            if (inRaw && (typeof RAW1_SLOTS === 'undefined' || !RAW1_SLOTS.length)) {
                kind = '  原料倉';
            } else if (inRaw) {
                const lx = pt.x - RAW1_CX, lz = pt.z;
                let bd = 1e9, bi = -1;
                for (let qi = 0; qi < RAW1_SLOTS.length; qi++) {
                    if (RAW1_SLOTS[qi][0] >= 12) continue;   // A-C 欄暫移除
                    const slc = RAW1_SLOTS[qi], fi = slc[0], c = slc[1], rr = slc[3];
                    let sx, sz;
                    if (fi < 12) { sx = (c - 13.5) * 1.5; sz = fi * 6.0 - 50; }
                    else { const nm = ['Q','S','R'][fi - 12]; const rs = RAW1_STRIP[nm]; sx = [30,36,42][fi - 12] + (c - 1) * 1.5; sz = (rr - rs.rFirst) * 1.3 - 50; }
                    const dx = sx - lx, dz = sz - lz, d = dx * dx + dz * dz;
                    if (d < bd) { bd = d; bi = qi; }
                }
                const slc = RAW1_SLOTS[bi], fi = slc[0];
                const nLl = fi < 12 ? RAW1_MAIN[fi][3] : RAW1_STRIP[['Q','S','R'][fi - 12]].lvl;
                kind = '  原料倉[' + RAW1_CODES[slc[4]] + '] 層' + slc[2] + '/' + nLl + ' 距=' + Math.sqrt(bd).toFixed(1);
                gr = slc[3]; gc = slc[1];
            } else if (inA) {
                const S = awnGroup.scale ? awnGroup.scale.x : 1.5;
                const lx = (pt.x - A_CENTER_X) / S, lz = (pt.z - A_CENTER_Z) / S;
                gc = Math.round((A_C - 1) / 2 + lx / A_PITCH_X);
                gr = Math.round((A_R - 1) / 2 + lz / A_PITCH_Z);
                kind = (gr < 0 || gr >= A_R || gc < 0 || gc >= A_C)
                    ? '  (A倉之外)'
                    : '  A倉[' + ((A_GRID[gr] && A_GRID[gr][gc]) || ' ') + '] ' + (A_LABEL_MAP[gr + '_' + gc] || '');
            } else if (inD) {
                const S = dwGroup.scale ? dwGroup.scale.x : 1.5;
                const lx = (pt.z - DW_CENTER_Z) / S;      // 局部（旋轉 -90° 逆變換）
                const lz = (-(pt.x - DW_CENTER_X)) / S;
                gc = Math.round((DW_COLS - 1) / 2 + lx / DW_PITCH_X);
                gr = Math.round((DW_ROWS - 1) / 2 + lz / DW_PITCH_Z);
                kind = (gr < 0 || gr >= DW_ROWS || gc < 0 || gc >= DW_COLS)
                    ? '  (D倉之外)'
                    : '  D倉 kind=' + DW_GRID[gr][gc];
            } else if (inFg) {
                const lx = pt.x - f1Group.position.x, lz = pt.z - f1Group.position.z;
                gc = Math.round((BCD_GRID[0].length - 1) / 2 + lx / 2.9);
                gr = Math.round((BCD_GRID.length - 1) / 2 + lz / 1.4);
                kind = (gr < 0 || gr >= BCD_GRID.length || gc < 0 || gc >= BCD_GRID[0].length)
                    ? '  (成品倉之外)'
                    : '  成品倉[' + (BCD_GRID[gr][gc] === ' ' ? '空' : BCD_GRID[gr][gc]) + '] r=' + gr + ' c=' + gc;
            } else {
                gc = Math.round((GRID_COLS - 1) / 2 + pt.x / PITCH_X);
                gr = Math.round((GRID_ROWS - 1) / 2 + pt.z / PITCH_Z);
                kind = (gr < 0 || gr >= GRID_ROWS || gc < 0 || gc >= GRID_COLS)
                    ? '  (C倉之外)'
                    : '  kind=' + FLOOR_PLAN[gr][gc];
            }
            console.log(
                '%c[DEBUG] x=' + pt.x.toFixed(2) + '  z=' + pt.z.toFixed(2) + '  y=' + pt.y.toFixed(2) +
                '   ⇒  列r=' + gr + ' 欄c=' + gc + kind,
                'color:#ffd866;font-weight:bold'
            );
        } else {
            console.log('%c[DEBUG] 點在鏡頭外/無交點', 'color:#ff9b9b');
        }
        return; // 除錯模式下不觸發選取
    }

    // 穿透設定模式：點擊物件 → 彈出分類/單個透明選單
    if (ghostMode) {
        hideGhostMenu();
        const obj = ghostPick(e);
        if (obj && obj.userData.cat) showGhostMenu(obj, e.clientX, e.clientY);
        return;
    }

    let hits = raycaster.intersectObjects(raycastMeshes(), false);
    let hit = hits.length > 0 ? hits[0] : null;
    if (!hit && f1Group && f1Group.visible && fgClickTargets && fgClickTargets.length) {
        const fh = raycaster.intersectObjects(fgClickTargets, false);   // 成品倉儲位點擊熱區（透明盒）
        if (fh.length) hit = fh[0];
    }
    if (!hit && typeof raw1Group !== 'undefined' && raw1Group && raw1Group.visible && typeof raw1ClickTargets !== 'undefined' && raw1ClickTargets && raw1ClickTargets.length) {
        const rh = raycaster.intersectObjects(raw1ClickTargets, false);   // 原料倉儲位點擊熱區（透明盒）
        if (rh.length) hit = rh[0];
    }
    const u = hit && hit.object.userData ? hit.object.userData : null;
    if (u && u.fgbay) {
        openFgBay(u);   // 成品倉儲位：展開明細
    } else if (u && u.raw1slot) {
        updateSelectedInfo({ location: u.raw1slot.code, state: 'info', note: '原料倉儲位' });
        openRaw1Slot(u.raw1slot);
    } else if (u && u.entry) {
        selectEntry(u.entry);
        openLocModal(u.entry.cell);   // 點擊即展開儲位明細表格
    } else if (u && u.cat === 'agvPoint') {
        // 3F D倉 AGV 停靠點：顯示該點座標 + 區域
        let agvId = 'AGV點';
        if (u.pointCodes && hit.instanceId !== undefined) {
            const code = u.pointCodes[hit.instanceId];
            const m = code && code.match(/POINT:(-?\d+):(-?\d+)/);
            agvId = m ? ('AGV點 (' + m[1] + ', ' + m[2] + ')') : code;
        }
        updateSelectedInfo({ location: agvId, kind: 'AGV', state: 'point' });
    } else if (u && u.slotCodes && hit.instanceId !== undefined) {
        // 3F D倉 ESS 儲位 (F103)
        const f3code = u.slotCodes[hit.instanceId];
        const f3cell = (typeof d3CellFor === 'function') ? d3CellFor(f3code)
            : { location: f3code, kind: 'D', state: 'info' };
        updateSelectedInfo(f3cell);
        if (typeof openLocModal === 'function') openLocModal(f3cell);
    } else {
        if (picked) { restoreEntry(picked); picked = null; }
        selOutline.visible = false;
        if (selBeacon) selBeacon.visible = false;
        if (fgMarker) fgMarker.visible = false;
        if (typeof hideLocMarker === 'function') hideLocMarker();
        updateSelectedInfo(null);
    }
}

function selectEntry(entry, isD) {
    if (picked) { restoreEntry(picked); picked = null; }
    picked = entry;
    setStackMat(entry, selectMatFor(entry.cell.state));
    // selOutline/selBeacon 掛在 world（scale 1.5、上移 5）；D 倉 entry 座標是 scene 座標 → 換算成 world-local，否則指示塔會偏離 70+ 單位
    const _S = (typeof world !== 'undefined' && world && world.scale) ? world.scale.x : 1;
    const _Y = (typeof world !== 'undefined' && world) ? world.position.y : 0;
    const _lx = isD ? entry.x / _S : entry.x;
    const _lz = isD ? entry.z / _S : entry.z;
    const _oy = isD ? ((entry.stackMid || 1.2) - _Y) / _S : entry.stackMid;
    selOutline.position.set(_lx, _oy, _lz);
    selOutline.visible = true;
    if (selBeacon) {
        selBeacon.position.set(_lx, isD ? (-_Y / _S) : 0, _lz);
        selBeacon.visible = true;
    }
    updateSelectedInfo(entry.cell);
}

// 依儲位編號定位（上帝視角）：把鏡頭拉到儲位上空、開明細
function flyToLoc(locCode) {
    let entry = cellMeshes.find(e => e.cell.location === locCode);
    let isD = false;
    if (!entry && typeof dwSlots !== 'undefined' && dwSlots && dwSlots.length) {
        const s = dwSlots.find(m => m && m.userData && m.userData.entry && m.userData.entry.cell &&
                                      m.userData.entry.cell.location === locCode);
        if (s) { entry = s.userData.entry; isD = true; }
    }
    if (!entry) return;
    if (isD) {   // D 倉儲位：先確保 2L＋D 倉顯示（否則 60s 資料重建會把 D 倉再次隱藏）
        if (typeof activeFloor !== 'undefined' && activeFloor !== 'L2' && typeof setFloor === 'function') setFloor('L2');
        if (typeof setWhVisible === 'function') setWhVisible('D');
        if (typeof setActiveChip === 'function') setActiveChip('D');
        if (typeof focusWarehouse === 'function') focusWarehouse('D');
    }
    selectEntry(entry, isD);
    // 搜尋定位高亮標記（大光柱＋標籤）：D 倉用 scene 座標；C 倉 entry 為 world-local，換算成 scene 座標
    if (isD) {
        showLocMarker(entry.x, entry.z, locCode, true);
    } else if (typeof world !== 'undefined' && world) {
        const _wp = world.localToWorld(new THREE.Vector3(entry.x, 0, entry.z));
        showLocMarker(_wp.x, _wp.z, locCode, false);
    }
    godTarget.set(entry.x, isD ? 3.2 : 2, entry.z);
    godRadius = isD ? Math.min(godRadius, 9) : Math.max(18, Math.min(40, godRadius));
    applyGod();
    openLocModal(entry.cell);
}

// ==================== 料號搜尋 ====================
let searchDebounce = null;
function normLocSearch(s) { return String(s || '').toUpperCase().replace(/鋼架/g, '').replace(/[\s\-·,.:]/g, ''); }

function buildBayByBase() {
    const bayByBase = {};
    if (!fgClickTargets) return bayByBase;
    fgClickTargets.forEach(function (u) {
        const ud2 = (u && u.userData) || {};
        const k2 = normLocSearch(ud2.code || '');   // 例 B0105A
        if (k2) {
            const bse = k2.replace(/[A-Z]$/, '');   // 例 B0105
            if (!bayByBase[bse]) bayByBase[bse] = { code: String(ud2.code || ''), ud: ud2 };
        }
    });
    return bayByBase;
}
function renderSearch(q, rows, fgRows) {
    const box = document.getElementById('searchResults');
    const seen = {};
    let html = '';
    rows.forEach(h => {
        if (h.loc && seen[h.loc]) return; if (h.loc) seen[h.loc] = 1;
        html += '<div class="search-result" data-loc="' + esc(h.loc) + '">' +
            '<span class="sr-loc">' + esc(h.loc) + '</span>' +
            (h.who ? '<span class="sr-nm">' + h.who + '</span>' : '') +
            (h.item ? '<span class="sr-item">' + esc(h.item) + '</span>' : '') +
            (h.itemnm ? '<span class="sr-nm">' + esc(h.itemnm) + '</span>' : '') +
            (h.boxno ? '<span class="sr-nm">箱 ' + esc(h.boxno) + '</span>' : '') +
            (h.qty !== '' ? '<span class="sr-qty">×' + h.qty + '</span>' : '') +
            '</div>';
    });
    fgRows.forEach(h => {
        html += '<div class="search-result" data-k="fg" data-code="' + esc(h.code) + '" data-wx="' + h.wx + '" data-wz="' + h.wz + '">' +
            '<span class="sr-loc">' + esc(h.code) + '</span>' +
            '<span class="sr-nm">1F 成品倉</span>' +
            (h.item ? '<span class="sr-item">' + esc(h.item) + '</span>' : '') +
            (h.boxno ? '<span class="sr-nm">箱 ' + esc(h.boxno) + '</span>' : '') +
            (h.so ? '<span class="sr-nm">SO ' + esc(h.so) + '</span>' : '') +
            '</div>';
    });
    if (!html) {
        box.innerHTML = '<div class="search-empty">找不到料號／箱號／儲位「' + esc(q) + '」</div>';
        box.style.display = 'block';
        return;
    }
    if (fgRows.length) html += '<div class="search-empty" style="font-size:11px;color:#9dbdd1;">… 成品倉儲位 ' + fgRows.length + ' 筆</div>';
    box.innerHTML = html;
    box.style.display = 'block';
}
function searchByItem() {
    const sInput = document.getElementById('searchInput');
    const box = document.getElementById('searchResults');
    const q = (sInput.value || '').trim();
    if (!q) { box.style.display = 'none'; return; }
    const qq = q.toUpperCase();
    const nq = normLocSearch(q);
    if (fgStock === null && !fgStockLoading) loadFgStock(() => searchByItem());
    const rows = [];
    // 1) 料號／箱號（C 倉即時庫存）
    (lastGridData || []).forEach(cell => {
        if (!Array.isArray(cell.boxes) || !cell.boxes.length) return;
        const b = cell.boxes.find(x => x && (
            (x.item && String(x.item).toUpperCase().includes(qq)) ||
            (x.box_no && String(x.box_no).toUpperCase().includes(qq))
        ));
        if (b) rows.push({ loc: cell.location, who: '', item: b.item || '', itemnm: b.itemnm || '',
                           boxno: b.box_no || '', qty: (b.qty != null ? b.qty : cell.qty) });
    });
    // 2) C 倉（2F）儲位碼模糊搜索
    (lastGridData || []).forEach(cell => {
        if (normLocSearch(cell.location).includes(nq)) {
            rows.push({ loc: cell.location, who: '2F-C', item: '', itemnm: '', boxno: '', qty: '' });
        }
    });
    // 3) 成品倉（1F）儲位碼模糊搜索
    let fgRows = [];
    if (fgClickTargets && fgClickTargets.length) {
        fgClickTargets.forEach(u => {
            const ud = (u && u.userData) || {};
            const cd = String(ud.code || '');
            if (cd && normLocSearch(cd).includes(nq)) {
                const wx = (f1Group ? f1Group.position.x : 300) + (ud.bx || 0);
                fgRows.push({ code: cd, wx: wx.toFixed(2), wz: (ud.zc || 0).toFixed(2) });
            }
        });
    }
    // 4) 成品倉（1F）料號／箱號／客戶料號（成仓 最後入庫資料 → 對應儲位 bay）
    if (fgStock && fgClickTargets && fgClickTargets.length) {
        const bayByBase = buildBayByBase();
        const seen2 = {};
        Object.keys(fgStock).forEach(bin => {
            const v = fgStock[bin] || {};
            if (!(normLocSearch(v.item).includes(nq) || normLocSearch(v.pallet).includes(nq) ||
                  normLocSearch(v.cust).includes(nq) || normLocSearch(v.so).includes(nq))) return;
            const kn = String(bin).toUpperCase().replace(/\s/g, '');
            const m = bayByBase[kn.replace(/[A-Z]$/, '')];
            if (!m) return;
            const wx0 = (f1Group ? f1Group.position.x : 300) + (m.ud.bx || 0);
            if (seen2[m.code]) return; seen2[m.code] = 1;
            fgRows.push({ code: m.code, wx: wx0.toFixed(2), wz: (m.ud.zc || 0).toFixed(2),
                          item: v.item || '', boxno: v.pallet || '', so: v.so || '' });
        });
    }
    // 5) D 倉（2F-D SEMS 立庫）儲位碼模糊搜索（例 F1020703A）
    if (typeof dwData !== 'undefined' && dwData && dwData.length) {
        dwData.forEach(function (d) {
            const cd = String(d.code || '');
            if (cd && normLocSearch(cd).includes(nq)) {
                rows.push({ loc: cd, who: '2F-D', item: '', itemnm: '', boxno: '', qty: '' });
            }
        });
    }
    // 去重 + 排序
    const fgU = {};
    fgRows = fgRows.filter(h => (fgU[h.code] ? false : (fgU[h.code] = 1, true)));
    fgRows.sort((a, b2) => a.code.localeCompare(b2.code, 'en', { numeric: true }));
    renderSearch(q, rows, fgRows);
    // 深層搜尋：成仓 全表（不限最後入庫）→ 舊單料號/托盤/客戶料號/SO 也找得到
    if (q && fgClickTargets && fgClickTargets.length) {
        const seq = (searchByItem._seq = (searchByItem._seq || 0) + 1);
        fetch('http://10.176.33.211:1102/wh_cang/api/api.php?action=fg_search&q=' + encodeURIComponent(q), { cache: 'no-store' }).then(function (resp) { return resp.json(); }).then(function (dr) {
            if (!dr || !dr.bins || seq !== searchByItem._seq) return;
            const bayByBase2 = buildBayByBase();
            let added = 0;
            Object.keys(dr.bins).forEach(function (bin) {
                const v2 = dr.bins[bin] || {};
                const kn2 = String(bin).toUpperCase().replace(/[.\s\-·]/g, '');
                const m2 = bayByBase2[kn2.replace(/[A-Z]$/, '')];
                if (!m2) return;
                if (fgU[m2.code]) return; fgU[m2.code] = 1;
                const wx2 = (f1Group ? f1Group.position.x : 300) + (m2.ud.bx || 0);
                fgRows.push({ code: m2.code, wx: wx2.toFixed(2), wz: (m2.ud.zc || 0).toFixed(2),
                              item: v2.item || '', boxno: v2.pallet || '', so: v2.so || '' });
                added++;
            });
            if (added > 0) {
                fgRows.sort((a, b2) => a.code.localeCompare(b2.code, 'en', { numeric: true }));
                renderSearch(q, rows, fgRows);
            }
        }).catch(function () {});
    }
}
function hideSearchBox() {
    const box = document.getElementById('searchResults');
    if (box) box.style.display = 'none';
}
function focusSearchResult(el) {
    hideSearchBox();
    if (!el) return;
    const k = el.getAttribute('data-k');
    const code = el.getAttribute('data-code');
    const wx = el.getAttribute('data-wx');
    const wz = el.getAttribute('data-wz');
    if (k === 'fg' && code && wx != null && wz != null) {
        focusFgLoc(code, parseFloat(wx), parseFloat(wz));
        return;
    }
    const loc = el.getAttribute('data-loc');
    if (!loc) return;
    flyToLoc(loc);   // flyToLoc 內部同時處理 C 倉（cellMeshes）與 D 倉（dwSlots）
}

// ==================== 成品倉儲位：高亮＋箭頭（模糊搜索結果定位） ====================
let fgMarker = null, fgMarkerBall = null;
function buildFgMarker() {
    if (fgMarker || !scene) return;
    fgMarker = new THREE.Group();
    // 外框：點亮整個 bay（成品倉 bay ≈2.9 寬 ×5.0 高 ×1.1 深）
    const outline = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(2.94, 5.0, 1.12)),
        new THREE.LineBasicMaterial({ color: 0x00E676 })
    );
    outline.position.y = 2.5;
    fgMarker.add(outline);
    // 垂直高亮塔
    const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 5.6, 6, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x00E676, transparent: true, opacity: 0.8 })
    );
    tower.position.y = 2.8;
    fgMarker.add(tower);
    // 脈動球
    fgMarkerBall = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00E676 }));
    fgMarkerBall.position.y = 6.2;
    fgMarker.add(fgMarkerBall);
    // 上方倒箭頭（指引方向）
    const arr = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.0, 10),
        new THREE.MeshBasicMaterial({ color: 0xffd23f }));
    arr.position.y = 7.2;
    fgMarker.add(arr);
    fgMarker.visible = false;
    scene.add(fgMarker);
}
function focusFgLoc(code, worldX, worldZ) {
    buildFgMarker();
    if (!fgMarker || !f1Group) return;
    setFloor('L1');
    setWhOption('fg');
    fgMarker.position.set(worldX, 0, worldZ);
    fgMarker.visible = true;
    godTarget.set(worldX, 4, worldZ);
    godRadius = Math.max(22, Math.min(48, godRadius));
    applyGod();
    openFgBay({ code: code });
}

// ==================== 搜尋儲位：高亮標記（大光柱＋地面光環＋倒箭頭＋編號標籤；掛 scene） ====================
function buildLocMarker() {
    if (locMarker || !scene) return;
    locMarker = new THREE.Group();
    // 大光柱（高 14，確保越過中央明細視窗仍看得見）
    const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 14, 10, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xff2d90, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    beam.position.y = 7;
    locMarker.add(beam);
    // 地面光環
    const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.95, 28),
        new THREE.MeshBasicMaterial({ color: 0xff2d90, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06;
    locMarker.add(ring);
    // 向下倒箭頭（尖端指向儲位）
    const arr = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 12),
        new THREE.MeshBasicMaterial({ color: 0xffd23f }));
    arr.position.y = 3.3; arr.rotation.x = Math.PI;
    locMarker.add(arr);
    // 頂端脈動球
    locMarkerBall = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xff2d90 }));
    locMarkerBall.position.y = 14.2;
    locMarker.add(locMarkerBall);
    // 編號標籤（sprites 永遠面向鏡頭）
    locLabel = makeLabelSprite('儲位', '#ff9ad6', 6, 1.1);
    locLabel.position.y = 15.6;
    locMarker.add(locLabel);
    locMarker.visible = false;
    scene.add(locMarker);
}
function showLocMarker(sceneX, sceneZ, code, forD) {
    buildLocMarker();
    if (!locMarker) return;
    locMarker.position.set(sceneX, 0, sceneZ);
    locMarker.userData.forD = !!forD;
    if (locLabel) {
        const nc = makeLabelSprite('▲ ' + code, '#ff9ad6', 6, 1.05);
        nc.position.y = 15.6;
        locMarker.remove(locLabel);
        try { if (locLabel.material && locLabel.material.map) locLabel.material.map.dispose(); if (locLabel.material) locLabel.material.dispose(); } catch (e) {}
        locMarker.add(nc); locLabel = nc;
    }
    locMarker.visible = true;
}
function hideLocMarker() { if (locMarker) locMarker.visible = false; }

// 回出生點（倉內大馬路中段）：上帝視角即 bindGod 預設 framing
function teleportSpawn() {
    bindGod();
}

function selectMatFor(state) {
    if (state === 'empty') return new THREE.MeshBasicMaterial({ color: 0x00E676, transparent: true, opacity: 0.92 });
    return new THREE.MeshLambertMaterial({ map: cartonTex, color: 0xb8ffcf, emissive: 0x00E676, emissiveIntensity: 0.55 });
}

function showTooltip(mx, my, cell) {
    hideTooltip();
    tooltipTimer = setTimeout(() => {
        let html;
        if (cell.kind === 'D') {                        // D 倉鋼架儲位
            html = '<b class="loc">' + cell.location + '</b><br>' +
                   (cell.state === 'empty' ? '空位，可入庫' :
                    '占用中　容器：' + esc(cell.container || '—') + (cell.stype ? '<br>型別：' + esc(cell.stype) : ''));
        } else if (cell.kind === 'A') {                 // A 倉即時儲位（wh_a_data.json）
            const aState = cell.state;
            const aStateTxt = aState === 'used' ? '<span style="color:#8BA5B5">使用中</span>'
                            : aState === 'empty' ? '<span style="color:#35B835">空位</span>'
                            : aState === 'no_source' ? '<span style="color:#9dbdd1">此區無資料庫來源</span>'
                            : '<span style="color:#B06CF7">載入中…</span>';
            html = '<b class="loc">儲位 ' + esc(cell.location) + '</b><br>' +
                   'DB 料架 ' + esc(cell.dbCode || '—') + '<br>' + aStateTxt +
                   (aState === 'used' || aState === 'empty'
                        ? '<br>占用 ' + (cell.occupiedSlots || 0) + ' / ' + (cell.capacity || 0) +
                          '　總量 ' + (cell.totalQty || 0) + '　料號數 ' + (cell.distinctMaterials || 0)
                        : '');
        } else if (cell.state === 'empty') {
            html = '<b class="loc">' + cell.location + '</b><br>空位，可入庫';
        } else {
            const c = cell.state === 'special' ? 'style="color:#B06CF7"' : '';
            const extra = cell.state === 'special' ? ' 出庫中' : '';
            html = '<b class="loc" ' + c + '>' + cell.location + extra + '</b><br>' +
                   '物料：' + cell.material + '<br>數量：' + cell.qty + '　箱數：' + cellBoxCount(cell);
        }
        tooltipEl.innerHTML = html;
        tooltipEl.style.display = 'block';
        const panelRect = view3d.getBoundingClientRect();
        let tx = mx - panelRect.left + 16;
        let ty = my - panelRect.top - 12;
        const tw = tooltipEl.offsetWidth, th = tooltipEl.offsetHeight;
        if (tx + tw > panelRect.width - 8) tx = mx - panelRect.left - tw - 14;
        if (ty + th > panelRect.height - 8) ty = panelRect.height - th - 8;
        tooltipEl.style.left = Math.max(2, tx) + 'px';
        tooltipEl.style.top = Math.max(2, ty) + 'px';
    }, 60);
}

function hideTooltip() {
    if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
    tooltipEl.style.display = 'none';
}

function updateSelectedInfo(cell) {
    const emptyEl = document.getElementById('infoEmpty');
    const bodyEl = document.getElementById('infoBody');
    if (!cell) {
        emptyEl.style.display = 'block';
        bodyEl.style.display = 'none';
        return;
    }
    emptyEl.style.display = 'none';
    bodyEl.style.display = 'block';
    const stateText = cell.state === 'empty' ? '<span style="color:#35B835">空位</span>'
                     : cell.state === 'special' ? '<span style="color:#B06CF7">出庫中</span>'
                     : cell.state === 'point' ? '<span style="color:#00B0C8">點位</span>'
                     : '<span style="color:#8BA5B5">已使用</span>';
    const area = cell.kind === 'R' ? '鋼架 L' + cell.level
               : cell.kind === 'D' ? 'D 倉鋼架 ' + (cell.layer || '') + ' 層（' + (cell.layer === 'B' ? '1.5~3m 上' : '0~1.5m 下') + '層）'
               : cell.kind === 'AGV' ? 'AGV 棧板區'
               : cell.kind === 'A' ? (cell.dbCode ? 'A 倉 DB ' + esc(cell.dbCode) : 'A 倉平面圖')
               : '棧板區';
    let rows = '<div class="ip-row"><span>儲位</span><b>' + esc(cell.location) + '</b></div>' +
               '<div class="ip-row"><span>區域</span><b>' + area + '</b></div>';
    if (cell.kind === 'D') {
        if (cell.state !== 'empty') {
            rows += '<div class="ip-row"><span>容器編碼</span><b style="max-width:160px;">' + esc(cell.container || '—') + '</b></div>' +
                    '<div class="ip-row"><span>型別</span><b>' + esc(cell.stype || '—') + '</b></div>';
        }
    } else if (cell.kind === 'A') {
        // A 倉即時儲位：DB 料架＋占用＋總量＋料號數＋最後入庫（取代通用 物料/數量/箱數）
        rows += '<div class="ip-row"><span>DB 料架</span><b>' + esc(cell.dbCode || '—') + '</b></div>';
        if (cell.state === 'no_source') {
            rows += '<div class="ip-row" style="grid-column:1/-1;color:#9dbdd1;font-size:11px;">此區無資料庫來源</div>';
        } else {
            rows += '<div class="ip-row"><span>占用</span><b>' + (cell.occupiedSlots || 0) + ' / ' + (cell.capacity || 0) + '</b></div>' +
                    '<div class="ip-row"><span>總數量</span><b>' + (cell.totalQty || 0) + '</b></div>' +
                    '<div class="ip-row"><span>料號數</span><b>' + (cell.distinctMaterials || 0) + '</b></div>' +
                    '<div class="ip-row"><span>最後入庫</span><b>' + esc(cell.lastDateIn || '—') + '</b></div>';
        }
    } else if (cell.kind === 'AGV') {
        // AGV 點位：無物料資料，只顯示座標 / 區域 / 狀態
    } else if (cell.state !== 'empty') {
        rows += '<div class="ip-row"><span>物料</span><b style="max-width:120px;">' + esc(cell.material) + '</b></div>' +
                '<div class="ip-row"><span>數量</span><b>' + cell.qty + '</b></div>' +
                '<div class="ip-row"><span>箱數</span><b>' + cellBoxCount(cell) + '</b></div>';
    }
    rows += '<div class="ip-row"><span>狀態</span>' + stateText + '</div>';
    bodyEl.innerHTML = rows;
}

// 點擊儲位 → 展開明細表格（Modal）
// 貨架（R）無法分辨點到哪一層 → 依 (row,col) 群組，直接列出該架 L1~L5 全部層的數據
function openLocModal(cell) {
    const modal = document.getElementById('locModal');
    const tb = document.getElementById('locBody');

    if (cell && cell.kind === 'D') {
        // D 倉鋼架單格：A/B 單層明細
        document.getElementById('locTitle').textContent = '儲位 ' + cell.location;
        const lvTxt = cell.layer === 'B' ? '上層 B（1.5~3m）' : '下層 A（0~1.5m）';
        const stTxt = cell.state === 'empty' ? '<span style="color:#35B835">空位</span>'
                     : '<span style="color:#8BA5B5">使用中</span>';
        document.getElementById('locSub').innerHTML = 'D 倉鋼架　·　' + lvTxt + '　·　' + stTxt;
        let html = '';
        if (cell.state === 'empty') {
            html = '<tr><td colspan="6" class="loc-empty">此儲位目前無物料，可入庫</td></tr>';
        } else {
            html += '<tr><th colspan="6">容器／型別</th></tr>' +
                    '<tr><td colspan="3">容器編碼：' + esc(cell.container || '—') + '</td>' +
                    '<td colspan="3">型別：' + esc(cell.stype || '—') + '</td></tr>' +
                    '<tr><td colspan="6" class="loc-empty">（SEMS 立庫，無紙箱料檔明細）</td></tr>';
        }
        tb.innerHTML = html;
        modal.classList.add('show');
        return;
    }

    if (cell && cell.kind === 'R' && Array.isArray(lastGridData)) {
        // 同一座貨架（同 row/col）的所有層
        const rows = lastGridData.filter(x => x && x.kind === 'R' && x.row === cell.row && x.col === cell.col);
        rows.sort((a, b) => (a.level || 1) - (b.level || 1));
        const rackTitle = 'C' + (cell.group || '') ;   // group 由 API 之 location（C#-NN）拆出
        const gm = /^C(\d+)-/.exec(cell.location || '');
        const gid = gm ? gm[1] : '';
        document.getElementById('locTitle').textContent = '貨架 C' + gid + '（' + rows.map(x => (x.location || '').replace(/^C\d+-/, '')).join(', ') + '）';
        const usedCnt = rows.filter(x => x.state !== 'empty').length;
        document.getElementById('locSub').innerHTML = '鋼架 5 層　·　使用中 ' + usedCnt + ' / 5 層';
        let html = '';
        rows.forEach(x => {
            const lv = x.level || 1;
            const lvState = x.state === 'empty' ? '<span style="color:#35B835">空</span>'
                           : x.state === 'special' ? '<span style="color:#B06CF7">出庫中</span>'
                           : '<span style="color:#8BA5B5">使用中</span>';
            html += '<tr class="loc-lvhead"><td colspan="6">L' + lv + '　·　' +
                    (x.location || '') + '　·　' + lvState + '</td></tr>';
            if (x.state !== 'empty') {
                const boxes = (Array.isArray(x.boxes) && x.boxes.length) ? x.boxes : [{
                    box_no: '—', item: x.item || '', itemnm: x.itemnm || '',
                    qty: x.qty || 0, date_code: '', in_time: ''
                }];
                boxes.forEach(b => {
                    html += '<tr><td>' + esc(b.box_no || '—') + '</td><td>' + esc(b.item || '') + '</td>' +
                            '<td>' + esc(b.itemnm || '') + '</td><td>' + (b.qty != null ? b.qty : '') + '</td>' +
                            '<td>' + esc(b.date_code || '—') + '</td><td>' + esc(b.in_time || '—') + '</td></tr>';
                });
            } else {
                html += '<tr><td colspan="6" class="loc-empty">此層無物料</td></tr>';
            }
        });
        tb.innerHTML = html || '<tr><td colspan="6" class="loc-empty">此貨架無資料</td></tr>';
        modal.classList.add('show');
        return;
    }

    if (cell && cell.kind === 'A') {
        // A 倉即時儲位：標題＋DB 料架＋狀態；used 時顯示料架群組彙總（capacity/occupied/totalQty/distinctMaterials/dominant/lastDateIn）
        document.getElementById('locTitle').textContent = '儲位 ' + esc(cell.location);
        const aSt = cell.state;
        const aStTxt = aSt === 'used' ? '<span style="color:#8BA5B5">使用中</span>'
                     : aSt === 'empty' ? '<span style="color:#35B835">空位</span>'
                     : aSt === 'no_source' ? '<span style="color:#9dbdd1">此區無資料庫來源</span>'
                     : '<span style="color:#B06CF7">載入中…</span>';
        document.getElementById('locSub').innerHTML = 'DB 料架 ' + esc(cell.dbCode || '—') + '　·　' + aStTxt;
        let aHtml = '';
        if (aSt === 'used') {
            const dom = cell.dominantMaterial || {};
            aHtml = '<tr class="loc-lvhead"><td colspan="6">料架群組彙總</td></tr>' +
                    '<tr><td colspan="2">容量</td><td colspan="2"><b style="color:#ffd866;">' + (cell.capacity || 0) + '</b></td>' +
                    '<td colspan="2">占用 ' + (cell.occupiedSlots || 0) + '</td></tr>' +
                    '<tr><td colspan="2">總數量</td><td colspan="2"><b style="color:#ffd866;">' + (cell.totalQty || 0) + '</b></td>' +
                    '<td colspan="2">料號數 ' + (cell.distinctMaterials || 0) + '</td></tr>' +
                    '<tr><td colspan="2">主要料號</td><td colspan="4">' + esc(dom.liaoh || '—') + ' × ' + (dom.qty || 0) + '</td></tr>' +
                    '<tr><td colspan="2">最後入庫</td><td colspan="4">' + esc(cell.lastDateIn || '—') + '</td></tr>' +
                    '<tr><td colspan="2">資料表</td><td colspan="4">' + esc(cell.sourceTable || '—') + '</td></tr>';
        } else if (aSt === 'empty') {
            aHtml = '<tr><td colspan="6" class="loc-empty">此料架群組目前無庫存（capacity ' + (cell.capacity || 0) + ' / occupied 0）</td></tr>';
        } else if (aSt === 'no_source') {
            aHtml = '<tr><td colspan="6" class="loc-empty">此區無資料庫來源（IC/RH/PM/S 等不匯入倉儲表）</td></tr>';
        } else {
            aHtml = '<tr><td colspan="6" class="loc-empty">載入中…</td></tr>';
        }
        tb.innerHTML = aHtml;
        modal.classList.add('show');
        return;
    }

    document.getElementById('locTitle').textContent = '儲位 ' + cell.location;
    const area = cell.kind === 'R' ? '鋼架 L' + cell.level : (cell.kind === 'RAW1' ? '原料倉' : '棧板區');
    const st = cell.state === 'empty' ? '空位' : (cell.state === 'special' ? '出庫中' : '使用中');
    document.getElementById('locSub').innerHTML = area + '　·　' + st;
    let html = '';
    if (cell.state !== 'empty') {
        const boxes = (Array.isArray(cell.boxes) && cell.boxes.length) ? cell.boxes : [{
            box_no: '—', item: cell.item || '', itemnm: cell.itemnm || '',
            qty: cell.qty || 0, date_code: '', in_time: ''
        }];
        boxes.forEach(b => {
            html += '<tr><td>' + esc(b.box_no || '—') + '</td><td>' + esc(b.item || '') + '</td>' +
                    '<td>' + esc(b.itemnm || '') + '</td><td>' + (b.qty != null ? b.qty : '') + '</td>' +
                    '<td>' + esc(b.date_code || '—') + '</td><td>' + esc(b.in_time || '—') + '</td></tr>';
        });
    } else {
        html = '<tr><td colspan="6" class="loc-empty">此儲位目前無物料</td></tr>';
    }
    tb.innerHTML = html;
    modal.classList.add('show');
}
// 成品倉庫存（成仓 表）：{BIN: {doc,pallet,item,cust,qty,time,staff,so,so_line,sl}}，每儲位=最後入庫一筆
let fgStock = null, fgStockLoading = false, fgStockWaiters = [], fgAllSet = null;
async function loadFgStock(onDone) {
    if (onDone) {
        if (fgStock) { try { onDone(); } catch (e) {} return; }
        fgStockWaiters.push(onDone);
    }
    if (fgStockLoading || fgStock) return;
    fgStockLoading = true;
    try {
        const r = await fetch('http://10.176.33.211:1102/wh_cang/api/api.php?action=fg_stock');
        const d = await r.json();
        if (d && d.success && d.stock) {
            fgStock = d.stock;
            if (typeof applyFgStockDots === 'function') applyFgStockDots();
            try { renderSelectionSummary(); } catch (e) {}
        }
    } catch (e) {}
    fgStockLoading = false;
    const w = fgStockWaiters; fgStockWaiters = [];
    w.forEach(f => { try { f(); } catch (e) {} });
}
function openFgBay(u) {   // 成品倉鋼架儲位明細（成仓 表：每個儲位顯示最後入庫一筆）
    const modal = document.getElementById('locModal');
    if (!modal) return;
    const code = String(u.code || '');
    document.getElementById('locTitle').textContent = '儲位 ' + esc(code);
    const nk = normLocSearch(code);          // e.g. C0309A
    const base = nk.length > 1 ? nk.slice(0, -1) : nk;   // e.g. C0309（同排位四層共用）
    const is3 = (typeof FG_3LVL !== 'undefined') && FG_3LVL.has(base);
    const nLvl = is3 ? 3 : 4;   // 部分 bay 僅 A/B/C 三層（無 D 層）
    document.getElementById('locSub').innerHTML = '成品倉　鋼架　·　' + nLvl + ' 層';
    const tb = document.getElementById('locBody');
    const LVN = ['第一層', '第二層', '第三層', '第四層'];
    const LV = ['A', 'B', 'C', 'D'];
    const codeLv = LV.indexOf(code.slice(-1).toUpperCase());   // 尾號 A/B/C/D = 層數
    let html = '';
    for (let k = 0; k < nLvl; k++) {
        const active = (k === codeLv);
        const r = (fgStock && fgStock[base + LV[k]]) || null;
        html += '<tr class="loc-lvhead"' + (active ? ' style="background:rgba(255,216,102,.28);"' : '') + '>' +
                '<td colspan="6">' + LVN[k] + '（' + LV[k] + '）' + (active ? '　★ 本儲位' : '') + '</td></tr>';
        if (r) {
            html += '<tr><td colspan="6" style="padding:8px 10px;"><div style="font-size:12px;line-height:1.8;">' +
                '<div>箱號（托盤）：<b class="mono">' + esc(r.pallet) + '</b></div>' +
                '<div>90料號：<b class="mono">' + esc(r.item) + '</b>　客戶料號：<span class="mono">' + esc(r.cust) + '</span></div>' +
                '<div>數量：<b style="color:#ffd866;">' + (r.qty != null ? r.qty : '') + '</b></div>' +
                '<div>入庫單號：<span class="mono">' + esc(r.doc) + '</span>　入庫時間：<span class="mono">' + esc(r.time) + '</span>　人員：<span class="mono">' + esc(r.staff) + '</span></div>' +
                '<div>SO：<span class="mono">' + esc(r.so) + '</span>　第 ' + (r.so_line || '') + ' 項　S.L：' + esc(r.sl) + '</div>' +
                '</div></td></tr>';
        } else {
            html += '<tr><td colspan="6" class="loc-empty">此層無庫存</td></tr>';
        }
    }
    tb.innerHTML = html;
    modal.classList.add('show');
    loadFgStock(() => openFgBay(u));   // 資料尚未載入時，載入完成自動重繪
}
function openRaw1Slot(slot) {   // 原料倉儲位明細（顯示所有層 + 真實 SAP 數據）
    const modal = document.getElementById('locModal');
    if (!modal) return;
    const code = String(slot.code || '');
    // 去掉最後一位層號，取得位置前綴（e.g. "1A01A" → "1A01"，"1Q0101A" → "1Q0101"）
    const prefix = code.length > 1 ? code.slice(0, -1) : code;
    const isStrip = prefix.length >= 6;  // 7-char codes (strip) vs 5-char (main)
    const nLvl = isStrip ? 5 : 4;
    const LVN = ['第一層','第二層','第三層','第四層','第五層'];
    const LCH = ['A','B','C','D','E'];

    document.getElementById('locTitle').textContent = '儲位 ' + esc(prefix);
    document.getElementById('locSub').innerHTML = '原料倉　' + (isStrip ? '貨架' : '鋼架') + '　·　' + nLvl + ' 層';
    const tb = document.getElementById('locBody');
    tb.innerHTML = '<tr><td colspan="6" class="loc-empty">載入中…</td></tr>';
    modal.classList.add('show');

    // 查詢 API（wildcard 取得該位置所有層）
    fetch('http://10.176.33.211:1102/wh_cang/api/api.php?action=raw1_stock&bin=' + encodeURIComponent(prefix + '*'), { cache: 'no-store' })
        .then(r => r.json())
        .then(res => {
            if (!res.success) {
                tb.innerHTML = '<tr><td colspan="6" class="loc-empty">載入失敗：' + esc(res.message || '未知錯誤') + '</td></tr>';
                return;
            }
            // 依層號分組（StorageBin 最後一位 = 層）
            const byLevel = {};
            (res.data || []).forEach(rec => {
                const sb = String(rec['StorageBin'] || '');
                const lv = sb.slice(-1).toUpperCase();
                if (!byLevel[lv]) byLevel[lv] = [];
                byLevel[lv].push(rec);
            });
            let html = '';
            for (let k = 0; k < nLvl; k++) {
                html += '<tr class="loc-lvhead"><td colspan="6">' + LVN[k] + '（L' + (k + 1) + ' ' + LCH[k] + '）</td></tr>';
                const rows = byLevel[LCH[k]] || [];
                if (!rows.length) {
                    html += '<tr><td colspan="6" class="loc-empty">此層無物料</td></tr>';
                } else {
                    rows.forEach(rec => {
                        const mat = esc(String(rec['Material'] || ''));
                        const batch = esc(String(rec['Batch'] || ''));
                        const qty = String(rec['Available stock'] ?? '');
                        const gr = esc(String(rec['GR Date'] || ''));
                        const typ = esc(String(rec['Typ'] || ''));
                        const bun = esc(String(rec['BUn'] || ''));
                        html += '<tr><td class="loc-mat">' + mat + '</td><td>' + batch + '</td><td class="loc-qty">' + qty + (bun ? ' ' + bun : '') + '</td><td>' + gr + '</td><td>' + typ + '</td><td></td></tr>';
                    });
                }
            }
            tb.innerHTML = html;
        })
        .catch(err => {
            tb.innerHTML = '<tr><td colspan="6" class="loc-empty">網路錯誤：' + esc(err.message) + '</td></tr>';
        });
}
function closeLocModal() {
    document.getElementById('locModal').classList.remove('show');
}

let debugPick = false;   // 除錯模式：點擊打印世界座標到 console（鍵盤 D 切換）

function bindEvents() {
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('pointerleave', () => {
        hideTooltip();
        if (hovered) { if (hovered !== picked) restoreEntry(hovered); hovered = null; }
    });

    window.addEventListener('keydown', (ev) => {
        // 焦點在輸入框時不攔截按鍵（可正常打字），僅保留 Esc
        const act = document.activeElement;
        const typing = act && (act.tagName === 'INPUT' || act.tagName === 'TEXTAREA');
        if (typing && ev.key !== 'Escape' && ev.key !== 'Enter' && ev.key !== 'Tab') return;
        fpsKeys[String(ev.key).toLowerCase()] = 1;
        if (ev.key === 'd' || ev.key === 'D') {
            debugPick = !debugPick;
            console.log('%c[DEBUG] 點擊座標除錯：' + (debugPick ? 'ON（點擊即打印 x/z 與格子列欄）' : 'OFF'), 'color:#ffd866;font-weight:bold');
        }
        if (ev.key === 'Escape') { closeLocModal(); hideGhostMenu(); if (fpsMode) leaveFps(); }
        if (ev.key === 'v' || ev.key === 'V') {
            ev.preventDefault();
            if (fpsMode) leaveFps(); else enterFps();
        }
        if (ev.key === 'e' || ev.key === 'E') {
            ev.preventDefault();
            doFpsInteract();
        }
        if (fpsMode && ev.key >= '1' && ev.key <= '9') {
            invSel = parseInt(ev.key, 10) - 1;
            renderInv();
        }
    });
    window.addEventListener('keyup', (ev) => { fpsKeys[String(ev.key).toLowerCase()] = 0; });
    document.addEventListener('mousemove', (ev) => {
        if (fpsLocked) {
            fpsYaw -= ev.movementX * FPS_CFG.sens;
            fpsPitch -= ev.movementY * FPS_CFG.sens;
            fpsPitch = Math.max(-1.45, Math.min(1.45, fpsPitch));
        } else if (fpsMode && fpsDrag) {
            const dxf = ev.clientX - fpsDragX, dyf = ev.clientY - fpsDragY;
            fpsDragX = ev.clientX; fpsDragY = ev.clientY;
            fpsYaw -= dxf * FPS_CFG.sens;
            fpsPitch -= dyf * FPS_CFG.sens;
            fpsPitch = Math.max(-1.45, Math.min(1.45, fpsPitch));
            godMoveAcc += Math.abs(dxf) + Math.abs(dyf);
            if (godMoveAcc > 6) godDragMoved = true;
        } else if (!fpsMode && godDrag) {
            const dxg = ev.clientX - godLastX, dyg = ev.clientY - godLastY;
            godLastX = ev.clientX; godLastY = ev.clientY;
            if (godPan) panGod(dxg, dyg);
            else rotateGod(dxg, dyg);
            godMoveAcc += Math.abs(dxg) + Math.abs(dyg);
            if (godMoveAcc > 6) godDragMoved = true;
        }
    });
    document.addEventListener('pointerup', () => { fpsDrag = false; godDrag = false; setTimeout(() => { godDragMoved = false; godMoveAcc = 0; }, 50); });
    renderer.domElement.addEventListener('pointerdown', (ev) => {
        if (fpsMode && ev.button === 0) {
            fpsDrag = true;
            fpsDragX = ev.clientX; fpsDragY = ev.clientY;
            if (!fpsLocked) { try { renderer.domElement.requestPointerLock(); } catch (err) { /* 拖曳轉視野 */ } }
        } else if (!fpsMode) {
            godDrag = true;
            godPan = (ev.button === 2 || ev.shiftKey);
            godLastX = ev.clientX; godLastY = ev.clientY;
        }
    });
    renderer.domElement.addEventListener('wheel', (ev) => {
        if (fpsMode) return;
        ev.preventDefault();
        godRadius *= Math.exp(ev.deltaY * 0.0018);
        applyGod();
    }, { passive: false });
    renderer.domElement.addEventListener('wheel', (ev) => {   // 第一人稱：滾輪換格
        if (!fpsMode) return;
        ev.preventDefault();
        const dir = ev.deltaY > 0 ? 1 : -1;
        invSel = (invSel + dir + 9) % 9;
        renderInv();
    }, { passive: false });
    renderer.domElement.addEventListener('contextmenu', (ev) => { ev.preventDefault(); });
    document.addEventListener('pointerlockerror', () => { fpsLocked = false; });
    document.addEventListener('pointerlockchange', () => {
        fpsLocked = (document.pointerLockElement === renderer.domElement);
    });
    document.getElementById('btnFps').addEventListener('click', () => {
        if (fpsMode) leaveFps(); else enterFps();
    });

    document.getElementById('btnGhost').addEventListener('click', function () {
        ghostMode = !ghostMode;
        this.classList.toggle('active', ghostMode);
        if (!ghostMode) hideGhostMenu();
        renderer.domElement.style.cursor = ghostMode ? 'crosshair' : 'grab';
    });

    document.getElementById('ghostSingle').addEventListener('click', () => {
        if (!ghostSel) return;
        setGhost(ghostSel.obj, !ghostIsOn(ghostSel.obj));
        updateGhostState();
    });
    document.getElementById('ghostCat').addEventListener('click', () => {
        if (!ghostSel) return;
        setCatGhost(ghostSel.cat, !catOn[ghostSel.cat]);
        updateGhostState();
    });
    document.getElementById('ghostAll').addEventListener('click', () => { clearAllGhost(); });
    document.getElementById('ghostMenu').addEventListener('click', (ev) => {
        ev.stopPropagation();
    });
    renderer.domElement.addEventListener('pointerdown', (ev) => {
        if (ghostMode && ev.button === 0 && document.getElementById('ghostMenu').style.display !== 'block') {
            // 點空白關掉舊選單（onClick 會再開新的）
            hideGhostMenu();
        }
    });

    document.getElementById('locClose').addEventListener('click', closeLocModal);
    document.getElementById('locModal').addEventListener('click', (ev) => {
        if (ev.target === ev.currentTarget) closeLocModal();   // 點背景關閉
    });

    document.getElementById('btnRotate').addEventListener('click', function () {
        autoRotate = !autoRotate;
        this.classList.toggle('active', autoRotate);
    });
    document.getElementById('btnRefresh').addEventListener('click', () => {
        refreshLive().then(ok => loadData(true));   // 重新抓取真實資料再重建
    });

    // 一鍵切倉 A / C / D / ALL（A/D 依需顯示；ALL 全顯示；C 基底恆顯示）
    [['whA', 'A'], ['whB', 'B'], ['whC', 'C'], ['whD', 'D'], ['whAll', 'ALL']].forEach(function (pair) {
        const id = pair[0], wh = pair[1];
        document.getElementById(id).addEventListener('click', function () {
            if (activeFloor === 'L3') {   // 三樓：切 3F 複本顯隱
                setVisibleFloor3(wh);
                setActiveChip(wh);
                if (wh === 'ALL') {
                    godTarget.set(0, FLOOR_Y + 7.4, 0);
                    godRadius = 210; godTheta = 0.65; godPhi = 1.03;
                    applyGod();
                } else {
                    focusWarehouse3(wh);
                }
                return;
            }
            setWhVisible(wh);
            setActiveChip(wh);
            if (wh === 'ALL') {   // ALL：全景俯瞰
                godTarget.set(0, FLOOR_Y + 2.4, 0);
                godRadius = 210; godTheta = 0.65; godPhi = 1.03;
                applyGod();
            } else {
                focusWarehouse(wh);
            }
        });
    });

    // 樓層切換 1L / 2L / 3L
    [['fl1', 'L1'], ['fl2', 'L2'], ['fl3', 'L3']].forEach(function (pair) {
        document.getElementById(pair[0]).addEventListener('click', function () { setFloor(pair[1]); });
    });

    // 1L two options: raw materials / finished goods
    document.getElementById('whR').addEventListener('click', function () { if (activeFloor !== 'L1') setFloor('L1'); else setWhOption('raw'); });
    document.getElementById('whG').addEventListener('click', function () { if (activeFloor !== 'L1') setFloor('L1'); setWhOption('fg'); });
    updateWarehouseLabel();   // 載入即依目前選擇同步標題

    // 點「正在出庫」儲位 chip → 3D 定位過去
    document.getElementById('specialDetail').addEventListener('click', (ev) => {
        const chip = ev.target.closest('[data-loc]');
        if (chip) flyToLoc(chip.getAttribute('data-loc'));
    });

    // 料號搜尋
    const sInput = document.getElementById('searchInput');
    sInput.addEventListener('input', () => { clearTimeout(searchDebounce); searchDebounce = setTimeout(searchByItem, 120); });
    sInput.addEventListener('keydown', (ev) => {
        ev.stopPropagation();
        if (ev.key === 'Escape') { sInput.blur(); hideSearchBox(); }
        if (ev.key === 'Enter') searchByItem();
    });
    document.getElementById('searchResults').addEventListener('click', (ev) => {
        const el = ev.target.closest('.search-result');
        if (el) focusSearchResult(el);
    });
    document.addEventListener('pointerdown', (ev) => {
        if (!ev.target.closest('#searchWrap')) hideSearchBox();
    });
}

// ==================== ANIMATE ====================
function updateCompass() {
    // 投影世界「北方(-z)」與中心到螢幕，算出北方在螢幕上的角度，旋轉羅盤針
    const na = new THREE.Vector3(0, 0, -3).project(camera);
    const ca = new THREE.Vector3(0, 0, 0).project(camera);
    const ang = Math.atan2(na.x - ca.x, -(na.y - ca.y)) * 180 / Math.PI;
    compassNeedle.style.transform = 'rotate(' + ang + 'deg)';
}

function animate() {
    requestAnimationFrame(animate);
    const t = animateClock.elapsedTime;
    const dt = animateClock.getDelta();
    matSpecialBox.emissiveIntensity = 0.35 + 0.3 * Math.sin(t * 3);
    updateCompass();
    updateZoneSigns();
    // 成品倉橫梁名牌：靠近才出現（距離 LOD，門檻 45 世界單位）
    if (f1Group && f1Group.visible && fgLabels.length) {
        for (let li = 0; li < fgLabels.length; li++) {
            const lbl = fgLabels[li];
            if (!lbl.userData.wpReady) {
                f1Group.updateMatrixWorld(true);
                lbl.userData.wp = lbl.position.clone().applyMatrix4(f1Group.matrixWorld);
                lbl.userData.wpReady = true;
            }
            lbl.visible = lbl.userData.wp.distanceToSquared(camera.position) < 22500;   // 150²：靠近(≤150)才顯示，正常查架距離可見
        }
    }
    updateWorkers(dt, t);
    if (autoRotate && !fpsMode) { godTheta += dt * 0.25; }   // 自動旋轉：開啟時每幀累加角度（拖曳仍可介入）
    if (!fpsMode) applyGod();
    updateFps(dt);
    updateAConveyor(dt);
    updateWHView();                       // 切 D/C 倉：鏡頭中心往北進入 D 倉範圍時左側換倉數據
    if (dwGroup && dwGroup.visible) updateAgv(dt);   // AGV 行駛動畫（D 隱藏時省略）
        updateBoards();                         // 廣告牌面向鏡頭
    if (beaconBall && selBeacon && selBeacon.visible) {
        beaconBall.scale.setScalar(1 + 0.35 * Math.sin(t * 4));
    }
    if (fgMarkerBall && fgMarker && fgMarker.visible) {
        fgMarkerBall.position.y = 6.2 + 0.3 * Math.sin(t * 4);
    }
    if (locMarkerBall && locMarker && locMarker.visible) {
        locMarkerBall.scale.setScalar(1 + 0.4 * Math.sin(t * 5));
        locMarkerBall.position.y = 14.2 + 0.35 * Math.sin(t * 5);
        // D 倉隱藏時（切到別倉）自動收起標記，避免殘留
        if (locMarker.userData.forD && typeof dwGroup !== 'undefined' && dwGroup && !dwGroup.visible) locMarker.visible = false;
    }
    tvAcc += dt;
    if (tvAcc > 0.5) { tvAcc = 0; updateTVTexture(t); }
    try {
        renderer.render(scene, camera);
        window.__renderErrN = 0;
    } catch (e) {
        // 渲染防崩：單一 bad frame（geometry 屬性暫為 null / GPU 驅動異常）不可炸掉 rAF 迴圈，否則整張 3D 畫面會永久卡死
        if (!window.__renderErrN) window.__renderErrN = 0;
        if (window.__renderErrN < 5) console.warn('[3D] render frame skipped:', (e && e.message) || e);
        window.__renderErrN++;
    }
}

// ==================== LEFT SUMMARY ====================
function renderSummary(gridData) {
    // 成品倉(1F)鎖定：移動/點選帶入 C倉 lastGridData 時，一律改由 renderSelectionSummary 依「選定樓層/倉庫」顯示，不讓統計跳成別倉假數據
    if (activeFloor === 'L1') { if (typeof renderSelectionSummary === 'function') renderSelectionSummary(); return; }
    let usedCount = 0, emptyCount = 0, specialCount = 0;
    let specialCells = [];
    gridData.forEach(cell => {
        if (cell.state === 'used') usedCount++;
        else if (cell.state === 'empty') emptyCount++;
        else { specialCount++; specialCells.push(cell); }
    });

    const denom = gridData.length || TOTAL;
    document.getElementById('sumTotal').textContent = denom;
    document.getElementById('sumTotalSub').textContent = '貨架 ' + C_RACK_CODE_CNT + ' · 棧板 ' + C_PALLET_CODE_CNT;
    document.getElementById('sumUsed').textContent = usedCount;
    document.getElementById('sumUsedPct').textContent = Math.round(usedCount / denom * 100) + '%';
    document.getElementById('sumEmpty').textContent = emptyCount;
    document.getElementById('sumEmptyPct').textContent = Math.round(emptyCount / denom * 100) + '%';
    document.getElementById('sumSpecial').textContent = specialCount;
    document.getElementById('sumSpecialSub').textContent = specialCount > 0 ? '正在出庫' : '無';

    const utilPct = Math.round((usedCount + specialCount) / denom * 100);
    const circumference = 2 * Math.PI * 48;
    const offset = circumference - (circumference * utilPct / 100);
    const ringFill = document.getElementById('utilRingFill');
    ringFill.setAttribute('stroke-dashoffset', offset);
    let ringColor = '#8BA5B5';
    if (utilPct > 80) ringColor = 'rgb(240,193,68)';
    else if (utilPct < 40) ringColor = '#35B835';
    ringFill.setAttribute('stroke', ringColor);
    document.getElementById('utilRingText').textContent = utilPct + '%';

    const sdEl = document.getElementById('specialDetail');
    if (specialCells.length > 0) {
        sdEl.classList.add('special-grid');
        sdEl.innerHTML =
            specialCells.map(s =>
                '<span data-loc="' + esc(s.location) + '" style="display:block;text-align:center;background:rgba(176,108,247,0.18);border:1px solid rgba(176,108,247,0.5);color:#c99bff;border-radius:4px;padding:3px 6px;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;" ' +
                'title="點擊定位至 ' + esc(s.location) + '">' + esc(s.location) + '</span>'
            ).join('');
    } else {
        sdEl.classList.remove('special-grid');
        sdEl.textContent = '暫無出庫中物料';
    }
}

// ==================== LEFT SUMMARY: follow selected warehouse/floor ====================
function setSum(total, sub, used) {
    used = used || 0;
    const empty = total - used;
    const denom = total || 1;
    const el = function (id) { return document.getElementById(id); };
    el('sumTotal').textContent = total;
    el('sumTotalSub').textContent = sub || '';
    el('sumUsed').textContent = used;
    el('sumUsedPct').textContent = Math.round(used / denom * 100) + '%';
    el('sumEmpty').textContent = empty;
    el('sumEmptyPct').textContent = Math.round(empty / denom * 100) + '%';
    el('sumSpecial').textContent = 0;
    el('sumSpecialSub').textContent = '無';
    const utilPct = total ? Math.round(used / denom * 100) : 0;
    const circumference = 2 * Math.PI * 48;
    const rf = el('utilRingFill');
    rf.setAttribute('stroke-dashoffset', circumference - circumference * utilPct / 100);
    let rc = '#8BA5B5';
    if (utilPct > 80) rc = 'rgb(240,193,68)';
    else if (utilPct < 40) rc = '#35B835';
    rf.setAttribute('stroke', rc);
    el('utilRingText').textContent = utilPct + '%';
    const sd = el('specialDetail');
    sd.classList.remove('special-grid');
    sd.textContent = '暫無出庫中物料';
}
function countA() {
    let r = 0, p = 0, s = 0;
    A_GRID.forEach(function (row) { row = row || ''; for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === 'R') r++; else if (ch === 'P') p++; else if (ch === 'S') s++; } });
    const rack = (r + s) * 5;
    return { total: rack + p, rack: rack, pallet: p };
}
function countB() {
    let p = 0, f = 0;
    B_GRID.forEach(function (row) { row = row || ''; for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === 'P') p++; else if (ch === 'F') f++; } });
    return { total: p, rack: 0, pallet: p, extra: f };
}
function renderSelectionSummary() {
    if (activeFloor === 'L3') {
        if (typeof d3Summary === 'function') {
            const s3 = d3Summary();
            setSum(s3.total, '三樓 D 倉 · A 下層 ' + s3.aN + ' / B 上層 ' + s3.bN, s3.used);
        } else {
            setSum(0, '三樓（無儲位統計）', 0);
        }
        if (typeof window.__haiRenderOutbound === 'function') window.__haiRenderOutbound();
        return;
    }
    if (activeFloor === 'L1') {
        const rawOn = document.getElementById('whR').classList.contains('active');
        if (rawOn) {
            // 原料倉（1F）：儲位總數＝儲位碼對照表格數；已使用＝API(SLoc=100Y) 對應到的格數（由 loadRaw1Boxes 更新 RAW1_USED）
            let m = 0, st = 0;
            if (typeof RAW1_SLOT_CODES !== 'undefined' && RAW1_SLOT_CODES) {
                Object.keys(RAW1_SLOT_CODES).forEach(function (k) {
                    const rr = parseInt(String(k).split('_')[0], 10) || 0;
                    (rr < 12) ? m++ : st++;
                });
            }
            const usedRaw = (typeof RAW1_USED !== 'undefined') ? RAW1_USED : 0;
            setSum(m + st, '主鋼架 ' + m + ' · 條形架/紙箱 ' + st, usedRaw);
        } else {
            // 成品倉（1F）：儲位號總數＝FG_ALL_CODES（新版 Excel 每層獨立一碼＋補的12碼）；已使用＝成仓 最後入庫 BIN 對應到儲位號 的個數
            if (!fgAllSet) fgAllSet = new Set(FG_ALL_CODES);
            let usedB = 0;
            if (fgStock) {
                for (const bk in fgStock) { if (fgAllSet.has('鋼架' + bk)) usedB++; }
            }
            setSum(FG_ALL_CODES.length, '儲位號 ' + FG_ALL_CODES.length + ' · 棧板 0', usedB);
        }
        return;
    }
    const wh = activeWh;
    if (wh === 'C') { renderSummary(lastGridData || []); return; }
    if (wh === 'D') { if (typeof renderDWSummary === 'function') renderDWSummary(); return; }
    if (wh === 'A') {
        const c = countA();
        if (typeof A_CELL_ENTRIES !== 'undefined' && A_CELL_ENTRIES.length) {
            let dbN = 0, usedN = 0, sumCap = 0, sumOcc = 0;
            for (let i = 0; i < A_CELL_ENTRIES.length; i++) {
                const e = A_CELL_ENTRIES[i];
                if (e && e.cell) {
                    if (e.cell.dbCode) dbN++;
                    if (e.cell.state === 'used') usedN++;
                    if (typeof e.cell.capacity === 'number' && e.cell.capacity > 0) {
                        sumCap += e.cell.capacity;
                        sumOcc += (typeof e.cell.occupiedSlots === 'number' ? e.cell.occupiedSlots : 0);
                    }
                }
            }
            // 以「有資料庫來源的料架」為單位（看板格＝一座料架）；未含 IC/RH/PM/S
            setSum(dbN, 'DB 料架 ' + dbN + ' 座（IC/RH/PM 無資料）· 佔用率 ' + (sumCap > 0 ? Math.round(sumOcc / sumCap * 100) : 0) + '%', usedN);
        } else {
            setSum(c.total, '貨架 ' + c.rack + ' · 棧板 ' + c.pallet, 0);
        }
        return;
    }
    if (wh === 'B') { const c = countB(); setSum(c.total, '棧板 ' + c.pallet + (c.extra ? ' · 辦公室/來料 ' + c.extra : ''), 0); return; }
    const a = countA(), b = countB();
    const cTotal = (typeof C_TOTAL === 'number') ? C_TOTAL : (TOTAL || 0);
    const dTotal = (dwData && dwData.length) || 0;
    const usedC = (lastGridData || []).filter(function (x) { return x.state === 'used' || x.state === 'special'; }).length;
    const usedD = (dwData || []).filter(function (x) { return x.occ; }).length;
    setSum(a.total + b.total + cTotal + dTotal, '四倉合計', usedC + usedD);
}

function esc(s) {
    if (s === undefined || s === null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ==================== 本地模擬 overlay（上帝視角：仍支援料號箱行本地放置/拾取，前身是 PDA 離線模擬） ====================
// 本地 overlay：location → 覆寫該格狀態（不寫資料庫，僅 3D 模擬）
function updateBoards() {
    const allBoards = (window.__dbb || []).concat(dwBillboards || []);
    if (!allBoards.length) return;
    allBoards.forEach(b => {
        const par = b.parent;
        if (!par) return;
        const _bq = new THREE.Quaternion();
        par.getWorldQuaternion(_bq); _bq.invert();
        b.quaternion.copy(camera.quaternion).premultiply(_bq);   // 依各自 parent 對齊鏡頭（正面不鏡像）
    });
}

// 左側切換：依鏡頭中心世界座標（2D 範圍）判斷所在倉
function updateWHView() {
    if (!renderer) return;
    const ax = godTarget.x;
    const az = godTarget.z;
    const want = inDWorld(ax, az) && dwData ? 'D' : 'C';
    if (want === currentWH) return;
    currentWH = want;
    if (currentWH === 'D') renderDWSummary();
    else renderSummary(lastGridData || []);
}

// 載入 AI 生成輸送帶帶面紋理並套用（非同步）
function resize3D() {
    if (!renderer) return;
    const w = view3d.clientWidth, h = view3d.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}
window.addEventListener('resize', resize3D);
if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize3D).observe(view3d);
}

// ==================== 分區廣告牌（立牌，跟隨鏡頭旋轉） ====================
const zoneSigns = [];   // 收集立牌，animate 每幀對齊鏡頭（yaw billboard）
function addZoneSign(letter, color, sub, x, z, rotY, showZi) {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 256;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, 488, 232);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 150px "Segoe UI", sans-serif';
    ctx.fillText(letter, 250, 105);
    if (showZi !== false) {          // 招牌字後綴「區」（2FCA/2FCB/NG/Z 不需）
        ctx.font = 'bold 60px "Segoe UI", sans-serif';
        ctx.fillText('區', 368, 105);
    }
    ctx.font = 'bold 44px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(sub, 256, 216);

    const g = new THREE.Group();
    const tex = new THREE.CanvasTexture(cvs);
    tex.minFilter = THREE.LinearFilter;
    const board = new THREE.Mesh(
        new THREE.PlaneGeometry(3.3, 1.75),
        new THREE.MeshBasicMaterial({ map: tex })
    );
    board.position.y = 5.0;   // 板底 4.2m（再提高，高過牆頂）
    g.add(board);
    const boardBack = new THREE.Mesh(
        new THREE.PlaneGeometry(3.3, 1.75),
        new THREE.MeshBasicMaterial({ color: 0x16202a })
    );
    boardBack.position.y = 5.0;
    boardBack.rotation.y = Math.PI;
    g.add(boardBack);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    g.userData.cat = 'sign';
    ghostStatic.sign.push(g);
    propGroup.add(g);
    zoneSigns.push(g);   // 讓它跟隨鏡頭
}

// 每幀：立牌 yaw 對齊鏡頭（只轉水平，立牌保持直立不趴地）
function updateZoneSigns() {
    const cx = camera.position.x, cz = camera.position.z;
    for (const g of zoneSigns) {
        g.rotation.y = Math.atan2(cx - g.position.x, cz - g.position.z);
    }
}

// ==================== 柱上電視：出庫指示看板 ====================
const tvCanvas = document.createElement('canvas');
tvCanvas.width = 640; tvCanvas.height = 360;
const tvTex = new THREE.CanvasTexture(tvCanvas);
tvTex.minFilter = THREE.LinearFilter;
let tvAcc = 0;                                     // 每 0.5s 重繪一次

// 繪製出庫指示畫面（含分頁輪播與時鐘）
function updateTVTexture(t) {
    const ctx = tvCanvas.getContext('2d');
    const specials = cellMeshes.map(e => e.cell).filter(c => c.state === 'special');
    const W = tvCanvas.width, H = tvCanvas.height;

    ctx.fillStyle = '#0d1f2a';
    ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, 42);
    g.addColorStop(0, '#143342'); g.addColorStop(1, '#0d1f2a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 42);
    // 標題
    ctx.fillStyle = '#5ee08a';
    ctx.font = 'bold 26px "Segoe UI", sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('出庫指示 OUTBOUND', 18, 22);
    // 時鐘
    ctx.fillStyle = '#cfe0ec';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    const nw = new Date();
    ctx.fillText(String(nw.getHours()).padStart(2, '0') + ':' + String(nw.getMinutes()).padStart(2, '0') + ':' + String(nw.getSeconds()).padStart(2, '0'), W - 18, 22);
    // 表頭
    ctx.textAlign = 'left';
    ctx.fillStyle = '#7fc4f5';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText('儲位', 22, 58);
    ctx.fillText('物料', 258, 58);
    ctx.textAlign = 'right';
    ctx.fillText('數量', W - 22, 58);
    ctx.strokeStyle = 'rgba(127,196,245,0.35)';
    ctx.beginPath(); ctx.moveTo(18, 72); ctx.lineTo(W - 18, 72); ctx.stroke();

    if (specials.length === 0) {
        ctx.fillStyle = '#9fb4c3';
        ctx.font = '22px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('目前無出庫物料', W / 2, H * 0.55);
    } else {
        const per = 8;
        const pages = Math.ceil(specials.length / per);
        const page = Math.floor((t || 0) / 4) % pages;
        const rows = specials.slice(page * per, page * per + per);
        let y = 92;
        rows.forEach(c => {
            ctx.fillStyle = '#d9bcff';
            ctx.font = 'bold 20px "Segoe UI", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(c.location, 22, y);
            ctx.fillStyle = '#bcd0df';
            ctx.font = '17px "Segoe UI", sans-serif';
            let mat = c.material || '';
            if (mat.length > 9) mat = mat.slice(0, 8) + '…';
            ctx.fillText(mat, 258, y);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffd960';
            ctx.fillText(String(c.qty), W - 22, y);
            y += 34;
        });
        ctx.fillStyle = '#7fa0b3';
        ctx.font = '15px "Segoe UI", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('綠柱＝出貨儲位', 18, H - 12);
        ctx.textAlign = 'right';
        ctx.fillText('P' + (page + 1) + '/' + pages, W - 18, H - 12);
    }
    ctx.fillStyle = 'rgba(94,224,138,0.10)';
    ctx.fillRect(0, H - 8, W, 8);
    tvTex.needsUpdate = true;
}

