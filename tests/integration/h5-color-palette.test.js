import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('h5 theme uses toy-inspired sticker colors instead of ai-style glow gradients', () => {
  const appSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'App.jsx'), 'utf8');
  const styles = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'styles.css'), 'utf8');

  assert.doesNotMatch(appSource, /ambient-left|ambient-right/);
  assert.doesNotMatch(styles, /radial-gradient\(circle at top left/);
  assert.doesNotMatch(styles, /rgba\(255,\s*183,\s*3,\s*0\.22\)/);
  assert.match(styles, /--cube-red:\s*#/);
  assert.match(styles, /--cube-blue:\s*#/);
  assert.match(styles, /--cube-yellow:\s*#/);
});
