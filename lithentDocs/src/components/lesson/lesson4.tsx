import { h, mount, Fragment, updateCallback, ref } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount, updateCallback } from 'lithent';

const Children = mount<{ count: number }>((_r, props) => {
  updateCallback(() => {
    console.log('clean up');

    return () => {
      console.log('updated');
    };
  });
  return ({ count }) => <span>child updated count: {count}</span>;
});

const Parent = mount(renew => {
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <button onClick={change}>Update</button>
      <Children count={count} />
    </>
  );
});

render(<Parent />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Children = mount<{
  count: number;
  logEl: { value: HTMLElement | null };
}>((_r, props) => {
  updateCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    ele.innerHTML += 'clean up<br>';
    ele.scrollTo(0, ele.scrollHeight);

    return () => {
      const ele = props.logEl.value as HTMLElement;
      ele.innerHTML += 'updated<br>';
      ele.scrollTo(0, ele.scrollHeight);
    };
  });
  return ({ count }) => <span>child updated count: {count}</span>;
});

const Parent = mount(renew => {
  let logEl = ref(null);
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <div ref={logEl} class="text-sm overflow-y-scroll h-12"></div>
      <button
        onClick={change}
        type="button"
        class="text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
      >
        Update
      </button>
      <Children count={count} logEl={logEl} />
    </>
  );
});

export const Lesson4 = mount(() => {
  return () => (
    <div class="p-4 mb-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
      <h3 class="text-slate-50 text-lg mb-4">Lesson 4 - updateCallback</h3>
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
        <p class="mt-2 text-lg text-slate-50">updateCallback</p>
        <p class="mt-1 text-sm text-slate-100 font-thin">
          updateCallback 은 컴포넌트에 update가 요청되어 갱신되기 전에
          실행됩니다.
        </p>
        <p class="mt-1 text-sm text-slate-100 font-thin">
          updateCallback 이 리턴하는 함수는 컴포넌트가 업데이트 된 후
          실행됩니다.
        </p>
      </div>
    </div>
  );
});
