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
var app_controller_exports = {};
__export(app_controller_exports, {
  createAppController: () => createAppController
});
module.exports = __toCommonJS(app_controller_exports);
var import_session = require("../core/session.js");
var import_platform_session = require("./platform-session.js");
var import_catalog = require("../puzzles/catalog.js");
const RECORDS_KEY = "cube-records";
function createAppController(options = {}) {
  const storage = (0, import_platform_session.createStorageAdapter)(
    options.storageBackend ?? {
      getItem() {
        return null;
      },
      setItem() {
      }
    }
  );
  let allRecords = normalizeStoredRecords(storage.getJSON(RECORDS_KEY, []));
  let session = withScopedRecords((0, import_session.createSessionState)({ size: options.initialSize ?? 3, puzzleId: options.initialPuzzleId ?? "cube" }));
  function commit(nextSession) {
    if (nextSession.timer.status === "finished" && session.timer.status !== "finished" && !nextSession.assisted) {
      allRecords = [
        {
          puzzleId: nextSession.puzzleId,
          size: nextSession.size,
          elapsedMs: nextSession.timer.elapsedMs,
          moveCount: nextSession.moveCount,
          scramble: [...nextSession.scramble],
          assisted: nextSession.assisted
        },
        ...allRecords
      ].slice(0, 100);
      storage.setJSON(RECORDS_KEY, allRecords);
    }
    session = withScopedRecords(nextSession);
    return session;
  }
  function withScopedRecords(nextSession) {
    return {
      ...nextSession,
      records: allRecords.filter((record) => record.puzzleId === nextSession.puzzleId && (nextSession.puzzleId !== "cube" || record.size === nextSession.size)).slice(0, 20)
    };
  }
  return {
    getSession() {
      return session;
    },
    getViewModel(optionsForView = {}) {
      return (0, import_platform_session.toPageViewModel)(session, optionsForView);
    },
    setMode(mode) {
      return commit({
        ...session,
        mode
      });
    },
    setSize(size) {
      return commit({
        ...(0, import_session.createSessionState)({ size, puzzleId: session.puzzleId }),
        mode: session.mode === "lesson" ? "free" : session.mode
      });
    },
    setPuzzle(puzzleId) {
      const puzzle = (0, import_catalog.getPuzzleDefinition)(puzzleId);
      return commit({
        ...(0, import_session.createSessionState)({ puzzleId: puzzle.id, size: puzzle.defaultSize }),
        mode: "free"
      });
    },
    scramble({ moves, timed = false, at = 0 } = {}) {
      return commit((0, import_session.scrambleSession)(session, moves, { timed, at }));
    },
    applyMove(move, { at = 0 } = {}) {
      return commit((0, import_session.applySessionMove)(session, move, { at }));
    },
    queueAutoSolve() {
      return commit((0, import_session.queueAutoSolve)(session));
    },
    stepAutoSolve({ at = 0 } = {}) {
      return commit((0, import_session.stepAutoSolve)(session, { at }));
    },
    reset() {
      return commit({
        ...(0, import_session.createSessionState)({ size: session.size, puzzleId: session.puzzleId }),
        mode: session.mode
      });
    }
  };
}
function normalizeStoredRecords(records) {
  return records.map((record) => ({
    puzzleId: record.puzzleId ?? "cube",
    size: record.size ?? 3,
    elapsedMs: record.elapsedMs ?? 0,
    moveCount: record.moveCount ?? 0,
    scramble: Array.isArray(record.scramble) ? [...record.scramble] : [],
    assisted: Boolean(record.assisted)
  }));
}
