import type { Props, WDom } from '@/types';
import { componentMap, needDiffRef } from '@/utils/universalRef';

// Internal capability installed only by the concurrent runtime.
type RenderGate = {
  blocks?: (node: WDom) => boolean;
  reparent?: (node: WDom) => void;
  settle?: (key?: Props) => void;
  beforePause: (key?: Props) => void;
};

export const renderGate = Object.assign(componentMap, {
  renderGate: {
    beforePause() {
      if (needDiffRef.value)
        throw new Error('Pause outside component rendering');
    },
  } as RenderGate,
}).renderGate;
