import test from 'node:test';
import assert from 'node:assert/strict';

import {
  compressMoves,
  getAllMoveNames,
  invertMove,
  parseMove,
  toMoveNotation,
} from '../../src/shared/core/moves.js';
import { generateScramble } from '../../src/shared/core/scramble.js';

test('depth-aware notation parses and inverts correctly', () => {
  const parsed = parseMove("2R'");

  assert.equal(parsed.face, 'R');
  assert.equal(parsed.depth, 2);
  assert.equal(invertMove("2R'"), '2R');
  assert.equal(toMoveNotation('R', -1, 2), "2R'");
});

test('move compression only combines moves with matching face and depth', () => {
  assert.deepEqual(compressMoves(['2R', '2R']), ['2R2']);
  assert.deepEqual(compressMoves(['2R', 'R']), ['2R', 'R']);
});

test('size-aware scramble generation can emit inner-layer moves for larger cubes', () => {
  let toggle = 0;
  const scramble = generateScramble({
    size: 6,
    length: 16,
    random() {
      toggle = (toggle + 0.37) % 1;
      return toggle;
    },
  });

  assert.equal(scramble.length, 16);
  assert.equal(scramble.some((move) => parseMove(move).depth > 1), true);
  assert.equal(getAllMoveNames(6).some((move) => move.startsWith('2')), true);
});
