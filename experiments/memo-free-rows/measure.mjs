// Local diagnostic timing for the DC-29 row variants. This is NOT the
// official js-framework-benchmark runner: it reproduces that runner's nine CPU
// scenarios (warm-ups, forced GC, CPU throttling) but times them inside the
// page, so paint and compositing are not included.
//
//   node experiments/memo-free-rows/measure.mjs <out> [--apps a,b] [--benches 01,04]
//        [--samples 10] [--css <dir>] [--mem] [--json <file>]
//
// script  = click → end of the redraw microtask (JS)
// layout  = forced style + layout right after it
// total   = script + layout
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const out = path.resolve(argv[0]);
const opt = name => {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? undefined : argv[index + 1];
};
const manifest = JSON.parse(
  fs.readFileSync(path.join(out, 'manifest.json'), 'utf8')
);
const apps = (opt('apps') || Object.keys(manifest).join(',')).split(',');
const samples = Number(opt('samples') || 10);
const cssDir = opt('css') && path.resolve(opt('css'));
const memory = argv.includes('--mem');

// Weights of the official result table (webdriver-ts-results Common.ts), as
// recorded in docs/benchmark/dc25-keyed-fast-path-final-results.json.
const WEIGHTS = {
  '01': 0.64280248137063,
  '02': 0.5607178150466176,
  '03': 0.5643800750716564,
  '04': 0.1925635870170522,
  '05': 0.13200612879341714,
  '06': 0.5277091212292658,
  '07': 0.5644449600965534,
  '08': 0.5508359820582848,
  '09': 0.4225836631419211,
};

const row = (n, rest) => `tbody>tr:nth-of-type(${n})${rest || ''}`;
const idCell = n => row(n, '>td:nth-of-type(1)');
const labelLink = n => row(n, '>td:nth-of-type(2)>a');
const removeIcon = n => row(n, '>td:nth-of-type(3)>a>span:nth-of-type(1)');

// init: steps before the timed click; each is [selector, check]. A check is
// [selector, expected text] or a function evaluated in the page.
const createClear = count =>
  Array.from({ length: count }, (_, i) => [
    ['#run', [idCell(1000), String((i + 1) * 1000)]],
    ['#clear', ['tbody', '']],
  ]).flat();

const BENCHES = {
  '01': {
    name: 'create 1k',
    init: createClear(5),
    click: '#run',
    check: [idCell(1000), '6000'],
  },
  '02': {
    name: 'replace 1k',
    init: Array.from({ length: 5 }, (_, i) => [
      '#run',
      [idCell(1), String(i * 1000 + 1)],
    ]),
    click: '#run',
    check: [idCell(1), '5001'],
  },
  '03': {
    name: 'update every 10th',
    throttle: 4,
    init: [
      ['#run', [idCell(1000), '1000']],
      ...Array.from({ length: 3 }, (_, i) => [
        '#update',
        [labelLink(991), ' !!!'.repeat(i + 1)],
      ]),
    ],
    click: '#update',
    check: [labelLink(991), ' !!!'.repeat(4)],
  },
  '04': {
    name: 'select row',
    throttle: 4,
    init: [
      ['#run', [idCell(1000), '1000']],
      ...Array.from({ length: 5 }, (_, i) => [
        labelLink(i + 5),
        [`${row(i + 5)}.danger`, ''],
      ]),
    ],
    click: labelLink(2),
    check: [`${row(2)}.danger`, ''],
  },
  '05': {
    name: 'swap rows',
    throttle: 4,
    init: [
      ['#run', [idCell(1000), '1000']],
      ...Array.from({ length: 6 }, (_, i) => [
        '#swaprows',
        [idCell(999), i % 2 ? '999' : '2'],
      ]),
    ],
    click: '#swaprows',
    check: [idCell(999), '2'],
  },
  '06': {
    name: 'remove row',
    throttle: 2,
    init: [
      ['#run', [idCell(1000), '1000']],
      ...Array.from({ length: 5 }, (_, i) => [
        removeIcon(9 - i),
        [idCell(9 - i), '10'],
      ]),
    ],
    click: removeIcon(4),
    check: [idCell(4), '10'],
  },
  '07': {
    name: 'create 10k',
    init: createClear(5),
    click: '#runlots',
    check: [idCell(10000), '15000'],
  },
  '08': {
    name: 'append 1k',
    init: [...createClear(5), ['#run', [idCell(1000), '6000']]],
    click: '#add',
    check: [idCell(2000), '7000'],
  },
  '09': {
    name: 'clear 1k',
    throttle: 4,
    init: [...createClear(5), ['#run', [idCell(1000), '6000']]],
    click: '#clear',
    check: ['tbody', ''],
  },
};
const benches = (opt('benches') || Object.keys(BENCHES).join(',')).split(',');

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};
const server = http.createServer((request, response) => {
  const url = decodeURIComponent(request.url.split('?')[0]);
  const base = url.startsWith('/css/') && cssDir ? path.dirname(cssDir) : out;
  const file = path.join(base, url.endsWith('/') ? url + 'index.html' : url);
  if (!file.startsWith(base) || !fs.existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
    // High-resolution timers need a cross-origin isolated page.
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-embedder-policy': 'require-corp',
  });
  response.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  args: [
    '--js-flags=--expose-gc',
    '--enable-benchmarking',
    '--no-default-browser-check',
    '--disable-sync',
    '--no-first-run',
    '--disable-extensions',
    '--window-size=1000,800',
  ],
});

