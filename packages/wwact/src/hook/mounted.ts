import { WDom } from '@/types';
import { componentKeyRef, componentRef } from '@/helper/universalRef';

import { unmount } from '@/hook/unmount';

export const mounted = (effectAction: () => void) => {
  const componentKey = componentKeyRef.value;
  const mounts = componentRef.get(componentKey)!.mounts;

  mounts.push(effectAction);
};

export const runMountedQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (componentKey) {
    const component = componentRef.get(componentKey);
    const queue = component?.mounts;
    const sequence = component?.updateSeq;

    componentKeyRef.value = componentKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (queue) {
      component.mounts = [];

      queue.forEach((effect: Function) => {
        const callback = effect();
        if (callback) {
          unmount(callback);
        }
      });
    }
  }
};
