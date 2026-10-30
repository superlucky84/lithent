import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
const root = process.cwd(),
  require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const compiled = await build({
  stdin: {
    resolveDir: root,
    loader: 'ts',
    contents: `
 import {h,mount,render,updateCallback} from './src/index.ts';
 import {createListBoundary as baseline} from './experiments/c4-owner/boundary.ts';
 import {createListBoundary as candidate} from './experiments/c4-key-snapshot/boundary.ts';
 Object.assign(globalThis,{h,mount,render,updateCallback,baseline,candidate});`,
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  alias: { '@': path.join(root, 'src') },
  define: { __C4_DIAGNOSTIC__: 'true' },
});
const tick = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};
const work = [],
  cases = [];
for (const n of [1000, 10000])
  for (const variant of ['baseline', 'candidate']) {
    const dom = new JSDOM('<main></main>', { runScripts: 'outside-only' });
    const w = dom.window;
    let gets = 0,
      reads = 0;
    w.Map = class extends w.Map {
      get(key) {
        gets++;
        return super.get(key);
      }
    };
    w.eval(compiled.outputFiles[0].text);
    const { h, render } = w;
    const b = w[variant](
      x => {
        reads++;
        return x.id;
      },
      x => x.node
    );
    render(h('ul', {}, h(b.View, {})), w.document.querySelector('main'));
    const data = Array.from({ length: n }, (_, id) => ({
      id,
      node: h('li', { key: id }, '' + id),
    }));
    for (const operation of ['create', 'swap']) {
      if (operation === 'swap') [data[1], data[n - 1]] = [data[n - 1], data[1]];
      gets = 0;
      reads = 0;
      b.set(data);
      await tick();
      work.push({
        n,
        variant,
        operation,
        keyOf: reads,
        mapGet: gets,
        snapshotKeyWrites: variant === 'candidate' ? n : 0,
      });
    }
    dom.window.close();
  }
for (const n of [1000, 10000])
  for (const operation of ['create', 'swap']) {
    const b = work.find(
      v => v.n === n && v.operation === operation && v.variant === 'baseline'
    );
    const c = work.find(
      v => v.n === n && v.operation === operation && v.variant === 'candidate'
    );
    assert.equal(b.keyOf - c.keyOf, n);
    assert.equal(b.mapGet - c.mapGet, n);
  }
async function test(name, run) {
  const dom = new JSDOM('<main></main>', { runScripts: 'outside-only' });
  dom.window.eval(compiled.outputFiles[0].text);
  try {
    await run(dom.window, dom.window.document.querySelector('main'));
    cases.push(name);
  } finally {
    dom.window.close();
  }
}
await test('mutation after set is rejected before commit and can be retried', async (w, host) => {
  const { h, render, candidate } = w;
  const data = [
    { id: 1, label: 'a' },
    { id: 2, label: 'b' },
  ];
  const b = candidate(
    x => x.id,
    x => h('li', { key: x.id }, x.label)
  );
  render(h('ul', {}, h(b.View, {})), host);
  b.set(data);
  data[0].id = 9;
  assert.throws(() => b.flush(), /key changed/);
  assert.equal(host.textContent, '');
  data[0].id = 1;
  b.flush();
  await tick();
  assert.equal(host.textContent, 'ab');
});
await test('caller array mutation does not alter the owned structure', async (w, host) => {
  const { h, render, candidate } = w;
  const data = [
    { id: 1, label: 'a' },
    { id: 2, label: 'b' },
  ];
  const b = candidate(
    x => x.id,
    x => h('li', { key: x.id }, x.label)
  );
  render(h('ul', {}, h(b.View, {})), host);
  b.set(data);
  data.reverse();
  await tick();
  assert.equal(host.textContent, 'ab');
  b.edit(1, x => {
    x.label = 'A';
  });
  await tick();
  assert.equal(host.textContent, 'Ab');
});
await test('invalid set preserves the previous items keys and indexes', async (w, host) => {
  const { h, render, candidate } = w;
  const b = candidate(
    x => x.id,
    x => h('li', { key: x.id }, x.label)
  );
  b.set([{ id: 1, label: 'a' }]);
  render(h('ul', {}, h(b.View, {})), host);
  assert.throws(
    () =>
      b.set([
        { id: 2, label: 'x' },
        { id: 2, label: 'y' },
      ]),
    /duplicate/
  );
  b.edit(1, x => {
    x.label = 'A';
  });
  await tick();
  assert.equal(host.textContent, 'A');
  assert.equal(b.has(2), false);
});
await test('lifecycle set publishes a separate key snapshot for next batch', async (w, host) => {
  const { h, mount, render, updateCallback, candidate } = w;
  let b,
    armed = true;
  const data = [
    { id: 1, label: 'a' },
    { id: 2, label: 'b' },
  ];
  const Child = mount((_r, p) => {
    updateCallback(() => () => {
      if (armed) {
        armed = false;
        b.set([{ id: 3, label: 'c' }, data[1]]);
        b.edit(2, x => {
          x.label = 'B';
        });
      }
    });
    return () => h('span', {}, p.row.label);
  });
  b = candidate(
    x => x.id,
    x => h('li', { key: x.id }, h(Child, { row: x }))
  );
  b.set(data);
  render(h('ul', {}, h(b.View, {})), host);
  b.set([data[1], data[0]]);
  await tick();
  assert.equal(host.textContent, 'cB');
  assert.equal(b.has(1), false);
  assert.equal(b.has(3), true);
});
await test('falsy keys and SameValueZero duplicate protection are retained', async (w, host) => {
  const { h, render, candidate } = w;
  const b = candidate(
    x => x.id,
    x => h('li', { key: x.id }, x.label)
  );
  b.set([
    { id: 0, label: 'zero' },
    { id: '', label: 'empty' },
    { id: '__proto__', label: 'proto' },
  ]);
  render(h('ul', {}, h(b.View, {})), host);
  b.edit('', x => {
    x.label = 'E';
  });
  await tick();
  assert.equal(host.textContent, 'zeroEproto');
  assert.throws(() => b.set([{ id: 0 }, { id: -0 }]), /duplicate/);
  b.dispose();
  b.dispose();
  assert.equal(b.has(''), false);
});
const result = {
  at: new Date().toISOString(),
  work,
  cases,
  scope:
    'untimed counts and key-snapshot contract; counts are not timing or byte savings',
};
if (process.argv[2])
  fs.writeFileSync(process.argv[2], JSON.stringify(result, null, 2) + '\n');
console.log(result);
