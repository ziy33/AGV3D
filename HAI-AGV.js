/* HAI-AGV.js — 3F-D 倉：HAI ESS 區域3 即時 AGV(kubot) 車位圖層（純前端 WebSocket，免登入）
 * 連 ws://10.176.33.77:9003/ws，送出訂閱 model_update / conveyor_update；
 * 解析 robot.zone==='3' 的即時位置(precisePosition，mm)、朝向(robot2mapTheta)、電量、負載、狀態，
 * 映射到 D 倉「局部座標」後掛到 3F D 倉複本(d3Group) 之下 → 只有切到三樓 D 倉才看得到。
 * 座標為概略對映（HAI 地圖矩形 → D 倉地板矩形）；方位不對時調整下方常數即可。
 * 前置：執行此看板的瀏覽器需能直連 10.176.33.77:9003（同內網；若掛了 OA proxy，請把 10.176.33.77 排除代理）。
 */
(function () {
    'use strict';

    var WS_URL = 'ws://10.176.33.77:9003/ws';
    var ZONE = '3';                 // 只顯示 HAI ESS 區域 3
    var RECONNECT_MS = 3000;        // 斷線重連間隔
    var STALE_MS = 8000;            // 超過此時間無更新 → 視為離線（隱藏）
    var DROP_MS = 60000;           // 超過此時間無更新 → 移除標記
    var MOVE_SPEED = 6.0;           // 平滑移動速度（局部單位/秒）
    var FLOOR_LY = 0.35;            // 車身離 D 倉地板高度（局部）

    /* ---- 叉高映射常數 ---- */
    var FORK_MM_MIN = 499, FORK_MM_MAX = 2500;   // 叉高 mm 範圍（最低 499＝出庫完成）
    var FORK_Y_MIN = 0.05, FORK_Y_MAX = 0.55;   // 叉高 Y 軸映射範圍（局部座標）
    var FORK_CARRY_Y = 0.45;   // 載貨時叉子抬高的目標高度（局部座標，可調）
    /* ---- 座標對映（HAI ESS 區域3 地圖 mm → D 倉局部座標）：方位不對就調這裡 ----
       與 3F-D 靜態 AGV 點位/儲位「同一公式」：localX = 17.5 - x + LOCAL_X_OFF；localZ = y - 17.5（x/y 皆公尺）
       否則即時車會與點位錯位（實測 y 低端偏差可達 ~1.5m） */
    var MAP_CX = 17.5;                  // 地圖中心（公尺）：local = MAP_CX - (±x)
    var FLIP_X = true,  FLIP_Z = false; // 左右鏡射：true＝與 3F-D 靜態點位同向（若即時車左右反改 false）
    var SWAP_XY = false;                // 地圖 x/y 與 D 倉軸向對調時設 true
    var THETA_OFFSET = 0;               // 車頭方向額外補償（度）
    var LOCAL_X_OFF = 1;                // 局部 X 偏移：與 3F-D 靜態 AGV 點位一致（3F-D倉 D3_AGV_X_OFF=1）

    /* ---- 狀態 ---- */
    var robots = {};    // code -> {code,x,y,theta,batt,charging,loaded,state,dest,ts}
    var markers = {};   // code -> {group,body,arrow,label,labelKey,tx,tz,ttheta,lastSeen,forkGroup}
    var layer = null;   // 掛在 d3Group 下的群組
    var rayTargets = [];  // 可點擊熱區（hit proxy mesh），供核心.js raycastMeshes 併入
    var ws = null;
    var connected = false;
    var _toteMats = null;   // 周轉箱貼圖材質快取（6 面）
    var _agvTex = null;     // 叉車車身貼圖（俯視 AGV 塗裝）

    window.__haiAgv = {
        robots: robots, markers: markers, rayTargets: rayTargets,
        connected: function () { return connected; },
        layer: function () { return layer; },
        stateLabel: stateLabel,
        cellFor: cellFor,
        nearest: nearest,
        mapXZ: mapXZ
    };

    function txt(s) { return String(s == null ? '' : s); }

    // 與 3F-D 靜態 AGV 點位/儲位「同一公式」映射，確保即時車落在點位上：
    //   靜態 3F-D倉.js：localX = 17.5 - x + D3_AGV_X_OFF；localZ = y - 17.5（x/y 皆公尺）
    function mapXZ(hx, hy) {
        var xm = hx / 1000, ym = hy / 1000;    // 地圖 mm → 公尺
        if (SWAP_XY) { var t = xm; xm = ym; ym = t; }
        var lx = (FLIP_X ? (MAP_CX - xm) : (xm - MAP_CX)) + LOCAL_X_OFF;
        var lz = FLIP_Z ? (MAP_CX - ym) : (ym - MAP_CX);
        return [lx, lz];
    }
    function forkY(mm) {
        if (mm == null || isNaN(mm)) return FORK_Y_MIN;
        var t = (mm - FORK_MM_MIN) / (FORK_MM_MAX - FORK_MM_MIN);
        if (t < 0) t = 0; if (t > 1) t = 1;
        return FORK_Y_MIN + t * (FORK_Y_MAX - FORK_Y_MIN);
    }

    function getToteMats() {
        if (_toteMats) return _toteMats;
        // 安全讀取全域貼圖變數（核心.js / 2F-D 倉.js 已載入）
        var sideTex = (typeof toteSideTex !== 'undefined') ? toteSideTex : null;
        var topTex = (typeof toteTopTex !== 'undefined') ? toteTopTex : null;
        // 若貼圖尚未載入，主動載入
        if (!sideTex) {
            sideTex = new THREE.TextureLoader().load('lib/tote_side.png?v=7', function (tex) {
                if (_toteMats) {
                    _toteMats[0].map = _toteMats[1].map = _toteMats[4].map = _toteMats[5].map = tex;
                    _toteMats[0].needsUpdate = _toteMats[1].needsUpdate = _toteMats[4].needsUpdate = _toteMats[5].needsUpdate = true;
                }
            });
            sideTex.magFilter = THREE.LinearFilter; sideTex.minFilter = THREE.LinearFilter;
        }
        if (!topTex) {
            topTex = new THREE.TextureLoader().load('lib/tote_top.png?v=7', function (tex) {
                if (_toteMats) {
                    _toteMats[2].map = _toteMats[3].map = tex;
                    _toteMats[2].needsUpdate = _toteMats[3].needsUpdate = true;
                }
            });
            topTex.magFilter = THREE.LinearFilter; topTex.minFilter = THREE.LinearFilter;
        }
        const mtT = { transparent: true };
        _toteMats = [
            new THREE.MeshLambertMaterial(Object.assign({ map: sideTex }, mtT)),  // +X
            new THREE.MeshLambertMaterial(Object.assign({ map: sideTex }, mtT)),  // -X
            new THREE.MeshLambertMaterial(Object.assign({ map: topTex }, mtT)),   // +Y 頂
            new THREE.MeshLambertMaterial(Object.assign({ map: topTex }, mtT)),   // -Y 底
            new THREE.MeshLambertMaterial(Object.assign({ map: sideTex }, mtT)),  // +Z
            new THREE.MeshLambertMaterial(Object.assign({ map: sideTex }, mtT))   // -Z
        ];
        return _toteMats;
    }

    function getAgvTex() {
        if (_agvTex) return _agvTex;
        _agvTex = new THREE.TextureLoader().load('lib/agv_top.png?v=1');
        if (THREE.SRGBColorSpace !== undefined) _agvTex.colorSpace = THREE.SRGBColorSpace;
        return _agvTex;
    }


    function stateColor(r) {
        if (r.charging) return 0x3aa0ff;
        if (r.state === 'EXECUTING' || r.state === 'MOVING') return 0x35c24a;
        if (r.state === 'AWAITING') return 0xffb020;
        return 0x9fb0bd;
    }

    function stateLabel(r) {
        if (!r) return '離線';
        if (r.charging) return '充電中';
        if (r.state === 'EXECUTING') return '執行中';
        if (r.state === 'MOVING') return '移動中';
        if (r.state === 'AWAITING') return '待機';
        return r.state ? r.state : '未知';
    }

    function matNeon(hex) { return new THREE.MeshBasicMaterial({ color: hex }); }  // 發光件用 Basic（不需後處理就很亮）


    /* 產生核心.js 用的「即時車格位」物件（kind:'HAI'） */
    function cellFor(code) {
        var r = robots[code] || null;
        var p = r ? mapXZ(r.x, r.y) : null;
        return {
            location: 'AGV ' + (code || '?'), kind: 'HAI', state: 'point', code: code,
            haiState: r ? txt(r.state) : '',
            stateLabel: stateLabel(r),
            batt: r ? r.batt : null, charging: r ? !!r.charging : false, loaded: r ? !!r.loaded : false,
            dest: r ? txt(r.dest) : '',
            online: !!(r && (Date.now() - (r.ts || 0)) < STALE_MS),
            localX: p ? p[0] : null, localZ: p ? p[1] : null,
            mapX: r ? r.x : null, mapY: r ? r.y : null,
            theta: r ? r.theta : null,
            forkAng: r ? r.forkAng : null,
            forkHeight: r ? r.forkHeight : null,
        };
    }

    /* 找最近即時車（比較目前平滑渲染位置）；回傳 code 或 null */
    function nearest(lx, lz, maxDist) {
        var best = null, bd = 1e9;
        for (var c in markers) {
            var m = markers[c];
            if (!m || !m.group) continue;
            var d = Math.hypot(m.group.position.x - lx, m.group.position.z - lz);
            if (d < bd) { bd = d; best = c; }
        }
        return (best && bd <= maxDist) ? best : null;
    }

    /* ---- D 倉「正在出庫」：即時車載貨中 (loaded) → 顯示「目的地」(destPoint，要去哪) ---- */
    var OB_SLOT_MAX = 0.35;   // 舊：dest 點位對到儲位的最大容差（公尺，保留備查）
    var OB_CUR_MAX = 2.5;     // 舊：「目前位置」對到最近儲位的最大容差（公尺，保留備查）
    var OB_DEST_MAX = 1.0;    // 「目的地」destPoint 對到儲位的最大容差（公尺）
    var FORK_LOW = 499;       // otherHardwareInfo.forkHeight 最低值：降到最低＝取貨完成（保留備查）
    var _obSig = '__none__';
    var _obT = 0;

    function parsePointDest(s) {
        var m = /POINT:(\d+):(\d+)/.exec(txt(s));
        if (!m) return null;
        return { x: parseInt(m[1], 10) / 1000, y: parseInt(m[2], 10) / 1000 };  // mm→m（同 D倉_儲位 座標系）
    }

    function escA(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function collectOutbound() {
        var out = [];
        if (typeof d3SlotAt !== 'function') return out;
        for (var c in robots) {
            var r = robots[c];
            if (!r || !r.loaded) continue;                          // 只要載著貨（載貨=是）即視為正在出庫
            var dp = parsePointDest(r.dest);                        // 目的地（要去哪）= destPoint
            var s = dp ? d3SlotAt(dp.x, dp.y, OB_DEST_MAX) : null;  // 目的地對到儲位才顯示儲位號（同座標系：mm→m）
            out.push({ agv: c, slot: s ? s.code : '', dest: txt(r.dest), dx: dp ? dp.x : null, dy: dp ? dp.y : null });
        }
        return out;
    }

    /* 更新左側「正在出庫」面板（僅在檢視 D 倉時覆蓋預設文案） */
    function renderOutbound() {
        var sd = (typeof document !== 'undefined') ? document.getElementById('specialDetail') : null;
        if (!sd) return;
        try { if (typeof currentWH !== 'undefined' && currentWH !== 'D') return; } catch (e) { }
        var out = collectOutbound();
        var sig = out.map(function (o) { return o.agv + '>' + o.slot + '>' + (o.dest || ''); }).sort().join(',');
        if (sig === _obSig) return;
        _obSig = sig;
        var sp = document.getElementById('sumSpecial');
        var sps = document.getElementById('sumSpecialSub');
        if (!out.length) {
            if (sp) sp.textContent = '0';
            if (sps) sps.textContent = '目前無載貨車輛';
            sd.classList.remove('special-grid');
            sd.textContent = 'D 倉無出庫中物料';
            return;
        }
        if (sp) sp.textContent = out.length;
        if (sps) sps.textContent = '出庫中';
        sd.classList.add('special-grid');
        sd.innerHTML = out.map(function (o) {
            var label = o.slot || '出庫口';
            var destTxt = o.slot ? ('儲位 ' + o.slot) : (o.dx != null ? ('出庫口 ' + o.dx.toFixed(2) + ', ' + o.dy.toFixed(2) + ' m') : (o.dest || '—'));
            var tip = 'AGV ' + o.agv + ' 載貨中　目的地：' + destTxt;
            return '<span' + (o.slot ? ' data-loc="' + escA(o.slot) + '"' : '') + ' title="' + escA(tip) + '" ' +
                'style="display:block;text-align:center;background:rgba(176,108,247,0.18);border:1px solid rgba(176,108,247,0.5);color:#c99bff;border-radius:4px;padding:3px 6px;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;">' +
                '<span style="white-space:nowrap;">' + escA(label) + '</span>' +
                '<span style="opacity:.7;font-size:10px;display:block;white-space:nowrap;">' + escA(o.agv) + '</span>' +
                '</span>';
        }).join('');
    }
    window.__haiRenderOutbound = renderOutbound;

    function makeLabel(code, batt, stat) {
        var c = document.createElement('canvas'); c.width = 256; c.height = 96;
        var x = c.getContext('2d');
        x.fillStyle = 'rgba(6,20,34,0.78)'; x.fillRect(0, 0, 256, 96);
        // Row1：車號（左，青色）＋ 電量%（右，琥珀）
        x.font = 'bold 30px sans-serif'; x.textBaseline = 'middle';
        x.fillStyle = '#28e0ff'; x.textAlign = 'left';
        x.fillText(txt(code), 8, 26);
        x.fillStyle = '#ffd166'; x.textAlign = 'right';
        x.fillText((batt == null ? '-' : batt) + '%', 248, 26);
        // Row2：狀態（左，淺藍白）
        x.fillStyle = '#e8f4ff'; x.font = 'bold 26px sans-serif';
        x.textAlign = 'left'; x.textBaseline = 'middle';
        x.fillText(txt(stat), 8, 66);
        var t = new THREE.CanvasTexture(c);
        if (THREE.SRGBColorSpace !== undefined) t.colorSpace = THREE.SRGBColorSpace;
        var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
        sp.scale.set(2.6, 0.97, 1);
        sp.position.y = 1.55;
        return sp;
    }

    function buildMarker(r) {
        var g = new THREE.Group();
        var stateHex = stateColor(r);
        // 材質 — 深色亮面車身 + 發光霓虹
        var matBodyDark = new THREE.MeshStandardMaterial({ color: 0x3a8dff, metalness: 0.3, roughness: 0.35, emissive: 0x0a2f6e, emissiveIntensity: 0.25 });   // 主體外殼：明亮電光藍（無環境貼圖時仍顯藍）
        var matDark = new THREE.MeshStandardMaterial({ color: 0x2a6fd6, metalness: 0.3, roughness: 0.4 });        // 次要配件：中亮藍（上蓋/門架/橫樑）
        var matMetal = new THREE.MeshStandardMaterial({ color: 0x3a4750, metalness: 0.4, roughness: 0.45 });        // 貨叉：槍灰色金屬
        // 車身（chassis）
        var body = new THREE.Mesh(
            new THREE.BoxGeometry(0.34, 0.16, 0.46),
            matBodyDark
        );
        body.userData = { cat: 'haiAgv', agvCode: r.code };
        body.position.set(0, 0.10, -0.04); g.add(body);
        // 頂部甲板
        var topDeck = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.02, 0.42), matDark);
        topDeck.position.set(0, 0.19, -0.04); g.add(topDeck);
        // 霓虹側軌（發光件）
        var neonSideL = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.022, 0.40), matNeon(stateHex));
        neonSideL.position.set(0.172, 0.10, -0.02); g.add(neonSideL);
        var neonSideR = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.022, 0.40), matNeon(stateHex));
        neonSideR.position.set(-0.172, 0.10, -0.02); g.add(neonSideR);
        // 霓虹前 bar
        var neonFront = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.02, 0.008), matNeon(stateHex));
        neonFront.position.set(0, 0.10, 0.229); g.add(neonFront);
        // 底盤發光板（underglow）
        var glow = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.004, 0.52),
            new THREE.MeshBasicMaterial({ color: stateHex, transparent: true, opacity: 0.35 }));
        glow.position.set(0, 0.006, -0.02); g.add(glow);
        // LiDAR 光達轉塔（無人駕駛感）：基座 + 玻璃罩 + 發光環
        var sensorTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 16), matDark);
        sensorTurret.position.set(0, 0.215, -0.24); g.add(sensorTurret);
        var lidarGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 16),
            new THREE.MeshStandardMaterial({ color: 0x0b2a3a, metalness: 0.6, roughness: 0.15, transparent: true, opacity: 0.85 }));
        lidarGlass.position.set(0, 0.255, -0.24); g.add(lidarGlass);
        var lidarRing = new THREE.Mesh(new THREE.TorusGeometry(0.047, 0.006, 8, 24), matNeon(stateHex));
        lidarRing.rotation.x = Math.PI / 2; lidarRing.position.set(0, 0.24, -0.24); g.add(lidarRing);
        // 桅柱（mast）— 兩根立柱
        var mastL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.52, 0.03), matDark);
        mastL.position.set(0.09, 0.30, 0.16); g.add(mastL);
        var mastR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.52, 0.03), matDark);
        mastR.position.set(-0.09, 0.30, 0.16); g.add(mastR);
        // 桅柱霓虹條
        var mastNeonL = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.50, 0.008), matNeon(stateHex));
        mastNeonL.position.set(0.09, 0.30, 0.178); g.add(mastNeonL);
        var mastNeonR = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.50, 0.008), matNeon(stateHex));
        mastNeonR.position.set(-0.09, 0.30, 0.178); g.add(mastNeonR);
        // 叉組（forkGroup）— 可升降的叉架
        var forkGroup = new THREE.Group();
        // 橫樑（深色）
        var carriage = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.05), matDark);
        carriage.position.set(0, 0, 0.19); forkGroup.add(carriage);
        // 左叉（金屬）
        var forkL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.30), matMetal);
        forkL.position.set(0.085, -0.01, 0.36); forkGroup.add(forkL);
        // 右叉（金屬）
        var forkR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.30), matMetal);
        forkR.position.set(-0.085, -0.01, 0.36); forkGroup.add(forkR);
        // 叉尖霓虹
        var forkTipL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.03), matNeon(stateHex));
        forkTipL.position.set(0.085, -0.005, 0.50); forkGroup.add(forkTipL);
        var forkTipR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.03), matNeon(stateHex));
        forkTipR.position.set(-0.085, -0.005, 0.50); forkGroup.add(forkTipR);
        // 負載托盤 — 永遠建立，由 visible 控制顯示（周轉箱貼圖）
        var tray = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.20, 0.42), getToteMats());
        tray.position.set(0, 0.12, 0.30);
        tray.visible = !!r.loaded;          // 載貨才顯示貨物
        forkGroup.add(tray);
        forkGroup.position.y = r.loaded ? FORK_CARRY_Y : FORK_Y_MIN; g.add(forkGroup);
        // 方向錐（向後指示，指向 +z）
        var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), matNeon(stateHex));
        arrow.position.set(0, 0.22, -0.30); arrow.rotation.x = Math.PI / 2; g.add(arrow);
        // 點擊熱區（透明代理）：mesh.visible 保持 true，僅 material.visible=false
        var hit = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.6, 12),
            new THREE.MeshBasicMaterial({ visible: false }));
        hit.position.y = 0.3; hit.userData = { cat: 'haiAgv', agvCode: r.code };
        g.add(hit); rayTargets.push(hit);
        // 標籤
        var label = makeLabel(r.code, r.batt, stateLabel(r)); g.add(label);
        g.position.y = FLOOR_LY;
        // 收集所有霓虹件（用於 syncMarker 更新顏色）
        var neon = [neonSideL, neonSideR, neonFront, lidarRing, mastNeonL, mastNeonR, forkTipL, forkTipR, arrow];
        return { group: g, body: body, arrow: arrow, label: label, hit: hit, forkGroup: forkGroup, tray: tray, neon: neon, glow: glow, labelKey: r.code + '|' + r.batt + '|' + stateLabel(r) };
    }

    function syncMarker(r) {
        var m = markers[r.code];
        var p = mapXZ(r.x, r.y);
        if (!m) {
            if (!layer) return;                  // d3Group 尚未建立 → 僅記錄，待 ensureLayer 補建
            m = buildMarker(r);
            m.group.position.set(p[0], FLOOR_LY, p[1]);
            layer.add(m.group);
            markers[r.code] = m;
        }
        // 更新霓虹件顏色（含方向錐）
        if (m.neon) { for (var j = 0; j < m.neon.length; j++) { try { m.neon[j].material.color.setHex(stateColor(r)); } catch (e) { } } }
        m.tx = p[0]; m.tz = p[1];
        m.ttheta = (isNaN(r.theta) ? 0 : r.theta + THETA_OFFSET) * Math.PI / 180;
        m.lastSeen = Date.now();
        // 叉高動畫目標
        if (m.forkGroup) {
            m.forkTY = r.loaded ? FORK_CARRY_Y : FORK_Y_MIN;
        }
        // 載貨狀態即時反映
        if (m.tray) m.tray.visible = !!r.loaded;
        var key = r.code + '|' + r.batt + '|' + stateLabel(r);
        if (m.labelKey !== key) {                 // 電量/狀態變動才重建標籤，省資源
            m.group.remove(m.label);
            try { m.label.material.map.dispose(); m.label.material.dispose(); } catch (e) { }
            m.label = makeLabel(r.code, r.batt, stateLabel(r));
            m.group.add(m.label);
            m.labelKey = key;
        }
    }

    function handleFrame(data) {
        var d;
        try { d = JSON.parse(data); } catch (e) { return; }
        var cur = d && d.current; if (!cur) return;
        var rob = cur.robot; if (!rob) return;                     // 只挑機器人訊框
        if (txt(rob.zone) !== ZONE) return;                        // 只收區域 3
        var pos = rob.precisePosition || {};
        var r = {
            code: txt(cur.code || rob.code),
            x: parseFloat(pos.x), y: parseFloat(pos.y),
            theta: parseFloat(rob.robot2mapTheta),
            forkAng: parseFloat(rob.fork2robotTheta),
            batt: rob.energyLevel,
            charging: !!rob.isCharging,
            state: txt(rob.state),
            dest: txt(rob.destPoint),
            forkHeight: (rob.otherHardwareInfo && rob.otherHardwareInfo.forkHeight != null)
                ? parseInt(rob.otherHardwareInfo.forkHeight, 10) : null,
            loaded: !!(rob.trayLoadingContainerCode && Object.keys(rob.trayLoadingContainerCode).length),
            ts: Date.now()
        };
        if (!r.code || isNaN(r.x) || isNaN(r.y)) return;
        robots[r.code] = r;
        syncMarker(r);
    }

    function ensureLayer() {
        if (layer && layer.parent) return;
        if (layer && !layer.parent) { markers = {}; window.__haiAgv.markers = markers; rayTargets.length = 0; layer = null; }  // d3Group 被重建 → 重掛
        var d3 = null;
        try { d3 = (typeof d3Group !== 'undefined') ? d3Group : null; } catch (e) { d3 = null; }
        if (!d3) return;                                            // 3F D 倉複本尚未建立
        layer = new THREE.Group(); layer.name = 'haiAgvLayer';
        d3.add(layer);
        for (var k in robots) syncMarker(robots[k]);               // 補建既有資料的標記
    }

    function connect() {
        if (typeof WebSocket === 'undefined') return;
        try { ws = new WebSocket(WS_URL); } catch (e) { setTimeout(connect, RECONNECT_MS); return; }
        ws.onopen = function () {
            connected = true;
            try {
                ws.send(JSON.stringify({ model_update: 'model_update' }));
                ws.send(JSON.stringify({ conveyor_update: 'conveyor_update' }));
            } catch (e) { }
            console.log('[HAI-AGV] 已連線 ' + WS_URL);
        };
        ws.onmessage = function (ev) { handleFrame(ev.data); };
        ws.onerror = function () { /* 交由 onclose 重連 */ };
        ws.onclose = function () { connected = false; setTimeout(connect, RECONNECT_MS); };
    }

    /* ---- 每幀平滑移動 + 離線處理 ---- */
    var lastT = 0;
    function tick(now) {
        requestAnimationFrame(tick);
        if (typeof THREE === 'undefined') return;
        ensureLayer();
        var _obNow = Date.now();
        if (_obNow - _obT > 800) { _obT = _obNow; try { renderOutbound(); } catch (e) { } }   // D 倉「正在出庫」面板（節流）
        if (!layer) return;
        var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016; lastT = now;
        var nowMs = _obNow;
        for (var code in markers) {
            var m = markers[code];
            var pos = m.group.position;
            var mdx = 0, mdz = 0, mdist = 0;
            if (m.tx !== undefined) {
                mdx = m.tx - pos.x; mdz = m.tz - pos.z; mdist = Math.hypot(mdx, mdz);
                if (mdist > 0.002) { var step = Math.min(mdist, MOVE_SPEED * dt); pos.x += mdx / mdist * step; pos.z += mdz / mdist * step; }
            }
            // 車頭朝向＝實際前進方向：移動中以位移向量為準；靜止時沿用最後前進方向；尚未移動過才用回報車頭朝向
            var desiredYaw;
            if (mdist > 0.08) { desiredYaw = Math.atan2(mdx, mdz); m.lastYaw = desiredYaw; }
            else if (m.lastYaw !== undefined) { desiredYaw = m.lastYaw; }
            else if (m.ttheta !== undefined) { desiredYaw = m.ttheta; }
            else { desiredYaw = m.group.rotation.y; }
            var ry = m.group.rotation.y;
            var dr = Math.atan2(Math.sin(desiredYaw - ry), Math.cos(desiredYaw - ry));  // 最短路徑
            m.group.rotation.y = ry + dr * Math.min(1, dt * 6);
            // 叉高動畫：平滑移向目標 Y
            if (m.forkGroup && m.forkTY !== undefined) {
                m.forkGroup.position.y += (m.forkTY - m.forkGroup.position.y) * Math.min(1, dt * 4);
            }
            // 底盤發光呼吸效果（sci-fi  alive 感）
            if (m.glow) m.glow.material.opacity = 0.22 + 0.16 * (0.5 + 0.5 * Math.sin(now * 0.004));
            var age = nowMs - (m.lastSeen || 0);
            if (age > DROP_MS) {
                layer.remove(m.group);
                var hi = rayTargets.indexOf(m.hit);
                if (hi >= 0) rayTargets.splice(hi, 1);
                delete markers[code];
            }
            else { m.group.visible = age < STALE_MS; }
        }
    }

    requestAnimationFrame(tick);
    connect();
    console.log('[HAI-AGV] 模組載入 URL=' + WS_URL + '（區域 ' + ZONE + '）');
})();


