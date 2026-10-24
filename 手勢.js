// ==================== 手勢.js — 攝像頭手勢控制（MediaPipe HandLandmarker，純前端模組） ====================
// 上下掃＝切換樓層(L1/L2/L3)   左右掃＝切換倉(A/B/C/D)   捏合＝視角縮放
// 整合方式：只透過 DOM 驅動 核心.js 既有邏輯（點 #fl* / #wh* 的 click、對 #view3d canvas 發 wheel 事件），
// 不改動 核心.js 或任何倉庫檔案。MediaPipe 採「延遲載入」：首次點「手勢」才 import vision_bundle.js，
// 就算模組/MIME 失敗也只影響手勢功能，不影響 3D 看板主體。
// 參數皆可在此調整（SWIPE_*/COOLDOWN/ZOOM_*）。

const MP = './lib/mediapipe';                 // MediaPipe 自架根（相對頁面）
const FLOOR_IDS = ['fl1', 'fl2', 'fl3'];      // 樓層 chip
const WH_IDS    = ['whA', 'whB', 'whC', 'whD']; // 倉 chip（ALL 不含，避免手勢誤觸）
// 手勢調校參數
const SWIPE_MIN = 0.08;        // 手掌中心位移門檻（歸一化）；調小較易觸發
const SWIPE_DOM = 1.20;        // 主軸位移須 > 副軸 × 此值才認定方向
const SWIPE_MS  = 500;         // 軌跡時間窗(ms)：只保留最近這麼久的軌跡（改用時間，抗低幀率）
const SWIPE_BETWEEN = 60;      // 取樣最短時間(ms)
const COOLDOWN  = 750;         // 每次觸發後冷卻（ms）
const PINCH_MIN = 0.05;        // 捏合縮放死區（調大＝較不敏感，避免靜止抖動誤觸）
const ZOOM_GAIN = 1200;        // 捏合 → wheel deltaY 增益
const ZOOM_MAX  = 160;         // 單次 deltaY 上限（對齊滑鼠輪感受）

let hand = null, camEl = null, stream = null, rafId = 0, lastVideoTime = -1, running = false;
let pinchBase = null, pinchSm = null, floorCd = 0, whCd = 0, palmTrail = [];
let cv = null, ctx = null, statusEl = null, statusCd = 0;

// 21 點骨架連線（MediaPipe HandLandmarker 標準拓撲）
const HAND_EDGES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const TIPS = [4, 8, 12, 16, 20];   // 五指尖
const C_EDGE = '#4fd1ff', C_JOINT = '#7fd1a0', C_TIP = '#ffd24a', C_PALM = '#ff6b6b', C_TRAIL = 'rgba(79,209,255,.55)', C_ARROW = '#ffd24a';

const $ = (id) => document.getElementById(id);
function activeChip(ids){ for (const id of ids){ const el = $(id); if (el && el.classList.contains('active')) return id; } return -1; }

async function ensureHand(){
    if (hand) return;
    const mod = await import('./lib/mediapipe/vision_bundle.js');
    const fileset = await mod.FilesetResolver.forVisionTasks(MP + '/wasm');
    hand = await mod.HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MP + '/models/hand_landmarker.task.js' },
        runningMode: 'VIDEO', numHands: 1
    });
}

async function start(){
    if (running) return;
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function')
        throw new Error('此瀏覽器環境不支援鏡頭（getUserMedia 需在 https 或 localhost 下開啟）');
    camEl = $('gestCam');
    if (!camEl) throw new Error('找不到 #gestCam 預覽元素');
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false });
    camEl.srcObject = stream;
    await camEl.play();
    camEl.style.display = 'block';
    cv = $('gestCanvas'); ctx = cv ? cv.getContext('2d') : null;
    statusEl = $('gestStatus');
    if (cv) cv.style.display = 'block';
    if (statusEl){ statusEl.style.display = 'block'; statusEl.textContent = '偵測中…'; }
    await ensureHand();
    running = true; lastVideoTime = -1;
    loop();
}
function stop(){
    running = false;
    if (rafId){ cancelAnimationFrame(rafId); rafId = 0; }
    if (stream){ stream.getTracks().forEach((t) => t.stop()); stream = null; }
    if (camEl){ camEl.srcObject = null; camEl.style.display = 'none'; }
    if (cv){ cv.style.display = 'none'; if (ctx) ctx.clearRect(0, 0, cv.width, cv.height); }
    if (statusEl){ statusEl.style.display = 'none'; statusEl.textContent = ''; }
    palmTrail.length = 0; pinchBase = null; pinchSm = null;
}
function loop(){
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (camEl && camEl.readyState >= 2 && camEl.currentTime !== lastVideoTime && hand){
        lastVideoTime = camEl.currentTime;
        let res;
        try { res = hand.detectForVideo(camEl, performance.now()); } catch (e) { return; }
        if (res && res.landmarks && res.landmarks.length){
            handleHand(res.landmarks[0], res.worldLandmarks ? res.worldLandmarks[0] : null);
            drawHand(res.landmarks[0]);
        } else {
            pinchBase = null;
            pinchSm = null;
            drawHand(null);
        }
    }
}

