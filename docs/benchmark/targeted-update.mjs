// Compare public-API adapter variants with the upstream production toolchain.
// Builds and raw results stay outside both checkouts. No runtime transforms.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  realpathSync,
} from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { loadavg } from 'node:os';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const bench = resolve(
  process.env.LITHENT_BENCHMARK_ROOT ||
    resolve(root, '../js-framework-benchmark-upstream')
);
const out = resolve(
  process.env.LITHENT_PRODUCTION_OUT || '/tmp/lithent-targeted-update-20261019'
);
const app = bench + '/frameworks/keyed/lithent';
const mode = process.argv[2] || 'prepare';
const hash = data => createHash('sha256').update(data).digest('hex');
mkdirSync(out, { recursive: true });

if (mode === 'suite') {
  const run = (args, extra = {}) =>
    execFileSync(process.execPath, [fileURLToPath(import.meta.url), ...args], {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, ...extra },
    });
  run(['prepare']);
  run(['inventory']);
  run(['contracts']);
  run(['diagnostic', 'lithent-before,lithent', 'swap,create']);
  run(['verify']);
  run(['cpu', 'lithent-before,lithent']);
  cpSync(out + '/production-cpu.json', out + '/production-cpu-main.json');
  run([
    'cpu',
    'lithent,lithent-before,react-hooks,preact-hooks,react-classes,preact-classes',
    '03,04',
  ]);
  cpSync(out + '/production-cpu.json', out + '/production-cpu-targets.json');
  run(['mem', 'lithent-before,lithent', '22,25']);
  run(['retention', 'lithent-before,lithent']);
} else if (mode === 'peers' || mode === 'inventory') {
  const versions = existsSync(out + '/versions.json')
    ? JSON.parse(readFileSync(out + '/versions.json'))
    : {};
  for (const name of [
    'react-hooks',
    'preact-hooks',
    'react-classes',
    'preact-classes',
  ]) {
    const stage = (process.env.LITHENT_PEERS_OUT || out) + '/peers/' + name;
    if (mode === 'peers') {
      if (existsSync(stage + '/node_modules'))
        throw Error('Peer already installed: ' + stage);
      cpSync(bench + '/frameworks/keyed/' + name, stage, {
        recursive: true,
        filter: source =>
          !['node_modules', 'dist'].includes(source.split('/').pop()),
      });
      execFileSync('npm', ['ci', '--no-audit', '--no-fund'], {
        cwd: stage,
        stdio: 'inherit',
      });
      execFileSync('npm', ['run', 'build-prod'], {
        cwd: stage,
        stdio: 'inherit',
      });
    }
    const pkg = name.startsWith('react') ? 'react' : 'preact';
    versions[name] = {
      version: JSON.parse(
        readFileSync(stage + '/node_modules/' + pkg + '/package.json')
      ).version,
      lock: hash(readFileSync(stage + '/package-lock.json')),
      bundle: hash(readFileSync(stage + '/dist/main.js')),
    };
    writeFileSync(out + '/versions.json', JSON.stringify(versions, null, 2));
  }
} else if (mode === 'install') {
  const source = readFileSync(out + '/sources/lithent/src/main.tsx');
  const original = readFileSync(out + '/sources/lithent-before/src/main.tsx');
  const candidateFile =
    process.env.LITHENT_CANDIDATE_SOURCE ||
    root + '/docs/benchmark/targeted-main.tsx';
  if (!source.equals(readFileSync(candidateFile)))
    throw Error('Candidate differs from measured source');
  if (!original.equals(readFileSync(app + '/src/main.tsx')))
    throw Error('Upstream app changed since baseline snapshot');
  cpSync(candidateFile, app + '/src/main.tsx');
  execFileSync('npm', ['run', 'build-prod'], { cwd: app, stdio: 'inherit' });
  const installed = hash(readFileSync(app + '/dist/main.js'));
  const measured = hash(readFileSync(out + '/lithent/main.js'));
  if (installed !== measured)
    throw Error('Installed bundle differs from measured bundle');
  writeFileSync(
    out + '/installed.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        source: hash(source),
        bundle: installed,
        measured,
        app,
      },
      null,
      2
    )
  );
  console.log(
    'Installed the measured source and identical production bundle:',
    app
  );
} else if (
  ['verify', 'cpu', 'mem', 'retention', 'verify-installed'].includes(mode)
) {
  const peerOut = process.env.LITHENT_PEERS_OUT || out;
  const folders = Object.fromEntries(
    ['react-hooks', 'preact-hooks', 'react-classes', 'preact-classes'].map(
      name => [name, peerOut + '/peers/' + name]
    )
  );
  const runOut = mode === 'verify-installed' ? out + '/installed-check' : out;
  if (mode === 'verify-installed') {
    folders.lithent = app + '/dist';
    mkdirSync(runOut, { recursive: true });
    for (const file of ['build-manifest.json', 'versions.json'])
      cpSync(out + '/' + file, runOut + '/' + file);
  }
  execFileSync(
    process.execPath,
    [
      root + '/docs/benchmark/production-run.mjs',
      mode === 'verify-installed' ? 'verify' : mode,
      process.argv[3] ||
        (mode === 'verify-installed'
          ? 'lithent'
          : 'lithent-before,lithent,react-hooks,preact-hooks,react-classes,preact-classes'),
      ...(process.argv[4] ? [process.argv[4]] : []),
    ],
    {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        LITHENT_BENCHMARK_ROOT: bench,
        LITHENT_PRODUCTION_OUT: runOut,
        LITHENT_PRODUCTION_FOLDERS: JSON.stringify(folders),
      },
    }
  );
} else if (mode === 'prepare') {
  const { build, loadConfigFromFile } = await import(
    app + '/node_modules/vite/dist/node/index.js'
  );
  const { config } = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    app + '/vite.config.js'
  );
  const core = app + '/node_modules/lithent/dist/lithent.mjs';
  const helper = app + '/node_modules/lithent/helper/dist/lithentHelper.mjs';
  const original = readFileSync(
    process.env.LITHENT_BASELINE_SOURCE || app + '/src/main.tsx',
    'utf8'
  );
  const candidate = readFileSync(
    process.env.LITHENT_CANDIDATE_SOURCE ||
      root + '/docs/benchmark/targeted-main.tsx',
    'utf8'
  );
  const variants = { 'lithent-before': original, lithent: candidate };
  const manifest = {};
  for (const [name, source] of Object.entries(variants)) {
    if (existsSync(out + '/' + name + '/main.js'))
      throw Error('Build already exists: ' + name);
    const stage = out + '/sources/' + name;
    const variantCore =
      name === 'lithent' && process.env.LITHENT_CANDIDATE_CORE
        ? resolve(process.env.LITHENT_CANDIDATE_CORE)
        : core;
    mkdirSync(stage + '/src', { recursive: true });
    writeFileSync(stage + '/src/main.tsx', source);
    cpSync(app + '/index.html', stage + '/index.html');
    cpSync(variantCore, stage + '/lithent.mjs');
    cpSync(helper, stage + '/helper.mjs');
    await build({
      ...config,
      configFile: false,
      root: realpathSync(stage),
      resolve: {
        alias: [
          { find: /^lithent\/helper$/, replacement: stage + '/helper.mjs' },
          { find: /^lithent$/, replacement: stage + '/lithent.mjs' },
        ],
      },
      build: { ...config.build, outDir: out + '/' + name },
    });
    manifest[name] = {
      date: new Date().toISOString(),
      libraryHead: execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: root,
        encoding: 'utf8',
      }).trim(),
      benchmarkHead: execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: bench,
        encoding: 'utf8',
      }).trim(),
      appSource: hash(source),
      core: hash(readFileSync(variantCore)),
      ...(variantCore !== core ? { coreOrigin: 'local-unreleased' } : {}),
      helper: hash(readFileSync(helper)),
      bundle: hash(readFileSync(out + '/' + name + '/main.js')),
      vite: JSON.parse(readFileSync(app + '/node_modules/vite/package.json'))
        .version,
    };
  }
  writeFileSync(
    out + '/build-manifest.json',
    JSON.stringify(manifest, null, 2)
  );
  writeFileSync(
    out + '/versions.json',
    JSON.stringify(
      {
        lithent: JSON.parse(
          readFileSync(app + '/node_modules/lithent/package.json')
        ).version,
        vite: manifest.lithent.vite,
      },
      null,
      2
    )
  );
} else if (mode === 'diagnostic' || mode === 'contracts') {
  const names = process.argv[3]?.split(',') || ['lithent-before', 'lithent'];
  const server = createServer((req, res) => {
    try {
      const parts = new URL(req.url, 'http://localhost').pathname
        .split('/')
        .filter(Boolean);
      let base = parts[0] === 'css' ? bench + '/css' : out + '/' + parts[0];
      const file = resolve(base, parts.slice(1).join('/') || 'index.html');
      if (!file.startsWith(base + '/')) throw Error('Outside app');
      res.setHeader(
        'content-type',
        {
          '.js': 'text/javascript',
          '.html': 'text/html',
          '.css': 'text/css',
          '.woff2': 'font/woff2',
        }[extname(file)] || 'application/octet-stream'
      );
      res.end(readFileSync(file));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.LITHENT_CHROME_BINARY ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const output = {
    startedAt: new Date().toISOString(),
    chrome: browser.version(),
    load: loadavg(),
    build: JSON.parse(readFileSync(out + '/build-manifest.json')),
    throttle: 4,
    samples: [],
  };
  try {
    if (mode === 'contracts') {
      for (const name of names) {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e)));
        await page.goto(
          `http://127.0.0.1:${server.address().port}/${name}/index.html`
        );
        const checks = await page.evaluate(async () => {
          const rows = () => [...document.querySelectorAll('tbody>tr')];
          const click = selector => document.querySelector(selector).click();
          const settle = () => new Promise(queueMicrotask);
          const assert = (condition, label) => {
            if (!condition) throw Error(label);
          };
          click('#run');
          await settle();
          const original = rows();
          click('tbody>tr:nth-child(2)>td:nth-child(2)>a');
          await settle();
          const mutations = [];
          const observer = new MutationObserver(records =>
            mutations.push(...records)
          );
          observer.observe(document.querySelector('tbody'), {
            subtree: true,
            attributes: true,
            characterData: true,
            childList: true,
          });
          click('tbody>tr:nth-child(3)>td:nth-child(2)>a');
          await settle();
          await settle();
          const selection = {
            attributes: mutations.filter(x => x.type === 'attributes').length,
            childList: mutations.filter(x => x.type === 'childList').length,
          };
          mutations.length = 0;
          click('#update');
          await settle();
          await settle();
          const partial = {
            text: mutations.filter(x => x.type === 'characterData').length,
            childList: mutations.filter(x => x.type === 'childList').length,
          };
          observer.disconnect();
          assert(
            selection.attributes === 2 && selection.childList === 0,
            'selection mutations'
          );
          assert(
            partial.text === 100 && partial.childList === 0,
            'partial mutations'
          );
          assert(
            rows().every((r, i) => r === original[i]),
            'small update identity'
          );
          click('#swaprows');
          await settle();
          click('tbody>tr:nth-child(999)>td:nth-child(2)>a');
          await settle();
          assert(
            original[1].className === 'danger' &&
              original[2].className !== 'danger',
            'select after swap'
          );
          click('#add');
          await settle();
          assert(original[1].className === 'danger', 'selection after append');
          // Queue parent and child updates in both orders within one task.
          for (const parentFirst of [false, true]) {
            const before = rows();
            const labels = before.map(r => r.cells[1].textContent);
            if (parentFirst) click('#swaprows');
            click('#update');
            if (!parentFirst) click('#swaprows');
            await settle();
            const expected = [...before];
            [expected[1], expected[998]] = [expected[998], expected[1]];
            assert(
              rows().every((r, i) => r === expected[i]),
              'batched swap identity'
            );
            assert(
              before.every(
                (r, i) =>
                  r.cells[1].textContent === labels[i] + (i % 10 ? '' : ' !!!')
              ),
              'batched partial values'
            );
          }
          const selected = rows().find(r => r.className === 'danger');
          selected.cells[2].querySelector('a').click();
          await settle();
          assert(
            !rows().includes(selected) &&
              !rows().some(r => r.className === 'danger'),
            'remove selected'
          );
          click('tbody>tr>td:nth-child(2)>a');
          await settle();
          click('#run');
          await settle();
          assert(
            !rows().some(r => r.className === 'danger'),
            'replace selected'
          );
          for (let i = 0; i < 20; i++) {
            click('#update');
            click('#clear');
            await settle();
            assert(rows().length === 0, 'queued renew after clear');
            click('#run');
            await settle();
            click('tbody>tr>td:nth-child(2)>a');
            await settle();
            assert(rows()[0].className === 'danger', 'select after recreate');
          }
          const beforeClear = rows();
          mutations.length = 0;
          observer.observe(document.querySelector('tbody'), {
            childList: true,
          });
          click('#clear');
          await settle();
          await settle();
          mutations.push(...observer.takeRecords());
          observer.disconnect();
          const removed = mutations.flatMap(x => [...x.removedNodes]);
          assert(
            removed.length === beforeClear.length &&
              removed.every((node, i) => node === beforeClear[i]) &&
              mutations.every(x => x.addedNodes.length === 0) &&
              rows().length === 0,
            'clear removes exactly the rendered rows'
          );
          const clear = {
            removals: mutations.filter(x => x.removedNodes.length).length,
            removedNodes: removed.length,
          };
          return {
            selection,
            partial,
            clear,
            batchedOrders: 2,
            recreateCycles: 20,
          };
        });
        if (errors.length) throw Error(errors.join('\n'));
        output.samples.push({ name, ...checks });
        console.log(name, checks);
        await page.close();
      }
    } else {
      for (let round = 0; round < 2; round++) {
        for (const name of round ? [...names].reverse() : names) {
          for (const scenario of process.argv[4]?.split(',') || [
            'select',
            'update',
            'swap',
            'create',
            'create10k',
          ]) {
            const page = await browser.newPage();
            page.on('pageerror', e => {
              throw e;
            });
            await page.goto(
              `http://127.0.0.1:${server.address().port}/${name}/index.html`
            );
            const cdp = await page.context().newCDPSession(page);
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
            await page.evaluate(async () => {
              document.querySelector('#run').click();
              await new Promise(queueMicrotask);
            });
            const times = [];
            for (let i = 0; i < 24; i++) {
              if (scenario.startsWith('create'))
                await page.evaluate(async () => {
                  document.querySelector('#clear').click();
                  await new Promise(queueMicrotask);
                });
              else if (scenario === 'clear')
                await page.evaluate(async () => {
                  document.querySelector('#run').click();
                  await new Promise(queueMicrotask);
                });
              await page.evaluate(
                () =>
                  new Promise(r =>
                    requestAnimationFrame(() => setTimeout(r, 0))
                  )
              );
              const time = await page.evaluate(
                async ({ scenario, i }) => {
                  const selector =
                    scenario === 'select'
                      ? `tbody>tr:nth-child(${i + 2})>td:nth-child(2)>a`
                      : {
                          update: '#update',
                          swap: '#swaprows',
                          create: '#run',
                          create10k: '#runlots',
                          clear: '#clear',
                          replace: '#run',
                        }[scenario];
                  const target = document.querySelector(selector);
                  const t = performance.now();
                  target.click();
                  await new Promise(queueMicrotask);
                  return performance.now() - t;
                },
                { scenario, i }
              );
              if (i >= 8) times.push(time);
            }
            const median = [...times].sort((a, b) => a - b)[times.length / 2];
            const sample = { round, name, scenario, median, times };
            output.samples.push(sample);
            console.log(JSON.stringify({ ...sample, times: undefined }));
            writeFileSync(
              out + '/diagnostic.json',
              JSON.stringify(output, null, 2)
            );
            await page.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  output.finishedAt = new Date().toISOString();
  writeFileSync(out + '/' + mode + '.json', JSON.stringify(output, null, 2));
} else throw Error('Unknown mode: ' + mode);
