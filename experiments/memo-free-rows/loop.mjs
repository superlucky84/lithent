// Steady-state script time: each scenario repeated many times in one page.
// Less faithful than measure.mjs (the JIT is fully warm, no forced GC, no CPU
// throttling) but far less noisy, so it is used to compare core candidates.
//   node experiments/memo-free-rows/loop.mjs <out> <apps> [scenarios] [repeats] [pages]
// Prints, per scenario and app, the lowest per-page mean (ms per repeat).
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [outArg, appsArg, scenariosArg, repeats = '40', pages = '3'] =
  process.argv.slice(2);
const out = path.resolve(outArg);
const apps = appsArg.split(',');

const link = n => `tbody>tr:nth-of-type(${n})>td:nth-of-type(2)>a`;
const icon = n => `tbody>tr:nth-of-type(${n})>td:nth-of-type(3)>a>span`;
// timed: clicks whose script time is summed; untimed: clicks between repeats.
const SCENARIOS = {
  create: { setup: [], timed: ['#run'], untimed: ['#clear'] },
  clear: { setup: [], timed: ['#clear'], untimed: ['#run'], first: ['#run'] },
  replace: { setup: ['#run'], timed: ['#run'], untimed: [] },
  append: {
    setup: [],
    timed: ['#add'],
    untimed: ['#clear', '#run'],
    first: ['#run'],
  },
  select: { setup: ['#run'], timed: [link(2)], untimed: [link(5)] },
  update: { setup: ['#run'], timed: ['#update'], untimed: [] },
  swap: { setup: ['#run'], timed: ['#swaprows'], untimed: [] },
  remove: { setup: ['#run'], timed: [icon(4)], untimed: [], reset: 100 },
};
const scenarios = (scenariosArg || Object.keys(SCENARIOS).join(',')).split(',');

const server = http.createServer((request, response) => {
  const file = path.join(out, decodeURIComponent(request.url.split('?')[0]));
  if (!file.startsWith(out) || !fs.existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    'content-type': file.endsWith('.js') ? 'text/javascript' : 'text/html',
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-embedder-policy': 'require-corp',
  });
  response.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  args: ['--js-flags=--expose-gc', '--enable-benchmarking'],
});

const run = async ([scenario, count]) => {
  const click = async (selector, timed) => {
    const start = performance.now();
    document.querySelector(selector).click();
    await new Promise(resolve => queueMicrotask(resolve));
    const elapsed = performance.now() - start;
    if (!timed) {
      await new Promise(resolve => queueMicrotask(resolve));
    }
    return elapsed;
  };
  const frame = () =>
    new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  for (const selector of scenario.setup) await click(selector);
  for (const selector of scenario.first || []) await click(selector);
  await frame();
  let total = 0;
  for (let i = -5; i < count; i += 1) {
    if (scenario.reset && i > 0 && i % scenario.reset === 0) {
      await click('#run');
      await frame();
    }
    let elapsed = 0;
    for (const selector of scenario.timed)
      elapsed += await click(selector, true);
    if (i >= 0) total += elapsed;
    await frame();
    for (const selector of scenario.untimed) await click(selector);
    if (scenario.untimed.length) await frame();
  }
  return total / count;
};

const result = {};
for (const name of scenarios) {
  result[name] = {};
  for (let page = 0; page < Number(pages); page += 1) {
    for (const app of page % 2 ? [...apps].reverse() : apps) {
      const context = await browser.newContext();
      const tab = await context.newPage();
      await tab.goto(`${origin}/${app}/index.html`);
      await tab.waitForSelector('#run');
      const mean = await tab.evaluate(run, [SCENARIOS[name], Number(repeats)]);
      result[name][app] = Math.min(result[name][app] ?? Infinity, mean);
      await context.close();
    }
  }
}
await browser.close();
server.close();

console.log(''.padEnd(10) + apps.map(app => app.padStart(18)).join(''));
for (const name of scenarios) {
  console.log(
    name.padEnd(10) +
      apps.map(app => result[name][app].toFixed(3).padStart(18)).join('')
  );
}
if (process.env.LITHENT_LOOP_JSON) {
  fs.writeFileSync(
    process.env.LITHENT_LOOP_JSON,
    JSON.stringify({ repeats, pages, result }, null, 1) + '\n'
  );
}
