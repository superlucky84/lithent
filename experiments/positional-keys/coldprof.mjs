// node coldprof.mjs <name:mode> <scenario> <pages> [throttle]
// CPU profile of one operation on a new page after 5 warm-ups, summed over
// pages: self time per function (build the bundle with `debug` for names).
import { require, serve } from './paths.mjs';
const { chromium } = require('@playwright/test');
const [spec, sc, pagesStr, thr] = process.argv.slice(2);
const server = serve(8770);
const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] });
const self = new Map();
let total = 0;
let wall = 0;
const acts = {
  create: { pre: 'b.clear()', act: 'b.run()' },
  replace: { pre: '0', act: 'b.run()' },
  select: { pre: '0', act: 'b.select(i + 3)' },
  update: { pre: '0', act: 'b.update()' },
  append: { pre: 'b.run()', act: 'b.add()' },
  clear: { pre: 'b.run()', act: 'b.clear()' },
  remove: { pre: '0', act: 'b.remove()' },
}[sc];
for (let p = 0; p < Number(pagesStr); p++) {
  const page = await browser.newPage();
  const cdp = await page.context().newCDPSession(page);
  await page.goto('http://127.0.0.1:8770/blank.html');
  await page.evaluate(async spec => {
    const [vn, md] = spec.split(':');
    const tb = document.createElement('tbody');
    const t = document.createElement('table');
    t.appendChild(tb);
    document.body.appendChild(t);
    const { makeBench } = await import(`/out/${vn}/app.mjs`);
    window.b = makeBench(tb, md);
    window.b.run();
  }, spec);
  const step = async (code, i) => {
    await page.evaluate(
      `(async () => { const i = ${i}; ${code}; await new Promise(r => setTimeout(r, 0)); })()`
    );
    await page.waitForTimeout(10);
  };
  for (let i = 0; i < 5; i++) {
    await step(acts.pre, i);
    await step(acts.act, i);
  }
  await step(acts.pre, 9);
  if (thr)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(thr) });
  await page.evaluate('gc()');
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 25 });
  await cdp.send('Profiler.start');
  wall += await page.evaluate(
    `(async () => { const i = 7; const t = performance.now(); ${acts.act}; await new Promise(queueMicrotask); return performance.now() - t; })()`
  );
  const { profile } = await cdp.send('Profiler.stop');
  const byId = new Map(profile.nodes.map(x => [x.id, x]));
  profile.samples.forEach((id, k) => {
    const f = byId.get(id).callFrame;
    const dt = profile.timeDeltas[k] / 1000;
    if (['(idle)', '(program)'].includes(f.functionName)) return;
    const key = `${f.functionName || '(anon)'}:${f.lineNumber + 1}`;
    self.set(key, (self.get(key) || 0) + dt);
    total += dt;
  });
  await page.close();
}
await browser.close();
server.close();
const n = Number(pagesStr);
console.log(
  `${spec} ${sc} cold x${thr || 1}: wall ${(wall / n).toFixed(2)}ms/op, profiled ${(total / n).toFixed(2)}ms/op`
);
for (const [k, t] of [...self.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 28))
  console.log(
    `${((t / total) * 100).toFixed(1).padStart(5)}%  ${(t / n).toFixed(3).padStart(7)}ms  ${k}`
  );
