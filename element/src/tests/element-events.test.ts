import { describe, it, expect, beforeEach } from 'vitest';
import { h, mount } from 'lithent';
import { defineElement, emit } from '@/index';

/**
 * Phase 5 — events out of the element (FR-5, DC-5, DESIGN §6).
 * Each test uses its own tag name: the registry is global per file.
 */

beforeEach(() => {
  document.body.innerHTML = '';
});

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

type PayProps = { amount?: number; host: HTMLElement };

/** A button that emits `pay` and reports whether a listener cancelled it. */
const outcome: { allowed?: boolean } = {};
const PayButton = mount<PayProps>(
  (_renew, props) => () =>
    h(
      'button',
      {
        onClick: () => {
          outcome.allowed = emit(props.host, 'pay', { amount: props.amount });
        },
      },
      'Pay'
    )
);

const setup = (tag: `${string}-${string}`, shadow?: boolean | 'closed') => {
  defineElement(tag, PayButton, { props: { amount: Number }, shadow });
  document.body.innerHTML = `<div id="page"><${tag} amount="1000"></${tag}></div>`;
  const el = document.querySelector(tag) as HTMLElement;
  const root = shadow === false ? el : (el.shadowRoot ?? el);
  return { el, button: () => root.querySelector('button')! };
};

describe('host prop (DC-5)', () => {
  it('passes the element itself as props.host, also after a re-render', async () => {
    const hosts: unknown[] = [];
    const Probe = mount<{ host: HTMLElement }>((_r, props) => () => {
      hosts.push(props.host);
      return h('i', {}, '');
    });
    defineElement('evt-host', Probe, { props: { label: String } });
    document.body.innerHTML = '<evt-host></evt-host>';
    const el = document.querySelector('evt-host')!;

    el.setAttribute('label', 'x');
    await flush();
    expect(hosts).toEqual([el, el]);
  });

  it('rejects a declared prop named host and registers nothing', () => {
    // Rejected by the types too (Phase 7); this checks the runtime guard
    // for untyped callers.
    expect(() =>
      // @ts-expect-error host is reserved
      defineElement('evt-reserved', PayButton, { props: { host: String } })
    ).toThrow('"host" is reserved');
    expect(customElements.get('evt-reserved')).toBeUndefined();
  });
});

describe('emit (FR-5)', () => {
  it('reaches a listener on the element with the detail', () => {
    const { el, button } = setup('evt-basic');
    const got: unknown[] = [];
    el.addEventListener('pay', e => got.push((e as CustomEvent).detail));

    button().click();
    expect(got).toEqual([{ amount: 1000 }]);
    expect(outcome.allowed).toBe(true);
  });

  it('bubbles from the element to the page', () => {
    const { el, button } = setup('evt-bubbles');
    const seen: EventTarget[] = [];
    document
      .getElementById('page')!
      .addEventListener('pay', e => seen.push(e.target!));
    document.addEventListener('pay', e => seen.push(e.target!));

    button().click();
    expect(seen).toEqual([el, el]);
  });

  it('leaves an outer shadow root when the element is nested in one (composed)', () => {
    // emit dispatches on the element itself, so plain bubbling already
    // reaches the page. composed matters when the element sits inside
    // another component's shadow root, e.g. a host app built from custom
    // elements: without it the event stops at that root.
    defineElement('evt-nested', PayButton, { props: { amount: Number } });
    const outer = document.createElement('div');
    document.body.appendChild(outer);
    const outerRoot = outer.attachShadow({ mode: 'open' });
    outerRoot.innerHTML = '<evt-nested amount="5"></evt-nested>';
    const el = outerRoot.querySelector('evt-nested')!;

    const seen: EventTarget[] = [];
    document.addEventListener('pay', e => seen.push(e.target!));
    el.shadowRoot!.querySelector('button')!.click();
    // Retargeted to the outermost host the document can see.
    expect(seen).toEqual([outer]);
  });

  it('also crosses a closed shadow root', () => {
    const { el } = setup('evt-closed', 'closed');
    const got: unknown[] = [];
    document.addEventListener('pay', e => got.push(e.target));

    // The button is unreachable from outside, so emit on behalf of the
    // component: the host prop is the only handle it needs.
    emit(el, 'pay', 1);
    expect(got).toEqual([el]);
  });

  it('works from a light-DOM element', () => {
    const { el, button } = setup('evt-light', false);
    const got: unknown[] = [];
    el.addEventListener('pay', e => got.push((e as CustomEvent).detail));
    button().click();
    expect(got).toEqual([{ amount: 1000 }]);
  });

  it('returns false when the page cancels the event', () => {
    const { el, button } = setup('evt-cancel');
    el.addEventListener('pay', e => e.preventDefault());
    button().click();
    expect(outcome.allowed).toBe(false);
  });

  it('dispatches a CustomEvent with bubbles, composed and cancelable set', () => {
    const el = document.createElement('div');
    let event: CustomEvent | undefined;
    el.addEventListener('ping', e => (event = e as CustomEvent));
    emit(el, 'ping');
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event).toMatchObject({
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: null,
    });
  });
});
