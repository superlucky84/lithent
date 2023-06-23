import { h, mount, Fragment, mountCallback, ref } from 'lithent';

import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

const code = `import { h, Fragment, render, mount, mountCallback } from 'lithent';
const Depth2 = mount(() => {
  mountCallback(() => {
    console.log('MOUNT 2');
    return () => console.log('UNMOUNT 2');
  });

  return () => <div>depth2</div>;
});

const Depth1 = mount(() => {
  mountCallback(() => {
    console.log('MOUNT 1');
    return () => console.log('UNMOUNT 1');
  });

  return () => <Fragment> <div>depth1</div> <Depth2 /> </Fragment>;
});

const CallbackRoot = mount(renew => {
  let isShow = true;

  const toggle = () => {
    isShow = !isShow;
    console.log(isShow);
    renew();
  };

  return () => <Fragment><button onClick={toggle}>TOGGLE</button>{isShow ? <Depth1 /> : null}</Fragment>;
});

render(<CallbackRoot />, document.getElementById('root'));
`;

const exCode1 = hljs.highlight(code, {
  language: 'javascript',
}).value;

const Depth2 = mount<{ logEl: { value: HTMLElement | null } }>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    ele.innerHTML += 'mount 2<br>';
    ele.scrollTo(0, ele.scrollHeight);
    return () => {
      const ele = props.logEl.value as HTMLElement;
      ele.innerHTML += 'unmount 2<br>';
      ele.scrollTo(0, ele.scrollHeight);
    };
  });

  return () => (
    <Fragment>
      <span>depth2</span>
    </Fragment>
  );
});

const Depth1 = mount<{ logEl: { value: HTMLElement | null } }>((_r, props) => {
  mountCallback(() => {
    const ele = props.logEl.value as HTMLElement;
    ele.innerHTML += 'mount 1<br>';
    ele.scrollTo(0, ele.scrollHeight);
    return () => {
      const ele = props.logEl.value as HTMLElement;
      ele.innerHTML += 'unmount 1<br>';
      ele.scrollTo(0, ele.scrollHeight);
    };
  });

  return () => (
    <Fragment>
      <span>depth1</span>
      <Depth2 logEl={props.logEl} />
    </Fragment>
  );
});

const CallbackRoot = mount(renew => {
  let isShow = true;
  let logEl = ref(null);

  const toggle = () => {
    isShow = !isShow;
    renew();
  };

  return () => (
    <Fragment>
      <div ref={logEl} class="text-sm overflow-y-scroll h-24"></div>
      <button
        class="ml-2 text-white bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-1 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-primary-800"
        onClick={toggle}
      >
        TOGGLE
      </button>
      {isShow ? <Depth1 logEl={logEl} /> : null}
    </Fragment>
  );
});

export const Example14 = mount(() => {
  return () => (
    <div class="flex flex-col p-4 mb-2  border border-gray-200 rounded-lg shadow-sm 2xl:col-span-1 border-gray-700 sm:p-6 bg-gray-800">
      <h3 class="text-slate-50 text-lg md:text-2xl mb-2">
        Example 14 - Nested Unmount
      </h3>
      <p class="text-sm md:text-base text-gray-400 mb-2">
        Test that the unmount callback works with nested components.
      </p>
      <div class="mt-4 px-2 py-2 overflow-x-auto text-sm text-gray-50 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <div
          class="font-normal"
          innerHTML={exCode1}
          style={{ whiteSpace: 'pre' }}
        />
      </div>
      <div class="flex-auto px-2 py-2 text-gray-400 border border-gray-200 border-dashed rounded border-gray-600 bg-slate-950">
        <CallbackRoot />
      </div>
    </div>
  );
});
