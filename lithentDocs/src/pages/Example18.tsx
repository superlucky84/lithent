import { mount } from 'lithent';
import { Example18 } from '@/components/examples/example18';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Example18Page = mount(() => {
  return () => (
    <div class="prose dark:prose-invert max-w-none">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        CacheUpdate (Product Filter Dashboard)
      </h1>

      <p class="text-gray-600 dark:text-gray-400 mb-8">
        This example demonstrates selective re-rendering optimization using the{' '}
        <code>cacheUpdate</code> helper function. Like React's <code>memo</code>
        , it re-renders specific components only when dependency array values
        change.
      </p>

      {/* Test Focus */}
      <div class="my-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 class="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
          🎯 Test Focus
        </h2>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>cacheUpdate Behavior</strong>: Skips execution of the second
            argument (updater) if the dependency array from the first argument
            hasn't changed
          </li>
          <li>
            <strong>Selective Re-rendering</strong>: Track only expensive
            operations like the price slider, and ignore other UI states to
            optimize performance
          </li>
          <li>
            <strong>Render Counters</strong>: Visually display the number of
            renders for Root and ProductList to verify optimization effects
          </li>
          <li>
            <strong>Similar to React.memo</strong>: An optimization pattern
            similar to React's memo
          </li>
        </ul>
      </div>

      {/* Component Structure */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Component Structure
      </h2>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Root Component (Example18)</strong>: Manages two states
          <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
            <li>
              <code>priceRange</code>: Price range (tracked - included in
              cacheUpdate dependency array)
            </li>
            <li>
              <code>sortOption</code>: Sort view mode (UI state only, not
              included in dependency array)
            </li>
          </ul>
        </li>
        <li>
          <strong>CachedProductList Tag</strong>: A TagFunction wrapped with{' '}
          <code>cacheUpdate</code> that re-renders the internal product list
          only when the price range changes
        </li>
        <li>
          <strong>Render Counters</strong>: Display the number of renders for
          Root and ProductList separately
        </li>
      </ol>

      {/* Code Example */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Code Example
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

  // TagFunction that recreates product list only when price range changes
  const CachedProductList = cacheUpdate(
    () => [priceRange.v],
    () => {
      listRenderCount += 1;
      const filteredProducts = products.filter(p => p.price <= priceRange.v);

      return (
        <div>
          <h4>📦 Product List</h4>
          <div>ProductList renders: {listRenderCount} times</div>
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

        {/* Render Counter */}
        <div>Root renders: {rootRenderCount} times</div>
        <div>ProductList renders: {listRenderCount} times</div>

        {/* Price Range Slider (Tracked) */}
        <input
          type="range"
          min="0"
          max="1500"
          value={priceRange.v}
          onInput={e => updatePriceRange(Number((e.target as HTMLInputElement).value))}
        />

        {/* Sort Options (UI State Only) */}
        <button onClick={() => changeSortOption('name')}>Name</button>
        <button onClick={() => changeSortOption('price-low')}>Price: Low</button>
        <button onClick={() => changeSortOption('price-high')}>Price: High</button>

        {/* Product List (Optimized with cacheUpdate) */}
        <CachedProductList />
      </div>
    );
  };
});`}
      />

      {/* How cacheUpdate Works */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        How cacheUpdate Works
      </h2>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
        <div class="text-gray-700 dark:text-gray-300 space-y-4">
          <div>
            <code class="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm">
              cacheUpdate(() =&gt; [deps...], () =&gt; updater)
            </code>
          </div>

          <div>
            <strong>First Argument</strong>: Function that returns dependency
            array
            <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                Performs shallow comparison between previous and current array
                values
              </li>
              <li>Skips second argument execution if values are the same</li>
              <li>Executes second argument if values differ</li>
            </ul>
          </div>

          <div>
            <strong>Second Argument</strong>: Function that returns updater
            <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Executes only when dependencies change</li>
              <li>Returns a new updater function</li>
              <li>This updater creates the actual virtual DOM</li>
            </ul>
          </div>

          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <strong>In this example:</strong>
            <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                <code>priceRange.v</code> changes → dependency array changes →
                updater executes → ProductList re-renders ✓
              </li>
              <li>
                <code>sortOption.v</code> changes → Only Root re-renders →
                ProductList stays with previous props ✗
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison with React.memo */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Comparison with React.memo
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
                <strong>Purpose</strong>
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Prevent unnecessary re-renders
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Prevent unnecessary re-renders
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <strong>Usage</strong>
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Wrap component with memo()
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Wrap updater with cacheUpdate()
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <strong>Comparison Target</strong>
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                All props (or custom comparison function)
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Explicit dependency array
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <strong>Control Level</strong>
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Default: all props, Custom: write comparison function
              </td>
              <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Fine-grained control with dependency array
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cautions */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        ⚠️ Cautions
      </h2>

      <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mb-6 border border-yellow-200 dark:border-yellow-800">
        <ul class="space-y-3 text-gray-700 dark:text-gray-300">
          <li>
            <strong class="text-yellow-800 dark:text-yellow-300">
              Watch for Missing Dependencies
            </strong>
            : Components won't re-render even if values not included in the
            dependency array change. Include all necessary dependencies.
          </li>
          <li>
            <strong class="text-yellow-800 dark:text-yellow-300">
              Shallow Comparison
            </strong>
            : Objects or arrays are recognized as different only when their
            reference changes. Creating <code>[1, 2, 3]</code> anew each time
            will always trigger re-renders.
          </li>
          <li>
            <strong class="text-yellow-800 dark:text-yellow-300">
              Avoid Over-optimization
            </strong>
            : You don't need to use cacheUpdate on every component. Only use it
            when performance issues actually occur.
          </li>
          <li>
            <strong class="text-yellow-800 dark:text-yellow-300">
              Parent-Child Props Passing
            </strong>
            : Even if the parent is optimized with cacheUpdate, child components
            won't re-render if received props are the same (like ProductList in
            this example).
          </li>
        </ul>
      </div>

      {/* Test Scenarios */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        🧪 Test Scenarios
      </h2>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
        <ol class="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Adjust Price Range Slider</strong>
            <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Root render counter increases ✓</li>
              <li>ProductList render counter increases ✓</li>
              <li>
                Product list filters to show only items within price range ✓
              </li>
            </ul>
          </li>
          <li>
            <strong>
              Click Sort Option Buttons (Name / Price: Low / Price: High)
            </strong>
            <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Root render counter increases ✓</li>
              <li>ProductList render counter does not increase ✓</li>
              <li>
                Product list stays in previous state (sorting not applied) ✓
              </li>
            </ul>
          </li>
          <li>
            <strong>Alternate Between Price Range and Sort Options</strong>
            <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>
                Verify ProductList re-renders only when price range changes ✓
              </li>
              <li>Verify the gap between the two render counters widens ✓</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Practical Use Cases */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        💡 Practical Use Cases
      </h2>

      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-8 border border-green-200 dark:border-green-800">
        <ul class="space-y-3 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Large Lists</strong>: Prevent unnecessary re-renders in list
            components rendering hundreds or thousands of items
          </li>
          <li>
            <strong>Complex Charts/Graphs</strong>: Re-render visualization
            components with high rendering costs only when data actually changes
          </li>
          <li>
            <strong>Filtering/Sorting UI</strong>: When only some of multiple
            filter options affect specific components
          </li>
          <li>
            <strong>Real-time Data Dashboards</strong>: Display multiple data
            sources but each widget tracks only its own data
          </li>
          <li>
            <strong>Form Components</strong>: Keep unchanged input fields intact
            even when the entire form re-renders
          </li>
        </ul>
      </div>

      {/* Live Example */}
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        🚀 Live Example
      </h2>

      <div class="not-prose my-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <Example18 />
      </div>

      <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Tip</strong>: Compare how the render counters change when
          moving the price range slider versus clicking sort buttons.
          ProductList only re-renders when priceRange changes!
        </p>
      </div>

      <div class="mt-10">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          Related Documentation
        </h2>
        <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6 space-y-2">
          <li>
            <a
              href="/guide/cache-update"
              class="text-[#42b883] hover:underline"
              onClick={(e: Event) => {
                e.preventDefault();
                navigateTo('/guide/cache-update');
              }}
            >
              CacheUpdate Guide
            </a>{' '}
            - Detailed explanation of cacheUpdate(checkFunction, updater) API
            and dependency array design.
          </li>
          <li>
            <a
              href="/guide/computed"
              class="text-[#42b883] hover:underline"
              onClick={(e: Event) => {
                e.preventDefault();
                navigateTo('/guide/computed');
              }}
            >
              Computed Guide
            </a>{' '}
            - Compare the differences with computed, another tool for caching
            expensive derived values.
          </li>
        </ul>
      </div>
    </div>
  );
});
