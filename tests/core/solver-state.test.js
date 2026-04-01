import test from 'node:test';
import assert from 'node:assert/strict';

import { applyMoves, createSolvedState, isSolved } from '../../src/shared/core/cube-state.js';
import { buildSolvePlan } from '../../src/shared/core/solver.js';

test('solver can derive a solution from cube state without recorded history', () => {
  const scramble = ['R', 'U', 'F'];
  const cube = applyMoves(createSolvedState(), scramble);
  const plan = buildSolvePlan({ cube, maxDepth: 6 });
  const restored = applyMoves(cube, plan.moves);

  assert.equal(plan.strategy, 'state-search');
  assert.equal(isSolved(restored), true);
});

test('solver falls back to normalized history when search depth is insufficient', () => {
  const scramble = ['R', 'U', 'F'];
  const cube = applyMoves(createSolvedState(), scramble);
  const plan = buildSolvePlan({ cube, history: scramble, maxDepth: 1 });

  assert.equal(plan.strategy, 'history-fallback');
  assert.deepEqual(plan.moves, ["F'", "U'", "R'"]);
});

test('solver reports solved state without extra moves', () => {
  const plan = buildSolvePlan({ cube: createSolvedState(), maxDepth: 0 });

  assert.equal(plan.strategy, 'solved');
  assert.deepEqual(plan.moves, []);
});
