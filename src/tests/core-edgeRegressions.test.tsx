import { describe, it, expect } from 'vitest';
import { h, Fragment, render, mount, mountCallback, nextTick } from '@/index';

/**
 * Cases found by porting edge cases from the preact, inferno and React
 * suites (keys, placeholders, vnode reuse, sibling DOM changes) and by
 * core-renderFuzz with hoisted nodes, stateful wrappers and batched renews.
 */

const flush = async () => {
  for (let i = 0; i < 3; i++) await nextTick();
};

/** A component that records its mounts and unmounts. */
const tracked = (log: string[], name: string) =>
  mount<{ label?: string }>((_renew, props) => {
    mountCallback(() => {
      log.push(`mount ${name}`);
      return () => log.push(`unmount ${name}`);
    });
    return () => <em>{props.label || name}</em>;
  });

describe('keys', () => {
  it('keeps keys when the first item of a list is null', async () => {
    // `rows.map(r => r.hidden ? null : <li key=.../>)`: a leading null used
    // to switch key matching off, so items were matched by position.
    let order = ['a', 'b', 'c'];
    let bump = () => {};
    const List = mount(renew => {
      bump = renew;
      return () => <ul>{[null, ...order.map(k => <li key={k}>{k}</li>)]}</ul>;
    });

    const el = document.createElement('div');
    render(<List />, el);
    const [a, b, c] = Array.from(el.querySelectorAll('li'));

    order = ['c', 'a', 'b'];
    bump();
    await flush();
    expect(el.innerHTML).toBe('<ul><li>c</li><li>a</li><li>b</li></ul>');
    expect(Array.from(el.querySelectorAll('li'))).toEqual([c, a, b]);
  });

  it('keeps unkeyed items among keyed ones in place', async () => {
    // Every unkeyed item shared the key `undefined`, so all but the first
    // were drawn again on every render.
    let bump = () => {};
    const List = mount(renew => {
      bump = renew;
      return () => (
        <ul>
          {[<li key="a">a</li>, <li>x</li>, <li>y</li>, <li key="b">b</li>]}
        </ul>
      );
    });

    const el = document.createElement('div');
    render(<List />, el);
    const before = Array.from(el.querySelectorAll('li'));

    bump();
    await flush();
    expect(Array.from(el.querySelectorAll('li'))).toEqual(before);
  });

  it('moves an unkeyed item matched by position along with a keyed reorder', async () => {
    let swapped = false;
    let bump = () => {};
    const List = mount(renew => {
      bump = renew;
      return () => (
        <ul>
          {swapped
            ? [<p key="p">p</p>, <span>s</span>, null]
            : [null, <span>s</span>, <p key="p">p</p>]}
        </ul>
      );
    });

    const el = document.createElement('div');
    render(<List />, el);

    swapped = true;
    bump();
    await flush();
    expect(el.innerHTML).toBe('<ul><p>p</p><span>s</span></ul>');
  });

  it('keeps an input focused while its keyed row redraws itself', async () => {
    // The row's nodes used to be taken out and put back on every redraw of
    // its own, which blurs the input (and reloads an iframe).
    const type: Record<string, () => void> = {};
    const Row = mount<{ id: string; key?: string }>((renew, props) => {
      let value = '';
      type[props.id] = () => {
        value += 'x';
        renew();
      };
      return () => (
        <li>
          <input />
          {value}
        </li>
      );
    });

    const el = document.createElement('div');
    document.body.appendChild(el);
    render(
      <ul>
        {['a', 'b', 'c'].map(id => (
          <Row key={id} id={id} />
        ))}
      </ul>,
      el
    );
    const input = el.querySelectorAll('input')[1];
    input.focus();
    const observer = new MutationObserver(() => {});
    observer.observe(el, { subtree: true, childList: true });

    type.b();
    await flush();
    const moved = observer
      .takeRecords()
      .filter(record => record.target.nodeName === 'UL');
    expect(document.activeElement).toBe(input);
    expect(moved).toEqual([]);
    expect(el.querySelectorAll('li')[1].textContent).toBe('x');
    el.remove();
  });

  it('places a kept row whose content changed while the list is reordered', async () => {
    // Sorting while a row expands: the row's new content was anchored to a
    // sibling that had not been moved yet.
    let sorted = false;
    let bump = () => {};
    const Row = mount<{ open: boolean; label: string; key?: string }>(
      (_r, props) => () =>
        props.open ? (
          <Fragment>
            <b>{props.label}</b>
            <i>details</i>
          </Fragment>
        ) : (
          <Fragment>{props.label}</Fragment>
        )
    );
    const List = mount(renew => {
      bump = renew;
      return () => (
        <ul>
          {(sorted ? ['a', 'c', 'b', 'd'] : ['a', 'b', 'c', 'd']).map(k => (
            <Row key={k} label={k} open={sorted && k === 'a'} />
          ))}
        </ul>
      );
    });

    const el = document.createElement('div');
    render(<List />, el);

    sorted = true;
    bump();
    await flush();
    expect(el.innerHTML).toBe('<ul><b>a</b><i>details</i>cbd</ul>');
  });
});

