import { h, mount, mountCallback, Fragment, render, ref } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, mount, Fragment } from 'lithent';
const Loop = mount(function (renew) {
  let list: { key: number; value: string }[] = [
    { key: 4, value: '4' },
    { key: 5, value: '5' },
    { key: 6, value: '6' },
    { key: 7, value: '7' },
  ];
  const handle = () => {
    list = [
      { key: 7, value: 'seven' },
      { key: 6, value: 'six' },
      { key: 5, value: 'five' },
      { key: 4, value: 'four' },
    ];
    renew();
  };

  return () => (
    <Fragment>
      <button onClick={handle}>handle</button>
      {list.map(item => (
        <div key={item.key}>{item.value}</div>
      ))}
    </Fragment>
  );
});

/*
<ul id="list-root">
  <li>1</li><li>2</li><li>3</li><li id="nextTarget">8</li><li>9</li>
</ul>
*/

render(
  <Loop />,
  document.querySelector('#list-root'),
  document.querySelector('#nextTarget')
);
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Loop = mount(function (renew) {
  let list: { key: number; value: string }[] = [
    { key: 4, value: '4' },
    { key: 5, value: '5' },
    { key: 6, value: '6' },
    { key: 7, value: '7' },
  ];
  const handle = () => {
    list = [
      { key: 7, value: 'seven' },
      { key: 6, value: 'six' },
      { key: 5, value: 'five' },
      { key: 4, value: 'four' },
    ];
    renew();
  };

  return () => (
    <Fragment>
      <button
        class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
        onClick={handle}
      >
        handle
      </button>
      {list.map(item => (
        <div key={item.key}>{item.value}</div>
      ))}
    </Fragment>
  );
});

export const Example13 = mount(() => {
  const wrapEl = ref<null | HTMLElement>(null);
  const nextEl = ref<null | HTMLElement>(null);

  mountCallback(() => {
    setTimeout(() => {
      const wrap = wrapEl.value as HTMLElement;
      const next = nextEl.value as HTMLElement;
      render(<Loop />, wrap, next);
    });
  });
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 13 - Root With Loop
      </h3>
      <p class="text-sm md:text-base text-gray-400">
        Tests if 'Lithent' correctly handles changes to the virtual DOM element
        when there is a loop element mixed between the real and virtual DOM
        elements.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="flex-auto px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <ul ref={wrapEl}>
          <li>1</li> <li>2</li> <li>3</li> <li ref={nextEl}>8</li>
          <li>9</li>
        </ul>
      </div>
    </div>
  );
});