// Runs in the page: click, wait for the redraw microtask, force layout.
const timedClick = async selector => {
  const target = document.querySelector(selector);
  if (!target) throw new Error(`missing ${selector}`);
  const start = performance.now();
  target.click();
  // The redraw was queued during the click: this continuation runs after it.
  await new Promise(resolve => queueMicrotask(resolve));
  const scripted = performance.now();
  void document.body.offsetHeight;
  const laid = performance.now();
  await new Promise(resolve =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );
  return { script: scripted - start, layout: laid - scripted };
};

const verify = async (page, [selector, expected]) => {
  const actual = await page.evaluate(
    ([selector]) => {
      const node = document.querySelector(selector);
      return node ? node.textContent : null;
    },
    [selector]
  );
  const ok =
    actual !== null &&
    (expected === '' ? true : actual.trim().endsWith(expected.trim()));
  if (!ok || (selector === 'tbody' && actual !== '')) {
    throw new Error(`check failed: ${selector} = ${actual} (want ${expected})`);
  }
};

const open = async app => {
  const context = await browser.newContext({
    viewport: { width: 1000, height: 800 },
  });
  const page = await context.newPage();
  page.on('pageerror', error => {
    throw error;
  });
  await page.goto(`${origin}/${app}/index.html`);
  await page.waitForSelector('#run');
  const client = await context.newCDPSession(page);
  return { context, page, client };
};

const sample = async (app, id) => {
  const bench = BENCHES[id];
  const { context, page, client } = await open(app);
  try {
    for (const [selector, check] of bench.init) {
      await page.evaluate(timedClick, selector);
      await verify(page, check);
    }
    await client.send('HeapProfiler.collectGarbage');
    if (bench.throttle) {
      await client.send('Emulation.setCPUThrottlingRate', {
        rate: bench.throttle,
      });
    }
    const timing = await page.evaluate(timedClick, bench.click);
    if (bench.throttle) {
      await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    }
    await verify(page, bench.check);
    return { ...timing, total: timing.script + timing.layout };
  } finally {
    await context.close();
  }
};

