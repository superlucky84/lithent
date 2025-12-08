import { CodeBlock } from '@/components/CodeBlock';
import type { Introduction } from '@/pages/Introduction';
import { navigateTo } from '@/store';

export const StatelessKo = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Stateless Components
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      상태가 전혀 필요 없는 UI라면{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        mount
      </code>
      나{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lmount
      </code>
      를 쓰지 않고도 간단한 함수로 컴포넌트를 정의할 수 있습니다. 이렇게 하면
      번들 크기를 줄이고 의존성을 최소화할 수 있습니다. Lithent에서는 React와
      달리{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        children
      </code>
      이 props 안이 아니라 두 번째 인자로 전달된다는 점만 주의하면 됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`// 단순 표시용 컴포넌트는 함수만으로도 충분합니다.
export const Badge = ({ label }: { label: string }) => (
  <span>[{label}]</span>
);

// Lithent에서는 children이 props가 아니라 두 번째 인자로 들어옵니다.
// (props, children) 순서를 지켜 주세요.
export const Card = (
  { title }: { title: string },
  children: JSX.Element
) => (
  <div>
    <Badge label="Info" /> {title}
    {children}
  </div>
);

// 필요한 경우에만 mount/lmount를 사용해 상태를 추가
// const StatefulCard = mount(renew => { ... });`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">Tip:</span> 렌더링마다 새 함수를 만들지 않도록
        바깥에서 정의한 순수 함수 컴포넌트를 재사용하면 성능에도 유리합니다.
      </p>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
      상태가 필요한 순간이 오면 언제든지{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        mount
      </code>
      나
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lmount
      </code>
      를 도입하면 됩니다. 작은 UI 조각은 가능한 한 가볍게 유지하세요.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/state"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/state');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: State →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          이제 상태가 있는 컴포넌트를 작성해보고 싶다면 helper의 state 훅을
          확인해 보세요.
        </p>
      </a>
    </div>
  </div>
);
