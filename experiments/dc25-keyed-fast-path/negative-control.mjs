import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, stage, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const variant = stage(out, 'naive-identity');
const file = path.join(variant, 'src/diff.ts');
const source = fs.readFileSync(file, 'utf8');
const anchor = ') => {\n  // Already drawn';
assert(source.includes(anchor));
fs.writeFileSync(
  file,
  source.replace(
    anchor,
    `) => {
  if (newWDom === originalWDom) { newWDom.nr = 'N'; return newWDom; }
  // Already drawn`
  )
);
const args = [
  path.join(root, 'node_modules/vitest/vitest.mjs'),
  'run',
  '--config',
  path.join(root, 'experiments/comprehensive/vitest.config.mjs'),
  'src/tests/core-keyedFastPath.test.tsx',
  '-t',
  'reused identical VDOM',
];
const result = spawnSync(process.execPath, args, {
  cwd: root,
  env: { ...process.env, LITHENT_FINAL_SOURCE: variant },
  encoding: 'utf8',
  maxBuffer: 8 * 1024 ** 2,
});
const log = String(result.stdout || '') + String(result.stderr || '');
fs.writeFileSync(path.join(out, 'negative-identity.log'), log, { flag: 'wx' });
assert.equal(result.status, 1, log);
assert(log.includes('expected 0 to be greater than 0'), log);
write(path.join(out, 'negative-identity.json'), {
  at: new Date().toISOString(),
  args,
  expectedFailure: true,
  status: result.status,
  finding:
    'Returning before sameTypeAs skips observable children getter reads, even for identical objects. This shortcut violates R74; do not include it in the combined production candidate.',
});
guard(out);
console.log(
  'Naive same-object early return fails the baseline getter observation as expected.'
);
