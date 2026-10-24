const B_GRID = [
    '  PPPPPPPPPPPPPP   PPPPPPPPPPPPPP  PPP',
    '  PPPPPPPPPPPPPP   PPPPPPPPPPPPPP  PPP',
    '  PPPPPPPPPPPPPP   PPPPPPPPPPPPPP  PPP',
    '  PPPPPPPPPPPPPP   PPPPPPPPPPPPPP  PPP',
    '  PPPPPPPPPPPPPP   PPPPPPPPPPPPPP  PPP',
    '                                   FFF',
    '  PPPPPP WPPPPPP   PWPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP WPPPPPP   PWPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPP WPPPPPP   PWPPPP PPPPPPP  FFF',
    '  PPPPPP PPPPPPP   PPPPPP PPPPPPP  FFF',
    '                                   FFF',
    '                                   FFF',
    '  PPPPPPPPPPPPPP   PPPPPP PPPPPPP  FFF',
    '  PPPPPPPPPPPPPP   PPPPPP PPPPPPP  FFF',
]

const B_CENTER_X = -80, B_CENTER_Z = -80;
const B_PITCH_X = 0.8, B_PITCH_Z = 1.2;
const B_R = B_GRID.length;
const B_C = B_GRID.reduce((m, rw) => Math.max(m, rw.length), 0);
const B_RX = (B_C * B_PITCH_X * 1.5) / 2 + 8;
const B_RZ = (B_R * B_PITCH_Z * 1.5) / 2 + 8;
const B_WALL_H = 3.0;
let bwnGroup = null;
function inBWorld(x, z) { return bwnGroup && Math.abs(x - B_CENTER_X) <= B_RX && Math.abs(z - B_CENTER_Z) <= B_RZ; }

const B_ZONES = [
    { name: '04/14工單區',        r0: 0,  r1: 4,  c0: 2,  c1: 15, color: 0xff8a3d },
    { name: '13大料工單區',       r0: 0,  r1: 19, c0: 19, c1: 32, color: 0x4a9eff },
    { name: '15庫房（包材）',     r0: 6,  r1: 19, c0: 2,  c1: 15, color: 0x2f9e5f },
    { name: '小料工單區',         r0: 10, r1: 19, c0: 19, c1: 24, color: 0xe0b325 },
    { name: '15工單區（包材）',   r0: 16, r1: 19, c0: 26, c1: 32, color: 0xb26bd9 },
    { name: '儲位',               r0: 22, r1: 23, c0: 19, c1: 32, color: 0x37c2d0 },
    { name: 'IQC',                r0: 0,  r1: 4,  c0: 35, c1: 37, color: 0xff5a6e },
    { name: 'LABEL/辦公室',       r0: 5,  r1: 19, c0: 35, c1: 37, color: 0xc0392b },
    { name: '來料待撿',           r0: 20, r1: 23, c0: 35, c1: 37, color: 0x8fd966 }
];

