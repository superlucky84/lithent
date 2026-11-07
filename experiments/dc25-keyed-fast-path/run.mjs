import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { root, guard, write } from './common.mjs';

const [out, label, command, ...args] = process.argv.slice(2);
assert(out && label && command);
guard(out);
const at = new Date().toISOString();
const stem = path.join(out, 'commands', label + '-' + at.replaceAll(':', '-'));
write(stem + '.json', {
  at,
  command,
  args,
  cwd: root,
  node: process.version,
  env: Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key.startsWith('LITHENT_'))
  ),
});
const log = fs.createWriteStream(stem + '.log', { flags: 'wx' });
const child = spawn(command, args, {
  cwd: root,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let tail = '';
for (const stream of [child.stdout, child.stderr])
  stream.on('data', bytes => {
    log.write(bytes);
    tail = (tail + bytes).slice(-12000);
  });
let error;
child.on('error', value => {
  error = value.message;
});
const [status, signal] = await new Promise(resolve =>
  child.once('close', (...values) => resolve(values))
);
await new Promise(resolve => log.end(resolve));
write(stem + '-exit.json', {
  status,
  signal,
  error,
  finishedAt: new Date().toISOString(),
});
guard(out);
console.log(tail.split('\n').slice(-25).join('\n'));
console.log(
  JSON.stringify({ label, status, signal, error, log: stem + '.log' })
);
process.exitCode = status ?? 1;
