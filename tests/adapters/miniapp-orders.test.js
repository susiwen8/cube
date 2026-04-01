import test from 'node:test';
import assert from 'node:assert/strict';

import { createMiniappPage } from '../../src/shared/adapters/miniapp-page.js';

test('shared miniapp page exposes 3-10 order options and filters records after switching size', () => {
  const timers = createFakeTimers();
  const page = instantiatePage(
    createMiniappPage({
      storageBackend: {
        getItem(key) {
          if (key !== 'cube-records') {
            return null;
          }

          return JSON.stringify([
            { size: 3, elapsedMs: 1200, moveCount: 21, scramble: ['R'], assisted: false },
            { size: 6, elapsedMs: 5400, moveCount: 88, scramble: ['2R'], assisted: false },
          ]);
        },
        setItem() {},
      },
      now: () => 0,
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

  assert.deepEqual(page.data.sizeOptions.map((option) => option.value), [3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(page.data.cubeSize, 3);
  assert.equal(page.data.records.length, 1);

  page.handleSizeChange({ currentTarget: { dataset: { size: 6 } } });
  timers.tick();

  assert.equal(page.__runtime.controller.getSession().size, 6);
  assert.equal(page.data.cubeSize, 6);
  assert.equal(page.data.sizeLabel, '6阶魔方');
  assert.equal(page.data.recordsTitle, '6阶成绩');
  assert.equal(page.data.records.length, 1);
});

test('high-order size selection surfaces fallback solving strategy in the page view model', () => {
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
  page.handleSizeChange({ currentTarget: { dataset: { size: 5 } } });
  timers.tick();

  page.__runtime.controller.scramble({ moves: ['R', '2U', "2L'"], timed: false, at: 0 });
  page.handleAutoSolve();
  now += 16;
  timers.tick();

  assert.equal(page.__runtime.controller.getSession().size, 5);
  assert.equal(page.data.cubeSize, 5);
  assert.equal(page.data.solveStrategyLabel, '历史回退');
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
