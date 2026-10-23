import { describe, expect, it } from 'vitest';
import { h, mount, nextTick, render } from '@/index';

describe('event callback contracts', () => {
  it('uses the native currentTarget as function this after replacement', async () => {
    const calls: [unknown, EventTarget | null, EventTarget | null, number][] =
      [];
    let version = 0;
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () => {
        const captured = version;
        return h('button', {
          onClick: function (this: HTMLElement, event: Event) {
            calls.push([this, event.currentTarget, event.target, captured]);
          },
        });
      };
    });
    const host = document.createElement('div');
    const dispose = render(h(App, {}), host);
    const button = host.firstElementChild as HTMLElement;
    button.click();
    version = 1;
    renew();
    await nextTick();
    button.click();
    expect(calls).toEqual([
      [button, button, button, 0],
      [button, button, button, 1],
    ]);
    dispose();
  });

  it('reads handleEvent at dispatch time and preserves its object receiver', () => {
    const receivers: unknown[] = [];
    const handler = {
      handleEvent() {
        receivers.push(this);
      },
    };
    const host = document.createElement('div');
    const dispose = render(h('button', { onClick: handler }), host);
    const button = host.firstElementChild as HTMLElement;
    button.click();
    handler.handleEvent = function () {
      receivers.push(this, 'new');
    };
    button.click();
    expect(receivers).toEqual([handler, handler, 'new']);
    dispose();
  });

  it('deduplicates the same callback under differently cased event props', async () => {
    const calls: string[] = [];
    const a = () => calls.push('a');
    const b = () => calls.push('b');
    let changed = false;
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () => h('button', { onClick: changed ? b : a, onclick: a });
    });
    const host = document.createElement('div');
    const dispose = render(h(App, {}), host);
    const button = host.firstElementChild as HTMLElement;
    button.click();
    changed = true;
    renew();
    await nextTick();
    button.click();
    // Replacing onClick removes a's only native registration. The unchanged
    // onclick prop does not register it again.
    expect(calls).toEqual(['a', 'b']);
    dispose();
  });

  it('honors stopImmediatePropagation between distinct alias callbacks', () => {
    const calls: string[] = [];
    const host = document.createElement('div');
    const dispose = render(
      h('button', {
        onClick: (event: Event) => {
          calls.push('first');
          event.stopImmediatePropagation();
        },
        onclick: () => calls.push('second'),
      }),
      host
    );
    (host.firstElementChild as HTMLElement).click();
    expect(calls).toEqual(['first']);
    dispose();
  });

  it('keeps registration order when one of two alias callbacks changes', async () => {
    const calls: string[] = [];
    const a = () => calls.push('a');
    const b = () => calls.push('b');
    const c = () => calls.push('c');
    let changed = false;
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () => h('button', { onClick: changed ? c : a, onclick: b });
    });
    const host = document.createElement('div');
    const dispose = render(h(App, {}), host);
    changed = true;
    renew();
    await nextTick();
    (host.firstElementChild as HTMLElement).click();
    expect(calls).toEqual(['b', 'c']);
    dispose();
  });

  it('drops and readds an inherited event prop without changing caller props', async () => {
    const calls: string[] = [];
    const handler = () => calls.push('inherited');
    const props = Object.freeze(Object.create({ onClick: handler }));
    let shown = true;
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () => h('button', shown ? props : {});
    });
    const host = document.createElement('div');
    const dispose = render(h(App, {}), host);
    const button = host.firstElementChild as HTMLElement;
    button.click();
    shown = false;
    renew();
    await nextTick();
    button.click();
    shown = true;
    renew();
    await nextTick();
    button.click();
    expect(calls).toEqual(['inherited', 'inherited']);
    expect(Object.keys(props)).toEqual([]);
    expect(props.onClick).toBe(handler);
    dispose();
  });
});
