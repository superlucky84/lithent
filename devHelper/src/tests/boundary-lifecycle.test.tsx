import { describe, expect, it, vi } from 'vitest';
import { h, render, mount, getComponentKey, mountCallback } from 'lithent';
import { createBoundary } from '../createBoundary';

describe('HMR component lifecycle', () => {
  it('cleans up the previous mount exactly once before reusing its component key', async () => {
    const boundary = createBoundary('lifecycle');
    const cleanup = vi.fn();
    const mounted = vi.fn();
    const Component = mount(() => {
      const unregister = boundary.register(getComponentKey()!);
      mountCallback(() => {
        mounted();
        return () => {
          cleanup();
          unregister();
        };
      });
      return () => <span>component</span>;
    });
    const container = document.createElement('div');
    const dispose = render(<Component />, container);
    try {
      for (let i = 1; i <= 3; i++) {
        expect(boundary.update(Component)).toBe(true);
        await Promise.resolve();
        expect(mounted).toHaveBeenCalledTimes(i + 1);
        expect(cleanup).toHaveBeenCalledTimes(i);
        expect(container.querySelectorAll('span')).toHaveLength(1);
      }
      dispose();
      expect(cleanup).toHaveBeenCalledTimes(4);
      expect(container.innerHTML).toBe('');
      expect(boundary.update(Component)).toBe(false);
    } finally {
      boundary.dispose();
    }
  });

  it('rerenders a direct caller while retaining its closure state and mount effects', async () => {
    const boundary = createBoundary('direct-caller');
    const cleanup = vi.fn();
    const mounted = vi.fn();
    let label = 'original';
    const Parent = mount(renew => {
      let count = 0;
      const unregister = boundary.register(getComponentKey()!, Parent);
      mountCallback(() => {
        mounted();
        return () => {
          cleanup();
          unregister();
        };
      });
      return () => (
        <main>
          <span>{label}</span>
          <button
            onClick={() => {
              count++;
              renew();
            }}
          >
            {count}
          </button>
        </main>
      );
    });
    const container = document.createElement('div');
    const dispose = render(<Parent />, container);
    try {
      container.querySelector('button')!.click();
      await Promise.resolve();
      expect(container.querySelector('button')!.textContent).toBe('1');
      label = 'updated';
      boundary.update(() => <span>should not replace the parent</span>);
      await Promise.resolve();
      expect(container.querySelector('main span')!.textContent).toBe('updated');
      expect(container.querySelector('button')!.textContent).toBe('1');
      expect(mounted).toHaveBeenCalledTimes(1);
      expect(cleanup).not.toHaveBeenCalled();
      boundary.dispose();
      expect(cleanup).not.toHaveBeenCalled();
      expect(container.querySelector('button')!.textContent).toBe('1');
    } finally {
      dispose();
      boundary.dispose();
    }
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
