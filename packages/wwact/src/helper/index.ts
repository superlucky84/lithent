import { WDom, TagFunctionResolver, Props } from '@/types';

export function getParent(vDom: WDom) {
  const parentVDom = vDom.getParent && vDom.getParent();

  if (!parentVDom) {
    throw Error('Not found parent vDom');
  }

  return parentVDom;
}

export function reRender(vDom: WDom, infoVdom: TagFunctionResolver) {
  const { componentProps: props, componentChildren: children } = vDom;
  const { props: infoProps, children: infoChidren } = infoVdom;

  if (props) {
    updateProps(props, infoProps);
  }

  if (children) {
    updateChildren(children, infoChidren);
  }

  const newVDom = vDom.reRender && vDom.reRender();

  if (!newVDom) {
    throw Error('Unable reRender');
  }

  return newVDom;
}

function updateProps(props: Props, infoProps: Props) {
  if (infoProps !== props) {
    if (props) {
      Object.keys(props).forEach(key => {
        delete props[key];
      });
    }

    if (props) {
      Object.entries(infoProps || {}).forEach(([key, value]) => {
        props[key] = value;
      });
    }
  }
}

function updateChildren(children: WDom[], infoChidren: WDom[]) {
  if (infoChidren !== children) {
    if (children) {
      children.splice(0, children.length);
    }

    if (infoChidren && children) {
      infoChidren.forEach(childrenItem => {
        children.push(childrenItem);
      });
    }
  }
}
