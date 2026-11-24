import { afterEach, describe, expect, it, vi } from 'vitest';

// Loading lithent/test registers `afterEach(cleanup)` when the runner exposes
// `afterEach` as a global (Vitest `globals: true`, Jest), and not otherwise.
// Each case loads a fresh copy of the module with the globals it needs.

const load = async () => {
  vi.resetModules();
  return import('@/index');
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('automatic cleanup', () => {
  it('registers cleanup with a global afterEach', async () => {
    const hooks: (() => void)[] = [];
    vi.stubGlobal('afterEach', (fn: () => void) => hooks.push(fn));
    const { render } = await load();
    const { h } = await import('lithent');
    const { container } = render(h('p', {}, 'x'));
    expect(hooks).toHaveLength(1);
    hooks[0]();
    expect(container.isConnected).toBe(false);
  });

  it('registers nothing without a global afterEach', async () => {
    expect((globalThis as { afterEach?: unknown }).afterEach).toBeUndefined();
    const { render, cleanup } = await load();
    const { h } = await import('lithent');
    const { container } = render(h('p', {}, 'x'));
    expect(container.isConnected).toBe(true);
    cleanup();
  });

  it('LITHENT_TEST_SKIP_AUTO_CLEANUP turns it off', async () => {
    const hooks: (() => void)[] = [];
    vi.stubGlobal('afterEach', (fn: () => void) => hooks.push(fn));
    vi.stubEnv('LITHENT_TEST_SKIP_AUTO_CLEANUP', '1');
    await load();
    expect(hooks).toHaveLength(0);
  });
});
