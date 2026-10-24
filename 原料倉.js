// 原料倉（1F）依新地圖重寫：
//   36 行 × 28 列；主鋼架 A-L（行 1-17 跨列 7-28），Q/S/R 條形小鋼架（列 1-3），
//   IQC檢驗區域（行 18-26）、退運區域（行 28-36）。
//   A/B/C 採 C倉.js 貨架樣式（綠柱、綠層板、藍橫樑，2.4m 高 5 層）；
//   D-L + Q/S/R 採原 原料倉.js 鋼架樣式（灰柱、藍框、橙層板，5.0m 高 5 層）。

const RAW1_CX = -180, RAW1_CZ = 0;

const RAW1_COLS = 28;
const RAW1_ROWS = 36;
const RAW1_PX = 1.5;
const RAW1_ZS = 1.3;

// 左側摘要用：已使用儲位數 = 3D 儲位號中有對應到 API(SLoc=100Y) 的數量（由 loadRaw1Boxes 更新）
var RAW1_USED = 0;
const cx = (c) => (c - (RAW1_COLS + 1) / 2) * RAW1_PX;       // col 1→-20.25, col 28→+20.25
const cz = (r) => (r - (RAW1_ROWS + 1) / 2) * RAW1_ZS;       // row 1→-22.75, row 36→+22.75

// 12 座主鋼架：多段以避開柱子
const RAW1_MAIN = [
    { name: 'A', row: 1,  segs: [[8,12],[14,18],[20,24],[26,28]], style: 'steel' },
    { name: 'B', row: 2,  segs: [[7,28]],                          style: 'steel' },
    { name: 'C', row: 4,  segs: [[7,28]],                          style: 'steel' },
    { name: 'D', row: 5,  segs: [[7,28]],                          style: 'steel' },
    { name: 'E', row: 7,  segs: [[7,28]],                          style: 'steel' },
    { name: 'F', row: 8,  segs: [[8,12],[14,18],[20,24],[26,28]], style: 'steel' },
    { name: 'G', row: 10, segs: [[7,28]],                          style: 'steel' },
    { name: 'H', row: 11, segs: [[7,28]],                          style: 'steel' },
    { name: 'I', row: 13, segs: [[7,28]],                          style: 'steel' },
    { name: 'J', row: 14, segs: [[8,12],[14,18],[20,24],[26,28]], style: 'steel' },
    { name: 'K', row: 16, segs: [[7,28]],                          style: 'steel' },
    { name: 'L', row: 17, segs: [[7,28]],                          style: 'steel' }
];

// 柱子：欄 [7,13,19,25]（間距 +6，等比例）；列 A/F/J(1,8,14) 再延伸進 IQC/退運 區(20,26,32)
const RAW1_PILLAR_COLS = [7, 13, 19, 25];
const RAW1_PILLAR_ROWS = [1, 8, 14, 20, 26, 32];

// Q/S/R 條形小鋼架（列 1-3）
const RAW1_STRIP = {
    Q: { rows: [1, 2, 7, 8, 10, 11, 13, 14],                            c0: 1, c1: 3 },
    S: { rows: [4, 5],                                                  c0: 1, c1: 3 },
    R: { rows: [16, 17, 19, 20, 22, 23, 25, 26, 28, 29, 31, 32, 34, 35], c0: 1, c1: 3 }
};

// IQC + 退運區域
const RAW1_FACILITY = [
    { r0: 18, r1: 26, c0: 7, c1: 28, name: 'IQC檢驗區域', color: 0x2a3540 },
    { r0: 28, r1: 36, c0: 7, c1: 28, name: '退運區域',   color: 0x5a3a3a }
];

