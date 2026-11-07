// DC-23 validation. Historical comprehensive evidence stays immutable.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = path.resolve(process.argv[2]);
const mode = process.argv[3];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => fs.readFileSync(path.join(root, file));
assert(['build', 'tests', 'checks', 'browser'].includes(mode));
fs.mkdirSync(out, { recursive: true });
const git = (...args) => execFileSync('git', args, { cwd: root });
const sources = {};
for (const file of git('ls-files', 'src', 'lithentConcurrent/src')
  .toString()
  .trim()
  .split('\n')
  .filter(file => !file.includes('/tests/') && file !== 'src/utils/event.ts')) {
  const bytes = read(file);
  assert.equal(hash(bytes), hash(git('show', `fb481f3:${file}`)), file);
  sources[file] = hash(bytes);
}
assert(!fs.existsSync(path.join(root, 'src/utils/event.ts')));
assert.equal(
  hash(read('experiments/comprehensive/event.ts')),
  hash(git('show', '95d6faf:src/utils/event.ts'))
);
const commands = {
  build: [['full-build', ['build']]],
  tests: [
    ['full-tests', ['test']],
    ['ssr-base', ['--filter', 'lithent-ssr', 'test']],
    [
      'satellites-concurrent',
      ['run', 'test:satellites'],
      { LITHENT_CORE: 'concurrent' },
    ],
  ],
  checks: [
    ['verify-concurrent', ['verify:concurrent']],
    ['size', ['size']],
    ['types-base', ['exec', 'tsc', '--noEmit']],
    [
      'types-concurrent',
      ['exec', 'tsc', '--noEmit', '-p', 'lithentConcurrent/tsconfig.json'],
    ],
    ['types-e2e', ['exec', 'tsc', '--noEmit', '-p', 'e2e/tsconfig.json']],
    [
      'lint',
      [
        'exec',
        'eslint',
        'src/render.ts',
        'src/hook/internal/unmount.ts',
        'lithentConcurrent/src/render.ts',
        'e2e/events.spec.ts',
        'e2e/fixtures/events.ts',
      ],
    ],
  ],
  browser: [
    [
      'package-formats',
      ['exec', 'node', 'experiments/native-events/packages.mjs', out],
    ],
    [
      'playwright',
      ['exec', 'playwright', 'test', '--reporter=list,json'],
      { PLAYWRIGHT_JSON_OUTPUT_NAME: path.join(out, 'playwright.json') },
    ],
  ],
}[mode];
for (const [name, args, extra = {}] of commands) {
  const startedAt = new Date().toISOString();
  const stem = `${name}-${startedAt.replaceAll(':', '-')}`;
  const logFile = path.join(out, stem + '.log');
  const log = fs.createWriteStream(logFile, { flags: 'wx' });
  const env = { ...process.env };
  delete env.LITHENT_CORE;
  Object.assign(env, extra);
  console.log(`Starting ${name}`);
  const child = spawn('pnpm', args, {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const stream of [child.stdout, child.stderr])
    stream.on('data', chunk => log.write(chunk));
  const exitCode = await new Promise((resolve, reject) => {
    child.once('close', resolve);
    child.once('error', reject);
  });
  await new Promise(resolve => log.end(resolve));
  const record = {
    startedAt,
    finishedAt: new Date().toISOString(),
    name,
    command: ['pnpm', ...args],
    extra,
    node: process.version,
    head: git('rev-parse', 'HEAD').toString().trim(),
    sources,
    log: path.basename(logFile),
    logSHA256: hash(fs.readFileSync(logFile)),
    exitCode,
  };
  fs.writeFileSync(
    path.join(out, stem + '.json'),
    JSON.stringify(record, null, 2) + '\n',
    { flag: 'wx' }
  );
  console.log(`${name}: exit ${exitCode}; ${logFile}`);
  if (exitCode !== 0) {
    console.log(fs.readFileSync(logFile, 'utf8').slice(-12000));
    process.exit(1);
  }
}
if (mode === 'build') {
  const expected = {
    'lithent.mjs':
      '61e2d1b70b2453d0ac82fcf5c1a7b1ac4e1ce44729480f01637ee62599f7061e',
    'lithent.umd.js':
      'ec4c46d237528d4fe1f8f3b35ea8f953ad31fb12eae48d2aab7df1f8b87f9c2d',
    'lithent.cjs':
      'e3bcff38618ba3150dba04af951444acf952bd17233adac35b2c30d60e226820',
  };
  const adoption = JSON.parse(
    read('docs/benchmark/comprehensive-adoption.json')
  );
  const artifacts = {
    node: process.version,
    zlib: process.versions.zlib,
    sources,
    bundles: {},
  };
  for (const [folder, stem] of [
    ['dist', 'lithent'],
    ['lithentConcurrent/dist', 'lithentConcurrent'],
  ]) {
    for (const suffix of ['mjs', 'umd.js', 'cjs']) {
      const file = `${folder}/${stem}.${suffix}`,
        bytes = read(file);
      const sha256 = hash(bytes);
      if (stem === 'lithent')
        assert.equal(sha256, expected[`${stem}.${suffix}`], file);
      const proxy = (
        stem === 'lithent' ? adoption.bundles : adoption.concurrentBundles
      )[`${stem}.${suffix}`];
      // Prior raw bytes come from their immutable archive, not reconstructed source.
      artifacts.bundles[file] = {
        sha256,
        raw: bytes.length,
        gzip: gzipSync(bytes, { level: 9 }).length,
        br: brotliCompressSync(bytes).length,
        previousProxy: proxy,
      };
    }
  }
  fs.writeFileSync(
    path.join(out, 'artifacts.json'),
    JSON.stringify(artifacts, null, 2) + '\n',
    { flag: 'wx' }
  );
  console.log(
    'All native sources match fb481f3; base ESM/UMD/CJS match frozen measured B.'
  );
}
