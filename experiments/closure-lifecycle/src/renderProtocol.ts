import { componentMap } from 'lithent';
import type { Props, WDom } from 'lithent';

// Structural read of an experimental capability, outside the base public types.
export const getRenderProtocol = () =>
  (
    componentMap as typeof componentMap & {
      renderGate?: {
        blocks?: (node: WDom) => boolean;
        reparent?: (node: WDom) => void;
        settle?: (key?: Props) => void;
        beforePause: (key?: Props) => void;
      };
    }
  ).renderGate;

export const supportsRenderBoundary = () => {
  const protocol = getRenderProtocol();
  return (
    typeof protocol?.beforePause === 'function' &&
    typeof protocol.settle === 'function'
  );
};
