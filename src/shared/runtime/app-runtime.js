import { createAppController } from '../adapters/app-controller.js';
import { getSupportedCubeSizes } from '../adapters/platform-session.js';
import { getTutorialLessons } from '../core/tutorial.js';
import { hitTestSticker } from '../render/hit-test.js';
import { drawStickerScene } from '../render/cube-renderer.js';
import { mapDragIntent } from '../render/gesture-mapper.js';
import { createCamera } from '../render/projection.js';
import { getPuzzleCatalog, getPuzzleDefinition } from '../puzzles/catalog.js';

const CANVAS_SIZE = 320;
const DEFAULT_VIEWPORT = { yaw: -0.65, pitch: -0.45 };
const PITCH_RANGE = { min: -1.05, max: 1.05 };
const LOOP_INTERVAL_MS = 16;
const ANIMATION_MS = 180;
const PLAYBACK_INTERVAL_MS = 240;
const LESSON_INTERVAL_MS = 260;
const TOUCH_SURFACE_SELECTOR = '#cubeTouchSurface';
const CANVAS_SELECTOR = '#cubeCanvas';
const CANVAS_WRAP_SELECTOR = '#canvasWrap';
const SIZE_OPTIONS = Object.freeze(
  getSupportedCubeSizes().map((size) => ({
    value: size,
    label: `${size}阶`,
  })),
);
const PUZZLE_OPTIONS = Object.freeze(
  getPuzzleCatalog().map((puzzle) => ({
    id: puzzle.id,
    label: puzzle.label,
  })),
);

