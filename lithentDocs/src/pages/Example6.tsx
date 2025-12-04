import { CodeBlock } from '@/components/CodeBlock';
import { Example6 } from '@/components/examples/example6';
import type { Introduction } from '@/pages/Introduction';

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
      리스트를 렌더링할 때{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        key
      </code>{' '}
      prop을 사용하여 각 아이템을 고유하게 식별하는 음악 플레이리스트
      예제입니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이 예제는{' '}
      <strong>
        Lithent의 가상 돔 엔진이 key를 기반으로 리스트 아이템을 정확하게
        추적하고, 순서가 변경되거나 아이템이 추가/삭제될 때 효율적으로 DOM을
        업데이트하는지 테스트
      </strong>
      하기 위해 설계되었습니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      각 노래의 재생 횟수(plays)를 증가시킨 후 Shuffle이나 Sort를 실행해보세요.
      key 덕분에 각 노래의 ID와 내부 상태가 유지되는 것을 확인할 수 있습니다.
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
        Key 사용의 중요성
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>요소 식별</strong>: key를 통해 Lithent는 리스트의 각 아이템을
          고유하게 식별
        </li>
        <li>
          <strong>효율적인 업데이트</strong>: 순서 변경 시 DOM 노드를 재사용하여
          불필요한 재생성 방지
        </li>
        <li>
          <strong>상태 보존</strong>: 아이템의 위치가 바뀌어도 내부 상태(plays
          카운터)가 유지됨
        </li>
        <li>
          <strong>정확한 diff</strong>: key 기반으로 어떤 아이템이
          추가/삭제/이동되었는지 정확히 판단
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        테스트 시나리오
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          여러 노래의 재생 버튼(▶)을 클릭하여 plays 카운터를 증가시킵니다
        </li>
        <li>🔀 Shuffle 버튼을 클릭하여 순서를 섞어봅니다</li>
        <li>각 노래의 ID와 plays 카운터가 그대로 유지되는지 확인합니다</li>
        <li>📊 Sort by Plays로 정렬해도 상태가 유지되는 것을 확인합니다</li>
        <li>
          ➕ Add Song으로 새 노래를 추가하고 ✕ 버튼으로 노래를 삭제해봅니다
        </li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <h3 class="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        ⚠️ Key가 없다면?
      </h3>
      <p class="text-sm text-yellow-700 dark:text-yellow-300">
        key를 사용하지 않으면 Lithent는 리스트 아이템을 인덱스 기반으로
        매칭합니다. 이 경우 순서가 변경되면 잘못된 DOM 노드에 데이터가 적용되어
        plays 카운터가 다른 노래로 이동하거나, 불필요한 DOM 재생성이 발생할 수
        있습니다.
      </p>
    </div>
  </div>
);
