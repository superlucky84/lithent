import { CodeBlock } from '@/components/CodeBlock';

export const QuickStart = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Quick Start
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Get started with Lithent in minutes. This guide will help you create your
      first Lithent application.
    </p>

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Installation
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Install Lithent using npm, yarn, or pnpm:
    </p>

    <CodeBlock
      language="bash"
      code={`npm install lithent
# or
yarn add lithent
# or
pnpm add lithent`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Your First Component
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Create a simple counter component using Lithent's closure-based pattern:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { h, mount, render } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0);

  const increment = () => {
    count.value++;
    renew();
  };

  return () => (
    <div>
      <h1>Count: {count.value}</h1>
      <button onClick={increment}>Increment</button>
    </div>
  );
});

render(<Counter />, document.getElementById('root'));`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      JSX Configuration
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Configure your{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
        tsconfig.json
      </code>{' '}
      for JSX support:
    </p>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Component with Props
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Create components that accept props:
    </p>

    <CodeBlock
      language="tsx"
      code={`const Greeting = mount<{ name: string }>((renew, props) => {
  return () => (
    <div>
      <h1>Hello, {props.name}!</h1>
    </div>
  );
});

render(<Greeting name="World" />, document.getElementById('root'));`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Using Lifecycle Hooks
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Lithent provides lifecycle hooks for side effects:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mountCallback } from 'lithent';

const Component = mount((renew) => {
  mountCallback(() => {
    console.log('Component mounted!');

    // Cleanup function
    return () => {
      console.log('Component unmounted!');
    };
  });

  return () => <div>Hello!</div>;
});`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      SSR Setup
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Use the SSR boilerplate generator for server-side rendering:
    </p>

    <CodeBlock
      language="bash"
      code={`npx create-lithent-ssr@latest my-app
cd my-app
pnpm install
pnpm dev`}
    />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Next Steps
    </h2>

    <div class="bg-[#42b883] bg-opacity-10 border border-[#42b883] rounded-lg p-6 mb-6">
      <p class="text-sm md:text-base text-gray-900 dark:text-white font-medium mb-3">
        You're now ready to build with Lithent!
      </p>
      <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>Explore more examples in the documentation</li>
        <li>Learn about state management with helpers</li>
        <li>Check out the GitHub repository for more resources</li>
      </ul>
    </div>
  </div>
);
