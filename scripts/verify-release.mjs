import { execFileSync } from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  writeFile,
  access,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
// The root build deliberately excludes the generator. Require its build to
// pass too, rather than packing stale output left by a failed tsc invocation.
execFileSync('pnpm', ['--filter', 'create-lithent', 'build'], {
  cwd: repo,
  stdio: 'inherit',
});
const work = await mkdtemp(join(tmpdir(), 'lithent-release-'));
const packs = join(work, 'packs');
await mkdir(packs);
const entries = [
  repo,
  join(repo, 'lithentConcurrent'),
  join(repo, 'createLithent'),
];
const artifacts = [];

for (const cwd of entries) {
  const metadata = JSON.parse(
    await readFile(join(cwd, 'package.json'), 'utf8')
  );
  if (metadata.private) throw new Error(`${metadata.name} is still private`);
  execFileSync('pnpm', ['pack', '--pack-destination', packs], {
    cwd,
    stdio: 'pipe',
  });
  const archive = join(packs, `${metadata.name}-${metadata.version}.tgz`);
  await access(archive);
  const unpacked = join(work, 'unpacked', metadata.name);
  await mkdir(unpacked, { recursive: true });
  execFileSync('tar', [
    '-xzf',
    archive,
    '-C',
    unpacked,
    '--strip-components=1',
  ]);
  const packed = JSON.parse(
    await readFile(join(unpacked, 'package.json'), 'utf8')
  );
  if (packed.name !== metadata.name || packed.version !== metadata.version)
    throw new Error(`Wrong packed metadata: ${metadata.name}`);
  if (
    JSON.stringify([packed.dependencies, packed.peerDependencies]).includes(
      'workspace:'
    )
  )
    throw new Error(`Unresolved public workspace dependency: ${metadata.name}`);
  for (const target of Object.values(packed.exports || {}).flatMap(value =>
    Object.values(value)
  ))
    await access(resolve(unpacked, target));
  for (const target of Object.values(packed.bin || {}))
    await access(resolve(unpacked, target));
  artifacts.push({ ...metadata, archive });
  console.log(
    `PASS packed ${packed.name}@${packed.version}: manifest, exports and binaries`
  );
}

