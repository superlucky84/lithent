import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, mount, nextTick, render } from 'lithent';
import { defineElement } from '../../../element/src/index';
import { createRetainedHost } from '../src';

const destroys: Array<() => void> = [];
const flush = async () => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
};
afterEach(async () => {
  destroys.splice(0).forEach(destroy => destroy());
  document.body.replaceChildren();
  await flush();
});

describe('committed retained host', () => {
  it('creates only after commit and skips a host removed before deferred creation', async () => {
    const initialize = vi.fn(() => () => h('span', {}, 'content'));
    const Host = createRetainedHost(initialize);
    const root = document.createElement('section');
    const node = h(Host, { active: true });
    expect(initialize).not.toHaveBeenCalled();
    const destroy = render(node, root);
    expect(initialize).not.toHaveBeenCalled();
    destroy();
    await flush();
    expect(initialize).not.toHaveBeenCalled();
    expect(root.childNodes).toHaveLength(0);
  });

  it('keeps local history and DOM when a parent changes active and disposes on removal', async () => {
    const initialized = vi.fn();
    const cleanup = vi.fn();
    let resources = 0;
    const Host = createRetainedHost((renew, scope) => {
      initialized();
      scope.own(cleanup);
      scope.onActive(() => {
        resources++;
        return () => {
          resources--;
        };
      });
      let value = 0;
      return () =>
        h(
          'button',
          {
            onClick: () => {
              value++;
              renew();
            },
          },
          String(value)
        );
    });
    let setActive!: (value: boolean) => void;
    const Parent = mount(renew => {
      let active = true;
      setActive = value => {
        active = value;
        renew();
      };
      return () => h(Host, { active });
    });
    const root = document.createElement('section');
    const destroy = render(h(Parent, {}), root);
    destroys.push(destroy);
    await flush();
    const button = root.querySelector('button')!;
    button.click();
    await flush();
    setActive(false);
    await flush();
    expect(resources).toBe(0);
    expect(button.closest('[hidden]')).not.toBeNull();
    setActive(true);
    await flush();
    expect(resources).toBe(1);
    expect(root.querySelector('button')).toBe(button);
    expect(button.textContent).toBe('1');
    expect(initialized).toHaveBeenCalledTimes(1);
    destroy();
    await flush();
    expect(resources).toBe(0);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('reports disposal failures without blocking outer DOM removal', async () => {
    const report = vi.fn();
    const Host = createRetainedHost((_renew, scope) => {
      scope.own(() => {
        throw new Error('resource');
      });
      return () => h('span', {}, 'content');
    }, report);
    const root = document.createElement('section');
    const destroy = render(h(Host, { active: true }), root);
    destroys.push(destroy);
    await flush();
    expect(() => destroy()).not.toThrow();
    expect(report).toHaveBeenCalledTimes(1);
    expect(root.childNodes).toHaveLength(0);
  });

  it('reuses defineElement active props, same-task movement and final removal policy', async () => {
    const initialize = vi.fn();
    const cleanup = vi.fn();
    let resources = 0;
    const Host = createRetainedHost((_renew, scope) => {
      initialize();
      scope.own(cleanup);
      scope.onActive(() => {
        resources++;
        return () => {
          resources--;
        };
      });
      return () => h('input', { value: 'draft' });
    });
    const Constructor = defineElement('retained-host-test', Host, {
      props: { active: Boolean },
    })!;
    const element = new Constructor();
    element.active = true;
    document.body.appendChild(element);
    await flush();
    const input = element.shadowRoot!.querySelector('input')!;
    element.active = false;
    await flush();
    expect(resources).toBe(0);
    element.setAttribute('active', '');
    await flush();
    expect(resources).toBe(1);
    element.remove();
    document.body.appendChild(element);
    await flush();
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(element.shadowRoot!.querySelector('input')).toBe(input);
    element.remove();
    await flush();
    expect(resources).toBe(0);
    expect(cleanup).toHaveBeenCalledTimes(1);
    document.body.appendChild(element);
    await flush();
    expect(initialize).toHaveBeenCalledTimes(2);
    expect(element.shadowRoot!.querySelector('input')).not.toBe(input);
    expect(resources).toBe(1);
  });
});
