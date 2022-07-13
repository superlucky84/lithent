import { runMountedQueueFromVdom } from '@/hook/mounted';
import { runUpdatedQueueFromVdom } from '@/hook/updated';

export function render(vDom, wrapElement) {
  wrapElement.appendChild(vDomToDom(vDom));
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
  const newElement = vDomToDom(newVdom);
  const brothers = newVdom.getParent().children;

  const index = brothers.indexOf(newVdom);
  const nextIndex = index + 1;

  const nextEl = brothers[nextIndex].el;
  const parentEl = nextEl.parentNode;

  parentEl.insertBefore(newElement, nextEl);

  runMountedQueueFromVdom(newVdom);
}

function typeDeleteAdd(newVdom) {
  const parentVdom = newVdom.getParent();
  const parentElement = parentVdom.el;
  const orignalElement = newVdom.el;
  const newElement = vDomToDom(newVdom);

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
    } else {
      element.setAttribute(dataKey, dataValue);
    }
  });
}

function vDomToDom(vDom) {
  let element;
  const { type, tag, text, props, children = [] } = vDom;

  if (type === 'fragment' || type === 'loop') {
    element = new DocumentFragment();
  } else if (type === 'element') {
    element = document.createElement(tag);
  } else if (type === 'text') {
    element = document.createTextNode(text);
  }

  const elementChildren = children.reduce((acc, childItem) => {
    if (childItem.type) {
      const a = vDomToDom(childItem);
      acc.appendChild(a);
    }

    return acc;
  }, new DocumentFragment());

  if (props) {
    updateProps(props, element);
  }

  if (elementChildren.hasChildNodes()) {
    element.appendChild(elementChildren);
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
