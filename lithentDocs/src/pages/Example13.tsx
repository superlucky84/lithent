import { CodeBlock } from '@/components/CodeBlock';
import { Example13 } from '@/components/examples/example13';
import type { Introduction } from '@/pages/Introduction';
import { navigateTo } from '@/store';

const ssrHtmlCode = `<!-- Initial HTML rendered on the server (real DOM) -->
<div id="waitlist">
  <div>ℹ️ Welcome to Lithent Restaurant (real DOM)</div>

  <!-- Above and below this point are real DOM nodes rendered by the server -->
  <div id="offer-slot">🎁 Special Offer! (real DOM)</div>
  <div>📞 Contact Info (real DOM)</div>
</div>`;

const clientCode = `import { Fragment, render } from 'lithent';
import { state } from 'lithent/helper';

interface Guest {
  id: number;
  name: string;
  partySize: number;
  waitTime: number;
  vip: boolean;
}

// Dynamic waitlist component (virtual DOM)
const WaitlistManager = mount(renew => {
  const guests = state<Guest[]>([...initialGuests], renew);

  const sortByWaitTime = () => {
    guests.v = [...guests.v].sort((a, b) => a.waitTime - b.waitTime);
  };

  const reverseOrder = () => {
    guests.v = [...guests.v].reverse();
  };

  const callGuest = (id: number) => {
    guests.v = guests.v.filter(g => g.id !== id);
  };

  return () => (
    <Fragment>
      <div>
        <button onClick={sortByWaitTime}>By Wait Time</button>
        <button onClick={reverseOrder}>Reverse</button>
      </div>

      {guests.v.map((guest, index) => (
        <div key={guest.id}>
          #{index + 1} {guest.name}
          <button onClick={() => callGuest(guest.id)}>Call</button>
        </div>
      ))}
    </Fragment>
  );
});

// Insert virtual DOM list between existing real DOM nodes
const container = document.getElementById('waitlist');
const insertionPoint = document.getElementById('offer-slot');

if (container && insertionPoint) {
  render(<WaitlistManager />, container, insertionPoint as HTMLElement);
}`;

