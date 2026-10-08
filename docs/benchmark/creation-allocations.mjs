// Allocation diagnostics for the named bundle produced by followup-audit.mjs.
// Counters and heap sampling run separately from all timing measurements.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { cpus, totalmem } from 'node:os';

const root = fileURLToPath(new URL('../../', import.meta.url));
const app = resolve(root, '../js-framework-benchmark/frameworks/keyed/lithent');
const input =
  process.env.LITHENT_CREATION_PROFILE ||
  '/tmp/lithent-create-profile-20261008';
const out =
  process.env.LITHENT_CREATION_OUT ||
  '/tmp/lithent-create-allocations-20261008';
mkdirSync(out, { recursive: true });
const code = readFileSync(
  input + '/' + (process.env.LITHENT_CREATION_BUNDLE || 'base-profile.js'),
  'utf8'
);
const require = createRequire(root + '/package.json');
const { chromium } = require('@playwright/test');
const html = readFileSync(app + '/index.html', 'utf8')
  .replace('<link href="/css/currentStyle.css" rel="stylesheet" />', '')
  .replace('src="/src/main.tsx"', 'src="/main.js"');
const counters = [
  ['h', 'const h = (tag, props, ...children) => {'],
  [
    'normalizeChildren',
    'const remakeChildren = (nodeParentPointer, children) => {',
  ],
  ['rowModel', 'function makeRow(id, label) {'],
  ['diffAdd', 'const remakeChildrenForAdd = (newWDom) => {'],
];
let counted = code;
for (const [name, target] of counters) {
  if (!counted.includes(target))
    throw Error('Missing counter target: ' + target);
  const extra =
    name === 'diffAdd'
      ? 'if (!newWDom.children?.length) globalThis.__creationCounts.diffLeaf++;'
      : '';
  counted = counted.replace(
    target,
    target + ` globalThis.__creationCounts.${name}++; ${extra}`
  );
}
const result = {
  date: new Date().toISOString(),
  bundleSHA256: createHash('sha256').update(code).digest('hex'),
  machine: {
    cpu: cpus()[0].model,
    cores: cpus().length,
    memoryGB: totalmem() / 1024 ** 3,
  },
  counts: [],
  heaps: [],
};
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.LITHENT_AUDIT_CHROME,
});
result.browser = browser.version();
try {
  for (const instrument of [true, false]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    if (instrument)
      await page.addInitScript(() => {
        const counts = (globalThis.__creationCounts = {
          h: 0,
          normalizeChildren: 0,
          rowModel: 0,
          diffAdd: 0,
          diffLeaf: 0,
        });
        for (const [proto, key] of [
          [Document.prototype, 'createElement'],
          [Document.prototype, 'createTextNode'],
          [Element.prototype, 'setAttribute'],
          [EventTarget.prototype, 'addEventListener'],
          [Node.prototype, 'appendChild'],
          [Node.prototype, 'insertBefore'],
        ]) {
          counts[key] = 0;
          const original = proto[key];
          proto[key] = function (...args) {
            counts[key]++;
            return original.apply(this, args);
          };
        }
      });
    await page.route('http://creation.local/**', route =>
      route.fulfill({
        contentType: route.request().url().endsWith('/main.js')
          ? 'text/javascript'
          : 'text/html',
        body: route.request().url().endsWith('/main.js')
          ? instrument
            ? counted
            : code
          : html,
      })
    );
    await page.goto('http://creation.local/');
    const click = selector =>
      page.evaluate(async selector => {
        document.querySelector(selector).click();
        await new Promise(queueMicrotask);
      }, selector);
    const cdp = await page.context().newCDPSession(page);
    for (const [scenario, selector] of [
      ['create', '#run'],
      ['create10k', '#runlots'],
    ]) {
      for (let warmup = 0; warmup < 5; warmup++) {
        await click('#clear');
        await click(selector);
      }
      for (let index = 0; index < (instrument ? 1 : 5); index++) {
        await click('#clear');
        await cdp.send('HeapProfiler.collectGarbage');
        if (instrument) {
          await page.evaluate(() => {
            for (const key of Object.keys(globalThis.__creationCounts))
              globalThis.__creationCounts[key] = 0;
          });
        } else {
          await cdp.send('HeapProfiler.startSampling', {
            samplingInterval: 16384,
            includeObjectsCollectedByMajorGC: true,
            includeObjectsCollectedByMinorGC: true,
          });
        }
        await click(selector);
        if (instrument) {
          result.counts.push({
            scenario,
            ...(await page.evaluate(() => ({
              ...globalThis.__creationCounts,
            }))),
          });
        } else {
          const { profile } = await cdp.send('HeapProfiler.stopSampling');
          writeFileSync(
            `${out}/${scenario}-${index}.heapprofile`,
            JSON.stringify(profile)
          );
          const self = {};
          function walk(node) {
            const key =
              (node.callFrame.functionName || '(anonymous)') +
              ':' +
              (node.callFrame.lineNumber + 1);
            self[key] = (self[key] || 0) + node.selfSize;
            node.children.forEach(walk);
          }
          walk(profile.head);
          result.heaps.push({
            scenario,
            index,
            sampledBytes: Object.values(self).reduce((a, b) => a + b, 0),
            self: Object.entries(self).sort((a, b) => b[1] - a[1]),
          });
        }
      }
    }
    if (errors.length) throw Error(errors.join('\n'));
    await page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(out + '/allocations.json', JSON.stringify(result, null, 2));
console.log(
  JSON.stringify(
    {
      counts: result.counts,
      heaps: result.heaps.map(item => ({
        ...item,
        self: item.self.slice(0, 8),
      })),
    },
    null,
    2
  )
);