const heap = async (app, clicks) => {
  const { context, page, client } = await open(app);
  try {
    for (const selector of clicks) await page.evaluate(timedClick, selector);
    await client.send('HeapProfiler.collectGarbage');
    await client.send('HeapProfiler.collectGarbage');
    const { usedSize } = await client.send('Runtime.getHeapUsage');
    return usedSize / 1024 / 1024;
  } finally {
    await context.close();
  }
};

const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const raw = {};
for (const app of apps) raw[app] = {};
for (let round = 0; round < samples; round += 1) {
  // Alternate the app order every round.
  const order = round % 2 ? [...apps].reverse() : apps;
  for (const id of benches) {
    for (const app of order) {
      (raw[app][id] ||= []).push(await sample(app, id));
    }
  }
  process.stderr.write(`round ${round + 1}/${samples}\n`);
}

const MEMORY = {
  ready: [],
  run1k: ['#run'],
  update5: ['#run', '#update', '#update', '#update', '#update', '#update'],
  runClear: ['#run', '#clear'],
  run10k: ['#runlots'],
};
const heaps = {};
if (memory) {
  for (const app of apps) heaps[app] = {};
  for (let round = 0; round < 3; round += 1) {
    for (const app of round % 2 ? [...apps].reverse() : apps) {
      for (const [name, clicks] of Object.entries(MEMORY)) {
        (heaps[app][name] ||= []).push(await heap(app, clicks));
      }
    }
  }
}

await browser.close();
server.close();

const summary = {};
for (const app of apps) {
  summary[app] = { script: {}, total: {}, heapMB: {} };
  for (const id of benches) {
    summary[app].script[id] = median(raw[app][id].map(s => s.script));
    summary[app].total[id] = median(raw[app][id].map(s => s.total));
  }
  for (const [name, values] of Object.entries(heaps[app] || {})) {
    summary[app].heapMB[name] = median(values);
  }
}
// Weighted geometric mean of the ratio to the first app.
const weighted = (app, metric) => {
  let sum = 0;
  let weights = 0;
  for (const id of benches) {
    sum +=
      WEIGHTS[id] *
      Math.log(summary[app][metric][id] / summary[apps[0]][metric][id]);
    weights += WEIGHTS[id];
  }
  return Math.exp(sum / weights);
};

const fixed = (value, digits = 2) => value.toFixed(digits).padStart(8);
const pad = text => String(text).padEnd(22);
for (const metric of ['script', 'total']) {
  console.log(`\n${metric} median ms (${samples} samples)`);
  console.log(pad('') + apps.map(app => app.padStart(16)).join(''));
  for (const id of benches) {
    console.log(
      pad(`${id} ${BENCHES[id].name}`) +
        apps.map(app => fixed(summary[app][metric][id]).padStart(16)).join('')
    );
  }
  console.log(
    pad(`weighted / ${apps[0]}`) +
      apps.map(app => fixed(weighted(app, metric), 3).padStart(16)).join('')
  );
}
if (memory) {
  console.log('\nJS heap after GC, MB (median of 3)');
  for (const name of Object.keys(MEMORY)) {
    console.log(
      pad(name) +
        apps
          .map(app => fixed(summary[app].heapMB[name], 3).padStart(16))
          .join('')
    );
  }
}
if (opt('json')) {
  const version = await (async () => {
    const b = await chromium.launch();
    const v = b.version();
    await b.close();
    return v;
  })();
  fs.writeFileSync(
    opt('json'),
    JSON.stringify(
      {
        tool: 'experiments/memo-free-rows/measure.mjs (local diagnostic, not the official runner)',
        date: new Date().toISOString(),
        chromium: version,
        node: process.version,
        samples,
        apps: Object.fromEntries(apps.map(app => [app, manifest[app]])),
        weights: WEIGHTS,
        summary,
        weighted: Object.fromEntries(
          apps.map(app => [
            app,
            { script: weighted(app, 'script'), total: weighted(app, 'total') },
          ])
        ),
        raw,
        heaps,
      },
      null,
      1
    ) + '\n'
  );
}
