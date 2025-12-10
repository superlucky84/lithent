import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const UpdateHooks = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Update Hooks
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is updateCallback?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      updateCallback is a{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        hook that runs when a component updates
      </strong>
      . The important part is that it{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        operates in two distinct phases
      </strong>
      :
      <br />
      <br />
      1.{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        The updateCallback function itself
      </strong>
      : runs <strong>before the update</strong> when dependencies change
      <br />
      2.{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        The returned function
      </strong>
      : runs <strong>after the DOM update</strong>
      <br />
      <br />
      Common use cases for updateCallback:
      <br />
      <br />
      • Pre-update preparation (data fetching, calculations, etc.)
      <br />
      • Post-DOM update tasks (scroll adjustments, animations, etc.)
      <br />
      • Synchronization with external libraries
      <br />• Detecting specific value changes and triggering side effects
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  updateCallback(() => {
    console.log('1. Before update: Count is', count);

    // The returned function runs after the DOM update
    return () => {
      console.log('2. After update: DOM updated with count', count);
    };
  });

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// Console output on button click:
// 1. Before update: Count is 1
// (DOM update)
// 2. After update: DOM updated with count 1`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Controlling Execution with Dependencies
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      By passing a{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        dependencies function
      </strong>
      as the second argument to updateCallback, it will only run when the
      specified values change. This prevents unnecessary executions and helps
      optimize performance.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback } from 'lithent';

const UserProfile = mount((renew) => {
  let userId = 1;
  let theme = 'light';

  const changeUser = () => {
    userId += 1;
    renew();
  };

  const toggleTheme = () => {
    theme = theme === 'light' ? 'dark' : 'light';
    renew();
  };

  // Runs only when userId changes
  updateCallback(() => {
    console.log('User changed! Loading new data for user:', userId);
    // Trigger side effects such as API calls
  }, () => [userId]); // dependencies: watch only userId

  // Runs only when theme changes
  updateCallback(() => {
    console.log('Theme changed to:', theme);
    document.body.className = theme;
  }, () => [theme]); // dependencies: watch only theme

  return () => (
    <div>
      <p>User ID: {userId}</p>
      <p>Theme: {theme}</p>
      <button onClick={changeUser}>Change User</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In the example above, clicking "Change User" only triggers the
      userId-related updateCallback, while clicking "Toggle Theme" only triggers
      the theme-related updateCallback.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Returned Function: Post-DOM Update Logic
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The function returned by updateCallback runs{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        after the DOM update
      </strong>
      . This is useful for accessing the updated DOM or synchronizing with
      external libraries.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback, ref } from 'lithent';

const AnimatedBox = mount((renew) => {
  const boxRef = ref<HTMLDivElement>(null);
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  updateCallback(() => {
    console.log('Update started, count:', count);

    // Returned function: runs after the DOM update
    return () => {
      if (boxRef.value) {
        // Apply animation to the updated DOM element
        boxRef.value.classList.add('flash');
        setTimeout(() => {
          boxRef.value?.classList.remove('flash');
        }, 300);
        console.log('DOM update completed, animation triggered');
      }
    };
  }, () => [count]);

  return () => (
    <div>
      <div ref={boxRef}>Count: {count}</div>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This example triggers an animation after every DOM update caused by a
      count change. Since the returned function runs after the DOM is already
      updated, you can safely access the latest DOM element via boxRef.value.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical Example: Auto-Scroll Chat Messages
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Since the returned function runs after the DOM update, it can safely
      access newly added DOM elements. This example automatically scrolls to the
      bottom when new chat messages are added.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback, ref } from 'lithent';

const ChatMessages = mount((renew) => {
  const messages = [];
  const containerRef = ref<HTMLDivElement>(null);

  const addMessage = (text: string) => {
    messages.push({ id: Date.now(), text });
    renew();
  };

  // Runs whenever messages change
  updateCallback(() => {
    console.log('Message count:', messages.length);

    // Returned function: adjust scroll after DOM update
    return () => {
      if (containerRef.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight;
        console.log('Scroll position adjusted');
      }
    };
  }, () => [messages.length]);

  return () => (
    <div>
      <div ref={containerRef} style="height: 300px; overflow-y: auto;">
        {messages.map(msg => (
          <div key={msg.id}>{msg.text}</div>
        ))}
      </div>
      <button onClick={() => addMessage('New message')}>
        Add Message
      </button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical Example: Synchronizing External Libraries
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This example synchronizes an external chart library with Lithent state
      updates. Data is prepared before the update, and the chart is refreshed
      after the DOM update.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback, ref } from 'lithent';

const DataChart = mount((renew) => {
  const canvasRef = ref<HTMLCanvasElement>(null);
  const data = [10, 20, 30, 40, 50];
  let chart = null;

  const addData = () => {
    data.push(Math.floor(Math.random() * 100));
    renew();
  };

  updateCallback(() => {
    console.log('Preparing data:', data.length, 'points');

    // Returned function: sync chart after DOM update
    return () => {
      if (!canvasRef.value) return;

      if (!chart) {
        // First run: create chart
        chart = new ChartLibrary(canvasRef.value, {
          type: 'line',
          data: { values: data }
        });
        console.log('Chart created');
      } else {
        // Subsequent runs: update chart data
        chart.updateData({ values: data });
        console.log('Chart updated');
      }
    };
  }, () => [data.length]);

  return () => (
    <div>
      <canvas ref={canvasRef} />
      <button onClick={addData}>Add Data Point</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Registering Multiple updateCallbacks
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can register multiple updateCallbacks within a single component. Each
      one can have its own dependencies, allowing you to separate and manage
      related logic independently.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback } from 'lithent';

const Dashboard = mount((renew) => {
  let activeTab = 'overview';
  let dataRefreshCount = 0;
  let lastUpdate = new Date();

  const switchTab = (tab: string) => {
    activeTab = tab;
    renew();
  };

  const refreshData = () => {
    dataRefreshCount += 1;
    lastUpdate = new Date();
    renew();
  };

  // 1. Log when activeTab changes
  updateCallback(() => {
    console.log('Tab switched to:', activeTab);
    // Send analytics
  }, () => [activeTab]);

  // 2. Show notification when data refreshes
  updateCallback(() => {
    if (dataRefreshCount > 0) {
      console.log('Data refreshed at:', lastUpdate);
      // Show toast notification
    }
  }, () => [dataRefreshCount]);

  // 3. Run on every update (no dependencies)
  updateCallback(() => {
    console.log('Component updated');
  });

  return () => (
    <div>
      <button onClick={() => switchTab('overview')}>Overview</button>
      <button onClick={() => switchTab('details')}>Details</button>
      <button onClick={refreshData}>Refresh Data</button>
      <div>Active: {activeTab}</div>
      <div>Refresh count: {dataRefreshCount}</div>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How the Dependency Array Works
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      dependencies must be{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        a function that returns an array
      </strong>
      . updateCallback runs only when the values in the returned array change.
      <br />
      <br />
      Since Lithent is closure-based, updateCallback can freely reference
      external variables. Unlike React, you do not need to include every
      external value in the dependency array. It is used solely to decide when
      the callback should re-run.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Why is it designed as a function?</span>
        <br />
        <br />
        Lithent uses{' '}
        <strong class="font-semibold">closure-based state management</strong>.
        Component state (userId, status, etc.) exists as closure variables, and
        to detect changes at each update,{' '}
        <strong class="font-semibold">the latest values at that moment</strong>
        must be read.
        <br />
        <br />
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          () =&gt; [userId, status]
        </code>
        <br />
        By designing dependencies as a function, Lithent calls it whenever it
        needs to check dependencies, ensuring it always reads the{' '}
        <strong class="font-semibold">latest closure values</strong>. The
        function returns a fresh array each time, which is compared with the
        previous values to accurately detect changes.
      </p>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback } from 'lithent';

const UserProfile = mount<{ userId: number }>((renew, props) => {
  // State managed via closure variables
  let userName = 'John';
  let userAge = 25;

  updateCallback(() => {
    console.log('User or age changed!');
  }, () => [userName, userAge]);
  // ☝️ The function returns [userName, userAge]
  //    using the latest values at each update

  const updateName = () => {
    userName = 'Jane';
    renew();
    // Calling renew() starts the update cycle
    // → () => [userName, userAge] is executed
    // → ['Jane', 25] is returned
    // → Compared with previous ['John', 25]
    // → Change detected! updateCallback runs
  };

  return () => (
    <div>
      <h1>User: {userName}</h1>
      <p>Age: {userAge}</p>
      <button onClick={updateName}>Change Name</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        Unlike React’s useEffect, Lithent’s updateCallback always references the
        latest values through closures. The dependency array only determines
        <em>when</em> the callback should re-run.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mountCallback vs updateCallback
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
              mountCallback
            </strong>
            : Runs{' '}
            <strong>only once when the component is first mounted</strong>.
            Ideal for initialization logic.
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              updateCallback
            </strong>
            : Runs <strong>every time the component updates</strong>. Ideal for
            reacting to state changes.
          </div>
        </li>
      </ul>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback, updateCallback } from 'lithent';

const Example = mount((renew) => {
  let count = 0;

  // Runs only once on mount
  mountCallback(() => {
    console.log('1. mountCallback executed');

    return () => {
      console.log('Unmounted!');
    };
  });

  // Runs on every update (including initial mount)
  updateCallback(() => {
    console.log('2. updateCallback executed (before update)');

    return () => {
      console.log('3. updateCallback returned function (after DOM update)');
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
// 1. mountCallback executed
// 2. updateCallback executed (before update)
// (DOM mount)
// 3. updateCallback returned function (after DOM update)

// On button click:
// 2. updateCallback executed (before update)
// (DOM update)
// 3. updateCallback returned function (after DOM update)`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How It Works
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Execution flow of updateCallback:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>updateCallback is registered when the mounter runs</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>
            renew() triggers the Updater → a new Virtual DOM is created
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>Dependencies of registered updateCallbacks are evaluated</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>
            If dependencies changed, the effectAction executes{' '}
            <strong>immediately</strong>
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>The returned function is stored in the queue (upCB)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            6.
          </span>
          <span>Virtual DOM is diffed and the actual DOM is updated</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            7.
          </span>
          <span>
            The queued returned functions run in order (after DOM update)
          </span>
        </li>
      </ol>
    </div>

    <CodeBlock
      language="tsx"
      code={`// Example execution flow
updateCallback(() => {
  console.log('A. Dependencies changed - executed immediately');

  return () => {
    console.log('B. Executed after DOM update');
  };
}, () => [someValue]);

// When renew() is called:
// 1. Updater runs (Virtual DOM created)
// 2. Dependencies are evaluated
// 3. "A. Dependencies changed - executed immediately" is logged
// 4. Returned function is queued
// 5. DOM is updated
// 6. "B. Executed after DOM update" is logged`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Notes & Cautions
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Understand the two-phase execution:</span>{' '}
        The updateCallback function itself runs immediately when dependencies
        change, and the returned function runs after the DOM update. You must
        clearly understand this distinction.
        <br />
        <br />
        <span class="font-medium">
          ⚠️ dependencies must be a function:
        </span>{' '}
        dependencies must be passed as a{' '}
        <strong>function that returns an array</strong>, not an array itself.
        This is due to Lithent’s closure-based state model. See the “How the
        Dependency Array Works” section above for details.
        <br />
        <br />
        <span class="font-medium">⚠️ Beware of infinite loops:</span> Calling
        renew() inside the returned function may cause an infinite loop. Use
        conditional renew() calls or configure dependencies carefully.
        <br />
        <br />
        <span class="font-medium">⚠️ Only call inside the mounter:</span>
        updateCallback must only be called inside the mounter. Do not call it
        from Updaters or event handlers.
        <br />
        <br />
        <span class="font-medium">⚠️ Runs on initial render:</span>
        updateCallback also runs during the initial mount. If you want to detect
        only post-mount updates, use a separate flag.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/mount-ready-hooks"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/mount-ready-hooks');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core Feature: Mount Ready Hooks →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about the mountReadyCallback hook, which runs immediately after
          the Virtual DOM is created.
          <br />
          Discover how to handle logic that must run before the DOM is mounted.
        </p>
      </a>
    </div>
  </div>
);
