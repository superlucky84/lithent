import { componentMap } from 'lithent';
import type { WDom } from 'lithent';

// Structural read of an experimental capability, outside the base public types.
export const getRenderProtocol = () =>
  (
    componentMap as typeof componentMap & {
      renderGate?: {
        blocks?: (node: WDom) => boolean;
        beforePause: () => void;
      };
    }
  ).renderGate;

export const supportsRenderBoundary = () =>
  typeof getRenderProtocol()?.beforePause === 'function';
