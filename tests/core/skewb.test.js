import test from 'node:test';
import assert from 'node:assert/strict';

import { getPuzzleDefinition } from '../../src/shared/puzzles/catalog.js';

test('skewb supports scrambling and inverse restoration', () => {
  const puzzle = getPuzzleDefinition('skewb');
  const state = puzzle.applyMoves(puzzle.createSolvedState(), ['R', 'L']);
  const restored = puzzle.applyMoves(state, ["L'", "R'"]);

  assert.equal(puzzle.isSolved(restored), true);
});
