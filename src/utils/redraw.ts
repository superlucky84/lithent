import { Props, WDom } from '@/types';
import { componentMap } from '@/utils/universalRef';

const redrawQueue = new Map<Props, () => void>();
let redrawQueueTimeout: boolean = false;

/**
 * Bound once per component, not on every render: the node to redraw is the
 * component's current one when renew() is called.
 */
export const bindRedraw = (compKey: Props, exec: (wDom: WDom) => void) => {
  const comp = componentMap.get(compKey);
  if (comp) {
    comp.up = () => {
      const wDom = comp.vd.value as WDom;
      redrawQueue.set(compKey, () => exec(wDom));

      if (!redrawQueueTimeout) {
        redrawQueueTimeout = true;
        queueMicrotask(execRedrawQueue);
      }
    };
  }
};

export const componentUpdate = (compKey: Props) => () => {
  const comp = componentMap.get(compKey);
  const up = comp && comp.up;
  if (up) {
    up();
    return true;
  }
  return false;
};

// Each entry is taken out before it runs, so a renew raised during the flush
// (a new child's mountCallback renewing its parent) queues it again and this
// same pass runs it. If a render throws, another microtask drains the rest
// without requiring a new renew; the original error still propagates.
const execRedrawQueue = () => {
  try {
    redrawQueue.forEach((item: () => void, compKey: Props) => {
      redrawQueue.delete(compKey);
      item();
    });
  } finally {
    redrawQueueTimeout = !!redrawQueue.size;
    if (redrawQueueTimeout) queueMicrotask(execRedrawQueue);
  }
};
