import { crossProduct, normalizeVector, scaleVector } from '../render/math.js';
import { projectStickerGeometry } from '../render/polygon-scene.js';
import {
  applyCyclesToState,
  createFaceColorState,
  invertMoveList,
  isFaceColorStateSolved,
  mixHexColors,
  resolveDragDirection,
} from './helpers.js';

const PHI = (1 + Math.sqrt(5)) / 2;

const FACE_LAYOUTS = Object.freeze([
  { face: 'A', color: '#f5f7fb', stickerCount: 6 },
  { face: 'B', color: '#f45b69', stickerCount: 6 },
  { face: 'C', color: '#2ec27e', stickerCount: 6 },
  { face: 'D', color: '#ffd447', stickerCount: 6 },
  { face: 'E', color: '#ff9f1c', stickerCount: 6 },
  { face: 'F', color: '#3a86ff', stickerCount: 6 },
  { face: 'G', color: '#ab47bc', stickerCount: 6 },
  { face: 'H', color: '#26a69a', stickerCount: 6 },
  { face: 'I', color: '#ec407a', stickerCount: 6 },
  { face: 'J', color: '#7cb342', stickerCount: 6 },
  { face: 'K', color: '#5c6bc0', stickerCount: 6 },
  { face: 'L', color: '#8d6e63', stickerCount: 6 },
]);

const FACE_OFFSETS = Object.freeze(
  Object.fromEntries(FACE_LAYOUTS.map((layout, index) => [layout.face, index * layout.stickerCount])),
);

const MOVE_PAD = Object.freeze([
  ['R++', 'R--'],
  ['D++', 'D--'],
]);

const MOVE_CYCLES = Object.freeze({
  'R++': [
    rotateFaceOuter('J'),
    [slot('A', 2), slot('C', 2), slot('F', 4), slot('K', 5), slot('E', 1)],
    [slot('A', 3), slot('C', 3), slot('F', 5), slot('K', 1), slot('E', 2)],
  ],
  'R--': [
    reverseCycle(rotateFaceOuter('J')),
    reverseCycle([slot('A', 2), slot('C', 2), slot('F', 4), slot('K', 5), slot('E', 1)]),
    reverseCycle([slot('A', 3), slot('C', 3), slot('F', 5), slot('K', 1), slot('E', 2)]),
  ],
  'D++': [
    rotateFaceOuter('L'),
    [slot('F', 2), slot('G', 2), slot('H', 2), slot('I', 2), slot('J', 2)],
    [slot('F', 3), slot('G', 3), slot('H', 3), slot('I', 3), slot('J', 3)],
  ],
  'D--': [
    reverseCycle(rotateFaceOuter('L')),
    reverseCycle([slot('F', 2), slot('G', 2), slot('H', 2), slot('I', 2), slot('J', 2)]),
    reverseCycle([slot('F', 3), slot('G', 3), slot('H', 3), slot('I', 3), slot('J', 3)]),
  ],
});

const SURFACES = buildSurfaceGeometry();

export const megaminxPuzzle = {
  id: 'megaminx',
  label: 'Megaminx',
  defaultSize: 3,
  supportsSize(size) {
    return size === 3;
  },
  createSolvedState() {
    return createFaceColorState('megaminx', FACE_LAYOUTS);
  },
  applyMove(state, move) {
    if (!MOVE_CYCLES[move]) {
      throw new Error(`Unsupported Megaminx move: ${move}`);
    }

    return applyCyclesToState(state, MOVE_CYCLES[move], 1);
  },
  applyMoves(state, moves) {
    return moves.reduce((current, move) => this.applyMove(current, move), state);
  },
  isSolved(state) {
    return isFaceColorStateSolved(state, FACE_LAYOUTS);
  },
  generateScramble({ random = Math.random, length = 12 } = {}) {
    const moves = MOVE_PAD.flat();
    const scramble = [];

    while (scramble.length < length) {
      const previous = scramble.at(-1);
      const candidates = moves.filter((move) => !previous || move[0] !== previous[0]);
      scramble.push(candidates[Math.floor(random() * candidates.length)]);
    }

    return scramble;
  },
  buildSolvePlan({ state, history = [] }) {
    if (this.isSolved(state)) {
      return { moves: [], strategy: 'solved' };
    }

    if (history.length) {
      return {
        moves: invertMoveList(history, invertMove),
        strategy: 'history-fallback',
      };
    }

    return { moves: [], strategy: 'unsolved' };
  },
  buildScene(state, camera, options = {}) {
    return projectStickerGeometry(SURFACES, camera, state.colors, options);
  },
  getDisplayName() {
    return 'Megaminx';
  },
  getRecordsTitle() {
    return 'Megaminx 成绩';
  },
  getMovePad() {
    return MOVE_PAD.map((row) => [...row]);
  },
  showSizePicker: false,
  showLessons: false,
  usesDirectTouchMoves: true,
  touchHitSlop: 18,
  resolveDragIntent(_hit, drag) {
    const direction = resolveDragDirection(drag);

    if (!direction) {
      return { type: 'camera' };
    }

    if (direction.axis === 'x') {
      return {
        type: 'move',
        move: direction.sign >= 0 ? 'R++' : 'R--',
        locked: true,
        confidence: Infinity,
      };
    }

    return {
      type: 'move',
      move: direction.sign >= 0 ? 'D++' : 'D--',
      locked: true,
      confidence: Infinity,
    };
  },
};

