import { h, Fragment, isPropType, lmountComponentSet } from 'lithent';
import type {
  Props,
  WDom,
  FragmentFunction,
  MiddleStateWDom,
  Component,
  LComponent,
  TagFunction,
} from 'lithent';

type FFunction = (...param: (Props | MiddleStateWDom)[]) => WDom;
type FTags = {
  [tagName: string]: FFunction;
};

export const fTags: FTags = new Proxy(
  {},
  {
    get(_: {}, tagName: string) {
      return (...param: (Props | MiddleStateWDom)[]) => {
        const props = param[0];
        const childrens = param.slice(1);

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

  return (
    ...param: unknown extends T
      ? (Props | MiddleStateWDom)[]
      : [T, ...MiddleStateWDom[]]
  ) => {
    const props = param[0];
    const children = param.slice(1) as MiddleStateWDom[];

    if (isPropType(props)) {
      return h(tagFunction as TagFunction, props || {}, ...children);
    } else if (props !== undefined) {
      return h(tagFunction as TagFunction, {}, props, ...children);
    }

    return h(tagFunction as TagFunction, {}, ...children);
  };
};

export const flMount = <T>(component: LComponent<T>) => {
  const tagFunction = (_props: T, _children: WDom[]) => component;

  // Register component in lmountComponentSet for automatic state management
  lmountComponentSet.add(component);

  return (
    ...param: unknown extends T
      ? (Props | MiddleStateWDom)[]
      : [T, ...MiddleStateWDom[]]
  ) => {
    const props = param[0];
    const children = param.slice(1) as MiddleStateWDom[];

    if (isPropType(props)) {
      return h(tagFunction as unknown as TagFunction, props || {}, ...children);
    } else if (props !== undefined) {
      return h(tagFunction as unknown as TagFunction, {}, props, ...children);
    }

    return h(tagFunction as unknown as TagFunction, {}, ...children);
  };
};
