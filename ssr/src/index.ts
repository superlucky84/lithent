import { h } from 'lithent';
import type { TagFunction } from 'lithent';
import Test from '@/tests/tostring';
export { renderToString } from '@/renderToString';
import { hydration as hy } from '@/hydration';
export const hydration = hy;

export const run = (wrap: HTMLElement, nextEle?: HTMLElement) => {
  hydration(h(Test as TagFunction, {}), wrap, nextEle);
};
