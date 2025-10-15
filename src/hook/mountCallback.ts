import { WDom } from '@/types';
import {
  compKeyRef,
  componentMap,
  getComponentKey,
} from '@/utils/universalRef';
import { unmount } from '@/hook/internal/unmount';

let mountedQueue: WDom[] = [];

export const execMountedQueue = () => {
  mountedQueue.forEach(item => runMountedQueueFromWDom(item));
  mountedQueue = [];
};
export const addMountedQueue = (wDom: WDom) => {
  if (wDom.compKey) {
    mountedQueue.push(wDom);
  }
};
export const mountCallback = (effectAction: () => void) =>
  (componentMap.get(getComponentKey())?.mts || []).push(effectAction);

export const runMountedQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentMap.get(compKey);
    const queue = component?.mts;
    const sequence = component?.upS;

    compKeyRef.value = compKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (queue) {
      component.mts = [];

      queue.forEach((effect: Function) => {
        const callback = effect();
        if (callback) {
          unmount(callback);
        }
      });
    }
  }
};
