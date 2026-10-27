import { describe, expect, it } from 'vitest';
import { h, mount, nextTick, render } from '@/index';
import type { Props } from '@/types';

let serial = 0;

describe('event updates during native dispatch', () => {
  for (const nested of [false, true]) {
    it(`preserves an unchanged handler while adding an alias${nested ? ' and nesting dispatch' : ''}`, async () => {
      const calls: string[] = [];
      const a = () => calls.push('a');
      const b = () => calls.push('b');
      let aliases = false;
      let renew = () => {};
      const tag = `dispatch-alias-${++serial}`;
      customElements.define(
        tag,
        class extends HTMLElement {
          constructor() {
            super();
            this.addEventListener(
              'click',
              () => {
                aliases = true;
                renew();
                if (nested) this.dispatchEvent(new MouseEvent('click'));
              },
              { once: true }
            );
          }
        }
      );
      const App = mount(bump => {
        renew = bump;
        return () =>
          h(tag, aliases ? { onClick: a, onclick: b } : { onClick: a });
      });
      const host = document.createElement('div');
      const dispose = render(h(App, {}), host);
      const button = host.firstElementChild as HTMLElement;
      button.click();
      // Synthetic dispatch keeps its JS stack, so queued renews run afterward.
      // Trusted browser input also needs the production dispatch probe.
      if (!nested) expect(calls.splice(0)).toEqual(['a']);
      else {
        expect(calls.filter(value => value === 'a')).toHaveLength(2);
        expect(calls.filter(value => value === 'b').length).toBeLessThanOrEqual(
          1
        );
        calls.length = 0;
      }
      await nextTick();
      button.click();
      expect(calls).toEqual(['a', 'b']);
      dispose();
    });
  }

  it('deduplicates aliases after entering the multiple-handler path', async () => {
    const calls: string[] = [];
    const a = () => calls.push('a');
    const b = () => calls.push('b');
    const stages: Props[] = [
      { onClick: a },
      { onClick: a, onclick: b },
      { onClick: a, onclick: a },
      { onclick: a },
    ];
    let stage = 0;
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () => h('button', stages[stage]);
    });
    const host = document.createElement('div');
    const dispose = render(h(App, {}), host);
    const button = host.firstElementChild as HTMLElement;
    for (const expected of [['a'], ['a', 'b'], ['a'], []]) {
      if (stage) {
        renew();
        await nextTick();
      }
      button.click();
      expect(calls.splice(0)).toEqual(expected);
      stage++;
    }
    dispose();
  });

  it('keeps other portal owners on a shared target when one is removed', async () => {
    const target = document.createElement('div');
    const calls: string[] = [];
    const a = () => calls.push('a');
    const b = () => calls.push('b');
    let shown = true;
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () =>
        h('div', {}, [
          shown ? h('portal', { key: 'a', portal: target, onClick: a }) : null,
          h('portal', { key: 'b', portal: target, onClick: b }),
        ]);
    });
    const host = document.createElement('div');
    const dispose = render(h(App, {}), host);
    target.click();
    expect(calls.splice(0)).toEqual(['a', 'b']);
    shown = false;
    renew();
    await nextTick();
    target.click();
    expect(calls.splice(0)).toEqual(['b']);
    dispose();
    target.click();
    expect(calls).toEqual([]);
  });

  it('retains the latest alias handlers on ordinary DOM kept after disposal', async () => {
    const calls: string[] = [];
    const a = () => calls.push('a');
    const b = () => calls.push('b');
    let aliases = false;
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () =>
        h('button', aliases ? { onClick: a, onclick: b } : { onClick: a });
    });
    const host = document.createElement('div');
    const dispose = render(h(App, {}), host);
    const button = host.firstElementChild as HTMLElement;
    aliases = true;
    renew();
    await nextTick();
    dispose();
    button.click();
    expect(calls).toEqual(['a', 'b']);
  });
});
