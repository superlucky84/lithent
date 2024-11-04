import { h, mount, ref } from 'lithent';
import { ContentHeader } from '@/components/contentHeader';
import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code10 = `<script src="https://cdn.jsdelivr.net/npm/lithent@1.14.1/dist/lithent.umd.js"></script>
<!--script src="https://cdn.jsdelivr.net/npm/lithent@1.14.1/helper/dist/lithentHelper.umd.js"></script-->
<script src="https://cdn.jsdelivr.net/npm/lithent@1.14.1/ftags/dist/lithentFTags.umd.js"></script>

<div id="root"></div>

<script>
const { render } = lithent;
const { fTags, fMount, fFragment } = lithentFTags;
// const { state } = lithentHelper;

const { section, div, p, br, strong } = fTags;

const fTagComponent = fMount<{ firstProp: number }>((_r, props, children) => {
  return () =>
    fFragment(
      'first inner',
      div({ style: { border: '1px solid red' } }, 'second inner'),
      div('The props argument can be omitted.'),
      props.firstProp,
      ...children
    );
});

render(
  fTagComponent(
    { firstProp: 3 }, // The props argument can be omitted.
    div({ style: { border: '1px solid green' } }, \`Fchildren1\`),
    'Fchildren2',
    br()
  ),
  document.getElementById('root')
);

</script>
`;

const code7 = `<script src="https://cdn.jsdelivr.net/npm/lithent@1.14.1/dist/lithent.umd.js"></script>
<!--script src="https://cdn.jsdelivr.net/npm/lithent@1.14.1/helper/dist/lithentHelper.umd.js"></script-->
<script src="https://cdn.jsdelivr.net/npm/lithent@1.14.1/tag/dist/lithentTag.umd.js"></script>
<!--script src="https://cdn.jsdelivr.net/npm/lithent@1.14.1/ftags/dist/lithentFTags.umd.js"></script-->

<div id="root"></div>

<script>
const { h, Fragment, render, mount } = lithent;
const { lTag } = lithentTag;
// const { state } = lithentHelper;

const Component = mount(renew => {
  count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  // Updater
  return () => lTag\`
    <\${Fragment}>
      <li>count: \${count}</li>
      <button onClick=\${change}>increase</button>
    <\/\/>
  \`;
});

const destroy = render(lTag\`<\${Component} />\`, document.getElementById('root'));
</script>
`;

const code8 = `import { h, render, mount, Fragment } from 'lithent';
import { lTag } from 'lithent/tag';
import { state } from 'lithent/helper';

const Component = mount((r, _props) => {
  const count = state(0, r);

  const change = () => (count.v += 1);

  // Updater
  return () => lTag\`
    <\${Fragment}>
      <li>count: \${count.v}</li>
      <button onClick=\${change}>increase</button>
    <//>
  \`;
});

// insertBefore
// const destroy = render(\`<\${Component} />\`, document.getElementById('root'), document.getElementById('nextElement'));

// appendChild
const destroy = render(lTag\`<\${Component} />\`, document.getElementById('root'));
`;

const code9 = `<script src="https://cdn.jsdelivr.net/npm/lithent@1.14.1/tag/dist/lithentTag.umd.js"></script>;
const { lTag } = lithentTag;
const destroy = render(lTag\`<\${Component} />\`, document.getElementById('root'));
`;

const code6 = `import { lTag } from 'lithent/tag';
const destroy = render(lTag\`<\${Component} />\`, document.getElementById('root'));
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

const exCode9 = hljs.highlight(code9, {
  language: 'javascript',
}).value;

const exCode10 = hljs.highlight(code10, {
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
        <p> </p>
        <p>## umd</p>
        <p>https://cdn.jsdelivr.net/npm/lithent@1.14.1/dist/lithent.umd.js</p>
        <p>
          https://cdn.jsdelivr.net/npm/lithent@1.14.1/helper/dist/lithentHelper.umd.js
        </p>
        <p>
          https://cdn.jsdelivr.net/npm/lithent@1.14.1/ftags/dist/lithentFTags.umd.js
        </p>
        <p>
          https://cdn.jsdelivr.net/npm/lithent@1.14.1/tag/dist/lithentTag.umd.js
        </p>
        <p>&nbsp;</p>
        <p>## esm</p>
        <p>https://cdn.jsdelivr.net/npm/lithent@1.14.1/dist/lithent.mjs</p>
        <p>
          https://cdn.jsdelivr.net/npm/lithent@1.14.1/helper/dist/lithentHelper.mjs
        </p>
        <p>
          https://cdn.jsdelivr.net/npm/lithent@1.14.1/ftags/dist/lithentFTags.mjs
        </p>
        <p>
          https://cdn.jsdelivr.net/npm/lithent@1.14.1/tag/dist/lithentTag.mjs
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
            <div
              class="font-normal"
              innerHTML={exCode9}
              style={{ whiteSpace: 'pre' }}
            />
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
            Setting JSX - Typescript (jsx-runtime is not supported yet.)
          </h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode3}
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
          <h3 class="text-slate-50 text-lg mb-2 mt-8">UMD WITH FTAGS</h3>
          <div class="px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-black">
            <div
              class="font-normal"
              innerHTML={exCode10}
              style={{ whiteSpace: 'pre' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
