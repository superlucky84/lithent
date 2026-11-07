import { h, mount, mountCallback, ref, nextTick, render } from './core.mjs';

const assert = (ok, message) => {
  if (!ok) throw new Error(message);
};
export function setup(kind, size) {
  const host = document.querySelector('#host');
  let epoch = 0;
  let renew;
  let calls = 0;
  let sum = 0;
  let disposeRoot;
  const stable = Array.from({ length: size }, (_, id) => () => {
    calls++;
    sum += id;
  });
  const App = mount(bump => {
    renew = bump;
    return () => {
      const captured = epoch;
      const children = new Array(size);
      for (let id = 0; id < size; id++) {
        const props = { key: id };
        if (kind !== 'noevent-text')
          props.onClick =
            kind === 'stable-text'
              ? stable[id]
              : () => {
                  calls++;
                  sum += id + captured;
                };
        children[id] = h(
          'button',
          props,
          kind === 'inline-only' ? String(id) : `${id}:${captured}`
        );
      }
      return h('section', {}, children);
    };
  });
  let initialNodes;
  let mountMs;
  function mountRoot() {
    const start = performance.now();
    disposeRoot = render(h(App, {}), host);
    mountMs = performance.now() - start;
    initialNodes = Array.from(host.querySelectorAll('button'));
  }
  mountRoot();
  return {
    kind,
    size,
    mountMs,
    async update(count = 1) {
      const start = performance.now();
      for (let i = 0; i < count; i++) {
        epoch++;
        renew();
        await nextTick();
      }
      return performance.now() - start;
    },
    dispatch(count = 20000) {
      const before = calls;
      const sumBefore = sum;
      // Event construction is outside the timed loop; reuse it after dispatch.
      const event = new Event('click');
      const begin = performance.now();
      let expected = 0;
      for (let i = 0; i < count; i++) {
        const id = i % size;
        initialNodes[id].dispatchEvent(event);
        if (kind !== 'noevent-text')
          expected += id + (kind === 'stable-text' ? 0 : epoch);
      }
      const elapsed = performance.now() - begin;
      assert(
        calls - before === (kind === 'noevent-text' ? 0 : count),
        'dispatch callback count'
      );
      assert(
        sum - sumBefore === expected,
        'stale closure or incorrect receiver'
      );
      return { elapsed, calls: calls - before, checksum: sum - sumBefore };
    },
    validate() {
      const nodes = host.querySelectorAll('button');
      assert(nodes.length === size, 'button count');
      for (let id = 0; id < size; id++) {
        assert(nodes[id] === initialNodes[id], 'DOM identity');
        assert(
          nodes[id].textContent ===
            (kind === 'inline-only' ? String(id) : `${id}:${epoch}`),
          'text'
        );
      }
      return { size: nodes.length, epoch, calls, sum };
    },
    dispose() {
      disposeRoot();
      initialNodes = null;
      disposeRoot = null;
      assert(host.childNodes.length === 0, 'root dispose');
    },
    async churn(count) {
      for (let i = 0; i < count; i++) {
        this.dispose();
        mountRoot();
        await this.update(1);
      }
    },
  };
}

// Public API integration, run outside all timed pages.
export async function contracts() {
  const host = document.querySelector('#host');
  const target = document.createElement('aside');
  document.body.append(target);
  const calls = [];
  let version = 0;
  let show = true;
  let enabled = true;
  let renew;
  const App = mount(bump => {
    renew = bump;
    return () => {
      const value = version;
      const click = function (event) {
        assert(this === event.currentTarget, 'function receiver');
        calls.push(`button:${value}`);
      };
      return h(
        'main',
        {},
        show ? h('button', enabled ? { onClick: click } : {}, 'x') : null,
        show
          ? h(
              'portal',
              { portal: target, onClick: () => calls.push(`portal:${value}`) },
              h('b', {}, 'p')
            )
          : null
      );
    };
  });
  let external = 0;
  target.addEventListener('click', () => external++);
  const dispose = render(h(App, {}), host);
  const button = host.querySelector('button');
  button.click();
  target.click();
  version = 1;
  renew();
  await nextTick();
  button.click();
  target.click();
  enabled = false;
  renew();
  await nextTick();
  button.click();
  enabled = true;
  renew();
  await nextTick();
  button.click();
  show = false;
  renew();
  await nextTick();
  button.click();
  target.click();
  dispose();
  target.click();
  target.remove();
  assert(
    JSON.stringify(calls) ===
      JSON.stringify([
        'button:0',
        'portal:0',
        'button:1',
        'portal:1',
        'button:1',
        'button:1',
      ]),
    `public API event lifecycle ${calls}`
  );
  assert(external === 4, 'portal external listener');
  const native = ref(null);
  let nativeCalls = 0;
  const handler = function (event) {
    assert(this === event.currentTarget, 'native receiver');
    nativeCalls++;
  };
  const Native = mount(() => {
    mountCallback(() => {
      native.value.addEventListener('click', handler);
      native.value.addEventListener('click', handler);
      return () => native.value.removeEventListener('click', handler);
    });
    return () => h('button', { ref: native }, 'native');
  });
  const destroyNative = render(h(Native, {}), host);
  const kept = native.value;
  kept.click();
  assert(nativeCalls === 1, 'native callback dedup');
  kept.removeEventListener('click', handler);
  kept.click();
  assert(nativeCalls === 1, 'native callback identity removal');
  kept.addEventListener('click', handler);
  destroyNative();
  kept.click();
  assert(nativeCalls === 1, 'native cleanup');
  return { calls, external, nativeCalls, remaining: host.childNodes.length };
}
