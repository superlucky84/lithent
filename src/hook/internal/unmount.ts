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
  // A portal host belongs to the caller and survives removal. Release its
  // handlers while leaving listeners on discarded ordinary DOM untouched.
  if (wDom.tag === 'portal' && wDom.el) {
    for (const key in wDom.props) {
      if (key[0] === 'o' && key[1] === 'n') {
        wDom.el.removeEventListener(
          key.slice(2).toLowerCase(),
          wDom.props[key] as EventListener
        );
      }
    }
  }
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
