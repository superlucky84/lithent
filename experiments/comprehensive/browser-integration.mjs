import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, read, hash } from './init.mjs';

const out = fs.realpathSync(process.argv[2]),
  mode = process.argv[3] || 'all';
assert(['all', 'packages', 'e2e'].includes(mode));
const adopted = read(path.join(out, 'adoption.json'));
for (const [file, digest] of Object.entries(adopted.sources))
  assert.equal(hash(fs.readFileSync(path.join(root, file))), digest, file);
const directory = path.join(out, 'integration');
fs.mkdirSync(directory, { recursive: true });
for (const name of mode === 'all' ? ['packages', 'e2e'] : [mode]) {
  const at = new Date().toISOString(),
    stem = name + '-' + at.replaceAll(':', '-');
  const executable = name === 'packages' ? process.execPath : 'pnpm';
  const args =
    name === 'packages'
      ? [path.join(root, 'experiments/comprehensive/package-dispatch.mjs'), out]
      : ['exec', 'playwright', 'test', '--reporter=list,json'];
  const env = {
    ...process.env,
    PLAYWRIGHT_JSON_OUTPUT_NAME: path.join(directory, stem + '.report.json'),
  };
  const log = fs.createWriteStream(path.join(directory, stem + '.log'), {
    flags: 'wx',
  });
  const child = spawn(executable, args, {
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
    path.join(directory, stem + '.json'),
    JSON.stringify(
      {
        at,
        finishedAt: new Date().toISOString(),
        name,
        executable,
        args,
        status,
        node: process.version,
        report: name === 'e2e' ? env.PLAYWRIGHT_JSON_OUTPUT_NAME : undefined,
      },
      null,
      2
    ) + '\n',
    { flag: 'wx' }
  );
  assert.equal(status, 0, stem);
}
console.log(JSON.stringify({ mode, pass: true }));
