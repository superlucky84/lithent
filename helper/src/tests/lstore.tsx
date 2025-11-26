import { h, render, lmount, mount, Fragment, ref, nextTick } from 'lithent';
import { lstore } from '@/index';

const testChangeRef1 = ref<null | (() => void)>(null);
const testChangeRef2 = ref<null | (() => void)>(null);
const testChangeRef3 = ref<null | (() => void)>(null);
const testChangeRef4 = ref<null | (() => void)>(null);

const countStore = lstore<{
  count1: number;
  count2: number;
  count3: number;
}>({
  count1: 0,
  count2: 0,
  count3: 0,
});

// Test 1: useStore with lmount (auto useRenew)
const ComponentWithUseStore = lmount(() => {
  const store = countStore.useStore(store => [store.count1, store.count3]);

  const changeCount1 = () => {
    store.count1 += 1;
  };

  const changeCount2 = () => {
    store.count2 += 1;
  };

  const changeCount3 = () => {
    store.count3 += 1;
  };

  testChangeRef1.value = changeCount1;
  testChangeRef2.value = changeCount2;
  testChangeRef3.value = changeCount3;

  return () => (
    <Fragment>
      <button id="btn1" type="button" onClick={changeCount1}>
        count1: {store.count1}
      </button>
      <button id="btn2" type="button" onClick={changeCount2}>
        count2: {store.count2}
      </button>
      <button id="btn3" type="button" onClick={changeCount3}>
        count3: {store.count3}
      </button>
    </Fragment>
  );
});

// Test 2: watch with mount (manual renew)
const ComponentWithWatch = mount(renew => {
  const store = countStore.watch(renew, store => [store.count1]);

  const changeCount1 = () => {
    store.count1 += 1;
  };

  testChangeRef4.value = changeCount1;

  return () => (
    <div id="watch-test">
      <span>count1: {store.count1}</span>
    </div>
  );
});

// Test 3: watch without renew (no subscription, just get current value)
const ComponentWithoutSubscription = lmount(() => {
  const store = countStore.watch(); // No subscription!

  return () => (
    <div id="no-subscription">
      <span>count1: {store.count1}</span>
    </div>
  );
});

// Test 4: useStore without observer (full subscription)
const testChangeRef5 = ref<null | (() => void)>(null);
const ComponentWithFullSubscription = lmount(() => {
  const store = countStore.useStore(); // Full subscription, no observer

  const changeCount2 = () => {
    store.count2 += 1;
  };

  testChangeRef5.value = changeCount2;

  return () => (
    <div id="full-subscription">
      <span>count2: {store.count2}</span>
    </div>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(
  <Fragment>
    <ComponentWithUseStore />
    <ComponentWithWatch />
    <ComponentWithoutSubscription />
    <ComponentWithFullSubscription />
  </Fragment>,
  testWrap
);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('lstore.useStore should work with lmount (auto useRenew)', () => {
    expect(testWrap.innerHTML).toContain('count1: 0');
    expect(testWrap.innerHTML).toContain('count2: 0');
    expect(testWrap.innerHTML).toContain('count3: 0');
  });

  it('lstore observer should not trigger on unobserved properties', async () => {
    if (testChangeRef2.value) {
      testChangeRef2.value();
      testChangeRef2.value();
    }
    await nextTick();
    // count2 is not in observer array, so component shouldn't re-render
    // but the actual store value has changed to 2
    expect(testWrap.querySelector('#btn2')?.textContent).toBe('count2: 0');
  });

  it('lstore observer should trigger on observed properties', async () => {
    if (testChangeRef1.value) {
      testChangeRef1.value();
      testChangeRef1.value();
      testChangeRef1.value();
    }
    await nextTick();
    // count1 is in observer array, so component should re-render
    expect(testWrap.querySelector('#btn1')?.textContent).toBe('count1: 3');
    // When component re-renders due to count1, all values are updated including count2
    expect(testWrap.querySelector('#btn2')?.textContent).toBe('count2: 2');
  });

  it('lstore.watch should work with mount (manual renew)', async () => {
    if (testChangeRef4.value) {
      testChangeRef4.value();
      testChangeRef4.value();
    }
    await nextTick();
    expect(testWrap.querySelector('#watch-test span')?.textContent).toBe(
      'count1: 5'
    );
  });

  it('lstore.watch() without renew should get current value without subscription', async () => {
    // Initially rendered with count1: 0 (before any tests ran)
    const initialValue = testWrap.querySelector(
      '#no-subscription span'
    )?.textContent;
    expect(initialValue).toBe('count1: 0');

    // Change store value via other component
    if (testChangeRef1.value) {
      testChangeRef1.value();
    }
    await nextTick();

    // Component should NOT re-render (no subscription)
    // So it still shows 0, even though actual value changed
    const afterChange = testWrap.querySelector(
      '#no-subscription span'
    )?.textContent;
    expect(afterChange).toBe('count1: 0'); // Still old value (no subscription!)
  });

  it('lstore.useStore() without observer should subscribe to all changes', async () => {
    // Initial value
    const initialValue = testWrap.querySelector(
      '#full-subscription span'
    )?.textContent;
    expect(initialValue).toBe('count2: 2'); // count2 was changed to 2 in earlier tests

    // Change count2 via this component
    if (testChangeRef5.value) {
      testChangeRef5.value();
      testChangeRef5.value();
    }
    await nextTick();

    // Component SHOULD re-render (full subscription)
    const afterChange = testWrap.querySelector(
      '#full-subscription span'
    )?.textContent;
    expect(afterChange).toBe('count2: 4'); // Updated!
  });
}
