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
import { releasePackages } from './release-packages.mjs';
import {
  fileIdentity,
  readJson,
  sourceIdentity,
  validatePackedPackage,
} from './artifact-utils.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--output-dir'))
  throw new Error(
    'Usage: node scripts/verify-release.mjs [--output-dir directory]'
  );
const work = await mkdtemp(join(tmpdir(), 'lithent-release-'));
const packs = args.length ? resolve(repo, args[1]) : join(work, 'packs');
await mkdir(packs, { recursive: true });
if ((await readdir(packs)).length)
  throw new Error('Release output directory must be empty');
// The root build deliberately excludes the generator. Require its build to
// pass too, rather than packing stale output left by a failed tsc invocation.
execFileSync('pnpm', ['--filter', 'create-lithent', 'build'], {
  cwd: repo,
  stdio: 'inherit',
});
const artifacts = [];

for (const entry of releasePackages) {
  const cwd = resolve(repo, entry.directory);
  const metadata = JSON.parse(
    await readFile(join(cwd, 'package.json'), 'utf8')
  );
  if (metadata.private || metadata.name !== entry.name)
    throw new Error(`Wrong/private package: ${entry.name}`);
  execFileSync('pnpm', ['pack', '--pack-destination', packs], {
    cwd,
    stdio: 'pipe',
  });
  const archiveName = `${metadata.name.replace(/^@/, '').replaceAll('/', '-')}-${metadata.version}.tgz`;
  const archive = join(packs, archiveName);
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
  const packed = await validatePackedPackage(unpacked, metadata);
  artifacts.push({ ...metadata, archive, archiveName });
  console.log(
    `PASS packed ${packed.name}@${packed.version}: manifest, exports and binaries`
  );
}

const consumer = join(work, 'consumer');
const overrides = Object.fromEntries(
  artifacts.map(p => [p.name, `file:${p.archive}`])
);
const vite = await readJson(resolve(repo, 'node_modules/vite/package.json'));
const nodeTypes = await readJson(
  resolve(repo, 'node_modules/@types/node/package.json')
);
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
      dependencies: {
        ...overrides,
        vite: vite.version,
        '@types/node': nodeTypes.version,
      },
    },
    null,
    2
  )
);
// pnpm 12 reads overrides from the workspace settings, not package.json.
await writeFile(
  join(consumer, 'pnpm-workspace.yaml'),
  JSON.stringify({ overrides }, null, 2)
);
execFileSync(
  'pnpm',
  ['install', '--ignore-scripts', '--strict-peer-dependencies'],
  { cwd: consumer, stdio: 'inherit' }
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
import { h as baseH, mount as baseMount } from 'lithent';
import type { WDom } from 'lithent';
import { h, mount, deferRender, whenIdle } from 'lithent-concurrent';
import { deferred, ldeferred, hasPendingRender } from 'lithent-concurrent/helper';
import type { State, Computed } from 'lithent-concurrent/helper';
const List = mount(renew => {
  const value: State<string> = deferred('initial', renew);
  const pending: Computed<boolean> = hasPendingRender();
  deferRender(() => { value.v = 'updated'; });
  return () => <p>{value.value}:{String(pending.v)}</p>;
});
const BaseEmpty = baseMount(() => () => true);
const ConcurrentEmpty = mount(() => () => true);
baseH('div', {}, true, false, baseH(BaseEmpty, {}));
h('div', {}, true, false, h(ConcurrentEmpty, {}));
// JSX children and list keys on components: TypeScript 5.8+ checks children
// against the props type, so both come from JSX.IntrinsicAttributes.
const Card = baseMount<{ title: string }>((_r, props, children: WDom[]) => () => (
  <section><h2>{props.title}</h2>{children}</section>
));
const Row = baseMount<{ label: string }>((_r, props) => () => <li>{props.label}</li>);
const Rows = baseMount(() => () => (
  <ul>
    {['a', 'b'].map(label => <Row key={label} label={label} />)}
    <Card title="card"><p>child</p></Card>
    {/* @ts-expect-error component props are still checked */}
    <Row label={1} />
  </ul>
));
export { List, Rows, ldeferred, whenIdle };
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

// These fixtures must use native Node resolution, rather than Bundler mode:
// a shared ESM .d.ts can hide behind working .cjs JavaScript until a .cts
// consumer reports TS1479/TS1471. Check declaration dependencies too.
const typeScopes = [
  {
    name: 'base',
    paths: paths.slice(0, 9),
    names: [
      'core',
      'jsx',
      'jsxDev',
      'helper',
      'devHelper',
      'ssr',
      'tag',
      'ftags',
      'element',
    ],
    state: 'state',
  },
  {
    name: 'concurrent',
    paths: paths.slice(9),
    names: ['core', 'helper'],
    state: 'deferred',
  },
];
for (const scope of typeScopes) {
  const imports = scope.paths
    .map((path, i) => `import * as ${scope.names[i]} from '${path}';`)
    .join('\n');
  const requires = scope.paths
    .map((path, i) => `import ${scope.names[i]} = require('${path}');`)
    .join('\n');
  const usage = `
const App = core.mount<{ initial: number }>((renew, props) => {
  const value: helper.State<number> = helper.${scope.state}(props.initial, renew);
  // @ts-expect-error The state must keep its numeric value type.
  value.value = 'wrong';
  return () => core.h('p', {}, String(value.value));
});
const renew: core.Renew = core.useRenew();
// @ts-expect-error A missing export must not silently become any.
core.missingExport();
// @ts-expect-error useRenew does not accept arguments.
core.useRenew(1);
export { App, renew, ${scope.names.join(', ')} };
`;
  for (const [extension, syntax] of [
    ['mts', imports],
    ['cts', imports],
    ['require.cts', requires],
  ])
    await writeFile(
      join(consumer, `${scope.name}.${extension}`),
      syntax + usage
    );

  for (const resolution of ['Node16', 'NodeNext']) {
    for (const format of ['esm', 'commonjs']) {
      const config = `${scope.name}-${resolution}-${format}.json`;
      await writeFile(
        join(consumer, config),
        JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: resolution,
            moduleResolution: resolution,
            strict: true,
            skipLibCheck: false,
            noEmit: true,
            types: [],
          },
          files:
            format === 'esm'
              ? [`${scope.name}.mts`]
              : [`${scope.name}.cts`, `${scope.name}.require.cts`],
        })
      );
      execFileSync(
        process.execPath,
        [resolve(repo, 'node_modules/typescript/bin/tsc'), '-p', config],
        { cwd: consumer, stdio: 'inherit' }
      );
      console.log(
        `PASS installed ${scope.name}: ${resolution} ${format} declarations (skipLibCheck: false)`
      );
    }
  }
}

