import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

const [requested, mode, order = 'main'] = process.argv.slice(2);
const out = fs.realpathSync(requested);
const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const initial = read(path.join(out, 'initial.json'));
const runner = read(path.join(out, 'runner-inputs.json'));
function guard() {
  for (const [file, digest] of Object.entries(initial.files))
    assert.equal(hash(fs.readFileSync(path.join(root, file))), digest, file);
  for (const [file, digest] of Object.entries(initial.browser.files))
    assert.equal(hash(fs.readFileSync(file)), digest, file);
  for (const [file, digest] of Object.entries(runner.frozen))
    assert.equal(
      hash(fs.readFileSync(path.join(runner.bench, file))),
      digest,
      file
    );
  for (const [name, app] of Object.entries(
    read(path.join(out, 'build-manifest.json'))
  ))
    assert.equal(
      hash(fs.readFileSync(path.join(out, 'apps', name, app.entryJS))),
      app.bundle
    );
}
guard();
if (mode === 'memory') {
  for (const nextOrder of ['main', 'reverse']) {
    const child = spawn(
      process.execPath,
      [process.argv[1], out, 'mem', nextOrder],
      { stdio: 'inherit' }
    );
    const status = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', resolve);
    });
    if (status) process.exit(status);
  }
  process.exit(0);
}
assert(['gate', 'cpu', 'mem'].includes(mode));
const dest = path.join(out, mode === 'gate' ? 'gate' : 'official-' + order);
if (mode === 'gate') {
  fs.mkdirSync(dest, { recursive: true });
  assert(
    !fs.existsSync(path.join(dest, 'production-verify.json')),
    'Do not repeat completed gate'
  );
  for (const file of ['build-manifest.json', 'versions.json'])
    fs.copyFileSync(path.join(out, file), path.join(dest, file));
} else
  assert(
    !fs.existsSync(path.join(dest, 'production-' + mode + '.json')),
    'Preserve completed batches'
  );
const names =
  order === 'main' ? ['baseline', 'candidate'] : ['candidate', 'baseline'];
const args = [
  'docs/benchmark/production-run.mjs',
  mode === 'gate' ? 'verify' : mode,
  names.join(','),
];
const env = {
  ...process.env,
  LITHENT_BENCHMARK_ROOT: runner.bench,
  LITHENT_PRODUCTION_OUT: dest,
  LITHENT_CHROME_BINARY: initial.browser.binary,
  LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
  LITHENT_PRODUCTION_FOLDERS: JSON.stringify(
    Object.fromEntries(names.map(name => [name, path.join(out, 'apps', name)]))
  ),
};
const stem = path.join(out, `${mode}-${order}-${Date.now()}`);
fs.writeFileSync(
  stem + '.json',
  JSON.stringify(
    {
      at: new Date().toISOString(),
      args,
      env: Object.fromEntries(
        Object.entries(env).filter(([k]) => k.startsWith('LITHENT_'))
      ),
    },
    null,
    2
  )
);
const log = fs.createWriteStream(stem + '.log');
const child = spawn(process.execPath, args, {
  cwd: root,
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
});
for (const stream of [child.stdout, child.stderr])
  stream.on('data', bytes => {
    log.write(bytes);
    process.stdout.write(bytes);
  });
const status = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('close', resolve);
});
await new Promise(resolve => log.end(resolve));
fs.writeFileSync(
  stem + '-exit.json',
  JSON.stringify({ status, at: new Date().toISOString() })
);
guard();
process.exitCode = status;
