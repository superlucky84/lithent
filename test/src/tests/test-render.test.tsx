import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, mount, mountCallback } from 'lithent';
import { cleanup, render } from '@/index';

afterEach(() => cleanup());

const Hello = mount<{ name: string }>((_renew, props) => () => (
  <p class="hello">Hello {props.name}</p>
));

describe('render', () => {
  it('renders into a new container attached to document.body', () => {
    const { container, baseElement } = render(<Hello name="lithent" />);
    expect(baseElement).toBe(document.body);
    expect(container.parentNode).toBe(document.body);
    expect(container.querySelector('.hello')?.textContent).toBe(
      'Hello lithent'
    );
  });

  it('runs mountCallbacks before it returns', () => {
    const mounted = vi.fn();
    const Probe = mount(() => {
      mountCallback(() => mounted());
      return () => <i />;
    });
    render(<Probe />);
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('renders into a given container and leaves it in place on unmount', () => {
    const host = document.body.appendChild(document.createElement('section'));
    const { container, baseElement, unmount } = render(<Hello name="x" />, {
      container: host,
    });
    expect(container).toBe(host);
    expect(baseElement).toBe(host);
    unmount();
    expect(host.isConnected).toBe(true);
    expect(host.childNodes.length).toBe(0);
    host.remove();
  });

  it('appends the new container to baseElement', () => {
    const base = document.body.appendChild(document.createElement('main'));
    const { container } = render(<Hello name="x" />, { baseElement: base });
    expect(container.parentNode).toBe(base);
    cleanup();
    expect(base.childNodes.length).toBe(0);
    base.remove();
  });

  it('unmount runs unmount callbacks and removes the container it made', () => {
    const unmounted = vi.fn();
    const Probe = mount(() => {
      mountCallback(() => unmounted);
      return () => <i />;
    });
    const { container, unmount } = render(<Probe />);
    unmount();
    expect(unmounted).toHaveBeenCalledTimes(1);
    expect(container.isConnected).toBe(false);
    // A second unmount, or a cleanup after it, does nothing.
    unmount();
    cleanup();
    expect(unmounted).toHaveBeenCalledTimes(1);
  });
});

describe('cleanup', () => {
  it('takes down every rendered tree', () => {
    const unmounted = vi.fn();
    const Probe = mount(() => {
      mountCallback(() => unmounted);
      return () => <i />;
    });
    const first = render(<Probe />);
    const second = render(<Probe />);
    cleanup();
    expect(unmounted).toHaveBeenCalledTimes(2);
    expect(first.container.isConnected).toBe(false);
    expect(second.container.isConnected).toBe(false);
    expect(document.body.innerHTML).toBe('');
  });

  it('takes everything down when an unmount callback throws', async () => {
    // lithent finishes the teardown and reports the error itself, a
    // microtask later, through reportError.
    const reported = vi.fn();
    vi.stubGlobal('reportError', reported);
    try {
      const later = vi.fn();
      const Broken = mount(() => {
        mountCallback(() => () => {
          throw new Error('unmount failed');
        });
        return () => <i />;
      });
      const Fine = mount(() => {
        mountCallback(() => later);
        return () => <b />;
      });
      const broken = render(<Broken />);
      render(<Fine />);
      cleanup();
      expect(later).toHaveBeenCalledTimes(1);
      expect(broken.container.isConnected).toBe(false);
      expect(document.body.innerHTML).toBe('');
      await Promise.resolve();
      expect(reported).toHaveBeenCalledWith(new Error('unmount failed'));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('without a DOM', () => {
  it('render says which environment it needs', () => {
    vi.stubGlobal('document', undefined);
    try {
      expect(() => render(<Hello name="x" />)).toThrow(
        /needs a DOM.*jsdom or happy-dom/
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
