import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppController } from '../../src/shared/adapters/app-controller.js';
import { isSolved } from '../../src/shared/core/cube-state.js';

test('scramble, first move, auto solve playback, and page model work together', () => {
  const backingStore = new Map();
  const controller = createAppController({
    storageBackend: {
      getItem(key) {
        return backingStore.get(key);
      },
      setItem(key, value) {
        backingStore.set(key, value);
      },
    },
  });

  controller.scramble({ moves: ['R', 'U', 'F'], timed: true, at: 1000 });
  controller.applyMove('L', { at: 1300 });
  controller.queueAutoSolve({ at: 1350 });

  while (controller.getSession().solveQueue.length > 0) {
    controller.stepAutoSolve({ at: 1400 });
  }

  const viewModel = controller.getViewModel({ elapsedMs: 400 });

  assert.equal(controller.getSession().timer.status, 'finished');
  assert.equal(controller.getSession().assisted, true);
  assert.equal(viewModel.lessonCount, 7);
  assert.equal(viewModel.statusLabel, '辅助完成');
});

test('high-order flows switch size, expose size labels, and solve through history fallback', () => {
  const backingStore = new Map();
  const controller = createAppController({
    storageBackend: {
      getItem(key) {
        return backingStore.get(key);
      },
      setItem(key, value) {
        backingStore.set(key, value);
      },
    },
  });

  controller.setSize(6);
  controller.scramble({ moves: ['R', '2U', "2L'"], timed: false, at: 0 });
  controller.queueAutoSolve();

  const queuedViewModel = controller.getViewModel({ elapsedMs: 0 });

  assert.equal(controller.getSession().size, 6);
  assert.equal(queuedViewModel.sizeLabel, '6阶魔方');
  assert.equal(queuedViewModel.recordsTitle, '6阶成绩');
  assert.equal(queuedViewModel.solveStrategyLabel, '历史回退');

  while (controller.getSession().solveQueue.length > 0) {
    controller.stepAutoSolve({ at: 20 });
  }

  assert.equal(isSolved(controller.getSession().cube), true);
});
