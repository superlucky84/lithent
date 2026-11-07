import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, hash, read, guard } from '../keyed-placement/init.mjs';

const out = fs.realpathSync(process.argv[2]);
const mode = process.argv[3];
assert.ok(
  ['gate', 'cpu-main', 'cpu-reverse', 'mem-main', 'mem-reverse'].includes(mode)
);
const input = read(path.join(out, 'measure-inputs.json'));
const chrome =
  '/tmp/lithent-shape-chrome-156.0.8078.47.app/Contents/MacOS/Google Chrome';
const expected = read(
  path.join(out, 'production-diagnostic/result.json')
).frozen;
function verify() {
  guard(out);
  for (const [file, sha] of Object.entries(input.files))
    assert.equal(
      hash(fs.readFileSync(path.join(input.bench, file))),
      sha,
      file
    );
  for (const [file, sha] of Object.entries(input.rootWrappers))
    assert.equal(
      hash(fs.readFileSync(path.join(root, 'docs/benchmark', file))),
      sha,
      file
    );
  assert.equal(hash(fs.readFileSync(chrome)), expected.chrome);
  assert.equal(
    hash(
      fs.readFileSync(
        path.resolve(
          chrome,
          '../../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
        )
      )
    ),
    expected.engine
  );
  for (const round of ['measure-main', 'measure-reverse'])
    for (const [name, build] of Object.entries(input.builds)) {
      assert.equal(
        hash(fs.readFileSync(path.join(out, round, name, 'main.js'))),
        build.bundle
      );
      assert.equal(
        hash(fs.readFileSync(path.join(out, round, name, 'index.html'))),
        build.html
      );
    }
}
verify();
assert.match(
  fs.readFileSync(path.join(out, 'candidate-core.log'), 'utf8'),
  /Tests\s+229 passed/
);
assert.equal(
  Object.keys(read(path.join(out, 'candidate-build.json')).sources).length,
  17
);
if (mode !== 'gate') {
  assert.equal(
    read(path.join(out, 'measure-main/production-verify.json')).complete,
    true
  );
  const contracts = read(path.join(out, 'measure-main/contracts.json'));
  assert.ok(contracts.finishedAt);
  assert.equal(contracts.samples.length, 2);
  assert.deepEqual(contracts.samples.map(sample => sample.name).sort(), [
    'baseline',
    'candidate',
  ]);
}
const round = mode.endsWith('reverse') ? 'measure-reverse' : 'measure-main';
const names = mode.endsWith('reverse')
  ? ['candidate', 'baseline']
  : ['baseline', 'candidate'];
const env = {
  LITHENT_BENCHMARK_ROOT: input.bench,
  LITHENT_PRODUCTION_OUT: path.join(out, round),
  LITHENT_CHROME_BINARY: chrome,
  LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
  LITHENT_PRODUCTION_FOLDERS: JSON.stringify(
    Object.fromEntries(names.map(name => [name, path.join(out, round, name)]))
  ),
};
if (process.env.LITHENT_PRODUCTION_RESUME === '1')
  env.LITHENT_PRODUCTION_RESUME = '1';
fs.mkdirSync(path.join(out, 'measurement-commands'), { recursive: true });
for (const action of mode === 'gate'
  ? ['contracts', 'verify']
  : [mode.startsWith('cpu') ? 'cpu' : 'mem']) {
  const args = [
    path.join(
      root,
      'docs/benchmark',
      action === 'contracts' ? 'targeted-update.mjs' : 'production-run.mjs'
    ),
    action,
    names.join(','),
  ];
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const logPath = path.join(out, mode + '-' + action + '-' + stamp + '.log');
  fs.writeFileSync(
    path.join(
      out,
      'measurement-commands',
      mode + '-' + action + '-' + stamp + '.json'
    ),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        executable: process.execPath,
        node: process.version,
        args,
        env,
        log: logPath,
        sizePolicy: input.sizePolicy,
      },
      null,
      2
    ) + '\n'
  );
  const log = fs.openSync(logPath, 'w');
  try {
    execFileSync(process.execPath, args, {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: ['ignore', log, log],
    });
  } finally {
    fs.closeSync(log);
  }
  console.log(JSON.stringify({ mode, action, complete: true, log: logPath }));
}
verify();
