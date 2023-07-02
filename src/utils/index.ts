import { WDom, TagFunctionResolver, Props } from '@/types';

export const getParent = (vDom: WDom) => {
  const parentVDom = vDom.getParent && vDom.getParent();

  return parentVDom as WDom;
};

export const reRender = (vDom: WDom, infoVdom: TagFunctionResolver) => {
  const { compProps: props, compChild: children } = vDom;
  const { props: infoProps, children: infoChidren } = infoVdom;

  if (props) {
    updateProps(props, infoProps);
  }

  if (children) {
    updateChildren(children, infoChidren);
  }

  const newVDom = vDom.reRender && vDom.reRender();

  return newVDom as WDom;
};

export const getEventName = (eventKey: string) =>
  eventKey.replace(/^on(.*)/, (_match, p1) => p1.toLowerCase());

export const getAttrKey = (keyName: string) =>
  keyName === 'className' ? 'class' : keyName;

export const entries = Object.entries;
export const keys = Object.keys;
export const assign = Object.assign;

const updateProps = (props: Props, infoProps: Props) => {
  if (props && infoProps !== props) {
    keys(props).forEach(key => delete props[key]);

    entries(infoProps || {}).forEach(([key, value]) => (props[key] = value));
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
