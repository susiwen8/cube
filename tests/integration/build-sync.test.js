import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('shared sync builds require-able CommonJS miniapp runtime outputs', () => {
  execFileSync('node', ['scripts/sync-miniapp-shared.mjs'], {
    cwd: rootDir,
    stdio: 'pipe',
  });

  const wechatSharedDir = path.join(rootDir, 'miniapps', 'wechat', 'shared');
  const packageJsonPath = path.join(wechatSharedDir, 'package.json');
  assert.equal(fs.existsSync(packageJsonPath), true);

  const metadata = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  assert.equal(metadata.type, 'commonjs');

  const runtime = require(path.join(wechatSharedDir, 'adapters', 'miniapp-page.js'));
  assert.equal(typeof runtime.createMiniappPage, 'function');
});
