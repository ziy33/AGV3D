// ==================== BOOT ====================
if (init3D()) {
    // 選取外框（較大，涵蓋鋼架單層）— 綠色
    selOutline = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(CELL_W * 1.16, CELL_W * 1.16, CELL_D * 1.16)),
        new THREE.LineBasicMaterial({ color: 0x00E676 })
    );
    selOutline.visible = false;
    world.add(selOutline);

    // 選取指示線：垂直綠色光柱＋頂端脈動球，高過鋼架/柱，方便在鋼架區定位
    selBeacon = new THREE.Group();
    selBeacon.add(new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 6.4, 6, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x00E676, transparent: true, opacity: 0.75 })
    ).translateY(6.2));   // 光柱約 3.0 ~ 9.4（高過柱 4.5）
    beaconBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00E676 })
    );
    beaconBall.position.y = 9.7;
    selBeacon.add(beaconBall);
    selBeacon.visible = false;
    world.add(selBeacon);

    // 3D 右手：直接掛 scene（相機 child 在部分真實瀏覽器不渲染），每幀用相機世界基向量換算位置
    fpsHand3D = buildFpsHand3D();
    scene.add(fpsHand3D);

    loadData(false);                         // 先以 mock 立即渲染
    refreshLive().then(ok => { if (ok) loadData(true); });   // 抓到即時資料後重建（僅 C 倉）
    updateTVTexture(0);
    buildAWarehouse();                       // A（僅建靜態 3D 幾何，不拉資料）
    buildBWarehouse();                       // B（全棧板＋紙盒）靜態 3D
    buildFloorDecks();
    buildBCDFloor1();                        // 1L BCD 成品倉（鋼架 4 層）
    buildRaw1Warehouse();                    // 1L 原料倉（依 1F-A倉.xlsx）
    // 依需求：loadDWarehouse()/loadAData()/buildFloor3()/buildAGV() 全部延後，切到該倉才載（見 ensureWhLoaded）
    assignIds();                             // 全場景物件補 userData.oid（除錯定位）
    setWhVisible('C');                       // 預設只顯示 C 倉
    buildFpsColliders();                     // 第一人稱碰撞盒（C 倉）
    syncFpsChip();                           // 第一人稱切換鈕文字

    // ==== 依需求：切到哪個倉，才載入/更新哪個倉的資料（避免開網頁就把全部倉別都請求一遍）====
    window._whLoaded = window._whLoaded || {};
    window.ensureWhLoaded = function (wh) {
        if (!wh) return;
        if (wh === 'ALL') { ['A', 'B', 'C', 'D', 'AGV', 'FG', 'RAW'].forEach(window.ensureWhLoaded); return; }
        if (window._whLoaded[wh]) return;
        window._whLoaded[wh] = true;
        try {
            if (wh === 'D' && typeof loadDWarehouse === 'function') loadDWarehouse();      // D 倉 SEMS 資料＋3D
            else if (wh === 'A' && typeof loadAData === 'function') loadAData();           // A 倉即時資料
            else if (wh === 'AGV' && typeof buildAGV === 'function') buildAGV();           // 成品倉 AGV 車隊
            else if (wh === 'FG' && typeof loadFgStock === 'function') loadFgStock();      // 成品倉庫存（碼頭 dock 由 setWhOption 另呼叫）
            else if (wh === 'RAW' && typeof loadRaw1Boxes === 'function' && typeof raw1Group !== 'undefined' && raw1Group) loadRaw1Boxes(raw1Group);   // 原料倉庫存
        } catch (e) { }
    };
    const _isL2 = () => (typeof activeFloor === 'undefined') || activeFloor === 'L2';
    const _isL1 = () => (typeof activeFloor !== 'undefined') && activeFloor === 'L1';
    const _fgActive = () => { const g = document.getElementById('whG'); return _isL1() && g && g.classList.contains('active'); };
    const _whOn = (w) => { const a = (typeof activeWh !== 'undefined') ? activeWh : 'C'; return a === w || a === 'ALL'; };

    setInterval(() => {
        if (_isL2() && _whOn('C')) refreshLive().then(ok => { if (ok) loadData(false); });
        if (_isL2() && _whOn('D')) { window.ensureWhLoaded('D'); loadDWarehouse(); }       // D 倉同步更新（僅在 D 倉視圖）
        if (_isL2() && _whOn('A')) { window.ensureWhLoaded('A'); loadAData(); }            // A 倉即時資料（僅在 A 倉視圖）
        if (_fgActive() && typeof loadDockData === 'function') loadDockData();             // 碼頭卡車狀態（僅成品倉視圖）
    }, REFRESH_INTERVAL);
    // 確保 A 倉 entry 始終在 cellMeshes（loadData 內的 clearCells 會 cellMeshes = []，A 屬性需重新註冊回 raycast 候選）
    setInterval(() => {
        if (typeof A_CELL_ENTRIES !== 'undefined' && typeof cellMeshes !== 'undefined' && A_CELL_ENTRIES.length) {
            for (let i = 0; i < A_CELL_ENTRIES.length; i++) {
                const e = A_CELL_ENTRIES[i];
                if (e && cellMeshes.indexOf(e) < 0) cellMeshes.push(e);
            }
        }
    }, 2000);
    // AGV 即時位置：僅在成品倉（1F）視圖才輪詢（避免在看 2F-C 時一直打 AGV 後端）
    setInterval(() => {
        if (!_fgActive()) return;
        window.ensureWhLoaded('AGV');
        if (typeof refreshAGVs === 'function') refreshAGVs();
    }, 500);
    // 除錯掛鉤（URL 帶 ?debug）
    if (/[?&]debug/.test(location.search)) {
        window.__sd3d = {
            scene: scene,
            camera: camera,
            godTarget: godTarget,
            cellMeshesRef: () => cellMeshes,
            GRID_ROWS: GRID_ROWS, GRID_COLS: GRID_COLS,
            RACK_LEVELS: RACK_LEVELS, TOTAL: TOTAL,
            RACK_CELLS: RACK_CELLS, PALLET_CELLS: PALLET_CELLS,
            selBeacon: selBeacon, selOutline: selOutline,
            flyToLoc: flyToLoc,
            // 世界座標 → 螢幕座標（用於自動化測試）
            project: function (wx, wy, wz) {
                this.camera.updateMatrixWorld();
                const v = new THREE.Vector3(wx, wy, wz).project(this.camera);
                const rect = renderer.domElement.getBoundingClientRect();
                return { x: (v.x + 1) / 2 * rect.width, y: (-v.y + 1) / 2 * rect.height };
            }
        };
    }
}

// ==================== HEADER DATETIME ====================
function updateDatetime() {
    const now = new Date();
    document.getElementById('headerDatetime').textContent =
        now.getFullYear() + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + String(now.getDate()).padStart(2, '0') + '  ' +
        String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
}
updateDatetime();
setInterval(updateDatetime, 1000);
