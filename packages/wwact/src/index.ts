import { h, Fragment } from '@/wDom';
import { render } from '@/render';
import effect from '@/hook/effect';
import mounted from '@/hook/mounted';
import update from '@/hook/update';
import makeUpdater from '@/hook/makeUpdater';
import { makeSharedUpdater, sharedUpdater } from '@/hook/sharedUpdater';
import makeRef from '@/hook/ref';

export type {
  WDom,
  TagFunction,
  TagFunctionResolver,
  FragmentFunction,
  ComponentSubKey,
  ComponentRef,
  Props,
  MiddleStateWDomChildren,
  MiddleStateWDom,
  UseDataStoreValue,
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
  makeUpdater,
  mounted,
  update,
  effect,
  makeRef,
  sharedUpdater,
  makeSharedUpdater,
};
