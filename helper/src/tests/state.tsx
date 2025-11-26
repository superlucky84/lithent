import { h, Fragment, render, lmount, ref, nextTick } from 'lithent';
import { state } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

// Test with lmount (without renew parameter)
const Component = lmount(() => {
  const count = state(0); // renew is now optional!

  const increase = () => {
    count.value += 1;
  };

  testChangeRef.value = increase;

  return () => (
    <>
      <button type="button" onClick={increase}>
        increase
      </button>
      <span>count: {count.v}</span>
    </>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Component />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('Is state working without renew parameter?', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><button type="button">increase</button><span>count: 0</span></div>'
    );
    if (testChangeRef.value) {
      testChangeRef.value();
      testChangeRef.value();
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button type="button">increase</button><span>count: 3</span></div>'
      );
    });
  });
}
