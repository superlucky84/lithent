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
  const brothers = newVdom.getBrothers();

  const index = brothers.indexOf(newVdom);
  const nextIndex = index + 1;

  const nextEl = brothers[nextIndex].el;
  const parentEl = nextEl.parentNode;

  parentEl.insertBefore(newElement, nextEl);
}

function typeDeleteAdd(newVdom) {
  // console.log('DELTE-ADD', newVdom.type);

  // const parentVdom = newVdom.getParent();
  // const parentDiv = parentVdom.el;
  // const newElement = vDomToDom(newVdom);
  if (newVdom.type === 'text') {
    typeDeleteAddForText(newVdom);
  } else {
    // console.log('TTTTTTTTTYPE', newVdom.type);
  }

  // if (element && newVdom.oldProps) {
  // removeEvent(newVdom.oldProps, element);
  // }
  // console.log('parentEL - ', parentVdom.el);

  // console.log('1111', newVdom.getParent());
  // console.log('ELEMENT - ', newVdom);

  // console.log('-------------------------');
  // console.log(newVdom.el);

  // parentDiv.replaceChild(newVdom.el, newElement);
}

function typeDeleteAddForText(newVdom) {
  const element = newVdom.el;
  element.nodeValue = newVdom.text;
}

function typeUpdate(newVdom) {
  const element = newVdom.el;

  if (element) {
    removeEvent(newVdom.oldProps, element);
    updateProps(newVdom.props, element);

    delete newVdom.oldProps;
  }

  newVdom.children.forEach(childItem => {
    vDomUpdate(childItem);
  });
}

function removeEvent(oldProps, element) {
  if (oldProps.onClick) {
    element.removeEventListener('click', oldProps.onClick);
  }
}

function updateProps(props, element) {
  Object.entries(props).forEach(([dataKey, dataValue]) => {
    if (dataKey === 'style') {
      addStyle(vDom, element);
    } else if (dataKey === 'onClick') {
      element.addEventListener('click', dataValue);
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

  return element;
}

function addStyle(vDom, element) {
  const { style = {} } = vDom.props;
  Object.entries(style).forEach(([styleKey, dataValue]) => {
    element.style[styleKey] = dataValue;
  });
}
