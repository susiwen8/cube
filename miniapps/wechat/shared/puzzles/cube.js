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
var cube_exports = {};
__export(cube_exports, {
  cubePuzzle: () => cubePuzzle
});
module.exports = __toCommonJS(cube_exports);
var import_cube_state = require("../core/cube-state.js");
var import_scramble = require("../core/scramble.js");
var import_solver = require("../core/solver.js");
var import_cube_renderer = require("../render/cube-renderer.js");
const cubePuzzle = {
  id: "cube",
  label: "\u9B54\u65B9",
  defaultSize: 3,
  supportsSize(size) {
    return Number.isInteger(size) && size >= 3 && size <= 10;
  },
  createSolvedState({ size = 3 } = {}) {
    return (0, import_cube_state.createSolvedState)(size);
  },
  applyMove(state, move) {
    return (0, import_cube_state.applyMove)(state, move);
  },
  applyMoves(state, moves) {
    return (0, import_cube_state.applyMoves)(state, moves);
  },
  isSolved(state) {
    return (0, import_cube_state.isSolved)(state);
  },
  generateScramble({ size = 3, random } = {}) {
    return (0, import_scramble.generateScramble)({ size, random });
  },
  buildSolvePlan({ state, history }) {
    return (0, import_solver.buildSolvePlan)({
      cube: state,
      history,
      maxDepth: history?.length ? 0 : void 0
    });
  },
  buildScene(state, camera, options = {}) {
    return (0, import_cube_renderer.buildStickerScene)(state, camera, options);
  },
  getDisplayName(size = 3) {
    return `${size}\u9636\u9B54\u65B9`;
  },
  getRecordsTitle(size = 3) {
    return `${size}\u9636\u6210\u7EE9`;
  },
  getMovePad() {
    return [];
  },
  showSizePicker: true,
  showLessons: true,
  usesDirectTouchMoves: true,
  cameraDistance: 5.9,
  cameraOffsetX: -4,
  cameraOffsetY: -18
};
