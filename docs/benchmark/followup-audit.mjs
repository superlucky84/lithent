// Diagnostic prototypes only: build-time transforms never edit the runtime sources.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { brotliCompressSync } from 'node:zlib';

const root = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  ''
);
const app = path.resolve(
  root,
  '../js-framework-benchmark/frameworks/keyed/lithent'
);
const require = createRequire(`${root}/package.json`);
const { build } = await import(
  pathToFileURL(
    require.resolve('vite').replace('index.cjs', 'dist/node/index.js')
  )
);
const { chromium } = require('@playwright/test');
const out = process.env.LITHENT_AUDIT_OUT || '/tmp/lithent-followup-audit';
mkdirSync(out, { recursive: true });
import { edits, variants } from './followup-edits.mjs';

async function bundle(name, minify = true) {
  const result = await build({
    configFile: false,
    root: app,
    logLevel: 'error',
    plugins: [
      {
        name: 'audit',
        enforce: 'pre',
        transform(code, id) {
          for (const edit of variants[name]) code = edits[edit](code, id);
          return { code, map: null };
        },
      },
    ],
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: `${root}/helper/src/hook/cacheUpdate.ts`,
        },
        { find: /^lithent$/, replacement: `${root}/src/index.ts` },
        { find: /^@\//, replacement: `${root}/src/` },
      ],
    },
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    build:
      mode === 'size'
        ? {
            write: false,
            sourcemap: true,
            lib: {
              entry: `${root}/src/index.ts`,
              name: 'lithent',
              formats: ['umd'],
              fileName: () => 'lithent.umd.js',
            },
            rollupOptions: {
              treeshake: {
                moduleSideEffects: false,
                propertyReadSideEffects: false,
                tryCatchDeoptimization: false,
              },
            },
          }
        : {
            write: false,
            minify,
            target: 'esnext',
            rollupOptions: {
              input: `${app}/src/main.tsx`,
              output: { entryFileNames: 'main.js' },
            },
          },
  });
  const code = (Array.isArray(result) ? result[0] : result).output.find(
    x => x.type === 'chunk'
  ).code;
  writeFileSync(
    `${out}/${name}${mode === 'size' ? '-size' : minify ? '' : '-profile'}.js`,
    code
  );
  return code;
}

const mode = process.argv[2] || 'measure';
if (!['measure', 'cold', 'profile', 'verify', 'size'].includes(mode))
  throw Error('Expected measure, cold, profile, verify, or size');
const selected =
  process.argv[3]?.split(',') ||
  (mode === 'profile' ? ['base'] : Object.keys(variants));
for (const name of selected)
  if (!variants[name]) throw Error('Unknown variant: ' + name);
const bundles = {};
for (const name of selected)
  bundles[name] = await bundle(name, mode !== 'profile');
console.log('Built', selected.join(', '));
if (mode === 'size') {
  const sizes = Object.fromEntries(
    Object.entries(bundles).map(([name, code]) => [
      name,
      { raw: Buffer.byteLength(code), br: brotliCompressSync(code).length },
    ])
  );
  console.log(JSON.stringify(sizes));
  writeFileSync(`${out}/size.json`, JSON.stringify(sizes, null, 2));
  process.exit(0);
}
const html = readFileSync(`${app}/index.html`, 'utf8')
  .replace(
    '<link href="/css/currentStyle.css" rel="stylesheet" />',
    '<style>' +
      readFileSync(
        path.resolve(app, '../../../css/bootstrap/dist/css/bootstrap.min.css'),
        'utf8'
      ).replace(/url\([^)]*\)/g, 'url(data:,)') +
      readFileSync(path.resolve(app, '../../../css/main.css'), 'utf8') +
      '</style>'
  )
  .replace('src="/src/main.tsx"', 'src="/main.js"');
const browser = await chromium.launch({ headless: true });
console.log('Browser', browser.version());
const scenarios = {
  select: {
    setup: ['#run'],
    act: i => `tbody>tr:nth-of-type(${(i % 100) + 2})>td:nth-of-type(2)>a`,
  },
  update: { setup: ['#run'], act: () => '#update' },
  swap: { setup: ['#run'], act: () => '#swaprows' },
  remove: {
    setup: ['#run'],
    act: () => 'tbody>tr:nth-of-type(20)>td:nth-of-type(3)>a',
  },
  clear: { setup: [], pre: '#run', act: () => '#clear' },
  replace: { setup: ['#run'], act: () => '#run' },
  create: { setup: [], pre: '#clear', act: () => '#run' },
  create10k: { setup: [], pre: '#clear', act: () => '#runlots' },
};
const results = { browser: browser.version(), throttle: 4, mode, rounds: [] };
const settle = page =>
  page.evaluate(
    () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)))
  );
