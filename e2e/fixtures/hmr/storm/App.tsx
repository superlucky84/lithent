import { mount } from 'lithent';
import { Outer } from './Items';
import { MixedBadge } from './Mixed';
import { Thrower } from './Thrower';
import { CycleA } from './CycleA';

export const App = mount(renew => {
  let visible = true;
  return () => (
    <main>
      <button
        id="storm-toggle"
        onClick={() => {
          visible = !visible;
          renew();
        }}
      >
        toggle
      </button>
      {visible ? <Outer /> : null}
      {visible ? <Outer /> : null}
      <MixedBadge />
      <Thrower />
      <CycleA />
    </main>
  );
});
