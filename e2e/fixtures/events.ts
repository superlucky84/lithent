import { h, mount, mountCallback, ref, render } from 'lithent';

declare global {
  interface Window {
    eventProbe: {
      calls: string[];
      trusted: boolean[];
      receivers: boolean[];
      errors: string[];
      dispose: () => void;
      removeNative: () => void;
      addNative: () => void;
      replaceHandler: () => void;
      retainedClick: () => void;
    };
  }
}

const mode = new URL(location.href).searchParams.get('mode');
const probe = (window.eventProbe = {
  calls: [] as string[],
  trusted: [] as boolean[],
  receivers: [] as boolean[],
  errors: [] as string[],
  dispose: () => {},
  removeNative: () => {},
  addNative: () => {},
  replaceHandler: () => {},
  retainedClick: () => {},
});

if (mode === 'interop') {
  const App = mount(renew => {
    const button = ref<HTMLButtonElement | null>(null);
    let changed = false;
    const original = () => probe.calls.push('original');
    const latest = () => probe.calls.push('latest');
    const external = () => probe.calls.push('external');
    probe.replaceHandler = () => {
      changed = true;
      renew();
    };
    mountCallback(() => {
      const element = button.value!;
      probe.removeNative = () => element.removeEventListener('click', original);
      probe.addNative = () => element.addEventListener('click', original);
      probe.addNative();
      probe.addNative();
      element.addEventListener('click', external);
      return () => {
        probe.removeNative();
        element.removeEventListener('click', latest);
        element.removeEventListener('click', external);
      };
    });
    return () =>
      h(
        'button',
        { ref: button, onClick: changed ? latest : original },
        'interop'
      );
  });
  probe.dispose = render(h(App, {}), document.getElementById('app'));
} else if (mode === 'native') {
  const App = mount(() => {
    const button = ref<HTMLButtonElement | null>(null);
    mountCallback(() => {
      const element = button.value!;
      const handler = function (this: EventTarget, event: Event) {
        probe.calls.push('native');
        probe.trusted.push(event.isTrusted);
        probe.receivers.push(
          this === element && event.currentTarget === element
        );
      };
      probe.removeNative = () =>
        element.removeEventListener('click', handler, true);
      probe.addNative = () => element.addEventListener('click', handler, true);
      probe.retainedClick = () => element.click();
      probe.addNative();
      probe.addNative();
      return probe.removeNative;
    });
    return () => h('button', { ref: button }, 'native listener');
  });
  probe.dispose = render(h(App, {}), document.getElementById('app'));
} else {
  let changed = false;
  let renew = () => {};
  customElements.define(
    'event-edge',
    class extends HTMLElement {
      constructor() {
        super();
        this.addEventListener(
          'click',
          event => {
            probe.trusted.push(event.isTrusted);
            changed = true;
            renew();
            if (mode === 'nested') this.dispatchEvent(new MouseEvent('click'));
          },
          { once: true }
        );
      }
    }
  );
  const a = () => probe.calls.push('a');
  const b = () => probe.calls.push('b');
  const latest = () => probe.calls.push('latest');
  const throws = () => {
    probe.calls.push('throws');
    throw new Error('event-probe-error');
  };
  if (mode === 'error')
    window.addEventListener('error', event => {
      if (
        event.message === 'Uncaught Error: event-probe-error' ||
        event.error?.message === 'event-probe-error'
      ) {
        event.preventDefault();
        probe.errors.push('event-probe-error');
      }
    });
  const App = mount(bump => {
    renew = bump;
    return () =>
      mode === 'error'
        ? h('event-edge', { onClick: throws, onclick: b }, 'dispatch')
        : mode === 'ancestor'
          ? h(
              'section',
              { onClick: changed ? latest : a },
              h('event-edge', {}, 'dispatch')
            )
          : h(
              'event-edge',
              mode === 'replace'
                ? { onClick: changed ? latest : a }
                : changed
                  ? { onClick: a, onclick: b }
                  : { onClick: a },
              'dispatch'
            );
  });
  probe.dispose = render(h(App, {}), document.getElementById('app'));
}
