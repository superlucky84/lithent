// Diagnostic only, after the official collection: time Clear on the four
// built apps in one Chrome, interleaved by round with shuffled app order.
// Lithent redraws in a microtask (`queueMicrotask`), so `script` runs from
// the click to a few awaited microtasks later, after the redraw; `layout`
// adds the forced style/layout that follows. CPU is throttled 8x like
// 09_clear1k_x8. Not an official score.
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';

const out = fs.realpathSync(process.argv[2]);
const rounds = Number(process.argv[3] || 40);
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const initial = read(path.join(out, 'initial.json'));
const runner = read(path.join(out, 'runner-inputs.json'));
const require = createRequire(path.join(runner.installed, 'noop.js'));
const puppeteer = require('puppeteer-core');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
};
const server = createServer((req, res) => {
  const parts = new URL(req.url, 'http://x').pathname
    .split('/')
    .filter(Boolean);
  const base =
    parts[0] === 'css'
      ? path.join(runner.bench, 'css')
      : path.join(out, 'apps', parts[0]);
  let file = path.join(base, ...parts.slice(1));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory())
    file = path.join(file, 'index.html');
  if (!file.startsWith(base) || !fs.existsSync(file))
    return res.writeHead(404).end();
  res.writeHead(200, {
    'content-type': types[path.extname(file)] || 'application/octet-stream',
  });
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browser = await puppeteer.launch({
  executablePath: initial.browser.binary,
  headless: true,
  args: ['--headless=new', '--js-flags=--expose-gc'],
  protocolTimeout: 60000,
});

const median = a => {
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2
    ? s[(s.length - 1) / 2]
    : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
// One sample: create 1,000 rows, settle, GC, then time Clear.
const sample = async () => {
  const flush = async () => {
    for (let i = 0; i < 4; i++) await Promise.resolve();
  };
  document.getElementById('run').click();
  await flush();
  if (document.querySelectorAll('#tbody > tr').length !== 1000)
    throw new Error('not created');
  document.body.offsetHeight;
  await new Promise(r => requestAnimationFrame(() => setTimeout(r, 20)));
  window.gc();
  const t0 = performance.now();
  document.getElementById('clear').click();
  await flush();
  const t1 = performance.now();
  document.body.offsetHeight;
  const t2 = performance.now();
  if (document.getElementById('tbody').childNodes.length)
    throw new Error('not cleared');
  return { script: t1 - t0, layout: t2 - t0 };
};

// A page reused for a whole run kept its own bias (two such runs disagreed:
// clear-ab-60/150.json), so every round opens a fresh page per app.
const perPage = 3;
const samples = Object.fromEntries(initial.names.map(n => [n, []]));
const order = [];
try {
  let seed = 1;
  const rand = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  for (let r = 0; r < rounds; r++) {
    const names = [...initial.names].sort(() => rand() - 0.5);
    order.push(names);
    for (const name of names) {
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}/${name}/`);
      await page.emulateCPUThrottling(8);
      for (let i = 0; i < 2; i++) await page.evaluate(sample); // warm-up
      const raw = [];
      for (let i = 0; i < perPage; i++) raw.push(await page.evaluate(sample));
      await page.close();
      samples[name].push({
        script: median(raw.map(x => x.script)),
        layout: median(raw.map(x => x.layout)),
        raw,
      });
    }
  }
} finally {
  await browser.close();
  server.close();
}

const summary = {};
for (const [name, rows] of Object.entries(samples)) {
  summary[name] = {
    script: median(rows.map(r => r.script)),
    layout: median(rows.map(r => r.layout)),
  };
}
const pairs = {};
for (const [base, cand] of [
  ['baseline', 'candidate'],
  ['rows-baseline', 'rows-candidate'],
]) {
  const won = rows =>
    samples[cand].filter((c, i) => c[rows] < samples[base][i][rows]).length;
  pairs[`${cand}/${base}`] = {
    script: summary[cand].script / summary[base].script - 1,
    layout: summary[cand].layout / summary[base].layout - 1,
    roundsFasterScript: won('script'),
    roundsFasterLayout: won('layout'),
    rounds,
  };
}
fs.writeFileSync(
  path.join(out, `clear-ab-fresh-${rounds}.json`),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      browser: initial.browser.files,
      throttle: 8,
      rounds,
      perPage,
      warmup: 2,
      summary,
      pairs,
      order,
      samples,
    },
    null,
    1
  ) + '\n',
  { flag: 'wx' }
);
console.log(summary, pairs);
