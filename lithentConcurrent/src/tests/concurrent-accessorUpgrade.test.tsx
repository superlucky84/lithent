import { describe, it, expect } from 'vitest';
import { h, render, mount } from '@/index';

/**
 * Props are assigned as properties when the element's prototype has an
 * accessor for them, otherwise set as attributes. The answer used to be
 * cached per tag name, so a custom element rendered before its definition
 * kept getting attributes after the upgrade: objects arrived as
 * "[object Object]" and `false` as a present (true) attribute.
 * Found while building lithent/element (docs/element/DESIGN.md §10.1, B-2).
 */

const flush = async () => {
  for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0));
};

/** A plain custom element with accessors, independent of lithent/element. */
const defineLate = (tag: string) => {
  class Late extends HTMLElement {
    o: unknown;
    f: unknown;
    get options() {
      return this.o;
    }
    set options(v: unknown) {
      this.o = v;
    }
    get flag() {
      return this.f;
    }
    set flag(v: unknown) {
      this.f = v;
    }
  }
  customElements.define(tag, Late);
};

const setup = (tag: string, first: unknown) => {
  const control: { set: (o: unknown, f: boolean) => void } = { set: () => {} };
  const Host = mount(renew => {
    let options = first;
    let flag = true;
    control.set = (o, f) => {
      options = o;
      flag = f;
      renew();
    };
    return () => h(tag, { options, flag });
  });
  const wrap = document.createElement('div');
  document.body.appendChild(wrap);
  render(h(Host, {}), wrap);
  const el = wrap.querySelector(tag) as HTMLElement & {
    options?: unknown;
    flag?: unknown;
  };
  return { el, control };
};

describe('property or attribute after a custom element upgrade', () => {
  it('assigns properties once an element rendered before its definition is upgraded', async () => {
    const { el, control } = setup('acc-late', { a: 1 });
    // Not defined yet: no accessor, so attributes (nothing else is possible).
    expect(el.getAttribute('options')).toBe('[object Object]');

    defineLate('acc-late');
    const next = { b: 2 };
    control.set(next, false);
    await flush();

    expect(el.options).toBe(next);
    expect(el.flag).toBe(false);
  });

  it('assigns properties from the first render when defined first', async () => {
    defineLate('acc-early');
    const first = { a: 1 };
    const { el } = setup('acc-early', first);
    expect(el.options).toBe(first);
    expect(el.hasAttribute('options')).toBe(false);
  });

  it('keeps built-in elements as before', () => {
    const wrap = document.createElement('div');
    render(
      h(
        'div',
        {},
        h('input', { value: 'typed' }),
        h('div', { class: 'plain', title: 'tip', 'data-x': '1' }),
        h(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg' },
          h('a', { href: '#s' })
        )
      ),
      wrap
    );
    const input = wrap.querySelector('input') as HTMLInputElement;
    const div = wrap.querySelector('.plain') as HTMLDivElement;
    // input.value is an own accessor of HTMLInputElement.prototype: property.
    expect(input.value).toBe('typed');
    expect(input.hasAttribute('value')).toBe(false);
    // title is inherited from HTMLElement.prototype: attribute, as before.
    expect(div.getAttribute('title')).toBe('tip');
    expect(div.getAttribute('data-x')).toBe('1');
    expect(wrap.querySelector('a')!.getAttribute('href')).toBe('#s');
  });
});

/**
 * Two boundaries of the same path, from the review of the lithent/element
 * branch (docs/element/DESIGN.md §10.1):
 * B-3: after the upgrade, a parent that re-renders the same values skips
 *      them, so the props set as attributes before the definition stayed
 *      broken. lithent now also keeps them as own properties on an element
 *      that is not upgraded yet; the element takes those over.
 * B-4: a prop the parent stops passing was only removed as an attribute;
 *      a custom element property kept the old value.
 */
const hostWith = (tag: string, first: Record<string, unknown>) => {
  const control: { set: (p: Record<string, unknown>) => void } = {
    set: () => {},
  };
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
  const el = wrap.querySelector(tag) as HTMLElement & Record<string, unknown>;
  return { el, control };
};

/** Takes over own properties when connected, like lithent/element. */
const defineAbsorbing = (tag: string) => {
  class Absorbing extends HTMLElement {
    o: unknown;
    f: unknown;
    get options() {
      return this.o;
    }
    set options(v: unknown) {
      this.o = v;
    }
    get flag() {
      return this.f;
    }
    set flag(v: unknown) {
      this.f = v;
    }
    connectedCallback() {
      for (const key of ['options', 'flag']) {
        if (Object.prototype.hasOwnProperty.call(this, key)) {
          const value = (this as unknown as Record<string, unknown>)[key];
          delete (this as unknown as Record<string, unknown>)[key];
          (this as unknown as Record<string, unknown>)[key] = value;
        }
      }
    }
  }
  customElements.define(tag, Absorbing);
};

describe('values kept for an element that is not upgraded yet (B-3)', () => {
  it('keeps the real values as own properties next to the attributes', () => {
    const options = { a: 1 };
    const { el } = hostWith('pend-own', { options, flag: false, label: 'x' });
    expect(el.getAttribute('options')).toBe('[object Object]');
    expect(el.getAttribute('flag')).toBe('false');
    expect(Object.getOwnPropertyDescriptor(el, 'options')!.value).toBe(options);
    expect(Object.getOwnPropertyDescriptor(el, 'flag')!.value).toBe(false);
    expect(Object.getOwnPropertyDescriptor(el, 'label')!.value).toBe('x');
  });

  it('lets the element take them over when the same values render again', async () => {
    const options = { a: 1 };
    const { el, control } = hostWith('pend-same', { options, flag: false });
    // Taken over on upgrade (the element is connected).
    defineAbsorbing('pend-same');
    expect(el.options).toBe(options);
    expect(el.flag).toBe(false);

    // The same values again: skipped by the equality check, still right.
    control.set({ options, flag: false });
    await flush();
    expect(el.options).toBe(options);
    expect(el.flag).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(el, 'options')).toBe(false);
  });

  it('drops the own property when the prop goes away before the definition', async () => {
    const { el, control } = hostWith('pend-drop', { options: { a: 1 } });
    control.set({});
    await flush();
    expect(el.hasAttribute('options')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(el, 'options')).toBe(false);
  });

  it('adds no own properties to built-in or defined elements', () => {
    defineLate('pend-defined');
    const wrap = document.createElement('div');
    render(
      h(
        'div',
        {},
        h('section', { 'data-n': 1, hidden: false }),
        h('pend-defined', { label: 'x', 'data-n': 1 })
      ),
      wrap
    );
    for (const el of [
      wrap.querySelector('section')!,
      wrap.querySelector('pend-defined')!,
    ]) {
      expect(Object.prototype.hasOwnProperty.call(el, 'label')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(el, 'data-n')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(el, 'hidden')).toBe(false);
    }
  });
});

describe('removing a prop from a custom element (B-4)', () => {
  it('unsets the property as well as the attribute', async () => {
    defineLate('rm-prop');
    const options = { a: 1 };
    const { el, control } = hostWith('rm-prop', { options, flag: true });
    expect(el.options).toBe(options);

    control.set({});
    await flush();
    expect(el.options).toBeUndefined();
    expect(el.flag).toBeUndefined();
  });

  it('leaves built-in properties alone', async () => {
    const { el, control } = hostWith('input', { value: 'typed' });
    expect(el.value).toBe('typed');
    control.set({});
    await flush();
    // Same as before this change; assigning undefined would show "undefined".
    expect(el.value).toBe('');
  });
});
