import { getTutorialLessons } from '../core/tutorial.js';
import { getSupportedCubeSizes } from './platform-session.js';
import { createAppRuntime, createInitialViewData } from '../runtime/app-runtime.js';
const SIZE_OPTIONS = Object.freeze(
  getSupportedCubeSizes().map((size) => ({
    value: size,
    label: `${size}阶`,
  })),
);

export function createMiniappPage(platform) {
  const lessons = platform.lessons ?? getTutorialLessons();

  return {
    data: createInitialViewData(lessons),

    onLoad() {
      this.__runtime = createAppRuntime({
        ...platform,
        lessons,
        updateView: (patch) => {
          this.setData(patch);
        },
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
    },
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
