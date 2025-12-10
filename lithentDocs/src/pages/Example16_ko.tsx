import { mount } from 'lithent';
import { Example16Ko } from '@/components/examples/example16_ko';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

const ssrHtmlCode = `<!-- 서버에서 렌더링된 초기 HTML (실제 DOM) -->
<div id="music-library">
  <!-- 상단: 실제 DOM -->
  <div>🔔 System Sounds (실제 DOM)</div>

  <!-- 중간: 여기 사이에 가상 DOM 플레이리스트가 삽입됩니다 -->

  <!-- 하단: 실제 DOM (삽입 기준점) -->
  <div id="downloaded-music">💾 Downloaded Music (실제 DOM)</div>
</div>`;

const clientCode = `import { Fragment, render } from 'lithent';
import { state } from 'lithent/helper';

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
    if (currentIndex.v < songs.length - 1) currentIndex.v += 1;
  };

  const playPrev = () => {
    if (currentIndex.v > 0) currentIndex.v -= 1;
  };

  return () => (
    <Fragment>
      <div>Current Playlist (가상 DOM)</div>
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

// 기존 실제 DOM 사이에 가상 DOM(loop)을 삽입하고 destroy로 제거
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

// 나중에 필요하면 destroyPlaylist?.() 로 가상 DOM만 제거`;

