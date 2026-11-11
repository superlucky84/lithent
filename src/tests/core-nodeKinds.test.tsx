import { describe, expect, it } from 'vitest';
import { h, Fragment, mount, render } from '@/index';
import type { TagFunction, WDom } from '@/types';

// `h` takes Fragment at run time; Fragment's own signature (rest children) is
// not one of the tag types `h` declares.
const fragment = Fragment as unknown as TagFunction;

/**
 * What `h` makes of each kind of tag: a string, Fragment, a component, and
 * anything else, which is taken for an element as it always was.
 */
describe('node kinds made by h', () => {
  it('makes an element of a string tag, with props defaulting to an object', () => {
    const empty = h('div', null as never) as WDom;
    const filled = h('p', { id: 'x' }, 'a', 'b') as WDom;

    expect(empty.type).toBe('e');
    expect(empty.tag).toBe('div');
    expect(empty.props).toEqual({});
    expect(empty.children).toEqual([]);

    expect(filled.props).toEqual({ id: 'x' });
    expect((filled.children as WDom[]).map(child => child.text)).toEqual([
      'a',
      'b',
    ]);
    (filled.children as WDom[]).forEach(child =>
      expect(child.getParent!()).toBe(filled)
    );
  });

  it('makes a fragment that owns its children, with and without any', () => {
    const empty = h(fragment, {}) as WDom;
    const filled = h(fragment, {}, 'a', h('b', {})) as WDom;

    expect(empty.type).toBe('f');
    expect(empty.tag).toBe(undefined);
    expect(empty.children).toEqual([]);

    expect(filled.type).toBe('f');
    expect((filled.children as WDom[]).map(child => child.type)).toEqual([
      't',
      'e',
    ]);
    (filled.children as WDom[]).forEach(child =>
      expect(child.getParent!()).toBe(filled)
    );
  });

  it('draws a fragment made by h like one written in JSX', () => {
    const host = document.createElement('div');
    const dispose = render(
      h('section', {}, h(fragment, {}, h('i', {}), 'text')) as WDom,
      host
    );

    expect(host.innerHTML).toBe('<section><i></i>text</section>');
    dispose();
  });

  it('resolves a component outside a redraw into a node that carries it', () => {
    const Comp = mount<{ label: string }>(() => ({ label }) => (
      <em>{label}</em>
    ));
    const node = h(Comp as unknown as TagFunction, { label: 'hi' }) as WDom;

    expect(node.type).toBe('f');
    expect(node.ctor).toBe(Comp);
    expect((node.children as WDom[])[0].tag).toBe('em');
  });

  it('takes a tag that is neither a string nor a function for an element', () => {
    const odd = { not: 'a tag' } as unknown as TagFunction;
    const node = h(odd, { id: 'x' }, 'a') as WDom;

    expect(node.type).toBe('e');
    expect(node.tag).toBe(odd);
    expect(node.props).toEqual({ id: 'x' });
    expect((node.children as WDom[])[0].getParent!()).toBe(node);
  });
});
