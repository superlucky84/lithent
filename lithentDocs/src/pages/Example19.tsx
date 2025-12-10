import { mount } from 'lithent';
import { Example19 } from '@/components/examples/example19';
import { navigateTo } from '@/store';

export const Example19Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Smart Todo List with FTags (CDN Ready)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        This example shows how to create a complete Todo application using FTags
        that works with CDN only, without build tools. Copy the code and save it
        as an HTML file to run it immediately!
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Key Test Points
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>Zero Configuration with FTags</strong>: With FTags, you can
          create reactive UIs with pure JavaScript without setting up build
          tools like JSX, Babel, or Webpack. Load directly from CDN to implement
          a complete app with a single HTML file.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Advantages of FTags
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ✨ Key Advantages
        </h3>

        <div class="space-y-4">
          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              1️⃣ Zero Configuration
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              No need for NPM installation, package.json setup, or Babel/Webpack
              configuration. A single HTML file is all you need.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              2️⃣ Instant CDN Usage
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Load Lithent, FTags, and Helper libraries directly from CDN for
              immediate use. Useful for rapid prototyping or creating simple
              widgets.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              3️⃣ Pure Functional API
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              All HTML tags are provided as functions, allowing UI composition
              through function calls alone. TypeScript type safety is fully
              supported.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              4️⃣ Automatic Props Detection
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Automatically detects whether the first argument is props or
              children, allowing you to omit props and pass children directly.
              Code becomes more concise.
            </p>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Smart Todo List App Structure
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        This example is a fully-featured task management app:
      </p>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Add Tasks:</strong> Add tasks with text input and category
          selection
        </li>
        <li>
          <strong>Category Classification:</strong> Categorize as Home, Work, or
          Other
        </li>
        <li>
          <strong>Real-time Statistics:</strong> Automatically calculate total,
          completed, and pending counts
        </li>
        <li>
          <strong>Multiple Filters:</strong> Filter by All/Completed/Pending and
          category
        </li>
        <li>
          <strong>Completion Toggle:</strong> Switch between complete/incomplete
          with checkbox
        </li>
        <li>
          <strong>Delete Function:</strong> Delete individual tasks
        </li>
        <li>
          <strong>Reactive UI:</strong> UI automatically updates when state
          changes
        </li>
        <li>
          <strong>Beautiful Design:</strong> Includes gradients, badges, and
          animations
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Technologies Used
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            flMount
          </h3>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            Creates Light API components without JSX. Used with lstate, UI
            automatically updates.
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            fTags
          </h3>
          <p class="text-sm text-green-800 dark:text-green-200">
            Provides all HTML tags as functions. Import div, button, input,
            select, etc. through destructuring.
          </p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            lstate
          </h3>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            Reactive state management. Accessing/modifying with .value
            automatically re-renders components.
          </p>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h3 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            computed
          </h3>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            Derived state. Automatically recalculates when dependent state
            changes.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Live Example
      </h2>

      <div class="my-8">
        <Example19 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Use Cases
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          When to Use FTags?
        </h3>

        <div class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>Rapid Prototyping:</strong> When you want to quickly
              validate ideas
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>Small Widgets:</strong> Simple interactive widgets to
              embed in websites
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>Educational Purposes:</strong> Teaching reactive
              programming to students without build tools
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>Legacy Environments:</strong> Developing modern UI in
              environments where JSX setup is difficult
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>Standalone Tools:</strong> HTML files deployable without
              external dependencies
            </div>
          </div>
        </div>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ Cautions
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            For large-scale applications, JSX may have better readability.
          </li>
          <li>
            If your team is familiar with JSX, there's no need to switch to
            FTags.
          </li>
          <li>
            In complex nested structures, the function call approach may be
            harder to read than JSX.
          </li>
          <li>
            Performance is identical to JSX. Both generate the same Virtual DOM.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Extension Ideas
      </h2>

      <div class="grid gap-4 mb-6">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            💾 LocalStorage Persistence
          </h4>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            Save the todo list to LocalStorage so data persists even after
            closing the browser.
          </p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🎯 Priority System
          </h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            Add High, Medium, Low priority levels and distinguish them with
            colors.
          </p>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            📅 Due Date Management
          </h4>
          <p class="text-sm text-green-800 dark:text-green-200">
            Add due dates to each task and implement sorting by approaching
            deadlines.
          </p>
        </div>

        <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            🔍 Search Feature
          </h4>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            Add a search function by task title to quickly find items among many
            tasks.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Related Documentation
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/guide/ftags"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/ftags');
            }}
          >
            FTags Guide
          </a>{' '}
          - All features and API documentation for FTags
        </li>
        <li>
          <a
            href="/guide/lstate"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/lstate');
            }}
          >
            Lstate Guide
          </a>{' '}
          - Light API reactive state management
        </li>
        <li>
          <a
            href="/guide/computed"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/computed');
            }}
          >
            Computed Guide
          </a>{' '}
          - Derived state and automatic calculation
        </li>
      </ul>
    </div>
  );
});
