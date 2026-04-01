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
var skewb_exports = {};
__export(skewb_exports, {
  skewbPuzzle: () => skewbPuzzle
});
module.exports = __toCommonJS(skewb_exports);
var import_cube_state = require("../core/cube-state.js");
var import_math = require("../render/math.js");
var import_polygon_scene = require("../render/polygon-scene.js");
var import_helpers = require("./helpers.js");
const FACE_LAYOUTS = Object.freeze([
  { face: "U", color: "#f5f7fb", stickerCount: 5 },
  { face: "R", color: "#f45b69", stickerCount: 5 },
  { face: "F", color: "#2ec27e", stickerCount: 5 },
  { face: "D", color: "#ffd447", stickerCount: 5 },
  { face: "L", color: "#ff9f1c", stickerCount: 5 },
  { face: "B", color: "#3a86ff", stickerCount: 5 }
]);
const FACE_OFFSETS = Object.freeze(
  Object.fromEntries(FACE_LAYOUTS.map((layout, index) => [layout.face, index * layout.stickerCount]))
);
const MOVE_PAD = Object.freeze([
  ["R", "R'"],
  ["L", "L'"],
  ["U", "U'"],
  ["B", "B'"]
]);
const MOVE_CYCLES = Object.freeze({
  R: [
    rotateFaceCorners("R"),
    [slot("U", 0), slot("F", 0), slot("D", 0), slot("B", 0)],
    [slot("U", 2), slot("F", 2), slot("D", 2), slot("B", 4)],
    [slot("U", 3), slot("F", 1), slot("D", 1), slot("B", 3)]
  ],
  L: [
    rotateFaceCorners("L"),
    [slot("U", 0), slot("B", 0), slot("D", 0), slot("F", 0)],
    [slot("U", 1), slot("B", 2), slot("D", 3), slot("F", 4)],
    [slot("U", 4), slot("B", 1), slot("D", 4), slot("F", 3)]
  ],
  U: [
    rotateFaceCorners("U"),
    [slot("F", 0), slot("R", 0), slot("B", 0), slot("L", 0)],
    [slot("F", 1), slot("R", 1), slot("B", 1), slot("L", 1)],
    [slot("F", 2), slot("R", 2), slot("B", 2), slot("L", 2)]
  ],
  B: [
    rotateFaceCorners("B"),
    [slot("U", 0), slot("L", 0), slot("D", 0), slot("R", 0)],
    [slot("U", 1), slot("L", 2), slot("D", 4), slot("R", 3)],
    [slot("U", 2), slot("L", 1), slot("D", 3), slot("R", 4)]
  ]
});
const SURFACES = buildSurfaceGeometry();
const MOVES = Object.freeze(MOVE_PAD.flat());
const DRAG_FACE_TO_MOVE = Object.freeze({
  U: "U",
  R: "R",
  F: "R",
  D: "L",
  L: "L",
  B: "B"
});
const skewbPuzzle = {
  id: "skewb",
  label: "Skewb",
  defaultSize: 3,
  supportsSize(size) {
    return size === 3;
  },
  createSolvedState() {
    return (0, import_helpers.createFaceColorState)("skewb", FACE_LAYOUTS);
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
  generateScramble({ random = Math.random, length = 9 } = {}) {
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
    return "Skewb";
  },
  getRecordsTitle() {
    return "Skewb \u6210\u7EE9";
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
    const faceMove = DRAG_FACE_TO_MOVE[hit.face];
    if (!direction || !faceMove) {
      return { type: "camera" };
    }
    return {
      type: "move",
      move: direction.sign >= 0 ? faceMove : `${faceMove}'`,
      locked: true,
      confidence: Infinity
    };
  }
};
function rotateFaceCorners(face) {
  return [slot(face, 1), slot(face, 2), slot(face, 3), slot(face, 4)];
}
function slot(face, index) {
  return FACE_OFFSETS[face] + index;
}
function parseMove(move) {
  const notation = String(move ?? "").trim();
  const face = notation[0];
  const turns = notation.endsWith("'") ? 3 : 1;
  if (!MOVE_CYCLES[face]) {
    throw new Error(`Unsupported Skewb move: ${move}`);
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
    const definition = import_cube_state.FACE_DEFINITIONS[layout.face];
    const stickerCenter = (0, import_math.scaleVector)(definition.normal, 1.88);
    const shellCenter = (0, import_math.scaleVector)(definition.normal, 1.48);
    const colAxis = definition.colAxis;
    const rowAxis = definition.rowAxis;
    const polygons = getLocalPolygons();
    surfaces.push({
      face: layout.face,
      index: "shell",
      center: projectLocalPolygon(getLocalShellPolygon(), shellCenter, colAxis, rowAxis).center,
      corners: projectLocalPolygon(getLocalShellPolygon(), shellCenter, colAxis, rowAxis).corners,
      normal: [...definition.normal],
      surfaceType: "shell",
      fillColor: (0, import_helpers.mixHexColors)(layout.color, "#222831", 0.7),
      strokeColor: "rgba(7, 11, 18, 0.82)",
      strokeWidth: 1.45,
      hitPriority: 1
    });
    for (let index = 0; index < polygons.length; index += 1) {
      const corners = polygons[index].map(([x, y]) => [
        stickerCenter[0] + colAxis[0] * x + rowAxis[0] * y,
        stickerCenter[1] + colAxis[1] * x + rowAxis[1] * y,
        stickerCenter[2] + colAxis[2] * x + rowAxis[2] * y
      ]);
      surfaces.push({
        face: layout.face,
        index,
        colorIndex,
        center: average(corners),
        corners,
        normal: [...definition.normal],
        surfaceType: "sticker",
        hitPriority: 2
      });
      colorIndex += 1;
    }
  }
  return surfaces;
}
function getLocalPolygons() {
  return [
    [[0, -0.47], [0.47, 0], [0, 0.47], [-0.47, 0]],
    [[-1.06, -1.06], [0, -0.47], [-0.47, 0]],
    [[1.06, -1.06], [0.47, 0], [0, -0.47]],
    [[1.06, 1.06], [0, 0.47], [0.47, 0]],
    [[-1.06, 1.06], [-0.47, 0], [0, 0.47]]
  ];
}
function getLocalShellPolygon() {
  return [
    [0, -1.74],
    [1.74, 0],
    [0, 1.74],
    [-1.74, 0]
  ];
}
function projectLocalPolygon(points, center, colAxis, rowAxis) {
  const corners = points.map(([x, y]) => [
    center[0] + colAxis[0] * x + rowAxis[0] * y,
    center[1] + colAxis[1] * x + rowAxis[1] * y,
    center[2] + colAxis[2] * x + rowAxis[2] * y
  ]);
  return {
    corners,
    center: average(corners)
  };
}
function average(corners) {
  const [x, y, z] = corners.reduce(
    (sum, corner) => [sum[0] + corner[0], sum[1] + corner[1], sum[2] + corner[2]],
    [0, 0, 0]
  );
  return [x / corners.length, y / corners.length, z / corners.length];
}
