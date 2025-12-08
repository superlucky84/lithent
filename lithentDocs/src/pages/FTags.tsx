import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const FTags = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      FTags
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Overview
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/ftags
      </code>{' '}
      is a functional API for building UI with{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        plain JavaScript/TypeScript functions instead of JSX
      </strong>
      .
      <br />
      <br />
      It works immediately without any build-tool configuration and provides
      full type safety in TypeScript.
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Key benefits
      </h3>
      <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Zero configuration:
            </strong>{' '}
            no Babel, TypeScript, or Vite JSX setup required
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Type safe:
            </strong>{' '}
            full TypeScript inference from props to children
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Flexible syntax:
            </strong>{' '}
            props can be omitted; the API infers whether the first argument is
            props or children
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              CDN-friendly:
            </strong>{' '}
            can be used directly in the browser without a build step
          </div>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Installation
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      NPM
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Once you install Lithent, you can use{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/ftags
      </code>{' '}
      right away—no extra package is required.
    </p>

    <CodeBlock
      language="bash"
      code={`npm install lithent
# or
pnpm add lithent`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      CDN (UMD)
    </h3>

    <CodeBlock
      language="html"
      code={`<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js
"></script>

<script>
  const { render } = lithent;
  const { fTags, fMount, fFragment } = lithentFTags;

  // ready to use
</script>`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      fTags – HTML element factory
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        fTags
      </code>{' '}
      is a Proxy-based factory that exposes every HTML tag as a function. You
      can destructure only the tags you need.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Basic usage
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fTags } from 'lithent/ftags';

// Destructure only the tags you need
const { div, p, span, button, input } = fTags;

// Text only
const element1 = div('Hello World');

// Props and text
const element2 = div({ className: 'container' }, 'Content');

// Nested elements
const element3 = div(
  { className: 'card' },
  p('Title'),
  p('Description')
);

render(element3, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Optional props
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      One of the key features of FTags is{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        automatic props detection
      </strong>
      . It inspects the first argument and decides whether it is props or
      children.
    </p>

    <CodeBlock
      language="typescript"
      code={`const { div, span } = fTags;

// Children only (no props)
div('Text only');
div(span('Nested element'));

// Props and children
div({ id: 'app' }, 'Text');
div({ className: 'box' }, span('Nested'));

// Props only (no children)
input({ type: 'text', placeholder: 'Type here…' });

// Nothing
div();`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 How it works:</span>
        <br />
        <br />
        Internally FTags uses{' '}
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          isPropType()
        </code>{' '}
        to inspect the first argument:
        <br />
        <br />• If it is a plain object and not a virtual DOM node → treat as
        props
        <br />• If it is a string, number, virtual DOM, etc. → treat as children
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Props examples
    </h3>

    <CodeBlock
      language="typescript"
      code={`const { div, button, input, a } = fTags;

// Class and style
div(
  {
    className: 'container',
    style: { padding: '20px', backgroundColor: '#f0f0f0' }
  },
  'Styled Content'
);

// Event handlers
button(
  {
    onClick: () => console.log('Clicked!'),
    disabled: false
  },
  'Click Me'
);

// HTML attributes
input({
  type: 'email',
  placeholder: 'your@email.com',
  required: true,
  value: ''
});

// Links and other attributes
a({ href: 'https://example.com', target: '_blank' }, 'Visit Site');`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Deeply nested structures
    </h3>

    <CodeBlock
      language="typescript"
      code={`const { section, div, h1, p, ul, li, strong } = fTags;

const page = section(
  { className: 'page' },

  h1('Welcome to FTags'),

  p(
    'This is a ',
    strong({ style: { color: 'red' } }, 'powerful'),
    ' functional API for building UIs.'
  ),

  ul(
    li('Zero configuration'),
    li('Type safe'),
    li('Props optional')
  ),

  div(
    { className: 'footer' },
    p('© 2024 Lithent')
  )
);

render(page, document.getElementById('root'));`}
    />

    <div class="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-emerald-800 dark:text-emerald-200 leading-relaxed">
        <span class="font-medium">💡 No mount required:</span> values created
        with fTags can be passed directly to <code>render</code>. Reach for
        <code>fMount</code> / <code>flMount</code> only when you need component
        abstraction—otherwise you can build static/dynamic trees and render them
        inline as in the example above.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      fFragment – fragments
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        fFragment
      </code>{' '}
      groups multiple elements without adding an extra wrapper node. It is
      equivalent to JSX{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;&gt;...&lt;/&gt;
      </code>
      .
    </p>

    <CodeBlock
      language="typescript"
      code={`import { fTags, fFragment } from 'lithent/ftags';

const { div, p, span } = fTags;

// Group multiple elements with a fragment
const content = fFragment(
  p('First paragraph'),
  p('Second paragraph'),
  span('Inline text')
);

// Return a fragment from a component
const MultiElement = fMount(() => {
  return () => fFragment(
    div('Element 1'),
    div('Element 2'),
    div('Element 3')
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Use cases:
        </span>
        <br />
        <br />• Return multiple top-level elements from a component
        <br />• Group multiple table rows (several <code>tr</code> elements)
        <br />• Avoid unnecessary <code>div</code> wrappers
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      fMount – component creation
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        fMount
      </code>{' '}
      lets you use <code>mount</code>-style components without JSX.{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        Do not wrap the component again with <code>mount</code> or{' '}
        <code>lmount</code>
      </strong>
      ; instead, pass the original component that receives the{' '}
      <code>renew</code> argument.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Basic component
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, button } = fTags;

// Create a component with fMount
const Counter = fMount((renew) => {
  let count = 0;

  const increment = () => {
    count++;
    renew();
  };

  return () => div(
    { className: 'counter' },
    div(\`Count: \${count}\`),
    button({ onClick: increment }, 'Increment')
  );
});

// Usage
render(Counter(), document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Components with props
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, p } = fTags;

// Define props type
interface GreetingProps {
  name: string;
  age?: number;
}

// Create directly with fMount
const Greeting = fMount<GreetingProps>((_renew, props) => {
  return () =>
    div(
      { className: 'greeting' },
      p(\`Hello, \${props.name}!\`),
      props.age && p(\`Age: \${props.age}\`)
    );
});

// Use with props
render(
  Greeting({ name: 'John', age: 30 }),
  document.getElementById('root')
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Components with children
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, p } = fTags;

// Component that receives children
const Card = fMount((_renew, _props, children) => {
  return () =>
    div(
      { className: 'card' },
      div({ className: 'card-content' }, ...children)
    );
});

// Use with children
render(
  Card(
    p('This is card content'),
    p('Multiple children supported')
  ),
  document.getElementById('root')
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Components with props and children
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, h2, p } = fTags;

interface CardProps {
  title: string;
  bordered?: boolean;
}

const Card = fMount<CardProps>((_renew, props, children) => {
  return () =>
    div(
      {
        className: 'card',
        style: props.bordered ? { border: '1px solid #ccc' } : {}
      },
      h2(props.title),
      div({ className: 'card-body' }, ...children)
    );
});

// Pass both props and children
render(
  Card(
    { title: 'My Card', bordered: true },
    p('Card content here'),
    p('More content')
  ),
  document.getElementById('root')
);`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Props can be omitted:</span>
        <br />
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          Card() // no props, no children
        </code>
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          Card(p('Text')) // children only, no props
        </code>
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          Card(&#123; title: 'Hi' &#125;) // props only
        </code>
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          Card(&#123; title: 'Hi' &#125;, p('Text')) // props + children
        </code>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      flMount – Light API components
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        flMount
      </code>{' '}
      exposes <code>lmount</code>-style (Light API) components as plain
      functions without JSX. You pass the original Light API component (which
      does not receive <code>renew</code>) directly—no extra <code>lmount</code>{' '}
      wrapping. When you need to update state, use{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useRenew
      </code>{' '}
      or{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lstate
      </code>{' '}
      to trigger re-renders.
    </p>

    <CodeBlock
      language="typescript"
      code={`import { render, useRenew } from 'lithent';
import { flMount, fTags } from 'lithent/ftags';

const { div, button } = fTags;

// Light API component without a renew parameter
const Counter = flMount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count++;
    renew();
  };

  return () =>
    div(
      div(\`Count: \${count}\`),
      button({ onClick: increment }, 'Increment')
    );
});

render(Counter(), document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Using lstate (recommended)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        flMount
      </code>{' '}
      works especially well with{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lstate
      </code>{' '}
      from <code>lithent/helper</code>. State is tracked and updated
      automatically without calling <code>renew</code> manually.
    </p>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { lstate } from 'lithent/helper';
import { flMount, fTags } from 'lithent/ftags';

const { div, button } = fTags;

// Simple counter
const Counter = flMount(() => {
  const count = lstate(0);

  return () =>
    div(
      { className: 'counter' },
      div(\`Count: \${count.value}\`),
      button(
        { onClick: () => count.value++ },
        'Increment'
      ),
      button(
        { onClick: () => count.value-- },
        'Decrement'
      )
    );
});

render(Counter(), document.getElementById('root'));`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      Advanced example: Todo app (with lstate)
    </h4>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { lstate } from 'lithent/helper';
import { flMount, fTags } from 'lithent/ftags';

const { div, input, button, ul, li } = fTags;

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp = flMount(() => {
  const todos = lstate<TodoItem[]>([]);
  const inputValue = lstate('');
  const nextId = lstate(1);

  const addTodo = () => {
    if (inputValue.value.trim()) {
      todos.value = [
        ...todos.value,
        { id: nextId.value++, text: inputValue.value, completed: false }
      ];
      inputValue.value = '';
    }
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter(todo => todo.id !== id);
  };

  return () => div(
    { className: 'todo-app' },

    div(
      { className: 'input-group' },
      input({
        type: 'text',
        value: inputValue.value,
        onInput: (e: Event) => {
          inputValue.value = (e.target as HTMLInputElement).value;
        },
        placeholder: 'Enter todo...'
      }),
      button({ onClick: addTodo }, 'Add')
    ),

    ul(
      { className: 'todo-list' },
      ...todos.value.map(todo =>
        li(
          {
            key: todo.id,
            style: {
              textDecoration: todo.completed ? 'line-through' : 'none',
              opacity: todo.completed ? 0.6 : 1
            }
          },
          div(
            { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
            input({
              type: 'checkbox',
              checked: todo.completed,
              onChange: () => toggleTodo(todo.id)
            }),
            div(todo.text),
            button(
              { onClick: () => removeTodo(todo.id) },
              'Delete'
            )
          )
        )
      )
    ),

    div(\`Total: \${todos.value.length} | Completed: \${todos.value.filter(t => t.completed).length}\`)
  );
});

render(TodoApp(), document.getElementById('root'));`}
    />

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        💡 Why flMount + lstate works well
      </h4>
      <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              No manual renew:
            </strong>{' '}
            state is tracked and updates automatically
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Concise code:
            </strong>{' '}
            <code>lstate</code> reacts to changes and re-renders for you
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Functional style:
            </strong>{' '}
            write clean functional components even without JSX
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              No build tools:
            </strong>{' '}
            works immediately from a CDN
          </div>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Todo app (fMount)
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, input, button, ul, li } = fTags;

interface TodoItem {
  id: number;
  text: string;
}

const TodoApp = fMount((renew) => {
  let todos: TodoItem[] = [];
  let nextId = 1;
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos = [...todos, { id: nextId++, text: inputValue }];
      inputValue = '';
      renew();
    }
  };

  const removeTodo = (id: number) => {
    todos = todos.filter(todo => todo.id !== id);
    renew();
  };

  return () => div(
    { className: 'todo-app' },

    div(
      { className: 'input-group' },
      input({
        type: 'text',
        value: inputValue,
        onInput: (e: Event) => {
          inputValue = (e.target as HTMLInputElement).value;
          renew();
        },
        placeholder: 'Enter todo...'
      }),
      button({ onClick: addTodo }, 'Add')
    ),

    ul(
      { className: 'todo-list' },
      ...todos.map(todo =>
        li(
          { key: todo.id },
          todo.text,
          button(
            {
              onClick: () => removeTodo(todo.id),
              style: { marginLeft: '10px' }
            },
            'Delete'
          )
        )
      )
    )
  );
});

render(TodoApp(), document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Composing reusable components
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, button, p } = fTags;

// Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

const CustomButton = fMount<ButtonProps>((_renew, props, children) => {
  const styles = {
    primary: { backgroundColor: '#007bff', color: 'white' },
    secondary: { backgroundColor: '#6c757d', color: 'white' }
  };

  return () =>
    button(
      {
        style: {
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          ...styles[props.variant || 'primary']
        },
        onClick: props.onClick
      },
      ...children
    );
});

// Card component
interface CardProps {
  title: string;
}

const Card = fMount<CardProps>((_renew, props, children) => {
  return () =>
    div(
      {
        style: {
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          margin: '10px 0'
        }
      },
      p({ style: { fontSize: '20px', fontWeight: 'bold' } }, props.title),
      div(...children)
    );
});

// Compose in App
const App = fMount(() => {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return () =>
    div(
      Card(
        { title: 'Welcome' },
        p('This is a reusable card component.'),
        CustomButton(
          { variant: 'primary', onClick: handleClick },
          'Click Me'
        ),
        CustomButton(
          { variant: 'secondary', onClick: handleClick },
          'Secondary'
        )
      )
    );
});

render(App(), document.getElementById('root'));`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      JSX vs FTags
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          JSX style
        </h3>
        <CodeBlock
          language="tsx"
          code={`import { mount } from 'lithent';

const App = mount((renew) => {
  let count = 0;

  return () => (
    <div className="app">
      <h1>Count: {count}</h1>
      <button
        onClick={() => {
          count++;
          renew();
        }}
      >
        Increment
      </button>
    </div>
  );
});`}
        />
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          FTags style
        </h3>
        <CodeBlock
          language="typescript"
          code={`import { mount } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, h1, button } = fTags;

const App = mount(renew => {
  let count = 0;

  return () =>
    div(
      { className: 'app' },
      h1(\`Count: \${count}\`),
      button(
        {
          onClick: () => {
            count++;
            renew();
          },
        },
        'Increment'
      )
    );
});
          `}
        />
      </div>
    </div>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Aspect
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              JSX
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              FTags
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              Build setup
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Requires Babel/TypeScript JSX configuration
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              No extra configuration
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              CDN usage
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Not available (requires a build)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              Works immediately
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              Readability
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              HTML-like (very intuitive)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Function call style
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              Type safety
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              Fully supported
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              Fully supported
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              Learning curve
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Leverages existing HTML knowledge
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JavaScript function calls
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When should you use FTags?
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          ✓ When FTags is a good fit
        </h3>
        <ul class="space-y-2 text-sm md:text-base text-green-800 dark:text-green-200">
          <li>• You want to avoid build tool configuration</li>
          <li>• You want to prototype quickly via CDN</li>
          <li>• You prefer working with plain JavaScript/TypeScript</li>
          <li>• You&apos;re building small widgets or libraries</li>
          <li>
            • JSX setup is painful in your environment (some legacy stacks)
          </li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ When JSX is a better choice
        </h3>
        <ul class="space-y-2 text-sm md:text-base text-blue-800 dark:text-blue-200">
          <li>• Large-scale application development</li>
          <li>• Teams already comfortable with JSX</li>
          <li>• Highly complex UI trees where JSX reads more clearly</li>
          <li>• Projects that already have a full build pipeline</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      TypeScript type definitions
    </h2>

    <CodeBlock
      language="typescript"
      code={`import type { Props, WDom, MiddleStateWDom } from 'lithent';

// fTags type
type FFunction = (...param: (Props | MiddleStateWDom)[]) => WDom;
type FTags = {
  [tagName: string]: FFunction;
};

// fFragment type
const fFragment: (...children: MiddleStateWDom[]) => WDom;

// fMount type
const fMount: <T>(
  component: Component<T>
) => (
  ...param: unknown extends T
    ? (Props | MiddleStateWDom)[]
    : [T, ...MiddleStateWDom[]]
) => WDom;

// flMount type
const flMount: <T>(
  component: LComponent<T>
) => (
  ...param: unknown extends T
    ? (Props | MiddleStateWDom)[]
    : [T, ...MiddleStateWDom[]]
) => WDom;`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next steps
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/htm-tags"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/htm-tags');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          JSX & Templates: HTM Tags →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about HTM (Hyperscript Tagged Markup), a template-literal-based
          syntax that feels close to HTML.
          <br />
          It works without a build step and pairs nicely with FTags-style code.
        </p>
      </a>
    </div>
  </div>
);
