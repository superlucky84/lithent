import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, hash, read, write, guard } from './common.mjs';

const [requested, mode, order = 'main', csv = 'baseline,candidate'] =
  process.argv.slice(2);
const out = fs.realpathSync(requested);
assert(['gate', 'cpu', 'mem'].includes(mode));
assert(['main', 'reverse'].includes(order));
const initial = guard(out);
const runner = read(path.join(out, 'runner-inputs.json'));
const names = csv.split(',');
assert(names.every(name => /^[a-z][a-z0-9-]*$/.test(name)));
const staged = path.join(out, 'round-' + order);
const browserLabel =
  initial.browser.version?.product.replace(/[^a-zA-Z0-9.]/g, '-') ||
  'initial-browser';
const dest = path.join(
  out,
  mode === 'gate'
    ? 'gate-' + names.join('-') + '-' + browserLabel
    : 'official-' + order
);
fs.mkdirSync(dest, { recursive: true });
const manifest = read(path.join(staged, 'build-manifest.json'));
for (const file of ['build-manifest.json', 'versions.json']) {
  const source = path.join(staged, file),
    target = path.join(dest, file);
  if (fs.existsSync(target))
    assert.equal(
      hash(fs.readFileSync(target)),
      hash(fs.readFileSync(source)),
      file
    );
  else fs.copyFileSync(source, target);
}
if (mode === 'gate')
  for (const name of names)
    fs.cpSync(path.join(staged, name), path.join(dest, name), {
      recursive: true,
      errorOnExist: true,
    });
function verify() {
  guard(out);
  const plan = path.join(out, 'measurement-plan.json');
  if (fs.existsSync(plan))
    for (const [file, digest] of Object.entries(read(plan).sourceFiles))
      assert.equal(hash(fs.readFileSync(path.join(root, file))), digest, file);
  for (const [file, digest] of Object.entries(runner.frozen))
    assert.equal(
      hash(fs.readFileSync(path.join(runner.bench, file))),
      digest,
      file
    );
  for (const name of names) {
    const app = manifest[name];
    assert(app, name);
    assert.equal(
      hash(fs.readFileSync(path.join(staged, name, app.entryJS || 'main.js'))),
      app.bundle,
      name
    );
    assert.equal(
      hash(fs.readFileSync(path.join(staged, name, 'index.html'))),
      app.html,
      name
    );
    if (fs.existsSync(path.join(out, name, 'build.json'))) {
      const compiled = read(path.join(out, name, 'build.json'));
      for (const [file, digest] of Object.entries(compiled.sources))
        assert.equal(
          hash(fs.readFileSync(path.join(out, name, 'src', file))),
          digest,
          name + '/' + file
        );
      assert.equal(
        hash(fs.readFileSync(path.join(out, name, 'dist/lithent.mjs'))),
        app.core,
        name
      );
    }
  }
}
verify();
if (mode !== 'gate') {
  assert(
    fs.existsSync(path.join(out, 'measurement-plan.json')),
    'Freeze collection plan before timing'
  );
  const previous = path.join(dest, 'production-' + mode + '.json');
  if (fs.existsSync(previous)) {
    assert(
      process.env.LITHENT_PRODUCTION_RESUME === '1',
      'Use explicit resume; preserve completed samples'
    );
    assert(!read(previous).complete, 'Do not repeat completed samples');
  }
}
const env = {
  ...process.env,
  LITHENT_BENCHMARK_ROOT: runner.bench,
  LITHENT_PRODUCTION_OUT: dest,
  LITHENT_CHROME_BINARY: initial.browser.binary,
  LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
  LITHENT_PRODUCTION_FOLDERS: JSON.stringify(
    Object.fromEntries(names.map(name => [name, path.join(staged, name)]))
  ),
};
if (
  mode !== 'gate' &&
  fs.existsSync(path.join(dest, 'production-' + mode + '.json'))
)
  env.LITHENT_PRODUCTION_RESUME = '1';
else delete env.LITHENT_PRODUCTION_RESUME;
for (const action of mode === 'gate' ? ['contracts', 'verify'] : [mode]) {
  const apps =
    action === 'contracts'
      ? names.filter(name => fs.existsSync(path.join(out, name, 'build.json')))
      : names;
  if (!apps.length) continue;
  const at = new Date().toISOString();
  const stem = path.join(
    out,
    'commands',
    `${mode}-${order}-${names.join('-')}-${action}-${at.replaceAll(':', '-')}`
  );
  const args = [
    path.join(
      root,
      'docs/benchmark',
      action === 'contracts' ? 'targeted-update.mjs' : 'production-run.mjs'
    ),
    action,
    apps.join(','),
  ];
  write(stem + '.json', {
    at,
    executable: process.execPath,
    args,
    names,
    env: Object.fromEntries(
      Object.entries(env).filter(([key]) => key.startsWith('LITHENT_'))
    ),
  });
  const log = fs.createWriteStream(stem + '.log', { flags: 'wx' });
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
  write(stem + '-exit.json', { status, finishedAt: new Date().toISOString() });
  assert.equal(status, 0, stem);
  verify();
}
