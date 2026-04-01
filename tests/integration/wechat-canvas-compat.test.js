import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('wechat page uses legacy canvas markup compatible with wx.createCanvasContext', () => {
  const pageScript = fs.readFileSync(
    path.join(rootDir, 'miniapps', 'wechat', 'pages', 'index', 'index.js'),
    'utf8',
  );
  const pageTemplate = fs.readFileSync(
    path.join(rootDir, 'miniapps', 'wechat', 'pages', 'index', 'index.wxml'),
    'utf8',
  );

  assert.match(pageScript, /wx\.createCanvasContext\('cubeCanvas', page\)/);
  assert.doesNotMatch(pageTemplate, /type="2d"/);
});
