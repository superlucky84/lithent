import { updateCallback } from '@/hook/updateCallback';
import { mountCallback } from '@/hook/mountCallback';

export const effect = (
  forward: () => (() => void) | void,
  backward: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  mountCallback(() => {
    forward();

    return backward;
  });

  updateCallback(() => {
    backward();

    return forward;
  }, dependencies);
};
