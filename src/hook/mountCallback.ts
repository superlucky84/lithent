import { WDom } from '@/types';
import {
  compKeyRef,
  componentMap,
  getComponentKey,
} from '@/utils/universalRef';
import { unmount } from '@/hook/internal/unmount';

let mountedQueue: WDom[] = [];

// WDom 트리 완성 후, DOM 렌더링 전에 wdomCallback 실행
export const execWDomCallbacks = () => {
  mountedQueue.forEach(item => runWDomCallbacksFromWDom(item));
};

// DOM 렌더링 후 mountCallback 실행
export const execMountedQueue = () => {
  mountedQueue.forEach(item => runMountedQueueFromWDom(item));
  mountedQueue = [];
};

export const addMountedQueue = (wDom: WDom) => {
  if (wDom.compKey) {
    mountedQueue.push(wDom);
  }
};

export const mountCallback = (effectAction: () => void) =>
  (componentMap.get(getComponentKey())?.mts || []).push(effectAction);

// wdomCallback만 실행
const runWDomCallbacksFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentMap.get(compKey);
    const wdomQueue = component?.wdomCB;

    compKeyRef.value = compKey;

    if (wdomQueue && wdomQueue.length > 0) {
      component.wdomCB = [];

      wdomQueue.forEach((effect: Function) => {
        const cleanup = effect();
        if (cleanup && typeof cleanup === 'function') {
          unmount(cleanup);
        }
      });
    }
  }
};

// mountCallback만 실행
const runMountedQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentMap.get(compKey);
    const mountQueue = component?.mts;
    const sequence = component?.upS;

    compKeyRef.value = compKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (mountQueue) {
      component.mts = [];

      mountQueue.forEach((effect: Function) => {
        const callback = effect();
        if (callback) {
          unmount(callback);
        }
      });
    }
  }
};
