import type { Props } from '@/types';

export { h, Fragment, portal, mount, replaceWDom } from '@/wDom';
export { isPropType } from '@/utils';
export { componentUpdate } from '@/utils/redraw';
export {
  getComponentKey,
  componentMap,
  getComponentSubInfo,
  setComponentMapManualMode,
  disposeComponentEntry,
  setScheduler,
  getScheduler,
  createUpdateSession,
} from '@/utils/universalRef';
export { render } from '@/render';
export { mountCallback } from '@/hook/mountCallback';
export { mountReadyCallback } from '@/hook/mountReadyCallback';
export { updateCallback } from '@/hook/updateCallback';
export { ref, nextTick } from '@/hook/ref';

export type {
  WDom,
  TagFunction,
  TagFunctionResolver,
  FragmentFunction,
  Component,
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

export type { WorkScheduler, UpdateSession } from '@/utils/universalRef';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [name: string]: Props;
    }
  }
}
