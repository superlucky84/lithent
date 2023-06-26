import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | ((newText: string) => void)>(null);

const Radio = mount(r => {
  let text = 'sara';

  const handleInput = (event: InputEvent) => {
    text = (event.target as HTMLInputElement).value;
    r();
  };

  testChangeRef.value = (newText: string) => {
    text = newText;
    r();
  };

  return () => (
    <>
      <input
        type="radio"
        name="checkname"
        onChange={handleInput}
        value="john"
        checked={text === 'john'}
      />{' '}
      John
      <input
        type="radio"
        name="checkname"
        onChange={handleInput}
        value="sara"
        checked={text === 'sara'}
      />{' '}
      Sara
      <input
        type="radio"
        name="checkname"
        onChange={handleInput}
        value="tom"
        checked={text === 'tom'}
      />{' '}
      Tom
    </>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Radio />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('You should see the initial value of the radio.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><input type="radio" name="checkname" value="john"> John<input type="radio" name="checkname" value="sara"> Sara<input type="radio" name="checkname" value="tom"> Tom</div>'
    );
    expect(
      (
        Array.from(
          testWrap.querySelectorAll('input[name="checkname"]:checked')
        ) as HTMLFormElement[]
      ).map(item => item.value)
    ).toEqual(['sara']);
  });

  it('The changed value should be reflected in the radio.', () => {
    if (testChangeRef.value) {
      testChangeRef.value('tom');
    }

    nextTick().then(() => {
      expect(
        (
          Array.from(
            testWrap.querySelectorAll('input[name="checkname"]:checked')
          ) as HTMLFormElement[]
        ).map(item => item.value)
      ).toEqual(['tom']);
    });
  });
}
