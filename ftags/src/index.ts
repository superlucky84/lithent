import { h, Fragment, isPropType } from 'lithent';
import type {
  Props,
  WDom,
  FragmentFunction,
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
      return (props?: Props, ...childrens: MiddleStateWDom[]) => {
        if (isPropType(props)) {
          return h(tagName, props || {}, ...childrens);
        } else if (props !== undefined) {
          return h(tagName, {}, props, ...childrens);
        }

        return h(tagName, {}, ...childrens);
      };
    },
  }
);

export const fFragment = (...children: MiddleStateWDom[]) => {
  return h(Fragment as FragmentFunction, {}, ...children);
};

export const fMount = <T>(component: Component<T>) => {
  const tagFunction = (_props: T, _children: WDom[]) => component;

  return (props?: T, ...children: MiddleStateWDom[]) => {
    if (isPropType(props)) {
      return h(tagFunction as TagFunction, props || {}, ...children);
    } else if (props !== undefined) {
      return h(tagFunction as TagFunction, {}, props, ...children);
    }

    return h(tagFunction as TagFunction, {}, ...children);
  };
};
