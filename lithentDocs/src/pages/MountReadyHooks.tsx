import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const MountReadyHooks = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mount Ready Hooks
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is mountReadyCallback?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountReadyCallback is a{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        hook that runs immediately after the Virtual DOM is created, before it
        is mounted to the actual DOM
      </strong>
      .
      <br />
      <br />
      Since it runs{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        earlier than mountCallback
      </strong>
      , it is suitable for initialization logic that does not require the DOM.
      However, at this point, the actual DOM has not been created yet, so{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        ref.value is always null
      </strong>
      .
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback } from 'lithent';

const Component = mount((renew) => {
  let isInitialized = false;

  mountReadyCallback(() => {
    console.log('Virtual DOM created (DOM not available yet)');
    isInitialized = true;

    // Cleanup function: runs on unmount
    return () => {
      console.log('Component unmounted');
    };
  });

  return () => <div>{isInitialized ? 'Initialized' : 'Not ready'}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mountCallback vs mountReadyCallback
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      It is important to clearly understand the difference between these two
      hooks:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ul class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              mountReadyCallback
            </strong>
            : Runs immediately after the Virtual DOM is created.{' '}
            <strong>DOM access is NOT available</strong>. Faster initialization.
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              mountCallback
            </strong>
            : Runs after the actual DOM is mounted.{' '}
            <strong>DOM access is available</strong>. This is the most commonly
            used hook.
          </div>
        </li>
      </ul>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback, mountCallback, ref } from 'lithent';

const Example = mount(() => {
  const divRef = ref<HTMLDivElement>(null);

  mountReadyCallback(() => {
    console.log('1. mountReadyCallback executed');
    console.log('   divRef.value:', divRef.value); // null
  });

  mountCallback(() => {
    console.log('2. mountCallback executed');
    console.log('   divRef.value:', divRef.value); // <div>Hello</div>
  });

  return () => <div ref={divRef}>Hello</div>;
});

// Execution order:
// 1. mountReadyCallback executed
//    divRef.value: null
// (DOM created and mounted)
// 2. mountCallback executed
//    divRef.value: <div>Hello</div>`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When Should You Use It?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountReadyCallback is only needed in special cases. In most situations,
      mountCallback is sufficient.
      <br />
      <br />
      When mountReadyCallback is appropriate:
      <br />
      <br />
      • Data initialization that does not require the DOM
      <br />
      • State management subscriptions (store subscriptions)
      <br />
      • Logging and analytics initialization
      <br />
      • When initialization must run as early as possible
      <br />
      <br />
      When mountCallback is appropriate:
      <br />
      <br />
      • When DOM access is required (most cases)
      <br />
      • Initializing external libraries (charts, editors, etc.)
      <br />
      • Registering DOM event listeners
      <br />• Setting up timers
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Data Initialization Example
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Data initialization that does not require the DOM can be performed faster
      using mountReadyCallback.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback } from 'lithent';

const DataLoader = mount((renew) => {
  let data = null;
  let loading = true;

  mountReadyCallback(() => {
    console.log('Starting data load (before DOM creation)');

    // Asynchronous data loading
    fetch('/api/initial-data')
      .then(res => res.json())
      .then(result => {
        data = result;
        loading = false;
        renew();
        console.log('Data loading completed');
      });

    // Cleanup: cancel pending requests, etc.
    return () => {
      console.log('Component unmounting');
    };
  });

  return () => (
    <div>
      {loading ? <p>Loading...</p> : <p>Data: {JSON.stringify(data)}</p>}
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This example starts loading data before the DOM is created, improving the
      initial render performance.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      State Management Subscription Example
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Since global state store subscriptions are independent of the DOM, they
      can be handled using mountReadyCallback.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback } from 'lithent';
import { globalStore } from './store';

const StoreSubscriber = mount((renew) => {
  let storeData = globalStore.getState();

  mountReadyCallback(() => {
    console.log('Starting store subscription');

    // Subscribe to the store
    const unsubscribe = globalStore.subscribe((newState) => {
      storeData = newState;
      renew();
    });

    // Cleanup: unsubscribe on unmount
    return () => {
      console.log('Unsubscribing from store');
      unsubscribe();
    };
  });

  return () => (
    <div>
      <p>User: {storeData.user.name}</p>
      <p>Theme: {storeData.theme}</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Registering Multiple mountReadyCallbacks
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Just like mountCallback, you can register multiple mountReadyCallbacks.
      Each can have its own independent cleanup function.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback } from 'lithent';

const MultipleReady = mount((renew) => {
  let analyticsReady = false;
  let dataReady = false;

  // First mountReadyCallback: analytics initialization
  mountReadyCallback(() => {
    console.log('Initializing analytics');
    analytics.init();
    analyticsReady = true;

    return () => {
      analytics.cleanup();
    };
  });

  // Second mountReadyCallback: data prefetch
  mountReadyCallback(() => {
    console.log('Starting data prefetch');
    prefetchData();
    dataReady = true;

    return () => {
      cancelPrefetch();
    };
  });

  return () => (
    <div>
      <p>Analytics: {analyticsReady ? 'Ready' : 'Loading'}</p>
      <p>Data: {dataReady ? 'Ready' : 'Loading'}</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How It Works
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Execution flow of mountReadyCallback:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>
            mountReadyCallback is registered during the mounter execution (not
            executed yet)
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>Updater runs → Virtual DOM is created</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>
            Immediately after the Virtual DOM is created, all registered
            mountReadyCallback functions run in order
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>Returned cleanup functions are stored until unmount</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>Virtual DOM is converted into the actual DOM</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            6.
          </span>
          <span>The DOM is rendered to the screen</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            7.
          </span>
          <span>mountCallback functions run (DOM is now accessible)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            8.
          </span>
          <span>
            On component unmount, all cleanup functions run in reverse order
          </span>
        </li>
      </ol>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountReadyCallback runs at step 3, while mountCallback runs at step 7.
      This timing difference is the core distinction between the two hooks.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Full Lifecycle Flow
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When all hooks are combined, the execution order looks like this:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback, mountCallback, updateCallback } from 'lithent';

const FullLifecycle = mount((renew) => {
  let count = 0;

  mountReadyCallback(() => {
    console.log('1. mountReadyCallback (after Virtual DOM creation)');

    return () => {
      console.log('Cleanup: mountReadyCallback');
    };
  });

  mountCallback(() => {
    console.log('2. mountCallback (after DOM mount)');

    return () => {
      console.log('Cleanup: mountCallback');
    };
  });

  updateCallback(() => {
    console.log('3. updateCallback (before update)');

    return () => {
      console.log('4. updateCallback returned function (after DOM update)');
    };
  });

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// On mount:
// 1. mountReadyCallback (after Virtual DOM creation)
// 2. mountCallback (after DOM mount)
// 3. updateCallback (before update)
// 4. updateCallback returned function (after DOM update)

// On button click:
// 3. updateCallback (before update)
// (DOM update)
// 4. updateCallback returned function (after DOM update)

// On unmount:
// Cleanup: updateCallback
// Cleanup: mountCallback
// Cleanup: mountReadyCallback`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Notes & Cautions
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ No DOM access:</span> When
        mountReadyCallback runs, the DOM has not been created yet. ref.value is
        always null. If you need DOM access, use mountCallback.
        <br />
        <br />
        <span class="font-medium">⚠️ Usually unnecessary:</span> In most cases,
        mountCallback is sufficient. Only use mountReadyCallback when extremely
        early initialization is required and the DOM is not needed at all.
        <br />
        <br />
        <span class="font-medium">⚠️ Cleanup is optional:</span> You may omit
        the cleanup function if no teardown logic is required.
        <br />
        <br />
        <span class="font-medium">⚠️ Only call inside the mounter:</span>{' '}
        mountReadyCallback must only be called inside the mounter. Do not call
        it from Updaters or event handlers.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Summary: Which Hook Should You Use?
    </h2>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Recommended Usage:
        </span>
        <br />
        <br />
        <strong>99% of the time → Use mountCallback</strong>
        <br />
        Use it for general initialization and any logic that requires DOM
        access.
        <br />
        <br />
        <strong>
          Earliest possible initialization without DOM → Use mountReadyCallback
        </strong>
        <br />
        Use only for special cases such as data prefetching, store
        subscriptions, or analytics initialization.
        <br />
        <br />
        <strong>Run logic on every update → Use updateCallback</strong>
        <br />
        Use it for side effects that must run on every state change.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/inner-html"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/inner-html');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Content Rendering: innerHTML →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn how to render Markdown or raw HTML strings using innerHTML,
          along with important security considerations.
        </p>
      </a>
    </div>
  </div>
);
