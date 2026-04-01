import test from 'node:test';
import assert from 'node:assert/strict';

import { applyMoves, createSolvedState, isSolved } from '../../src/shared/core/cube-state.js';
import { moveAxis, normalizeMoveHistory } from '../../src/shared/core/moves.js';
import { generateScramble } from '../../src/shared/core/scramble.js';
import { buildSolveSequence } from '../../src/shared/core/solver.js';

test('scramble generator returns expected length and avoids consecutive same-axis moves', () => {
  const randomValues = [0.01, 0.4, 0.99, 0.2, 0.6, 0.8, 0.15, 0.35, 0.75, 0.55];
  let cursor = 0;
  const scramble = generateScramble(8, () => {
    const value = randomValues[cursor % randomValues.length];
    cursor += 1;
    return value;
  });

  assert.equal(scramble.length, 8);

  for (let index = 1; index < scramble.length; index += 1) {
    const previousAxis = moveAxis(scramble[index - 1]);
    const currentAxis = moveAxis(scramble[index]);
    assert.notEqual(previousAxis, currentAxis);
  }
});

test('solver builds an inverse sequence that restores the cube', () => {
  const scramble = ['R', 'U', "R'", 'F2', 'L', "D'"];
  const solved = createSolvedState();
  const scrambled = applyMoves(solved, scramble);
  const solveSequence = buildSolveSequence(scramble);
  const restored = applyMoves(scrambled, solveSequence);

  assert.equal(isSolved(restored), true);
});

test('normalized history removes adjacent inverse pairs', () => {
  assert.deepEqual(normalizeMoveHistory(['R', "R'"]), []);
  assert.deepEqual(normalizeMoveHistory(['U', 'U']), ['U2']);
  assert.deepEqual(normalizeMoveHistory(['F', 'F', 'F']), ["F'"]);
});
