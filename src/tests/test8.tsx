import { h, Fragment, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | ((newValue: string) => void)>(null);

const Selectbox = mount(renew => {
  let value = '4';

  const changeChange = (event: InputEvent) => {
    value = (event.target as HTMLInputElement).value;
    renew();
  };
  testChangeRef.value = (newValue: string) => {
    value = newValue;
    renew();
  };

  return () => (
    <Fragment>
      <div>{value}</div>
      <div>
        <select name="jselect" onChange={changeChange}>
          <option value="1" selected={value === '1'}>
            1
          </option>
          <option value="2" selected={value === '2'}>
            2
          </option>
          <option value="3" selected={value === '3'}>
            3
          </option>
          <option value="4" selected={value === '4'}>
            4
          </option>
          <option value="5" selected={value === '5'}>
            5
          </option>
        </select>
      </div>
    </Fragment>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Selectbox />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('Should see a selectbox with the default values set.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><div>4</div><div><select name="jselect"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div></div>'
    );

    expect(testWrap?.querySelector('select')?.value).toBe('4');
  });

  it('Should see a selectbox reflecting the changed value.', () => {
    if (testChangeRef.value) {
      testChangeRef.value('1');
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><div>1</div><div><select name="jselect"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div></div>'
      );
      expect(testWrap?.querySelector('select')?.value).toBe('1');
    });
  });
}
