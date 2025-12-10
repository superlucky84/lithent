import { mount, Fragment, render, ref, mountCallback } from 'lithent';
import { state } from 'lithent/helper';

// 플레이리스트 아이템 타입
interface Song {
  id: number;
  emoji: string;
  title: string;
  artist: string;
}

// 동적 플레이리스트 컴포넌트 (가상 DOM)
const DynamicPlaylist = mount<{ songs: Song[] }>((renew, { songs }) => {
  const currentIndex = state(0, renew);

  const playNext = () => {
    if (currentIndex.v < songs.length - 1) {
      currentIndex.v += 1;
    }
  };

  const playPrev = () => {
    if (currentIndex.v > 0) {
      currentIndex.v -= 1;
    }
  };

  return () => (
    <Fragment>
      {/* 플레이어 컨트롤 */}
      <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 mb-2">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-semibold text-purple-700 dark:text-purple-300">
            🎵 Current Playlist (가상 DOM)
          </span>
          <span class="text-xs text-purple-600 dark:text-purple-400">
            {currentIndex.v + 1} / {songs.length}
          </span>
        </div>
        <div class="flex gap-2">
          <button
            onClick={playPrev}
            disabled={currentIndex.v === 0}
            class="px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors text-sm"
          >
            ⏮ Prev
          </button>
          <button
            onClick={playNext}
            disabled={currentIndex.v === songs.length - 1}
            class="px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors text-sm"
          >
            Next ⏭
          </button>
        </div>
      </div>

      {/* 플레이리스트 아이템들 (Loop with keys) */}
      {songs.map((song, idx) => (
        <div
          key={song.id}
          class={`p-3 rounded-lg border transition-all ${
            idx === currentIndex.v
              ? 'bg-purple-100 dark:bg-purple-800/30 border-purple-400 dark:border-purple-500 scale-105'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
          }`}
        >
          <div class="flex items-center gap-3">
            <div class="text-3xl">{song.emoji}</div>
            <div class="flex-1">
              <div class="text-sm font-semibold text-gray-900 dark:text-white">
                {song.title}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {song.artist}
              </div>
            </div>
            {idx === currentIndex.v && (
              <div class="text-purple-500 animate-pulse">▶</div>
            )}
          </div>
        </div>
      ))}
    </Fragment>
  );
});

