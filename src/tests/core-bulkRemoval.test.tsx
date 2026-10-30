import { describe, expect, it } from 'vitest';
import {
  Fragment,
  h,
  mount,
  mountCallback,
  nextTick,
  render,
  portal,
} from '@/index';

// Shared with the concurrent suite. Observe DOM effects and lifecycle visibility,
// rather than depending on the renderer's internal removal helpers.
describe('removing nested component lists', () => {
  it('removes all roots in one mutation after cleanup and cancels stale renews', async () => {
    const host = document.createElement('div');
    let ids = [1, 2, 3];
    let renewList = () => {};
    const renewRows: (() => void)[] = [];
    const cleanup: [number, string | null][] = [];
    const Empty = mount(() => () => null);
    const Row = mount<{ id: number; key: number }>((renew, props) => {
      renewRows.push(renew);
      mountCallback(() => () => cleanup.push([props.id, host.textContent]));
      return () => (
        <Fragment>
          <b>{props.id}</b>
          {':' + props.id}
          <Empty />
        </Fragment>
      );
    });
    const List = mount(renew => {
      renewList = renew;
      return () => (
        <div>
          {ids.map(id => (
            <Row key={id} id={id} />
          ))}
        </div>
      );
    });
    const destroy = render(<List />, host);
    const parent = host.firstElementChild!;
    const original = [...parent.childNodes];
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver(records =>
      mutations.push(...records)
    );
    observer.observe(parent, { childList: true });
    ids = [];
    renewList();
    renewRows.forEach(renew => renew());
    await nextTick();
    mutations.push(...observer.takeRecords());
    observer.disconnect();
    expect(cleanup).toEqual([
      [1, '1:12:23:3'],
      [2, '1:12:23:3'],
      [3, '1:12:23:3'],
    ]);
    expect(parent.childNodes.length).toBe(0);
    // jsdom also reports an empty Fragment insertion. Only the removal
    // changes DOM; all six roots must be in that single removal record.
    const removals = mutations.filter(record => record.removedNodes.length);
    expect(removals).toHaveLength(1);
    expect([...removals[0].removedNodes]).toEqual(original);
    expect(mutations.every(record => record.addedNodes.length === 0)).toBe(
      true
    );
    ids = [4, 5];
    renewList();
    await nextTick();
    expect(parent.textContent).toBe('4:45:5');
    destroy();
    expect(cleanup.map(x => x[0])).toEqual([1, 2, 3, 4, 5]);
  });

  it('preserves outside siblings and keyed-removal callback visibility', async () => {
    const host = document.createElement('div');
    let ids = [1, 2, 3];
    let renewList = () => {};
    const cleanup: (string | null)[] = [];
    const Row = mount<{ id: number; key: number }>((_renew, props) => {
      mountCallback(() => () => cleanup.push(host.textContent));
      return () => (
        <Fragment>
          <b>{props.id}</b>
          {':' + props.id}
        </Fragment>
      );
    });
    const List = mount(renew => {
      renewList = renew;
      return () => (
        <div>
          <i>head</i>
          {ids.map(id => (
            <Row key={id} id={id} />
          ))}
          <i>tail</i>
        </div>
      );
    });
    const destroy = render(<List />, host);
    const [head, tail] = host.querySelectorAll('i');
    const kept = host.querySelectorAll('b')[2];
    ids = [3];
    renewList();
    await nextTick();
    expect(cleanup).toEqual(['head1:12:23:3tail', 'head2:23:3tail']);
    expect(host.querySelector('b')).toBe(kept);
    ids = [];
    renewList();
    await nextTick();
    expect([...host.firstElementChild!.children]).toEqual([head, tail]);
    expect(host.textContent).toBe('headtail');
    destroy();
  });

  it('does not clear a foreign node that replaces one of its DOM children', async () => {
    const host = document.createElement('div');
    let show = true;
    let renew = () => {};
    const List = mount(update => {
      renew = update;
      return () => (
        <div>{show ? [<b key="a">a</b>, <b key="b">b</b>] : []}</div>
      );
    });
    const destroy = render(<List />, host);
    const foreign = document.createElement('i');
    foreign.textContent = 'foreign';
    host.querySelector('b')!.replaceWith(foreign);
    show = false;
    renew();
    await nextTick();
    expect([...host.firstElementChild!.childNodes]).toEqual([foreign]);
    destroy();
  });

  it('falls back when a row renders a portal and keeps the target content it does not own', async () => {
    const host = document.createElement('div');
    const target = document.createElement('section');
    const outside = document.createElement('i');
    outside.textContent = 'outside';
    target.appendChild(outside);
    document.body.append(host, target);
    let ids = [1, 2, 3];
    let renewList = () => {};
    const Row = mount<{ id: number; key: number }>(
      (_renew, props) => () =>
        props.id === 2 ? (
          portal(<b>{'p' + props.id}</b>, target)
        ) : (
          <Fragment>
            <b>{props.id}</b>
          </Fragment>
        )
    );
    const List = mount(renew => {
      renewList = renew;
      return () => (
        <div>
          {ids.map(id => (
            <Row key={id} id={id} />
          ))}
        </div>
      );
    });
    const destroy = render(<List />, host);
    expect(host.textContent).toBe('13');
    expect(target.textContent).toBe('outsidep2');
    ids = [];
    renewList();
    await nextTick();
    expect(host.firstElementChild!.childNodes.length).toBe(0);
    expect([...target.childNodes]).toEqual([outside]);
    expect(target.parentNode).toBe(document.body);
    destroy();
    host.remove();
    target.remove();
  });

  it('still clears a plain element list in one mutation', async () => {
    const host = document.createElement('div');
    let ids = [1, 2, 3];
    let renewList = () => {};
    const List = mount(renew => {
      renewList = renew;
      return () => (
        <ul>
          {ids.map(id => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      );
    });
    const destroy = render(<List />, host);
    const parent = host.firstElementChild!;
    const original = [...parent.childNodes];
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver(records =>
      mutations.push(...records)
    );
    observer.observe(parent, { childList: true });
    ids = [];
    renewList();
    await nextTick();
    mutations.push(...observer.takeRecords());
    observer.disconnect();
    const removals = mutations.filter(record => record.removedNodes.length);
    expect(removals).toHaveLength(1);
    expect([...removals[0].removedNodes]).toEqual(original);
    destroy();
  });

  it('clears nested roots in a portal without removing the caller-owned host', async () => {
    const owner = document.createElement('div');
    const target = document.createElement('section');
    owner.appendChild(target);
    const host = document.createElement('div');
    let show = true;
    let renew = () => {};
    const Pair = mount(() => () => (
      <Fragment>
        <b>a</b>
        <b>b</b>
      </Fragment>
    ));
    const App = mount(update => {
      renew = update;
      return () =>
        show
          ? portal(
              <Fragment>
                <Pair />
                <Pair />
              </Fragment>,
              target
            )
          : null;
    });
    const destroy = render(<App />, host);
    expect(target.textContent).toBe('abab');
    show = false;
    renew();
    await nextTick();
    expect(target.textContent).toBe('');
    expect(target.parentNode).toBe(owner);
    destroy();
  });
});