// 儲位碼對照表（key = "row_col"，value = SAP StorageBin）
const RAW1_SLOT_CODES = {
    "1_1":"1Q0101A","1_2":"1Q0102A","1_3":"1Q0103A","1_8":"1A01A","1_9":"1A02A","1_10":"1A03A","1_11":"1A04A","1_12":"1A05A","1_14":"1A06A","1_15":"1A07A","1_16":"1A08A","1_17":"1A09A","1_18":"1A10A","1_20":"1A11A","1_21":"1A12A","1_22":"1A13A","1_23":"1A14A","1_24":"1A15A","1_26":"1A16A","1_27":"1A17A","1_28":"1A18A",
    "2_1":"1Q0201A","2_2":"1Q0202A","2_3":"1Q0203A","2_7":"1B01A","2_8":"1B02A","2_9":"1B03A","2_10":"1B04A","2_11":"1B05A","2_12":"1B06A","2_13":"1B07A","2_14":"1B08A","2_15":"1B09A","2_16":"1B10A","2_17":"1B11A","2_18":"1B12A","2_19":"1B13A","2_20":"1B14A","2_21":"1B15A","2_22":"1B16A","2_23":"1B17A","2_24":"1B18A","2_25":"1B19A","2_26":"1B20A","2_27":"1B21A","2_28":"1B22A",
    "4_1":"1S0101A","4_2":"1S0102A","4_3":"1S0103A","4_7":"1C01A","4_8":"1C02A","4_9":"1C03A","4_10":"1C04A","4_11":"1C05A","4_12":"1C06A","4_13":"1C07A","4_14":"1C08A","4_15":"1C09A","4_16":"1C10A","4_17":"1C11A","4_18":"1C12A","4_19":"1C13A","4_20":"1C14A","4_21":"1C15A","4_22":"1C16A","4_23":"1C17A","4_24":"1C18A","4_25":"1C19A","4_26":"1C20A","4_27":"1C21A","4_28":"1C22A",
    "5_1":"1S0201A","5_2":"1S0202A","5_3":"1S0203A","5_7":"1D01A","5_8":"1D02A","5_9":"1D03A","5_10":"1D04A","5_11":"1D05A","5_12":"1D06A","5_13":"1D07A","5_14":"1D08A","5_15":"1D09A","5_16":"1D10A","5_17":"1D11A","5_18":"1D12A","5_19":"1D13A","5_20":"1D14A","5_21":"1D15A","5_22":"1D16A","5_23":"1D17A","5_24":"1D18A","5_25":"1D19A","5_26":"1D20A","5_27":"1D21A","5_28":"1D22A",
    "7_1":"1Q0501A","7_2":"1Q0502A","7_3":"1Q0503A","7_7":"1E01A","7_8":"1E02A","7_9":"1E03A","7_10":"1E04A","7_11":"1E05A","7_12":"1E06A","7_13":"1E07A","7_14":"1E08A","7_15":"1E09A","7_16":"1E10A","7_17":"1E11A","7_18":"1E12A","7_19":"1E13A","7_20":"1E14A","7_21":"1E15A","7_22":"1E16A","7_23":"1E17A","7_24":"1E18A","7_25":"1E19A","7_26":"1E20A","7_27":"1E21A","7_28":"1E22A",
    "8_1":"1Q0601A","8_2":"1Q0602A","8_3":"1Q0603A","8_8":"1F01A","8_9":"1F02A","8_10":"1F03A","8_11":"1F04A","8_12":"1F05A","8_14":"1F06A","8_15":"1F07A","8_16":"1F08A","8_17":"1F09A","8_18":"1F10A","8_20":"1F11A","8_21":"1F12A","8_22":"1F13A","8_23":"1F14A","8_24":"1F15A","8_26":"1F16F","8_27":"1F17F","8_28":"1F18F",
    "10_1":"1Q0701A","10_2":"1Q0702A","10_3":"1Q0703A","10_7":"1G01A","10_8":"1G02A","10_9":"1G03A","10_10":"1G04A","10_11":"1G05A","10_12":"1G06A","10_13":"1G07A","10_14":"1G08A","10_15":"1G09A","10_16":"1G10A","10_17":"1G11A","10_18":"1G12A","10_19":"1G13A","10_20":"1G14A","10_21":"1G15A","10_22":"1G16A","10_23":"1G17A","10_24":"1G18A","10_25":"1G19A","10_26":"1G20A","10_27":"1G21A","10_28":"1G22A",
    "11_1":"1Q0801A","11_2":"1Q0802A","11_3":"1Q0803A","11_7":"1H01A","11_8":"1H02A","11_9":"1H03A","11_10":"1H04A","11_11":"1H05A","11_12":"1H06A","11_13":"1H07A","11_14":"1H08A","11_15":"1H09A","11_16":"1H10A","11_17":"1H11A","11_18":"1H12A","11_19":"1H13A","11_20":"1H14A","11_21":"1H15A","11_22":"1H16A","11_23":"1H17A","11_24":"1H18A","11_25":"1H19A","11_26":"1H20A","11_27":"1H21A","11_28":"1H22A",
    "13_1":"1Q0901A","13_2":"1Q0902A","13_3":"1Q0903A","13_7":"1I01A","13_8":"1I02A","13_9":"1I03A","13_10":"1I04A","13_11":"1I05A","13_12":"1I06A","13_13":"1I07A","13_14":"1I08A","13_15":"1I09A","13_16":"1I10A","13_17":"1I11A","13_18":"1I12A","13_19":"1I13A","13_20":"1I14A","13_21":"1I15A","13_22":"1I16A","13_23":"1I17A","13_24":"1I18A","13_25":"1I19A","13_26":"1I20A","13_27":"1I21A","13_28":"1I22A",
    "14_1":"1Q1001A","14_2":"1Q1002A","14_3":"1Q1003A","14_8":"1J01A","14_9":"1J02A","14_10":"1J03A","14_11":"1J04A","14_12":"1J05A","14_14":"1J06A","14_15":"1J07A","14_16":"1J08A","14_17":"1J09A","14_18":"1J10A","14_20":"1J11A","14_21":"1J12A","14_22":"1J13A","14_23":"1J14A","14_24":"1J15A","14_26":"1J16J","14_27":"1J17J","14_28":"1J18J",
    "16_1":"1R0101A","16_2":"1R0102A","16_3":"1R0103A","16_7":"1K01A","16_8":"1K02A","16_9":"1K03A","16_10":"1K04A","16_11":"1K05A","16_12":"1K06A","16_13":"1K07A","16_14":"1K08A","16_15":"1K09A","16_16":"1K10A","16_17":"1K11A","16_18":"1K12A","16_19":"1K13A","16_20":"1K14A","16_21":"1K15A","16_22":"1K16A","16_23":"1K17A","16_24":"1K18A","16_25":"1K19A","16_26":"1K20A","16_27":"1K21A","16_28":"1K22A",
    "17_1":"1R0201A","17_2":"1R0202A","17_3":"1R0203A","17_7":"1L01A","17_8":"1L02A","17_9":"1L03A","17_10":"1L04A","17_11":"1L05A","17_12":"1L06A","17_13":"1L07A","17_14":"1L08A","17_15":"1L09A","17_16":"1L10A","17_17":"1L11A","17_18":"1L12A","17_19":"1L13A","17_20":"1L14A","17_21":"1L15A","17_22":"1L16A","17_23":"1L17A","17_24":"1L18A","17_25":"1L19A","17_26":"1L20A","17_27":"1L21A","17_28":"1L22A",
    "19_1":"1R0301A","19_2":"1R0302A","19_3":"1R0303A","20_1":"1R0401A","20_2":"1R0402A","20_3":"1R0403A","22_1":"1R0501A","22_2":"1R0502A","22_3":"1R0503A","23_1":"1R0601A","23_2":"1R0602A","23_3":"1R0603A",
    "25_1":"1R0701A","25_2":"1R0702A","25_3":"1R0703A","26_1":"1R0801A","26_2":"1R0802A","26_3":"1R0803A","28_1":"1R0901A","28_2":"1R0902A","28_3":"1R0903A","29_1":"1R1001A","29_2":"1R1002A","29_3":"1R1003A",
    "31_1":"1R1101A","31_2":"1R1102A","31_3":"1R1103A","32_1":"1R1201A","32_2":"1R1202A","32_3":"1R1203A","34_1":"1R1301A","34_2":"1R1302A","34_3":"1R1303A","35_1":"1R1401A","35_2":"1R1402A","35_3":"1R1403A"
};

