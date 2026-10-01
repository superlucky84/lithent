import { mount, render } from 'lithent';
import { jsx, jsxs, jsxDEV } from 'lithent/jsx-runtime';

const dynamic =
  new URL(location.href).searchParams.get('mode') === 'jsxDEV' ? jsxDEV : jsx;
const node = (type: unknown, props: Parameters<typeof jsx>[1], key?: number) =>
  dynamic(
    type as Parameters<typeof jsx>[0],
    props,
    key,
    false,
    undefined,
    undefined
  );
const Row = mount<{ key: number; id: number }>((renew, props) => {
  let count = 0;
  return () =>
    jsxs(
      'li',
      {
        'data-id': props.id,
        children: [
          node('button', {
            onClick: () => {
              count++;
              renew();
            },
            children: `row ${props.id}`,
          }),
          node('output', { children: String(count) }),
        ],
      },
      undefined,
      true,
      undefined,
      undefined
    );
});
const App = mount(renew => {
  let ids = [1, 2, 3];
  return () =>
    jsxs(
      'section',
      {
        children: [
          node('h1', { children: 'static heading' }),
          node('button', {
            onClick: () => {
              ids = [3, 1, 4];
              renew();
            },
            children: 'reorder',
          }),
          node('ul', { children: ids.map(id => node(Row, { id }, id)) }),
          node('footer', { children: 'static tail' }),
        ],
      },
      undefined
    );
});
render(node(App, {}), document.querySelector('#app'));
