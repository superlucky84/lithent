/**
 * Rerender시 실제 dom에 반영해줘야 하는 상태
 *
 * 1. (ADD). 가상돔 비교시 오리지날이 없으면 새로 추가되는 dom으로 판단한다.
 * 2. (REPLACE). 오리지날이 있고 같은 엘리먼트타입이 아닌 경우 해당 위치의 태그 자체를 교체해준다.
 * 3. (UPDATE). 오리지날이 있고 같은 타입이면 dom의 속성만 변경해 주며, 텍스트 노드일 경우는 텍스트를 교체해준다.
 * 4. (DELETE). 오리지날이 있고 새로운 엘리먼트 타입은 null타입일 경우 dom을 삭제한다.
 * 5. (SORTED-REPLACE). loop의 경우 REPLACE라도 키값에 의해 순서가 변경될 수 있으므로 새로운 dom을 단순히 기존 위치에 교체하지 않고 새로 삼입하여 정렬한다.
 * 6. (SORTED-UPDATE). loop의 경우 UPDATE라도 키값에 의해 순서가 변경될수 있으므로 재 삽입하여 정렬한다.
 * 7. (NONE). text타입의 경우 text가 같다면 변경이 필요 없으므로 방치한다. (Todo. 다른 타입의 경우 처리필요)
 */

import { runMountedQueueFromVdom } from '@/hook/mounted';
import { runUpdatedQueueFromVdom } from '@/hook/updated';

export function render(vDom, wrapElement) {
  vDom.isRoot = true;
  vDom.wrapElement = wrapElement;

  wrapElement.appendChild(vDomToDom(vDom, true));
}

export function vDomUpdate(newVdomTree) {
  const { needRerender } = newVdomTree;

  switch (needRerender) {
    case 'ADD':
      typeAdd(newVdomTree);
      break;
    case 'DELETE':
      typeDelete(newVdomTree);
      break;
    case 'REPLACE':
      typeReplace(newVdomTree);
      break;
    case 'UPDATE':
      typeUpdate(newVdomTree);
      break;
    case 'SORTED-REPLACE':
      typeSortedReplace(newVdomTree);
      break;
    case 'SORTED-UPDATE':
      typeSortedUpdate(newVdomTree);
      break;
    case 'NONE':
      break;
  }
}

function typeDelete(newVdom) {
  const parent = newVdom?.el?.parentNode;

  if (parent) {
    parent.removeChild(newVdom.el);
    delete newVdom.el;
  }
}

function typeSortedReplace(newVdom) {
  typeDelete(newVdom);
  typeAdd(newVdom);
}

function typeSortedUpdate(newVdom) {
  typeDelete(newVdom);
  typeAdd(newVdom, newVdom.el);
}

function typeAdd(newVdom, newElement) {
  if (!newElement) {
    newElement = vDomToDom(newVdom, true);
  }
  const parentVdom = newVdom.getParent();
  const parentEl = findRealParentElement(parentVdom);
  const nextEl = startFindNextBrotherElement(newVdom, parentVdom);

  if (nextEl) {
    parentEl.insertBefore(newElement, nextEl);
  } else {
    parentEl.appendChild(newElement);
  }

  runMountedQueueFromVdom(newVdom);
}

function startFindNextBrotherElement(vDom, parentVdom) {
  const brothers = parentVdom.children;
  const index = brothers.indexOf(vDom);
  const nextIndex = index + 1;
  const candidiateBrothers = brothers.slice(nextIndex);

  const finedNextEl = findChildFragmentNextElement(candidiateBrothers);

  if (finedNextEl) {
    return finedNextEl;
  }

  if (
    !parentVdom.isRoot &&
    (parentVdom.type === 'fragment' || parentVdom.type === 'loop')
  ) {
    return startFindNextBrotherElement(parentVdom, parentVdom.getParent());
  }

  return false;
}

function findChildFragmentNextElement(candidiateBrothers) {
  return candidiateBrothers.reduce((targetEl, bItem) => {
    const type = bItem?.type;
    const el = bItem?.el;
    const isFragment = type === 'fragment' || type === 'loop';

    if (targetEl) {
      return targetEl;
    } else if (isFragment) {
      return findChildFragmentNextElement(bItem.children);
    } else if (el && el.nodeType !== 11) {
      return el;
    }

    return targetEl;
  }, null);
}

