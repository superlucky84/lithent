// example.jsx
import type { Renew } from '@/index';
import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

const Renew2 = mount<{
  count1: number;
  change: () => void;
}>(() => {
  return ({ count1, change }) => {
    return (
      <div>
        <li>count1: {count1}</li>
        <button onClick={change}>change</button>
        <button disabled={count1 % 2 === 0}>change</button>
      </div>
    );
  };
});

const RenewHoc = mount(function one(renew, _props) {
  let count1 = 0;

  const change = () => {
    count1 += 1;
    renew();
  };
  testChangeRef.value = change;

  return () => {
    return <Renew2 count1={count1} change={change} />;
  };
});

const Renew = mount(function one(renew, _props) {
  let count1 = 0;

  const change = () => {
    count1 += 1;
    renew();
  };
  testChangeRef.value = change;

  return () => {
    return (
      <Fragment>
        <Renew2 count1={count1} change={change} />
      </Fragment>
    );
  };
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('It also works when the root element that the component draws is a component.', () => {
    render(<RenewHoc />, testWrap);
    expect(testWrap.outerHTML).toBe(
      '<div><div><li>count1: 0</li><button>change</button><button disabled="">change</button></div></div>'
    );
  });

  it('Value updates work correctly when the root element drawn by the component is a component.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><div><li>count1: 1</li><button>change</button><button>change</button></div></div>'
      );
    });
  });

  it('The root element drawn by a component behaves normally when it is not a component.', () => {
    const testWrap =
      document.getElementById('root') || document.createElement('div');

    render(<Renew />, testWrap);
    expect(testWrap.outerHTML).toBe(
      '<div><div><li>count1: 0</li><button>change</button><button disabled="">change</button></div></div>'
    );
  });
} else {
  render(<RenewHoc />, testWrap);
}
