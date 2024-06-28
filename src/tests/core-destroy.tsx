// example.jsx
import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

const Component = mount((renew, _props) => {
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
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

const destroy = render(<div>div</div>, testWrap);
destroy();

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('Is renew working properly?', () => {
    const destroy = render(<Component />, testWrap);

    expect(testWrap.outerHTML).toBe(
      '<div><li>count1: 0</li><li>count2: 0</li><li>count3: 0</li><li>count4: 0</li><button>change</button><button disabled="">change</button></div>'
    );
    destroy();
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe('<div></div>');
    });
  });
}
