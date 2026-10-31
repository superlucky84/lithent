// node verify.mjs <name:mode...>
// Runs each bundle through the benchmark operations and the row buttons and
// prints what the DOM shows after each: every variant must print the same.
import { require, serve } from './paths.mjs';
const { chromium } = require('@playwright/test');
const specs = process.argv.slice(2);
const server = serve(8768);
const browser = await chromium.launch();
for (const spec of specs) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://127.0.0.1:8768/blank.html');
  const r = await page.evaluate(async spec => {
    const [vn, md] = spec.split(':');
    const tb = document.createElement('tbody');
    const t = document.createElement('table');
    t.appendChild(tb);
    document.body.appendChild(t);
    const { makeBench } = await import(`/out/${vn}/app.mjs`);
    const b = makeBench(tb, md);
    const f = () => new Promise(r => setTimeout(r, 0));
    const snap = () =>
      [...tb.querySelectorAll('tr')]
        .map(
          tr =>
            `${tr.className}|${tr.children[0].textContent}|${tr.children[1].textContent}`
        )
        .join(';');
    const out = [];
    b.run();
    await f();
    out.push(tb.children.length);
    b.select(0);
    await f();
    out.push(
      tb.querySelectorAll('tr.danger').length,
      tb.querySelector('tr.danger')?.children[0].textContent
    );
    b.select(1);
    await f();
    out.push(
      tb.querySelectorAll('tr.danger').length,
      tb.querySelector('tr.danger')?.children[0].textContent
    );
    b.update();
    await f();
    out.push(
      tb.children[0].children[1].textContent.endsWith('!!!'),
      tb.children[1].children[1].textContent.endsWith('!!!')
    );
    b.swap();
    await f();
    out.push(
      tb.children[1].children[0].textContent,
      tb.children[998].children[0].textContent
    );
    b.remove();
    await f();
    out.push(tb.children.length, tb.children[19].children[0].textContent);
    // click handlers
    tb.children[5].children[1].firstChild.click();
    await f();
    out.push(tb.children[5].className);
    tb.children[5].children[2].firstChild.click();
    await f();
    out.push(tb.children.length);
    b.add();
    await f();
    out.push(tb.children.length);
    b.clear();
    await f();
    out.push(tb.children.length);
    return out.join(',');
  }, spec);
  console.log(spec.padEnd(12), r, errs.length ? 'ERR ' + errs[0] : '');
  await page.close();
}
await browser.close();
server.close();
