// node browser.mjs <app> <scenario> <n> <rounds> <name...>
// Each round opens a new Chromium page per variant (order reversed every
// other round), runs 30 warm-up operations, then n timed ones on the real DOM.
// Prints the median over rounds of the mean time per operation (script and GC
// inside it; no forced layout).
// CHROMIUM sets the browser executable when Playwright's own is not installed.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { here, repo, out } from './paths.mjs';

const require = createRequire(`${repo}/package.json`);
const { chromium } = require('@playwright/test');
const [app, sc, n, rounds, ...variants] = process.argv.slice(2);
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.startsWith('/out/')
    ? out + path.slice(4)
    : here + path.slice(1);
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': path.endsWith('.html') ? 'text/html' : 'text/javascript',
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(8765);
const browser = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
const results = Object.fromEntries(variants.map(v => [v, []]));
for (let r = 0; r < Number(rounds); r++) {
  const order = r % 2 ? [...variants].reverse() : variants;
  for (const v of order) {
    const page = await browser.newPage();
    await page.goto(
      `http://127.0.0.1:8765/browser.html?v=${v}&app=${app}&sc=${sc}&n=${n}`
    );
    await page.waitForFunction(() => window.result, null, { timeout: 120000 });
    results[v].push(await page.evaluate(() => window.result));
    await page.close();
  }
}
await browser.close();
server.close();
const med = xs => [...xs].sort((a, b) => a - b)[xs.length >> 1];
for (const v of variants) {
  const rs = results[v];
  console.log(
    `${app} ${sc} ${v.padEnd(7)} perOp ${med(rs.map(r => r.perOp)).toFixed(3)} ms  (rounds: ${rs.map(r => r.perOp.toFixed(2)).join(' ')})`
  );
}
