import { h, mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount } from 'lithent';


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

const Component = mount((renew, _props) => {
  const count = state<number>(0, r);

  const change = () => count.value += 1;

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
        class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
      >
        increase
      </button>
      <span class="ml-4">count: {count.value}</span>
    </>
  );
});

export const Lesson5 = mount(() => {
  return () => (
    <div class="p-4 mb-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
      <h3 class="text-slate-50 text-lg mb-4">Lesson 5 - helper/state</h3>
      <div class="px-4 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <Component />
      </div>
      <div class="px-4 py-2 text-gray-400 border border-gray-200 border-dashed rounded dark:border-gray-600">
        <p class="mt-2 text-lg text-slate-50">헬퍼 구현</p>
        <p class="mt-1 text-sm text-slate-100 font-thin">
          예제 코드에 정의된 state 함수는 컴포넌트로 부터 renew 함수를 받아서
          값이 변경될때마다 실행시켜 줍니다.
        </p>
        <p class="mt-1 text-sm text-slate-100 font-thin">
          사용자는 renew 메서드를 활용하여 여러 가지 형태의 헬퍼를 직접 구현하여
          사용 가능합니다.
        </p>
        <p class="mt-1 text-sm text-slate-100 font-thin">
          예제에 사용된 state 함수는 'lithent/helper' 에 미리 구현되어 있어 꺼내
          쓰면 됩니다. 하지만 그것은 하나의 예시일 뿐입니다.
        </p>
        <p class="mt-1 text-sm text-slate-100 font-thin">
          store, computed, effect 등의 헬퍼 예시 코드들을 넣어 놨습니다. 더 많은
          예제는 '예제들' 페이지에서 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
});
