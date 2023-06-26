import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

const Loop = mount(function (renew) {
  let list: { key: number; value: string }[] = [
    { key: 1, value: 'one' },
    { key: 2, value: 'two' },
    { key: 3, value: 'three' },
    { key: 4, value: 'four' },
  ];
  const handle = () => {
    list = [
      { key: 4, value: 'four four' },
      { key: 2, value: 'two two' },
      { key: 1, value: 'one one' },
    ];
    renew();
  };

  testChangeRef.value = handle;

  return () => (
    <Fragment>
      <button onClick={handle}>change list</button>
      {list.map(item => (
        <div key={item.key}>{item.value}</div>
      ))}
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Loop />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('It should be reflected in the DOM exactly in the order of the loop initialization.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><button>change list</button><div>one</div><div>two</div><div>three</div><div>four</div></div>'
    );
  });
  it('Changing the value to a missing number in reverse order should be reflected in the DOM as normal.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button>change list</button><div>four four</div><div>two two</div><div>one one</div></div>'
      );
    });
  });
}
