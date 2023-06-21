import { h, mount, render, ref, mountCallback } from 'lithent';
import { store } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount } from 'lithent';
import { store } from 'lithent/helper';

/*
<div>
  <span>1</span>
  <span>2</span>
  <span>3</span>
</div>
*/

const assignShardStore = store<{ text: string; count: number }>({ text: 'sharedText' });

const Component = mount(r => {
  const shardStore = assignShardStore(r);
  const changeInput = (event) => {
    shardStore.text = event.target.value;
  };
  return () => <textarea type="text" onInput={changeInput} value={shardStore.text} />;
});

render(<Component />, element, element.querySelector('span:nth-of-type(2)'));
render(<Component />, element, element.querySelector('span:nth-of-type(3)'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const assignShardStore = store<{ text: string; count: number }>({
  text: 'sharedText',
  count: 3,
});

const Component = mount(renew => {
  const shardStore = assignShardStore(renew);
  const changeInput = (event: InputEvent) => {
    shardStore.text = (event.target as HTMLInputElement).value;
  };
  return () => (
    <textarea
      type="text"
      onInput={changeInput}
      value={shardStore.text}
      style={{ width: '100px', height: '100px' }}
    />
  );
});

export const Example2 = mount(() => {
  const htmlRef = ref<null | HTMLElement>(null);

  mountCallback(() => {
    const element = htmlRef.value as HTMLElement;
    if (element) {
      render(
        <Component />,
        element,
        element.querySelector('span:nth-of-type(2)') as HTMLElement
      );

      render(
        <Component />,
        element,
        element.querySelector('span:nth-of-type(3)') as HTMLElement
      );
    }
  });

  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 2 - helper (store)
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
        "store" is a helper for creating objects that share values.&nbsp;
      </p>
      <p class="text-sm md:text-base text-gray-400">
        Once again, the helper's functionality is just an example, and you can
        use it to improve your implementation.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="flex-auto px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div ref={htmlRef}>
          <span class="p-2">1</span>
          <span class="p-2">2</span>
          <span class="p-2">3</span>
        </div>
      </div>
    </div>
  );
});
