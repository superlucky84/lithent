import { describe, it, expect } from 'vitest';
import { h, render, mount, nextTick } from '@/index';
import { ref } from '@/hook/ref';

describe('mount updater null output', () => {
  it('renders nothing initially and toggles on/off', async () => {
    const toggleRef = ref<null | (() => void)>(null);

    const Wrapper = mount(renew => {
      let show = false;

      toggleRef.value = () => {
        show = !show;
        renew();
      };

      return () => (show ? <div class="content">content</div> : null);
    });

    const testWrap = document.createElement('div');
    render(<Wrapper />, testWrap);

    expect(testWrap.innerHTML).toBe('');

    toggleRef.value?.();
    await nextTick();
    expect(testWrap.innerHTML).toContain('content');

    toggleRef.value?.();
    await nextTick();
    expect(testWrap.innerHTML).toBe('');
  });
});
