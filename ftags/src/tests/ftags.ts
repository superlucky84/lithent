import { render } from 'lithent';
import { fMount, fTags, fFragment } from '@/index';

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
