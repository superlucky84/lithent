import { mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

// Depth 3: 이모지로 볼륨 표시
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

// Depth 2: 프로그레스 바로 볼륨 표시
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

// Depth 1: 숫자로 볼륨 표시
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
            볼륨 레벨
          </div>
        </div>
      </div>
      <div class="mt-4">
        <VolumeBar volume={volume} />
      </div>
    </Fragment>
  );
});

// Root: 볼륨 상태 관리
export const Example15Ko = mount(renew => {
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
          볼륨 컨트롤러
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Root에서 관리하는{' '}
          <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            volume
          </code>{' '}
          값이 3단계 중첩 컴포넌트에 전달되는 것을 확인하세요
        </p>
      </div>

      {/* 컨트롤 패널 */}
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
          Root 컴포넌트 (state 관리)
        </div>
      </div>

      {/* 중첩된 컴포넌트들 */}
      <div class="bg-white dark:bg-gray-900 rounded-lg p-6 border-2 border-gray-300 dark:border-gray-700">
        <VolumeDisplay volume={volume.v} />
      </div>

      {/* Props 전달 흐름 */}
      <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
          💡 Props 전달 흐름
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
          🎯 테스트 요점
        </h4>
        <ul class="text-xs text-green-700 dark:text-green-300 space-y-1">
          <li>
            • 슬라이더나 버튼으로 <strong>volume</strong>을 변경하세요
          </li>
          <li>
            • 3개의 컴포넌트가 모두 <strong>동시에 업데이트</strong>되는 것을
            확인하세요
          </li>
          <li>
            • 각 컴포넌트는 <strong>같은 값을 다른 방식</strong>으로 표현합니다
            (숫자 / 바 / 이모지)
          </li>
          <li>
            • Fragment를 사용하여 <strong>불필요한 DOM 래퍼 없이</strong>{' '}
            구성됩니다
          </li>
        </ul>
      </div>
    </div>
  );
});
