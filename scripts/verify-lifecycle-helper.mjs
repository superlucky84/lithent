import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { runInNewContext } from 'node:vm';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { build } from 'vite';
import ts from 'typescript';

const repo = fileURLToPath(new URL('../', import.meta.url));
const baselineCommit = '123c243476b00336faf40e3c249ffde8b118dc8d';
const { values } = parseArgs({
  options: {
    'baseline-helper': { type: 'string' },
    output: { type: 'string' },
  },
});
const work = await mkdtemp(join(tmpdir(), 'lithent-lifecycle-helper-'));
const consumer = join(work, 'consumer');
const packs = join(work, 'packs');
await mkdir(packs);
await mkdir(join(consumer, 'node_modules'), { recursive: true });
await writeFile(
  join(consumer, 'package.json'),
  '{"private":true,"type":"module"}\n'
);
const run = (command, args, cwd = consumer, env = {}) => {
  const processResult = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (processResult.error) throw processResult.error;
  if (processResult.status !== 0)
    throw new Error(
      `${command} failed (${processResult.status}):\n${processResult.stdout}\n${processResult.stderr}`
    );
  return processResult.stdout;
};
const sha256 = value => createHash('sha256').update(value).digest('hex');
const sizes = value => ({
  raw: value.length,
  gzip: gzipSync(value, { level: 9 }).length,
  brotli: brotliCompressSync(value).length,
  sha256: sha256(value),
});
// Minifiers can choose different local names after adding exports. Compare the
// retained code after renaming only bound variables/parameters, keeping public
// property names, globals, literals, and all operations intact.
const normalizeBindings = code => {
  const filename = '/bundle.js';
  const options = { allowJs: true, noLib: true, noResolve: true };
  const source = ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.JS
  );
  const host = ts.createCompilerHost(options);
  host.getSourceFile = name => (name === filename ? source : undefined);
  const checker = ts.createProgram([filename], options, host).getTypeChecker();
  const names = new Map();
  const transformed = ts.transform(source, [
    context => root => {
      const visit = node => {
        if (ts.isIdentifier(node)) {
          const symbol = checker.getSymbolAtLocation(node);
          if (
            symbol?.declarations?.some(
              declaration =>
                (ts.isVariableDeclaration(declaration) ||
                  ts.isParameter(declaration)) &&
                ts.isIdentifier(declaration.name)
            )
          ) {
            if (!names.has(symbol)) names.set(symbol, `binding_${names.size}`);
            return ts.factory.createIdentifier(names.get(symbol));
          }
        }
        return ts.visitEachChild(node, visit, context);
      };
      return ts.visitNode(root, visit);
    },
  ]);
  try {
    return ts.createPrinter().printFile(transformed.transformed[0]);
  } finally {
    transformed.dispose();
  }
};
const phase7 = JSON.parse(
  await readFile(
    join(repo, 'docs/closure-lifecycle/SIZE_RESULTS_PHASE7.json'),
    'utf8'
  )
);
run(
  'git',
  [
    'diff',
    '--exit-code',
    baselineCommit,
    '--',
    'src',
    'lithentConcurrent/src',
    'element',
    'pnpm-lock.yaml',
    'vite.config.js',
    'lithentConcurrent/vite.config.js',
    'lithentConcurrent/package.json',
  ],
  repo
);
const metadata = JSON.parse(await readFile(join(repo, 'package.json'), 'utf8'));
const previousMetadata = JSON.parse(
  run('git', ['show', `${baselineCommit}:package.json`], repo)
);
assert.deepEqual(metadata.exports, previousMetadata.exports);
assert.equal(metadata.version, previousMetadata.version);

const result = {
  baselineCommit,
  node: process.version,
  compression: 'gzip level 9; Node default Brotli; source maps excluded',
  core: [],
  helper: [],
  consumers: [],
  treeShaking: [],
};
for (const before of phase7.production) {
  const value = await readFile(join(repo, before.path));
  const current = { path: before.path, ...sizes(value) };
  if (!before.path.startsWith('helper/')) {
    assert.equal(current.sha256, before.sha256, `Core changed: ${before.path}`);
    result.core.push(current);
  } else {
    result.helper.push({
      ...current,
      baseline: before,
      delta: Object.fromEntries(
        ['raw', 'gzip', 'brotli'].map(key => [key, current[key] - before[key]])
      ),
    });
  }
}
assert.equal(result.core.length, 6);

