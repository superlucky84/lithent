import { h, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, mount } from 'lithent';
import { state } from 'lithent/helper';
const Checkbox = mount(r => {
  const text = state<Set<string>>(new Set(['sara']), r);

  const handleInput = (event: InputEvent) => {
    text.v.add((event.target as HTMLInputElement).value);
  };

  return () => (
    <>
      <input
        type="checkbox"
        name="checkname"
        onChange={handleInput}
        value="john"
        checked={text.v.has('john')}
      />{' '}
      John
      <input
        type="checkbox"
        name="checkname"
        onChange={handleInput}
        value="sara"
        checked={text.v.has('sara')}
      />{' '}
      Sara
      <input
        type="checkbox"
        name="checkname"
        onChange={handleInput}
        value="tom"
        checked={text.v.has('tom')}
      />{' '}
      Tom
    </>
  );
});
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Checkbox = mount(r => {
  const text = state<Set<string>>(new Set(['sara']), r);

  const handleInput = (event: InputEvent) => {
    text.v.add((event.target as HTMLInputElement).value);
  };

  return () => (
    <>
      <input
        type="checkbox"
        name="checkname"
        onChange={handleInput}
        value="john"
        checked={text.v.has('john')}
      />{' '}
      John
      <input
        type="checkbox"
        name="checkname"
        onChange={handleInput}
        value="sara"
        checked={text.v.has('sara')}
      />{' '}
      Sara
      <input
        type="checkbox"
        name="checkname"
        onChange={handleInput}
        value="tom"
        checked={text.v.has('tom')}
      />{' '}
      Tom
    </>
  );
});

export const Example10 = mount(() => {
  return () => (
    <div class="p-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 10 - Checkbox
      </h3>
      <p class="text-sm md:text-base text-gray-400">
        Test that the "Checkbox" control is working properly.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <Checkbox />
      </div>
    </div>
  );
});