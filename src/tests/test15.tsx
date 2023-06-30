import { h, Fragment, render, mount, ref, nextTick } from '@/index';

const testChangeRef = ref<null | (() => void)>(null);

const Depth2 = mount<{ count: number }>(() => ({ count }) => (
  <Fragment>
    <span>depth2: {count}</span>
  </Fragment>
));

const Depth1 = mount<{ count: number }>(() => ({ count }) => (
  <Fragment>
    <span>depth1: {count}</span> <Depth2 count={count} />
  </Fragment>
));

const Root = mount(renew => {
  let count = 0;

  const toggle = () => {
    count += 1;
    renew();
  };
  testChangeRef.value = () => {
    toggle();
  };

  return () => (
    <Fragment>
      <button onClick={toggle}>increase</button>
      <Depth1 count={count} />
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Root />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('Test that props are passed well to nested components.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><button>increase</button><span>depth1: 0</span> <span>depth2: 0</span></div>'
    );
  });
  it('If we receive a prop from a parent whose value has been incremented by 1, they will all be incremented by 1.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button>increase</button><span>depth1: 1</span> <span>depth2: 1</span></div>'
      );
    });
  });
  it('Once again, if we are passed a prop whose value has been incremented by 1 from the parent, they will all be incremented by 1.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button>increase</button><span>depth1: 2</span> <span>depth2: 2</span></div>'
      );
    });
  });
}
