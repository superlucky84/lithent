import { mount } from 'lithent';
import { Example21Ko } from '@/components/examples/example21_ko';

export const Example21PageKo = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Example 21: HTM Tags로 만드는 빠른 메모 (CDN 지원)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        이 예제는 빌드 도구 없이 CDN만으로 작동하는 완전한 메모 애플리케이션을
        HTM Tags를 사용하여 만드는 방법을 보여줍니다. Import Maps를 사용하면
        CDN에서 Lithent 모듈을 직접 로드하고 즉시 코딩을 시작할 수 있습니다!
      </p>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          💡 핵심 학습 포인트
        </h3>
        <p class="text-sm text-purple-800 dark:text-purple-200">
          <strong>HTM Tags + Import Maps:</strong> HTM (Hyperscript Tagged
          Markup)은 템플릿 리터럴을 사용하여 JSX와 유사한 코드를 작성할 수 있게
          해줍니다. Import Maps와 결합하면 빌드 단계 없이 CDN에서 모듈을 로드할
          수 있습니다. HTML 파일로 저장하고 브라우저에서 열기만 하면 됩니다!
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        HTM Tags의 장점
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ✨ 핵심 장점
        </h3>

        <div class="space-y-4">
          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              1️⃣ 제로 설정
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              NPM 설치, 빌드 도구, 설정 파일이 전혀 필요하지 않습니다. HTML 파일
              하나면 충분합니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              2️⃣ Import Maps
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              브라우저 네이티브 Import Maps를 사용하여 CDN에서 ES 모듈을
              로드합니다. 최신 브라우저는 폴리필 없이 이를 지원합니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              3️⃣ 태그된 템플릿 리터럴
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              HTM은 마크업에 ES6 태그된 템플릿(백틱)을 사용합니다.
              트랜스파일러가 필요 없으면서도 JSX와 유사한 문법을 사용할 수
              있습니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              4️⃣ 가볍고 빠름
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              HTM 라이브러리는 매우 작으며(~600바이트) 내부 캐싱을 통해 런타임에
              템플릿을 효율적으로 파싱합니다.
            </p>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        빠른 메모 앱 구조
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        이 예제는 완전한 기능을 갖춘 메모 작성 앱입니다:
      </p>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>메모 추가:</strong> 제목과 내용으로 메모 생성
        </li>
        <li>
          <strong>실시간 카운터:</strong> 저장된 총 메모 개수 표시
        </li>
        <li>
          <strong>그리드 레이아웃:</strong> 메모 표시를 위한 반응형 카드 그리드
        </li>
        <li>
          <strong>삭제 기능:</strong> 확인 후 개별 메모 제거
        </li>
        <li>
          <strong>타임스탬프:</strong> 메모 생성 시각 자동 기록
        </li>
        <li>
          <strong>빈 상태:</strong> 메모가 없을 때 친근한 메시지 표시
        </li>
        <li>
          <strong>반응형 UI:</strong> 상태 변경 시 자동으로 UI 업데이트
        </li>
        <li>
          <strong>아름다운 디자인:</strong> 그라데이션 배경, 부드러운 애니메이션
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        사용된 기술
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Import Maps
          </h3>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            모듈 지정자를 URL에 매핑하는 브라우저 네이티브 방식. CDN에서
            로드하는데 번들러가 필요 없습니다.
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            HTM Tags (lTag)
          </h3>
          <p class="text-sm text-green-800 dark:text-green-200">
            JSX와 유사한 문법으로 템플릿 리터럴을 사용합니다. lithent/tag에서
            lTag를 가져와 마크업을 작성하세요.
          </p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            lstate
          </h3>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            lithent/helper의 반응형 상태 관리. .value로 접근하면 자동으로 UI가
            업데이트됩니다.
          </p>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h3 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            ES 모듈
          </h3>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            최신 브라우저 네이티브 모듈 시스템. import 문으로 모듈을 직접
            로드합니다.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실행 예제
      </h2>

      <div class="my-8">
        <Example21Ko />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        활용 사례
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          언제 CDN과 함께 HTM Tags를 사용할까?
        </h3>

        <div class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>빠른 프로토타이핑:</strong> 설정 없이 아이디어를 빠르게
              테스트
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>교육용 데모:</strong> 도구 복잡성 없이 웹 개발 교육
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>간단한 도구:</strong> 단일 페이지 유틸리티 및 계산기
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>레거시 환경:</strong> 빌드 도구를 설치할 수 없는 환경
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>CodePen/JSFiddle:</strong> 온라인 코드 플레이그라운드
            </div>
          </div>
        </div>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ 주의사항
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            대규모 애플리케이션의 경우 빌드 도구와 함께 JSX를 사용하는 것이 더
            나은 성능과 개발 경험을 제공할 수 있습니다.
          </li>
          <li>
            HTM은 런타임에 템플릿을 파싱합니다. 빠르긴 하지만, 이론적으로 JSX
            컴파일이 더 빠릅니다.
          </li>
          <li>
            TypeScript 자동완성과 타입 체킹은 HTM 템플릿보다 JSX에서 더 잘
            작동합니다.
          </li>
          <li>
            Import Maps는 최신 브라우저에서 지원되지만 구형 브라우저에서는
            폴리필이 필요할 수 있습니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        확장 아이디어
      </h2>

      <div class="grid gap-4 mb-6">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            💾 LocalStorage 지속성
          </h4>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            메모를 LocalStorage에 저장하여 브라우저 세션 간에 유지되도록
            만드세요.
          </p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🏷️ 카테고리 & 태그
          </h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            주제별로 메모를 정리할 수 있도록 카테고리나 태그를 추가하세요.
          </p>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            🔍 검색 & 필터
          </h4>
          <p class="text-sm text-green-800 dark:text-green-200">
            제목이나 내용으로 메모를 찾을 수 있는 검색 기능을 추가하세요.
          </p>
        </div>

        <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            ✏️ 메모 편집
          </h4>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            생성과 삭제뿐만 아니라 기존 메모를 편집할 수 있도록 허용하세요.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        관련 문서
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/guide/htm-tags"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/htm-tags');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            HTM Tags 가이드
          </a>{' '}
          - Lithent와 함께 HTM을 사용하는 완벽한 가이드
        </li>
        <li>
          <a
            href="/guide/lstate"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/lstate');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Lstate 가이드
          </a>{' '}
          - Light API 반응형 상태 관리
        </li>
        <li>
          <a
            href="/guide/ftags"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/ftags');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            FTags 가이드
          </a>{' '}
          - 대안적인 함수 기반 마크업 (CDN과 함께 작동)
        </li>
      </ul>
    </div>
  );
});