// 手指點（21 點）：0=手腕, 4=拇指尖, 8=食指尖, 9=中指 MCP；手掌中心取 0/5/9/13/17 平均
function palmCenter(lm){ let x = 0, y = 0; for (const i of [0, 5, 9, 13, 17]){ x += lm[i].x; y += lm[i].y; } return { x: x / 5, y: y / 5 }; }

function handleHand(lm, wl){
    const t = performance.now();
    const c = palmCenter(lm);
    palmTrail.push({ x: c.x, y: c.y, t });
    // 時間窗：只保留最近 SWIPE_MS 內的軌跡點（改用時間而非幀數，抗低幀率）
    while (palmTrail.length && t - palmTrail[0].t > SWIPE_MS) palmTrail.shift();

    // ── 滑動偵測（上下=樓層、左右=倉） ──
    if (palmTrail.length >= 4){
        const a = palmTrail[0], b = palmTrail[palmTrail.length - 1];
        if (b.t - a.t >= SWIPE_BETWEEN){
            const dy = b.y - a.y, dx = b.x - a.x;
            if (Math.abs(dy) > Math.abs(dx) * SWIPE_DOM && Math.abs(dy) > SWIPE_MIN){
                if (t > floorCd){ stepFloor(dy < 0 ? 1 : -1); floorCd = t + COOLDOWN; palmTrail.length = 0; flashSwipe(dy < 0 ? 'up' : 'down', '樓層 ' + (dy < 0 ? '▲' : '▼')); }   // y 減＝往上＝樓層＋
            } else if (Math.abs(dx) > Math.abs(dy) * SWIPE_DOM && Math.abs(dx) > SWIPE_MIN){
                if (t > whCd){ stepWarehouse(dx > 0 ? 1 : -1); whCd = t + COOLDOWN; palmTrail.length = 0; flashSwipe(dx > 0 ? 'right' : 'left', '切倉 ' + (dx > 0 ? '▶' : '◀')); }        // x 增＝往右＝下一倉
            }
        }
    }

    // ── 捏合縮放（worldLandmarks 公尺；EMA 平滑 + 較大死區，避免靜止抖動誤觸） ──
    if (wl){
        const d = (i, j) => Math.hypot(wl[i].x - wl[j].x, wl[i].y - wl[j].y, wl[i].z - wl[j].z);
        const ratio = d(4, 8) / (d(0, 9) || 1e-6);   // 拇-食距離 / 手腕-中指（手掌尺度）
        pinchSm = pinchSm === null ? ratio : pinchSm * 0.7 + ratio * 0.3;
        if (pinchBase === null) pinchBase = pinchSm;
        const delta = pinchSm - pinchBase;
        if (Math.abs(delta) > PINCH_MIN){ zoomBy(delta * ZOOM_GAIN); pinchBase = pinchSm; setStatus('縮放 ' + (delta > 0 ? '+' : '−')); }
    } else { pinchBase = null; pinchSm = null; }
}

function stepFloor(delta){
    const cur = FLOOR_IDS.indexOf(activeChip(FLOOR_IDS));
    const from = cur < 0 ? 1 : cur;
    const to = Math.max(0, Math.min(2, from + delta));
    if (to !== from){ const el = $(FLOOR_IDS[to]); if (el) el.click(); }
}
function stepWarehouse(delta){
    const cur = WH_IDS.indexOf(activeChip(WH_IDS));
    const from = cur < 0 ? 2 : cur;   // 預設 C
    const to = Math.max(0, Math.min(WH_IDS.length - 1, from + delta));
    if (to !== from){ const el = $(WH_IDS[to]); if (el) el.click(); }
}
function zoomBy(deltaY){
    // 注意：#view3d 內第一個 canvas 是本模組的疊層 #gestCanvas，必須排除，否則縮放事件送錯對象
    const canvas = document.querySelector('#view3d canvas:not(#gestCanvas)') || document.querySelector('.view3d-panel canvas:not(#gestCanvas)');
    if (!canvas) return;
    const clamped = Math.max(-ZOOM_MAX, Math.min(ZOOM_MAX, deltaY));
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: clamped, bubbles: true, cancelable: true }));
}

