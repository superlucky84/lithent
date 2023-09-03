import { h, mount, Fragment } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const Child = mount<{ count1: number; count2: number }>(() => {
  return ({ count1, count2 }) => (
    <Fragment>
      <span>
        depth1: {count1} - {count2}
      </span>
    </Fragment>
  );
});

const Root = mount(renew => {
  let count1 = 0;
  let count2 = 0;

  const insCount1 = () => {
    count1 += 1;
    renew();
  };
  const insCount2 = () => {
    count2 += 1;
    renew();
  };

  return cacheUpdate(
    () => [count1],
    () => (
      <Fragment>
        <button onClick={insCount1}>insCount1</button>
        <button onClick={insCount2}>insCount2</button>
        <Child count1={count1} count2={count2} />
      </Fragment>
    )
  );
});

render(<Root />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Child = mount<{ count1: number; count2: number }>(() => {
  return ({ count1, count2 }) => (
    <Fragment>
      <span>
        depth1: {count1} - {count2}
      </span>
    </Fragment>
  );
});

const Root = mount(renew => {
  let count1 = 0;
  let count2 = 0;

  const insCount1 = () => {
    count1 += 1;
    renew();
  };
  const insCount2 = () => {
    count2 += 1;
    renew();
  };

  return cacheUpdate(
    () => [count1],
    () => (
      <Fragment>
        <button
          class="ml-2 text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
          onClick={insCount1}
        >
          insCount1
        </button>
        <button
          class="ml-2 text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
          onClick={insCount2}
        >
          insCount2
        </button>
        <Child count1={count1} count2={count2} />
      </Fragment>
    )
  );
});

export const Example18 = mount(() => {
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 18 - helper (cacheUpdate)
      </h3>
      <p class="text-sm md:text-base text-gray-400 mb-2">
        <a
          class="text-orange-200 hover:underline"
          href="https://github.com/superlucky84/lithent/blob/master/helper/src/hook/cacheUpdate.ts"
          target="_blank"
        >
          view helper code
        </a>
      </p>
      <p class="text-sm md:text-base text-gray-400 mb-2">
        It has the same functionality as memo in React.
      </p>
      <p class="text-sm md:text-base text-gray-400 mb-2">
        The first argument of the helper function compares the current state of
        the component to the previous state.
      </p>
      <p class="text-sm md:text-base text-gray-400 mb-2">
        If the result is true, it is assumed to be an exact match for the
        previous state and avoids updating the DOM.
      </p>
      <p class="text-sm md:text-base text-gray-400 mb-2">
        The second argument is the updater function.
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
