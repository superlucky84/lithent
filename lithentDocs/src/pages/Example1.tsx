import { CodeBlock } from '@/components/CodeBlock';
import type { Introduction } from '@/pages/Introduction';
import { Example1 } from '@/components/examples/example1';

export const Example1Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Calculating banana smoothie calories with computed
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        computed
      </code>{' '}
      is used here to compute the expected calories from the number of banana
      smoothie cups. Whenever the state for the quantity changes, the derived
      value (calories) is recalculated automatically.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

// Banana smoothie calorie calculator (95 kcal per cup)
export const BananaSmoothie = mount(renew => {
  const cups = state(1, renew);
  const calories = computed(() => cups.v * 95);

  const inc = () => (cups.v += 1);
  const dec = () => (cups.v = Math.max(0, cups.v - 1));

  return () => (
    <div>
      <p>🍌 Smoothie cups: {cups.v}</p>
      <p>Estimated calories: {calories.v} kcal</p>
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
        <Example1 />
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Related docs
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
          Computed guide
        </a>{' '}
        - Explains the full behavior and API of the computed hook.
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
          State guide
        </a>{' '}
        - Introduces the basic state hook and the <code>.v</code> pattern.
      </li>
    </ul>
  </div>
);