describe('children', () => {
  it('renders nothing for true, like false', () => {
    const el = document.createElement('div');
    render(
      <div>
        {true as unknown as string}
        {0}
        <i />
      </div>,
      el
    );
    expect(el.innerHTML).toBe('<div>0<i></i></div>');
  });
});

describe('redraw scheduling', () => {
  it('draws a renew raised for a component already drawn in this flush', async () => {
    // A new child's mountCallback renews its parent while the parent's own
    // redraw is being flushed; that renew used to be dropped.
    let show = false;
    let reported = 0;
    let bump = () => {};
    const Child = mount<{ report: () => void }>((_r, props) => {
      mountCallback(() => props.report());
      return () => <i>child</i>;
    });
    const Parent = mount(renew => {
      bump = renew;
      const report = () => {
        reported++;
        renew();
      };
      return () => (
        <div>
          {show ? <Child report={report} /> : null}
          <b>{reported}</b>
        </div>
      );
    });

    const el = document.createElement('div');
    render(<Parent />, el);

    show = true;
    bump();
    await flush();
    expect(el.innerHTML).toBe('<div><i>child</i><b>1</b></div>');
  });
});

describe('reused nodes', () => {
  it('shows a hoisted empty state again after it was replaced', async () => {
    // Replacing a node used to empty its children, so the constant came
    // back as an empty <p>.
    const empty = <p>No items</p>;
    let items: string[] = [];
    let bump = () => {};
    const List = mount(renew => {
      bump = renew;
      return () =>
        items.length ? (
          <ul>
            {items.map(i => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        ) : (
          empty
        );
    });

    const el = document.createElement('div');
    render(<List />, el);
    for (const next of [['a'], [], ['a', 'b'], []]) {
      items = next;
      bump();
      await flush();
      expect(el.innerHTML).toBe(
        next.length
          ? `<ul>${next.map(i => `<li>${i}</li>`).join('')}</ul>`
          : '<p>No items</p>'
      );
    }
  });

  it('draws one element node in several places', async () => {
    // A node keeps the state of the place it is drawn in, so a second place
    // overwrote it and later updates of the first one hit the wrong DOM.
    const icon = <b>icon</b>;
    const toggles: (() => void)[] = [];
    const Row = mount(renew => {
      let on = true;
      toggles.push(() => {
        on = !on;
        renew();
      });
      return () => <i>{on ? icon : 'off'}</i>;
    });

    const el = document.createElement('div');
    render(
      <div>
        <Row />
        <Row />
        {icon}
      </div>,
      el
    );
    expect(el.innerHTML).toBe(
      '<div><i><b>icon</b></i><i><b>icon</b></i><b>icon</b></div>'
    );

    toggles[0]();
    await flush();
    expect(el.innerHTML).toBe(
      '<div><i>off</i><i><b>icon</b></i><b>icon</b></div>'
    );
    toggles[1]();
    toggles[0]();
    await flush();
    expect(el.innerHTML).toBe(
      '<div><i><b>icon</b></i><i>off</i><b>icon</b></div>'
    );
  });

  it('gives a hoisted component one instance per place', async () => {
    const log: string[] = [];
    const Icon = tracked(log, 'icon');
    const hoisted = <Icon />;
    let both = true;
    let bump = () => {};
    const App = mount(renew => {
      bump = renew;
      return () => (
        <div>
          {hoisted}
          {both ? hoisted : null}
        </div>
      );
    });

    const el = document.createElement('div');
    render(<App />, el);
    expect(el.innerHTML).toBe('<div><em>icon</em><em>icon</em></div>');
    expect(log).toEqual(['mount icon', 'mount icon']);

    both = false;
    bump();
    await flush();
    expect(el.innerHTML).toBe('<div><em>icon</em></div>');
    expect(log).toEqual(['mount icon', 'mount icon', 'unmount icon']);
  });

  it('keeps a hoisted component its own props next to the same component inline', async () => {
    // The instance got the hoisted node's props object, which the inline one
    // then overwrote in place.
    const Label = mount<{ label: string }>((_r, props) => () => (
      <em>{props.label}</em>
    ));
    const fallback = <Label label="star" />;
    let mode = 0;
    let bump = () => {};
    const App = mount(renew => {
      bump = renew;
      return () => (mode === 1 ? <Label label="heart" /> : fallback);
    });

    const el = document.createElement('div');
    render(<App />, el);
    for (const next of [1, 0, 1, 0]) {
      mode = next;
      bump();
      await flush();
      expect(el.innerHTML).toBe(next ? '<em>heart</em>' : '<em>star</em>');
    }
  });

  it('mounts a hoisted component first drawn by a redraw', async () => {
    const log: string[] = [];
    const Icon = tracked(log, 'icon');
    const hoisted = <Icon />;
    let show = false;
    let bump = () => {};
    const App = mount(renew => {
      bump = renew;
      return () => (show ? hoisted : <Fragment>{'x'}</Fragment>);
    });

    const el = document.createElement('div');
    render(<App />, el);

    show = true;
    bump();
    await flush();
    expect(el.innerHTML).toBe('<em>icon</em>');
    expect(log).toEqual(['mount icon']);
  });
});

describe('children drawn again by their component', () => {
  /** Wraps its children in <a> or not, on its own state. */
  const makeLink = (setToggle: (toggle: () => void) => void) =>
    mount((renew, _props, children) => {
      let wrapped = false;
      setToggle(() => {
        wrapped = !wrapped;
        renew();
      });
      return () =>
        wrapped ? <a>{children}</a> : <Fragment>{children}</Fragment>;
    });

  it('remounts children moved into another element, and they keep working', async () => {
    // The moved child was unmounted while still shown, so it never redrew
    // again.
    const log: string[] = [];
    let bumpChild = () => {};
    const Child = mount(renew => {
      let count = 0;
      bumpChild = () => {
        count++;
        renew();
      };
      mountCallback(() => {
        log.push('mount');
        return () => log.push('unmount');
      });
      return () => <em>{count}</em>;
    });
    let toggle = () => {};
    const Link = makeLink(next => (toggle = next));

    const el = document.createElement('div');
    render(
      <div>
        <Link>
          <Child />
          <span>s</span>
        </Link>
      </div>,
      el
    );

    toggle();
    await flush();
    bumpChild();
    await flush();
    expect(el.innerHTML).toBe('<div><a><em>1</em><span>s</span></a></div>');
    expect(log).toEqual(['mount', 'unmount', 'mount']);

    toggle();
    await flush();
    bumpChild();
    await flush();
    expect(el.innerHTML).toBe('<div><em>1</em><span>s</span></div>');
    expect(log).toEqual(['mount', 'unmount', 'mount', 'unmount', 'mount']);
  });

  it('remounts children moved after the parent redrew them', async () => {
    // After a parent redraw the children are resolvers. Drawn again in a new
    // place, the same resolver made a second instance with the first one's
    // key, and the first one was never unmounted.
    const log: string[] = [];
    const Child = tracked(log, 'child');
    let toggle = () => {};
    const Link = makeLink(next => (toggle = next));
    let bumpParent = () => {};
    const Parent = mount(renew => {
      bumpParent = renew;
      return () => (
        <Link>
          <Child />
        </Link>
      );
    });

    const el = document.createElement('div');
    render(<Parent />, el);
    bumpParent();
    await flush();

    toggle();
    await flush();
    toggle();
    await flush();
    expect(el.innerHTML).toBe('<em>child</em>');
    expect(log).toEqual([
      'mount child',
      'unmount child',
      'mount child',
      'unmount child',
      'mount child',
    ]);
  });

  it('reorders children it was given', async () => {
    let toggle = () => {};
    const Reverse = mount((renew, _props, children) => {
      let reversed = false;
      toggle = () => {
        reversed = !reversed;
        renew();
      };
      return () => (reversed ? [...children].reverse() : children) as never;
    });

    const el = document.createElement('div');
    render(
      <div>
        <Reverse>
          <i>1</i>
          <b>2</b>
          <u>3</u>
        </Reverse>
      </div>,
      el
    );

    toggle();
    await flush();
    expect(el.innerHTML).toBe('<div><u>3</u><b>2</b><i>1</i></div>');
    toggle();
    await flush();
    expect(el.innerHTML).toBe('<div><i>1</i><b>2</b><u>3</u></div>');
  });
});
