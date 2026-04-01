import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('h5 bottom panel exposes a true puzzle picker and move-pad hooks for non-cube puzzles', () => {
  const panelSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'components', 'BottomPanel.jsx'), 'utf8');
  const hookSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'hooks', 'useCubeApp.js'), 'utf8');
  const appSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'App.jsx'), 'utf8');
  const pyraminxSource = fs.readFileSync(path.join(rootDir, 'src', 'shared', 'puzzles', 'pyraminx.js'), 'utf8');
  const skewbSource = fs.readFileSync(path.join(rootDir, 'src', 'shared', 'puzzles', 'skewb.js'), 'utf8');
  const megaminxSource = fs.readFileSync(path.join(rootDir, 'src', 'shared', 'puzzles', 'megaminx.js'), 'utf8');

  assert.match(panelSource, /<h2>谜题<\/h2>/);
  assert.match(panelSource, /viewState\.puzzleOptions/);
  assert.match(panelSource, /move-pad-grid/);
  assert.match(panelSource, /actions\.handlePuzzleChange/);
  assert.match(panelSource, /actions\.handleMovePadMove/);
  assert.match(hookSource, /handlePuzzleChange/);
  assert.match(hookSource, /handleMovePadMove/);
  assert.match(appSource, /viewState\.puzzleLabel/);
  assert.match(pyraminxSource, /label:\s*'Pyraminx'/);
  assert.match(skewbSource, /label:\s*'Skewb'/);
  assert.match(megaminxSource, /label:\s*'Megaminx'/);
  assert.doesNotMatch(panelSource, /handleShapeVariantChange/);
  assert.doesNotMatch(appSource, /shapeVariantId|shapeLabel/);
});
