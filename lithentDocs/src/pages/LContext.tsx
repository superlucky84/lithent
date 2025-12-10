import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const LContext = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      LContext Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is LContext?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      LContext is{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Context specifically for lmount components
      </strong>
      .
      <br />
      <br />
      Unlike{' '}
      <a
        href="/guide/context"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/context');
        }}
        class="text-[#42b883] hover:underline font-medium"
      >
        Context
      </a>
      ,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        it automatically manages renew
      </strong>{' '}
      and internally uses lmount's{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useRenew()
      </code>{' '}
      hook. This makes Context usage more convenient in lmount components.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

// 1. Create LContext
type AppContext = {
  user: string;
  theme: string;
};

const appContext = createLContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

// 2. Provider component
const App = lmount((props, children) => {
  const userState = contextState('John');
  const themeState = contextState('light');

  return () => (
    <Provider user={userState} theme={themeState}>
      <Header />
      <Main />
    </Provider>
  );
});

// 3. Consumer component (automatic renew management)
const Header = lmount((props, children) => {
  // No need to pass renew - automatically managed by useRenew()
  const ctx = useContext(appContext);

  const changeUser = () => {
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
      1. Create LContext
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Create LContext with{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        createLContext
      </code>
      . Define the data structure the Context will manage with a type argument.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { createLContext } from 'lithent/helper';

// Define LContext type
type UserContext = {
  name: string;
  age: number;
};

// Create LContext
const userContext = createLContext<UserContext>();

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
        Unlike Context, there's no renew parameter.
      </strong>{' '}
      When useContext is called in Consumers, renew is automatically connected.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';

const App = lmount((props, children) => {
  // Create state with contextState (no renew)
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
      code={`const App = lmount((props, children) => {
  const nameState = contextState('John');
  const ageState = contextState(25);

  const updateName = () => {
    // Can change value in Provider
    nameState.value = 'Jane';
    // Consumers automatically re-render
  };

  return () => (
    <div>
      <Provider name={nameState} age={ageState}>
        {/* All components inside Provider can use Context */}
        <Header />
        <Content />
        <Footer />
      </Provider>

      {/* Change state outside Provider */}
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
      to access Context.{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        No need to pass renew
      </strong>{' '}
      - internally calls{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useRenew()
      </code>{' '}
      automatically to manage re-rendering.
    </p>

    <CodeBlock
      language="tsx"
      code={`const Header = lmount((props, children) => {
  // No need to pass renew - automatically managed
  const ctx = useContext(userContext);

  const changeName = () => {
    // Change value in Consumer
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

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Automatic renew management:</span> LContext
        uses lmount's{' '}
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          useRenew()
        </code>{' '}
        hook to automatically manage renew. This makes it more convenient to use
        than Context.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Selective Subscription
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can specify which keys to subscribe to as the second argument of
      useContext. This optimizes to react only to changes in specific fields.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

type AppContext = {
  user: string;
  theme: string;
  count: number;
};

const appContext = createLContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

const App = lmount((props, children) => {
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
const FullSubscribe = lmount((props, children) => {
  const ctx = useContext(appContext);
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
const UserOnly = lmount((props, children) => {
  const ctx = useContext(appContext, ['user']);
  // Re-renders only when user changes (performance optimization)

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
    </div>
  );
});

// Subscribe to theme and count only
const ThemeAndCount = lmount((props, children) => {
  const ctx = useContext(appContext, ['theme', 'count']);
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
      LContext's{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        contextState
      </code>{' '}
      doesn't accept a renew parameter. Therefore,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        the Provider doesn't subscribe to Context value changes.
      </strong>
      <br />
      <br />
      When values are changed in the Provider, Consumers get updated, but the
      Provider itself doesn't re-render. It effectively works like one-way data
      flow.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

type CounterContext = {
  count: number;
};

const counterContext = createLContext<CounterContext>();
const { Provider, contextState, useContext } = counterContext;

const App = lmount((props, children) => {
  // contextState doesn't take renew - Provider doesn't subscribe
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

const Counter = lmount((props, children) => {
  // Consumer automatically subscribes with useRenew()
  const ctx = useContext(counterContext);

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
        <span class="font-medium">💡 Recommended Pattern:</span> Use the
        Provider only to provide initial values, and only read and change values
        in Consumers. This is the same pattern as{' '}
        <a
          href="/guide/context"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/context');
          }}
          class="underline hover:no-underline font-medium"
        >
          Context
        </a>
        .
      </p>
    </div>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ No Bidirectional Sync:</span> LContext's{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          contextState
        </code>{' '}
        doesn't accept a renew parameter, so you cannot implement bidirectional
        sync in the Provider.
        <br />
        <br />
        If the Provider needs to react to Context value changes, which is{' '}
        <strong class="font-semibold">generally not recommended</strong>, you
        can use{' '}
        <a
          href="/guide/context"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/context');
          }}
          class="underline hover:no-underline font-medium"
        >
          Context
        </a>{' '}
        and pass renew with{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          contextState(value, renew)
        </code>
        . However, this causes the entire Provider subtree to re-render, which
        can lead to performance issues.
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
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

type ThemeContext = {
  color: string;
};

const themeContext = createLContext<ThemeContext>();
const { Provider, contextState, useContext } = themeContext;

const App = lmount((props, children) => {
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

const Child = lmount((props, children) => {
  const ctx = useContext(themeContext);

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
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

// Define multiple LContexts
type UserContext = { name: string };
type ThemeContext = { mode: string };

const userContext = createLContext<UserContext>();
const themeContext = createLContext<ThemeContext>();

const App = lmount((props, children) => {
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

const Content = lmount((props, children) => {
  // Use multiple Contexts simultaneously
  const user = userContext.useContext(userContext);
  const theme = themeContext.useContext(themeContext);

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
      Context vs LContext Comparison
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
              LContext
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Target Component
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              lmount
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Renew Management
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Manual (pass renew)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Automatic (uses useRenew)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              contextState
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              contextState(value, renew?)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              contextState(value)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              useContext
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              useContext(ctx, renew, keys?)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              useContext(ctx, keys?)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Provider Subscription
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              When renew passed (not recommended)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Not possible (no renew)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Selective Subscription
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Supported
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Supported
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Ease of Use
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Moderate (explicit management)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              High (automatic management)
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ Use LContext When
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>• Using lmount components</li>
          <li>• Want to automatically manage renew</li>
          <li>• One-way pattern where only Consumers change Context values</li>
          <li>• Want a simpler API</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          ✅ Use Context When
        </h3>
        <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
          <li>• Using mount components</li>
          <li>• Want to explicitly manage renew</li>
          <li>
            • Want one-way pattern where Provider only provides initial values
          </li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Precautions
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ For lmount only:</span> LContext is
        specifically for{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          lmount
        </code>{' '}
        components. For mount components, use{' '}
        <a
          href="/guide/context"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/context');
          }}
          class="underline hover:no-underline font-medium"
        >
          Context
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
        <br />
        <br />
        <span class="font-medium">⚠️ useRenew dependency:</span> LContext
        internally uses{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          useRenew()
        </code>
        , so it must follow lmount's Hook rules. Don't call useContext inside
        conditionals.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Steps
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/cache-update"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/cache-update');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: CacheUpdate →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn how to efficiently cache and update values or lists derived from
          Context.
        </p>
      </a>
    </div>
  </div>
);
