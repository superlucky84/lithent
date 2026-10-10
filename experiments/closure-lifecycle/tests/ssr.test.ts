// @vitest-environment node
import { expect, it, vi } from 'vitest';

it('starts no timer or request while importing or constructing a scope on the server', async () => {
  vi.resetModules();
  const interval = vi.spyOn(globalThis, 'setInterval');
  const fetch = vi.spyOn(globalThis, 'fetch');
  const { createLatestTask, createOwnerScope } = await import('../src');
  const scope = createOwnerScope();
  createLatestTask(scope);
  expect(interval).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
  scope.dispose();
  vi.restoreAllMocks();
});

it('keeps mount work dormant while rendering a component to HTML', async () => {
  const { h, mount, mountCallback } = await import('lithent');
  const { renderToString } = await import('lithent/ssr');
  const { createLatestTask, useOwnerScope } = await import('../src');
  const start = vi.fn();
  const Component = mount(() => {
    const scope = useOwnerScope();
    const task = createLatestTask(scope);
    mountCallback(() => {
      void task.run(start);
    });
    return () => h('span', {}, 'server');
  });
  expect(renderToString(h(Component, {}))).toBe('<span>server</span>');
  expect(start).not.toHaveBeenCalled();
});

it('renders a retained host shell without initializing browser work during SSR', async () => {
  const { h } = await import('lithent');
  const { renderToString } = await import('lithent/ssr');
  const { createRetainedHost, supportsRenderBoundary } = await import('../src');
  const initialize = vi.fn(() => () => h('span', {}, 'editor'));
  const Host = createRetainedHost(initialize, console.error, {
    freezeChildren: supportsRenderBoundary(),
  });
  expect(renderToString(h(Host, { active: true }))).toBe('<div></div>');
  await Promise.resolve();
  expect(initialize).not.toHaveBeenCalled();
});
