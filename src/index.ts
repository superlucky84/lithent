import type { Props } from '@/types';

export { h, Fragment, portal, mount, lmount, replaceWDom } from '@/wDom';
export { isPropType } from '@/utils';
export { componentUpdate } from '@/utils/redraw';
export {
  getComponentKey,
  componentMap,
  getComponentSubInfo,
  setComponentMapManualMode,
  disposeComponentEntry,
} from '@/utils/universalRef';
export { render } from '@/render';
export { mountCallback } from '@/hook/mountCallback';
export { mountReadyCallback } from '@/hook/mountReadyCallback';
export { updateCallback } from '@/hook/updateCallback';
export { ref, nextTick } from '@/hook/ref';
export { useRenew } from '@/hook/useRenew';

export type {
  WDom,
  TagFunction,
  TagFunctionResolver,
  FragmentFunction,
  Component,
  LComponent,
  ComponentSubKey,
  ComponentMap,
  ComponentInfo,
  CompKey,
  Props,
  Renew,
  MiddleStateWDomChildren,
  MiddleStateWDom,
  NodePointer,
  Param,
} from '@/types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [name: string]: Props;
    }
  }
}
