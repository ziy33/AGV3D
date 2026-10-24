// ==================== 3F B 倉（三樓複本，clone 自 2F bwnGroup）— 每倉一個 JS ====================
let b3Group = null;   // B 三樓複本
function buildFloor3B() {
    if (!floor3Group || !bwnGroup || b3Group) return;
    b3Group = safeClone(bwnGroup);
    b3Group.position.y = bwnGroup.position.y + 5;
    floor3Group.add(b3Group);
}
