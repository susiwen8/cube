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
var session_exports = {};
__export(session_exports, {
  applySessionMove: () => applySessionMove,
  createSessionState: () => createSessionState,
  queueAutoSolve: () => queueAutoSolve,
  scrambleSession: () => scrambleSession,
  stepAutoSolve: () => stepAutoSolve
});
module.exports = __toCommonJS(session_exports);
var import_moves = require("./moves.js");
var import_timer = require("./timer.js");
var import_catalog = require("../puzzles/catalog.js");
function createSessionState(options = {}) {
  const puzzleId = options.puzzleId ?? "cube";
  const puzzle = (0, import_catalog.getPuzzleDefinition)(puzzleId);
  const size = puzzle.supportsSize(options.size ?? puzzle.defaultSize) ? options.size ?? puzzle.defaultSize : puzzle.defaultSize;
  return {
    puzzleId: puzzle.id,
    size,
    mode: "free",
    cube: puzzle.createSolvedState({ size }),
    history: [],
    scramble: [],
    solveQueue: [],
    solveStrategy: null,
    assisted: false,
    moveCount: 0,
    timer: (0, import_timer.createTimerState)(),
    records: []
  };
}
function scrambleSession(session, scramble = getPuzzle(session).generateScramble({ size: session.size }), options = {}) {
  const { timed = false, at = 0 } = options;
  const puzzle = getPuzzle(session);
  const cube = puzzle.applyMoves(puzzle.createSolvedState({ size: session.size }), scramble);
  return {
    ...session,
    cube,
    history: normalizeHistory(session, scramble),
    scramble: [...scramble],
    solveQueue: [],
    solveStrategy: null,
    assisted: false,
    moveCount: 0,
    timer: timed ? (0, import_timer.startTimer)((0, import_timer.createTimerState)(), at) : (0, import_timer.createTimerState)()
  };
}
function applySessionMove(session, move, options = {}) {
  const { at = 0, source = "user" } = options;
  const puzzle = getPuzzle(session);
  const cube = puzzle.applyMove(session.cube, move);
  const history = normalizeHistory(session, [...session.history, move]);
  const moveCount = source === "user" ? session.moveCount + 1 : session.moveCount;
  let timer = session.timer;
  if (timer.status === "pending") {
    timer = (0, import_timer.startTimer)(timer, at);
  }
  if (puzzle.isSolved(cube)) {
    timer = (0, import_timer.stopTimer)(timer, at);
  }
  return {
    ...session,
    cube,
    history,
    moveCount,
    timer,
    solveQueue: source === "solve" ? session.solveQueue.slice(1) : session.solveQueue
  };
}
function queueAutoSolve(session) {
  const solvePlan = getPuzzle(session).buildSolvePlan({
    state: session.cube,
    history: session.history,
    size: session.size
  });
  return {
    ...session,
    assisted: true,
    solveQueue: solvePlan.moves,
    solveStrategy: solvePlan.strategy
  };
}
function stepAutoSolve(session, options = {}) {
  const nextMove = session.solveQueue[0];
  if (!nextMove) {
    return session;
  }
  return applySessionMove(session, nextMove, { ...options, source: "solve" });
}
function getPuzzle(session) {
  return (0, import_catalog.getPuzzleDefinition)(session.puzzleId);
}
function normalizeHistory(session, moves) {
  if (session.puzzleId === "cube") {
    return (0, import_moves.normalizeMoveHistory)(moves);
  }
  return [...moves];
}
