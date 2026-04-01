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
var polygon_scene_exports = {};
__export(polygon_scene_exports, {
  projectStickerGeometry: () => projectStickerGeometry
});
module.exports = __toCommonJS(polygon_scene_exports);
var import_projection = require("./projection.js");
function projectStickerGeometry(stickers, camera, colors, options = {}) {
  const highlightFaceSet = options.highlightFaces?.length ? new Set(options.highlightFaces) : null;
  const scene = [];
  for (const sticker of stickers) {
    const cameraNormal = (0, import_projection.toCameraSpace)(camera, sticker.normal);
    if (cameraNormal[2] <= 0) {
      continue;
    }
    const points = sticker.corners.map((corner) => (0, import_projection.projectPoint)(camera, corner));
    const centerPoint = (0, import_projection.projectPoint)(camera, sticker.center);
    scene.push({
      face: sticker.face,
      index: sticker.index,
      points,
      centerPoint,
      averageDepth: points.reduce((sum, point) => sum + point.depth, 0) / points.length,
      color: sticker.fillColor ?? colors[sticker.colorIndex] ?? "#20242c",
      highlighted: highlightFaceSet?.has(sticker.face) ?? false,
      size: sticker.size ?? 3,
      row: sticker.row ?? 0,
      col: sticker.col ?? 0,
      cubie: sticker.cubie ?? [0, 0, 0],
      center: [...sticker.center],
      projectedBasis: sticker.projectedBasis ?? null,
      surfaceType: sticker.surfaceType ?? "sticker",
      interactive: sticker.interactive ?? true,
      hitPriority: sticker.hitPriority ?? (sticker.surfaceType === "shell" ? 1 : 2),
      strokeColor: sticker.strokeColor ?? null,
      strokeWidth: sticker.strokeWidth ?? null
    });
  }
  return scene.sort((left, right) => right.averageDepth - left.averageDepth);
}