// Consume actual npm tarballs without an install or access to the repository.
for (const cwd of [repo, join(repo, 'lithentConcurrent')]) {
  const [{ filename }] = JSON.parse(
    run(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', packs],
      cwd,
      {
        npm_config_cache: join(work, 'npm-cache'),
        npm_config_offline: 'true',
      }
    )
  );
  const pkg = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8'));
  const destination = join(consumer, 'node_modules', pkg.name);
  await mkdir(destination);
  run('tar', [
    '-xzf',
    join(packs, filename),
    '-C',
    destination,
    '--strip-components=1',
  ]);
  assert.equal(
    JSON.parse(await readFile(join(destination, 'package.json'), 'utf8')).name,
    pkg.name
  );
}
const lifecycle = [
  'createOwnerScope',
  'createLatestTask',
  'useOwnerScope',
  'createActivityScope',
  'createScopedTask',
  'createRetainedView',
  'createRetainedHost',
  'useRenderBoundary',
  'supportsRenderBoundary',
];
const legacy = [
  'state',
  'lstate',
  'computed',
  'effect',
  'store',
  'lstore',
  'cacheUpdate',
  'nextTickRender',
  'createContext',
  'createLContext',
  'unwrapChildren',
];
const expected = [...legacy, ...lifecycle].sort();
const runtime = `
const expected = ${JSON.stringify(expected)};
assert.deepEqual(Object.keys(helper).sort(), expected);
assert.equal(helper.supportsRenderBoundary(), process.env.CORE === 'concurrent');
assert.equal('getRenderProtocol' in helper, false);
const owner = helper.createOwnerScope();
let cleaned = 0;
owner.own(() => cleaned++);
const task = helper.createLatestTask(owner);
const done = await task.run(() => 42);
assert.deepEqual(done, {status:'success', value:42});
owner.dispose(); owner.dispose();
assert.equal(cleaned, 1);
assert.deepEqual(await task.run(() => { throw Error('must not run'); }), {status:'stale'});
const activity = helper.createActivityScope();
const scoped = helper.createScopedTask(activity);
assert.deepEqual(await scoped.run(() => 1), {status:'stale'});
activity.activate();
assert.deepEqual(await scoped.run(() => 7), {status:'success',value:7});
activity.dispose();
let initialized = 0;
const Host = helper.createRetainedHost(() => { initialized++; return () => core.h('span', {}, 'editor'); }, console.error, {freezeChildren:helper.supportsRenderBoundary()});
assert.equal(ssr.renderToString(core.h(Host, {active:true})), '<div></div>');
await Promise.resolve();
assert.equal(initialized, 0);
if (helper.supportsRenderBoundary()) {
  const Boundary = core.mount(() => { helper.useRenderBoundary(false); return () => core.h('span', {}, 'boundary'); });
  assert.equal(ssr.renderToString(core.h(Boundary, {})), '<span>boundary</span>');
} else {
  assert.throws(() => helper.createRetainedHost(() => { initialized++; return () => null; }, console.error, {freezeChildren:true}), /Concurrent lifecycle core/);
  assert.equal(initialized, 0);
}
`;
await writeFile(
  join(consumer, 'runtime.mjs'),
  `import assert from 'node:assert/strict';\nimport * as core from 'lithent';\nimport * as helper from 'lithent/helper';\nimport * as ssr from 'lithent/ssr';\n${runtime}`
);
await writeFile(
  join(consumer, 'alias.mjs'),
  `export function resolve(specifier, context, next) { return next(specifier === 'lithent' ? 'lithent-concurrent' : specifier, context); }\n`
);
await writeFile(
  join(consumer, 'runtime.cjs'),
  `const assert = require('node:assert/strict');\nconst Module = require('node:module');\nif (process.env.CORE === 'concurrent') {\n const original = Module._resolveFilename;\n const concurrent = require.resolve('lithent-concurrent');\n Module._resolveFilename = function(specifier, ...args) { return original.call(this, specifier === 'lithent' ? concurrent : specifier, ...args); };\n}\nconst core = require('lithent');\nconst helper = require('lithent/helper');\nconst ssr = require('lithent/ssr');\n(async () => { ${runtime} })().catch(error => { console.error(error); process.exitCode=1; });\n`
);
for (const core of ['base', 'concurrent']) {
  run(
    process.execPath,
    [
      ...(core === 'concurrent' ? ['--loader', './alias.mjs'] : []),
      'runtime.mjs',
    ],
    consumer,
    { CORE: core }
  );
  run(process.execPath, ['runtime.cjs'], consumer, { CORE: core });
  // Full UMD has the same surface and takes the selected core as its global.
  const coreFile = join(
    consumer,
    'node_modules',
    core === 'base'
      ? 'lithent/dist/lithent.cjs'
      : 'lithent-concurrent/dist/lithentConcurrent.cjs'
  );
  const { createRequire } = await import('node:module');
  const context = {
    lithent: createRequire(import.meta.url)(coreFile),
    console,
    AbortController,
    AggregateError,
  };
  runInNewContext(
    await readFile(join(repo, 'helper/dist/lithentHelper.umd.js'), 'utf8'),
    context
  );
  assert.deepEqual(Object.keys(context.lithentHelper).sort(), expected);
  assert.equal(
    context.lithentHelper.supportsRenderBoundary(),
    core === 'concurrent'
  );
  result.consumers.push({
    core,
    esm: 'PASS',
    cjs: 'PASS',
    umd: 'PASS',
    ssr: 'PASS',
    exactCoreAlias: 'PASS',
  });
}

