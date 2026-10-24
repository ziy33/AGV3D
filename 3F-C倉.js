// ==================== 3F C 倉（三樓複本，clone 自 2F world）— 每倉一個 JS ====================
let c3Group = null;   // C 三樓複本
function buildFloor3C() {
    if (!floor3Group || !world || c3Group) return;
    c3Group = safeClone(world);
    c3Group.position.y = FLOOR_Y + 5;
    floor3Group.add(c3Group);
}
