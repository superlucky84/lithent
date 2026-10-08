// Measures real production adapters with the unchanged local official runner.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { loadavg, cpus, totalmem } from 'node:os';
import { spawn } from 'node:child_process';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  ''
);
const bench = resolve(root, '../js-framework-benchmark');
const out =
  process.env.LITHENT_PRODUCTION_OUT || '/tmp/lithent-production-review';
mkdirSync(out + '/traces', { recursive: true });
const mode = process.argv[2] || 'verify';
if (!['verify', 'cpu', 'mem', 'extras', 'retention', 'startup'].includes(mode))
  throw Error('Unknown mode');
const folders = {
  'lithent-before': out + '/lithent-before',
  lithent: out + '/lithent',
  'preact-hooks': bench + '/frameworks/keyed/preact-hooks',
  'react-hooks': bench + '/frameworks/keyed/react-hooks',
  vanillajs: bench + '/frameworks/keyed/vanillajs',
  solid: bench + '/frameworks/keyed/solid',
  svelte: bench + '/frameworks/keyed/svelte',
  vue: bench + '/frameworks/keyed/vue/dist',
};
const names = process.argv[3]?.split(',') || Object.keys(folders);
for (const name of names)
  if (!folders[name]) throw Error('Unknown app: ' + name);
const framework = name => ({
  name,
  fullNameWithKeyedAndVersion: name + '-production-keyed',
  uri: name,
  keyed: true,
  useShadowRoot: false,
  useRowShadowRoot: false,
  buttonsInShadowRoot: false,
  startLogicEventName: 'click',
  issues: [],
});
const hash = file =>
  createHash('sha256').update(readFileSync(file)).digest('hex');
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
};
const server = createServer((req, res) => {
  try {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/ls') {
      res.setHeader('content-type', 'application/json');
      res.end(
        JSON.stringify(
          names.map(name => ({
            type: 'keyed',
            directory: name,
            frameworkVersionString: name + '-production-keyed',
            customURL: '',
            startLogicEventName: 'click',
          }))
        )
      );
      return;
    }
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'frameworks') parts.splice(0, 2);
    // Vue's production entry uses this absolute upstream asset base.
    if (parts[0] === 'vue' && parts[1] === 'dist') parts.splice(1, 1);
    const isCSS = parts[0] === 'css';
    const dir = isCSS ? bench + '/css' : folders[parts[0]];
    if (!dir) throw Error('Unknown route');
    const file = resolve(dir, parts.slice(1).join('/') || 'index.html');
    if (!file.startsWith(dir + '/')) throw Error('Outside app');
    res.setHeader(
      'content-type',
      mime[extname(file)] || 'application/octet-stream'
    );
    res.end(readFileSync(file));
  } catch (error) {
    res.writeHead(404);
    res.end('Not found');
  }
});
server.on('error', error => {
  throw error;
});
await new Promise(r =>
  server.listen(mode === 'verify' ? 8080 : 0, '127.0.0.1', r)
);
const baseURL = 'http://127.0.0.1:' + server.address().port;
let output = {
  startedAt: new Date().toISOString(),
  mode,
  chrome: '154.0.8037.98 (system Google Chrome)',
  machine: {
    cpu: cpus()[0].model,
    cores: cpus().length,
    memoryGB: totalmem() / 1024 ** 3,
  },
  loadStart: loadavg(),
  alternatingOrder: process.env.LITHENT_PRODUCTION_ALTERNATE_ORDER === '1',
  build: JSON.parse(readFileSync(out + '/build-manifest.json')),
  versions: JSON.parse(readFileSync(out + '/versions.json')),
  samples: [],
};
if (process.env.LITHENT_PRODUCTION_RESUME === '1') {
  if (mode !== 'cpu' && mode !== 'mem')
    throw Error('Resume requires cpu or mem');
  const previous = JSON.parse(
    readFileSync(out + '/production-' + mode + '.json')
  );
  if (
    JSON.stringify(previous.build) !== JSON.stringify(output.build) ||
    JSON.stringify(previous.versions) !== JSON.stringify(output.versions)
  )
    throw Error('Cannot resume across different builds or versions');
  const resumedAt = output.startedAt;
  const resumeLoad = output.loadStart;
  output = previous;
  output.resumptions ||= [];
  output.resumptions.push({ resumedAt, load: resumeLoad });
  delete output.finishedAt;
  delete output.loadEnd;
}
const log = console.log.bind(console);
let progress;
let complete = false;
const settle = page =>
  page.evaluate(
    () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)))
  );