// 點擊熱區（透明盒）
let raw1ClickTargets = [];

// 箱子 QR/條碼紋理（仿成品倉 cartonQrM）
function makeRaw1BoxTex() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    // 牛皮紙底色
    ctx.fillStyle = '#c8a76a';
    ctx.fillRect(0, 0, 256, 256);
    // QR 碼區域（左上）
    const qx = 16, qy = 16, qs = 100, qc = 21, cs = qs / qc;
    ctx.fillStyle = '#fff';
    ctx.fillRect(qx, qy, qs, qs);
    ctx.fillStyle = '#111';
    // 三個定位角
    [[0,0],[14,0],[0,14]].forEach(([fx,fy]) => {
        ctx.fillRect(qx+fx*cs, qy+fy*cs, 7*cs, 7*cs);
        ctx.fillStyle = '#fff';
        ctx.fillRect(qx+(fx+1)*cs, qy+(fy+1)*cs, 5*cs, 5*cs);
        ctx.fillStyle = '#111';
        ctx.fillRect(qx+(fx+2)*cs, qy+(fy+2)*cs, 3*cs, 3*cs);
    });
    // 隨機數據模塊
    for (let r = 0; r < qc; r++) for (let col = 0; col < qc; col++) {
        if ((r<8&&col<8)||(r<8&&col>=13)||(r>=13&&col<8)) continue;
        if ((r*31+col*17+7)%3===0) ctx.fillRect(qx+col*cs, qy+r*cs, cs, cs);
    }
    // 文字
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('PEGATRON', 80, 145);
    ctx.font = '13px monospace';
    ctx.fillText('RAW-1F-A', 80, 165);
    // 條碼（底部）
    ctx.fillStyle = '#222';
    for (let i = 0; i < 24; i++) {
        const bx = 16 + i * 9.5, bw2 = (i%3===0)?4:2;
        ctx.fillRect(bx, 180, bw2, 50);
    }
    // 外框
    ctx.strokeStyle = '#8a7744'; ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 252);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
}

// 儲位號標籤（貼在橫梁上）
function makeRaw1SlotLabel(code) {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 40;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(20,20,30,0.85)';
    ctx.fillRect(0, 0, 128, 40);
    ctx.fillStyle = '#e8e8ff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, 64, 20);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    return new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.17), mat);
}

