import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const NextTick = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      nextTick
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is nextTick?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick is a{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        function that guarantees execution in the next microtask queue after the
        current execution context completes
      </strong>
      .
      <br />
      <br />
      It is a simple API that returns{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Promise.resolve()
      </code>
      , and is useful when you need to perform a task{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        after DOM updates are fully complete
      </strong>
      .
      <br />
      <br />
      When renew() is called, a Virtual DOM is created and the actual DOM is
      updated. This process runs synchronously, but nextTick guarantees a point
      in time after the DOM update has fully заверш.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const Counter = mount((renew) => {
  const divRef = ref<HTMLDivElement>(null);
  let count = 0;

  const increase = async () => {
    count += 1;
    renew(); // Start DOM update

    // Wait for the DOM update to fully complete using nextTick
    await nextTick();

    // At this point, the DOM is guaranteed to be updated
    if (divRef.value) {
      console.log('Updated text:', divRef.value.textContent);
      // Outputs: "Count: 1"
    }
  };

  return () => (
    <div>
      <div ref={divRef}>Count: {count}</div>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic Usage
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Since nextTick returns a Promise, it can be used with the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        await
      </code>{' '}
      keyword or chained using{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        .then()
      </code>
      .
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Using await
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick } from 'lithent';

const App = mount((renew) => {
  let message = 'Hello';

  const update = async () => {
    message = 'Updated!';
    renew();

    await nextTick();
    console.log('DOM updated:', message);
  };

  return () => <div>{message}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Using .then()
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick } from 'lithent';

const App = mount((renew) => {
  let message = 'Hello';

  const update = () => {
    message = 'Updated!';
    renew();

    nextTick().then(() => {
      console.log('DOM updated:', message);
    });
  };

  return () => <div>{message}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical Examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Measuring DOM Elements
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick is useful when you need to measure the size or position of
      updated DOM elements.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const DynamicContent = mount((renew) => {
  const contentRef = ref<HTMLDivElement>(null);
  let items: string[] = ['Item 1'];

  const addItem = async () => {
    items.push(\`Item \${items.length + 1}\`);
    renew();

    // Wait for DOM update to complete
    await nextTick();

    // Measure updated height
    if (contentRef.value) {
      const height = contentRef.value.offsetHeight;
      console.log('New height:', height);
    }
  };

  return () => (
    <div>
      <div ref={contentRef}>
        {items.map(item => (
          <div key={item}>{item}</div>
        ))}
      </div>
      <button onClick={addItem}>Add Item</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Setting Focus
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Useful for automatically focusing newly added input fields.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const DynamicForm = mount((renew) => {
  const inputRef = ref<HTMLInputElement>(null);
  let showInput = false;

  const addInput = async () => {
    showInput = true;
    renew();

    // Wait until the input is added to the DOM
    await nextTick();

    // Focus the newly added input
    inputRef.value?.focus();
  };

  return () => (
    <div>
      {showInput && <input ref={inputRef} type="text" placeholder="Enter text" />}
      <button onClick={addInput}>Add Input</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Adjusting Scroll Position
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Can be used to scroll to the bottom after adding chat messages.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const ChatWindow = mount((renew) => {
  const containerRef = ref<HTMLDivElement>(null);
  const messages: string[] = ['Hello!'];

  const addMessage = async (text: string) => {
    messages.push(text);
    renew();

    // Wait for the new message to be rendered in the DOM
    await nextTick();

    // Scroll to the bottom
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    }
  };

  return () => (
    <div>
      <div
        ref={containerRef}
        style="height: 300px; overflow-y: auto; border: 1px solid #ccc;"
      >
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <button onClick={() => addMessage('New message!')}>
        Add Message
      </button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Triggering Animations
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Used to trigger CSS animations or transitions after the DOM is updated.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const AnimatedList = mount((renew) => {
  const newItemRef = ref<HTMLDivElement>(null);
  const items: string[] = ['Item 1', 'Item 2'];

  const addItem = async () => {
    items.push(\`Item \${items.length + 1}\`);
    renew();

    // Wait until the new item is added to the DOM
    await nextTick();

    // Add animation class
    if (newItemRef.value) {
      newItemRef.value.classList.add('fade-in');
    }
  };

  return () => (
    <div>
      {items.map((item, i) => (
        <div
          key={item}
          ref={i === items.length - 1 ? newItemRef : null}
          class="item"
        >
          {item}
        </div>
      ))}
      <button onClick={addItem}>Add Item</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Using nextTick in Tests
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick is also very useful in test code. It allows you to wait for DOM
      updates before running assertions.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, render, nextTick } from 'lithent';
import { expect, test } from 'vitest';

test('counter updates correctly', async () => {
  const Counter = mount((renew) => {
    let count = 0;

    const increase = () => {
      count += 1;
      renew();
    };

    return () => (
      <div>
        <span id="count">{count}</span>
        <button onClick={increase}>Increase</button>
      </div>
    );
  });

  const container = document.createElement('div');
  render(<Counter />, container);

  // Verify initial state
  expect(container.querySelector('#count')?.textContent).toBe('0');

  // Click button
  container.querySelector('button')?.click();

  // Wait for DOM update
  await nextTick();

  // Verify updated state
  expect(container.querySelector('#count')?.textContent).toBe('1');
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How It Works
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick internally simply returns{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Promise.resolve()
      </code>
      :
    </p>

    <CodeBlock
      language="tsx"
      code={`export const nextTick = () => Promise.resolve();`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In the JavaScript event loop, Promises are scheduled in the microtask
      queue. After all currently executing synchronous code and DOM updates are
      completed, the microtask queue is processed.
      <br />
      <br />
      Execution order:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>renew() is called → Virtual DOM is created</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>Diff algorithm runs → changes are calculated</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>Actual DOM is updated (synchronous operation)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>
            Remaining code in the current call stack continues executing
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>The microtask queue runs (nextTick callbacks run here)</span>
        </li>
      </ol>
    </div>

    <CodeBlock
      language="tsx"
      code={`const update = async () => {
  console.log('1. Before renew');

  count += 1;
  renew();
  // DOM update completes synchronously

  console.log('2. After renew');

  await nextTick();
  // Wait until the microtask queue is processed

  console.log('3. After nextTick');
  // At this point, all DOM updates and browser rendering are complete
};

// Output order:
// 1. Before renew
// 2. After renew
// 3. After nextTick`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Difference from updateCallback
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick and the returned function of updateCallback may look similar, but
      they serve different purposes:
    </p>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Feature
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              nextTick
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              updateCallback Returned Function
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Where it is used
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Anywhere (event handlers, inside functions, etc.)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Must be registered inside the mounter
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Execution timing
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Explicitly when called
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Automatically on every update
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Dependencies
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              None
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Dependency-array based
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Purpose
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              One-time waiting for a DOM update
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Repeated post-update logic
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, updateCallback } from 'lithent';

const Example = mount((renew) => {
  let count = 0;

  // updateCallback: runs automatically on every update
  updateCallback(() => {
    console.log('Before update');

    return () => {
      console.log('After update (automatic)');
    };
  });

  // nextTick: explicitly called only when needed
  const increase = async () => {
    count += 1;
    renew();

    await nextTick();
    console.log('After update (manual)');
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Notes & Cautions
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Synchronous DOM updates:</span> In Lithent,
        renew() updates the DOM synchronously. nextTick is not for waiting on
        browser painting, but for guaranteeing execution after the current
        execution context using the microtask queue.
        <br />
        <br />
        <span class="font-medium">⚠️ Avoid overuse:</span> In most cases, the
        returned function of updateCallback is sufficient. Use nextTick only for
        one-off operations or when you need to explicitly wait inside event
        handlers.
        <br />
        <br />
        <span class="font-medium">⚠️ Browser rendering:</span> nextTick only
        guarantees execution up to the microtask queue. If you must wait for the
        actual browser paint, use requestAnimationFrame.
        <br />
        <br />
        <span class="font-medium">⚠️ Error handling:</span> The Promise returned
        by nextTick always resolves. You do not need try-catch for nextTick
        itself, but still handle errors in the logic that follows it.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When Should You Use It?
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ Recommended Use of nextTick
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>• When post-DOM-update work is needed inside event handlers</li>
          <li>• When focusing or measuring newly added elements</li>
          <li>• When waiting for DOM updates in test code</li>
          <li>• When you need to wait for update completion only once</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Recommended Use of updateCallback
        </h3>
        <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
          <li>• Logic that must run repeatedly on every update</li>
          <li>
            • Logic that should only run when specific dependencies change
          </li>
          <li>• Lifecycle-aligned side effects</li>
          <li>• Continuous synchronization with external libraries</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/stateless"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/stateless');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core Feature: Stateless Components →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          UIs without any state can be expressed using simple function
          components without mount.
          <br />
          Explore the stateless component pattern in Lithent.
        </p>
      </a>
    </div>
  </div>
);
