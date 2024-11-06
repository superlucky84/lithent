import type { WDom } from 'lithent';

export function hydration(wDom: WDom, wrapElement: HTMLElement) {
  console.log(wDom, wrapElement);
  console.log('CHILDREN', wrapElement.childNodes);
}
