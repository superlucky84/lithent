import { afterEach, describe, expect, it, vi } from 'vitest';
import * as lithent from 'lithent';
import { h, mount, mountCallback, nextTick } from 'lithent';
import { store } from 'lithent/helper';
import { act, cleanup, render } from '@/index';

afterEach(() => cleanup());

// Present only when `lithent` is aliased to the concurrent core.
const { deferRender } = lithent as {
  deferRender?: (scope: () => void) => void;
};

const Counter = mount(renew => {
  let count = 0;
  return () => (
    <button
      type="button"
      onClick={() => {
        count += 1;
        renew();
      }}
    >
      count: {count}
    </button>
  );
});

const button = (container: HTMLElement) =>
  container.querySelector('button') as HTMLButtonElement;

describe('act', () => {
  it('waits for renew() to reach the DOM', async () => {
    const { container } = render(<Counter />);
    button(container).click();
    // renew() draws in a microtask: nothing has changed yet.
    expect(button(container).textContent).toBe('count: 0');
    await act();
    expect(button(container).textContent).toBe('count: 1');
  });

  it('runs the callback first and resolves with its result', async () => {
    const { container } = render(<Counter />);
    const result = await act(() => {
      button(container).click();
      return 'clicked';
    });
    expect(result).toBe('clicked');
    expect(button(container).textContent).toBe('count: 1');
  });

  it('awaits an async callback and passes its rejection on', async () => {
    const { container } = render(<Counter />);
    await act(async () => {
      await nextTick();
      button(container).click();
    });
    expect(button(container).textContent).toBe('count: 1');
    await expect(
      act(async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
  });

  it('waits for renders that mountCallbacks set off, several hops deep', async () => {
    // Showing the child mounts it; its mountCallback reports back two
    // microtasks later, and the parent renders again. `await nextTick()`
    // after the click is not enough for that.
    const Child = mount<{ onReady: () => void }>((_renew, props) => {
      mountCallback(() => {
        void nextTick()
          .then(nextTick)
          .then(() => props.onReady());
      });
      return () => <span class="child">child</span>;
    });
    const Parent = mount(renew => {
      let shown = false;
      let ready = false;
      return () => (
        <div>
          <button
            type="button"
            onClick={() => {
              shown = true;
              renew();
            }}
          >
            show
          </button>
          {shown ? (
            <Child
              onReady={() => {
                ready = true;
                renew();
              }}
            />
          ) : null}
          <p class="status">{ready ? 'ready' : 'waiting'}</p>
        </div>
      );
    });
    const { container } = render(<Parent />);
    button(container).click();
    await nextTick();
    expect(container.querySelector('.status')?.textContent).toBe('waiting');
    await act();
    expect(container.querySelector('.child')).not.toBeNull();
    expect(container.querySelector('.status')?.textContent).toBe('ready');
  });

  it('waits for components subscribed to a lithent/helper store', async () => {
    const useCart = store({ items: 0 });
    const Badge = mount(renew => {
      const cart = useCart(renew);
      return () => <span class="badge">{cart.items}</span>;
    });
    const { container } = render(
      <div>
        <Badge />
        <Badge />
      </div>
    );
    await act(() => {
      useCart().items = 3;
    });
    const badges = [...container.querySelectorAll('.badge')];
    expect(badges.map(badge => badge.textContent)).toEqual(['3', '3']);
  });

  it('does not stall under fake timers', async () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<Counter />);
      await act(() => button(container).click());
      expect(button(container).textContent).toBe('count: 1');
    } finally {
      vi.useRealTimers();
    }
  });

  it.skipIf(!deferRender)(
    'waits for deferRender work the concurrent scheduler splits across tasks',
    async () => {
      const busy = (ms: number) => {
        const end = performance.now() + ms;
        while (performance.now() < end);
      };
      const renews: (() => void)[] = [];
      let renders = 0;
      const Slow = mount(renew => {
        let version = 0;
        renews.push(() => {
          version += 1;
          renew();
        });
        return () => {
          renders += 1;
          // Each render is longer than half the 5 ms slice, so the low lane
          // has to yield several times to get through them.
          busy(3);
          return <span class="slow">{version}</span>;
        };
      });
      const { container } = render(
        <div>
          {Array.from({ length: 12 }, () => (
            <Slow />
          ))}
        </div>
      );
      renders = 0;
      await act(() => deferRender!(() => renews.forEach(renew => renew())));
      expect(renders).toBe(12);
      expect(
        [...container.querySelectorAll('.slow')].map(slow => slow.textContent)
      ).toEqual(Array(12).fill('1'));
    }
  );
});
