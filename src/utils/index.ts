import { WDom, TagFunctionResolver, Props } from '@/types';

export const getParent = (vDom: WDom) => {
  const parentVDom = vDom.getParent && vDom.getParent();

  if (!parentVDom) {
    throw Error('Not found parent vDom');
  }

  return parentVDom;
};

export const reRender = (vDom: WDom, infoVdom: TagFunctionResolver) => {
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
};

const updateProps = (props: Props, infoProps: Props) => {
  if (props && infoProps !== props) {
    Object.keys(props).forEach(key => delete props[key]);

    Object.entries(infoProps || {}).forEach(
      ([key, value]) => (props[key] = value)
    );
  }
};

const updateChildren = (children: WDom[], infoChidren: WDom[]) => {
  if (children && infoChidren !== children) {
    children.splice(0, children.length);

    if (infoChidren) {
      infoChidren.forEach(childrenItem => children.push(childrenItem));
    }
  }
};
