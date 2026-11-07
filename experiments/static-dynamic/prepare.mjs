import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { build } from 'vite';
import { overlay } from './overlay.mjs';
const out = path.resolve(process.argv[2]),
  root = process.cwd();
assert(!fs.existsSync(out), 'Use a fresh output directory');
fs.mkdirSync(out);
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const hash = b => createHash('sha256').update(b).digest('hex');
const write = (f, v) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n', { flag: 'wx' });
};
const source = path.join(out, 'source');
fs.mkdirSync(source);
const stock = path.join(source, 'stock'),
  patched = path.join(source, 'overlay');
const files = overlay(patched);
for (const file of Object.keys(files)) {
  const dest = path.join(stock, file.slice(4));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
}
for (const name of [
  'block.ts',
  'metrics.ts',
  'overlay.mjs',
  'prepare.mjs',
  'check.mjs',
  'fixture.ts',
]) {
  const file = 'experiments/static-dynamic/' + name;
  files[file] = hash(fs.readFileSync(file));
  fs.copyFileSync(file, path.join(source, name));
}
for (const name of ['package.json', 'pnpm-lock.yaml'])
  fs.copyFileSync(name, path.join(source, name));
const prior = '/private/tmp/lithent-c4-owner-20261029-v2';
const previous = read(path.join(prior, 'initial.json'));
const original = fs.readFileSync(
  path.join(prior, 'source/original.tsx'),
  'utf8'
);
assert.equal(hash(original), previous.sourceOriginal);
const cache = fs.readFileSync(
  path.join(prior, 'source/cacheUpdate.ts'),
  'utf8'
);
assert.equal(hash(cache), previous.cache);
const schema = `const rowBlock = defineBlock({tag:'tr', attrs:{class:{slot:2}}, children:[
 {tag:'td',attrs:{class:'col-md-1'},children:[{slot:0}]},
 {tag:'td',attrs:{class:'col-md-4'},children:[{tag:'a',attrs:{onClick:{slot:3}},children:[{slot:1}]}]},
 {tag:'td',attrs:{class:'col-md-1'},children:[{tag:'a',attrs:{onClick:{slot:4}},children:[{tag:'span',attrs:{class:'glyphicon glyphicon-remove','aria-hidden':'true'}}]}]},
 {tag:'td',attrs:{class:'col-md-6'}}
]});\n`;
assert.equal(original.split('      () => (\n        <tr').length, 2);
const start = original.indexOf('      () => (\n        <tr'),
  end = original.indexOf('\n      ),', start) + '\n      ),'.length;
let candidate =
  original.slice(0, start) +
  `      () => rowBlock([id, row.label, store.state.selected === id ? "danger" : undefined, onSelect, onRemove], id),` +
  original.slice(end);
candidate =
  `import { defineBlock } from '@block';\n` +
  candidate.replace(
    '// Only the table needs',
    schema + '\n// Only the table needs'
  );
fs.writeFileSync(path.join(source, 'original.tsx'), original);
fs.writeFileSync(path.join(source, 'candidate.tsx'), candidate);
fs.writeFileSync(path.join(source, 'cacheUpdate.ts'), cache);
fs.copyFileSync(
  'experiments/static-dynamic/fixture.ts',
  path.join(source, 'fixture.ts')
);
const diagnostic = `\nimport { metrics,resetMetrics } from '@metrics';\nimport { nativeContracts } from '@fixture';\nObject.assign(window,{__sd:{metrics,resetMetrics,nativeContracts}});\n`;
fs.writeFileSync(path.join(source, 'diagnostic.tsx'), candidate + diagnostic);
const oldRunner = read(
  '/private/tmp/lithent-c4-key-snapshot-20261030-v2/runner-inputs.json'
);
const bench = path.join(out, 'official-benchmark');
const frozen = {};
for (const [file, digest] of Object.entries(oldRunner.frozen)) {
  const bytes = fs.readFileSync(path.join(oldRunner.bench, file));
  assert.equal(hash(bytes), digest, file);
  const dest = path.join(bench, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, bytes);
  frozen[file] = digest;
}
fs.symlinkSync(
  oldRunner.installed,
  path.join(bench, 'webdriver-ts/node_modules')
);
write(path.join(out, 'runner-inputs.json'), {
  bench,
  frozen,
  installed: oldRunner.installed,
  packages: oldRunner.packages,
});
const binary = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const framework = fs.realpathSync(
  path.join(
    path.dirname(binary),
    '../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
  )
);
const browser = {
  binary,
  files: Object.fromEntries(
    [binary, framework].map(f => [f, hash(fs.readFileSync(f))])
  ),
};
const versions = {
  node: process.version,
  vite: '5.4.8',
  sourceCore:
    '1.25.3 / ' +
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  comparison:
    'stock A / overlay A control / overlay explicit static-dynamic row; no C4 or peer',
};
const manifests = {};
for (const [name, entry, core, diag] of [
  ['stock', 'original.tsx', stock, false],
  ['control', 'original.tsx', patched, false],
  ['candidate', 'candidate.tsx', patched, false],
  ['diagnostic', 'diagnostic.tsx', patched, true],
]) {
  const dest = path.join(out, 'apps', name);
  await build({
    configFile: false,
    root: source,
    logLevel: 'warn',
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: path.join(source, 'cacheUpdate.ts'),
        },
        { find: /^lithent$/, replacement: path.join(core, 'index.ts') },
        { find: '@block', replacement: path.join(patched, 'block.ts') },
        { find: '@metrics', replacement: path.join(patched, 'metrics.ts') },
        { find: '@fixture', replacement: path.join(source, 'fixture.ts') },
        { find: '@', replacement: core },
      ],
    },
    define: { __STATIC_DIAGNOSTIC__: String(diag) },
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    build: {
      outDir: dest,
      emptyOutDir: false,
      sourcemap: true,
      rollupOptions: {
        input: path.join(source, entry),
        output: { entryFileNames: 'main.js' },
      },
    },
  });
  fs.copyFileSync(
    path.join(prior, 'apps/baseline/index.html'),
    path.join(dest, 'index.html')
  );
  const bytes = fs.readFileSync(path.join(dest, 'main.js'));
  manifests[name] = {
    entryJS: 'main.js',
    bundle: hash(bytes),
    html: hash(fs.readFileSync(path.join(dest, 'index.html'))),
    raw: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
    brotli: brotliCompressSync(bytes).length,
  };
}
write(path.join(out, 'build-manifest.json'), manifests);
write(path.join(out, 'versions.json'), versions);
for (const order of ['main', 'reverse'])
  for (const [file, data] of [
    ['build-manifest.json', manifests],
    ['versions.json', versions],
  ])
    write(path.join(out, 'official-' + order, file), data);
