import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { chrome, names, fileHash, read } from './config.mjs';
import { verify } from './guard.mjs';
import { serve } from './server.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
verify(out);
const { server, url } = await serve(out);
const browser = await chromium.launch({
  headless: true,
  executablePath: chrome,
});
const result = {
  at: new Date().toISOString(),
  complete: false,
  chrome: browser.version(),
  chromeSHA256: fileHash(chrome),
  build: read(path.join(out, 'round-main/build-manifest.json')),
  samples: [],
};
try {
  for (const name of names) {
    const context = await browser.newContext();
    try {
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.goto(url + '/' + name + '/index.html');
      await page.evaluate(() => document.fonts.ready);
      const checks = await page.evaluate(async () => {
        const rows = () => [...document.querySelectorAll('tbody>tr')];
        const assert = (condition, message) => {
          if (!condition) throw Error(message);
        };
        const settle = () =>
          new Promise(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          );
        const click = async selector => {
          document.querySelector(selector).click();
          await settle();
        };
        await click('#run');
        assert(rows().length === 1000, 'create1k');
        const initial = rows();
        await click('tbody>tr:nth-child(2)>td:nth-child(2)>a');
        assert(initial[1].classList.contains('danger'), 'first selection');
        const mutations = [],
          observer = new MutationObserver(records =>
            mutations.push(...records)
          );
        observer.observe(document.querySelector('tbody'), {
          subtree: true,
          attributes: true,
          characterData: true,
          childList: true,
        });
        await click('tbody>tr:nth-child(3)>td:nth-child(2)>a');
        assert(
          !initial[1].classList.contains('danger') &&
            initial[2].classList.contains('danger'),
          'selection move'
        );
        const selection = {
          attributes: mutations.filter(x => x.type === 'attributes').length,
          childList: mutations.filter(x => x.type === 'childList').length,
        };
        mutations.length = 0;
        const labels = initial.map(row => row.cells[1].textContent);
        await click('#update');
        assert(
          rows().every(
            (row, i) =>
              row === initial[i] &&
              row.cells[1].textContent === labels[i] + (i % 10 ? '' : ' !!!')
          ),
          'partial identity/value'
        );
        const partial = {
          text: mutations.filter(x => x.type === 'characterData').length,
          childList: mutations.filter(x => x.type === 'childList').length,
        };
        observer.disconnect();
        await click('#swaprows');
        assert(
          rows()[1] === initial[998] && rows()[998] === initial[1],
          'swap identity'
        );
        await click('tbody>tr:nth-child(999)>td:nth-child(2)>a');
        assert(initial[1].classList.contains('danger'), 'event after swap');
        await click('tbody>tr:nth-child(999)>td:nth-child(3)>a');
        assert(
          rows().length === 999 && !rows().includes(initial[1]),
          'remove selected'
        );
        await click('#run');
        assert(
          rows().length === 1000 && rows().every(row => !initial.includes(row)),
          'replace independent nodes'
        );
        const replaced = rows();
        await click('#add');
        assert(
          rows().length === 2000 &&
            replaced.every((row, i) => rows()[i] === row),
          'append identity'
        );
        await click('#clear');
        assert(rows().length === 0, 'clear');
        await click('#runlots');
        assert(rows().length === 10000, '10k');
        await click('#clear');
        assert(rows().length === 0, 'clear10k');
        return {
          scenarios: 9,
          selection,
          partial,
          fontLoaded: document.fonts.check('16px "Glyphicons Halflings"'),
          note: 'Mutation counts recorded; framework-specific mutation strategy not constrained',
        };
      });
      assert.deepEqual(errors, []);
      assert.equal(checks.fontLoaded, true);
      result.samples.push({ name, ...checks, errors });
      console.log(name, 'DOM contracts passed');
    } finally {
      await context.close();
    }
  }
  verify(out);
  result.complete = true;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(
    path.join(out, 'contracts.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
}
