import { h, mount } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `
import { render } from 'lithent';
import { fTags, fMount, FFragment } from 'lithent/ftags';

const { section, div, p, br, strong } = fTags;

const FTagComponent = fMount<{ firstProp: number }>((_r, props, children) => {
  return () =>
    FFragment(
      {},
      'first inner',
      div({ style: 'border: 1px solid red' }, 'second inner'),
      props.firstProp,
      ...children
    );
});

render(
  FTagComponent(
    { firstProp: 3 },
    div({ style: 'border: 1px solid green' }, \`Fchildren1\`),
    'Fchildren2',
    br()
  ),
  document.getElementById('root')
);
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

export const Example19 = mount(() => {
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">Example 19 - fTags</h3>
      <p class="text-sm md:text-base text-gray-400 mb-2">
        You can markup by calling a function. When creating components, use
        `fMount` instead of `mount`. When creating fragment, use `FFragment`
        instead of `Fragment`.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
    </div>
  );
});
