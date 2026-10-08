import { describe, expect, it } from 'vitest';
import { h, mount, nextTick, render } from '@/index';

describe('persistent portal host events', () => {
  it('removes only portal handlers across repeated removal, remount and destroy', async () => {
    const target = document.createElement('div');
    let externalCalls = 0;
    let calls = 0;
    target.addEventListener('click', () => externalCalls++);
    let show = true;
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () =>
        h(
          'div',
          {},
          show
            ? h(
                'portal',
                {
                  portal: target,
                  onClick: () => calls++,
                },
                h('button', {}, 'x')
              )
            : null
        );
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);

    for (let index = 0; index < 3; index++) {
      target.click();
      expect(calls).toBe(index + 1);
      show = false;
      renew();
      await nextTick();
      target.click();
      expect(calls).toBe(index + 1);
      show = true;
      renew();
      await nextTick();
    }
    destroy();
    target.click();
    expect(calls).toBe(3);
    expect(externalCalls).toBe(7);
  });

  it('removes handlers when a keyed component containing a portal is replaced', async () => {
    const target = document.createElement('div');
    let oldCalls = 0;
    let newCalls = 0;
    let renew = () => {};
    let replace = false;
    const Old = mount(
      () => () =>
        h(
          'section',
          {},
          h(
            'portal',
            {
              portal: target,
              onClick: () => oldCalls++,
            },
            h('b', {}, 'old')
          )
        )
    );
    const New = mount(
      () => () =>
        h(
          'section',
          {},
          h(
            'portal',
            {
              portal: target,
              onClick: () => newCalls++,
            },
            h('b', {}, 'new')
          )
        )
    );
    const App = mount(bump => {
      renew = bump;
      return () => h('div', {}, h(replace ? New : Old, { key: 'row' }));
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    replace = true;
    renew();
    await nextTick();
    target.click();
    expect([oldCalls, newCalls]).toEqual([0, 1]);
    destroy();
    target.click();
    expect([oldCalls, newCalls]).toEqual([0, 1]);
  });

  it('cleans a portal in a removed keyed subtree while keeping surviving handlers', async () => {
    const targets = [
      document.createElement('div'),
      document.createElement('div'),
    ];
    const calls = [0, 0];
    let rows = [0, 1];
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () =>
        h(
          'div',
          {},
          rows.map(id =>
            h(
              'section',
              { key: id },
              h(
                'portal',
                { portal: targets[id], onClick: () => calls[id]++ },
                h('b', {}, String(id))
              )
            )
          )
        );
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    rows = [1];
    renew();
    await nextTick();
    targets.forEach(target => target.click());
    expect(calls).toEqual([0, 1]);
    destroy();
    targets.forEach(target => target.click());
    expect(calls).toEqual([0, 1]);
  });

  it('cleans the latest inherited portal handler under an element root', async () => {
    const target = document.createElement('div');
    let oldCalls = 0;
    let newCalls = 0;
    let renew = () => {};
    let updated = false;
    const App = mount(bump => {
      renew = bump;
      return () =>
        h(
          'portal',
          Object.assign(
            Object.create({
              onClick: updated ? () => newCalls++ : () => oldCalls++,
            }),
            { portal: target }
          ),
          h('b', {}, 'x')
        );
    });
    const host = document.createElement('div');
    const destroy = render(h('section', {}, h(App, {})), host);
    updated = true;
    renew();
    await nextTick();
    target.click();
    expect([oldCalls, newCalls]).toEqual([0, 1]);
    destroy();
    target.click();
    expect([oldCalls, newCalls]).toEqual([0, 1]);
  });

  it('retains discarded ordinary DOM handlers, including portal children', () => {
    const target = document.createElement('div');
    let ordinaryCalls = 0;
    let childCalls = 0;
    let hostCalls = 0;
    const host = document.createElement('div');
    const destroy = render(
      h(
        'section',
        {},
        h('button', { onClick: () => ordinaryCalls++ }, 'ordinary'),
        h(
          'portal',
          { portal: target, onClick: () => hostCalls++ },
          h('button', { onClick: () => childCalls++ }, 'ported')
        )
      ),
      host
    );
    const button = host.querySelector('button')!;
    const child = target.querySelector('button')!;
    destroy();
    button.click();
    child.click();
    target.click();
    expect([ordinaryCalls, childCalls, hostCalls]).toEqual([1, 1, 0]);
  });
});
