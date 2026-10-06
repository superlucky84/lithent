import { describe, it, expect, beforeEach } from 'vitest';
import { h, mount, lmount, mountCallback } from 'lithent';
import { defineElement } from '@/index';

/**
 * Phase 1 — registration, mount and unmount (FR-1, FR-2 baseline).
 * The registry is global per test file, so every test uses its own tag name.
 */

const log: string[] = [];
beforeEach(() => {
  // Detach the previous test's elements first: their unmount logs must not
  // leak into this test's log.
  document.body.innerHTML = '';
  log.length = 0;
});

/** A component with closure state, a mount log and an unmount log. */
const makeCounter = (label: string) =>
  mount(renew => {
    let n = 0;
    mountCallback(() => {
      log.push(`mount ${label}`);
      return () => log.push(`unmount ${label}`);
    });
    return () =>
      h(
        'button',
        {
          onClick: () => {
            n++;
            renew();
          },
        },
        `${label} ${n}`
      );
  });

/** A child component, to check that unmount reaches below the top level. */
const Child = mount(() => {
  mountCallback(() => {
    log.push('mount child');
    return () => log.push('unmount child');
  });
  return () => h('i', {}, 'child');
});

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe('defineElement — registration (FR-1)', () => {
  it('registers the element and returns its constructor', () => {
    const ctor = defineElement('reg-basic', makeCounter('a'));
    expect(ctor).toBeTypeOf('function');
    expect(customElements.get('reg-basic')).toBe(ctor);
  });

  it('returns the existing constructor on a duplicate name without throwing (DC-7)', () => {
    const first = defineElement('reg-dup', makeCounter('first'));
    const second = defineElement('reg-dup', makeCounter('second'));
    expect(second).toBe(first);

    document.body.innerHTML = '<reg-dup></reg-dup>';
    const el = document.querySelector('reg-dup')!;
    expect(el.shadowRoot!.textContent).toBe('first 0');
  });

  it('lets the browser reject a name without a hyphen', () => {
    expect(() =>
      defineElement('nohyphen' as `${string}-${string}`, makeCounter('x'))
    ).toThrow();
  });
});

describe('defineElement — mount and unmount (FR-2)', () => {
  it('renders into an open shadow root by default (DC-8)', () => {
    defineElement('mnt-open', makeCounter('open'));
    const el = document.createElement('mnt-open');
    document.body.appendChild(el);

    expect(el.shadowRoot).not.toBeNull();
    expect(el.shadowRoot!.querySelector('button')!.textContent).toBe('open 0');
    expect(el.childNodes.length).toBe(0);
    expect(log).toEqual(['mount open']);
  });

  it('renders into the element itself with shadow: false', () => {
    defineElement('mnt-light', makeCounter('light'), { shadow: false });
    const el = document.createElement('mnt-light');
    document.body.appendChild(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('button')!.textContent).toBe('light 0');
  });

  it('renders into a closed shadow root that is not reachable from outside', () => {
    defineElement('mnt-closed', makeCounter('closed'), { shadow: 'closed' });
    const el = document.createElement('mnt-closed');
    document.body.appendChild(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.childNodes.length).toBe(0);
    expect(Object.values(el)).toEqual(
      expect.not.arrayContaining([expect.any(ShadowRoot)])
    );
    expect(log).toEqual(['mount closed']);
  });

  it('keeps closure state across renew inside the shadow root', async () => {
    defineElement('mnt-state', makeCounter('s'));
    const el = document.createElement('mnt-state');
    document.body.appendChild(el);

    const button = () => el.shadowRoot!.querySelector('button')!;
    button().click();
    button().click();
    await flush();
    expect(button().textContent).toBe('s 2');
  });

  it('upgrades an element that was in the document before definition', () => {
    document.body.innerHTML = '<mnt-upgrade></mnt-upgrade>';
    const el = document.querySelector('mnt-upgrade')!;
    expect(el.shadowRoot).toBeNull();

    defineElement('mnt-upgrade', makeCounter('up'));
    expect(el.shadowRoot!.textContent).toBe('up 0');
  });

  it('unmounts on disconnect, including nested components', () => {
    const Parent = mount(() => {
      mountCallback(() => {
        log.push('mount parent');
        return () => log.push('unmount parent');
      });
      return () => h('div', {}, h(Child, {}));
    });
    defineElement('mnt-unmount', Parent);
    const el = document.createElement('mnt-unmount');
    document.body.appendChild(el);
    expect(el.shadowRoot!.textContent).toBe('child');

    el.remove();
    expect(log.filter(entry => entry.startsWith('unmount')).sort()).toEqual([
      'unmount child',
      'unmount parent',
    ]);
    expect(el.shadowRoot!.childNodes.length).toBe(0);
  });

  it('mounts a fresh instance when reconnected after a disconnect', async () => {
    defineElement('mnt-again', makeCounter('again'), { shadow: 'closed' });
    const el = document.createElement('mnt-again');
    document.body.appendChild(el);
    el.remove();
    expect(log).toEqual(['mount again', 'unmount again']);

    // Closed root: reconnecting must reuse it, not call attachShadow twice.
    document.body.appendChild(el);
    await flush();
    expect(log).toEqual(['mount again', 'unmount again', 'mount again']);
  });

  it('accepts an lmount component', () => {
    const Light = lmount(() => () => h('span', {}, 'lmount'));
    defineElement('mnt-lmount', Light);
    const el = document.createElement('mnt-lmount');
    document.body.appendChild(el);
    expect(el.shadowRoot!.textContent).toBe('lmount');
  });
});
