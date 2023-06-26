import {
  h,
  Fragment,
  render,
  mount,
  ref,
  nextTick,
  mountCallback,
} from '@/index';

let mountCount1 = 0;
let mountCount2 = 0;
let unmountCount1 = 0;
let unmountCount2 = 0;

const testChangeRef = ref<null | (() => void)>(null);

const Depth2 = mount(() => {
  mountCallback(() => {
    console.log('mount2');
    mountCount2 += 1;
    return () => {
      console.log('unmount2');
      unmountCount2 += 1;
    };
  });

  return () => (
    <Fragment>
      <span>depth2</span>
    </Fragment>
  );
});

const Depth1 = mount(() => {
  mountCallback(() => {
    console.log('mount1');
    mountCount1 += 1;
    return () => {
      console.log('unmount1');
      unmountCount1 += 1;
    };
  });

  return () => (
    <Fragment>
      <span>depth1</span>
      <Depth2 />
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
  testChangeRef.value = () => {
    toggle();
  };

  return () => (
    <Fragment>
      <button onClick={toggle}>TOGGLE</button>
      {isShow ? <Depth1 logEl={logEl} /> : null}
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<CallbackRoot />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('Test that the unmount callback works with nested components.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><button>TOGGLE</button><span>depth1</span><span>depth2</span></div>'
    );
    expect(mountCount1).toBe(1);
    expect(mountCount2).toBe(1);
    expect(unmountCount1).toBe(0);
    expect(unmountCount2).toBe(0);
  });
  it('Unmount should work fine.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe('<div><button>TOGGLE</button></div>');
      expect(mountCount1).toBe(1);
      expect(mountCount2).toBe(1);
      expect(unmountCount1).toBe(1);
      expect(unmountCount2).toBe(1);
    });
  });
  it('mount should work fine.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button>TOGGLE</button><span>depth1</span><span>depth2</span></div>'
      );
      expect(mountCount1).toBe(2);
      expect(mountCount2).toBe(2);
      expect(unmountCount1).toBe(1);
      expect(unmountCount2).toBe(1);
    });
  });
}
