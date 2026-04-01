import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('h5 removes the top header and keeps timer plus move count around the game area', () => {
  const appSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'App.jsx'), 'utf8');
  const panelSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'components', 'BottomPanel.jsx'), 'utf8');

  assert.doesNotMatch(appSource, /import\s+\{\s*TopBar\s*\}\s+from/);
  assert.doesNotMatch(appSource, /<TopBar\b/);
  assert.match(
    appSource,
    /<div className="stage-footer">[\s\S]*\{viewState\.statusLabel\}[\s\S]*\{viewState\.timerLabel\}[\s\S]*\{viewState\.moveCount\}/,
  );
  assert.doesNotMatch(panelSource, /<div className="mode-strip">/);
  assert.doesNotMatch(panelSource, /actions\.handleModeChange/);
});
