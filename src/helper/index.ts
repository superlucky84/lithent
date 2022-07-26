import { WDom } from '@/types';

export function getParent(vDom: WDom) {
  const parentVDom = vDom.getParent && vDom.getParent();

  if (!parentVDom) {
    throw Error('Not found parent vDom');
  }

  return parentVDom;
}

export function reRender(vDom: WDom) {
  const newVDom = vDom.reRender && vDom.reRender();

  if (!newVDom) {
    throw Error('Unable reRender');
  }

  return newVDom;
}
