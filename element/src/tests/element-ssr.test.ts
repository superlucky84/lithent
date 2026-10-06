// @vitest-environment node
import { describe, it, expect } from 'vitest';

/**
 * Phase 1-1 — importing and calling `defineElement` where Custom Elements do
 * not exist (SSR, plain Node) must not throw. This file runs in the node
 * environment, so `HTMLElement` and `customElements` are genuinely absent.
 */
describe('defineElement without a DOM (SSR)', () => {
  it('imports and returns undefined', async () => {
    expect(typeof globalThis.customElements).toBe('undefined');
    expect(typeof globalThis.HTMLElement).toBe('undefined');

    const { defineElement } = await import('@/index');
    const { h, mount } = await import('lithent');
    const Comp = mount(() => () => h('p', {}, 'x'));

    expect(defineElement('ssr-safe', Comp)).toBeUndefined();
  });
});
