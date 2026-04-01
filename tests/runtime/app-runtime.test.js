import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppRuntime } from '../../src/shared/runtime/app-runtime.js';

test('runtime uses one scheduler for timer updates and solve playback', () => {
  let now = 0;
  const timers = createFakeTimers();
  const viewUpdates = [];
  const runtime = createAppRuntime({
    storageBackend: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    now: () => now,
    timers,
    updateView(patch) {
      viewUpdates.push(patch);
    },
    createCanvasContext() {
      return createFakeCanvasContext();
    },
    measureElementRect(_host, _selector, callback) {
      callback({ left: 0, top: 0 });
    },
    getTouchPoint(event) {
      const touch = (event.changedTouches && event.changedTouches[0]) || { x: 0, y: 0 };
      return { x: touch.x ?? 0, y: touch.y ?? 0 };
    },
  });

  runtime.load({});
  runtime.ready();
  runtime.controller.scramble({ moves: ['R', 'U', 'F'], timed: true, at: 0 });
  runtime.controller.applyMove('L', { at: 120 });
  runtime.handleAutoSolve();

  assert.equal(timers.setIntervalCalls, 1);

  for (let step = 0; step < 30; step += 1) {
    now += 120;
    timers.tick();
  }

  assert.equal(runtime.controller.getSession().solveQueue.length, 0);
  assert.equal(runtime.controller.getSession().timer.status, 'finished');
  assert.equal(viewUpdates.at(-1)?.statusLabel, '辅助完成');
});

test('runtime switches to a true puzzle and exposes puzzle-specific controls', () => {
  const timers = createFakeTimers();
  const runtime = createAppRuntime({
    storageBackend: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    now: () => 0,
    timers,
    createCanvasContext() {
      return createFakeCanvasContext();
    },
    measureElementRect(_host, _selector, callback) {
      callback({ left: 0, top: 0, width: 320, height: 320 });
    },
  });

  runtime.load({});
  runtime.ready();
  runtime.handleSizeChange(6);
  runtime.handlePuzzleChange('pyraminx');
  timers.tick();

  assert.equal(runtime.controller.getSession().puzzleId, 'pyraminx');
  assert.equal(runtime.controller.getSession().size, 3);
  assert.equal(runtime.getViewState().puzzleId, 'pyraminx');
  assert.equal(runtime.getViewState().puzzleLabel, 'Pyraminx');
  assert.equal(runtime.getViewState().showSizePicker, false);
  assert.deepEqual(
    runtime.getViewState().puzzleOptions.map((option) => option.id),
    ['cube', 'pyraminx', 'skewb', 'megaminx'],
  );
  assert.deepEqual(runtime.getViewState().movePad[0], ['U', "U'"]);
});

test('runtime lets non-cube puzzle drags apply moves from the sticker surface', () => {
  const timers = createFakeTimers();
  const runtime = createAppRuntime({
    storageBackend: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    now: () => 1000,
    timers,
    createCanvasContext() {
      return createFakeCanvasContext();
    },
    measureElementRect(_host, _selector, callback) {
      callback({ left: 0, top: 0, width: 320, height: 320 });
    },
    getTouchPoint(event) {
      const touch = (event.changedTouches && event.changedTouches[0]) || { x: 0, y: 0 };
      return { x: touch.x ?? 0, y: touch.y ?? 0 };
    },
  });

  runtime.load({});
  runtime.ready();

  for (const puzzleId of ['pyraminx', 'skewb', 'megaminx']) {
    runtime.handlePuzzleChange(puzzleId);
    timers.tick();

    const beforeMoveCount = runtime.controller.getSession().moveCount;
    const beforeYaw = runtime.getRuntimeState().viewport.yaw;
    const sticker = runtime.scene[0];
    const start = {
      changedTouches: [{ x: sticker.centerPoint.x, y: sticker.centerPoint.y }],
    };
    const end = {
      changedTouches: [{ x: sticker.centerPoint.x + 42, y: sticker.centerPoint.y + 18 }],
    };

    runtime.handleTouchStart(start);
    runtime.handleTouchMove(end);
    runtime.handleTouchEnd(end);

    assert.equal(runtime.controller.getSession().moveCount, beforeMoveCount + 1, `${puzzleId} should react to drag turns`);
    assert.equal(runtime.getRuntimeState().viewport.yaw, beforeYaw, `${puzzleId} drag turn should not only rotate the camera`);
  }
});

test('cube drag preview highlights the touched visible face instead of the derived move face', () => {
  const timers = createFakeTimers();
  const runtime = createAppRuntime({
    storageBackend: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    now: () => 1000,
    timers,
    createCanvasContext() {
      return createFakeCanvasContext();
    },
    measureElementRect(_host, _selector, callback) {
      callback({ left: 0, top: 0, width: 320, height: 320 });
    },
    getTouchPoint(event) {
      const touch = (event.changedTouches && event.changedTouches[0]) || { x: 0, y: 0 };
      return { x: touch.x ?? 0, y: touch.y ?? 0 };
    },
  });

  runtime.load({});
  runtime.ready();

  const sticker = runtime.scene.find((entry) => entry.face === 'F' && entry.row === 0 && entry.col === 1);
  const start = {
    changedTouches: [{ x: sticker.centerPoint.x, y: sticker.centerPoint.y }],
  };
  const move = {
    changedTouches: [{ x: sticker.centerPoint.x + 56, y: sticker.centerPoint.y + 4 }],
  };

  runtime.handleTouchStart(start);
  runtime.handleTouchMove(move);
  timers.tick();

  const highlightedFaces = [...new Set(runtime.scene.filter((entry) => entry.highlighted).map((entry) => entry.face))];

  assert.deepEqual(highlightedFaces, ['F']);
  assert.equal(runtime.getRuntimeState().pendingMove, 'U');
});

function createFakeTimers() {
  let callback = null;
  return {
    setIntervalCalls: 0,
    setInterval(nextCallback) {
      this.setIntervalCalls += 1;
      callback = nextCallback;
      return 1;
    },
    clearInterval() {},
    tick() {
      callback?.();
    },
  };
}

function createFakeCanvasContext() {
  return {
    canvas: { width: 320, height: 320 },
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() {},
    stroke() {},
    draw() {},
  };
}
