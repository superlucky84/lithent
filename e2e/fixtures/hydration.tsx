import { render, nextTick } from 'lithent';
import { hydration } from 'lithent/ssr';
import { createApp } from './hydration-app';

declare const __E2E_MUTATION__: string;
declare global {
  interface Window {
    __serverNodes: Element[];
  }
}
const host = document.querySelector('#app') as HTMLElement;
const App = createApp();
if (__E2E_MUTATION__ === 'hydration-rebuild') {
  host.replaceChildren();
  render(<App />, host);
} else hydration(<App />, host);
void nextTick().then(() => {
  const nodes = [...host.querySelectorAll('button, li')];
  host.dataset.reused = String(
    nodes.length === window.__serverNodes.length &&
      nodes.every((node, index) => node === window.__serverNodes[index])
  );
});
