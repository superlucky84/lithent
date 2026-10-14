import { describe, it, expect } from 'vitest';
import { h, Fragment, render, mount, mountCallback, nextTick } from '@/index';

/**
 * Structural cases found by core-renderMatrix / core-renderFuzz.
 */
describe('structural update regressions', () => {
  it('unmounts a component replaced by a fragment with as many children', async () => {
    // A component's node is a one-child fragment, so <><b/></> used to be
    // taken for the same fragment and updated in place: the DOM was right,
    // but the component was never unmounted.
    let unmounted = 0;
    let show = true;
    let bump = () => {};

    const Child = mount(() => {
      mountCallback(() => () => {
        unmounted += 1;
      });
      return () => <p>child</p>;
    });
    const Parent = mount(renew => {
      bump = renew;
      return () =>
        show ? (
          <Child />
        ) : (
          <Fragment>
            <b>frag</b>
          </Fragment>
        );
    });

    const el = document.createElement('div');
    render(<Parent />, el);
    expect(el.innerHTML).toBe('<p>child</p>');

    show = false;
    bump();
    await nextTick();
    expect(el.innerHTML).toBe('<b>frag</b>');
    expect(unmounted).toBe(1);
  });

  it('keeps the position of a fragment or component replaced inside an unkeyed array', async () => {
    // The replacement used to be appended after the array's last item.
    let middle: unknown = (
      <Fragment>
        <b>frag</b>
      </Fragment>
    );
    let bump = () => {};

    const Comp = mount(() => () => <i>comp</i>);
    const Parent = mount(renew => {
      bump = renew;
      return () => <ul>{[<li>first</li>, middle, <li>last</li>]}</ul>;
    });

    const el = document.createElement('div');
    render(<Parent />, el);
    expect(el.innerHTML).toBe(
      '<ul><li>first</li><b>frag</b><li>last</li></ul>'
    );

    middle = 'text';
    bump();
    await nextTick();
    expect(el.innerHTML).toBe('<ul><li>first</li>text<li>last</li></ul>');

    middle = <Comp />;
    bump();
    await nextTick();
    middle = <span>element</span>;
    bump();
    await nextTick();
    expect(el.innerHTML).toBe(
      '<ul><li>first</li><span>element</span><li>last</li></ul>'
    );
  });

  it('inserts before the next sibling still in the document, past newly added ones', async () => {
    // Concurrent core: an added sibling's element is built ahead of the
    // commit, outside the document. The anchor search used to stop there and
    // append 'T' at the end instead of skipping on to the old 'T'.
    let swapped = false;
    let bump = () => {};

    const Comp = mount(() => () => (
      <Fragment>
        <i>c1</i>c2
      </Fragment>
    ));
    const Parent = mount(renew => {
      bump = renew;
      return () =>
        swapped ? (
          <Fragment>
            <p />
            {'T'}
            <Comp />
            {null}
          </Fragment>
        ) : (
          <Fragment>
            <p />
            <Comp />
            {null}
            {'T'}
          </Fragment>
        );
    });

    const el = document.createElement('div');
    render(<Parent />, el);
    expect(el.innerHTML).toBe('<p></p><i>c1</i>c2T');

    swapped = true;
    bump();
    await nextTick();
    expect(el.innerHTML).toBe('<p></p>T<i>c1</i>c2');
  });

  it('removes every old item when an unkeyed array becomes a keyed one', async () => {
    // Originals without a key share the key `undefined`; only the first of
    // them used to be removed, the others stayed in the DOM.
    let keyed = false;
    let bump = () => {};

    const Parent = mount(renew => {
      bump = renew;
      return () => (
        <ul>
          {keyed
            ? ['a', 'b'].map(k => <li key={k}>{k}</li>)
            : [<li>p1</li>, 'p2']}
        </ul>
      );
    });

    const el = document.createElement('div');
    render(<Parent />, el);
    expect(el.innerHTML).toBe('<ul><li>p1</li>p2</ul>');

    keyed = true;
    bump();
    await nextTick();
    expect(el.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  it('removes items whose key appeared twice in the previous render', async () => {
    let items = [
      { key: 'a', text: 'a1' },
      { key: 'a', text: 'a2' },
      { key: 'b', text: 'b' },
    ];
    let bump = () => {};

    const Parent = mount(renew => {
      bump = renew;
      return () => (
        <ul>
          {items.map(item => (
            <li key={item.key}>{item.text}</li>
          ))}
        </ul>
      );
    });

    const el = document.createElement('div');
    render(<Parent />, el);

    items = [{ key: 'b', text: 'b' }];
    bump();
    await nextTick();
    expect(el.innerHTML).toBe('<ul><li>b</li></ul>');
  });
});
