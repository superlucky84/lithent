// Test for ref functionality
import { h, Fragment, render, mount, ref } from '@/index';

const RefTest = mount(renew => {
  let count = 0;
  const buttonRef = ref<HTMLButtonElement | null>(null);
  const divRef = ref<HTMLDivElement | null>(null);
  const inputRef = ref<HTMLInputElement | null>(null);

  const increment = () => {
    count += 1;
    renew();
  };

  return () => (
    <Fragment>
      <button ref={buttonRef} onClick={increment}>
        Click me
      </button>
      <div ref={divRef}>Count: {count}</div>
      <input ref={inputRef} type="text" value={`Value: ${count}`} />
    </Fragment>
  );
});

const testWrap = document.createElement('div');
render(<RefTest />, testWrap);

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;

  describe('ref functionality', () => {
    it('should attach DOM elements to refs after initial render', () => {
      const buttonRef = ref<HTMLButtonElement | null>(null);
      const divRef = ref<HTMLDivElement | null>(null);

      const Component = mount(() => {
        return () => (
          <div>
            <button ref={buttonRef}>Button</button>
            <div ref={divRef}>Content</div>
          </div>
        );
      });

      const wrapper = document.createElement('div');
      render(<Component />, wrapper);

      expect(buttonRef.value).not.toBeNull();
      expect(buttonRef.value?.tagName).toBe('BUTTON');
      expect(buttonRef.value?.textContent).toBe('Button');

      expect(divRef.value).not.toBeNull();
      expect(divRef.value?.tagName).toBe('DIV');
      expect(divRef.value?.textContent).toBe('Content');
    });

    it('should handle multiple refs in the same component', () => {
      const ref1 = ref<HTMLElement | null>(null);
      const ref2 = ref<HTMLElement | null>(null);
      const ref3 = ref<HTMLElement | null>(null);

      const Component = mount(() => {
        return () => (
          <div>
            <div ref={ref1}>First</div>
            <div ref={ref2}>Second</div>
            <div ref={ref3}>Third</div>
          </div>
        );
      });

      const wrapper = document.createElement('div');
      render(<Component />, wrapper);

      expect(ref1.value?.textContent).toBe('First');
      expect(ref2.value?.textContent).toBe('Second');
      expect(ref3.value?.textContent).toBe('Third');
    });

    it('should work with refs in nested components', () => {
      const parentRef = ref<HTMLElement | null>(null);
      const childRef = ref<HTMLElement | null>(null);

      const Child = mount(() => {
        return () => <div ref={childRef}>Child content</div>;
      });

      const Parent = mount(() => {
        return () => (
          <div ref={parentRef}>
            Parent content
            <Child />
          </div>
        );
      });

      const wrapper = document.createElement('div');
      render(<Parent />, wrapper);

      expect(parentRef.value?.textContent).toContain('Parent content');
      expect(childRef.value?.textContent).toBe('Child content');
    });
  });
}
