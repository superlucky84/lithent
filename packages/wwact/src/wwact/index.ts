import { h, Fragment } from '@/wDom';
import { render } from '@/render';
import { state } from '@/hook/state';
import { effect } from '@/hook/effect';
import { mounted } from '@/hook/mounted';
import { update } from '@/hook/update';
import { ref } from '@/hook/ref';
import { checkFunction } from '@/helper/predicator';
import {
  componentRef,
  componentKeyRef,
  dataStoreStore,
  dataStoreRenderQueue,
  getComponentKey,
  componentRender,
} from '@/helper/universalRef';

const ext = {
  componentRef,
  componentKeyRef,
  dataStoreStore,
  dataStoreRenderQueue,
  checkFunction,
  getComponentKey,
  componentRender,
};

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

export { h, Fragment, render, state, mounted, update, effect, ref, ext };
