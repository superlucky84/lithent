import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const FragmentKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Fragment
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Fragment란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Fragment는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        추가적인 DOM 노드 없이 여러 요소를 그룹화할 수 있게 해줍니다
      </strong>
      .
      <br />
      <br />
      JSX는 단일 루트 요소를 요구합니다. 여러 형제 요소를 직접 반환할 수
      없습니다. Fragment는 추가적인 래퍼{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;div&gt;
      </code>
      를 생성하지 않고 요소들을 그룹화하여 이 문제를 해결합니다.
      <br />
      <br />
      이것은 DOM 구조를 깔끔하게 유지하고 불필요한 중첩을 피하는데, 특히 CSS
      레이아웃과 시맨틱 HTML에 중요합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 Fragment 사용법
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      요소를{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;div&gt;
      </code>
      로 감싸는 대신, <code>Fragment</code>를 사용하여 그룹화하세요:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, Fragment } from 'lithent';

const Columns = mount(() => {
  return () => (
    <Fragment>
      <td>열 1</td>
      <td>열 2</td>
      <td>열 3</td>
    </Fragment>
  );
});

const App = mount(() => {
  return () => (
    <table>
      <tbody>
        <tr>
          <Columns />
        </tr>
      </tbody>
    </table>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      렌더링된 HTML은 다음과 같습니다:
    </p>

    <CodeBlock
      language="html"
      code={`<table>
  <tbody>
    <tr>
      <td>열 1</td>
      <td>열 2</td>
      <td>열 3</td>
    </tr>
  </tbody>
</table>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Fragment가 없다면{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;td&gt;
      </code>{' '}
      요소들을{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;div&gt;
      </code>
      로 감싸야 하는데, 이는 테이블 구조를 망가뜨립니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      짧은 문법: &lt;&gt;...&lt;/&gt;
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code>Fragment</code> 대신 더 짧은 <code>&lt;&gt;...&lt;/&gt;</code>{' '}
      문법을 사용할 수 있습니다:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const List = mount(() => {
  return () => (
    <>
      <li>항목 1</li>
      <li>항목 2</li>
      <li>항목 3</li>
    </>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이것은 <code>Fragment</code>를 명시적으로 사용하는 것과 완전히 동일합니다.
      선호하는 스타일을 사용하세요.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      key를 사용하는 Fragment
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      목록에서 Fragment를 렌더링할 때, 효율적인 업데이트를 위해 <code>key</code>{' '}
      prop을 제공해야 할 수 있습니다. 이 경우 명시적인 <code>Fragment</code>{' '}
      문법을 사용해야 합니다 (<code>&lt;&gt;</code>가 아닌):
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, Fragment } from 'lithent';

const items = [
  { id: 1, title: '첫 번째', description: '첫 번째 항목' },
  { id: 2, title: '두 번째', description: '두 번째 항목' },
  { id: 3, title: '세 번째', description: '세 번째 항목' },
];

const List = mount(() => {
  return () => (
    <dl>
      {items.map(item => (
        <Fragment key={item.id}>
          <dt>{item.title}</dt>
          <dd>{item.description}</dd>
        </Fragment>
      ))}
    </dl>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      각 Fragment는{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;dt&gt;
      </code>
      와{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;dd&gt;
      </code>{' '}
      쌍을 감싸고, <code>key</code>는 항목이 재정렬되거나 업데이트될 때
      Lithent가 효율적으로 변경사항을 추적하도록 도와줍니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      중첩된 Fragment
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Fragment를 중첩하여 추가 DOM 노드 없이 복잡한 레이아웃을 구성할 수
      있습니다:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, Fragment } from 'lithent';

const Card = mount<{ title: string; content: string }>(() => {
  return ({ title, content }) => (
    <Fragment>
      <h2>{title}</h2>
      <Fragment>
        <p>{content}</p>
        <button>더 읽기</button>
      </Fragment>
    </Fragment>
  );
});

const App = mount(() => {
  return () => (
    <div class="container">
      <Card title="안녕하세요" content="세계" />
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      모든 요소는 중간 래퍼 없이 직접 자식으로 렌더링됩니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Fragment 사용 시점
    </h2>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ul class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <span>
            <strong>테이블 행과 셀:</strong>{' '}
            <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
              &lt;tr&gt;
            </code>{' '}
            또는{' '}
            <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
              &lt;td&gt;
            </code>
            를 div로 감싸지 않도록
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <span>
            <strong>Flex/Grid 레이아웃:</strong> 추가 래퍼는 CSS flex나 grid
            정렬을 방해할 수 있습니다
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <span>
            <strong>조건부 그룹:</strong> 래퍼 div 없이 여러 요소를 조건부로
            반환
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <span>
            <strong>깔끔한 DOM:</strong> HTML 구조를 최소한으로 유지하고
            시맨틱하게
          </span>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Fragment vs 래퍼 div
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      두 가지 접근 방식을 비교해보세요:
    </p>

    <CodeBlock
      language="tsx"
      code={`// ❌ 래퍼 div 사용 (추가 DOM 노드 생성)
const BadList = mount(() => {
  return () => (
    <div>
      <li>항목 1</li>
      <li>항목 2</li>
    </div>
  );
});

// ✅ Fragment 사용 (추가 DOM 노드 없음)
const GoodList = mount(() => {
  return () => (
    <Fragment>
      <li>항목 1</li>
      <li>항목 2</li>
    </Fragment>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      래퍼{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;div&gt;
      </code>
      는{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;ul&gt;
      </code>{' '}
      안에서 유효하지 않은 HTML이며 렌더링 문제를 일으킬 수 있습니다. Fragment는
      이를 깔끔하게 해결합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/ko/guide/state"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/ko/guide/state');
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
