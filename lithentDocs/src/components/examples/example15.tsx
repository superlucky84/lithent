import { mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

// Depth 3: Display volume with emoji
const VolumeEmoji = mount<{ volume: number }>(() => ({ volume }) => {
  const getEmoji = (vol: number) => {
    if (vol === 0) return '🔇';
    if (vol < 30) return '🔈';
    if (vol < 70) return '🔉';
    return '🔊';
  };

  return (
    <div class="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
      <div class="text-6xl">{getEmoji(volume)}</div>
      <div class="text-xs font-semibold text-purple-700 dark:text-purple-300">
        Depth 3: VolumeEmoji
      </div>
    </div>
  );
});

// Depth 2: Display volume with progress bar
const VolumeBar = mount<{ volume: number }>(() => ({ volume }) => {
  return (
    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-semibold text-blue-700 dark:text-blue-300">
          Depth 2: VolumeBar
        </span>
        <span class="text-xs text-blue-600 dark:text-blue-400">{volume}%</span>
      </div>
      <div class="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-300"
          style={{ width: `${volume}%` }}
        />
      </div>
      <div class="mt-3">
        <VolumeEmoji volume={volume} />
      </div>
    </div>
  );
});

// Depth 1: Display volume with number
const VolumeDisplay = mount<{ volume: number }>(() => ({ volume }) => {
  return (
    <Fragment>
      <div class="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
        <div class="text-center mb-4">
          <div class="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
            Depth 1: VolumeDisplay
          </div>
          <div class="text-6xl font-bold text-green-600 dark:text-green-400">
            {volume}
          </div>
          <div class="text-sm text-green-600 dark:text-green-400 mt-1">
            Volume Level
          </div>
        </div>
      </div>
      <div class="mt-4">
        <VolumeBar volume={volume} />
      </div>
    </Fragment>
  );
});

// Root: Volume state management
export const Example15 = mount(renew => {
  const volume = state(50, renew);

  const increase = () => {
    if (volume.v < 100) volume.v += 10;
  };

  const decrease = () => {
    if (volume.v > 0) volume.v -= 10;
  };

  const setVolume = (e: Event) => {
    const target = e.target as HTMLInputElement;
    volume.v = Number(target.value);
  };

  return () => (
    <div class="w-full max-w-2xl mx-auto">
      <div class="mb-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="text-2xl">🔊</span>
          Volume Controller
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Verify that the{' '}
          <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            volume
          </code>{' '}
          value managed in Root is passed to 3 nested components
        </p>
      </div>

      {/* Control Panel */}
      <div class="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3 mb-3">
          <button
            onClick={decrease}
            class="w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={volume.v === 0}
          >
            −
          </button>
          <input
            type="range"
            min="1"
            max="100"
            value={volume.v}
            onInput={setVolume}
            class="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={increase}
            class="w-12 h-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={volume.v === 100}
          >
            +
          </button>
        </div>
        <div class="text-center text-xs text-gray-600 dark:text-gray-400">
          Root Component (state management)
        </div>
      </div>

      {/* Nested Components */}
      <div class="bg-white dark:bg-gray-900 rounded-lg p-6 border-2 border-gray-300 dark:border-gray-700">
        <VolumeDisplay volume={volume.v} />
      </div>

      {/* Props Flow */}
      <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
          💡 Props Flow
        </h4>
        <div class="text-xs font-mono text-blue-700 dark:text-blue-300 space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-bold">Root:</span>
            <code class="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded">
              volume = {volume.v}
            </code>
          </div>
          <div class="ml-4">↓ volume prop</div>
          <div class="ml-4 flex items-center gap-2">
            <span class="font-bold">VolumeDisplay (Depth 1):</span>
            <code class="px-2 py-0.5 bg-green-200 dark:bg-green-800 rounded">
              props.volume = {volume.v}
            </code>
          </div>
          <div class="ml-8">↓ volume prop</div>
          <div class="ml-8 flex items-center gap-2">
            <span class="font-bold">VolumeBar (Depth 2):</span>
            <code class="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded">
              props.volume = {volume.v}
            </code>
          </div>
          <div class="ml-12">↓ volume prop</div>
          <div class="ml-12 flex items-center gap-2">
            <span class="font-bold">VolumeEmoji (Depth 3):</span>
            <code class="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 rounded">
              props.volume = {volume.v}
            </code>
          </div>
        </div>
      </div>

      <div class="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <h4 class="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
          🎯 Key Points
        </h4>
        <ul class="text-xs text-green-700 dark:text-green-300 space-y-1">
          <li>
            • Change <strong>volume</strong> with the slider or buttons
          </li>
          <li>
            • Verify that all 3 components{' '}
            <strong>update simultaneously</strong>
          </li>
          <li>
            • Each component expresses the{' '}
            <strong>same value in different ways</strong> (number / bar / emoji)
          </li>
          <li>
            • Composed <strong>without unnecessary DOM wrappers</strong> using
            Fragment
          </li>
        </ul>
      </div>
    </div>
  );
});
