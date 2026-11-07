import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, hash, read, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = guard(out);
const names = [
  'baseline',
  'candidate',
  'react-hooks',
  'react-classes',
  'preact-hooks',
  'preact-classes',
];
assert(read(path.join(out, 'round-main/contracts.json')).complete);
const browserLabel = initial.browser.version.product.replace(
  /[^a-zA-Z0-9.]/g,
  '-'
);
const gate = path.join(out, 'gate-' + names.join('-') + '-' + browserLabel);
assert(read(path.join(gate, 'production-verify.json')).complete);
const files = [
  ...fs
    .readdirSync(path.join(root, 'experiments/dc25-keyed-fast-path'))
    .filter(name => /\.(mjs|py|tsx)$/.test(name))
    .map(name => 'experiments/dc25-keyed-fast-path/' + name),
  ...['production-run.mjs', 'official-memory.mjs', 'targeted-update.mjs'].map(
    name => 'docs/benchmark/' + name
  ),
];
const plan = {
  at: new Date().toISOString(),
  names,
  browser: initial.browser.version,
  protocol:
    'One six-app collection in opposite per-item orders; baseline/candidate 580 CPU + 60 memory are a declared subset of the same final 1740 CPU + 180 memory samples, not additional or historical samples.',
  sourceFiles: Object.fromEntries(
    files.map(file => [file, hash(fs.readFileSync(path.join(root, file)))])
  ),
  appInputsSHA256: hash(fs.readFileSync(path.join(out, 'app-inputs.json'))),
  expectedCPU: 1740,
  expectedMemory: 180,
};
const planPath = path.join(out, 'measurement-plan.json');
if (fs.existsSync(planPath)) {
  assert.equal(
    process.env.LITHENT_PRODUCTION_RESUME,
    '1',
    'Inspect existing outputs before explicit resume'
  );
  const previous = read(planPath);
  assert.deepEqual(previous.sourceFiles, plan.sourceFiles);
  assert.equal(previous.appInputsSHA256, plan.appInputsSHA256);
} else write(planPath, plan);
for (const [mode, order] of [
  ['cpu', 'main'],
  ['cpu', 'reverse'],
  ['mem', 'main'],
  ['mem', 'reverse'],
]) {
  const result = path.join(
    out,
    'official-' + order,
    'production-' + mode + '.json'
  );
  if (fs.existsSync(result) && read(result).complete) {
    console.log('Preserving completed phase:', mode, order);
    continue;
  }
  const ordered = order === 'reverse' ? names.slice().reverse() : names;
  const args = [
    path.join(root, 'experiments/dc25-keyed-fast-path/measure.mjs'),
    out,
    mode,
    order,
    ordered.join(','),
  ];
  const child = spawn(process.execPath, args, {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });
  const status = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  assert.equal(status, 0, mode + '/' + order);
}
console.log(
  'Complete: six-app opposite-order official CPU and memory collection.'
);
