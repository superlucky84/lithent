import { render, WDom } from 'lithent';

const nextTick = () => Promise.resolve();

export const portal = (
  wDom: WDom,
  wrapElement: HTMLElement | null,
  afterElement?: HTMLElement | null
) => {
  let destroy = () => {};

  nextTick().then(() => {
    destroy = render(wDom, wrapElement, afterElement);
  });

  return () => destroy();
};
