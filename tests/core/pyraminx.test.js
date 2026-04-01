import test from 'node:test';
import assert from 'node:assert/strict';

import { getPuzzleDefinition } from '../../src/shared/puzzles/catalog.js';

test('pyraminx move followed by inverse restores solved state', () => {
  const puzzle = getPuzzleDefinition('pyraminx');
  const scrambled = puzzle.applyMove(puzzle.createSolvedState(), 'R');
  const restored = puzzle.applyMove(scrambled, "R'");

  assert.equal(puzzle.isSolved(restored), true);
});
