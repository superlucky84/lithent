import { h, mount, mountCallback, Fragment, render, ref } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, mount, Fragment } from 'lithent';

const Loop = mount(function () {
  const list: { key: number; value: string }[] = [
    { key: 4, value: '4' },
    { key: 5, value: '5' },
    { key: 6, value: '6' },
    { key: 7, value: '7' },
  ];

  return () => (
    <Fragment>
      {list.map(item => (
        <div key={item.key} class="text-orange-300">
          {item.value}
        </div>
      ))}
    </Fragment>
  );
});

/*
<ul id="list-root">
  <li>1</li><li>2</li><li>3</li><li id="nextTarget">8</li><li>9</li>
</ul>
<button id="destroy-button">destroy</button>
*/

const wrap = document.querySelector('#list-root');
const destroy = render(
  <Loop />,
  wrap,
  document.querySelector('#nextTarget')
);
document.getElementById('destroy-button')
  .addEventListener('click', destroy);
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Loop = mount(function () {
  const list: { key: number; value: string }[] = [
    { key: 4, value: '4' },
    { key: 5, value: '5' },
    { key: 6, value: '6' },
    { key: 7, value: '7' },
  ];

  return () => (
    <Fragment>
      {list.map(item => (
        <div key={item.key} class="text-orange-300">
          {item.value}
        </div>
      ))}
    </Fragment>
  );
});

export const Example16 = mount(() => {
  const wrapEl = ref<null | HTMLElement>(null);
  const nextEl = ref<null | HTMLElement>(null);
  const buttenEl = ref<null | HTMLElement>(null);

  mountCallback(() => {
    const wrap = wrapEl.value as HTMLElement;
    const next = nextEl.value as HTMLElement;
    const button = buttenEl.value as HTMLElement;
    const destroy = render(<Loop />, wrap, next);
    button.addEventListener('click', destroy);
  });
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 16 - Root With Loop Destroy
      </h3>
      <p class="text-sm md:text-base text-gray-400">
        The "destroy function" also works well when the loop type is stuck in
        the middle of the actual DOM.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="flex-auto px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <ul ref={wrapEl} id="list-root3">
          <li>1</li> <li>2</li> <li>3</li>{' '}
          <li ref={nextEl} id="nextTarget3">
            8
          </li>{' '}
          <li>9</li>{' '}
        </ul>
        <button
          ref={buttenEl}
          id="destroy-button"
          class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
        >
          destroy
        </button>
      </div>
    </div>
  );
});
