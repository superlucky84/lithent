import { h, Fragment, render, mount, ref, nextTick } from 'lithent';

import { effect } from '@/index';

let injectLogCount = 0;
let clenupLogCount = 0;
const testChangeRef = ref<null | (() => void)>(null);
const testChangeUnmountRef = ref<null | (() => void)>(null);

const Children = mount(renew => {
  let count = 0;
  const change = () => {
    count += 1;
    renew();
  };
  testChangeRef.value = change;

  effect(
    () => {
      console.log('INJECT');
      injectLogCount += 1;
    },
    () => {
      console.log('CLEAN UP');
      clenupLogCount += 1;
    },
    () => [count]
  );

  return () => (
    <>
      <button onClick={change} type="button">
        increase
      </button>
      <span>count: {count}</span>
    </>
  );
});

const Parent = mount(renew => {
  let mountState = true;
  const toggleMount = () => {
    mountState = !mountState;
    renew();
  };
  testChangeUnmountRef.value = toggleMount;

  return () => (
    <>
      <button onClick={toggleMount} type="button">
        toggleMount
      </button>
      {mountState ? <Children /> : null}
    </>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Parent />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('Once mounted, only the inect value should be incremented by 1, and it will have the expected DOM state.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><button type="button">toggleMount</button><button type="button">increase</button><span>count: 0</span></div>'
    );
    expect(injectLogCount).toBe(1);
    expect(clenupLogCount).toBe(0);
  });

  it('When unmounted, clean up should be incremented by 1 and the inect value should remain unchanged.', () => {
    if (testChangeUnmountRef.value) {
      testChangeUnmountRef.value();
    }
    nextTick().then(() => {
      expect(injectLogCount).toBe(1);
      expect(clenupLogCount).toBe(1);
      expect(testWrap.outerHTML).toBe(
        '<div><button type="button">toggleMount</button></div>'
      );
    });
  });

  it('When I remount, only the INJECT value goes up by 1, and the DOM is visible again where it had disappeared.', () => {
    if (testChangeUnmountRef.value) {
      testChangeUnmountRef.value();
    }
    nextTick().then(() => {
      expect(clenupLogCount).toBe(1);
      expect(injectLogCount).toBe(2);
      expect(testWrap.outerHTML).toBe(
        '<div><button type="button">toggleMount</button><button type="button">increase</button><span>count: 0</span></div>'
      );
    });
  });

  it('When updated, CLEAN UP and INJECT are incremented by 1 each, and the count in the DOM is also incremented by 1.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(clenupLogCount).toBe(2);
      expect(injectLogCount).toBe(3);
      expect(testWrap.outerHTML).toBe(
        '<div><button type="button">toggleMount</button><button type="button">increase</button><span>count: 1</span></div>'
      );
    });
  });
}
