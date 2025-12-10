import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Computed = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Computed Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is computed?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      computed is a{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        read-only helper that derives values from other values
      </strong>
      .
      <br />
      <br />
      computed takes a function as its argument and exposes the return value as
      a read-only property. The function is executed every time the value is
      accessed, so you always get the latest derived value.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const PriceCalculator = mount(renew => {
  const price = state(100, renew);
  const quantity = state(1, renew);

  // Compute total price
  const total = computed(() => price.value * quantity.value);

  return () => (
    <div>
      <p>Price: {price.value}</p>
      <p>Quantity: {quantity.value}</p>
      <p>Total: {total.value}</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Key Characteristics
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The core characteristics of computed are that it is{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        read-only and re-evaluated on every access
      </strong>
      .
      <br />
      <br />• <strong>Read-only</strong>: Attempting to modify a computed value
      will throw an error.
      <br />• <strong>Lazy Evaluation</strong>: The function runs each time the
      value is accessed.
      <br />• <strong>Always up-to-date</strong>: When dependencies change, the
      next access returns a new value.
      <br />• <strong>Works with both mount and lmount</strong>: Since it does
      not require renew, it can be used anywhere.
    </p>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        computed does NOT automatically track dependencies. Unlike Vue or React
        computed values, this is simply a convenient helper that wraps a
        function and executes it on access.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic Usage
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Simple Computation
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const Counter = mount(renew => {
  const count = state(0, renew);

  // Compute doubled value
  const doubled = computed(() => count.value * 2);

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <p>Doubled: {doubled.value}</p>
      <button onClick={() => (count.value += 1)}>Increment</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Combining Multiple Values
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const UserProfile = mount(renew => {
  const firstName = state('John', renew);
  const lastName = state('Doe', renew);

  // Combine multiple values
  const fullName = computed(() => \`\${firstName.value} \${lastName.value}\`);

  return () => (
    <div>
      <input
        value={firstName.value}
        onInput={(e) => (firstName.value = e.target.value)}
        placeholder="First Name"
      />
      <input
        value={lastName.value}
        onInput={(e) => (lastName.value = e.target.value)}
        placeholder="Last Name"
      />
      <p>Full Name: {fullName.value}</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical Examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Shopping Cart Calculation
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const ShoppingCart = mount(renew => {
  const items = state([
    { name: 'Apple', price: 1000, quantity: 2 },
    { name: 'Banana', price: 500, quantity: 3 },
  ], renew);

  // Total price
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // Total quantity
  const totalQuantity = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const addItem = () => {
    items.value = [
      ...items.value,
      { name: 'Orange', price: 800, quantity: 1 },
    ];
  };

  return () => (
    <div>
      <h3>Shopping Cart</h3>
      {items.value.map((item, i) => (
        <div key={i}>
          {item.name} - {item.price} x {item.quantity}
        </div>
      ))}
      <hr />
      <p>Total Items: {totalQuantity.value}</p>
      <p>Total Price: {totalPrice.value}</p>
      <button onClick={addItem}>Add Item</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Filtering & Sorting
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const TodoList = mount(renew => {
  const todos = state([
    { id: 1, text: 'Learn Lithent', completed: false },
    { id: 2, text: 'Build App', completed: false },
    { id: 3, text: 'Deploy', completed: false },
  ], renew);

  const filter = state<'all' | 'active' | 'completed'>('all', renew);

  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(t => !t.completed);
      case 'completed':
        return todos.value.filter(t => t.completed);
      default:
        return todos.value;
    }
  });

  const completedCount = computed(() =>
    todos.value.filter(t => t.completed).length
  );

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
  };

  return () => (
    <div>
      <h3>Todo List</h3>

      <div>
        <button onClick={() => (filter.value = 'all')}>All</button>
        <button onClick={() => (filter.value = 'active')}>Active</button>
        <button onClick={() => (filter.value = 'completed')}>Completed</button>
      </div>

      {filteredTodos.value.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span style={{
            textDecoration: todo.completed ? 'line-through' : 'none'
          }}>
            {todo.text}
          </span>
        </div>
      ))}

      <p>Completed: {completedCount.value} / {todos.value.length}</p>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Dynamic Class Name Generation
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const ThemeButton = mount(renew => {
  const theme = state<'light' | 'dark'>('light', renew);
  const isActive = state(false, renew);

  const buttonClass = computed(() => {
    const classes = ['btn'];

    if (theme.value === 'dark') {
      classes.push('btn-dark');
    } else {
      classes.push('btn-light');
    }

    if (isActive.value) {
      classes.push('active');
    }

    return classes.join(' ');
  });

  return () => (
    <div>
      <button
        class={buttonClass.value}
        onClick={() => (isActive.value = !isActive.value)}
      >
        Click Me
      </button>
      <button onClick={() => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
      }}>
        Toggle Theme
      </button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Read-only Behavior
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      computed values are read-only. Attempting to modify them will throw an
      error.
    </p>

    <CodeBlock
      language="tsx"
      code={`const doubled = computed(() => count.value * 2);

// ❌ Error!
doubled.value = 10;  // Error: You can't change 'computed'

// ✅ Correct approach: update the source value
count.value = 5;  // doubled automatically becomes 10`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Read-only:</span> computed values cannot be
        modified directly. Update the original source state instead.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Works with Both mount & lmount
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      computed is{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        a read-only helper that does not require renew
      </strong>
      , so it can be freely used in both mount and lmount.
      <br />
      <br />
      This is what distinguishes it from state and lstate. state explicitly
      receives renew, lstate retrieves it automatically via useRenew, but
      computed does not need renew at all—so there is no separate lcomputed.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Using with mount
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const App = mount(renew => {
  const count = state(0, renew);
  const doubled = computed(
    () => count.value * 2
  );

  return () => (
    <div>{doubled.value}</div>
  );
});`}
        />
      </div>
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Using with lmount
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { lmount } from 'lithent';
import { lstate, computed } from 'lithent/helper';

const App = lmount(() => {
  const count = lstate(0);
  const doubled = computed(
    () => count.value * 2
  );

  return () => (
    <div>{doubled.value}</div>
  );
});`}
        />
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Notes & Cautions
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Lazy evaluation:</span> The function runs
        on every access. Be cautious with expensive computations.
        <br />
        <br />
        <span class="font-medium">⚠️ No dependency tracking:</span> Unlike Vue
        or React, dependencies are not tracked automatically.
        <br />
        <br />
        <span class="font-medium">⚠️ Side effects are forbidden:</span> Do not
        mutate state or perform side effects inside computed functions. They
        must remain pure.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/1"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/1');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Example: Banana Smoothie Calories →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Run a simple example that calculates derived calorie values using
          computed and automatically updates when state changes.
        </p>
      </a>

      <a
        href="/guide/effect"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/effect');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Effect →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          You’ve mastered derived values!
          <br />
          Now let’s explore the Effect helper for managing side effects.
        </p>
      </a>
    </div>
  </div>
);