const commonjsJsx = join(consumer, 'commonjs-jsx');
// The supported formats can coexist in one program without duplicating the
// global JSX index signature. Keep the property key/value contract unchanged.
await writeFile(
  join(consumer, 'jsx-global-types.mts'),
  `
import type { Props } from 'lithent';
interface Before { [name: string]: Props; }
type Eq<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
export const keys: Eq<keyof Before, keyof JSX.IntrinsicElements> = true;
export const values: Eq<Before[string], JSX.IntrinsicElements[string]> = true;
`
);
for (const resolution of ['Node16', 'NodeNext']) {
  const config = `mixed-${resolution}.json`;
  await writeFile(
    join(consumer, config),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: resolution,
        moduleResolution: resolution,
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        types: [],
      },
      files: [
        'jsx-global-types.mts',
        ...typeScopes.flatMap(scope => [
          `${scope.name}.mts`,
          `${scope.name}.cts`,
          `${scope.name}.require.cts`,
        ]),
      ],
    })
  );
  execFileSync(
    process.execPath,
    [resolve(repo, 'node_modules/typescript/bin/tsc'), '-p', config],
    { cwd: consumer, stdio: 'inherit' }
  );
  console.log(
    `PASS both cores and mixed ESM/CommonJS: ${resolution}, strict JSX globals/key/value types`
  );
}
await mkdir(commonjsJsx);
await writeFile(join(commonjsJsx, 'package.json'), '{"type":"commonjs"}');
await writeFile(
  join(commonjsJsx, 'consumer.tsx'),
  `
import { mount } from 'lithent';
import { state } from 'lithent/helper';
import { renderToString } from 'lithent/ssr';
const App = mount(renew => {
  const label = state('typed CommonJS', renew);
  return () => <p>{label.value}</p>;
});
export const html: string = renderToString(<App />);
`
);
for (const resolution of ['Node16', 'NodeNext']) {
  const config = `tsconfig-${resolution}.json`;
  await writeFile(
    join(commonjsJsx, config),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: resolution,
        moduleResolution: resolution,
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        types: [],
        jsx: 'react-jsx',
        jsxImportSource: 'lithent',
      },
      files: ['consumer.tsx'],
    })
  );
  execFileSync(
    process.execPath,
    [resolve(repo, 'node_modules/typescript/bin/tsc'), '-p', config],
    { cwd: commonjsJsx, stdio: 'inherit' }
  );
  console.log(`PASS installed CommonJS JSX/helper/SSR: ${resolution}`);
}
console.log(`Release tarballs: ${packs}`);
const toolPaths = releasePackages
  .filter(p => p.name.startsWith('@lithent/'))
  .map(p => p.name);
