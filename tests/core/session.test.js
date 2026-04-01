import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applySessionMove,
  createSessionState,
  queueAutoSolve,
  scrambleSession,
  stepAutoSolve,
} from '../../src/shared/core/session.js';

test('timed scramble starts immediately and keeps the same start time after the first move', () => {
  const session = createSessionState();
  const armed = scrambleSession(session, ['R', 'U', 'F'], { timed: true, at: 1000 });
  const moved = applySessionMove(armed, 'L', { at: 1450 });

  assert.equal(armed.timer.status, 'running');
  assert.equal(armed.timer.startedAt, 1000);
  assert.equal(moved.timer.status, 'running');
  assert.equal(moved.timer.startedAt, 1000);
  assert.equal(moved.moveCount, 1);
});

test('solving the cube stops a running timer', () => {
  const session = createSessionState();
  const armed = scrambleSession(session, ['R'], { timed: true, at: 1000 });
  const moved = applySessionMove(armed, "R'", { at: 1600 });

  assert.equal(moved.timer.status, 'finished');
  assert.equal(moved.timer.elapsedMs, 600);
  assert.equal(moved.timer.finishedAt, 1600);
});

test('auto solve queue marks the session as assisted and stepping it solves the cube', () => {
  const session = createSessionState();
  const scrambled = scrambleSession(session, ['R', 'U', 'F'], { timed: true, at: 1000 });
  const queued = queueAutoSolve(scrambled, { at: 1100 });
  const first = stepAutoSolve(queued, { at: 1200 });
  const second = stepAutoSolve(first, { at: 1300 });
  const third = stepAutoSolve(second, { at: 1400 });

  assert.equal(queued.assisted, true);
  assert.equal(queued.solveStrategy, 'history-fallback');
  assert.deepEqual(queued.solveQueue, ["F'", "U'", "R'"]);
  assert.equal(third.solveQueue.length, 0);
  assert.equal(third.timer.status, 'finished');
});
