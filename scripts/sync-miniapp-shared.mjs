import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const rootDir = path.resolve(import.meta.dirname, '..');
const sourceDir = path.join(rootDir, 'src', 'shared');
const targets = [
  path.join(rootDir, 'miniapps', 'wechat', 'shared'),
  path.join(rootDir, 'miniapps', 'alipay', 'shared'),
];

await Promise.all(targets.map((target) => fs.rm(target, { recursive: true, force: true })));

const files = await collectJavaScriptFiles(sourceDir);

for (const target of targets) {
  await build({
    entryPoints: files,
    outdir: target,
    outbase: sourceDir,
    format: 'cjs',
    platform: 'neutral',
    bundle: false,
    target: ['es2020'],
    logLevel: 'silent',
  });

  await fs.writeFile(
    path.join(target, 'package.json'),
    `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`,
    'utf8',
  );
}

async function collectJavaScriptFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectJavaScriptFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}
