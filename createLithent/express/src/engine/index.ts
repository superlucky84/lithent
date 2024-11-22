export { h, Fragment, portal, mount } from '@/engine/wDom';
export { isPropType } from '@/engine/utils';
export { render } from '@/engine/render';
export { mountCallback } from '@/engine/hook/mountCallback';
export { updateCallback } from '@/engine/hook/updateCallback';
export { ref, nextTick } from '@/engine/hook/ref';

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
} from '@/engine/types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [name: string]: any;
    }
  }
}
