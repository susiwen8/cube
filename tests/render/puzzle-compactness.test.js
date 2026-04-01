import test from 'node:test';
import assert from 'node:assert/strict';

import { getPuzzleDefinition } from '../../src/shared/puzzles/catalog.js';
import { createCamera } from '../../src/shared/render/projection.js';

const camera = createCamera({
  width: 320,
  height: 320,
  yaw: -0.65,
  pitch: -0.45,
  distance: 8,
});

test('non-cubic puzzles keep a compact projected footprint instead of looking too spaced out', () => {
  const thresholds = {
    pyraminx: { width: 125, height: 115 },
    skewb: { width: 132, height: 127 },
    megaminx: { width: 146, height: 148 },
  };

  for (const [puzzleId, threshold] of Object.entries(thresholds)) {
    const puzzle = getPuzzleDefinition(puzzleId);
    const scene = puzzle.buildScene(puzzle.createSolvedState(), camera);
    const bounds = getProjectedBounds(scene);
    const shellCount = scene.filter((entry) => entry.surfaceType === 'shell').length;

    assert.equal(
      bounds.width >= threshold.width,
      true,
      `${puzzleId} footprint should be wider to reduce visible face gaps`,
    );
    assert.equal(
      bounds.height >= threshold.height,
      true,
      `${puzzleId} footprint should be taller to reduce visible face gaps`,
    );
    assert.equal(
      shellCount > 0,
      true,
      `${puzzleId} should render face shells so stickers do not look disconnected`,
    );
  }
});

function getProjectedBounds(scene) {
  const points = scene.flatMap((sticker) => sticker.points);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}
