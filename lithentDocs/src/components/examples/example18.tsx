import { mount } from 'lithent';
import { state, cacheUpdate } from 'lithent/helper';

// 상품 타입
interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

const products: Product[] = [
  { id: 1, name: 'Laptop Pro', price: 1200, emoji: '💻' },
  { id: 2, name: 'Wireless Mouse', price: 30, emoji: '🖱️' },
  { id: 3, name: 'Keyboard', price: 80, emoji: '⌨️' },
  { id: 4, name: 'Monitor', price: 300, emoji: '🖥️' },
  { id: 5, name: 'Headphones', price: 150, emoji: '🎧' },
  { id: 6, name: 'USB Cable', price: 10, emoji: '🔌' },
];

// 상품 목록 컴포넌트 (cacheUpdate로 최적화)
const ProductList = mount<{
  priceRange: number;
  sortOption: string;
  renderCount: number;
}>(_renew => {
  let localRenderCount = 0;

  return ({ priceRange }) => {
    localRenderCount += 1;

    const filteredProducts = products.filter(p => p.price <= priceRange);

    return (
      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-base font-semibold text-gray-900 dark:text-white">
            📦 Product List
          </h4>
          <div class="text-xs">
            <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-purple-700 dark:text-purple-300 font-semibold">
              ProductList 렌더링: {localRenderCount}회
            </span>
          </div>
        </div>
        <div class="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
          <strong>cacheUpdate 동작:</strong> priceRange가 변경될 때만
          리렌더링됩니다. sortOption 변경은 무시됩니다.
        </div>
        <div class="space-y-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div
                key={product.id}
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{product.emoji}</span>
                  <div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">
                      ${product.price}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No products found in this price range
            </div>
          )}
        </div>
        <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
    );
  };
});

export const Example18 = mount(renew => {
  const priceRange = state(500, renew);
  const sortOption = state('name', renew);
  let rootRenderCount = 0;

  const updatePriceRange = (value: number) => {
    priceRange.v = value;
  };

  const changeSortOption = (value: string) => {
    sortOption.v = value;
  };

  return cacheUpdate(
    () => [priceRange.v],
    () => {
      rootRenderCount += 1;
      console.log('j');

      return (
        <div class="w-full max-w-2xl mx-auto">
          <div class="mb-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span class="text-2xl">🛍️</span>
              Product Filter Dashboard
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              cacheUpdate를 사용한 선택적 리렌더링 최적화 예제입니다
            </p>
          </div>

          {/* 렌더링 카운터 */}
          <div class="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">
              렌더링 카운터:
            </div>
            <div class="flex gap-3">
              <span class="px-3 py-1 bg-green-100 dark:bg-green-900 rounded text-green-700 dark:text-green-300 text-sm font-semibold">
                Root 렌더링: {rootRenderCount}회
              </span>
            </div>
          </div>

          {/* 필터 컨트롤 */}
          <div class="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4">
            {/* 가격 범위 슬라이더 */}
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  💰 Price Range (추적됨)
                </label>
                <span class="text-sm font-bold text-blue-600 dark:text-blue-400">
                  ${priceRange.v}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1500"
                step="50"
                value={priceRange.v}
                onInput={(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updatePriceRange(Number(target.value));
                }}
                class="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>$0</span>
                <span>$1500</span>
              </div>
              <div class="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300">
                ✓ 이 값이 변경되면 ProductList가 리렌더링됩니다
              </div>
            </div>

            {/* 정렬 옵션 */}
            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                🔀 Sort Option (추적 안 됨)
              </label>
              <div class="flex gap-2">
                <button
                  onClick={() => changeSortOption('name')}
                  class={`px-3 py-2 rounded text-sm font-semibold transition-colors ${
                    sortOption.v === 'name'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => changeSortOption('price-low')}
                  class={`px-3 py-2 rounded text-sm font-semibold transition-colors ${
                    sortOption.v === 'price-low'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Price: Low
                </button>
                <button
                  onClick={() => changeSortOption('price-high')}
                  class={`px-3 py-2 rounded text-sm font-semibold transition-colors ${
                    sortOption.v === 'price-high'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Price: High
                </button>
              </div>
              <div class="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
                ⚠️ 이 값이 변경되어도 ProductList는 리렌더링되지 않습니다
              </div>
            </div>
          </div>

          {/* 상품 목록 */}
          <ProductList
            priceRange={priceRange.v}
            sortOption={sortOption.v}
            renderCount={rootRenderCount}
          />

          {/* cacheUpdate 설명 */}
          <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
              💡 cacheUpdate 동작 방식
            </h4>
            <div class="text-xs text-blue-700 dark:text-blue-300 space-y-2">
              <div>
                <code class="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono">
                  cacheUpdate(() =&gt; [priceRange.v], () =&gt; updater)
                </code>
              </div>
              <div>
                첫 번째 인자의 배열 값들을 이전 렌더링과 비교하여, 변경되지
                않았으면 두 번째 인자(updater)의 실행을 스킵합니다.
              </div>
              <div class="pt-2 border-t border-blue-200 dark:border-blue-700">
                <strong>이 예제에서:</strong>
                <ul class="list-disc list-inside ml-2 mt-1 space-y-1">
                  <li>priceRange 변경 → ProductList 리렌더링 ✓</li>
                  <li>sortOption 변경 → ProductList 리렌더링 스킵 ✗</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 테스트 요점 */}
          <div class="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <h4 class="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
              🎯 테스트 요점
            </h4>
            <ul class="text-xs text-green-700 dark:text-green-300 space-y-1">
              <li>
                • <strong>가격 범위 변경</strong>: ProductList의 렌더링 카운터가
                증가합니다
              </li>
              <li>
                • <strong>정렬 옵션 변경</strong>: Root 렌더링만 증가하고,
                ProductList는 그대로입니다
              </li>
              <li>
                • <strong>성능 최적화</strong>: 불필요한 리렌더링을 방지하여
                성능을 향상시킵니다
              </li>
              <li>
                • <strong>React.memo 유사</strong>: React의 memo와 비슷한 최적화
                기법입니다
              </li>
            </ul>
          </div>
        </div>
      );
    }
  );
});
