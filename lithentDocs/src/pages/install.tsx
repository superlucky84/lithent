import { h, mount } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';
import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code6 = `$ npm install htm`;
const code7 = `import { h, render, mount } from 'lithent';
import htm from 'htm';
const html = htm.bind(h);

const Component = mount(() => () => html\`<li>count: \${'htm example'}</li>\`;

render(html\`<\${Component} />\`);
`;

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
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment",
    //...
  }
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
// typescript config
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment",
    //...
  }
}

// babel config
{
  presets: [
    "@babel/env",
    ["@babel/typescript", { jsxPragma: "h" }],
  ],
  plugins: [
    ["@babel/transform-react-jsx", { pragma: "h" }]
  ],
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

const exCode6 = hljs.highlight(code6, {
  language: 'javascript',
}).value;

const exCode7 = hljs.highlight(code7, {
  language: 'javascript',
}).value;

// grid grid-cols-1 xl:grid-cols-2
export const Install = mount(() => {
  return () => (
    <div class="max-w-3xl px-4 pt-6 xl:gap-4 bg-gray-900">
      <ContentHeader title="Install" />
      {/*<!-- Right Content --> */}
      <h3 class="text-slate-50 text-lg mb-2">Install Lithent</h3>
      <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="py-2 overflow-x-auto text-sm text-gray-50 ">
        It's easier to use lithent with JSX or HTM.
      </div>
      <h3 class="text-slate-50 text-lg mt-8">With HTM</h3>
      <div class="p-4 mb-2 mt-2 space-y-1  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
        <div>
          <h3 class="text-slate-50 text-lg mb-2">htm install</h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode6}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
          <h3 class="text-slate-50 text-lg mb-2 mt-2">htm setting</h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode7}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
        </div>
      </div>
      <h3 class="text-slate-50 text-lg mt-8">With JSX</h3>
      <div class="p-4 mb-2 mt-2 space-y-1  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
        <div>
          <h3 class="text-slate-50 text-lg mb-2">Setting JSX - Babel</h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode2}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
          <h3 class="text-slate-50 text-lg mb-2 mt-8">
            Setting JSX - Typescript &lt; 4.1.1
          </h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode3}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
          <h3 class="text-slate-50 text-lg mb-2 mt-8">
            Setting JSX - Typescript &gt;= 4.1.1
          </h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode4}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
          <h3 class="text-slate-50 text-lg mb-2 mt-8">
            Setting JSX - If you use TypeScript within a Babel toolchain
          </h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode5}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
