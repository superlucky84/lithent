import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { root, hash, guard, read } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const mode = process.argv[3];
const round = process.argv[4] || 'main';
const scope = process.argv[5] || 'core';
if (mode === 'suite') {
  for (const [action, order] of [
    ['cpu', 'main'],
    ['cpu', 'reverse'],
    ['mem', 'main'],
    ['mem', 'reverse'],
  ]) {
    const child = spawn(
      process.execPath,
      [fileURLToPath(import.meta.url), out, action, order, scope],
      { cwd: root, stdio: 'inherit', env: process.env }
    );
    const status = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', resolve);
    });
    if (status !== 0) process.exit(status ?? 1);
  }
  process.exit(0);
}
assert(['gate', 'cpu', 'mem'].includes(mode));
assert(['main', 'reverse'].includes(round));
const input = read(path.join(out, 'app-inputs.json'));
const coreNames = ['baseline', 'event', 'c2', 'combined'];
const peers = [
  'react-hooks',
  'react-classes',
  'preact-hooks',
  'preact-classes',
];
const selected = scope.startsWith('final-')
  ? scope.slice('final-'.length)
  : null;
assert(
  ['all', 'core'].includes(scope) || coreNames.slice(1).includes(selected)
);
let names =
  scope === 'all'
    ? [...coreNames, ...peers]
    : selected
      ? ['baseline', selected, ...peers]
      : coreNames;
if (round === 'reverse') names = names.slice().reverse();
const staged = path.join(out, 'round-' + round);
const dest = mode === 'gate' ? staged : path.join(out, `${scope}-${round}`);
fs.mkdirSync(dest, { recursive: true });
for (const file of ['build-manifest.json', 'versions.json'])
  if (dest !== staged && !fs.existsSync(path.join(dest, file)))
    fs.copyFileSync(path.join(staged, file), path.join(dest, file));
function verify() {
  const initial = guard(out);
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
  for (const name of coreNames) {
    const compiled = read(path.join(out, name, 'build.json'));
    for (const [file, digest] of Object.entries(compiled.sources))
      assert.equal(
        hash(fs.readFileSync(path.join(out, name, 'src', file))),
        digest,
        `${name}/${file}`
      );
    assert.equal(
      hash(fs.readFileSync(path.join(out, name, 'dist/lithent.mjs'))),
      input.apps[name].core,
      name
    );
  }
  for (const name of names) {
    const dir = path.join(staged, name);
    assert.equal(
      hash(
        fs.readFileSync(path.join(dir, input.apps[name].entryJS || 'main.js'))
      ),
      input.apps[name].bundle,
      name
    );
    assert.equal(
      hash(fs.readFileSync(path.join(dir, 'index.html'))),
      input.apps[name].html,
      name
    );
  }
  return initial;
}
const initial = verify();
if (mode !== 'gate') {
  const gates = read(path.join(out, 'round-main/production-verify.json'));
  assert(gates.complete);
  assert(read(path.join(out, 'round-main/contracts.json')).finishedAt);
  assert(
    !fs.existsSync(path.join(dest, `production-${mode}.json`)),
    'Use the explicit resume mechanism or a fresh output; preserve earlier samples'
  );
}
const env = {
  ...process.env,
  LITHENT_BENCHMARK_ROOT: input.bench,
  LITHENT_PRODUCTION_OUT: dest,
  LITHENT_CHROME_BINARY: initial.browser.binary,
  LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
  LITHENT_PRODUCTION_FOLDERS: JSON.stringify(
    Object.fromEntries(names.map(name => [name, path.join(staged, name)]))
  ),
};
delete env.LITHENT_PRODUCTION_RESUME;
const commands = path.join(out, 'commands');
fs.mkdirSync(commands, { recursive: true });
for (const action of mode === 'gate'
  ? ['contracts-core', 'contracts', 'verify']
  : [mode]) {
  const at = new Date().toISOString();
  const stamp = `${scope}-${round}-${action}-${at.replaceAll(':', '-')}`;
  const args =
    action === 'contracts'
      ? [
          path.join(root, 'experiments/comprehensive/contracts.mjs'),
          out,
          ...names,
        ]
      : [
          path.join(
            root,
            'docs/benchmark',
            action === 'contracts-core'
              ? 'targeted-update.mjs'
              : 'production-run.mjs'
          ),
          action === 'contracts-core' ? 'contracts' : action,
          (action === 'contracts-core'
            ? names.filter(name => coreNames.includes(name))
            : names
          ).join(','),
        ];
  if (mode === 'gate') {
    const previous = path.join(
      dest,
      action === 'contracts-core'
        ? 'contracts.json'
        : action === 'contracts'
          ? 'contracts.json'
          : 'production-verify.json'
    );
    if (fs.existsSync(previous))
      fs.renameSync(
        previous,
        path.join(dest, `preserved-${action}-${Date.now()}.json`)
      );
  }
  const log = fs.createWriteStream(path.join(commands, stamp + '.log'), {
    flags: 'wx',
  });
  const command = {
    at,
    executable: '/opt/homebrew/bin/node',
    args,
    env: Object.fromEntries(
      Object.entries(env).filter(([key]) => key.startsWith('LITHENT_'))
    ),
    names,
    mode,
    round,
    scope,
  };
  fs.writeFileSync(
    path.join(commands, stamp + '.json'),
    JSON.stringify(command, null, 2) + '\n',
    { flag: 'wx' }
  );
  const child = spawn(command.executable, args, {
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
    child.once('error', reject);
    child.once('close', resolve);
  });
  await new Promise(resolve => log.end(resolve));
  fs.writeFileSync(
    path.join(commands, stamp + '-exit.json'),
    JSON.stringify({ status, finishedAt: new Date().toISOString() }) + '\n'
  );
  assert.equal(status, 0, `See ${stamp}.log`);
  if (action === 'contracts-core')
    fs.renameSync(
      path.join(dest, 'contracts.json'),
      path.join(dest, `contracts-core-${Date.now()}.json`)
    );
  verify();
}
