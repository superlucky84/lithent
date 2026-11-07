import { WDom, CompKey } from '@/types';
import { checkEventKey } from '@/utils/predicator';
import {
  componentMap,
  getCurrentComponent,
  isComponentMapManualMode,
  runUnmountEffects,
} from '@/utils/universalRef';

export const unmount = (effectAction: () => void) => {
  const comp = getCurrentComponent();
  comp && comp.umts.push(effectAction);
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
      if (checkEventKey(key)) {
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
