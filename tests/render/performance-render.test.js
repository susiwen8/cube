import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { createSolvedState } from '../../src/shared/core/cube-state.js';
import { buildStickerScene, drawStickerScene } from '../../src/shared/render/cube-renderer.js';
import { createCamera } from '../../src/shared/render/projection.js';

test('10x10 scene construction stays within an interactive budget for repeated drag frames', () => {
  const state = createSolvedState(10);
  const camera = createCamera({ width: 320, height: 320, yaw: -0.65, pitch: -0.45, distance: 8 });

  const startedAt = performance.now();
  for (let index = 0; index < 80; index += 1) {
    buildStickerScene(state, camera);
  }
  const elapsedMs = performance.now() - startedAt;

  assert.equal(elapsedMs < 110, true);
});

test('10x10 draw path avoids per-sticker outlines unless a sticker is highlighted', () => {
  const state = createSolvedState(10);
  const camera = createCamera({ width: 320, height: 320, yaw: -0.65, pitch: -0.45, distance: 8 });
  const scene = buildStickerScene(state, camera, { highlightFaces: ['F'] });
  const ctx = createCountingCanvasContext();

  drawStickerScene(ctx, scene);

  assert.equal(
    ctx.strokeCalls,
    scene.filter((sticker) => sticker.highlighted).length,
  );
});

function createCountingCanvasContext() {
  return {
    canvas: { width: 320, height: 320 },
    strokeCalls: 0,
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() {},
    stroke() {
      this.strokeCalls += 1;
    },
    setFillStyle() {},
    setLineWidth() {},
    setStrokeStyle() {},
  };
}
