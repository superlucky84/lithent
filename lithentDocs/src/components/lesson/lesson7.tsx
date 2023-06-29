import { h, mount, Fragment, updateCallback, ref } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount, updateCallback } from 'lithent';

const Children = mount<{ count: number }>((_r, props) => {
  updateCallback(
    () => {
      console.log('clean up');

      return () => console.log('updated');
    },
    () => [props.count]
  );
  return ({ count }) => <span>child updated count: {count}</span>;
});

const Parent = mount(renew => {
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <button onClick={change}>Update</button>
      <Children count={count} />
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
}>((_r, props) => {
  updateCallback(
    () => {
      const ele = props.logEl.value as HTMLElement;
      ele.innerHTML += 'clean up<br>';
      ele.scrollTo(0, ele.scrollHeight);

      return () => {
        const ele = props.logEl.value as HTMLElement;
        ele.innerHTML += 'updated<br>';
        ele.scrollTo(0, ele.scrollHeight);
      };
    },
    () => [props.count]
  );
  return ({ count }) => <span>child updated count: {count}</span>;
});

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
        Update
      </button>
      <Children count={count} logEl={logEl} />
    </>
  );
});

export const Lesson7 = mount(() => {
  return () => (
    <div class="p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Lesson 7 - updateCallback
      </h3>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        The "updateCallback" is executed after the component is requested to
        update, but before it is updated. It is used for clean up purposes.
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        The function returned by updateCallback is executed after the component
        update is complete.
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        Defines a function as the second argument that returns an array of
        target values when an update to a specific value needs to be detected.
        If omitted, it will always be executed.
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        By combining updateCallback and mountCallback, you can create a helper
        similar to react's useEffect. Check out the{' '}
        <a class="text-orange-200" href="#examples">
          examples
        </a>{' '}
        page to see how to use the effect helper.
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
