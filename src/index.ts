import { h, Fragment, mount } from '@/wDom';
import { render } from '@/render';
import { mountCallback } from '@/hook/mountCallback';
import { updateCallback } from '@/hook/updateCallback';
import { ref, nextTick } from '@/hook/ref';

export type {
  WDom,
  TagFunction,
  TagFunctionResolver,
  FragmentFunction,
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

export {
  h,
  Fragment,
  render,
  mount,
  mountCallback,
  updateCallback,
  ref,
  nextTick,
};
