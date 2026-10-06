import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { h, mount, Fragment } from 'lithent';
import type { FragmentFunction } from 'lithent';
import { defineElement } from '@/index';

/**
 * Phase 4 — styles, slots and light-DOM children (FR-6, FR-7, DC-6, R-2).
 * jsdom has no `adoptedStyleSheets`, so the default path here is the
 * `<style>` fallback; the adopted path is checked with a stub below and in a
 * real browser in Phase 9.
 */

beforeEach(async () => {
  document.body.innerHTML = '';
  // Let the previous test's deferred unmounts (DC-4) run first.
  await new Promise<void>(resolve => queueMicrotask(resolve));
});

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const Static = mount(() => () => h('p', {}, 'body'));

/** Renders `count` items at the root, so the root can go 0 <-> N children. */
const listControl: { set: (n: number) => void } = { set: () => {} };
const List = mount(renew => {
  let count = 2;
  listControl.set = n => {
    count = n;
    renew();
  };
  return () =>
    h(
      Fragment as FragmentFunction,
      {},
      Array.from({ length: count }, (_, i) => h('li', { key: i }, `i${i}`))
    );
});

const styleTexts = (root: ParentNode) =>
  Array.from(root.querySelectorAll('style')).map(s => s.textContent);

describe('styles: <style> fallback (FR-6)', () => {
  it('puts the joined styles first in each shadow root', () => {
    defineElement('sty-fallback', Static, {
      styles: ['p { color: red; }', 'p { margin: 0; }'],
    });
    document.body.innerHTML =
      '<sty-fallback></sty-fallback><sty-fallback></sty-fallback>';
    const [a, b] = Array.from(document.querySelectorAll('sty-fallback'));

    for (const el of [a, b]) {
      expect(styleTexts(el.shadowRoot!)).toEqual([
        'p { color: red; }\np { margin: 0; }',
      ]);
      expect(el.shadowRoot!.firstChild!.nodeName).toBe('STYLE');
      expect(el.shadowRoot!.querySelector('p')!.textContent).toBe('body');
    }
  });

  it('adds no <style> without styles', () => {
    defineElement('sty-none', Static);
    document.body.innerHTML = '<sty-none></sty-none>';
    const el = document.querySelector('sty-none')!;
    expect(styleTexts(el.shadowRoot!)).toEqual([]);
  });

  it('ignores styles in light DOM (DESIGN §4.4)', () => {
    defineElement('sty-light', Static, { shadow: false, styles: ['p{}'] });
    document.body.innerHTML = '<sty-light></sty-light>';
    const el = document.querySelector('sty-light')!;
    expect(styleTexts(el)).toEqual([]);
    expect(document.head.querySelectorAll('style').length).toBe(0);
  });

  it('keeps exactly one <style> through 0 <-> N renders, unmount and remount (R-2)', async () => {
    defineElement('sty-r2', List, { styles: ['li { color: blue; }'] });
    const el = document.createElement('sty-r2');
    document.body.appendChild(el);
    const root = el.shadowRoot!;
    const items = () =>
      Array.from(root.querySelectorAll('li')).map(li => li.textContent);
    expect(items()).toEqual(['i0', 'i1']);

    listControl.set(0);
    await flush();
    expect(items()).toEqual([]);
    expect(styleTexts(root)).toEqual(['li { color: blue; }']);

    listControl.set(3);
    await flush();
    expect(items()).toEqual(['i0', 'i1', 'i2']);
    expect(root.firstChild!.nodeName).toBe('STYLE');

    el.remove();
    await flush();
    expect(items()).toEqual([]);
    expect(styleTexts(root)).toEqual(['li { color: blue; }']);

    document.body.appendChild(el);
    expect(items()).toEqual(['i0', 'i1']);
    expect(styleTexts(root)).toEqual(['li { color: blue; }']);
    expect(root.firstChild!.nodeName).toBe('STYLE');
  });
});

