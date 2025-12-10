import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Effect = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Effect Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is effect?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      effect is a{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        helper for managing side effects
      </strong>
      .
      <br />
      <br />
      It allows you to run specific logic during component mount, update, and
      unmount phases, with optional cleanup. Internally, it is implemented using
      mountCallback and updateCallback.
      <br />
      <br />
      You can declaratively manage side effects such as API calls, DOM event
      listeners, and timers.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const Timer = mount(renew => {
  const seconds = state(0, renew);

  let intervalId: number;

  effect(
    () => {
      // Executed on mount/update
      intervalId = setInterval(() => {
        seconds.value += 1;
      }, 1000);
    },
    () => {
      // Cleanup
      clearInterval(intervalId);
    },
    () => [] // dependencies (empty array = run only on mount)
  );

  return () => <div>Seconds: {seconds.value}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic Usage
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      effect accepts three arguments:
      <br />
      <br />• <strong>forward</strong>: function that executes the side effect
      <br />• <strong>backward</strong>: cleanup function (optional)
      <br />• <strong>dependencies</strong>: function that returns a dependency
      array (optional, default is an empty array)
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { effect } from 'lithent/helper';

const App = mount(renew => {
  effect(
    // forward: run side effect
    () => {
      console.log('Effect executed');
    },
    // backward: cleanup (optional)
    () => {
      console.log('Cleanup');
    },
    // dependencies: function that returns dependency array (optional)
    () => []
  );

  return () => <div>Hello</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Key Characteristics
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        1. Works with both mount and lmount
      </strong>
      <br />
      Since effect does not require renew, it can be used in both mount and
      lmount.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        2. Dependency-based execution
      </strong>
      <br />
      The effect is re-executed only when the values returned by the dependency
      array function change. Passing an empty array runs it only on mount.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        3. Automatic cleanup
      </strong>
      <br />
      The backward cleanup function is automatically executed on component
      unmount or before the next update.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical Examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Timer
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const Timer = mount(renew => {
  const seconds = state(0, renew);
  const isRunning = state(true, renew);
  let intervalId: number;

  effect(
    () => {
      if (!isRunning.value) return;

      intervalId = setInterval(() => {
        seconds.value += 1;
      }, 1000);
    },
    () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
    () => [isRunning.value]
  );

  return () => (
    <div>
      <p>Seconds: {seconds.value}</p>
      <button onClick={() => (isRunning.value = !isRunning.value)}>
        {isRunning.value ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      DOM Event Listener
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const WindowSize = mount(renew => {
  const width = state(window.innerWidth, renew);
  const height = state(window.innerHeight, renew);

  const handleResize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  effect(
    () => {
      window.addEventListener('resize', handleResize);
    },
    () => {
      window.removeEventListener('resize', handleResize);
    },
    () => []
  );

  return () => (
    <div>
      Window size: {width.value} x {height.value}
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Fetching API Data
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const UserProfile = mount<{ userId: number }>((renew, props) => {
  const user = state<any>(null, renew);
  const loading = state(true, renew);
  const error = state<Error | null>(null, renew);
  let cancelled = false;

  effect(
    () => {
      cancelled = false;

      const fetchUser = async () => {
        loading.value = true;
        error.value = null;

        try {
          const response = await fetch(\`/api/users/\${props.userId}\`);
          const data = await response.json();

          if (!cancelled) {
            user.value = data;
          }
        } catch (err) {
          if (!cancelled) {
            error.value = err as Error;
          }
        } finally {
          if (!cancelled) {
            loading.value = false;
          }
        }
      };

      fetchUser();
    },
    () => {
      cancelled = true;
    },
    () => [props.userId]
  );

  return () => (
    <div>
      {loading.value && <p>Loading...</p>}
      {error.value && <p>Error: {error.value.message}</p>}
      {user.value && (
        <div>
          <h2>{user.value.name}</h2>
          <p>{user.value.email}</p>
        </div>
      )}
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Local Storage Sync
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const ThemeToggle = mount(renew => {
  const theme = state<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    renew
  );

  effect(
    () => {
      localStorage.setItem('theme', theme.value);
      document.body.className = theme.value;
    },
    undefined,
    () => [theme.value]
  );

  return () => (
    <div>
      <p>Current theme: {theme.value}</p>
      <button
        onClick={() => {
          theme.value = theme.value === 'light' ? 'dark' : 'light';
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How the Dependency Array Works
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      dependencies must be a{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        function that returns an array
      </strong>
      . The effect is re-executed only when values in that returned array
      change.
      <br />
      <br />
      Since Lithent is closure-based, values can be freely referenced inside the
      effect. Unlike React, you do not need to include every external value in
      the dependency array—it only controls when the effect should re-run.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Why is it designed as a function?</span>
        <br />
        <br />
        Lithent uses{' '}
        <strong class="font-semibold">closure-based state management</strong>.
        State values exist as closure variables, and to compare them correctly,
        the latest values must be read at evaluation time.
        <br />
        <br />
        By defining dependencies as a function like:
        <br />
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          () =&gt; [count, isRunning]
        </code>
        <br />
        Lithent can always retrieve the{' '}
        <strong class="font-semibold">latest closure values</strong>
        at comparison time.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Empty Array: Run Only on Mount
    </h3>

    <CodeBlock
      language="tsx"
      code={`effect(
  () => {
    console.log('Only once on mount');
  },
  undefined,
  () => []
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Single Dependency
    </h3>

    <CodeBlock
      language="tsx"
      code={`const count = state(0, renew);

effect(
  () => {
    console.log('Count changed:', count.value);
  },
  undefined,
  () => [count.value]
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Multiple Dependencies
    </h3>

    <CodeBlock
      language="tsx"
      code={`const count = state(0, renew);
const message = state('', renew);

effect(
  () => {
    console.log('Count or message changed');
  },
  undefined,
  () => [count.value, message.value]
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Closure Safety (Difference from React)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Since Lithent is closure-based, values not included in the dependency
      array can still be safely referenced.
    </p>

    <CodeBlock
      language="tsx"
      code={`const count = state(0, renew);
const multiplier = state(2, renew);

effect(
  () => {
    console.log('Result:', count.value * multiplier.value);
  },
  undefined,
  () => [count.value]
);

// Effect re-runs when count changes (uses latest multiplier)
// Changing multiplier does NOT trigger effect`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        Unlike React’s useEffect, Lithent’s effect always sees the latest values
        via closures. The dependency array only determines when to re-run.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Using with mount vs lmount
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Since effect does not require renew, it behaves identically in both mount
      and lmount.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Using with mount
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const App = mount(renew => {
  const count = state(0, renew);

  effect(
    () => {
      console.log('Count:', count.value);
    },
    () => {
      console.log('Cleanup');
    },
    () => [count.value]
  );

  return () => (
    <div>{count.value}</div>
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
import { lstate, effect } from 'lithent/helper';

const App = lmount(() => {
  const count = lstate(0);

  effect(
    () => {
      console.log('Count:', count.value);
    },
    () => {
      console.log('Cleanup');
    },
    () => [count.value]
  );

  return () => (
    <div>{count.value}</div>
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
        <span class="font-medium">⚠️ Call only inside the mounter:</span> effect
        must only be called inside the mounter. Do not call it inside updaters
        or event handlers.
        <br />
        <br />
        <span class="font-medium">⚠️ Cleanup is required:</span> When using
        timers, event listeners, or subscriptions, always clean them up to avoid
        memory leaks.
        <br />
        <br />
        <span class="font-medium">⚠️ Dependencies must be functions:</span> The
        dependencies argument must be a{' '}
        <strong>function that returns an array</strong>.
        <br />
        <br />
        <span class="font-medium">⚠️ Async handling:</span> Do not make the
        forward function async. Instead, define and call an async function
        inside it.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/4"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/4');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Example: Handling DOM Events with effect →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Run a real example that registers and cleans up DOM event listeners
          using effect.
        </p>
      </a>

      <a
        href="/guide/store"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/store');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Store →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about the Store helper for global state management.
          <br />
          Share state across multiple components.
        </p>
      </a>
    </div>
  </div>
);