const click = (page, selector) =>
  page.evaluate(
    async ({ selector, verify }) => {
      const before = verify
        ? [...document.querySelectorAll('tbody>tr')].map(node => ({
            node,
            id: node.cells[0].textContent,
            label: node.cells[1].textContent,
          }))
        : [];
      const element = document.querySelector(selector);
      const t = performance.now();
      element.click();
      await new Promise(queueMicrotask);
      const elapsed = performance.now() - t;
      if (verify) {
        const after = [...document.querySelectorAll('tbody>tr')];
        const check = (condition, message) => {
          if (!condition) throw Error(`${selector}: ${message}`);
        };
        if (selector === '#clear') check(after.length === 0, 'clear failed');
        else if (selector === '#run' || selector === '#runlots') {
          check(
            after.length === (selector === '#run' ? 1000 : 10000),
            'creation count'
          );
          check(
            after.every(
              n => !before.some(b => b.id === n.cells[0].textContent)
            ),
            'replacement IDs'
          );
        } else {
          const expected = [...before];
          if (selector === '#swaprows')
            [expected[1], expected[998]] = [expected[998], expected[1]];
          if (selector.includes('nth-of-type(3)>a')) expected.splice(19, 1);
          check(after.length === expected.length, 'row count');
          check(
            after.every((node, i) => node === expected[i].node),
            'keyed DOM identity/order'
          );
          if (selector === '#update')
            check(
              after.every(
                (node, i) =>
                  node.cells[1].textContent ===
                  before[i].label + (i % 10 ? '' : ' !!!')
              ),
              'updated labels'
            );
          if (selector.includes('nth-of-type(2)>a'))
            check(
              after.filter(n => n.classList.contains('danger')).length === 1 &&
                element.closest('tr').classList.contains('danger'),
              'selection'
            );
        }
      }
      return elapsed;
    },
    { selector, verify: mode === 'verify' }
  );
try {
  for (
    let round = 0;
    round < (mode === 'measure' ? 2 : mode === 'cold' ? 12 : 1);
    round++
  ) {
    for (const name of round % 2 ? [...selected].reverse() : selected) {
      for (const [scenario, sc] of Object.entries(scenarios)) {
        if (process.argv[4] && !process.argv[4].split(',').includes(scenario))
          continue;
        const page = await browser.newPage();
        await page.route('http://audit.local/**', route =>
          route.fulfill({
            contentType: route.request().url().endsWith('/main.js')
              ? 'text/javascript'
              : 'text/html',
            body: route.request().url().endsWith('/main.js')
              ? bundles[name]
              : html,
          })
        );
        page.on('pageerror', err => {
          throw err;
        });
        await page.goto(`http://audit.local/?${mode}&rows=${scenario}`);
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', {
          rate: mode === 'cold' ? 1 : 4,
        });
        for (const s of sc.setup) await click(page, s);
        for (
          let i = 0;
          i < (mode === 'verify' ? 1 : mode === 'cold' ? 5 : 6);
          i++
        ) {
          if (sc.pre) await click(page, sc.pre);
          await settle(page);
          await click(page, sc.act(i + 101));
          await settle(page);
        }
        if (mode === 'profile') {
          await cdp.send('Profiler.enable');
          await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
        }
        const times = [],
          profiles = [];
        for (
          let i = 0;
          i < (mode === 'verify' ? 1 : mode === 'cold' ? 1 : 12);
          i++
        ) {
          if (sc.pre) await click(page, sc.pre);
          await settle(page);
          if (mode === 'cold') {
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
            await cdp.send('HeapProfiler.collectGarbage');
          }
          if (mode === 'profile') await cdp.send('Profiler.start');
          times.push(await click(page, sc.act(i)));
          if (mode === 'profile')
            profiles.push((await cdp.send('Profiler.stop')).profile);
          await settle(page);
        }
        const sorted = [...times].sort((a, b) => a - b);
        const result = {
          round,
          name,
          scenario,
          median: sorted[Math.floor(sorted.length / 2)],
          times,
        };
        if (profiles.length) {
          const self = {};
          for (const p of profiles) {
            const byId = new Map(p.nodes.map(n => [n.id, n.callFrame]));
            p.samples.forEach((id, i) => {
              const frame = byId.get(id);
              const key = `${frame.functionName || '(anon)'}:${frame.url.endsWith('main.js') ? frame.lineNumber + 1 : 'external'}`;
              self[key] =
                (self[key] || 0) + p.timeDeltas[i] / 1000 / profiles.length;
            });
          }
          result.self = Object.entries(self)
            .filter(
              ([k]) => !k.startsWith('(idle)') && !k.startsWith('(program)')
            )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 16);
        }
        console.log(JSON.stringify({ ...result, times: undefined }));
        results.rounds.push(result);
        writeFileSync(
          `${out}/${mode}-${selected.join('-')}.json`,
          JSON.stringify(results, null, 2)
        );
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
