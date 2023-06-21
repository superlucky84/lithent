import { h, mount, Fragment } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount, mountCallback } from 'lithent';
const Depth2 = mount<{ count: number }>(() => ({ count }) => (
  <Fragment>
    <span>depth2: {count}</span>
  </Fragment>
));

const Depth1 = mount<{ count: number }>(() => ({ count }) => (
  <Fragment>
    <span>depth1: {count}</span> <Depth2 count={count} />
  </Fragment>
));

const Root = mount(renew => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <Fragment>
      <button
        onClick={increase}
      >
        increase
      </button>
      <Depth1 count={count} />
    </Fragment>
  );
});

render(<Root />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Depth2 = mount<{ count: number }>(() => ({ count }) => (
  <Fragment>
    <span>depth2: {count}</span>
  </Fragment>
));

const Depth1 = mount<{ count: number }>(() => ({ count }) => (
  <Fragment>
    <span>depth1: {count}</span> <Depth2 count={count} />
  </Fragment>
));

const Root = mount(renew => {
  let count = 0;

  const toggle = () => {
    count += 1;
    renew();
  };

  return () => (
    <Fragment>
      <button
        class="ml-2 text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
        onClick={toggle}
      >
        increase
      </button>
      <Depth1 count={count} />
    </Fragment>
  );
});

export const Example15 = mount(() => {
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 15 - Nested Prop Update
      </h3>
      <p class="text-sm md:text-base text-gray-400 mb-2">
        Test that props are passed well to nested components.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="flex-auto px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <Root />
      </div>
    </div>
  );
});
