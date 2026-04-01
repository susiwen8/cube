import test from 'node:test';
import assert from 'node:assert/strict';

import { createSolvedState } from '../../src/shared/core/cube-state.js';
import { buildStickerScene } from '../../src/shared/render/cube-renderer.js';
import { createCamera, projectPoint } from '../../src/shared/render/projection.js';
import { hitTestSticker } from '../../src/shared/render/hit-test.js';

test('projected points are finite for a canonical camera', () => {
  const camera = createCamera({ width: 320, height: 320, yaw: 0, pitch: 0, distance: 8 });
  const point = projectPoint(camera, [1.2, 1.2, 1.2]);

  assert.equal(Number.isFinite(point.x), true);
  assert.equal(Number.isFinite(point.y), true);
  assert.equal(Number.isFinite(point.depth), true);
});

test('front face center sticker is hittable in a canonical front view', () => {
  const camera = createCamera({ width: 320, height: 320, yaw: 0, pitch: 0, distance: 8 });
  const scene = buildStickerScene(createSolvedState(), camera);
  const frontCenter = scene.find((sticker) => sticker.face === 'F' && sticker.index === 4);
  const centroid = averagePoint(frontCenter.points);
  const hit = hitTestSticker(scene, centroid.x, centroid.y);

  assert.equal(hit.face, 'F');
  assert.equal(hit.index, 4);
});

function averagePoint(points) {
  const total = points.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x,
      y: accumulator.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}
