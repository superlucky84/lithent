// example.jsx
import {
  h,
  Fragment,
  render,
  mount,
  ref,
  nextTick,
  mountCallback,
} from '@/index';

const testChangeRef = ref<null | (() => void)>(null);

let unmount1Count = 0;
let unmount2Count = 0;

const Depth2 = mount(() => {
  mountCallback(() => {
    console.log('MOUNT - Depth2');
    return () => {
      unmount2Count += 1;
      console.log('UNMOUNT - Depth2');
    };
  });

  return () => (
    <div>
      <div>depth2</div>
    </div>
  );
});

const Depth1 = mount(() => {
  mountCallback(() => {
    console.log('MOUNT - Depth1');
    return () => {
      unmount1Count += 1;
      console.log('UNMOUNT - Depth1');
    };
  });

  return () => (
    <Fragment>
      <div>depth1</div>
      <Depth2 />
    </Fragment>
  );
});

const TestRoot = mount(renew => {
  let isShow = true;

  const toggle = () => {
    isShow = !isShow;
    renew();
  };
  testChangeRef.value = toggle;

  return () => (
    <div>
      <button onClick={toggle}>TOGGLE</button>
      {isShow && (
        <div>
          <div>
            <Depth1 />
            <Depth1 />
          </div>
        </div>
      )}
    </div>
  );
});

const Root = <TestRoot />;

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(Root, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('All child components of the element being unmounted must have their unmount callbacks fired.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><div><button>TOGGLE</button><div><div><div>depth1</div><div><div>depth2</div></div><div>depth1</div><div><div>depth2</div></div></div></div></div></div>'
    );
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(unmount1Count).toBe(2);
      expect(unmount2Count).toBe(2);
    });
  });
}
