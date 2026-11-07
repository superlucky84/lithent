import { h, mount, mountCallback, render } from 'lithent';

type CleanupProbe = {
  calls: string[];
  errors: { same: boolean; empty: boolean }[];
  supported: boolean;
};

declare global {
  interface Window {
    cleanupProbe: CleanupProbe;
  }
}

if (new URLSearchParams(location.search).get('mode') === 'fallback') {
  Object.defineProperty(globalThis, 'reportError', {
    value: undefined,
    configurable: true,
    writable: true,
  });
}
const probe: CleanupProbe = (window.cleanupProbe = {
  calls: [],
  errors: [],
  supported: typeof reportError === 'function',
});
const host = document.querySelector<HTMLElement>('#app')!;
const boom = new Error('cleanup-probe-error');
window.addEventListener('error', event => {
  if (event.error === boom) {
    event.preventDefault();
    probe.errors.push({ same: event.error === boom, empty: !host.firstChild });
  }
});
const Child = mount(() => {
  mountCallback(() => () => probe.calls.push('child'));
  return () => h('p', {}, 'child');
});
const Bad = mount(() => {
  mountCallback(() => () => {
    probe.calls.push('bad');
    throw boom;
  });
  mountCallback(() => () => probe.calls.push('remaining'));
  return () => h('div', {}, h(Child, {}));
});
const Good = mount(() => {
  mountCallback(() => () => probe.calls.push('good'));
  return () => h('p', {}, 'good');
});
const destroy = render(h('section', {}, h(Bad, {}), h(Good, {})), host);
document.querySelector('#destroy')!.addEventListener('click', destroy);
