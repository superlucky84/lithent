// node cold.mjs <scenario> <pagesPerVariant> <name:mode,...>
// Close to the official runner: a new page per sample, 5 warm-up
// operations, CPU throttled 4x (none for create), a forced major GC, then
// one timed operation (script up to the next microtask; no paint).
// scenarios: select swap remove update create
import { require, serve, median } from './paths.mjs';
const { chromium } = require('@playwright/test');
const [sc, pagesStr, specsStr] = process.argv.slice(2);
const specs = specsStr.split(',');
const server = serve(8769);
const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] });
const res = Object.fromEntries(specs.map(s => [s, []]));
for (let p = 0; p < Number(pagesStr); p++) {
  const order = [...specs].sort(() => Math.random() - 0.5);
  for (const spec of order) {
    const page = await browser.newPage();
    const cdp = await page.context().newCDPSession(page);
    await page.goto('http://127.0.0.1:8769/blank.html');
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
    await page.waitForTimeout(50);
    const act = {
      select: 'b.select(i + 3)',
      swap: 'b.swap()',
      remove: 'b.remove()',
      update: 'b.update()',
      create: 'b.clear(), await new Promise(r => setTimeout(r, 0)), b.run()',
    }[sc];
    const thr = sc === 'create' ? 1 : 4;
    for (let i = 0; i < 5; i++) {
      await page.evaluate(
        `(async () => { const i = ${i}; ${act}; await new Promise(r => setTimeout(r, 0)); })()`
      );
      await page.waitForTimeout(20);
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: thr });
    await page.evaluate('gc()');
    await page.waitForTimeout(30);
    if (sc === 'create')
      await page.evaluate(
        '(async () => { b.clear(); await new Promise(r => setTimeout(r, 0)); })()'
      );
    const timed = sc === 'create' ? 'b.run()' : act;
    const ms = await page.evaluate(
      `(async () => { const i = -2; const t = performance.now(); ${timed}; await new Promise(queueMicrotask); return performance.now() - t; })()`
    );
    res[spec].push(ms);
    await page.close();
  }
}
await browser.close();
server.close();
const med = median;
const base = med(res[specs[0]]);
for (const s of specs)
  console.log(
    `${sc.padEnd(7)} ${s.padEnd(14)} median ${med(res[s]).toFixed(2)}ms  x${(med(res[s]) / base).toFixed(2)} vs ${specs[0]}  (n=${res[s].length})`
  );
