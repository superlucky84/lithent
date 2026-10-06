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
