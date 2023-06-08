import { WDom } from '@/types';
import { componentKeyRef, componentRef } from '@/helper/universalRef';

export const unmount = (effectAction: () => void) => {
  const componentKey = componentKeyRef.value;
  componentRef.get(componentKey)!.unmounts.push(effectAction);
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (componentKey) {
    const queue = componentRef.get(componentKey)!.unmounts;

    componentRef.get(componentKey)!.unmounts = [];
    queue.forEach((effect: Function) => effect());
  }
};
