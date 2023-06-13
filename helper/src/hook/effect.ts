import { updateCallback } from 'lithent';
import { mountCallback } from 'lithent';

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
