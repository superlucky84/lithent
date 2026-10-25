// Logged package gates. Run only after final collection and exact source adoption.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, read, hash } from './init.mjs';

const out = fs.realpathSync(process.argv[2]),
  mode = process.argv[3];
assert(['build', 'checks', 'checks-tail', 'tests'].includes(mode));
assert(read(path.join(out, 'final-event-audit.json')).pass);
assert.equal(read(path.join(out, 'before-adoption.json')).selected, 'event');
const compiled = read(path.join(out, 'event/build.json'));
for (const [file, digest] of Object.entries(compiled.sources))
  assert.equal(
    hash(fs.readFileSync(path.join(root, 'src', file))),
    digest,
    file
  );
const dir = path.join(out, 'integration');
fs.mkdirSync(dir, { recursive: true });
const commands =
  mode === 'build'
    ? [['full-build', ['build']]]
    : mode === 'tests'
      ? [
          ['full-tests', ['test']],
          ['ssr-base', ['--filter', 'lithent-ssr', 'test']],
          [
            'satellites-concurrent',
            ['run', 'test:satellites'],
            { LITHENT_CORE: 'concurrent' },
          ],
        ]
      : [
          ['verify-concurrent', ['verify:concurrent']],
          ['size', ['size']],
          ['types-base', ['exec', 'tsc', '--noEmit']],
          [
            'types-concurrent',
            [
              'exec',
              'tsc',
              '--noEmit',
              '-p',
              'lithentConcurrent/tsconfig.json',
            ],
          ],
          ['types-e2e', ['exec', 'tsc', '--noEmit', '-p', 'e2e/tsconfig.json']],
          [
            'lint',
            [
              'exec',
              'eslint',
              'src/render.ts',
              'src/hook/internal/unmount.ts',
              'src/utils/event.ts',
              'lithentConcurrent/src/render.ts',
              'src/tests/core-eventContract.test.ts',
              'src/tests/core-eventDispatch.test.ts',
              'e2e/events.spec.ts',
              'e2e/fixtures/events.ts',
              'experiments/comprehensive/event.ts',
              'experiments/comprehensive/ui.tsx',
            ],
          ],
        ];
const selected =
  mode === 'checks-tail'
    ? commands.filter(([name]) => ['types-e2e', 'lint'].includes(name))
    : commands;
for (const [name, args, extra = {}] of selected) {
  const stem = `${name}-${new Date().toISOString().replaceAll(':', '-')}`,
    at = new Date().toISOString();
  const log = fs.createWriteStream(path.join(dir, stem + '.log'), {
    flags: 'wx',
  });
  const env = { ...process.env };
  delete env.LITHENT_CORE;
  Object.assign(env, extra);
  const child = spawn('pnpm', args, {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const stream of [child.stdout, child.stderr])
    stream.on('data', chunk => {
      log.write(chunk);
      process.stdout.write(chunk);
    });
  const status = await new Promise((resolve, reject) => {
    child.once('close', resolve);
    child.once('error', reject);
  });
  await new Promise(resolve => log.end(resolve));
  fs.writeFileSync(
    path.join(dir, stem + '.json'),
    JSON.stringify(
      {
        at,
        finishedAt: new Date().toISOString(),
        name,
        executable: 'pnpm',
        args,
        extra,
        status,
        node: process.version,
      },
      null,
      2
    ) + '\n',
    { flag: 'wx' }
  );
  assert.equal(status, 0, stem);
}
console.log(JSON.stringify({ mode, steps: selected.length, pass: true }));
