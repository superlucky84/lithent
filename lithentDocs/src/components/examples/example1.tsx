import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const numbers = [1, 3, 5, 7, 9];

const Counter = mount(renew => {
  const count = state<number>(1, renew);
  const sum = computed(() => numbers.reduce((acc, n) => acc + n * count.v, 0));

  const increment = () => {
    count.v += 1;
  };

  const decrement = () => {
    if (count.v > 0) {
      count.v -= 1;
    }
  };

  const reset = () => {
    count.v = 1;
  };

  return () => (
    <div class="space-y-6">
      <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <p class="text-sm md:text-base text-purple-800 dark:text-purple-200">
          💡{' '}
          <code class="px-1.5 py-0.5 bg-purple-200 dark:bg-purple-800 rounded text-xs">
            computed
          </code>
          는 의존하는 state가 변경될 때만 재계산됩니다.
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div class="text-center space-y-4">
          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
              현재 배수
            </div>
            <div class="text-5xl font-bold text-purple-600 dark:text-purple-400">
              {count.v}
            </div>
          </div>

          <div class="flex items-center justify-center gap-2">
            <button
              onClick={decrement}
              class="w-10 h-10 flex items-center justify-center rounded-lg text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={count.v === 0}
            >
              -
            </button>
            <button
              onClick={reset}
              class="px-4 h-10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              초기화
            </button>
            <button
              onClick={increment}
              class="w-10 h-10 flex items-center justify-center rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          계산 과정
        </h4>
        <div class="space-y-3">
          {numbers.map(n => (
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">
                {n} × {count.v}
              </span>
              <span class="font-mono font-semibold text-purple-600 dark:text-purple-400">
                = {n * count.v}
              </span>
            </div>
          ))}
          <div class="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-gray-700 dark:text-gray-300">
                합계 (computed)
              </span>
              <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {sum.v}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          📌 핵심 개념
        </h4>
        <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>
            •{' '}
            <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              computed()
            </code>
            로 파생 상태 생성
          </li>
          <li>• count가 변경될 때만 sum이 재계산됨</li>
          <li>• 불필요한 계산을 방지하여 성능 최적화</li>
        </ul>
      </div>
    </div>
  );
});

export const Example1 = () => <Counter />;
