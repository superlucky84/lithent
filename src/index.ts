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
  lmountComponentSet,
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
    interface IntrinsicElements extends Record<string | number, Props> {}
    // Components receive children as the third mounter argument, and `key`
    // is read by the list diff. TypeScript 5.8+ checks JSX children against
    // the props type, so allow both on every element and component.
    interface IntrinsicAttributes {
      key?: unknown;
      children?: unknown;
    }
  }
}
