import { Props, WDom } from '@/types';
import { componentMap } from '@/utils/universalRef';

const redrawQueue = new Map<Props, () => void>();
let redrawQueueTimeout: boolean = false;

const schedule = (compKey: Props, exec: () => void) => {
  redrawQueue.set(compKey, exec);

  if (!redrawQueueTimeout) {
    redrawQueueTimeout = true;
    queueMicrotask(execRedrawQueue);
  }
};

export const setRedrawAction = (compKey: Props, exec: () => void) => {
  const comp = componentMap.get(compKey);
  if (comp) {
    comp.up = () => schedule(compKey, exec);
  }
};

/**
 * Like setRedrawAction, but bound once per component instead of on every
 * render: the node to redraw is the component's current one when renew() is
 * called.
 */
export const bindRedraw = (compKey: Props, exec: (wDom: WDom) => void) => {
  const comp = componentMap.get(compKey);
  if (comp) {
    comp.up = () => {
      const wDom = comp.vd.value as WDom;
      schedule(compKey, () => exec(wDom));
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

const execRedrawQueue = () => {
  redrawQueue.forEach((item: () => void) => {
    item();
  });

  redrawQueue.clear();
  redrawQueueTimeout = false;
};
