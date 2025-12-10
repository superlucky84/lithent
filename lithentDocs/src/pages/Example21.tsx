import { mount } from 'lithent';
import { Example21 } from '@/components/examples/example21';
import { navigateTo } from '@/store';

export const Example21Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Example 21: Quick Notes with HTM Tags (CDN Ready)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        This example shows how to create a complete Notes application using HTM
        Tags that works with CDN only, without build tools. Using Import Maps,
        you can load Lithent modules directly from CDN and start coding
        immediately!
      </p>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          💡 Key Learning Points
        </h3>
        <p class="text-sm text-purple-800 dark:text-purple-200 mb-3">
          <strong>HTM Tags + Import Maps:</strong> HTM (Hyperscript Tagged
          Markup) lets you write JSX-like code using template literals. Combined
          with Import Maps, you can load modules from CDN without any build
          step. Save as an HTML file and open in your browser - it just works!
        </p>
        <p class="text-sm text-purple-800 dark:text-purple-200">
          <strong>lmount + lstate:</strong> This example uses Lithent's
          Declarative Light API mode. Use lmount with lstate for automatic
          reactive updates—no need to call renew() manually!
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Advantages of HTM Tags
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
              No NPM installation, no build tools, no configuration files. Just
              a single HTML file.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              2️⃣ Import Maps
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Use native browser Import Maps to load ES modules from CDN. Modern
              browsers support this without polyfills.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              3️⃣ Tagged Template Literals
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              HTM uses ES6 tagged templates (backticks) for markup. No
              transpiler needed, yet you get JSX-like syntax.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              4️⃣ Lightweight & Fast
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              HTM library is tiny (~600 bytes) and parses templates efficiently
              at runtime with internal caching.
            </p>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Quick Notes App Structure
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        This example is a fully-featured note-taking app:
      </p>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Add Notes:</strong> Create notes with title and content
        </li>
        <li>
          <strong>Real-time Counter:</strong> Display total number of saved
          notes
        </li>
        <li>
          <strong>Grid Layout:</strong> Responsive card grid for displaying
          notes
        </li>
        <li>
          <strong>Delete Function:</strong> Remove individual notes with
          confirmation
        </li>
        <li>
          <strong>Timestamps:</strong> Automatically record when notes are
          created
        </li>
        <li>
          <strong>Empty State:</strong> Friendly message when no notes exist
        </li>
        <li>
          <strong>Reactive UI:</strong> UI automatically updates when state
          changes
        </li>
        <li>
          <strong>Beautiful Design:</strong> Gradient backgrounds, smooth
          animations
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Technologies Used
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Import Maps
          </h3>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            Browser-native way to map module specifiers to URLs. No bundler
            needed to load from CDN.
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            HTM Tags (lTag)
          </h3>
          <p class="text-sm text-green-800 dark:text-green-200">
            Use template literals with JSX-like syntax. Import lTag from
            lithent/tag and start writing markup.
          </p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            lmount + lstate
          </h3>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            Declarative Light API mode. Use lmount with lstate for automatic UI
            updates without manual renew() calls.
          </p>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h3 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            ES Modules
          </h3>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            Modern browser-native module system. Load modules directly with
            import statements.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Live Example
      </h2>

      <div class="my-8">
        <Example21 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Use Cases
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          When to Use HTM Tags with CDN?
        </h3>

        <div class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>Rapid Prototyping:</strong> Quickly test ideas without
              setup
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>Educational Demos:</strong> Teaching web development
              without tooling complexity
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>Simple Tools:</strong> Single-page utilities and
              calculators
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>Legacy Environments:</strong> Where build tools can't be
              installed
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>CodePen/JSFiddle:</strong> Online code playgrounds
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
            For large applications, JSX with build tools may provide better
            performance and developer experience.
          </li>
          <li>
            HTM parses templates at runtime. While fast, JSX compilation is
            theoretically faster.
          </li>
          <li>
            TypeScript autocomplete and type checking work better with JSX than
            HTM templates.
          </li>
          <li>
            Import Maps are supported in modern browsers but may need polyfill
            for older browsers.
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
            Save notes to LocalStorage so they persist across browser sessions.
          </p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🏷️ Categories & Tags
          </h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            Add categories or tags to organize notes by topic.
          </p>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            🔍 Search & Filter
          </h4>
          <p class="text-sm text-green-800 dark:text-green-200">
            Add search functionality to find notes by title or content.
          </p>
        </div>

        <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            ✏️ Edit Notes
          </h4>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            Allow editing existing notes instead of just creating and deleting.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Related Documentation
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/guide/htm-tags"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/htm-tags');
            }}
          >
            HTM Tags Guide
          </a>{' '}
          - Complete guide to using HTM with Lithent
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
            href="/guide/ftags"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/ftags');
            }}
          >
            FTags Guide
          </a>{' '}
          - Alternative function-based markup (also works with CDN)
        </li>
      </ul>
    </div>
  );
});
