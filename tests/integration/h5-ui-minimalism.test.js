import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..', '..');

test('h5 app avoids verbose marketing copy in the primary screen components', () => {
  const appSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'App.jsx'), 'utf8');
  const topBarSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'components', 'TopBar.jsx'), 'utf8');
  const panelSource = fs.readFileSync(path.join(rootDir, 'apps', 'h5', 'src', 'components', 'BottomPanel.jsx'), 'utf8');

  assert.doesNotMatch(appSource, /手机浏览器也能流畅玩高阶魔方/);
  assert.doesNotMatch(topBarSource, /Mobile First/);
  assert.doesNotMatch(panelSource, /求解队列：/);
});
