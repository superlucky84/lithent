import type { WDom } from 'lithent';

export function hydration(wDom: WDom, wrapElement: HTMLElement | null) {
  console.log('a111', wDom, wrapElement);
}
