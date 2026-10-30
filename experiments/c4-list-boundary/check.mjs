import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const result = await build({
  stdin: {
    resolveDir: root,
    loader: 'ts',
    contents: `
      import { h, render } from './src/index.ts';
      import { createListBoundary } from './experiments/c4-list-boundary/boundary.ts';
      Object.assign(globalThis, { h, render, createListBoundary });
    `,
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  alias: { '@': path.join(root, 'src') },
  define: { __C4_DIAGNOSTIC__: 'true' },
});
const dom = new JSDOM('<main></main>', { runScripts: 'outside-only' });
const w = dom.window;
w.eval(result.outputFiles[0].text);
const { h, render, createListBoundary } = w;
let selected = -1;
let failView = false;
let reenter = false;
const b = createListBoundary(
  x => x.id,
  x => {
    if (failView) throw Error('view failed');
    if (reenter) b.invalidate([x.id]);
    return h(
      'li',
      { key: x.id, class: x.id === selected ? 'active' : '' },
      h('input', { value: x.label }),
      h('span', {}, x.label)
    );
  }
);
const host = w.document.querySelector('main');
render(h('ul', {}, b.node), host);
let cases = 0;
const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
const list = n =>
  Array.from({ length: n }, (_, id) => ({ id, label: 'row ' + id }));
for (const n of [1000, 10000]) {
  const data = list(n);
  b.set(data);
  await tick();
  assert.equal(host.querySelectorAll('li').length, n);
  const nodes = [...host.querySelectorAll('li')];
  for (const k of [1, 2, 100, 1000]) {
    const keys = Array.from({ length: k }, (_, i) => n - 1 - i);
    const before = b.metrics.itemViews;
    for (const key of keys) data[key].label += '!';
    b.invalidate(keys);
    await tick();
    assert.equal(b.metrics.itemViews - before, k);
    assert.equal(host.lastChild.lastChild, nodes[n - 1]);
    for (const key of keys)
      assert.equal(
        nodes[key].querySelector('span').textContent,
        data[key].label
      );
    cases++;
  }
  // Same-tick invalidations coalesce. Reorder + invalidate uses structural fallback.
  let before = b.metrics.itemViews;
  b.invalidate([n - 1]);
  b.invalidate([n - 1]);
  await tick();
  assert.equal(b.metrics.itemViews - before, 1);
  cases++;
  [data[1], data[n - 1]] = [data[n - 1], data[1]];
  b.set(data);
  b.invalidate([data[1].id]);
  await tick();
  assert.equal(host.querySelectorAll('li')[1], nodes[n - 1]);
  cases++;
  data.splice(1, 1);
  b.set(data);
  await tick();
  assert.equal(host.querySelectorAll('li').length, n - 1);
  assert.equal(b.has(n - 1), false);
  cases++;
}
assert.throws(() => b.set([{ id: 1 }, { id: 1 }]), /duplicate/);
cases++;
assert.throws(() => b.invalidate([-999]), /unknown/);
cases++;
const data = [
  { id: 1, label: 'editable' },
  { id: 2, label: 'second' },
];
b.set(data);
await tick();
const input = host.querySelector('input');
input.focus();
input.setSelectionRange(2, 4);
selected = 2;
b.invalidate([2]);
await tick();
assert.equal(w.document.activeElement, input);
assert.equal(input.selectionStart, 2);
cases++;
// Throwing views commit no earlier dirty item; explicit retry repairs the pending batch.
failView = true;
b.invalidate([1, 2]);
assert.throws(() => b.flush(), /view failed/);
failView = false;
b.flush();
await tick();
cases++;
reenter = true;
b.invalidate([1]);
assert.throws(() => b.flush(), /reentrant/);
reenter = false;
b.flush();
await tick();
cases++;
data[0].id = 3;
b.invalidate([1]);
assert.throws(() => b.flush(), /key changed/);
data[0].id = 1;
b.flush();
await tick();
cases++;
b.set([]);
await tick();
assert.equal(host.querySelectorAll('li').length, 0);
cases++;
b.set([{ id: 3, label: 'not committed' }]);
b.dispose();
await tick();
assert.equal(host.querySelectorAll('li').length, 0);
assert.throws(() => b.invalidate([3]), /disposed/);
cases++;
const summary = {
  at: new Date().toISOString(),
  cases,
  metrics: b.metrics,
  scope: 'untimed JSDOM; general editable list; base-only bounded contract',
};
if (process.argv[2])
  fs.writeFileSync(process.argv[2], JSON.stringify(summary, null, 2) + '\n');
console.log(summary);
dom.window.close();
