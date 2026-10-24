/* 出庫MQTT.js — 2F A/B/C/D 出庫即時看板（MQTT over WebSocket，純前端）
 * broker (10.176.33.211)；依目前倉庫訂閱對應主題（A/B/C/D → 2F-A/2F-B/2F-C/2F-D），
 * 切換倉庫時自動換訂閱；無對應主題（如 ALL）則取消訂閱並顯示「暫無出庫」。
 * 收到 outbound_scan_state / outbound_box_scanned
 * 後，把出庫明細的「儲位編號」即時顯示在左側「正在出庫」卡片，並將對應 3D 儲位標為出庫中（紫色）。
 * 不需後端；卡片 chip 沿用 #specialDetail 既有的點擊 → flyToLoc 機制。
 * 傳輸：HTTP 頁面用 ws://10.176.33.211:8083/mqtt；HTTPS 頁面用 wss://10.176.33.211:8084/mqtt。
 */
(function () {
    'use strict';

    // 各倉對應的 MQTT 主題；切換倉庫時改訂閱對應主題（ALL / 無對應者 → 不訂閱）
    var TOPIC_MAP = { A: '2F-A', B: '2F-B', C: '2F-C', D: '2F-D' };
    var currentTopic = null;   // 目前訂閱中的主題（null = 未訂閱）
    var client = null;         // mqtt client
    var URL = (location.protocol === 'https:')
        ? 'ws://10.176.33.211:8083/mqtt'
        : 'ws://10.176.33.211:8083/mqtt';
    var OPT = {
        username: 'jig',
        password: '114253..z',
        clientId: 'sd3d_' + Math.random().toString(16).slice(2, 10),
        clean: true,
        reconnectPeriod: 4000,
        connectTimeout: 8000,
        keepalive: 30
    };
    var IDLE_MS = 6000;  // 超過此時間沒有新出庫訊息 → 視為已停止出庫，清除顯示（可調）

    var state = { mo: '', items: [], summary: null, at: 0, connected: false };
    window.__mqttState = state;

    function escHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }
    function normLoc(code) {
        try { return normCode(String(code || '')); }
        catch (e) { return String(code || '').toUpperCase(); }
    }
    function cellsReady() {
        try { return (typeof cellMeshes !== 'undefined') && cellMeshes && cellMeshes.length; }
        catch (e) { return false; }
    }
    // 依正規化儲位編號找出 3D 儲位 entry
    function findEntry(code) {
        if (!cellsReady()) return null;
        var t = normLoc(code);
        for (var i = 0; i < cellMeshes.length; i++) {
            var e = cellMeshes[i];
            if (e && e.cell && normLoc(e.cell.location) === t) return e;
        }
        return null;
    }
    // MQTT 的 location_code → 3D 計畫編號（供 flyToLoc 精確比對 / 顯示）
    function planCode(code) {
        var e = findEntry(code);
        return e ? e.cell.location : String(code || '');
    }

    // ---- 3D 儲位標示（出庫中→紫色箱子 + 外框光柱 + MO 標籤）----
    var HILITE = [];     // 目前被換色的箱子 {entry, base}
    var MARKERS = [];    // 目前場上的 3D 標記 Group（外框＋光柱＋球＋MO 文字）
    var lastSig = '__none__';
    var MO_COLOR = 0xffa726;   // 出庫標記色（琥珀橘，區別綠色選取 / 紫色出庫箱）

    function disposeObj(root) {
        root.traverse(function (o) {
            if (o.geometry) { try { o.geometry.dispose(); } catch (e) {} }
            if (o.material) {
                var ms = Array.isArray(o.material) ? o.material : [o.material];
                ms.forEach(function (m) {
                    if (m.map) { try { m.map.dispose(); } catch (e) {} }
                    try { m.dispose(); } catch (e) {}
                });
            }
        });
    }
    function clearMarkers() {
        for (var i = 0; i < MARKERS.length; i++) {
            var m = MARKERS[i];
            if (m.parent) m.parent.remove(m);
            disposeObj(m);
        }
        MARKERS = [];
    }
    // 單一出庫儲位 → 3D 標記：外框 + 垂直光柱 + 頂端球 + 「MO …」標籤（world 區域座標，同 cellGroup）
    function buildOutboundMarker(entry, mo) {
        if (typeof THREE === 'undefined' || typeof world === 'undefined') return null;
        var g = new THREE.Group();
        var cw = (typeof CELL_W !== 'undefined') ? CELL_W : 1.05;
        var cd = (typeof CELL_D !== 'undefined') ? CELL_D : 1.05;
        var midY = (entry.stackMid != null) ? entry.stackMid : 1.2;
        var outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(cw * 1.18, cw * 1.18, cd * 1.18)),
            new THREE.LineBasicMaterial({ color: MO_COLOR, transparent: true, opacity: 0.95 })
        );
        outline.position.y = midY;
        g.add(outline);
        var beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 6.4, 8, 1, true),
            new THREE.MeshBasicMaterial({ color: MO_COLOR, transparent: true, opacity: 0.8 })
        );
        beam.position.y = 6.4;
        g.add(beam);
        var ball = new THREE.Mesh(
            new THREE.SphereGeometry(0.26, 14, 14),
            new THREE.MeshBasicMaterial({ color: MO_COLOR })
        );
        ball.position.y = 9.9;
        g.add(ball);
        if (typeof makeLabelSprite === 'function') {
            var label = (mo ? ('MO ' + mo) : '出庫中') + '　' + (entry.cell ? entry.cell.location : '');
            var sp = makeLabelSprite(label, '#ffd980', 4.2, 0.82);
            sp.position.y = 10.9;
            g.add(sp);
        }
        g.position.set(entry.x, 0, entry.z);
        // 隨 C 倉可視性（cellGroup 由 setWhVisible 控制）；避免切到 A/B/D 時仍顯示
        g.visible = (typeof cellGroup !== 'undefined' && cellGroup && typeof cellGroup.visible === 'boolean')
            ? cellGroup.visible : true;
        return g;
    }

    function restoreHilite() {   // 還原上一輪被換色的箱子
        for (var i = 0; i < HILITE.length; i++) {
            var h = HILITE[i];
            if (h.entry && h.entry.boxes) {
                for (var j = 0; j < h.entry.boxes.length; j++) h.entry.boxes[j].material = h.base;
            }
        }
        HILITE = [];
    }
    function clearHilite() {
        restoreHilite();
        clearMarkers();
        lastSig = '__none__';
    }

    function applyHilite() {
        restoreHilite();   // 先把上一輪箱子顏色還原，再重算
        var spMat;
        try { spMat = (typeof matSpecialBox !== 'undefined') ? matSpecialBox : null; } catch (e) { spMat = null; }

        // 收集本次出庫儲位（去重，保留原材質 base）
        var list = [], seen = {};
        state.items.forEach(function (it) {
            if (!it || !it.location_code) return;
            var e = findEntry(it.location_code);
            if (!e || !e.boxes || !e.boxes.length || seen[String(e.cell.location)]) return;
            seen[String(e.cell.location)] = 1;
            var base = e.restMat;
            if (!base) { try { base = baseMatFor(e.cell.state); } catch (e2) { base = e.boxes[0].material; } }
            list.push({ entry: e, base: base });
        });

        // 3D 標記（外框/光柱/MO）只在「儲位集合或 MO」變動時重建，避免每 2 秒重建造成負擔
        var sig = (state.mo || '') + '|' + list.map(function (x) { return x.entry.cell.location; }).sort().join(',');
        if (sig !== lastSig) {
            clearMarkers();
            if (spMat) {
                list.forEach(function (x) {
                    var mk = buildOutboundMarker(x.entry, state.mo);
                    if (mk) { world.add(mk); MARKERS.push(mk); }
                });
            }
            lastSig = sig;
        }

        // 出庫中儲位箱子 → 紫色（matSpecialBox）
        if (spMat) {
            list.forEach(function (x) {
                for (var k = 0; k < x.entry.boxes.length; k++) x.entry.boxes[k].material = spMat;
            });
        }
        HILITE = list;
    }

    // 除錯/測試掛鉤
    window.__mqttMarkers = function () {
        return MARKERS.map(function (m) {
            return { x: +m.position.x.toFixed(2), z: +m.position.z.toFixed(2), visible: m.visible, children: m.children.length };
        });
    };

    function chipHtml(it) {
        var pc = planCode(it.location_code);
        var scanned = it.status === 'scanned';
        var bg = scanned ? 'rgba(53,184,53,0.18)' : 'rgba(176,108,247,0.18)';
        var bd = scanned ? 'rgba(53,184,53,0.55)' : 'rgba(176,108,247,0.5)';
        var fg = scanned ? '#8ff0a0' : '#c99bff';
        var q = (it.qty != null && it.qty !== '') ? ' ×' + it.qty : '';
        var nm = String(it.itemnm || '').replace(/&nbsp;/gi, ' ');   // 來源資料含 &nbsp;，避免提示框顯示成 &nbsp;
        var tip = (it.item || '') + (nm ? ' ' + nm : '') + '　儲位 ' + it.location_code + q;
        return '<span data-loc="' + escHtml(pc) + '" title="' + escHtml(tip) + '" ' +
            'style="display:block;text-align:center;background:' + bg + ';border:1px solid ' + bd + ';color:' + fg +
            ';border-radius:4px;padding:2px 4px;font-size:12px;font-weight:600;line-height:1.25;white-space:normal;cursor:pointer;">' +
            '<span style="white-space:nowrap;">' + escHtml(it.location_code) + '</span>' +
            (q ? ' <span style="opacity:.7;font-size:10px;white-space:nowrap;">' + escHtml(q) + '</span>' : '') +
            '</span>';
    }

    // 由 核心.js renderSummary / setSum 尾端呼叫（fromSummary=true）；本模組即時更新時直接呼叫
    window.__mqttRenderOutbound = function (fromSummary) {
        var sd = document.getElementById('specialDetail');
        if (!sd) return;
        var items = state.items || [];

        if (!items.length) {
            if (!fromSummary) { // 逾時清空 / 切倉無主題：顯示暫無
                sd.classList.remove('special-grid');
                sd.textContent = '暫無出庫中物料';
                var sp0 = document.getElementById('sumSpecial'); if (sp0) sp0.textContent = '0';
                var sps0 = document.getElementById('sumSpecialSub'); if (sps0) sps0.textContent = '';
            }
            return; // 無 MQTT 資料時，保留 核心.js 原本內容（API special）
        }

        var pend = 0;
        items.forEach(function (i) { if (i.status !== 'scanned') pend++; });
        var sp = document.getElementById('sumSpecial');
        var sps = document.getElementById('sumSpecialSub');
        if (sp) sp.textContent = items.length;
        if (sps) sps.textContent = '待掃 ' + pend + ' / 共 ' + items.length;

        sd.classList.add('special-grid');
        var head = state.mo
            ? '<div style="grid-column:1/-1;font-size:11px;color:#8BA5B5;margin-bottom:2px;">MO ' + escHtml(state.mo) +
              '　待掃 ' + pend + ' / 共 ' + items.length + '</div>'
            : '';
        sd.innerHTML = head + items.map(chipHtml).join('');
    };

    function handle(data) {
        var m;
        try { m = JSON.parse(data); } catch (e) { return; }
        if (!m || !m.event) return;

        if (m.event === 'outbound_scan_state') {
            state.mo = m.mo || '';
            state.items = Array.isArray(m.items) ? m.items.slice() : [];
            state.summary = m.summary || null;
            state.at = Date.now();
        } else if (m.event === 'outbound_box_scanned' && m.box) {
            var box = m.box, hit = false;
            state.items.forEach(function (it) {
                if (it.box_no && box.box_no && it.box_no === box.box_no) {
                    it.status = 'scanned';
                    if (box.scan_qty != null) it.scan_qty = box.scan_qty;
                    hit = true;
                }
            });
            if (!hit && box.location_code) {
                state.items.push({
                    status: 'scanned', box_no: box.box_no, item: box.item, itemnm: box.itemnm,
                    location_code: box.location_code, qty: box.qty, scan_qty: box.scan_qty
                });
            }
            state.at = Date.now();
        } else {
            return;
        }
        applyHilite();
        window.__mqttRenderOutbound(false);
    }

    // ---- 依目前倉庫決定主題，切倉時自動換訂閱 ----
    function desiredTopic() {
        var w = 'C';
        try { if (typeof activeWh !== 'undefined' && activeWh) w = activeWh; } catch (e) {}
        return TOPIC_MAP[w] || null;   // A/B/C/D 才有主題；ALL、1F 等 → null
    }
    function doSubscribe(t) {
        if (!client || !t) return;
        client.subscribe(t, { qos: 0 }, function (err) {
            if (err) console.warn('[出庫MQTT] 訂閱失敗 ' + t, err);
            else console.log('[出庫MQTT] 已訂閱 ' + t);
        });
    }
    function doUnsubscribe(t) {
        if (!client || !t) return;
        client.unsubscribe(t, function () { console.log('[出庫MQTT] 已取消訂閱 ' + t); });
    }
    // 倉庫變更 → 清空目前出庫內容、換訂閱對應主題（無主題則取消訂閱並顯示「暫無出庫」）
    function applyWarehouse(force) {
        var t = desiredTopic();
        if (!force && !client) return;      // 尚未連線先不處理
        if (!force && t === currentTopic) return;
        var prev = currentTopic;
        state.mo = ''; state.items = []; state.summary = null; state.at = 0;
        clearHilite();
        currentTopic = t;
        if (prev && prev !== t) doUnsubscribe(prev);
        if (t && t !== prev) doSubscribe(t);
        window.__mqttRenderOutbound(false);   // 立即顯示「暫無出庫中物料」
        console.log('[出庫MQTT] 切倉 → 主題 ' + (t || '(無，未訂閱)'));
    }
    window.__mqttTopic = function () { return { topic: currentTopic, desired: desiredTopic() }; };

    function connect() {
        if (typeof mqtt === 'undefined' || !mqtt.connect) {
            console.warn('[出庫MQTT] mqtt.js 未載入，略過');
            return;
        }
        client = mqtt.connect(URL, OPT);
        window.__mqttClient = client;
        client.on('connect', function () {
            state.connected = true;
            console.log('[出庫MQTT] 已連線 ' + URL);
            applyWarehouse(true);   // 依目前倉庫訂閱對應主題
        });
        client.on('message', function (topic, payload) {
            if (currentTopic && topic !== currentTopic) return;   // 忽略殘留主題
            handle(payload.toString());
        });
        client.on('error', function (e) { console.warn('[出庫MQTT] error: ' + (e && e.message ? e.message : e)); });
        client.on('reconnect', function () { state.connected = false; });
        client.on('close', function () { state.connected = false; });
    }

    // 倉庫切換監看（涵蓋 chip / 手勢 / 樓層切換）
    setInterval(function () { applyWarehouse(false); }, 300);

    // 逾時自動清空：MQTT 只在出庫中持續發送；停止發送（無值）＝已停止出庫，清除顯示
    setInterval(function () {
        if (state.items.length && Date.now() - state.at > IDLE_MS) {
            state.items = [];
            state.mo = '';
            clearHilite();
            window.__mqttRenderOutbound(false);
            console.log('[出庫MQTT] ' + (IDLE_MS / 1000) + 's 無新訊息 → 清除出庫顯示');
        }
    }, 1500);

    // 等 init3D 建立 cellMeshes 後再連線（最多等 30 秒）
    var tries = 0;
    (function waitReady() {
        if (cellsReady() || ++tries > 60) { connect(); return; }
        setTimeout(waitReady, 500);
    })();

    console.log('[出庫MQTT] 模組載入，URL=' + URL);
})();
