// example.jsx
import { h, Fragment, render, Renew, mount, ref } from '@/index';
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

const RenewError = mount(function one(renew, _props) {
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

  it('The root element that the component draws should not be a component.', () => {
    expect(() => render(<RenewError />, testWrap)).toThrowError();
  });

  it('The root element drawn by a component behaves normally when it is not a component.', () => {
    render(<Renew />, testWrap);
    expect(testWrap.outerHTML).toBe(
      '<div><div><li>count1: 0</li><button>change</button><button disabled="">change</button></div></div>'
    );
  });
}
