import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyMove,
  createSolvedState,
  getFaceColors,
  getSlotMetadata,
  isSolved,
  serializeState,
} from '../../src/shared/core/cube-state.js';
import { invertMove } from '../../src/shared/core/moves.js';

test('4x4 solved state exposes the expected sticker count and per-face colors', () => {
  const cube = createSolvedState(4);

  assert.equal(cube.size, 4);
  assert.equal(cube.colors.length, 4 * 4 * 6);
  assert.equal(getFaceColors(cube, 'F').length, 16);
  assert.equal(getSlotMetadata(4).length, 96);
});

test('10x10 solved state serializes with size and remains solved after clone-safe operations', () => {
  const cube = createSolvedState(10);

  assert.equal(serializeState(cube).startsWith('10|'), true);
  assert.equal(isSolved(cube), true);
});

test('inner-layer turns on 4x4 can be applied and inverted', () => {
  const cube = createSolvedState(4);
  const turned = applyMove(cube, '2R');
  const restored = applyMove(turned, invertMove('2R'));

  assert.equal(isSolved(turned), false);
  assert.equal(isSolved(restored), true);
});
