import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  h,
  mount,
  mountCallback,
  nextTick,
  portal,
  render,
  updateCallback,
} from 'lithent';
import type { Renew } from 'lithent';
import { createRetainedView, useRenderBoundary } from '../src';
import type { RenderBoundary } from '../src';
import { getRenderProtocol } from '../src/renderProtocol';

const destroys: Array<() => void> = [];
afterEach(() => {
  destroys.splice(0).forEach(destroy => destroy());
  document.body.replaceChildren();
  expect(getRenderProtocol()?.blocks).toBeUndefined();
  expect(getRenderProtocol()?.reparent).toBeUndefined();
  expect(getRenderProtocol()?.boundaryOwner).toBeUndefined();
});
const attach = (node: Parameters<typeof render>[0]) => {
  const host = document.createElement('section');
  document.body.appendChild(host);
  destroys.push(render(node, host));
  return host;
};
const fixture = () => {
  let boundary!: RenderBoundary;
  let renew!: Renew;
  let parentRenew!: Renew;
  let value = 0;
  let label = 'initial';
  let visible = true;
  let slot = 'one';
  const draws = vi.fn();
  const effects = vi.fn();
  const commits = vi.fn();
  const cleanup = vi.fn();
  const Child = mount<{ label?: string }>(update => {
    renew = update;
    mountCallback(() => cleanup);
    updateCallback(() => {
      effects();
      return commits;
    });
    return props => {
      draws();
      return h('input', { value: `${props.label}:${value}` });
    };
  });
  const Boundary = mount<{ label?: string }>((_update, _props, children) => {
    boundary = useRenderBoundary();
    return props => h('div', {}, h(Child, { label: props.label }), children);
  });
  const Parent = mount(update => {
    parentRenew = update;
    return () =>
      h(
        'section',
        {},
        visible ? h(Boundary, { label }, h('b', {}, slot)) : null,
        h('i', {}, label)
      );
  });
  const host = attach(h(Parent, {}));
  return {
    host,
    boundary,
    renew,
    parentRenew,
    draws,
    effects,
    commits,
    cleanup,
    setValue(next: number) {
      value = next;
    },
    setLabel(next: string) {
      label = next;
    },
    setSlot(next: string) {
      slot = next;
    },
    remove() {
      visible = false;
      parentRenew();
    },
  };
};

