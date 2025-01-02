import { mount, mountCallback, ref, portal } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, render, mount, portal } from 'lithent';

const Children = mount<{ count: number }>(() => {
  return ({ count }) => <span>child updated count: {count}</span>;
});

const Parent = mount(renew => {
  let portalEl = ref(null);
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  // In our example, specifically, portalEl.value was not present the first time it was rendered, so re-render
  mountCallback(() => {
    renew();
  });

  return () => (
    <>
      <div ref={portalEl} />
      <button onClick={change}>Update</button>
      {portalEl.value && portal( <Children count={count} logEl={logEl} />, portalEl.value as HTMLElement)}
    </>
  );
});

render(<Parent />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Children = mount<{
  count: number;
  logEl: { value: HTMLElement | null };
}>(() => {
  return ({ count }) => <span>child updated count: {count}</span>;
});

const Parent = mount(renew => {
  let logEl = ref(null);
  let portalEl = ref(null);
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  mountCallback(() => {
    renew();
  });

  return () => (
    <>
      <div ref={portalEl} />
      <button
        onClick={change}
        type="button"
        class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
      >
        Update
      </button>
      {portalEl.value &&
        portal(
          <Children count={count} logEl={logEl} />,
          portalEl.value as HTMLElement
        )}
    </>
  );
});
export const Lesson9 = mount(() => {
  return () => (
    <div class="p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">Lesson 9 - portal</h3>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        "portal" lets you render some children into a different part of the DOM.
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        In the example below, a child component defined after the parent
        component button will navigate to the portal before the parent
        component.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <Parent />
      </div>
    </div>
  );
});