const typeFixture = `
import { h } from 'lithent';
import { createOwnerScope, useOwnerScope, createLatestTask, createActivityScope, createScopedTask, createRetainedView, createRetainedHost, useRenderBoundary, supportsRenderBoundary } from 'lithent/helper';
import type { Cleanup, CleanupErrorReporter, OwnerScope, Activity, ActivityScope, TaskWork, LatestTask, TaskHandlers, TaskOutcome, TaskLifetime, RetainedViewInitializer, RetainedView, RetainedViewOptions, RetainedHostProps, RenderBoundary } from 'lithent/helper';
const report: CleanupErrorReporter = error => { console.error(error); };
const owner: OwnerScope = createOwnerScope();
const hooked: OwnerScope = useOwnerScope(report);
const release: Cleanup = owner.own(() => {});
const group: LatestTask = createLatestTask(hooked);
const work: TaskWork<number> = async signal => signal.aborted ? 0 : 42;
const handlers: TaskHandlers<number> = { success: value => { value.toFixed(); }, error: error => { console.error(error); }, pending: value => { value.valueOf(); } };
const outcome: Promise<TaskOutcome<number>> = group.run(work, handlers);
outcome.then(value => { if (value.status === 'success') value.value.toFixed(); });
const scope: ActivityScope = createActivityScope();
const lifetime: TaskLifetime = 'instance';
const save: LatestTask = createScopedTask(scope, lifetime);
scope.onActive((activity: Activity) => { activity.signal.throwIfAborted(); return activity.own(release); });
const initialize: RetainedViewInitializer = (renew, activity) => { createScopedTask(activity); renew(); return () => h('span', {}, 'retained'); };
const options: RetainedViewOptions = { freezeChildren: supportsRenderBoundary() };
const view: RetainedView = createRetainedView(document.body, initialize, options);
const Host = createRetainedHost(initialize, report, options);
const props: RetainedHostProps = {active:true};
h(Host, props);
const boundary: RenderBoundary = useRenderBoundary(false);
boundary.pause(); boundary.resume(); boundary.dispose();
view.show(); view.hide(); view.dispose(); save.cancel();
// @ts-expect-error unsupported lifetime
createScopedTask(scope, 'request');
// @ts-expect-error work returns number, success receives number
group.run(work, {success: (value: string) => { value.toUpperCase(); }});
// @ts-expect-error scope cannot be replaced through the public handle
view.scope = scope;
// @ts-expect-error active is boolean
Host({active:'yes'});
`;
await writeFile(join(consumer, 'types.mts'), typeFixture);
await writeFile(join(consumer, 'types.cts'), typeFixture);
await writeFile(
  join(consumer, 'types.require.cts'),
  `
import core = require('lithent');
import helper = require('lithent/helper');
const owner: helper.OwnerScope = helper.createOwnerScope();
const task: helper.LatestTask = helper.createLatestTask(owner);
const outcome: Promise<helper.TaskOutcome<number>> = task.run(() => 42);
const Host = helper.createRetainedHost(() => () => core.h('span', {}, 'typed'));
core.h(Host, {active:true});
// @ts-expect-error active must remain boolean with require syntax
Host({active:'yes'});
export {owner, task, outcome, Host};
`
);
for (const [module, moduleResolution] of [
  ['ESNext', 'Bundler'],
  ['Node16', 'Node16'],
  ['NodeNext', 'NodeNext'],
]) {
  for (const core of ['base', 'concurrent']) {
    for (const format of moduleResolution === 'Bundler'
      ? ['esm']
      : ['esm', 'cjs']) {
      const config = join(
        consumer,
        `tsconfig-${core}-${moduleResolution}-${format}.json`
      );
      await writeFile(
        config,
        JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            lib: ['ES2022', 'DOM'],
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            types: [],
            module,
            moduleResolution,
            ...(core === 'concurrent'
              ? {
                  paths: {
                    lithent: [
                      join(
                        consumer,
                        `node_modules/lithent-concurrent/dist/types/lithentConcurrent/src/index.d.${format === 'esm' ? 'ts' : 'cts'}`
                      ),
                    ],
                  },
                }
              : {}),
          },
          // ESM and CJS are separate consumer programs, like verify-release.mjs.
          files:
            format === 'esm'
              ? ['types.mts']
              : ['types.cts', 'types.require.cts'],
        })
      );
      run(process.execPath, [
        join(repo, 'node_modules/typescript/bin/tsc'),
        '-p',
        config,
      ]);
      result.consumers.push({
        core,
        types: moduleResolution,
        format,
        result: 'PASS',
      });
    }
  }
}

