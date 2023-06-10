import { WDom } from '@/types';
import { componentRef, getComponentKey } from '@/helper/universalRef';

export const unmount = (effectAction: () => void) => {
  componentRef.get(getComponentKey())!.umts.push(effectAction);
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { componentKey } = newWDom;

  if (componentKey) {
    const queue = componentRef.get(componentKey)!.umts;

    componentRef.get(componentKey)!.umts = [];
    queue.forEach(effect => effect());

    componentRef.delete(componentKey);
  }
};
