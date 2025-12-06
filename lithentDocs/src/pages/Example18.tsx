import { mount } from 'lithent';
import { Example18 } from '@/components/examples/example18';
import { CodeBlock } from '@/components/CodeBlock';

export const Example18Page = mount(() => {
  return () => (
    <div class="prose dark:prose-invert max-w-none">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Example 18: CacheUpdate (Product Filter Dashboard)
      </h1>

      <p class="text-gray-600 dark:text-gray-400 mb-8">
        이 예제는 <code>cacheUpdate</code> helper 함수를 사용한 선택적 리렌더링
        최적화를 보여줍니다. React의 <code>memo</code>처럼 의존성 배열의 값이
        변경될 때만 특정 컴포넌트를 다시 그립니다.
      </p>

      {/* 테스트 포커스 */}
      <div class="my-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 class="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
          🎯 테스트 포커스
        </h2>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>cacheUpdate 동작</strong>: 첫 번째 인자의 의존성 배열이
            변경되지 않으면 두 번째 인자(updater)의 실행을 스킵합니다
          </li>
          <li>
            <strong>선택적 리렌더링</strong>: 가격 슬라이더처럼 비싼 연산이
            필요한 부분만 추적하고, 나머지 UI 상태는 무시하여 성능을
            최적화합니다
          </li>
          <li>
            <strong>렌더링 카운터</strong>: Root와 ProductList의 렌더링 횟수를
            시각적으로 표시하여 최적화 효과를 확인합니다
          </li>
          <li>
            <strong>React.memo 유사</strong>: React의 memo와 비슷한 최적화
            패턴입니다
          </li>
        </ul>
      </div>

      {/* 컴포넌트 구조 */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        컴포넌트 구조
      </h2>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Root Component (Example18)</strong>: 두 개의 state를
          관리합니다
          <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
            <li>
              <code>priceRange</code>: 가격 범위 (추적됨 - cacheUpdate 의존성
              배열에 포함)
            </li>
            <li>
              <code>sortOption</code>: 정렬 보기 모드 (UI 전용 상태, 의존성
              배열에는 포함되지 않음)
            </li>
          </ul>
        </li>
        <li>
          <strong>CachedProductList Tag</strong>: <code>cacheUpdate</code>로
          감싼 TagFunction으로, 가격 범위가 변경될 때만 내부 상품 리스트를 다시
          렌더링합니다
        </li>
        <li>
          <strong>렌더링 카운터</strong>: Root와 ProductList의 렌더링 횟수를
          각각 표시합니다
        </li>
      </ol>

      {/* 코드 예제 */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        코드 예제
      </h2>

      <CodeBlock
        language="typescript"
        code={`import { mount } from 'lithent';
import { state, cacheUpdate } from 'lithent/helper';

interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

const products: Product[] = [
  { id: 1, name: 'Laptop Pro', price: 1200, emoji: '💻' },
  { id: 2, name: 'Wireless Mouse', price: 30, emoji: '🖱️' },
  // ...
];

export const Example18 = mount(renew => {
  const priceRange = state(500, renew);
  const sortOption = state<'name' | 'price-low' | 'price-high'>('name', renew);

  let rootRenderCount = 0;
  let listRenderCount = 0;

  // 가격 범위가 바뀔 때만 상품 리스트를 다시 만드는 TagFunction
  const CachedProductList = cacheUpdate(
    () => [priceRange.v],
    () => {
      listRenderCount += 1;
      const filteredProducts = products.filter(p => p.price <= priceRange.v);

      return (
        <div>
          <h4>📦 Product List</h4>
          <div>ProductList 렌더링: {listRenderCount}회</div>
          {/* ... filteredProducts UI ... */}
        </div>
      );
    }
  );

  const updatePriceRange = (value: number) => {
    priceRange.v = value;
  };

  const changeSortOption = (value: typeof sortOption.v) => {
    sortOption.v = value;
  };

  return () => {
    rootRenderCount += 1;

    return (
      <div>
        <h3>🛍️ Product Filter Dashboard</h3>

        {/* 렌더링 카운터 */}
        <div>Root 렌더링: {rootRenderCount}회</div>
        <div>ProductList 렌더링: {listRenderCount}회</div>

        {/* 가격 범위 슬라이더 (추적됨) */}
        <input
          type="range"
          min="0"
          max="1500"
          value={priceRange.v}
          onInput={e => updatePriceRange(Number((e.target as HTMLInputElement).value))}
        />

        {/* 정렬 옵션 (UI 전용 상태) */}
        <button onClick={() => changeSortOption('name')}>Name</button>
        <button onClick={() => changeSortOption('price-low')}>Price: Low</button>
        <button onClick={() => changeSortOption('price-high')}>Price: High</button>

        {/* cacheUpdate로 최적화된 상품 리스트 */}
        <CachedProductList />
      </div>
    );
  };
});`}
      />

      {/* cacheUpdate 동작 방식 */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        cacheUpdate 동작 방식
      </h2>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
        <div class="text-gray-700 dark:text-gray-300 space-y-4">
          <div>
            <code class="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm">
              cacheUpdate(() =&gt; [deps...], () =&gt; updater)
            </code>
          </div>

          <div>
            <strong>첫 번째 인자</strong>: 의존성 배열을 반환하는 함수
            <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                이전 렌더링의 배열 값과 현재 배열 값을 얕은 비교(shallow
                compare)
              </li>
              <li>값이 동일하면 두 번째 인자 실행을 스킵</li>
              <li>값이 다르면 두 번째 인자 실행</li>
            </ul>
          </div>

          <div>
            <strong>두 번째 인자</strong>: updater를 반환하는 함수
            <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>의존성이 변경되었을 때만 실행됩니다</li>
              <li>새로운 updater 함수를 반환합니다</li>
              <li>이 updater가 실제 virtual DOM을 생성합니다</li>
            </ul>
          </div>

          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <strong>이 예제에서:</strong>
            <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                <code>priceRange.v</code> 변경 → 의존성 배열 변경 → updater 실행
                → ProductList 리렌더링 ✓
              </li>
              <li>
                <code>sortOption.v</code> 변경 → Root만 리렌더링 → ProductList는
                이전 props로 그대로 유지 ✗
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* React.memo와 비교 */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        React.memo와 비교
      </h2>

      <div class="overflow-x-auto mb-6">
        <table class="min-w-full border border-gray-300 dark:border-gray-700">
          <thead class="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-700">
                -
              </th>
              <th class="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-700">
                React.memo
              </th>
              <th class="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-700">
                Lithent cacheUpdate
              </th>
            </tr>
          </thead>
          <tbody class="text-gray-700 dark:text-gray-300">
            <tr>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <strong>목적</strong>
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                불필요한 리렌더링 방지
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                불필요한 리렌더링 방지
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <strong>사용 방식</strong>
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                컴포넌트를 memo()로 감싸기
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                updater를 cacheUpdate()로 감싸기
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <strong>비교 대상</strong>
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                모든 props (또는 커스텀 비교 함수)
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                명시적 의존성 배열
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <strong>제어 수준</strong>
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                기본: 모든 props, 커스텀: 비교 함수 작성
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                의존성 배열로 세밀하게 제어
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 주의사항 */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        ⚠️ 주의사항
      </h2>

      <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mb-6 border border-yellow-200 dark:border-yellow-800">
        <ul class="space-y-3 text-gray-700 dark:text-gray-300">
          <li>
            <strong class="text-yellow-800 dark:text-yellow-300">
              의존성 배열 누락 주의
            </strong>
            : 의존성 배열에 포함되지 않은 값이 변경되어도 컴포넌트는
            리렌더링되지 않습니다. 필요한 모든 의존성을 포함해야 합니다.
          </li>
          <li>
            <strong class="text-yellow-800 dark:text-yellow-300">
              얕은 비교(Shallow Compare)
            </strong>
            : 객체나 배열은 참조가 변경되어야 다른 값으로 인식됩니다.{' '}
            <code>[1, 2, 3]</code>을 매번 새로 생성하면 항상 리렌더링됩니다.
          </li>
          <li>
            <strong class="text-yellow-800 dark:text-yellow-300">
              과도한 최적화 금지
            </strong>
            : 모든 컴포넌트에 cacheUpdate를 사용할 필요는 없습니다. 성능 문제가
            실제로 발생하는 경우에만 사용하세요.
          </li>
          <li>
            <strong class="text-yellow-800 dark:text-yellow-300">
              부모-자식 props 전달
            </strong>
            : 부모가 cacheUpdate로 최적화되어 있어도, 자식 컴포넌트는 전달받은
            props가 동일하면 리렌더링되지 않습니다 (이 예제의 ProductList처럼).
          </li>
        </ul>
      </div>

      {/* 테스트 시나리오 */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        🧪 테스트 시나리오
      </h2>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
        <ol class="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
          <li>
            <strong>가격 범위 슬라이더 조절</strong>
            <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Root 렌더링 카운터 증가 ✓</li>
              <li>ProductList 렌더링 카운터 증가 ✓</li>
              <li>상품 목록이 필터링되어 가격 범위 이하의 상품만 표시됨 ✓</li>
            </ul>
          </li>
          <li>
            <strong>
              정렬 옵션 버튼 클릭 (Name / Price: Low / Price: High)
            </strong>
            <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Root 렌더링 카운터 증가 ✓</li>
              <li>ProductList 렌더링 카운터 증가하지 않음 ✓</li>
              <li>상품 목록은 이전 상태 그대로 유지됨 (정렬 미적용) ✓</li>
            </ul>
          </li>
          <li>
            <strong>가격 범위와 정렬 옵션을 번갈아가며 변경</strong>
            <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>
                가격 범위 변경 시에만 ProductList가 리렌더링되는 것을 확인 ✓
              </li>
              <li>두 렌더링 카운터의 차이가 점점 벌어지는 것을 확인 ✓</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* 실제 사용 사례 */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        💡 실제 사용 사례
      </h2>

      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-8 border border-green-200 dark:border-green-800">
        <ul class="space-y-3 text-gray-700 dark:text-gray-300">
          <li>
            <strong>대용량 리스트</strong>: 수백~수천 개의 아이템을 렌더링하는
            리스트 컴포넌트에서 불필요한 리렌더링 방지
          </li>
          <li>
            <strong>복잡한 차트/그래프</strong>: 렌더링 비용이 높은 시각화
            컴포넌트에서 데이터가 실제로 변경될 때만 리렌더링
          </li>
          <li>
            <strong>필터링/정렬 UI</strong>: 여러 필터 옵션 중 일부만 특정
            컴포넌트에 영향을 미치는 경우
          </li>
          <li>
            <strong>실시간 데이터 대시보드</strong>: 여러 데이터 소스를
            표시하지만 각 위젯은 자신의 데이터만 추적
          </li>
          <li>
            <strong>폼 컴포넌트</strong>: 폼 전체가 리렌더링되어도 변경되지 않은
            입력 필드는 유지
          </li>
        </ul>
      </div>

      {/* 실행 예제 */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        🚀 실행 예제
      </h2>

      <div class="not-prose my-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <Example18 />
      </div>

      <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Tip</strong>: 가격 범위 슬라이더를 움직일 때와 정렬 버튼을
          클릭할 때 렌더링 카운터가 어떻게 변하는지 비교해보세요. ProductList는
          priceRange가 변경될 때만 리렌더링됩니다!
        </p>
      </div>

      <div class="mt-10">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          관련 문서
        </h2>
        <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6 space-y-2">
          <li>
            <a
              href="/guide/cache-update"
              class="text-[#42b883] hover:underline"
              onClick={(e: Event) => {
                e.preventDefault();
                window.history.pushState({}, '', '/guide/cache-update');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              CacheUpdate 가이드
            </a>{' '}
            - cacheUpdate(checkFunction, updater) API와 의존성 배열 설계를
            상세히 설명합니다.
          </li>
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
            - 계산 비용이 큰 파생 값을 캐싱하는 또 다른 도구인 computed와의
            차이를 비교해볼 수 있습니다.
          </li>
        </ul>
      </div>
    </div>
  );
});
