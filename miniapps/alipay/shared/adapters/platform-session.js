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
var platform_session_exports = {};
__export(platform_session_exports, {
  createStorageAdapter: () => createStorageAdapter,
  getSupportedCubeSizes: () => getSupportedCubeSizes,
  normalizeTouches: () => normalizeTouches,
  toPageViewModel: () => toPageViewModel
});
module.exports = __toCommonJS(platform_session_exports);
var import_tutorial = require("../core/tutorial.js");
var import_storage = require("./storage.js");
var import_catalog = require("../puzzles/catalog.js");
const SUPPORTED_CUBE_SIZES = Object.freeze([3, 4, 5, 6, 7, 8, 9, 10]);
function createStorageAdapter(backend) {
  return (0, import_storage.createStorageAdapter)(backend);
}
function getSupportedCubeSizes() {
  return [...SUPPORTED_CUBE_SIZES];
}
function normalizeTouches(event = {}) {
  return {
    touches: normalizeTouchList(event.touches),
    changedTouches: normalizeTouchList(event.changedTouches)
  };
}
function toPageViewModel(session, options = {}) {
  const puzzle = (0, import_catalog.getPuzzleDefinition)(session.puzzleId);
  const sizeLabel = puzzle.getDisplayName?.(session.size) ?? (session.puzzleId === "cube" ? `${session.size}\u9636\u9B54\u65B9` : puzzle.label);
  const recordsTitle = puzzle.getRecordsTitle?.(session.size) ?? (session.puzzleId === "cube" ? `${session.size}\u9636\u6210\u7EE9` : `${puzzle.label} \u6210\u7EE9`);
  return {
    puzzleId: session.puzzleId ?? "cube",
    puzzleLabel: puzzle.label,
    size: session.size,
    sizeLabel,
    recordsTitle,
    showSizePicker: puzzle.showSizePicker ?? false,
    showLessons: puzzle.showLessons ?? false,
    movePad: puzzle.getMovePad?.() ?? [],
    mode: session.mode,
    moveCount: session.moveCount,
    assisted: session.assisted,
    timerLabel: formatDuration(options.elapsedMs ?? session.timer.elapsedMs),
    solveQueueLabel: session.solveQueue.join(" "),
    solveStrategyLabel: formatSolveStrategy(session.solveStrategy),
    statusLabel: formatStatus(session),
    lessonCount: puzzle.showLessons === false ? 0 : (0, import_tutorial.getTutorialLessons)().length
  };
}
function normalizeTouchList(touches = []) {
  return touches.map((touch) => ({
    id: touch.identifier ?? touch.id ?? 0,
    x: touch.x ?? touch.pageX ?? touch.clientX ?? 0,
    y: touch.y ?? touch.pageY ?? touch.clientY ?? 0
  }));
}
function formatStatus(session) {
  if (session.timer.status === "pending") {
    return "\u8BA1\u65F6\u5F85\u5F00\u59CB";
  }
  if (session.timer.status === "running") {
    return session.assisted ? "\u8F85\u52A9\u6C42\u89E3\u4E2D" : "\u8BA1\u65F6\u8FDB\u884C\u4E2D";
  }
  if (session.timer.status === "finished") {
    return session.assisted ? "\u8F85\u52A9\u5B8C\u6210" : "\u5DF2\u5B8C\u6210";
  }
  return "\u81EA\u7531\u64CD\u4F5C";
}
function formatSolveStrategy(strategy) {
  if (strategy === "state-search") {
    return "\u72B6\u6001\u641C\u7D22";
  }
  if (strategy === "history-fallback") {
    return "\u5386\u53F2\u56DE\u9000";
  }
  if (strategy === "solved") {
    return "\u65E0\u9700\u6C42\u89E3";
  }
  return "\u672A\u51C6\u5907";
}
function formatDuration(elapsedMs) {
  const minutes = Math.floor(elapsedMs / 6e4);
  const seconds = Math.floor(elapsedMs % 6e4 / 1e3);
  const milliseconds = elapsedMs % 1e3;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}
