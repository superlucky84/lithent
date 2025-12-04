import { CodeBlock } from '@/components/CodeBlock';
import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';
import type { Introduction } from '@/pages/Introduction';

const example1Code = `import { mount, render } from 'lithent';
import { state, computed } from 'lithent/helper';

const Counter = mount(renew => {
  const count = state<number>(1, renew);
  const sum = computed(() =>
    [1, 3, 5, 7, 9].reduce((acc, n) => acc + n * count.v, 0)
  );

  const increment = () => {
    count.v += 1;
  };

  return () => (
    <div class="card">
      <p>computed: {sum.v}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
});

render(<Counter />, document.getElementById('root'));
`;

const Example1Preview = mount(renew => {
  const count = state<number>(1, renew);
  const sum = computed(() =>
    [1, 3, 5, 7, 9].reduce((acc, n) => acc + n * count.v, 0)
  );

  const increment = () => {
    count.v += 1;
  };

  return () => (
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <button
          type="button"
          onClick={increment}
          class="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#42b883] hover:bg-[#36996b] transition-colors"
        >
          +1
        </button>
        <span class="text-sm text-gray-800 dark:text-gray-200">
          computed: <strong class="text-[#42b883]">{sum.v}</strong>
        </span>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        1,3,5,7,9의 합을 count 배로 계산합니다.
      </p>
    </div>
  );
});

export const Example1Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Computed Helper
    </h1>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        computed
      </code>
      훅으로 의존값이 바뀔 때만 재계산되는 값을 사용하는 예제입니다. 코드와 실행
      결과를 함께 확인해 보세요.
    </p>

    <CodeBlock language="typescript" code={example1Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example1Preview />
      </div>
    </div>
  </div>
);
