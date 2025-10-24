import { WDom, CompKey } from '@/types';
import {
  componentMap,
  getComponentKey,
  isComponentMapManualMode,
  runUnmountEffects,
} from '@/utils/universalRef';

export const unmount = (effectAction: () => void) => {
  const compKey = getComponentKey();
  if (compKey) {
    const comp = componentMap.get(compKey);
    comp && comp.umts.push(effectAction);
  }
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    removeItem(compKey);
  }
  recursiveRunUnmount(newWDom);
};

const recursiveRunUnmount = (wDom: WDom) => {
  (wDom.children || []).forEach(item => {
    const childComKey = item.compKey;
    if (childComKey) {
      runUnmountQueueFromWDom(item);
    } else {
      recursiveRunUnmount(item);
    }
  });
};

const removeItem = (compKey: CompKey) => {
  runUnmountEffects(compKey);

  if (!isComponentMapManualMode()) {
    componentMap.delete(compKey);
  }
};
