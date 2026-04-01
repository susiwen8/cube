import test from 'node:test';
import assert from 'node:assert/strict';

import { createSolvedState } from '../../src/shared/core/cube-state.js';
import { mapDragIntent } from '../../src/shared/render/gesture-mapper.js';
import { createCamera } from '../../src/shared/render/projection.js';
import { buildStickerScene } from '../../src/shared/render/cube-renderer.js';

test('4x4 scenes render full visible face grids instead of collapsing to 3x3 geometry', () => {
  const camera = createCamera({ width: 320, height: 320, yaw: -0.7, pitch: -0.45, distance: 8 });
  const scene = buildStickerScene(createSolvedState(4), camera);
  const front = scene.filter((sticker) => sticker.face === 'F');

  assert.equal(front.length, 16);
  assert.deepEqual(
    [...new Set(front.map((sticker) => sticker.row))].sort((left, right) => left - right),
    [0, 1, 2, 3],
  );
  assert.deepEqual(
    [...new Set(front.map((sticker) => sticker.col))].sort((left, right) => left - right),
    [0, 1, 2, 3],
  );
});

test('dragging an inner 4x4 column resolves to a depth-aware layer move', () => {
  const intent = mapDragIntent(
    {
      face: 'F',
      size: 4,
      row: 0,
      col: 1,
      center: [-1, -3, 4],
      cubie: [-1, 3, 3],
      projectedBasis: {
        col: { x: 40, y: 0 },
        row: { x: 0, y: 40 },
      },
    },
    { dx: 0, dy: 60 },
  );

  assert.equal(intent.type, 'move');
  assert.equal(intent.move, '2L');
});

test('higher-order front faces keep a comparable projected footprint instead of shrinking away', () => {
  const camera = createCamera({ width: 320, height: 320, yaw: 0, pitch: 0, distance: 8 });
  const threeByThree = buildStickerScene(createSolvedState(3), camera).filter((sticker) => sticker.face === 'F');
  const tenByTen = buildStickerScene(createSolvedState(10), camera).filter((sticker) => sticker.face === 'F');

  const threeWidth = getProjectedWidth(threeByThree);
  const tenWidth = getProjectedWidth(tenByTen);

  assert.equal(tenWidth / threeWidth >= 0.92, true);
});

function getProjectedWidth(stickers) {
  const xs = stickers.flatMap((sticker) => sticker.points.map((point) => point.x));
  return Math.max(...xs) - Math.min(...xs);
}
