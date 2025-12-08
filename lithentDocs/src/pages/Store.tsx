import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Store = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Store Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is store?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The <code>store</code> helper{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        manages shared/global state
      </strong>
      .
      <br />
      <br />
      The key idea is that it{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        explicitly delegates the renew function through its arguments
      </strong>
      . This makes it a natural fit for <code>mount</code> (and the main
      difference from <code>lstore</code>).
      <br />
      <br />
      Multiple components can share the same store, and when its state changes,
      every subscribed component is updated.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 1. Create a store (global)
const userStore = store({
  name: 'John',
  age: 25,
});

// 2. Use inside a component
const UserProfile = mount(renew => {
  const user = userStore(renew);  // explicitly pass renew to subscribe

  return () => (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <button onClick={() => user.age++}>Increase Age</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic usage
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The <code>store</code> helper is used in two steps:
      <br />
      <br />
      <strong>Step 1. Create the store</strong> – define the initial state
      outside of components.
      <br />
      <strong>Step 2. Subscribe</strong> – pass <code>renew</code> from your
      components to subscribe.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// Step 1: create the store (outside components)
const counterStore = store({ count: 0 });

// Step 2: subscribe inside components
const Counter = mount(renew => {
  const counter = counterStore(renew);

  return () => (
    <div>
      <p>Count: {counter.count}</p>
      <button onClick={() => counter.count++}>+</button>
    </div>
  );
});

// Another component can share the same store
const CounterDisplay = mount(renew => {
  const counter = counterStore(renew);

  return () => <div>Current: {counter.count}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Key characteristics
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        1. Designed to work with mount
      </strong>
      <br />
      Because <code>store</code> expects a <code>renew</code> argument, it pairs
      naturally with <code>mount</code> components.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        2. Shared global state
      </strong>
      <br />
      Creating a store outside components lets multiple components share the
      same state.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        3. Reactive Proxy
      </strong>
      <br />
      Stores use JavaScript Proxy under the hood. Mutating properties directly
      automatically triggers updates for subscribers.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        4. Selective subscriptions (watch)
      </strong>
      <br />
      Passing an observer function as the second argument lets you watch only
      specific parts of the store.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Primitives vs objects
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Storing objects (recommended)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// Store an object – access properties directly
const userStore = store({
  name: 'John',
  age: 25,
});

const UserComponent = mount(renew => {
  const user = userStore(renew);

  console.log(user.name);  // 'John'
  user.age = 26;  // mutate directly

  return () => <div>{user.name}, {user.age}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Storing primitives
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// Primitive values are wrapped in .value
const countStore = store(0);

const Counter = mount(renew => {
  const count = countStore(renew);

  console.log(count.value);  // 0
  count.value = 1;  // access through .value

  return () => <div>{count.value}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Recommendation:
        </span>{' '}
        Storing objects is often more intuitive than storing primitives. Group
        related state into a single object to keep things easy to manage.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Selective subscriptions (watch)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Passing an observer function as the second argument lets you watch only
      specific properties. Only the fields accessed inside the observer are
      tracked.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({
  user: 'John',
  count: 0,
  theme: 'light',
});

const UserDisplay = mount(renew => {
  // Only watch user (count, theme changes will not re-render)
  const app = appStore(
    renew,
    (store) => [store.user]  // observer: only user is tracked
  );

  return () => (
    <div>
      <p>User: {app.user}</p>
      <p>Count: {app.count}</p>  {/* count changes will not re-render */}
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Performance tip:
        </span>{' '}
        Observers help avoid unnecessary re-renders. For large stores, watching
        only the fields you care about can significantly improve performance.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Authentication state
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// Global auth store
const authStore = store<{
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
}>({
  isAuthenticated: false,
  user: null,
});

// Login function
export const login = (name: string, email: string) => {
  const auth = authStore();  // Access without renew (no subscription)
  auth.isAuthenticated = true;
  auth.user = { name, email };
};

// Logout function
export const logout = () => {
  const auth = authStore();
  auth.isAuthenticated = false;
  auth.user = null;
};

// Header component
const Header = mount(renew => {
  const auth = authStore(renew);

  return () => (
    <header>
      {auth.isAuthenticated ? (
        <div>
          <span>Welcome, {auth.user?.name}!</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('John', 'john@example.com')}>
          Login
        </button>
      )}
    </header>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Shopping cart
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// Cart store
const cartStore = store<{
  items: CartItem[];
  total: number;
}>({
  items: [],
  total: 0,
});

// Cart actions
export const addToCart = (item: CartItem) => {
  const cart = cartStore();
  cart.items = [...cart.items, item];
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
};

export const removeFromCart = (id: number) => {
  const cart = cartStore();
  cart.items = cart.items.filter(item => item.id !== id);
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
};

// Cart display component
const CartDisplay = mount(renew => {
  const cart = cartStore(renew);

  return () => (
    <div class="cart">
      <h2>Shopping Cart</h2>
      {cart.items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>{item.price} x {item.quantity}</span>
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      <div class="total">Total: {cart.total}</div>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Theme management
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const themeStore = store<{
  mode: 'light' | 'dark';
  primaryColor: string;
}>({
  mode: 'light',
  primaryColor: '#42b883',
});

export const toggleTheme = () => {
  const theme = themeStore();
  theme.mode = theme.mode === 'light' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark');
};

export const setPrimaryColor = (color: string) => {
  const theme = themeStore();
  theme.primaryColor = color;
  document.documentElement.style.setProperty('--primary-color', color);
};

const ThemeToggle = mount(renew => {
  const theme = themeStore(renew);

  return () => (
    <div>
      <button onClick={toggleTheme}>
        Current: {theme.mode}
      </button>
      <input
        type="color"
        value={theme.primaryColor}
        onInput={(e: Event) => {
          setPrimaryColor((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Accessing the store without subscribing
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      If you omit <code>renew</code>, you can access the store without
      subscribing. This is useful in utility functions or event handlers that
      don&apos;t need to trigger a re-render.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const counterStore = store({ count: 0 });

// Outside components: access without subscription (no re-render)
const increment = () => {
  const counter = counterStore();  // no renew
  counter.count++;
};

// Inside components: subscribe to receive re-renders
const Counter = mount(renew => {
  const counter = counterStore(renew);  // subscribe by passing renew

  return () => (
    <div>
      <p>{counter.count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Caching
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      By default, the store returns the same proxy instance for the same{' '}
      <code>renew</code> function (caching). To disable this and get a fresh
      proxy each time, pass <code>cache: false</code> as the third argument.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const counterStore = store({ count: 0 });

const Counter = mount(renew => {
  // Default behavior: cached (same instance for the same renew)
  const counter1 = counterStore(renew);
  const counter2 = counterStore(renew);
  console.log(counter1 === counter2);  // true

  // Disable caching (new instance on every call)
  const counter3 = counterStore(renew, null, { cache: false });
  console.log(counter1 === counter3);  // false

  return () => <div>{counter1.count}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Nested object reactivity (important)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        Stores only provide reactivity for the first level of properties.
      </strong>{' '}
      Mutating nested objects in place does not trigger reactivity.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({
  user: {
    name: 'John',
    age: 25,
  },
  settings: {
    theme: 'light',
  },
});

const App = mount(renew => {
  const app = appStore(renew);

  // ✅ First-level change – reactive
  app.user = { name: 'Jane', age: 30 };

  // ❌ Second-level change – not reactive!
  app.user.name = 'Jane';  // value changes but no re-render
  app.settings.theme = 'dark';  // value changes but no re-render

  // ✅ Fix: replace the whole object
  app.user = { ...app.user, name: 'Jane' };
  app.settings = { ...app.settings, theme: 'dark' };

  return () => <div>{app.user.name}</div>;
});`}
    />

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">🚨 Important:</span> stores provide only
        shallow reactivity. If you mutate nested object properties directly, the
        UI will not update. Always replace first‑level properties with new
        objects.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Patterns for nested objects
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({
  user: {
    profile: {
      name: 'John',
      email: 'john@example.com',
    },
    preferences: {
      theme: 'light',
      language: 'en',
    },
  },
});

const App = mount(renew => {
  const app = appStore(renew);

  const updateName = (newName: string) => {
    // ❌ Wrong – does not trigger reactivity
    // app.user.profile.name = newName;

    // ✅ Correct pattern 1: use the spread operator
    app.user = {
      ...app.user,
      profile: {
        ...app.user.profile,
        name: newName,
      },
    };
  };

  const updateTheme = (newTheme: string) => {
    // ✅ Correct pattern 2: create a new object
    app.user = {
      ...app.user,
      preferences: {
        ...app.user.preferences,
        theme: newTheme,
      },
    };
  };

  return () => (
    <div>
      <p>Name: {app.user.profile.name}</p>
      <p>Theme: {app.user.preferences.theme}</p>
      <button onClick={() => updateName('Jane')}>Change Name</button>
      <button onClick={() => updateTheme('dark')}>Change Theme</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Recommended shape:
        </span>{' '}
        Try to minimize deep nesting and favor flatter store structures. If you
        really need deep nesting, consider splitting each depth into separate
        top‑level properties.
      </p>
    </div>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💎 Deep Reactivity:</span> If you need more
        fine‑grained reactivity for nested objects, consider using the{' '}
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
        library. See the state-ref page for details.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Cache options
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      By default, access to the store is cached per component. To disable this
      behavior, pass{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        {`{ cache: false }`}
      </code>{' '}
      as the third argument.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({ count: 0 });

const Component = mount(renew => {
  // Disable caching
  const app = appStore(renew, null, { cache: false });

  return () => <div>Count: {app.count}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        In most cases you&apos;ll want caching enabled (the default). Disabling
        it means each call to <code>store()</code> in the same component
        instance creates a new subscription.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Things to watch out for
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Use with mount:</span> Because{' '}
        <code>store</code> explicitly delegates <code>renew</code>, it is
        intended to be used with <code>mount</code> components. For
        <code>lmount</code>, use <code>lstore</code> instead.
        <br />
        <br />
        <span class="font-medium">
          ⚠️ Create stores outside components:
        </span>{' '}
        Stores should be created outside components and shared globally.
        Creating them inside components will instantiate a new store on each
        render.
        <br />
        <br />
        <span class="font-medium">⚠️ Shallow reactivity only:</span>{' '}
        <code>store</code> provides shallow reactivity. Mutating nested objects
        directly will not update the UI; always replace first‑level properties.
        <br />
        <br />
        <span class="font-medium">⚠️ Array changes:</span> Methods like
        <code>push</code> and <code>pop</code> on arrays may not trigger
        reactivity. Prefer assigning a new array instead.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What’s next
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/2"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/2');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Example: splitting state with a shared store →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          See how multiple components share a single store and explore the
          <code>mount</code> + <code>store</code> pattern in a real example.
        </p>
      </a>

      <a
        href="/guide/lstore"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/lstore');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Lstore →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about <code>lstore</code>, the global state manager designed for
          <code>lmount</code>.
          <br />
          It behaves similarly to <code>store</code>, but handles{' '}
          <code>renew</code> automatically.
        </p>
      </a>
    </div>
  </div>
);
