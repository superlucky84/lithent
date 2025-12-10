import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const TemplateStrings = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Template Strings
    </h1>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium text-red-900 dark:text-red-100">
          ⚠️ Experimental feature
        </span>
        <br />
        <br />
        Lithent Template Strings is currently in an{' '}
        <strong>experimental stage</strong>:
        <br />
        <br />• <strong>Not production-tested:</strong> it has not yet been
        thoroughly battle-tested in real production apps
        <br />• <strong>API may change:</strong> syntax and behavior are still
        subject to change
        <br />• <strong>Limited editor support:</strong> syntax highlighting,
        autocomplete, and linting plugins for editors like VSCode are not fully
        available
        <br />
        <br />
        For production projects we recommend using{' '}
        <a
          href="/guide/jsx-manual"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/jsx-manual');
          }}
          class="text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300"
        >
          JSX
        </a>
        ,{' '}
        <a
          href="/guide/ftags"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/ftags');
          }}
          class="text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300"
        >
          FTags
        </a>
        , or{' '}
        <a
          href="/guide/htm-tags"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/htm-tags');
          }}
          class="text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300"
        >
          HTM Tags
        </a>
        instead for now.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Overview
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent Template Strings is a template system that{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        compiles JSX-like markup into plain JavaScript <code>h()</code> calls
      </strong>
      .
      <br />
      <br />
      It offers an authoring experience similar to JSX without depending on a
      JSX transform, and exposes powerful directives for declarative conditional
      and list rendering.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Why Template Strings?
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      JSX is powerful, but once you start mixing nested conditionals and loops
      between tags, it can quickly become noisy and hard to scan:
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ❌ Readability issues in JSX
        </h4>
        <CodeBlock
          language="tsx"
          code={`// Nested conditionals and loops can get complex
<div>
  {isLoading ? (
    <Spinner />
  ) : error ? (
    <Error message={error} />
  ) : (
    <div>
      {items.length > 0 ? (
        items.map(item => (
          <div key={item.id}>
            {item.active && (
              <Badge>Active</Badge>
            )}
            <span>{item.name}</span>
          </div>
        ))
      ) : (
        <Empty />
      )}
    </div>
  )}
</div>`}
        />
      </div>

      <div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ✅ Clear intent with templates
        </h4>
        <CodeBlock
          language="typescript"
          code={`// Intent is clear with directives
<div>
  <Spinner l-if={isLoading} />
  <Error l-else-if={error} message={error} />
  <div l-else>
    <div l-for={item in items}>
      <Badge l-if={item.active}>Active</Badge>
      <span>{item.name}</span>
    </div>
    <Empty l-if={items.length === 0} />
  </div>
</div>`}
        />
      </div>
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <span class="font-medium text-gray-900 dark:text-white">
          💡 Key improvement:
        </span>
        <br />
        <br />
        Template Strings use directives like{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          l-if
        </code>
        ,{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          l-for
        </code>{' '}
        to express conditional and list rendering in a{' '}
        <strong>declarative and highly readable</strong> way. Instead of deeply
        nested JS expressions and chained ternaries, you attach intent as
        HTML-like attributes.
      </p>
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Key features
      </h3>
      <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              JSX-like syntax:
            </strong>{' '}
            intuitive markup that feels close to HTML/JSX
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Powerful directives:
            </strong>{' '}
            declarative control structures like <code>l-if</code>,{' '}
            <code>l-for</code>
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Source map support:
            </strong>{' '}
            trace back to original template locations while debugging
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Vite integration:
            </strong>{' '}
            HMR support and a fast development loop
          </div>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Installation & configuration
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Install the lithentVite plugin
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Template Strings are enabled via the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        @lithent/lithent-vite
      </code>{' '}
      plugin&apos;s <code>template</code> option:
    </p>

    <CodeBlock
      language="bash"
      code={`npm install -D @lithent/lithent-vite
# or
pnpm add -D @lithent/lithent-vite`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Vite config
    </h3>

    <CodeBlock
      language="typescript"
      code={`// vite.config.ts
import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin({
      // Enable template support via the template option
      template: {
        // Defaults to ['.ljsx', '.ltsx']
        extensions: ['.ltsx', '.ljsx'],
      },
    }),
  ],
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6 mt-4">
      Setting the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        template
      </code>{' '}
      option ensures that{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        .ltsx
      </code>{' '}
      and{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        .ljsx
      </code>{' '}
      files are compiled automatically, with HMR (Hot Module Replacement)
      enabled.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Quick setup:</span>
        <br />
        <br />
        If you only need template support with default settings, you can simply
        enable it with{' '}
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          template: true
        </code>
        :
        <br />
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          lithentVitePlugin(&#123; template: true &#125;)
        </code>
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Using templates without HMR (not recommended)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      If you have a special reason to use{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        @lithent/lithent-template-vite
      </code>{' '}
      directly:
    </p>

    <CodeBlock
      language="typescript"
      code={`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      extensions: ['.ltsx', '.ljsx'],
    }),
  ],
});`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Recommendation:</span> in most cases, using{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          @lithent/lithent-vite
        </code>
        with the <code>template</code> option is more convenient. It ships with
        HMR support and a simpler configuration surface.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Template syntax
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Basic elements
    </h3>

    <CodeBlock
      language="typescript"
      code={`// src/App.ltsx
