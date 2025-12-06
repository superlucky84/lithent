import { mount, render, Fragment, ref, nextTick, h } from '@/index';

const updateSameOrderRef = ref<null | (() => void)>(null);
const swapOrderRef = ref<null | (() => void)>(null);
const resetRef = ref<null | (() => void)>(null);

const Loop = mount(function (renew) {
  let list: string[] = ['A', 'B'];

  const reset = (nextList: string[]) => {
    list = nextList;
    renew();
  };

  resetRef.value = () => reset(['A', 'B']);
  updateSameOrderRef.value = () => reset(['X', 'Y']);
  swapOrderRef.value = () => reset(['B', 'A']);

  return () => (
    <Fragment>
      <div class="item">{list[0]}</div>
      <div class="item">{list[1]}</div>
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Loop />, testWrap);

const getItems = () =>
  Array.from(testWrap.querySelectorAll('.item')) as HTMLElement[];

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('keeps DOM nodes when values change but order is the same (no keys)', async () => {
    const before = getItems();

    updateSameOrderRef.value && updateSameOrderRef.value();
    await nextTick();

    const after = getItems();

    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
    expect(after[0].textContent).toBe('X');
    expect(after[1].textContent).toBe('Y');
  });

  it('reuses nodes by index when order swaps without keys', async () => {
    resetRef.value && resetRef.value();
    await nextTick();

    const before = getItems();

    swapOrderRef.value && swapOrderRef.value();
    await nextTick();

    const after = getItems();

    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
    expect(after[0].textContent).toBe('B');
    expect(after[1].textContent).toBe('A');
  });
}
