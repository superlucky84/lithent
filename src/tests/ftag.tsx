import { render, h } from '@/index';

import type {
  Props,
  WDom,
  MiddleStateWDom,
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
      return (props?: Props, ...childrens: MiddleStateWDom[]) =>
        h(tagName, props || {}, ...childrens);
    },
  }
);

const fMount = <T,>(component: Component<T>) => {
  const tagFunction = (_props: T, _children: WDom[]) => component;

  return (props?: T, ...children: MiddleStateWDom[]) =>
    h(tagFunction as TagFunction, props || {}, children);
};

const { section, div, p, br, strong } = fTags;

const FTagComponent = fMount<{ a: number }>((_r, props, children) => {
  return () =>
    div(
      { style: 'border: 1px solid red' },
      'first inner',
      div({}, 'second inner'),
      props.a,
      ...children
    );
});

render(
  FTagComponent(
    { a: 3 },
    div({ style: 'border: 1px solid green' }, `Fchildren1`),
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
