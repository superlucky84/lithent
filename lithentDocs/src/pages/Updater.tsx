import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Updater = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Updater
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is an Updater?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      An Updater is the function returned by the mounter. While the mounter runs{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        exactly once when the component is created
      </strong>
      , the Updater is{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        called every time state changes
      </strong>
      .
      <br />
      <br />
      Its job is to{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        build a new virtual DOM tree from the current state
      </strong>
      . Lithent then diffs this new tree against the previous one and applies
      only the minimal changes to the real DOM.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Counter = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew(); // Re-run the Updater and refresh the view
  };

  // 👇 This returned function is the Updater
  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In this example, the arrow function returned from the mounter is the
      Updater. Every time <code>renew()</code> is called, this function runs
      again to produce a fresh virtual DOM tree.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Accessing state via closures
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Because the Updater is defined inside the mounter, it has access to
      everything the mounter declared through JavaScript closures. This is the
      core of Lithent&apos;s{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        closure-based state management
      </strong>
      model.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const TodoList = mount((renew, _props) => {
  // State and methods defined in the mounter
  const todos = [];
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos.push({ id: Date.now(), text: inputValue });
      inputValue = '';
      renew();
    }
  };

  const removeTodo = (id: number) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index > -1) {
      todos.splice(index, 1);
      renew();
    }
  };

  // The Updater can access all of the above via closure
  return () => (
    <div>
      <input
        value={inputValue}
        onInput={(e) => {
          inputValue = e.target.value;
          renew();
        }}
        placeholder="Add a todo"
      />
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
      Inside the Updater you can freely use <code>todos</code>,{' '}
      <code>inputValue</code>, <code>addTodo</code>, <code>removeTodo</code>,
      and anything else defined in the mounter. This is just standard JavaScript
      closure behavior.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Updaters with lmount
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When using <code>lmount</code>, the Updater works the same way
      conceptually. The main difference is that you do not call{' '}
      <code>renew</code> explicitly: whenever an <code>lstate</code> value
      changes, the Updater runs automatically.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const increase = () => {
    count.value += 1; // Changing lstate.value automatically triggers the Updater
  };

  // This returned function is the Updater
  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When you update <code>lstate.value</code>, Lithent internally calls
      <code>renew</code> for you and re-runs the Updater. A new virtual DOM tree
      is produced and the view updates accordingly.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Updater lifecycle
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The update flow for a Lithent component looks like this:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>State changes (plain variable or lstate.value)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>
            <code>renew()</code> is called (manually or automatically by lstate)
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>Updater runs → new virtual DOM is created</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>Previous and new virtual DOM are diffed</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>Only the changed parts are patched into the real DOM</span>
        </li>
      </ol>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This flow lets Lithent update the UI efficiently. The Updater can freely
      return a full virtual DOM tree every time, but only the minimal changes
      touch the real DOM.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What’s next
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/props"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/props');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core feature: Props →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn how Props are used to pass data between components.
          <br />
          You&apos;ll see how parent components provide data and callbacks to
          children.
        </p>
      </a>
    </div>
  </div>
);
