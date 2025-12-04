import { mount } from 'lithent';
import { Example17 } from '@/components/examples/example17';
import { CodeBlock } from '@/components/CodeBlock';

export const Example17Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Example 17: SVG Rendering (Traffic Light)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        이 예제는 Lithent가 SVG 요소를 정확하게 렌더링하고, SVG 속성(fill,
        opacity, stroke 등)을 반응형으로 업데이트할 수 있는지를 테스트합니다.
        신호등을 통해 SVG의 다양한 기능을 확인할 수 있습니다.
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 테스트 요점
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>SVG Rendering</strong>: Lithent가 SVG 요소(rect, circle)를
          정확히 렌더링하고, 동적 속성 변경(opacity, fill, stroke)이 반응형으로
          업데이트되는지 확인합니다. 또한 SVG 요소에 조건부 렌더링과 CSS
          클래스를 적용할 수 있는지 테스트합니다.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        컴포넌트 구조
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        이 예제는 다음과 같은 요소로 구성되어 있습니다:
      </p>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>컨트롤 패널</strong>: Next Light 버튼과 Auto Mode 토글
        </li>
        <li>
          <strong>신호등 SVG</strong>:
          <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
            <li>외곽 박스 (rect 요소)</li>
            <li>빨간불 (circle, cy=85)</li>
            <li>노란불 (circle, cy=200)</li>
            <li>초록불 (circle, cy=315)</li>
            <li>켜진 신호의 glow 효과 (조건부 렌더링된 circle with stroke)</li>
          </ul>
        </li>
        <li>
          <strong>현재 상태 표시</strong>: 실시간으로 켜진 신호 정보 표시
        </li>
        <li>
          <strong>사용된 SVG 요소 설명</strong>: 각 SVG 요소와 속성 설명
        </li>
      </ol>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        코드 예제
      </h2>

      <CodeBlock
        code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

type LightState = 'red' | 'yellow' | 'green';