export const Example16PageKo = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        insertBefore + Loop + Destroy (Music Library Manager)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        이 예제는 실제 DOM 요소들 사이에 가상 DOM(loop 포함)이 삽입되고, destroy
        함수로 제거될 수 있는지를 테스트합니다. 음악 라이브러리 관리자를 통해
        insertBefore 모드, keyed list 렌더링, 그리고 destroy 기능을 모두 확인할
        수 있습니다.
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 테스트 요점
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>insertBefore + Loop + Destroy</strong>: render() 함수의 세
          번째 인자를 사용해 가상 DOM을 실제 DOM 사이에 삽입하고, 반환된 destroy
          함수로 가상 DOM만 선택적으로 제거할 수 있습니다. 이 예제는 loop
          렌더링(key 사용)과 destroy 기능이 함께 작동하는 것을 보여줍니다.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        컴포넌트 구조
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        이 예제는 다음과 같은 순서로 구성되어 있습니다:
      </p>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Title과 설명</strong>: 예제 제목과 간단한 설명
        </li>
        <li>
          <strong>컨트롤 패널</strong>: Clear Playlist/Restore Playlist 버튼과
          상태 표시 (playlistContainer 밖에 위치)
        </li>
        <li>
          <strong>Music Library Container (playlistContainer)</strong>:
          <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
            <li>
              <strong>System Sounds (실제 DOM - 상단)</strong>: 서버에서
              렌더링되었거나 정적으로 존재하는 콘텐츠
            </li>
            <li>
              <strong>Current Playlist (가상 DOM - 중간)</strong>:
              mountCallback에서 render()로 삽입되는 동적 플레이리스트 (4개 곡,
              key 사용)
            </li>
            <li>
              <strong>
                Downloaded Music (실제 DOM - 하단, insertionPoint)
              </strong>
              : 가상 DOM이 이 요소 앞에 삽입되는 기준점
            </li>
          </ul>
        </li>
        <li>
          <strong>DOM 구조 설명</strong>: 실시간으로 DOM 상태를 보여주는
          다이어그램
        </li>
        <li>
          <strong>테스트 요점</strong>: 예제의 핵심 개념 설명
        </li>
      </ol>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        코드 예제
      </h2>

      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        1. 서버에서 내려온 초기 HTML (실제 DOM)
      </h3>
      <CodeBlock language="html" code={ssrHtmlCode} />

      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
        2. 클라이언트에서 실행되는 Lithent 코드 (가상 DOM)
      </h3>
      <CodeBlock language="tsx" code={clientCode} />

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        render() 함수의 insertBefore 모드
      </h2>

      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <pre class="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre">
          {`const destroyFn = render(
  <Component />,
  parentElement,      // 부모 요소
  beforeElement       // 이 요소 앞에 삽입 (insertBefore)
);

// 나중에 가상 DOM 제거
destroyFn();`}
        </pre>
      </div>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        render() 함수의 세 가지 사용 방법:
      </p>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
        <li>
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
            render(&lt;C /&gt;, parent)
          </code>{' '}
          - 부모의 끝에 추가
        </li>
        <li>
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
            render(&lt;C /&gt;, parent, next)
          </code>{' '}
          - next 요소 앞에 삽입
        </li>
        <li>
          <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
            const destroy = render(...)
          </code>{' '}
          - destroy 함수로 나중에 제거 가능
        </li>
      </ol>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 핵심 개념
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>insertBefore 모드:</strong> render() 함수의 세 번째 인자로
            삽입 위치를 정확하게 지정할 수 있습니다.
          </li>
          <li>
            <strong>Loop with keys:</strong> map()으로 렌더링할 때 key를
            지정하면 Lithent가 요소를 효율적으로 추적합니다.
          </li>
          <li>
            <strong>destroy 함수:</strong> render()가 반환하는 함수를 호출하면
            해당 가상 DOM만 제거되고 실제 DOM은 영향받지 않습니다.
          </li>
          <li>
            <strong>재렌더링:</strong> destroy 후에도 같은 위치에 다시
            render()를 호출할 수 있습니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실행 예제
      </h2>

      <div class="my-8">
        <Example16Ko />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        테스트 시나리오
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          1️⃣ 플레이리스트 네비게이션
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>Prev/Next 버튼으로 현재 재생 곡을 변경</li>
          <li>
            현재 재생 중인 곡이 시각적으로 강조(scale-105, 색상 변경)되는지 확인
          </li>
          <li>
            첫 곡에서 Prev 버튼, 마지막 곡에서 Next 버튼이 비활성화되는지 확인
          </li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          2️⃣ Destroy 기능 테스트
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>"Clear Playlist" 버튼 클릭</li>
          <li>
            플레이리스트(가상 DOM)만 사라지고 System Sounds와 Downloaded
            Music(실제 DOM)은 그대로인지 확인
          </li>
          <li>Status가 "✗ Destroyed"로 변경되는지 확인</li>
          <li>DOM 구조 섹션에서 "(destroyed)" 표시가 나타나는지 확인</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          3️⃣ 재렌더링 테스트
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>"Restore Playlist" 버튼 클릭</li>
          <li>
            플레이리스트가 정확히 같은 위치(실제 DOM 사이)에 다시 나타나는지
            확인
          </li>
          <li>Status가 "✓ Active"로 변경되는지 확인</li>
          <li>Prev/Next 버튼이 다시 작동하는지 확인 (상태가 초기화됨)</li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          🌟 실전 활용 사례
        </h3>
        <p class="text-sm text-green-700 dark:text-green-300 mb-2">
          이 패턴은 다음과 같은 실제 시나리오에서 매우 유용합니다:
        </p>
        <ul class="text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
          <li>
            • <strong>필터링 가능한 리스트</strong>: 고정 헤더/푸터 사이에 동적
            필터링되는 아이템 리스트
          </li>
          <li>
            • <strong>모달/오버레이</strong>: 페이지의 특정 위치에 동적 콘텐츠를
            삽입하고 제거
          </li>
          <li>
            • <strong>Progressive Enhancement</strong>: 서버 렌더링된 페이지에
            클라이언트 측 인터랙티브 요소 추가
          </li>
          <li>
            • <strong>위젯 시스템</strong>: 기존 페이지의 특정 위치에 동적 위젯
            삽입/제거
          </li>
          <li>
            • <strong>A/B 테스팅</strong>: 페이지의 특정 섹션만 동적으로 교체
          </li>
        </ul>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ 주의사항
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            <strong>insertBefore 요소 확인:</strong> 세 번째
            인자(beforeElement)는 반드시 두 번째 인자(parentElement)의
            자식이어야 합니다.
          </li>
          <li>
            <strong>ref 타이밍:</strong> ref 값은 mountCallback() 이후에만 사용
            가능합니다.
          </li>
          <li>
            <strong>destroy 함수 저장:</strong> destroy 함수를 변수에 저장하지
            않으면 나중에 제거할 수 없습니다.
          </li>
          <li>
            <strong>key 사용:</strong> loop 렌더링 시 key를 사용하면 Lithent가
            요소를 효율적으로 추적하고 업데이트합니다.
          </li>
          <li>
            <strong>실제 DOM 수정 금지:</strong> 실제 DOM 요소를 직접 수정하면
            Lithent의 가상 DOM 추적에서 벗어날 수 있습니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        관련 예제
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
          - 실제 DOM과 가상 DOM 혼합
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
          - 실제 DOM과 가상 DOM(loop) 혼합
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
            Render 가이드
          </a>{' '}
          - render() 함수 사용법
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
            Mount Hooks 가이드
          </a>{' '}
          - mountCallback 사용법
        </li>
      </ul>
    </div>
  );
});
