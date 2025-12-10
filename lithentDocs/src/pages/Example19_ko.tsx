import { mount } from 'lithent';
import { Example19Ko } from '@/components/examples/example19_ko';
import { navigateTo } from '@/store';

export const Example19PageKo = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Smart Todo List with FTags (CDN Ready)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        이 예제는 FTags를 사용하여 빌드 도구 없이 CDN만으로 작동하는 완전한 Todo
        애플리케이션을 만드는 방법을 보여줍니다. 코드를 복사해서 HTML 파일로
        저장하면 즉시 실행할 수 있습니다!
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 테스트 요점
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>Zero Configuration with FTags</strong>: FTags를 사용하면 JSX,
          Babel, Webpack 등의 빌드 도구 설정 없이 순수 JavaScript로 반응형 UI를
          만들 수 있습니다. CDN에서 직접 로드하여 HTML 파일 하나로 완전한 앱을
          구현할 수 있습니다.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        FTags의 장점
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ✨ 핵심 장점
        </h3>

        <div class="space-y-4">
          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              1️⃣ 제로 설정 (Zero Configuration)
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              NPM 설치, package.json 설정, Babel/Webpack 구성 등이 전혀 필요하지
              않습니다. HTML 파일 하나면 충분합니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              2️⃣ CDN 즉시 사용
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Lithent, FTags, Helper 라이브러리를 CDN에서 직접 로드하여 즉시
              사용할 수 있습니다. 프로토타입을 빠르게 만들거나 간단한 위젯을
              만들 때 유용합니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              3️⃣ 순수 함수형 API
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              모든 HTML 태그가 함수로 제공되며, 함수 호출만으로 UI를 구성할 수
              있습니다. TypeScript 타입 안전성도 완벽하게 지원됩니다.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              4️⃣ Props 자동 감지
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              첫 번째 인자가 props인지 children인지 자동으로 판단하여, props를
              생략하고 바로 children을 전달할 수 있습니다. 코드가 더
              간결해집니다.
            </p>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Smart Todo List 앱 구조
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        이 예제는 완전한 기능을 갖춘 할 일 관리 앱입니다:
      </p>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>할 일 추가:</strong> 텍스트 입력과 카테고리 선택으로 할 일
          추가
        </li>
        <li>
          <strong>카테고리 분류:</strong> 집안일, 회사일, 기타로 분류
        </li>
        <li>
          <strong>실시간 통계:</strong> 전체, 완료, 진행중 개수 자동 계산
        </li>
        <li>
          <strong>다중 필터:</strong> 전체/완료/진행중 및 카테고리별 필터링
        </li>
        <li>
          <strong>완료 토글:</strong> 체크박스로 완료/미완료 상태 전환
        </li>
        <li>
          <strong>삭제 기능:</strong> 각 할 일을 개별적으로 삭제 가능
        </li>
        <li>
          <strong>반응형 UI:</strong> 상태 변경 시 자동으로 UI 업데이트
        </li>
        <li>
          <strong>아름다운 디자인:</strong> 그라데이션, 배지, 애니메이션 포함
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        사용된 기술
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            flMount
          </h3>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            JSX 없이 Light API 컴포넌트를 생성합니다. lstate와 함께 사용하면
            자동으로 UI가 업데이트됩니다.
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            fTags
          </h3>
          <p class="text-sm text-green-800 dark:text-green-200">
            모든 HTML 태그를 함수로 제공합니다. div, button, input, select 등을
            구조 분해로 가져와 사용합니다.
          </p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            lstate
          </h3>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            반응형 상태 관리. .value로 접근/수정하면 자동으로 컴포넌트가
            리렌더링됩니다.
          </p>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h3 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            computed
          </h3>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            파생 상태. 의존하는 상태가 변경되면 자동으로 다시 계산됩니다.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실행 예제
      </h2>

      <div class="my-8">
        <Example19Ko />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        활용 사례
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          언제 FTags를 사용할까?
        </h3>

        <div class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>빠른 프로토타이핑:</strong> 아이디어를 빠르게 검증하고
              싶을 때
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>작은 위젯:</strong> 웹사이트에 삽입할 간단한 인터랙티브
              위젯
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>교육 목적:</strong> 학생들에게 빌드 도구 없이 리액티브
              프로그래밍 가르치기
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>레거시 환경:</strong> JSX 설정이 어려운 환경에서 모던한 UI
              개발
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <div>
              <strong>독립 실행형 도구:</strong> 외부 의존성 없이 배포 가능한
              HTML 파일
            </div>
          </div>
        </div>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ 주의사항
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>대규모 애플리케이션에는 JSX가 더 가독성이 좋을 수 있습니다.</li>
          <li>팀이 JSX에 익숙하다면 굳이 FTags로 전환할 필요는 없습니다.</li>
          <li>
            복잡한 중첩 구조에서는 함수 호출 방식이 JSX보다 읽기 어려울 수
            있습니다.
          </li>
          <li>
            성능은 JSX와 동일합니다. 둘 다 동일한 Virtual DOM을 생성합니다.
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
            할 일 목록을 LocalStorage에 저장하여 브라우저를 닫아도 데이터가
            유지되도록 만들어보세요.
          </p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🎯 우선순위 시스템
          </h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            높음, 중간, 낮음 우선순위를 추가하고 색상으로 구분해보세요.
          </p>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            📅 마감일 관리
          </h4>
          <p class="text-sm text-green-800 dark:text-green-200">
            각 할 일에 마감일을 설정하고 임박한 순서대로 정렬하는 기능을
            추가해보세요.
          </p>
        </div>

        <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            🔍 검색 기능
          </h4>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            할 일 제목으로 검색하는 기능을 추가하여 많은 할 일 중에서 빠르게
            찾아보세요.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        관련 문서
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/guide/ftags"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/ftags');
            }}
          >
            FTags 가이드
          </a>{' '}
          - FTags의 모든 기능과 API 문서
        </li>
        <li>
          <a
            href="/guide/lstate"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/lstate');
            }}
          >
            Lstate 가이드
          </a>{' '}
          - Light API 반응형 상태 관리
        </li>
        <li>
          <a
            href="/guide/computed"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/computed');
            }}
          >
            Computed 가이드
          </a>{' '}
          - 파생 상태와 자동 계산
        </li>
      </ul>
    </div>
  );
});
