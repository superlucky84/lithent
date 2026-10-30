import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
const root = process.cwd();
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const compiled = await build({
  stdin: {
    resolveDir: root,
    loader: 'ts',
    contents: `
    import * as core from './src/index.ts';
    import { needDiffRef } from './src/utils/universalRef.ts';
    import { createListBoundary } from './experiments/c4-key-snapshot/boundary.ts';
    Object.assign(globalThis,{ ...core, needDiffRef, createListBoundary });`,
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  alias: { '@': path.join(root, 'src') },
  define: { __C4_DIAGNOSTIC__: 'true' },
});
const results = [];
async function test(name, callback) {
  const dom = new JSDOM('<main></main><aside></aside>', {
    runScripts: 'outside-only',
  });
  try {
    dom.window.eval(compiled.outputFiles[0].text);
    await callback(dom.window, dom.window.document.querySelector('main'));
    assert.equal(dom.window.needDiffRef.value, false, 'diff context restored');
    results.push({ name, passed: true });
  } finally {
    dom.window.close();
  }
}
const tick = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
for (const n of [1000, 10000])
  for (const k of [1, 2, 100, 1000])
    await test(`work n=${n} k=${k}`, async (w, host) => {
      const { h, render, createListBoundary } = w;
      const data = Array.from({ length: n }, (_, id) => ({
        id,
        label: 'row ' + id,
      }));
      const b = createListBoundary(
        x => x.id,
        x => h('li', { key: x.id }, x.label)
      );
      b.set(data);
      render(h('ul', {}, h(b.View, {})), host);
      const rows = [...host.querySelectorAll('li')];
      const before = b.metrics.itemViews;
      for (let i = 0; i < k; i++)
        b.edit(n - 1 - i, x => {
          x.label += '!';
        });
      await tick();
      assert.equal(b.metrics.itemViews - before, k);
      assert([...host.querySelectorAll('li')].every((r, i) => r === rows[i]));
      assert.equal(rows[n - 1].textContent, data[n - 1].label);
    });
for (const order of ['parent-first', 'items-first'])
  await test('parent renewal ' + order, async (w, host) => {
    const { h, mount, render, createListBoundary } = w;
    let renew,
      show = true;
    const data = [
      { id: 0, label: 'a' },
      { id: 1, label: 'b' },
    ];
    const b = createListBoundary(
      x => x.id,
      x => h('li', { key: x.id }, x.label)
    );
    b.set(data);
    const App = mount(r => {
      renew = r;
      return () => h('ul', {}, show ? h(b.View, {}) : null);
    });
    render(h(App, {}), host);
    const nodes = [...host.querySelectorAll('li')];
    const before = b.metrics.itemViews;
    if (order === 'parent-first') {
      renew();
      b.edit(1, x => {
        x.label = 'edited';
      });
    } else {
      b.edit(1, x => {
        x.label = 'edited';
      });
      renew();
    }
    await tick();
    assert.equal(b.metrics.itemViews - before, 1);
    assert.equal(nodes[1].textContent, 'edited');
    assert.equal(host.querySelectorAll('li')[1], nodes[1]);
    b.edit(0, x => {
      x.label = 'pending';
    });
    show = false;
    renew();
    await tick();
    assert.equal(host.querySelectorAll('li').length, 0);
    show = true;
    renew();
    await tick();
    assert.equal(host.querySelector('li').textContent, 'pending');
    assert.notEqual(host.querySelector('li'), nodes[0]);
  });
await test('nested component props and own renewal', async (w, host) => {
  const { h, mount, render, mountCallback, createListBoundary } = w;
  let setups = 0,
    mounts = 0,
    unmounts = 0,
    childRenew;
  let local = 0;
  const Child = mount((renew, props) => {
    setups++;
    childRenew = renew;
    mountCallback(() => {
      mounts++;
      return () => {
        unmounts++;
      };
    });
    return () => h('span', {}, props.value + ':' + local);
  });
  const b = createListBoundary(
    x => x.id,
    x => h('li', { key: x.id }, h(Child, { value: x.label }))
  );
  b.set([{ id: 1, label: 'a' }]);
  render(h('ul', {}, h(b.View, {})), host);
  b.edit(1, x => {
    x.label = 'b';
  });
  await tick();
  assert.equal(host.textContent, 'b:0');
  local = 1;
  childRenew();
  await tick();
  assert.equal(host.textContent, 'b:1');
  b.edit(1, x => {
    x.label = 'c';
  });
  await tick();
  assert.equal(host.textContent, 'c:1');
  assert.equal(setups, 1);
  assert.equal(mounts, 1);
  b.set([]);
  await tick();
  assert.equal(unmounts, 1);
});
await test('component roots and multiple DOM roots', async (w, host) => {
  const { h, mount, render, Fragment, createListBoundary, mountCallback } = w;
  let setups = 0,
    cleanup = 0;
  const Row = mount((_r, p) => {
    setups++;
    mountCallback(() => () => {
      cleanup++;
    });
    return () =>
      h(Fragment, {}, h('i', {}, p.row.label), h('b', {}, p.row.label));
  });
  const data = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ];
  const b = createListBoundary(
    x => x.id,
    x => h(Row, { key: x.id, row: x })
  );
  b.set(data);
  render(h('section', {}, h(b.View, {})), host);
  const nodes = [...host.querySelectorAll('i,b')];
  b.edit('b', x => {
    x.label = 'C';
  });
  await tick();
  assert.equal(host.textContent, 'AACC');
  assert.equal(setups, 2);
  b.set([data[1], data[0]]);
  await tick();
  assert.equal(host.querySelector('i'), nodes[2]);
  b.set([]);
  await tick();
  assert.equal(cleanup, 2);
});
await test('lifecycle invalidation is retained for next batch', async (w, host) => {
  const { h, mount, render, updateCallback, createListBoundary } = w;
  let b;
  let once = true;
  const Child = mount((_r, p) => {
    updateCallback(() => () => {
      if (once) {
        once = false;
        b.edit(2, x => {
          x.label = 'from callback';
        });
      }
    });
    return () => h('span', {}, p.row.label);
  });
  b = createListBoundary(
    x => x.id,
    x => h('li', { key: x.id }, h(Child, { row: x }))
  );
  b.set([
    { id: 1, label: 'a' },
    { id: 2, label: 'b' },
  ]);
  render(h('ul', {}, h(b.View, {})), host);
  b.edit(1, x => {
    x.label = 'edited';
  });
  await tick();
  assert.equal(host.textContent, 'editedfrom callback');
  assert.equal(b.metrics.flushes, 2);
});
await test('unmount callback can update retained item', async (w, host) => {
  const { h, mount, render, mountCallback, createListBoundary } = w;
  let b;
  const Child = mount((_r, p) => {
    mountCallback(() => () => {
      if (p.row.id === 1)
        b.edit(2, x => {
          x.label = 'cleanup';
        });
    });
    return () => h('span', {}, p.row.label);
  });
  const data = [
    { id: 1, label: 'a' },
    { id: 2, label: 'b' },
  ];
  b = createListBoundary(
    x => x.id,
    x => h('li', { key: x.id }, h(Child, { row: x }))
  );
  b.set(data);
  render(h('ul', {}, h(b.View, {})), host);
  b.set([data[1]]);
  await tick();
  assert.equal(host.textContent, 'cleanup');
});
await test('nested portal removal: current base observation', async (w, host) => {
  const { h, render, portal, createListBoundary } = w;
  const aside = w.document.querySelector('aside');
  const b = createListBoundary(
    x => x.id,
    x =>
      h(
        'li',
        { key: x.id },
        portal(h('button', { onClick: () => {} }, x.label), aside)
      )
  );
  b.set([{ id: 1, label: 'portal' }]);
  render(h('ul', {}, h(b.View, {})), host);
  b.edit(1, x => {
    x.label = 'changed';
  });
  await tick();
  assert.equal(aside.textContent, 'changed');
  b.set([]);
  await tick();
  assert.equal(aside.textContent, 'changed');
  assert(aside.isConnected);
  // Confirm the same retention in the unchanged ordinary base component path.
  const { mount } = w;
  let renew;
  let show = true;
  const Base = mount(r => {
    renew = r;
    return () =>
      h(
        'ul',
        {},
        show ? h('li', {}, portal(h('button', {}, 'baseline'), aside)) : null
      );
  });
  render(h(Base, {}), w.document.createElement('div'));
  show = false;
  renew();
  await tick();
  assert.equal(aside.textContent, 'changedbaseline');
});
await test('view retry, write/reentry guard, and idempotent dispose', async (w, host) => {
  const { h, render, createListBoundary } = w;
  let fail = false,
    write = false,
    b;
  b = createListBoundary(
    x => x.id,
    x => {
      if (fail) throw Error('view failure');
      if (write) b.invalidate([1]);
      return h('li', { key: x.id }, x.label);
    }
  );
  b.set([{ id: 1, label: 'a' }]);
  render(h('ul', {}, h(b.View, {})), host);
  b.edit(1, x => {
    x.label = 'b';
  });
  fail = true;
  assert.throws(() => b.flush(), /view failure/);
  assert.equal(host.textContent, 'a');
  fail = false;
  b.flush();
  await tick();
  assert.equal(host.textContent, 'b');
  write = true;
  b.invalidate([1]);
  assert.throws(() => b.flush(), /write during view/);
  write = false;
  b.flush();
  await tick();
  assert.throws(() => b.invalidate([9]), /unknown/);
  assert.throws(() => b.set([{ id: 1 }, { id: 1 }]), /duplicate/);
  b.edit(1, x => {
    x.label = 'pending';
  });
  b.dispose();
  b.dispose();
  await tick();
  assert.equal(host.textContent, 'b');
  assert.throws(() => b.invalidate([1]), /disposed/);
});
await test('commit fault requires remount and then recovers', async (w, host) => {
  const { h, mount, render, createListBoundary } = w;
  let renew,
    show = true;
  const b = createListBoundary(
    x => x.id,
    x => h('li', { key: x.id, fail: x.fail }, x.label)
  );
  const data = [{ id: 1, label: 'a', fail: 0 }];
  b.set(data);
  const App = mount(r => {
    renew = r;
    return () => h('ul', {}, show ? h(b.View, {}) : null);
  });
  render(h(App, {}), host);
  const element = host.querySelector('li');
  const setAttribute = element.setAttribute;
  element.setAttribute = function (name, value) {
    if (name === 'fail' && Number(value) === 1) throw Error('DOM failure');
    return setAttribute.call(this, name, value);
  };
  b.edit(1, x => {
    x.fail = 1;
    x.label = 'b';
  });
  assert.throws(() => b.flush(), /DOM failure/);
  assert.throws(() => b.flush(), /remount/);
  // The original queued task must not throw again after entering fault.
  show = false;
  renew();
  await tick();
  show = true;
  renew();
  await tick();
  assert.equal(host.textContent, 'b');
  b.edit(1, x => {
    x.label = 'c';
  });
  await tick();
  assert.equal(host.textContent, 'c');
});
await test('one owner and focus/selection preservation', async (w, host) => {
  const { h, render, createListBoundary } = w;
  const b = createListBoundary(
    x => x.id,
    x => h('li', { key: x.id }, h('input', { value: x.label }))
  );
  b.set([
    { id: 0, label: 'editable' },
    { id: '', label: 'other' },
  ]);
  render(h('ul', {}, h(b.View, {})), host);
  assert.throws(() => h(b.View, {}), /one active owner/);
  const input = host.querySelector('input');
  input.focus();
  input.setSelectionRange(2, 4);
  b.edit('', x => {
    x.label = 'changed';
  });
  await tick();
  assert.equal(w.document.activeElement, input);
  assert.equal(input.selectionStart, 2);
});
await test('initial view failure releases the failed owner', async (w, host) => {
  const { h, render, createListBoundary } = w;
  let fail = true;
  const b = createListBoundary(
    x => x.id,
    x => {
      if (fail) throw Error('initial view failure');
      return h('li', { key: x.id }, x.label);
    }
  );
  b.set([{ id: 1, label: 'retry' }]);
  assert.throws(() => h(b.View, {}), /initial view failure/);
  fail = false;
  render(h('ul', {}, h(b.View, {})), host);
  await tick();
  assert.equal(host.textContent, 'retry');
});
const summary = {
  at: new Date().toISOString(),
  cases: results.length,
  results,
  scope: 'base owner integration; JSDOM; no concurrent/SSR claim',
};
if (process.argv[2])
  fs.writeFileSync(process.argv[2], JSON.stringify(summary, null, 2) + '\n');
console.log(summary);
