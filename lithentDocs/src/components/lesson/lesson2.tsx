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
    <div class="p-4 mb-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
      <h3 class="text-slate-50 text-lg mb-4">
        Lesson 2 - Props (Note the 'closure' approach)
      </h3>
      <div class="px-4 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <Parent />
      </div>
      <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <p class="mt-1 text-sm text-slate-200 font-normal">
          "props" 는 마운터의 두번째 인자로 받거나 업데이트의 첫번째 인자로
          받아서 사용할수 있습니다.
        </p>
        <p class="mt-1 text-sm text-slate-200 font-normal">
          하지만 업데이터는 마운터의 상태에 클로저로 접근하므로, 가져오는 값이
          "call by value"로 되어 있는 값은 업데이트된 상태를 가져오지 못한다는걸
          잊지 마십시오.
        </p>
      </div>
    </div>
  );
});
