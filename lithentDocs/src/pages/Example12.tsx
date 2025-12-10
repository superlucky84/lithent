import { CodeBlock } from '@/components/CodeBlock';
import { Example12 } from '@/components/examples/example12';
import type { Introduction } from '@/pages/Introduction';

const ssrHtmlCode = `<!-- Initial HTML rendered on the server (real DOM) -->
<div id="feed">
  <article>📌 Pinned Post (real DOM)</article>
  <article>👤 Older Post (real DOM)</article>

  <!-- Above and below this point are real DOM nodes from the server -->
  <article id="sponsored-slot">📢 Sponsored (real DOM)</article>
  <article>📜 Archive (real DOM)</article>
</div>`;

const clientCode = `import { Fragment, render } from 'lithent';
import { state } from 'lithent/helper';

// Dynamic posts component (virtual DOM)
const DynamicPosts = mount(renew => {
  const visiblePosts = state([true, true, true], renew);

  const togglePost = (index: number) => {
    visiblePosts.v = visiblePosts.v.map((v, i) => (i === index ? !v : v));
  };

  return () => (
    <Fragment>
      <div>Controls...</div>
      {visiblePosts.v[0] && <article>Post 1 (virtual DOM)</article>}
      {visiblePosts.v[1] && <article>Post 2 (virtual DOM)</article>}
      {visiblePosts.v[2] && <article>Post 3 (virtual DOM)</article>}
    </Fragment>
  );
});

// Insert virtual DOM between existing real DOM nodes
const feedContainer = document.getElementById('feed');
const insertionPoint = document.getElementById('sponsored-slot');

if (feedContainer && insertionPoint) {
  render(<DynamicPosts />, feedContainer, insertionPoint as HTMLElement);
}`;