export const Example13Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mixed DOM with Loop (Restaurant Waitlist)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      This example verifies that Lithent can correctly handle{' '}
      <strong>looped (list) nodes</strong> when real DOM and virtual DOM are
      mixed under the same parent.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      It extends Example 12 and{' '}
      <strong>
        checks how Lithent&apos;s diff algorithm behaves when a key-based list
        is sorted, added to, or removed between existing real DOM nodes
      </strong>
      .
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Imagine a restaurant waitlist where you sort guests by wait time, party
      size, or VIP priority, or even reverse the order. This example helps you
      confirm that Lithent efficiently reorders DOM elements based on keys while
      keeping the surrounding real DOM untouched.
    </p>

    <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-3">
      1. Initial HTML from the server (real DOM)
    </h2>
    <CodeBlock language="html" code={ssrHtmlCode} />

    <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
      2. Lithent code running on the client (virtual DOM)
    </h2>
    <CodeBlock language="typescript" code={clientCode} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example13 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Key test points
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Key-based diff</strong>: when the list is sorted, existing DOM
          nodes are reused based on their keys.
        </li>
        <li>
          <strong>Efficient reordering</strong>: positions change without
          re-rendering the entire list.
        </li>
        <li>
          <strong>Mixed DOM preservation</strong>: surrounding real DOM
          (Welcome, Special Offer, Footer) stays intact while the list updates.
        </li>
        <li>
          <strong>Dynamic add/remove</strong>: new guests are inserted and
          removed guests are deleted at the correct positions.
        </li>
        <li>
          <strong>Fragment grouping</strong>: the control panel and list are
          wrapped in a Fragment and inserted as a single block between real DOM
          nodes.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        DOM structure
      </h2>
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs overflow-x-auto">
        <pre class="text-gray-800 dark:text-gray-200">
          {`<div> (containerRef)
  <!-- Real DOM: top notice -->
  <div>ℹ️ Welcome to Lithent Restaurant (real DOM)</div>

  <!-- Virtual DOM: list grouped with Fragment -->
  <div>🎛️ Waitlist Controls (virtual DOM)</div>
  <div key={1}>#1 Kim Family (virtual DOM)</div>      <!-- sortable -->
  <div key={2}>#2 Sarah & Alex (virtual DOM)</div>    <!-- sortable -->
  <div key={3}>#3 Chen Party (virtual DOM)</div>      <!-- sortable -->
  <div key={4}>#4 Jordan (virtual DOM)</div>          <!-- sortable -->

  <!-- Real DOM: bottom ad & footer (insertionPointRef) -->
  <div>🎁 Special Offer! (real DOM)</div>
  <div>📞 Contact Info (real DOM)</div>
</div>`}
        </pre>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Test scenarios
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          Click &quot;By Wait Time&quot; and check that guests are sorted by
          wait time.
        </li>
        <li>
          Click &quot;Reverse&quot; multiple times and verify that the order
          flips back and forth.
        </li>
        <li>
          Click &quot;VIP First&quot; and ensure VIP guests (e.g. Sarah & Alex)
          move to the front.
        </li>
        <li>
          While sorting, make sure the top Welcome section and bottom Special
          Offer/Contact stay unchanged.
        </li>
        <li>
          Click &quot;Call&quot; to remove a guest and check that the remaining
          positions (#1, #2, ...) update correctly.
        </li>
        <li>
          Click &quot;Add Guest&quot; to append a new random guest to the end of
          the list.
        </li>
        <li>
          Call every guest and confirm that the &quot;No guests waiting!&quot;
          message appears.
        </li>
        <li>
          Watch the ID badges while sorting to confirm that the same guest (same
          ID) is simply moving, not being recreated.
        </li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
      <h3 class="text-base font-semibold text-orange-800 dark:text-orange-200 mb-2">
        🍽️ Why a restaurant waitlist?
      </h3>
      <p class="text-sm text-orange-700 dark:text-orange-300 mb-2">
        A real-world restaurant waitlist has requirements like:
      </p>
      <ul class="text-sm text-orange-700 dark:text-orange-300 space-y-1 ml-4">
        <li>• Sorting by wait time, party size, and VIP status.</li>
        <li>
          • Removing guests from the list in real time when they are called.
        </li>
        <li>• Adding new guests immediately to the list.</li>
        <li>
          • Keeping each guest&apos;s info (ID, name, etc.) stable even as the
          order changes.
        </li>
      </ul>
      <p class="text-xs text-orange-600 dark:text-orange-400 italic mt-2">
        💡 Without key-based diff, such complex list operations would require
        fully re-rendering the list each time. Lithent tracks &quot;the same
        guest&quot; via keys and only moves nodes to optimize performance.
      </p>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎯 Example 12 vs Example 13
      </h3>
      <div class="text-sm text-purple-700 dark:text-purple-300 space-y-2">
        <div>
          <strong>Example 12 (Mixed DOM)</strong>: basic mixing of real and
          virtual DOM with a fixed number of posts that can be toggled
          (shown/hidden).
        </div>
        <div>
          <strong>Example 13 (Mixed DOM + Loop)</strong>: builds on top of the
          mixed DOM pattern and{' '}
          <strong className="text-purple-900 dark:text-purple-100">
            tests key-based list sorting, reordering, and dynamic add/remove
          </strong>
          .
        </div>
        <div class="text-xs text-purple-600 dark:text-purple-400 italic">
          💡 If Example 12 is &quot;static mixing&quot;, Example 13 is
          &quot;dynamic list mixing&quot;. Real apps typically use both patterns
          together.
        </div>
      </div>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <h3 class="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
        🌟 Real-world use cases
      </h3>
      <ul class="text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
        <li>
          • <strong>TODO lists</strong>: sort by completion status or priority.
        </li>
        <li>
          • <strong>Dashboard tables</strong>: sorting, filtering, and
          pagination.
        </li>
        <li>
          • <strong>Chat messages</strong>: append new messages while older ones
          may be server-rendered.
        </li>
        <li>
          • <strong>Shopping carts</strong>: add/remove items, change quantity,
          sort by price.
        </li>
        <li>
          • <strong>Ticketing systems</strong>: sort by priority or status.
        </li>
      </ul>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <h3 class="text-base font-semibold text-blue-800 dark:text-blue-200 mb-2">
        ⚡ Performance tips
      </h3>
      <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
        <li>
          • <strong>Use keys</strong>: give each guest a stable ID key so
          Lithent can reuse DOM nodes.
        </li>
        <li>
          • <strong>Keep immutability</strong>:{' '}
          <code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">
            [...guests.v].sort()
          </code>{' '}
          to create a new array when sorting.
        </li>
        <li>
          • <strong>Selective updates</strong>: during sorting, only DOM
          positions change; content is not re-rendered.
        </li>
        <li>
          • <strong>Use Fragment</strong>: group multiple nodes under one
          insertion point for clean mixed DOM handling.
        </li>
      </ul>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Related docs
      </h2>
      <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/examples/12"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/examples/12');
            }}
          >
            Example 12: Mixed DOM Elements
          </a>{' '}
          - the foundational example that first introduces the mixed DOM pattern
          with static post toggling.
        </li>
        <li>
          <a
            href="/guide/render"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/render');
            }}
          >
            Render guide
          </a>{' '}
          - explains how <code>render</code> works, including{' '}
          <code>insertBefore</code> mode and the <code>destroy</code> function
          for mixed DOM scenarios.
        </li>
      </ul>
    </div>
  </div>
);
