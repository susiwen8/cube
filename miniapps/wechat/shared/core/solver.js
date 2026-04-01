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
var solver_exports = {};
__export(solver_exports, {
  buildSolvePlan: () => buildSolvePlan,
  buildSolveSequence: () => buildSolveSequence
});
module.exports = __toCommonJS(solver_exports);
var import_cube_state = require("./cube-state.js");
var import_moves = require("./moves.js");
function buildSolveSequence(history) {
  return (0, import_moves.invertMoves)((0, import_moves.normalizeMoveHistory)(history));
}
function buildSolvePlan({ cube, history = [], maxDepth = 7 } = {}) {
  if (!cube) {
    throw new Error("buildSolvePlan requires a cube state");
  }
  if ((0, import_cube_state.isSolved)(cube)) {
    return {
      moves: [],
      strategy: "solved"
    };
  }
  const stateMoves = cube.size === 3 ? findStateSolution(cube, maxDepth) : null;
  if (stateMoves) {
    return {
      moves: stateMoves,
      strategy: "state-search"
    };
  }
  if (history.length > 0) {
    return {
      moves: buildSolveSequence(history),
      strategy: "history-fallback"
    };
  }
  return {
    moves: [],
    strategy: "unsolved"
  };
}
function findStateSolution(cube, maxDepth) {
  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const result = depthLimitedSearch(cube, depth, null, /* @__PURE__ */ new Set([(0, import_cube_state.serializeState)(cube)]));
    if (result) {
      return result;
    }
  }
  return null;
}
function depthLimitedSearch(cube, depthRemaining, previousMove, visited) {
  if ((0, import_cube_state.isSolved)(cube)) {
    return [];
  }
  if (depthRemaining === 0) {
    return null;
  }
  for (const move of (0, import_moves.getAllMoveNames)(cube.size, { includeInner: false })) {
    if (shouldSkipMove(previousMove, move)) {
      continue;
    }
    const nextCube = (0, import_cube_state.applyMove)(cube, move);
    const signature = (0, import_cube_state.serializeState)(nextCube);
    if (visited.has(signature)) {
      continue;
    }
    visited.add(signature);
    const result = depthLimitedSearch(nextCube, depthRemaining - 1, move, visited);
    visited.delete(signature);
    if (result) {
      return [move, ...result];
    }
  }
  return null;
}
function shouldSkipMove(previousMove, nextMove) {
  if (!previousMove) {
    return false;
  }
  const previous = (0, import_moves.parseMove)(previousMove);
  const next = (0, import_moves.parseMove)(nextMove);
  if (previous.face === next.face && previous.depth === next.depth) {
    return true;
  }
  return (0, import_moves.moveAxis)(previousMove) === (0, import_moves.moveAxis)(nextMove) && canonicalMoveKey(previous) > canonicalMoveKey(next);
}
function canonicalMoveKey(parsed) {
  return `${String(parsed.depth).padStart(2, "0")}:${parsed.face}`;
}
