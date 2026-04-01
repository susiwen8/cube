import test from 'node:test';
import assert from 'node:assert/strict';

import { createSessionState, queueAutoSolve, scrambleSession } from '../../src/shared/core/session.js';
import {
  createStorageAdapter,
  normalizeTouches,
  toPageViewModel,
} from '../../src/shared/adapters/platform-session.js';

test('storage adapter wraps get/set operations', () => {
  const backingStore = new Map();
  const storage = createStorageAdapter({
    getItem(key) {
      return backingStore.get(key);
    },
    setItem(key, value) {
      backingStore.set(key, value);
    },
  });

  storage.setJSON('records', [{ elapsedMs: 1234 }]);

  assert.deepEqual(storage.getJSON('records', []), [{ elapsedMs: 1234 }]);
  assert.deepEqual(storage.getJSON('missing', ['fallback']), ['fallback']);
});

test('touch normalization produces a consistent shape', () => {
  const normalized = normalizeTouches({
    touches: [{ identifier: 7, x: 12, y: 34 }],
    changedTouches: [{ identifier: 8, pageX: 90, pageY: 120 }],
  });

  assert.deepEqual(normalized, {
    touches: [{ id: 7, x: 12, y: 34 }],
    changedTouches: [{ id: 8, x: 90, y: 120 }],
  });
});

test('page view model exposes timer, solve queue, and tutorial-friendly fields', () => {
  const session = queueAutoSolve(scrambleSession(createSessionState(), ['R', 'U'], { timed: true, at: 1000 }));
  const model = toPageViewModel(session, { elapsedMs: 1500 });

  assert.equal(model.timerLabel, '00:01.500');
  assert.equal(model.solveQueueLabel, "U' R'");
  assert.equal(model.solveStrategyLabel, '历史回退');
  assert.equal(model.statusLabel, '辅助求解中');
  assert.equal(model.lessonCount, 7);
});
