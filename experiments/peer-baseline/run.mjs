import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, bench, chrome, names, read } from './config.mjs';
import { verify } from './guard.mjs';

const mode = process.argv[2],
  out = path.resolve(process.argv[3] || '/tmp/lithent-peers-20261023');
assert.ok(
  ['gate', 'cpu-main', 'cpu-reverse', 'mem-main', 'mem-reverse'].includes(mode)
);
verify(out);
if (mode !== 'gate') {
  assert.equal(read(path.join(out, 'contracts.json')).complete, true);
  assert.equal(
    read(path.join(out, 'round-main/production-verify.json')).complete,
    true
  );
}
fs.mkdirSync(path.join(out, 'commands'), { recursive: true });
for (const action of mode === 'gate'
  ? ['contracts', 'verify']
  : [mode.startsWith('cpu') ? 'cpu' : 'mem']) {
  const round = mode.endsWith('reverse') ? 'round-reverse' : 'round-main',
    order = mode.endsWith('reverse') ? [...names].reverse() : names;
  const env = {
    LITHENT_BENCHMARK_ROOT: bench,
    LITHENT_CHROME_BINARY: chrome,
    LITHENT_PRODUCTION_OUT: path.join(out, round),
    LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
    LITHENT_PRODUCTION_FOLDERS: JSON.stringify(
      Object.fromEntries(names.map(name => [name, path.join(out, round, name)]))
    ),
  };
  if (process.env.LITHENT_PRODUCTION_RESUME === '1')
    env.LITHENT_PRODUCTION_RESUME = '1';
  const args =
    action === 'contracts'
      ? [path.join(root, 'experiments/peer-baseline/contracts.mjs'), out]
      : [
          path.join(root, 'docs/benchmark/production-run.mjs'),
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
    ) + '\n'
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
verify(out);
