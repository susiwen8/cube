import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppRuntime } from '../../src/shared/runtime/app-runtime.js';
import { createWebPlatform } from '../../src/shared/adapters/web-runtime.js';

test('web runtime maps scaled touch coordinates back to the logical cube scene', () => {
  const timers = createFakeTimers();
  const host = createHost({ left: 20, top: 40, width: 480, height: 480 });
  const runtime = createAppRuntime(
    createWebPlatform({
      timers,
      now: () => 1000,
      storageBackend: {
        getItem() {
          return null;
        },
        setItem() {},
      },
    }),
  );

  runtime.load(host);
  runtime.ready(host);

  const sticker = runtime.scene.find((entry) => entry.face === 'F' && entry.row === 1 && entry.col === 1);
  const scale = host.touchSurface.getBoundingClientRect().width / 320;
  const start = {
    changedTouches: [
      {
        pageX: host.rect.left + sticker.centerPoint.x * scale,
        pageY: host.rect.top + sticker.centerPoint.y * scale,
      },
    ],
  };
  const end = {
    changedTouches: [
      {
        pageX: host.rect.left + sticker.centerPoint.x * scale,
        pageY: host.rect.top + (sticker.centerPoint.y + 60) * scale,
      },
    ],
  };

  runtime.handleTouchStart(start);
  runtime.handleTouchMove(end);
  runtime.handleTouchEnd(end);

  assert.equal(runtime.controller.getSession().moveCount, 1);
});

test('high-order web runtime keeps history fallback solve strategy', () => {
  const timers = createFakeTimers();
  const host = createHost({ left: 0, top: 0, width: 320, height: 320 });
  const runtime = createAppRuntime(
    createWebPlatform({
      timers,
      now: () => 0,
      storageBackend: {
        getItem() {
          return null;
        },
        setItem() {},
      },
    }),
  );

  runtime.load(host);
  runtime.ready(host);
  runtime.handleSizeChange(6);
  runtime.controller.scramble({ moves: ['R', '2U', "2L'"], timed: false, at: 0 });
  runtime.handleAutoSolve();
  timers.tick();

  assert.equal(runtime.getViewState().solveStrategyLabel, '历史回退');
});

test('non-cube web runtime treats near-sticker touches as valid drag starts instead of dead gaps', () => {
  const timers = createFakeTimers();
  const host = createHost({ left: 20, top: 40, width: 480, height: 480 });
  const runtime = createAppRuntime(
    createWebPlatform({
      timers,
      now: () => 1000,
      storageBackend: {
        getItem() {
          return null;
        },
        setItem() {},
      },
    }),
  );

  runtime.load(host);
  runtime.ready(host);
  runtime.handlePuzzleChange('pyraminx');
  timers.tick();

  const sticker = runtime.scene[0];
  const scale = host.touchSurface.getBoundingClientRect().width / 320;
  const start = {
    changedTouches: [
      {
        pageX: host.rect.left + (sticker.centerPoint.x + 8) * scale,
        pageY: host.rect.top + (sticker.centerPoint.y + 8) * scale,
      },
    ],
  };
  const end = {
    changedTouches: [
      {
        pageX: host.rect.left + (sticker.centerPoint.x + 52) * scale,
        pageY: host.rect.top + (sticker.centerPoint.y + 24) * scale,
      },
    ],
  };

  runtime.handleTouchStart(start);
  runtime.handleTouchMove(end);
  runtime.handleTouchEnd(end);

  assert.equal(runtime.controller.getSession().moveCount, 1);
});

test('non-cube web runtime allows drags that begin on a face shell outside the sticker cluster', () => {
  const timers = createFakeTimers();
  const host = createHost({ left: 20, top: 40, width: 480, height: 480 });
  const runtime = createAppRuntime(
    createWebPlatform({
      timers,
      now: () => 1000,
      storageBackend: {
        getItem() {
          return null;
        },
        setItem() {},
      },
    }),
  );

  runtime.load(host);
  runtime.ready(host);
  runtime.handlePuzzleChange('pyraminx');
  timers.tick();

  const shell = runtime.scene.find((entry) => entry.surfaceType === 'shell');
  assert.ok(shell, 'expected a visible shell surface for direct-touch puzzles');

  const shellEdgePoint = interpolatePoint(shell.centerPoint, shell.points[0], 0.82);
  const scale = host.touchSurface.getBoundingClientRect().width / 320;
  const start = {
    changedTouches: [
      {
        pageX: host.rect.left + shellEdgePoint.x * scale,
        pageY: host.rect.top + shellEdgePoint.y * scale,
      },
    ],
  };
  const end = {
    changedTouches: [
      {
        pageX: host.rect.left + (shellEdgePoint.x + 56) * scale,
        pageY: host.rect.top + (shellEdgePoint.y + 20) * scale,
      },
    ],
  };

  runtime.handleTouchStart(start);
  runtime.handleTouchMove(end);
  runtime.handleTouchEnd(end);

  assert.equal(runtime.controller.getSession().moveCount, 1);
});

test('web runtime keeps cube row targeting stable when page coordinates include scroll offset', () => {
  const timers = createFakeTimers();
  const host = createHost({ left: 20, top: 40, width: 480, height: 480 });
  const runtime = createAppRuntime(
    createWebPlatform({
      timers,
      now: () => 1000,
      storageBackend: {
        getItem() {
          return null;
        },
        setItem() {},
      },
    }),
  );

  runtime.load(host);
  runtime.ready(host);
  runtime.handleSizeChange(4);
  timers.tick();

  const sticker = runtime.scene.find((entry) => entry.face === 'F' && entry.row === 0 && entry.col === 1);
  const scale = host.touchSurface.getBoundingClientRect().width / 320;
  const scrollOffset = 72;
  const startClientX = host.rect.left + sticker.centerPoint.x * scale;
  const startClientY = host.rect.top + sticker.centerPoint.y * scale;
  const endClientX = startClientX + 52 * scale;
  const endClientY = startClientY + 4 * scale;
  const start = {
    changedTouches: [
      {
        clientX: startClientX,
        clientY: startClientY,
        pageX: startClientX,
        pageY: startClientY + scrollOffset,
      },
    ],
  };
  const end = {
    changedTouches: [
      {
        clientX: endClientX,
        clientY: endClientY,
        pageX: endClientX,
        pageY: endClientY + scrollOffset,
      },
    ],
  };

  runtime.handleTouchStart(start);
  runtime.handleTouchMove(end);
  runtime.handleTouchEnd(end);

  assert.deepEqual(runtime.controller.getSession().history, ['U']);
});

function createHost(rect) {
  return {
    rect,
    wrap: {
      getBoundingClientRect() {
        return rect;
      },
    },
    touchSurface: {
      getBoundingClientRect() {
        return rect;
      },
    },
    canvas: {
      getBoundingClientRect() {
        return rect;
      },
      getContext() {
        return createFakeCanvasContext();
      },
    },
  };
}

function createFakeTimers() {
  let callback = null;
  return {
    setInterval(nextCallback) {
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
  };
}

function interpolatePoint(start, end, amount) {
  return {
    x: start.x + (end.x - start.x) * amount,
    y: start.y + (end.y - start.y) * amount,
  };
}
