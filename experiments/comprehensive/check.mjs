import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { root, hash, guard } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const variant = process.argv[3];
const mode = process.argv[4];
assert(
  ['baseline', 'slot', 'flat-original', 'event', 'c2', 'combined'].includes(
    variant
  )
);
assert(
  ['events', 'core', 'types', 'concurrent-events', 'concurrent-core'].includes(
    mode
  )
);
guard(out);
const runtime = path.join(out, variant);
const concurrent = mode.startsWith('concurrent-');
const args =
  mode === 'types'
    ? [
        path.join(root, 'node_modules/typescript/bin/tsc'),
        '--noEmit',
        '--project',
        path.join(runtime, 'tsconfig.json'),
      ]
    : [
        path.join(root, 'node_modules/vitest/vitest.mjs'),
        'run',
        '--config',
        path.join(root, 'experiments/comprehensive/vitest.config.mjs'),
        ...(mode.endsWith('events')
          ? [
              'src/tests/core-eventContract.test.ts',
              'src/tests/core-eventDispatch.test.ts',
              'src/tests/core-portal-events.test.ts',
            ]
          : []),
      ];
const env = { ...process.env, LITHENT_FINAL_SOURCE: runtime };
if (concurrent) env.LITHENT_CORE = 'concurrent';
else delete env.LITHENT_CORE;
const at = new Date().toISOString();
const result = spawnSync(process.execPath, args, {
  cwd: root,
  env,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 ** 2,
});
const log = String(result.stdout || '') + String(result.stderr || '');
const stem = `${variant}-${mode}-${at.replaceAll(':', '-')}`;
const checks = path.join(out, 'checks');
fs.mkdirSync(checks, { recursive: true });
fs.writeFileSync(path.join(checks, stem + '.log'), log);
const testFiles = fs
  .readdirSync(path.join(root, 'src/tests'))
  .filter(name => /\.tsx?$/.test(name));
fs.writeFileSync(
  path.join(checks, stem + '.json'),
  JSON.stringify(
    {
      at,
      finishedAt: new Date().toISOString(),
      node: process.version,
      args,
      variant,
      mode,
      status: result.status,
      signal: result.signal,
      error: result.error?.message,
      tests: Object.fromEntries(
        testFiles.map(name => [
          name,
          hash(fs.readFileSync(path.join(root, 'src/tests', name))),
        ])
      ),
    },
    null,
    2
  ) + '\n'
);
console.log(
  log
    .split('\n')
    .slice(result.status ? -55 : -12)
    .join('\n')
);
console.log(
  JSON.stringify({
    variant,
    mode,
    status: result.status,
    log: path.join(checks, stem + '.log'),
  })
);
guard(out);
process.exitCode = result.status ?? 1;
