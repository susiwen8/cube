import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');

test('project scaffold exposes the expected entry points', () => {
  assert.equal(fs.existsSync(path.join(rootDir, 'package.json')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'README.md')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'src', 'shared', 'core')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'src', 'shared', 'render')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'src', 'shared', 'adapters')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'apps', 'h5', 'package.json')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'apps', 'h5', 'index.html')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'apps', 'h5', 'src')), true);
});
