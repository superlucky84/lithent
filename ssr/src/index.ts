import { h } from 'lithent';
import type { TagFunction } from 'lithent';
import Test from '@/tests/tostring';
export { renderToString } from '@/renderToString';
import { hydration as _hydration } from '@/hydration';
export const hydration = _hydration;

let _run: ((wrap: HTMLElement) => void) | undefined;

if (import.meta.env.MODE === 'development') {
  _run = (wrap: HTMLElement) => {
    hydration(h(Test as TagFunction, {}), wrap);
  };
}

export const run = _run;
