import type { WDom } from '@/types';
import { wdomSymbol } from '@/utils/universalRef';

// Common hot fields share one layout; root/component metadata stays sparse.
export const createWDom = (
  type: WDom['type'],
  tag?: WDom['tag'],
  props?: WDom['props'],
  text?: WDom['text'],
  children?: WDom['children'],
  getParent?: WDom['getParent']
): WDom => ({
  type,
  nr: undefined,
  tag,
  props,
  text,
  children,
  getParent,
  el: undefined,
  oi: undefined,
  oc: undefined,
  op: undefined,
  il: undefined,
  [wdomSymbol]: true,
});
