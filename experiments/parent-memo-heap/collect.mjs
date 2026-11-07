import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-heap-20261022');
const input = path.resolve(process.argv[3] || '/tmp/lithent-c3-optin-20261022');
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  path.join(root, '../js-framework-benchmark-upstream');
const executablePath =
  process.env.LITHENT_CHROME_BINARY ||
  '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome';
const prior = JSON.parse(
  fs.readFileSync(
    path.join(root, 'docs/benchmark/parent-memo-optin-results.json')
  )
);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fileHash = file => hash(fs.readFileSync(file));
const git = (args, cwd = root) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' });
const names = ['lithent-before', 'lithent'];
const sibling = path.join(bench, 'frameworks/keyed/lithent/src/main.tsx');
const packageSHA256 = fileHash(path.join(root, 'package.json'));
const siblingSHA256 = fileHash(sibling);
assert.equal(
  siblingSHA256,
  '314efbb41cf0669c13449c4b4800c4ed5e2b193167f20ccebf7d3f7303e5d76b'
);
assert.equal(fs.existsSync(out), false, 'Use a fresh output directory');
const verify = () => {
  for (const [file, sha256] of Object.entries(prior.provenance.baseline))
    assert.equal(fileHash(path.join(root, file)), sha256, file);
  assert.equal(fileHash(path.join(root, 'package.json')), packageSHA256);
  assert.equal(fileHash(sibling), siblingSHA256);
  for (const name of names) {
    for (const [file, field] of [
      ['main.js', 'bundle'],
      ['index.html', 'html'],
    ])
      assert.equal(
        fileHash(path.join(input, 'round-main', name, file)),
        prior.build[name][field]
      );
  }
  assert.equal(
    fileHash(path.join(root, prior.evidence.file)),
    prior.evidence.sha256
  );
};
verify();
fs.mkdirSync(path.join(out, 'snapshots'), { recursive: true });
const result = {
  started: new Date().toISOString(),
  complete: false,
  command: {
    executable: process.execPath,
    args: process.argv.slice(1),
    node: process.version,
  },
  head: git(['rev-parse', 'HEAD']).trim(),
  status: git(['status', '--short', '--branch']),
  benchmarkHead: git(['rev-parse', 'HEAD'], bench).trim(),
  benchmarkStatus: git(['status', '--short', '--branch'], bench),
  baseline: prior.provenance.baseline,
  packageSHA256,
  siblingSHA256,
  reused: {
    evidence: prior.evidence,
    tests: prior.reused.tests,
    gate: prior.gate,
    build: prior.build,
  },
  browser: {
    executablePath,
    sha256: fileHash(executablePath),
    frameworkSHA256: fileHash(
      path.resolve(
        executablePath,
        '../../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
      )
    ),
  },
  protocol: {
    checkpoints: [0, 5, 25, 100, 300],
    metricsContextsPerCondition: 3,
    snapshotContextsPerCondition: 1,
    gcPerCheckpoint: 2,
    snapshotOptions: {
      reportProgress: false,
      exposeInternals: true,
      captureNumericValue: true,
    },
    note: 'Diagnostic only. Snapshot contexts are separate; snapshots can change GC/optimization. Root remains mounted. No official CPU/memory samples.',
  },
  runs: [],
};
const save = () =>
  fs.writeFileSync(
    path.join(out, 'collection.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
const log = message => {
  const line = new Date().toISOString() + ' ' + message;
  fs.appendFileSync(path.join(out, 'progress.log'), line + '\n');
  console.log(line);
};
save();
const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const css = url.pathname.startsWith('/css/');
    const base = css ? bench : path.join(input, 'round-main');
    const file = path.resolve(base, '.' + url.pathname);
    assert.ok(file.startsWith(base + '/'));
    res.setHeader(
      'content-type',
      {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
      }[path.extname(file)] || 'application/octet-stream'
    );
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--js-flags=--expose-gc'],
  });
  result.browser.version = browser.version();
  for (const kind of ['metrics', 'snapshot']) {
    for (let round = 0; round < (kind === 'metrics' ? 3 : 1); round++) {
      for (const name of round % 2 ? [...names].reverse() : names) {
        const context = await browser.newContext();
        const run = {
          kind,
          name,
          round,
          started: new Date().toISOString(),
          points: [],
          errors: [],
        };
        result.runs.push(run);
        try {
          const page = await context.newPage();
          page.on('pageerror', error => run.errors.push(String(error)));
          const cdp = await context.newCDPSession(page);
          await cdp.send('Network.enable');
          await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
          await cdp.send('Performance.enable');
          await page.goto(
            `http://127.0.0.1:${server.address().port}/${name}/index.html`
          );
          await page.waitForSelector('#run');
          await page.evaluate(() => document.fonts.ready);
          const capture = async label => {
            await page.evaluate(
              () =>
                new Promise(resolve =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve))
                )
            );
            await cdp.send('HeapProfiler.collectGarbage');
            await cdp.send('HeapProfiler.collectGarbage');
            const { metrics } = await cdp.send('Performance.getMetrics');
            const point = {
              label,
              at: new Date().toISOString(),
              jsHeapBytes: metrics.find(x => x.name === 'JSHeapUsedSize').value,
              ...(await cdp.send('Memory.getDOMCounters')),
            };
            if (kind === 'snapshot') {
              const chunks = [];
              const receive = ({ chunk }) => chunks.push(chunk);
              cdp.on('HeapProfiler.addHeapSnapshotChunk', receive);
              try {
                await cdp.send(
                  'HeapProfiler.takeHeapSnapshot',
                  result.protocol.snapshotOptions
                );
              } finally {
                cdp.off('HeapProfiler.addHeapSnapshotChunk', receive);
              }
              const bytes = Buffer.from(chunks.join(''));
              const compressed = zlib.gzipSync(bytes, { level: 9 });
              const file = `snapshots/${name}-${label}.heapsnapshot.gz`;
              fs.writeFileSync(path.join(out, file), compressed);
              point.snapshot = {
                file,
                bytes: bytes.length,
                sha256: hash(bytes),
                gzipBytes: compressed.length,
                gzipSHA256: hash(compressed),
              };
            }
            run.points.push(point);
            assert.equal(run.errors.length, 0, run.errors.join('\n'));
            save();
            log(
              `${kind} ${name} ${round} ${label}: ${point.jsHeapBytes} bytes`
            );
          };
          let completed = 0;
          for (const cycles of result.protocol.checkpoints) {
            await page.evaluate(async count => {
              const click = async id => {
                document.getElementById(id).click();
                await new Promise(queueMicrotask);
              };
              for (let i = 0; i < count; i++) {
                await click('run');
                if (document.querySelectorAll('tbody>tr').length !== 1000)
                  throw Error('Missing rows');
                await click('clear');
                if (document.querySelectorAll('tbody>tr').length)
                  throw Error('Uncleared rows');
              }
            }, cycles - completed);
            completed = cycles;
            await capture('clear-' + cycles);
          }
          if (kind === 'snapshot') {
            await page.evaluate(async () => {
              document.getElementById('run').click();
              await new Promise(queueMicrotask);
            });
            assert.equal(await page.locator('tbody>tr').count(), 1000);
            await capture('live-1000');
            await page.evaluate(async () => {
              document.getElementById('clear').click();
              await new Promise(queueMicrotask);
            });
            assert.equal(await page.locator('tbody>tr').count(), 0);
            await capture('final-clear');
          }
          run.complete = true;
        } finally {
          await context.close();
          save();
        }
      }
    }
  }
  verify();
  result.complete = true;
  result.finished = new Date().toISOString();
  save();
} catch (error) {
  result.error = String(error.stack || error);
  save();
  throw error;
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
