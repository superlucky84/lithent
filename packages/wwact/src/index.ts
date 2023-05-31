import { h, Fragment } from '@/wDom';
import make from '@/Wwact';
import { render } from '@/render';
import mounted from '@/hook/mounted';
import updated from '@/hook/useUpdate';
import unmount from '@/hook/unmount';
import makeData from '@/hook/data';
import { makeDataStore, useDataStore } from '@/hook/dataStore';
import makeRef from '@/hook/ref';

export type {
  WDom,
  TagFunction,
  FragmentFunction,
  Props,
  MiddleStateWDomChildren,
  MiddleStateWDom,
  NodePointer,
} from '@/types';

export {
  h,
  Fragment,
  render,
  mounted,
  updated,
  unmount,
  makeData,
  makeDataStore,
  useDataStore,
  makeRef,
  make,
};
