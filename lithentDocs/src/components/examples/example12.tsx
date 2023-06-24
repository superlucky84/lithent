import { h, mount, mountCallback, Fragment, render, ref } from 'lithent';
import { state } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, mount } from 'lithent';
const Root = mount(function (r) {
  const showFive = state<boolean>(true, r);
  const showSix = state<boolean>(true, r);

  const toggleFive = () => {
    showFive.v = !showFive.v;
  };

  const toggleSix = () => {
    showSix.v = !showSix.v;
  };

  return () => (
    <Fragment>
      <li>
        4
        <button onClick={toggleFive}>toggleFive</button>
        <button onClick={toggleSix}>toggleSix</button>
      </li>
      {showFive.v ? <li>5</li> : null}
      {showSix.v ? <li>6</li> : null}
      <li>7</li>
    </Fragment>
  );
});

/*
<ul id="list-root">
  <li>1</li><li>2</li><li>3</li><li id="nextTarget">8</li><li>9</li>
</ul>
*/
render(
  <Root />,
  document.querySelector('#list-root'),
  document.querySelector('#nextTarget')
);
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Root = mount(function (r) {
  const showFive = state<boolean>(true, r);
  const showSix = state<boolean>(true, r);

  const toggleFive = () => {
    showFive.v = !showFive.v;
  };

  const toggleSix = () => {
    showSix.v = !showSix.v;
  };

  return () => (
    <Fragment>
      <li>
        4{' '}
        <button
          class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
          onClick={toggleFive}
        >
          toggleFive
        </button>
        <button
          class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
          onClick={toggleSix}
        >
          toggleSix
        </button>
      </li>
      {showFive.v ? <li>5</li> : null}
      {showSix.v ? <li>6</li> : null}
      <li>7</li>
    </Fragment>
  );
});

export const Example12 = mount(() => {
  const wrapEl = ref<null | HTMLElement>(null);
  const nextEl = ref<null | HTMLElement>(null);
  mountCallback(() => {
    const wrap = wrapEl.value as HTMLElement;
    const next = nextEl.value as HTMLElement;
    render(<Root />, wrap, next);
  });
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 12 - Root With Fragment
      </h3>
      <p class="text-sm md:text-base text-gray-400">
        Test that 'Lithent' can correctly handle virtual DOM elements when real
        and virtual DOM elements are mixed under one parent.
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
          <li>1</li> <li>2</li> <li>3</li> <li ref={nextEl}>8</li> <li>9</li>
        </ul>
      </div>
    </div>
  );
});