// 依 API 真實庫存渲染箱子（只有有貨的儲位才放箱子）
let _raw1BoxGroup = null;
function loadRaw1Boxes(group) {
    // 清除舊箱子
    if (_raw1BoxGroup && _raw1BoxGroup.parent === group) {
        group.remove(_raw1BoxGroup);
        _raw1BoxGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); });
        _raw1BoxGroup = null;
    }
    _raw1BoxGroup = new THREE.Group();
    group.add(_raw1BoxGroup);

    // XLSX code 直接就是 API code（PRD 格式一致：main=5chars, strip=7chars）
    function toApiCode(xlsxC) {
        return xlsxC;
    }

    fetch('http://10.176.33.211:1102/wh_cang/api/api.php?action=raw1_stock&bin=*', { cache: 'no-store' })
        .then(r => r.json())
        .then(res => {
            if (!res.success) { console.warn('[原料倉] API 載入失敗:', res.message); return; }
            // 建立有貨位的 Set（API StorageBin 格式）
            const stocked = new Set();          // 全部 SLoc（供 3D 箱子，維持現狀）
            const stocked100 = new Set();       // 只取 SLoc=100Y 的 StorageBin（供左側統計）
            (res.data || []).forEach(rec => {
                const sb = String(rec['StorageBin'] || '');
                if (!sb) return;
                stocked.add(sb);
                if (String(rec['SLoc'] || '').toUpperCase() === '100Y') stocked100.add(sb);
            });
            // 已使用（左側統計）：以 API(SLoc=100Y) 為準。3D 只建模有限層數（主鋼架 A-D、條形架 A-E），
            // 故以「格位」＝去掉最後一碼層級字母 來比對；API 的層級若超出 3D（如 1Q0103F/G）仍算一筆已使用。
            const baseSet = new Set();
            Object.values(RAW1_SLOT_CODES).forEach(function (c) { baseSet.add(String(c).slice(0, -1)); });
            const usedBins = new Set();
            stocked100.forEach(function (b) {
                // 以「格位」（去掉最後一碼層級字母）計數，避免同一格位多層被重複計算
                if (b.length >= 5 && baseSet.has(b.slice(0, -1))) usedBins.add(b.slice(0, -1));
            });
            const API_USED = usedBins.size;
            // 為每個有貨的層位放箱子
            const positions = [];
            const LCH = ['A','B','C','D','E'];
            // 貨架幾何有 0.94 內縮；箱子須放在同一「內縮後」的格心，否則會偏離貨架（懸空）
            const SHRINK = 0.94;
            const rawCellX = (row, col) => {                 // 主鋼架：X 依所在段內縮；條形架 X 無內縮
                const gm = RAW1_MAIN.find(g => g.row === row);
                if (gm) {
                    for (const seg of gm.segs) {
                        if (col >= seg[0] && col <= seg[1]) {
                            const xm = cx((seg[0] + seg[1]) / 2);
                            return xm + (cx(col) - xm) * SHRINK;
                        }
                    }
                }
                return cx(col);
            };
            const rawCellZ = (row, col) => {                 // 條形貨架：Z 依所在段內縮；主鋼架單列無內縮
                for (const k of ['Q', 'S', 'R']) {
                    const st = RAW1_STRIP[k];
                    if (col < st.c0 || col > st.c1 || st.rows.indexOf(row) < 0) continue;
                    let s = row, e = row;
                    while (st.rows.indexOf(s - 1) >= 0) s--;
                    while (st.rows.indexOf(e + 1) >= 0) e++;
                    const zm = cz((s + e) / 2);
                    return zm + (cz(row) - zm) * SHRINK;
                }
                return cz(row);
            };
            for (const [rc, xlsxC] of Object.entries(RAW1_SLOT_CODES)) {
                const parts = rc.split('_');
                const row = +parts[0], col = +parts[1];
                const isStrip = xlsxC.length === 7;
                const nLvl = isStrip ? 5 : 4;
                const LVL_H = isStrip ? 0.45 : 1.0;
                const apiBase = toApiCode(xlsxC).slice(0, -1); // 去掉層號
                for (let lv = 0; lv < nLvl; lv++) {
                    const apiC = apiBase + LCH[lv];
                    if (stocked.has(apiC)) {
                        // 箱子放在該層板上（lv+1 因為 lv=0 是地面不放）
                        const boxLv = lv + 1;
                        const y = boxLv * LVL_H + 0.30;
                        positions.push(rawCellX(row, col), y, rawCellZ(row, col));
                    }
                }
            }
            RAW1_USED = API_USED;   // 供左側摘要「已使用」顯示
            if (typeof renderSelectionSummary === 'function' && typeof activeFloor !== 'undefined' && activeFloor === 'L1') {
                try { renderSelectionSummary(); } catch (e) {}
            }
            if (!positions.length) return;
            const n = positions.length / 3;
            const boxMat = new THREE.MeshLambertMaterial({ map: makeRaw1BoxTex() });
            const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 0.5, 0.5), boxMat, n);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1,1,1), p = new THREE.Vector3();
            for (let i = 0; i < n; i++) {
                p.set(positions[i*3], positions[i*3+1], positions[i*3+2]);
                m4.compose(p, q, s);
                im.setMatrixAt(i, m4);
            }
            im.instanceMatrix.needsUpdate = true;
            _raw1BoxGroup.add(im);
            // 棧板（有箱子的位置下方放棧板）
            const palMat = woodBaseMat;
            const imP = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.12, 0.66), palMat, n);
            for (let i = 0; i < n; i++) {
                p.set(positions[i*3], positions[i*3+1] - 0.32, positions[i*3+2]);
                m4.compose(p, q, s);
                imP.setMatrixAt(i, m4);
            }
            imP.instanceMatrix.needsUpdate = true;
            _raw1BoxGroup.add(imP);
        })
        .catch(err => console.warn('[原料倉] 庫存載入錯誤:', err));
}

