import { mount, render, Fragment, ref, h, nextTick } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

const Loop = mount(function (renew) {
  let list: { value: string }[] = [
    { value: '일' },
    { value: '이' },
    { value: '삼' },
    { value: '사' },
  ];
  const handle = () => {
    list = [{ value: '사사' }, { value: '삼삼' }, { value: '이이' }];
    renew();
  };

  testChangeRef.value = () => {
    handle();
  };

  return () => (
    <Fragment>
      <button onClick={handle}>handle</button>
      <div>first</div>
      {list.map(item => (
        <div>{item.value}</div>
      ))}
      <div>end</div>
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
      '<div><button>handle</button><div>first</div><div>일</div><div>이</div><div>삼</div><div>사</div><div>end</div></div>'
    );
  });

  it('Even if there are no keys in the loop, "replace" should be reflected correctly.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button>handle</button><div>first</div><div>사사</div><div>삼삼</div><div>이이</div><div>end</div></div>'
      );
    });
  });
}
