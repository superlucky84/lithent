export const Introduction = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6">소개</h1>

    <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 작고 예측 가능한 UI 구성 요소를 만들기 위한 JavaScript
      라이브러리입니다.
      <br />
      불필요한 마법이나 번잡한 API를 걷어내고, 단순하고 예측 가능한 방식으로
      동작하는 lightweight UI 엔진을 목표로 합니다.
    </p>

    <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      가벼운 DOM 조작이 필요한, 용량에 민감한 라이브러리에서도 부담 없이 사용할
      수 있으며, 상황에 따라 선언형 패턴을 선택적으로 적용할 수도 있습니다.
    </p>

    <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">
      Key Features
    </h2>

    <div class="grid gap-6 mt-6">
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-[#42b883] mb-2">
          Lightweight & Fast
        </h3>
        <p class="text-gray-700 dark:text-gray-300">
          Only 4.49 kB gzipped - minimal bundle size for maximum performance.
          Perfect for projects where every byte counts.
        </p>
      </div>

      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-[#42b883] mb-2">
          Closure-based State Management
        </h3>
        <p class="text-gray-700 dark:text-gray-300">
          Unique approach using closures instead of hooks. The{' '}
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            mount
          </code>{' '}
          function creates a component "mounter" that runs once, returning an
          updater function for efficient re-renders.
        </p>
      </div>

      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-[#42b883] mb-2">
          Flexible & Extensible
        </h3>
        <p class="text-gray-700 dark:text-gray-300">
          Core library provides only essentials. Optional helpers for state
          management, computed values, effects, and more can be added as needed.
        </p>
      </div>

      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-[#42b883] mb-2">SSR Ready</h3>
        <p class="text-gray-700 dark:text-gray-300">
          Built-in server-side rendering support with{' '}
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            renderToString
          </code>{' '}
          and hydration capabilities for seamless SSR integration.
        </p>
      </div>
    </div>

    <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">
      The Lithent Difference
    </h2>

    <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Unlike traditional virtual DOM libraries, Lithent uses a distinctive
      <strong> closure-based pattern</strong> for component state:
    </p>

    <pre class="bg-gray-900 dark:bg-gray-950 text-gray-100 p-6 rounded-lg overflow-x-auto mb-6">
      <code>{`const Component = mount((renew, props) => {
  // Component "mounter" - runs once
  const count = state(0, renew);

  // Updater function - returns new virtual DOM on each update
  return () => <div>{count.value}</div>;
});`}</code>
    </pre>

    <p class="text-gray-700 dark:text-gray-300 mb-6">
      The{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">renew</code>{' '}
      function is the key to updates - calling it re-runs the updater and diffs
      the result against the previous virtual DOM for efficient minimal DOM
      updates.
    </p>

    <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">
      Ready to get started?
    </h2>

    <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Check out the{' '}
      <a
        href="#/guide/quick-start"
        class="text-[#42b883] hover:underline font-medium"
      >
        Quick Start
      </a>{' '}
      guide to begin building with Lithent.
    </p>
  </div>
);
