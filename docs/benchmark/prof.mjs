import { createRequire } from 'node:module';
const require = createRequire(new URL('../../package.json', import.meta.url));
const { chromium } = require('@playwright/test');

const variant = process.argv[2] || 'dist-prof';
const only = process.argv[3];
const url = `http://localhost:8080/frameworks/keyed/lithent/${variant}/index.html`;
const REPS = 10;
const row = n => `tbody>tr:nth-of-type(${n})`;

const scenarios = {
  select: { setup: ['#run'], act: i => `${row(i + 2)}>td:nth-of-type(2)>a` },
  update: { setup: ['#run'], act: () => '#update' },
  swap: { setup: ['#run'], act: () => '#swaprows' },
  remove: { setup: ['#run'], act: i => `${row(20 - i)}>td:nth-of-type(3)>a` },
  clear: { setup: [], pre: '#run', act: () => '#clear' },
  replace: { setup: ['#run'], act: () => '#run' },
};

const browser = await chromium.launch({ headless: true });
for (const [name, sc] of Object.entries(scenarios)) {
  if (only && only !== name) continue;
  const page = await browser.newPage();
  const cdp = await page.context().newCDPSession(page);
  await page.goto(url);
  const click = sel =>
    page.evaluate(
      s =>
        new Promise(res => {
          document.querySelector(s).click();
          requestAnimationFrame(() => setTimeout(res, 0));
        }),
      sel
    );
  for (const s of sc.setup) await click(s);
  // warm up the JIT on the same path
  for (let i = 0; i < 5; i++) {
    if (sc.pre) await click(sc.pre);
    await click(sc.act(i + REPS));
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
  let actMs = 0;
  const self = new Map();
  for (let i = 0; i < REPS; i++) {
    if (sc.pre) await click(sc.pre);
    await cdp.send('Profiler.start');
    const sel = sc.act(i);
    actMs += await page.evaluate(s => {
      const el = document.querySelector(s);
      const t = performance.now();
      el.click();
      return performance.now() - t;
    }, sel);
    await page.evaluate(() => new Promise(r => setTimeout(r, 0)));
    const { profile } = await cdp.send('Profiler.stop');
    const byId = new Map(profile.nodes.map(n => [n.id, n]));
    const dt = profile.timeDeltas;
    profile.samples.forEach((id, k) => {
      const n = byId.get(id).callFrame;
      const key = n.url.includes('main.js')
        ? `${n.functionName || '(anon)'}:${n.lineNumber + 1}`
        : `[${n.functionName || 'native'}]`;
      self.set(key, (self.get(key) || 0) + dt[k] / 1000);
    });
    await page.evaluate(
      () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)))
    );
  }
  const rows = [...self.entries()]
    .filter(([k]) => !['[(idle)]', '[(program)]', '[(root)]'].includes(k))
    .sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((a, [, v]) => a + v, 0);
  console.log(
    `\n== ${name}: sync click ${(actMs / REPS).toFixed(1)} ms/op, profiled ${(total / REPS).toFixed(1)} ms/op (4x throttle)`
  );
  for (const [k, v] of rows.slice(0, 14))
    console.log(
      `  ${(v / REPS).toFixed(2).padStart(7)} ms  ${((v / total) * 100).toFixed(0).padStart(3)}%  ${k}`
    );
  await page.close();
}
await browser.close();
