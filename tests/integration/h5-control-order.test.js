import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('h5 bottom panel places actions before size controls', () => {
  const panelSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'components', 'BottomPanel.jsx'), 'utf8');

  assert.match(
    panelSource,
    /<h2>操作<\/h2>[\s\S]*<h2>阶数<\/h2>/,
  );
});