export function createAppRuntime(platform = {}) {
  const lessons = platform.lessons ?? getTutorialLessons();
  const now = platform.now ?? (() => Date.now());
  const timers = platform.timers ?? {
    setInterval: globalThis.setInterval.bind(globalThis),
    clearInterval: globalThis.clearInterval.bind(globalThis),
  };

  const runtime = {
    platform,
    lessons,
    now,
    timers,
    listeners: new Set(),
    host: null,
    viewState: createInitialViewData(lessons, PUZZLE_OPTIONS),
    controller: createAppController({
      storageBackend: platform.storageBackend,
    }),
    puzzleOptions: PUZZLE_OPTIONS.map((option) => ({ ...option })),
    viewport: { ...DEFAULT_VIEWPORT },
    currentLessonIndex: 0,
    canvasRect: { left: 0, top: 0 },
    scene: [],
    gestureStart: null,
    lockedMove: null,
    pendingMove: null,
    ctx: null,
    animation: null,
    playback: null,
    loopTimer: null,
    renderRequested: false,
    viewRequested: false,
  };

  return {
    get controller() {
      return runtime.controller;
    },

    get scene() {
      return runtime.scene;
    },

    getRuntimeState() {
      return runtime;
    },

    getViewState() {
      return cloneViewState(runtime.viewState);
    },

    subscribe(listener) {
      runtime.listeners.add(listener);
      listener(this.getViewState());

      return () => {
        runtime.listeners.delete(listener);
      };
    },

    load(host = runtime.host) {
      runtime.host = host;
      runtime.loopTimer = runtime.timers.setInterval(() => tickRuntime(runtime), LOOP_INTERVAL_MS);
      refreshView(runtime, false);
    },

    ready(host = runtime.host) {
      runtime.host = host;
      runtime.ctx = runtime.platform.createCanvasContext?.(runtime.host) ?? null;
      if (runtime.ctx) {
        if (runtime.ctx.canvas) {
          runtime.ctx.canvas.width = CANVAS_SIZE;
          runtime.ctx.canvas.height = CANVAS_SIZE;
        } else {
          runtime.ctx.width = CANVAS_SIZE;
          runtime.ctx.height = CANVAS_SIZE;
        }
      }
      measureCanvasRect(runtime.platform, runtime.host, (rect) => {
        if (rect) {
          runtime.canvasRect = rect;
        }
      });
      runtime.renderRequested = true;
      renderScene(runtime);
    },

    unload() {
      if (runtime.loopTimer !== null) {
        runtime.timers.clearInterval(runtime.loopTimer);
        runtime.loopTimer = null;
      }
    },

    handleModeChange(mode) {
      if (!mode) {
        return;
      }

      stopPlayback(runtime);
      runtime.controller.setMode(mode);
      requestRefresh(runtime);
    },

    handleSizeChange(size) {
      if (!Number.isInteger(size) || !SIZE_OPTIONS.some((option) => option.value === size)) {
        return;
      }

      const puzzle = getCurrentPuzzle(runtime);
      if (!puzzle.supportsSize(size)) {
        return;
      }

      if (size === runtime.controller.getSession().size) {
        return;
      }

      stopPlayback(runtime);
      runtime.viewport = { ...DEFAULT_VIEWPORT };
      runtime.controller.setSize(size);
      requestRefresh(runtime);
    },

    handlePuzzleChange(puzzleId) {
      if (!runtime.puzzleOptions.some((option) => option.id === puzzleId)) {
        return;
      }

      if (runtime.controller.getSession().puzzleId === puzzleId) {
        return;
      }

      stopPlayback(runtime);
      runtime.viewport = { ...DEFAULT_VIEWPORT };
      runtime.currentLessonIndex = 0;
      runtime.controller.setPuzzle(puzzleId);
      requestRefresh(runtime);
    },

    handleMovePadMove(move) {
      const activeMoves = getCurrentPuzzle(runtime).getMovePad?.().flat() ?? [];

      if (!activeMoves.includes(move)) {
        return;
      }

      stopPlayback(runtime);
      runtime.controller.applyMove(move, { at: runtime.now() });
      requestRefresh(runtime);
    },

    handleShuffle() {
      stopPlayback(runtime);
      runtime.controller.scramble({ timed: false, at: runtime.now() });
      requestRefresh(runtime);
    },

    handleTimedShuffle() {
      stopPlayback(runtime);
      runtime.controller.setMode('timer');
      runtime.controller.scramble({ timed: true, at: runtime.now() });
      requestRefresh(runtime);
    },

    handleReset() {
      stopPlayback(runtime);
      runtime.viewport = { ...DEFAULT_VIEWPORT };
      runtime.controller.reset();
      requestRefresh(runtime);
    },

    handleAutoSolve() {
      stopPlayback(runtime);
      runtime.controller.queueAutoSolve();
      startPlayback(runtime, { kind: 'solve', intervalMs: PLAYBACK_INTERVAL_MS });
      requestRefresh(runtime);
    },

    handleStepSolve() {
      stopPlayback(runtime);
      if (!runtime.controller.getSession().solveQueue.length) {
        runtime.controller.queueAutoSolve();
      }
      stepPlayback(runtime, runtime.now());
      requestRefresh(runtime);
    },

    handleTogglePlayback() {
      if (runtime.playback) {
        stopPlayback(runtime);
      } else {
        if (!runtime.controller.getSession().solveQueue.length) {
          runtime.controller.queueAutoSolve();
        }
        startPlayback(runtime, { kind: 'solve', intervalMs: PLAYBACK_INTERVAL_MS });
      }
      requestRefresh(runtime);
    },

    handlePrevLesson() {
      if (!getCurrentPuzzle(runtime).showLessons) {
        return;
      }

      runtime.currentLessonIndex = (runtime.currentLessonIndex + lessons.length - 1) % lessons.length;
      runtime.controller.setMode('lesson');
      requestRefresh(runtime);
    },

    handleNextLesson() {
      if (!getCurrentPuzzle(runtime).showLessons) {
        return;
      }

      runtime.currentLessonIndex = (runtime.currentLessonIndex + 1) % lessons.length;
      runtime.controller.setMode('lesson');
      requestRefresh(runtime);
    },

    handleLessonDemo() {
      if (!getCurrentPuzzle(runtime).showLessons) {
        return;
      }

      const lesson = runtime.lessons[runtime.currentLessonIndex];
      stopPlayback(runtime);
      runtime.controller.reset();
      runtime.controller.setMode('lesson');
      startPlayback(runtime, {
        kind: 'lesson',
        intervalMs: LESSON_INTERVAL_MS,
        queue: [...lesson.demoMoves],
      });
      requestRefresh(runtime);
    },

    handleTouchStart(event) {
      const point = extractTouchPoint(runtime, event);
      const puzzle = getCurrentPuzzle(runtime);
      runtime.lockedMove = null;
      runtime.pendingMove = null;
      runtime.gestureStart = {
        ...point,
        yaw: runtime.viewport.yaw,
        pitch: runtime.viewport.pitch,
        hit: puzzle.usesDirectTouchMoves
          ? hitTestSticker(runtime.scene, point.x, point.y, { maxCenterDistance: puzzle.touchHitSlop ?? 0 })
          : null,
      };
    },

    handleTouchMove(event) {
      if (!runtime.gestureStart) {
        return;
      }

      const puzzle = getCurrentPuzzle(runtime);
      const point = extractTouchPoint(runtime, event);
      const dx = point.x - runtime.gestureStart.x;
      const dy = point.y - runtime.gestureStart.y;

      if (!runtime.gestureStart.hit) {
        runtime.viewport.yaw = runtime.gestureStart.yaw + dx * 0.01;
        runtime.viewport.pitch = clamp(runtime.gestureStart.pitch + dy * 0.01, PITCH_RANGE.min, PITCH_RANGE.max);
        runtime.renderRequested = true;
        return;
      }

      const intent = resolveDragIntentForPuzzle(puzzle, runtime.gestureStart.hit, { dx, dy });
      const nextLockedMove = intent.type === 'move' ? intent.move : null;
      const nextPendingMove = intent.type === 'move' ? intent.move : null;

      if (runtime.lockedMove === nextLockedMove && runtime.pendingMove === nextPendingMove) {
        return;
      }

      runtime.lockedMove = nextLockedMove;
      runtime.pendingMove = nextPendingMove;
      runtime.renderRequested = true;
    },

    handleTouchEnd(event) {
      if (!runtime.gestureStart) {
        return;
      }

      const point = extractTouchPoint(runtime, event);
      const dx = point.x - runtime.gestureStart.x;
      const dy = point.y - runtime.gestureStart.y;
      const puzzle = getCurrentPuzzle(runtime);
      const intent =
        runtime.gestureStart.hit
          ? (
              runtime.lockedMove
                ? { type: 'move', move: runtime.lockedMove }
                : resolveDragIntentForPuzzle(puzzle, runtime.gestureStart.hit, { dx, dy })
            )
          : { type: 'rotate' };

      if (intent.type === 'move') {
        const previousCube = runtime.controller.getSession().cube;
        runtime.controller.applyMove(intent.move, { at: runtime.now() });
        animateMoveIfNeeded(runtime, previousCube, intent.move, runtime.now());
      }

      runtime.gestureStart = null;
      runtime.lockedMove = null;
      runtime.pendingMove = null;
      requestRefresh(runtime);
    },
  };
}

