import { describe, it, expect } from 'vitest';
import { h, render, mount, nextTick } from '@/index';
import { ref } from '@/hook/ref';

describe('component returns component and remounts correctly', () => {
  it('re-adds child after being removed', async () => {
    const toggleRef = ref<null | (() => void)>(null);

    const Child = () => <div class="child">child</div>;

    const Wrapper = mount(renew => {
      let show = true;

      toggleRef.value = () => {
        show = !show;
        renew();
      };

      return () => (show ? <Child /> : null);
    });

    const testWrap = document.createElement('div');
    render(<Wrapper />, testWrap);

    expect(testWrap.innerHTML).toContain('child');

    toggleRef.value?.();
    await nextTick();
    expect(testWrap.innerHTML).toBe('');

    toggleRef.value?.();
    await nextTick();
    expect(testWrap.innerHTML).toContain('child');
  });
});