describe('styles: adoptedStyleSheets (FR-6)', () => {
  const adopted = new WeakMap<ShadowRoot, unknown[]>();
  const created: { css: string[] }[] = [];

  beforeEach(() => {
    created.length = 0;
    Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
      configurable: true,
      get(this: ShadowRoot) {
        return adopted.get(this) || [];
      },
      set(this: ShadowRoot, sheets: unknown[]) {
        adopted.set(this, sheets);
      },
    });
    vi.stubGlobal(
      'CSSStyleSheet',
      class {
        css: string[] = [];
        constructor() {
          created.push(this);
        }
        replaceSync(text: string) {
          this.css.push(text);
        }
      }
    );
  });

  afterEach(() => {
    delete (ShadowRoot.prototype as unknown as Record<string, unknown>)
      .adoptedStyleSheets;
    vi.unstubAllGlobals();
  });

  it('shares one sheet per definition across instances, with no <style>', () => {
    defineElement('sty-adopted', Static, { styles: ['p{color:red}'] });
    document.body.innerHTML =
      '<sty-adopted></sty-adopted><sty-adopted></sty-adopted>';
    const [a, b] = Array.from(document.querySelectorAll('sty-adopted'));

    expect(created.length).toBe(1);
    expect(created[0].css).toEqual(['p{color:red}']);
    expect(a.shadowRoot!.adoptedStyleSheets).toEqual([created[0]]);
    expect(b.shadowRoot!.adoptedStyleSheets[0]).toBe(
      a.shadowRoot!.adoptedStyleSheets[0]
    );
    expect(styleTexts(a.shadowRoot!)).toEqual([]);
  });

  it('does not create a sheet for a definition without styles', () => {
    defineElement('sty-adopted-none', Static);
    document.body.innerHTML = '<sty-adopted-none></sty-adopted-none>';
    expect(created.length).toBe(0);
  });
});

describe('slots (FR-7)', () => {
  it('projects light DOM children into a rendered <slot>', async () => {
    const Card = mount(
      () => () => h('section', {}, h('h2', {}, 'title'), h('slot', {}))
    );
    defineElement('slot-card', Card);
    document.body.innerHTML = '<slot-card><b>one</b><i>two</i></slot-card>';
    const el = document.querySelector('slot-card')!;
    const slot = el.shadowRoot!.querySelector('slot')!;

    expect(slot.assignedNodes().map(n => n.nodeName)).toEqual(['B', 'I']);

    el.appendChild(document.createElement('u'));
    await flush();
    expect(slot.assignedNodes().map(n => n.nodeName)).toEqual(['B', 'I', 'U']);
  });

  it('projects into named slots', () => {
    const Named = mount(
      () => () => h('div', {}, h('slot', { name: 'head' }), h('slot', {}))
    );
    defineElement('slot-named', Named);
    document.body.innerHTML =
      '<slot-named><span slot="head">H</span><em>body</em></slot-named>';
    const el = document.querySelector('slot-named')!;
    const [head, rest] = Array.from(el.shadowRoot!.querySelectorAll('slot'));
    expect(head.assignedNodes().map(n => n.textContent)).toEqual(['H']);
    expect(rest.assignedNodes().map(n => n.textContent)).toEqual(['body']);
  });
});

describe('light DOM children (DC-6)', () => {
  it('replaces server fallback content on the first render', () => {
    defineElement('light-fallback', Static, { shadow: false });
    document.body.innerHTML =
      '<light-fallback><p class="ssr">loading…</p>text</light-fallback>';
    const el = document.querySelector('light-fallback')!;
    expect(el.innerHTML).toBe('<p>body</p>');
  });

  it('drops children added while detached before rendering again', async () => {
    defineElement('light-again', Static, { shadow: false });
    const el = document.createElement('light-again');
    document.body.appendChild(el);
    el.remove();
    await flush();
    el.appendChild(document.createElement('hr'));

    document.body.appendChild(el);
    expect(el.innerHTML).toBe('<p>body</p>');
  });

  it('leaves light DOM children alone in shadow mode', () => {
    defineElement('light-kept', Static);
    document.body.innerHTML = '<light-kept><b>kept</b></light-kept>';
    const el = document.querySelector('light-kept')!;
    expect(el.innerHTML).toBe('<b>kept</b>');
  });
});
