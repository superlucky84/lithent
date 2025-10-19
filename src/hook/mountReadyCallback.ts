import { WDom } from '@/types';
import {
  compKeyRef,
  componentMap,
  getComponentKey,
} from '@/utils/universalRef';
import { unmount } from '@/hook/internal/unmount';

/**
 * WDom이 생성된 직후(DOM 마운트 전)에 실행될 콜백 등록
 */
export const mountReadyCallback = (effectAction: () => void | (() => void)) =>
  (componentMap.get(getComponentKey())?.wdCB || []).push(effectAction);

/**
 * 특정 WDom의 wdomCallback 즉시 실행
 * wDomToDom() 내부에서 각 WDom 생성 시점에 호출됨
 */
export const runWDomCallbacksFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentMap.get(compKey);
    const wdCBQueue = component?.wdCB;

    compKeyRef.value = compKey;

    if (wdCBQueue && wdCBQueue.length > 0) {
      component.wdCB = [];

      wdCBQueue.forEach((effect: Function) => {
        const cleanup = effect();
        if (cleanup && typeof cleanup === 'function') {
          unmount(cleanup);
        }
      });
    }
  }
};
