import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Lstate = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Lstate
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is lstate?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstate is a{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        reactive state helper used in lmount components
      </strong>
      .
      <br />
      <br />
      The core feature of lstate is that it{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        automatically handles renew
      </strong>
      . Unlike state, you do not need to pass renew as an argument. Internally,
      it retrieves renew automatically via the useRenew hook. This is the
      fundamental difference from state, and it is the natural and correct way
      to use lstate together with lmount.
      <br />
      <br />
      Since renew() is automatically called whenever the value changes, the UI
      is updated automatically, making lstate highly optimized for declarative
      patterns.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0); // No renew argument required

  const increment = () => {
    count.value += 1; // renew() is called automatically
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic Usage
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstate only takes the initial value as its argument. renew is handled
      internally and automatically. You can read and write the value through the
      returned object’s{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        value
      </code>{' '}
      property.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const App = lmount(() => {
  // Create lstate: lstate(initialValue) - no renew required
  const count = lstate(0);
  const message = lstate('Hello');

  const increment = () => {
    count.value += 1; // setter - renew() is called automatically
  };

  const updateMessage = () => {
    message.value = 'World'; // setter - renew() is called automatically
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <p>Message: {message.value}</p>
      <button onClick={increment}>+1</button>
      <button onClick={updateMessage}>Change Message</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      state vs lstate
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Let’s compare the differences between state and lstate. The key difference
      lies in{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        how renew is handled
      </strong>
      :
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      state (mount + explicit renew delegation)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew); // Explicit renew delegation

  const increment = () => {
    count.value += 1;
  };

  return () => <div>Count: {count.value}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      lstate (lmount + automatic renew)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0); // renew handled automatically

  const increment = () => {
    count.value += 1;
  };

  return () => <div>Count: {count.value}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Selection Guide:
        </span>{' '}
        <strong class="font-medium text-gray-700 dark:text-gray-300">
          lstate should be used together with lmount.
        </strong>{' '}
        lstate is optimized for declarative patterns by handling renew
        automatically, while state is optimized for manual control by explicitly
        delegating renew. If you use mount, choose state. If you use lmount,
        choose lstate.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical Examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Using Multiple lstate Values
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Form = lmount(() => {
  const name = lstate('');
  const email = lstate('');
  const age = lstate(0);

  const handleSubmit = () => {
    console.log({
      name: name.value,
      email: email.value,
      age: age.value,
    });
  };

  return () => (
    <form onSubmit={(e: Event) => e.preventDefault()}>
      <input
        type="text"
        value={name.value}
        onInput={(e: Event) => {
          name.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="Name"
      />
      <input
        type="email"
        value={email.value}
        onInput={(e: Event) => {
          email.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="Email"
      />
      <input
        type="number"
        value={age.value}
        onInput={(e: Event) => {
          age.value = parseInt((e.target as HTMLInputElement).value, 10);
        }}
        placeholder="Age"
      />
      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Toggle State
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Accordion = lmount(() => {
  const isOpen = lstate(false);

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  return () => (
    <div>
      <button onClick={toggle}>
        {isOpen.value ? 'Close' : 'Open'} Accordion
      </button>
      {isOpen.value && (
        <div class="content">
          <p>This is the accordion content!</p>
        </div>
      )}
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Tabs Component
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Tabs = lmount(() => {
  const activeTab = lstate('tab1');

  return () => (
    <div>
      <div class="tab-buttons">
        <button
          onClick={() => activeTab.value = 'tab1'}
          class={activeTab.value === 'tab1' ? 'active' : ''}
        >
          Tab 1
        </button>
        <button
          onClick={() => activeTab.value = 'tab2'}
          class={activeTab.value === 'tab2' ? 'active' : ''}
        >
          Tab 2
        </button>
        <button
          onClick={() => activeTab.value = 'tab3'}
          class={activeTab.value === 'tab3' ? 'active' : ''}
        >
          Tab 3
        </button>
      </div>
      <div class="tab-content">
        {activeTab.value === 'tab1' && <div>Content 1</div>}
        {activeTab.value === 'tab2' && <div>Content 2</div>}
        {activeTab.value === 'tab3' && <div>Content 3</div>}
      </div>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Working with Objects and Arrays
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstate can store not only primitive values, but also objects and arrays.
      However, for objects and arrays, changes are only detected when a new
      reference is assigned.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const TodoList = lmount(() => {
  const todos = lstate<string[]>([]);

  const addTodo = (text: string) => {
    // Must create a new array for change detection
    todos.value = [...todos.value, text];
  };

  const removeTodo = (index: number) => {
    // Create a new array
    todos.value = todos.value.filter((_, i) => i !== index);
  };

  return () => (
    <div>
      <button onClick={() => addTodo('New Todo')}>Add Todo</button>
      <ul>
        {todos.value.map((todo, index) => (
          <li>
            {todo}
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Warning:</span> Mutating objects or arrays
        directly will NOT trigger a UI update.
        <br />
        <br />
        <code class="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm">
          todos.value.push('new') // ❌ Will NOT work
        </code>
        <br />
        <code class="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm">
          todos.value = [...todos.value, 'new'] // ✅ Assign a new reference
        </code>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Advanced State Management Example
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can combine multiple lstate values to manage complex application
      state.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp = lmount(() => {
  const todos = lstate<Todo[]>([]);
  const filter = lstate<'all' | 'active' | 'completed'>('all');
  const inputValue = lstate('');

  const addTodo = () => {
    if (!inputValue.value.trim()) return;

    todos.value = [
      ...todos.value,
      {
        id: Date.now(),
        text: inputValue.value,
        completed: false,
      },
    ];
    inputValue.value = '';
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter(todo => todo.id !== id);
  };

  const getFilteredTodos = () => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(todo => !todo.completed);
      case 'completed':
        return todos.value.filter(todo => todo.completed);
      default:
        return todos.value;
    }
  };

  return () => (
    <div>
      <input
        type="text"
        value={inputValue.value}
        onInput={(e: Event) => {
          inputValue.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="What needs to be done?"
      />
      <button onClick={addTodo}>Add</button>

      <div>
        <button onClick={() => filter.value = 'all'}>All</button>
        <button onClick={() => filter.value = 'active'}>Active</button>
        <button onClick={() => filter.value = 'completed'}>Completed</button>
      </div>

      <ul>
        {getFilteredTodos().map(todo => (
          <li>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Remove</button>
          </li>
        ))}
      </ul>
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
        <span class="font-medium">⚠️ Use with lmount:</span> lstate is designed
        to be used with lmount components. Use state with mount. lstate
        automatically handles renew, which is the fundamental difference from
        state.
        <br />
        <br />
        <span class="font-medium">⚠️ Automatic renew:</span> lstate internally
        uses useRenew to retrieve renew automatically. You do not need to pass
        renew as an argument. This design is optimized for declarative patterns.
        <br />
        <br />
        <span class="font-medium">⚠️ Only inside mounters:</span> lstate must
        only be called inside the mounter. Do not call it inside updaters or
        event handlers.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/computed"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/computed');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Computed →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about computed, which derives values from other state.
          <br />
          See how to create read-only derived values.
        </p>
      </a>
    </div>
  </div>
);
