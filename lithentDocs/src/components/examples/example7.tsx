import { h, mount } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, mount } from 'lithent';
const Component = mount(() => {
  let injectHtml = '<button>INJECT BUTTON</button>';

  return () => <div innerHTML={injectHtml} />;
});
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Component = mount(() => {
  let injectHtml =
    '<button class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800">INJECTED</button>';

  return () => <div innerHTML={injectHtml} />;
});

export const Example7 = mount(() => {
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 7 - innerHTML
      </h3>
      <p class="text-sm md:text-base text-gray-400">
        Tests the "innerHTML", which is used when you need to put string html
        inside the virtual DOM in special circumstances.
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
