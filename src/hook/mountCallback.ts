import { WDom } from '@/types';
import {
  compKeyRef,
  componentMap,
  getComponentKey,
} from '@/utils/universalRef';
import { unmount } from '@/hook/internal/unmount';

let mountedQueue: WDom[] = [];

/**
 * WDom을 mountedQueue에 추가
 */
export const addMountedQueue = (wDom: WDom) => {
  if (wDom.compKey) {
    mountedQueue.push(wDom);
  }
};

/**
 * DOM 렌더링 후 mountCallback 실행
 */
export const execMountedQueue = () => {
  mountedQueue.forEach(item => runMountedQueueFromWDom(item));
  mountedQueue = [];
};

/**
 * mountCallback 등록
 */
export const mountCallback = (effectAction: () => void) => {
  const compKey = getComponentKey();
  if (compKey) {
    const comp = componentMap.get(compKey);
    if (comp) {
      comp.mts.push(effectAction);
    }
  }
};

/**
 * mountCallback만 실행
 */
const runMountedQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentMap.get(compKey);
    if (!component) return;
    const { mts: mountQueue, upS: sequence } = component;

    compKeyRef.value = compKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (mountQueue) {
      component.mts = [];

      mountQueue.forEach((effect: Function) => {
        const callback = effect();
        if (callback) {
          unmount(callback);
        }
      });
    }
  }
};
