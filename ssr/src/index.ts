import { h, mount } from 'lithent';
import type { TagFunction } from 'lithent';
import Test from '@/tests/tostring';
export { renderToString } from '@/renderToString';
export { hydrateOnClient } from '@/hydration';
import { hydration as _hydration } from '@/hydration';

export const hydration = _hydration;

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
