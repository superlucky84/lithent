import { h, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount } from 'lithent';
// import { state } from 'lithent/helper';

// This is what the above commented out module looks like.
const state = <T>(value: T, renew: () => boolean): { value: T } => {
  let result = value;

  return {
    get value() {
      return result;
    },
    set value(newValue: T) {
      result = newValue;
      renew();
    },
  };
};

// Mounter
const Component = mount((renew, _props) => {
  const count = state<number>(0, renew);

  const change = () => {
    count.value += 1;
  };

  // Updater
  return () => (
    <>
      <li>count: {count.value}</li>
      <button onClick={change}>increase</button>
    </>
  );
});

render(<Component />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Component = mount((r, _props) => {
  const count = state<number>(0, r);

  const change = () => {
    count.value += 1;
  };

  return () => (
    <>
      <button
        type="button"
        onClick={change}
        class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
      >
        increase
      </button>
      <span class="ml-4">count: {count.value}</span>
    </>
  );
});

export const Lesson3 = mount(() => {
  return () => (
    <div class="p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Lesson 3 - helper (state)
      </h3>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        The "state" function defined in the example code delegates a value and a
        "renew" function from the component and then executes it whenever the
        value changes.
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        Users can implement and use several forms of helpers themselves by
        utilizing the "renew" function.
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        The state function used in the example is pre-implemented in
        'lithent/helper', so you can just pull it out and use it to and use it.
        But it's just an example.
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        In addition to "state", we've implemented helper codes like "store",
        "computed", and "effect" in "lithent/helper", and their usage is
        described on the{' '}
        <a class="text-orange-200" href="#examples">
          examples
        </a>{' '}
        page.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <Component />
      </div>
    </div>
  );
});
