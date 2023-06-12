import { h, Fragment, wwact } from '@/wDom';
import { render } from '@/render';
import { mountCallback } from '@/hook/mountCallback';
import { updateCallback } from '@/hook/updateCallback';
import { ref } from '@/hook/ref';
import { checkFunction } from '@/utils/predicator';
import {
  componentRef,
  componentKeyRef,
  dataStoreStore,
  dataStoreRenderQueue,
  getComponentKey,
  componentRender,
} from '@/utils/universalRef';

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

export { h, Fragment, render, wwact, mountCallback, updateCallback, ref, ext };
