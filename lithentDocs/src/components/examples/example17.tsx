import { mount } from 'lithent';
import { state } from 'lithent/helper';

// 신호등 상태 타입
type LightState = 'red' | 'yellow' | 'green';

export const Example17 = mount(renew => {
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

  const getLightColor = (light: LightState) => {
    switch (light) {
      case 'red':
        return '#EF4444'; // red-500
      case 'yellow':
        return '#FBBF24'; // yellow-400
      case 'green':
        return '#10B981'; // green-500
    }
  };

  const getLightName = (light: LightState) => {
    switch (light) {
      case 'red':
        return '🔴 Stop';
      case 'yellow':
        return '🟡 Ready';
      case 'green':
        return '🟢 Go';
    }
  };

  return () => (
    <div class="w-full max-w-2xl mx-auto">
      <div class="mb-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="text-2xl">🚦</span>
          Traffic Light Controller
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          SVG 요소(circle, rect, text)를 사용한 인터랙티브 신호등 예제입니다
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div class="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div class="flex gap-3 mb-3">
          <button
            onClick={nextLight}
            disabled={autoMode.v}
            class="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm font-semibold"
          >
            ⏭ Next Light
          </button>
          <button
            onClick={toggleAutoMode}
            class={`px-4 py-2 rounded text-white transition-colors text-sm font-semibold ${
              autoMode.v
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {autoMode.v ? '⏸ Stop Auto' : '▶ Auto Mode'}
          </button>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Current Status:{' '}
          <span class="font-semibold text-gray-900 dark:text-white">
            {getLightName(currentLight.v)}
          </span>
          {autoMode.v && (
            <span class="ml-2 text-xs text-blue-600 dark:text-blue-400">
              (Auto switching every 2 seconds)
            </span>
          )}
        </div>
      </div>

      {/* 신호등 SVG */}
      <div class="flex justify-center mb-6">
        <div class="p-8 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl">
          <svg
            width="200"
            height="400"
            viewBox="0 0 200 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 신호등 외곽 */}
            <rect
              x="25"
              y="25"
              width="150"
              height="350"
              rx="20"
              fill="#1F2937"
              stroke="#374151"
              stroke-width="3"
            />

            {/* 빨간불 */}
            <circle
              cx="100"
              cy="85"
              r="40"
              fill={getLightColor('red')}
              opacity={getLightOpacity('red')}
              class="transition-opacity duration-300"
            />
            {currentLight.v === 'red' && (
              <circle
                cx="100"
                cy="85"
                r="45"
                fill="none"
                stroke={getLightColor('red')}
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
              fill={getLightColor('yellow')}
              opacity={getLightOpacity('yellow')}
              class="transition-opacity duration-300"
            />
            {currentLight.v === 'yellow' && (
              <circle
                cx="100"
                cy="200"
                r="45"
                fill="none"
                stroke={getLightColor('yellow')}
                stroke-width="3"
                opacity="0.5"
                class="animate-pulse"
              />
            )}

            {/* 초록불 */}
            <circle
              cx="100"
              cy="315"
              r="40"
              fill={getLightColor('green')}
              opacity={getLightOpacity('green')}
              class="transition-opacity duration-300"
            />
            {currentLight.v === 'green' && (
              <circle
                cx="100"
                cy="315"
                r="45"
                fill="none"
                stroke={getLightColor('green')}
                stroke-width="3"
                opacity="0.5"
                class="animate-pulse"
              />
            )}
          </svg>
        </div>
      </div>

      {/* SVG 요소 설명 */}
      <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
          💡 사용된 SVG 요소
        </h4>
        <div class="text-xs text-blue-700 dark:text-blue-300 space-y-2">
          <div class="flex items-start gap-2">
            <code class="px-2 py-0.5 bg-red-200 dark:bg-red-800 rounded font-mono">
              xmlns
            </code>
            <span>
              <strong class="text-red-700 dark:text-red-300">
                xmlns="http://www.w3.org/2000/svg"
              </strong>{' '}
              - SVG 네임스페이스 선언 (필수!)
            </span>
          </div>
          <div class="flex items-start gap-2">
            <code class="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono">
              &lt;rect&gt;
            </code>
            <span>
              신호등 외곽 박스 (width, height, rx for rounded corners)
            </span>
          </div>
          <div class="flex items-start gap-2">
            <code class="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono">
              &lt;circle&gt;
            </code>
            <span>
              3개의 신호등 (cx, cy for position, r for radius, fill, opacity)
            </span>
          </div>
          <div class="flex items-start gap-2">
            <code class="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono">
              opacity
            </code>
            <span>
              현재 신호: {currentLight.v === 'red' && '빨강(1.0)'}
              {currentLight.v === 'yellow' && '노랑(1.0)'}
              {currentLight.v === 'green' && '초록(1.0)'}, 나머지: 0.2
            </span>
          </div>
          <div class="flex items-start gap-2">
            <code class="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded font-mono">
              stroke
            </code>
            <span>켜진 신호에 외곽선 효과 (animate-pulse로 깜빡임)</span>
          </div>
        </div>
      </div>

      {/* 테스트 요점 */}
      <div class="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <h4 class="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
          🎯 테스트 요점
        </h4>
        <ul class="text-xs text-green-700 dark:text-green-300 space-y-1">
          <li>
            • <strong>SVG 렌더링</strong>: Lithent가 SVG 요소를 정확히
            렌더링하는지 확인
          </li>
          <li>
            • <strong>동적 속성</strong>: opacity, fill, stroke 등의 SVG 속성이
            반응형으로 업데이트됨
          </li>
          <li>
            • <strong>조건부 렌더링</strong>: 켜진 신호에만 외곽 원(glow 효과)이
            표시됨
          </li>
          <li>
            • <strong>CSS transition</strong>: SVG 요소에 Tailwind CSS 클래스
            적용 가능
          </li>
          <li>
            • <strong>Auto Mode</strong>: setInterval로 자동 전환,
            clearInterval로 정리
          </li>
        </ul>
      </div>

      {/* 신호등 작동 설명 */}
      <div class="mt-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <h4 class="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">
          🚦 신호등 작동 방식
        </h4>
        <ol class="text-xs text-purple-700 dark:text-purple-300 space-y-1 list-decimal list-inside">
          <li>
            <strong>빨간불 (🔴 Stop)</strong>: 정지 - 차량 멈춤
          </li>
          <li>
            <strong>노란불 (🟡 Ready)</strong>: 준비 - 출발 준비
          </li>
          <li>
            <strong>초록불 (🟢 Go)</strong>: 출발 - 차량 통과
          </li>
          <li>순환: 빨강 → 노랑 → 초록 → 빨강 (무한 반복)</li>
        </ol>
      </div>
    </div>
  );
});
