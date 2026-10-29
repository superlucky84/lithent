// Offline diagnosis: existing timing evidence + an untimed parent-link probe.
// Run from the repository root: node experiments/render-gap-diagnosis/analyze.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const hash = value => createHash('sha256').update(value).digest('hex');
const input = 'docs/benchmark/dc25-keyed-fast-path-final-results.json';
const data = JSON.parse(fs.readFileSync(input, 'utf8'));
const metrics = ['total', 'script', 'paint'];
const rows = data.rows.pooled.map(row => {
  const l = row.conditions.baseline;
  const p = row.conditions['preact-classes'];
  return {
    id: row.id,
    lithent: Object.fromEntries(metrics.map(m => [m, l[m].median])),
    preactClasses: Object.fromEntries(metrics.map(m => [m, p[m].median])),
    ratios: Object.fromEntries(
      metrics.map(m => [m, l[m].median / p[m].median])
    ),
    countPerCondition: l.total.count,
  };
});
const weighted = Object.fromEntries(
  metrics.map(m => [
    m,
    Math.exp(
      rows.reduce(
        (sum, row, i) => sum + data.weights[i] * Math.log(row.ratios[m]),
        0
      ) / data.weights.reduce((sum, w) => sum + w, 0)
    ),
  ])
);
const select = rows.find(row => row.id.startsWith('04_'));

// Source comparison only. These checkouts are NOT assumed to be the timed builds.
// Embed inputs so the report does not depend on temporary/external checkouts.
const peerRoot = path.resolve(root, '../js-framework-benchmark');
const peerPaths = [
  'frameworks/keyed/preact-classes/src/Row.jsx',
  'frameworks/keyed/preact-classes/src/Main.jsx',
  'frameworks/keyed/preact-classes/src/Store.es6.js',
  'frameworks/keyed/vue/src/App.vue',
  'frameworks/keyed/vue/package.json',
];
const peerSources = peerPaths.map(file => {
  const source = fs.readFileSync(path.join(peerRoot, file), 'utf8');
  return { file, sha256: hash(source), source };
});

const probeSource = `
  import { h, mount, render, mountReadyCallback } from './src/index.ts';
  let leaf, parent, observed;
  const App = mount(() => {
    mountReadyCallback(() => {
      observed = { parentPresent: !!leaf.getParent,
        parentCorrect: leaf.getParent?.() === parent };
    });
    return () => {
      leaf = h('span', {}, 'child');
      parent = h('section', {}, leaf);
      return parent;
    };
  });
  const tree = h(App, {});
  const before = { parentPresent: !!leaf.getParent,
    parentCorrect: leaf.getParent?.() === parent };
  render(tree, document.getElementById('app'));
  globalThis.probeResult = { before, mountReady: observed,
    after: { parentCorrect: leaf.getParent?.() === parent },
    html: document.getElementById('app').innerHTML };
`;

async function probe(removeCreationParent) {
  const result = await build({
    stdin: { contents: probeSource, resolveDir: root, loader: 'ts' },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    alias: { '@': path.join(root, 'src') },
    plugins: [
      {
        name: 'in-memory-negative-control',
        setup(plugin) {
          plugin.onLoad({ filter: /\/src\/wDom\.ts$/ }, args => {
            let contents = fs.readFileSync(args.path, 'utf8');
            if (removeCreationParent) {
              const needle = '    childItem.getParent = getParent;';
              assert.equal(contents.split(needle).length, 2);
              contents = contents.replace(
                needle,
                '    // negative control: parent assignment omitted'
              );
            }
            return { contents, loader: 'ts' };
          });
        },
      },
    ],
  });
  const dom = new JSDOM('<div id="app"></div>', { runScripts: 'outside-only' });
  try {
    dom.window.eval(result.outputFiles[0].text);
    return JSON.parse(JSON.stringify(dom.window.probeResult));
  } finally {
    dom.window.close();
  }
}

const baseline = await probe(false);
const withoutCreationParent = await probe(true);
assert.equal(baseline.before.parentCorrect, true);
assert.equal(baseline.mountReady.parentCorrect, true);
assert.equal(withoutCreationParent.before.parentCorrect, false);
assert.equal(withoutCreationParent.mountReady.parentCorrect, false);
assert.equal(withoutCreationParent.after.parentCorrect, true);
assert.equal(baseline.html, withoutCreationParent.html);
const sourcePaths = [
  'src/wDom.ts',
  'src/diff.ts',
  'src/render.ts',
  'src/utils/createWDom.ts',
  'src/hook/mountReadyCallback.ts',
  'helper/src/hook/cacheUpdate.ts',
  'packages/lithentTemplateParser/src/codegen/createElement.ts',
];
const evidence = {
  at: new Date().toISOString(),
  scope:
    'existing DC-25 baseline reanalysis; source inspection; untimed JSDOM negative control',
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  node: process.version,
  timingInput: {
    file: input,
    sha256: hash(fs.readFileSync(input)),
    weights: data.weights,
  },
  sources: sourcePaths.map(file => ({
    file,
    sha256: hash(fs.readFileSync(file)),
  })),
  peerSources,
  rows,
  weighted,
  selectionToExisting110Goal: {
    thresholdMs: 1.1 * select.preactClasses.total,
    reductionMs: select.lithent.total - 1.1 * select.preactClasses.total,
    reductionFraction: 1 - 1.1 / select.ratios.total,
  },
  parentProbe: { baseline, withoutCreationParent },
  limitations: [
    'No new browser timing, Vue timing, CPU profile or memory measurement.',
    'Separate medians for total/script/paint are not additive.',
    'The negative control is not a proposed optimization and does not modify repository sources.',
    'Peer snapshots describe local source only, not a new timed artifact.',
  ],
};
fs.writeFileSync(
  'docs/benchmark/render-gap-diagnosis.json',
  JSON.stringify(evidence, null, 2) + '\n'
);
console.log(
  JSON.stringify(
    {
      weighted,
      selection: evidence.selectionToExisting110Goal,
      parentProbe: evidence.parentProbe,
    },
    null,
    2
  )
);
