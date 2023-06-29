import { h, mount, render, ref, mountCallback } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, render, mount } from 'lithent';

/*
<div>
  <button id="remove-button">Destroy Component</button>
</div>
*/

const Component = mount(() => () => <strong>Component</strong>);
const destroy = render(<Component />, element, element.querySelector('button'));

document.getElementById('remove-button').addEventListener('click', destroy);
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Component = mount(() => () => <strong>Component</strong>);

export const Lesson5 = mount(() => {
  const htmlRef = ref<null | HTMLElement>(null);
  const buttenRef = ref<null | HTMLElement>(null);

  mountCallback(() => {
    let destroy: undefined | (() => void);
    const element = htmlRef.value as HTMLElement;
    if (element) {
      destroy = render(
        <Component />,
        element,
        element.querySelector('button') as HTMLElement
      );
    }
    buttenRef.value?.addEventListener('click', () => {
      destroy && destroy();
    });
  });

  return () => (
    <div class="p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Lesson 5 - Root Destroy
      </h3>
      <p class="mt-2 text-sm md:text-base text-gray-400">
        The value returned by the render function is the destroy function. When
        executed, it is unmounted and removed from the DOM.
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
          <button
            ref={buttenRef}
            class="ml-2 text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
          >
            Destroy Component
          </button>
        </div>
      </div>
    </div>
  );
});
