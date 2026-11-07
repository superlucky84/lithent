import { describe, expect, it } from 'vitest';
import { Fragment, h, mount, nextTick, portal, render } from '@/index';

// A portal node's element is its target, which is not a child of the parent
// the portal sits in. Siblings around a portal must never use that target as
// an insertion anchor or move it (BUG-1).
const setup = (view: (target: HTMLElement) => unknown) => {
  const host = document.createElement('div');
  const target = document.createElement('section');
  document.body.append(host, target);
  let refresh = () => {};
  const App = mount(renew => {
    refresh = renew;
    return () => <div>{view(target)}</div>;
  });
  const dispose = render(<App />, host);
  const update = async () => {
    refresh();
    await nextTick();
  };
  const cleanup = () => {
    dispose();
    host.remove();
    target.remove();
  };
  return { host, target, update, cleanup };
};

describe('portal siblings (BUG-1)', () => {
  it('inserts a component that appears right before a portal', async () => {
    let show = false;
    const Child = mount(() => () => (
      <>
        <span>x</span>
        <b>y</b>
      </>
    ));
    const t = setup(target => [
      <p>head</p>,
      show ? <Child /> : null,
      portal(<i>{String(show)}</i>, target),
      <em>tail</em>,
    ]);
    expect(t.host.innerHTML).toBe('<div><p>head</p><em>tail</em></div>');

    show = true;
    await t.update();
    expect(t.host.innerHTML).toBe(
      '<div><p>head</p><span>x</span><b>y</b><em>tail</em></div>'
    );
    expect(t.target.innerHTML).toBe('<i>true</i>');
    expect(t.target.parentNode).toBe(document.body);

    show = false;
    await t.update();
    expect(t.host.innerHTML).toBe('<div><p>head</p><em>tail</em></div>');
    expect(t.target.innerHTML).toBe('<i>false</i>');
    t.cleanup();
  });

  it('inserts an element that appears right before a portal', async () => {
    let show = false;
    const t = setup(target => [
      <p>head</p>,
      show ? <span>x</span> : null,
      portal(<i>p</i>, target),
      <em>tail</em>,
    ]);
    show = true;
    await t.update();
    expect(t.host.innerHTML).toBe(
      '<div><p>head</p><span>x</span><em>tail</em></div>'
    );
    show = false;
    await t.update();
    expect(t.host.innerHTML).toBe('<div><p>head</p><em>tail</em></div>');
    expect(t.target.innerHTML).toBe('<i>p</i>');
    t.cleanup();
  });

  it('places a new last child after a trailing portal', async () => {
    let show = false;
    const t = setup(target => [
      <p>head</p>,
      show ? <span>x</span> : null,
      portal(<i>p</i>, target),
    ]);
    show = true;
    await t.update();
    expect(t.host.innerHTML).toBe('<div><p>head</p><span>x</span></div>');
    expect(t.target.innerHTML).toBe('<i>p</i>');
    t.cleanup();
  });

  it('moves keyed siblings around an unmoved portal', async () => {
    let order = ['a', 'b', 'c'];
    const t = setup(target =>
      order.map(key =>
        key === 'b' ? portal(<i>p</i>, target) : <b key={key}>{key}</b>
      )
    );
    expect(t.host.innerHTML).toBe('<div><b>a</b><b>c</b></div>');
    order = ['c', 'b', 'a'];
    await t.update();
    expect(t.host.innerHTML).toBe('<div><b>c</b><b>a</b></div>');
    expect(t.target.innerHTML).toBe('<i>p</i>');
    expect(t.target.parentNode).toBe(document.body);
    t.cleanup();
  });

  it('moves a keyed component that renders a portal without taking the target', async () => {
    let order = [1, 2, 3];
    const Row = mount<{ key?: unknown; id: number; target: HTMLElement }>(
      () =>
        ({ id, target }) => (
          <>
            <b>{id}</b>
            {id === 2 ? portal(<i>p{id}</i>, target) : null}
          </>
        )
    );
    const t = setup(target =>
      order.map(id => <Row key={id} id={id} target={target} />)
    );
    expect(t.host.innerHTML).toBe('<div><b>1</b><b>2</b><b>3</b></div>');
    order = [3, 2, 1];
    await t.update();
    expect(t.host.innerHTML).toBe('<div><b>3</b><b>2</b><b>1</b></div>');
    expect(t.target.innerHTML).toBe('<i>p2</i>');
    expect(t.target.parentNode).toBe(document.body);
    order = [2, 3, 1];
    await t.update();
    expect(t.host.innerHTML).toBe('<div><b>2</b><b>3</b><b>1</b></div>');
    expect(t.target.parentNode).toBe(document.body);
    t.cleanup();
  });

  it('removes a portal without touching siblings of the same count', async () => {
    let show = true;
    const t = setup(target => [
      <p>a</p>,
      <p>b</p>,
      show
        ? portal(
            <>
              <i>1</i>
              <i>2</i>
            </>,
            target
          )
        : null,
    ]);
    expect(t.host.innerHTML).toBe('<div><p>a</p><p>b</p></div>');
    expect(t.target.innerHTML).toBe('<i>1</i><i>2</i>');
    show = false;
    await t.update();
    expect(t.host.innerHTML).toBe('<div><p>a</p><p>b</p></div>');
    expect(t.target.innerHTML).toBe('');
    t.cleanup();
  });

  it('switches between a portal and an element in the same place', async () => {
    let usePortal = true;
    const t = setup(target => [
      <p>head</p>,
      usePortal ? portal(<i>p</i>, target) : <span>inline</span>,
      <em>tail</em>,
    ]);
    expect(t.host.innerHTML).toBe('<div><p>head</p><em>tail</em></div>');
    usePortal = false;
    await t.update();
    expect(t.host.innerHTML).toBe(
      '<div><p>head</p><span>inline</span><em>tail</em></div>'
    );
    expect(t.target.innerHTML).toBe('');
    usePortal = true;
    await t.update();
    expect(t.host.innerHTML).toBe('<div><p>head</p><em>tail</em></div>');
    expect(t.target.innerHTML).toBe('<i>p</i>');
    t.cleanup();
  });

  it('switches between a portal and a component in the same place', async () => {
    let usePortal = true;
    const Inline = mount(() => () => (
      <>
        <span>a</span>
        <span>b</span>
      </>
    ));
    const t = setup(target => [
      <p>head</p>,
      usePortal ? portal(<i>p</i>, target) : <Inline />,
      <em>tail</em>,
    ]);
    usePortal = false;
    await t.update();
    expect(t.host.innerHTML).toBe(
      '<div><p>head</p><span>a</span><span>b</span><em>tail</em></div>'
    );
    expect(t.target.innerHTML).toBe('');
    usePortal = true;
    await t.update();
    expect(t.host.innerHTML).toBe('<div><p>head</p><em>tail</em></div>');
    expect(t.target.innerHTML).toBe('<i>p</i>');
    t.cleanup();
  });

  it('keeps the target when a component that renders a portal is removed', async () => {
    let show = true;
    const Modal = mount<{ target: HTMLElement }>(() => ({ target }) => (
      <>
        <b>inline</b>
        {portal(<i>p</i>, target)}
      </>
    ));
    const t = setup(target => [
      <p>head</p>,
      show ? <Modal target={target} /> : null,
    ]);
    expect(t.host.innerHTML).toBe('<div><p>head</p><b>inline</b></div>');
    expect(t.target.innerHTML).toBe('<i>p</i>');
    show = false;
    await t.update();
    expect(t.host.innerHTML).toBe('<div><p>head</p></div>');
    expect(t.target.innerHTML).toBe('');
    expect(t.target.parentNode).toBe(document.body);
    t.cleanup();
  });

  it('removes keyed rows that render portals without removing the target', async () => {
    let ids = [1, 2, 3];
    const Row = mount<{ key?: unknown; id: number; target: HTMLElement }>(
      () =>
        ({ id, target }) => (
          <>
            <b>{id}</b>
            {portal(<i>{id}</i>, target)}
          </>
        )
    );
    const t = setup(target =>
      ids.map(id => <Row key={id} id={id} target={target} />)
    );
    expect(t.target.innerHTML).toBe('<i>1</i><i>2</i><i>3</i>');
    ids = [3];
    await t.update();
    expect(t.host.innerHTML).toBe('<div><b>3</b></div>');
    expect(t.target.innerHTML).toBe('<i>3</i>');
    expect(t.target.parentNode).toBe(document.body);
    ids = [];
    await t.update();
    expect(t.host.innerHTML).toBe('<div></div>');
    expect(t.target.innerHTML).toBe('');
    expect(t.target.parentNode).toBe(document.body);
    t.cleanup();
  });

  it('keeps unrelated target content when its portal is removed', async () => {
    let show = true;
    const t = setup(target => [
      <p>head</p>,
      show
        ? portal(
            <>
              <i>1</i>
              <i>2</i>
            </>,
            target
          )
        : null,
    ]);
    const outside = document.createElement('u');
    t.target.appendChild(outside);
    show = false;
    await t.update();
    expect(t.host.innerHTML).toBe('<div><p>head</p></div>');
    expect(t.target.innerHTML).toBe('<u></u>');
    t.cleanup();
  });
});
