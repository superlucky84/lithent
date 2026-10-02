/**
 * B-1 — 입력 응답성. 목록이 입력마다 통째로 바뀌는 화면에서 타이핑 중 입력→페인트 지연을 잰다.
 *
 *   pnpm build && node docs/concurrent-rendering/bench/input-latency.mjs
 *   SIZES=5000,10000 REPS=5 CHROMIUM_PATH=/path/to/chrome node ...   (선택)
 *
 * 세 구성: base 동기 / concurrent 동기 / concurrent deferRender (입력과 목록은 다른 컴포넌트).
 * 12글자를 90ms 간격으로 입력하고 구성·행 수마다 REPS회의 중앙값을 낸다.
 * 입력→페인트 지연 = input 이벤트의 timeStamp부터 다음 rAF+macrotask까지.
 * 결과는 OUT_DIR(기본: 이 폴더)의 input-latency-results.json에도 쓴다.
 */
import http from 'http'; import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const here = path.dirname(new URL(import.meta.url).pathname); const repo = path.resolve(here, '../../..');
const { chromium } = createRequire(repo + '/package.json')('@playwright/test');
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const f = u.pathname === '/page.html' ? path.join(here, 'input-latency.html') : path.join(repo, u.pathname);
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'text/javascript' }); res.end(d); });
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--disable-renderer-backgrounding','--disable-background-timer-throttling'] });
const sizes = (process.env.SIZES || '1000,5000,10000,20000').split(',').map(Number); const REPS = +(process.env.REPS || 5);
const configs = [['base','sync'],['concurrent','sync'],['concurrent','defer']];
const med = a => { const s=[...a].sort((x,y)=>x-y); return s[Math.floor(s.length/2)]; };
const out = [];
for (const rows of sizes) for (const [core, mode] of configs) {
  const runs = [];
  for (let r = 0; r < REPS; r++) {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/page.html?core=${core}&mode=${mode}&rows=${rows}`);
    await page.waitForFunction(() => window.__ready); await page.waitForTimeout(300);
    await page.focus('#in'); await page.evaluate(() => window.__mark()); const text = 'abcdefghijkl';
    await page.keyboard.type(text, { delay: 90 });
    runs.push(await page.evaluate(t => window.__result(t), text)); await page.close();
  }
  const m = k => +med(runs.map(x => x[k])).toFixed(1);
  const row = { rows, core, mode, p50: m('p50'), p95: m('p95'), max: m('max'), maxLong: m('maxLong'), nLong: m('nLong'), maxGap: m('maxGap'), settle: m('settle') };
  out.push(row); console.log(JSON.stringify(row)); fs.writeFileSync(path.join(process.env.OUT_DIR || here, 'input-latency-results.json'), JSON.stringify(out, null, 2));
}
await browser.close(); server.close();
fs.writeFileSync(path.join(process.env.OUT_DIR || here, 'input-latency-results.json'), JSON.stringify(out, null, 2));
