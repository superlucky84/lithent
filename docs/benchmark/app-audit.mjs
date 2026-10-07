// App prototypes only; runtime sources and the benchmark checkout are not edited.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadavg } from 'node:os';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  ''
);
const app = resolve(root, '../js-framework-benchmark/frameworks/keyed/lithent');
const out = process.env.LITHENT_APP_AUDIT_OUT || '/tmp/lithent-app-review';
mkdirSync(out, { recursive: true });
const require = createRequire(root + '/package.json');
const { build } = await import(
  pathToFileURL(
    require.resolve('vite').replace('index.cjs', 'dist/node/index.js')
  )
);
const { chromium } = require('@playwright/test');
const baseline = root + '/docs/benchmark/adapter-baseline';
const original = readFileSync(baseline + '/main.tsx', 'utf8');
const replace = (code, from, to) => {
  if (!code.includes(from))
    throw Error('Missing transform: ' + from.slice(0, 80));
  return code.replace(from, to);
};
function fullScreen(code) {
  const start = code.indexOf('  mountCallback(() => {');
  const end = code.indexOf('\n  return () => (', start);
  if (start < 0 || end < 0) throw Error('Missing callback');
  code = code.slice(0, start) + code.slice(end);
  code = replace(
    code,
    'const App = mount(renew => {',
    'const Table = mount(renew => {'
  );
  const buttons = [
    ['run', 'Create 1,000 rows', 'run'],
    ['runlots', 'Create 10,000 rows', 'runLots'],
    ['add', 'Append 1,000 rows', 'add'],
    ['update', 'Update every 10th row', 'update'],
    ['clear', 'Clear', 'clear'],
    ['swaprows', 'Swap Rows', 'swapRows'],
  ];
  const buttonCode = buttons
    .map(
      ([id, text, method]) =>
        `<div class="col-sm-6 smallpad"><button type="button" class="btn btn-primary btn-block" id="${id}" onClick={on${method}}>${text}</button></div>`
    )
    .join('\n');
  const handlers = buttons
    .map(
      ([, , method]) =>
        `const on${method} = () => { store.${method}(); renewApp(); };`
    )
    .join('\n');
  return replace(
    code,
    "render(<App />, document.getElementById('tbody'));",
    `const App = mount(() => {\n${handlers}\nreturn () => <div class="container"><div class="jumbotron"><div class="row"><div class="col-md-6"><h1>Lithent-&quot;keyed&quot;</h1></div><div class="col-md-6"><div class="row">${buttonCode}</div></div></div></div><table class="table table-hover table-striped test-data"><tbody id="tbody"><Table /></tbody></table><span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true" /></div>;\n});\nrender(<App />, document.getElementById('main'));`
  );
}
function flatten(code) {
  code = replace(
    code,
    'type Row = { id: number; label: string };',
    'type Row = { id: number; label: string; view: (props: any) => any };'
  );
  code = replace(
    code,
    'data[i] = { id: nextId, label: buildLabel() };',
    'data[i] = makeRow(nextId, buildLabel());'
  );
  code = replace(
    code,
    'rows[i] = { ...rows[i], label: `${rows[i].label} !!!` };',
    'rows[i].label += " !!!";'
  );
  const start = code.indexOf('const RowView = mount<');
  const end = code.indexOf('\nconst App = mount', start);
  const renderer = `function makeRow(id: number, label: string): Row {\nconst row = {id, label, view: null as any};\nconst onSelect = () => {store.select(id); renewApp();};\nconst onRemove = () => {store.remove(id); renewApp();};\nrow.view = cacheUpdate(() => [row.label, store.state.selected === id], () => <tr key={id} class={store.state.selected === id ? 'danger' : undefined}><td class="col-md-1">{id}</td><td class="col-md-4"><a onClick={onSelect}>{row.label}</a></td><td class="col-md-1"><a onClick={onRemove}><span class="glyphicon glyphicon-remove" aria-hidden="true" /></a></td><td class="col-md-6" /></tr>);\nreturn row;\n}\n`;
  code = code.slice(0, start) + renderer + code.slice(end);
  const mapStart = code.indexOf('      {store.state.rows.map(row => (');
  const mapEnd = code.indexOf('      ))}', mapStart) + '      ))}'.length;
  if (mapStart < 0 || mapEnd < 10) throw Error('Missing map');
  return (
    code.slice(0, mapStart) +
    '      {store.state.rows.map(row => row.view(row))}' +
    code.slice(mapEnd)
  );
}
const sources = {
  base: original,
  full: fullScreen(original),
  flat: flatten(original),
  flatFull: fullScreen(flatten(original)),
};
let scalar = replace(
  original,
  '() => [props.row, props.selected]',
  '() => [props.row.label, props.selected]'
);
scalar = replace(
  scalar,
  'rows[i] = { ...rows[i], label: `${rows[i].label} !!!` };',
  'rows[i].label += " !!!";'
);
sources.scalarFull = fullScreen(scalar);
const mode = process.argv[2] || 'verify';
const selected = process.argv[3]?.split(',') || Object.keys(sources);
const instrument = mode === 'verify';
const bundles = {};
for (const name of selected) {
  writeFileSync(out + '/' + name + '.tsx', sources[name]);
  const result = await build({
    configFile: false,
    root: app,
    logLevel: 'error',
    plugins: [
      {
        name: 'review',
        enforce: 'pre',
        transform(code, id) {
          if (id === app + '/src/main.tsx')
            return { code: sources[name], map: null };
          if (instrument && id === root + '/helper/src/hook/cacheUpdate.ts') {
            code = replace(
              code,
              '    const newDefs = checkFunction();',
              '    const probe = ((globalThis as any).__cacheProbe ||= {checks:0,misses:0}); probe.checks++;\n    const newDefs = checkFunction();'
            );
            code = replace(
              code,
              '    const newUpdater = updater(props);',
              '    probe.misses++;\n    const newUpdater = updater(props);'
            );
            return { code, map: null };
          }
        },
      },
    ],
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: root + '/helper/src/hook/cacheUpdate.ts',
        },
        { find: /^lithent$/, replacement: root + '/src/index.ts' },
        { find: /^@\//, replacement: root + '/src/' },
      ],
    },
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    build: {
      write: false,
      minify: true,
      target: 'esnext',
      rollupOptions: { input: app + '/src/main.tsx' },
    },
  });
  bundles[name] = result.output.find(x => x.type === 'chunk').code;
  writeFileSync(out + '/' + name + '.js', bundles[name]);
}
const css =
  readFileSync(
    root +
      '/../js-framework-benchmark/css/bootstrap/dist/css/bootstrap.min.css',
    'utf8'
  ).replace(/url\([^)]*\)/g, 'url(data:,)') +
  readFileSync(root + '/../js-framework-benchmark/css/main.css', 'utf8');
