import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const State = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      State
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is state?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state is a{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        reactive state helper used inside mount components
      </strong>
      .
      <br />
      <br />
      The core idea of state is that it{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        explicitly delegates the renew function through its arguments
      </strong>
      . This is the fundamental difference from lstate, and it is the natural
      and correct way to use state together with mount.
      <br />
      <br />
      With plain closure variables, you must manually call renew() after
      changing a value. With state, once renew is delegated, renew() is
      automatically called whenever the value changes, updating the UI. This
      allows you to combine the explicit control of mount with the convenience
      of automatic updates.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew);

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
      state takes an initial value and the renew function as arguments. You can
      read and write the value through the returned object’s{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        value
      </code>{' '}
      property.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const App = mount((renew) => {
  // Create state: state(initialValue, renew)
  const count = state(0, renew);
  const message = state('Hello', renew);

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
      Closure Variables vs state
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Let’s compare closure variables and state. state follows an{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        explicit renew delegation model
      </strong>
      , which perfectly aligns with the philosophy of mount components:
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Closure Variables (Manual renew)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew(); // Must explicitly call renew
  };

  return () => <div>Count: {count}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      state Helper (Automatic renew)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew);

  const increment = () => {
    count.value += 1; // renew is called automatically
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
          Using state together with mount is the natural and recommended
          approach.
        </strong>{' '}
        For simple values, state provides excellent convenience by explicitly
        delegating renew. For complex objects or arrays, using closure variables
        and calling renew() only when needed can be more efficient.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical Examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Using Multiple state Values
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Form = mount((renew) => {
  const name = state('', renew);
  const email = state('', renew);
  const age = state(0, renew);

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
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Accordion = mount((renew) => {
  const isOpen = state(false, renew);

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
      Counter Group
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const CounterGroup = mount((renew) => {
  const countA = state(0, renew);
  const countB = state(0, renew);
  const countC = state(0, renew);

  return () => (
    <div>
      <div>
        <p>Counter A: {countA.value}</p>
        <button onClick={() => countA.value += 1}>+</button>
        <button onClick={() => countA.value -= 1}>-</button>
      </div>
      <div>
        <p>Counter B: {countB.value}</p>
        <button onClick={() => countB.value += 1}>+</button>
        <button onClick={() => countB.value -= 1}>-</button>
      </div>
      <div>
        <p>Counter C: {countC.value}</p>
        <button onClick={() => countC.value += 1}>+</button>
        <button onClick={() => countC.value -= 1}>-</button>
      </div>
      <div>
        <p>Total: {countA.value + countB.value + countC.value}</p>
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
      state can store not only primitive values, but also objects and arrays.
      However, for objects and arrays, changes are only detected when a new
      reference is assigned.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const TodoList = mount((renew) => {
  const todos = state<string[]>([], renew);

  const addTodo = (text: string) => {
    // Must create a new array for change detection
    todos.value = [...todos.value, text];
  };

  const removeTodo = (index: number) => {
    // Create a new filtered array
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
      Notes & Cautions
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Use with mount:</span> state is designed to
        be used inside mount components. Use lstate with lmount. The explicit
        delegation of renew is the fundamental difference between state and
        lstate.
        <br />
        <br />
        <span class="font-medium">⚠️ Explicit renew delegation:</span> You must
        pass the renew function as the second argument to state. This follows
        the mount philosophy of explicit control delegation. Without renew, UI
        updates will not occur.
        <br />
        <br />
        <span class="font-medium">⚠️ Only inside mounters:</span> state must
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
        href="/guide/lstate"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/lstate');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Lstate →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about lstate, the reactive state system used with lmount.
          <br />
          It is similar to state, but handles renew automatically.
        </p>
      </a>
    </div>
  </div>
);