import { render } from 'lithent';

const App = () => (
  <div class="container">
    <h1>Hello Lithent</h1>
    <p>This is a template string</p>
  </div>
);

render(<App />, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Text interpolation
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Use curly braces{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">{`{}`}</code>{' '}
      to embed JavaScript expressions:
    </p>

    <CodeBlock
      language="typescript"
      code={`const Greeting = () => {
  const name = 'John';
  const count = 5;

  return (
    <div>
      <p>Hello {name}!</p>
      <p>You have {count} notifications</p>
      <p>Total: {count + 10}</p>
    </div>
  );
};`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Dynamic attributes
    </h3>

    <CodeBlock
      language="typescript"
      code={`const DynamicProps = () => {
  const className = 'active';
  const isDisabled = false;
  const handleClick = () => console.log('Clicked');

  return (
    <div>
      <div class={className}>Dynamic class</div>
      <button disabled={isDisabled} onClick={handleClick}>
        Click Me
      </button>
      <input type="text" value={inputValue} />
    </div>
  );
};`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Fragment
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Group multiple elements without an extra wrapper:
    </p>

    <CodeBlock
      language="typescript"
      code={`const MultipleElements = () => (
  <>
    <h1>Title</h1>
    <p>Description</p>
    <div>Content</div>
  </>
);`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Directives
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent templates provide powerful directives with an{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        l-
      </code>{' '}
      prefix.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      l-if / l-else-if / l-else
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Use these to write conditional rendering declaratively:
    </p>

    <CodeBlock
      language="typescript"
      code={`const ConditionalRendering = () => {
  const status = 'loading'; // 'loading' | 'error' | 'success'

  return (
    <div>
      <div l-if={status === 'loading'}>
        Loading...
      </div>
      <div l-else-if={status === 'error'}>
        Error occurred!
      </div>
      <div l-else>
        Content loaded successfully!
      </div>
    </div>
  );
};`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Rules:</span>
        <br />
        <br />•{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          l-else-if
        </code>
        and{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          l-else
        </code>
        must appear immediately after an{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          l-if
        </code>{' '}
        or{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          l-else-if
        </code>
        <br />• Expressions must always be written inside{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          {`{}`}
        </code>
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      l-for
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Render lists:
    </p>

    <CodeBlock
      language="typescript"
      code={`const TodoList = () => {
  const todos = [
    { id: 1, text: 'Learn Lithent' },
    { id: 2, text: 'Build App' },
    { id: 3, text: 'Deploy' },
  ];

  return (
    <ul class="todo-list">
      {/* Basic form: item in list */}
      <li l-for={todo in todos}>
        {todo.text}
      </li>
    </ul>
  );
};`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      Using the index
    </h4>

    <CodeBlock
      language="typescript"
      code={`const NumberedList = () => {
  const items = ['Apple', 'Banana', 'Cherry'];

  return (
    <ul>
      {/* (item, index) in list */}
      <li l-for={(item, index) in items}>
        {index + 1}. {item}
      </li>
    </ul>
  );
};`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      More complex example
    </h4>

    <CodeBlock
      language="typescript"
      code={`const TodoApp = () => {
  const todos = [
    { id: 1, text: 'Task 1', done: false },
    { id: 2, text: 'Task 2', done: true },
  ];

  return (
    <div class="todo-app">
      <h2>Todos ({todos.length})</h2>

      <div l-for={(todo, index) in todos} class="todo-item">
        <input type="checkbox" checked={todo.done} />
        <span>{index + 1}. {todo.text}</span>
        <span l-if={todo.done} class="badge">Done</span>
      </div>

      <p l-if={todos.length === 0}>No todos yet!</p>
    </div>
  );
};`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 l-for syntax:</span>
        <br />
        <br />•{' '}
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          {`l-for={item in list}`}
        </code>{' '}
        – iterate over each item
        <br />•{' '}
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          {`l-for={(item, index) in list}`}
        </code>{' '}
        – both item and index
        <br />• <code>list</code> can be any iterable (arrays, objects, etc.)
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Using components
    </h2>

    <CodeBlock
      language="typescript"
      code={`// Button.ltsx
import { mount } from 'lithent';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

export const Button = mount<ButtonProps>((renew, props) => {
  return () => (
    <button class="btn" onClick={props.onClick}>
      {props.text}
    </button>
  );
});

// App.ltsx
import { Button } from './Button.ltsx';

const App = () => {
  const handleClick = () => {
    console.log('Clicked!');
  };

  return (
    <div class="app">
      <h1>My App</h1>
      <Button text="Click Me" onClick={handleClick} />
    </div>
  );
};`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Full Todo app
    </h3>

    <CodeBlock
      language="typescript"
      code={`// TodoApp.ltsx
import { mount } from 'lithent';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export const TodoApp = mount(renew => {
  let todos: Todo[] = [];
  let input = '';
  let nextId = 1;

  const addTodo = () => {
    if (input.trim()) {
      todos = [...todos, { id: nextId++, text: input, completed: false }];
      input = '';
      renew();
    }
  };

  const toggleTodo = (id: number) => {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    renew();
  };

  const removeTodo = (id: number) => {
    todos = todos.filter(todo => todo.id !== id);
    renew();
  };

  return () => (
    <div class="todo-app">
      <h1>My Todos</h1>

      <div class="input-section">
        <input
          type="text"
          value={input}
          onInput={(e) => {
            input = (e.target as HTMLInputElement).value;
            renew();
          }}
          placeholder="Add new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div l-if={todos.length > 0} class="todo-list">
        <div l-for={(todo, index) in todos} class="todo-item">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span class={todo.completed ? 'completed' : ''}>
            {index + 1}. {todo.text}
          </span>
          <button onClick={() => removeTodo(todo.id)}>Delete</button>
        </div>
      </div>

      <p l-else class="empty-message">
        No todos yet. Add one above!
      </p>

      <div class="stats">
        Total: {todos.length} |
        Completed: {todos.filter(t => t.completed).length}
      </div>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      User profile card
    </h3>

    <CodeBlock
      language="typescript"
      code={`// ProfileCard.ltsx
import { mount } from 'lithent';

interface User {
  name: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
}

interface ProfileCardProps {
  user: User;
}

export const ProfileCard = mount<ProfileCardProps>((renew, props) => {
  return () => (
    <div class="profile-card">
      <div l-if={props.user.avatar} class="avatar">
        <img src={props.user.avatar} alt={props.user.name} />
        <span l-if={props.user.isOnline} class="online-badge">●</span>
      </div>
      <div l-else class="avatar-placeholder">
        {props.user.name[0]}
      </div>

      <h3>{props.user.name}</h3>

      <p l-if={props.user.bio} class="bio">
        {props.user.bio}
      </p>

      <div class="status">
        <span l-if={props.user.isOnline}>Online</span>
        <span l-else>Offline</span>
      </div>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Compilation output
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Here is how a template is transformed:
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Template (input)
        </h3>
        <CodeBlock
          language="typescript"
          code={`<div class="todo-list">
  <h2>Todos ({todos.length})</h2>
  <ul>
    <li l-for={(todo, index) in todos}>
      <span>{index + 1}.</span>
      <span>{todo.text}</span>
    </li>
  </ul>
</div>`}
        />
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          JavaScript (output)
        </h3>
        <CodeBlock
          language="javascript"
          code={`h('div', { class: 'todo-list' },
  h('h2', null, 'Todos (', todos.length, ')'),
  h('ul', null,
    (todos).map((todo, index) =>
      h('li', null,
        h('span', null, index + 1, '.'),
        h('span', null, todo.text)
      )
    )
  )
)`}
        />
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Template vs JSX vs Others
    </h2>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Aspect
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Template Strings
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              JSX
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              HTM Tags
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              Syntax
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX-like
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Tagged Template
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              Directives
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              Supports l-if, l-for
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Pure JavaScript expressions
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Pure JavaScript expressions
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              Build setup
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Vite plugin
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Babel/TypeScript
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              No additional setup
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              File extensions
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              .ltsx, .ljsx
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              .tsx, .jsx
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              .ts, .js
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              Source maps
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              Fully supported
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              Fully supported
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              N/A (runtime)
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When should you use templates?
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          ✅ When templates are a good fit
        </h3>
        <ul class="space-y-2 text-sm md:text-base text-green-800 dark:text-green-200">
          <li>• You have lots of declarative conditional rendering (l-if)</li>
          <li>• Complex list rendering patterns (l-for)</li>
          <li>• You prefer HTML-like syntax</li>
          <li>• You want JSX-style authoring without a JSX transform</li>
          <li>• Source map support is important to your workflow</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ When JSX is a better choice
        </h3>
        <ul class="space-y-2 text-sm md:text-base text-blue-800 dark:text-blue-200">
          <li>• Projects that already have a JSX toolchain</li>
          <li>• Migrating from React or JSX-heavy codebases</li>
          <li>• Teams that are deeply familiar with JSX</li>
          <li>• Components with very complex JavaScript logic</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Advanced options
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Custom extensions
    </h3>

    <CodeBlock
      language="typescript"
      code={`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      // Add custom extensions
      extensions: ['.ltsx', '.ljsx', '.custom'],

      // Configure loader per extension
      extensionLoaders: {
        '.custom': 'ts',
      },
    }),
  ],
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Filter patterns
    </h3>

    <CodeBlock
      language="typescript"
      code={`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      // Only transform specific files
      include: [/\\.ltsx$/, /src\\/templates\\/.*\\.ts$/],
    }),
  ],
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next steps
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/1"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/1');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Explore real-world examples →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Try more than 20 practical examples to see Lithent&apos;s features in
          action.
          <br />
          Learn how computed, store, portal, and more behave in real apps.
        </p>
      </a>

      <a
        href="/"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          ← Back to home
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          View the full documentation structure and jump to another topic.
        </p>
      </a>
    </div>
  </div>
);
