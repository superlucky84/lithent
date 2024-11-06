import type { WDom } from 'lithent';

export function hydration(wDom: WDom, wrapElement: HTMLElement) {
  console.log(wDom, wrapElement);
  console.log('CHILDREN', wrapElement.childNodes);
  Array.from(wrapElement.childNodes)
    .filter(item => {
      if (item.nodeType === 3 && !(item as Text).data.replace(/\s*/g, '')) {
        return false;
      }
      return true;
    })
    .forEach(item => {
      console.log('ITEM', item);
      console.log('NODETYPE', item.nodeType);
    });
}
