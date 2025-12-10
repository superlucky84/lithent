import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const MountHooks = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mount Hooks
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is mountCallback?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountCallback is a{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        hook that runs after a component is mounted to the DOM
      </strong>
      . It is called inside the mounter and executes immediately after the
      component is rendered on the screen.
      <br />
      <br />
      Common use cases for mountCallback:
      <br />
      <br />
      • Setting up timers (setTimeout, setInterval)
      <br />
      • Registering DOM event listeners
      <br />
      • Initializing external libraries
      <br />
      • Subscribing to data streams
      <br />
      • Initial data fetching
      <br />
      <br />
      If a{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        cleanup function
      </strong>
      is returned, it will be automatically executed when the component is
      unmounted.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback } from 'lithent';

const Timer = mount((renew) => {
  let seconds = 0;

  mountCallback(() => {
    // Runs after mount: start timer
    const intervalId = setInterval(() => {
      seconds += 1;
      renew();
    }, 1000);

    // Return cleanup function: clear timer on unmount
    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {seconds}s</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Accessing DOM Elements
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Since mountCallback runs after the DOM is created, you can safely access
      DOM elements via refs. This is useful when initializing external libraries
      or registering DOM event listeners.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback, ref } from 'lithent';

const Chart = mount(() => {
  const canvasRef = ref<HTMLCanvasElement>(null);

  mountCallback(() => {
    // At this point, canvasRef.value is the actual DOM element
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d');

      // Initialize chart library (e.g., Chart.js)
      const chart = new ChartLibrary(ctx, {
        type: 'line',
        data: { /* ... */ }
      });

      // Cleanup: destroy chart instance
      return () => {
        chart.destroy();
      };
    }
  });

  return () => <canvas ref={canvasRef} width="400" height="300" />;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Registering Event Listeners
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Use mountCallback when registering event listeners on global objects such
      as window or document. Removing listeners in the cleanup function helps
      prevent memory leaks.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback } from 'lithent';

const WindowSize = mount((renew) => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  mountCallback(() => {
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renew();
    };

    // Register event listener
    window.addEventListener('resize', handleResize);

    // Cleanup: remove event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return () => (
    <div>
      Window size: {width} x {height}
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Subscribing to Data
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountCallback can also be used for WebSocket connections, event streams,
      or subscriptions to state management libraries.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback } from 'lithent';

const LiveData = mount((renew) => {
  let data = null;
  let status = 'connecting';

  mountCallback(() => {
    // Open WebSocket connection
    const ws = new WebSocket('wss://example.com/live');

    ws.onopen = () => {
      status = 'connected';
      renew();
    };

    ws.onmessage = (event) => {
      data = JSON.parse(event.data);
      renew();
    };

    ws.onerror = () => {
      status = 'error';
      renew();
    };

    // Cleanup: close WebSocket connection
    return () => {
      ws.close();
    };
  });

  return () => (
    <div>
      <p>Status: {status}</p>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Registering Multiple mountCallbacks
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can register multiple mountCallbacks within a single component. Each
      mountCallback runs independently and executes in the order it was
      registered.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback } from 'lithent';

const MultipleCallbacks = mount((renew) => {
  let mousePos = { x: 0, y: 0 };
  let time = new Date();

  // First mountCallback: track mouse movement
  mountCallback(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };
      renew();
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  });

  // Second mountCallback: update time
  mountCallback(() => {
    const intervalId = setInterval(() => {
      time = new Date();
      renew();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  // Third mountCallback: initial log
  mountCallback(() => {
    console.log('Component mounted!');

    return () => {
      console.log('Component unmounted!');
    };
  });

  return () => (
    <div>
      <p>Mouse: ({mousePos.x}, {mousePos.y})</p>
      <p>Time: {time.toLocaleTimeString()}</p>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Since each mountCallback can have its own independent cleanup function,
      grouping related setup and cleanup logic together keeps your code clean
      and maintainable.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Difference Between mountCallback and mountReadyCallback
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent provides two mount-related hooks:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ul class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              mountCallback
            </strong>
            : Runs <strong>after the DOM is mounted</strong>. You can safely
            access DOM elements. This is the most commonly used hook.
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              mountReadyCallback
            </strong>
            : Runs{' '}
            <strong>
              right after the Virtual DOM is created, before the DOM is mounted
            </strong>
            . You cannot access the DOM yet, but it runs earlier.
          </div>
        </li>
      </ul>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback, mountReadyCallback, ref } from 'lithent';

const Example = mount(() => {
  const divRef = ref<HTMLDivElement>(null);

  mountReadyCallback(() => {
    console.log('1. Virtual DOM created');
    console.log('divRef.value:', divRef.value); // null (DOM not yet created)
  });

  mountCallback(() => {
    console.log('2. DOM mounted');
    console.log('divRef.value:', divRef.value); // HTMLDivElement (DOM exists)
  });

  return () => <div ref={divRef}>Hello</div>;
});

// Execution order:
// 1. Virtual DOM created
// divRef.value: null
// 2. DOM mounted
// divRef.value: <div>Hello</div>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In most cases,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        mountCallback
      </strong>{' '}
      alone is sufficient. mountReadyCallback should only be used in special
      cases.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How It Works
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Execution flow of mountCallback:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>
            mountCallback is called during the mounter and registers the
            callback function (not executed yet)
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>Virtual DOM is converted into actual DOM</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>The DOM is rendered to the screen</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>
            All registered mountCallbacks execute in order (DOM is now
            accessible)
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>
            If a cleanup function is returned, it is stored until unmount
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            6.
          </span>
          <span>
            On component unmount, all cleanup functions are executed in reverse
            order
          </span>
        </li>
      </ol>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Notes & Cautions
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Cleanup is optional:</span> You do not have
        to return a cleanup function. If no cleanup is required, simply return
        nothing.
        <br />
        <br />
        <span class="font-medium">⚠️ Only call inside the mounter:</span>
        mountCallback must only be called inside the mounter. Do not call it
        from updaters or event handlers.
        <br />
        <br />
        <span class="font-medium">⚠️ Avoid async functions:</span> Passing an
        async function to mountCallback prevents proper registration of the
        cleanup function. If you need async work, handle it internally.
        <br />
        <br />
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          {`// ❌ Incorrect usage
mountCallback(async () => {
  await fetchData();
  return () => cleanup(); // async returns a Promise, so cleanup will not work
});

// ✅ Correct usage
mountCallback(() => {
  fetchData().then(data => { /* ... */ });
  return () => cleanup();
});`}
        </code>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/update-hooks"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/update-hooks');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core Feature: Update Hooks →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about the updateCallback hook, which runs when a component
          updates.
          <br />
          Discover how to perform additional logic after state changes.
        </p>
      </a>
    </div>
  </div>
);
