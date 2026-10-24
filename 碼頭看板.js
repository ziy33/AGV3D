// ==================== 碼頭大顯示器（空地・無邊框 billboard） ====================
// 位置：成品倉東側空地（世界座標 x≈315, z≈-44，源自 debug 點的空地；y 為懸浮高度，可調）。
// 形式：無邊框發光薄板，永遠正對鏡頭（billboard，同 C/D 倉大看板；animate→updateBoards 每幀對齊）。
// 內容：碼頭號(船代) | 車牌 | 提貨時間 | 狀態，全部碼頭依 船代 DESC 排序、自動翻頁。
// 資料：http://10.176.33.211:1102/wh_cang/api/api.php?action=dock（與 成品倉 dock 共用同一唯讀 API，無新增後端）。
// 說明：船代(ag)=實際停靠碼頭號(berth)，車未入區時為空 → 碼頭號欄回退顯示 編號(排队号)，
//       有 berth 者排最上（船代 DESC），其後依 編號 DESC。

const MDT_POS = new THREE.Vector3(347.42, 45, -17.7);  // 顯示器中心（世界座標）＝使用者指定 成品倉 r=2 c=53 空地(x≈347,z≈-17.7)；y=45 懸浮高於屋頂、確保不被擋
const MDT_W = 20, MDT_H = 11;                       // 板尺寸（世界單位）
const MDT_CW = 1280, MDT_CH = 720;                 // canvas 解析度
const MDT_PER = 12;                                // 每頁列數（自動翻頁）

let mdtBoard = null, mdtCanvas = null, mdtTex = null, mdtTimer = null;
let mdtRows = [];                                  // [{no,ag,plate,atime,status}] 依 船代 desc
let mdtLoaded = false;

function mdtStatusColor(st) {
    st = String(st || '');
    if (st.indexOf('已放行') >= 0) return '#35e07a';
    if (st.indexOf('已裝好貨') >= 0) return '#5bc0ff';
    if (st.indexOf('待入區') >= 0) return '#ffb02e';
    return st ? '#ffffff' : '#5b6b7a';
}

function buildDockDisplay() {
    if (!scene || !camera) return;
    if (mdtBoard) { scene.remove(mdtBoard); mdtBoard = null; }
    mdtBoard = new THREE.Group();
    mdtBoard.position.copy(MDT_POS);

    mdtCanvas = document.createElement('canvas');
    mdtCanvas.width = MDT_CW; mdtCanvas.height = MDT_CH;
    mdtTex = new THREE.CanvasTexture(mdtCanvas);
    mdtTex.minFilter = THREE.LinearFilter;

    // 無邊框：僅一塊發光薄板（無實體外框盒體），正面對鏡頭
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(MDT_W, MDT_H),
        new THREE.MeshBasicMaterial({ map: mdtTex, side: THREE.DoubleSide })
    );
    screen.userData.cat = 'tv';
    mdtBoard.add(screen);

    mdtBoard.userData.isBoard = true;
    scene.add(mdtBoard);
    (window.__dbb = window.__dbb || []).push(mdtBoard);   // 交給 updateBoards 每幀對齊鏡頭

    if (mdtTimer) clearInterval(mdtTimer);
    mdtTimer = setInterval(function () { updateDockDisplayBoard(performance.now() / 1000); }, 500);
    updateDockDisplayBoard(0);
}

