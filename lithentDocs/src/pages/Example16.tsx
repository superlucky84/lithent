import { mount } from 'lithent';
import { Example16 } from '@/components/examples/example16';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

const ssrHtmlCode = `<!-- Initial HTML rendered from server (Real DOM) -->
<div id="music-library">
  <!-- Top: Real DOM -->
  <div>🔔 System Sounds (Real DOM)</div>

  <!-- Middle: Virtual DOM playlist will be inserted between here -->

  <!-- Bottom: Real DOM (insertion point) -->
  <div id="downloaded-music">💾 Downloaded Music (Real DOM)</div>
</div>`;

const clientCode = `import { Fragment, render } from 'lithent';
import { state } from 'lithent/helper';

interface Song {
  id: number;
  emoji: string;
  title: string;
  artist: string;
}

// Dynamic Playlist Component (Virtual DOM)
const DynamicPlaylist = mount<{ songs: Song[] }>((renew, { songs }) => {
  const currentIndex = state(0, renew);

  const playNext = () => {
    if (currentIndex.v < songs.length - 1) currentIndex.v += 1;
  };

  const playPrev = () => {
    if (currentIndex.v > 0) currentIndex.v -= 1;
  };

  return () => (
    <Fragment>
      <div>Current Playlist (Virtual DOM)</div>
      <button onClick={playPrev} disabled={currentIndex.v === 0}>
        ⏮ Prev
      </button>
      <button
        onClick={playNext}
        disabled={currentIndex.v === songs.length - 1}
      >
        Next ⏭
      </button>

      {songs.map((song, idx) => (
        <div key={song.id}>
          #{idx + 1} {song.emoji} {song.title} – {song.artist}
        </div>
      ))}
    </Fragment>
  );
});

// Insert virtual DOM (loop) between existing real DOM elements and remove with destroy
const playlist: Song[] = [
  { id: 1, emoji: '🎸', title: 'Rock Anthem', artist: 'The Rockers' },
  { id: 2, emoji: '🎹', title: 'Jazz Night', artist: 'Smooth Jazz Band' },
  { id: 3, emoji: '🎤', title: 'Pop Star', artist: 'Chart Toppers' },
  { id: 4, emoji: '🎻', title: 'Classical Suite', artist: 'Symphony Orchestra' },
];

const container = document.getElementById('music-library');
const insertionPoint = document.getElementById('downloaded-music');

let destroyPlaylist: (() => void) | null = null;

if (container && insertionPoint) {
  destroyPlaylist = render(
    <DynamicPlaylist songs={playlist} />,
    container,
    insertionPoint as HTMLElement
  );
}

// If needed later, call destroyPlaylist?.() to remove only the virtual DOM`;

