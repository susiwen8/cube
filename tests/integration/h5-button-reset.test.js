import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('h5 buttons explicitly reset native browser appearance', () => {
  const styles = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'styles.css'), 'utf8');

  assert.match(styles, /button\s*\{[\s\S]*appearance:\s*none;/);
  assert.match(styles, /button\s*\{[\s\S]*-webkit-appearance:\s*none;/);
});

test('h5 action buttons share one neutral fill instead of separate primary and secondary colors', () => {
  const styles = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'styles.css'), 'utf8');

  assert.match(styles, /\.primary-button,\s*\.secondary-button\s*\{[\s\S]*background:\s*var\(--button-fill\);/);
  assert.match(styles, /\.primary-button,\s*\.secondary-button\s*\{[\s\S]*color:\s*var\(--text\);/);
});
