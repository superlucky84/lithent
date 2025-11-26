import { h, Fragment, render, mount, lmount, ref, nextTick } from 'lithent';
import { state, lstate } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);
const testChangeRef2 = ref<null | (() => void)>(null);

// Test with mount (with required renew parameter)
const ComponentWithRenew = mount(renew => {
  const count = state(0, renew); // renew is required!

  const increase = () => {
    count.value += 1;
  };

  testChangeRef2.value = increase;

  return () => (
    <>
      <button type="button" onClick={increase}>
        increase
      </button>
      <span>count: {count.v}</span>
    </>
  );
});

// Test with lmount (without renew parameter)
const Component = lmount(() => {
  const count = lstate(0); // renew is optional!

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

  it('Is state working with required renew parameter?', () => {
    const container = document.createElement('div');
    render(<ComponentWithRenew />, container);

    expect(container.outerHTML).toBe(
      '<div><button type="button">increase</button><span>count: 0</span></div>'
    );
    if (testChangeRef2.value) {
      testChangeRef2.value();
      testChangeRef2.value();
      testChangeRef2.value();
    }
    return nextTick().then(() => {
      expect(container.outerHTML).toBe(
        '<div><button type="button">increase</button><span>count: 3</span></div>'
      );
    });
  });

  it('Is lstate working without renew parameter?', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><button type="button">increase</button><span>count: 0</span></div>'
    );
    if (testChangeRef.value) {
      testChangeRef.value();
      testChangeRef.value();
      testChangeRef.value();
    }
    return nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button type="button">increase</button><span>count: 3</span></div>'
      );
    });
  });
}
