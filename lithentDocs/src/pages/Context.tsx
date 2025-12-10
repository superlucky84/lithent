import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Context = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Context Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is Context?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Context is a helper that{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        shares data across the component tree
      </strong>
      .
      <br />
      <br />
      It allows you to pass data to deeply nested components without props
      drilling, and works by{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        explicitly passing renew
      </strong>
      . Therefore, it's natural to use it with mount components.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

// 1. Create Context
type AppContext = {
  user: string;
  theme: string;
};

const appContext = createContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

// 2. Provider component (provides data)
const App = mount(renew => {
  // Create without renew (recommended)
  const userState = contextState('John');
  const themeState = contextState('light');

  return () => (
    <Provider user={userState} theme={themeState}>
      <Header />
      <Main />
    </Provider>
  );
});

// 3. Consumer component (uses and changes data)
const Header = mount(renew => {
  // Subscribe with renew in Consumer
  const ctx = useContext(appContext, renew);

  const changeUser = () => {
    // Change value in Consumer
    ctx.user.value = 'Jane';
  };

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
      <p>Theme: {ctx.theme.value}</p>
      <button onClick={changeUser}>Change User</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic Usage
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      1. Create Context
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Create Context with{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        createContext
      </code>
      . Define the data structure the Context will manage with a type argument.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { createContext } from 'lithent/helper';

// Define Context type
type UserContext = {
  name: string;
  age: number;
};

// Create Context
const userContext = createContext<UserContext>();

// Extract what you need via destructuring
const { Provider, contextState, useContext } = userContext;`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      2. Create State with contextState
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Create state to pass to the Provider with{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        contextState
      </code>
      . Pass the initial value as an argument.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        Generally, don't pass renew.
      </strong>{' '}
      The Provider only provides initial values, while Consumers subscribe to
      and change values.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const App = mount(renew => {
  // Create state with contextState (without renew)
  const nameState = contextState('John');
  const ageState = contextState(25);

  // Ready to pass to Provider
  return () => (
    <Provider name={nameState} age={ageState}>
      <Content />
    </Provider>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      3. Provide Context with Provider
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Use the Provider component to provide Context to child components. Pass
      the keys defined in the Context type as props.
    </p>

    <CodeBlock
      language="tsx"
      code={`const App = mount(renew => {
  // Create without renew (recommended)
  const nameState = contextState('John');
  const ageState = contextState(25);

  const updateName = () => {
    // Value can be changed, but Provider won't re-render
    nameState.value = 'Jane';
    // Consumers receive this change and re-render
  };

  return () => (
    <div>
      <Provider name={nameState} age={ageState}>
        {/* All components inside Provider can use Context */}
        <Header />
        <Content />
        <Footer />
      </Provider>

      {/* Can change state outside Provider */}
      <button onClick={updateName}>Change Name</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      4. Use Context with useContext
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In child components, use{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useContext
      </code>{' '}
      to access Context. Pass renew to re-render when Context changes.
    </p>

    <CodeBlock
      language="tsx"
      code={`const Header = mount(renew => {
  // Access Context with useContext
  const ctx = useContext(userContext, renew);

  const changeName = () => {
    // Can change value in Consumer
    ctx.name.value = 'Alice';
  };

  return () => (
    <div>
      <p>Name: {ctx.name.value}</p>
      <p>Age: {ctx.age.value}</p>
      <button onClick={changeName}>Change Name</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Selective Subscription
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can specify which keys to subscribe to as the third argument of
      useContext. This optimizes to react only to changes in specific fields.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type AppContext = {
  user: string;
  theme: string;
  count: number;
};

const appContext = createContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

const App = mount(renew => {
  // Create without renew
  const userState = contextState('John');
  const themeState = contextState('light');
  const countState = contextState(0);

  return () => (
    <Provider user={userState} theme={themeState} count={countState}>
      <FullSubscribe />
      <UserOnly />
      <ThemeAndCount />
    </Provider>
  );
});

// Subscribe to all keys (default)
const FullSubscribe = mount(renew => {
  const ctx = useContext(appContext, renew);
  // Re-renders when any of user, theme, or count changes

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
      <p>Theme: {ctx.theme.value}</p>
      <p>Count: {ctx.count.value}</p>
    </div>
  );
});

// Subscribe to user only
const UserOnly = mount(renew => {
  const ctx = useContext(appContext, renew, ['user']);
  // Re-renders only when user changes (performance optimization)

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
    </div>
  );
});

// Subscribe to theme and count only
const ThemeAndCount = mount(renew => {
  const ctx = useContext(appContext, renew, ['theme', 'count']);
  // Re-renders only when theme or count changes

  return () => (
    <div>
      <p>Theme: {ctx.theme.value}</p>
      <p>Count: {ctx.count.value}</p>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Performance Optimization:
        </span>{' '}
        For large Contexts with many fields, it's better to use selective
        subscription. Subscribing only to needed fields prevents unnecessary
        re-renders.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Changing Context Values
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      By default, state created with{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        contextState
      </code>{' '}
      can be changed from both Provider and Consumer.
      <br />
      <br />
      However,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        when created without renew, only Consumers subscribe
      </strong>
      , so changing values in the Provider won't re-render the Provider itself.
      It effectively works like one-way data flow.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type CounterContext = {
  count: number;
};

const counterContext = createContext<CounterContext>();
const { Provider, contextState, useContext } = counterContext;

const App = mount(renew => {
  // ⚠️ Created without renew - Provider doesn't subscribe
  const countState = contextState(0);

  const incrementFromProvider = () => {
    // ⚠️ Value changes but Provider doesn't re-render
    countState.value += 1;
    // Consumers receive this change and re-render
  };

  return () => (
    <div>
      <Provider count={countState}>
        <Counter />
      </Provider>

      {/* Change from Provider */}
      <button onClick={incrementFromProvider}>
        Increment from Provider
      </button>

      {/* ⚠️ Provider doesn't re-render, so this value won't update */}
      <p>Provider count: {countState.value}</p>
    </div>
  );
});

const Counter = mount(renew => {
  // ✅ Consumer subscribes with renew
  const ctx = useContext(counterContext, renew);

  const incrementFromConsumer = () => {
    // ✅ Change value in Consumer - Only Consumer re-renders
    ctx.count.value += 1;
  };

  return () => (
    <div>
      {/* ✅ Consumer always reflects changes */}
      <p>Consumer count: {ctx.count.value}</p>
      <button onClick={incrementFromConsumer}>
        Increment from Consumer
      </button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Recommended Pattern:</span> Generally,
        create{' '}
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          contextState
        </code>{' '}
        without renew, and only read and change values in Consumers. Use the
        Provider only to provide initial values.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Bidirectional Sync (Not Recommended)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Passing renew as the second argument of{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        contextState
      </code>{' '}
      enables true bidirectional sync, but{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        this is not recommended.
      </strong>
    </p>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ Bidirectional Sync Issues:</span>
        <br />
        <br />
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          contextState(initialValue, renew)
        </code>
        <br />
        <br />
        Passing renew as above makes the Provider re-render when values change,
        enabling bidirectional sync. However,{' '}
        <strong class="font-semibold">
          this causes the entire Provider subtree to re-render
        </strong>
        , which is a side effect.
        <br />
        <br />
        While Consumers can use selective subscription to re-render only
        necessary components, passing renew to the Provider affects all child
        components and can cause performance issues.
        <br />
        <br />
        <strong class="font-semibold">
          Recommendation: Don't pass renew and only manage values in Consumers.
        </strong>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Nested Providers
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Providers can be nested, and Consumers use the closest parent Provider.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type ThemeContext = {
  color: string;
};

const themeContext = createContext<ThemeContext>();
const { Provider, contextState, useContext } = themeContext;

const App = mount(renew => {
  // Create without renew
  const blueTheme = contextState('blue');
  const redTheme = contextState('red');

  return () => (
    <Provider color={blueTheme}>
      <Child /> {/* Uses blue */}

      {/* Nested Provider */}
      <Provider color={redTheme}>
        <Child /> {/* Uses red (closest Provider) */}
      </Provider>
    </Provider>
  );
});

const Child = mount(renew => {
  const ctx = useContext(themeContext, renew);

  return () => (
    <div style={{ color: ctx.color.value }}>
      Theme: {ctx.color.value}
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Using Multiple Contexts
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can use multiple Contexts simultaneously in one component.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

// Define multiple Contexts
type UserContext = { name: string };
type ThemeContext = { mode: string };

const userContext = createContext<UserContext>();
const themeContext = createContext<ThemeContext>();

const App = mount(renew => {
  // Create without renew
  const userName = userContext.contextState('John');
  const themeMode = themeContext.contextState('dark');

  return () => (
    <userContext.Provider name={userName}>
      <themeContext.Provider mode={themeMode}>
        <Content />
      </themeContext.Provider>
    </userContext.Provider>
  );
});

const Content = mount(renew => {
  // Use multiple Contexts simultaneously
  const user = userContext.useContext(userContext, renew);
  const theme = themeContext.useContext(themeContext, renew);

  return () => (
    <div>
      <p>User: {user.name.value}</p>
      <p>Theme: {theme.mode.value}</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Context vs Store Comparison
    </h2>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Feature
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Context
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Store
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Scope
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Components under Provider
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Global (all components)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Nesting
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Possible (nested Providers)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Not possible (global singleton)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Use Case
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Share within specific tree
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              App-wide state
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Props Drilling
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Solves it
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Solves it
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Selective Subscription
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Supported (subscribeKeys)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Supported (makeObserver)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Target Component
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ Use Context When
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>• Data shared only within a specific component tree</li>
          <li>• Using same Context type independently in multiple places</li>
          <li>
            • Settings that can vary per tree (UI theme, language settings,
            etc.)
          </li>
          <li>• Want to avoid props drilling</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          ✅ Use Store When
        </h3>
        <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
          <li>• State shared app-wide</li>
          <li>• User authentication info, global settings, etc.</li>
          <li>• Data that needs to be accessed regardless of component tree</li>
          <li>• Want a simpler API</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Precautions
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ For mount only:</span> Context explicitly
        passes renew, so use it with{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          mount
        </code>{' '}
        components. For lmount, use{' '}
        <a
          href="/guide/lcontext"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/lcontext');
          }}
          class="underline hover:no-underline font-medium"
        >
          lcontext
        </a>
        .
        <br />
        <br />
        <span class="font-medium">⚠️ Provider required:</span> To use
        useContext, there must be a Provider above it. Without a Provider, the
        Context cannot be found.
        <br />
        <br />
        <span class="font-medium">⚠️ .value access:</span> State created with
        contextState must be accessed and changed through{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          .value
        </code>
        .
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Steps
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/11"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/11');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Example: Share Theme &amp; User with Context →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Try a real example where multiple components subscribe to the same
          Context (AppContext)
          <br />
          and share user / theme / accent values together.
        </p>
      </a>

      <a
        href="/guide/lcontext"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/lcontext');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: LContext →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about LContext used in lmount components.
          <br />
          Discover easier Context usage with automatic renew management.
        </p>
      </a>
    </div>
  </div>
);