// 메인 컴포넌트
export const Example16Ko = mount(renew => {
  const playlistContainer = ref<null | HTMLElement>(null);
  const insertionPoint = ref<null | HTMLElement>(null);
  const isPlaylistActive = state(true, renew);

  let destroyPlaylist: (() => void) | null = null;

  const playlist: Song[] = [
    { id: 1, emoji: '🎸', title: 'Rock Anthem', artist: 'The Rockers' },
    { id: 2, emoji: '🎹', title: 'Jazz Night', artist: 'Smooth Jazz Band' },
    { id: 3, emoji: '🎤', title: 'Pop Star', artist: 'Chart Toppers' },
    {
      id: 4,
      emoji: '🎻',
      title: 'Classical Suite',
      artist: 'Symphony Orchestra',
    },
  ];

  mountCallback(() => {
    if (playlistContainer.value && insertionPoint.value) {
      destroyPlaylist = render(
        <DynamicPlaylist songs={playlist} />,
        playlistContainer.value,
        insertionPoint.value
      );
    }
  });

  const clearPlaylist = () => {
    if (destroyPlaylist) {
      destroyPlaylist();
      isPlaylistActive.v = false;
    }
  };

  const restorePlaylist = () => {
    if (playlistContainer.value && insertionPoint.value) {
      destroyPlaylist = render(
        <DynamicPlaylist songs={playlist} />,
        playlistContainer.value,
        insertionPoint.value
      );
      isPlaylistActive.v = true;
    }
  };

  return () => (
    <div class="w-full max-w-2xl mx-auto">
      <div class="mb-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="text-2xl">🎵</span>
          Music Library Manager
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          실제 DOM 요소 사이에 가상 DOM(loop)이 삽입되고, destroy 함수로
          제거되는 것을 확인하세요
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div class="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div class="flex gap-2">
          <button
            onClick={clearPlaylist}
            disabled={!isPlaylistActive.v}
            class="px-4 py-2 rounded bg-red-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-600 transition-colors text-sm font-semibold"
          >
            🗑️ Clear Playlist (destroy)
          </button>
          <button
            onClick={restorePlaylist}
            disabled={isPlaylistActive.v}
            class="px-4 py-2 rounded bg-green-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-600 transition-colors text-sm font-semibold"
          >
            ↻ Restore Playlist (render)
          </button>
        </div>
        <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
          Status:{' '}
          <span
            class={
              isPlaylistActive.v
                ? 'text-green-600 dark:text-green-400 font-semibold'
                : 'text-red-600 dark:text-red-400 font-semibold'
            }
          >
            {isPlaylistActive.v ? '✓ Active' : '✗ Destroyed'}
          </span>
        </div>
      </div>

      {/* Music Library Container */}
      <div
        ref={playlistContainer}
        class="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-700 space-y-2"
      >
        {/* 상단: 실제 DOM */}
        <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
          <div class="flex items-center gap-3">
            <div class="text-2xl">🔔</div>
            <div class="flex-1">
              <div class="text-sm font-semibold text-blue-900 dark:text-blue-100">
                System Sounds (실제 DOM)
              </div>
              <div class="text-xs text-blue-700 dark:text-blue-300">
                Cannot be removed
              </div>
            </div>
          </div>
        </div>

        {/* 중간: 가상 DOM이 여기 삽입됨 (mountCallback에서 render 호출) */}

        {/* 하단: 실제 DOM (insertionPoint) */}
        <div
          ref={insertionPoint}
          class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
        >
          <div class="flex items-center gap-3">
            <div class="text-2xl">💾</div>
            <div class="flex-1">
              <div class="text-sm font-semibold text-green-900 dark:text-green-100">
                Downloaded Music (실제 DOM)
              </div>
              <div class="text-xs text-green-700 dark:text-green-300">
                Permanent storage
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOM 구조 설명 */}
      <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
          💡 DOM 구조
        </h4>
        <div class="text-xs font-mono text-blue-700 dark:text-blue-300 space-y-1">
          <div>&lt;div ref={'{playlistContainer}'}&gt;</div>
          <div class="ml-4">
            &lt;div&gt;System Sounds (실제 DOM)&lt;/div&gt;
          </div>
          <div class="ml-4 text-purple-600 dark:text-purple-400 font-semibold">
            {isPlaylistActive.v
              ? '⬅ Current Playlist (가상 DOM - Loop with keys)'
              : '⬅ (destroyed)'}
          </div>
          <div class="ml-4">
            &lt;div ref={'{insertionPoint}'}&gt;Downloaded Music (실제
            DOM)&lt;/div&gt;
          </div>
          <div>&lt;/div&gt;</div>
        </div>
      </div>

      {/* 테스트 요점 */}
      <div class="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <h4 class="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
          🎯 테스트 요점
        </h4>
        <ul class="text-xs text-green-700 dark:text-green-300 space-y-1">
          <li>
            • <strong>insertBefore 모드</strong>: 가상 DOM이 실제 DOM{' '}
            <strong>사이</strong>에 삽입됩니다
          </li>
          <li>
            • <strong>Loop with keys</strong>: 4개의 곡이 key를 가진 리스트로
            렌더링됩니다
          </li>
          <li>
            • <strong>destroy 함수</strong>: "Clear Playlist"로 가상 DOM만
            제거하고 실제 DOM은 유지됩니다
          </li>
          <li>
            • <strong>재렌더링</strong>: "Restore Playlist"로 같은 위치에 다시
            렌더링할 수 있습니다
          </li>
          <li>
            • Prev/Next 버튼으로 현재 재생 중인 곡을 변경하며 반응형 업데이트를
            확인하세요
          </li>
        </ul>
      </div>
    </div>
  );
});
