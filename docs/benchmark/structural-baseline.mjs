// Phase 1 operation counts. These builds never produce official timing scores.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
  cpSync,
} from 'node:fs';
import { resolve, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { loadavg, cpus, platform, arch, release } from 'node:os';
import { build } from 'vite';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const bench = resolve(
  process.env.LITHENT_BENCHMARK_ROOT || '../js-framework-benchmark-upstream'
);
const out = resolve(
  process.env.LITHENT_PHASE1_OUT || '/tmp/lithent-structural-baseline-20261021'
);
const chrome =
  process.env.LITHENT_CHROME_BINARY ||
  '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome';
const engine = resolve(
  dirname(chrome),
  '../Frameworks/Google Chrome Framework.framework/Versions/155.0.8059.85/Google Chrome Framework'
);
const npm = bench + '/frameworks/keyed/lithent/node_modules/lithent';
const mode = process.argv[2] || 'prepare';
const hash = data => createHash('sha256').update(data).digest('hex');
const sha = path => hash(readFileSync(path));
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const save = (path, data) =>
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
const git = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const filesIn = path =>
  readdirSync(path).flatMap(name => {
    const p = resolve(path, name);
    return statSync(p).isDirectory() ? filesIn(p) : [p];
  });
mkdirSync(out, { recursive: true });

const runtime = `
function __hit(key: string, amount = 1) {
  const c = (globalThis as any).__counts;
  if (c) c[key] = (c[key] || 0) + amount;
}
function __search(items: any[], target: any, key: string) {
  const index = items.indexOf(target);
  __hit(key + 'Calls');
  __hit(key + 'ArrayLengths', items.length);
  __hit(key + 'EstimatedVisits', index < 0 ? items.length : index + 1);
  __hit(key + (index < 0 ? 'Misses' : 'Hits'));
  return index;
}
// Shadow validation only: does not bypass or mutate the real diff/render path.
function __sameOrder(previous: any[], next: any[], getKey: any) {
  __hit('proofCalls');
  if (previous.length !== next.length) { __hit('proofLengthMismatch'); return; }
  const seen = new Set();
  for (let i = 0; i < next.length; i++) {
    __hit('proofPairVisits');
    __hit('proofKeyReads', 2);
    const a = getKey(previous[i]), b = getKey(next[i]);
    // A deliberately conservative unique-key-only entry condition, not a
    // proposed change to the duplicate/mixed-key fallback contract.
    if (a == null || b == null || !(a === b || (a !== a && b !== b))) {
      __hit('proofKeyMismatch'); return;
    }
    __hit('proofSetHas');
    if (seen.has(b)) { __hit('proofDuplicate'); return; }
    seen.add(b); __hit('proofSetAdd');
  }
  __hit('proofPasses');
}
`;

function replaceOne(code, search, replacement) {
  if (code.split(search).length !== 2)
    throw Error('Instrumentation anchor must occur once: ' + search);
  return code.replace(search, replacement);
}

function hitFunction(code, name, extra = '') {
  const start = code.indexOf('const ' + name + ' =');
  const pos = code.indexOf('=> {', start);
  if (start < 0 || pos < 0) throw Error('Missing function body: ' + name);
  return (
    code.slice(0, pos + 4) +
    `\n__hit('${name}');\n${extra}` +
    code.slice(pos + 4)
  );
}

function instrument(code, id) {
  if (id === root + '/src/wDom.ts') {
    code = hitFunction(code, 'h');
    code = hitFunction(code, 'replaceWDom');
    code = replaceOne(
      code,
      'brothers.indexOf(originalWDom)',
      "__search(brothers, originalWDom, 'parentSearch')"
    );
    code = replaceOne(
      code,
      'node.compChild.indexOf(prevChild)',
      "__search(node.compChild, prevChild, 'slotSearch')"
    );
    code = replaceOne(
      code,
      'visited.add(node);',
      "visited.add(node); __hit('ancestorNodes');"
    );
  } else if (id === root + '/src/diff.ts') {
    code = hitFunction(
      code,
      'makeNewWDomTree',
      "if(newWDom === originalWDom) __hit('sameIdentity');\nif((newWDom as WDom).tag === 'tr') __hit('rowDiff');\n"
    );
    code = hitFunction(code, 'runUpdate');
    code = hitFunction(
      code,
      'diffLoopChildren',
      "__hit('keyedOldEntries', (originalWDom.children || []).length);\n__hit('keyedNewEntries', (newWDom.children || []).length);\n__sameOrder(originalWDom.children || [], newWDom.children || [], getKey);\n"
    );
    code = replaceOne(
      code,
      'origChildren.forEach((item, index) => {',
      "origChildren.forEach((item, index) => { __hit('keyMapBuildVisits');"
    );
    code = replaceOne(
      code,
      'keyMap.set(key, index);',
      "__hit('keyMapSet'); keyMap.set(key, index);"
    );
    code = replaceOne(
      code,
      '!keyMap.has(key)',
      "(__hit('keyMapHas'), !keyMap.has(key))"
    );
    code = replaceOne(
      code,
      '? keyMap.get(key)',
      "? (__hit('keyMapGet'), keyMap.get(key))"
    );
    code = replaceOne(
      code,
      'keyMap.delete(key);',
      "__hit('keyMapDelete'); keyMap.delete(key);"
    );
    code = replaceOne(
      code,
      'used[origIndex] = true;',
      "__hit('usedWrites'); used[origIndex] = true;"
    );
    code = replaceOne(
      code,
      'origChildren.filter((_item, index) => !used[index])',
      "origChildren.filter((_item, index) => (__hit('unusedFilterVisits'), !used[index]))"
    );
  } else if (id === root + '/src/render.ts') {
    for (const name of [
      'wDomUpdate',
      'updateChildren',
      'getLisPositions',
      'clearDiffMeta',
      'updateText',
    ])
      code = hitFunction(code, name);
    code = replaceOne(
      code,
      'const matchedIndexes: number[] = [];',
      "__hit('plannedKeyedChildren', children.length);\nconst matchedIndexes: number[] = [];"
    );
    code = replaceOne(
      code,
      "item => 'ATS'.includes(item.nr as string) || item.oi !== undefined",
      "item => (__hit('renderEntryVisits'), 'ATS'.includes(item.nr as string) || item.oi !== undefined)"
    );
    code = replaceOne(
      code,
      'const oi = item.oi;',
      "__hit('orderPlanVisits'); const oi = item.oi;"
    );
    code = replaceOne(
      code,
      'const nr = item.nr;\n\n      if',
      "__hit('contentVisits'); const nr = item.nr;\n\n      if"
    );
    code = replaceOne(
      code,
      'for (let i = tail - 1; i >= 0; i--) {',
      "for (let i = tail - 1; i >= 0; i--) { __hit('placementVisits');"
    );
  } else if (id === npm + '/helper/src/hook/cacheUpdate.ts') {
    code = replaceOne(
      code,
      'const newDefs = checkFunction();',
      "__hit('cacheChecks'); const newDefs = checkFunction(); __hit('depsEntries', newDefs.length);"
    );
    code = replaceOne(
      code,
      '(def, index) => def === newDefs[index]',
      "(def, index) => (__hit('depsComparisons'), def === newDefs[index])"
    );
    code = replaceOne(
      code,
      'return originalUpdater;',
      "__hit('cacheHits'); return originalUpdater;"
    );
    code = replaceOne(
      code,
      'const newUpdater = updater(props);',
      "__hit('cacheMisses'); const newUpdater = updater(props);"
    );
  } else return;
  return runtime + code;
}

const nestedSource = `
import { h, mount, render } from 'lithent';
const n = Number(new URLSearchParams(location.search).get('n') || 1000);
const fields = Array.from({length: n}, (_, id) => ({id, value: '', renew: () => {}}));
const Field = mount((renew, props) => {
  const field = props.field;
  field.renew = renew;
  return () => <label data-id={field.id}><input value={field.value}/><span>{field.value}</span></label>;
});
const Shell = mount((_renew, _props, children) => () => <section>{children}</section>);
render(h(Shell, {}, h(Shell, {}, ...fields.map(field => h(Field, {key: field.id, field})))), document.getElementById('main'));
(globalThis as any).__phase1 = { fields, update(indices) {
  for (const i of indices) { fields[i].value += 'x'; fields[i].renew(); }
}};
`;

if (mode === 'prepare') {
  if (existsSync(out + '/counts-original/main.js'))
    throw Error('Use a fresh output directory; existing evidence is preserved');
  const archive = root + '/docs/benchmark/select-partial-evidence.json.gz';
  const entry = JSON.parse(gunzipSync(readFileSync(archive))).files[
    'official-main.tsx'
  ];
  if (hash(entry.content) !== entry.sha256)
    throw Error('Bad archived app hash');
  writeFileSync(out + '/original-main.tsx', entry.content);
  const sourceHashes = {};
  const snapshot = out + '/snapshot';
  const snapshotPaths = [
    ...filesIn(root + '/src').filter(p => !p.includes('/tests/')),
    ...filesIn(root + '/lithentConcurrent/src').filter(
      p => !p.includes('/tests/')
    ),
    ...['lithent.mjs', 'lithent.umd.js', 'lithent.cjs'].map(
      n => root + '/dist/' + n
    ),
    ...['lithentConcurrent.mjs', 'lithentConcurrent.umd.js'].map(
      n => root + '/lithentConcurrent/dist/' + n
    ),
    root + '/element/dist/lithentElement.umd.js',
    npm + '/helper/src/hook/cacheUpdate.ts',
  ];
  for (const p of snapshotPaths) {
    const rel = p.startsWith(root + '/')
      ? relative(root, p)
      : 'npm/cacheUpdate.ts';
    mkdirSync(dirname(snapshot + '/' + rel), { recursive: true });
    cpSync(p, snapshot + '/' + rel);
    sourceHashes[rel] = sha(p);
  }
  for (const [source, destination] of [
    [root + '/pnpm-lock.yaml', 'lithent/pnpm-lock.yaml'],
    [root + '/package.json', 'lithent/package.json'],
    [
      bench + '/frameworks/keyed/lithent/package-lock.json',
      'app/package-lock.json',
    ],
    [bench + '/frameworks/keyed/lithent/vite.config.js', 'app/vite.config.js'],
    [bench + '/webdriver-ts/package-lock.json', 'runner/package-lock.json'],
  ]) {
    mkdirSync(dirname(out + '/configuration/' + destination), {
      recursive: true,
    });
    cpSync(source, out + '/configuration/' + destination);
  }
  const baseEquality = Object.fromEntries(
    snapshotPaths
      .filter(
        p => p.startsWith(root + '/src/') || p.startsWith(root + '/dist/')
      )
      .map(p => {
        const rel = relative(root, p);
        return [rel, { local: sha(p), npm: sha(npm + '/' + rel) }];
      })
  );
  if (Object.values(baseEquality).some(x => x.local !== x.npm))
    throw Error('Baseline differs from npm 1.25.2');
  const runnerFiles = [
    'src/benchmarksPuppeteer.ts',
    'src/benchmarksCommon.ts',
    'src/forkedBenchmarkRunnerPuppeteer.ts',
    'src/common.ts',
    'dist/benchmarksPuppeteer.js',
    'dist/benchmarksCommon.js',
    'dist/forkedBenchmarkRunnerPuppeteer.js',
    'dist/common.js',
  ];
  for (const rel of runnerFiles) {
    mkdirSync(dirname(out + '/runner/' + rel), { recursive: true });
    cpSync(bench + '/webdriver-ts/' + rel, out + '/runner/' + rel);
  }
  const { cpuBenchmarkInfos, slowDownFactor } = await import(
    bench + '/webdriver-ts/dist/benchmarksCommon.js'
  );
  const metadata = {
    startedAt: new Date().toISOString(),
    head: git(root, 'rev-parse', 'HEAD'),
    benchmarkHead: git(bench, 'rev-parse', 'HEAD'),
    benchmarkStatus: git(bench, 'status', '--porcelain'),
    upstreamAppHash: sha(bench + '/frameworks/keyed/lithent/src/main.tsx'),
    original: {
      archive: relative(root, archive),
      entry: 'official-main.tsx',
      sha256: entry.sha256,
    },
    sourceHashes,
    baseEquality,
    versions: {
      node: process.version,
      vite: json(root + '/node_modules/vite/package.json').version,
      playwright: json(root + '/node_modules/@playwright/test/package.json')
        .version,
      base: json(npm + '/package.json').version,
      concurrent: json(root + '/lithentConcurrent/package.json').version,
    },
    machine: {
      platform: platform(),
      arch: arch(),
      release: release(),
      cpu: cpus()[0].model,
      load: loadavg(),
    },
    chrome: {
      path: chrome,
      sha256: sha(chrome),
      engine,
      engineSha256: sha(engine),
    },
    runner: {
      hashes: Object.fromEntries(
        runnerFiles.map(p => [p, sha(out + '/runner/' + p)])
      ),
      cpu: Object.values(cpuBenchmarkInfos).map(info => ({
        ...info,
        slowdown: slowDownFactor(info.id, true),
      })),
      observed: {
        updateRows: 1000,
        clearRows: 1000,
        selectWarmupClicks: 1,
        gc: "window.gc({type:'major',execution:'sync',flavor:'last-resort'}) after init; throttle enabled only for measured action",
      },
    },
    semantics: {
      countBuild:
        'Instrumented source, including separate shadow unique-key/order proof; never official timing',
      estimatedSearchVisits:
        'Dense WDom arrays: native indexOf result + 1, or length on miss. Logical comparison budget, not engine loads or elapsed time.',
      synthetic:
        '10k update, configurable k, parent-refresh, and nested inputs are diagnostic scenarios',
    },
  };
  save(out + '/manifest.json', metadata);
  const sources = {
    original: entry.content,
    targeted: readFileSync(root + '/docs/benchmark/targeted-main.tsx', 'utf8'),
    nested: nestedSource,
  };
  const bundles = {};
  for (const [name, source] of Object.entries(sources)) {
    const stage = out + '/sources/' + name;
    mkdirSync(stage, { recursive: true });
    writeFileSync(
      stage + '/app.tsx',
      source +
        (name === 'nested'
          ? ''
          : '\n(globalThis as any).__phase1 = {store, renewTable};\n')
    );
    const dist = out + '/counts-' + name;
    await build({
      configFile: false,
      root: stage,
      logLevel: 'error',
      plugins: [
        {
          name: 'phase1-operation-counts',
          enforce: 'pre',
          transform: instrument,
        },
      ],
      resolve: {
        alias: [
          {
            find: /^lithent\/helper$/,
            replacement: npm + '/helper/src/hook/cacheUpdate.ts',
          },
          { find: /^lithent$/, replacement: root + '/src/index.ts' },
          { find: /^@\//, replacement: root + '/src/' },
        ],
      },
      esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
      build: {
        outDir: dist,
        minify: false,
        sourcemap: true,
        target: 'esnext',
        lib: {
          entry: stage + '/app.tsx',
          formats: ['es'],
          fileName: () => 'main.js',
        },
      },
    });
    writeFileSync(
      dist + '/index.html',
      '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/css/currentStyle.css"><div id="main"></div><script type="module" src="main.js"></script>'
    );
    bundles[name] = {
      source: hash(source),
      diagnosticSource: sha(stage + '/app.tsx'),
      bundle: sha(dist + '/main.js'),
    };
  }
  save(out + '/diagnostic-builds.json', bundles);
  console.log('Prepared Phase 1 diagnostic builds:', Object.keys(bundles));
} else if (mode === 'measure') {
  if (existsSync(out + '/counts.json')) throw Error('Counts already exist');
  const manifest = json(out + '/manifest.json');
  if (
    sha(chrome) !== manifest.chrome.sha256 ||
    sha(engine) !== manifest.chrome.engineSha256
  )
    throw Error('Browser changed before run');
  const server = createServer((req, res) => {
    try {
      const parts = new URL(req.url, 'http://localhost').pathname
        .split('/')
        .filter(Boolean);
      const base = parts[0] === 'css' ? bench + '/css' : out + '/' + parts[0];
      const path = resolve(base, parts.slice(1).join('/') || 'index.html');
      if (!path.startsWith(base + '/')) throw Error('Outside stage');
      res.setHeader(
        'content-type',
        {
          '.js': 'text/javascript',
          '.html': 'text/html',
          '.css': 'text/css',
          '.woff2': 'font/woff2',
        }[extname(path)] || 'application/octet-stream'
      );
      res.end(readFileSync(path));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  const results = {
    startedAt: new Date().toISOString(),
    load: loadavg(),
    samples: [],
  };
  try {
    browser = await chromium.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox'],
    });
    results.browserVersion = browser.version();
    for (const name of ['original', 'targeted', 'nested']) {
      for (const n of [1000, 10000]) {
        const context = await browser.newContext();
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        await page.goto(
          `http://127.0.0.1:${server.address().port}/counts-${name}/index.html?n=${n}`
        );
        if (name !== 'nested') {
          await page.locator(n === 1000 ? '#run' : '#runlots').click();
          await page.waitForFunction(
            n => document.querySelectorAll('tbody > tr').length === n,
            n
          );
        }
        const scenarios =
          name === 'nested'
            ? ['first', 'last', 'partial-1', 'partial-10', 'partial-' + n / 10]
            : [
                'first',
                'move',
                'last',
                'partial-1',
                'partial-10',
                'partial-' + n / 10,
                'parent-refresh',
              ];
        for (const scenario of scenarios) {
          const sample = await page.evaluate(
            async ({ name, n, scenario }) => {
              const api = globalThis.__phase1;
              const selector = name === 'nested' ? 'label' : 'tbody > tr';
              const before = Array.from(document.querySelectorAll(selector));
              const readLabel = row =>
                name === 'nested'
                  ? row.querySelector('span').textContent
                  : row.children[1].textContent;
              const labels = before.map(readLabel);
              const inputs = before.map(row => row.querySelector('input'));
              const mutations = {
                attributes: 0,
                class: 0,
                characterData: 0,
                childList: 0,
                added: 0,
                removed: 0,
              };
              const observer = new MutationObserver(records => {
                for (const record of records) {
                  mutations[record.type]++;
                  if (
                    record.type === 'attributes' &&
                    record.attributeName === 'class'
                  )
                    mutations.class++;
                  if (record.type === 'childList') {
                    mutations.added += record.addedNodes.length;
                    mutations.removed += record.removedNodes.length;
                  }
                }
              });
              observer.observe(document.getElementById('main'), {
                subtree: true,
                attributes: true,
                characterData: true,
                childList: true,
              });
              globalThis.__counts = {};
              let expectedChanged = 0;
              let selectedIndex = null;
              if (scenario.startsWith('partial-')) {
                expectedChanged = Number(scenario.split('-')[1]);
                const indices = Array.from(
                  { length: expectedChanged },
                  (_, i) => Math.floor((i * n) / expectedChanged)
                );
                if (name === 'nested') api.update(indices);
                else {
                  for (const i of indices) {
                    const row = api.store.state.rows[i];
                    row.label += ' !!!';
                    if (name === 'targeted') row.renew();
                  }
                  if (name === 'original') api.renewTable();
                }
              } else if (name === 'nested') {
                expectedChanged = 1;
                api.update([scenario === 'first' ? 0 : n - 1]);
              } else if (scenario === 'parent-refresh') api.renewTable();
              else {
                selectedIndex =
                  scenario === 'first' ? 0 : scenario === 'move' ? 1 : n - 1;
                before[selectedIndex].children[1].firstElementChild.click();
              }
              // Queue updates are microtasks. A frame also flushes MutationObserver.
              await new Promise(requestAnimationFrame);
              await new Promise(requestAnimationFrame);
              observer.disconnect();
              const counts = globalThis.__counts;
              globalThis.__counts = null;
              const after = Array.from(document.querySelectorAll(selector));
              const identity =
                before.length === n &&
                after.length === n &&
                before.every((node, i) => node === after[i]);
              const actualChanged = after.reduce(
                (sum, row, i) => sum + Number(labels[i] !== readLabel(row)),
                0
              );
              const inputState =
                name !== 'nested' ||
                after.every((row, i) => {
                  const input = row.querySelector('input');
                  return input === inputs[i] && input.value === readLabel(row);
                });
              const selected =
                name === 'nested'
                  ? null
                  : Array.from(
                      document.querySelectorAll('tbody > tr.danger')
                    ).map(row => after.indexOf(row));
              const valid =
                identity &&
                inputState &&
                mutations.added === 0 &&
                mutations.removed === 0 &&
                actualChanged === expectedChanged &&
                (selectedIndex === null ||
                  (selected.length === 1 && selected[0] === selectedIndex));
              return {
                name,
                n,
                scenario,
                expectedChanged,
                actualChanged,
                selected,
                identity,
                inputState,
                mutations,
                counts,
                valid,
              };
            },
            { name, n, scenario }
          );
          results.samples.push(sample);
          save(out + '/counts.partial.json', results);
          if (!sample.valid || errors.length)
            throw Error(JSON.stringify({ sample, errors }));
          console.log(
            'Counted',
            name,
            n,
            scenario,
            'diff',
            sample.counts.makeNewWDomTree || 0,
            'parent visits',
            sample.counts.parentSearchEstimatedVisits || 0,
            'slot visits',
            sample.counts.slotSearchEstimatedVisits || 0
          );
        }
        await context.close();
      }
    }
    if (
      sha(chrome) !== manifest.chrome.sha256 ||
      sha(engine) !== manifest.chrome.engineSha256
    )
      throw Error('Browser changed during run');
    if (
      sha(bench + '/frameworks/keyed/lithent/src/main.tsx') !==
      manifest.upstreamAppHash
    )
      throw Error('Upstream experiment changed during run');
    results.finishedAt = new Date().toISOString();
    results.finalLoad = loadavg();
    save(out + '/counts.json', results);
  } finally {
    await browser?.close();
    await new Promise(r => server.close(r));
  }
} else if (mode === 'check') {
  const manifest = json(out + '/manifest.json');
  const counts = json(out + '/counts.json');
  const builds = json(out + '/production/build-manifest.json');
  const verification = json(out + '/production/production-verify.json');
  const contracts = json(out + '/production/contracts.json');
  const assert = (value, message) => {
    if (!value) throw Error(message);
  };
  assert(counts.samples.length === 38, 'Incomplete diagnostic matrix');
  assert(
    new Set(counts.samples.map(x => [x.name, x.n, x.scenario].join('/')))
      .size === 38,
    'Duplicate diagnostic scenarios'
  );
  assert(
    counts.samples.every(
      x =>
        x.valid &&
        x.identity &&
        x.inputState &&
        x.actualChanged === x.expectedChanged
    ),
    'Diagnostic assertion failed'
  );
  for (const [rel, expected] of Object.entries(manifest.sourceHashes)) {
    const source =
      rel === 'npm/cacheUpdate.ts'
        ? npm + '/helper/src/hook/cacheUpdate.ts'
        : root + '/' + rel;
    assert(
      sha(source) === expected && sha(out + '/snapshot/' + rel) === expected,
      'Runtime changed: ' + rel
    );
  }
  assert(
    sha(chrome) === manifest.chrome.sha256 &&
      sha(engine) === manifest.chrome.engineSha256,
    'Browser changed'
  );
  assert(
    sha(bench + '/frameworks/keyed/lithent/src/main.tsx') ===
      manifest.upstreamAppHash,
    'Sibling app changed'
  );
  assert(
    git(bench, 'status', '--porcelain') === manifest.benchmarkStatus,
    'Sibling status changed'
  );
  assert(
    verification.complete && verification.samples.length === 2,
    'Incomplete official verification'
  );
  assert(
    verification.samples.every(x => x.scenarios === 9 && x.fontLoaded),
    'App/font verification failed'
  );
  assert(
    contracts.samples.length === 2 &&
      contracts.samples.every(
        x =>
          x.selection.attributes === 2 &&
          x.selection.childList === 0 &&
          x.partial.text === 100 &&
          x.partial.childList === 0 &&
          x.batchedOrders === 2 &&
          x.recreateCycles === 20
      ),
    'Incomplete production contracts'
  );
  for (const [name, data] of Object.entries(builds)) {
    const stage = out + '/production';
    assert(
      sha(stage + '/' + name + '/main.js') === data.bundle,
      'Production bundle changed'
    );
    assert(
      sha(stage + '/sources/' + name + '/src/main.tsx') === data.appSource,
      'Production app changed'
    );
    assert(
      sha(stage + '/sources/' + name + '/lithent.mjs') === data.core,
      'Production core changed'
    );
    assert(
      sha(stage + '/sources/' + name + '/helper.mjs') === data.helper,
      'Production helper changed'
    );
  }
  assert(
    builds.lithent.core === builds['lithent-before'].core &&
      builds.lithent.helper === builds['lithent-before'].helper,
    'Production baselines differ'
  );
  assert(
    JSON.stringify(verification.build) === JSON.stringify(builds) &&
      JSON.stringify(contracts.build) === JSON.stringify(builds),
    'Verification belongs to different builds'
  );
  const testLog = readFileSync(out + '/test-dual.log', 'utf8');
  const summaries = [
    ...testLog.matchAll(/      Tests\s+(\d+) passed(?: \| (\d+) skipped)?/g),
  ];
  const testsPassed = summaries.reduce((sum, x) => sum + Number(x[1]), 0);
  const testsSkipped = summaries.reduce((sum, x) => sum + Number(x[2] || 0), 0);
  assert(
    summaries.length === 13 && testsPassed === 1042 && testsSkipped === 3,
    'Unexpected baseline test summaries'
  );
  const sizeLog = readFileSync(out + '/size.log', 'utf8');
  assert(
    sizeLog.includes('br 4798 / 4800') &&
      sizeLog.includes('br 6903 / 9000') &&
      sizeLog.includes('br 998 / 1000'),
    'Baseline size changed'
  );
  const initialCounts = out + '/counts-before-input-assertions.json';
  let repeatedCountersMatch = null;
  if (existsSync(initialCounts)) {
    const earlier = json(initialCounts);
    repeatedCountersMatch =
      earlier.samples.length === counts.samples.length &&
      earlier.samples.every(
        (x, i) =>
          JSON.stringify(x.counts) === JSON.stringify(counts.samples[i].counts)
      );
    assert(repeatedCountersMatch, 'Counter repeat differs');
  }
  save(out + '/checks.json', {
    checkedAt: new Date().toISOString(),
    baseline: {
      dual: {
        command: 'pnpm test:dual',
        exitCode: 0,
        suites: summaries.length,
        testsPassed,
        testsSkipped,
      },
      builds: [
        'pnpm build:core',
        'pnpm build:concurrent',
        'pnpm build:element',
      ],
      size: { base: 4798, concurrent: 6903, element: 998 },
    },
    diagnostics: { scenarios: 38, allValid: true, repeatedCountersMatch },
    production: {
      contracts: true,
      keyed: true,
      nineScenarios: true,
      fonts: true,
      hashesMatch: true,
    },
    runtimeUnchanged: true,
    siblingUnchanged: true,
    browserUnchanged: true,
    executionNotes: [
      'Initial production prepare failed with sandbox EPERM while Vite wrote a temporary sibling config; rerun with permission succeeded.',
      'Counter repeat strengthened input value/identity checks without changing diagnostic bundles. Both runs are preserved.',
    ],
  });
  console.log(
    'Checked baseline tests, size, 38 diagnostics, production contracts, and final hashes'
  );
} else if (mode === 'pack') {
  const artifactDir = resolve(
    process.env.LITHENT_PHASE1_ARTIFACT_DIR || out + '/preserved'
  );
  const evidence = artifactDir + '/structural-baseline-evidence.json.gz';
  const resultFile = artifactDir + '/structural-baseline-results.json';
  if (existsSync(evidence) || existsSync(resultFile))
    throw Error(
      'Use a fresh artifact directory; existing evidence is preserved'
    );
  mkdirSync(artifactDir, { recursive: true });
  const files = {};
  for (const path of filesIn(out)) {
    if (path.endsWith('.gz')) continue;
    const data = readFileSync(path);
    files[relative(out, path)] = {
      sha256: hash(data),
      content: data.toString('utf8'),
    };
  }
  for (const path of [
    fileURLToPath(import.meta.url),
    root + '/docs/benchmark/targeted-update.mjs',
    root + '/docs/benchmark/production-run.mjs',
    root + '/scripts/size-report.js',
  ]) {
    const data = readFileSync(path);
    files['tools/' + relative(root, path)] = {
      sha256: hash(data),
      content: data.toString('utf8'),
    };
  }
  writeFileSync(
    evidence,
    gzipSync(JSON.stringify({ schemaVersion: 1, files }), { level: 9 })
  );
  save(resultFile, {
    manifest: json(out + '/manifest.json'),
    initial: existsSync(out + '/initial-manifest.json')
      ? json(out + '/initial-manifest.json')
      : null,
    builds: json(out + '/diagnostic-builds.json'),
    diagnostics: json(out + '/counts.json'),
    productionBuilds: json(out + '/production/build-manifest.json'),
    contracts: json(out + '/production/contracts.json'),
    verification: json(out + '/production/production-verify.json'),
    checks: json(out + '/checks.json'),
    evidence: {
      file: relative(root, evidence),
      sha256: sha(evidence),
      files: Object.keys(files).length,
    },
  });
  console.log(
    'Preserved',
    Object.keys(files).length,
    'files; evidence',
    sha(evidence)
  );
} else throw Error('Unknown mode: ' + mode);
