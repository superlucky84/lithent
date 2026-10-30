import { h, mount, render } from 'lithent';
import { defineBlock } from '@block';
import { cloneWDom } from '@/wDom';
import type { WDom } from '@/types';

export async function nativeContracts() {
  const host = document.createElement('aside');
  document.body.appendChild(host);
  let checks = 0;
  const check = (value: unknown, message: string) => {
    if (!value) throw Error(message);
    checks++;
  };
  const tick = async () => {
    for (let i = 0; i < 8; i++) await Promise.resolve();
  };
  const block = defineBlock({
    tag: 'section',
    attrs: { class: { slot: 0 } },
    children: [
      { tag: 'p', attrs: { 'data-static': 'yes' }, children: [{ slot: 1 }] },
      { tag: 'button', attrs: { onClick: { slot: 2 } }, children: ['go'] },
      { tag: 'span', children: ['static'] },
    ],
  });
  let label = 'first',
    className: string | undefined,
    ids = [1, 2],
    clicks = 0;
  const handler = () => {
    clicks++;
  };
  let currentHandler = handler;
  let renew = () => {};
  let description: WDom;
  const App = mount(r => {
    renew = r;
    return () =>
      h(
        'div',
        {},
        ids.map(id => {
          const node = block([className, label + id, currentHandler], id);
          if (id === 1) description = node;
          return node;
        })
      );
  });
  const unmount = render(h(App, {}) as WDom, host);
  try {
    const first = host.querySelector('section')!;
    const paragraph = first.querySelector('p')!;
    const button = first.querySelector('button')!;
    check(paragraph.textContent === 'first1', 'initial text');
    button.focus();
    label = 'next';
    className = 'danger';
    renew();
    await tick();
    check(host.querySelector('section') === first, 'root identity');
    check(first.querySelector('p') === paragraph, 'static child identity');
    check(paragraph.textContent === 'next1', 'text patch');
    check(first.className === 'danger', 'class patch');
    check(document.activeElement === button, 'focus after scalar patch');
    button.click();
    check(clicks === 1, 'original event');
    currentHandler = () => {
      clicks += 10;
    };
    renew();
    await tick();
    button.click();
    check(clicks === 11, 'replaced event');
    className = undefined;
    renew();
    await tick();
    check(
      first.getAttribute('class') === 'undefined',
      'base undefined observation'
    );
    ids = [2, 1];
    renew();
    await tick();
    check(host.querySelectorAll('section')[1] === first, 'keyed movement');
    const snapshot = cloneWDom(description!) as WDom;
    const other = document.createElement('aside');
    host.appendChild(other);
    const removeCopy = render(snapshot, other);
    check(other.querySelector('p')?.textContent === 'next1', 'clone snapshot');
    check(other.querySelector('p') !== paragraph, 'independent clone DOM');
    removeCopy();
    other.remove();
    ids = [2];
    renew();
    await tick();
    check(!first.isConnected, 'keyed remove');
    ids = [2, 1];
    renew();
    await tick();
    check(
      host.querySelectorAll('section')[1] !== first,
      'remount owns new DOM'
    );
  } finally {
    unmount();
    host.remove();
  }
  return { checks };
}
