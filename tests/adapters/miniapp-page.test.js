import test from 'node:test';
import assert from 'node:assert/strict';

import { createMiniappPage } from '../../src/shared/adapters/miniapp-page.js';

test('shared miniapp page uses one scheduler for timer updates and solve playback', () => {
  let now = 0;
  const timers = createFakeTimers();
  const page = instantiatePage(
    createMiniappPage({
      storageBackend: {
        getItem() {
          return null;
        },
        setItem() {},
      },
      now: () => now,
      timers,
      createCanvasContext() {
        return createFakeCanvasContext();
      },
      measureElementRect(_page, _selector, callback) {
        callback({ left: 0, top: 0 });
      },
      getTouchPoint(event) {
        const touch = (event.changedTouches && event.changedTouches[0]) || { x: 0, y: 0 };
        return { x: touch.x ?? 0, y: touch.y ?? 0 };
      },
    }),
  );

  page.onLoad();
  page.onReady();

  page.__runtime.controller.scramble({ moves: ['R', 'U', 'F'], timed: true, at: 0 });
  page.__runtime.controller.applyMove('L', { at: 120 });
  page.handleAutoSolve();

  assert.equal(timers.setIntervalCalls, 1);

  for (let step = 0; step < 30; step += 1) {
    now += 120;
    timers.tick();
  }

  assert.equal(page.__runtime.controller.getSession().solveQueue.length, 0);
  assert.equal(page.data.statusLabel, '辅助完成');
});

test('timed shuffle starts the timer immediately in the page runtime', () => {
  let now = 1000;
  const timers = createFakeTimers();
  const page = instantiatePage(
    createMiniappPage({
      storageBackend: {
        getItem() {
          return null;
        },
        setItem() {},
      },
      now: () => now,
      timers,
      createCanvasContext() {
        return createFakeCanvasContext();
      },
      measureElementRect(_page, _selector, callback) {
        callback({ left: 0, top: 0 });
      },
      getTouchPoint(event) {
        const touch = (event.changedTouches && event.changedTouches[0]) || { x: 0, y: 0 };
        return { x: touch.x ?? 0, y: touch.y ?? 0 };
      },
    }),
  );

  page.onLoad();
  page.onReady();
  page.handleTimedShuffle();

  now = 1450;
  timers.tick();

  assert.equal(page.__runtime.controller.getSession().timer.status, 'running');
  assert.equal(page.__runtime.controller.getSession().timer.startedAt, 1000);
  assert.equal(page.data.statusLabel, '计时进行中');
  assert.equal(page.data.timerLabel, '00:00.450');
});

test('sticker drags still apply moves when the canvas is inset within the wrapper panel', () => {
  const timers = createFakeTimers();
  const page = instantiatePage(
    createMiniappPage({
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
      measureElementRect(_page, selector, callback) {
        if (selector === '#canvasWrap') {
          callback({ left: 12, top: 18 });
          return;
        }

        if (selector === '#cubeCanvas') {
          callback({ left: 42, top: 54 });
          return;
        }

        callback(null);
      },
      getTouchPoint(event) {
        const touch = (event.changedTouches && event.changedTouches[0]) || { x: 0, y: 0 };
        return { x: touch.x ?? 0, y: touch.y ?? 0 };
      },
    }),
  );

  page.onLoad();
  page.onReady();

  const sticker = page.__runtime.scene.find((entry) => entry.face === 'F' && entry.row === 1 && entry.col === 1);
  const start = {
    changedTouches: [{ x: sticker.centerPoint.x + 42, y: sticker.centerPoint.y + 54 }],
  };
  const end = {
    changedTouches: [{ x: sticker.centerPoint.x + 42, y: sticker.centerPoint.y + 114 }],
  };

  page.handleTouchStart(start);
  page.handleTouchMove(end);
  page.handleTouchEnd(end);

  assert.equal(page.__runtime.controller.getSession().moveCount, 1);
  assert.equal(page.__runtime.controller.getSession().history.length > 0, true);
});

test('sticker drags still hit when only the dedicated touch surface exposes a stable rect', () => {
  const timers = createFakeTimers();
  const page = instantiatePage(
    createMiniappPage({
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
      measureElementRect(_page, selector, callback) {
        if (selector === '#cubeTouchSurface') {
          callback({ left: 42, top: 54, width: 320, height: 320 });
          return;
        }

        if (selector === '#cubeCanvas') {
          callback(null);
          return;
        }

        if (selector === '#canvasWrap') {
          callback({ left: 12, top: 18, width: 380, height: 420 });
          return;
        }

        callback(null);
      },
      getTouchPoint(event) {
        const touch = (event.changedTouches && event.changedTouches[0]) || { x: 0, y: 0 };
        return { x: touch.x ?? 0, y: touch.y ?? 0 };
      },
    }),
  );

  page.onLoad();
  page.onReady();

  const sticker = page.__runtime.scene.find((entry) => entry.face === 'F' && entry.row === 1 && entry.col === 1);
  const start = {
    changedTouches: [{ x: sticker.centerPoint.x + 42, y: sticker.centerPoint.y + 54 }],
  };
  const end = {
    changedTouches: [{ x: sticker.centerPoint.x + 42, y: sticker.centerPoint.y + 114 }],
  };

  page.handleTouchStart(start);
  page.handleTouchMove(end);
  page.handleTouchEnd(end);

  assert.equal(page.__runtime.controller.getSession().moveCount, 1);
});

test('repeated touchmove updates that keep the same locked move do not redraw the same scene again', () => {
  const timers = createFakeTimers();
  const ctx = createFakeCanvasContext();
  const page = instantiatePage(
    createMiniappPage({
      storageBackend: {
        getItem() {
          return null;
        },
        setItem() {},
      },
      now: () => 1000,
      timers,
      createCanvasContext() {
        return ctx;
      },
      measureElementRect(_page, _selector, callback) {
        callback({ left: 0, top: 0 });
      },
      getTouchPoint(event) {
        const touch = (event.changedTouches && event.changedTouches[0]) || { x: 0, y: 0 };
        return { x: touch.x ?? 0, y: touch.y ?? 0 };
      },
    }),
  );

  page.onLoad();
  page.onReady();

  const initialDrawCalls = ctx.drawCalls;
  const sticker = page.__runtime.scene.find((entry) => entry.face === 'F' && entry.row === 0 && entry.col === 1);
  const start = {
    changedTouches: [{ x: sticker.centerPoint.x, y: sticker.centerPoint.y }],
  };

  page.handleTouchStart(start);
  page.handleTouchMove({
    changedTouches: [{ x: sticker.centerPoint.x, y: sticker.centerPoint.y + 60 }],
  });
  timers.tick();
  const firstLockedDrawCalls = ctx.drawCalls;

  page.handleTouchMove({
    changedTouches: [{ x: sticker.centerPoint.x, y: sticker.centerPoint.y + 100 }],
  });
  timers.tick();

  assert.equal(firstLockedDrawCalls, initialDrawCalls + 1);
  assert.equal(ctx.drawCalls, firstLockedDrawCalls);
});

function instantiatePage(definition) {
  const page = {
    data: JSON.parse(JSON.stringify(definition.data)),
    setData(patch) {
      Object.assign(this.data, patch);
    },
  };

  for (const [key, value] of Object.entries(definition)) {
    if (key !== 'data') {
      page[key] = value;
    }
  }

  return page;
}

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
    drawCalls: 0,
    strokeCalls: 0,
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() {},
    stroke() {
      this.strokeCalls += 1;
    },
    draw() {
      this.drawCalls += 1;
    },
  };
}
