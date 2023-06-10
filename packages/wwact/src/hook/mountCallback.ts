import { WDom } from '@/types';
import {
  componentKeyRef,
  componentRef,
  getComponentKey,
} from '@/helper/universalRef';

import { unmount } from '@/hook/unmount';

export const mountCallback = (effectAction: () => void) => {
  const mts = componentRef.get(getComponentKey())!.mts;

  mts.push(effectAction);
};

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
