import { h, mount, ref } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';
import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code7 = `<script src="https://cdn.jsdelivr.net/npm/lithent@1.0.4/dist/lithent.umd.js"></script>
<!--script src="https://cdn.jsdelivr.net/npm/lithent@1.0.4/helper/dist/lithentHelper.umd.js"></script-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/htm/3.1.1/htm.js"></script>

<div id="root"></div>

<script>
const { h, Fragment, render, mount } = lithent;
// const { state } = lithentHelper;
const html = htm.bind(h);

const Component = mount(renew => {
  count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  // Updater
  return () => html\`
    <\${Fragment}>
      <li>count: \${count}</li>
      <button onClick=\${change}>increase</button>
    <\/\/>
  \`;
});

const destroy = render(html\`<\${Component} />\`, document.getElementById('root'));
</script>
`;

const code8 = `import { h, render, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';
import htm from 'htm';
const html = htm.bind(h);

const Component = mount((r, _props) => {
  const count = state(0, r);

  const change = () => (count.v += 1);

  // Updater
  return () => html\`
    <\${Fragment}>
      <li>count: \${count.v}</li>
      <button onClick=\${change}>increase</button>
    <//>
  \`;
});

// insertBefore
// const destroy = render(\`<\${Component} />\`, document.getElementById('root'), document.getElementById('nextElement'));

// appendChild
const destroy = render(html\`<\${Component} />\`, document.getElementById('root'));
`;

const code6 = `$ npm install htm`;

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
    "jsxImportSource": "lithent",
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

const exCode8 = hljs.highlight(code8, {
  language: 'javascript',
}).value;

// grid grid-cols-1 xl:grid-cols-2
export const Install = mount(() => {
  const installEl = ref<HTMLElement | null>(null);
  const markupEl = ref<HTMLElement | null>(null);
  const usageEl = ref<HTMLElement | null>(null);

  const moveScroll = (type: string) => {
    let scrollTop = 0;
    if (type === 'install') {
      scrollTop = installEl.value?.getBoundingClientRect()?.top || 0;
    } else if (type === 'markup') {
      scrollTop = markupEl.value?.getBoundingClientRect()?.top || 0;
    } else if (type === 'usage') {
      scrollTop = usageEl.value?.getBoundingClientRect()?.top || 0;
    }

    window.scrollTo(0, scrollTop - 75);
  };

  return () => (
    <div class="max-w-3xl px-4 pt-6 xl:gap-4 bg-gray-900">
      <div class="text-xs text-slate-500">* Table of Contents</div>
      <button
        onClick={() => moveScroll('install')}
        class="block ml-4 text-xs text-slate-500 hover:underline"
      >
        * Install (NPM or CDN)
      </button>
      <button
        onClick={() => moveScroll('markup')}
        class="block ml-4 text-xs text-slate-500 hover:underline"
      >
        * Markup (HTM or JSX)
      </button>
      <button
        onClick={() => moveScroll('usage')}
        class="block ml-4 text-xs text-slate-500 hover:underline"
      >
        * Usage (ESM or UMD)
      </button>
      <ContentHeader title="Install" taregetRef={installEl} />
      {/*<!-- Right Content --> */}
      <h3 class="text-slate-50 text-xl mb-2">Use NPM</h3>
      <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <h3 class="text-slate-50 text-xl mt-2 mb-2">Or Use CDN</h3>
      <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
        <p>https://cdn.jsdelivr.net/npm/lithent@1.0.4/dist/lithent.umd.js</p>
        <p>
          https://cdn.jsdelivr.net/npm/lithent@1.0.4/helper/dist/lithentHelper.umd.js
        </p>
        <p>https://cdn.jsdelivr.net/npm/lithent@1.0.4/dist/lithent.mjs</p>
        <p>
          https://cdn.jsdelivr.net/npm/lithent@1.0.4/helper/dist/lithentHelper.mjs
        </p>
      </div>
      <div class="py-2 mb-4 overflow-x-auto text-sm text-gray-50 ">
        It's easier to use lithent with JSX or HTM.
      </div>
      <ContentHeader title="Markup" taregetRef={markupEl} />
      <h3 class="text-slate-50 text-xl mt-4">With HTM</h3>
      <div class="p-4 mb-2 mt-2 space-y-1  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
        <div>
          <h3 class="text-slate-50 text-lg mb-2">NPM</h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode6}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
          <h3 class="text-slate-50 text-lg mb-2 mt-2">CDN</h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <p>https://cdnjs.cloudflare.com/ajax/libs/htm/3.1.1/htm.js</p>
          </div>
        </div>
      </div>
      <h3 class="text-slate-50 text-xl mt-4">With JSX</h3>
      <div class="p-4 mb-8 mt-2 space-y-1  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
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
      <ContentHeader title="Usage" taregetRef={usageEl} />
      <div class="p-4 mb-2 mt-8 space-y-1  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
        <div>
          <h3 class="text-slate-50 text-lg mb-2">ESM</h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode8}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
          <h3 class="text-slate-50 text-lg mb-2 mt-8">UMD</h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode7}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
