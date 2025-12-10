import { CodeBlock } from '@/components/CodeBlock';
import { Example6 } from '@/components/examples/example6';
import type { Introduction } from '@/pages/Introduction';
import { navigateTo } from '@/store';

const example6Code = `import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface Song {
  id: number;
  title: string;
  artist: string;
  plays: number;
}

const Playlist = mount(r => {
  const songs = state<Song[]>([
    { id: 1, title: 'Summer Vibes', artist: 'The Waves', plays: 0 },
    { id: 2, title: 'Electric Dreams', artist: 'Neon Knights', plays: 0 },
    { id: 3, title: 'Midnight Jazz', artist: 'Smooth Trio', plays: 0 },
  ], r);

  const playSong = (id: number) => {
    songs.v = songs.v.map(s =>
      s.id === id ? { ...s, plays: s.plays + 1 } : s
    );
  };

  const shufflePlaylist = () => {
    const shuffled = [...songs.v];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    songs.v = shuffled;
  };

  const sortByPlays = () => {
    songs.v = [...songs.v].sort((a, b) => b.plays - a.plays);
  };

  return () => (
    <>
      <button onClick={shufflePlaylist}>🔀 Shuffle</button>
      <button onClick={sortByPlays}>📊 Sort by Plays</button>

      {songs.v.map(song => (
        <div key={song.id}>
          <h4>{song.title} by {song.artist}</h4>
          <p>Plays: {song.plays}</p>
          <button onClick={() => playSong(song.id)}>▶ Play</button>
        </div>
      ))}
    </>
  );
});
`;

export const Example6Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Key-based List Updates (Playlist Manager)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      This playlist example uses the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        key
      </code>{' '}
      prop to uniquely identify each item when rendering lists.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      It is designed to{' '}
      <strong>
        test how Lithent&apos;s virtual DOM tracks list items by key and updates
        the DOM efficiently when order changes or items are added/removed
      </strong>
      .
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Try increasing the play count for a few songs, then run Shuffle or Sort.
      You&apos;ll see that each song&apos;s ID and internal state stay attached
      to the correct item thanks to its key.
    </p>

    <CodeBlock language="typescript" code={example6Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example6 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Why keys matter
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Element identity</strong>: keys let Lithent uniquely identify
          each item in the list.
        </li>
        <li>
          <strong>Efficient updates</strong>: when order changes, DOM nodes are
          reused instead of recreated.
        </li>
        <li>
          <strong>State preservation</strong>: internal state (like the plays
          counter) stays attached even if the item moves.
        </li>
        <li>
          <strong>Accurate diffs</strong>: the diff can precisely detect which
          items were added/removed/moved based on keys.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Test scenarios
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>Increase the plays counter for several songs.</li>
        <li>Click 🔀 Shuffle to randomize the order.</li>
        <li>
          Confirm that each song&apos;s ID and plays counter stay with the right
          row.
        </li>
        <li>Use 📊 Sort by Plays and verify that state is still preserved.</li>
        <li>
          Use ➕ Add Song to add new tracks and ✕ to remove them and watch keys
          keep everything stable.
        </li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <h3 class="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        ⚠️ What if there are no keys?
      </h3>
      <p class="text-sm text-yellow-700 dark:text-yellow-300">
        Without keys, Lithent matches list items by index. When the order
        changes, data can end up on the wrong DOM nodes, causing plays counters
        to jump between songs and triggering unnecessary DOM recreation.
      </p>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Related docs
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <a
            href="/guide/updater"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/updater');
            }}
          >
            Updater guide
          </a>{' '}
          - Explains how the Updater performs diffs and minimizes DOM changes
          when lists are re-ordered.
        </li>
        <li>
          <a
            href="/guide/state"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/state');
            }}
          >
            State guide
          </a>{' '}
          - Reviews immutable update patterns (like creating new arrays) for
          list state.
        </li>
      </ul>
    </div>
  </div>
);
