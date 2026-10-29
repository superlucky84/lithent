import { h, mount, Fragment } from '@/wDom';
import { render } from '@/render';
import { mountCallback } from '@/hook/mountCallback';
import { createListBoundary } from './boundary';
import type { Renew, FragmentFunction, TagFunction } from '@/types';

export async function runOwnerContracts() {
  const host = document.createElement('div');
  document.body.append(host);
  const tick = async () => {
    for (let i = 0; i < 6; i++) await Promise.resolve();
  };
  let checks = 0;
  const assert = (ok: unknown, message: string) => {
    checks++;
    if (!ok) throw Error(message);
  };
  let parentRenew: Renew, childRenew: Renew;
  let show = true,
    local = 0,
    setups = 0,
    cleanups = 0;
  const Child = mount<{ row: { id: number; label: string } }>((renew, p) => {
    setups++;
    childRenew = renew;
    mountCallback(() => () => {
      cleanups++;
    });
    return () =>
      h(
        Fragment as unknown as FragmentFunction,
        {},
        h('input', { value: p.row.label }),
        h('span', {}, p.row.label + local)
      );
  });
  const data = [
    { id: 1, label: 'a' },
    { id: 2, label: 'b' },
  ];
  const b = createListBoundary<(typeof data)[number]>(
    x => x.id,
    x => h('li', { key: x.id }, h(Child as unknown as TagFunction, { row: x }))
  );
  b.set(data);
  const App = mount(renew => {
    parentRenew = renew;
    return () => h('ul', {}, show ? h(b.View, {}) : null);
  });
  render(h(App, {}), host);
  const rows = [...host.querySelectorAll('li')];
  parentRenew!();
  b.edit(1, x => {
    x.label = 'first';
  });
  await tick();
  assert(
    host.querySelector('span')!.textContent === 'first0',
    'parent-first props'
  );
  b.edit(2, x => {
    x.label = 'second';
  });
  parentRenew!();
  await tick();
  assert(
    host.querySelectorAll('span')[1].textContent === 'second0',
    'items-first props'
  );
  assert(setups === 2, 'no duplicate setup');
  const input = host.querySelector('input')!;
  input.focus();
  input.setSelectionRange(1, 3);
  local = 1;
  childRenew!();
  await tick();
  assert(
    host.querySelectorAll('span')[1].textContent === 'second1',
    'nested own renew'
  );
  assert(
    document.activeElement === input && input.selectionStart === 1,
    'input focus and selection'
  );
  b.set([data[1], data[0]]);
  await tick();
  assert(host.querySelector('li') === rows[1], 'component identity after swap');
  b.edit(2, x => {
    x.label = 'pending';
  });
  show = false;
  parentRenew!();
  await tick();
  assert(
    host.querySelectorAll('li').length === 0,
    'pending update cannot resurrect removed owner'
  );
  assert(cleanups === 2, 'nested cleanup once');
  show = true;
  parentRenew!();
  await tick();
  assert(
    host.querySelector('span')!.textContent!.startsWith('pending'),
    'remount latest data'
  );
  assert(setups === 4, 'fresh nested instances on remount');
  const before = b.metrics.itemViews;
  parentRenew!();
  await tick();
  assert(b.metrics.itemViews === before, 'parent renew does not visit items');
  show = false;
  parentRenew!();
  await tick();
  assert(cleanups === 4, 'second cleanup once');
  b.dispose();
  b.dispose();
  host.remove();
  return { checks, setups, cleanups, metrics: { ...b.metrics } };
}
