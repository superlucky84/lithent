import { h, render, mount, ref, nextTick, mountCallback } from '@/index';

const changeRef = ref<null | ((ids: number[]) => void)>(null);
const mountLog: number[] = [];
const unmountLog: number[] = [];

const Row = mount<{ key: number; id: number }>((_renew, props) => {
  mountCallback(() => {
    mountLog.push(props.id);
    return () => {
      unmountLog.push(props.id);
    };
  });

  return ({ id }) => <li>{id}</li>;
});

const Loop = mount(function (renew) {
  let list: number[] = [1, 2, 3];

  changeRef.value = (ids: number[]) => {
    list = ids;
    renew();
  };

  return () => (
    <ul>
      {list.map(id => (
        <Row key={id} id={id} />
      ))}
    </ul>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Loop />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const change = async (ids: number[]) => {
    changeRef.value!(ids);
    await nextTick();
  };

  it('runs mount callbacks for the initial rows left-to-right', () => {
    expect(mountLog).toEqual([1, 2, 3]);
  });

  it('runs mount callbacks for keyed insertions left-to-right', async () => {
    await change([1, 9, 2, 10, 3, 11]);
    expect(mountLog).toEqual([1, 2, 3, 9, 10, 11]);
    expect(unmountLog).toEqual([]);
  });

  it('does not remount rows that only moved', async () => {
    await change([11, 9, 2, 10, 3, 1]);
    expect(mountLog).toEqual([1, 2, 3, 9, 10, 11]);
    expect(unmountLog).toEqual([]);
  });

  it('runs unmount callbacks for removed rows in original order', async () => {
    await change([2, 3]);
    expect(unmountLog).toEqual([11, 9, 10, 1]);
  });
}
