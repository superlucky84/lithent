import { WDom } from '@/types';

export function getParent(vDom: WDom) {
  return (vDom.getParent || (() => ({ type: null })))();
}