const baseHtml = readFileSync(baseline + '/index.html', 'utf8')
  .replace(
    '<link href="/css/currentStyle.css" rel="stylesheet" />',
    '<style>' + css + '</style>'
  )
  .replace('src="/src/main.tsx"', 'src="/main.js"');
const fullHtml = baseHtml.replace(
  /<div id="main">[\s\S]*<\/div>\s*<script/,
  '<div id="main"></div><script'
);
const browser = await chromium.launch({ headless: true });
const result = {
  browser: browser.version(),
  mode,
  loadStart: loadavg(),
  rounds: [],
  verify: {},
};
const click = (page, selector) =>
  page.evaluate(async selector => {
    const t = performance.now();
    document.querySelector(selector).click();
    await new Promise(queueMicrotask);
    return performance.now() - t;
  }, selector);
const settle = page =>
  page.evaluate(
    () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)))
  );
async function openPage(name) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  page.on('pageerror', error => {
    throw error;
  });
  await page.route('http://app.review/**', route =>
    route.fulfill({
      contentType: route.request().url().endsWith('main.js')
        ? 'text/javascript'
        : 'text/html',
      body: route.request().url().endsWith('main.js')
        ? bundles[name]
        : name.endsWith('Full') || name === 'full'
          ? fullHtml
          : baseHtml,
    })
  );
  await page.goto('http://app.review/');
  await page.waitForSelector('#run');
  await settle(page);
  return page;
}
if (mode === 'verify') {
  for (const name of selected) {
    const page = await openPage(name);
    const checks = await page.evaluate(async () => {
      const check = (value, label) => {
        if (!value) throw Error(label);
      };
      const rows = () => [...document.querySelectorAll('tbody>tr')];
      const step = async selector => {
        globalThis.__cacheProbe = { checks: 0, misses: 0 };
        document.querySelector(selector).click();
        await new Promise(queueMicrotask);
        return { ...globalThis.__cacheProbe };
      };
      const probes = {};
      probes.create = await step('#run');
      check(rows().length === 1000, 'create');
      const before = rows(),
        labels = before.map(r => r.cells[1].textContent);
      probes.select = await step('tbody>tr:nth-of-type(2)>td:nth-of-type(2)>a');
      check(
        rows()[1].className === 'danger' &&
          rows().filter(r => r.className === 'danger').length === 1,
        'select'
      );
      probes.reselect = await step(
        'tbody>tr:nth-of-type(3)>td:nth-of-type(2)>a'
      );
      check(
        rows()[2].className === 'danger' &&
          !rows()[1].classList.contains('danger'),
        'selection switch'
      );
      probes.update = await step('#update');
      check(
        rows().every(
          (r, i) =>
            r === before[i] &&
            r.cells[1].textContent === labels[i] + (i % 10 ? '' : ' !!!')
        ),
        'partial update keyed'
      );
      probes.swap = await step('#swaprows');
      const swapped = [...before];
      [swapped[1], swapped[998]] = [swapped[998], swapped[1]];
      check(
        rows().every((r, i) => r === swapped[i]),
        'swap keyed'
      );
      const removeID = rows()[998].cells[0].textContent;
      probes.remove = await step(
        'tbody>tr:nth-of-type(999)>td:nth-of-type(3)>a'
      );
      check(
        rows().length === 999 &&
          !rows().some(r => r.cells[0].textContent === removeID),
        'moved handler'
      );
      swapped.splice(998, 1);
      probes.add = await step('#add');
      check(
        rows().length === 1999 &&
          rows()
            .slice(0, 999)
            .every((r, i) => r === swapped[i]),
        'add keyed'
      );
      const prior = rows();
      probes.replace = await step('#run');
      check(
        rows().length === 1000 && rows().every(r => !prior.includes(r)),
        'replace'
      );
      probes.clear = await step('#clear');
      check(rows().length === 0, 'clear');
      probes.create10k = await step('#runlots');
      check(rows().length === 10000, 'create10k');
      await step('#clear');
      for (let i = 0; i < 20; i++) {
        await step('#run');
        await step('#clear');
      }
      check(rows().length === 0, 'cycles');
      return probes;
    });
    result.verify[name] = checks;
    console.log(name, JSON.stringify(checks));
    await page.close();
  }
} else {
  const scenarios = {
    create: { pre: '#clear', act: () => '#run' },
    replace: { setup: '#run', act: () => '#run' },
    update: { setup: '#run', act: () => '#update' },
    select: {
      setup: '#run',
      act: i => `tbody>tr:nth-of-type(${(i % 50) + 2})>td:nth-of-type(2)>a`,
    },
    swap: { setup: '#run', act: () => '#swaprows' },
    remove: {
      setup: '#run',
      act: () => 'tbody>tr:nth-of-type(20)>td:nth-of-type(3)>a',
    },
    create10k: { pre: '#clear', act: () => '#runlots' },
    add: { pre: '#run', act: () => '#add' },
    clear: { pre: '#run', act: () => '#clear' },
  };
  const scenarioNames = process.argv[4]?.split(',') || Object.keys(scenarios);
  for (let round = 0; round < 2; round++)
    for (const name of round % 2 ? [...selected].reverse() : selected) {
      const roundResult = { round, name, scenarios: {} };
      for (const s of scenarioNames) {
        const sc = scenarios[s],
          page = await openPage(name),
          cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        if (sc.setup) await click(page, sc.setup);
        const values = [];
        for (let i = 0; i < 18; i++) {
          if (sc.pre) await click(page, sc.pre);
          await settle(page);
          const t = await click(page, sc.act(i));
          await settle(page);
          if (i >= 6) values.push(t);
        }
        roundResult.scenarios[s] = values;
        await page.close();
      }
      result.rounds.push(roundResult);
      console.log(
        round,
        name,
        JSON.stringify(
          Object.fromEntries(
            Object.entries(roundResult.scenarios).map(([s, v]) => [
              s,
              +[...v]
                .sort((a, b) => a - b)
                [Math.floor(v.length / 2)].toFixed(3),
            ])
          )
        )
      );
    }
}
result.loadEnd = loadavg();
writeFileSync(out + '/' + mode + '.json', JSON.stringify(result, null, 2));
await browser.close();
