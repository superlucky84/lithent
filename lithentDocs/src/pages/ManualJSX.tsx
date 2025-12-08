import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const ManualJSX = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Manual JSX Setup
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Overview
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This guide explains how to configure JSX manually without using the Vite
      plugin.
      <br />
      <br />
      You can configure Lithent JSX in various environments such as TypeScript,
      Babel, and Vite (esbuild).
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 When do you need Manual Setup?</span>
        <br />
        <br />• Projects that do not use Vite
        <br />• Babel-based build systems (Create React App, Next.js, etc.)
        <br />• TypeScript-only build environments
        <br />• Custom build pipelines
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      JSX Transformation Modes
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      JSX is a syntax extension of JavaScript that browsers cannot understand
      directly. Therefore, build tools must transform JSX into standard
      JavaScript.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Classic Transform
    </h3>

    <CodeBlock
      language="tsx"
      code={`// JSX code
const element = <div className="box">Hello</div>;

// After transformation (Classic)
import { h } from 'lithent';
const element = h('div', { className: 'box' }, 'Hello');`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The Classic mode explicitly calls the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        h
      </code>{' '}
      function. This follows the same pattern as React.createElement.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Automatic Transform
    </h3>

    <CodeBlock
      language="tsx"
      code={`// JSX code
const element = <div className="box">Hello</div>;

// After transformation (Automatic)
import { jsx as _jsx } from 'lithent/jsx-runtime';
const element = _jsx('div', { className: 'box', children: 'Hello' });`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      The Automatic mode automatically imports the JSX runtime, so you no longer
      need to manually write{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        import &#123; h &#125;
      </code>{' '}
      at the top of every file.
    </p>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Recommendation:
        </span>{' '}
        If you are using TypeScript 4.1.1 or later, we strongly recommend{' '}
        <strong class="text-gray-700 dark:text-gray-300">
          Automatic Transform
        </strong>
        . It results in cleaner code and handles imports automatically.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      TypeScript Configuration
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Option 1: Automatic Transform (Recommended)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This automatic JSX transform mode is available starting from TypeScript
      4.1.1.
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

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Option
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsx: "react-jsx"
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Enables the new JSX transform and compiles JSX into calls to the{' '}
              <code>_jsx()</code> helper.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxImportSource
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Specifies which package to import the JSX runtime from. Lithent
              uses <code>lithent/jsx-runtime</code>.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      Advantages
    </h4>

    <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6">
      <li class="flex items-start">
        <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
        <div>
          No need to import <code>h</code> and <code>Fragment</code> in every
          file
        </div>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
        <div>Smaller bundle size (only required functions are imported)</div>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
        <div>Compatible with the modern React ecosystem</div>
      </li>
    </ul>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Option 2: Classic Transform
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This is the traditional JSX transform mode and is supported by all
      TypeScript versions.
    </p>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Option
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsx: "react"
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Enables the classic JSX transform, converting JSX into factory
              function calls.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxFactory
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              The function used to create JSX elements. Lithent uses{' '}
              <code>h</code>.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxFragmentFactory
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              The function used for React-style fragments{' '}
              <code>&lt;&gt;...&lt;/&gt;</code>. Lithent uses{' '}
              <code>Fragment</code>.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      Usage Example
    </h4>

    <CodeBlock
      language="tsx"
      code={`import { h, Fragment, mount } from 'lithent';

const App = mount((renew) => {
  return () => (
    <Fragment>
      <div>Hello</div>
      <div>World</div>
    </Fragment>
  );
});`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <strong>⚠️ Warning:</strong> When using the Classic Transform, you must
        explicitly add{' '}
        <code class="px-2 py-1 bg-yellow-700 dark:bg-yellow-600 rounded text-sm">
          import &#123; h, Fragment &#125;
        </code>{' '}
        in every file. Otherwise, you will encounter the{' '}
        <code class="px-2 py-1 bg-yellow-700 dark:bg-yellow-600 rounded text-sm">
          h is not defined
        </code>{' '}
        error.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Babel Configuration
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This section explains how to configure Lithent JSX in projects that use
      Babel.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Classic Transform
    </h3>

    <CodeBlock
      language="json"
      code={`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "h",
        "pragmaFrag": "Fragment"
      }
    ]
  ]
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Option
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                pragma
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              The function used to create JSX elements. Default is{' '}
              <code>React.createElement</code>. Lithent uses <code>h</code>.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                pragmaFrag
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Fragment component name. Default is <code>React.Fragment</code>,
              Lithent uses <code>Fragment</code>.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Automatic Transform
    </h3>

    <CodeBlock
      language="json"
      code={`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic",
        "importSource": "lithent"
      }
    ]
  ]
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Option
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                runtime: "automatic"
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Enables the new automatic JSX runtime.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                importSource
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Specifies the JSX runtime package. Automatically imports from{' '}
              <code>lithent/jsx-runtime</code>.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Vite Configuration (esbuild)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This section explains how to configure JSX using esbuild only, without the
      Vite plugin.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        Note:
      </strong>{' '}
      This method does not support HMR. If you need HMR support, use the{' '}
      <a
        href="/guide/vite-plugin"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/vite-plugin');
        }}
        class="text-[#42b883] hover:underline"
      >
        @lithent/lithent-vite
      </a>{' '}
      plugin instead.
    </p>

    <CodeBlock
      language="typescript"
      code={`import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Note:
        </span>{' '}
        esbuild currently does not support the Automatic Transform. Only the
        Classic Transform is available.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      TypeScript + Babel Combination
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This setup uses TypeScript for type checking only and Babel for the actual
      JSX transformation. This pattern is commonly used in frameworks like
      Next.js and Create React App.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      tsconfig.json
    </h3>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Option
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsx: "preserve"
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Keeps JSX syntax in the output so Babel can perform the actual JSX
              transform later.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                jsxFactory
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Used only for type checking so that TypeScript knows{' '}
              <code>h</code> is a valid JSX factory.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      .babelrc
    </h3>

    <CodeBlock
      language="json"
      code={`{
  "presets": [
    "@babel/env",
    ["@babel/typescript", { "jsxPragma": "h" }]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "h",
        "pragmaFrag": "Fragment"
      }
    ]
  ]
}`}
    />

    <div class="overflow-x-auto mb-6 mt-4">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Setting
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                @babel/typescript
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Handles TypeScript files. The <code>jsxPragma: "h"</code> option
              tells Babel which JSX factory function to use.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                @babel/plugin-transform-react-jsx
              </code>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Transforms JSX into JavaScript using the configured{' '}
              <code>pragma</code> and <code>pragmaFrag</code> settings.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Troubleshooting
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      "h is not defined" Error
    </h3>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <strong>Cause:</strong> The <code>h</code> function was not imported
        when using the Classic Transform.
      </p>
    </div>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Solution 1: Import h explicitly
    </h4>

    <CodeBlock
      language="tsx"
      code={`import { h, Fragment } from 'lithent';

