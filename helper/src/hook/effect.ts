// @ts-ignore
import { updateCallback } from 'wwact';
// @ts-ignore
import { mountCallback } from 'wwact';

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
