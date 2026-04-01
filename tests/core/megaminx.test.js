import test from 'node:test';
import assert from 'node:assert/strict';

import { getPuzzleDefinition } from '../../src/shared/puzzles/catalog.js';

test('megaminx supports scrambling and inverse restoration', () => {
  const puzzle = getPuzzleDefinition('megaminx');
  const state = puzzle.applyMoves(puzzle.createSolvedState(), ['R++', 'D--']);
  const restored = puzzle.applyMoves(state, ['D++', 'R--']);

  assert.equal(puzzle.isSolved(restored), true);
});