const require = createRequire(import.meta.url),
  packages = {};
for (const name of ['vite', 'typescript', 'jsdom', '@playwright/test']) {
  const file = require.resolve(name + '/package.json');
  packages[name] = {
    file,
    version: read(file).version,
    sha256: hash(fs.readFileSync(file)),
  };
}
write(path.join(out, 'tool-inputs.json'), packages);
write(path.join(out, 'initial.json'), {
  at: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  files,
  browser,
  sourceOriginal: hash(original),
  sourceCandidate: hash(candidate),
  cache: hash(cache),
  machine: { cpus: os.cpus(), memory: os.totalmem(), os: os.release() },
  plan: {
    cpu: 870,
    memory: 90,
    names: ['stock', 'control', 'candidate'],
    scope:
      'manual metadata proof; creation strategy included; no compiler automation or production adoption',
  },
});
write(path.join(out, 'tsconfig.json'), {
  compilerOptions: {
    target: 'ESNext',
    module: 'ESNext',
    moduleResolution: 'node',
    lib: ['DOM', 'DOM.Iterable', 'ESNext'],
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    esModuleInterop: true,
    jsx: 'preserve',
    jsxFactory: 'h',
    baseUrl: source,
    types: [],
    paths: {
      '@/*': ['overlay/*'],
      '@block': ['overlay/block.ts'],
      '@metrics': ['overlay/metrics.ts'],
      '@fixture': ['fixture.ts'],
      lithent: ['overlay/index.ts'],
      'lithent/helper': ['cacheUpdate.ts'],
    },
  },
  include: [source + '/overlay/**/*.ts', source + '/*.ts', source + '/*.tsx'],
  exclude: [source + '/overlay/tests/**'],
});
write(path.join(out, 'tsconfig-stock.json'), {
  compilerOptions: {
    target: 'ESNext',
    module: 'ESNext',
    moduleResolution: 'node',
    lib: ['DOM', 'DOM.Iterable', 'ESNext'],
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    esModuleInterop: true,
    jsx: 'preserve',
    jsxFactory: 'h',
    baseUrl: source,
    types: [],
    paths: {
      '@/*': ['stock/*'],
      lithent: ['stock/index.ts'],
      'lithent/helper': ['cacheUpdate.ts'],
    },
  },
  include: [
    source + '/stock/**/*.ts',
    source + '/original.tsx',
    source + '/cacheUpdate.ts',
  ],
});
console.log(JSON.stringify({ out, manifests }, null, 2));
fs.cpSync('src/tests', path.join(patched, 'tests'), { recursive: true });
fs.symlinkSync(path.join(root, 'node_modules'), path.join(out, 'node_modules'));
fs.writeFileSync(
  path.join(out, 'vitest.config.mjs'),
  `import {defineConfig} from 'vite';\nexport default defineConfig({root:${JSON.stringify(patched)},resolve:{alias:{'@':${JSON.stringify(patched)}}},define:{__STATIC_DIAGNOSTIC__:'false'},esbuild:{jsxFactory:'h',jsxFragment:'Fragment'},test:{environment:'jsdom',include:['tests/core-*.test.{ts,tsx}'],pool:'forks',maxWorkers:2,minWorkers:1}});\n`
);
export { out };
