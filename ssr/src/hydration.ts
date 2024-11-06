import type { WDom } from 'lithent';

export function hydration(
  wDom: WDom,
  wrapElement: HTMLElement | null,
  afterElement?: HTMLElement | null
) {
  console.log('a', wDom, wrapElement, afterElement);
}
