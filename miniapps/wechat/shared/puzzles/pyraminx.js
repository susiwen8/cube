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
var pyraminx_exports = {};
__export(pyraminx_exports, {
  pyraminxPuzzle: () => pyraminxPuzzle
});
module.exports = __toCommonJS(pyraminx_exports);
var import_math = require("../render/math.js");
var import_polygon_scene = require("../render/polygon-scene.js");
var import_helpers = require("./helpers.js");
const FACE_LAYOUTS = Object.freeze([
  { face: "U", color: "#4f7ddb", stickerCount: 4 },
  { face: "L", color: "#5aa768", stickerCount: 4 },
  { face: "R", color: "#d94b43", stickerCount: 4 },
  { face: "B", color: "#f0c448", stickerCount: 4 }
]);
const FACE_NORMALS = Object.freeze({
  U: (0, import_math.normalizeVector)([1, 1, 1]),
  L: (0, import_math.normalizeVector)([-1, -1, 1]),
  R: (0, import_math.normalizeVector)([1, -1, -1]),
  B: (0, import_math.normalizeVector)([-1, 1, -1])
});
const MOVE_CYCLES = Object.freeze({
  U: [[0, 2, 1], [4, 8, 12]],
  L: [[4, 6, 5], [1, 14, 9]],
  R: [[8, 10, 9], [2, 5, 12]],
  B: [[12, 14, 13], [0, 10, 6]]
});
const MOVE_PAD = Object.freeze([
  ["U", "U'"],
  ["L", "L'"],
  ["R", "R'"],
  ["B", "B'"]
]);
const SURFACES = buildSurfaceGeometry();
const MOVES = Object.freeze(MOVE_PAD.flat());
const pyraminxPuzzle = {
  id: "pyraminx",
  label: "Pyraminx",
  defaultSize: 3,
  supportsSize(size) {
    return size === 3;
  },
  createSolvedState() {
    return (0, import_helpers.createFaceColorState)("pyraminx", FACE_LAYOUTS);
  },
  applyMove(state, move) {
    const parsed = parseMove(move);
    return (0, import_helpers.applyCyclesToState)(state, MOVE_CYCLES[parsed.face], parsed.turns);
  },
  applyMoves(state, moves) {
    return moves.reduce((current, move) => this.applyMove(current, move), state);
  },
  isSolved(state) {
    return (0, import_helpers.isFaceColorStateSolved)(state, FACE_LAYOUTS);
  },
  generateScramble({ random = Math.random, length = 10 } = {}) {
    const scramble = [];
    while (scramble.length < length) {
      const previous = scramble.at(-1);
      const candidates = MOVES.filter((move) => !previous || move[0] !== previous[0]);
      scramble.push(candidates[Math.floor(random() * candidates.length)]);
    }
    return scramble;
  },
  buildSolvePlan({ state, history = [] }) {
    if (this.isSolved(state)) {
      return { moves: [], strategy: "solved" };
    }
    if (history.length) {
      return {
        moves: (0, import_helpers.invertMoveList)(history, invertMove),
        strategy: "history-fallback"
      };
    }
    return { moves: [], strategy: "unsolved" };
  },
  buildScene(state, camera, options = {}) {
    return (0, import_polygon_scene.projectStickerGeometry)(SURFACES, camera, state.colors, options);
  },
  getDisplayName() {
    return "Pyraminx";
  },
  getRecordsTitle() {
    return "Pyraminx \u6210\u7EE9";
  },
  getMovePad() {
    return MOVE_PAD.map((row) => [...row]);
  },
  showSizePicker: false,
  showLessons: false,
  usesDirectTouchMoves: true,
  touchHitSlop: 18,
  resolveDragIntent(hit, drag) {
    const direction = (0, import_helpers.resolveDragDirection)(drag);
    if (!direction || !MOVE_CYCLES[hit.face]) {
      return { type: "camera" };
    }
    return {
      type: "move",
      move: direction.sign >= 0 ? hit.face : `${hit.face}'`,
      locked: true,
      confidence: Infinity
    };
  }
};
function parseMove(move) {
  const notation = String(move ?? "").trim();
  const face = notation[0];
  const turns = notation.endsWith("'") ? 2 : 1;
  if (!MOVE_CYCLES[face]) {
    throw new Error(`Unsupported Pyraminx move: ${move}`);
  }
  return { face, turns };
}
function invertMove(move) {
  return move.endsWith("'") ? move[0] : `${move[0]}'`;
}
function buildSurfaceGeometry() {
  let colorIndex = 0;
  const surfaces = [];
  for (const layout of FACE_LAYOUTS) {
    const normal = FACE_NORMALS[layout.face];
    const colAxis = (0, import_math.normalizeVector)((0, import_math.crossProduct)([0, 1, 0], normal).map((value) => Number.isFinite(value) ? value : 0));
    const safeColAxis = colAxis.some((value) => Math.abs(value) > 0.01) ? colAxis : (0, import_math.normalizeVector)((0, import_math.crossProduct)([1, 0, 0], normal));
    const rowAxis = (0, import_math.normalizeVector)((0, import_math.crossProduct)(normal, safeColAxis));
    const stickerCenter = (0, import_math.scaleVector)(normal, 1.72);
    const shellCenter = (0, import_math.scaleVector)(normal, 1.26);
    const localTriangles = getLocalTriangles(1.18);
    const shell = getLocalShellTriangle();
    surfaces.push({
      face: layout.face,
      index: "shell",
      center: averageCorners(shell, shellCenter, safeColAxis, rowAxis),
      corners: shell.map(([x, y]) => [
        shellCenter[0] + safeColAxis[0] * x + rowAxis[0] * y,
        shellCenter[1] + safeColAxis[1] * x + rowAxis[1] * y,
        shellCenter[2] + safeColAxis[2] * x + rowAxis[2] * y
      ]),
      normal,
      surfaceType: "shell",
      fillColor: (0, import_helpers.mixHexColors)(layout.color, "#222831", 0.56),
      strokeColor: "rgba(7, 11, 18, 0.72)",
      strokeWidth: 1.5,
      hitPriority: 1
    });
    for (let index = 0; index < localTriangles.length; index += 1) {
      surfaces.push({
        face: layout.face,
        index,
        colorIndex,
        center: averageCorners(localTriangles[index], stickerCenter, safeColAxis, rowAxis),
        corners: localTriangles[index].map(([x, y]) => [
          stickerCenter[0] + safeColAxis[0] * x + rowAxis[0] * y,
          stickerCenter[1] + safeColAxis[1] * x + rowAxis[1] * y,
          stickerCenter[2] + safeColAxis[2] * x + rowAxis[2] * y
        ]),
        normal,
        surfaceType: "sticker",
        hitPriority: 2
      });
      colorIndex += 1;
    }
  }
  return surfaces;
}
function getLocalTriangles(scale = 1) {
  const top = [0, -1.16 * scale];
  const left = [-1.08 * scale, 0.63 * scale];
  const right = [1.08 * scale, 0.63 * scale];
  const topLeft = midpoint(top, left);
  const topRight = midpoint(top, right);
  const bottomMid = midpoint(left, right);
  return [
    [top, topLeft, topRight],
    [left, bottomMid, topLeft],
    [right, topRight, bottomMid],
    [topLeft, bottomMid, topRight]
  ];
}
function getLocalShellTriangle() {
  return [
    [0, -2.08],
    [-1.94, 1.12],
    [1.94, 1.12]
  ];
}
function midpoint([ax, ay], [bx, by]) {
  return [(ax + bx) / 2, (ay + by) / 2];
}
function averageCorners(points, center, colAxis, rowAxis) {
  const average = points.reduce((accumulator, [x, y]) => [accumulator[0] + x, accumulator[1] + y], [0, 0]);
  const localX = average[0] / points.length;
  const localY = average[1] / points.length;
  return [
    center[0] + colAxis[0] * localX + rowAxis[0] * localY,
    center[1] + colAxis[1] * localX + rowAxis[1] * localY,
    center[2] + colAxis[2] * localX + rowAxis[2] * localY
  ];
}
