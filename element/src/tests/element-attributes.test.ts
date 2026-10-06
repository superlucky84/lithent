import { describe, it, expect, beforeEach } from 'vitest';
import { h, mount, lmount } from 'lithent';
import { defineElement } from '@/index';

/**
 * Phase 2 — attributes -> props (FR-3, DESIGN §4.1).
 * Each test uses its own tag name: the registry is global per file.
 */

/** Every props object the inner component rendered with, in order. */
const seen: Record<string, unknown>[] = [];
beforeEach(() => {
  document.body.innerHTML = '';
  seen.length = 0;
});

/** Records the props it sees through its setup-time `props` reference. */
const Probe = mount<Record<string, unknown>>((_renew, props) => () => {
  seen.push({ ...props });
  return h('p', {}, JSON.stringify(props));
});

const spec = {
  label: String,
  amount: Number,
  disabled: Boolean,
  options: Object,
  maxCount: Number,
};

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));
const last = () => seen[seen.length - 1];

const mountProbe = (tag: `${string}-${string}`, attrs = '') => {
  defineElement(tag, Probe, { props: spec });
  document.body.innerHTML = `<${tag} ${attrs}></${tag}>`;
  return document.querySelector(tag)!;
};

describe('attribute conversion (DESIGN §4.1)', () => {
  it('converts every declared type from the initial attributes', () => {
    const el = mountProbe(
      'attr-initial',
      `label="hi" amount="12.5" disabled options='{"a":[1,2]}' max-count="3"`
    );
    expect(seen).toEqual([
      {
        label: 'hi',
        amount: 12.5,
        disabled: true,
        options: { a: [1, 2] },
        maxCount: 3,
        host: el,
      },
    ]);
  });

  it('gives Boolean false for an absent attribute and true for "false"', async () => {
    const el = mountProbe('attr-bool');
    expect(last().disabled).toBe(false);

    el.setAttribute('disabled', 'false');
    await flush();
    expect(last().disabled).toBe(true);

    el.removeAttribute('disabled');
    await flush();
    expect(last().disabled).toBe(false);
  });

  it('turns invalid numbers and invalid JSON into undefined', async () => {
    const el = mountProbe('attr-invalid', `amount="1" options='{"ok":1}'`);
    expect(last()).toMatchObject({ amount: 1, options: { ok: 1 } });

    el.setAttribute('amount', 'abc');
    el.setAttribute('options', '{not json');
    await flush();
    expect(last().amount).toBeUndefined();
    expect(last().options).toBeUndefined();
  });

  it('gives undefined when a String, Number or Object attribute is removed', async () => {
    const el = mountProbe('attr-remove', `label="x" amount="2" options='[1]'`);
    el.removeAttribute('label');
    el.removeAttribute('amount');
    el.removeAttribute('options');
    await flush();
    expect(last()).toMatchObject({
      label: undefined,
      amount: undefined,
      options: undefined,
    });
  });

  it('maps kebab-case attributes to camelCase props', async () => {
    const el = mountProbe('attr-kebab');
    el.setAttribute('max-count', '7');
    await flush();
    expect(last().maxCount).toBe(7);
    expect(
      (el.constructor as unknown as { observedAttributes: string[] })
        .observedAttributes
    ).toEqual(['label', 'amount', 'disabled', 'options', 'max-count']);
  });
});

describe('attribute updates (FR-3)', () => {
  it('re-renders with the new value and keeps the DOM node', async () => {
    const el = mountProbe('attr-update', 'label="a"');
    const p = el.shadowRoot!.querySelector('p')!;

    el.setAttribute('label', 'b');
    await flush();
    expect(last().label).toBe('b');
    expect(el.shadowRoot!.querySelector('p')).toBe(p);
    expect(p.textContent).toContain('"label":"b"');
  });

  it('renders once for several changes in the same task', async () => {
    const el = mountProbe('attr-batch');
    expect(seen.length).toBe(1);

    el.setAttribute('label', 'x');
    el.setAttribute('amount', '5');
    el.setAttribute('disabled', '');
    await flush();
    expect(seen.length).toBe(2);
    expect(last()).toMatchObject({ label: 'x', amount: 5, disabled: true });
  });

  it('does not render for an undeclared attribute', async () => {
    const el = mountProbe('attr-undeclared');
    el.setAttribute('title', 'ignored');
    el.setAttribute('data-x', '1');
    await flush();
    expect(seen.length).toBe(1);
  });

  it('applies attributes set before connect on the first render', () => {
    defineElement('attr-before', Probe, { props: spec });
    const el = document.createElement('attr-before');
    el.setAttribute('label', 'early');
    el.setAttribute('amount', '9');
    expect(seen.length).toBe(0);

    document.body.appendChild(el);
    expect(seen).toEqual([
      { label: 'early', amount: 9, disabled: false, host: el },
    ]);
  });

  it('ignores changes while disconnected and renders the latest on reconnect', async () => {
    const el = mountProbe('attr-detached', 'label="one"');
    el.remove();
    el.setAttribute('label', 'two');
    await flush();
    expect(seen.length).toBe(1);

    document.body.appendChild(el);
    expect(last().label).toBe('two');
  });

  it('updates an lmount component through its props reference', async () => {
    const LProbe = lmount<{ label?: string }>(
      props => () => h('span', {}, props.label ?? '-')
    );
    defineElement('attr-lmount', LProbe, { props: { label: String } });
    document.body.innerHTML = '<attr-lmount label="first"></attr-lmount>';
    const el = document.querySelector('attr-lmount')!;
    expect(el.shadowRoot!.textContent).toBe('first');

    el.setAttribute('label', 'second');
    await flush();
    expect(el.shadowRoot!.textContent).toBe('second');
  });
});
