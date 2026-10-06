import { describe, it, expect, beforeEach } from 'vitest';
import { h, mount } from 'lithent';
import { defineElement } from '@/index';

/**
 * Phase 3 — properties -> props (FR-4, DESIGN §4.2-§4.3).
 * Each test uses its own tag name: the registry is global per file.
 */

const seen: Record<string, unknown>[] = [];
beforeEach(() => {
  document.body.innerHTML = '';
  seen.length = 0;
});

/** Records the props object it sees (shallow copy keeps references). */
const Probe = mount<Record<string, unknown>>((_renew, props) => () => {
  seen.push({ ...props });
  return h('p', {}, String(props.label ?? ''));
});

const spec = { label: String, amount: Number, options: Object };

type PropEl = HTMLElement & Record<string, unknown>;

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));
const last = () => seen[seen.length - 1];

const create = (tag: `${string}-${string}`) => {
  defineElement(tag, Probe, { props: spec });
  const el = document.createElement(tag) as PropEl;
  document.body.appendChild(el);
  return el;
};

describe('property assignment (FR-4)', () => {
  it('passes objects through by reference, without conversion', async () => {
    const el = create('prop-ref');
    const options = { nested: [1, 2] };
    const onPick = () => 'picked';

    el.options = options;
    el.amount = '12' as unknown as number;
    await flush();
    expect(last().options).toBe(options);
    expect(last().amount).toBe('12');

    // An undeclared function prop is just an expando, not a prop.
    el.onPick = onPick;
    await flush();
    expect(last()).not.toHaveProperty('onPick');
  });

  it('reads back the current prop, whichever way it was set', async () => {
    const el = create('prop-read');
    el.setAttribute('amount', '3');
    expect(el.amount).toBe(3);

    el.amount = 4;
    expect(el.amount).toBe(4);
  });

  it('does not reflect properties to attributes (DC-3)', () => {
    const el = create('prop-noreflect');
    el.label = 'x';
    expect(el.hasAttribute('label')).toBe(false);
  });

  it('lets the last write win between attribute and property', async () => {
    const el = create('prop-order');
    el.setAttribute('label', 'attr');
    el.label = 'prop';
    await flush();
    expect(last().label).toBe('prop');

    el.setAttribute('label', 'attr2');
    await flush();
    expect(last().label).toBe('attr2');
  });

  it('renders once for several property writes in one task', async () => {
    const el = create('prop-batch');
    expect(seen.length).toBe(1);
    el.label = 'a';
    el.amount = 1;
    el.options = {};
    await flush();
    expect(seen.length).toBe(2);
  });

  it('applies a property set before connect on the first render', () => {
    defineElement('prop-preconnect', Probe, { props: spec });
    const el = document.createElement('prop-preconnect') as PropEl;
    const options = { a: 1 };
    el.options = options;
    expect(seen.length).toBe(0);

    document.body.appendChild(el);
    expect(seen.length).toBe(1);
    expect(last().options).toBe(options);
  });
});

describe('assignment before definition (DESIGN §4.2)', () => {
  it('absorbs a value set on a created element, then upgraded', () => {
    const el = document.createElement('prop-early') as PropEl;
    const options = { early: true };
    el.options = options;
    el.label = 'early';
    document.body.appendChild(el);

    defineElement('prop-early', Probe, { props: spec });
    expect(last()).toMatchObject({ label: 'early', options });
    expect(Object.prototype.hasOwnProperty.call(el, 'options')).toBe(false);

    // The accessor is live now: later writes re-render.
    el.label = 'later';
    return flush().then(() => expect(last().label).toBe('later'));
  });

  it('absorbs a value set on a parsed element, then upgraded', () => {
    document.body.innerHTML = '<prop-parsed label="attr"></prop-parsed>';
    const el = document.querySelector('prop-parsed') as PropEl;
    const options = [1, 2, 3];
    el.options = options;

    defineElement('prop-parsed', Probe, { props: spec });
    expect(last()).toMatchObject({ label: 'attr', options });
    expect(el.options).toBe(options);
  });
});

describe('a prop named like a native property', () => {
  it('shadows the native property: the prop wins, the attribute is not set', async () => {
    defineElement('prop-native', Probe, { props: { title: String } });
    const el = document.createElement('prop-native') as PropEl;
    document.body.appendChild(el);

    el.title = 'from prop';
    await flush();
    expect(last().title).toBe('from prop');
    // HTMLElement.title would have set the attribute; the prop accessor does not.
    expect(el.hasAttribute('title')).toBe(false);

    el.setAttribute('title', 'from attr');
    await flush();
    expect(el.title).toBe('from attr');
  });
});