function typeReplace(newVdom) {
  const parentVdom = newVdom.getParent();
  const parentElement = parentVdom.el;
  const orignalElement = newVdom.el;
  const newElement = vDomToDom(newVdom, true);

  if (orignalElement && newVdom.oldProps) {
    removeEvent(newVdom.oldProps, orignalElement);
  }

  parentElement.replaceChild(newElement, orignalElement);

  runMountedQueueFromVdom(newVdom);
}

function typeUpdate(newVdom) {
  const element = newVdom.el;

  if (newVdom.type === 'text') {
    updateText(newVdom);

    return;
  }

  if (element) {
    const { oldProps, props } = newVdom;

    updateProps({ oldProps, props, element });

    delete newVdom.oldProps;
  }

  if (newVdom.tag === 'input') {
    element.value = newVdom.props.value;
  }

  newVdom.children.forEach(childItem => {
    vDomUpdate(childItem);
  });

  runUpdatedQueueFromVdom(newVdom);
}

function updateText(newVdom) {
  const element = newVdom.el;
  element.nodeValue = newVdom.text;
}

function removeEvent(oldProps, element) {
  if (oldProps?.onClick) {
    element.removeEventListener('click', oldProps.onClick);
  }
  if (oldProps?.onInput) {
    element.removeEventListener('input', oldProps.onInput);
  }
}

function updateProps({ oldProps, props, element }) {
  const originalProps = { ...oldProps };

  Object.entries(props || {}).forEach(([dataKey, dataValue]) => {
    if (dataKey === 'key') {
      // Do nothing
    } else if (dataKey === 'style') {
      updateStyle({ style: dataValue, oldStyle: originalProps.style, element });
    } else if (dataKey === 'ref') {
      dataValue.value = element;
    } else if (dataKey.match(/^on/)) {
      updateEvent({
        element,
        eventKey: dataKey,
        newEventHandler: dataValue,
        oldEventHandler: originalProps[dataKey],
      });
    } else if (typeof dataValue === 'number' || typeof dataValue === 'string') {
      element.setAttribute(dataKey, dataValue);
    }

    delete originalProps[dataKey];
  });

  Object.keys(originalProps).forEach(dataKey => {
    element.removeAttribute(dataKey);
  });
}

function vDomToDom(vDom, init) {
  let element;
  const { type, tag, text, props, children = [] } = vDom;
  const isVirtualType = type === 'fragment' || type === 'loop';

  if (isVirtualType) {
    element = new DocumentFragment();
  } else if (type === 'element') {
    element = document.createElement(tag);
  } else if (type === 'text') {
    element = document.createTextNode(text);
  }

  vDomChildrenToDom(children, element, init);
  updateProps({ props, element });

  vDom.el = element;

  runMountedQueueFromVdom(vDom);

  return element;
}

function vDomChildrenToDom(children, parentElement, init) {
  if (init) {
    const elementChildren = children.reduce((acc, childItem) => {
      if (childItem.type) {
        acc.appendChild(vDomToDom(childItem, init));
      }

      return acc;
    }, new DocumentFragment());

    if (elementChildren.hasChildNodes()) {
      parentElement.appendChild(elementChildren);
    }
  }
}

function updateEvent({ element, eventKey, newEventHandler, oldEventHandler }) {
  const eventName = eventKey.replace(/^on(.*)/, function (match, p1) {
    return p1.toLowerCase();
  });

  element.removeEventListener(eventName, oldEventHandler);
  element.addEventListener(eventName, newEventHandler);
}

function updateStyle({ style, oldStyle, element }) {
  const originalStyle = [...oldStyle];

  Object.entries(style).forEach(([styleKey, dataValue]) => {
    element.style.setProperty(styleKey, dataValue);
    delete originalStyle[styleKey];
  });

  Object.entries(originalStyle).forEach(([styleKey, dataValue]) => {
    element.style.removeProperty(styleKey, dataValue);
  });
}

function findRealParentElement(vDom) {
  const isVirtualType = vDom.type === 'fragment' || vDom.type === 'loop';

  if (vDom.isRoot) {
    return vDom.wrapElement;
  }

  if (!isVirtualType) {
    return vDom.el;
  }

  return findRealParentElement(vDom.getParent());
}
