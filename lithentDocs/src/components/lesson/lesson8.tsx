import { h, mount, render, ref, mountCallback } from 'lithent';
import { state } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, mount, render, ref } from 'lithent';
import { state } from 'lithent/helper';

/*
<div id="root">
  <button>increase</button>
</div>
*/

const Component = mount<{ apiRef: { value: null | (() => void) } }>(
  (r, { apiRef }) => {
    const count = state<number>(0, r);
    const elementRef = ref<null | HTMLElement>(null);

    apiRef.value = () => {
      count.v += 1;
      elementRef.value.style.border = '1px solid red';
    };

    return () => <strong ref={elementRef}>Component: {count.v}</strong>;
  }
);

const apiRef = ref<null | (() => void)>(null);
const element = document.getElementById('root');

element.querySelector('button').addEventListener('click', apiRef.value);

render(<Component apiRef={apiRef} />, element);
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Component = mount<{ apiRef: { value: null | (() => void) } }>(
  (r, { apiRef }) => {
    const count = state<number>(0, r);
    const elementRef = ref<null | HTMLElement>(null);
    apiRef.value = () => {
      count.v += 1;
      (elementRef.value as HTMLElement).style.border = '1px solid red';
    };

    return () => <strong ref={elementRef}>Component: {count.v}</strong>;
  }
);

export const Lesson8 = mount(() => {
  const htmlRef = ref<null | HTMLElement>(null);
  const apiRef = ref<null | (() => void)>(null);

  mountCallback(() => {
    const element = htmlRef.value as HTMLElement;
    if (element) {
      render(<Component apiRef={apiRef} />, element);

      element.querySelector('button')?.addEventListener('click', () => {
        if (apiRef.value) {
          apiRef.value();
        }
      });
    }
  });

  return () => (
    <div class="p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">Lesson 8 - ref</h3>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        A "ref" is simply an object with a "value" property. As shown in the
        example, a "ref" allows you to change the internal state of the root
        component from outside the root component.
      </p>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        Or Alternatively, you can use it as a way to access the actual DOM drawn
        by the virtual DOM, like the elementRef in the example.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div ref={htmlRef}>
          <button class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800">
            increase
          </button>
        </div>
      </div>
    </div>
  );
});
