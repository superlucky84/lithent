import { describe, it, expect } from 'vitest';
import {
  h,
  Fragment,
  render,
  mount,
  nextTick,
  mountCallback,
  updateCallback,
} from '@/index';
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

  it('updates without remounting when output toggles', async () => {
    const toggleRef = ref<null | (() => void)>(null);
    let mountCount = 0;
    let unmountCount = 0;
    let updateCount = 0;

    const Wrapper = mount(renew => {
      let isA = true;

      toggleRef.value = () => {
        isA = !isA;
        renew();
      };

      mountCallback(() => {
        mountCount += 1;
        return () => {
          unmountCount += 1;
        };
      });

      updateCallback(
        () => {
          updateCount += 1;
        },
        () => [isA]
      );

      return () => (isA ? null : <Fragment>aa</Fragment>);
    });

    const testWrap = document.createElement('div');
    render(<Wrapper />, testWrap);

    expect(mountCount).toBe(1);
    expect(updateCount).toBe(0);
    expect(unmountCount).toBe(0);

    toggleRef.value?.();
    await nextTick();
    expect(updateCount).toBe(1);
    expect(mountCount).toBe(1);
    expect(unmountCount).toBe(0);

    toggleRef.value?.();
    await nextTick();
    expect(updateCount).toBe(2);
    expect(mountCount).toBe(1);
    expect(unmountCount).toBe(0);
  });
});
