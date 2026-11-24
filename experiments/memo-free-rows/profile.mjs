// CPU profile of one scenario repeated in a page, self time by function.
// Diagnostic only: build the app unminified to get readable names.
//   node experiments/memo-free-rows/build.mjs <out> <label> <core> <helper> <apps> (with LITHENT_READABLE=1)
//   node experiments/memo-free-rows/profile.mjs <out> <app> <scenario> [repeats] [top]
// scenarios: create (run + clear), select, update, swap, replace
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('@playwright/test');

const [outArg, app, scenario = 'create', repeats = '30', top = '35'] =
  process.argv.slice(2);
const out = path.resolve(outArg);

const server = http.createServer((request, response) => {
  const file = path.join(out, decodeURIComponent(request.url.split('?')[0]));
  if (!file.startsWith(out) || !fs.existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    'content-type': file.endsWith('.js') ? 'text/javascript' : 'text/html',
  });
  response.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

const browser = await chromium.launch({
  args: ['--js-flags=--expose-gc', '--enable-benchmarking'],
});
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/${app}/index.html`);
await page.waitForSelector('#run');
const client = await page.context().newCDPSession(page);

const SCENARIOS = {
  create: { setup: [], steps: ['#run', '#clear'] },
  replace: { setup: ['#run'], steps: ['#run'] },
  select: {
    setup: ['#run'],
    steps: [
      'tbody>tr:nth-of-type(2)>td:nth-of-type(2)>a',
      'tbody>tr:nth-of-type(5)>td:nth-of-type(2)>a',
    ],
  },
  update: { setup: ['#run'], steps: ['#update'] },
  swap: { setup: ['#run'], steps: ['#swaprows'] },
};
const { setup, steps } = SCENARIOS[scenario];

const run = async ([selectors, count]) => {
  let total = 0;
  for (let i = 0; i < count; i += 1) {
    for (const selector of selectors) {
      const start = performance.now();
      document.querySelector(selector).click();
      await new Promise(resolve => queueMicrotask(resolve));
      total += performance.now() - start;
      // Let layout and paint happen outside the timed part.
      await new Promise(resolve =>
        requestAnimationFrame(() => setTimeout(resolve, 0))
      );
    }
  }
  return total / count;
};

await page.evaluate(run, [setup, 1]);
await page.evaluate(run, [steps, 5]);
await client.send('Profiler.enable');
await client.send('Profiler.setSamplingInterval', { interval: 50 });
await client.send('Profiler.start');
const perRepeat = await page.evaluate(run, [steps, Number(repeats)]);
const { profile } = await client.send('Profiler.stop');
await browser.close();
server.close();

const self = new Map();
const byId = new Map(profile.nodes.map(node => [node.id, node]));
const interval =
  (profile.endTime - profile.startTime) / (profile.samples.length || 1);
for (const id of profile.samples) {
  const { functionName, lineNumber, url } = byId.get(id).callFrame;
  const key = url
    ? `${functionName || '(anonymous)'}:${lineNumber + 1}`
    : functionName || '(native)';
  self.set(key, (self.get(key) || 0) + interval);
}
const rows = [...self].sort((a, b) => b[1] - a[1]);
const sum = rows.reduce((acc, [, value]) => acc + value, 0);
const idle = (self.get('(idle)') || 0) + (self.get('(program)') || 0);
console.log(
  `${app} ${scenario}: script ${perRepeat.toFixed(2)} ms per repeat; ` +
    `profiled ${((sum - idle) / 1000 / Number(repeats)).toFixed(2)} ms per repeat (excl. idle/program)`
);
for (const [name, value] of rows.slice(0, Number(top))) {
  console.log(
    `${(value / 1000 / Number(repeats)).toFixed(3).padStart(8)} ms  ${name}`
  );
}
