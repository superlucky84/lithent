import { WDom, Props } from '@/types';
import { componentRef, getComponentKey } from '@/utils/universalRef';

export const unmount = (effectAction: () => void) => {
  componentRef.get(getComponentKey())!.umts.push(effectAction);
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { componentKey, nodeChildKey } = newWDom;
  const childKeys = nodeChildKey?.value;

  if (componentKey) {
    removeItem(componentKey);
  }

  if (childKeys) {
    childKeys.forEach(childKey => removeItem(childKey));
  }
};

const removeItem = (componentKey: Props) => {
  const queue = componentRef.get(componentKey)!.umts;
  componentRef.get(componentKey)!.umts = [];
  queue.forEach(effect => effect());
  componentRef.delete(componentKey);
};
