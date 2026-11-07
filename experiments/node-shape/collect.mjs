// V8 attribution and object observation, never official CPU/memory measurements.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
import { hash, guard } from '../keyed-placement/init.mjs';

const out = fs.realpathSync(process.argv[2]);
const mode = process.argv[3];
const isProbe = mode.startsWith('probe');
assert.ok(
  [
    'production',
    'probe',
    'probe-candidate',
    'layout-baseline',
    'layout-candidate',
  ].includes(mode)
);
guard(out);
const dest = path.join(out, mode + '-diagnostic');
assert.equal(
  fs.existsSync(dest),
  false,
  'Choose a fresh run; preserve previous diagnostics'
);
fs.mkdirSync(dest);
const chrome =
  '/tmp/lithent-shape-chrome-156.0.8078.47.app/Contents/MacOS/Google Chrome';
const engine = path.resolve(
  chrome,
  '../../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
);
const frozen = {
  chrome: hash(fs.readFileSync(chrome)),
  engine: hash(fs.readFileSync(engine)),
};
const server = createServer((req, res) => {
  try {
    const file = path.resolve(
      out,
      '.' + new URL(req.url, 'http://localhost').pathname
    );
    assert.ok(file.startsWith(out + '/'));
    res.setHeader(
      'content-type',
      file.endsWith('.html')
        ? 'text/html'
        : file.endsWith('.map')
          ? 'application/json'
          : 'text/javascript'
    );
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = 'http://127.0.0.1:' + server.address().port;
const flags = [
  '--allow-natives-syntax',
  '--log-ic',
  '--log-maps',
  '--log-maps-details',
  '--trace-deopt',
  '--logfile=' + path.join(dest, 'v8.log'),
];
const stdout = [],
  stderr = [];
let browserServer, browser;
const result = {
  at: new Date().toISOString(),
  complete: false,
  mode,
  flags,
  frozen,
  runs: [],
  note: 'Separate Chrome156 flagged diagnostic; not DC-16 Chrome155 timing, official CPU, or retained-memory evidence.',
};

// Probe-only code. Intrinsics are compiled by Chrome, never by Node/TypeScript.
const setupProbe = String.raw`(() => {
  const info = new WeakMap(), selected = new Set(), samples = [], counts = {}, sampleKeys = new Set(), quotas = {};
  let nextId = 0, phase = 'initial';
  const bump = (key, n = 1) => counts[key] = (counts[key] || 0) + n;
  const fields = node => Reflect.ownKeys(node).map(key => typeof key === 'symbol' ? String(key) : key);
  globalThis.__shape = {
    roots: [], samples,
    begin(name) { phase = name; for (const key of Object.keys(counts)) delete counts[key]; },
    observe(node, stage, site) {
      let record = info.get(node);
      if (!record) { record = { id: ++nextId, site: site || 'external' }; info.set(node, record); }
      const type = node.ctor ? 'component' : node.type || 'empty';
      const fast = %HasFastProperties(node);
      bump(stage + ':' + record.site); bump(fast ? 'fastObservations' : 'dictionaryObservations');
      if (stage === 'create') {
        const key = phase + ':' + record.site + ':' + type;
        quotas[key] = (quotas[key] || 0) + 1;
        if (quotas[key] <= 2) selected.add(record.id);
      }
      const sampleKey = phase + ':' + stage + ':' + record.id;
      if (selected.has(record.id) && !sampleKeys.has(sampleKey)) {
        sampleKeys.add(sampleKey);
        const token = 'SHAPE_SAMPLE:' + samples.length;
        samples.push({ token, phase, stage, id: record.id, site: record.site, type, fields: fields(node), fast });
        %DebugPrint(token); %DebugPrint(node);
      }
    },
    finish() {
      const seen = new Set(), reps = [], groups = [], byType = {};
      let fast = 0, dictionary = 0;
      const visit = node => {
        if (!node || seen.has(node) || node.il) return;
        seen.add(node);
        const type = node.ctor ? 'component' : node.type || 'empty';
        byType[type] = (byType[type] || 0) + 1;
        %HasFastProperties(node) ? fast++ : dictionary++;
        let index = reps.findIndex(other => %HaveSameMap(node, other));
        if (index < 0) { index = reps.length; reps.push(node); groups.push({ count: 0, types: {}, fields: fields(node) }); }
        groups[index].count++; groups[index].types[type] = (groups[index].types[type] || 0) + 1;
        for (const child of node.children || []) visit(child);
      };
      for (const initial of this.roots) {
        const current = initial.compProps && this.module.componentMap.get(initial.compProps);
        visit(current && current.vd.value || initial);
      }
      return { phase, counts: { ...counts }, live: { nodes: seen.size, fast, dictionary, byType, mapGroups: groups.length, groups }, sampleCount: samples.length };
    }
  };
  const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function(type, ...rest) { if (this instanceof Element && type === 'click') bump('clickListenerAdds'); return Reflect.apply(add, this, [type, ...rest]); };
  EventTarget.prototype.removeEventListener = function(type, ...rest) { if (this instanceof Element && type === 'click') bump('clickListenerRemoves'); return Reflect.apply(remove, this, [type, ...rest]); };
})()`;

try {
  browserServer = await chromium.launchServer({
    executablePath: chrome,
    headless: true,
    args: ['--js-flags=' + flags.join(' ')],
  });
  browserServer.process().stdout?.on('data', chunk => stdout.push(chunk));
  browserServer.process().stderr?.on('data', chunk => stderr.push(chunk));
  browser = await chromium.connect(browserServer.wsEndpoint());
  result.browser = browser.version();
  const cdp = await browser.newBrowserCDPSession();
  result.version = await cdp.send('Browser.getVersion');
  const scenarios = isProbe
    ? mode === 'probe-candidate'
      ? ['probe-unified-original', 'probe-unified-components']
      : ['probe-original', 'probe-components']
    : [mode, mode, mode];
  for (const [index, scenario] of scenarios.entries()) {
    const context = await browser.newContext();
    const run = { index, scenario, phases: [], errors: [], console: [] };
    result.runs.push(run);
    try {
      if (isProbe) await context.addInitScript(setupProbe);
      const page = await context.newPage();
      page.on('pageerror', error => run.errors.push(String(error)));
      page.on('console', message => {
        if (message.type() === 'error') run.console.push(message.text());
      });
      await page.goto(url + '/' + scenario + '/index.html');
      await page
        .locator(scenario.endsWith('components') ? 'input' : '#run')
        .first()
        .waitFor();
      run.appURL = url + '/' + scenario + '/main.js';
      if (isProbe) {
        await page.evaluate(async appURL => {
          globalThis.__shape.module = await import(appURL);
        }, run.appURL);
        run.phases.push(await page.evaluate(() => globalThis.__shape.finish()));
      }
      async function phase(name, operation) {
        if (isProbe)
          await page.evaluate(name => globalThis.__shape.begin(name), name);
        const marker =
          '__shape_phase_' + index + '_' + name.replaceAll('-', '_');
        // Named marker functions yield code-creation timestamps in the same renderer log.
        const body = `async function ${marker}_start() { ${operation}; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }\nawait ${marker}_start();\nfunction ${marker}_end(){}\n${marker}_end();`;
        await page.evaluate('(async () => {\n' + body + '\n})()');
        const rows = await page.locator('tbody>tr').count();
        const record = { name, marker, rows };
        if (isProbe)
          record.observation = await page.evaluate(() =>
            globalThis.__shape.finish()
          );
        run.phases.push(record);
      }
      if (scenario.endsWith('components')) {
        await phase('component-update', 'await globalThis.__fixture.update()');
        await phase('component-local', 'await globalThis.__fixture.local()');
        await phase('component-clear', 'await globalThis.__fixture.clear()');
        assert.equal(await page.locator('input').count(), 0);
        await phase('component-dispose', 'globalThis.__fixture.dispose()');
      } else {
        await phase('create1k', "document.querySelector('#run').click()");
        assert.equal(await page.locator('tbody>tr').count(), 1000);
        await page.evaluate(() => {
          globalThis.__initialRows = [...document.querySelectorAll('tbody>tr')];
          globalThis.__initialLabels = globalThis.__initialRows.map(
            row => row.cells[1].textContent
          );
        });
        for (let i = 0; i < 10; i++) {
          await phase(
            'select-' + i,
            `document.querySelector('tbody>tr:nth-child(${i + 2})>td:nth-child(2)>a').click()`
          );
          await phase(
            'partial-' + i,
            "document.querySelector('#update').click()"
          );
        }
        assert.ok(
          await page.evaluate(() =>
            [...document.querySelectorAll('tbody>tr')].every(
              (row, i) =>
                row === globalThis.__initialRows[i] &&
                row.cells[1].textContent ===
                  globalThis.__initialLabels[i] +
                    (i % 10 ? '' : ' !!!'.repeat(10))
            )
          )
        );
        await phase('clear1k', "document.querySelector('#clear').click()");
        assert.equal(await page.locator('tbody>tr').count(), 0);
        await phase('create10k', "document.querySelector('#runlots').click()");
        assert.equal(await page.locator('tbody>tr').count(), 10000);
        await phase('clear10k', "document.querySelector('#clear').click()");
        assert.equal(await page.locator('tbody>tr').count(), 0);
      }
      if (isProbe)
        run.samples = await page.evaluate(() => globalThis.__shape.samples);
      assert.deepEqual(run.errors, []);
    } finally {
      await context.close();
    }
  }
  result.complete = true;
} finally {
  if (browser) await browser.close();
  if (browserServer) await browserServer.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(dest, 'stdout.log'), Buffer.concat(stdout));
  fs.writeFileSync(path.join(dest, 'stderr.log'), Buffer.concat(stderr));
  assert.equal(hash(fs.readFileSync(chrome)), frozen.chrome);
  assert.equal(hash(fs.readFileSync(engine)), frozen.engine);
  guard(out);
  fs.writeFileSync(
    path.join(dest, 'result.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
}
console.log(
  JSON.stringify({
    complete: result.complete,
    mode,
    browser: result.browser,
    runs: result.runs.length,
    phases: result.runs.map(run => run.phases.length),
    frozen,
  })
);
