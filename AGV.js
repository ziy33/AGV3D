// 儲位看板\AGV.js — 成品倉 AGV 即時車隊（貼圖／造型完全沿用 agv_2f_3d.html 的 makeAGV）
(function () {
  // 格網→世界座標：完全一致 成品倉.js:913-915（PX=2.9,PZ=1.4,GR=30,GC=75）
  var PX = 2.9, PZ = 1.4, GR = 30, GC = 75;
  var gx = function (c) { return (c - (GC - 1) / 2) * PX; };
  var gz = function (r) { return (r - (GR - 1) / 2) * PZ; };
  var AGV_API = "http://10.176.33.77:8071/dashbordapi/whitecar";
  var TEX_BASE = "agv/";
  var AGV_Y = 0.0;        // f1Group 局部地面高度
  var AGV_SCALE = 4;      // 放大以在成品倉場景可讀（造型/貼圖比例不變）
  var AGV_SPEED = 2.0;    // 平滑移動速度（世界單位/秒）：改小＝更慢更穩，改大＝更快
  var AGV_POINTS = {};    // {點位ID: [r, c]}
  var agvGroup = null;
  var agvEntries = {};    // carId -> {group, loaded}
  var T = {};             // 貼圖

  function loadTex(name) {
    return new Promise(function (res) {
      new THREE.TextureLoader().load(TEX_BASE + name + ".png", function (t) {
        if (t && THREE.SRGBColorSpace !== undefined) t.colorSpace = THREE.SRGBColorSpace;
        T[name] = t; res(t);
      }, undefined, function () { res(null); });
    });
  }

  // ===== 完全沿用 agv_2f_3d.html makeAGV(loaded) =====
  function makeAGV(loaded) {
    var group = new THREE.Group();
    var bodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.14, 32);
    var topTex = loaded ? T.agv_top : T.agv_top_empty;
    var topMat = topTex ? new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.4, metalness: 0.1 }) : new THREE.MeshStandardMaterial({ color: 0xccccdd });
    var sideMat = T.agv_side ? new THREE.MeshStandardMaterial({ map: T.agv_side, roughness: 0.4, metalness: 0.1 }) : new THREE.MeshStandardMaterial({ color: 0xaabbcc });
    var botMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    var body = new THREE.Mesh(bodyGeo, [sideMat, topMat, botMat]);
    body.scale.set(0.9, 1, 1.1); body.position.y = 0.05; group.add(body);
    if (T.agv_front) {
      var fGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.07, 12, 1, true, -Math.PI / 4, Math.PI / 2);
      var fMesh = new THREE.Mesh(fGeo, new THREE.MeshStandardMaterial({ map: T.agv_front, roughness: 0.4, side: THREE.DoubleSide }));
      fMesh.scale.set(0.9, 1, 1.1); fMesh.position.y = 0.04; group.add(fMesh);
    }
    var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), new THREE.MeshBasicMaterial({ color: 0x33cc33 }));
    arrow.position.y = loaded ? 0.1 + 0.224 + 0.06 : 0.14 + 0.06;
    arrow.name = "statusArrow"; group.add(arrow);
    if (loaded) {
      var cw = 0.112, ch = 0.224, cd = 0.28;
      var cfMat = T.cargo_front ? new THREE.MeshStandardMaterial({ map: T.cargo_front, roughness: 0.6 }) : new THREE.MeshStandardMaterial({ color: 0x2a7a3a });
      var csMat = T.cargo_side ? new THREE.MeshStandardMaterial({ map: T.cargo_side, roughness: 0.6 }) : new THREE.MeshStandardMaterial({ color: 0x2a7a3a });
      var ctMat = new THREE.MeshStandardMaterial({ color: 0x3a8a4a, roughness: 0.6 });
      for (var i = -1; i <= 1; i++) {
        var cGeo = new THREE.BoxGeometry(cw, ch, cd);
        var cMesh = new THREE.Mesh(cGeo, [csMat, csMat, ctMat, new THREE.MeshStandardMaterial({ color: 0x222222 }), cfMat, csMat]);
        cMesh.position.set(i * (cw + 0.01), 0.1 + ch / 2, 0); group.add(cMesh);
      }
    }
    group.scale.setScalar(AGV_SCALE);
    return group;
  }

  function makeCarLabel(text) {
    var c = document.createElement("canvas"); c.width = 128; c.height = 40;
    var x = c.getContext("2d");
    x.fillStyle = "rgba(8,18,32,0.72)"; x.fillRect(0, 0, 128, 40);
    x.fillStyle = "#00e5ff"; x.font = "bold 26px sans-serif";
    x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(text), 64, 21);
    var t = new THREE.CanvasTexture(c); if (THREE.SRGBColorSpace !== undefined) t.colorSpace = THREE.SRGBColorSpace;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
    sp.scale.set(0.34, 0.11, 1);   // local（×AGV_SCALE 後約 1.36×0.44 世界單位）
    sp.position.y = 0.44;
    return sp;
  }

  function getParent() {
    return (typeof f1Group !== "undefined" && f1Group) ? f1Group : (typeof scene !== "undefined" ? scene : null);
  }

  function buildAGV() {
    if (typeof THREE === "undefined") return;
    var parent = getParent(); if (!parent) return;
    if (agvGroup && agvGroup.parent) agvGroup.parent.remove(agvGroup);
    for (var cid0 in agvEntries) delete agvEntries[cid0];
    agvGroup = new THREE.Group(); agvGroup.name = "agvFleet";
    parent.add(agvGroup);
    startAGVTick();
    Promise.all([
      loadTex("agv_top"), loadTex("agv_top_empty"), loadTex("agv_side"),
      loadTex("agv_front"), loadTex("cargo_front"), loadTex("cargo_side")
    ]).then(function () {
      return fetch(TEX_BASE + "agv_points.json", { cache: "no-store" }).then(function (r) { return r.json(); });
    }).then(function (j) { AGV_POINTS = j || {}; refreshAGVs(); })
      .catch(function (e) { console.warn("[AGV] init fail", e); });
  }

  function setArrow(arrow, st) {
    if (arrow) arrow.material.color.setHex(st < 0 ? 0xff3333 : (st === 1 ? 0x33cc33 : 0xffaa22));
  }

  function refreshAGVs() {
    if (!agvGroup || !Object.keys(AGV_POINTS).length) return;
    fetch(AGV_API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area: "SMTTempWarehouse" })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || j.code !== 0 || !j.data || !j.data.car) return;
      var seen = {};
      j.data.car.forEach(function (car) {
        var cid = String(car.carId);
        var pt = String(car.currentPoint);
        if (!AGV_POINTS[pt]) return;            // 只顯示停在已標記 84 點位上的 AGV
        seen[cid] = 1;
        var rc = AGV_POINTS[pt];
        var loaded = !!car.isLoadedGoods;
        var e = agvEntries[cid];
        if (!e) {
          var g = makeAGV(loaded); g.add(makeCarLabel(cid));
          g.position.set(gx(rc[1]), AGV_Y, gz(rc[0]));      // 新車直接放到目標位置
          g.rotation.y = (car.currentAngle || 0) * Math.PI / 180;
          agvGroup.add(g);
          e = agvEntries[cid] = { group: g, loaded: loaded };
        }
        if (e.loaded !== loaded) {
          var p = e.group.position.clone(), ry = e.group.rotation.y;
          agvGroup.remove(e.group);
          var g2 = makeAGV(loaded); g2.add(makeCarLabel(cid));
          g2.position.copy(p); g2.rotation.y = ry;
          agvGroup.add(g2); e.group = g2; e.loaded = loaded;
        }
        // 只設「目標」，實際位置由 agvTick 每幀平滑推進（不再瞬移）
        e._tx = gx(rc[1]); e._ty = AGV_Y; e._tz = gz(rc[0]);
        e._tr = (car.currentAngle || 0) * Math.PI / 180;
        setArrow(e.group.getObjectByName("statusArrow"), car.runningState);
      });
      for (var c2 in agvEntries) {
        if (!seen[c2]) { agvGroup.remove(agvEntries[c2].group); delete agvEntries[c2]; }
      }
    }).catch(function (e) { console.warn("[AGV] refresh fail", e); });
  }

  // ===== 平滑移動：每幀朝目標等速推進（取代 2 秒一次的瞬移）=====
  var _tickStarted = false, _lastT = 0;
  function agvTick(now) {
    requestAnimationFrame(agvTick);
    if (!agvGroup) return;
    var dt = _lastT ? Math.min(0.05, (now - _lastT) / 1000) : 0.016;
    _lastT = now;
    for (var cid in agvEntries) {
      var e = agvEntries[cid];
      if (e._tx === undefined) continue;
      var pos = e.group.position;
      var dx = e._tx - pos.x, dz = e._tz - pos.z;
      var dist = Math.hypot(dx, dz);
      if (dist > 0.002) {
        var step = Math.min(dist, AGV_SPEED * dt);
        pos.x += dx / dist * step;
        pos.z += dz / dist * step;
      }
      pos.y += (e._ty - pos.y) * Math.min(1, dt * 10);
      var ry = e.group.rotation.y;
      var dr = Math.atan2(Math.sin(e._tr - ry), Math.cos(e._tr - ry)); // 最短路徑
      e.group.rotation.y = ry + dr * Math.min(1, dt * 6);
    }
  }
  function startAGVTick() {
    if (!_tickStarted) { _tickStarted = true; _lastT = 0; requestAnimationFrame(agvTick); }
  }

  window.buildAGV = buildAGV;
  window.refreshAGVs = refreshAGVs;
})();
