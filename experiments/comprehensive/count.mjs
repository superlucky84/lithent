// Structural counts under JSDOM only: never a CPU, paint, memory or B3 score.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { build } from 'vite';
import { root, hash, guard } from './init.mjs';

const out = fs.realpathSync(
  path.resolve(process.argv[2] || '/tmp/lithent-c2-20261023-run2')
);
guard(out);
assert(
  !fs.existsSync(path.join(out, 'counts.json')),
  'Preserve previous diagnostic counts'
);
const archive = fs.readFileSync(
  path.join(root, 'docs/benchmark/peer-baseline-evidence.json.gz')
);
assert.equal(
  hash(archive),
  '5ec4db084140ac0e1379d82c2c691d7fc437c24e1e4484d8cc823a0d7071412e'
);
const evidence = JSON.parse(zlib.gunzipSync(archive));
const app = path.join(out, 'archived-app');
fs.mkdirSync(path.join(app, 'src'), { recursive: true });
const inputs = {};
for (const name of ['src/main.tsx', 'cacheUpdate.ts']) {
  const file = evidence.files['run/sources/lithent/' + name];
  const bytes = Buffer.from(file.content, file.encoding || 'utf8');
  assert.equal(hash(bytes), file.sha256);
  fs.writeFileSync(path.join(app, name), bytes);
  inputs[name] = file.sha256;
}
assert.equal(
  inputs['src/main.tsx'],
  '4fcb17e3dcd841f628d4130a7d47ca3011550972675ba2da18e324a5f541d632'
);
fs.writeFileSync(
  path.join(app, 'entry.ts'),
  "import './src/main';\nexport { nextTick } from 'lithent';\n"
);

const helper = `\nfunction __hit(key: string, n = 1) { const c = (globalThis as any).__c2Counts; if (c) c[key] = (c[key] || 0) + n; }\n`;
function once(code, from, to) {
  assert.equal(code.split(from).length, 2, 'instrumentation anchor: ' + from);
  return code.replace(from, to);
}
function enter(code, name, extra = '') {
  const start = code.indexOf('const ' + name + ' =');
  const pos = code.indexOf('=> {', start);
  assert.ok(start >= 0 && pos >= 0, name);
  return (
    code.slice(0, pos + 4) +
    `\n__hit('${name}');${extra}\n` +
    code.slice(pos + 4)
  );
}
function instrument(code, file, variant) {
  if (file === 'diff.ts') {
    code = enter(code, 'diffLoopChildren');
    code = once(
      code,
      'origChildren.forEach((item, index) => {',
      "origChildren.forEach((item, index) => { __hit('mapBuildVisits');"
    );
    assert.equal(code.split('const key = getKey(item);').length, 3);
    code = code.replaceAll(
      'const key = getKey(item);',
      "__hit('diffKeyReads'); const key = getKey(item);"
    );
    for (const [source, key] of [
      ['keyMap.set(key, index)', 'mapSet'],
      ['keyMap.has(key)', 'mapHas'],
      ['keyMap.get(key)', 'mapGet'],
      ['keyMap.delete(key)', 'mapDelete'],
    ]) {
      code = once(code, source, `(__hit('${key}'), ${source})`);
    }
    code = once(
      code,
      'origChildren.filter((_item, index) => !used[index])',
      "origChildren.filter((_item, index) => (__hit('unusedVisits'), !used[index]))"
    );
    if (variant === 'candidate')
      code = once(
        code,
        'frame.proofs.set(newWDom, remaked);',
        "__hit('proofWrites'); __hit('proofWriteChildren', remaked.length); frame.proofs.set(newWDom, remaked);"
      );
  } else if (file === 'render.ts') {
    for (const name of ['updateChildren', 'clearDiffMeta', 'wDomUpdate'])
      code = enter(code, name);
    code = once(
      code,
      'const matchedIndexes: number[] = [];',
      "__hit('matchedArrays'); const matchedIndexes: number[] = [];"
    );
    code = once(
      code,
      'const oiSeq: number[] = [];',
      "__hit('oiArrays'); const oiSeq: number[] = [];"
    );
    code = once(
      code,
      'const movers: WDom[] = [];',
      "__hit('moverArrays'); const movers: WDom[] = [];"
    );
    code = once(
      code,
      'let createdCount = 0;',
      "__hit('createdArrays'); let createdCount = 0;"
    );
    code = once(
      code,
      'children.forEach((item, index) => {\n    const oi',
      "children.forEach((item, index) => {\n    __hit('matchAnalysisVisits'); const oi"
    );
    code = once(
      code,
      "item => 'ATS'.includes(item.nr as string) || item.oi !== undefined",
      "item => (__hit('placementProbeVisits'), 'ATS'.includes(item.nr as string) || item.oi !== undefined)"
    );
    if (variant === 'candidate') {
      code = once(
        code,
        'if (sameOrder) {',
        "if (sameOrder) { __hit('fastLoops'); __hit('fastChildren', children.length);"
      );
      code = once(
        code,
        'const children = frame && frame.proofs.get(newWDom);',
        "if (frame) __hit('proofReads'); const children = frame && frame.proofs.get(newWDom);"
      );
      code = once(
        code,
        'if (frame) frame.proofs.delete(newWDom);',
        "if (frame) { __hit('proofDeletes'); frame.proofs.delete(newWDom); }"
      );
    }
  } else if (file === 'wDom.ts' && variant === 'candidate') {
    code = once(
      code,
      'childOrderRef.value = frame;',
      "__hit('frameStart'); childOrderRef.value = frame;"
    );
    code = once(
      code,
      'childOrderRef.value = previousFrame;',
      "__hit('frameEnd'); childOrderRef.value = previousFrame;"
    );
  } else return code;
  return helper + code;
}

