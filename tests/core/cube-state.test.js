import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyMove,
  applyMoves,
  createSolvedState,
  isSolved,
  serializeState,
} from '../../src/shared/core/cube-state.js';
import { invertMove } from '../../src/shared/core/moves.js';

test('solved cube is recognized as solved', () => {
  const cube = createSolvedState();
  assert.equal(isSolved(cube), true);
});

test('quarter turn mutates the cube state', () => {
  const cube = createSolvedState();
  const next = applyMove(cube, 'R');

  assert.notEqual(serializeState(next), serializeState(cube));
  assert.equal(isSolved(next), false);
});

test('move followed by its inverse restores the solved state', () => {
  const cube = createSolvedState();
  const scrambled = applyMove(cube, 'F');
  const restored = applyMove(scrambled, invertMove('F'));

  assert.equal(isSolved(restored), true);
  assert.equal(serializeState(restored), serializeState(cube));
});

test('four quarter turns restore the solved state', () => {
  const cube = createSolvedState();
  const cycled = applyMoves(cube, ['U', 'U', 'U', 'U']);

  assert.equal(isSolved(cycled), true);
  assert.equal(serializeState(cycled), serializeState(cube));
});