function updateDockDisplayBoard(t) {
    if (!mdtCanvas || !mdtTex) return;
    const ctx = mdtCanvas.getContext('2d');
    const W = MDT_CW, H = MDT_CH;
    const F = '"Microsoft JhengHei","Segoe UI",sans-serif';
    const pad = function (n) { return String(n).padStart(2, '0'); };

    ctx.fillStyle = '#0d1f2a';
    ctx.fillRect(0, 0, W, H);
    // 標題列
    const g = ctx.createLinearGradient(0, 0, 0, 56);
    g.addColorStop(0, '#143342'); g.addColorStop(1, '#0d1f2a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 56);
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#5ee08a';
    ctx.font = 'bold 34px ' + F;
    ctx.textAlign = 'left';
    ctx.fillText('碼頭 DOCK', 26, 28);
    // 時鐘（右）
    const nw = new Date();
    ctx.fillStyle = '#cfe0ec';
    ctx.font = '22px "Segoe UI",sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(nw.getFullYear() + '-' + pad(nw.getMonth() + 1) + '-' + pad(nw.getDate()) + ' ' +
        pad(nw.getHours()) + ':' + pad(nw.getMinutes()) + ':' + pad(nw.getSeconds()), W - 26, 28);
    // 表頭（四欄）
    const X1 = 26, X2 = 360, X3 = 620, X4 = 1000;
    ctx.fillStyle = '#7fc4f5';
    ctx.font = 'bold 24px ' + F;
    ctx.textAlign = 'left';
    ctx.fillText('碼頭號', X1, 84);
    ctx.fillText('車牌', X2, 84);
    ctx.fillText('提貨時間', X3, 84);
    ctx.fillText('狀態', X4, 84);
    ctx.strokeStyle = 'rgba(127,196,245,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, 102); ctx.lineTo(W - 20, 102); ctx.stroke();

    if (!mdtLoaded) {
        ctx.fillStyle = '#9fb4c3'; ctx.font = '26px ' + F; ctx.textAlign = 'center';
        ctx.fillText('載入碼頭資料中…', W / 2, H * 0.55);
    } else if (mdtRows.length === 0) {
        ctx.fillStyle = '#9fb4c3'; ctx.font = '26px ' + F; ctx.textAlign = 'center';
        ctx.fillText('目前無碼頭資料', W / 2, H * 0.55);
    } else {
        const pages = Math.max(1, Math.ceil(mdtRows.length / MDT_PER));
        const page = Math.floor((t || 0) / 4) % pages;
        const start = page * MDT_PER;
        const rowH = 46;
        let y = 132;
        for (let i = 0; i < MDT_PER && (start + i) < mdtRows.length; i++) {
            const r = mdtRows[start + i];
            if ((start + i) % 2 === 0) { ctx.fillStyle = 'rgba(127,196,245,0.06)'; ctx.fillRect(14, y - 23, W - 28, 46); }
            ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
            ctx.fillStyle = '#ffd960'; ctx.font = 'bold 24px ' + F;
            ctx.fillText(r.ag || r.no || '—', X1, y);   // 船代(berth)，空則顯示 編號
            ctx.fillStyle = '#d9bcff'; ctx.font = '22px ' + F;
            ctx.fillText(r.plate || '—', X2, y);
            ctx.fillStyle = '#bcd0df'; ctx.font = '20px "Segoe UI",sans-serif';
            ctx.fillText(r.atime || '—', X3, y);
            ctx.fillStyle = mdtStatusColor(r.status); ctx.font = 'bold 22px ' + F;
            ctx.fillText(r.status || '—', X4, y);
            y += rowH;
        }
        // 頁碼（底部）
        ctx.fillStyle = '#7fa0b3'; ctx.font = '18px ' + F; ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.fillText('P' + (page + 1) + '/' + pages + ' ・ 共 ' + mdtRows.length + ' 筆', W - 26, H - 22);
        ctx.textAlign = 'left';
        ctx.fillText('依 船代 DESC 排序', 26, H - 22);
    }
    // 發光綠色邊緣＋外圈柔光（無邊框感：非實體框體，僅 emissive 勾邊，方便在暗景中一眼定位）
    ctx.strokeStyle = 'rgba(94,224,138,0.22)';
    ctx.lineWidth = 14;
    ctx.strokeRect(9, 9, W - 18, H - 18);
    ctx.strokeStyle = 'rgba(94,224,138,0.85)';
    ctx.lineWidth = 5;
    ctx.strokeRect(4, 4, W - 8, H - 8);
    ctx.fillStyle = 'rgba(94,224,138,0.18)';
    ctx.fillRect(0, H - 8, W, 8);
    mdtTex.needsUpdate = true;
}

function refreshDockDisplay() {
    fetch('http://10.176.33.211:1102/wh_cang/api/api.php?action=dock', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
        if (!d || !d.docks) return;
        const arr = [];
        Object.keys(d.docks).forEach(function (key) {
            const r = d.docks[key];
            if (!r) return;
            arr.push({
                no: String(key),                                          // 編號（dock slot / 排队号）
                ag: String(r.ag != null ? r.ag : '').trim(),              // 船代＝實際停靠碼頭號(berth)
                plate: String(r.plate != null ? r.plate : '').trim(),
                atime: String(r.atime != null ? r.atime : '').trim(),
                status: String(r.status != null ? r.status : '').trim()
            });
        });
        // ORDER BY 船代 DESC（berth 优先）；船代空者置底，再依 編號 DESC
        arr.sort(function (a, b) {
            const ah = a.ag ? 1 : 0, bh = b.ag ? 1 : 0;
            if (ah !== bh) return bh - ah;
            if (ah && bh) {
                const an = parseFloat(a.ag), bn = parseFloat(b.ag);
                if (!isNaN(an) && !isNaN(bn)) return bn - an;
                return String(b.ag).localeCompare(String(a.ag));
            }
            const an2 = parseFloat(a.no), bn2 = parseFloat(b.no);
            if (!isNaN(an2) && !isNaN(bn2)) return bn2 - an2;
            return 0;
        });
        mdtRows = arr;
        mdtLoaded = true;
        updateDockDisplayBoard(performance.now() / 1000);
    }).catch(function () {});
}