export function createInitialViewData(lessons = getTutorialLessons(), puzzleOptions = PUZZLE_OPTIONS) {
  return {
    cubeSize: 3,
    sizeLabel: '3阶魔方',
    recordsTitle: '3阶成绩',
    sizeOptions: SIZE_OPTIONS.map((option) => ({ ...option })),
    puzzleId: puzzleOptions[0]?.id ?? 'cube',
    puzzleLabel: puzzleOptions[0]?.label ?? '魔方',
    puzzleOptions: puzzleOptions.map((option) => ({ ...option })),
    showSizePicker: true,
    showLessons: true,
    movePad: [],
    tabs: [
      { id: 'free', label: '自由玩' },
      { id: 'lesson', label: '教学' },
      { id: 'timer', label: '计时' },
    ],
    mode: 'free',
    timerLabel: '00:00.000',
    moveCount: 0,
    statusLabel: '自由操作',
    solveQueueLabel: '',
    solveStrategyLabel: '未准备',
    lessonCount: lessons.length,
    currentLessonNumber: 1,
    lessonTitle: lessons[0].title,
    lessonSummary: lessons[0].summary,
    lessonNotation: lessons[0].notation.join(' '),
    lessonFocus: lessons[0].focusFaces.join(' / '),
    records: [],
    playbackLabel: '播放回放',
  };
}

