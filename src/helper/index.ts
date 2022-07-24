import { WDom } from '@/types';

export function getParent(vDom: WDom) {
  return (vDom.getParent || (() => ({ type: null })))();
}

export function reRender(vDom: WDom) {
  return (vDom.reRender || (() => ({ type: null })))();
}
