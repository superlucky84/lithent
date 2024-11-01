import { render, h, Fragment, isPropType } from '@/index';

import type {
  Props,
  WDom,
  MiddleStateWDom,
  FragmentFunction,
  Component,
  TagFunction,
} from '@/index';

type FFunction = (props?: Props, ...childrens: MiddleStateWDom[]) => WDom;
type FTags = {
  [tagName: string]: FFunction;
};

const fTags: FTags = new Proxy(
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

const fMount = <T,>(component: Component<T>) => {
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

const fFragment = (...children: MiddleStateWDom[]) => {
  return h(Fragment as FragmentFunction, {}, ...children);
};

const { section, div, p, br, strong } = fTags;

const fTagComponent = fMount<{ a: number }>((_r, props, children) => {
  return () =>
    fFragment(
      'first inner',
      div({ style: { border: '1px solid red' } }, 'second inner'),
      props.a,
      ...children
    );
});

render(
  fTagComponent(
    { a: 3 },
    div({ style: { border: '1px solid green' } }, `Fchildren1`),
    'Fchildren2',
    br(),
    section(
      { className: '123' },
      'section first inner',
      p(
        {},
        'p tag wrap',
        strong(
          { style: 'font-style: italic; padding: 2px' },
          'strong tag child'
        ),
        ' p tag child'
      )
    )
  ),
  document.getElementById('root')
);
