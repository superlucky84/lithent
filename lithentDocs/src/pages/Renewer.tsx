import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Renewer = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Renewer
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is renew()?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code>renew()</code> is the{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        core function that updates a component
      </strong>
      . It is provided as the first argument to <code>mount</code>, and you call
      it whenever state changes and the UI needs to update.
      <br />
      <br />
      When you call <code>renew()</code>, the Updater runs again to produce a
      new virtual DOM. Lithent then diffs it against the previous tree and
      applies only the changed parts to the real DOM.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Counter = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew(); // 👈 Call renew() after changing state
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      If you never call <code>renew()</code>, the UI will not change even when
      state does. This is Lithent&apos;s{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        explicit update
      </strong>{' '}
      philosophy.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When should you call renew()?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Call <code>renew()</code>{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        whenever state changes and the view needs to reflect it
      </strong>
      . In practice, this usually happens inside event handlers after you mutate
      state.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const TodoList = mount((renew, _props) => {
  const todos = [];
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos.push({ id: Date.now(), text: inputValue });
      inputValue = '';
      renew(); // Call renew() after pushing into the array
    }
  };

  const removeTodo = (id: number) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index > -1) {
      todos.splice(index, 1);
      renew(); // Call renew() after removing from the array
    }
  };

  const handleInput = (e: Event) => {
    inputValue = (e.target as HTMLInputElement).value;
    renew(); // Call renew() after updating the input value
  };

  return () => (
    <div>
      <input value={inputValue} onInput={handleInput} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      As in the example above, every handler that mutates state should call
      <code>renew()</code> to refresh the UI.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      renew() with async work
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When asynchronous work (API calls, <code>setTimeout</code>, etc.) changes
      state, you should still call <code>renew()</code> at each significant
      step.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const UserProfile = mount((renew, _props) => {
  let user = null;
  let loading = true;
  let error = null;

  const fetchUser = async () => {
    try {
      loading = true;
      renew(); // Call renew() when loading starts

      const response = await fetch('/api/user');
      user = await response.json();
      error = null;
    } catch (err) {
      error = err.message;
      user = null;
    } finally {
      loading = false;
      renew(); // Call renew() after data is loaded
    }
  };

  fetchUser();

  return () => (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {user && (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      At each stage of an async workflow (start, success, failure), call
      <code>renew()</code> whenever state changes so the UI stays in sync.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How renew() works under the hood
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When <code>renew()</code> is called, Lithent goes through the following
      steps:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>
            <code>renew()</code> is called
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>Updater runs → new virtual DOM is created</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>Previous and new virtual DOM are diffed</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>Only the changed parts are patched into the real DOM</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>
            <code>updateCallback</code> hooks run (when registered)
          </span>
        </li>
      </ol>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This process lets Lithent update the UI efficiently. The Updater may
      return a full virtual DOM tree, but only the minimal changes touch the
      real DOM, keeping performance predictable.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Optimizing renew()
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Calling <code>renew()</code> too often can hurt performance. In edge
      cases, you can batch updates like this:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const OptimizedCounter = mount((renew, _props) => {
  let count = 0;
  let pendingUpdate = false;

	  const scheduleUpdate = () => {
    if (!pendingUpdate) {
      pendingUpdate = true;
      // Only update once on the next frame
      requestAnimationFrame(() => {
        pendingUpdate = false;
        renew();
      });
    }
  };

  const increaseMany = () => {
    // Even if we change state multiple times, renew() runs once
    count += 1;
    count += 1;
    count += 1;
    scheduleUpdate(); // Batched update
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increaseMany}>Increase by 3</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        In most cases, plain <code>renew()</code> calls are enough. Techniques
        like the one above are only needed when updates happen extremely often.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lmount removes the need for renew()
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      With <code>lmount</code> and <code>lstate</code>, you do not call{' '}
      <code>renew()</code> explicitly. When an <code>lstate</code> value
      changes, <code>renew()</code> is invoked automatically.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const increase = () => {
    count.value += 1; // renew() is called automatically ✨
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code>lstate</code> makes development convenient, but you lose explicit
      control over when <code>renew()</code> fires. Choose between{' '}
      <code>mount</code> and <code>lmount</code> based on how much control you
      need.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What’s next
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/render"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/render');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core feature: Render →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn how to render components into the real DOM.
          <br />
          You&apos;ll see how the <code>render</code> function mounts and
          unmounts components.
        </p>
      </a>
    </div>
  </div>
);
