import { getFaceDefinition } from '../core/cube-state.js';
import { invertMove, parseMove, toMoveNotation } from '../core/moves.js';
import {
  addVectors,
  axisNameFromVector,
  crossProduct,
  dotProduct,
  normalizeVector,
  rotateAroundAxisName,
  scaleVector,
  subtractVectors,
} from './math.js';

const FACE_BY_AXIS_LAYER = {
  'x:1': 'R',
  'x:-1': 'L',
  'y:1': 'U',
  'y:-1': 'D',
  'z:1': 'F',
  'z:-1': 'B',
};

export function mapDragIntent(hit, drag, options = {}) {
  const threshold = options.threshold ?? 12;
  const axisLockRatio = options.axisLockRatio ?? 1.18;

  if (!hit || Math.hypot(drag.dx, drag.dy) < threshold) {
    return { type: 'camera' };
  }

  const faceDefinition = getFaceDefinition(hit.face);
  const axisIntent = resolveAxisIntent(hit, drag, axisLockRatio);

  if (axisIntent.type !== 'move-axis') {
    return axisIntent;
  }

  const dragAxisVector = axisIntent.axis === 'col' ? faceDefinition.colAxis : faceDefinition.rowAxis;
  const dragWorldVector = scaleVector(normalizeVector(dragAxisVector), axisIntent.dragSign);
  const { candidateFace, referencePoint } = getCandidateMove(hit, axisIntent.axis, faceDefinition);
  const parsed = parseMove(candidateFace);
  const movedReferencePoint = rotateAroundAxisName(referencePoint, parsed.axis, parsed.turns * (Math.PI / 2));
  const displacement = subtractVectors(movedReferencePoint, referencePoint);
  const move = dotProduct(displacement, dragWorldVector) >= 0 ? candidateFace : invertMove(candidateFace);

  return {
    type: 'move',
    move,
    locked: true,
    confidence: axisIntent.confidence,
  };
}

function getCandidateMove(hit, dominantAxis, faceDefinition) {
  if (isCenterBlockSticker(hit)) {
    return {
      candidateFace: hit.face,
      referencePoint: createFaceTurnReferencePoint(faceDefinition, dominantAxis),
    };
  }

  if (dominantAxis === 'col') {
    const axisVector = crossProduct(faceDefinition.normal, faceDefinition.colAxis);
    return createLayerMove(axisVector, hit, hit.center, hit.row);
  }

  if (dominantAxis === 'row') {
    const axisVector = crossProduct(faceDefinition.normal, faceDefinition.rowAxis);
    return createLayerMove(axisVector, hit, hit.center, hit.col);
  }

  return {
    candidateFace: hit.face,
    referencePoint: createFaceTurnReferencePoint(faceDefinition, dominantAxis),
  };
}

function createLayerMove(axisVector, hit, referencePoint, stripIndex) {
  const normalizedAxis = normalizeVector(axisVector);
  const { axis } = axisNameFromVector(normalizedAxis);
  const layerCoordinate = hit.cubie[{ x: 0, y: 1, z: 2 }[axis]];
  const layerSign = Math.sign(layerCoordinate) || 1;
  const depth = getDepthForStripIndex(hit.size ?? 3, stripIndex);

  return {
    candidateFace: toMoveNotation(FACE_BY_AXIS_LAYER[`${axis}:${layerSign}`], 1, depth),
    referencePoint,
  };
}

function createFaceTurnReferencePoint(faceDefinition, dominantAxis) {
  if (dominantAxis === 'col') {
    return addVectors(scaleVector(faceDefinition.normal, 2), scaleVector(faceDefinition.rowAxis, -1));
  }

  return addVectors(scaleVector(faceDefinition.normal, 2), scaleVector(faceDefinition.colAxis, 1));
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
      type: 'move-axis',
      axis: Math.abs(drag.dx) >= Math.abs(drag.dy) ? 'col' : 'row',
      dragSign: Math.abs(drag.dx) >= Math.abs(drag.dy) ? Math.sign(drag.dx) || 1 : Math.sign(drag.dy) || 1,
      confidence: Infinity,
    };
  }

  const dragVector = normalize2D({ x: drag.dx, y: drag.dy });
  const colBasis = normalize2D(hit.projectedBasis.col);
  const rowBasis = normalize2D(hit.projectedBasis.row);
  const colScore = Math.abs(dot2D(dragVector, colBasis));
  const rowScore = Math.abs(dot2D(dragVector, rowBasis));
  const maxScore = Math.max(colScore, rowScore);
  const minScore = Math.max(0.001, Math.min(colScore, rowScore));
  const confidence = maxScore / minScore;

  if (confidence < axisLockRatio) {
    return {
      type: 'pending-move',
      confidence,
    };
  }

  const axis = colScore >= rowScore ? 'col' : 'row';
  const basis = axis === 'col' ? colBasis : rowBasis;
  const dragSign = Math.sign(dot2D({ x: drag.dx, y: drag.dy }, basis)) || 1;

  return {
    type: 'move-axis',
    axis,
    dragSign,
    confidence,
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
