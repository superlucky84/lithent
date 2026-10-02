import {
  lmount,
  mount,
  render,
  useRenew,
  nextTick,
  whenIdle,
  deferRender,
  updateCallback,
} from 'lithent-concurrent';
import { ldeferred, hasPendingRender } from 'lithent-concurrent/helper';

declare const __E2E_MUTATION__: string;
const output = document.querySelector('#result')!;
const log: string[] = [];
const commits: string[] = [];
let urgent = () => {};
let write = (_value: string) => {};
let pending = () => false;
const low = (scope: () => void) =>
  __E2E_MUTATION__ === 'scheduler-sync' ? scope() : deferRender(scope);

const Urgent = lmount(() => {
  const renew = useRenew();
  let value = 0;
  urgent = () => {
    value++;
    renew();
  };
  updateCallback(
    () => () => log.push('urgent'),
    () => [value]
  );
  return () => <span id="urgent">{value}</span>;
});
const List = lmount(() => {
  const renew = useRenew();
  const value = ldeferred('initial');
  const status = hasPendingRender();
  write = next => {
    low(() => {
      value.value = next;
    });
    if (__E2E_MUTATION__ === 'scheduler-sync') renew();
  };
  pending = () => status.value;
  updateCallback(
    () => () => {
      log.push('deferred');
      commits.push(document.querySelector('#list li')!.textContent!);
    },
    () => [value.v]
  );
  return () => (
    <ul id="list">
      {Array.from({ length: 1000 }, (_, i) => (
        <li>
          {value.v}:{i}
        </li>
      ))}
    </ul>
  );
});
const read = () => document.querySelector('#list li')!.textContent;
const App = mount(() => {
  const run = async (batch: boolean) => {
    log.length = commits.length = 0;
    const before = read();
    if (batch) {
      write('alpha');
      write('beta');
    }
    write('omega');
    const queued = pending();
    if (!batch) urgent();
    await nextTick();
    const afterNextTick = read();
    const urgentAtNextTick = document.querySelector('#urgent')!.textContent;
    await whenIdle();
    output.textContent = JSON.stringify({
      before,
      queued,
      afterNextTick,
      urgentAtNextTick,
      afterIdle: read(),
      pendingAfter: pending(),
      rows: document.querySelectorAll('#list li').length,
      log,
      commits,
    });
  };
  return () => (
    <div>
      <button onClick={() => void run(false)}>priority</button>
      <button onClick={() => void run(true)}>batch</button>
      <Urgent />
      <List />
    </div>
  );
});
render(<App />, document.querySelector('#app'));
