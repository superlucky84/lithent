import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const StateRef = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      State-Ref
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is state-ref?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <a
        href="https://github.com/superlucky84/state-ref"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[#42b883] hover:underline font-medium"
      >
        state-ref
      </a>{' '}
      is an external library that provides{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        deep reactivity for nested objects
      </strong>
      .
      <br />
      <br />
      It enables reactivity across all depths of nested objects and arrays,
      allowing you to manage complex data structures with ease.
      <br />
      <br />
      It is optimized for use with Lithent and is especially useful when working
      with deeply nested data structures.
    </p>

    <div class="border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <span class="font-medium">📦 Installation:</span>
        <br />
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          npm install state-ref
        </code>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic Usage
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state-ref creates a store using the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        createStore
      </code>{' '}
      function. The created store receives the renew function to connect with
      components.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createStore } from 'state-ref';

// Type definitions
type Info = {
  age: number;
  house: { color: string; floor: number }[]
};

type People = {
  john: Info;
  brown: Info;
  sara: Info
};

// Create a store
const peopleStore = createStore<People>({
  john: {
    age: 20,
    house: [
      { color: 'red', floor: 5 },
      { color: 'blue', floor: 3 },
    ],
  },
  brown: {
    age: 26,
    house: [{ color: 'green', floor: 5 }]
  },
  sara: {
    age: 26,
    house: [{ color: 'yellow', floor: 5 }]
  },
});

// Use inside a component
const Component = mount(renew => {
  const peopleRef = peopleStore(renew);

  const changeAge = () => {
    // ✅ Deeply nested properties can be mutated directly!
    peopleRef.john.age.value += 1;
  };

  return () => (
    <div>
      <p>John's age: {peopleRef.john.age.value}</p>
      <button onClick={changeAge}>Increase Age</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 .value Access:</span> All state-ref
        properties must be accessed and mutated via{' '}
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          .value
        </code>
        . This enables Proxy-based reactivity tracking.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Nested Object Reactivity
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The biggest advantage of state-ref is that reactivity works even in deeply
      nested structures. All properties at every depth can be mutated directly
      using .value.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createStore } from 'state-ref';

// Create a deeply nested store
const appStore = createStore({
  user: {
    profile: {
      name: 'John',
      age: 25,
      address: {
        city: 'Seoul',
        country: 'Korea'
      }
    },
    settings: {
      theme: 'light',
      notifications: true
    }
  },
});

const UserProfile = mount(renew => {
  const app = appStore(renew);

  const changeName = () => {
    // ✅ Directly mutate a 3-depth nested property - reactive!
    app.user.profile.name.value = 'Jane';
  };

  const changeCity = () => {
    // ✅ Directly mutate a 4-depth nested property - reactive!
    app.user.profile.address.city.value = 'Busan';
  };

  const toggleTheme = () => {
    // ✅ Nested properties in other paths behave the same way
    app.user.settings.theme.value =
      app.user.settings.theme.value === 'light' ? 'dark' : 'light';
  };

  return () => (
    <div>
      <h2>Profile</h2>
      <p>Name: {app.user.profile.name.value}</p>
      <p>Age: {app.user.profile.age.value}</p>
      <p>City: {app.user.profile.address.city.value}</p>
      <p>Theme: {app.user.settings.theme.value}</p>

      <button onClick={changeName}>Change Name</button>
      <button onClick={changeCity}>Change City</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Array Reactivity
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When working with arrays in state-ref, you must use direct index
      assignment to trigger the Proxy setter. Mutating properties of objects
      inside arrays must also be done through .value.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createStore } from 'state-ref';

type Todo = { id: number; text: string; done: boolean };

const todoStore = createStore<{ todos: Todo[] }>({
  todos: [
    { id: 1, text: 'Learn Lithent', done: false },
    { id: 2, text: 'Build App', done: false },
  ],
});

const TodoList = mount(renew => {
  const store = todoStore(renew);

  const addTodo = () => {
    // ✅ Direct index assignment - reactive
    const newTodo = {
      id: Date.now(),
      text: 'New Todo',
      done: false,
    };
    store.todos.value[store.todos.value.length] = newTodo;
  };

  const toggleTodo = (index: number) => {
    // ✅ Mutating object properties inside the array is reactive
    const todo = store.todos.value[index];
    todo.done.value = !todo.done.value;
  };

  const removeTodo = (index: number) => {
    // ✅ Removal via index — creates a new array using filter
    store.todos.value = store.todos.value.filter((_, i) => i !== index);
  };

  return () => (
    <div>
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {store.todos.value.map((todo, index) => (
          <li>
            <span style={{
              textDecoration: todo.done.value ? 'line-through' : 'none'
            }}>
              {todo.text.value}
            </span>
            <button onClick={() => toggleTodo(index)}>Toggle</button>
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When Should You Use It?
    </h2>

    <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 mb-6 rounded-r">
      <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
        ✅ When state-ref is a good fit
      </h3>
      <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
        <li>• Deeply nested complex data (forms, settings, API responses)</li>
        <li>• Frequently mutating objects inside arrays</li>
        <li>• Updating multiple depths at once</li>
        <li>• Tree or graph-like recursive data structures</li>
        <li>• Dashboards or complex configuration-driven UIs</li>
      </ul>
    </div>

    <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">
      Real-World Usage Examples
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state-ref is especially useful in scenarios such as:
    </p>

    <ul class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-3 mb-6 list-disc list-inside">
      <li>
        <strong class="font-semibold">Multi-step forms:</strong> Individually
        updating fields across sections
      </li>
      <li>
        <strong class="font-semibold">Settings panels:</strong> Applications
        with deeply nested configuration
      </li>
      <li>
        <strong class="font-semibold">Chat applications:</strong> Users,
        messages, and channels as nested data
      </li>
      <li>
        <strong class="font-semibold">Dashboards:</strong> Complex widgets,
        charts, and filters
      </li>
      <li>
        <strong class="font-semibold">File explorers:</strong> Folder and file
        tree structures
      </li>
    </ul>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Caveats
    </h2>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ .value is mandatory:</span> All state-ref
        properties must be accessed via{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          .value
        </code>
        . Omitting this will return the Proxy object and may cause unintended
        behavior.
        <br />
        <br />
        <span class="font-medium">⚠️ Be careful with array methods:</span>{' '}
        Calling push, pop, or splice directly will NOT trigger the Proxy setter,
        so reactivity will not occur. Use direct index assignment{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          arr.value[0] = item
        </code>{' '}
        or replace the entire array{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          arr.value = [...]
        </code>
        .
        <br />
        <br />
        <span class="font-medium">⚠️ Use with mount:</span> Since state-ref uses
        an explicit renew pattern, it is naturally paired with{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          mount
        </code>
        . When using with lmount, you must manually call useRenew().
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Learn More
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="https://github.com/superlucky84/state-ref"
        target="_blank"
        rel="noopener noreferrer"
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          GitHub Repository →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Check out the full API documentation and more examples for state-ref.
        </p>
      </a>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/vite-plugin"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/vite-plugin');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Template: Vite Plugin →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn how to configure Vite plugins to use JSX and various template
          styles.
          <br />
          Choose the template style that best fits your project.
        </p>
      </a>
    </div>
  </div>
);
