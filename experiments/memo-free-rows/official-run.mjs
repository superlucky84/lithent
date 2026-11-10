// Run serially; do not build, test, or launch another benchmark while collecting.
//   node official-run.mjs OUT [suite | gate | cpu-N | mem-N ...]
// Odd rounds use the prepared variant order, even rounds the reverse.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));
const [requested, ...modes] = process.argv.slice(2);
const out = fs.realpathSync(requested);
const read = file => JSON.parse(fs.readFileSync(file));
const initial = read(path.join(out, 'initial.json'));
const manifest = read(path.join(out, 'build-manifest.json'));
const hash = file =>
  createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function guard() {
  for (const [file, digest] of Object.entries(initial.browser))
    assert.equal(hash(file), digest, file);
  for (const [file, digest] of Object.entries(initial.tools))
    assert.equal(hash(path.join(root, file)), digest, file);
  for (const [dir, files] of Object.entries(initial.runner))
    for (const [file, digest] of Object.entries(files))
      assert.equal(hash(path.join(initial.frozen, dir, file)), digest, file);
  for (const [name, app] of Object.entries(manifest))
    for (const [file, digest] of Object.entries(app.files))
      assert.equal(hash(path.join(out, 'apps', name, file)), digest, file);
}
const phases =
  !modes.length || modes[0] === 'suite'
    ? ['gate', 'cpu-1', 'cpu-2', 'mem-1', 'mem-2']
    : modes;
for (const phase of phases) {
  const [, mode, round] = /^(gate|cpu|mem)(?:-(\d+))?$/.exec(phase) || [];
  assert(mode && (mode === 'gate') === !round, 'Unknown phase: ' + phase);
  guard();
  const dest = path.join(out, phase);
  const kind = mode === 'gate' ? 'verify' : mode;
  assert(!fs.existsSync(dest), 'Preserve completed/partial runs: ' + dest);
  if (mode !== 'gate')
    assert(
      read(path.join(out, 'gate/production-verify.json')).complete,
      'Verification required'
    );
  fs.mkdirSync(dest);
  for (const file of ['build-manifest.json', 'versions.json'])
    fs.copyFileSync(path.join(out, file), path.join(dest, file));
  const names =
    mode === 'gate' || round % 2 ? initial.names : [...initial.names].reverse();
  const args = ['docs/benchmark/production-run.mjs', kind, names.join(',')];
  const env = {
    ...process.env,
    LITHENT_BENCHMARK_ROOT: initial.frozen,
    LITHENT_PRODUCTION_OUT: dest,
    LITHENT_CHROME_BINARY: initial.binary,
    LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
    LITHENT_PRODUCTION_FOLDERS: JSON.stringify(
      Object.fromEntries(
        names.map(name => [name, path.join(out, 'apps', name)])
      )
    ),
  };
  fs.writeFileSync(
    path.join(dest, 'command.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        args,
        env: Object.fromEntries(
          Object.entries(env).filter(([key]) => key.startsWith('LITHENT_'))
        ),
      },
      null,
      2
    ),
    { flag: 'wx' }
  );
  const log = fs.createWriteStream(path.join(dest, 'run.log'), { flags: 'wx' });
  const child = spawn(process.execPath, args, {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const stream of [child.stdout, child.stderr])
    stream.on('data', data => {
      log.write(data);
      process.stdout.write(data);
    });
  const status = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  await new Promise(resolve => log.end(resolve));
  fs.writeFileSync(
    path.join(dest, 'exit.json'),
    JSON.stringify({ status, at: new Date().toISOString() })
  );
  assert.equal(status, 0, phase + ' failed');
  guard();
}
