import { describe, it, expect, beforeEach } from 'vitest';
import { h, mount, mountCallback } from 'lithent';
import { defineElement } from '@/index';

/**
 * Phase 6 — moving an element keeps its instance (DC-4, MT-5).
 * Destroy waits one microtask; reconnecting before then cancels it.
 */

const log: string[] = [];
beforeEach(async () => {
  document.body.innerHTML = '';
  await new Promise<void>(resolve => queueMicrotask(resolve));
  log.length = 0;
});

const microtask = () => new Promise<void>(resolve => queueMicrotask(resolve));
const nextTask = () => new Promise<void>(resolve => setTimeout(resolve, 0));

/** A counter whose closure state shows whether the instance survived. */
const control: { inc: () => void } = { inc: () => {} };
const Counter = mount(renew => {
  let n = 0;
  control.inc = () => {
    n++;
    renew();
  };
  mountCallback(() => {
    log.push('mount');
    return () => log.push('unmount');
  });
  return () => h('b', {}, String(n));
});

defineElement('move-counter', Counter, { props: { label: String } });
defineElement('move-light', Counter, { shadow: false });

const setup = (tag = 'move-counter') => {
  document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
  const el = document.createElement(tag);
  document.getElementById('a')!.appendChild(el);
  const root = () => el.shadowRoot ?? el;
  return { el, text: () => root().textContent };
};

describe('DOM moves (DC-4)', () => {
  it('keeps state and does not unmount when moved within a task', async () => {
    const { el, text } = setup();
    control.inc();
    control.inc();
    await nextTask();
    expect(text()).toBe('2');

    document.getElementById('b')!.appendChild(el);
    await nextTask();
    expect(el.parentElement!.id).toBe('b');
    expect(text()).toBe('2');
    expect(log).toEqual(['mount']);

    // Still live: the same instance keeps updating.
    control.inc();
    await nextTask();
    expect(text()).toBe('3');
  });

  it('keeps state when removed and re-inserted by two calls in one task', async () => {
    // Single-call moves (appendChild, insertBefore, replaceChildren) run the
    // disconnect callback after the element is already back, so isConnected
    // alone covers them. A remove() followed by an insert in the same task is
    // the case the microtask wait exists for.
    const { el, text } = setup();
    control.inc();
    await nextTask();

    el.remove();
    document.getElementById('b')!.appendChild(el);
    await nextTask();
    expect(text()).toBe('1');
    expect(log).toEqual(['mount']);
  });

  it('keeps state across insertBefore and replaceChildren moves', async () => {
    const { el, text } = setup();
    control.inc();
    await nextTask();

    const b = document.getElementById('b')!;
    b.insertBefore(el, null);
    document.getElementById('a')!.replaceChildren(el);
    await nextTask();
    expect(text()).toBe('1');
    expect(log).toEqual(['mount']);
  });

  it('keeps a light-DOM element too, without clearing its rendered children', async () => {
    const { el, text } = setup('move-light');
    control.inc();
    await nextTask();
    document.getElementById('b')!.appendChild(el);
    await nextTask();
    expect(text()).toBe('1');
    expect(el.innerHTML).toBe('<b>1</b>');
    expect(log).toEqual(['mount']);
  });

  it('unmounts once a microtask passes with the element still detached', async () => {
    const { el } = setup();
    el.remove();
    expect(log).toEqual(['mount']);
    await microtask();
    expect(log).toEqual(['mount', 'unmount']);
  });

  it('starts a fresh instance when reattached in a later task', async () => {
    const { el, text } = setup();
    control.inc();
    await nextTask();
    el.remove();
    await nextTask();

    document.body.appendChild(el);
    expect(text()).toBe('0');
    expect(log).toEqual(['mount', 'unmount', 'mount']);
  });

  it('unmounts once when moved and then removed in the same task', async () => {
    const { el } = setup();
    document.getElementById('b')!.appendChild(el);
    el.remove();
    await nextTask();
    expect(log).toEqual(['mount', 'unmount']);
  });

  it('does not render a change made while detached, and shows it on reattach', async () => {
    const { el, text } = setup();
    el.remove();
    el.setAttribute('label', 'x');
    control.inc();
    await nextTask();
    expect(log).toEqual(['mount', 'unmount']);
    expect(el.shadowRoot!.childNodes.length).toBe(0);

    document.body.appendChild(el);
    expect(text()).toBe('0');
  });
});
