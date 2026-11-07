import { WDom } from '@/types';
import {
  compKeyRef,
  componentMap,
  getCurrentComponent,
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
  mountedQueue.forEach(runMountedQueueFromWDom);
  mountedQueue = [];
};

/**
 * mountCallback 등록
 */
export const mountCallback = (effectAction: () => void) => {
  const comp = getCurrentComponent();
  comp && comp.mts.push(effectAction);
};

/**
 * mountCallback만 실행
 */
const runMountedQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;
  // Every entry has all its queues (setComponetRef).
  const component = compKey && componentMap.get(compKey);

  if (component) {
    const mountQueue = component.mts;

    compKeyRef.value = compKey;
    component.upS.value = 0;
    component.mts = [];

    mountQueue.forEach((effect: Function) => {
      const callback = effect();
      if (callback) {
        unmount(callback);
      }
    });
  }
};
