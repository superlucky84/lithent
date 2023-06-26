import { WDom } from '@/types';
import {
  componentKeyRef,
  componentRef,
  getComponentKey,
} from '@/utils/universalRef';
import { unmount } from '@/hook/unmount';

let mountedQueue: WDom[] = [];

export const execMountedQueue = () => {
  mountedQueue.forEach(item => runMountedQueueFromWDom(item));
  mountedQueue = [];
};
export const addMountedQueue = (wDom: WDom) => {
  if (wDom.componentKey) {
    mountedQueue.push(wDom);
  }
};
export const mountCallback = (effectAction: () => void) =>
  componentRef.get(getComponentKey())!.mts.push(effectAction);

export const runMountedQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (componentKey) {
    const component = componentRef.get(componentKey);
    const queue = component?.mts;
    const sequence = component?.upS;

    componentKeyRef.value = componentKey;

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
