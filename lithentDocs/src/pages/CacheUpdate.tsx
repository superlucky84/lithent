import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const CacheUpdate = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      CacheUpdate Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is CacheUpdate?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      CacheUpdate is a helper that{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        caches component rendering results
      </strong>
      .
      <br />
      <br />
      If the dependency array hasn't changed, it reuses the previously created
      Virtual DOM to{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        prevent unnecessary re-renders
      </strong>
      . It's similar to React's{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useMemo
      </code>{' '}
      or{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        React.memo
      </code>
      .
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Performance Optimization:</span>{' '}
        cacheUpdate is a tool for rendering optimization. You don't need to use
        it on every component—apply it selectively only where performance
        bottlenecks occur.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic Usage
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      cacheUpdate takes two arguments:
      <br />
      <br />
      1.{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        checkFunction
      </code>
      : A function that returns a dependency array
      <br />
      2.{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        updater
      </code>
      : A render function that returns Virtual DOM
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        Important:
      </strong>{' '}
      checkFunction is not an array passed directly, but{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        a function that returns an array
      </strong>
      . This is because of Lithent's closure-based state management—it needs to
      read the latest values on every render.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const Counter = mount(renew => {
  let count = 0;
  let otherValue = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  const changeOther = () => {
    otherValue += 1;
    renew();
  };

  // Cache rendering results with cacheUpdate
  return cacheUpdate(
    // 1. checkFunction: Returns dependency array
    () => [count],

    // 2. updater: Render function
    (props) => (
      <div>
        <p>Count: {count}</p>
        <p>Other: {otherValue}</p>
        <button onClick={increment}>Increment Count</button>
        <button onClick={changeOther}>Change Other</button>
      </div>
    )
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 How it works:
        </span>{' '}
        In the example above, clicking{' '}
        <code class="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm">
          changeOther
        </code>{' '}
        won't trigger rendering because{' '}
        <code class="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm">
          count
        </code>{' '}
        hasn't changed. The displayed{' '}
        <code class="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm">
          otherValue
        </code>{' '}
        won't update on screen.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Dependency Array
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      checkFunction must return an array, and each element in this array is
      compared with the previous value using{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        reference equality (===)
      </strong>
      . If all elements are the same, it reuses the cached rendering result.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Why is it designed as a function?</span>
        <br />
        <br />
        Lithent uses{' '}
        <strong class="font-semibold">closure-based state management</strong>.
        Component state (count, name, etc.) exists as closure variables, and to
        check whether they've changed at each render point, you need to{' '}
        <strong class="font-semibold">read their latest values</strong> at that
        moment.
        <br />
        <br />
        By designing it as a function like{' '}
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          () =&gt; [count, name]
        </code>
        , each time you check dependencies, calling this function gets{' '}
        <strong class="font-semibold">the latest closure values</strong>. The
        function reads count and name's current values at call time and returns
        them as an array, so you can accurately detect changes by comparing with
        previous values.
      </p>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const UserProfile = mount<{ userId: number }>(renew => {
  // Manage state with closure variables
  let userName = 'John';
  let userAge = 25;
  let settings = { theme: 'light' };

  return cacheUpdate(
    () => [userName, userAge],
    // ☝️ Calls function at each render to create array with latest values
    //    Detects changes by comparing with previous values

    (props) => (
      <div>
        <h1>User: {userName}</h1>
        <p>Age: {userAge}</p>
        <p>Theme: {settings.theme}</p>
        <p>User ID: {props.userId}</p>
      </div>
    )
  );
});

// Re-renders when userName or userAge changes
// Doesn't re-render when settings.theme changes (not a dependency)
// What about props.userId changes? Automatically reflected since updater receives props`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Reference Comparison:</span> The dependency
        array uses reference comparison. When using objects or arrays as
        dependencies, be careful. Even with identical contents, different
        references are recognized as different values.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical Examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      1. List Item Optimization
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Optimize each list item so they're not affected when other items change.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

type TodoItem = {
  id: number;
  text: string;
  done: boolean;
};

const TodoListItem = mount<TodoItem>(renew => {
  return cacheUpdate(
    // Specify all props values as dependencies
    (props) => [props.id, props.text, props.done],

    (props) => (
      <li>
        <input
          type="checkbox"
          checked={props.done}
          onChange={() => {
            // Handled by parent component
          }}
        />
        <span style={{ textDecoration: props.done ? 'line-through' : 'none' }}>
          {props.text}
        </span>
      </li>
    )
  );
});

const TodoList = mount(renew => {
  let todos: TodoItem[] = [
    { id: 1, text: 'Learn Lithent', done: false },
    { id: 2, text: 'Build App', done: false },
  ];

  return () => (
    <ul>
      {todos.map(todo => (
        <TodoListItem key={todo.id} {...todo} />
      ))}
    </ul>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      2. Caching Complex Computations
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Cache results of expensive computations to prevent unnecessary
      recalculation.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const ExpensiveComponent = mount(renew => {
  let searchQuery = '';
  let filterOption = 'all';
  let sortOption = 'name';

  const updateSearch = (query: string) => {
    searchQuery = query;
    renew();
  };

  return cacheUpdate(
    // Only searchQuery as dependency
    // No re-render when filterOption or sortOption changes
    () => [searchQuery],

    () => {
      // Expensive computation
      const filteredResults = performExpensiveSearch(searchQuery);

      return (
        <div>
          <input
            type="text"
            value={searchQuery}
            onInput={(e: Event) => {
              updateSearch((e.target as HTMLInputElement).value);
            }}
          />
          <div>Results: {filteredResults.length}</div>
        </div>
      );
    }
  );
});

function performExpensiveSearch(query: string) {
  // Expensive search logic
  console.log('Performing expensive search...');
  return [];
}`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      3. Partial Update Optimization
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Specify only part of the component as dependencies to skip rendering when
      other state changes.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const Dashboard = mount(renew => {
  let importantData = 'Critical Info';
  let lessImportantData = 'Extra Info';
  let debugInfo = 'Debug Data';

  const updateImportant = () => {
    importantData = 'Updated Critical Info';
    renew();
  };

  const updateDebug = () => {
    debugInfo = \`Debug \${Date.now()}\`;
    renew(); // Even calling renew won't re-render!
  };

  return cacheUpdate(
    // Only importantData as dependency
    () => [importantData],

    () => (
      <div>
        <h1>Dashboard</h1>
        <p>Important: {importantData}</p>
        <p>Less Important: {lessImportantData}</p>
        <p>Debug: {debugInfo}</p>
        <button onClick={updateImportant}>Update Important</button>
        <button onClick={updateDebug}>Update Debug (no render)</button>
      </div>
    )
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      cacheUpdate vs Computed Comparison
    </h2>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Feature
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              cacheUpdate
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              computed
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Purpose
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Cache rendering results
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Cache computation results
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Return Value
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Virtual DOM (render function)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Computed value
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Usage Location
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount's return statement
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Inside mounter function
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Dependency Specification
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Explicit (checkFunction)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Automatic tracking (state access)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Renew Required
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Required (manual)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Automatic
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Target
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount, lmount
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount (with state)
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Precautions
    </h2>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ Reference Comparison:</span> Each element
        in the dependency array is compared using{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          ===
        </code>
        . If you use objects or arrays as dependencies, they'll cause
        re-rendering every time even with identical contents if references
        differ.
        <br />
        <br />
        <span class="font-medium">⚠️ Missing Dependencies:</span> Include all
        variables used in the updater function in the dependency array. Omitting
        them means the screen won't reflect the latest state.
        <br />
        <br />
        <span class="font-medium">⚠️ Avoid Overuse:</span> You don't need to use
        cacheUpdate on every component. Apply it only where actual performance
        issues exist. Unnecessary use makes code more complex.
        <br />
        <br />
        <span class="font-medium">⚠️ Renew Calls:</span> If dependencies haven't
        changed, calling renew won't trigger re-rendering. This is intentional
        behavior, but be aware as it might be unexpected.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When to Use?
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ Use cacheUpdate When
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>
            • Components with expensive rendering (complex lists, charts, etc.)
          </li>
          <li>• When only some state affects the screen</li>
          <li>• Want to optimize each list item independently</li>
          <li>
            • Props change frequently but only specific props affect rendering
          </li>
        </ul>
      </div>

      <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ cacheUpdate Not Needed
        </h3>
        <ul class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed space-y-2">
          <li>• Simple components (low rendering cost)</li>
          <li>• When all state changes should be reflected on screen</li>
          <li>• When performance issues don't actually occur</li>
          <li>• When reducing code complexity is more important</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Steps
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/18"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/18');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Example: Optimize Lists with cacheUpdate →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Try an example that reduces list rendering count with cacheUpdate
          <br />
          and visually tracks root render and partial render counts.
        </p>
      </a>

      <a
        href="/guide/state-ref"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/state-ref');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: State-Ref →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about state-ref, an external library providing reactivity for
          deeply nested objects.
          <br />
          Very useful when dealing with complex data structures.
        </p>
      </a>
    </div>
  </div>
);
