import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, mount, mountCallback, nextTick } from 'lithent';
import { defineElement } from '@/index';

let reported: unknown[];
const settle = async () => {
  for (let index = 0; index < 4; index++) await nextTick();
};
beforeEach(() => {
  reported = [];
  vi.stubGlobal('reportError', (error: unknown) => reported.push(error));
});
afterEach(async () => {
  document.body.replaceChildren();
  await settle();
  vi.unstubAllGlobals();
});

describe.each([true, false])('cleanup failures with shadow=%s', shadow => {
  it('clears the old instance and remounts after an actual disconnect', async () => {
    const boom = new Error('element cleanup');
    let mounts = 0;
    const remaining = vi.fn();
    const App = mount(renew => {
      mounts++;
      let count = 0;
      mountCallback(() => () => {
        throw boom;
      });
      mountCallback(() => remaining);
      return () =>
        h(
          'button',
          {
            onClick: () => {
              count++;
              renew();
            },
          },
          String(count)
        );
    });
    const tag = `cleanup-reconnect-${shadow ? 'shadow' : 'light'}` as const;
    defineElement(tag, App, { shadow });
    const element = document.createElement(tag);
    const content = () => (shadow ? element.shadowRoot! : element);
    document.body.appendChild(element);
    const oldButton = content().querySelector('button')!;
    oldButton.click();
    await settle();
    expect(oldButton.textContent).toBe('1');

    element.remove();
    await settle();
    expect(content().querySelector('button')).toBeNull();
    expect(remaining).toHaveBeenCalledOnce();
    expect(reported).toEqual([boom]);
    document.body.appendChild(element);
    expect(mounts).toBe(2);
    const newButton = content().querySelector('button')!;
    expect(newButton).not.toBe(oldButton);
    expect(newButton.textContent).toBe('0');
    oldButton.click();
    await settle();
    expect(newButton.textContent).toBe('0');
    newButton.click();
    await settle();
    expect(newButton.textContent).toBe('1');
  });

  it('preserves the instance when moved in the same task', async () => {
    let mounts = 0;
    const boom = new Error('moved element cleanup');
    const App = mount(() => {
      mounts++;
      mountCallback(() => () => {
        throw boom;
      });
      return () => h('b', {}, 'mounted');
    });
    const tag = `cleanup-move-${shadow ? 'shadow' : 'light'}` as const;
    defineElement(tag, App, { shadow });
    const first = document.createElement('div');
    const second = document.createElement('div');
    document.body.append(first, second);
    const element = document.createElement(tag);
    first.appendChild(element);
    second.appendChild(element);
    await settle();
    expect(mounts).toBe(1);
    expect(reported).toEqual([]);
    element.remove();
    await settle();
    expect(reported).toEqual([boom]);
  });
});
