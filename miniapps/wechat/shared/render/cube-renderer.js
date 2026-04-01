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
var cube_renderer_exports = {};
__export(cube_renderer_exports, {
  buildStickerScene: () => buildStickerScene,
  drawStickerScene: () => drawStickerScene
});
module.exports = __toCommonJS(cube_renderer_exports);
var import_cube_state = require("../core/cube-state.js");
var import_moves = require("../core/moves.js");
var import_math = require("./math.js");
var import_projection = require("./projection.js");
const COLOR_PALETTE = {
  W: "#f5f7fb",
  Y: "#ffd447",
  R: "#f45b69",
  O: "#ff9f1c",
  G: "#2ec27e",
  B: "#3a86ff"
};
const FACE_OFFSET = 1.5;
const FACE_FILL_EXTENT = 2.84;
const STICKER_GAP = 0.08;
const GEOMETRY_CACHE = /* @__PURE__ */ new Map();
function buildStickerScene(state, camera, options = {}) {
  const { animation = null, highlightFaces = [] } = options;
  const slots = (0, import_cube_state.getStaticSlotMetadata)(state.size);
  const geometries = getBaseGeometry(state.size);
  const highlightFaceSet = highlightFaces.length ? new Set(highlightFaces) : null;
  const stickers = [];
  for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
    const slot = slots[slotIndex];
    const geometry = geometries[slotIndex];
    const transformed = animation ? applyAnimation(slot, geometry, animation) : geometry;
    const cameraNormal = (0, import_projection.toCameraSpace)(camera, transformed.normal);
    if (cameraNormal[2] <= 0) {
      continue;
    }
    const points = transformed.corners.map((corner) => (0, import_projection.projectPoint)(camera, corner));
    const center = (0, import_projection.projectPoint)(camera, transformed.center);
    stickers.push({
      size: slot.size,
      face: slot.face,
      row: slot.row,
      col: slot.col,
      index: slot.index,
      cubie: [...slot.cubie],
      center: [...transformed.center],
      points,
      centerPoint: center,
      projectedBasis: {
        col: averagePoint(points[1], points[2], points[0], points[3]),
        row: averagePoint(points[2], points[3], points[0], points[1])
      },
      averageDepth: points.reduce((sum, point) => sum + point.depth, 0) / points.length,
      color: COLOR_PALETTE[state.colors[slotIndex]],
      highlighted: highlightFaceSet?.has(slot.face) ?? false
    });
  }
  return stickers.sort((left, right) => right.averageDepth - left.averageDepth);
}
function drawStickerScene(ctx, scene) {
  const width = ctx.canvas?.width ?? ctx.width ?? 320;
  const height = ctx.canvas?.height ?? ctx.height ?? 320;
  ctx.clearRect(0, 0, width, height);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (const sticker of scene) {
    ctx.beginPath();
    ctx.moveTo(sticker.points[0].x, sticker.points[0].y);
    for (let index = 1; index < sticker.points.length; index += 1) {
      ctx.lineTo(sticker.points[index].x, sticker.points[index].y);
    }
    ctx.closePath();
    setFillStyle(ctx, sticker.color);
    ctx.fill();
    if (shouldStrokeSurface(sticker)) {
      setLineWidth(ctx, getSurfaceStrokeWidth(sticker));
      setStrokeStyle(ctx, getSurfaceStrokeColor(sticker));
      ctx.stroke();
    }
  }
}
function getBaseGeometry(size) {
  if (!GEOMETRY_CACHE.has(size)) {
    const slots = (0, import_cube_state.getStaticSlotMetadata)(size);
    GEOMETRY_CACHE.set(
      size,
      slots.map((slot) => createStickerGeometry(slot, import_cube_state.FACE_DEFINITIONS[slot.face]))
    );
  }
  return GEOMETRY_CACHE.get(size);
}
function shouldStrokeSurface(sticker) {
  if (sticker.strokeColor || sticker.strokeWidth) {
    return true;
  }
  if (sticker.surfaceType === "shell") {
    return true;
  }
  if (sticker.highlighted) {
    return true;
  }
  return sticker.size < 8;
}
function getSurfaceStrokeWidth(sticker) {
  if (sticker.strokeWidth) {
    return sticker.strokeWidth;
  }
  if (sticker.surfaceType === "shell") {
    return sticker.highlighted ? 2.2 : 1.4;
  }
  if (sticker.highlighted) {
    return sticker.size >= 8 ? 2 : 3;
  }
  return sticker.size >= 7 ? 1 : 1.5;
}
function getSurfaceStrokeColor(sticker) {
  if (sticker.strokeColor) {
    return sticker.strokeColor;
  }
  if (sticker.highlighted) {
    return "#ffffff";
  }
  if (sticker.surfaceType === "shell") {
    return "rgba(8, 15, 30, 0.7)";
  }
  return sticker.size >= 7 ? "rgba(8, 15, 30, 0.24)" : "rgba(8, 15, 30, 0.35)";
}
function setFillStyle(ctx, color) {
  if (typeof ctx.setFillStyle === "function") {
    ctx.setFillStyle(color);
    return;
  }
  ctx.fillStyle = color;
}
function setStrokeStyle(ctx, color) {
  if (typeof ctx.setStrokeStyle === "function") {
    ctx.setStrokeStyle(color);
    return;
  }
  ctx.strokeStyle = color;
}
function setLineWidth(ctx, width) {
  if (typeof ctx.setLineWidth === "function") {
    ctx.setLineWidth(width);
    return;
  }
  ctx.lineWidth = width;
}
function createStickerGeometry(slot, faceDefinition) {
  const stickerSize = Math.max(
    0.01,
    (FACE_FILL_EXTENT - STICKER_GAP * Math.max(0, slot.size - 1)) / slot.size
  );
  const pitch = stickerSize + STICKER_GAP;
  const origin = -FACE_FILL_EXTENT / 2 + stickerSize / 2;
  const stickerHalf = stickerSize / 2;
  const colOffset = origin + slot.col * pitch;
  const rowOffset = origin + slot.row * pitch;
  const center = (0, import_math.addVectors)(
    (0, import_math.scaleVector)(faceDefinition.normal, FACE_OFFSET),
    (0, import_math.scaleVector)(faceDefinition.colAxis, colOffset),
    (0, import_math.scaleVector)(faceDefinition.rowAxis, rowOffset)
  );
  const corners = [
    (0, import_math.addVectors)(center, (0, import_math.scaleVector)(faceDefinition.colAxis, -stickerHalf), (0, import_math.scaleVector)(faceDefinition.rowAxis, -stickerHalf)),
    (0, import_math.addVectors)(center, (0, import_math.scaleVector)(faceDefinition.colAxis, stickerHalf), (0, import_math.scaleVector)(faceDefinition.rowAxis, -stickerHalf)),
    (0, import_math.addVectors)(center, (0, import_math.scaleVector)(faceDefinition.colAxis, stickerHalf), (0, import_math.scaleVector)(faceDefinition.rowAxis, stickerHalf)),
    (0, import_math.addVectors)(center, (0, import_math.scaleVector)(faceDefinition.colAxis, -stickerHalf), (0, import_math.scaleVector)(faceDefinition.rowAxis, stickerHalf))
  ];
  return {
    center,
    corners,
    normal: [...faceDefinition.normal]
  };
}
function applyAnimation(slot, geometry, animation) {
  const parsed = (0, import_moves.parseMove)(animation.move);
  const axisIndex = { x: 0, y: 1, z: 2 }[parsed.axis];
  const layer = (0, import_moves.getLayerCoordinate)(slot.size, parsed);
  if (slot.cubie[axisIndex] !== layer) {
    return geometry;
  }
  const angle = parsed.turns * (Math.PI / 2) * animation.progress;
  return {
    center: (0, import_math.rotateAroundAxisName)(geometry.center, parsed.axis, angle),
    corners: geometry.corners.map((corner) => (0, import_math.rotateAroundAxisName)(corner, parsed.axis, angle)),
    normal: (0, import_math.rotateAroundAxisName)(geometry.normal, parsed.axis, angle)
  };
}
function averagePoint(positiveA, positiveB, negativeA, negativeB) {
  return {
    x: (positiveA.x + positiveB.x - negativeA.x - negativeB.x) / 2,
    y: (positiveA.y + positiveB.y - negativeA.y - negativeB.y) / 2
  };
}
