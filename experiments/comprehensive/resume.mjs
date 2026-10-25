import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, read, hash, guard } from './init.mjs';
const out = fs.realpathSync(process.argv[2]);
guard(out);
const command = read(process.argv[3]);
assert.equal(command.mode, 'mem');
assert.equal(command.scope, 'final-event');
const input = read(path.join(out, 'app-inputs.json'));
const verify = () => {
  guard(out);
  for (const [file, digest] of Object.entries(input.frozen))
    assert.equal(
      hash(fs.readFileSync(path.join(input.bench, file))),
      digest,
      file
    );
  for (const [file, digest] of Object.entries(input.wrappers))
    assert.equal(
      hash(fs.readFileSync(path.join(root, 'docs/benchmark', file))),
      digest,
      file
    );
  for (const name of command.names) {
    const app = input.apps[name];
    assert.equal(
      hash(
        fs.readFileSync(
          path.join(
            out,
            'round-' + command.round,
            name,
            app.entryJS || 'main.js'
          )
        )
      ),
      app.bundle,
      name
    );
  }
};
verify();
const original = path.join(
    command.env.LITHENT_PRODUCTION_OUT,
    'production-mem.json'
  ),
  raw = read(original);
assert(!raw.complete);
const stamp =
  'resume-final-memory-' + new Date().toISOString().replaceAll(':', '-');
fs.copyFileSync(original, path.join(out, stamp + '-before.json'));
const env = { ...process.env, ...command.env, LITHENT_PRODUCTION_RESUME: '1' };
const args = ['-i', command.executable, ...command.args];
const log = fs.createWriteStream(path.join(out, 'commands', stamp + '.log'), {
  flags: 'wx',
});
const child = spawn('caffeinate', args, {
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
  path.join(out, 'commands', stamp + '.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      executable: 'caffeinate',
      args,
      env: command.env,
      resume: true,
      status,
      reason:
        'macOS power log shows Idle Sleep and periodic DarkWake during failed memory attempts. Bounded idle-sleep assertion only; benchmark scenario, source, bundles and Chrome settings unchanged.',
    },
    null,
    2
  ) + '\n',
  { flag: 'wx' }
);
assert.equal(status, 0);
verify();
