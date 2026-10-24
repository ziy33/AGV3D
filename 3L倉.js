// ==================== 3F 樓層共用：三樓地板框架＋編排（各倉 3F 複本 → 3F-A/B/C/D倉.js，每倉一個 JS） ====================
let floor3Group = null, deck3Group = null;   // 三樓共用：容器 + 地板
function safeClone(obj) {   // 先暫清 userData 避免 Object3D.copy 對 userData 做 JSON.stringify 時遇 THREE 物件循環爆棧；複製完還原
    const saved = [];
    (function prep(n) { if (!n) return; saved.push([n, n.userData]); n.userData = {}; (n.children || []).forEach(prep); })(obj);
    const c = obj.clone(true);
    for (const pair of saved) pair[0].userData = pair[1];
    return c;
}
function buildFloor3() {
    if (floor3Group || !scene) return;
    floor3Group = new THREE.Group();
    scene.add(floor3Group);
    deck3Group = new THREE.Group();
    const mk = (x, z, w, d) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.4, d),
            new THREE.MeshLambertMaterial({ color: 0x1d2b33 }));
        m.position.set(x, (FLOOR_Y + 5) - 0.2, z);   // 三樓地板（頂 y≈10）
        deck3Group.add(m);
        return m;
    };
    mk(-120, -120, 62, 48);    // B 三樓地板
    mk(0, 0, 110, 94);         // C 三樓地板
    // mk(128, -50, 64, 106);  // D 三樓地板（依需求移除：不要 3F-D 下方那片地板）
    floor3Group.add(deck3Group);
    // 各倉 3F 複本 → 3F-A/B/C/D倉.js（每倉一個 JS）
    if (typeof buildFloor3A === 'function') buildFloor3A();
    if (typeof buildFloor3B === 'function') buildFloor3B();
    if (typeof buildFloor3C === 'function') buildFloor3C();
    if (typeof buildFloor3D === 'function') buildFloor3D();
    floor3Group.visible = false;
}
function setVisibleFloor3(which) {
    if (!floor3Group) return;
    floor3Group.visible = true;
    const A3 = (which === 'A' || which === 'ALL');
    const B3 = (which === 'B' || which === 'ALL');
    const C3 = (which === 'C' || which === 'ALL');
    const D3 = (which === 'D' || which === 'ALL');
    if (a3Group) a3Group.visible = A3;
    if (b3Group) b3Group.visible = B3;
    if (c3Group) c3Group.visible = C3;
    if (d3Group) d3Group.visible = D3;
}
function focusWarehouse3(which) {
    const w = whFitRect(which);
    // 3F-D 已從 2F-D 上方移到空地 (128, -50)，相機對準新位置
    const cx = (which === 'D') ? 128 : w.cx;
    const cz = (which === 'D') ? -50 : w.cz;
    const ty = w.ty + 5;   // 三樓整體 +5
    godTarget.set(cx, ty, cz);
    godTheta = 0.65;
    godPhi = w.phi;
    godRadius = fitRadiusToBounds(cx, cz, w.hx, w.hz, godTheta, w.phi, ty) * 1.03;
    applyGod();
}
