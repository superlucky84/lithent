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
export const wdomCallback = (effectAction: () => void | (() => void)) =>
  (componentMap.get(getComponentKey())?.wdomCB || []).push(effectAction);

/**
 * WDom 생성 직후에 wdomCallback 실행
 */
export const runWDomCallbacks = (wdom: WDom) => {
  const { compKey } = wdom;

  if (compKey) {
    const component = componentMap.get(compKey);
    const queue = component?.wdomCB;

    if (queue && queue.length > 0) {
      compKeyRef.value = compKey;

      // wdomCB 실행 후 비움
      component.wdomCB = [];

      queue.forEach((effect: Function) => {
        const cleanup = effect();
        if (cleanup && typeof cleanup === 'function') {
          unmount(cleanup);
        }
      });
    }
  }
};
