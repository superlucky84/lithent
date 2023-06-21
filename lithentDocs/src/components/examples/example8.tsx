import { h, mount, Fragment } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, mount, Fragment } from 'lithent';
const Selectbox = mount(renew => {
  let value = '3';

  const changeChange = (event: InputEvent) => {
    value = (event.target as HTMLInputElement).value;
    renew();
  };

  return () => (
    <Fragment>
      <div>{value}</div>
      <div>
        <select onChange={changeChange}>
          <option value="1" selected={value === '1'}> 1 </option>
          <option value="2" selected={value === '2'}> 2 </option>
          <option value="3" selected={value === '3'}> 3 </option>
          <option value="4" selected={value === '4'}> 4 </option>
          <option value="5" selected={value === '5'}> 5 </option>
        </select>
      </div>
    </Fragment>
  );
});
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Selectbox = mount(renew => {
  let value = '3';

  const changeChange = (event: InputEvent) => {
    value = (event.target as HTMLInputElement).value;
    renew();
  };

  return () => (
    <Fragment>
      <div>{value}</div>
      <div>
        <select onChange={changeChange}>
          <option value="1" selected={value === '1'}>
            1
          </option>
          <option value="2" selected={value === '2'}>
            2
          </option>
          <option value="3" selected={value === '3'}>
            3
          </option>
          <option value="4" selected={value === '4'}>
            4
          </option>
          <option value="5" selected={value === '5'}>
            5
          </option>
        </select>
      </div>
    </Fragment>
  );
});

export const Example8 = mount(() => {
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 8 - Selectbox
      </h3>
      <p class="text-sm md:text-base text-gray-400">
        Test that the "Selectbox" control is working properly.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="flex-auto px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <Selectbox />
      </div>
    </div>
  );
});
