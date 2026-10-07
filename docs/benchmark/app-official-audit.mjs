// App prototypes only; runtime sources and the benchmark checkout are not edited.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { loadavg } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  ''
);
const bench = root + '/../js-framework-benchmark';
const out = process.env.LITHENT_APP_AUDIT_OUT || '/tmp/lithent-app-review';
mkdirSync(out + '/traces', { recursive: true });
const { executeBenchmark } = await import(
  bench + '/webdriver-ts/dist/forkedBenchmarkRunnerPuppeteer.js'
);
const { config } = await import(bench + '/webdriver-ts/dist/common.js');
config.LOG_PROGRESS = false;
const log = console.log.bind(console);
console.log = () => {};
const originalHtml = readFileSync(
  root + '/docs/benchmark/adapter-baseline/index.html',
  'utf8'
).replace('src="/src/main.tsx"', 'src="./main.js"');
const fullHtml = originalHtml.replace(
  /<div id="main">[\s\S]*<\/div>\s*<script/,
  '<div id="main"></div><script'
);
const mode = process.argv[2] || 'cpu';
const names = (process.argv[3] || 'base,flatFull').split(',');
if (!['cpu', 'mem', 'keyed'].includes(mode))
  throw Error('Expected cpu, mem, or keyed');
for (const name of names) {
  if (readFileSync(out + '/' + name + '.js', 'utf8').includes('__cacheProbe'))
    throw Error('Rebuild without counters using app-audit.mjs measure first');
}
const server = createServer((req, res) => {
  try {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    const url = new URL(req.url, 'http://localhost'),
      parts = url.pathname.split('/').filter(Boolean);
    if (url.pathname === '/ls') {
      res.setHeader('content-type', 'application/json');
      res.end(
        JSON.stringify(
          names.map(name => ({
            type: 'keyed',
            directory: name,
            frameworkVersionString: name + '-review',
            customURL: '',
            startLogicEventName: 'click',
          }))
        )
      );
      return;
    }
    if (parts[0] === 'frameworks') parts.splice(0, 2);
    if (url.pathname.startsWith('/css/')) {
      const file = url.pathname.replace(
        '/bootstrap/dist/fonts/',
        '/bootstrap/fonts/'
      );
      res.setHeader(
        'content-type',
        file.endsWith('.css')
          ? 'text/css'
          : file.endsWith('.woff2')
            ? 'font/woff2'
            : 'application/octet-stream'
      );
      res.end(readFileSync(bench + file));
      return;
    }
    if (!names.includes(parts[0])) {
      res.writeHead(404);
      res.end();
      return;
    }
    if (parts.at(-1) === 'main.js') {
      res.setHeader('content-type', 'text/javascript');
      res.end(readFileSync(out + '/' + parts[0] + '.js'));
      return;
    }
    res.setHeader('content-type', 'text/html');
    res.end(
      parts[0].endsWith('Full') || parts[0] === 'full' ? fullHtml : originalHtml
    );
  } catch (error) {
    res.writeHead(404);
    res.end(String(error));
  }
});
await new Promise(r =>
  server.listen(mode === 'keyed' ? 8080 : 0, '127.0.0.1', r)
);
if (mode === 'keyed') {
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
  let output = '';
  child.stdout.on('data', chunk => {
    output += chunk;
    process.stdout.write(chunk);
  });
  child.stderr.on('data', chunk => {
    output += chunk;
    process.stderr.write(chunk);
  });
  const status = await new Promise(r => child.on('close', r));
  writeFileSync(out + '/keyed.log', output);
  await new Promise(r => {
    server.close(r);
    server.closeAllConnections();
  });
  if (status || /ERROR|not keyed|failed/i.test(output))
    throw Error('Official keyed check failed');
  process.exit(0);
}
const ids =
  mode === 'mem'
    ? [
        '21_ready-memory',
        '22_run-memory',
        '23_update5-memory',
        '25_run-clear-memory',
        '26_run-10k-memory',
      ]
    : [
        '01_run1k',
        '02_replace1k',
        '03_update10th1k_x16',
        '04_select1k',
        '05_swap1k',
        '06_remove-one-1k',
        '07_create10k',
        '08_create1k-after1k_x2',
        '09_clear1k_x8',
      ];
const selected = process.argv[4]
  ? ids.filter(id =>
      process.argv[4].split(',').some(prefix => id.startsWith(prefix))
    )
  : ids;
const count = mode === 'mem' ? 1 : 5;
const output = {
  mode,
  loadStart: loadavg(),
  browser: 'system Google Chrome',
  samples: [],
  iterations: count,
};
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
try {
  for (let i = 0; i < selected.length; i++) {
    const id = selected[i];
    for (const name of i % 2 ? [...names].reverse() : names) {
      const framework = {
        name,
        fullNameWithKeyedAndVersion: name + '-keyed',
        uri: name,
        keyed: true,
        useShadowRoot: false,
        useRowShadowRoot: false,
        buttonsInShadowRoot: false,
        startLogicEventName: 'click',
        issues: [],
      };
      const result = await executeBenchmark(framework, id, options);
      if (result.error) throw Error(JSON.stringify({ name, id, ...result }));
      output.samples.push({ name, id, ...result });
      const median = values => {
        const sorted = [...values].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length / 2)];
      };
      log(
        name,
        id,
        JSON.stringify(
          mode === 'mem'
            ? result.result
            : {
                total: median(result.result.map(x => x.total)),
                script: median(result.result.map(x => x.script)),
                paint: median(result.result.map(x => x.paint)),
              }
        ),
        JSON.stringify(result.warnings)
      );
      writeFileSync(
        out + '/official-' + mode + '.json',
        JSON.stringify(output, null, 2)
      );
    }
  }
} finally {
  output.loadEnd = loadavg();
  writeFileSync(
    out + '/official-' + mode + '.json',
    JSON.stringify(output, null, 2)
  );
  await new Promise(r => {
    server.close(r);
    server.closeAllConnections();
  });
}