try {
  if (mode === 'verify') {
    const child = spawn(
      process.execPath,
      [
        bench + '/webdriver-ts/dist/isKeyed.js',
        '--headless',
        '--framework',
        ...names.map(name => 'keyed/' + name),
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );
    let transcript = '';
    for (const stream of [child.stdout, child.stderr])
      stream.on('data', data => {
        transcript += data;
        process.stdout.write(data);
      });
    const status = await new Promise(r => child.on('close', r));
    writeFileSync(out + '/production-keyed.log', transcript);
    if (status || /ERROR|failed|not keyed/i.test(transcript))
      throw Error('Official isKeyed failed');
    const require = createRequire(root + '/package.json');
    const { chromium } = require('@playwright/test');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });
    output.chrome = browser.version();
    try {
      for (const name of names) {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        page.on('response', response => {
          if (response.status() >= 400)
            errors.push(response.url() + ': ' + response.status());
        });
        await page.goto(baseURL + '/' + name + '/index.html');
        await page.waitForSelector('#run');
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() =>
          document.fonts.load('16px "Glyphicons Halflings"')
        );
        const checks = await page.evaluate(async () => {
          const rows = () => [...document.querySelectorAll('tbody>tr')];
          const assert = (condition, message) => {
            if (!condition) throw Error(message);
          };
          const click = async selector => {
            document.querySelector(selector).click();
            await new Promise(queueMicrotask);
          };
          await click('#run');
          assert(rows().length === 1000, 'run');
          const original = rows(),
            labels = original.map(r => r.cells[1].textContent);
          await click('tbody>tr:nth-of-type(2)>td:nth-of-type(2)>a');
          await click('tbody>tr:nth-of-type(3)>td:nth-of-type(2)>a');
          assert(
            rows()[2].className === 'danger' &&
              !rows()[1].classList.contains('danger'),
            'selection switch'
          );
          await click('#update');
          assert(
            rows().every(
              (r, i) =>
                r === original[i] &&
                r.cells[1].textContent === labels[i] + (i % 10 ? '' : ' !!!')
            ),
            'partial update'
          );
          await click('#swaprows');
          [original[1], original[998]] = [original[998], original[1]];
          assert(
            rows().every((r, i) => r === original[i]),
            'swap identity'
          );
          await click('tbody>tr:nth-of-type(999)>td:nth-of-type(3)>a');
          original.splice(998, 1);
          assert(
            rows().every((r, i) => r === original[i]) && rows().length === 999,
            'moved handler'
          );
          await click('#add');
          assert(
            rows().length === 1999 &&
              rows()
                .slice(0, 999)
                .every((r, i) => r === original[i]),
            'append'
          );
          const previous = rows();
          await click('#run');
          assert(
            rows().length === 1000 && rows().every(r => !previous.includes(r)),
            'replace'
          );
          await click('#clear');
          assert(rows().length === 0, 'clear');
          await click('#runlots');
          assert(rows().length === 10000, 'runlots');
          await click('#clear');
          return {
            scenarios: 9,
            fontLoaded: document.fonts.check('16px "Glyphicons Halflings"'),
          };
        });
        if (errors.length) throw Error(name + ': ' + errors.join('\n'));
        output.samples.push({ name, ...checks });
        log('Verified production app', name, checks);
        await page.close();
      }
    } finally {
      await browser.close();
    }
  } else if (mode === 'cpu' || mode === 'mem') {
    const { executeBenchmark } = await import(
      bench + '/webdriver-ts/dist/forkedBenchmarkRunnerPuppeteer.js'
    );
    const { config } = await import(bench + '/webdriver-ts/dist/common.js');
    config.LOG_PROGRESS = false;
    console.log = (...args) => {
      if (args[0] === 'runBenchmark' && progress) {
        progress.started++;
        if (progress.started % 5 === 0)
          log(
            'Progress',
            progress.name,
            progress.id,
            progress.started + '/' + progress.count
          );
      }
    };
    const ids =
      mode === 'cpu'
        ? [
            '01_run1k',
            '09_clear1k_x8',
            '03_update10th1k_x16',
            '05_swap1k',
            '04_select1k',
            '06_remove-one-1k',
            '02_replace1k',
            '08_create1k-after1k_x2',
            '07_create10k',
          ]
        : [
            '21_ready-memory',
            '22_run-memory',
            '23_update5-memory',
            '25_run-clear-memory',
            '26_run-10k-memory',
          ];
    const selected = process.argv[4]
      ? ids.filter(id =>
          process.argv[4].split(',').some(prefix => id.startsWith(prefix))
        )
      : ids;
    for (let index = 0; index < selected.length; index++) {
      const id = selected[index];
      const rotation = index % names.length;
      const order = output.alternatingOrder
        ? [...names]
        : [...names.slice(rotation), ...names.slice(0, rotation)];
      if (index % 2) order.reverse();
      for (const name of order) {
        if (
          output.samples.some(
            sample => sample.name === name && sample.id === id
          )
        )
          continue;
        const count = mode === 'mem' ? 3 : id.startsWith('04_') ? 25 : 15;
        progress = { name, id, started: 0, count };
        log(
          'Starting',
          mode,
          name,
          id,
          'samples',
          count,
          'load',
          loadavg()[0].toFixed(2)
        );
        const options = {
          host: '127.0.0.1',
          port: server.address().port,
          headless: true,
          batchSize: count,
          allowThrottling: true,
          tracesDirectory: out + '/traces',
          resultsDirectory: out,
          numIterationsForCPUBenchmarks: count,
          numIterationsForMemBenchmarks: count,
          chromePort: 9998,
          remoteDebuggingPort: 9999,
          browser: 'chrome',
          puppeteerSleep: 0,
        };
        let result;
        for (let attempt = 1; attempt <= 3; attempt++) {
          progress.started = 0;
          result = await executeBenchmark(framework(name), id, options);
          if (!result.error && result.result?.length === count) break;
          output.failedBatches ||= [];
          output.failedBatches.push({
            name,
            id,
            attempt,
            at: new Date().toISOString(),
            ...result,
          });
          writeFileSync(
            out + '/production-' + mode + '.json',
            JSON.stringify(output, null, 2)
          );
          if (attempt === 3)
            throw Error(JSON.stringify({ name, id, ...result }));
          log('Retrying failed browser batch', name, id, attempt, result.error);
        }
        output.samples.push({
          name,
          id,
          ...result,
          load: loadavg(),
          finishedAt: new Date().toISOString(),
        });
        const median = values => {
          const sorted = [...values].sort((a, b) => a - b);
          return sorted[Math.floor(sorted.length / 2)];
        };
        log(
          'Finished',
          name,
          id,
          mode === 'mem'
            ? median(result.result).toFixed(3) + ' MB'
            : JSON.stringify(
                Object.fromEntries(
                  ['total', 'script', 'paint'].map(key => [
                    key,
                    +median(result.result.map(x => x[key])).toFixed(3),
                  ])
                )
              )
        );
        writeFileSync(
          out + '/production-' + mode + '.json',
          JSON.stringify(output, null, 2)
        );
      }
    }
  } else if (mode === 'retention' || mode === 'startup') {
    // These diagnostics are separate from the official CPU/memory scores.
    const require = createRequire(root + '/package.json');
    const { chromium } = require('@playwright/test');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--js-flags=--expose-gc'],
    });
    output.chrome = browser.version();
    try {
      const rounds = mode === 'retention' ? 3 : 15;
      for (let round = 0; round < rounds; round++) {
        const order = round % 2 ? [...names].reverse() : names;
        for (const name of order) {
          const context = await browser.newContext();
          try {
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(String(error)));
            const cdp = await context.newCDPSession(page);
            await cdp.send('Network.enable');
            await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
            await cdp.send('Performance.enable');
            await page.goto(baseURL + '/' + name + '/index.html');
            await page.waitForSelector('#run');
            await page.evaluate(() => document.fonts.ready);
            await settle(page);
            if (mode === 'startup') {
              const timing = await page.evaluate(() => {
                const navigation =
                  performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByName(
                  'first-contentful-paint'
                )[0];
                return {
                  domContentLoaded: navigation.domContentLoadedEventEnd,
                  load: navigation.loadEventEnd,
                  firstContentfulPaint: paint?.startTime ?? null,
                };
              });
              const { metrics } = await cdp.send('Performance.getMetrics');
              const values = Object.fromEntries(
                metrics.map(x => [x.name, x.value])
              );
              output.samples.push({
                name,
                round,
                ...timing,
                scriptMs: values.ScriptDuration * 1000,
                taskMs: values.TaskDuration * 1000,
              });
            } else {
              const retained = async () => {
                await settle(page);
                await cdp.send('HeapProfiler.collectGarbage');
                await cdp.send('HeapProfiler.collectGarbage');
                const { metrics } = await cdp.send('Performance.getMetrics');
                const heap = metrics.find(
                  x => x.name === 'JSHeapUsedSize'
                ).value;
                const dom = await cdp.send('Memory.getDOMCounters');
                return { jsHeapMB: heap / 1024 ** 2, ...dom };
              };
              const checkpoints = [{ cycles: 0, ...(await retained()) }];
              let completed = 0;
              for (const cycles of [5, 25, 100]) {
                await page.evaluate(async count => {
                  const click = async id => {
                    document.getElementById(id).click();
                    await new Promise(queueMicrotask);
                  };
                  for (let i = 0; i < count; i++) {
                    await click('run');
                    if (document.querySelectorAll('tbody>tr').length !== 1000)
                      throw Error('Missing rows');
                    await click('clear');
                    if (document.querySelectorAll('tbody>tr').length !== 0)
                      throw Error('Uncleared rows');
                  }
                }, cycles - completed);
                completed = cycles;
                checkpoints.push({ cycles, ...(await retained()) });
              }
              await page.evaluate(async () => {
                document.getElementById('run').click();
                await new Promise(queueMicrotask);
              });
              const updateCheckpoints = [];
              let updated = 0;
              for (const updates of [0, 1, 5, 25, 100]) {
                await page.evaluate(async count => {
                  for (let i = 0; i < count; i++) {
                    document.getElementById('update').click();
                    await new Promise(queueMicrotask);
                  }
                }, updates - updated);
                updated = updates;
                updateCheckpoints.push({ updates, ...(await retained()) });
              }
              await page.evaluate(async () => {
                document.getElementById('clear').click();
                await new Promise(queueMicrotask);
                if (document.querySelectorAll('tbody>tr').length)
                  throw Error('Rows remain after update/clear');
              });
              output.samples.push({
                name,
                round,
                checkpoints,
                updateCheckpoints,
                afterUpdatesClear: await retained(),
              });
            }
            if (errors.length) throw Error(name + ': ' + errors.join('\n'));
            log('Finished diagnostic', mode, name, round + 1, '/', rounds);
            writeFileSync(
              out + '/production-' + mode + '.json',
              JSON.stringify(output, null, 2)
            );
          } finally {
            await context.close();
          }
        }
      }
    } finally {
      await browser.close();
    }
  } else {
    // Asset sizes exclude shared CSS, as the official size scenario does.
    for (const name of names) {
      const dir = folders[name];
      const files = name.startsWith('lithent') ? ['index.html', 'main.js'] : [];
      if (!files.length) continue;
      output.samples.push({
        name,
        files: files.map(file => {
          const bytes = readFileSync(dir + '/' + file);
          return {
            file,
            raw: bytes.length,
            gzip: gzipSync(bytes, { level: 9 }).length,
            br: brotliCompressSync(bytes).length,
            sha256: hash(dir + '/' + file),
          };
        }),
      });
    }
    log(JSON.stringify(output.samples, null, 2));
  }
  complete = true;
} finally {
  output.complete = complete;
  output.finishedAt = new Date().toISOString();
  output.loadEnd = loadavg();
  writeFileSync(
    out + '/production-' + mode + '.json',
    JSON.stringify(output, null, 2)
  );
  console.log = log;
  await new Promise(r => {
    server.close(r);
    server.closeAllConnections();
  });
}
