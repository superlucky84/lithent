import { CodeBlock } from '@/components/CodeBlock';
import { Example12Ko } from '@/components/examples/example12_ko';
import type { Introduction } from '@/pages/Introduction';

const ssrHtmlCode = `<!-- 서버에서 렌더링된 초기 HTML (실제 DOM) -->
<div id="feed">
  <article>📌 Pinned Post (실제 DOM)</article>
  <article>👤 Older Post (실제 DOM)</article>

  <!-- 이 지점 위/아래는 서버가 렌더링한 실제 DOM 입니다 -->
  <article id="sponsored-slot">📢 Sponsored (실제 DOM)</article>
  <article>📜 Archive (실제 DOM)</article>
</div>`;

const clientCode = `import { Fragment, render } from 'lithent';
import { state } from 'lithent/helper';

// 동적 포스트 컴포넌트 (가상 DOM)
const DynamicPosts = mount(renew => {
  const visiblePosts = state([true, true, true], renew);

  const togglePost = (index: number) => {
    visiblePosts.v = visiblePosts.v.map((v, i) => (i === index ? !v : v));
  };

  return () => (
    <Fragment>
      <div>Controls...</div>
      {visiblePosts.v[0] && <article>Post 1 (가상 DOM)</article>}
      {visiblePosts.v[1] && <article>Post 2 (가상 DOM)</article>}
      {visiblePosts.v[2] && <article>Post 3 (가상 DOM)</article>}
    </Fragment>
  );
});

// 기존 실제 DOM 사이에 가상 DOM 삽입
const feedContainer = document.getElementById('feed');
const insertionPoint = document.getElementById('sponsored-slot');

if (feedContainer && insertionPoint) {
  render(<DynamicPosts />, feedContainer, insertionPoint as HTMLElement);
}`;

