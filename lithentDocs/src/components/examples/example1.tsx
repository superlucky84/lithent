import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

export const Example1 = mount(renew => {
  const cups = state(1, renew);

  // 1잔당 95 kcal 기준 간단 칼로리 계산
  const calories = computed(() => cups.v * 95);

  const inc = () => {
    cups.v += 1;
  };

  const dec = () => {
    cups.v = Math.max(0, cups.v - 1);
  };

  return () => (
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          class="px-2 py-1 rounded border border-gray-300 text-sm disabled:opacity-40"
          disabled={cups.v === 0}
        >
          -1
        </button>
        <span class="text-sm text-gray-800 dark:text-gray-200">
          🍌 스무디 {cups.v}잔
        </span>
        <button
          type="button"
          onClick={inc}
          class="px-2 py-1 rounded bg-[#42b883] text-white text-sm"
        >
          +1
        </button>
      </div>
      <div class="text-sm text-gray-800 dark:text-gray-200">
        예상 칼로리: <strong class="text-[#42b883]">{calories.v} kcal</strong>
      </div>
    </div>
  );
});
