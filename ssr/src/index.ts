import { h, mount } from 'lithent';
import type { TagFunction } from 'lithent';
import Test from '@/tests/tostring';
import { renderToString as _renderToString } from '@/renderToString';
import { hydration as _hydration } from '@/hydration';

export const renderToString = _renderToString;
export const hydration = _hydration;

export function renderWithHydration(tagFunction: TagFunction) {
  if (typeof window !== 'undefined') {
    return hydration(h(tagFunction, {}), document.documentElement);
  }

  return _renderToString(h(tagFunction, {}));
}

export const Script = mount(() => {
  return () =>
    h('script', { type: 'module', 'data-type': 'lithent-ssr-module' });
});

let _run: ((wrap: HTMLElement) => void) | undefined;

if (import.meta.env.MODE === 'development') {
  _run = (wrap: HTMLElement) => {
    hydration(h(Test as TagFunction, {}), wrap);
  };
}

export const run = _run;
