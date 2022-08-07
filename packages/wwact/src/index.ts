import { h, Fragment } from '@/wDom';
import { render } from '@/render';
import mounted from '@/hook/mounted';
import updated from '@/hook/updated';
import unmount from '@/hook/unmount';
import makeData from '@/hook/data';
import { makeDataStore, useDataStore } from '@/hook/dataStore';
import makeRef from '@/hook/ref';

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
};