await writeFile(
  join(consumer, 'tools.mjs'),
  `
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const tools = ${JSON.stringify(toolPaths)};
for (const path of tools) {
  const esm = await import(path);
  assert(Object.keys(esm).length > 0, path);
  const variants = [esm];
  if (path !== '@lithent/lithent-template-vite') {
    const cjs = require(path);
    assert.deepEqual(Object.keys(cjs).sort(), Object.keys(esm).sort(), path);
    for (const name of Object.keys(esm)) assert.equal(typeof cjs[name], typeof esm[name], path + ':' + name);
    assert.deepEqual(Object.keys(require('./node_modules/' + path)).sort(), Object.keys(cjs).sort(), path + ' main');
    variants.push(cjs);
  }
  for (const module of variants) {
    if (path === '@lithent/hmr-parser') {
      assert.equal(typeof module.transformWithHmr, 'function');
      assert.equal(typeof module.shouldSkipTransform('const value = 1;'), 'boolean');
    } else if (path === '@lithent/lithent-template-parser') {
      assert.equal(typeof module.compile, 'function');
      assert.equal(typeof module.compile('<div>Hello</div>'), 'object');
    } else {
      assert.equal(typeof module.default, 'function');
      const plugin = module.default(path === '@lithent/lithent-vite' ? { template: true } : {});
      assert(plugin && typeof plugin === 'object', path + ' plugin factory');
    }
  }
}
console.log('PASS 5 isolated tool packages: declared ESM/CJS exports, legacy main and callable factories');
`
);
execFileSync(process.execPath, ['tools.mjs'], {
  cwd: consumer,
  stdio: 'inherit',
});
// Never run the generator's interactive test script in CI.
const generator = JSON.parse(
  await readFile(
    join(consumer, 'node_modules/create-lithent/package.json'),
    'utf8'
  )
);
for (const bin of Object.values(generator.bin)) {
  const help = execFileSync(
    process.execPath,
    [join(consumer, 'node_modules/create-lithent', bin), '--help'],
    {
      cwd: consumer,
      encoding: 'utf8',
      timeout: 30_000,
    }
  );
  if (!/usage/i.test(help))
    throw new Error('Packed generator did not print CLI usage');
}
console.log('PASS installed generator binary --help');
const toolImports = toolPaths
  .map((path, i) => `import * as tool${i} from '${path}';`)
  .join('\n');
const toolUsage = `
import type { PluginOption } from 'vite' with { "resolution-mode": "import" };
const plugin: PluginOption = tool4.default({ template: { include: /\\.lithent$/ } });
// @ts-expect-error Plugin options must not become any.
tool4.default({ template: 42 });
// @ts-expect-error Public package exports must stay typed.
tool0.missingExport();
export { plugin, tool0, tool1, tool2, tool3, tool4 };
`;
await writeFile(join(consumer, 'tools.mts'), toolImports + toolUsage);
// ESM-only template-vite is deliberately consumed as an ESM type import here.
const cjsImports = toolPaths
  .map((path, i) =>
    path === '@lithent/lithent-template-vite'
      ? `import type * as tool${i} from '${path}' with { "resolution-mode": "import" };`
      : `import tool${i} = require('${path}');`
  )
  .join('\n');
await writeFile(join(consumer, 'tools.cts'), cjsImports + toolUsage);
for (const resolution of ['Node16', 'NodeNext']) {
  const config = 'tools-' + resolution + '.json';
  await writeFile(
    join(consumer, config),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: resolution,
        moduleResolution: resolution,
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        types: ['node'],
      },
      files: ['tools.mts', 'tools.cts'],
    })
  );
  execFileSync(
    process.execPath,
    [resolve(repo, 'node_modules/typescript/bin/tsc'), '-p', config],
    { cwd: consumer, stdio: 'inherit' }
  );
  console.log(
    'PASS installed tools: ' +
      resolution +
      ' ESM/CJS declarations (skipLibCheck: false)'
  );
}
// A manifest means every archive in this set passed runtime and type consumers.
const packages = [];
for (const artifact of artifacts)
  packages.push({
    name: artifact.name,
    version: artifact.version,
    archive: artifact.archiveName,
    ...(await fileIdentity(artifact.archive)),
  });
await writeFile(
  join(packs, 'manifest.json'),
  JSON.stringify(
    { schemaVersion: 1, source: sourceIdentity(repo), packages },
    null,
    2
  ) + '\n'
);
console.log(
  `ALL PASS (${artifacts.length} prepared packages; nothing published)`
);
