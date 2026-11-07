import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

// All builds and source experiments are isolated from src/, dist/ and the lockfile.
const root = fileURLToPath(new URL('../../', import.meta.url));
const [toolchain, destination = '/tmp/lithent-core-analysis/results'] =
  process.argv.slice(2);
if (!toolchain)
  throw Error(
    'Usage: node analyze.mjs <isolated-toolchain-directory> [output-directory]'
  );
const out = resolve(destination);
const localRequire = createRequire(resolve(root, 'package.json'));
const toolRequire = createRequire(resolve(toolchain, 'package.json'));
const { minify } = await import(pathToFileURL(localRequire.resolve('terser')));
const syntax = {
  defaults: false,
  booleans: true,
  lhs_constants: true,
  if_return: true,
  join_vars: true,
};
const legacyTarget = ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'];
mkdirSync(out, { recursive: true });
const source = resolve(out, 'variants/base/src');
cpSync(resolve(root, 'src'), source, { recursive: true });
const bytes = code => {
  const buffer = Buffer.from(code);
  return {
    raw: buffer.length,
    gzip: gzipSync(buffer, { level: 9 }).length,
    brotli: brotliCompressSync(buffer).length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  };
};
const results = {
  date: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim(),
  node: process.version,
  zlib: process.versions.zlib,
  compression: 'gzip level 9; Brotli Node defaults',
  sourceHashes: {},
  libraries: [],
  consumers: [],
  sourceExperiments: [],
};
const viteEntry = (require, name) =>
  resolve(
    dirname(require.resolve(name + '/package.json')),
    'dist/node/index.js'
  );
const versions = [
  ['current', viteEntry(localRequire, 'vite')],
  ...['vite5', 'vite6', 'vite7', 'vite8'].map(name => [
    name,
    viteEntry(toolRequire, name),
  ]),
];
const builders = Object.fromEntries(
  await Promise.all(
    versions.map(async ([name, entry]) => [
      name,
      await import(pathToFileURL(entry)),
    ])
  )
);
const compact = (terser = minify) => ({
  name: 'compact-umd-identifiers',
  renderChunk: {
    order: 'post',
    async handler(code, _chunk, output) {
      if (output.format !== 'umd') return null;
      const result = await terser(code, {
        compress: syntax,
        mangle: true,
        sourceMap: !!output.sourcemap,
      });
      return { code: result.code, map: result.map || null };
    },
  },
});
async function library(name, builder, src = source, options = {}) {
  const attribution = {};
  const config = {
    configFile: false,
    root,
    logLevel: 'warn',
    plugins: [compact(options.terser)],
    resolve: { alias: [{ find: '@', replacement: src }] },
    build: {
      write: false,
      sourcemap: options.sourcemap ?? true,
      target: options.target,
      ...(options.minify === undefined ? {} : { minify: options.minify }),
      lib: {
        entry: resolve(src, 'index.ts'),
        name: 'lithent',
        formats: ['es', 'umd', 'cjs'],
        fileName: format =>
          format === 'cjs'
            ? 'lithent.cjs'
            : format === 'umd'
              ? 'lithent.umd.js'
              : 'lithent.mjs',
      },
      rollupOptions: {
        output: { generatedCode: { symbols: false } },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
    },
  };
  if (Number(builder.version.split('.')[0]) >= 8) {
    config.build.rolldownOptions = config.build.rollupOptions;
    delete config.build.rolldownOptions.treeshake.tryCatchDeoptimization;
    delete config.build.rollupOptions;
  }
  if (options.unminified) config.plugins = [];
  const start = performance.now();
  const built = await builder.build(config);
  const dir = resolve(out, name);
  mkdirSync(dir, { recursive: true });
  const record = {
    name,
    vite: builder.version,
    target: options.target || 'version default',
    elapsedMs: Math.round(performance.now() - start),
    files: {},
  };
  for (const bundle of [].concat(built))
    for (const chunk of bundle.output) {
      if (chunk.type !== 'chunk') continue;
      writeFileSync(resolve(dir, chunk.fileName), chunk.code);
      if (chunk.map)
        writeFileSync(
          resolve(dir, chunk.fileName + '.map'),
          chunk.map.toString()
        );
      record.files[chunk.fileName] = bytes(chunk.code);
      if (chunk.fileName.endsWith('.mjs'))
        for (const [id, info] of Object.entries(chunk.modules)) {
          const relative = id.startsWith(src) ? id.slice(src.length + 1) : id;
          attribution[relative] = {
            renderedLength: info.renderedLength,
            originalLength: info.originalLength,
            renderedExports: info.renderedExports,
            removedExports: info.removedExports,
          };
          if (name === 'current' && id.startsWith(src))
            results.sourceHashes[relative] = createHash('sha256')
              .update(readFileSync(id))
              .digest('hex');
        }
    }
  record.modules = attribution;
  console.log(
    JSON.stringify({ name, vite: builder.version, files: record.files })
  );
  return record;
}
for (const [name] of versions)
  results.libraries.push(await library(name, builders[name]));
for (const name of ['vite7', 'vite8'])
  results.libraries.push(
    await library(name + '-legacy-target', builders[name], source, {
      target: legacyTarget,
    })
  );
results.libraries.push(
  await library('current-esnext', builders.current, source, {
    target: 'esnext',
  })
);
results.libraries.push(
  await library('current-hidden-map', builders.current, source, {
    sourcemap: 'hidden',
  })
);
const { minify: latestTerser } = await import(
  pathToFileURL(toolRequire.resolve('terser-latest'))
);
results.libraries.push(
  await library('current-latest-terser', builders.current, source, {
    terser: latestTerser,
  })
);
results.libraries.push(
  await library('current-unminified', builders.current, source, {
    minify: false,
    unminified: true,
  })
);

// Same application inputs for each toolchain. No HTML/modulepreload overhead;
// a JS entry keeps every byte attributable to the imported library and fixture.
const fixtures = {
  ref: 'import { ref } from "lithent"; globalThis.fixture = ref(0);',
  h: 'import { h } from "lithent"; globalThis.fixture = h("p", {}, "hello");',
  static:
    'import { h, render } from "lithent"; render(h("p", {}, "hello"), document.body);',
  counter:
    'import { h, mount, render } from "lithent"; const App = mount(renew => { let count = 0; return () => h("button", {onClick: () => {count++; renew();}}, count); }); render(h(App, {}), document.body);',
  all: 'import * as lithent from "lithent"; globalThis.fixture = lithent;',
};
async function consumer(name, builder, imported, fixture, extra = {}) {
  const entry = resolve(out, 'fixtures', fixture + '.js');
  mkdirSync(dirname(entry), { recursive: true });
  writeFileSync(entry, fixtures[fixture]);
  const built = await builder.build({
    configFile: false,
    root,
    logLevel: 'warn',
    resolve: {
      alias: [
        { find: 'lithent', replacement: imported },
        { find: '@', replacement: source },
      ],
    },
    build: {
      write: false,
      sourcemap: false,
      target: legacyTarget,
      minify: true,
      rollupOptions: {
        input: entry,
        output: { format: 'es', entryFileNames: 'app.js' },
      },
      ...extra,
    },
  });
  const chunks = []
    .concat(built)
    .flatMap(bundle => bundle.output)
    .filter(chunk => chunk.type === 'chunk');
  const code = chunks.map(chunk => chunk.code).join('\n');
  const directory = resolve(out, 'consumers', name + '-' + fixture);
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, 'app.js'), code);
  const record = {
    name,
    vite: builder.version,
    fixture,
    imported,
    ...bytes(code),
  };
  results.consumers.push(record);
  console.log(JSON.stringify(record));
}
for (const [name] of versions)
  for (const fixture of Object.keys(fixtures)) {
    await consumer(
      name,
      builders[name],
      resolve(out, name, 'lithent.mjs'),
      fixture
    );
  }
