import test from 'node:test';
import assert from 'node:assert/strict';

import { mapDragIntent } from '../../src/shared/render/gesture-mapper.js';

test('dragging an empty area is interpreted as camera rotation', () => {
  assert.deepEqual(mapDragIntent(null, { dx: 30, dy: 10 }), { type: 'camera' });
});

test('dragging the top edge of the front face to the right maps to a top-layer move', () => {
  const intent = mapDragIntent(
    {
      face: 'F',
      row: 0,
      col: 1,
      center: [0, -1, 2],
      cubie: [0, 1, 1],
    },
    { dx: 48, dy: 6 },
  );

  assert.equal(intent.type, 'move');
  assert.equal(intent.move, 'U');
});

test('dragging the front face center downward maps to a front face turn', () => {
  const intent = mapDragIntent(
    {
      face: 'F',
      row: 1,
      col: 1,
      center: [0, 0, 2],
      cubie: [0, 0, 1],
    },
    { dx: 4, dy: 60 },
  );

  assert.equal(intent.type, 'move');
  assert.equal(intent.move, 'F');
});
