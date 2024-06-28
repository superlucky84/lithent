// example.jsx
import { h, render, mount, ref, nextTick } from '@/index';
const testChangeRef = ref<null | ((newText: string) => void)>(null);

const Input = mount(r => {
  let text = 'initText';

  const handleInput = (event: InputEvent) => {
    text = (event.target as HTMLInputElement).value;
    r();
  };
  testChangeRef.value = (newText: string) => {
    text = newText;
    r();
  };

  return () => <input type="text" onInput={handleInput} value={text} />;
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Input />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('The initialized text should be reflected in the input.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><input type="text" value="initText"></div>'
    );
    expect(testWrap?.querySelector('input')?.value).toBe('initText');
  });

  it('The text reflecting the change should appear in the input.', () => {
    if (testChangeRef.value) {
      testChangeRef.value('newText');
    }
    nextTick().then(() => {
      expect(testWrap.outerHTML).toBe(
        '<div><input type="text" value="newText"></div>'
      );
      expect(testWrap?.querySelector('input')?.value).toBe('newText');
    });
  });
}
