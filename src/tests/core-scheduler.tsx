// example.jsx
import type { Renew } from '@/index';
import { h, Fragment, render, mount, ref, updateCallback } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

const Renew = mount((renew, _props) => {
  let count1 = 0;
  const el = ref<null | HTMLElement>(null);

  const change = () => {
    count1 += 1;
    renew();
  };
  testChangeRef.value = change;
  updateCallback(() => {
    console.log('UPDATE');
    return () => {
      console.log('UPDATED');
    };
  });

  return () => (
    <Fragment>
      <li>count1: {count1}</li>
      <button ref={el} onClick={change}>
        change
      </button>
      <Child />
      <button disabled={count1 % 2 === 0}>change</button>
    </Fragment>
  );
});

const Child = mount((_renew, _props) => {
  return () => <div>child</div>;
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Renew />, testWrap);

if (import.meta.vitest) {
}
