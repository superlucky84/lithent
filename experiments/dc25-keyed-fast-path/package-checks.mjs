import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadConfigFromFile } from 'vite';
import { root, read, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const candidate = path.join(out, 'candidate/dist/lithent.mjs');
const results = [];
for (const name of ['helper', 'devHelper', 'ftags', 'ssr', 'element']) {
  const directory = path.join(root, name);
  const { config } = await loadConfigFromFile(
    { command: 'serve', mode: 'test' },
    path.join(directory, 'vite.config.js')
  );
  const target = path.join(out, 'package-checks', name + '.config.mjs');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(
    target,
    `export default {
    root: ${JSON.stringify(directory)},
    cacheDir: ${JSON.stringify(path.join(out, 'package-checks', name + '-cache'))},
    resolve: { alias: [
      { find: /^lithent$/, replacement: ${JSON.stringify(candidate)} },
      { find: '@', replacement: ${JSON.stringify(path.join(directory, 'src'))} }
    ] },
    test: ${JSON.stringify({ ...config.test, maxWorkers: 1, minWorkers: 1 })}
  };\n`,
    { flag: 'wx' }
  );
  const env = { ...process.env };
  delete env.LITHENT_CORE;
  const args = [
    path.join(root, 'node_modules/vitest/vitest.mjs'),
    'run',
    '--config',
    target,
  ];
  const at = new Date().toISOString();
  const result = spawnSync(process.execPath, args, {
    cwd: directory,
    env,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 ** 2,
  });
  const log = String(result.stdout || '') + String(result.stderr || '');
  fs.writeFileSync(path.join(out, 'package-checks', name + '.log'), log, {
    flag: 'wx',
  });
  results.push({
    name,
    args,
    at,
    finishedAt: new Date().toISOString(),
    status: result.status,
    candidateSHA256: read(path.join(out, 'candidate/build.json')).bundles[
      'lithent.mjs'
    ].sha256,
  });
  console.log(
    name,
    log
      .split('\n')
      .filter(line => /Tests |Test Files /.test(line))
      .join('\n')
  );
  assert.equal(result.status, 0, log);
}
write(path.join(out, 'package-checks/result.json'), results);
guard(out);
