import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppController } from '../../src/shared/adapters/app-controller.js';
import { createSessionState, scrambleSession } from '../../src/shared/core/session.js';

test('session can be created and scrambled at 5x5', () => {
  const session = scrambleSession(createSessionState({ size: 5 }), undefined, { timed: false, at: 0 });

  assert.equal(session.size, 5);
  assert.equal(session.cube.size, 5);
  assert.equal(session.scramble.length > 0, true);
});

test('controller size switch resets to the target order and filters records by size', () => {
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

  controller.setSize(4);
  controller.scramble({ moves: ['R', '2U'], timed: true, at: 0 });
  controller.applyMove("2U'", { at: 100 });
  controller.applyMove("R'", { at: 250 });

  controller.setSize(6);

  assert.equal(controller.getSession().size, 6);
  assert.equal(controller.getSession().cube.size, 6);
  assert.deepEqual(controller.getSession().records, []);
});
