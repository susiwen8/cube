import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('h5 size chips use a tighter footprint than the main action buttons', () => {
  const styles = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'styles.css'), 'utf8');

  assert.match(styles, /\.size-chip\s*\{[\s\S]*padding:\s*0\.66rem 0\.72rem;/);
  assert.match(styles, /\.size-chip\s*\{[\s\S]*border-radius:\s*0\.9rem;/);
  assert.match(styles, /\.size-chip\s*\{[\s\S]*font-size:\s*0\.94rem;/);
});
