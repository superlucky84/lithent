import { isExisty } from '@/util';
import { runMountedQueueFromVdom } from '@/hook/mounted';
import { runUpdatedQueueFromVdom } from '@/hook/updated';

export function render(vDom, wrapElement) {
  vDom.isRoot = true;

  const kk = vDomToDom(vDom, true);

  if (vDom.type === 'fragment') {
    vDom.el = wrapElement;
  }

  wrapElement.appendChild(kk);
}

export function vDomUpdate(newVdomTree) {
  const { needRerender } = newVdomTree;

  // console.log('NEWVDOMTREE - ', newVdomTree);
  // console.log('NEEDRERENDER - ', needRerender);

  // ADD, DELETE, DELETE-ADD, UPDATE, NONE
  switch (needRerender) {
    case 'ADD':
      typeAdd(newVdomTree);
      break;
    case 'DELETE':
      typeDelete(newVdomTree);
      break;
    case 'DELETE-ADD':
      typeDeleteAdd(newVdomTree);
      break;
    case 'UPDATE':
      typeUpdate(newVdomTree);
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

function typeAdd(newVdom) {
  const newElement = vDomToDom(newVdom, true);
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

  if (parentVdom.type === 'fragment' || parentVdom.type === 'loop') {
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

function typeDeleteAdd(newVdom) {
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

function updateText(newVdom) {
  const element = newVdom.el;
  element.nodeValue = newVdom.text;
}

function typeUpdate(newVdom) {
  const element = newVdom.el;

  if (newVdom.type === 'text') {
    updateText(newVdom);

    return;
  }

  if (element) {
    // Todo 이벤트 처리 추상화 및 일괄 수정 필요
    removeEvent(newVdom.oldProps, element, newVdom.props);
    updateProps(newVdom.props, element);

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

function removeEvent(oldProps, element, newprops) {
  if (oldProps?.onClick) {
    element.removeEventListener('click', oldProps.onClick);
  }
  if (oldProps?.onInput) {
    element.removeEventListener('input', oldProps.onInput);
  }
}

function updateProps(props, element) {
  Object.entries(props || []).forEach(([dataKey, dataValue]) => {
    if (dataKey === 'style') {
      addStyle(vDom, element);
    } else if (dataKey === 'ref') {
      dataValue.value = element;
    } else if (dataKey === 'onClick') {
      element.addEventListener('click', dataValue);
    } else if (dataKey === 'onInput') {
      element.addEventListener('input', dataValue);
    } else if (typeof dataValue === 'number' || typeof dataValue === 'string') {
      element.setAttribute(dataKey, dataValue);
    }
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

  if (init) {
    const elementChildren = children.reduce((acc, childItem) => {
      if (childItem.type) {
        acc.appendChild(vDomToDom(childItem, init));
      }

      return acc;
    }, new DocumentFragment());

    if (elementChildren.hasChildNodes()) {
      element.appendChild(elementChildren);
    }
  }

  if (props) {
    updateProps(props, element);
  }

  vDom.el = element;

  runMountedQueueFromVdom(vDom);

  return element;
}

function addStyle(vDom, element) {
  const { style = {} } = vDom.props;
  Object.entries(style).forEach(([styleKey, dataValue]) => {
    element.style[styleKey] = dataValue;
  });
}

function findRealParentElement(vDom) {
  const isVirtualType = vDom.type === 'fragment' || vDom.type === 'loop';

  if (!isVirtualType || vDom.isRoot) {
    return vDom.el;
  }

  return findRealParentElement(vDom.getParent());
}
