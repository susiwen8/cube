var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var hit_test_exports = {};
__export(hit_test_exports, {
  hitTestSticker: () => hitTestSticker
});
module.exports = __toCommonJS(hit_test_exports);
function hitTestSticker(scene, x, y, options = {}) {
  const hits = scene.filter((sticker) => sticker.interactive !== false).filter((sticker) => pointInPolygon({ x, y }, sticker.points)).sort(
    (left, right) => (right.hitPriority ?? 0) - (left.hitPriority ?? 0) || left.averageDepth - right.averageDepth
  );
  if (hits[0]) {
    return hits[0];
  }
  const maxCenterDistance = options.maxCenterDistance ?? 0;
  if (maxCenterDistance <= 0) {
    return null;
  }
  const nearest = scene.filter((sticker) => sticker.interactive !== false).map((sticker) => ({
    sticker,
    distance: Math.hypot(sticker.centerPoint.x - x, sticker.centerPoint.y - y)
  })).filter((entry) => entry.distance <= maxCenterDistance).sort(
    (left, right) => (right.sticker.hitPriority ?? 0) - (left.sticker.hitPriority ?? 0) || left.distance - right.distance || left.sticker.averageDepth - right.sticker.averageDepth
  );
  return nearest[0]?.sticker ?? null;
}
function pointInPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const intersects = currentPoint.y > point.y !== previousPoint.y > point.y && point.x < (previousPoint.x - currentPoint.x) * (point.y - currentPoint.y) / (previousPoint.y - currentPoint.y) + currentPoint.x;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}
