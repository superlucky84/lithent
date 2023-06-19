import { h, mount, Fragment } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount } from 'lithent';

const Children = mount<{ count: number }>((_r, props) => {
  const { count: countFromMounter } = props;

  return ({ count: countFromUpdater }) => (
    <>
      <div>count: {props.count}</div>
      <div>count: {countFromMounter} ("call by value" not working)</div>
      <div>count: {countFromUpdater}</div>
    </>
  );
});

const Parent = mount(renew => {
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <Children count={count} />
      <button onClick={change}>Increase</button>
    </>
  );
});

render(<Parent />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Children = mount<{ count: number }>((_r, props) => {
  const { count: countFromMounter } = props;

  return ({ count: countFromUpdater }) => (
    <>
      <div>count: {props.count}</div>
      <div>count: {countFromMounter} ("call by value" not working)</div>
      <div>count: {countFromUpdater}</div>
    </>
  );
});

const Parent = mount(renew => {
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <Children count={count} />
      <button
        onClick={change}
        type="button"
        class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
      >
        Increase
      </button>
    </>
  );
});

export const Lesson2 = mount(() => {
  return () => (
    <div class="p-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">EX 2 - Props</h3>
      <p class="text-sm md:text-base text-gray-400 font-normal">
        "props" is given to the "mounter" as the second argument, and to the
        "updater" as the first argument
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400 font-normal">
        Updaters can access and use the "props" values in the mounter as
        closures, but they can make the mistake of not getting the updated state
        if the value is "call by value".
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600 bg-slate-950">
        <Parent />
      </div>
    </div>
  );
});