export const Example16Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        insertBefore + Loop + Destroy (Music Library Manager)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        This example tests whether a virtual DOM (including loops) can be
        inserted between real DOM elements and removed using the destroy
        function. Through the Music Library Manager, you can verify insertBefore
        mode, keyed list rendering, and the destroy functionality all at once.
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Key Test Points
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>insertBefore + Loop + Destroy</strong>: Using the third
          argument of the render() function, you can insert a virtual DOM
          between real DOM elements and selectively remove only the virtual DOM
          using the returned destroy function. This example demonstrates how
          loop rendering (using keys) and destroy functionality work together.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Component Structure
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        This example is structured in the following order:
      </p>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Title and description</strong>: Example title and brief
          explanation
        </li>
        <li>
          <strong>Control Panel</strong>: Clear Playlist/Restore Playlist
          buttons and status display (located outside playlistContainer)
        </li>
        <li>
          <strong>Music Library Container (playlistContainer)</strong>:
          <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
            <li>
              <strong>System Sounds (Real DOM - Top)</strong>: Content that is
              server-rendered or statically exists
            </li>
            <li>
              <strong>Current Playlist (Virtual DOM - Middle)</strong>: Dynamic
              playlist inserted by render() in mountCallback (4 songs, using
              keys)
            </li>
            <li>
              <strong>
                Downloaded Music (Real DOM - Bottom, insertionPoint)
              </strong>
              : Reference point where virtual DOM is inserted before this
              element
            </li>
          </ul>
        </li>
        <li>
          <strong>DOM Structure</strong>: Diagram showing DOM state in real-time
        </li>
        <li>
          <strong>Key Test Points</strong>: Explanation of core concepts in the
          example
        </li>
      </ol>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Code Example
      </h2>

      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        1. Initial HTML from server (Real DOM)
      </h3>
      <CodeBlock language="html" code={ssrHtmlCode} />

      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
        2. Lithent code executed on client (Virtual DOM)
      </h3>
      <CodeBlock language="tsx" code={clientCode} />

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        insertBefore Mode of render() Function
      </h2>

      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <pre class="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre">
          {`const destroyFn = render(
  <Component />,
  parentElement,      // Parent element
  beforeElement       // Insert before this element (insertBefore)
);

// Remove virtual DOM later
destroyFn();`}
        </pre>
      </div>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        Three ways to use the render() function:
      </p>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
        <li>
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
            render(&lt;C /&gt;, parent)
          </code>{' '}
          - Append to the end of parent
        </li>
        <li>
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
            render(&lt;C /&gt;, parent, next)
          </code>{' '}
          - Insert before next element
        </li>
        <li>
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
            const destroy = render(...)
          </code>{' '}
          - Can remove later with destroy function
        </li>
      </ol>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 Key Concepts
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>insertBefore mode:</strong> You can precisely specify the
            insertion position using the third argument of the render()
            function.
          </li>
          <li>
            <strong>Loop with keys:</strong> When rendering with map(),
            specifying keys allows Lithent to efficiently track elements.
          </li>
          <li>
            <strong>destroy function:</strong> Calling the function returned by
            render() removes only the virtual DOM without affecting real DOM.
          </li>
          <li>
            <strong>Re-rendering:</strong> Even after destroy, you can call
            render() again at the same location.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Live Example
      </h2>

      <div class="my-8">
        <Example16 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Test Scenarios
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          1️⃣ Playlist Navigation
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Change currently playing song with Prev/Next buttons</li>
          <li>
            Verify that the currently playing song is visually emphasized
            (scale-105, color change)
          </li>
          <li>
            Verify that Prev button is disabled on first song and Next button is
            disabled on last song
          </li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          2️⃣ Destroy Function Test
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Click "Clear Playlist" button</li>
          <li>
            Verify that only the playlist (virtual DOM) disappears while System
            Sounds and Downloaded Music (real DOM) remain
          </li>
          <li>Verify that Status changes to "✗ Destroyed"</li>
          <li>
            Verify that "(destroyed)" indicator appears in DOM Structure section
          </li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          3️⃣ Re-rendering Test
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>Click "Restore Playlist" button</li>
          <li>
            Verify that playlist reappears at exactly the same location (between
            real DOM)
          </li>
          <li>Verify that Status changes to "✓ Active"</li>
          <li>Verify that Prev/Next buttons work again (state is reset)</li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          🌟 Practical Use Cases
        </h3>
        <p class="text-sm text-green-700 dark:text-green-300 mb-2">
          This pattern is very useful in the following real-world scenarios:
        </p>
        <ul class="text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
          <li>
            • <strong>Filterable Lists</strong>: Dynamically filtered item lists
            between fixed header/footer
          </li>
          <li>
            • <strong>Modal/Overlay</strong>: Inserting and removing dynamic
            content at specific page locations
          </li>
          <li>
            • <strong>Progressive Enhancement</strong>: Adding client-side
            interactive elements to server-rendered pages
          </li>
          <li>
            • <strong>Widget System</strong>: Inserting/removing dynamic widgets
            at specific locations in existing pages
          </li>
          <li>
            • <strong>A/B Testing</strong>: Dynamically replacing only specific
            sections of a page
          </li>
        </ul>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ Cautions
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            <strong>Verify insertBefore element:</strong> The third argument
            (beforeElement) must be a child of the second argument
            (parentElement).
          </li>
          <li>
            <strong>ref timing:</strong> ref values are only available after
            mountCallback().
          </li>
          <li>
            <strong>Store destroy function:</strong> If you don't store the
            destroy function in a variable, you won't be able to remove it
            later.
          </li>
          <li>
            <strong>Use keys:</strong> Using keys in loop rendering allows
            Lithent to efficiently track and update elements.
          </li>
          <li>
            <strong>Don't modify real DOM:</strong> Directly modifying real DOM
            elements can break Lithent's virtual DOM tracking.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Related Examples
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
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
          - Mixing real DOM and virtual DOM
        </li>
        <li>
          <a
            href="/examples/13"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/examples/13');
            }}
          >
            Example 13: Mixed DOM + Loop
          </a>{' '}
          - Mixing real DOM and virtual DOM (loop)
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
            Render Guide
          </a>{' '}
          - How to use render() function
        </li>
        <li>
          <a
            href="/guide/mount-hooks"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/mount-hooks');
            }}
          >
            Mount Hooks Guide
          </a>{' '}
          - How to use mountCallback
        </li>
      </ul>
    </div>
  );
});
