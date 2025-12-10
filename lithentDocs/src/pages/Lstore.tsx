import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Lstore = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Lstore Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is lstore?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstore is{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        a helper for managing global state
      </strong>
      , specifically designed as the lmount version of store.
      <br />
      <br />
      The key feature of lstore is that{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        the useStore() method automatically calls useRenew() internally
      </strong>
      , eliminating the need to manually pass renew.
      <br />
      <br />
      Multiple components can share the same state, and when the state changes,
      all subscribed components are automatically updated.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

// 1. Create lstore (global)
const userStore = lstore({
  name: 'John',
  age: 25,
});

// 2. Use in lmount component
const UserProfile = lmount(() => {
  const user = userStore.useStore();  // Automatically calls useRenew()

  return () => (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
    </div>
  );
});

// 3. Share across components
const UserEditor = lmount(() => {
  const user = userStore.useStore();  // Share the same store

  const updateAge = () => {
    user.age += 1;  // Update all subscribed components on change
  };

  return () => (
    <div>
      <button onClick={updateAge}>Increase Age</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      useStore() vs watch()
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstore provides two methods:
    </p>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          useStore() - For lmount only
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          Automatically subscribes by calling useRenew() internally. No need to
          manually pass renew.
        </p>
      </div>

      <div class="border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          watch() - Compatible with mount
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          Manually pass renew. Works the same as the regular store call method.
        </p>
      </div>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { lmount, mount } from 'lithent';
import { lstore } from 'lithent/helper';

const counterStore = lstore({ count: 0 });

// ✅ Using useStore() with lmount
const LmountCounter = lmount(() => {
  const state = counterStore.useStore();  // Automatic renew

  return () => <div>Count: {state.count}</div>;
});

// ✅ Using watch() with mount
const MountCounter = mount(renew => {
  const state = counterStore.watch(renew);  // Manual renew

  return () => <div>Count: {state.count}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Selective Subscription (Observer)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Using makeObserver, you can react only to changes in specific fields.
      Useful for performance optimization.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({
  user: { name: 'John', age: 25 },
  theme: 'light',
  count: 0,
});

// Subscribe to user only
const UserDisplay = lmount(() => {
  const app = appStore.useStore(
    store => [store.user]  // Observe user field only
  );

  // No re-render when count changes
  return () => (
    <div>
      <p>User: {app.user.name}</p>
    </div>
  );
});

// Subscribe to theme only
const ThemeToggle = lmount(() => {
  const app = appStore.useStore(
    store => [store.theme]  // Observe theme field only
  );

  const toggleTheme = () => {
    app.theme = app.theme === 'light' ? 'dark' : 'light';
  };

  return () => (
    <button onClick={toggleTheme}>
      Current: {app.theme}
    </button>
  );
});

// Subscribe to multiple fields
const MultiFieldWatch = lmount(() => {
  const app = appStore.useStore(
    store => [store.user, store.theme]  // Observe two fields
  );

  // No re-render when count changes
  return () => (
    <div>
      <p>{app.user.name}</p>
      <p>Theme: {app.theme}</p>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        If you omit makeObserver, it will react to all field changes in the
        store. For large stores, this can cause performance issues, so it's
        better to selectively subscribe to only the fields you need.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Nested Object Reactivity (Important!)
    </h2>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ Warning:</span> Like store, lstore{' '}
        <strong>
          provides reactivity only for 1-depth (root level) properties
        </strong>
        .
        <br />
        <br />
        Directly changing properties of nested objects will not trigger
        reactivity.
      </p>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({
  user: {
    profile: {
      name: 'John',
      email: 'john@example.com',
    },
  },
  count: 0,
});

const App = lmount(() => {
  const app = appStore.useStore();

  const tryUpdateName = () => {
    // ❌ 2-depth change - Reactivity won't work!
    app.user.profile.name = 'Jane';
    // Value changes but no re-render occurs
  };

  const correctUpdateName = () => {
    // ✅ Replace 1-depth object - Reactivity works!
    app.user = {
      ...app.user,
      profile: {
        ...app.user.profile,
        name: 'Jane',
      },
    };
    // Triggers re-render because object is replaced
  };

  return () => (
    <div>
      <p>Name: {app.user.profile.name}</p>
      <button onClick={tryUpdateName}>Direct Change (Won't Work)</button>
      <button onClick={correctUpdateName}>Object Replace (Works)</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Pattern for Handling Nested Objects
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When updating nested objects, always{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        replace the 1-depth property with a new object
      </strong>
      . The spread operator makes this convenient.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const dataStore = lstore({
  settings: {
    display: {
      theme: 'light',
      fontSize: 14,
    },
    privacy: {
      public: true,
    },
  },
});

const Settings = lmount(() => {
  const data = dataStore.useStore();

  const changeTheme = () => {
    // ✅ Correct method: Create new object with spread
    data.settings = {
      ...data.settings,
      display: {
        ...data.settings.display,
        theme: 'dark',
      },
    };
  };

  const changeFontSize = () => {
    // ✅ Using a helper function is cleaner
    updateNestedProperty(
      data,
      ['settings', 'display', 'fontSize'],
      16
    );
  };

  return () => (
    <div>
      <p>Theme: {data.settings.display.theme}</p>
      <p>Font Size: {data.settings.display.fontSize}</p>
      <button onClick={changeTheme}>Change Theme</button>
      <button onClick={changeFontSize}>Change Font Size</button>
    </div>
  );
});

// Helper function for updating nested properties
function updateNestedProperty(store: any, path: string[], value: any) {
  const [first, ...rest] = path;

  if (rest.length === 0) {
    store[first] = value;
  } else {
    store[first] = { ...store[first] };
    let current = store[first];

    for (let i = 0; i < rest.length - 1; i++) {
      current[rest[i]] = { ...current[rest[i]] };
      current = current[rest[i]];
    }

    current[rest[rest.length - 1]] = value;
  }
}`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💎 Deep Reactivity:</span> If you need
        fine-grained reactivity for nested objects, we recommend using the{' '}
        <a
          href="/guide/state-ref"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/state-ref');
          }}
          class="underline hover:no-underline font-medium"
        >
          state-ref
        </a>{' '}
        library. See the state-ref page for more details.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Storing Primitive Values
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstore can store primitive values (number, string, boolean) as well as
      objects. When storing a primitive value, it's automatically wrapped in a{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        {`{ value: ... }`}
      </code>{' '}
      structure.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

// Store as primitive value
const countStore = lstore(0);

const Counter = lmount(() => {
  const count = countStore.useStore();

  const increment = () => {
    count.value += 1;  // Access through .value
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        In most cases, it's better to define stores as objects. You can group
        multiple related states in one store, and type inference is clearer.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lstore vs store Comparison
    </h2>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Feature
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              lstore
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              store
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Target Component
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              lmount (useStore)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Renew Passing
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Automatic (calls useRenew)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Manual (pass as argument)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Usage Pattern
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              store.useStore()
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              store(renew)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Reactivity Depth
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              1-depth (shallow)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              1-depth (shallow)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Selective Subscription
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Supported (makeObserver)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Supported (makeObserver)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount Compatibility
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Available via watch() method
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Default method
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, lmount } from 'lithent';
import { store, lstore } from 'lithent/helper';

// store - Use with mount
const userStore = store({ name: 'John' });

const MountComponent = mount(renew => {
  const user = userStore(renew);  // Manual renew passing
  return () => <div>{user.name}</div>;
});

// lstore - Use with lmount
const userLstore = lstore({ name: 'John' });

const LmountComponent = lmount(() => {
  const user = userLstore.useStore();  // Automatic renew
  return () => <div>{user.name}</div>;
});

// lstore's watch() - Can also be used with mount
const MountWithLstore = mount(renew => {
  const user = userLstore.watch(renew);  // Manual renew
  return () => <div>{user.name}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Cache Option
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstore caches store access per component by default. To disable caching,
      pass the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        {`{ cache: false }`}
      </code>{' '}
      option.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({ count: 0 });

const Component = lmount(() => {
  // Disable caching
  const app = appStore.useStore(null, { cache: false });

  return () => <div>Count: {app.count}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        It's generally better to keep caching enabled (default). Disabling cache
        creates a new subscription each time useStore() is called from the same
        component instance.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Steps
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/context"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/context');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Context →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about the Context API for sharing data across the component
          tree.
          <br />
          Discover how to pass data to deeply nested components without props
          drilling.
        </p>
      </a>
    </div>
  </div>
);
