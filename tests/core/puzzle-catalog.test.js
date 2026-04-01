import test from 'node:test';
import assert from 'node:assert/strict';

import { getPuzzleCatalog, getPuzzleDefinition } from '../../src/shared/puzzles/catalog.js';

test('puzzle catalog exposes cube, pyraminx, skewb, and megaminx definitions', () => {
  const ids = getPuzzleCatalog().map((entry) => entry.id);

  assert.deepEqual(ids, ['cube', 'pyraminx', 'skewb', 'megaminx']);
  assert.equal(getPuzzleDefinition('pyraminx').label, 'Pyraminx');
  assert.equal(getPuzzleDefinition('skewb').label, 'Skewb');
  assert.equal(getPuzzleDefinition('megaminx').label, 'Megaminx');
});
