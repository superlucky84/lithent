import { afterEach, describe, expect, it } from 'vitest';
import {
  Fragment as CoreFragment,
  h,
  mount,
  mountCallback,
  nextTick,
  render,
} from '@/index';
import type { FragmentFunction, Props } from '@/types';

const Fragment = CoreFragment as unknown as FragmentFunction;

afterEach(() => {
  document.body.replaceChildren();
});

describe('Fragment anchor boundaries', () => {
  it('reveals a multi-node child before long stable siblings without losing focus', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const before = document.createElement('i');
    const after = document.createElement('i');
    before.textContent = 'before';
    after.textContent = 'after';
    host.append(before, after);
    let shown = false;
    let renew = () => {};
    const log: string[] = [];
    const Leaf = mount(() => {
      mountCallback(() => {
        log.push('mount');
        return () => log.push('unmount');
      });
      return () => h('b', {}, 'leaf');
    });
    const Child = mount(bump => {
      renew = bump;
      return () =>
        shown
          ? h(Fragment, {}, h(Fragment, {}, null, h(Leaf, {})), 'text')
          : null;
    });
    const App = mount(
      () => () =>
        h(
          Fragment,
          {},
          h(Child, {}),
          h(Fragment, {}, null, h(Fragment, {}, false)),
          ...Array.from({ length: 256 }, (_, id) => h('span', {}, id)),
          h('input', { value: 'kept' })
        )
    );
    const dispose = render(h(App, {}), host, after);
    const spans = [...host.querySelectorAll('span')];
    const input = host.querySelector('input')!;
    input.focus();
    for (let index = 0; index < 4; index++) {
      shown = index % 2 === 0;
      renew();
      await nextTick();
      expect(host.firstChild).toBe(before);
      expect(host.lastChild).toBe(after);
      expect([...host.querySelectorAll('span')]).toEqual(spans);
      expect(host.querySelector('input')).toBe(input);
      expect(document.activeElement).toBe(input);
      expect(host.childNodes[1]).toBe(
        shown ? host.querySelector('b') : spans[0]
      );
    }
    expect(log).toEqual(['mount', 'unmount', 'mount', 'unmount']);
    dispose();
    expect([...host.childNodes]).toEqual([before, after]);
  });

  it('keeps keyed multi-node row identity across reorder, additions and deletion', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    let rows = [1, 2, 3, 4];
    let renew = () => {};
    const mounted: number[] = [];
    const unmounted: number[] = [];
    const Row = mount<Props>((_renew, props) => {
      const id = Number(props.id);
      mountCallback(() => {
        mounted.push(id);
        return () => unmounted.push(id);
      });
      return () =>
        h(
          Fragment,
          {},
          h(Fragment, {}, null, h('input', { 'data-id': id, value: id })),
          h('b', {}, id)
        );
    });
    const App = mount(bump => {
      renew = bump;
      return () =>
        h(
          'section',
          {},
          rows.map(id => h(Row, { id, key: id })),
          h('footer', {}, 'end')
        );
    });
    const dispose = render(h(App, {}), host);
    const original = new Map(
      [...host.querySelectorAll('input')].map(input => [
        Number(input.dataset.id),
        input,
      ])
    );
    const footer = host.querySelector('footer');
    for (const next of [
      [4, 2, 5, 1],
      [6, 1, 4],
      [1, 4, 7, 8],
    ]) {
      rows = next;
      renew();
      await nextTick();
      const inputs = [...host.querySelectorAll('input')];
      expect(inputs.map(input => Number(input.dataset.id))).toEqual(rows);
      for (const input of inputs) {
        const id = Number(input.dataset.id);
        if (original.has(id)) expect(input).toBe(original.get(id));
      }
      expect(host.querySelector('footer')).toBe(footer);
      expect(host.querySelector('section')!.lastChild).toBe(footer);
    }
    expect(mounted).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(unmounted.sort()).toEqual([2, 3, 5, 6]);
    dispose();
    expect(unmounted.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('uses the root afterElement past empty ancestors while preserving a separate portal', async () => {
    const host = document.createElement('div');
    const target = document.createElement('aside');
    document.body.append(host, target);
    const after = document.createElement('footer');
    host.append(after);
    let shown = false;
    let renew = () => {};
    const Child = mount(bump => {
      renew = bump;
      return () => (shown ? h(Fragment, {}, 'a', h('b', {}, 'b')) : null);
    });
    const App = mount(
      () => () =>
        h(
          Fragment,
          {},
          h(Fragment, {}, h(Child, {}), null),
          h(Fragment, {}, null)
        )
    );
    const dispose = render(h(App, {}), host, after);
    const disposePortal = render(
      h('portal', { portal: target }, h('i', {}, 'portal')),
      document.createElement('div')
    );
    const portalChild = target.firstChild;
    for (let index = 0; index < 6; index++) {
      shown = index % 2 === 0;
      renew();
      await nextTick();
      expect(host.innerHTML).toBe(
        shown ? 'a<b>b</b><footer></footer>' : '<footer></footer>'
      );
      expect(host.lastChild).toBe(after);
      expect(target.firstChild).toBe(portalChild);
    }
    dispose();
    disposePortal();
    expect([...host.childNodes]).toEqual([after]);
    expect(target.childNodes).toHaveLength(0);
  });
});
