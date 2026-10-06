import { describe, it, expect } from 'vitest';
import { h, render, mount, mountCallback } from '@/index';
import type { WDom } from '@/index';

/**
 * `render()`'s destroy must run unmount callbacks for every component it
 * removes. It used to skip them unless the root component had re-rendered at
 * least once (`if (comp !== wDom)`), so a fresh component root, or components
 * under an element root, never saw their cleanup.
 * Found by lithent/element Phase 1 (docs/element/IMPLEMENT.md).
 */

const setup = () => {
  const log: string[] = [];
  const renews: Record<string, () => void> = {};
  const make = (name: string, child?: () => WDom) =>
    mount(renew => {
      renews[name] = renew;
      mountCallback(() => () => log.push(name));
      return () => h('div', {}, name, child ? child() : null);
    });
  const Child = make('child');
  const App = make('app', () => h(Child, {}));
  const wrap = document.createElement('div');
  document.body.appendChild(wrap);
  return { log, renews, App, wrap };
};

const flush = async () => {
  for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0));
};

describe('render() destroy runs unmount callbacks', () => {
  it('for a component root that never re-rendered', () => {
    const { log, App, wrap } = setup();
    const destroy = render(h(App, {}), wrap);
    destroy();
    expect([...log].sort()).toEqual(['app', 'child']);
    expect(wrap.innerHTML).toBe('');
  });

  it('once each for a component root that re-rendered', async () => {
    const { log, renews, App, wrap } = setup();
    const destroy = render(h(App, {}), wrap);
    renews.app();
    await flush();
    destroy();
    expect([...log].sort()).toEqual(['app', 'child']);
    expect(wrap.innerHTML).toBe('');
  });

  it('for components under an element root', () => {
    const { log, App, wrap } = setup();
    const destroy = render(h('section', {}, h(App, {})), wrap);
    destroy();
    expect([...log].sort()).toEqual(['app', 'child']);
    expect(wrap.innerHTML).toBe('');
  });

  it('without throwing for a root with no components', () => {
    const wrap = document.createElement('div');
    const destroy = render(h('p', {}, 'plain'), wrap);
    expect(() => destroy()).not.toThrow();
    expect(wrap.innerHTML).toBe('');
  });

  it('and a renew queued before destroy does not draw the tree back', async () => {
    const { log, renews, App, wrap } = setup();
    const destroy = render(h(App, {}), wrap);
    renews.app();
    renews.child();
    destroy();
    await flush();
    expect(wrap.innerHTML).toBe('');
    expect([...log].sort()).toEqual(['app', 'child']);
  });
});
