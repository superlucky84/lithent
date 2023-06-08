import { WDom } from '@/types';
import { componentRef, getComponentKey } from '@/helper/universalRef';

export const unmount = (effectAction: () => void) => {
  componentRef.get(getComponentKey())!.mts.push(effectAction);
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (componentKey) {
    const queue = componentRef.get(componentKey)!.mts;

    componentRef.get(componentKey)!.mts = [];
    queue.forEach(effect => effect());
  }
};
