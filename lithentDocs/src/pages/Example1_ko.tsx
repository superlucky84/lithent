import { CodeBlock } from '@/components/CodeBlock';
import type { Introduction } from '@/pages/Introduction';
import { Example1Ko } from '@/components/examples/example1_ko';

export const Example1PageKo = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      computed로 바나나 칼로리 계산
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        computed
      </code>{' '}
      훅을 사용해 바나나 스무디 잔 수에서 예상 칼로리를 계산하는 아주 작은
      예제입니다. 수량 state가 바뀔 때마다 파생 값인 칼로리가 자동으로 다시
      계산됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

// 1잔당 95 kcal 기준 바나나 스무디 칼로리 계산기
export const BananaSmoothie = mount(renew => {
  const cups = state(1, renew);
  const calories = computed(() => cups.v * 95);

  const inc = () => (cups.v += 1);
  const dec = () => (cups.v = Math.max(0, cups.v - 1));

  return () => (
    <div>
      <p>🍌 스무디 {cups.v}잔</p>
      <p>예상 칼로리: {calories.v} kcal</p>
      <button onClick={dec} disabled={cups.v === 0}>-1</button>
      <button onClick={inc}>+1</button>
    </div>
  );
});`}
    />

    <div class="not-prose mt-6 mb-10">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example1Ko />
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      관련 문서
    </h2>

    <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2">
      <li>
        <a
          href="/guide/computed"
          class="text-[#42b883] hover:underline"
          onClick={(e: Event) => {
            e.preventDefault();
            window.history.pushState({}, '', '/guide/computed');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
        >
          Computed 가이드
        </a>{' '}
        - computed 훅의 전체 동작과 API를 자세히 설명합니다.
      </li>
      <li>
        <a
          href="/guide/state"
          class="text-[#42b883] hover:underline"
          onClick={(e: Event) => {
            e.preventDefault();
            window.history.pushState({}, '', '/guide/state');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
        >
          State 가이드
        </a>{' '}
        - 기본 state 훅과 .v 패턴에 대해 소개합니다.
      </li>
    </ul>
  </div>
);
