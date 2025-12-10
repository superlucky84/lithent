import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const QuickStart = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Quick start
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Creating a Lithent application
    </h2>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
        📋 Prerequisites
      </p>
      <ul class="space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <svg
            class="w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Basic command line experience</span>
        </li>
        <li class="flex items-start">
          <svg
            class="w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong class="font-medium text-gray-900 dark:text-white">
              Node.js 18.12
            </strong>{' '}
            or higher installed
          </span>
        </li>
      </ul>
    </div>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This section walks through creating a Lithent application on your local
      machine. The generated project uses a Vite-based build setup.
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Make sure you are running a recent Node.js version and that your current
      working directory is where you want the project folder to live. Then run
      the following command in your terminal (do not type the leading{' '}
      <code>$</code>):
    </p>

    <CodeBlock language="bash" code={`$ npx create-lithent@latest`} />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This command installs and runs <code>create-lithent</code>, the official
      Lithent scaffolding tool.
      <br />
      <br />
      It will prompt you for a project name and template type:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <p class="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
        📦 Template types
      </p>
      <ul class="space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <svg
            class="w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <strong class="font-medium text-gray-900 dark:text-white">
              SSR (Express)
            </strong>
            : Express-based template with server-side rendering support. Great
            when SEO matters or you want to optimize perceived first-load
            performance.
          </div>
        </li>
        <li class="flex items-start">
          <svg
            class="w-4 h-4 text-[#42b883] mr-2.5 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <strong class="font-medium text-gray-900 dark:text-white">
              SPA (Vite)
            </strong>
            : Vite-based template for pure client-side rendering. Ideal for fast
            DX and simple deployments.
          </div>
        </li>
      </ul>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Once the project is scaffolded, follow the prompts to install dependencies
      and start the dev server:
    </p>

    <CodeBlock
      language="bash"
      code={`$ cd <your-project-name>
$ npm install
$ npm run dev`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Your first Lithent project should now be running.
      <br />
      Lithent supports multiple template styles, but the default starter uses
      JSX.
      <br />
      <br />
      When you are ready to ship to production, run:
    </p>

    <CodeBlock language="bash" code={`$ npm run build`} />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This creates a production build under <code>./dist</code>.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Using Lithent from a CDN
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      You can load Lithent directly from a CDN via a script tag:
    </p>
    <CodeBlock
      language="bash"
      code={`<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      When using Lithent from a CDN you do not need a build step. This makes
      setup much simpler and works well for enhancing static HTML or integrating
      into an existing backend framework.
      <br />
      <br />
      JSX is not available in this setup. Instead, you can use{' '}
      <code>ftags</code> to build templates in a functional style or wire it up
      with <code>htm</code>.
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      Here is an example using <code>ftags</code>.
    </p>

    <CodeBlock
      language="html"
      code={`<!DOCTYPE html>
<html>
<head>
  <title>Lithent Counter Example</title>
</head>
<body>
  <div id="root"></div>

  <script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.umd.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js"></script>

  <script>
    const { render } = lithent;
    const { lstate } = lithentHelper;
    const { fTags, flMount } = lithentFTags;
    const { div, h1, button } = fTags;

    const Counter = flMount(() => {
      const count = lstate(0);

      const increment = () => {
        count.value++;
      };

      return () =>
        div(
          h1('Count: ' + count.value),
          button({ onClick: increment }, 'Increment')
        );
    });

    render(Counter(), document.getElementById('root'));
  </script>
</body>
</html>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      This example uses <code>flMount</code>, but you can also use
      <code>fMount</code>.
      <br />
      <br />
      With <code>fMount</code>, helpers like <code>lstate</code> are no longer
      required, so you can skip loading the helper bundle and reduce network
      overhead.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      When loading Lithent directly in the browser, <code>ftags</code> can be
      very handy.
      <br />
      <br />
      Alternatively, you can use <code>htm</code> instead of ftags. That
      approach is covered in more detail in a separate section.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Using the ES module build
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      You can also use the ES module build of Lithent. Most modern browsers
      natively support ES modules, so you can load Lithent directly as a module
      from a CDN.
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      The example below uses an <strong>Import Map</strong> to define clean
      module specifiers like <code>'lithent'</code> instead of full CDN URLs.
      Import Maps are a web standard supported by all modern browsers that let
      you control how module specifiers are resolved. This approach makes it
      easy to switch between different CDNs (jsdelivr, unpkg, esm.sh) or even
      use locally hosted files—just update the Import Map.
    </p>
    <CodeBlock
      language="html"
      code={`<!DOCTYPE html>
<html>
<head>
  <title>Lithent Counter Example (ES Module)</title>
</head>
<body>
  <div id="root"></div>

  <script type="importmap">
  {
    "imports": {
      "lithent": "https://cdn.jsdelivr.net/npm/lithent/dist/lithent.mjs",
      "lithent/helper": "https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.mjs",
      "lithent/ftags": "https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.mjs"
    }
  }
  </script>

  <script type="module">
    import { render } from 'lithent';
    import { lstate } from 'lithent/helper';
    import { fTags, flMount } from 'lithent/ftags';

    const { div, h1, button } = fTags;

    const Counter = flMount(() => {
      const count = lstate(0);

      const increment = () => {
        count.value++;
      };

      return () =>
        div(
          h1('Count: ' + count.value),
          button({ onClick: increment }, 'Increment')
        );
    });

    render(Counter(), document.getElementById('root'));
  </script>
</body>
</html>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      For security reasons, ES modules only run over the <code>http://</code> or
      <code>https://</code> protocols—the ones browsers use when loading pages
      from the web. To use ES modules locally, you should serve files through a
      local HTTP server instead of opening them directly with the
      <code>file://</code> protocol.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mt-10 mb-4">
      Available CDN URLs
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
      All Lithent packages are available via jsdelivr CDN. You can choose
      between UMD (for script tags) or ESM (for module imports):
    </p>

    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          UMD Build (script tag)
        </h4>
        <ul class="space-y-2.5 text-xs">
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">Core</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">Helper</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.umd.js
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">FTags</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">HTM Tags</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/tag/dist/lithentTag.umd.js
            </code>
          </li>
        </ul>
      </div>

      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          ESM Build (ES module)
        </h4>
        <ul class="space-y-2.5 text-xs">
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">Core</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/dist/lithent.mjs
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">Helper</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.mjs
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">FTags</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.mjs
            </code>
          </li>
          <li>
            <div class="text-gray-600 dark:text-gray-400 mb-1">HTM Tags</div>
            <code class="block bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-[11px] break-all">
              https://cdn.jsdelivr.net/npm/lithent/tag/dist/lithentTag.mjs
            </code>
          </li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      What’s next
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/mounter"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/mounter');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core feature: Mounter →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Learn about Mounter, one of the core concepts in Lithent.
          <br />
          You will see how to create and initialize components step by step.
        </p>
      </a>
    </div>
  </div>
);
