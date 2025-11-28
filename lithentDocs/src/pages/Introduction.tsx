import { CodeBlock } from '@/components/CodeBlock';

export const Introduction = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">소개</h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 작고 예측 가능한 UI 구성 요소를 만들기 위한 JavaScript
      라이브러리입니다.
      <br />
      불필요한 마법이나 번잡한 API를 걷어내고, 단순하고 예측 가능한 방식으로
      동작하는 lightweight UI 엔진을 목표로 합니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      가벼운 DOM 조작이 필요한, 용량에 민감한 라이브러리에서도 부담 없이 사용할
      수 있으며, 상황에 따라 선언형 패턴을 선택적으로 적용할 수도 있습니다.
      <br />
      <br />
      이런 목적을 위해 Lithent는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        수동 제어 기반 (Manual Mode)
      </strong>
      ,{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        선언형 기반 (Light API Mode)
      </strong>
      의 크게 두 가지 방식을 제공합니다.
      <br />
      <br />
      그리고 그 밖에 상태가 필요없이 사용할 경우에는
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        무상태 기반 (None State Mode)
      </strong>
      더 간결하게 사용 가능합니다.
      <br />
      <br />
      이런 여러가지 컴포넌트 표현은 한 프로젝트에서 복합하여 혼용해도
      무관합니다.
    </p>

    <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">
      수동 제어 기반 (Manual Mode)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      명시적 갱신(explicit renewal)을 기반으로 동작하는 방식입니다. 상태는
      자바스크립트 개발자에게 익숙한 클로저에 자연스럽게 저장되며, 사용자는
      renew API를 통해 컴포넌트의 갱신 시점을 직접 제어할 수 있습니다.
      <br />
      <br />
      이 접근 방식은 상태 변경 시 자동으로 발생하는 암묵적 부작용을 줄이고, 언제
      어떤 갱신이 일어나는지 명확하게 예측하고 통제할 수 있도록 돕습니다. 명령적
      패러다임을 따르지만, 클로저 기반이라는 특성 덕분에 사용 흐름은 자연스럽고
      직관적입니다.
      <br />
      <br />
      또한 별도의 상태 관리 메커니즘을 구현하기 위한 추가 코드가 필요하지 않기
      때문에, 프레임워크가 저용량을 유지하면서도 본연의 역할을 효과적으로 수행할
      수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const App = mount((renew) => {
  let count = 0;

  const inc = () => {
    count += 1;
    renew();
  };

  // jsx를 리턴하는 부분을 함수로 한번 감싸주는 이유는 클로저로 상태를 가두기 위한 방법입니다.
  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
    />

    <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">
      선언형 기반 (Light API Mode)
    </h2>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      상태 변화가 자동으로 UI에 반영되는 단순한 선언형 패턴입니다. 상태 생성
      lstate api는 코어와 낮게 결합된 helper를 통해 제공되며, 필요할 때만 가볍게
      가져다 쓸 수 있습니다. 상태, 컨텍스트 등 추가 기능을 원할 때 선택적으로
      활용할 수 있습니다.
    </p>
    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);

  const inc = () => {
    count.value += 1;
  };

  // jsx를 리턴하는 부분을 함수로 한번 감싸주는 이유는 클로저로 상태를 가두기 위한 방법입니다.
  return () => (
    <div>
      <p>{count.value}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
    />

    <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">
      <button>무상태 기반 (None State Mode)</button>
    </h2>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      상태가 전혀 필요없는 경우는 lmount 나 mount를 사용할 필요가 없습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`const NonStateComponent = (props: { mountApi: string; lmountApi: string }) => (
  <p>
    상태가 전혀 필요없는 경우는 {props.mountApi} 나 {props.lmountApi}를 사용할
    필요가 없습니다.
  </p>
);`}
    />

    <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">
      Key Features
    </h2>

    <div class="grid gap-6 mt-6">
      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg md:text-xl font-semibold text-[#42b883] mb-2">
          Lightweight & Fast
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Only 4.49 kB gzipped - minimal bundle size for maximum performance.
          Perfect for projects where every byte counts.
        </p>
      </div>

      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg md:text-xl font-semibold text-[#42b883] mb-2">
          Closure-based State Management
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Unique approach using closures instead of hooks. The{' '}
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            mount
          </code>{' '}
          function creates a component "mounter" that runs once, returning an
          updater function for efficient re-renders.
        </p>
      </div>

      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg md:text-xl font-semibold text-[#42b883] mb-2">
          Flexible & Extensible
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Core library provides only essentials. Optional helpers for state
          management, computed values, effects, and more can be added as needed.
        </p>
      </div>

      <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg md:text-xl font-semibold text-[#42b883] mb-2">SSR Ready</h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Built-in server-side rendering support with{' '}
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            renderToString
          </code>{' '}
          and hydration capabilities for seamless SSR integration.
        </p>
      </div>
    </div>

    <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">
      The Lithent Difference
    </h2>

    <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      Unlike traditional virtual DOM libraries, Lithent uses a distinctive{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        closure-based pattern
      </strong>{' '}
      for component state:
    </p>

    <CodeBlock
      language="tsx"
      code={`const Component = mount((renew, props) => {
  // Component "mounter" - runs once
  const count = state(0, renew);

  // Updater function - returns new virtual DOM on each update
  return () => <div>{count.value}</div>;
});`}
    />

    <p class="text-gray-700 dark:text-gray-300 mb-6">
      The{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">renew</code>{' '}
      function is the key to updates - calling it re-runs the updater and diffs
      the result against the previous virtual DOM for efficient minimal DOM
      updates.
    </p>

    <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">
      Ready to get started?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
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
