import { describe, expect, it } from 'vitest';
import { h, mount, mountCallback, nextTick, render } from '@/index';

/**
 * A keyed list whose keys were proved unique by an earlier redraw pairs its
 * children by position while the keys agree, and builds the key map only at
 * the first mismatch. These redraw such a list (the first redraw proves it)
 * and check that every change still pairs rows by key, as the map does.
 */
const setup = (initial: (string | null)[]) => {
  let keys = initial;
  let refresh = () => {};
  let instances = 0;
  const removed: string[] = [];
  const Row = mount<{ key: string; label: string }>((_renew, props) => {
    const id = `${props.label}#${++instances}`;
    mountCallback(() => () => removed.push(id));
    return () => <b data-id={id}>{props.label}</b>;
  });
  const App = mount(renew => {
    refresh = renew;
    return () => (
      <section>
        {keys.map(key => (key ? <Row key={key} label={key} /> : null))}
      </section>
    );
  });
  const host = document.createElement('div');
  const dispose = render(<App />, host);
  const ids = () =>
    [...host.querySelectorAll('b')].map(node => node.getAttribute('data-id'));
  const redraw = async (next: (string | null)[]) => {
    keys = next;
    refresh();
    await nextTick();
  };
  return { host, ids, redraw, removed, dispose };
};

describe('keyed lists with keys proved unique', () => {
  it('pairs moved, inserted and removed rows by key', async () => {
    const t = setup(['a', 'b', 'c', 'd']);
    try {
      await t.redraw(['a', 'b', 'c', 'd']); // proves the keys
      expect(t.ids()).toEqual(['a#1', 'b#2', 'c#3', 'd#4']);

      await t.redraw(['d', 'c', 'b', 'a']);
      expect(t.ids()).toEqual(['d#4', 'c#3', 'b#2', 'a#1']);

      await t.redraw(['d', 'x', 'c', 'a']);
      expect(t.ids()).toEqual(['d#4', 'x#5', 'c#3', 'a#1']);
      expect(t.removed).toEqual(['b#2']);

      await t.redraw(['d', 'x', 'c', 'a']);
      await t.redraw(['a', 'x', 'c', 'd']);
      expect(t.ids()).toEqual(['a#1', 'x#5', 'c#3', 'd#4']);
      expect(t.host.textContent).toBe('axcd');
    } finally {
      t.dispose();
    }
  });

  it('keeps the first of a new duplicate key and creates the second', async () => {
    const t = setup(['a', 'b', 'c']);
    try {
      await t.redraw(['a', 'b', 'c']);
      await t.redraw(['a', 'a', 'c']);
      expect(t.ids()).toEqual(['a#1', 'a#4', 'c#3']);
      expect(t.removed).toEqual(['b#2']);

      // The list with a duplicate is not proved: the map pairs it again.
      await t.redraw(['c', 'a', 'a']);
      expect(t.ids()).toEqual(['c#3', 'a#1', 'a#5']);
      expect(t.removed).toEqual(['b#2', 'a#4']);
    } finally {
      t.dispose();
    }
  });

  it('replaces a row whose key changes in place', async () => {
    const t = setup(['a', 'b', 'c']);
    try {
      await t.redraw(['a', 'b', 'c']);
      await t.redraw(['a', 'z', 'c']);
      expect(t.ids()).toEqual(['a#1', 'z#4', 'c#3']);
      expect(t.removed).toEqual(['b#2']);
    } finally {
      t.dispose();
    }
  });

  it('pairs unkeyed holes by index between keyed rows', async () => {
    const t = setup(['a', null, 'b', 'c']);
    try {
      await t.redraw(['a', null, 'b', 'c']);
      expect(t.ids()).toEqual(['a#1', 'b#2', 'c#3']);

      await t.redraw(['a', 'c', null, 'b']);
      expect(t.ids()).toEqual(['a#1', 'c#3', 'b#2']);
      expect(t.removed).toEqual([]);

      await t.redraw(['b', null, 'a']);
      expect(t.ids()).toEqual(['b#2', 'a#1']);
      expect(t.removed).toEqual(['c#3']);
    } finally {
      t.dispose();
    }
  });

  it('pairs a whole new list after clearing a proved one', async () => {
    const t = setup(['a', 'b']);
    try {
      await t.redraw(['a', 'b']);
      await t.redraw([]);
      expect(t.ids()).toEqual([]);
      await t.redraw(['b', 'a']);
      expect(t.ids()).toEqual(['b#3', 'a#4']);
      await t.redraw(['a', 'b']);
      expect(t.ids()).toEqual(['a#4', 'b#3']);
      expect(t.removed).toEqual(['a#1', 'b#2']);
    } finally {
      t.dispose();
    }
  });
});
