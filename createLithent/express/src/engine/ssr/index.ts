import { h } from '@/engine';
import type { TagFunction } from '@/engine';
import { renderToString as _renderToString } from '@/engine/ssr/renderToString';
import { hydration as _hydration } from '@/engine/ssr/hydration';

export const renderToString = _renderToString;
export const hydration = _hydration;

export function renderWithHydration(tagFunction: TagFunction) {
  if (typeof window !== 'undefined') {
    return hydration(h(tagFunction, {}), document.documentElement);
  }

  return _renderToString(h(tagFunction, {}));
}
