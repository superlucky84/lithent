import { h, mount, Fragment, mountCallback, ref } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount, mountCallback } from 'lithent';

const Children = mount(
  (_r, props) => {
    mountCallback(() => {
      console.log('mounted');

      return () => {
        console.log('unmount');
      };
    });
    return () => <span>Children</span>;
  }
);

const Parent = mount(renew => {
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <button onClick={change}>Toggle</button>
      {count % 2 === 0 ? <Children count={count} logEl={logEl} /> : null}
    </>
  );
});

render(<Parent />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Children = mount<{ logEl: { value: HTMLElement | null } }>(
  (_r, props) => {
    mountCallback(() => {
      const ele = props.logEl.value as HTMLElement;
      ele.innerHTML += 'mounted<br>';
      ele.scrollTo(0, ele.scrollHeight);

      return () => {
        const ele = props.logEl.value as HTMLElement;
        ele.innerHTML += 'mounte<br>';
        ele.scrollTo(0, ele.scrollHeight);
      };
    });
    return () => <span>Children</span>;
  }
);

const Parent = mount(renew => {
  let logEl = ref(null);
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <div ref={logEl} class="text-sm overflow-y-scroll h-12"></div>
      <button
        onClick={change}
        type="button"
        class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
      >
        Toggle
      </button>
      {count % 2 === 0 ? <Children logEl={logEl} /> : null}
    </>
  );
});

export const Lesson3 = mount(() => {
  return () => (
    <div class="p-2 mb-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        EX 3 - mountCallback
      </h3>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <p class="text-base text-slate-50">mountCallback</p>
        <p class="mt-2 text-sm text-gray-400">
          The "mountcallback" runs after the component is created in the actual
          dom.
        </p>
        <p class="mt-2 text-sm text-gray-400">
          The function returned by "mountCallback" is executed on unmount.
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
        <Parent />
      </div>
    </div>
  );
});