const packedHelper = join(
  consumer,
  'node_modules/lithent/helper/dist/lithentHelper.mjs'
);
const fixtureBodies = {
  unused: `import * as helper from 'lithent/helper'; globalThis.value=42;`,
  state: `import {state} from 'lithent/helper'; globalThis.counter=state(0,()=>{globalThis.renewed=true;return true;});`,
  latest: `import {createLatestTask,createOwnerScope} from 'lithent/helper';globalThis.makeTask=()=>createLatestTask(createOwnerScope());`,
};
const bundle = async (entry, helper) => {
  const output = await build({
    configFile: false,
    root: consumer,
    logLevel: 'silent',
    resolve: { alias: [{ find: /^lithent\/helper$/, replacement: helper }] },
    build: {
      write: false,
      minify: true,
      target: 'esnext',
      rollupOptions: {
        input: entry,
        external: ['lithent'],
        output: { format: 'es' },
      },
    },
  });
  const chunks = output.output.filter(item => item.type === 'chunk');
  assert.equal(chunks.length, 1);
  return Buffer.from(chunks[0].code);
};
for (const [name, contents] of Object.entries(fixtureBodies)) {
  const entry = join(consumer, `${name}.js`);
  await writeFile(entry, contents);
  const current = await bundle(entry, packedHelper);
  if (name === 'unused')
    assert.doesNotMatch(
      current.toString(),
      /WeakMap|WeakSet|AbortController|createElement/
    );
  if (name === 'state')
    assert.doesNotMatch(
      current.toString(),
      /WeakMap|WeakSet|AbortController|createElement/
    );
  let comparison;
  if (values['baseline-helper'] && name !== 'latest') {
    const previous = await bundle(
      entry,
      join(resolve(values['baseline-helper']), 'lithentHelper.mjs')
    );
    assert.equal(
      normalizeBindings(current.toString()),
      normalizeBindings(previous.toString()),
      `Unused lifecycle changed ${name} bundle`
    );
    const before = sizes(previous);
    const after = sizes(current);
    comparison = {
      baseline: before,
      normalizedIdentical: true,
      byteIdentical: current.equals(previous),
      delta: Object.fromEntries(
        ['raw', 'gzip', 'brotli'].map(key => [key, after[key] - before[key]])
      ),
    };
  }
  result.treeShaking.push({
    fixture: name,
    ...sizes(current),
    ...comparison,
    core: 'external',
  });
}
result.baselineHelperComparison = values['baseline-helper']
  ? 'PASS'
  : 'NOT RUN: provide --baseline-helper for an old/new comparison';
if (values.output) {
  const output = resolve(values.output);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
}
console.log(
  `PASS lifecycle helper: unchanged core, packed ESM/CJS/UMD/SSR for both cores, strict declaration consumers, tree shaking. ${result.baselineHelperComparison}`
);
console.log(
  `Helper UMD Brotli: ${result.helper.find(item => item.path.endsWith('umd.js')).brotli} B; fixture workspace: ${work}`
);
