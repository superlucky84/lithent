import { mount } from 'lithent';
import { Example20Ko } from '@/components/examples/example20_ko';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Example20PageKo = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        이미지 갤러리 라이트박스
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        이 예제는 Portal 기능을 사용하여 overflow:hidden 컨테이너 안의 썸네일을
        클릭하면 전체 화면 라이트박스가 표시되는 이미지 갤러리를 구현합니다.
        Portal의 핵심 특성을 가장 직관적으로 경험할 수 있습니다!
      </p>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          💡 학습 포인트
        </h3>
        <p class="text-sm text-purple-800 dark:text-purple-200">
          <strong>Portal의 마법:</strong> 갤러리는 overflow:hidden 컨테이너 안에
          갇혀 있지만, 썸네일을 클릭하면 Portal을 통해 전체 화면 라이트박스가
          표시됩니다. 라이트박스는 물리적으로 다른 DOM 위치에 렌더링되어 부모의
          overflow 제약을 받지 않습니다.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Portal이 해결하는 문제
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        일반적으로 부모 컨테이너에 overflow: hidden이 있으면 자식 요소가
        잘립니다. 하지만 라이트박스나 모달은 전체 화면을 덮어야 합니다. Portal은
        이 문제를 해결합니다.
      </p>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        갤러리 라이트박스 구조
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>썸네일 갤러리:</strong> overflow:hidden 컨테이너 안에 6개의
          이미지
        </li>
        <li>
          <strong>클릭 이벤트:</strong> 썸네일 클릭 시 선택된 사진 상태 업데이트
        </li>
        <li>
          <strong>Portal 렌더링:</strong> 라이트박스를 별도 DOM 위치에 표시
        </li>
        <li>
          <strong>전체 화면 오버레이:</strong> 검은 배경 + 큰 이미지 표시
        </li>
        <li>
          <strong>닫기 기능:</strong> X 버튼 또는 닫기 버튼으로 라이트박스 종료
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        사용된 기술
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            portal()
          </h3>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            라이트박스를 다른 DOM 위치로 렌더링합니다. portal(content,
            targetElement)로 사용합니다.
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            state (helper)
          </h3>
          <p class="text-sm text-green-800 dark:text-green-200">
            선택된 사진 상태를 관리합니다. .v로 접근하고 자동으로
            리렌더링됩니다.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        코드 예제
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        다음은 Portal을 사용하여 SSR로 미리 렌더링된 영역에 라이트박스를
        렌더링하는 예제입니다:
      </p>

      <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          💡 SSR 시나리오
        </h3>
        <p class="text-xs text-gray-700 dark:text-gray-300">
          서버에서 HTML에 라이트박스 컨테이너를 미리 렌더링하고, 클라이언트에서
          Portal을 사용해 해당 영역(예: <code>document.body</code> 또는 별도의{' '}
          <code>lightbox-root</code>)에 라이트박스를 렌더링합니다.
        </p>
      </div>

      <CodeBlock
        language="html"
        code={`<!-- index.html (서버에서 렌더링된 HTML) -->
<!DOCTYPE html>
<html>
<body>
  <!-- 앱이 마운트될 영역 -->
  <div id="app"></div>

  <!-- SSR로 미리 렌더링된 라이트박스 컨테이너 -->
  <div id="lightbox-root"></div>
</body>
</html>`}
      />

      <CodeBlock
        language="tsx"
        code={`// app.tsx (클라이언트 코드)
import { mount, portal } from 'lithent';
import { state } from 'lithent/helper';

export const Gallery = mount(renew => {
  const selectedPhoto = state<Photo | null>(null, renew);

  const openLightbox = (photo: Photo) => {
    selectedPhoto.v = photo;
  };

  const closeLightbox = () => {
    selectedPhoto.v = null;
  };

  return () => (
    <div>
      {/* 갤러리 (overflow:hidden 컨테이너) */}
      <div class="gallery-container" style="overflow: hidden;">
        {photos.map(photo => (
          <button key={photo.id} onClick={() => openLightbox(photo)}>
            <span>{photo.thumbnail}</span>
            <span>{photo.title}</span>
          </button>
        ))}
      </div>

      {/* Portal 렌더링 - document.body 또는 SSR로 정의된 lightbox-root 등 */}
      {selectedPhoto.v &&
        portal(
          <Lightbox photo={selectedPhoto.v} onClose={closeLightbox} />,
          document.body
        )}
    </div>
  );
});`}
      />

      <p class="text-sm text-gray-700 dark:text-gray-300 mt-4 mb-2">
        <strong>라이트박스 컴포넌트 (Portal로 렌더링되는 내용):</strong>
      </p>

      <CodeBlock
        language="tsx"
        code={`// Lightbox.tsx (Portal로 렌더링되는 컴포넌트)
const Lightbox = mount<{
  photo: Photo;
  onClose: () => void;
}>((r, props) => {
  return () => (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 animate-fadeIn">
      {/* 닫기 버튼 */}
      <button
        onClick={props.onClose}
        class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors"
      >
        ✕
      </button>

      {/* 라이트박스 본체 */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4">
        <div class="flex flex-col items-center">
          {/* 큰 이미지 */}
          <span class="text-9xl mb-4">{props.photo.full}</span>

          {/* 제목 */}
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {props.photo.title}
          </h3>

          {/* ID */}
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ID: {props.photo.id}
          </p>

          {/* 닫기 버튼 */}
          <button
            onClick={props.onClose}
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
});

// Gallery 컴포넌트에서 사용
const renderLightbox = () => {
  const lightboxRoot = document.getElementById('lightbox-root');
  return lightboxRoot && selectedPhoto.v
    ? portal(
        <Lightbox photo={selectedPhoto.v} onClose={closeLightbox} />,
        lightboxRoot
      )
    : null;
};`}
      />

      <div class="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 핵심 포인트
        </h3>
        <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>
            <strong>1. SSR 컨테이너:</strong> HTML에 미리 정의된 lightbox-root를
            사용합니다.
          </li>
          <li>
            <strong>2. document.getElementById():</strong> SSR로 렌더링된 DOM
            요소를 직접 참조합니다.
          </li>
          <li>
            <strong>3. portal() 함수:</strong> portal(&lt;Lightbox /&gt;,
            lightboxRoot)로 라이트박스 컴포넌트를 렌더링합니다.
          </li>
          <li>
            <strong>4. 재사용 가능한 컴포넌트:</strong> Lightbox를 독립적인
            컴포넌트로 분리하여 props로 데이터를 전달합니다.
          </li>
          <li>
            <strong>5. overflow 해결:</strong> 갤러리는 overflow:hidden이지만
            라이트박스는 전체 화면에 표시됩니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실행 예제
      </h2>

      <div class="my-8">
        <Example20Ko />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Portal의 핵심 특성
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          🎯 이 예제가 보여주는 것
        </h3>

        <div class="space-y-4">
          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              1️⃣ Overflow 제약 극복
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              갤러리 컨테이너는 overflow:hidden이지만, Portal로 렌더링된
              라이트박스는 전체 화면을 덮을 수 있습니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              2️⃣ 시각적으로 명확한 개념
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              작은 썸네일 → 큰 라이트박스로의 전환이 Portal의 "다른 위치 렌더링"
              개념을 직관적으로 보여줍니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              3️⃣ 실용적인 패턴
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              실제 웹사이트에서 자주 사용하는 이미지 갤러리 + 라이트박스
              패턴입니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              4️⃣ 생명주기 관리
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              선택된 사진 상태가 null이 되면 Portal도 자동으로 제거됩니다.
            </p>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실전 활용 예시
      </h2>

      <div class="grid gap-4 mb-6">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            🖼️ 이미지 갤러리
          </h4>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            포트폴리오, 블로그, 쇼핑몰 등에서 이미지를 크게 보여주는
            라이트박스를 구현할 수 있습니다.
          </p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🎬 비디오 플레이어
          </h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            작은 썸네일 클릭 시 전체 화면 비디오 플레이어를 표시할 수 있습니다.
          </p>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            📄 문서 미리보기
          </h4>
          <p class="text-sm text-green-800 dark:text-green-200">
            PDF, 이미지 등의 문서를 큰 화면으로 미리 볼 수 있는 뷰어를 만들 수
            있습니다.
          </p>
        </div>

        <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            🎨 상품 상세보기
          </h4>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            쇼핑몰에서 상품 이미지를 확대해서 보여주는 줌 기능을 구현할 수
            있습니다.
          </p>
        </div>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ 주의사항
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            <strong>이벤트 버블링:</strong> Portal 내부의 클릭 이벤트가 부모로
            전파될 수 있으므로 e.stopPropagation()이 필요할 수 있습니다.
          </li>
          <li>
            <strong>접근성:</strong> ESC 키로 닫기, 포커스 트랩 등의 접근성
            기능을 추가하는 것이 좋습니다.
          </li>
          <li>
            <strong>스크롤 방지:</strong> 라이트박스 열릴 때 body 스크롤을
            비활성화하면 더 나은 UX를 제공합니다.
          </li>
          <li>
            <strong>애니메이션:</strong> fade-in/fade-out 애니메이션을 추가하면
            더 부드러운 전환 효과를 얻을 수 있습니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        확장 아이디어
      </h2>

      <div class="grid gap-4 mb-6">
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ⬅️➡️ 이전/다음 네비게이션
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            라이트박스에서 화살표 버튼으로 다음/이전 이미지를 볼 수 있는 기능을
            추가해보세요.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🔍 줌 인/아웃
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            마우스 휠이나 핀치 제스처로 이미지를 확대/축소하는 기능을
            추가해보세요.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            📱 스와이프 지원
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            모바일에서 좌우 스와이프로 이미지를 전환하는 기능을 추가해보세요.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🎞️ 슬라이드쇼
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            자동으로 다음 이미지로 넘어가는 슬라이드쇼 모드를 추가해보세요.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        관련 문서
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/guide/portal"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/portal');
            }}
          >
            Portal 가이드
          </a>{' '}
          - Portal의 모든 기능과 API 문서
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
          - mountCallback과 컴포넌트 생명주기
        </li>
        <li>
          <a
            href="/guide/state-ref"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/state-ref');
            }}
          >
            State-Ref 가이드
          </a>{' '}
          - ref를 사용한 DOM 요소 참조
        </li>
      </ul>
    </div>
  );
});
