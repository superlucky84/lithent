import { mount, render, Fragment, h, ref, nextTick } from '@/index';

const testChangeRef = ref<null | (() => void)>(null);
const testChangeRef2 = ref<null | (() => void)>(null);

const Item = mount<{ key: number; value: string }>((r, { key }) => {
  let c = 0;
  const handle = () => {
    c += 1;
    r();
  };

  if (key === 2) {
    testChangeRef2.value = handle;
  }

  return ({ value }) => (
    <Fragment>
      <button onClick={handle}>handle</button>
      <div>
        {value} = {c}
      </div>
    </Fragment>
  );
});

const Loop = mount(function (renew) {
  let list: { key: number; value: string }[] = [
    { key: 1, value: '일' },
    { key: 2, value: '이' },
    { key: 3, value: '삼' },
    { key: 4, value: '사' },
  ];
  const handle = () => {
    list = [
      { key: 3, value: '삼삼' },
      { key: 2, value: '이이' },
    ];
    renew();
  };

  testChangeRef.value = handle;

  return () => (
    <Fragment>
      <button onClick={handle}>exec</button>
      {list.map(item => (
        <Item key={item.key} value={item.value} />
      ))}
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Loop />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('If it is a component of a looped item, it should be output as expected.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><button>exec</button><button>handle</button><div>일 = 0</div><button>handle</button><div>이 = 0</div><button>handle</button><div>삼 = 0</div><button>handle</button><div>사 = 0</div></div>'
    );
  });
  it("If it's a component of a recurring item, it needs to be updated while maintaining the state of the item for each.", () => {
    if (testChangeRef.value && testChangeRef2.value) {
      testChangeRef2.value();
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><button>exec</button><button>handle</button><div>삼삼 = 0</div><button>handle</button><div>이이 = 1</div></div>'
      );
    });
  });
}
