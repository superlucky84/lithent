import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const UseRenewHooks = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      useRenew Hook
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is useRenew?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      useRenew is{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        a hook that retrieves the renew function within an lmount component
      </strong>
      .
      <br />
      <br />
      lmount is typically used with reactive helpers like lstate, which
      automatically update the UI. However, in special cases where you need to
      use closure variables and manually trigger updates, you can use useRenew.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count += 1;
    renew(); // Manually trigger update
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When Should You Use It?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      useRenew is useful in these special situations:
      <br />
      <br />
      • When using closure variables in lmount components
      <br />
      • When managing simple values without using lstate
      <br />
      • When manual updates are needed for external library integration
      <br />
      <br />
      However, in most cases,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        using lstate is more recommended
      </strong>
      . With lstate, updates happen automatically, eliminating the need to
      explicitly call renew.
      <br />
      <br />
      Additionally, if you need renew with closure variables,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        using mount directly is more effective than lmount + useRenew
      </strong>
      . mount provides renew directly as a parameter, making it more concise and
      intuitive.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      useRenew vs lstate Comparison
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Let's compare implementing the same functionality with useRenew and
      lstate:
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Using useRenew (Manual Update)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count += 1;
    renew(); // Explicit renew call required
  };

  return () => <div>Count: {count}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Using lstate (Automatic Update) - Recommended
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);

  const increment = () => {
    count.value += 1; // Automatically updates
  };

  return () => <div>Count: {count.value}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Recommendation:
        </span>{' '}
        If you're using lmount, it's more concise and intuitive to use lstate
        together. Use useRenew only in special cases.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical Examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      External Library Integration
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      useRenew can be useful when you need to receive events from an external
      library and update the UI.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount, useRenew, mountCallback } from 'lithent';

const ExternalLibComponent = lmount(() => {
  let data = null;
  const renew = useRenew();

  mountCallback(() => {
    // Initialize external library
    const library = initExternalLibrary();

    // External library event listener
    library.on('data', (newData) => {
      data = newData;
      renew(); // Update on data change
    });

    // cleanup: Remove listener on unmount
    return () => {
      library.off('data');
    };
  });

  return () => (
    <div>
      {data ? <p>Data: {JSON.stringify(data)}</p> : <p>Loading...</p>}
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Timer Example
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount, useRenew, mountCallback } from 'lithent';

const Timer = lmount(() => {
  let seconds = 0;
  const renew = useRenew();

  mountCallback(() => {
    const intervalId = setInterval(() => {
      seconds += 1;
      renew();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {seconds} seconds</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mount vs lmount + useRenew
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Using useRenew with lmount is almost identical to using mount. The
      difference is how you receive the renew function.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          mount (Receive renew as parameter)
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { mount } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const inc = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
        />
      </div>
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          lmount + useRenew (Receive via hook)
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const inc = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
        />
      </div>
    </div>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        Both approaches work identically. If you're using closure variables,
        mount is more conventional. lmount is recommended for use with reactive
        helpers like lstate.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Precautions
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Use only in lmount:</span> useRenew can
        only be used within lmount components. In mount components, renew is
        provided directly as a parameter, so useRenew is unnecessary.
        <br />
        <br />
        <span class="font-medium">⚠️ lstate usage recommended:</span> If you're
        using lmount, it's more intuitive to use lstate in most cases. Use
        useRenew only in special cases.
        <br />
        <br />
        <span class="font-medium">⚠️ Call only in mounter:</span> useRenew
        should only be called inside the mounter. Do not call it in the updater
        or event handlers.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Steps
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/state"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/state');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: State →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          You've completed learning the Core features!
          <br />
          Now let's explore Helper features. Start with the State helper.
        </p>
      </a>
    </div>
  </div>
);
