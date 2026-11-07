import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const mode = process.argv[2];
const out = path.resolve(process.argv[3] || '/tmp/lithent-c3-optin-20261022');
const mapping = {
  gate: [
    ['contracts', 'round-main', false],
    ['verify', 'round-main', false],
  ],
  'cpu-main': [['cpu', 'round-main', false]],
  'cpu-reverse': [['cpu', 'round-reverse', true]],
  'mem-main': [['mem', 'round-main', false]],
  'mem-resume-main': [['mem', 'round-main', false]],
  'mem-reverse': [['mem', 'round-reverse', true]],
  retention: [['retention', 'round-main', false]],
};
assert.ok(mapping[mode], 'Unknown experiment mode');
if (mode !== 'gate') {
  const gate = JSON.parse(
    fs.readFileSync(path.join(out, 'round-main/production-verify.json'))
  );
  assert.equal(gate.complete, true);
  assert.equal(gate.samples.length, 2);
  const diagnostic = JSON.parse(
    fs.readFileSync(path.join(out, 'diagnostic.json'))
  );
  assert.equal(diagnostic.complete, true);
}
fs.mkdirSync(path.join(out, 'commands'), { recursive: true });
for (const [action, round, reverse] of mapping[mode]) {
  const env = {
    LITHENT_BENCHMARK_ROOT:
      process.env.LITHENT_BENCHMARK_ROOT ||
      path.join(root, '../js-framework-benchmark-upstream'),
    LITHENT_PRODUCTION_OUT: path.join(out, round),
    LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
    LITHENT_CHROME_BINARY:
      process.env.LITHENT_CHROME_BINARY ||
      '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome',
  };
  const args = [
    path.join(root, 'docs/benchmark/targeted-update.mjs'),
    action,
    reverse ? 'lithent,lithent-before' : 'lithent-before,lithent',
  ];
  if (mode === 'mem-resume-main') env.LITHENT_PRODUCTION_RESUME = '1';
  const record = {
    at: new Date().toISOString(),
    executable: process.execPath,
    node: process.version,
    args,
    env,
  };
  fs.writeFileSync(
    path.join(out, 'commands', mode + '-' + action + '.json'),
    JSON.stringify(record, null, 2) + '\n'
  );
  const log = fs.openSync(path.join(out, mode + '-' + action + '.log'), 'w');
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
