import { describe, it, expect, beforeEach } from 'vitest';
import { h, mount, render } from 'lithent';
import { defineElement } from '@/index';

/**
 * Boundaries found in review (DESIGN §10.1, §10.2): prop names that matched
 * the element's internal fields, props a lithent parent stops passing (B-4),
 * and a parent that renders the tag before the definition and then repeats
 * the same values (B-3).
 */

beforeEach(() => {
  document.body.innerHTML = '';
});

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

type Seen = Record<string, unknown>;
const probe = (seen: Seen[]) =>
  mount<Seen & { host: HTMLElement }>((_r, props) => () => {
    const { host: _host, ...rest } = props;
    seen.push(rest);
    return h('i', {}, '');
  });

describe('prop names that used to be internal fields', () => {
  const spec = { p: String, d: String, r: Number, root: Object, a: Boolean };

  it('constructs, mounts and updates with props named p, d, r, root, a', async () => {
    const seen: Seen[] = [];
    defineElement('bd-names', probe(seen), { props: spec });
    const el = document.createElement('bd-names') as HTMLElement & Seen;
    // `d` set before connect used to read as "already mounted".
    el.d = 'set early';
    el.p = 'pee';
    document.body.appendChild(el);
    expect(el.shadowRoot!.innerHTML).toBe('<i></i>');
    expect(seen[seen.length - 1]).toMatchObject({ d: 'set early', p: 'pee' });

    // `r` used to replace renew.
    el.r = 3;
    el.setAttribute('a', '');
    el.root = { x: 1 };
    await flush();
    expect(seen[seen.length - 1]).toEqual({
      p: 'pee',
      d: 'set early',
      r: 3,
      root: { x: 1 },
      a: true,
    });

    el.remove();
    await flush();
    expect(el.shadowRoot!.innerHTML).toBe('');
  });
});

/** A lithent parent whose props for the child can be swapped. */
const parent = (tag: string, first: Seen) => {
  const control: { set: (next: Seen) => void } = { set: () => {} };
  const Host = mount(renew => {
    let props = first;
    control.set = next => {
      props = next;
      renew();
    };
    return () => h(tag, props);
  });
  const wrap = document.createElement('div');
  document.body.appendChild(wrap);
  render(h(Host, {}), wrap);
  return control;
};

describe('a prop the parent stops passing (B-4)', () => {
  const spec = { amount: Number, open: Boolean, options: Object };

  it('goes back to the attribute value: undefined, or false for a Boolean', async () => {
    const seen: Seen[] = [];
    defineElement('bd-remove', probe(seen), { props: spec });
    const control = parent('bd-remove', {
      amount: 10,
      open: true,
      options: { a: 1 },
    });
    expect(seen[seen.length - 1]).toEqual({
      amount: 10,
      open: true,
      options: { a: 1 },
    });

    control.set({});
    await flush();
    expect(seen[seen.length - 1]).toEqual({
      amount: undefined,
      open: false,
      options: undefined,
    });
    const el = document.querySelector('bd-remove') as HTMLElement & Seen;
    expect(el.amount).toBeUndefined();
  });

  it('falls back to an attribute that is still there', async () => {
    const seen: Seen[] = [];
    defineElement('bd-fallback', probe(seen), { props: spec });
    document.body.innerHTML =
      '<bd-fallback amount="5" open options=\'{"b":2}\'></bd-fallback>';
    const el = document.querySelector('bd-fallback') as HTMLElement & Seen;
    el.amount = 99;
    el.open = false;
    el.options = [1];
    await flush();

    el.amount = el.open = el.options = undefined;
    await flush();
    expect(seen[seen.length - 1]).toEqual({
      amount: 5,
      open: true,
      options: { b: 2 },
    });
  });
});

describe('a parent that renders the tag before the definition (B-3)', () => {
  const spec = { options: Object, open: Boolean, label: String };

  it('gets the real values on upgrade and keeps them when they repeat', async () => {
    const seen: Seen[] = [];
    const options = { first: true };
    const control = parent('bd-late', { options, open: false, label: 'x' });

    defineElement('bd-late', probe(seen), { props: spec });
    // Not "[object Object]" and `true` from the attribute strings.
    expect(seen[seen.length - 1]).toEqual({ options, open: false, label: 'x' });
    expect(seen[seen.length - 1].options).toBe(options);

    // The same values again: lithent skips them, the element keeps them.
    control.set({ options, open: false, label: 'x' });
    await flush();
    expect(seen[seen.length - 1]).toEqual({ options, open: false, label: 'x' });
    expect(seen[seen.length - 1].options).toBe(options);
  });

  it('does not bring back a prop removed before the definition', async () => {
    const seen: Seen[] = [];
    const control = parent('bd-late-drop', { options: { a: 1 }, open: true });
    control.set({});
    await flush();

    defineElement('bd-late-drop', probe(seen), { props: spec });
    expect(seen[seen.length - 1]).toEqual({
      options: undefined,
      open: false,
      label: undefined,
    });
  });
});

describe('found in the second review', () => {
  it('keeps a Boolean default when a prop goes away between upgrade and connect', async () => {
    const seen: Seen[] = [];
    const container = document.createElement('div');
    const control: { set: (next: Seen) => void } = { set: () => {} };
    const Host = mount(renew => {
      let props: Seen = { open: true, options: { a: 1 } };
      control.set = next => {
        props = next;
        renew();
      };
      return () => h('bd-detached', props);
    });
    render(h(Host, {}), container);

    defineElement('bd-detached', probe(seen), {
      props: { open: Boolean, options: Object },
    });
    customElements.upgrade(container);
    control.set({});
    await flush();
    document.body.appendChild(container);

    expect(seen[seen.length - 1]).toEqual({ open: false, options: undefined });
  });

  it('works with a prop named hasOwnProperty', () => {
    const seen: Seen[] = [];
    defineElement('bd-has-own', probe(seen), {
      props: { hasOwnProperty: Object },
    });
    const el = document.createElement('bd-has-own') as HTMLElement & Seen;
    el.hasOwnProperty = { x: 1 };
    expect(() => document.body.appendChild(el)).not.toThrow();
    expect(seen[seen.length - 1]).toEqual({ hasOwnProperty: { x: 1 } });
  });
});
