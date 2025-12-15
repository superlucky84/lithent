import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Fragment = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Fragment
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is a Fragment?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      A Fragment{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        lets you group multiple elements without adding an extra DOM node
      </strong>
      .
      <br />
      <br />
      JSX requires a single root element. You can&apos;t return multiple sibling
      elements directly. Fragments solve this problem by grouping elements
      without creating an extra wrapper{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;div&gt;
      </code>
      .
      <br />
      <br />
      This keeps your DOM structure clean and avoids unnecessary nesting, which
      is especially important for CSS layouts and semantic HTML.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic Fragment usage
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Instead of wrapping elements in a{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;div&gt;
      </code>
      , use <code>Fragment</code> to group them:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, Fragment } from 'lithent';

const Columns = mount(() => {
  return () => (
    <Fragment>
      <td>Column 1</td>
      <td>Column 2</td>
      <td>Column 3</td>
    </Fragment>
  );
});

const App = mount(() => {
  return () => (
    <table>
      <tbody>
        <tr>
          <Columns />
        </tr>
      </tbody>
    </table>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The rendered HTML will be:
    </p>

    <CodeBlock
      language="html"
      code={`<table>
  <tbody>
    <tr>
      <td>Column 1</td>
      <td>Column 2</td>
      <td>Column 3</td>
    </tr>
  </tbody>
</table>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Without Fragment, you would need to wrap the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;td&gt;
      </code>{' '}
      elements in a{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;div&gt;
      </code>
      , which would break the table structure.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Short syntax: &lt;&gt;...&lt;/&gt;
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can use the shorter <code>&lt;&gt;...&lt;/&gt;</code> syntax instead
      of <code>Fragment</code>:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const List = mount(() => {
  return () => (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This is completely equivalent to using <code>Fragment</code> explicitly.
      Use whichever style you prefer.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Fragments with keys
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When rendering Fragments in a list, you may need to provide a{' '}
      <code>key</code> prop for efficient updates. In this case, you must use
      the explicit <code>Fragment</code> syntax (not <code>&lt;&gt;</code>):
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, Fragment } from 'lithent';

const items = [
  { id: 1, title: 'First', description: 'First item' },
  { id: 2, title: 'Second', description: 'Second item' },
  { id: 3, title: 'Third', description: 'Third item' },
];

const List = mount(() => {
  return () => (
    <dl>
      {items.map(item => (
        <Fragment key={item.id}>
          <dt>{item.title}</dt>
          <dd>{item.description}</dd>
        </Fragment>
      ))}
    </dl>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Each Fragment wraps a{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;dt&gt;
      </code>{' '}
      and{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;dd&gt;
      </code>{' '}
      pair, and the <code>key</code> helps Lithent efficiently track changes
      when items are reordered or updated.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Nested Fragments
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Fragments can be nested to organize complex layouts without extra DOM
      nodes:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, Fragment } from 'lithent';

const Card = mount<{ title: string; content: string }>(() => {
  return ({ title, content }) => (
    <Fragment>
      <h2>{title}</h2>
      <Fragment>
        <p>{content}</p>
        <button>Read more</button>
      </Fragment>
    </Fragment>
  );
});

const App = mount(() => {
  return () => (
    <div class="container">
      <Card title="Hello" content="World" />
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      All elements are rendered as direct children without intermediate
      wrappers.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When to use Fragment
    </h2>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ul class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <span>
            <strong>Table rows and cells:</strong> Avoid wrapping{' '}
            <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
              &lt;tr&gt;
            </code>{' '}
            or{' '}
            <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
              &lt;td&gt;
            </code>{' '}
            in divs
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <span>
            <strong>Flex/Grid layouts:</strong> Extra wrappers can interfere
            with CSS flex or grid alignment
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <span>
            <strong>Conditional groups:</strong> Return multiple elements
            conditionally without wrapper divs
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <span>
            <strong>Cleaner DOM:</strong> Keep your HTML structure minimal and
            semantic
          </span>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Fragment vs wrapper div
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Compare these two approaches:
    </p>

    <CodeBlock
      language="tsx"
      code={`// ❌ With wrapper div (adds extra DOM node)
const BadList = mount(() => {
  return () => (
    <div>
      <li>Item 1</li>
      <li>Item 2</li>
    </div>
  );
});

// ✅ With Fragment (no extra DOM node)
const GoodList = mount(() => {
  return () => (
    <Fragment>
      <li>Item 1</li>
      <li>Item 2</li>
    </Fragment>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The wrapper{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;div&gt;
      </code>{' '}
      is invalid HTML inside a{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;ul&gt;
      </code>{' '}
      and can cause rendering issues. Fragment solves this cleanly.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/state"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/state');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: State →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          If you now want to start writing stateful components, take a look at
          the state helper.
        </p>
      </a>
    </div>
  </div>
);
