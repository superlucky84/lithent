import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root, hash, read, guard } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const input = read(path.join(out, 'ui-inputs.json'));
const initial = guard(out);
const core = read(path.join(out, 'app-inputs.json'));
const commands = path.join(out, 'ui-commands');
fs.mkdirSync(commands, { recursive: true });
for (const [mode, order] of [
  ['verify', 'main'],
  ['cpu', 'main'],
  ['cpu', 'reverse'],
]) {
  guard(out);
  for (const [name, item] of Object.entries(input.apps))
    assert.equal(
      hash(fs.readFileSync(path.join(out, 'ui-apps', name, 'main.js'))),
      item.bundle
    );
  for (const [file, digest] of Object.entries(core.wrappers))
    assert.equal(
      hash(fs.readFileSync(path.join(root, 'docs/benchmark', file))),
      digest
    );
  const staged = path.join(out, `ui-round-${order}`);
  const dest = mode === 'verify' ? staged : path.join(out, `ui-${order}`);
  fs.mkdirSync(dest, { recursive: true });
  for (const name of ['build-manifest.json', 'versions.json'])
    if (dest !== staged)
      fs.copyFileSync(path.join(staged, name), path.join(dest, name));
  assert(!fs.existsSync(path.join(dest, `production-${mode}.json`)));
  const names = Object.keys(input.apps);
  if (order === 'reverse') names.reverse();
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
  const args = [
    path.join(root, 'docs/benchmark/production-run.mjs'),
    mode,
    names.join(','),
    ...(mode === 'cpu' ? ['03,04'] : []),
  ];
  const stamp = `${mode}-${order}-${new Date().toISOString().replaceAll(':', '-')}`;
  fs.writeFileSync(
    path.join(commands, stamp + '.json'),
    JSON.stringify(
      {
        executable: '/opt/homebrew/bin/node',
        args,
        env: Object.fromEntries(
          Object.entries(env).filter(([key]) => key.startsWith('LITHENT_'))
        ),
      },
      null,
      2
    ) + '\n'
  );
  const log = fs.createWriteStream(path.join(commands, stamp + '.log'), {
    flags: 'wx',
  });
  const child = spawn('/opt/homebrew/bin/node', args, {
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
  assert.equal(status, 0, stamp);
}
guard(out);
