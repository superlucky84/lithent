import { WDom } from '@/engine/types';
import {
  compKeyRef,
  componentRef,
  getComponentKey,
} from '@/engine/utils/universalRef';
import { unmount } from '@/engine/hook/unmount';

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
  componentRef.get(getComponentKey())!.mts.push(effectAction);

export const runMountedQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentRef.get(compKey);
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
