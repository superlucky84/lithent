import { describe, expect, it } from 'vitest';
import {
  h,
  Fragment,
  memo,
  mount,
  mountCallback,
  nextTick,
  render,
  updateCallback,
} from '@/index';
import type { WDom } from '@/types';

// DC-29: a memo component is left alone by its parent's redraw while it gets
// the same props and no children.
describe('memo components', () => {
  const makeList = () => {
    const calls: Record<number, number> = {};
    const updates: Record<number, number> = {};
    const unmounts: number[] = [];
    const renews: Record<number, () => void> = {};
    const local: Record<number, number> = {};
    const Row = memo(
      mount<{ key?: number; id: number; label: string; selected: boolean }>(
        (renew, props) => {
          renews[props.id] = renew;
          mountCallback(() => () => {
            unmounts.push(props.id);
          });
          updateCallback(() => {
            updates[props.id] = (updates[props.id] || 0) + 1;
          });
          return () => {
            calls[props.id] = (calls[props.id] || 0) + 1;
            return (
              <li class={props.selected ? 'on' : ''}>
                {props.label}:{local[props.id] || 0}
              </li>
            );
          };
        }
      )
    );
    const state = {
      rows: [
        { id: 1, label: 'a' },
        { id: 2, label: 'b' },
        { id: 3, label: 'c' },
      ],
      selected: 0,
    };
    let bump = () => {};
    const App = mount(renew => {
      bump = renew;
      return () => (
        <ul>
          {state.rows.map(row => (
            <Row
              key={row.id}
              id={row.id}
              label={row.label}
              selected={state.selected === row.id}
            />
          ))}
        </ul>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    const redraw = async () => {
      bump();
      await nextTick();
    };
    const items = () => [...host.querySelectorAll('li')];
    return {
      calls,
      updates,
      unmounts,
      renews,
      local,
      state,
      host,
      dispose,
      redraw,
      items,
    };
  };

  it('skips rows with the same props and redraws the ones that changed', async () => {
    const list = makeList();
    const before = list.items();
    expect(list.calls).toEqual({ 1: 1, 2: 1, 3: 1 });

    await list.redraw();
    expect(list.calls).toEqual({ 1: 1, 2: 1, 3: 1 });
    expect(list.updates).toEqual({});

    list.state.selected = 2;
    await list.redraw();
    expect(list.calls).toEqual({ 1: 1, 2: 2, 3: 1 });
    expect(list.updates).toEqual({ 2: 1 });
    expect(list.host.innerHTML).toBe(
      '<ul><li class="">a:0</li><li class="on">b:0</li><li class="">c:0</li></ul>'
    );

    list.state.rows[2].label = 'c!';
    list.state.selected = 0;
    await list.redraw();
    expect(list.calls).toEqual({ 1: 1, 2: 3, 3: 2 });
    expect(list.host.innerHTML).toBe(
      '<ul><li class="">a:0</li><li class="">b:0</li><li class="">c!:0</li></ul>'
    );
    // Updated in place: the same elements throughout.
    expect(list.items()).toEqual(before);
  });

  it('still redraws itself after being skipped, and stays in place', async () => {
    const list = makeList();
    await list.redraw();
    await list.redraw();

    list.local[2] = 7;
    list.renews[2]();
    await nextTick();
    expect(list.calls).toEqual({ 1: 1, 2: 2, 3: 1 });
    expect(list.host.textContent).toBe('a:0b:7c:0');

    // The parent sees the row's latest node afterwards.
    await list.redraw();
    list.state.selected = 2;
    await list.redraw();
    expect(list.host.innerHTML).toBe(
      '<ul><li class="">a:0</li><li class="on">b:7</li><li class="">c:0</li></ul>'
    );
  });

  it('moves, removes and adds skipped rows by key', async () => {
    const list = makeList();
    const [a, b, c] = list.items();
    await list.redraw();

    const [first, second, third] = list.state.rows;
    list.state.rows = [third, second, first];
    await list.redraw();
    expect(list.items()).toEqual([c, b, a]);
    expect(list.calls).toEqual({ 1: 1, 2: 1, 3: 1 });

    list.state.rows = [third, first];
    await list.redraw();
    expect(list.items()).toEqual([c, a]);
    expect(list.unmounts).toEqual([2]);

    list.state.rows = [{ id: 4, label: 'd' }, third, first];
    await list.redraw();
    expect(list.host.textContent).toBe('d:0c:0a:0');
    expect(list.items().slice(1)).toEqual([c, a]);

    list.state.rows = [];
    await list.redraw();
    expect(list.host.innerHTML).toBe('<ul></ul>');
    expect(list.unmounts.sort()).toEqual([1, 2, 3, 4]);

    list.dispose();
  });

  it('never skips a component that is given children', async () => {
    let calls = 0;
    let bump = () => {};
    const Box = memo(
      mount<{ title: string }>((_renew, props, children) => () => {
        calls++;
        return (
          <div title={props.title}>
            <Fragment>{children}</Fragment>
          </div>
        );
      })
    );
    let text = 'x';
    const App = mount(renew => {
      bump = renew;
      return () => (
        <Box title="t">
          <span>{text}</span>
        </Box>
      );
    });
    const host = document.createElement('div');
    render(<App />, host);
    text = 'y';
    bump();
    await nextTick();
    expect(calls).toBe(2);
    expect(host.textContent).toBe('y');
  });

  it('compares each prop value and the set of props', async () => {
    let calls = 0;
    let bump = () => {};
    const Cell = memo(
      mount<Record<string, unknown>>((_renew, props) => () => {
        calls++;
        return <b>{String(props.a)}</b>;
      })
    );
    let props: Record<string, unknown> = { a: 1, data: { n: 1 } };
    const App = mount(renew => {
      bump = renew;
      return () => h(Cell, { ...props }) as WDom;
    });
    const host = document.createElement('div');
    render(<App />, host);
    const step = async (next: Record<string, unknown>, expected: number) => {
      props = next;
      bump();
      await nextTick();
      expect(calls).toBe(expected);
    };

    const data = props.data;
    await step({ a: 1, data }, 1); // same values
    await step({ a: 1, data: { n: 1 } }, 2); // a new object
    await step({ a: 1, data: props.data, extra: undefined }, 3); // a prop more
    await step({ a: 1, data: props.data }, 4); // a prop less
    await step({ a: 2, data: props.data }, 5);
    expect(host.textContent).toBe('2');
  });

  it('leaves components without memo as they were', async () => {
    let calls = 0;
    let bump = () => {};
    const Plain = mount<{ a: number }>((_renew, props) => () => {
      calls++;
      return <i>{props.a}</i>;
    });
    const App = mount(renew => {
      bump = renew;
      return () => <Plain a={1} />;
    });
    const host = document.createElement('div');
    render(<App />, host);
    bump();
    await nextTick();
    expect(calls).toBe(2);
  });
});
