import { h, render, mount } from '@/index';

const Component = mount(() => {
  let injectHtml = '<button>INJECTED</button>';

  return () => <div innerHTML={injectHtml} />;
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<Component />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('The innerHTML property, which forces the string into the DOM, should work fine.', () => {
    expect(testWrap.outerHTML).toBe(
      '<div><div><button>INJECTED</button></div></div>'
    );
  });
}
