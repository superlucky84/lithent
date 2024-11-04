import { h, render, mount, Fragment, ref, nextTick } from 'lithent';
import { store } from '@/index';

const testChangeRef1 = ref<null | (() => void)>(null);
const testChangeRef2 = ref<null | (() => void)>(null);
const testChangeRef3 = ref<null | (() => void)>(null);

const assignShardStore = store<{
  count1: number;
  count2: number;
  count3: number;
}>({
  count1: 0,
  count2: 0,
  count3: 0,
});

const Component = mount(renew => {
  const shardStore = assignShardStore(renew, store => [
    store.count1,
    store.count3,
  ]);

  const changeCount1 = () => {
    shardStore.count1 += 1;
  };

  const changeCount2 = () => {
    shardStore.count2 += 1;
  };

  const changeCount3 = () => {
    shardStore.count3 += 1;
  };

  testChangeRef1.value = changeCount1;
  testChangeRef2.value = changeCount2;
  testChangeRef3.value = changeCount3;

  return () => (
    <Fragment>
      <button type="button" onClick={changeCount1}>
        count1: {shardStore.count1}
      </button>
      <button type="button" onClick={changeCount2}>
        count2: {shardStore.count2}
      </button>
      <button type="button" onClick={changeCount3}>
        count3: {shardStore.count3}
      </button>
    </Fragment>
  );
});

document.body.innerHTML = `<div id="root"><span>1</span><span>2</span><span>3</span></div>`;
const testbad = document.createElement('div');
testbad.id = 'root';

testbad.innerHTML = '<span>1</span><span>2</span><span>3</span>';

const testWrap =
  (document.getElementById('root') as HTMLElement) ||
  document.createElement('div');

render(
  <Component />,
  testWrap,
  testWrap.querySelector('span:nth-of-type(2)') as HTMLElement
);

render(
  <Component />,
  testWrap,
  testWrap.querySelector('span:nth-of-type(3)') as HTMLElement
);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('If the observer function is specified when assigning from helper/store, only the specified value can be retrieved.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div id="root"><span>1</span><button type="button">count1: 0</button><button type="button">count2: </button><button type="button">count3: 0</button><span>2</span><button type="button">count1: 0</button><button type="button">count2: </button><button type="button">count3: 0</button><span>3</span></div>'
    );
  });

  it('If you define an observer function to get a value from store, you must also restrict updates to the value.', () => {
    if (testChangeRef1.value && testChangeRef2.value && testChangeRef3.value) {
      testChangeRef1.value();
      testChangeRef2.value();
      testChangeRef3.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div id="root"><span>1</span><button type="button">count1: 1</button><button type="button">count2: </button><button type="button">count3: 1</button><span>2</span><button type="button">count1: 1</button><button type="button">count2: </button><button type="button">count3: 1</button><span>3</span></div>'
      );
    });
  });
}