function buildRaw1Warehouse() {
    if (!scene) return;
    if (raw1Group) {
        scene.remove(raw1Group);
        raw1Group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
        raw1Group = null;
    }
    raw1Group = new THREE.Group();
    raw1Group.position.set(RAW1_CX, 0, RAW1_CZ);

    // 共用料
    const shelfFrameMat = new THREE.MeshLambertMaterial({ color: 0x1B7FA8 }); // 藍橫樑
    const shelfPostMat  = new THREE.MeshLambertMaterial({ color: 0x14663a }); // 綠立柱
    const shelfSlabMat  = new THREE.MeshLambertMaterial({ color: 0x1c7a43 }); // 綠層板
    const steelShelfMat = new THREE.MeshStandardMaterial({ color: 0xd06a1d, metalness: 0.45, roughness: 0.45 }); // 橙色厚層板
    const steelPostMat  = new THREE.MeshStandardMaterial({ color: 0x2b6faf, metalness: 0.62, roughness: 0.38 }); // 藍金屬立柱
    const boxTex        = makeRaw1BoxTex();
    const boxMat        = new THREE.MeshLambertMaterial({ map: boxTex });
    const pillarMat     = new THREE.MeshLambertMaterial({ color: 0x9aa6b0 });
    const borderMat     = new THREE.MeshLambertMaterial({ color: 0x8a8d92 });
    const floorMat      = new THREE.MeshLambertMaterial({ color: 0x38444e });

    // ==== 12 座主鋼架 ====
    RAW1_MAIN.forEach((gm) => {
        const z0 = cz(gm.row);
        const isShelf = (gm.style === 'shelf');
        const RACK_H = isShelf ? 2.4 : 5.0;
        const LEVELS = isShelf ? 5 : 4;
        const LVL_H = isShelf ? RACK_H / LEVELS : 1.0;
        const DEP = isShelf ? 1.30 : 1.1;
        const halfD = DEP / 2;

        // 組名牌（置於整組中央）
        const xFirst = cx(gm.segs[0][0]);
        const xLast  = cx(gm.segs[gm.segs.length - 1][1]);
        const grpLabel = makeLabelSprite(gm.name, '#bde0ff', 1.6, 0.55);
        grpLabel.position.set((xFirst + xLast) / 2, RACK_H + 0.7, z0);
        raw1Group.add(grpLabel);

        gm.segs.forEach(([c0, c1]) => {
            const nCells = c1 - c0 + 1;
            const L = nCells * RAW1_PX * 0.94;
            const xMid = (cx(c0) + cx(c1)) / 2;

            const g = new THREE.Group();
            g.position.set(xMid, 0, z0);

            if (isShelf) {
                // C倉.js 樣式：綠柱 + 綠層板 + 藍橫樑
                const runPostGeo = new THREE.BoxGeometry(0.12, RACK_H, 0.12);
                for (let i = 0; i <= nCells; i++) {
                    const px = -L / 2 + (i / nCells) * L;
                    [-halfD, halfD].forEach(oz => {
                        const post = new THREE.Mesh(runPostGeo, shelfPostMat);
                        post.position.set(px, RACK_H / 2, oz);
                        g.add(post);
                    });
                }
                for (let lv = 0; lv < LEVELS; lv++) {
                    const yTop = lv * LVL_H;
                    const slab = new THREE.Mesh(new THREE.BoxGeometry(1, 0.07, 1.30), shelfSlabMat);
                    slab.scale.x = L;
                    slab.position.set(0, yTop + 0.035, 0);
                    g.add(slab);
                    const fb = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 0.06), shelfFrameMat);
                    fb.scale.x = L;
                    fb.position.set(0, yTop + 0.035, -halfD);
                    g.add(fb);
                    const bb = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 0.06), shelfFrameMat);
                    bb.scale.x = L;
                    bb.position.set(0, yTop + 0.035, halfD);
                    g.add(bb);
                }
            } else {
                // 成品倉 鋼架樣式：藍金屬立柱 + 橙色厚層板 + 斜撐（無框架）
                const fZ = halfD - 0.06, bZ = -halfD + 0.06;
                // 立柱（每個 cell 邊界，前後各一）
                for (let c = 0; c <= nCells; c++) {
                    const px = -L / 2 + (c / nCells) * L;
                    [bZ, fZ].forEach(oz => {
                        const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, RACK_H, 0.16), steelPostMat);
                        post.position.set(px, RACK_H / 2, oz);
                        g.add(post);
                    });
                }
                // 每層厚層板 + 斜撐
                for (let lv = 1; lv <= LEVELS; lv++) {
                    const yL = lv * LVL_H;
                    const deck = new THREE.Mesh(new THREE.BoxGeometry(L, 0.20, DEP * 0.85), steelShelfMat);
                    deck.position.set(0, yL + 0.10, 0);
                    g.add(deck);
                    // 斜撐（左右兩端 X-brace）
                    [-L / 2, L / 2].forEach(px => {
                        const up = (lv % 2 === 1);
                        const s = up ? bZ : fZ, e = up ? fZ : bZ;
                        const dz = e - s;
                        const len = Math.sqrt(1 + dz * dz);
                        const brace = new THREE.Mesh(new THREE.BoxGeometry(0.06, len, 0.06), steelPostMat);
                        brace.position.set(px, yL + 0.5, (s + e) / 2);
                        brace.rotation.x = Math.atan2(dz, 1);
                        g.add(brace);
                    });
                }
            }
            raw1Group.add(g);

            // 儲位號標籤（貼在第一層橫梁前面）
            const ySlot = LVL_H + (isShelf ? 0.04 : 0.12);
            for (let i = 0; i < nCells; i++) {
                const xSlot = -L / 2 + (i + 0.5) * (L / nCells);
                const col = c0 + i;
                const slotCode = RAW1_SLOT_CODES[gm.row + '_' + col] || (gm.name + '-' + col);
                const slbl = makeRaw1SlotLabel(slotCode);
                slbl.position.set(xSlot, ySlot, halfD + 0.015);
                g.add(slbl);
            }
        });
    });

    // ==== Q/S/R 條形貨架（C倉造型，直向 — 長度沿 Z 軸） ====
    Object.keys(RAW1_STRIP).forEach(stripKey => {
        const st = RAW1_STRIP[stripKey];
        const RACK_H = 2.4, LEVELS = 5, LVL_H = 0.45, DEP = 1.30;
        const halfD = DEP / 2;
        const xMidStrip = cx((st.c0 + st.c1) / 2);

        // 條形區名牌
        const zMidStrip = cz((st.rows[0] + st.rows[st.rows.length - 1]) / 2);
        const stripLabel = makeLabelSprite(stripKey + ' 區', '#bde0ff', 1.6, 0.4);
        stripLabel.position.set(xMidStrip, RACK_H + 0.5, zMidStrip);
        raw1Group.add(stripLabel);

        // Group rows into consecutive segments
        const rows = st.rows.slice().sort((a, b) => a - b);
        const segments = [];
        let segStart = rows[0], segEnd = rows[0];
        for (let i = 1; i < rows.length; i++) {
            if (rows[i] === segEnd + 1) { segEnd = rows[i]; }
            else { segments.push([segStart, segEnd]); segStart = rows[i]; segEnd = rows[i]; }
        }
        segments.push([segStart, segEnd]);

        // For each segment and each column, build a CONTINUOUS rack (length along Z)
        segments.forEach(([r0, r1]) => {
            const nRows = r1 - r0 + 1;
            const Lz = nRows * RAW1_ZS * 0.94;
            const zMid = (cz(r0) + cz(r1)) / 2;

            for (let cc = st.c0; cc <= st.c1; cc++) {
                const xc = cx(cc);
                const g = new THREE.Group();
                g.position.set(xc, 0, zMid);

                // 貨架 style (C倉): green posts + green slabs + blue beams
                // Posts: distributed along Z (left+right)
                const runPostGeo = new THREE.BoxGeometry(0.12, RACK_H, 0.12);
                for (let i = 0; i <= nRows; i++) {
                    const pz = -Lz / 2 + (i / nRows) * Lz;
                    [-halfD, halfD].forEach(ox => {
                        const post = new THREE.Mesh(runPostGeo, shelfPostMat);
                        post.position.set(ox, RACK_H / 2, pz);
                        g.add(post);
                    });
                }
                // Slabs + beams at each level
                for (let lv = 0; lv < LEVELS; lv++) {
                    const yTop = lv * LVL_H;
                    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.07, 1), shelfSlabMat);
                    slab.scale.z = Lz;
                    slab.position.set(0, yTop + 0.035, 0);
                    g.add(slab);
                    const fb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 1), shelfFrameMat);
                    fb.scale.z = Lz;
                    fb.position.set(-halfD, yTop + 0.035, 0);
                    g.add(fb);
                    const bb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 1), shelfFrameMat);
                    bb.scale.z = Lz;
                    bb.position.set(halfD, yTop + 0.035, 0);
                    g.add(bb);
                }
                raw1Group.add(g);

                // 儲位號標籤（第一層橫梁，面向主鋼架方向）
                const ySlotS = LVL_H + 0.04;
                for (let ri = 0; ri < nRows; ri++) {
                    const r = r0 + ri;
                    const zSlot = -Lz / 2 + (ri + 0.5) * (Lz / nRows);
                    const slotCode = RAW1_SLOT_CODES[r + '_' + cc] || (stripKey + '-' + r);
                    const slbl = makeRaw1SlotLabel(slotCode);
                    slbl.position.set(halfD + 0.015, ySlotS, zSlot);
                    slbl.rotation.y = Math.PI / 2;
                    g.add(slbl);
                }
            }
        });
    });

    // ==== 點擊熱區（透明盒） ====
    raw1ClickTargets = [];
    const clickMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
    const clickGeo = new THREE.BoxGeometry(1, 1, 1);

    RAW1_MAIN.forEach((gm) => {
        const z0 = cz(gm.row);
        const RACK_H = gm.style === 'steel' ? 5.0 : 2.4;
        gm.segs.forEach(([c0, c1]) => {
            const nCells = c1 - c0 + 1;
            const L = nCells * RAW1_PX * 0.94;
            const xMid = (cx(c0) + cx(c1)) / 2;
            for (let i = 0; i < nCells; i++) {
                const xBox = xMid + (-L / 2 + (i + 0.5) * (L / nCells));
                const col = c0 + i;
                const slotCode = RAW1_SLOT_CODES[gm.row + '_' + col] || (gm.name + '-' + col);
                const box = new THREE.Mesh(clickGeo, clickMat);
                box.scale.set(RAW1_PX * 0.92, RACK_H, RAW1_ZS * 0.92);
                box.position.set(xBox, RACK_H / 2, z0);
                box.userData = { raw1slot: { code: slotCode, x: xBox, z: z0 } };
                raw1Group.add(box);
                raw1ClickTargets.push(box);
            }
        });
    });

    Object.keys(RAW1_STRIP).forEach(stripKey => {
        const st = RAW1_STRIP[stripKey];
        st.rows.forEach(r => {
            for (let cc = st.c0; cc <= st.c1; cc++) {
                const xc = cx(cc), zc = cz(r);
                const slotCode = RAW1_SLOT_CODES[r + '_' + cc] || (stripKey + '-' + r);
                const box = new THREE.Mesh(clickGeo, clickMat);
                box.scale.set(RAW1_PX * 0.92, 2.4, RAW1_ZS * 0.92);
                box.position.set(xc, 1.2, zc);
                box.userData = { raw1slot: { code: slotCode, x: xc, z: zc } };
                raw1Group.add(box);
                raw1ClickTargets.push(box);
            }
        });
    });

    // ==== IQC + 退運區域（平面描邊 + 名牌，無填充、無高度） ====
    RAW1_FACILITY.forEach(fz => {
        const fx = (cx(fz.c0) + cx(fz.c1)) / 2;
        const fzm = (cz(fz.r0) + cz(fz.r1)) / 2;
        const wX = (cx(fz.c1) - cx(fz.c0)) + RAW1_PX;
        const wZ = (cz(fz.r1) - cz(fz.r0)) + RAW1_ZS;
        const bw = 0.18; // 邊框寬度
        const by = 0.005; // 貼地

        // 4 條平面描邊（貼地灰線，內部不填充）
        const nb = new THREE.Mesh(new THREE.BoxGeometry(wX, 0.002, bw), borderMat);
        nb.position.set(fx, by, fzm + wZ / 2 - bw / 2); raw1Group.add(nb);
        const sb = new THREE.Mesh(new THREE.BoxGeometry(wX, 0.002, bw), borderMat);
        sb.position.set(fx, by, fzm - wZ / 2 + bw / 2); raw1Group.add(sb);
        const eb = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.002, wZ), borderMat);
        eb.position.set(fx + wX / 2 - bw / 2, by, fzm); raw1Group.add(eb);
        const wb = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.002, wZ), borderMat);
        wb.position.set(fx - wX / 2 + bw / 2, by, fzm); raw1Group.add(wb);

        // 區域名牌
        const lb = makeLabelSprite(fz.name, '#eaffff', Math.min(5.5, wX * 0.55), 0.7);
        lb.position.set(fx, 0.6, fzm);
        raw1Group.add(lb);
    });

    // ==== IQC/退運 區內：川字棧板（規則網格，欄/列對齊柱子處留走道） ====
    // 跳過柱子所在欄/列 → 形成十字走道；其餘格點鋪滿川字棧板
    (() => {
        const palW = RAW1_PX * 0.9, palD = RAW1_ZS * 0.78;
        const TB = 0.03, SH = 0.09;
        const bw2 = palW * 0.093, st2 = (palW - bw2) / 4;
        const cols = [];                                   // 區內可鋪欄（排除柱子欄）
        RAW1_FACILITY.forEach(fz => {
            for (let r = fz.r0; r <= fz.r1; r++) {
                if (RAW1_PILLAR_ROWS.indexOf(r) >= 0) continue;     // 柱子列 → 走道
                for (let c = fz.c0; c <= fz.c1; c++) {
                    if (RAW1_PILLAR_COLS.indexOf(c) >= 0) continue; // 柱子欄 → 走道
                    cols.push([cx(c), cz(r)]);
                }
            }
        });
        if (!cols.length) return;
        const N = cols.length;
        const imTop = new THREE.InstancedMesh(new THREE.BoxGeometry(bw2, TB, palD), woodBaseMat, N * 5);
        const imRun = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, SH, palD * 0.85), woodBaseMat, N * 3);
        const imBot = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, TB, palD * 0.5), woodBaseMat, N * 3);
        const m4 = new THREE.Matrix4();
        let ti = 0, ri = 0, bi = 0;
        cols.forEach(([px, pz]) => {
            for (let i = 0; i < 5; i++) {                  // 川字頂板 x5
                m4.makeTranslation(px - palW / 2 + bw2 / 2 + i * st2, SH + TB / 2, pz);
                imTop.setMatrixAt(ti++, m4);
            }
            [-palW / 3, 0, palW / 3].forEach(ox => {       // 川字三根枕木
                m4.makeTranslation(px + ox, SH / 2, pz);
                imRun.setMatrixAt(ri++, m4);
            });
            [-palW / 3, 0, palW / 3].forEach(ox => {       // 底板三塊
                m4.makeTranslation(px + ox, TB / 2, pz);
                imBot.setMatrixAt(bi++, m4);
            });
        });
        imTop.instanceMatrix.needsUpdate = true;
        imRun.instanceMatrix.needsUpdate = true;
        imBot.instanceMatrix.needsUpdate = true;
        raw1Group.add(imTop, imRun, imBot);

        // 50% 棧板隨機堆箱（每片：2 層 × 2×2 紙箱）
        const boxPos = [];
        cols.forEach(([px, pz]) => {
            if (Math.random() >= 0.5) return;
            for (let ly = 0; ly < 2; ly++) {
                const by = SH + TB + 0.18 + ly * 0.36;
                [[-0.31, -0.23], [0.31, -0.23], [-0.31, 0.23], [0.31, 0.23]].forEach(oz => {
                    boxPos.push(px + oz[0], by, pz + oz[1]);
                });
            }
        });
        if (boxPos.length) {
            const nB = boxPos.length / 3;
            const boxMat = new THREE.MeshLambertMaterial({ map: makeRaw1BoxTex() });
            const imB = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.36, 0.42), boxMat, nB);
            for (let i = 0; i < nB; i++) {
                m4.makeTranslation(boxPos[i * 3], boxPos[i * 3 + 1], boxPos[i * 3 + 2]);
                imB.setMatrixAt(i, m4);
            }
            imB.instanceMatrix.needsUpdate = true;
            raw1Group.add(imB);
        }
    })();

    // ==== 柱子（欄 [7,13,19,25] × 列 [1,8,14,20,26,32]） ====
    RAW1_PILLAR_COLS.forEach(pc => {
        RAW1_PILLAR_ROWS.forEach(pr => {
            const px = cx(pc), pz = cz(pr);
            const po = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.4, 0.8), pillarMat);
            po.position.set(px, 2.7, pz);
            raw1Group.add(po);
            const lbl = makeLabelSprite('柱', '#ff4d4f', 0.9, 0.4);
            lbl.position.set(px, 5.6, pz);
            raw1Group.add(lbl);
        });
    });

    // ==== 箱子 + 棧板：依 API 真實庫存渲染（延遲：切到原料倉時才載入，見 啟動.js ensureWhLoaded('RAW')） ====
    // loadRaw1Boxes(raw1Group);

    // ==== 地板（覆蓋整座建物） ====
    const flrW = RAW1_COLS * RAW1_PX + 0.5;
    const flrD = RAW1_ROWS * RAW1_ZS + 0.5;
    const flr = new THREE.Mesh(new THREE.BoxGeometry(flrW, 0.3, flrD), floorMat);
    flr.position.set(0, -0.15, 0);
    raw1Group.add(flr);

    scene.add(raw1Group);
    raw1Group.visible = false;
}
