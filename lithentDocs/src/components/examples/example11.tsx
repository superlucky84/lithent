import { h, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, mount } from 'lithent';
import { state } from 'lithent/helper';
const Radio = mount(r => {
  const text = state<string>('sara', r);

  const handleInput = (event: InputEvent) => {
    text.v = (event.target as HTMLInputElement).value;
  };

  return () => (
    <>
      <input
        type="radio"
        name="checkname"
        onChange={handleInput}
        value="john"
        checked={text.v === 'john'}
      />{' '}
      John
      <input
        type="radio"
        name="checkname"
        onChange={handleInput}
        value="sara"
        checked={text.v === 'sara'}
      />{' '}
      Sara
      <input
        type="radio"
        name="checkname"
        onChange={handleInput}
        value="tom"
        checked={text.v === 'tom'}
      />{' '}
      Tom
    </>
  );
});
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Radio = mount(r => {
  const text = state<string>('sara', r);

  const handleInput = (event: InputEvent) => {
    text.v = (event.target as HTMLInputElement).value;
  };

  return () => (
    <>
      <input
        type="radio"
        name="checkname"
        onChange={handleInput}
        value="john"
        checked={text.v === 'john'}
      />{' '}
      John
      <input
        type="radio"
        name="checkname"
        onChange={handleInput}
        value="sara"
        checked={text.v === 'sara'}
      />{' '}
      Sara
      <input
        type="radio"
        name="checkname"
        onChange={handleInput}
        value="tom"
        checked={text.v === 'tom'}
      />{' '}
      Tom
    </>
  );
});

export const Example11 = mount(() => {
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">Example 11 - Radio</h3>
      <p class="text-sm md:text-base text-gray-400">
        Test that the "Radio" control is working properly.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="flex-auto px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <Radio />
      </div>
    </div>
  );
});
