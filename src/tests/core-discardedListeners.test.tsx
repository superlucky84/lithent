import { describe, it, expect } from 'vitest';
import { h, render, mount, mountCallback, nextTick, portal } from '@/index';

// This suite also runs against the concurrent core (lithentConcurrent's
// vitest config aliases `@/index`).

/**
 * Removal contract (docs/benchmark/STATUS.md): a removed node runs its
 * unmount callbacks and leaves the document, but its listeners are not
 * detached one by one. They go away with the discarded DOM. Listeners on a
 * node that stays are still detached when the handler is replaced or dropped.
 */
describe('listeners on discarded DOM', () => {
  it('runs unmount callbacks and removes the rows of a keyed list', async () => {
    let ids = [1, 2, 3];
    let bump = () => {};
    const unmounted: number[] = [];

    const Row = mount<{ id: number; key?: number }>((_renew, props) => {
      const id = props.id;
      mountCallback(() => () => unmounted.push(id));
      return () => <li onClick={() => {}}>{id}</li>;
    });

    const List = mount(renew => {
      bump = renew;
      return () => (
        <ul>
          {ids.map(id => (
            <Row key={id} id={id} />
          ))}
        </ul>
      );
    });

    const el = document.createElement('div');
    render(<List />, el);

    ids = [2];
    bump();
    await nextTick();

    expect(el.querySelector('ul')!.textContent).toBe('2');
    expect(unmounted.sort()).toEqual([1, 3]);

    ids = [];
    bump();
    await nextTick();

    expect(el.querySelectorAll('li').length).toBe(0);
    expect(unmounted.sort()).toEqual([1, 2, 3]);
  });

  it('leaves the listeners of a removed node on the discarded element', async () => {
    let show = true;
    let bump = () => {};
    let clicks = 0;

    const Toggle = mount(renew => {
      bump = renew;
      return () => (
        <div>
          {show ? (
            <section onClick={() => (clicks += 1)}>
              <button onClick={() => (clicks += 10)}>x</button>
            </section>
          ) : null}
        </div>
      );
    });

    const el = document.createElement('div');
    render(<Toggle />, el);

    const section = el.querySelector('section') as HTMLElement;
    const button = el.querySelector('button') as HTMLElement;

    show = false;
    bump();
    await nextTick();

    expect(el.querySelector('section')).toBe(null);
    expect(section.isConnected).toBe(false);

    // The discarded nodes are not reused; a caller that kept them still
    // reaches their handlers.
    button.dispatchEvent(new Event('click', { bubbles: true }));
    expect(clicks).toBe(11);
  });

  it('still detaches a handler that is replaced on a node that stays', async () => {
    let first = true;
    let bump = () => {};
    const calls: string[] = [];
    const a = () => calls.push('a');
    const b = () => calls.push('b');

    const Comp = mount(renew => {
      bump = renew;
      return () => <button onClick={first ? a : b}>x</button>;
    });

    const el = document.createElement('div');
    render(<Comp />, el);

    const button = el.querySelector('button') as HTMLElement;
    button.dispatchEvent(new Event('click'));

    first = false;
    bump();
    await nextTick();

    expect(el.querySelector('button')).toBe(button);
    button.dispatchEvent(new Event('click'));
    expect(calls).toEqual(['a', 'b']);
  });

  it('detaches a handler that is dropped from a node that stays', async () => {
    let on = true;
    let bump = () => {};
    let clicks = 0;
    const handler = () => (clicks += 1);

    const Comp = mount(renew => {
      bump = renew;
      return () =>
        h(
          'button',
          on ? { onClick: handler, title: 't' } : { title: 't' },
          'x'
        );
    });

    const el = document.createElement('div');
    render(<Comp />, el);

    const button = el.querySelector('button') as HTMLElement;
    button.dispatchEvent(new Event('click'));
    expect(clicks).toBe(1);

    on = false;
    bump();
    await nextTick();

    expect(el.querySelector('button')).toBe(button);
    button.dispatchEvent(new Event('click'));
    expect(clicks).toBe(1);

    // Brought back: attached once.
    on = true;
    bump();
    await nextTick();

    button.dispatchEvent(new Event('click'));
    expect(clicks).toBe(2);
    expect(button.getAttribute('title')).toBe('t');
  });

  it('runs unmount callbacks and empties the container when the root is destroyed', () => {
    let unmounted = 0;

    const App = mount(() => {
      mountCallback(() => () => (unmounted += 1));
      return () => <p onClick={() => {}}>app</p>;
    });

    const el = document.createElement('div');
    const destroy = render(<App />, el);

    expect(el.querySelector('p')).not.toBe(null);
    destroy();

    expect(el.querySelector('p')).toBe(null);
    expect(unmounted).toBe(1);
  });

  it('calls an inline handler once per event after repeated updates', async () => {
    let count = 0;
    let clicks = 0;
    let bump = () => {};

    // A new function on every render: the old one must be swapped out.
    const Comp = mount(renew => {
      bump = renew;
      return () => <button onClick={() => (clicks += 1)}>{count}</button>;
    });

    const el = document.createElement('div');
    render(<Comp />, el);

    for (let i = 0; i < 5; i++) {
      count += 1;
      bump();
      await nextTick();
    }

    (el.querySelector('button') as HTMLElement).dispatchEvent(
      new Event('click')
    );
    expect(clicks).toBe(1);
  });

  it('calls a handler once after the node is replaced and brought back', async () => {
    let tag = 'button';
    let ids = [1, 2];
    let clicks = 0;
    let bump = () => {};

    const Comp = mount(renew => {
      bump = renew;
      return () => (
        <div>
          {h(tag, { id: 'swap', onClick: () => (clicks += 1) }, 'x')}
          <ul>
            {ids.map(id =>
              h(id % 2 ? 'li' : 'p', { key: id, onClick: () => (clicks += 10) })
            )}
          </ul>
        </div>
      );
    });

    const el = document.createElement('div');
    render(<Comp />, el);

    // Replace by tag, reorder keyed children, then restore both.
    for (const [nextTag, nextIds] of [
      ['a', [2, 1]],
      ['button', [1, 2]],
      ['a', [2]],
      ['button', [1, 2]],
    ] as [string, number[]][]) {
      tag = nextTag;
      ids = nextIds;
      bump();
      await nextTick();
    }

    (el.querySelector('#swap') as HTMLElement).dispatchEvent(
      new Event('click')
    );
    expect(clicks).toBe(1);

    (el.querySelector('li') as HTMLElement).dispatchEvent(new Event('click'));
    expect(clicks).toBe(11);
  });

  it('calls a handler inside a portal once after the portal is toggled', async () => {
    let show = true;
    let clicks = 0;
    let bump = () => {};
    const target = document.createElement('div');

    const Comp = mount(renew => {
      bump = renew;
      return () => (
        <div>
          {show
            ? portal(<button onClick={() => (clicks += 1)}>x</button>, target)
            : null}
        </div>
      );
    });

    const el = document.createElement('div');
    render(<Comp />, el);

    for (const next of [false, true, false, true]) {
      show = next;
      bump();
      await nextTick();
    }

    // The target element outlives the portal; its content is rebuilt.
    expect(target.querySelectorAll('button').length).toBe(1);
    (target.querySelector('button') as HTMLElement).dispatchEvent(
      new Event('click', { bubbles: true })
    );
    expect(clicks).toBe(1);
  });
});
