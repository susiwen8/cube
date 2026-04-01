import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('wechat miniapp touch extraction prefers page or client coordinates over local x/y', () => {
  const pageScript = fs.readFileSync(
    path.join(rootDir, 'miniapps', 'wechat', 'pages', 'index', 'index.js'),
    'utf8',
  );

  assert.match(pageScript, /x:\s*touch\.pageX\s*\?\?\s*touch\.clientX\s*\?\?\s*touch\.x\s*\?\?\s*0/);
  assert.match(pageScript, /y:\s*touch\.pageY\s*\?\?\s*touch\.clientY\s*\?\?\s*touch\.y\s*\?\?\s*0/);
});

test('alipay miniapp touch extraction prefers page or client coordinates over local x/y', () => {
  const pageScript = fs.readFileSync(
    path.join(rootDir, 'miniapps', 'alipay', 'pages', 'index', 'index.js'),
    'utf8',
  );

  assert.match(pageScript, /x:\s*touch\.pageX\s*\|\|\s*touch\.clientX\s*\|\|\s*touch\.x\s*\|\|\s*0/);
  assert.match(pageScript, /y:\s*touch\.pageY\s*\|\|\s*touch\.clientY\s*\|\|\s*touch\.y\s*\|\|\s*0/);
});
