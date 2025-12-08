import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const HtmTags = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      HTM Tags
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is HTM?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <a
        href="https://github.com/developit/htm"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[#42b883] hover:underline font-medium"
      >
        HTM (Hyperscript Tagged Markup)
      </a>
      is a library that lets you use a{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        JSX-like syntax with plain JavaScript
      </strong>
      .
      <br />
      <br />
      You can use JSX-style markup directly in the browser without a transpiler,
      and the library is extremely small (around 600 bytes).
      <br />
      <br />
      Lithent exposes HTM via the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/tag
      </code>{' '}
      package, binding HTM to Lithent&apos;s{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        h
      </code>{' '}
      function.
    </p>

    <div class="border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <span class="font-medium">✨ Key properties:</span>
        <br />
        <br />
        • No transpiler required – pure JavaScript
        <br />
        • Very small footprint – ~600 bytes
        <br />
        • JSX-like authoring experience
        <br />
        • Uses ES6 tagged template literals
        <br />• Supports all modern browsers
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Installation & basic usage
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Install
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Once you install Lithent, you can use{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/tag
      </code>{' '}
      right away—no extra package is required.
    </p>

    <CodeBlock language="bash" code={`npm install lithent`} />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Using via CDN
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      If you want to use HTM directly in the browser without build tools, you
      can import it from a CDN. With ES modules you can wire HTM up to Lithent
      in a single HTML file.
    </p>

    <CodeBlock
      language="html"
      code={`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lithent + HTM CDN Example</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
    }
    .counter {
      text-align: center;
    }
    button {
      font-size: 18px;
      padding: 10px 20px;
      margin: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- Load Lithent and lithentTag from CDN -->
  <script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/tag/dist/lithentTag.umd.js"></script>

  <script>
    // Pull required APIs from globals
    const { h, Fragment, mount, render } = lithent;
    const { lTag } = lithentTag;

    // Counter component
    const Counter = mount(renew => {
      let count = 0;

      const increment = () => {
        count += 1;
        renew();
      };

      const decrement = () => {
        count -= 1;
        renew();
      };

      return () => lTag\`
        <div class="counter">
          <h1>Counter: \${count}</h1>
          <button onClick=\${increment}>+1</button>
          <button onClick=\${decrement}>-1</button>
        </div>
      \`;
    });

    // Render
    render(lTag\`<\${Counter} />\`, document.getElementById('root'));
  </script>
</body>
</html>`}
    />

    <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed">
        <span class="font-medium">✨ Why CDN is nice:</span> save the HTML file
        above and open it in a browser—it works immediately. No build setup or
        bundler is required.
        <br />
        <br />
        <span class="font-medium">📦 Optional helper bundle:</span> if you also
        want helper features, load{' '}
        <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm">
          lithent@2/helper/dist/lithentHelper.umd.js
        </code>
        as well.
        <br />
        <br />
        <span class="font-medium">🔖 Pinning versions:</span> to lock a specific
        version, use a URL like{' '}
        <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm">
          lithent@1.20.2
        </code>{' '}
        in your script tag.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Basic usage (npm)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Import{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lTag
      </code>{' '}
      from{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/tag
      </code>{' '}
      and you can start using HTM with Lithent immediately.
    </p>

    <CodeBlock
      language="javascript"
      code={`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

const App = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  return () => lTag\`
    <div>
      <h1>Counter: \${count}</h1>
      <button onClick=\${increment}>Increment</button>
    </div>
  \`;
});

render(lTag\`<\${App} />\`, document.getElementById('root'));`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Tagged templates:</span> HTM uses ES6
        tagged template literals.{' '}
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          lTag`...`
        </code>{' '}
        syntax and write HTML-like markup inside backticks (`).
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Differences from JSX
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      HTM is very similar to JSX but there are a few important differences:
    </p>

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
              HTM
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Transpiler
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Required (Babel, etc.)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Not required (pure JS)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Components
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<Foo />`}
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<\${Foo} />`}
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Spread Props
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<div {...props}>`}
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<div ...\${props}>`}
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Closing tags
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`</Foo>`}
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<//>`} (shorthand closing)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              HTML quotes
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Required
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Optional (e.g. <code>class=foo</code>)
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Example comparison
    </h3>

    <CodeBlock
      language="javascript"
      code={`// JSX
<MyComponent name="John" age={25} />

// HTM
lTag\`<\${MyComponent} name="John" age=\${25} />\`

// JSX - Spread props
<div {...props}>content</div>

// HTM - Spread props
lTag\`<div ...\${props}>content</div>\`

// JSX - closing tag
<MyComponent>
  <h1>Title</h1>
</MyComponent>

// HTM - shorthand closing
lTag\`<\${MyComponent}>
  <h1>Title</h1>
<//>\``}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Practical examples
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Counter application
    </h3>

    <CodeBlock
      language="javascript"
      code={`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

const Counter = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  const decrement = () => {
    count -= 1;
    renew();
  };

  return () => lTag\`
    <div class="counter">
      <h1>Count: \${count}</h1>
      <button onClick=\${increment}>+</button>
      <button onClick=\${decrement}>-</button>
    </div>
  \`;
});

render(lTag\`<\${Counter} />\`, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Todo list
    </h3>

    <CodeBlock
      language="javascript"
      code={`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

const TodoApp = mount(renew => {
  let todos = ['Learn Lithent', 'Build App'];
  let input = '';

  const addTodo = () => {
    if (input.trim()) {
      todos = [...todos, input];
      input = '';
      renew();
    }
  };

  const removeTodo = (index) => {
    todos = todos.filter((_, i) => i !== index);
    renew();
  };

  return () => lTag\`
    <div class="todo-app">
      <h1>Todo List</h1>

      <div class="input-section">
        <input
          type="text"
          value=\${input}
          onInput=\${(e) => { input = e.target.value; }}
          placeholder="Add new todo..."
        />
        <button onClick=\${addTodo}>Add</button>
      </div>

      <ul class="todo-list">
        \${todos.map((todo, index) => lTag\`
          <li key=\${index}>
            <span>\${todo}</span>
            <button onClick=\${() => removeTodo(index)}>Delete</button>
          </li>
        \`)}
      </ul>
    </div>
  \`;
});

render(lTag\`<\${TodoApp} />\`, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Composing components
    </h3>

    <CodeBlock
      language="javascript"
      code={`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

// Header component
const Header = mount((renew, props) => {
  return () => lTag\`
    <header>
      <h1>\${props.title}</h1>
      <p>\${props.subtitle}</p>
    </header>
  \`;
});

// Footer component
const Footer = mount((renew, props) => {
  return () => lTag\`
    <footer ...\${props}>
      <p>© 2024 My App</p>
    </footer>
  \`;
});

// Main component
const Main = mount(renew => {
  return () => lTag\`
    <main>
      <p>Main content here</p>
    </main>
  \`;
});

// App component
const App = mount(renew => {
  return () => lTag\`
    <div class="app">
      <\${Header}
        title="My Application"
        subtitle="Built with Lithent & HTM"
      />
      <\${Main} />
      <\${Footer} class="footer" />
    </div>
  \`;
});

render(lTag\`<\${App} />\`, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Using fragments
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      HTM automatically treats multiple root elements as a fragment. Unlike JSX,
      you don&apos;t need to explicitly write{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        {`<></>`}
      </code>
      for grouped siblings.
    </p>

    <CodeBlock
      language="javascript"
      code={`import { mount, render, Fragment } from 'lithent';
import { lTag } from 'lithent/tag';

const MultipleElements = mount(renew => {
  return () => lTag\`
    <h1>First Element</h1>
    <p>Second Element</p>
    <div>Third Element</div>
  \`;
});

// You can also use Fragment explicitly
const ExplicitFragment = mount(renew => {
  return () => lTag\`
    <\${Fragment}>
      <h1>First Element</h1>
      <p>Second Element</p>
    <//>
  \`;
});

// Fragment is also useful in conditional rendering
const ConditionalContent = mount(renew => {
  let showDetails = true;

  const toggleDetails = () => {
    showDetails = !showDetails;
    renew();
  };

  return () => lTag\`
    <div>
      <h1>Title</h1>
      \${showDetails && lTag\`
        <\${Fragment}>
          <p>Detail 1</p>
          <p>Detail 2</p>
          <p>Detail 3</p>
        <//>
      \`}
      <button onClick=\${toggleDetails}>
        \${showDetails ? 'Hide' : 'Show'} Details
      </button>
    </div>
  \`;
});

render(lTag\`<\${ConditionalContent} />\`, document.getElementById('root'));`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Fragment:
        </span>{' '}
        HTM returns multiple root elements as an array, so in most cases you
        don&apos;t need to mark fragments explicitly. However, when you want to
        clarify intent or structure—especially with conditional rendering—you
        can still use <code>Fragment</code> explicitly.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Binding HTM manually
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can also bind HTM directly without going through{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/tag
      </code>
      .
    </p>

    <CodeBlock
      language="javascript"
      code={`import { h, mount, render } from 'lithent';
import htm from 'htm';

// Bind HTM directly to Lithent's h
const html = htm.bind(h);

const App = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  return () => html\`
    <div>
      <h1>Count: \${count}</h1>
      <button onClick=\${increment}>+</button>
    </div>
  \`;
});

render(html\`<\${App} />\`, document.getElementById('root'));`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          lithent/tag
        </code>
        &apos;s <code>lTag</code> is essentially{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          htm.bind(h)
        </code>
        under the hood, so it behaves the same as the manual binding shown
        above.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Choosing between HTM and JSX
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ When HTM is a good fit
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>
            • You want to develop directly in the browser without build tools
          </li>
          <li>• Prototypes or small/medium projects</li>
          <li>• You prefer importing everything from a CDN</li>
          <li>• You want to avoid complex build configuration</li>
          <li>• You need to keep bundle size minimal</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          ✅ When JSX is a better choice
        </h3>
        <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
          <li>• Large-scale applications</li>
          <li>• You rely heavily on TypeScript and strict type checking</li>
          <li>• You want the best IDE autocomplete and syntax tooling</li>
          <li>
            • You care about maximum runtime performance via build-time
            compilation
          </li>
          <li>• Your team is already fluent in JSX</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Caveats
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ Component references:</span> When using
        components in HTM, you must use{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          {`<\${Component} />`}
        </code>{' '}
        with the dollar + braces syntax. Writing JSX-style{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          {`<Component />`}
        </code>
        will not work.
        <br />
        <br />
        <span class="font-medium">⚠️ Backticks:</span> HTM relies on ES6 tagged
        templates, so you must use backticks (`). Regular single or double
        quotes will not work.
        <br />
        <br />
        <span class="font-medium">⚠️ Runtime parsing:</span> HTM parses
        templates at runtime, whereas JSX is compiled at build time. JSX can
        have better raw runtime performance, but HTM is still fast in practice
        and caches templates internally.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Learn more
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="https://github.com/developit/htm"
        target="_blank"
        rel="noopener noreferrer"
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          HTM GitHub Repository →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Browse HTM&apos;s official documentation and more examples.
        </p>
      </a>

      <a
        href="/guide/template-strings"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/template-strings');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Template Strings →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Explore Lithent&apos;s template-string based system with powerful
          directives like <code>l-if</code> and <code>l-for</code>.
          <br />
          It feels similar to JSX but offers an even more declarative syntax.
        </p>
      </a>
    </div>
  </div>
);