const App = () => <div>Hello</div>;`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      Solution 2: Use Automatic Transform
    </h4>

    <CodeBlock
      language="json"
      code={`// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}

// You can now use JSX without manual imports
const App = () => <div>Hello</div>;`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      TypeScript Type Errors
    </h3>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <strong>Symptom:</strong> JSX elements are underlined in red with an
        error such as{' '}
        <code class="px-2 py-1 bg-yellow-700 dark:bg-yellow-600 rounded text-sm">
          JSX element implicitly has type 'any'
        </code>
        .
      </p>
    </div>

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Solution: Add JSX type definitions
    </h4>

    <CodeBlock
      language="typescript"
      code={`// Create src/jsx.d.ts
import 'lithent';

declare module 'lithent' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Alternatively, include Lithent&apos;s types in your{' '}
      <code>tsconfig.json</code>:
    </p>

    <CodeBlock
      language="json"
      code={`{
  "compilerOptions": {
    "types": ["lithent"]
  }
}`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Recommended Setup Summary
    </h2>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Modern TypeScript Projects
      </h3>
      <CodeBlock
        language="json"
        code={`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lithent"
  }
}`}
      />
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Vite Projects (HMR Required)
      </h3>
      <CodeBlock
        language="typescript"
        code={`import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [lithentVitePlugin()],
});`}
      />
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Babel-based Projects
      </h3>
      <CodeBlock
        language="json"
        code={`{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic",
        "importSource": "lithent"
      }
    ]
  ]
}`}
      />
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next Step
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/ftags"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/ftags');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          JSX & Templates: FTags →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about FTags, a functional API for building components without
          JSX.
          <br />
          You can use it immediately with no build tool configuration.
        </p>
      </a>
    </div>
  </div>
);
