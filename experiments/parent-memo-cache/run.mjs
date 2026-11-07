import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  root,
  bench,
  chrome,
  names,
  fileHash,
  guard,
  read,
} from './config.mjs';

const mode = process.argv[2];
const out = path.resolve(process.argv[3] || '/tmp/lithent-c3-cache-20261022');
assert.ok(
  ['gate', 'cpu-main', 'cpu-reverse', 'mem-main', 'mem-reverse'].includes(mode)
);
guard(out);
const manifest = read(path.join(out, 'round-main/build-manifest.json'));
for (const round of ['round-main', 'round-reverse'])
  for (const name of names) {
    assert.equal(
      fileHash(path.join(out, round, name, 'main.js')),
      manifest[name].bundle
    );
    assert.equal(
      fileHash(path.join(out, round, name, 'index.html')),
      manifest[name].html
    );
  }
for (const file of [
  'production-run.mjs',
  'targeted-update.mjs',
  'official-memory.mjs',
])
  assert.equal(
    fileHash(path.join(out, file)),
    fileHash(path.join(root, 'docs/benchmark', file))
  );
if (mode !== 'gate') {
  assert.equal(read(path.join(out, 'diagnostic.json')).complete, true);
  assert.equal(read(path.join(out, 'root-dispose.json')).complete, true);
  assert.equal(
    read(path.join(out, 'round-main/production-verify.json')).complete,
    true
  );
  assert.equal(
    read(path.join(out, 'round-main/contracts.json')).samples.length,
    5
  );
}
fs.mkdirSync(path.join(out, 'commands'), { recursive: true });
for (const action of mode === 'gate'
  ? ['contracts', 'verify']
  : [mode.startsWith('cpu') ? 'cpu' : 'mem']) {
  const round = mode.endsWith('reverse') ? 'round-reverse' : 'round-main';
  const order = mode.endsWith('reverse') ? [...names].reverse() : names;
  const env = {
    LITHENT_BENCHMARK_ROOT: bench,
    LITHENT_PRODUCTION_OUT: path.join(out, round),
    LITHENT_CHROME_BINARY: chrome,
    LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
    LITHENT_PRODUCTION_FOLDERS: JSON.stringify(
      Object.fromEntries(names.map(name => [name, path.join(out, round, name)]))
    ),
  };
  if (process.env.LITHENT_PRODUCTION_RESUME === '1')
    env.LITHENT_PRODUCTION_RESUME = '1';
  const args = [
    path.join(
      root,
      'docs/benchmark',
      action === 'contracts' ? 'targeted-update.mjs' : 'production-run.mjs'
    ),
    action,
    order.join(','),
  ];
  const stamp = new Date().toISOString().replaceAll(':', '-');
  fs.writeFileSync(
    path.join(out, 'commands', mode + '-' + action + '-' + stamp + '.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        executable: process.execPath,
        node: process.version,
        args,
        env,
      },
      null,
      2
    )
  );
  const log = fs.openSync(
    path.join(out, mode + '-' + action + '-' + stamp + '.log'),
    'w'
  );
  try {
    execFileSync(process.execPath, args, {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: ['ignore', log, log],
    });
  } finally {
    fs.closeSync(log);
  }
  console.log(mode, action, 'complete');
}
guard(out);
