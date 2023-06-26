import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | ((val: number) => void)>(null);

const Nested = mount(function (r) {
  let choiceNode = 7;

  const shuffle = () => {
    const randomValue = Math.floor(Math.random() * 10) + 1;
    choiceNode = randomValue;
    r();
  };
  testChangeRef.value = (changeValue: number) => {
    choiceNode = changeValue;
    r();
  };

  return () => (
    <Fragment>
      {choiceNode === 1 && <div>1</div>}
      {choiceNode === 2 && <div>2</div>}
      <Fragment>
        {choiceNode === 3 && <div>3</div>}
        {choiceNode === 4 && <div>4</div>}
        <Fragment>
          {choiceNode === 5 && <div>5</div>}
          {choiceNode === 6 && <div>6</div>}
          <div>6.5</div>
          {choiceNode === 7 && <div>7</div>}
        </Fragment>
        {choiceNode === 8 && <div>8</div>}
        {choiceNode === 9 && <div>9</div>}
      </Fragment>
      {choiceNode === 10 && <div>10</div>}
      <div>11</div>
      <button onClick={shuffle}>shuffle</button>
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Nested />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('The initial value of 7 should be exposed in the correct order.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><div>6.5</div><div>7</div><div>11</div><button>shuffle</button></div>'
    );
  });

  it('If you change the value to 2, the original value of 7 should disappear and 2 should come to the front in the proper order.', () => {
    if (testChangeRef.value) {
      testChangeRef.value(2);
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><div>2</div><div>6.5</div><div>11</div><button>shuffle</button></div>'
      );
    });
  });
}
