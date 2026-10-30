import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
import { overlay } from './overlay.mjs';
const root = process.cwd();
const dev = path.resolve(
  process.argv[3] || '/private/tmp/lithent-static-dynamic-check'
);
overlay(dev);
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const compiled = await build({
  stdin: {
    resolveDir: dev,
    loader: 'ts',
    contents: `
 import * as core from './index.ts';
 import {defineBlock} from './block.ts';
 import {metrics,resetMetrics} from './metrics.ts';
 import {makeNewWDomTree} from './diff.ts';
 import {wDomUpdate} from './render.ts';
 import {cloneWDom} from './wDom.ts';
 Object.assign(globalThis,{...core,defineBlock,metrics,resetMetrics,makeNewWDomTree,wDomUpdate,cloneWDom});`,
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  alias: { '@': dev },
  define: { __STATIC_DIAGNOSTIC__: 'true' },
});
const cases = [],
  work = [];
const tick = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
function schema() {
  return {
    tag: 'section',
    attrs: { class: { slot: 0 }, 'data-kind': 'fixed' },
    children: [
      {
        tag: 'p',
        attrs: { class: 'text' },
        children: ['before ', { slot: 1 }],
      },
      { tag: 'button', attrs: { onClick: { slot: 2 } }, children: ['go'] },
      { tag: 'span', attrs: { title: { slot: 3 } }, children: ['tail'] },
    ],
  };
}
const values = (
  label = 'first',
  cls = undefined,
  handler = () => {},
  title = 'tip'
) => [cls, label, handler, title];
function plain(w, v, key) {
  const h = w.h;
  return h(
    'section',
    { key, class: v[0], 'data-kind': 'fixed' },
    h('p', { class: 'text' }, 'before ', v[1]),
    h('button', { onClick: v[2] }, 'go'),
    h('span', { title: v[3] }, 'tail')
  );
}
async function test(name, run) {
  const dom = new JSDOM('<main></main><aside></aside>', {
    runScripts: 'outside-only',
  });
  try {
    dom.window.eval(compiled.outputFiles[0].text);
    await run(dom.window, dom.window.document.querySelector('main'));
    cases.push({ name, passed: true });
  } finally {
    dom.window.close();
  }
}
function component(w, host, view) {
  let renew;
  const App = w.mount(r => {
    renew = r;
    return view;
  });
  const unmount = w.render(w.h(App, {}), host);
  return {
    renew: async () => {
      renew();
      await tick();
    },
    unmount,
  };
}
await test('initial DOM matches ordinary h and instances own every node', async (w, host) => {
  const block = w.defineBlock(schema()),
    v = values();
  const a = w.document.querySelector('aside');
  w.render(plain(w, v, 1), a);
  w.render(w.h('div', {}, block(v, 1), block(v, 2)), host);
  assert.equal(host.firstChild.firstChild.outerHTML, a.firstChild.outerHTML);
  const rows = host.querySelectorAll('section');
  assert.notEqual(rows[0], rows[1]);
  assert.notEqual(rows[0].querySelector('p'), rows[1].querySelector('p'));
});
await test('text attr class and number patches retain static DOM identities', async (w, host) => {
  const block = w.defineBlock(schema());
  let v = values();
  const app = component(w, host, () => block(v, 1));
  const nodes = [...host.querySelectorAll('*')];
  v = values(42, 'danger', v[2], 'next');
  await app.renew();
  assert.deepEqual([...host.querySelectorAll('*')], nodes);
  assert.equal(host.querySelector('p').textContent, 'before 42');
  assert.equal(host.querySelector('section').getAttribute('class'), 'danger');
  assert.equal(host.querySelector('span').title, 'next');
});
await test('undefined and empty class observations match ordinary updater', async (w, host) => {
  const block = w.defineBlock(schema()),
    aside = w.document.querySelector('aside');
  let v = values();
  const a = component(w, host, () => block(v, 1)),
    b = component(w, aside, () => plain(w, v, 1));
  for (const cls of ['danger', undefined, '', undefined, 'other']) {
    v = values(v[1], cls, v[2]);
    await a.renew();
    await b.renew();
    assert.equal(host.innerHTML, aside.innerHTML);
  }
});
await test('unchanged slots cause no DOM writes', async (w, host) => {
  const block = w.defineBlock(schema()),
    v = values();
  const app = component(w, host, () => block(v, 1));
  w.resetMetrics();
  await app.renew();
  assert.equal(w.metrics.textWrites, 0);
  assert.equal(w.metrics.attrWrites, 0);
  assert.equal(w.metrics.eventAdds, 0);
  assert.equal(w.metrics.eventRemoves, 0);
  assert.equal(w.metrics.fastBlocks, 1);
});
await test('direct events replace and remove through the ordinary updater', async (w, host) => {
  let a = 0,
    b = 0;
  const one = () => a++,
    two = () => b++;
  const block = w.defineBlock(schema());
  let v = values('x', undefined, one);
  const app = component(w, host, () => block(v, 1));
  const button = host.querySelector('button');
  button.click();
  v = values('x', undefined, two);
  await app.renew();
  button.click();
  v = [undefined, 'x', undefined, 'tip'];
  await app.renew();
  button.click();
  assert.equal(a, 1);
  assert.equal(b, 1);
  assert.equal(host.querySelector('button'), button);
});
await test('caller value array mutations do not change the description snapshot', async (w, host) => {
  const block = w.defineBlock(schema()),
    v = values();
  const description = block(v, 1);
  v[1] = 'mutated';
  w.render(description, host);
  assert.equal(host.querySelector('p').textContent, 'before first');
});
await test('schema mutations do not change the compiled plan', async (w, host) => {
  const s = schema(),
    block = w.defineBlock(s);
  s.children[0].attrs.class = 'broken';
  s.children.length = 0;
  w.render(block(values(), 1), host);
  assert.equal(host.querySelector('p').className, 'text');
  assert.equal(host.querySelectorAll('button').length, 1);
});
await test('blueprint change and plain/template transition take full diff', async (w, host) => {
  const one = w.defineBlock(schema()),
    s = schema();
  s.children[0].attrs.class = 'other';
  const two = w.defineBlock(s);
  let mode = 0,
    v = values();
  const app = component(w, host, () =>
    mode === 0 ? one(v, 1) : mode === 1 ? two(v, 1) : plain(w, v, 1)
  );
  mode = 1;
  v = values('second');
  await app.renew();
  assert.equal(host.querySelector('p').className, 'other');
  mode = 2;
  await app.renew();
  assert.equal(host.querySelector('p').className, 'text');
  mode = 0;
  v = values('third');
  await app.renew();
  v = values('fourth');
  await app.renew();
  assert.equal(host.querySelector('p').textContent, 'before fourth');
});
await test('mixed ordinary siblings and parent callbacks observe committed values', async (w, host) => {
  const block = w.defineBlock(schema());
  let label = 'first',
    seen = '';
  const App = w.mount(renew => {
    w.updateCallback(() => () => {
      seen = host.querySelector('p')?.textContent;
    });
    w.go = renew;
    return () =>
      w.h(
        'div',
        {},
        w.h('i', {}, 'left'),
        block(values(label), 1),
        w.h('i', {}, 'right')
      );
  });
  w.render(w.h(App, {}), host);
  label = 'next';
  w.go();
  await tick();
  assert.equal(seen, 'before next');
  assert.equal(host.firstChild.firstChild.textContent, 'left');
  assert.equal(host.firstChild.lastChild.textContent, 'right');
});
await test('keyed swaps insertion removal and repeated updates preserve identity', async (w, host) => {
  const block = w.defineBlock(schema());
  let rows = [1, 2, 3, 4],
    label = 'x';
  const handler = () => {};
  const app = component(w, host, () =>
    w.h(
      'div',
      {},
      rows.map(id => block(values(label + id, undefined, handler), id))
    )
  );
  const original = [...host.querySelectorAll('section')];
  rows = [4, 2, 5, 1];
  label = 'y';
  await app.renew();
  const next = [...host.querySelectorAll('section')];
  assert.equal(next[0], original[3]);
  assert.equal(next[1], original[1]);
  assert.equal(next[3], original[0]);
  assert(!original[2].isConnected);
  assert.equal(next[0].querySelector('p').textContent, 'before y4');
  label = 'z';
  await app.renew();
  assert.equal(host.querySelector('p').textContent, 'before z4');
});
await test('same cached description in the same place remains unchanged', async (w, host) => {
  const block = w.defineBlock(schema()),
    node = block(values(), 1);
  const app = component(w, host, () => w.h('div', {}, node));
  const el = host.querySelector('section');
  await app.renew();
  assert.equal(host.querySelector('section'), el);
});
await test('same description in two places is cloned independently', async (w, host) => {
  const block = w.defineBlock(schema()),
    node = block(values(), 1);
  w.render(w.h('div', {}, node, node), host);
  const nodes = host.querySelectorAll('section');
  assert.equal(nodes.length, 2);
  assert.notEqual(nodes[0], nodes[1]);
  assert.equal(nodes[0].innerHTML, nodes[1].innerHTML);
});
await test('pending description clone uses its value snapshot', async (w, host) => {
  const block = w.defineBlock(schema());
  let initial = block(values('old'), 1);
  w.render(w.h('div', {}, initial), host);
  const pending = block(values('pending'), 1);
  w.makeNewWDomTree(pending, initial);
  const clone = w.cloneWDom(pending);
  const aside = w.document.querySelector('aside');
  w.render(clone, aside);
  assert.equal(aside.querySelector('p').textContent, 'before pending');
});
await test('retired description clone keeps its own snapshot after later patches', async (w, host) => {
  const block = w.defineBlock(schema());
  const retired = block(values('original'), 1);
  let node = retired;
  const app = component(w, host, () => node);
  node = block(values('new'), 1);
  await app.renew();
  const aside = w.document.querySelector('aside');
  w.render(w.cloneWDom(retired), aside);
  assert.equal(aside.querySelector('p').textContent, 'before original');
  assert.equal(host.querySelector('p').textContent, 'before new');
});
await test('unmount remount and event ownership remain independent', async (w, host) => {
  const block = w.defineBlock(schema());
  let clicks = 0;
  const v = values('x', undefined, () => clicks++);
  let shown = true;
  const app = component(w, host, () =>
    w.h('div', {}, shown ? block(v, 1) : null)
  );
  const first = host.querySelector('button');
  first.click();
  shown = false;
  await app.renew();
  assert(!first.isConnected);
  shown = true;
  await app.renew();
  host.querySelector('button').click();
  assert.equal(clicks, 2);
  assert.notEqual(first, host.querySelector('button'));
  app.unmount();
  assert.equal(host.innerHTML, '');
});
await test('focus on a static button survives scalar updates and keyed moves', async (w, host) => {
  const block = w.defineBlock(schema());
  let rows = [1, 2],
    label = 'x';
  const handler = () => {};
  const app = component(w, host, () =>
    w.h(
      'div',
      {},
      rows.map(id => block(values(label, undefined, handler), id))
    )
  );
  const button = host.querySelector('button');
  button.focus();
  label = 'y';
  await app.renew();
  assert.equal(w.document.activeElement, button);
  rows = [2, 1];
  await app.renew();
  assert.equal(host.querySelectorAll('button')[1], button);
});
await test('unsupported schemas and schema accessors are rejected without invoking getters', async (w, host) => {
  for (const tag of ['input', 'svg', 'portal', 'x-widget'])
    assert.throws(() => w.defineBlock({ tag }));
  for (const name of ['ref', 'style', 'innerHTML'])
    assert.throws(() => w.defineBlock({ tag: 'div', attrs: { [name]: 'x' } }));
  let reads = 0;
  const attrs = {
    get title() {
      reads++;
      return 'x';
    },
  };
  assert.throws(() => w.defineBlock({ tag: 'div', attrs }));
  assert.equal(reads, 0);
  const block = w.defineBlock(schema());
  assert.throws(() => block([], 1));
  assert.throws(() => block([undefined, null, () => {}, 'tip'], 1));
});
await test('nested parent links follow the current root after fast patches', async (w, host) => {
  const block = w.defineBlock(schema());
  let node = block(values(), 1);
  const app = component(w, host, () => node);
  node = block(values('new'), 1);
  await app.renew();
  assert.equal(node.children[0].getParent(), node);
  assert.equal(node.children[0].children[1].getParent(), node.children[0]);
  assert.equal(node.children[0].children[1].text, 'new');
});
await test('partial DOM commit fault is explicit and owner remount recovers', async (w, host) => {
  const block = w.defineBlock(schema());
  const previous = block(values(), 1);
  const app = component(w, host, () => previous);
  const el = host.querySelector('section'),
    set = el.setAttribute;
  el.setAttribute = () => {
    throw Error('injected setter failure');
  };
  const node = block(values('new', 'danger'), 1);
  assert.throws(() => {
    const next = w.makeNewWDomTree(node, previous);
    w.wDomUpdate(next);
  }, /injected setter failure/);
  assert.throws(
    () => w.makeNewWDomTree(block(values('retry'), 1), node),
    /unmount\/remount/
  );
  el.setAttribute = set;
  app.unmount();
  w.render(block(values('recovered'), 1), host);
  assert.equal(host.querySelector('p').textContent, 'before recovered');
});
// Work counts use the same cached row/list protocol; no timing conclusions.
for (const n of [1000, 10000])
  for (const k of [1, 100])
    for (const variant of ['plain', 'hinted'])
      await test(`work ${variant} n=${n} k=${k}`, async (w, host) => {
        const block = w.defineBlock(schema()),
          handler = () => {};
        const rows = Array.from({ length: n }, (_, id) => ({
          id,
          label: 'row ' + id,
          cache: null,
          previous: null,
        }));
        const view = row => {
          if (row.previous === row.label) return row.cache;
          row.previous = row.label;
          return (row.cache =
            variant === 'plain'
              ? plain(w, values(row.label, undefined, handler), row.id)
              : block(values(row.label, undefined, handler), row.id));
        };
        const app = component(w, host, () => w.h('div', {}, rows.map(view)));
        const original = [...host.querySelectorAll('section')];
        for (let i = 0; i < k; i++) rows[i].label += '!';
        w.resetMetrics();
        await app.renew();
        const counts = { ...w.metrics };
        assert.deepEqual([...host.querySelectorAll('section')], original);
        assert.equal(counts.textWrites, k);
        assert.equal(counts.domCreates, 0);
        work.push({ n, k, variant, counts });
      });
for (const n of [1000, 10000])
  for (const k of [1, 100]) {
    const a = work.find(x => x.n === n && x.k === k && x.variant === 'plain'),
      b = work.find(x => x.n === n && x.k === k && x.variant === 'hinted');
    assert(b.counts.wdCreated < a.counts.wdCreated);
    assert(b.counts.diffVisits < a.counts.diffVisits);
    assert.equal(a.counts.textWrites, b.counts.textWrites);
  }
const result = {
  at: new Date().toISOString(),
  cases: cases.length,
  results: cases,
  work,
  scope:
    'isolated HTML block contract and untimed observed counters; not compiler adoption',
};
if (process.argv[2])
  fs.writeFileSync(process.argv[2], JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ cases: cases.length, work }, null, 2));
