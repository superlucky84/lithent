import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const VitePlugin = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Vite Plugin
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What is @lithent/lithent-vite?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        @lithent/lithent-vite
      </code>{' '}
      is the{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        official Vite plugin for Lithent
      </strong>
      .
      <br />
      <br />
      It enables Hot Module Replacement (HMR) during development so you can
      instantly see updates without losing component state. The plugin
      automatically injects HMR boundaries to provide a smooth development
      experience.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Key Features
    </h2>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ul class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Hot Module Replacement
            </strong>
            : instant updates during development
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Automatic HMR boundaries
            </strong>
            : automatically wraps mount components
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Marker support
            </strong>
            : explicit HMR boundary control via comments
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Type safety
            </strong>
            : full TypeScript support
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Zero configuration
            </strong>
            : works out of the box with sensible defaults
          </div>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Installation
    </h2>

    <CodeBlock
      language="bash"
      code={`npm install @lithent/lithent-vite
# or
pnpm add @lithent/lithent-vite
# or
yarn add @lithent/lithent-vite`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          📦 Peer Dependencies:
        </span>
        <br />• lithent: 1.x
        <br />• vite: 5.x
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic Setup
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Add the plugin to{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        vite.config.js
      </code>{' '}
      or{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        vite.config.ts
      </code>
      :
    </p>

    <CodeBlock
      language="typescript"
      code={`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin(),
  ],
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      That’s it! The plugin will automatically enable HMR for Lithent
      components.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Configuration Options
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can customize the plugin behavior:
    </p>

    <CodeBlock
      language="typescript"
      code={`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin({
      // Include specific file patterns (default: [/\\.([cm]?[tj]sx?)$/])
      include: /\\.tsx?$/,

      // Custom HMR boundary marker (default: '/* lithent:hmr-boundary */')
      boundaryMarker: '/* lithent:hmr-boundary */',

      // Custom import specifiers
      createBoundaryImport: 'lithent/devHelper',
      tagFunctionImport: 'lithent',

      // Enable devtools in production (default: false)
      devtoolsInProd: false,

      // JSX import source (default: 'lithent')
      jsxImportSource: 'lithent',

      // Use lithent-template-vite before HMR transform
      template: {
        extensions: ['.ltsx'],
      },
    }),
  ],
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Main Options
    </h3>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Option
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Type
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Default
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              include
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              RegExp | RegExp[]
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              /\.([cm]?[tj]sx?)$/
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              File patterns to transform
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              boundaryMarker
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              string
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              '/* lithent:hmr-boundary */'
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              HMR boundary marker string
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              jsxImportSource
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              string
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              'lithent'
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Automatic JSX transform source
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              devtoolsInProd
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              boolean
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              false
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Enable devtools in production
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      How It Works
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Automatic HMR Boundaries
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The plugin automatically wraps components that use{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        mount
      </code>
      :
    </p>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Before Transformation:
    </h4>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4">
      After Transformation:
    </h4>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createHmrBoundary } from 'lithent/devHelper';

const App = createHmrBoundary(
  mount((renew, props) => {
    return () => <div>Hello World</div>;
  }),
  import.meta.hot,
  'App'
);

export default App;`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        createHmrBoundary
      </code>
      wraps the component and properly handles state during HMR updates.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Explicit HMR Boundaries
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      You can explicitly control HMR boundaries using marker comments:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props) => {
  return () => <div>Hello World</div>;
});

export default App;`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        /* lithent:hmr-boundary default */
      </code>{' '}
      comment explicitly adds an HMR boundary to the default export of the file.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      State Preservation (Module-Level HMR)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Since Lithent uses{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        native closure-based state management
      </strong>
      , HMR operates at the{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        module (file) level
      </strong>
      :
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-3">
        <li>
          <strong>🔄 Modified modules:</strong> The entire closure state of the
          modified file (module) is reset.
          <br />
          <span class="text-xs opacity-80">
            → All components and variables in that file are recreated and
            reinitialized.
          </span>
        </li>
        <li>
          <strong>✅ Unmodified modules:</strong> The state of components in
          other files is fully preserved.
          <br />
          <span class="text-xs opacity-80">
            → Parent/child/sibling components in other files are not affected.
          </span>
        </li>
      </ul>
    </div>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <strong>⚠️ Important:</strong> HMR works at the file (module) level. If
        a file contains multiple components, modifying even one of them will
        replace the entire file, resetting the state of all components inside.
        <br />
        <br />
        <strong>⚠️ External state is also module-scoped:</strong> Even external
        state created via lithent/helper (state or store) will be reset if the
        module that created it is replaced by HMR. This happens because the
        closure context of the defining module is recreated.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Differences from React HMR
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      React stores component state inside React’s own state system, which allows
      state to be preserved across HMR updates. Lithent, on the other hand,
      stores state directly inside JavaScript closures. As a result, when a
      module is reloaded, the closures are recreated and the state is reset.
      <br />
      <br />
      This behavior is a natural consequence of Lithent’s{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        native JavaScript closure-based design
      </strong>
      . During development, this ensures that modified files always start from a
      clean state for reliable testing.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Practical Example
    </h3>

    <CodeBlock
      language="tsx"
      code={`// ParentComponent.tsx (File A)
import { mount } from 'lithent';

const Parent = mount((renew) => {
  let parentCount = 0; // Closure variable

  return () => (
    <div>
      <p>Parent Count: {parentCount}</p>
      <button onClick={() => { parentCount++; renew(); }}>
        Increment Parent
      </button>
      <Child />
    </div>
  );
});

// ChildComponent.tsx (File B)
import { mount } from 'lithent';

const Child = mount((renew) => {
  let childCount = 0; // Closure variable

  return () => (
    <div>
      <p>Child Count: {childCount}</p>
      <button onClick={() => {
        childCount++;
        renew();
      }}>
        Increment Child
      </button>
    </div>
  );
});

// HMR Scenarios:
// 1. When ChildComponent.tsx (File B) is modified:
//    - childCount: Reset (entire File B is reloaded)
//    - parentCount: Preserved (File A is unchanged)

// 2. When ParentComponent.tsx (File A) is modified:
//    - parentCount: Reset (entire File A is reloaded)
//    - childCount: Preserved (File B is unchanged)

// 3. When Parent and Child are in the same file:
//    - Modifying either one reloads the entire file
//    - Both parentCount and childCount are reset`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Development Tip:
        </span>{' '}
        Splitting components into separate files allows state in other
        components to be preserved when you modify a single component, resulting
        in a better HMR experience.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      SSR Setup (Express / Node.js)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      When using server-side rendering together with Vite middleware:
    </p>

    <CodeBlock
      language="javascript"
      code={`import express from 'express';
import { createServer as createViteServer } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

const app = express();

const vite = await createViteServer({
  plugins: [
    lithentVitePlugin(),
  ],
  server: { middlewareMode: 'ssr', hmr: true },
});

app.use(vite.middlewares);

// Add SSR rendering route
app.get('*', async (req, res) => {
  // SSR logic...
});

app.listen(3000);`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Troubleshooting
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      When HMR Does Not Work
    </h3>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <ol class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed space-y-2">
        <li>
          1. Make sure the plugin is loaded before other transform plugins.
        </li>
        <li>2. Ensure the file matches the include pattern.</li>
        <li>
          3. Verify that import.meta.hot is available (only in development
          mode).
        </li>
      </ol>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      TypeScript Errors
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Add the Vite client types to your{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        tsconfig.json
      </code>
      :
    </p>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Related Packages
    </h2>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <ul class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
        <li>
          <strong class="text-gray-700 dark:text-gray-300">
            @lithent/hmr-parser
          </strong>{' '}
          - Core HMR transform logic
        </li>
        <li>
          <strong class="text-gray-700 dark:text-gray-300">lithent</strong> -
          Lithent core library
        </li>
        <li>
          <strong class="text-gray-700 dark:text-gray-300">
            lithent/devHelper
          </strong>{' '}
          - Browser-side HMR runtime
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/jsx-manual"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/jsx-manual');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          JSX & Templates: Manual JSX Setup →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn how to manually configure JSX without using the Vite plugin.
          <br />
          Explore TypeScript and Babel setup as well.
        </p>
      </a>
    </div>
  </div>
);
