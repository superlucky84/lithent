import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = resolve(process.argv[2] || '/tmp/lithent-core-analysis/results');
const require = createRequire(import.meta.url);
const variants = [
  'current',
  'vite8',
  'vite8-legacy-target',
  'current-latest-terser',
  'source-ownSymbol',
  'source-iterativeAncestor',
];
const files = variants.map(name => resolve(out, name, 'lithent.umd.js'));
const differential = execFileSync(
  process.execPath,
  [resolve(root, 'experiments/bundle-size-recheck/umd-diff.cjs'), ...files],
  { encoding: 'utf8' }
);
const cases = readFileSync(
  resolve(root, 'docs/benchmark/compatibility-cases.js'),
  'utf8'
)
  .replace(
    "import { h, mount, mountCallback, render, nextTick } from '@/index';",
    'const { h, mount, mountCallback, render, nextTick } = window.lithent;'
  )
  .replace('export const cases =', 'const cases =');
const proof = {
  date: new Date().toISOString(),
  differential,
  compatibility: {},
  exports: {},
  functions: {},
};
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.LITHENT_CHROME || '/usr/bin/chromium',
});
proof.chromium = browser.version();
try {
  for (const name of variants) {
    const code = readFileSync(resolve(out, name, 'lithent.umd.js'), 'utf8');
    const seed = await browser.newPage();
    await seed.addScriptTag({ content: code });
    await seed.addScriptTag({ content: cases });
    const names = await seed.evaluate(() =>
      Object.keys(window.compatibilityCases)
    );
    await seed.close();
    proof.compatibility[name] = {};
    for (const test of names) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.addScriptTag({ content: code });
      await page.addScriptTag({ content: cases });
      proof.compatibility[name][test] = await page.evaluate(
        key => window.compatibilityCases[key](),
        test
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(proof.compatibility[name], proof.compatibility.current);
    const esm = await import(pathToFileURL(resolve(out, name, 'lithent.mjs')));
    const cjs = require(resolve(out, name, 'lithent.cjs'));
    proof.exports[name] = {
      esm: Object.keys(esm).sort(),
      cjs: Object.keys(cjs).sort(),
    };
    assert.deepEqual(proof.exports[name], proof.exports.current);
  }
  proof.counter = {};
  for (const name of ['current', 'vite8', 'current-build-vite8-esm']) {
    const page = await browser.newPage();
    const code = readFileSync(
      resolve(out, 'consumers', name + '-counter/app.js'),
      'utf8'
    );
    await page.addScriptTag({ content: code });
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.getByRole('button', { name: '1', exact: true }).waitFor();
    proof.counter[name] = await page.locator('body').innerText();
    assert.equal(proof.counter[name], '1');
    await page.close();
  }
} finally {
  await browser.close();
}
for (const file of [
  ...files,
  resolve(out, 'terser-default.js'),
  resolve(out, 'terser-no-inline.js'),
]) {
  const tree = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  const counts = { all: 0, bound: 0, nestedArrowParentGetter: 0 };
  function walk(node) {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node)
    ) {
      counts.all++;
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isVariableDeclaration(node.parent)
      )
        counts.bound++;
      if (
        ts.isArrowFunction(node) &&
        ts.isArrowFunction(node.body) &&
        ts.isIdentifier(node.body.body)
      )
        counts.nestedArrowParentGetter++;
    }
    ts.forEachChild(node, walk);
  }
  walk(tree);
  proof.functions[file.slice(out.length + 1)] = counts;
}
writeFileSync(
  resolve(out, 'verification.json'),
  JSON.stringify(proof, null, 2) + '\n'
);
console.log(differential);
console.log(
  `Chromium ${proof.chromium}: ${variants.length} bundles x ${Object.keys(proof.compatibility.current).length} compatibility cases; 3 counter apps; ESM/CJS exports agree.`
);
