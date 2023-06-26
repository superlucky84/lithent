// example.jsx
import {
  h,
  Fragment,
  render,
  Renew,
  mount,
  ref,
  mountCallback,
  nextTick,
} from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

const Renew = mount((renew, _props) => {
  let count1 = 0;
  let count2 = 0;
  let count3 = 0;
  let count4 = 0;
  const el = ref<null | HTMLElement>(null);

  const change = () => {
    count1 += 1;
    count2 += 2;
    count3 += 3;
    count4 -= 1;
    renew();
  };
  testChangeRef.value = change;

  mountCallback(() => {
    // console.log(el.value);
    console.log(document.querySelector('button'));
  });

  return () => (
    <Fragment>
      <li>count1: {count1}</li>
      <li>count2: {count2}</li>
      <li>count3: {count3}</li>
      <li>count4: {count4}</li>
      <button ref={el} onClick={change}>
        change
      </button>
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Renew />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('add', () => {
    // @ts-ignore
    console.log(testWrap.outerHTML, document.querySelector('button').outerHTML);
    expect(true).toBe(true);
    if (testChangeRef.value) {
      testChangeRef.value();
      console.log('click');
    }
    nextTick().then(() => {
      console.log(testWrap.outerHTML, testWrap.querySelector('button'));
    });
  });
}
