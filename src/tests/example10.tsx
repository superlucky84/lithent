// example.jsx
import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | ((newList: string[]) => void)>(null);

const Checkbox = mount(r => {
  let checkedList = ['sara'];

  const handleInput = (event: InputEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const isInclude = checkedList.includes(value);

    if (isInclude) {
      checkedList = [...checkedList.filter(item => item !== value)];
    } else {
      checkedList = [...checkedList, value];
    }
    r();
  };

  testChangeRef.value = (newList: string[]) => {
    checkedList = newList;
    r();
  };

  return () => (
    <>
      <input
        type="checkbox"
        name="checkname"
        onChange={handleInput}
        value="john"
        checked={checkedList.includes('john')}
      />{' '}
      John
      <input
        type="checkbox"
        name="checkname"
        onChange={handleInput}
        value="sara"
        checked={checkedList.includes('sara')}
      />{' '}
      Sara
      <input
        type="checkbox"
        name="checkname"
        onChange={handleInput}
        value="tom"
        checked={checkedList.includes('tom')}
      />{' '}
      Tom
    </>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Checkbox />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('You should see the initial value of the checkbox.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><input type="checkbox" name="checkname" value="john"> John<input type="checkbox" name="checkname" value="sara"> Sara<input type="checkbox" name="checkname" value="tom"> Tom</div>'
    );
    expect(
      (
        Array.from(
          testWrap.querySelectorAll('input[name="checkname"]:checked')
        ) as HTMLFormElement[]
      ).map(item => item.value)
    ).toEqual(['sara']);
  });

  it('The changed value should be reflected in the checkbox.', () => {
    if (testChangeRef.value) {
      testChangeRef.value(['john', 'tom']);
    }

    nextTick().then(() => {
      expect(
        (
          Array.from(
            testWrap.querySelectorAll('input[name="checkname"]:checked')
          ) as HTMLFormElement[]
        ).map(item => item.value)
      ).toEqual(['john', 'tom']);
    });
  });
}