function tickRuntime(runtime) {
  const now = runtime.now();
  let shouldRefresh = runtime.controller.getSession().timer.status === 'running';

  if (runtime.playback && !runtime.animation && now >= runtime.playback.nextAt) {
    const stepped = stepPlayback(runtime, now);
    shouldRefresh = shouldRefresh || stepped;
  }

  if (runtime.animation) {
    const progress = Math.min(1, (now - runtime.animation.startedAt) / ANIMATION_MS);
    renderScene(runtime, {
      baseState: runtime.animation.baseState,
      animation: {
        move: runtime.animation.move,
        progress,
      },
    });
    shouldRefresh = true;

    if (progress >= 1) {
      runtime.animation = null;
      runtime.renderRequested = true;
    }
  } else if (runtime.renderRequested) {
    renderScene(runtime);
    runtime.renderRequested = false;
  }

  if (runtime.viewRequested || shouldRefresh) {
    refreshView(runtime, false, now);
    runtime.viewRequested = false;
  }
}

function stepPlayback(runtime, now) {
  if (!runtime.playback) {
    return false;
  }

  if (runtime.playback.kind === 'solve') {
    const nextMove = runtime.controller.getSession().solveQueue[0];
    if (!nextMove) {
      stopPlayback(runtime);
      return false;
    }

    const previousCube = runtime.controller.getSession().cube;
    runtime.controller.stepAutoSolve({ at: now });
    animateMoveIfNeeded(runtime, previousCube, nextMove, now);
    runtime.playback.nextAt = now + runtime.playback.intervalMs;
    return true;
  }

  const nextMove = runtime.playback.queue.shift();
  if (!nextMove) {
    stopPlayback(runtime);
    return false;
  }

  const previousCube = runtime.controller.getSession().cube;
  runtime.controller.applyMove(nextMove, { at: now });
  animateMoveIfNeeded(runtime, previousCube, nextMove, now);
  runtime.playback.nextAt = now + runtime.playback.intervalMs;
  return true;
}

function startPlayback(runtime, config) {
  runtime.playback = {
    kind: config.kind,
    intervalMs: config.intervalMs,
    nextAt: runtime.now(),
    queue: config.queue ?? null,
  };
}

function stopPlayback(runtime) {
  runtime.playback = null;
  runtime.animation = null;
}

function startAnimation(runtime, baseState, move, now) {
  runtime.animation = {
    baseState,
    move,
    startedAt: now,
  };
  runtime.renderRequested = true;
}

function requestRefresh(runtime) {
  runtime.renderRequested = true;
  runtime.viewRequested = true;
}

function measureCanvasRect(platform, host, callback) {
  platform.measureElementRect?.(host, TOUCH_SURFACE_SELECTOR, (touchSurfaceRect) => {
    if (touchSurfaceRect) {
      callback(touchSurfaceRect);
      return;
    }

    platform.measureElementRect?.(host, CANVAS_SELECTOR, (canvasRect) => {
      if (canvasRect) {
        callback(canvasRect);
        return;
      }

      platform.measureElementRect?.(host, CANVAS_WRAP_SELECTOR, (fallbackRect) => {
        callback(fallbackRect ?? null);
      });
    });
  });
}

function refreshView(runtime, shouldRender = true, now = runtime.now()) {
  const lesson = runtime.lessons[runtime.currentLessonIndex];
  const viewModel = runtime.controller.getViewModel({ elapsedMs: getElapsedMs(runtime, now) });
  const patch = {
    puzzleId: viewModel.puzzleId,
    puzzleLabel: viewModel.puzzleLabel,
    cubeSize: viewModel.size,
    sizeLabel: viewModel.sizeLabel,
    recordsTitle: viewModel.recordsTitle,
    puzzleOptions: runtime.puzzleOptions.map((option) => ({ ...option })),
    showSizePicker: viewModel.showSizePicker,
    showLessons: viewModel.showLessons,
    movePad: viewModel.movePad.map((row) => [...row]),
    mode: viewModel.mode,
    timerLabel: viewModel.timerLabel,
    moveCount: viewModel.moveCount,
    statusLabel: viewModel.statusLabel,
    solveQueueLabel: viewModel.solveQueueLabel,
    solveStrategyLabel: viewModel.solveStrategyLabel,
    lessonCount: viewModel.lessonCount,
    currentLessonNumber: runtime.currentLessonIndex + 1,
    lessonTitle: lesson.title,
    lessonSummary: lesson.summary,
    lessonNotation: lesson.notation.join(' '),
    lessonFocus: lesson.focusFaces.join(' / '),
    records: runtime.controller.getSession().records.map(formatRecord),
    playbackLabel: runtime.playback ? '暂停回放' : '播放回放',
  };

  runtime.viewState = {
    ...runtime.viewState,
    ...patch,
  };
  runtime.platform.updateView?.(patch, cloneViewState(runtime.viewState));
  for (const listener of runtime.listeners) {
    listener(cloneViewState(runtime.viewState));
  }

  if (shouldRender) {
    renderScene(runtime);
  }
}

