import { componentMap } from 'lithent';
import type { Props, WDom } from 'lithent';

// Structural read of the Concurrent lifecycle capability, outside the base public types.
export const getRenderProtocol = () =>
  (
    componentMap as typeof componentMap & {
      renderGate?: {
        boundaryOwner?: (node: WDom) => boolean;
        blocks?: (node: WDom) => boolean;
        reparent?: (node: WDom) => void;
        settle?: (key?: Props) => void;
        beforePause: (key?: Props) => void;
      };
    }
  ).renderGate;

export const supportsRenderBoundary = (): boolean => {
  const protocol = getRenderProtocol();
  return (
    typeof protocol?.beforePause === 'function' &&
    typeof protocol.settle === 'function'
  );
};
