import { mount, render, mountCallback } from 'lithent';
import { Badge, message } from './Mixed';

const App = mount(renew => {
  let count = 0;
  mountCallback(() => {
    const active = window as unknown as { hmrActiveRoots: number };
    active.hmrActiveRoots = (active.hmrActiveRoots || 0) + 1;
    return () => {
      active.hmrActiveRoots--;
    };
  });
  return () => (
    <main>
      <button
        id="mixed-increment"
        onClick={() => {
          count++;
          renew();
        }}
      >
        increment
      </button>
      <output id="mixed-count">{count}</output>
      <p id="mixed-value">{message}</p>
      <Badge />
    </main>
  );
});
render(<App />, document.getElementById('app'));
