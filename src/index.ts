export { h, Fragment, portal, mount } from '@/wDom';
export { isPropType } from '@/utils';
export { componentUpdate } from '@/utils/redraw';
export { render } from '@/render';
export { mountCallback } from '@/hook/mountCallback';
export { updateCallback } from '@/hook/updateCallback';
export { ref, nextTick } from '@/hook/ref';

export type {
  WDom,
  TagFunction,
  TagFunctionResolver,
  FragmentFunction,
  Component,
  ComponentSubKey,
  ComponentRef,
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
      [name: string]: any;
    }
  }
}
