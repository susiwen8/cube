import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');
const jsxEntryFiles = [
  'apps/h5/src/App.jsx',
  'apps/h5/src/components/CubeCanvas.jsx',
  'apps/h5/src/components/TopBar.jsx',
  'apps/h5/src/components/BottomPanel.jsx',
];

test('h5 jsx entry files explicitly import React for the current Vite runtime setup', () => {
  for (const relativePath of jsxEntryFiles) {
    const source = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
    assert.match(source, /import React(?:,\s*\{[^}]+\})?\s+from\s+'react';|import React\s+from\s+'react';/);
  }
});

test('h5 canvas pointer handlers tolerate pointer-capture failures instead of aborting drag turns', () => {
  const source = fs.readFileSync(path.join(rootDir, 'apps/h5/src/components/CubeCanvas.jsx'), 'utf8');

  assert.match(source, /safePointerCapture\(event\.currentTarget,\s*event\.pointerId\)/);
  assert.match(source, /safeReleasePointerCapture\(event\.currentTarget,\s*event\.pointerId\)/);
});
