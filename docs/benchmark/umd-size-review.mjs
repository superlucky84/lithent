import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const before = process.argv[2];
assert(before, 'Pass the directory containing the original dist artifacts');
const hash = value => createHash('sha256').update(value).digest('hex');
const umd = {
  before: readFileSync(`${before}/lithent.umd.js`, 'utf8'),
  after: readFileSync(`${root}/dist/lithent.umd.js`, 'utf8'),
};
const esm = readFileSync(`${root}/dist/lithent.mjs`, 'utf8');
assert.equal(esm, readFileSync(`${before}/lithent.mjs`, 'utf8'));
const maps = Object.fromEntries(
  [
    ['before', before],
    ['after', `${root}/dist`],
  ].map(([name, dir]) => [
    name,
    JSON.parse(readFileSync(`${dir}/lithent.umd.js.map`)),
  ])
);
assert.deepEqual(maps.after.sources, maps.before.sources);
assert.deepEqual(maps.after.sourcesContent, maps.before.sourcesContent);
const exports = Object.fromEntries(
  Object.entries(umd).map(([name, code]) => {
    const module = { exports: {} };
    runInNewContext(code, { module, exports: module.exports });
    return [name, Object.keys(module.exports).sort()];
  })
);
assert(exports.before.length);
assert.deepEqual(exports.after, exports.before);
const originalCases = readFileSync(
  `${root}/docs/benchmark/compatibility-cases.js`,
  'utf8'
);
const cases = originalCases
  .replace(
    "import { h, mount, mountCallback, render, nextTick } from '@/index';",
    'const { h, mount, mountCallback, render, nextTick } = window.lithent;'
  )
  .replace('export const cases =', 'const cases =');
assert(!cases.includes("from '@/index'"));
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.LITHENT_UMD_CHROME ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const results = {};
const browserVersion = browser.version();
try {
  for (const [name, code] of Object.entries(umd)) {
    results[name] = {};
    const seed = await browser.newPage();
    await seed.addScriptTag({ content: code });
    await seed.addScriptTag({ content: cases });
    const names = await seed.evaluate(() =>
      Object.keys(window.compatibilityCases)
    );
    await seed.close();
    for (const caseName of names) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.addScriptTag({ content: code });
      await page.addScriptTag({ content: cases });
      results[name][caseName] = await page.evaluate(
        key => window.compatibilityCases[key](),
        caseName
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
assert.deepEqual(results.after, results.before);
assert.equal(Object.keys(results.after).length, 9);
const config = readFileSync(`${root}/vite.config.js`, 'utf8');
const evidence = gzipSync(
  JSON.stringify({
    umd,
    esm,
    maps,
    config,
    cases,
    script: readFileSync(fileURLToPath(import.meta.url), 'utf8'),
  })
);
const result = {
  date: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim(),
  configSHA256: hash(config),
  evidenceSHA256: hash(evidence),
  esmSHA256: hash(esm),
  esmUnchanged: true,
  mapSourcesUnchanged: true,
  mapSourceCount: maps.after.sources.length,
  commonJSExports: exports.after,
  browser: browserVersion,
  results,
  sizes: Object.fromEntries(
    Object.entries(umd).map(([name, code]) => [
      name,
      {
        raw: Buffer.byteLength(code),
        gzip: gzipSync(code, { level: 9 }).length,
        brotli: brotliCompressSync(code).length,
        sha256: hash(code),
      },
    ])
  ),
};
writeFileSync(
  `${root}/docs/benchmark/umd-size-results.json`,
  JSON.stringify(result, null, 2)
);
writeFileSync(`${root}/docs/benchmark/umd-size-evidence.json.gz`, evidence);
console.log(
  JSON.stringify({
    sizes: result.sizes,
    browserChecks: 18,
    esmUnchanged: true,
    commonJSExportCount: exports.after.length,
    mapSourceCount: result.mapSourceCount,
  })
);
