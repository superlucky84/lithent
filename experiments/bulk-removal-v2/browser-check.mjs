// Real Chrome check: after creating 1,000 rows, count the tbody childList
// records produced by Clear. Not a timing; run outside CPU/memory collection.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';

const out = fs.realpathSync(process.argv[2]);
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
  const file = path.join(base, ...parts.slice(1)) || base;
  const target =
    fs.existsSync(file) && fs.statSync(file).isDirectory()
      ? path.join(file, 'index.html')
      : file;
  if (!target.startsWith(base) || !fs.existsSync(target)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    'content-type': types[path.extname(target)] || 'application/octet-stream',
  });
  res.end(fs.readFileSync(target));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browser = await puppeteer.launch({
  executablePath: initial.browser.binary,
  headless: true,
  args: ['--headless=new'],
});
const results = {};
try {
  for (const name of initial.names) {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/${name}/`);
    await page.click('#run');
    await page.waitForFunction(
      () => document.querySelectorAll('#tbody > tr').length === 1000
    );
    await page.evaluate(() => {
      const records = (window.__records = []);
      new MutationObserver(list => records.push(...list)).observe(
        document.getElementById('tbody'),
        { childList: true }
      );
    });
    await page.click('#clear');
    await page.waitForFunction(
      () => document.querySelectorAll('#tbody > tr').length === 0
    );
    results[name] = await page.evaluate(() => {
      const removals = window.__records.filter(r => r.removedNodes.length);
      return {
        removalRecords: removals.length,
        removedNodes: removals.reduce((n, r) => n + r.removedNodes.length, 0),
        additions: window.__records.filter(r => r.addedNodes.length).length,
        tbodyChildren: document.getElementById('tbody').childNodes.length,
      };
    });
    // Rows must come back after a clear.
    await page.click('#run');
    await page.waitForFunction(
      () => document.querySelectorAll('#tbody > tr').length === 1000
    );
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
for (const [name, r] of Object.entries(results)) {
  assert.equal(r.tbodyChildren, 0, name);
  assert.equal(r.removedNodes, 1000, name);
}
fs.writeFileSync(
  path.join(out, 'browser-check.json'),
  JSON.stringify(
    { at: new Date().toISOString(), browser: initial.browser.files, results },
    null,
    2
  ) + '\n',
  { flag: 'wx' }
);
console.log(results);
