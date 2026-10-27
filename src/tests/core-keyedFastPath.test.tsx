import { describe, expect, it } from 'vitest';
import * as core from '@/index';
import {
  h,
  mount,
  mountCallback,
  nextTick,
  render,
  updateCallback,
} from '@/index';

const concurrent = 'deferRender' in core;

describe('same-order keyed matching baseline', () => {
  it('preserves children getter observations on a reused identical VDOM object', async () => {
    let refresh = () => {};
    let armed = false;
    let reads = 0;
    const held = <b>held</b>;
    let children = held.children;
    Object.defineProperty(held, 'children', {
      configurable: true,
      get() {
        if (armed) reads++;
        return children;
      },
      set(value) {
        children = value;
      },
    });
    const App = mount(renew => {
      refresh = renew;
      return () => <section>{held}</section>;
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    try {
      const element = host.querySelector('b');
      armed = true;
      refresh();
      await nextTick();
      expect(reads).toBeGreaterThan(0);
      expect(host.querySelector('b')).toBe(element);
      expect(host.textContent).toBe('held');
    } finally {
      dispose();
    }
  });

  it('preserves each core baseline when the next array has a hole at the same length', () => {
    let sparse = false;
    const App = mount(() => {
      return () => {
        const rows = [<b key="a">a</b>, <b key="b">b</b>, <b key="c">c</b>];
        if (sparse) delete rows[1];
        return <section>{rows}</section>;
      };
    });
    const host = document.createElement('div');
    const tree = <App />;
    const dispose = render(tree, host);
    try {
      const before = [...host.querySelectorAll('b')];
      sparse = true;
      const update = () =>
        core.replaceWDom(App, tree.compProps!, tree.compChild!, tree);
      if (concurrent) {
        // Existing concurrent work frames visit array holes as undefined nodes.
        // Characterize that limitation; DC-25 does not change this core path.
        expect(update).toThrow(TypeError);
        expect(host.textContent).toBe('abc');
      } else {
        update();
        expect(host.textContent).toBe('ac');
        expect([...host.querySelectorAll('b')]).toEqual([before[0], before[2]]);
      }
    } finally {
      dispose();
    }
  });

  it.each([
    [-0, +0],
    [NaN, NaN],
  ])(
    'consumes only the first SameValueZero duplicate %j',
    async (first, second) => {
      let refresh = () => {};
      let instance = 0;
      let version = 0;
      const removed: number[] = [];
      const Row = mount<{ key: number; label: number }>((_renew, props) => {
        const id = ++instance;
        mountCallback(() => () => removed.push(id));
        return () => <b data-id={id}>{`${version}:${props.label}`}</b>;
      });
      const App = mount(renew => {
        refresh = renew;
        return () => (
          <section>
            {[first, second].map((key, label) => (
              <Row key={key} label={label} />
            ))}
          </section>
        );
      });
      const host = document.createElement('div');
      const dispose = render(<App />, host);
      const original = host.firstElementChild!.firstElementChild;
      try {
        for (version = 1; version <= 3; version++) {
          refresh();
          await nextTick();
          expect(host.firstElementChild!.firstElementChild).toBe(original);
          expect(
            [...host.querySelectorAll('b')].map(node =>
              node.getAttribute('data-id')
            )
          ).toEqual(['1', String(version + 2)]);
          expect(host.textContent).toBe(`${version}:0${version}:1`);
          expect(removed).toEqual(
            Array.from({ length: version }, (_, i) => i + 2)
          );
        }
      } finally {
        dispose();
      }
    }
  );

  it('does not replay the consumed prefix when an updater changes later matches', async () => {
    let refresh = () => {};
    let updating = false;
    let nextProps: { key: string; label: string }[] = [];
    let instance = 0;
    const trace: string[] = [];
    const removed: number[] = [];
    const Row = mount<{ key: string; label: string }>((_renew, props) => {
      const id = ++instance;
      updateCallback(() => {
        trace.push(`pre:${id}`);
        if (updating && props.label === 'a') {
          nextProps[1].key = 'a';
          nextProps[2].key = 'd';
          nextProps[3].key = 'c';
        }
      });
      mountCallback(() => () => removed.push(id));
      return () => <b data-id={id}>{props.label}</b>;
    });
    const App = mount(renew => {
      refresh = renew;
      return () => {
        const rows = ['a', 'b', 'c', 'd'].map(label => (
          <Row key={label} label={label} />
        ));
        nextProps = rows.map(
          row => row.props as { key: string; label: string }
        );
        return <section>{rows}</section>;
      };
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    try {
      updating = true;
      refresh();
      await nextTick();
      expect(host.textContent).toBe('abcd');
      expect(trace).toEqual(
        concurrent
          ? ['pre:1', 'pre:2', 'pre:3', 'pre:4']
          : ['pre:1', 'pre:4', 'pre:3']
      );
      expect(
        [...host.querySelectorAll('b')].map(node =>
          node.getAttribute('data-id')
        )
      ).toEqual(concurrent ? ['1', '2', '3', '4'] : ['1', '5', '4', '3']);
      expect(removed).toEqual(concurrent ? [] : [2]);
    } finally {
      dispose();
    }
  });

  it('reads all original keys before a later incoming key getter throws', () => {
    let updating = false;
    const trace: string[] = [];
    const App = mount(() => () => {
      const source = updating ? 'next' : 'old';
      return (
        <section>
          {[0, 1, 2].map(id =>
            h(
              'b',
              {
                get key() {
                  if (updating) trace.push(`${source}:${id}`);
                  if (updating && source === 'next' && id === 1)
                    throw Error('later key getter');
                  return id;
                },
              },
              id
            )
          )}
        </section>
      );
    });
    const host = document.createElement('div');
    const tree = <App />;
    const dispose = render(tree, host);
    try {
      updating = true;
      expect(() =>
        core.replaceWDom(App, tree.compProps!, tree.compChild!, tree)
      ).toThrow('later key getter');
      expect(trace.indexOf('old:2')).toBeGreaterThan(-1);
      expect(trace.indexOf('next:1')).toBeGreaterThan(trace.indexOf('old:2'));
      expect(trace.filter(value => value === 'next:1')).toHaveLength(1);
      expect(host.textContent).toBe('012');
    } finally {
      dispose();
    }
  });
});
