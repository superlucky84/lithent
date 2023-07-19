import { render, WDom } from 'lithent';

const nextTick = () => Promise.resolve();

export const portal = (
  wDomMaker: () => WDom,
  wrapElement: HTMLElement | null,
  afterElement?: HTMLElement | null
) => {
  let destroy = () => {};

  nextTick().then(() => {
    destroy = render(wDomMaker(), wrapElement, afterElement);
  });

  return () => destroy();
};
