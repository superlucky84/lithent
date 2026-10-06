import { h, mount, mountCallback } from 'lithent';
import { defineElement } from '@/index';

// Phase 1 demo: a stateful counter in an open shadow root. Remove the element
// from DevTools to see the unmount log.
const Counter = mount(renew => {
  let count = 0;
  mountCallback(() => {
    console.log('lithent-counter mounted');
    return () => console.log('lithent-counter unmounted');
  });
  return () =>
    h(
      'button',
      {
        onClick: () => {
          count++;
          renew();
        },
      },
      `count ${count}`
    );
});

defineElement('lithent-counter', Counter);
document.getElementById('root')!.innerHTML =
  '<lithent-counter></lithent-counter>';
