import { mount, lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const card = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';
const button =
  'mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700';
const times = (count: number) => (count === 1 ? '1 time' : `${count} times`);

const code =
  'mt-3 block rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-700';

/** Manual mode: state is a plain variable, `renew()` redraws. */
export const ManualCounter = mount(renew => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <div class={card}>
      <h3 class="font-semibold">Manual mode</h3>
      <p class="mt-1 text-sm text-stone-600">
        <code>mount</code> + a plain variable. You decide when to redraw.
      </p>
      <code class={code}>count += 1; renew();</code>
      <button type="button" class={button} onClick={increase}>
        Clicked {times(count)}
      </button>
    </div>
  );
});

/** Light API mode: `lstate` redraws when its value changes. */
export const ReactiveCounter = lmount(() => {
  const count = lstate(0);

  return () => (
    <div class={card}>
      <h3 class="font-semibold">Reactive mode</h3>
      <p class="mt-1 text-sm text-stone-600">
        <code>lmount</code> + <code>lstate</code>. Assigning a value redraws.
      </p>
      <code class={code}>count.value += 1;</code>
      <button type="button" class={button} onClick={() => (count.value += 1)}>
        Clicked {times(count.value)}
      </button>
    </div>
  );
});
