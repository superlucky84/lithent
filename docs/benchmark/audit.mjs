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
const out = process.env.LITHENT_AUDIT_OUT || '/tmp/lithent-perf-audit';
mkdirSync(out, { recursive: true });
const edits = {
  props(code, id) {
    if (!id.endsWith('/src/diff.ts')) return code;
    return code.replace(
      'keys(props).forEach(key => delete props[key]);',
      'keys(props).forEach(key => { if (!Object.hasOwn(infoProps || {}, key)) delete props[key]; });'
    );
  },
  op(code, id) {
    return id.endsWith('/src/render.ts')
      ? code.replace('delete newWDom.op;', 'newWDom.op = undefined;')
      : code;
  },
  metadata(code, id) {
    if (!id.startsWith(`${root}/src/`)) return code;
    return code.replace(
      /delete (newWDom\.op|item\.(?:oi|nr|oc|op)|originalWDom\.children);/g,
      '$1 = undefined;'
    );
  },
  lis(code, id) {
    if (!id.endsWith('/src/render.ts')) return code;
    return code.replace(
      'const stay = new Set(getLisPositions(oiSeq)',
      `if (!createdCount && oiSeq.every((value, index) => !index || oiSeq[index - 1] < value)) {
    children.forEach(clearDiffMeta);
    execMountedQueue();
    return;
  }
  const stay = new Set(getLisPositions(oiSeq)`
    );
  },
  bulk(code, id) {
    if (!id.endsWith('/src/render.ts')) return code;
    return code.replace(
      '// Bulk fast path:',
      `// Experimental full-loop deletion, after existing lifecycle/event cleanup.
  if (newWDom.type === 'l') {
    const leaves: WDom[] = [];
    let eligible = true;
    const visit = (node: WDom) => {
      if (node.tag === 'portal' || (node.el as Element)?.tagName === 'HTML') {
        eligible = false;
      } else if (node.el?.nodeType === 11) {
        (node.oc || node.children || []).forEach(visit);
      } else if (node.el) {
        leaves.push(node);
      }
    };
    items.forEach(visit);
    if (eligible && leaves.length > 1) {
      let sibling = parent.firstChild;
      const covers = leaves.every(node => {
        if (node.el !== sibling) return false;
        sibling = sibling.nextSibling;
        return true;
      });
      if (covers && !sibling) {
        parent.textContent = '';
        leaves.forEach(node => delete node.el);
        return;
      }
    }
  }
  // Bulk fast path:`
    );
  },
  counts(code, id) {
    if (!id.startsWith(`${root}/src/`)) return code;
    if (id.endsWith('/src/render.ts'))
      code = code.replace(
        'count++;',
        'count++; globalThis.auditCounts.siblingVisits = (globalThis.auditCounts.siblingVisits || 0) + 1;'
      );
    const patterns = {
      runUpdate:
        'const runUpdate = (vDom: WDom, infoVdom: TagFunctionResolver) => {',
      syncResolverProps:
        'const syncResolverProps = (props: Props, infoProps: Props) => {',
      typeUpdate: 'const typeUpdate = (newWDom: WDom) => {',
      updateChildren: 'const updateChildren = (newWDom: WDom) => {',
      getLisPositions: 'const getLisPositions = (seq: number[]) => {',
      wrapper: 'const next = componentMaker(newProps);',
      resolve: 'return (compKey = props) => {',
    };
    for (const [key, pattern] of Object.entries(patterns)) {
      code = code.replace(
        pattern,
        `${pattern}\nglobalThis.auditCounts.${key} = (globalThis.auditCounts.${key} || 0) + 1;`
      );
    }
    return code;
  },
};
const variants = {
  base: [],
  props: ['props'],
  op: ['op'],
  metadata: ['metadata'],
  lis: ['lis'],
  bulk: ['bulk'],
  combined: ['props', 'metadata', 'lis', 'bulk'],
  counts: ['counts'],
};

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
          if (mode === 'edge' && id === `${app}/src/main.tsx`)
            code = `
        import { h, Fragment, mount, render } from 'lithent';
        let rows = [], renew;
        const Row = mount((_, props) => () => h(Fragment, {}, h('tr', {}, h('td', {}, props.id)), h('tr', {}, h('td', {}, props.id))));
        const App = mount(r => { renew = r; return () => h(Fragment, {}, rows.map(id => h(Row, { key: id, id }))); });
        render(h(App, {}), document.querySelector('#tbody'));
        document.querySelector('#run').onclick = () => { rows = Array.from({length: Number(new URLSearchParams(location.search).get('rows'))}, (_, i) => i); renew(); };
        document.querySelector('#clear').onclick = () => { rows = []; renew(); };
      `;
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
const selected =
  process.argv[3]?.split(',') ||
  (mode === 'counts' || mode === 'edge'
    ? ['counts']
    : mode === 'profile'
      ? ['base']
      : Object.keys(variants).filter(x => x !== 'counts'));
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
  .replace('<link href="/css/currentStyle.css" rel="stylesheet" />', '')
  .replace('src="/src/main.tsx"', 'src="/main.js"');
const browser = await chromium.launch({ headless: true });
console.log('Browser', browser.version());
const scenarios =
  mode === 'edge'
    ? Object.fromEntries(
        [500, 1000, 2000].map(n => [
          n,
          { setup: [], pre: '#run', act: () => '#clear' },
        ])
      )
    : {
        select: {
          setup: ['#run'],
          act: i =>
            `tbody>tr:nth-of-type(${(i % 100) + 2})>td:nth-of-type(2)>a`,
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
  for (let round = 0; round < (mode === 'measure' ? 2 : 1); round++) {
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
        await page.addInitScript(() => {
          globalThis.auditCounts = {};
          for (const [proto, method] of [
            [Element.prototype, 'remove'],
            [Node.prototype, 'removeChild'],
            [Node.prototype, 'insertBefore'],
            [Node.prototype, 'appendChild'],
            [EventTarget.prototype, 'removeEventListener'],
          ]) {
            const original = proto[method];
            if (location.search.includes('counts'))
              proto[method] = function (...args) {
                globalThis.auditCounts[method] =
                  (globalThis.auditCounts[method] || 0) + 1;
                return original.apply(this, args);
              };
          }
        });
        page.on('pageerror', err => {
          throw err;
        });
        await page.goto(`http://audit.local/?${mode}&rows=${scenario}`);
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        for (const s of sc.setup) await click(page, s);
        for (
          let i = 0;
          i < (['counts', 'edge', 'verify'].includes(mode) ? 1 : 6);
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
          i < (['counts', 'edge', 'verify'].includes(mode) ? 1 : 12);
          i++
        ) {
          if (sc.pre) await click(page, sc.pre);
          await settle(page);
          if (mode === 'counts' || mode === 'edge')
            await page.evaluate(() => {
              globalThis.auditCounts = {};
            });
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
        if (mode === 'counts' || mode === 'edge')
          result.counts = await page.evaluate(() => globalThis.auditCounts);
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