for (const fixture of ['h', 'static', 'counter', 'all']) {
  await consumer(
    'current-direct-source',
    builders.current,
    resolve(source, 'index.ts'),
    fixture
  );
  await consumer(
    'current-build-vite8-esm',
    builders.current,
    resolve(out, 'vite8', 'lithent.mjs'),
    fixture
  );
}

const edits = {
  ownSymbol: {
    file: 'utils/index.ts',
    from: '!Object.getOwnPropertySymbols(obj).includes(wdomSymbol)',
    to: '!Object.prototype.hasOwnProperty.call(obj, wdomSymbol)',
  },
  iterativeAncestor: {
    file: 'wDom.ts',
    from: /  const walk = \(node: WDom \| undefined, visited: Set<WDom>\): void => \{[\s\S]*?  walk\(parent, new Set<WDom>\(\)\);/,
    to: '  const visited = new Set<WDom>();\n  while (parent && !visited.has(parent)) {\n    visited.add(parent);\n    if (parent.compChild) {\n      const index = parent.compChild.indexOf(prevChild);\n      if (index !== -1) parent.compChild.splice(index, 1, nextChild);\n    }\n    parent = parent.getParent ? parent.getParent() : undefined;\n  }',
  },
  optionalKey: {
    file: 'utils/predicator.ts',
    from: /  \(target && target.compProps && target.compProps.key\) \?\?\n  \(target && target.props && target.props.key\)/,
    to: '  target && (target.compProps?.key ?? target.props?.key)',
  },
};
for (const selection of [
  ['ownSymbol'],
  ['iterativeAncestor'],
  ['optionalKey'],
  Object.keys(edits),
]) {
  const name = 'source-' + selection.join('-');
  const src = resolve(out, 'variants', name, 'src');
  cpSync(source, src, { recursive: true });
  for (const key of selection) {
    const { file, from, to } = edits[key];
    const before = readFileSync(resolve(src, file), 'utf8');
    const after = before.replace(from, to);
    if (before === after) throw Error('Source pattern not found: ' + key);
    writeFileSync(resolve(src, file), after);
  }
  results.sourceExperiments.push(await library(name, builders.current, src));
}
const base = readFileSync(resolve(out, 'current', 'lithent.umd.js'), 'utf8');
const { minify: terser } = await import(
  pathToFileURL(localRequire.resolve('terser'))
);
results.postprocess = [];
for (const [name, options] of Object.entries({
  'terser-default': { compress: true, mangle: true },
  'terser-no-inline': {
    compress: {
      inline: false,
      reduce_funcs: false,
      collapse_vars: false,
      reduce_vars: false,
    },
    mangle: true,
  },
})) {
  const result = await terser(base, {
    ...options,
    sourceMap: {
      content: readFileSync(
        resolve(out, 'current', 'lithent.umd.js.map'),
        'utf8'
      ),
      url: 'lithent.umd.js.map',
    },
  });
  const code = result.code + '\n';
  writeFileSync(resolve(out, name + '.js'), code);
  writeFileSync(resolve(out, name + '.js.map'), result.map);
  results.postprocess.push({ name, ...bytes(code) });
}
writeFileSync(
  resolve(out, 'results.json'),
  JSON.stringify(results, null, 2) + '\n'
);
console.log('Results: ' + resolve(out, 'results.json'));
