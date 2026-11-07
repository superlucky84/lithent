// Run only after the official core suite: each browser lane is serial.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { root, read, guard } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
for (const order of ['main', 'reverse'])
  for (const kind of ['cpu', 'mem'])
    assert(
      read(path.join(out, `core-${order}/production-${kind}.json`)).complete
    );
const commands = path.join(out, 'extra-commands');
fs.mkdirSync(commands, { recursive: true });
for (const name of ['event-run', 'retention', 'dispose', 'ui-measure']) {
  const at = new Date().toISOString().replaceAll(':', '-');
  const args = [
    path.join(root, 'experiments/comprehensive', name + '.mjs'),
    out,
  ];
  const log = fs.createWriteStream(
    path.join(commands, name + '-' + at + '.log'),
    { flags: 'wx' }
  );
  fs.writeFileSync(
    path.join(commands, name + '-' + at + '.json'),
    JSON.stringify({ executable: process.execPath, args }, null, 2) + '\n'
  );
  const child = spawn(process.execPath, args, {
    cwd: root,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const stream of [child.stdout, child.stderr])
    stream.on('data', chunk => {
      log.write(chunk);
      process.stdout.write(chunk);
    });
  const status = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  await new Promise(resolve => log.end(resolve));
  assert.equal(status, 0, name);
  guard(out);
}