// ── 手部追蹤視覺化（疊在 #gestCam 上的透明 canvas） ──
let swipeFx = null;
function setStatus(txt){
    if (!statusEl) return;
    statusEl.textContent = txt;
    clearTimeout(statusCd);
    statusCd = setTimeout(() => { if (running && statusEl) statusEl.textContent = '追蹤中…'; }, 1200);
}
function flashSwipe(dir, label){ swipeFx = { dir, t: performance.now() }; setStatus(label); }

function drawArrow(dir, cx, cy){
    const v = dir === 'up' ? [0, -1] : dir === 'down' ? [0, 1] : dir === 'left' ? [-1, 0] : [1, 0];
    const L = 28, x1 = cx - v[0] * L / 2, y1 = cy - v[1] * L / 2, x2 = cx + v[0] * L / 2, y2 = cy + v[1] * L / 2;
    ctx.strokeStyle = C_ARROW; ctx.fillStyle = C_ARROW; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(v[1], v[0]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8 * Math.cos(ang - 0.45), y2 - 8 * Math.sin(ang - 0.45));
    ctx.lineTo(x2 - 8 * Math.cos(ang + 0.45), y2 - 8 * Math.sin(ang + 0.45));
    ctx.closePath(); ctx.fill();
}

function drawHand(lm){
    if (!ctx || !cv) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (!lm){
        if (statusEl && statusEl.textContent !== '偵測中…') statusEl.textContent = '偵測中…';
        swipeFx = null;
        return;
    }
    if (statusEl && statusEl.textContent === '偵測中…') statusEl.textContent = '追蹤中…';
    const W = cv.width, H = cv.height;

    // 手掌中心軌跡（淡藍）
    if (palmTrail.length > 1){
        ctx.lineWidth = 2; ctx.strokeStyle = C_TRAIL;
        ctx.beginPath();
        palmTrail.forEach((q, i) => { const X = q.x * W, Y = q.y * H; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
        ctx.stroke();
    }

    // 骨架
    ctx.lineWidth = 1.5; ctx.strokeStyle = C_EDGE;
    ctx.beginPath();
    for (const [a, b] of HAND_EDGES){ ctx.moveTo(lm[a].x * W, lm[a].y * H); ctx.lineTo(lm[b].x * W, lm[b].y * H); }
    ctx.stroke();

    // 21 關節（指尖高亮）
    for (let i = 0; i < lm.length; i++){
        const tip = TIPS.indexOf(i) >= 0;
        ctx.fillStyle = tip ? C_TIP : C_JOINT;
        ctx.beginPath(); ctx.arc(lm[i].x * W, lm[i].y * H, tip ? 4 : 2.5, 0, Math.PI * 2); ctx.fill();
    }

    // 手掌中心
    const c = palmCenter(lm);
    ctx.fillStyle = C_PALM;
    ctx.beginPath(); ctx.arc(c.x * W, c.y * H, 5, 0, Math.PI * 2); ctx.fill();

    // 滑動方向箭頭（觸發後 600ms 內）
    if (swipeFx){
        if (performance.now() - swipeFx.t < 600) drawArrow(swipeFx.dir, c.x * W, c.y * H);
        else swipeFx = null;
    }
}

// ── 開關 chip 綁定（模組延遲執行，DOM 已就緒） ──
const chip = $('btnGesture');
const GEST_OK = !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
if (chip){
    if (!GEST_OK){ chip.classList.add('disabled'); chip.title = '此環境不支援鏡頭（getUserMedia 需 https 或 localhost）'; }
    chip.addEventListener('click', async () => {
        if (!GEST_OK){ alert('手勢功能需要鏡頭權限，且必須在 https 或 localhost 下開啟（目前瀏覽器未提供 navigator.mediaDevices）。'); return; }
        if (running){ stop(); chip.classList.remove('active'); return; }
        try { await start(); chip.classList.add('active'); }
        catch (e){ console.warn('[手勢] 啟動失敗：' + (e && e.message ? e.message : e)); chip.classList.remove('active'); alert('手勢啟動失敗：' + (e && e.message ? e.message : e)); }
    });
}
