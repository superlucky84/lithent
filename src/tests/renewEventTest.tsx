// example.jsx
import { h, Fragment, render, Renew, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);
const testChangeRef2 = ref<null | (() => void)>(null);

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

  const change2 = () => {
    count1 += 1;
    count2 += 9;
    count3 += 9;
    count4 -= 9;
    renew();
  };
  testChangeRef.value = change;
  testChangeRef2.value = change2;

  return () => (
    <Fragment>
      <li>count1: {count1}</li>
      <li>count2: {count2}</li>
      <li>count3: {count3}</li>
      <li>count4: {count4}</li>
      <button ref={el} onClick={count1 % 2 === 0 ? change : change2}>
        change
      </button>
      <button disabled={count1 % 2 === 0}>change</button>
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Renew />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('In some cases, if another event is caught, the previous event should be canceled and work fine.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><li>count1: 0</li><li>count2: 0</li><li>count3: 0</li><li>count4: 0</li><button>change</button><button disabled="">change</button></div>'
    );
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><li>count1: 1</li><li>count2: 2</li><li>count3: 3</li><li>count4: -1</li><button>change</button><button>change</button></div>'
      );
      if (testChangeRef2.value) {
        testChangeRef2.value();
      }
      nextTick().then(() => {
        expect(testWrap.outerHTML).toBe(
          '<div><li>count1: 2</li><li>count2: 11</li><li>count3: 12</li><li>count4: -10</li><button>change</button><button disabled="">change</button></div>'
        );
      });
    });
  });
}
