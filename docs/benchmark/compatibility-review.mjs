import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { concurrentAlias } from '../../lithentConcurrent/alias.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out =
  process.env.LITHENT_COMPAT_OUT || '/tmp/lithent-compatibility-review';
const baseline = `${out}/baseline`;
const baselineHead = '326a181';
const entry = fileURLToPath(
  new URL('./compatibility-cases.js', import.meta.url)
);
const hash = value => createHash('sha256').update(value).digest('hex');
mkdirSync(baseline, { recursive: true });
execFileSync('tar', ['-xf', '-', '-C', baseline], {
  input: execFileSync(
    'git',
    ['archive', baselineHead, 'src', 'lithentConcurrent/src'],
    { cwd: root }
  ),
});
const require = createRequire(`${root}/package.json`);
const { build } = require('vite');
const { chromium } = require('@playwright/test');
const variants = [
  ['before-base', baseline, false],
  ['current-base', root, false],
  ['before-concurrent', baseline, true],
  ['current-concurrent', root, true],
];
const bundles = {};
for (const [name, source, concurrent] of variants) {
  const result = await build({
    configFile: false,
    root,
    logLevel: 'error',
    define: { 'import.meta.vitest': 'undefined' },
    resolve: {
      alias: concurrent
        ? concurrentAlias(`${source}/lithentConcurrent`)
        : [{ find: '@', replacement: `${source}/src` }],
    },
    build: {
      write: false,
      minify: false,
      target: 'es2022',
      lib: { entry, name: 'Compatibility', formats: ['iife'] },
    },
  });
  const outputs = Array.isArray(result) ? result : [result];
  bundles[name] = outputs
    .flatMap(item => item.output)
    .find(item => item.type === 'chunk').code;
  writeFileSync(`${out}/${name}.js`, bundles[name]);
}
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.LITHENT_COMPAT_CHROME,
});
const sourceFiles = [
  'src/diff.ts',
  'src/render.ts',
  'src/wDom.ts',
  'src/utils/index.ts',
  'src/utils/redraw.ts',
  'src/hook/internal/unmount.ts',
  'lithentConcurrent/src/diff.ts',
  'lithentConcurrent/src/render.ts',
  'lithentConcurrent/src/wDom.ts',
];
const results = {
  date: new Date().toISOString(),
  browser: browser.version(),
  baseline: baselineHead,
  current: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim(),
  sourceHashes: Object.fromEntries(
    sourceFiles.map(file => [file, hash(readFileSync(`${root}/${file}`))])
  ),
  caseHash: hash(readFileSync(entry)),
  bundleHashes: {},
  cases: {},
};
try {
  for (const [name] of variants) {
    results.bundleHashes[name] = hash(bundles[name]);
    const seed = await browser.newPage();
    await seed.addScriptTag({ content: bundles[name] });
    const caseNames = await seed.evaluate(() =>
      Object.keys(window.compatibilityCases)
    );
    await seed.close();
    results.cases[name] = {};
    for (const caseName of caseNames) {
      const page = await browser.newPage();
      await page.addScriptTag({ content: bundles[name] });
      results.cases[name][caseName] = await page.evaluate(
        key => window.compatibilityCases[key](),
        caseName
      );
      await page.close();
    }
  }
} finally {
  await browser.close();
}
const evidence = gzipSync(
  JSON.stringify({ fixture: readFileSync(entry, 'utf8'), bundles })
);
results.evidenceSHA256 = hash(evidence);
writeFileSync(`${out}/evidence.json.gz`, evidence);
writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
