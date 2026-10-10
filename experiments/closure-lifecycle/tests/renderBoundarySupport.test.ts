import { afterEach, expect, it, vi } from 'vitest';
import * as core from 'lithent';
import {
  createRetainedHost,
  createRetainedView,
  supportsRenderBoundary,
} from '../src';
import { getRenderProtocol } from '../src/renderProtocol';

const destroys: Array<() => void> = [];
afterEach(() => {
  destroys.splice(0).forEach(destroy => destroy());
  expect(getRenderProtocol()?.blocks).toBeUndefined();
  expect(getRenderProtocol()?.reparent).toBeUndefined();
});

it('exposes the render protocol only in the concurrent runtime', () => {
  expect(supportsRenderBoundary()).toBe('deferRender' in core);
  expect('renderGate' in core.componentMap).toBe('deferRender' in core);
});

it('rejects an older experimental core before initializing a frozen host', () => {
  const original = getRenderProtocol();
  Object.defineProperty(core.componentMap, 'renderGate', {
    value: { beforePause() {} },
    configurable: true,
    writable: true,
  });
  try {
    const initialize = vi.fn(() => () => core.h('span', {}, 'retained'));
    expect(supportsRenderBoundary()).toBe(false);
    expect(() =>
      createRetainedHost(initialize, console.error, {
        freezeChildren: true,
      })
    ).toThrow('Concurrent lifecycle core');
    expect(initialize).not.toHaveBeenCalled();
  } finally {
    if (original)
      Object.defineProperty(core.componentMap, 'renderGate', {
        value: original,
        configurable: true,
        writable: true,
      });
    else Reflect.deleteProperty(core.componentMap, 'renderGate');
  }
});

it('validates requested child freezing before initializing or mounting a host', () => {
  const host = document.createElement('section');
  const existing = document.createElement('h1');
  host.appendChild(existing);
  const initialize = vi.fn(() => () => core.h('span', {}, 'retained'));
  if (!supportsRenderBoundary()) {
    expect(() =>
      createRetainedView(host, initialize, { freezeChildren: true })
    ).toThrow('Concurrent lifecycle core');
    expect(() =>
      createRetainedHost(initialize, console.error, { freezeChildren: true })
    ).toThrow('Concurrent lifecycle core');
    expect(initialize).not.toHaveBeenCalled();
    expect(Array.from(host.childNodes)).toEqual([existing]);
  } else {
    const view = createRetainedView(host, initialize, { freezeChildren: true });
    destroys.push(view.dispose);
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(existing.parentElement).toBe(host);
  }
});
