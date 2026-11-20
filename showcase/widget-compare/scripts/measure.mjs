/**
 * Measures how long each version of the widget takes to appear on the host
 * page, in Chromium, and writes results.json (docs/widget-compare/DESIGN.md
 * DC-6 to DC-8). Build first:
 *
 *   pnpm --filter lithent-widget-compare build
 *   pnpm --filter lithent-widget-compare measure [-- --runs 30]
 *
 * Every load gets a new browser context (an empty cache) and the bundle is
 * served brotli-compressed, as a CDN would. Two profiles: "mobile", with
 * Lighthouse's mobile defaults (4x slower CPU, 150 ms round trip, 1.6 Mbps),
 * and "desktop", with no throttling. Rounds rotate the order of the four
 * versions so a slow moment of the machine does not land on one of them.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { cpus, platform, release } from 'node:os';
import { extname, resolve } from 'node:path';
import { brotliCompressSync } from 'node:zlib';
import { chromium } from '@playwright/test';
import { dist, frameworks, root } from './frameworks.mjs';

const option = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
};
const runs = Number(option('runs', 30));
const warmup = 2;
const out = resolve(root, option('out', 'results.json'));

export const profiles = {
  mobile: {
    cpu: 4,
    network: {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    },
  },
  desktop: { cpu: 1, network: null },
};

const sizes = JSON.parse(readFileSync(resolve(dist, 'sizes.json'), 'utf8'));

// dist/, brotli-compressed when the browser asks for it.
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};
const compressed = new Map();
const server = createServer((request, response) => {
  let path = decodeURIComponent(new URL(request.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(dist, `.${path}`);
  let body;
  try {
    if (!file.startsWith(dist)) throw new Error('outside dist');
    body = readFileSync(file);
  } catch {
    response.writeHead(404).end();
    return;
  }
  const headers = {
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  };
  if (/\bbr\b/.test(request.headers['accept-encoding'] ?? '')) {
    if (!compressed.has(file)) compressed.set(file, brotliCompressSync(body));
    body = compressed.get(file);
    headers['Content-Encoding'] = 'br';
  }
  response.writeHead(200, headers).end(body);
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;

// Runs in the page before any of its scripts: records when the widget's
// question is in its shadow root. React and Lit render after the element is
// defined, so the definition alone is not the moment it appears.
const timing = () => {
  customElements.whenDefined('feedback-widget').then(() => {
    const element = document.querySelector('feedback-widget');
    const shown = () => element.shadowRoot?.querySelector('.question');
    const done = () => {
      window.__widgetShown = performance.now();
    };
    if (shown()) return done();
    const observer = new MutationObserver(() => {
      if (!shown()) return;
      observer.disconnect();
      done();
    });
    observer.observe(element.shadowRoot, { childList: true, subtree: true });
  });
};

const browser = await chromium.launch(
  process.env.LITHENT_CHROME
    ? { executablePath: process.env.LITHENT_CHROME }
    : {}
);
const browserVersion = browser.version();

const load = async (framework, profile) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (profile.network)
    await cdp.send('Network.emulateNetworkConditions', profile.network);
  if (profile.cpu > 1)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
  await page.addInitScript(timing);
  await page.goto(`${origin}/${framework.id}/`);
  await page.waitForFunction(() => window.__widgetShown, null, {
    timeout: 30_000,
  });
  const sample = await page.evaluate(() => {
    const script = performance
      .getEntriesByType('resource')
      .find(entry => entry.name.endsWith('/widget.js'));
    return {
      shown: window.__widgetShown,
      scriptEnd: script.responseEnd,
      transfer: script.encodedBodySize,
    };
  });
  await context.close();
  return sample;
};

// What loading the bundle leaves on window: keys that were not there before
// the page's scripts ran (DESIGN DC-5, the same check as
// e2e/widget-compare.spec.ts). The host page's own script declares only
// `const`s, which are not window properties.
const globalsOf = async framework => {
  const context = await browser.newContext();
  const page = await context.newPage();
  // Non-enumerable, so it is not one of the keys it records.
  await page.addInitScript(() =>
    Object.defineProperty(window, '__keysBefore', {
      value: Object.keys(window),
    })
  );
  await page.goto(`${origin}/${framework.id}/`);
  await page.locator('feedback-widget .question').waitFor();
  const added = await page.evaluate(() =>
    Object.keys(window).filter(key => !window.__keysBefore.includes(key))
  );
  await context.close();
  return added;
};

/** Linear-interpolated percentile of sorted numbers. */
const percentile = (sorted, p) => {
  const at = (sorted.length - 1) * p;
  const low = Math.floor(at);
  const high = Math.ceil(at);
  return sorted[low] + (sorted[high] - sorted[low]) * (at - low);
};
const summary = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const round = value => Math.round(value * 10) / 10;
  return {
    median: round(percentile(sorted, 0.5)),
    p25: round(percentile(sorted, 0.25)),
    p75: round(percentile(sorted, 0.75)),
  };
};

const results = {};
for (const framework of frameworks) {
  results[framework.id] = {
    packages: framework.packages,
    bundle: sizes[framework.id],
    globals: await globalsOf(framework),
    profiles: {},
  };
}

for (const [name, profile] of Object.entries(profiles)) {
  const samples = Object.fromEntries(frameworks.map(({ id }) => [id, []]));
  for (let round = 0; round < warmup + runs; round++) {
    const order = frameworks.map(
      (_, index) => frameworks[(index + round) % frameworks.length]
    );
    for (const framework of order) {
      const sample = await load(framework, profile);
      if (round >= warmup) samples[framework.id].push(sample);
    }
    process.stdout.write(`\r${name}: round ${round + 1}/${warmup + runs}`);
  }
  process.stdout.write('\n');
  for (const { id } of frameworks) {
    const list = samples[id];
    results[id].profiles[name] = {
      shown: summary(list.map(sample => sample.shown)),
      execute: summary(list.map(sample => sample.shown - sample.scriptEnd)),
      transfer: list[0].transfer,
      samples: list.map(sample => ({
        shown: Math.round(sample.shown * 10) / 10,
        scriptEnd: Math.round(sample.scriptEnd * 10) / 10,
      })),
    };
  }
}

await browser.close();
server.close();

const git = args =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const cpu = cpus();
writeFileSync(
  out,
  `${JSON.stringify(
    {
      measuredAt: new Date().toISOString(),
      commit: git(['rev-parse', 'HEAD']),
      dirty: git(['status', '--porcelain']) !== '',
      environment: {
        browser: `Chromium ${browserVersion}`,
        cpu: `${cpu[0]?.model ?? 'unknown'} (${cpu.length} cores)`,
        os: `${platform()} ${release()}`,
        node: process.version,
      },
      method: { runs, warmup, profiles },
      frameworks: results,
    },
    null,
    2
  )}\n`
);

const ms = value => `${Math.round(value)} ms`.padStart(8);
for (const name of Object.keys(profiles)) {
  console.log(`\n${name}: widget shown (median, p25-p75), script execution`);
  for (const { id } of frameworks) {
    const { shown, execute } = results[id].profiles[name];
    console.log(
      `${id.padEnd(8)}${ms(shown.median)}  (${Math.round(shown.p25)}-${Math.round(shown.p75)})${ms(execute.median)}`
    );
  }
}
console.log(`\nWrote ${out}`);