describe('opt-in core render boundary', () => {
  it.each([false, true])(
    'freezes a child renew and update effects (queued before pause=%s)',
    async queued => {
      const app = fixture();
      expect(getRenderProtocol()?.blocks).toBeUndefined();
      expect(getRenderProtocol()?.boundaryOwner).toBeTypeOf('function');
      const input = app.host.querySelector('input')!;
      app.setValue(1);
      if (queued) app.renew();
      app.boundary.pause();
      expect(getRenderProtocol()?.blocks).toBeTypeOf('function');
      expect(getRenderProtocol()?.reparent).toBeTypeOf('function');
      for (let i = 2; i <= 6; i++) {
        app.setValue(i);
        expect(app.renew()).toBe(true);
      }
      await nextTick();
      expect(input.value).toBe('initial:0');
      expect(app.draws).toHaveBeenCalledTimes(1);
      expect(app.effects).not.toHaveBeenCalled();
      expect(app.commits).not.toHaveBeenCalled();
      app.boundary.resume();
      app.boundary.resume();
      expect(getRenderProtocol()?.blocks).toBeUndefined();
      expect(getRenderProtocol()?.reparent).toBeUndefined();
      await nextTick();
      expect(app.host.querySelector('input')).toBe(input);
      expect(input.value).toBe('initial:6');
      expect(app.draws).toHaveBeenCalledTimes(2);
      expect(app.effects).toHaveBeenCalledTimes(1);
      expect(app.commits).toHaveBeenCalledTimes(1);
    }
  );

  it('retains latest parent props and slots while ordinary siblings update', async () => {
    const app = fixture();
    app.boundary.pause();
    for (const label of ['second', 'latest']) {
      app.setLabel(label);
      app.setSlot(label);
      app.parentRenew();
      await nextTick();
    }
    expect(app.host.querySelector('input')!.value).toBe('initial:0');
    expect(app.host.querySelector('b')!.textContent).toBe('one');
    expect(app.host.querySelector('i')!.textContent).toBe('latest');
    expect(app.draws).toHaveBeenCalledTimes(1);
    app.boundary.resume();
    await nextTick();
    expect(app.host.querySelector('input')!.value).toBe('latest:0');
    expect(app.host.querySelector('b')!.textContent).toBe('latest');
    expect(app.draws).toHaveBeenCalledTimes(2);
  });

  it('allows final removal and makes late renew harmless', async () => {
    const app = fixture();
    app.boundary.pause();
    app.renew();
    app.remove();
    await nextTick();
    expect(app.host.querySelector('input')).toBeNull();
    expect(app.cleanup).toHaveBeenCalledTimes(1);
    expect(app.boundary.disposed).toBe(true);
    expect(app.renew()).toBe(false);
    app.boundary.resume();
    app.boundary.pause();
    expect(app.cleanup).toHaveBeenCalledTimes(1);
  });

  it('preserves paused keyed instances when reordered', async () => {
    const gates: RenderBoundary[] = [];
    const initialized = vi.fn();
    let renew!: Renew;
    let order = [0, 1];
    const Item = mount<{ id?: number }>((_update, props) => {
      gates[props.id!] = useRenderBoundary();
      initialized();
      return current => h('input', { value: String(current.id) });
    });
    const Parent = mount(update => {
      renew = update;
      return () =>
        h(
          'div',
          {},
          order.map(id => h(Item, { id, key: id }))
        );
    });
    const host = attach(h(Parent, {}));
    const inputs = Array.from(host.querySelectorAll('input'));
    gates.forEach(gate => gate.pause());
    order = [1, 0];
    renew();
    await nextTick();
    expect(Array.from(host.querySelectorAll('input'))).toEqual([
      inputs[1],
      inputs[0],
    ]);
    expect(initialized).toHaveBeenCalledTimes(2);
    gates.forEach(gate => gate.resume());
    await nextTick();
    expect(Array.from(host.querySelectorAll('input'))).toEqual([
      inputs[1],
      inputs[0],
    ]);
  });

  it('keeps nested boundaries independent and replays the latest model', async () => {
    let outer!: RenderBoundary;
    let inner!: RenderBoundary;
    let renew!: Renew;
    let value = 0;
    const Inner = mount(update => {
      renew = update;
      inner = useRenderBoundary();
      return () => h('span', {}, String(value));
    });
    const Outer = mount(() => {
      outer = useRenderBoundary();
      return () => h('div', {}, h(Inner, {}));
    });
    const host = attach(h(Outer, {}));
    outer.pause();
    inner.pause();
    value = 1;
    renew();
    await nextTick();
    inner.resume();
    expect(getRenderProtocol()?.blocks).toBeTypeOf('function');
    await nextTick();
    expect(host.textContent).toBe('0');
    outer.resume();
    expect(getRenderProtocol()?.blocks).toBeUndefined();
    await nextTick();
    expect(host.textContent).toBe('1');
    inner.pause();
    value = 2;
    renew();
    await nextTick();
    expect(host.textContent).toBe('1');
    inner.resume();
    await nextTick();
    expect(host.textContent).toBe('2');
  });

  it('covers portal descendants and disposes their component lifecycle', async () => {
    const target = document.createElement('aside');
    document.body.appendChild(target);
    let gate!: RenderBoundary;
    let renew!: Renew;
    let value = 0;
    const cleanup = vi.fn();
    const Child = mount(update => {
      renew = update;
      mountCallback(() => cleanup);
      return () => h('span', {}, String(value));
    });
    const Parent = mount(() => {
      gate = useRenderBoundary();
      return () => portal(h(Child, {}), target);
    });
    attach(h(Parent, {}));
    gate.pause();
    value = 1;
    renew();
    await nextTick();
    expect(target.textContent).toBe('0');
    gate.resume();
    await nextTick();
    expect(target.textContent).toBe('1');
    destroys.pop()!();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(renew()).toBe(false);
    // The existing core retains DOM in external portal hosts on root removal.
    expect(target.textContent).toBe('1');
  });

  it('adds child freezing to the retained root without changing its default', async () => {
    const host = document.createElement('section');
    let renew!: Renew;
    let value = 0;
    const Child = mount(update => {
      renew = update;
      return () => h('input', { value: String(value) });
    });
    const view = createRetainedView(host, () => () => h(Child, {}), {
      freezeChildren: true,
    });
    destroys.push(view.dispose);
    view.show();
    view.hide();
    value = 1;
    renew();
    await nextTick();
    expect(host.querySelector('input')!.value).toBe('0');
    view.show();
    await nextTick();
    expect(host.querySelector('input')!.value).toBe('1');
  });

  it('rejects pausing inside an updater before changing boundary state', async () => {
    let gate!: RenderBoundary;
    let renew!: Renew;
    let armed = false;
    const error = vi.fn();
    const Root = mount(update => {
      gate = useRenderBoundary();
      renew = update;
      return () => {
        if (armed) {
          try {
            gate.pause();
          } catch (failure) {
            error(failure);
          }
        }
        return h('span', {}, 'safe');
      };
    });
    attach(h(Root, {}));
    armed = true;
    renew();
    await nextTick();
    expect(error).toHaveBeenCalledTimes(1);
    expect(gate.active).toBe(true);
  });

  it('removes cached ownership when disposed beside another paused root', async () => {
    let gate!: RenderBoundary;
    let other!: RenderBoundary;
    let renew!: Renew;
    let value = 0;
    const Child = mount(update => {
      renew = update;
      return () => h('span', {}, String(value));
    });
    const Root = mount(() => {
      gate = useRenderBoundary();
      return () => h('div', {}, h(Child, {}));
    });
    const Other = mount(() => {
      other = useRenderBoundary(false);
      return () => h('aside', {}, 'paused elsewhere');
    });
    const host = attach(h(Root, {}));
    attach(h(Other, {}));
    renew();
    await nextTick();
    gate.pause();
    value = 1;
    renew();
    await nextTick();
    expect(host.textContent).toBe('0');
    gate.dispose();
    value = 2;
    renew();
    await nextTick();
    expect(host.textContent).toBe('2');
    expect(other.active).toBe(false);
  });

  it('releases the last paused gate while active roots remain registered', async () => {
    const active = fixture();
    const paused = fixture();
    const input = active.host.querySelector('input')!;
    paused.boundary.pause();
    expect(getRenderProtocol()?.blocks).toBeTypeOf('function');
    paused.boundary.dispose();
    expect(getRenderProtocol()?.blocks).toBeUndefined();
    expect(getRenderProtocol()?.reparent).toBeUndefined();
    expect(getRenderProtocol()?.boundaryOwner).toBeTypeOf('function');
    active.setValue(1);
    active.renew();
    await nextTick();
    expect(input.value).toBe('initial:1');
    active.boundary.pause();
    active.setValue(2);
    active.renew();
    await nextTick();
    expect(input.value).toBe('initial:1');
    active.boundary.resume();
    await nextTick();
    expect(input.value).toBe('initial:2');
    expect(active.effects).toHaveBeenCalledTimes(2);
    expect(active.commits).toHaveBeenCalledTimes(2);
  });
});