const consumer = join(work, 'consumer');
const paths = [
  'lithent',
  'lithent/jsx-runtime',
  'lithent/jsx-dev-runtime',
  'lithent/helper',
  'lithent/devHelper',
  'lithent/ssr',
  'lithent/tag',
  'lithent/ftags',
  'lithent/element',
  'lithent-concurrent',
  'lithent-concurrent/helper',
];
await mkdir(consumer);
await writeFile(
  join(consumer, 'package.json'),
  JSON.stringify(
    {
      private: true,
      type: 'module',
      dependencies: Object.fromEntries(
        artifacts
          .filter(p => p.name !== 'create-lithent')
          .map(p => [p.name, `file:${p.archive}`])
      ),
    },
    null,
    2
  )
);
execFileSync(
  'pnpm',
  ['install', '--offline', '--ignore-scripts', '--strict-peer-dependencies'],
  { cwd: consumer, stdio: 'pipe' }
);
await writeFile(
  join(consumer, 'imports.mjs'),
  `
import assert from 'node:assert/strict';
const paths = ${JSON.stringify(paths)};
for (const path of paths) {
  const module = await import(path);
  assert(Object.keys(module).length > 0, path + ' has no exports');
}
const base = await import('lithent');
const concurrent = await import('lithent-concurrent');
const helper = await import('lithent-concurrent/helper');
assert(!('deferRender' in base));
assert.equal(typeof concurrent.deferRender, 'function');
assert.equal(typeof concurrent.whenIdle, 'function');
assert.deepEqual(Object.keys(helper).sort(), ['deferred', 'hasPendingRender', 'ldeferred']);
const element = await import('lithent/element');
assert.deepEqual(Object.keys(element).sort(), ['defineElement', 'emit']);
assert.equal(element.defineElement('no-dom', () => null), undefined);
console.log('PASS isolated installed consumer: all 11 public import paths and distinct cores');
`
);
execFileSync(process.execPath, ['imports.mjs'], {
  cwd: consumer,
  stdio: 'inherit',
});
await writeFile(
  join(consumer, 'requires.cjs'),
  `
const assert = require('node:assert/strict');
const paths = ${JSON.stringify(paths)};
(async () => {
  // A successful require is insufficient: Node 24 can load the old .js UMD
  // as ESM and return an empty namespace. Assert usable exports and parity.
  for (const path of paths) {
    const commonjs = require(path);
    const esm = await import(path);
    assert(Object.keys(commonjs).length > 0, path + ' has no CommonJS exports');
    assert.deepEqual(Object.keys(commonjs).sort(), Object.keys(esm).sort(), path);
    for (const name of Object.keys(esm))
      assert.equal(typeof commonjs[name], typeof esm[name], path + ':' + name);
  }
  const base = require('lithent');
  const concurrent = require('lithent-concurrent');
  for (const core of [base, concurrent])
    for (const name of ['mount', 'useRenew', 'h', 'render'])
      assert.equal(typeof core[name], 'function', name);
  // Directory resolution bypasses exports and exercises the legacy main field.
  assert.equal(require('./node_modules/lithent'), base);
  assert.equal(require('./node_modules/lithent-concurrent'), concurrent);
  assert(!('deferRender' in base));
  assert.equal(typeof concurrent.deferRender, 'function');
  assert.equal(typeof concurrent.whenIdle, 'function');
  const jsx = require('lithent/jsx-runtime');
  assert.equal(jsx.Fragment, base.Fragment, 'JSX must share the CommonJS core');
  assert.equal(require('lithent/jsx-dev-runtime'), jsx);
  const { state } = require('lithent/helper');
  const { renderToString } = require('lithent/ssr');
  const App = base.mount(renew => {
    const label = state('packed & usable', renew);
    return () => jsx.jsxs(jsx.Fragment, { children: [
      jsx.jsx('p', { children: label.v }),
      jsx.jsx('b', { children: 'CommonJS' }),
    ] });
  });
  assert.equal(renderToString(jsx.jsx(App, {})),
    '<p>packed &amp; usable</p><b>CommonJS</b>');
  const element = require('lithent/element');
  assert.equal(element.defineElement('no-dom', () => null), undefined);
  console.log('PASS isolated CommonJS consumer: all 11 require paths, export parity, main and JSX/helper/SSR integration');
})().catch(error => { console.error(error); process.exitCode = 1; });
`
);
execFileSync(process.execPath, ['requires.cjs'], {
  cwd: consumer,
  stdio: 'inherit',
});
await writeFile(
  join(consumer, 'types.tsx'),
  `
import { mount, deferRender, whenIdle } from 'lithent-concurrent';
import { deferred, ldeferred, hasPendingRender } from 'lithent-concurrent/helper';
import type { State, Computed } from 'lithent-concurrent/helper';
const List = mount(renew => {
  const value: State<string> = deferred('initial', renew);
  const pending: Computed<boolean> = hasPendingRender();
  deferRender(() => { value.v = 'updated'; });
  return () => <p>{value.value}:{String(pending.v)}</p>;
});
export { List, ldeferred, whenIdle };
`
);
await writeFile(
  join(consumer, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
      jsx: 'react-jsx',
      jsxImportSource: 'lithent',
    },
    files: ['types.tsx'],
  })
);
execFileSync(
  process.execPath,
  [resolve(repo, 'node_modules/typescript/bin/tsc'), '-p', consumer],
  { cwd: consumer, stdio: 'inherit' }
);
console.log(
  'PASS isolated installed consumer: strict JSX/core/helper declarations'
);
console.log(`Release tarballs: ${packs}`);
console.log(
  `ALL PASS (${(await readdir(packs)).length} prepared packages; nothing published)`
);