const result = {
  at: new Date().toISOString(),
  environment: 'JSDOM structural counters; no timing or official B3',
  inputs,
  variants: {},
};
for (const variant of ['baseline', 'candidate']) {
  const source = path.join(
    out,
    variant === 'candidate' ? 'c2' : variant,
    'src'
  );
  const dest = path.join(out, 'count-' + variant);
  await build({
    configFile: false,
    root: app,
    logLevel: 'warn',
    plugins: [
      {
        name: 'c2-count-only',
        enforce: 'pre',
        transform(code, id) {
          if (id.startsWith(source + '/'))
            return instrument(code, path.relative(source, id), variant);
        },
      },
    ],
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: path.join(app, 'cacheUpdate.ts'),
        },
        { find: /^lithent$/, replacement: path.join(source, 'index.ts') },
        { find: '@', replacement: source },
      ],
    },
    build: {
      outDir: dest,
      sourcemap: false,
      emptyOutDir: false,
      minify: false,
      lib: {
        entry: path.join(app, 'entry.ts'),
        formats: ['es'],
        fileName: () => 'app.mjs',
      },
    },
  });
  const dom = new JSDOM('<!doctype html><div id="main"></div>');
  for (const name of [
    'window',
    'document',
    'DocumentFragment',
    'HTMLElement',
    'HTMLInputElement',
    'Element',
    'Text',
    'Node',
    'Event',
  ])
    globalThis[name] = name === 'window' ? dom.window : dom.window[name];
  const runtime = await import(pathToFileURL(path.join(dest, 'app.mjs')));
  const rows = () => [...document.querySelectorAll('tbody>tr')];
  const samples = [];
  const click = async (name, selector) => {
    globalThis.__c2Counts = {};
    document.querySelector(selector).click();
    await runtime.nextTick();
    samples.push({
      name,
      rows: rows().length,
      counts: { ...globalThis.__c2Counts },
    });
    globalThis.__c2Counts = undefined;
  };
  await click('create1k', '#run');
  assert.equal(rows().length, 1000);
  const initial = rows();
  await click('select', 'tbody>tr:nth-child(2)>td:nth-child(2)>a');
  assert.ok(initial[1].classList.contains('danger'));
  await click('select-next', 'tbody>tr:nth-child(3)>td:nth-child(2)>a');
  assert.ok(
    initial[2].classList.contains('danger') &&
      !initial[1].classList.contains('danger')
  );
  const labels = initial.map(row => row.cells[1].textContent);
  await click('partial', '#update');
  assert.ok(
    rows().every(
      (row, i) =>
        row === initial[i] &&
        row.cells[1].textContent === labels[i] + (i % 10 ? '' : ' !!!')
    )
  );
  await click('swap', '#swaprows');
  assert.ok(rows()[1] === initial[998] && rows()[998] === initial[1]);
  await click('remove', 'tbody>tr:nth-child(3)>td:nth-child(3)>a');
  assert.equal(rows().length, 999);
  assert.ok(!rows().includes(initial[2]));
  await click('replace1k', '#run');
  assert.ok(rows().every(row => !initial.includes(row)));
  const replaced = rows();
  await click('append1k', '#add');
  assert.equal(rows().length, 2000);
  assert.ok(replaced.every((row, i) => row === rows()[i]));
  await click('clear', '#clear');
  assert.equal(rows().length, 0);
  await click('create10k', '#runlots');
  assert.equal(rows().length, 10000);
  await click('clear10k', '#clear');
  assert.equal(rows().length, 0);
  result.variants[variant] = {
    samples,
    bundleSHA256: hash(fs.readFileSync(path.join(dest, 'app.mjs'))),
  };
  dom.window.close();
}
const [baseline, candidate] = ['baseline', 'candidate'].map(
  v => result.variants[v].samples
);
for (let i = 0; i < baseline.length; i++) {
  assert.equal(baseline[i].name, candidate[i].name);
  for (const key of [
    'diffLoopChildren',
    'diffKeyReads',
    'mapBuildVisits',
    'mapSet',
    'mapHas',
    'mapGet',
    'mapDelete',
    'unusedVisits',
    'clearDiffMeta',
    'wDomUpdate',
  ])
    assert.equal(
      candidate[i].counts[key] || 0,
      baseline[i].counts[key] || 0,
      baseline[i].name + ': ' + key
    );
  assert.equal(candidate[i].counts.frameStart, candidate[i].counts.frameEnd);
  const fast = ['select', 'select-next', 'partial'].includes(baseline[i].name);
  assert.equal(
    candidate[i].counts.fastLoops || 0,
    fast ? 1 : 0,
    baseline[i].name
  );
  assert.equal(
    candidate[i].counts.matchAnalysisVisits || 0,
    fast ? 0 : baseline[i].counts.matchAnalysisVisits || 0
  );
  for (const key of [
    'matchedArrays',
    'oiArrays',
    'moverArrays',
    'createdArrays',
  ])
    assert.equal(
      candidate[i].counts[key] || 0,
      (baseline[i].counts[key] || 0) - (fast ? 1 : 0)
    );
}
guard(out);
fs.writeFileSync(
  path.join(out, 'counts.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    samples: baseline.length,
    variants: 2,
    checks:
      'Map/key reads/content/cleanup parity; fast select+partial; fallback structural changes',
    select: candidate[1].counts,
    partial: candidate[3].counts,
  })
);
