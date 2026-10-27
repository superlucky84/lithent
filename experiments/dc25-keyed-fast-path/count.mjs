// These are JSDOM work counters, never official timing or memory samples.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { build } from 'vite';
import { hash, guard, write } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const run = process.argv[3] || 'v1';
assert(/^[a-z0-9-]+$/.test(run));
guard(out);
const app = path.join(out, 'app-source');
const entry = path.join(app, 'count-entry.ts');
const entrySource =
  "import './src/main';\nexport { nextTick } from 'lithent';\n";
if (fs.existsSync(entry))
  assert.equal(fs.readFileSync(entry, 'utf8'), entrySource);
else fs.writeFileSync(entry, entrySource, { flag: 'wx' });
const helper = `\nfunction __hit(key: string, n = 1) { const c = (globalThis as any).__dc25Counts; if (c) c[key] = (c[key] || 0) + n; }\n`;
function once(code, before, after) {
  assert.equal(code.split(before).length, 2, before);
  return code.replace(before, after);
}
function enter(code, name) {
  const start = code.indexOf('const ' + name + ' =');
  const pos = code.indexOf('=> {', start);
  assert(start >= 0 && pos >= 0, name);
  return code.slice(0, pos + 4) + `\n__hit('${name}');\n` + code.slice(pos + 4);
}
function instrument(code, file, candidate) {
  if (file === 'diff.ts') {
    code = enter(code, 'diffLoopChildren');
    code = once(
      code,
      'origChildren.forEach((item, index) => {',
      "origChildren.forEach((item, index) => { __hit('originalVisits');"
    );
    code = code.replaceAll(
      'const key = getKey(item);',
      "__hit('diffKeyReads'); const key = getKey(item);"
    );
    code = code.replaceAll(
      'new Map<unknown, number>()',
      "(__hit('mapCreate'), new Map<unknown, number>())"
    );
    code = code.replace(
      /((?:keyMap!?|map)\.(set|has|get|delete)\(key(?:, index)?\))/g,
      (_all, expression, operation) =>
        `(__hit('map${operation}'), ${expression})`
    );
    code = once(
      code,
      'origChildren.filter((_item, index) => !used[index])',
      "origChildren.filter((_item, index) => (__hit('unusedVisits'), !used[index]))"
    );
    if (candidate) {
      code = code.replaceAll(
        'new Set<unknown>()',
        "(__hit('setCreate'), new Set<unknown>())"
      );
      for (const operation of ['has', 'add'])
        code = code.replaceAll(
          `unique.${operation}(key)`,
          `(__hit('set${operation}'), unique.${operation}(key))`
        );
      code = once(
        code,
        'originalKeys[index] = key;',
        "__hit('snapshotWrites'); originalKeys[index] = key;"
      );
      code = once(
        code,
        'newWDom.so = frame;',
        "__hit('proofStage'); newWDom.so = frame;"
      );
      code = once(
        code,
        'const mapRemaining = (start: number) => {',
        "const mapRemaining = (start: number) => { __hit('fallbackMaps');"
      );
    }
  } else if (file === 'render.ts') {
    for (const name of ['updateChildren', 'clearDiffMeta', 'wDomUpdate'])
      code = enter(code, name);
    for (const [anchor, counter] of [
      ['const matchedIndexes: number[] = [];', 'matchedArrays'],
      ['const oiSeq: number[] = [];', 'oiArrays'],
      ['const movers: WDom[] = [];', 'moverArrays'],
      ['let createdCount = 0;', 'createdArrays'],
    ])
      code = once(code, anchor, `__hit('${counter}'); ${anchor}`);
    code = once(
      code,
      'children.forEach((item, index) => {\n    const oi',
      "children.forEach((item, index) => {\n    __hit('matchAnalysisVisits'); const oi"
    );
    if (candidate) {
      code = once(
        code,
        'children === proofChildren) {',
        "children === proofChildren) { __hit('fastLoops'); __hit('fastChildren', children.length);"
      );
      code = once(
        code,
        'if (frame) newWDom.so = newWDom.sc = undefined;',
        "if (frame) { __hit('proofConsume'); newWDom.so = newWDom.sc = undefined; }"
      );
    }
  } else if (file === 'wDom.ts' && candidate) {
    code = once(
      code,
      'childOrderRef.value = frame;',
      "__hit('frameStart'); childOrderRef.value = frame;"
    );
    code = once(
      code,
      'childOrderRef.value = previous;',
      "__hit('frameEnd'); childOrderRef.value = previous;"
    );
  } else if (file === 'utils/predicator.ts') {
    const start = code.indexOf('export const getKey =');
    const end = code.indexOf(';', start);
    const expression = code.slice(start, end + 1);
    const body = expression.slice(expression.indexOf('=>') + 2, -1);
    code =
      code.slice(0, start) +
      `export const getKey = (target: WDom) => { __hit('allKeyReads'); return (${body.trim()}); };` +
      code.slice(end + 1);
  } else return code;
  return helper + code;
}
const result = {
  at: new Date().toISOString(),
  environment: 'JSDOM structural work only',
  variants: {},
};
for (const variant of ['baseline', 'candidate']) {
  const source = path.join(out, variant, 'src'),
    dest = path.join(out, 'count-' + variant + '-' + run);
  assert(!fs.existsSync(dest));
  await build({
    configFile: false,
    root: app,
    logLevel: 'warn',
    plugins: [
      {
        name: 'dc25-count-only',
        enforce: 'pre',
        transform(code, id) {
          return id.startsWith(source + '/')
            ? instrument(
                code,
                path.relative(source, id),
                variant === 'candidate'
              )
            : null;
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
      lib: { entry, formats: ['es'], fileName: () => 'app.mjs' },
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
  const samples = [];
  const rows = () => [...document.querySelectorAll('tbody>tr')];
  const click = async (name, selector) => {
    globalThis.__dc25Counts = {};
    document.querySelector(selector).click();
    await runtime.nextTick();
    samples.push({
      name,
      rows: rows().length,
      counts: { ...globalThis.__dc25Counts },
    });
    globalThis.__dc25Counts = undefined;
  };
  await click('create1k', '#run');
  assert.equal(rows().length, 1000);
  const initial = rows();
  await click('select', 'tbody>tr:nth-child(2)>td:nth-child(2)>a');
  assert(initial[1].classList.contains('danger'));
  await click('select-next', 'tbody>tr:nth-child(3)>td:nth-child(2)>a');
  assert(
    initial[2].classList.contains('danger') &&
      !initial[1].classList.contains('danger')
  );
  const labels = initial.map(row => row.cells[1].textContent);
  await click('partial', '#update');
  assert(
    rows().every(
      (row, i) =>
        row === initial[i] &&
        row.cells[1].textContent === labels[i] + (i % 10 ? '' : ' !!!')
    )
  );
  await click('swap', '#swaprows');
  assert(rows()[1] === initial[998] && rows()[998] === initial[1]);
  await click('remove', 'tbody>tr:nth-child(3)>td:nth-child(3)>a');
  assert.equal(rows().length, 999);
  await click('replace1k', '#run');
  assert(rows().every(row => !initial.includes(row)));
  const replaced = rows();
  await click('append1k', '#add');
  assert.equal(rows().length, 2000);
  assert(replaced.every((row, i) => row === rows()[i]));
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
const baseline = result.variants.baseline.samples,
  candidate = result.variants.candidate.samples;
for (let i = 0; i < baseline.length; i++) {
  assert.equal(baseline[i].name, candidate[i].name);
  assert.equal(baseline[i].rows, candidate[i].rows);
  for (const key of [
    'allKeyReads',
    'diffKeyReads',
    'originalVisits',
    'clearDiffMeta',
    'wDomUpdate',
  ])
    assert.equal(
      candidate[i].counts[key] || 0,
      baseline[i].counts[key] || 0,
      baseline[i].name + '/' + key
    );
  assert.equal(candidate[i].counts.frameStart, candidate[i].counts.frameEnd);
  if (['select', 'select-next', 'partial'].includes(baseline[i].name)) {
    assert.equal(candidate[i].counts.fastLoops, 1);
    for (const key of [
      'mapCreate',
      'mapget',
      'mapdelete',
      'unusedVisits',
      'matchAnalysisVisits',
      'matchedArrays',
      'oiArrays',
      'moverArrays',
      'createdArrays',
    ])
      assert.equal(
        candidate[i].counts[key] || 0,
        0,
        baseline[i].name + '/' + key
      );
  }
}
write(path.join(out, 'counts-' + run + '.json'), result);
guard(out);
console.log(
  JSON.stringify({
    actions: baseline.length,
    variants: 2,
    select: candidate[1].counts,
    partial: candidate[3].counts,
  })
);
