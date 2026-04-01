import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('runtime and cube renderer stop depending on the old shape-mod transform path', () => {
  const runtimeSource = fs.readFileSync(path.join(rootDir, 'src', 'shared', 'runtime', 'app-runtime.js'), 'utf8');
  const rendererSource = fs.readFileSync(path.join(rootDir, 'src', 'shared', 'render', 'cube-renderer.js'), 'utf8');

  assert.doesNotMatch(runtimeSource, /shapeVariant|shapeOptions|getShapeVariant|getShapeVariants|supportsShapeVariantSize/);
  assert.doesNotMatch(rendererSource, /shapeVariant|applyShapeVariantToGeometry|shape-variants\.js/);
});
