import { h, mount, Fragment } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount } from 'lithent';

// Mounter
const Component = mount((renew, _props) => {
  let count = 0;

  const change = () => {
    count += 1;
    // Renew
    renew();
  };

  // Updater
  return () => (
    <>
      <li>count: {count}</li>
      <button onClick={change}>increase</button>
    </>
  );
});

render(<Component />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Component = mount((renew, _props) => {
  let count = 0;

  const change = () => {
    count += 1;
    renew();
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
      <span class="ml-4">count: {count}</span>
    </>
  );
});

export const Lesson1 = mount(() => {
  return () => (
    <div class="p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Lesson1 - Mounter & Updater & Renew
      </h3>
      <p class="text-base text-lg text-slate-50">Mounter</p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        Called once when the component is first drawn. Defines the component's
        state and methods.
      </p>
      <p class="mt-2 text-lg text-slate-50">Updater</p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        The definition of the template markup that is actually drawn. Called
        whenever the component's state is changed or updated.
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        An updater is a higher-order function defined within a mounter that uses
        JavaScript closures to access variables and functions in the mounter.
      </p>
      <p class="mt-2 text-lg text-slate-50">Renew</p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        renew is used when you need to update a component from a method defined
        in the mounter.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600  bg-slate-950">
        <Component />
      </div>
    </div>
  );
});