export const Example12Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mixed DOM Elements (Social Media Timeline)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      This example tests how Lithent behaves when real DOM nodes and virtual DOM
      nodes are mixed under the same parent.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      It{' '}
      <strong>
        simulates progressive enhancement and SSR (server-side rendering)
        scenarios
      </strong>
      . Static content rendered on the server (real DOM) co-exists with
      interactive content added on the client (virtual DOM).
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      In a social media timeline, pinned posts, ads, and archive posts are
      server-rendered real DOM, while the live posts between them are managed by
      Lithent as virtual DOM. Toggle the middle posts and verify that the real
      DOM remains unaffected.
    </p>

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
      1. Initial HTML from the server (real DOM)
    </h2>
    <CodeBlock language="html" code={ssrHtmlCode} />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-8 mb-3">
      2. Lithent code running on the client (virtual DOM)
    </h2>
    <CodeBlock language="typescript" code={clientCode} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example12 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        render() insertBefore mode
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Default mode</strong>:{' '}
          <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            render(&lt;Component /&gt;, parentElement)
          </code>{' '}
          – appends to the end of the parent element.
        </li>
        <li>
          <strong>insertBefore mode</strong>:{' '}
          <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            render(&lt;Component /&gt;, parentElement, nextElement)
          </code>{' '}
          – inserts just before <code>nextElement</code>.
        </li>
        <li>
          <strong>Using Fragment</strong>: group multiple nodes and insert them
          as a single unit.
        </li>
        <li>
          <strong>Preserving real DOM</strong>: existing real DOM nodes are not
          modified.
        </li>
        <li>
          <strong>Dynamic updates</strong>: only the virtual DOM portion is
          added/removed.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        DOM structure
      </h2>
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs overflow-x-auto">
        <pre class="text-gray-800 dark:text-gray-200">
          {`<div> (feedContainer)
  <!-- Real DOM: server-rendered -->
  <article>📌 Pinned Post (real DOM)</article>
  <article>👤 Previous User (real DOM)</article>

  <!-- Virtual DOM: Lithent inserts here -->
  <div>🔄 Control Panel (virtual DOM)</div>
  <article>👩‍💻 Sarah Chen (virtual DOM)</article>  <!-- toggleable -->
  <article>🧑‍🎨 Alex Rivera (virtual DOM)</article> <!-- toggleable -->
  <article>🧑‍🚀 Jordan Kim (virtual DOM)</article>   <!-- toggleable -->

  <!-- Real DOM: server-rendered (insertionPoint) -->
  <article>📢 Sponsored (real DOM)</article>
  <article>📜 Archive (real DOM)</article>
</div>`}
        </pre>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Key concepts
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Progressive enhancement</strong>: render base content on the
          server and layer interactivity on the client.
        </li>
        <li>
          <strong>Difference from hydration</strong>: hydration wires events
          onto existing DOM, while this example inserts new DOM between existing
          nodes.
        </li>
        <li>
          <strong>Using refs</strong>: use refs to grab real DOM nodes and pass
          them into <code>render()</code>.
        </li>
        <li>
          <strong>mountCallback</strong>: runs after the component mounts, when
          refs are populated.
        </li>
        <li>
          <strong>Independent updates</strong>: only the virtual DOM portion
          re-renders; real DOM remains unaffected.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Test scenarios
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          Toggle each post individually and confirm the middle virtual DOM posts
          appear/disappear.
        </li>
        <li>
          Hide and re-show posts and verify real DOM (Pinned, Sponsored,
          Archive) stays unchanged.
        </li>
        <li>
          Use “Hide all” to remove all virtual DOM and confirm the real DOM
          remains.
        </li>
        <li>
          Use “Show all” and confirm virtual DOM is reinserted in the correct
          position between real DOM nodes.
        </li>
        <li>
          Scroll the page and check that the control panel sticks to the top.
        </li>
        <li>Verify the fade-in animation runs when posts are added.</li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <h3 class="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
        🌟 Real-world use cases
      </h3>
      <p class="text-sm text-green-700 dark:text-green-300 mb-2">
        This pattern is very useful in real scenarios such as:
      </p>
      <ul class="text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
        <li>
          • <strong>Blog comments</strong>: mixing initial SSR comments with new
          comments added on the client.
        </li>
        <li>
          • <strong>E‑commerce</strong>: adding dynamic filter/sort UI atop a
          static product list.
        </li>
        <li>
          • <strong>News feeds</strong>: combining pinned stories with live
          updates.
        </li>
        <li>
          • <strong>Admin panels</strong>: adding inline edit UIs to a
          server-rendered table.
        </li>
      </ul>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎯 Why this matters
      </h3>
      <p class="text-sm text-purple-700 dark:text-purple-300 mb-2">
        Many virtual DOM libraries want to own an entire container. Lithent,
        however, supports the “progressive migration” scenarios that appear so
        often in real projects.
      </p>
      <p class="text-xs text-purple-600 dark:text-purple-400 italic">
        💡 When introducing Lithent into an existing server-rendered app, you
        don&apos;t need to rewrite everything. You can swap only the parts you
        need to virtual DOM, which is the essence of true progressive
        enhancement.
      </p>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
      <h3 class="text-base font-semibold text-orange-800 dark:text-orange-200 mb-2">
        ⚠️ Caveats
      </h3>
      <ul class="text-sm text-orange-700 dark:text-orange-300 space-y-1">
        <li>
          • When using insertBefore mode, <code>nextElement</code> must be a
          child of <code>parentElement</code>.
        </li>
        <li>
          • Mutating real DOM elements directly can desync Lithent&apos;s
          virtual DOM tracking.
        </li>
        <li>
          • Only use ref values after <code>mountCallback</code> has run.
        </li>
        <li>
          • Calling <code>render()</code> multiple times at the same location
          replaces the previous virtual DOM.
        </li>
      </ul>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Related docs
      </h2>
      <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2 mb-6">
        <li>
          <a
            href="/guide/render"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/render');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Render guide
          </a>{' '}
          - Documents the <code>render(wDom, wrapElement, afterElement)</code>{' '}
          signature and insertBefore mode in detail.
        </li>
        <li>
          <a
            href="/examples/13"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/examples/13');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Example 13: Mixed DOM + Loop
          </a>{' '}
          - An extended example that applies the same pattern to a key-based
          list.
        </li>
      </ul>
    </div>
  </div>
);
