import { render } from '@/engine';
import type { WDom } from '@/engine';

/**
 * hydration
 */
export function hydration(wDom: WDom, wrapElement: HTMLElement) {
  /**
   * Attach the el property to wDom.
   */
  addElement(wDom, wrapElement);

  /**
   * Attach events to wDom.
   */
  return render(wDom, wrapElement, null, true);
}

/**
 * Attach the el property to wDom.
 */
function addElement(wDomOrig: WDom, wrapElement: HTMLElement) {
  const isVirtualType =
    wDomOrig.type && ['fragment', 'loop'].includes(wDomOrig.type);

  if (isVirtualType) {
    wDomOrig.el = new DocumentFragment();
  }
  const wDomList = flatFlagmentFromList(
    isVirtualType ? [...(wDomOrig.children || [])] : [wDomOrig]
  );
  const realDomList =
    wrapElement.tagName === 'HTML'
      ? [wrapElement]
      : Array.from(wrapElement.childNodes);

  if (wDomList) {
    addElementProcessChildren(wDomList, realDomList);
  }
}

/**
 * Attach the el property to wDom recursively.
 */
function addElementProcessChildren(wDomList: WDom[], realDomList: ChildNode[]) {
  let index = 0;
  realDomList
    .filter((item: any) => filteredEmptyTextNode(item))
    .forEach(realDomItem => {
      let wDomItem = wDomList[index];
      const nodeType = realDomItem.nodeType;
      let pass = false;

      if (wDomItem?.type === null) {
        index += 1;
        wDomItem = wDomList[index];
      }

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
            // throw new Error('Hydration Error - not matched tagname');
            pass = true;
          } else {
            wDomItem.el = realDomItem as HTMLElement;
          }
        }

        if (!pass) {
          addElementProcessChildren(
            flatFlagmentFromList(wDomItem.children || []),
            Array.from(realDomItem.childNodes)
          );
        }
      }

      if (!pass) {
        index += 1;
      }
    });
}

/**
 * Whitespace or text nodes are ignored.
 */
function filteredEmptyTextNode(item: HTMLElement | Text) {
  if (item.nodeType === 3 && !(item as Text).data.replace(/\s*/g, '')) {
    return false;
  }

  return true;
}

/**
 * Flattens nested fragment types.
 */
function flatFlagmentFromList(wDomlist: WDom[]) {
  return wDomlist.reduce((acc: WDom[], item: WDom) => {
    if (item.type && ['fragment', 'loop'].includes(item.type)) {
      item.el = new DocumentFragment();
      acc.push(...flatFlagmentFromList(item?.children || []));
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

/**
 * Hydration is applied to consecutively rendered text node objects.
 */
function processConsecutiveTextNodes(wDomList: WDom[], cIndex: number) {
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

/**
 * Collect consecutive text nodes.
 */
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
