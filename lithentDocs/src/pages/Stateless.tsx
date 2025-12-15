import { CodeBlock } from '@/components/CodeBlock';
import type { Introduction } from '@/pages/Introduction';
import { navigateTo } from '@/store';

export const Stateless = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Stateless Components
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      If your UI does not require any state at all, you can define components as
      simple functions without using{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        mount
      </code>{' '}
      or{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lmount
      </code>
      . This helps reduce bundle size and minimize dependencies. Unlike React,
      Lithent passes{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        children
      </code>{' '}
      as the second argument instead of inside props, so be mindful of the
      function signature.
    </p>

    <CodeBlock
      language="tsx"
      code={`// Simple display-only components can be defined as plain functions.
export const Badge = ({ label }: { label: string }) => (
  <span>[{label}]</span>
);

// In Lithent, children are passed as the second argument instead of props.
// Make sure to follow the (props, children) order.
export const Card = (
  { title }: { title: string },
  children: JSX.Element
) => (
  <div>
    <Badge label="Info" /> {title}
    {children}
  </div>
);

// Add state only when needed using mount/lmount
// const StatefulCard = mount(renew => { ... });`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">Tip:</span> Reusing pure function components
        defined outside of the render scope is beneficial for performance, as it
        avoids creating new function instances on every render.
      </p>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
      When you eventually need state, you can introduce{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        mount
      </code>{' '}
      or{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lmount
      </code>{' '}
      at any time. Keep small UI building blocks as lightweight as possible.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/fragment"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/fragment');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core feature: Fragment →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn how to group multiple elements without adding extra DOM nodes
          using Fragments.
        </p>
      </a>
    </div>
  </div>
);