function buildBWarehouse() {
    if (!scene) return;
    if (bwnGroup) { scene.remove(bwnGroup); bwnGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); }); bwnGroup = null; }
    bwnGroup = new THREE.Group();
    bwnGroup.position.set(B_CENTER_X, 0, B_CENTER_Z);
    bwnGroup.scale.set(1.5, 1.5, 1.5);
    const halfX = (B_C - 1) / 2, halfZ = (B_R - 1) / 2;
    const flr = new THREE.Mesh(new THREE.BoxGeometry(B_C * B_PITCH_X, 0.14, B_R * B_PITCH_Z),
        new THREE.MeshLambertMaterial({ color: 0x59636e }));
    flr.position.set(0, -0.07, 0); bwnGroup.add(flr);
    const bMatBox = new THREE.MeshLambertMaterial({ color: 0xc8a76a });
    const bMatW = new THREE.MeshLambertMaterial({ color: 0x9aa2ab });
    const bCarts = [];
    function chuanPalletB(g, w, d) {
        const TB = 0.03, SH = 0.06, bw2 = w * 0.093, st2 = (w - bw2) / 4;
        for (let i = 0; i < 5; i++) {
            const b = new THREE.Mesh(new THREE.BoxGeometry(bw2, TB, d), woodBaseMat);
            b.position.set(-w / 2 + i * st2, SH + TB / 2, 0); g.add(b);
        }
        [-w / 3, 0, w / 3].forEach(ox => {
            const st = new THREE.Mesh(new THREE.BoxGeometry(0.11, SH, d * 0.9), woodBaseMat);
            st.position.set(ox, SH / 2, 0); g.add(st);
        });
        [-w / 3, 0, w / 3].forEach(ox => {
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, TB, d * 0.55), woodBaseMat);
            b.position.set(ox, TB / 2, 0); g.add(b);
        });
    }
    for (let r = 0; r < B_R; r++) for (let c = 0; c < B_C; c++) {
        const ch = (B_GRID[r][c] || ' ');
        const wx = (c - halfX) * B_PITCH_X, wz = (r - halfZ) * B_PITCH_Z;
        if (ch === 'P') {
            const g = new THREE.Group(); bwnGroup.add(g);
            chuanPalletB(g, B_PITCH_X * 0.9, B_PITCH_Z * 0.78);
            g.position.set(wx, 0, wz);
            if (Math.random() < 0.8) {
                for (let pi = 0; pi < 2; pi++) {
                    const by = 0.10 + 0.15 + pi * 0.26;
                    [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(oz => {
                        bCarts.push(wx + oz[0], by, wz + oz[1]);
                    });
                }
            }
        } else if (ch === 'W') {
            const po = new THREE.Mesh(new THREE.BoxGeometry(0.6, B_WALL_H, 0.6), bMatW);
            po.position.set(wx, B_WALL_H / 2, wz); bwnGroup.add(po);
        } else if (ch === 'F') {
            const f = new THREE.Mesh(new THREE.BoxGeometry(B_PITCH_X * 0.96, 0.1, B_PITCH_Z * 0.96),
                new THREE.MeshLambertMaterial({ color: 0xd3d8dd, transparent: true, opacity: 0.9 }));
            f.position.set(wx, 0.05, wz); bwnGroup.add(f);
        }
    }
    if (bCarts.length) {
        const n = bCarts.length / 3;
        const cm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.32, 0.24, 0.32), bMatBox, n);
        const q = new THREE.Quaternion(), ss = new THREE.Vector3(1, 1, 1), m = new THREE.Matrix4(), pp = new THREE.Vector3();
        for (let i = 0; i < n; i++) { pp.set(bCarts[i * 3], bCarts[i * 3 + 1], bCarts[i * 3 + 2]); m.compose(pp, q, ss); cm.setMatrixAt(i, m); }
        cm.instanceMatrix.needsUpdate = true;
        bwnGroup.add(cm);
    }
    // ==== B 倉區域標示：依 xlsx 實際區域名，不同顏色外框線＋懸浮字（不填滿） ====
    (function buildBZoneMarks() {
        const T = 0.06, FY = 0.02;
        const frame = (x0, x1, z0, z1, color) => {
            const mat = new THREE.MeshLambertMaterial({ color: color });
            const W = x1 - x0, D = z1 - z0;
            const mk = (w, d, px, pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), mat); m.position.set(px, FY, pz); bwnGroup.add(m); };
            mk(W + 2 * T, T, (x0 + x1) / 2, z0 - T);
            mk(W + 2 * T, T, (x0 + x1) / 2, z1 + T);
            mk(T, D, x0 - T, (z0 + z1) / 2);
            mk(T, D, x1 + T, (z0 + z1) / 2);
        };
        const mark = (r0, r1, c0, c1, color, name) => {
            const x0 = (c0 - halfX) * B_PITCH_X, x1 = (c1 + 1 - halfX) * B_PITCH_X;
            const z0 = (r0 - halfZ) * B_PITCH_Z, z1 = (r1 + 1 - halfZ) * B_PITCH_Z;
            frame(x0, x1, z0, z1, color);
            const zw = (c1 - c0 + 1) * B_PITCH_X;
            const w = Math.max(1.6, Math.min(4.6, zw * 0.72));
            const lb = makeLabelSprite(name, '#ffffff', w, 0.85);
            lb.position.set((x0 + x1) / 2, 1.25, (z0 + z1) / 2);
            bwnGroup.add(lb);
        };
        (B_ZONES || []).forEach(z => mark(z.r0, z.r1, z.c0, z.c1, z.color, z.name));
    })();
    // ==== 辦公室加 4 套辦公設備（LABEL/辦公室 區，沿 z 排 4 組） ====
    (function buildBOffice() {
        const oMatDk = new THREE.MeshLambertMaterial({ color: 0x2b3138 });
        const oMatChS = new THREE.MeshLambertMaterial({ color: 0x2f4b66 });
        const oMatChB = new THREE.MeshLambertMaterial({ color: 0x22303f });
        const oMatChM = new THREE.MeshLambertMaterial({ color: 0x8a959e });
        const oScr = new THREE.MeshBasicMaterial({ color: 0x9fe6ff });
        const cx = 14.0, z0 = -7.8, z1 = 10.2, n = 4;
        const add = (o) => { bwnGroup.add(o); };
        const mk = (w, h, d, x, y, z, m) => { const mm = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); mm.position.set(x, y, z); add(mm); };
        for (let k = 0; k < n; k++) {
            const dz = z0 + (k + 0.5) * ((z1 - z0) / n);
            mk(1.5, 0.06, 0.7, cx, 0.70, dz, woodBaseMat);                 // 桌面
            [[-0.70, -0.30], [0.70, -0.30], [-0.70, 0.30], [0.70, 0.30]].forEach(pp => mk(0.06, 0.70, 0.06, cx + pp[0], 0.35, dz + pp[1], oMatDk)); // 桌腳
            mk(0.24, 0.50, 0.55, cx - 0.74, 0.30, dz, oMatDk);            // 主機（桌下）
            mk(0.55, 0.36, 0.05, cx, 0.88, dz + 0.20, oMatDk);            // 顯示器
            mk(0.50, 0.30, 0.01, cx, 0.89, dz + 0.215, oScr);             // 螢幕藍
            mk(0.42, 0.02, 0.14, cx, 0.75, dz - 0.14, oMatDk);            // 鍵盤
            mk(0.07, 0.02, 0.10, cx + 0.24, 0.75, dz - 0.30, oMatDk);     // 滑鼠
            mk(0.45, 0.05, 0.45, cx, 0.45, dz - 0.48, oMatChS);           // 椅座
            mk(0.45, 0.60, 0.06, cx, 0.78, dz - 0.69, oMatChS);           // 椅背
            const gas = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.24, 10), oMatChB); gas.position.set(cx, 0.33, dz - 0.48); add(gas);
            const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.035, 16), oMatChM); disc.position.set(cx, 0.22, dz - 0.48); add(disc);
        }
    })();
    // ==== B 倉四周透明圍牆（比照 A 倉，北牆留出入口） ====
    {
        const T = 0.2;
        const ex = B_PITCH_X, ez = 0.6;
        const halfWb = (B_C / 2) * B_PITCH_X, halfDb = (B_R / 2) * B_PITCH_Z;   // 15.2 / 14.4
        const wallMat = new THREE.MeshLambertMaterial({ color: 0xe8ecef, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
        const ewLenb = 2 * halfDb + ez + 2 * T;
        const nsLenb = 2 * (halfWb + ex) + 2 * T;
        const ewGeob = new THREE.BoxGeometry(T, B_WALL_H, ewLenb);
        const nsGeob = new THREE.BoxGeometry(nsLenb, B_WALL_H, T);
        const mkWallb = (geo, gx, gz) => {
            const w = new THREE.Mesh(geo, wallMat);
            w.position.set(gx, B_WALL_H / 2, gz);
            w.userData.cat = 'wall';
            if (ghostStatic.wall) ghostStatic.wall.push(w);
            bwnGroup.add(w);
        };
        // 出入口移到南牆（依使用者點擊世界 x≈-61.77 → local +12.15），北牆整段封閉
        const gapW = 4.0, wallL2 = halfWb + ex + T, gapCx = 12.15;   // 世界 x = -80 + 12.15*1.5 = -61.77
        const mkSegb = (x0, x1, gz) => {
            const L = Math.abs(x1 - x0);
            const w = new THREE.Mesh(new THREE.BoxGeometry(L, B_WALL_H, T), wallMat);
            w.position.set((x0 + x1) / 2, B_WALL_H / 2, gz);
            w.userData.cat = 'wall';
            if (ghostStatic.wall) ghostStatic.wall.push(w);
            bwnGroup.add(w);
        };
        mkWallb(nsGeob, 0, -halfDb);                        // 北牆整段（無門）
        mkSegb(-wallL2, gapCx - gapW / 2, halfDb + ez);     // 南牆 左段
        mkSegb(gapCx + gapW / 2, wallL2, halfDb + ez);      // 南牆 右段
        mkWallb(ewGeob, -(halfWb + ex), ez / 2);
        mkWallb(ewGeob, halfWb + ex, ez / 2);
    }
    scene.add(bwnGroup);
}

