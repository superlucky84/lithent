import type { WDom, Props, CompKey } from '@/types';
import { wdomSymbol } from '@/utils/universalRef';

// Common hot fields share one layout; root/component metadata stays sparse.
export const createWDom = (
  type: WDom['type'],
  children?: WDom['children'],
  text?: WDom['text'],
  tag?: WDom['tag'],
  props?: WDom['props'],
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

// A component's node: a one-child fragment that also carries the component's
// metadata. Made in one piece so the fields are not added one by one after
// the fact, which gives every such node a string of new shapes.
export const createCompWDom = (
  child: WDom,
  compProps: Props,
  compChild: WDom[],
  ctor: Function,
  compKey: CompKey,
  reRender: () => WDom
): WDom => ({
  type: 'f',
  nr: undefined,
  tag: undefined,
  props: undefined,
  text: undefined,
  children: [child],
  getParent: undefined,
  el: undefined,
  oi: undefined,
  oc: undefined,
  op: undefined,
  il: undefined,
  [wdomSymbol]: true,
  compProps,
  compChild,
  ctor,
  compKey,
  reRender,
});
