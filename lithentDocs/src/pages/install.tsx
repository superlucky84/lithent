import { h, mount } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';
import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `$ npm install lithent`;
const code2 = `// Babel
...
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {
      "pragma": "h",
      "pragmaFrag": "Fragment",
    }]
  ]
}
...
`;
const code3 = `...
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {
      "pragma": "h",
      "pragmaFrag": "Fragment",
    }]
  ]
}
...
`;

const code4 = `...
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    //...
  }
}
...
`;

const code5 = `...
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment",
    //...
  }
}
...
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const exCode2 = hljs.highlight(code2, {
  language: 'javascript',
}).value;

const exCode3 = hljs.highlight(code3, {
  language: 'javascript',
}).value;

const exCode4 = hljs.highlight(code4, {
  language: 'javascript',
}).value;

const exCode5 = hljs.highlight(code5, {
  language: 'javascript',
}).value;

// grid grid-cols-1 xl:grid-cols-2
export const Install = mount(() => {
  return () => (
    <div class="max-w-3xl px-4 pt-6 xl:gap-4 dark:bg-gray-900">
      <ContentHeader title="Install" />
      {/*<!-- Right Content --> */}
      <div class="p-4 mb-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <h3 class="text-slate-50 text-lg mb-2">Install Lithent</h3>
        <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <div
            class="font-normal"
            innerHTML={exCode1}
            style={{ whiteSpace: 'pre' }}
          />
        </div>
        <h3 class="text-slate-50 text-lg mb-2">Setting JSX - Babel</h3>
        <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <div
            class="font-normal"
            innerHTML={exCode2}
            style={{ whiteSpace: 'pre' }}
          />
        </div>
        <h3 class="text-slate-50 text-lg mb-2">
          Setting JSX - Typescript &lt; 4.1.1
        </h3>
        <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <div
            class="font-normal"
            innerHTML={exCode3}
            style={{ whiteSpace: 'pre' }}
          />
        </div>
        <h3 class="text-slate-50 text-lg mb-2">
          Setting JSX - Typescript &gt;= 4.1.1
        </h3>
        <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <div
            class="font-normal"
            innerHTML={exCode4}
            style={{ whiteSpace: 'pre' }}
          />
        </div>
        <h3 class="text-slate-50 text-lg mb-2">
          Setting JSX - If you use TypeScript within a Babel toolchain
        </h3>
        <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600">
          <div
            class="font-normal"
            innerHTML={exCode5}
            style={{ whiteSpace: 'pre' }}
          />
        </div>
      </div>
    </div>
  );
});
