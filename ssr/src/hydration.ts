import { render } from 'lithent';
import type { WDom } from 'lithent';

/**
 * hydration
 */
export function hydration(wDom: WDom, wrapElement: HTMLElement) {
  /**
   * wDom에 el 속성을 붙여준다.
   */
  addElement(wDom, wrapElement);

  /**
   * wDom에 이벤트를 붙여준다.
   */
  render(wDom, wrapElement, null, true);
}

/**
 * wDom에 el 속성을 붙여준다.
 */
function addElement(wDomOrig: WDom, wrapElement: HTMLElement) {
  const wDomList = flatFlagmentFromList(
    wDomOrig.type && ['fragment', 'loop'].includes(wDomOrig.type)
      ? [...(wDomOrig.children || [])]
      : [wDomOrig]
  );
  const realDomList = Array.from(wrapElement.childNodes);

  if (wDomList) {
    addElementProcessChildren(wDomList, realDomList);
  }
}

/**
 * wDom에 el 속성을 붙여준다(재귀)
 */
function addElementProcessChildren(wDomList: WDom[], realDomList: ChildNode[]) {
  let index = 0;
  realDomList
    .filter((item: any) => filteredEmptyTextNode(item))
    .forEach(realDomItem => {
      let wDomItem = wDomList[index];
      const nodeType = realDomItem.nodeType;

      if (
        realDomItem &&
        wDomItem &&
        wDomItem.type &&
        ['text', 'element'].includes(wDomItem.type)
      ) {
        if (wDomItem.type === 'text' && nodeType === 3) {
          const { tFragment, nIndex } = processConsecutiveTextNodes(
            wDomList,
            index
          );
          index = nIndex;
          realDomItem!.parentElement!.replaceChild(tFragment, realDomItem);
        } else if (
          wDomItem.type === 'element' &&
          realDomItem instanceof HTMLElement
        ) {
          if ((realDomItem.tagName || '').toLowerCase() !== wDomItem.tag) {
            throw new Error('Hydration Error - not matched tagname');
          }

          wDomItem.el = realDomItem as HTMLElement;
        }

        addElementProcessChildren(
          flatFlagmentFromList(wDomItem.children || []),
          Array.from(realDomItem.childNodes)
        );
      }
      index += 1;
    });
}

/**
 * 공백문자인 텍스트 노드는 무시
 */
function filteredEmptyTextNode(item: HTMLElement | Text) {
  if (item.nodeType === 3 && !(item as Text).data.replace(/\s*/g, '')) {
    return false;
  }
  return true;
}

/**
 * 중첩된 fragment 타입은 납작하게 펴준다.
 */
function flatFlagmentFromList(wDomlist: WDom[]) {
  return wDomlist.reduce((acc: WDom[], item: WDom) => {
    if (item.type && ['fragment', 'loop'].includes(item.type)) {
      acc.push(...flatFlagmentFromList(item?.children || []));
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

function processConsecutiveTextNodes(wDomList: WDom[], cIndex: number) {
  // cIndex
  const textWDomList: WDom[] = collectAdjacentTextNode(wDomList, cIndex, []);
  const tFragment = new DocumentFragment();
  textWDomList.forEach(item => {
    const textNode = document.createTextNode(String(item.text));
    item.el = textNode;
    tFragment.appendChild(textNode);
  });

  return {
    tFragment,
    nIndex: cIndex + (textWDomList.length - 1),
  };
}

function collectAdjacentTextNode(
  wDomList: WDom[],
  cIndex: number,
  acc: WDom[]
): WDom[] {
  if (wDomList[cIndex] && wDomList[cIndex].type === 'text') {
    acc.push(wDomList[cIndex]);

    return collectAdjacentTextNode(wDomList, cIndex + 1, [...acc]);
  }
  return acc;
}
