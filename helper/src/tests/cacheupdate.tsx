import {
  h,
  Fragment,
  render,
  mount,
  ref,
  nextTick,
  updateCallback,
} from 'lithent';

import { cacheUpdate } from '@/index';

const testChange1Ref = ref<null | (() => void)>(null);
const testChange2Ref = ref<null | (() => void)>(null);

const Depth1 = mount<{ count1: number; count2: number }>(() => {
  updateCallback(() => {
    console.log('udpate');

    return () => {
      console.log('updated');
    };
  });
  return ({ count1, count2 }) => (
    <Fragment>
      <span>
        depth1: {count1} - {count2}
      </span>{' '}
    </Fragment>
  );
});

const Root = mount(renew => {
  let count1 = 0;
  let count2 = 0;

  const insCount1 = () => {
    count1 += 1;
    renew();
  };
  const insCount2 = () => {
    count2 += 1;
    renew();
  };

  testChange1Ref.value = () => {
    insCount1();
  };

  testChange2Ref.value = () => {
    insCount2();
  };

  return cacheUpdate(
    () => [count1],
    () => (
      <Fragment>
        <button onClick={insCount1}>insCount1</button>
        <button onClick={insCount2}>insCount2</button>
        <Depth1 count1={count1} count2={count2} />
      </Fragment>
    )
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Root />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('Default value rendering normal.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><button>insCount1</button><button>insCount2</button><span>depth1: 0 - 0</span> </div>'
    );
  });
  it('If the cache check function is true, the rendered result should be the same as before, even if the state changes.', () => {
    if (testChange2Ref.value) {
      testChange2Ref.value();
      testChange2Ref.value();
      testChange2Ref.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button>insCount1</button><button>insCount2</button><span>depth1: 0 - 0</span> </div>'
      );
    });
  });
  it('test33333.', () => {
    if (testChange1Ref.value) {
      testChange1Ref.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button>insCount1</button><button>insCount2</button><span>depth1: 1 - 3</span> </div>'
      );
    });
  });
}
