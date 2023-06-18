import { h, mount, Fragment } from 'lithent';
import { computed } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount } from 'lithent';
// import { computed } from 'lithent/helper';

const Component = mount(() => {
  const sum = computed<number>(() =>
    [1, 3, 5, 7, 9].reduce((accumulator, current) => accumulator + current, 0)
  );

  return () => (
    <>
      <span>sum: {sum.v}</span>
    </>
  );
});

render(<Component />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Component = mount(() => {
  const sum = computed<number>(() =>
    [1, 3, 5, 7, 9].reduce((accumulator, current) => accumulator + current, 0)
  );

  return () => (
    <>
      <span>sum: {sum.v}</span>
    </>
  );
});

export const Example2 = mount(() => {
  return () => (
    <div class="p-2 mb-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 1 - helper (shared store)
      </h3>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <p class="text-sm text-gray-400">
          Computed helps you use precomputed values directly in the updater.
        </p>
      </div>
      <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <Component />
      </div>
    </div>
  );
});
