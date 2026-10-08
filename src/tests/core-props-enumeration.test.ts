import { describe, expect, it } from 'vitest';
import { h, mount, nextTick, render } from '@/index';
import type { Props } from '@/types';

describe('component props synchronization', () => {
  it.each([
    ['prototype name', 'toString', () => ({})],
    ['inherited value', 'value', () => Object.create({ value: 'inherited' })],
    [
      'hidden own value',
      'value',
      () => Object.defineProperty({}, 'value', { value: 'hidden' }),
    ],
    ['null prototype', 'value', () => Object.create(null)],
  ] as const)(
    'removes an absent enumerable own prop: %s',
    async (_, key, makeNext) => {
      let incoming: Props = { [key]: 'owned', label: 'a' };
      let renew = () => {};
      let held: Props = {};
      const Child = mount<Props>((_renew, props) => {
        held = props;
        return () => h('p', {}, String(props.label));
      });
      const Parent = mount(bump => {
        renew = bump;
        return () => h('div', {}, h(Child, incoming));
      });
      const host = document.createElement('div');
      const destroy = render(h(Parent, {}), host);
      const original = held;
      incoming = Object.assign(makeNext(), { label: 'b' });
      renew();
      await nextTick();

      expect(held).toBe(original);
      expect(Object.keys(held)).toEqual(['label']);
      expect(Object.prototype.hasOwnProperty.call(held, key)).toBe(false);
      expect(host.textContent).toBe('b');
      destroy();
    }
  );

  it('copies only enumerable own string keys without calling props methods', async () => {
    let incoming: Props = { value: 'old' };
    let renew = () => {};
    let held: Props = {};
    const Child = mount<Props>((_renew, props) => {
      held = props;
      return () => h('p', {}, String(props.value));
    });
    const Parent = mount(bump => {
      renew = bump;
      return () => h('div', {}, h(Child, incoming));
    });
    const host = document.createElement('div');
    const destroy = render(h(Parent, {}), host);
    const token = Symbol('ignored');
    incoming = Object.freeze({
      value: 'new',
      hasOwnProperty: 'prop',
      propertyIsEnumerable: 'prop',
      [token]: 'not a string prop',
    });
    renew();
    await nextTick();
    expect(held.value).toBe('new');
    expect(held.hasOwnProperty).toBe('prop');
    expect(held.propertyIsEnumerable).toBe('prop');
    expect(Object.getOwnPropertySymbols(held)).not.toContain(token);
    expect(host.textContent).toBe('new');
    destroy();
  });
});

describe('DOM props enumeration', () => {
  it.each([
    ['own', () => ({})],
    ['inherited', () => Object.create(null)],
    [
      'shadowing an enumerable prototype',
      () => ({ title: 'prototype', onClick: () => {} }),
    ],
  ] as const)(
    'removes hidden attributes and handlers: %s',
    async (_, makePrototype) => {
      let clicks = 0;
      const handler = () => clicks++;
      let incoming: Props = { title: 'owned', onClick: handler };
      let renew = () => {};
      const App = mount(bump => {
        renew = bump;
        return () => h('button', incoming, 'x');
      });
      const host = document.createElement('div');
      const destroy = render(h(App, {}), host);
      const button = host.querySelector('button')!;
      button.click();
      const hidden = Object.defineProperties(makePrototype(), {
        title: { value: 'hidden', enumerable: false },
        onClick: { value: handler, enumerable: false },
      });
      incoming = _ === 'own' ? hidden : Object.create(hidden);
      renew();
      await nextTick();

      expect(host.querySelector('button')).toBe(button);
      expect(button.getAttribute('title')).toBeNull();
      button.click();
      expect(clicks).toBe(1);
      destroy();
    }
  );

  it('continues to apply inherited enumerable props and remove them when absent', async () => {
    let oldCalls = 0;
    let newCalls = 0;
    let incoming: Props = { title: 'old', onClick: () => oldCalls++ };
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () => h('button', incoming, 'x');
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    const button = host.querySelector('button')!;
    incoming = Object.create({ title: 'inherited', onClick: () => newCalls++ });
    renew();
    await nextTick();
    expect(button.title).toBe('inherited');
    button.click();
    expect([oldCalls, newCalls]).toEqual([0, 1]);

    incoming = Object.create(null);
    renew();
    await nextTick();
    expect(button.getAttribute('title')).toBeNull();
    button.click();
    expect([oldCalls, newCalls]).toEqual([0, 1]);
    destroy();
  });
});
