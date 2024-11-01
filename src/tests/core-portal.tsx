// example.jsx
import type { Renew } from '@/index';
import { h, Fragment, render, mount, ref, portal, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

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
  testChangeRef.value = change;

  return () => (
    <Fragment>
      <li>count1: {count1}</li>
      <li>count2: {count2}</li>
      <li>count3: {count3}</li>
      <li>count4: {count4}</li>
      <button ref={el} onClick={change}>
        change
      </button>
      <button disabled={count1 % 2 === 0}>change</button>
      {portal(
        <PortalExam
          count1={count1}
          count2={count2}
          count3={count3}
          count4={count4}
        />,
        document.getElementById('bottom') as HTMLElement
      )}
    </Fragment>
  );
});

const PortalExam = mount<{
  count1: number;
  count2: number;
  count3: number;
  count4: number;
}>((_, _p) => {
  return ({ count1, count2, count3, count4 }) => (
    <Fragment>
      <div>1: {count1}</div>
      <div>2: {count2}</div>
      <div>3: {count3}</div>
      <div>4: {count4}</div>
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

const portalElement = document.createElement('div');
portalElement.id = 'bottom';
portalElement.style.cssText =
  'border: 1px solid red; position: absolute; bottom: 0; width: 300px; height: 300px;';

if (document.body) {
  document.body.appendChild(portalElement);
}

render(<Renew />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('The portal is well exposed in its initial state.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><li>count1: 0</li><li>count2: 0</li><li>count3: 0</li><li>count4: 0</li><button>change</button><button disabled="">change</button></div>'
    );
    expect(portalElement.outerHTML).toBe(
      '<div id="bottom" style="border: 1px solid red; position: absolute; bottom: 0px; width: 300px; height: 300px;"><div>1: 0</div><div>2: 0</div><div>3: 0</div><div>4: 0</div></div>'
    );
  });

  it('The updated status is also reflected well in the portal.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
      testChangeRef.value();
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><li>count1: 3</li><li>count2: 6</li><li>count3: 9</li><li>count4: -3</li><button>change</button><button>change</button></div>'
      );

      expect(portalElement.outerHTML).toBe(
        '<div id="bottom" style="border: 1px solid red; position: absolute; bottom: 0px; width: 300px; height: 300px;"><div>1: 3</div><div>2: 6</div><div>3: 9</div><div>4: -3</div></div>'
      );
    });
  });
}
