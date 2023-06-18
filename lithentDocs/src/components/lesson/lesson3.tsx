import { h, mount, Fragment, mountCallback } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount } from 'lithent';

// Mounter
const Component = mount((renew, _props) => {
  let count = 0;

  const change = () => {
    count1 += 1;
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

const Children = mount<{ count: number }>(() => {
  mountCallback(() => {
    console.log('MOUNT');

    return () => {
      console.log('UNMOUNT');
    };
  });
  return () => <div>Children</div>;
});

const Parent = mount(renew => {
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <div></div>
      {count % 2 === 0 ? <Children count={count} /> : null}
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

export const Lesson3 = mount(() => {
  return () => (
    <div class="p-4 mb-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
      <h3 class="text-slate-50 text-lg mb-4">Lesson 3 - updateCallback</h3>
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
        <p class="mt-2 text-lg text-slate-50">Mounter</p>
        <p class="mt-1 text-sm text-slate-100 font-thin">
          컴포넌트가 처음 그려질때 딱 한번 호출됩니다. 여기에서 컴포넌트의 상태
          및 메서드를 세팅할 수 있습니다.
        </p>
        <p class="mt-2 text-lg text-slate-50">Updater</p>
        <p class="mt-1 text-sm text-slate-100 font-thin">
          컴포넌트의 상태가 변하여 업데이트 될때 마다 호출됩니다.
        </p>
        <p class="mt-2 text-lg text-slate-50">Renew</p>
        <p class="mt-1 text-sm text-slate-100 font-thin">
          마운터의 정의된 메서드 내에서 컴포넌트의 업데이트가 필요할때 트리거
          시킵니다.
        </p>
      </div>
    </div>
  );
});