function rotateFaceOuter(face) {
  return [slot(face, 1), slot(face, 2), slot(face, 3), slot(face, 4), slot(face, 5)];
}

function reverseCycle(cycle) {
  return [...cycle].reverse();
}

function slot(face, index) {
  return FACE_OFFSETS[face] + index;
}

function invertMove(move) {
  return move.endsWith('++') ? move.replace('++', '--') : move.replace('--', '++');
}

function buildSurfaceGeometry() {
  const normals = getNormals();
  let colorIndex = 0;
  const surfaces = [];

  for (let faceIndex = 0; faceIndex < FACE_LAYOUTS.length; faceIndex += 1) {
    const layout = FACE_LAYOUTS[faceIndex];
    const normal = normals[faceIndex];
    const colAxis = getAxisFromNormal(normal);
    const rowAxis = normalizeVector(crossProduct(normal, colAxis));
    const stickerCenter = scaleVector(normal, 2.3);
    const shellCenter = scaleVector(normal, 1.92);
    const polygons = getLocalPolygons();
    const shellCorners = getLocalShellPolygon().map(([x, y]) => [
      shellCenter[0] + colAxis[0] * x + rowAxis[0] * y,
      shellCenter[1] + colAxis[1] * x + rowAxis[1] * y,
      shellCenter[2] + colAxis[2] * x + rowAxis[2] * y,
    ]);

    surfaces.push({
      face: layout.face,
      index: 'shell',
      center: average(shellCorners),
      corners: shellCorners,
      normal,
      surfaceType: 'shell',
      fillColor: mixHexColors(layout.color, '#222831', 0.72),
      strokeColor: 'rgba(7, 11, 18, 0.8)',
      strokeWidth: 1.35,
      hitPriority: 1,
    });

    for (let index = 0; index < polygons.length; index += 1) {
      const corners = polygons[index].map(([x, y]) => [
        stickerCenter[0] + colAxis[0] * x + rowAxis[0] * y,
        stickerCenter[1] + colAxis[1] * x + rowAxis[1] * y,
        stickerCenter[2] + colAxis[2] * x + rowAxis[2] * y,
      ]);
      surfaces.push({
        face: layout.face,
        index,
        colorIndex,
        center: average(corners),
        corners,
        normal,
        surfaceType: 'sticker',
        hitPriority: 2,
      });
      colorIndex += 1;
    }
  }

  return surfaces;
}

function getNormals() {
  return [
    [0, 1, PHI],
    [0, 1, -PHI],
    [0, -1, PHI],
    [0, -1, -PHI],
    [1, PHI, 0],
    [1, -PHI, 0],
    [-1, PHI, 0],
    [-1, -PHI, 0],
    [PHI, 0, 1],
    [PHI, 0, -1],
    [-PHI, 0, 1],
    [-PHI, 0, -1],
  ].map((vector) => normalizeVector(vector));
}

function getAxisFromNormal(normal) {
  const tentative = normalizeVector(crossProduct([0, 1, 0], normal));
  if (tentative.some((value) => Math.abs(value) > 0.01)) {
    return tentative;
  }
  return normalizeVector(crossProduct([1, 0, 0], normal));
}

function getLocalPolygons() {
  const outer = [];
  const inner = [];

  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    outer.push([Math.cos(angle) * 1.05, Math.sin(angle) * 1.05]);
    inner.push([Math.cos(angle) * 0.47, Math.sin(angle) * 0.47]);
  }

  return [
    inner,
    [inner[0], outer[0], outer[1], inner[1]],
    [inner[1], outer[1], outer[2], inner[2]],
    [inner[2], outer[2], outer[3], inner[3]],
    [inner[3], outer[3], outer[4], inner[4]],
    [inner[4], outer[4], outer[0], inner[0]],
  ];
}

function getLocalShellPolygon() {
  const shell = [];

  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    shell.push([Math.cos(angle) * 1.62, Math.sin(angle) * 1.62]);
  }

  return shell;
}

function average(corners) {
  const [x, y, z] = corners.reduce(
    (sum, corner) => [sum[0] + corner[0], sum[1] + corner[1], sum[2] + corner[2]],
    [0, 0, 0],
  );

  return [x / corners.length, y / corners.length, z / corners.length];
}
