import { h } from 'lithent';
import type {
  Props,
  WDom,
  MiddleStateWDom,
  Component,
  TagFunction,
} from 'lithent';

type FFunction = (props?: Props, ...childrens: MiddleStateWDom[]) => WDom;
type FTags = {
  [tagName: string]: FFunction;
};

export const fTags: FTags = new Proxy(
  {},
  {
    get(_: {}, tagName: string) {
      return (props?: Props, ...childrens: MiddleStateWDom[]) =>
        h(tagName, props || {}, ...childrens);
    },
  }
);

export const fMount = <T>(component: Component<T>) => {
  const tagFunction = (_props: T, _children: WDom[]) => component;

  return (props?: T, ...children: MiddleStateWDom[]) =>
    h(tagFunction as TagFunction, props || {}, children);
};
