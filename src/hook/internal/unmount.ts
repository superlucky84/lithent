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
    // A redraw queued before this removal still holds the node. Marking it
    // retired makes that stale redraw a no-op instead of drawing it back in.
    newWDom.il = true;
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
