// ==================== 2L 樓層：ABCD 倉 視角/顯隱/樓板（自 核心.js / 成品倉.js 拆出） ====================
function focusWarehouse(which) {
    activeWh = which;
    const w = whFitRect(which);
    godTarget.set(w.cx, w.ty, w.cz);
    godTheta = 0.65;
    godPhi = w.phi;
    godRadius = fitRadiusToBounds(w.cx, w.cz, w.hx, w.hz, godTheta, w.phi, w.ty) * 1.03;
    applyGod();
}
// ==================== 依選倉切換群組可見性（只顯示選中的倉；ALL＝全顯示） ====================
// A/D 各自群組；C＝world 下除高亮外的全部（cell/prop/地標/工人）
function setWhVisible(which) {
    // 樓層防護：非 2L（1L/3L）時 2F 的 A/B/C/D 一律隱藏。
    // 否則每 60s 的資料重建（loadData / loadDWarehouse）會呼叫 setWhVisible 把 2F 倉重新顯示；
    // 在 3F 視圖中 2F-D 被三樓樓板遮住、看起來像空白，卻仍會被 raycast 命中 →「虛空點擊」。
    if (typeof activeFloor !== 'undefined' && activeFloor !== 'L2') {
        if (awnGroup) awnGroup.visible = false;
        if (bwnGroup) bwnGroup.visible = false;
        if (dwGroup) dwGroup.visible = false;
        if (world) world.children.forEach(function (o) {
            if (o === selOutline || o === selBeacon) return;
            o.visible = false;
        });
        return;
    }
    const showA = (which === 'A' || which === 'ALL');
    const showD = (which === 'D' || which === 'ALL');
    const showB = (which === 'B' || which === 'ALL');
    const showC = (which === 'C' || which === 'ALL');
    if (awnGroup) awnGroup.visible = showA;   // A 倉
    if (bwnGroup) bwnGroup.visible = showB;   // B
    if (dwGroup) dwGroup.visible = showD;     // D 倉
    // C 倉＝world 子物件（保留 selOutline/selBeacon 高亮 overlay）
    if (world) world.children.forEach(function (o) {
        if (o === selOutline || o === selBeacon) return;
        o.visible = showC;
    });
}
function buildFloorDecks() {   // 2L 每倉樓板（scene 子、跟 FLOOR_Y；僅 L2 顯示）
    if (!scene || deckGroup) return;
    const mk = (x, z, w, d) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.4, d),
            new THREE.MeshLambertMaterial({ color: 0x22313a }));
        m.position.set(x, FLOOR_Y - 0.2, z);
        deckGroup.add(m);
    };
    mk(-240, -120, 118, 80);   // A 樓板
    mk(-120, -120, 62, 48);    // B 樓板
    mk(0, 0, 110, 94);         // C 樓板
    mk(225, 128, 64, 106);     // D 樓板
}