const TrafficLight = mount(renew => {
  const currentLight = state<LightState>('red', renew);
  const autoMode = state(false, renew);
  let autoInterval: number | null = null;

  const lightSequence: LightState[] = ['red', 'yellow', 'green'];

  const nextLight = () => {
    const currentIndex = lightSequence.indexOf(currentLight.v);
    const nextIndex = (currentIndex + 1) % lightSequence.length;
    currentLight.v = lightSequence[nextIndex];
  };

  const toggleAutoMode = () => {
    autoMode.v = !autoMode.v;

    if (autoMode.v) {
      autoInterval = window.setInterval(() => {
        nextLight();
      }, 2000);
    } else if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }
  };

  const getLightOpacity = (light: LightState) => {
    return currentLight.v === light ? 1 : 0.2;
  };

  return () => (
    <div>
      {/* 컨트롤 패널 */}
      <button onClick={nextLight} disabled={autoMode.v}>
        Next Light
      </button>
      <button onClick={toggleAutoMode}>
        {autoMode.v ? 'Stop Auto' : 'Auto Mode'}
      </button>

      {/* 신호등 SVG */}
      <svg
        width="200"
        height="400"
        viewBox="0 0 200 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 외곽 박스 */}
        <rect
          x="25"
          y="25"
          width="150"
          height="350"
          rx="20"
          fill="#1F2937"
        />

        {/* 빨간불 */}
        <circle
          cx="100"
          cy="85"
          r="40"
          fill="#EF4444"
          opacity={getLightOpacity('red')}
        />
        {currentLight.v === 'red' && (
          <circle
            cx="100"
            cy="85"
            r="45"
            fill="none"
            stroke="#EF4444"
            stroke-width="3"
            opacity="0.5"
            class="animate-pulse"
          />
        )}

        {/* 노란불 */}
        <circle
          cx="100"
          cy="200"
          r="40"
          fill="#FBBF24"
          opacity={getLightOpacity('yellow')}
        />

        {/* 초록불 */}
        <circle
          cx="100"
          cy="315"
          r="40"
          fill="#10B981"
          opacity={getLightOpacity('green')}
        />
      </svg>
    </div>
  );
});`}
        language="tsx"
      />

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        SVG 요소와 속성
      </h2>

      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          사용된 SVG 요소
        </h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              &lt;svg&gt;
            </code>
            : SVG 컨테이너 (width, height, viewBox, <strong>xmlns</strong> 속성)
            <div class="ml-6 mt-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <strong class="text-red-700 dark:text-red-300">⚠️ 중요:</strong>{' '}
              <code class="px-1 py-0.5 bg-red-100 dark:bg-red-900 rounded text-xs">
                xmlns="http://www.w3.org/2000/svg"
              </code>{' '}
              속성이 <strong>반드시 필요합니다</strong>. 이 속성이 없으면
              브라우저가 SVG를 올바르게 렌더링하지 못합니다.
            </div>
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              &lt;rect&gt;
            </code>
            : 사각형 요소 (x, y, width, height, rx for rounded corners)
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              &lt;circle&gt;
            </code>
            : 원 요소 (cx, cy for center position, r for radius)
          </li>
        </ul>

        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3 mt-4">
          동적으로 업데이트되는 속성
        </h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              opacity
            </code>
            : 현재 켜진 신호는 1.0, 나머지는 0.2
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              fill
            </code>
            : 요소의 채우기 색상 (빨강: #EF4444, 노랑: #FBBF24, 초록: #10B981)
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              stroke
            </code>
            : 외곽선 색상 (glow 효과용)
          </li>
          <li>
            <code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              stroke-width
            </code>
            : 외곽선 두께
          </li>
        </ul>
      </div>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 핵심 개념
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>SVG in JSX:</strong> Lithent는 SVG 요소를 JSX 문법으로
            자연스럽게 작성할 수 있습니다.
          </li>
          <li>
            <strong>반응형 SVG 속성:</strong> opacity, fill, stroke 등의 속성이
            state 변경에 따라 자동으로 업데이트됩니다.
          </li>
          <li>
            <strong>조건부 SVG 렌더링:</strong> 켜진 신호에만 glow 효과(외곽
            circle)가 조건부로 렌더링됩니다.
          </li>
          <li>
            <strong>CSS 클래스 적용:</strong> SVG 요소에 Tailwind CSS 클래스
            (animate-pulse, transition-opacity)를 적용할 수 있습니다.
          </li>
          <li>
            <strong>타이머 관리:</strong> setInterval로 자동 모드를 구현하고,
            컴포넌트 상태에 따라 clearInterval로 정리합니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실행 예제
      </h2>

      <div class="my-8">
        <Example17 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        테스트 시나리오
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          1️⃣ 수동 신호 전환
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>"Next Light" 버튼을 클릭하여 신호 전환</li>
          <li>신호가 빨강 → 노랑 → 초록 → 빨강 순서로 순환하는지 확인</li>
          <li>
            현재 켜진 신호만 밝게 표시되고 나머지는 어둡게 표시되는지 확인
          </li>
          <li>켜진 신호에 외곽선 glow 효과(animate-pulse)가 나타나는지 확인</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          2️⃣ 자동 모드 테스트
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>"Auto Mode" 버튼 클릭</li>
          <li>2초마다 자동으로 신호가 전환되는지 확인</li>
          <li>"Next Light" 버튼이 비활성화되는지 확인</li>
          <li>"Stop Auto" 버튼을 눌러 자동 모드를 종료하는지 확인</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          3️⃣ SVG 렌더링 확인
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>신호등의 외곽 박스(rect)가 둥근 모서리로 표시되는지 확인</li>
          <li>3개의 원(circle)이 정확한 위치에 렌더링되는지 확인</li>
          <li>opacity 전환 시 부드러운 transition 효과가 적용되는지 확인</li>
          <li>
            브라우저 개발자 도구로 SVG 요소가 올바른 속성값을 가지는지 확인
          </li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          🌟 실전 활용 사례
        </h3>
        <p class="text-sm text-green-700 dark:text-green-300 mb-2">
          SVG를 사용한 동적 UI 요소는 다음과 같은 경우에 유용합니다:
        </p>
        <ul class="text-sm text-green-700 dark:text-green-300 space-y-1 ml-4">
          <li>
            • <strong>아이콘 시스템</strong>: 상태에 따라 색상과 스타일이 변하는
            동적 아이콘
          </li>
          <li>
            • <strong>데이터 시각화</strong>: 실시간으로 업데이트되는 차트와
            그래프
          </li>
          <li>
            • <strong>애니메이션</strong>: CSS transition과 결합한 부드러운 SVG
            애니메이션
          </li>
          <li>
            • <strong>UI 컴포넌트</strong>: 프로그레스 바, 로딩 스피너, 상태
            표시기 등
          </li>
          <li>
            • <strong>인터랙티브 다이어그램</strong>: 클릭/호버 시 변하는
            다이어그램이나 플로우차트
          </li>
        </ul>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ 주의사항
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            <strong class="text-red-700 dark:text-red-300">
              xmlns 속성 필수:
            </strong>{' '}
            <code class="px-1.5 py-0.5 bg-yellow-200 dark:bg-yellow-900 rounded text-xs font-mono">
              xmlns="http://www.w3.org/2000/svg"
            </code>{' '}
            속성이 반드시 있어야 SVG가 올바르게 렌더링됩니다. 이 속성이 없으면
            브라우저가 SVG 요소를 일반 HTML 요소로 인식하여 제대로 표시되지
            않습니다.
          </li>
          <li>
            <strong>속성 이름:</strong> SVG 속성은 kebab-case를 사용합니다
            (stroke-width, fill-rule 등)
          </li>
          <li>
            <strong>타이머 정리:</strong> setInterval을 사용할 때는 컴포넌트
            언마운트 시 clearInterval로 정리해야 메모리 누수를 방지할 수
            있습니다
          </li>
          <li>
            <strong>viewBox:</strong> viewBox를 사용하면 SVG가 반응형으로
            스케일됩니다
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        관련 가이드
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/guide/state"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/state');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            State 가이드
          </a>{' '}
          - 반응형 상태 관리
        </li>
        <li>
          <a
            href="/guide/updater"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/updater');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Updater 가이드
          </a>{' '}
          - 컴포넌트 업데이트 메커니즘
        </li>
      </ul>
    </div>
  );
});
