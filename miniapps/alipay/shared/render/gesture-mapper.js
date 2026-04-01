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
var gesture_mapper_exports = {};
__export(gesture_mapper_exports, {
  mapDragIntent: () => mapDragIntent
});
module.exports = __toCommonJS(gesture_mapper_exports);
var import_cube_state = require("../core/cube-state.js");
var import_moves = require("../core/moves.js");
var import_math = require("./math.js");
const FACE_BY_AXIS_LAYER = {
  "x:1": "R",
  "x:-1": "L",
  "y:1": "U",
  "y:-1": "D",
  "z:1": "F",
  "z:-1": "B"
};
function mapDragIntent(hit, drag, options = {}) {
  const threshold = options.threshold ?? 12;
  const axisLockRatio = options.axisLockRatio ?? 1.18;
  if (!hit || Math.hypot(drag.dx, drag.dy) < threshold) {
    return { type: "camera" };
  }
  const faceDefinition = (0, import_cube_state.getFaceDefinition)(hit.face);
  const axisIntent = resolveAxisIntent(hit, drag, axisLockRatio);
  if (axisIntent.type !== "move-axis") {
    return axisIntent;
  }
  const dragAxisVector = axisIntent.axis === "col" ? faceDefinition.colAxis : faceDefinition.rowAxis;
  const dragWorldVector = (0, import_math.scaleVector)((0, import_math.normalizeVector)(dragAxisVector), axisIntent.dragSign);
  const { candidateFace, referencePoint } = getCandidateMove(hit, axisIntent.axis, faceDefinition);
  const parsed = (0, import_moves.parseMove)(candidateFace);
  const movedReferencePoint = (0, import_math.rotateAroundAxisName)(referencePoint, parsed.axis, parsed.turns * (Math.PI / 2));
  const displacement = (0, import_math.subtractVectors)(movedReferencePoint, referencePoint);
  const move = (0, import_math.dotProduct)(displacement, dragWorldVector) >= 0 ? candidateFace : (0, import_moves.invertMove)(candidateFace);
  return {
    type: "move",
    move,
    locked: true,
    confidence: axisIntent.confidence
  };
}
function getCandidateMove(hit, dominantAxis, faceDefinition) {
  if (isCenterBlockSticker(hit)) {
    return {
      candidateFace: hit.face,
      referencePoint: createFaceTurnReferencePoint(faceDefinition, dominantAxis)
    };
  }
  if (dominantAxis === "col") {
    const axisVector = (0, import_math.crossProduct)(faceDefinition.normal, faceDefinition.colAxis);
    return createLayerMove(axisVector, hit, hit.center, hit.row);
  }
  if (dominantAxis === "row") {
    const axisVector = (0, import_math.crossProduct)(faceDefinition.normal, faceDefinition.rowAxis);
    return createLayerMove(axisVector, hit, hit.center, hit.col);
  }
  return {
    candidateFace: hit.face,
    referencePoint: createFaceTurnReferencePoint(faceDefinition, dominantAxis)
  };
}
function createLayerMove(axisVector, hit, referencePoint, stripIndex) {
  const normalizedAxis = (0, import_math.normalizeVector)(axisVector);
  const { axis } = (0, import_math.axisNameFromVector)(normalizedAxis);
  const layerCoordinate = hit.cubie[{ x: 0, y: 1, z: 2 }[axis]];
  const layerSign = Math.sign(layerCoordinate) || 1;
  const depth = getDepthForStripIndex(hit.size ?? 3, stripIndex);
  return {
    candidateFace: (0, import_moves.toMoveNotation)(FACE_BY_AXIS_LAYER[`${axis}:${layerSign}`], 1, depth),
    referencePoint
  };
}
function createFaceTurnReferencePoint(faceDefinition, dominantAxis) {
  if (dominantAxis === "col") {
    return (0, import_math.addVectors)((0, import_math.scaleVector)(faceDefinition.normal, 2), (0, import_math.scaleVector)(faceDefinition.rowAxis, -1));
  }
  return (0, import_math.addVectors)((0, import_math.scaleVector)(faceDefinition.normal, 2), (0, import_math.scaleVector)(faceDefinition.colAxis, 1));
}
function isCenterBlockSticker(hit) {
  const size = hit.size ?? 3;
  return isCenterBandIndex(hit.row, size) && isCenterBandIndex(hit.col, size);
}
function isCenterBandIndex(index, size) {
  const start = Math.floor((size - 1) / 2);
  const end = Math.ceil((size - 1) / 2);
  return index >= start && index <= end;
}
function getDepthForStripIndex(size, index) {
  return Math.min(index, size - 1 - index) + 1;
}
function resolveAxisIntent(hit, drag, axisLockRatio) {
  if (!hit.projectedBasis) {
    return {
      type: "move-axis",
      axis: Math.abs(drag.dx) >= Math.abs(drag.dy) ? "col" : "row",
      dragSign: Math.abs(drag.dx) >= Math.abs(drag.dy) ? Math.sign(drag.dx) || 1 : Math.sign(drag.dy) || 1,
      confidence: Infinity
    };
  }
  const dragVector = normalize2D({ x: drag.dx, y: drag.dy });
  const colBasis = normalize2D(hit.projectedBasis.col);
  const rowBasis = normalize2D(hit.projectedBasis.row);
  const colScore = Math.abs(dot2D(dragVector, colBasis));
  const rowScore = Math.abs(dot2D(dragVector, rowBasis));
  const maxScore = Math.max(colScore, rowScore);
  const minScore = Math.max(1e-3, Math.min(colScore, rowScore));
  const confidence = maxScore / minScore;
  if (confidence < axisLockRatio) {
    return {
      type: "pending-move",
      confidence
    };
  }
  const axis = colScore >= rowScore ? "col" : "row";
  const basis = axis === "col" ? colBasis : rowBasis;
  const dragSign = Math.sign(dot2D({ x: drag.dx, y: drag.dy }, basis)) || 1;
  return {
    type: "move-axis",
    axis,
    dragSign,
    confidence
  };
}
function normalize2D(vector) {
  const length = Math.hypot(vector.x, vector.y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: vector.x / length, y: vector.y / length };
}
function dot2D(left, right) {
  return left.x * right.x + left.y * right.y;
}
