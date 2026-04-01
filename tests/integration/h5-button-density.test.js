import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('h5 action area uses compact button density for mobile screens', () => {
  const styles = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'styles.css'), 'utf8');

  assert.match(styles, /\.primary-button,\s*\.secondary-button\s*\{[\s\S]*min-height:\s*2\.5rem;/);
  assert.match(styles, /\.primary-button,\s*\.secondary-button\s*\{[\s\S]*padding:\s*0\.72rem 0\.9rem;/);
  assert.match(styles, /\.button-grid,\s*\.compact-grid,\s*\.stage-footer\s*\{[\s\S]*gap:\s*0\.55rem;/);
  assert.match(styles, /\.bottom-panel\s*\{[\s\S]*padding:\s*0\.85rem;/);
  assert.match(styles, /\.control-block\s*\{[\s\S]*padding:\s*0\.85rem;/);
});
