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
var miniapp_page_exports = {};
__export(miniapp_page_exports, {
  createMiniappPage: () => createMiniappPage
});
module.exports = __toCommonJS(miniapp_page_exports);
var import_tutorial = require("../core/tutorial.js");
var import_platform_session = require("./platform-session.js");
var import_app_runtime = require("../runtime/app-runtime.js");
const SIZE_OPTIONS = Object.freeze(
  (0, import_platform_session.getSupportedCubeSizes)().map((size) => ({
    value: size,
    label: `${size}\u9636`
  }))
);
function createMiniappPage(platform) {
  const lessons = platform.lessons ?? (0, import_tutorial.getTutorialLessons)();
  return {
    data: (0, import_app_runtime.createInitialViewData)(lessons),
    onLoad() {
      this.__runtime = (0, import_app_runtime.createAppRuntime)({
        ...platform,
        lessons,
        updateView: (patch) => {
          this.setData(patch);
        }
      });
      this.__runtime.load(this);
    },
    onReady() {
      this.__runtime.ready(this);
    },
    onUnload() {
      this.__runtime.unload();
    },
    handleModeChange(event) {
      this.__runtime.handleModeChange(event.currentTarget.dataset.mode);
    },
    handleSizeChange(event) {
      const size = parseSizeSelection(event);
      this.__runtime.handleSizeChange(size);
    },
    handlePuzzleChange(event) {
      const puzzleId = event.currentTarget?.dataset?.puzzleId ?? event.detail?.puzzleId ?? event.detail?.value;
      this.__runtime.handlePuzzleChange(puzzleId);
    },
    handleMovePadMove(event) {
      const move = event.currentTarget?.dataset?.move ?? event.detail?.move ?? event.detail?.value;
      this.__runtime.handleMovePadMove(move);
    },
    handleShuffle() {
      this.__runtime.handleShuffle();
    },
    handleTimedShuffle() {
      this.__runtime.handleTimedShuffle();
    },
    handleReset() {
      this.__runtime.handleReset();
    },
    handleAutoSolve() {
      this.__runtime.handleAutoSolve();
    },
    handleStepSolve() {
      this.__runtime.handleStepSolve();
    },
    handleTogglePlayback() {
      this.__runtime.handleTogglePlayback();
    },
    handlePrevLesson() {
      this.__runtime.handlePrevLesson();
    },
    handleNextLesson() {
      this.__runtime.handleNextLesson();
    },
    handleLessonDemo() {
      this.__runtime.handleLessonDemo();
    },
    handleTouchStart(event) {
      this.__runtime.handleTouchStart(event);
    },
    handleTouchMove(event) {
      this.__runtime.handleTouchMove(event);
    },
    handleTouchEnd(event) {
      this.__runtime.handleTouchEnd(event);
    }
  };
}
function parseSizeSelection(event = {}) {
  const rawSize = event.currentTarget?.dataset?.size ?? event.detail?.size ?? event.detail?.value;
  const size = Number(rawSize);
  if (!Number.isInteger(size)) {
    return null;
  }
  return SIZE_OPTIONS.some((option) => option.value === size) ? size : null;
}