function getElapsedMs(runtime, now) {
  const session = runtime.controller.getSession();
  if (session.timer.status === 'running' && session.timer.startedAt !== null) {
    return now - session.timer.startedAt;
  }
  return session.timer.elapsedMs;
}

function renderScene(runtime, options = {}) {
  if (!runtime.ctx) {
    return;
  }

  const lesson = runtime.lessons[runtime.currentLessonIndex];
  const puzzle = getCurrentPuzzle(runtime);
  const camera = createCamera({
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    yaw: runtime.viewport.yaw,
    pitch: runtime.viewport.pitch,
    distance: puzzle.cameraDistance ?? 8,
    offsetX: puzzle.cameraOffsetX ?? 0,
    offsetY: puzzle.cameraOffsetY ?? 0,
  });
  const state = options.baseState ?? runtime.controller.getSession().cube;
  const highlightFaces = runtime.controller.getSession().mode === 'lesson' && puzzle.showLessons
    ? [...lesson.focusFaces]
    : [];

  if (runtime.pendingMove && puzzle.id === 'cube') {
    const previewFace = runtime.gestureStart?.hit?.face;
    if (previewFace) {
      highlightFaces.push(previewFace);
    }
  }

  const scene = puzzle.buildScene(state, camera, {
    animation: puzzle.usesDirectTouchMoves ? options.animation ?? null : null,
    highlightFaces,
  });

  runtime.scene = scene;
  drawStickerScene(runtime.ctx, scene);
  if (typeof runtime.ctx.draw === 'function') {
    runtime.ctx.draw();
  }
}

function extractTouchPoint(runtime, event) {
  const point = runtime.platform.getTouchPoint?.(event) ?? { x: 0, y: 0 };
  const width = runtime.canvasRect.width || CANVAS_SIZE;
  const height = runtime.canvasRect.height || CANVAS_SIZE;
  const localX = point.x - runtime.canvasRect.left;
  const localY = point.y - runtime.canvasRect.top;

  return {
    x: localX * (CANVAS_SIZE / width),
    y: localY * (CANVAS_SIZE / height),
  };
}

function cloneViewState(viewState) {
  return {
    ...viewState,
    sizeOptions: viewState.sizeOptions.map((option) => ({ ...option })),
    puzzleOptions: viewState.puzzleOptions.map((option) => ({ ...option })),
    movePad: viewState.movePad.map((row) => [...row]),
    tabs: viewState.tabs.map((tab) => ({ ...tab })),
    records: viewState.records.map((record) => ({ ...record })),
  };
}

function getCurrentPuzzle(runtime) {
  return getPuzzleDefinition(runtime.controller.getSession().puzzleId);
}

function animateMoveIfNeeded(runtime, baseState, move, now) {
  if (!getCurrentPuzzle(runtime).usesDirectTouchMoves) {
    return;
  }

  startAnimation(runtime, baseState, move, now);
}

function resolveDragIntentForPuzzle(puzzle, hit, drag) {
  if (!hit) {
    return { type: 'camera' };
  }

  if (typeof puzzle.resolveDragIntent === 'function') {
    return puzzle.resolveDragIntent(hit, drag);
  }

  return mapDragIntent(hit, drag);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatRecord(record, index) {
  return {
    label: `${index + 1}. ${formatDuration(record.elapsedMs)} / ${record.moveCount} 步`,
  };
}

function formatDuration(elapsedMs) {
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  const milliseconds = elapsedMs % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}
