import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  componentMap,
  deferRender,
  h,
  mount,
  nextTick,
  render,
  updateCallback,
  whenIdle,
} from '@/index';
import { hasPendingWork, setLowLaneBudget } from '@/scheduler';

let destroy: (() => void) | undefined;
afterEach(() => {
  destroy?.();
  destroy = undefined;
  delete componentMap.renderGate.blocks;
  setLowLaneBudget();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('render gate and concurrent lanes', () => {
  it('blocks queued low work without running updater effects', async () => {
    let renew = () => false;
    let active = true;
    let value = 0;
    const effects = vi.fn();
    const draws = vi.fn();
    const App = mount(update => {
      renew = update;
      updateCallback(effects);
      return () => {
        draws();
        return h('span', {}, String(value));
      };
    });
    const host = document.createElement('div');
    destroy = render(h(App, {}), host);
    componentMap.renderGate.blocks = () => !active;
    value = 1;
    deferRender(() => renew());
    componentMap.renderGate.beforePause();
    active = false;
    await whenIdle();
    expect(host.textContent).toBe('0');
    expect(draws).toHaveBeenCalledTimes(1);
    expect(effects).not.toHaveBeenCalled();
    active = true;
    renew();
    await nextTick();
    expect(host.textContent).toBe('1');
    expect(effects).toHaveBeenCalledTimes(1);
  });

  it('finishes a genuinely parked build before pause, without duplicating effects', async () => {
    // Control task delivery, rather than depending on wall-clock scheduling.
    vi.stubGlobal('MessageChannel', undefined);
    vi.useFakeTimers();
    let renew = () => false;
    let active = true;
    let value = 0;
    const effects = vi.fn();
    const commits = vi.fn();
    const App = mount(update => {
      renew = update;
      updateCallback(() => {
        effects();
        return commits;
      });
      return () =>
        h(
          'ul',
          {},
          [0, 1, 2, 3].map(key => h('li', { key }, String(value)))
        );
    });
    const host = document.createElement('div');
    destroy = render(h(App, {}), host);
    componentMap.renderGate.blocks = () => !active;
    setLowLaneBudget(0);
    value = 1;
    deferRender(() => renew());
    vi.runOnlyPendingTimers();
    expect(hasPendingWork(), 'the build actually stopped between slices').toBe(
      true
    );
    expect(effects).toHaveBeenCalledTimes(1);
    expect(commits).not.toHaveBeenCalled();
    expect(host.textContent).toBe('0000');

    componentMap.renderGate.beforePause();
    active = false;
    expect(hasPendingWork()).toBe(false);
    expect(host.textContent).toBe('1111');
    expect(effects).toHaveBeenCalledTimes(1);
    expect(commits).toHaveBeenCalledTimes(1);
    value = 2;
    deferRender(() => renew());
    await vi.runAllTimersAsync();
    await whenIdle();
    expect(host.textContent).toBe('1111');
    expect(effects).toHaveBeenCalledTimes(1);

    active = true;
    renew();
    await vi.runAllTimersAsync();
    await nextTick();
    expect(host.textContent).toBe('2222');
    expect(effects).toHaveBeenCalledTimes(2);
    expect(commits).toHaveBeenCalledTimes(2);
  });
});
