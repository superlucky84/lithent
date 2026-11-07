// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('lithent', async importOriginal => ({
  ...(await importOriginal<typeof import('lithent')>()),
  replaceWDom: vi.fn(),
}));
import { componentMap, replaceWDom } from 'lithent';
import type { CompKey, WDom, TagFunction } from 'lithent';
import { createBoundary } from '../createBoundary';

const ctor = (() => null) as unknown as TagFunction;
const instance = () => {
  const key = {} as CompKey;
  const node = {
    el: {} as HTMLElement,
    compProps: {},
    compChild: [],
  } as unknown as WDom;
  componentMap.set(key, { vd: { value: node }, umts: [] } as any);
  return { key, node };
};

beforeEach(() => {
  vi.mocked(replaceWDom).mockReset();
});

describe('HMR boundary replacement', () => {
  it('does not consume descendants registered during the same flush', async () => {
    const boundary = createBoundary('snapshot');
    const original = instance();
    boundary.register(original.key);
    vi.mocked(replaceWDom).mockImplementation(() => {
      // This used to grow the live Set indefinitely during Set.forEach.
      boundary.register(instance().key);
    });
    boundary.update(ctor);
    await Promise.resolve();
    expect(replaceWDom).toHaveBeenCalledTimes(1);
    boundary.dispose();
  });

  it('skips child nodes retired while replacing an ancestor', async () => {
    const boundary = createBoundary('retired-child');
    const parent = instance();
    const child = instance();
    boundary.register(parent.key);
    boundary.register(child.key);
    vi.mocked(replaceWDom).mockImplementation(() => {
      child.node.il = true;
    });
    boundary.update(ctor);
    await Promise.resolve();
    expect(replaceWDom).toHaveBeenCalledTimes(1);
    boundary.dispose();
  });

  it('keeps a new registration when an old instance cleanup runs', () => {
    const boundary = createBoundary('registration-generation');
    const { key } = instance();
    const oldCleanup = boundary.register(key);
    const newCleanup = boundary.register(key);
    oldCleanup();
    expect(boundary.update(ctor)).toBe(true);
    newCleanup();
    expect(boundary.update(ctor)).toBe(false);
    boundary.dispose();
  });

  it('does not apply an old scheduled flush to a recreated registry', async () => {
    const oldBoundary = createBoundary('recreated');
    oldBoundary.register(instance().key);
    oldBoundary.update(ctor);
    oldBoundary.dispose();
    const newBoundary = createBoundary('recreated');
    newBoundary.register(instance().key);
    await Promise.resolve();
    expect(replaceWDom).not.toHaveBeenCalled();
    newBoundary.update(ctor);
    await Promise.resolve();
    expect(replaceWDom).toHaveBeenCalledTimes(1);
    newBoundary.dispose();
  });

  it('reports replacement failures to the owning component module', async () => {
    const onFailure = vi.fn();
    const onApplied = vi.fn();
    const boundary = createBoundary('failure-owner', onFailure, onApplied);
    boundary.register(instance().key);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(replaceWDom).mockImplementation(() => {
      throw new Error('bad component');
    });
    boundary.update(ctor);
    await Promise.resolve();
    expect(onFailure).toHaveBeenCalledWith('replacement failed: failure-owner');
    expect(onApplied).not.toHaveBeenCalled();
    boundary.dispose();
    warn.mockRestore();
  });

  it('retries only missing instances after a partially successful update', async () => {
    vi.useFakeTimers();
    const applied = vi.fn();
    const boundary = createBoundary('partial-update', undefined, applied);
    const ready = instance();
    const delayed = instance();
    delayed.node.el = undefined;
    boundary.register(ready.key);
    boundary.register(delayed.key);
    try {
      boundary.update(ctor);
      await Promise.resolve();
      expect(replaceWDom).toHaveBeenCalledTimes(1);
      expect(applied).not.toHaveBeenCalled();
      delayed.node.el = {} as HTMLElement;
      await vi.runAllTimersAsync();
      expect(replaceWDom).toHaveBeenCalledTimes(2);
      expect(applied).toHaveBeenCalledTimes(1);
    } finally {
      boundary.dispose();
      vi.useRealTimers();
    }
  });

  it('does not let a disposed controller remove a recreated boundary', () => {
    const old = createBoundary('stale-controller');
    old.dispose();
    const current = createBoundary('stale-controller');
    const { key } = instance();
    current.register(key);
    old.dispose();
    expect(current.update(ctor)).toBe(true);
    expect(componentMap.has(key)).toBe(true);
    expect(old.update(ctor)).toBe(false);
    current.dispose();
  });
});
