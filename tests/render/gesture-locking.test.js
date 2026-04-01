import test from 'node:test';
import assert from 'node:assert/strict';

import { createSolvedState } from '../../src/shared/core/cube-state.js';
import { buildStickerScene } from '../../src/shared/render/cube-renderer.js';
import { mapDragIntent } from '../../src/shared/render/gesture-mapper.js';
import { createCamera } from '../../src/shared/render/projection.js';

test('visible stickers expose projected basis vectors for gesture mapping', () => {
  const camera = createCamera({ width: 320, height: 320, yaw: -0.7, pitch: -0.45, distance: 8 });
  const scene = buildStickerScene(createSolvedState(), camera);
  const front = scene.find((sticker) => sticker.face === 'F' && sticker.index === 4);

  assert.equal(typeof front.projectedBasis.col.x, 'number');
  assert.equal(typeof front.projectedBasis.row.y, 'number');
});

test('ambiguous diagonal drags stay pending instead of locking to a move immediately', () => {
  const intent = mapDragIntent(
    {
      face: 'F',
      row: 1,
      col: 1,
      center: [0, 0, 2],
      cubie: [0, 0, 1],
      projectedBasis: {
        col: { x: 40, y: 0 },
        row: { x: 0, y: 40 },
      },
    },
    { dx: 30, dy: 28 },
  );

  assert.equal(intent.type, 'pending-move');
});

test('oblique drag uses projected basis to lock the expected layer turn', () => {
  const camera = createCamera({ width: 320, height: 320, yaw: -0.8, pitch: -0.35, distance: 8 });
  const scene = buildStickerScene(createSolvedState(), camera);
  const sticker = scene.find((entry) => entry.face === 'F' && entry.row === 0 && entry.col === 1);
  const intent = mapDragIntent(sticker, { dx: 50, dy: 3 });

  assert.equal(intent.type, 'move');
  assert.equal(intent.move, 'U');
  assert.equal(intent.locked, true);
});
