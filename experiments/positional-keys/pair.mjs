// node pair.mjs <scenario> <n> <pages> <name:mode,...>
// Warm comparison: every variant runs in the same page, each in its own
// table, in a random order per round of 10 operations (after 3 warm-up
// rounds). Prints each variant's median per-operation time against the
// first one, and the ratio of the page medians for each page.
// scenarios: select swap remove updr create replace add clear
import { require, serve, median } from './paths.mjs';
const { chromium } = require('@playwright/test');
const [sc, nStr, pagesStr, vsStr] = process.argv.slice(2);
const vs = vsStr.split(',');
const server = serve(8767);
const browser = await chromium.launch();
const all = vs.map(() => []);
const perPage = vs.map(() => []);
const med = median;
for (let p = 0; p < Number(pagesStr); p++) {
  const page = await browser.newPage();
  const order = p % 2 ? [...vs].reverse() : vs;
  await page.goto(
    `http://127.0.0.1:8767/pair.html?vs=${order.join(',')}&sc=${sc}&n=${nStr}`
  );
  await page.waitForFunction(() => window.result, null, { timeout: 600000 });
  const r = await page.evaluate(() => window.result);
  order.forEach((v, k) => {
    const i = vs.indexOf(v);
    all[i].push(...r[k]);
    perPage[i].push(med(r[k]));
  });
  await page.close();
}
await browser.close();
server.close();
const base = med(all[0]);
for (let i = 0; i < vs.length; i++) {
  const m = med(all[i]);
  const ratios = perPage[i].map((x, p) => x / perPage[0][p]);
  console.log(
    `${sc.padEnd(7)} ${vs[i].padEnd(6)} median ${m.toFixed(3)}ms  vs ${vs[0]} ${((m / base - 1) * 100).toFixed(1).padStart(6)}%  page ratios ${ratios.map(x => x.toFixed(2)).join(' ')}`
  );
}
