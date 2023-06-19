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

/* store
const storeGroup = new Map<string | symbol, unknown>();
const storeRenderList: {[key: string | symbol]: (() => boolean)[];} = {};

export const store = <T extends {}>(value: T) => {
  const storeKey = Symbol();
  storeGroup.set(storeKey, value);

  return (renew: () => boolean) => {
    storeRenderList[storeKey] ??= [];
    storeRenderList[storeKey].push(renew);

    return updater<T>(storeKey);
  };
};

const updater = <T extends { [key: string | symbol]: unknown }>(
  storeKey: string | symbol
) =>
  new Proxy(storeGroup.get(storeKey) as T, {
    get(target: T, prop: string) {
      return target[prop];
    },
    set(target, prop: keyof T, value) {
      target[prop] = value;
      const renderList = storeRenderList[storeKey];
      const trashCollections: (() => boolean)[] = [];

      renderList.forEach(renew => {
        if (!renew()) {
          trashCollections.push(renew);
        }
      });

      trashCollections.forEach(deleteTarget =>
        renderList.splice(renderList.indexOf(deleteTarget), 1)
      );

      return true;
    },
  });
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

export const Example3 = mount(() => {
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
    <div class="p-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 3 - helper (store)
      </h3>
      <p class="text-sm md:text-base text-gray-400">
        Computed helps you use precomputed values directly in the updater.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600 bg-slate-950">
        <div ref={htmlRef}>
          <span class="p-2">1</span>
          <span class="p-2">2</span>
          <span class="p-2">3</span>
        </div>
      </div>
    </div>
  );
});