export const Example12PageKo = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mixed DOM Elements (Social Media Timeline)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      실제 DOM 요소와 가상 DOM 요소가 하나의 부모 아래에 혼합되어 있을 때
      Lithent가 올바르게 처리할 수 있는지 테스트하는 예제입니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이 예제는{' '}
      <strong>
        Progressive Enhancement와 SSR(서버 사이드 렌더링) 시나리오를 시뮬레이션
      </strong>
      합니다. 서버에서 렌더링된 정적 콘텐츠(실제 DOM)와 클라이언트에서 동적으로
      추가되는 인터랙티브 콘텐츠(가상 DOM)가 공존하는 상황을 재현합니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      소셜 미디어 타임라인에서 고정 포스트, 광고, 아카이브는 서버에서 렌더링된
      실제 DOM이고, 그 사이의 실시간 포스트들은 Lithent로 관리되는 가상
      DOM입니다. 버튼을 눌러 중간의 포스트를 토글하면서 실제 DOM이 영향받지
      않는지 확인하세요!
    </p>

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
      1. 서버에서 내려온 초기 HTML (실제 DOM)
    </h2>
    <CodeBlock language="html" code={ssrHtmlCode} />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mt-8 mb-3">
      2. 클라이언트에서 실행되는 Lithent 코드 (가상 DOM)
    </h2>
    <CodeBlock language="typescript" code={clientCode} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example12Ko />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        render() 함수의 insertBefore 모드
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>기본 모드</strong>:{' '}
          <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            render(&lt;Component /&gt;, parentElement)
          </code>{' '}
          - 부모 요소의 끝에 추가
        </li>
        <li>
          <strong>insertBefore 모드</strong>:{' '}
          <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            render(&lt;Component /&gt;, parentElement, nextElement)
          </code>{' '}
          - nextElement 앞에 삽입
        </li>
        <li>
          <strong>Fragment 사용</strong>: 여러 요소를 그룹화하여 한 번에 삽입
        </li>
        <li>
          <strong>실제 DOM 보존</strong>: 기존 실제 DOM 요소는 수정되지 않고
          그대로 유지됨
        </li>
        <li>
          <strong>동적 업데이트</strong>: 가상 DOM 요소만 선택적으로 추가/제거
          가능
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        DOM 구조
      </h2>
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs overflow-x-auto">
        <pre class="text-gray-800 dark:text-gray-200">
          {`<div> (feedContainer)
  <!-- 실제 DOM: 서버 렌더링 -->
  <article>📌 Pinned Post (실제 DOM)</article>
  <article>👤 Previous User (실제 DOM)</article>

  <!-- 가상 DOM: Lithent가 여기에 삽입 -->
  <div>🔄 컨트롤 패널 (가상 DOM)</div>
  <article>👩‍💻 Sarah Chen (가상 DOM)</article>  <!-- 토글 가능 -->
  <article>🧑‍🎨 Alex Rivera (가상 DOM)</article> <!-- 토글 가능 -->
  <article>🧑‍🚀 Jordan Kim (가상 DOM)</article>   <!-- 토글 가능 -->

  <!-- 실제 DOM: 서버 렌더링 (insertionPoint) -->
  <article>📢 Sponsored (실제 DOM)</article>
  <article>📜 Archive (실제 DOM)</article>
</div>`}
        </pre>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        핵심 개념
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Progressive Enhancement</strong>: 기본 콘텐츠는 서버에서
          렌더링하고, 인터랙티브 기능을 클라이언트에서 추가
        </li>
        <li>
          <strong>Hydration과의 차이</strong>: Hydration은 기존 DOM에 이벤트를
          연결하지만, 이 예제는 새로운 DOM을 기존 DOM 사이에 삽입
        </li>
        <li>
          <strong>ref 활용</strong>: ref로 실제 DOM 요소의 참조를 얻어 render()
          함수에 전달
        </li>
        <li>
          <strong>mountCallback</strong>: 컴포넌트가 마운트된 후 ref 값이
          설정되면 실행됨
        </li>
        <li>
          <strong>독립적 업데이트</strong>: 가상 DOM 부분만 재렌더링되고 실제
          DOM은 영향받지 않음
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        테스트 시나리오
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          개별 포스트 버튼을 눌러 중간의 가상 DOM 포스트가 사라지는지 확인
        </li>
        <li>
          포스트를 숨겼다가 다시 표시할 때 실제 DOM(Pinned, Sponsored,
          Archive)이 그대로인지 확인
        </li>
        <li>
          "전체 숨기기"로 모든 가상 DOM을 제거해도 실제 DOM은 유지되는지 확인
        </li>
        <li>
          "전체 보기"로 가상 DOM이 올바른 위치(실제 DOM 사이)에 다시 삽입되는지
          확인
        </li>
        <li>
          페이지 스크롤을 통해 컨트롤 패널이 sticky로 상단에 고정되는지 확인
        </li>
        <li>fade-in 애니메이션이 포스트 추가 시 작동하는지 확인</li>
      </ol>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <h3 class="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
        🌟 실전 활용 사례
      </h3>
      <p class="text-sm text-green-700 dark:text-green-300 mb-2">
        이 패턴은 다음과 같은 실제 시나리오에서 매우 유용합니다:
      </p>
      <ul class="text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
        <li>
          • <strong>블로그 댓글</strong>: 기존 댓글(SSR)과 새로운
          댓글(클라이언트 추가)
        </li>
        <li>
          • <strong>전자상거래</strong>: 정적 상품 목록에 동적 필터/정렬 UI 추가
        </li>
        <li>
          • <strong>뉴스 피드</strong>: 고정 기사와 실시간 업데이트 기사 혼합
        </li>
        <li>
          • <strong>관리자 패널</strong>: 서버 렌더링 테이블에 인라인 편집 기능
          추가
        </li>
      </ul>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
      <h3 class="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🎯 왜 이게 중요한가?
      </h3>
      <p class="text-sm text-purple-700 dark:text-purple-300 mb-2">
        많은 가상 DOM 라이브러리는 전체 컨테이너를 장악하려 합니다. 하지만
        Lithent는 실제 프로젝트에서 흔히 마주치는 "점진적 마이그레이션"
        시나리오를 지원합니다.
      </p>
      <p class="text-xs text-purple-600 dark:text-purple-400 italic">
        💡 기존 서버 렌더링 앱에 Lithent를 도입할 때, 전체를 다시 작성할 필요
        없이 필요한 부분만 가상 DOM으로 교체할 수 있습니다. 이것이 바로
        "Progressive Enhancement"의 진정한 의미입니다!
      </p>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
      <h3 class="text-base font-semibold text-orange-800 dark:text-orange-200 mb-2">
        ⚠️ 주의사항
      </h3>
      <ul class="text-sm text-orange-700 dark:text-orange-300 space-y-1">
        <li>
          • insertBefore 모드를 사용할 때는 nextElement가 반드시 parentElement의
          자식이어야 합니다
        </li>
        <li>
          • 실제 DOM 요소를 직접 수정하면 Lithent의 가상 DOM 추적에서 벗어날 수
          있습니다
        </li>
        <li>• ref 값은 mountCallback 이후에만 사용 가능합니다</li>
        <li>
          • 같은 위치에 여러 번 render()를 호출하면 이전 가상 DOM이 교체됩니다
        </li>
      </ul>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        관련 문서
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
            Render 가이드
          </a>{' '}
          - render(wDom, wrapElement, afterElement) 시그니처와 insertBefore
          모드를 정식 문서로 정리해 둔 페이지입니다.
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
          - 같은 패턴을 key 기반 리스트와 함께 사용하는 확장 예제를 함께 보면
          이해가 더 잘 됩니다.
        </li>
      </ul>
    </div>
  </div>
);
