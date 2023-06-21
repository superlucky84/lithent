import { h, Fragment, mount } from 'lithent';
import { store } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount } from 'lithent';
import { store } from 'lithent/helper';

const Component = mount(r => {
  const local = store<{ count1: number; count2: number; count3: number }>({
    count1: 1,
    count2: 1,
    count3: 1,
  })(r);

  const click = () => {
    local.count1 += 1;
    local.count2 -= 1;
    local.count3 *= 2;
  };
  return () => (
    <>
      <div>count1: {local.count1}</div>
      <div>count2: {local.count2}</div>
      <div>count3: {local.count3}</div>
      <button type="text" onClick={click}>
        change count
      </button>
    </>
  );
});

render(<Parent />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Component = mount(r => {
  const local = store<{ count1: number; count2: number; count3: number }>({
    count1: 1,
    count2: 1,
    count3: 1,
  })(r);

  const click = () => {
    local.count1 += 1;
    local.count2 -= 1;
    local.count3 *= 2;
  };
  return () => (
    <>
      <div>count1: {local.count1}</div>
      <div>count2: {local.count2}</div>
      <div>count3: {local.count3}</div>
      <button
        type="text"
        onClick={click}
        class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
      >
        change count
      </button>
    </>
  );
});

export const Example3 = mount(() => {
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 3 - helper (local store)
      </h3>
      <p class="text-sm md:text-base text-gray-400 mb-2">
        <a
          class="text-orange-200 hover:underline"
          href="https://github.com/superlucky84/lithent/blob/master/helper/src/hook/store.ts"
          target="_blank"
        >
          view helper code
        </a>
      </p>
      <p class="text-sm md:text-base text-gray-400">
        You can also use "store" only in local component.&nbsp;
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="flex-auto px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <Component />
      </div>
    </div>
  );
});
