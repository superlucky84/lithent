import { h, render, mount, ref, nextTick } from '@/index';

const changeRef = ref<null | ((ids: number[]) => void)>(null);

const Loop = mount(function (renew) {
  let list: number[] = [1, 2, 3, 4, 5];

  changeRef.value = (ids: number[]) => {
    list = ids;
    renew();
  };

  return () => (
    <ul>
      {list.map(id => (
        <li key={id}>{id}</li>
      ))}
      <li class="tail">tail</li>
    </ul>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Loop />, testWrap);

const listHtml = (ids: number[]) =>
  `<ul>${ids.map(id => `<li>${id}</li>`).join('')}<li class="tail">tail</li></ul>`;

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const change = async (ids: number[]) => {
    changeRef.value!(ids);
    await nextTick();
  };

  it('renders the initial keyed list in order', () => {
    expect(testWrap.innerHTML).toBe(listHtml([1, 2, 3, 4, 5]));
  });

  it('swaps two distant rows with the rest untouched', async () => {
    await change([1, 4, 3, 2, 5]);
    expect(testWrap.innerHTML).toBe(listHtml([1, 4, 3, 2, 5]));
  });

  it('reverses the whole list', async () => {
    await change([5, 2, 3, 4, 1]);
    expect(testWrap.innerHTML).toBe(listHtml([5, 2, 3, 4, 1]));
  });

  it('handles shuffle with removals and insertions mixed', async () => {
    await change([3, 1, 6, 4, 7]);
    expect(testWrap.innerHTML).toBe(listHtml([3, 1, 6, 4, 7]));
  });

  it('appends at the end without crossing the list boundary sibling', async () => {
    await change([3, 1, 6, 4, 7, 8, 9]);
    expect(testWrap.innerHTML).toBe(listHtml([3, 1, 6, 4, 7, 8, 9]));
  });

  it('prepends and inserts in the middle', async () => {
    await change([0, 3, 1, 6, 5, 4, 7, 8, 9]);
    expect(testWrap.innerHTML).toBe(listHtml([0, 3, 1, 6, 5, 4, 7, 8, 9]));
  });

  it('clears every row while keeping the boundary sibling', async () => {
    await change([]);
    expect(testWrap.innerHTML).toBe(listHtml([]));
  });

  it('refills after a full clear', async () => {
    await change([1, 2]);
    expect(testWrap.innerHTML).toBe(listHtml([1, 2]));
  });
}
