import { mount } from 'lithent';
import { Example15 } from '@/components/examples/example15';
import { CodeBlock } from '@/components/CodeBlock';

export const Example15Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Example 15: Nested Props Update (Volume Controller)
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        이 예제는 부모 컴포넌트에서 관리하는 상태가 여러 단계의 중첩된
        컴포넌트들에게 props를 통해 어떻게 전달되고 업데이트되는지를
        테스트합니다. 하나의 volume 값이 3개의 컴포넌트에서 다른 방식으로
        표현됩니다.
      </p>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 테스트 요점
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nested Props Update</strong>: 부모 컴포넌트의 state가 변경될
          때, props로 전달된 값이 모든 중첩된 자식 컴포넌트에 정확하게
          전파되는지 확인합니다. 이는 Lithent의 반응형 시스템이 올바르게
          동작하는지 검증하는 핵심 테스트입니다.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        컴포넌트 구조
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        이 예제는 3단계 중첩 구조를 가진 볼륨 컨트롤 시스템입니다:
      </p>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Root</strong>: volume state 관리 (0-100)
        </li>
        <li>
          <strong>Depth 1 (VolumeDisplay)</strong>: 숫자로 volume 표시
        </li>
        <li>
          <strong>Depth 2 (VolumeBar)</strong>: 프로그레스 바로 volume 표시
        </li>
        <li>
          <strong>Depth 3 (VolumeEmoji)</strong>: 이모지로 volume 표시 (🔇 🔈 🔉
          🔊)
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        코드 예제
      </h2>

      <CodeBlock
        code={`import { mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

// Depth 3: 이모지로 볼륨 표시
const VolumeEmoji = mount<{ volume: number }>(() => ({ volume }) => {
  const getEmoji = (vol: number) => {
    if (vol === 0) return '🔇';
    if (vol < 30) return '🔈';
    if (vol < 70) return '🔉';
    return '🔊';
  };

  return <div>{getEmoji(volume)}</div>;
});

// Depth 2: 프로그레스 바로 볼륨 표시
const VolumeBar = mount<{ volume: number }>(() => ({ volume }) => {
  return (
    <div>
      <div class="progress-bar" style={{ width: \`\${volume}%\` }} />
      <VolumeEmoji volume={volume} />
    </div>
  );
});

// Depth 1: 숫자로 볼륨 표시
const VolumeDisplay = mount<{ volume: number }>(() => ({ volume }) => {
  return (
    <Fragment>
      <div class="volume-number">{volume}</div>
      <VolumeBar volume={volume} />
    </Fragment>
  );
});

// Root: 볼륨 상태 관리
const VolumeController = mount(renew => {
  const volume = state(50, renew);

  const increase = () => {
    if (volume.v < 100) volume.v += 10;
  };

  return () => (
    <div>
      <button onClick={increase}>+10</button>
      <VolumeDisplay volume={volume.v} />
    </div>
  );
});`}
        language="tsx"
      />

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Props 전달 흐름
      </h2>

      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <pre class="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre">
          {`Root Component
  ├─ volume: state<number>
  │
  └─> VolumeDisplay (Depth 1)
       ├─ props: { volume: number }
       │
       └─> VolumeBar (Depth 2)
            ├─ props: { volume: number }
            │
            └─> VolumeEmoji (Depth 3)
                 └─ props: { volume: number }`}
        </pre>
      </div>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        Root 컴포넌트에서{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          volume.v
        </code>
        가 변경되면:
      </p>

      <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
        <li>Root의 updater 함수가 실행되어 새로운 가상 DOM 생성</li>
        <li>VolumeDisplay가 새로운 volume prop을 받아 업데이트</li>
        <li>VolumeBar가 새로운 volume prop을 받아 업데이트</li>
        <li>VolumeEmoji가 새로운 volume prop을 받아 동시에 업데이트</li>
      </ol>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 핵심 개념
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>단방향 데이터 흐름:</strong> Props는 항상 부모에서
            자식으로만 흐릅니다.
          </li>
          <li>
            <strong>불변성:</strong> Props는 자식 컴포넌트에서 직접 수정할 수
            없습니다.
          </li>
          <li>
            <strong>자동 업데이트:</strong> 부모의 state가 변경되면 props를 받는
            모든 자식이 자동으로 업데이트됩니다.
          </li>
          <li>
            <strong>효율적인 렌더링:</strong> Lithent는 변경된 부분만 효율적으로
            업데이트합니다.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실행 예제
      </h2>

      <div class="my-8">
        <Example15 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        테스트 시나리오
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          1️⃣ 슬라이더로 테스트
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>슬라이더를 움직여 volume 값을 변경</li>
          <li>
            VolumeDisplay(숫자), VolumeBar(바), VolumeEmoji(이모지)가 모두
            동시에 업데이트되는지 확인
          </li>
          <li>값이 실시간으로 전파되는 것을 확인</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          2️⃣ 버튼으로 테스트
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>+/- 버튼을 클릭하여 10씩 증감</li>
          <li>각 버튼 클릭마다 모든 컴포넌트가 업데이트되는지 확인</li>
          <li>0과 100에서 버튼이 비활성화되는지 확인</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          3️⃣ 이모지 변화 확인
        </h3>
        <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>0: 🔇 (음소거)</li>
          <li>1-29: 🔈 (낮은 볼륨)</li>
          <li>30-69: 🔉 (중간 볼륨)</li>
          <li>70-100: 🔊 (높은 볼륨)</li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ 주의사항
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            Props는 읽기 전용입니다. 자식 컴포넌트에서 props를 직접 수정하지
            마세요.
          </li>
          <li>
            Props 변경은 부모 컴포넌트의 state나 변수를 통해서만 이루어져야
            합니다.
          </li>
          <li>
            중첩이 깊을수록 성능에 영향을 줄 수 있으므로, 불필요한 중첩은
            피하세요.
          </li>
          <li>Props drilling이 너무 깊어지면 Context API 사용을 고려하세요.</li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        실전 활용 사례
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>다단계 폼:</strong> 회원가입이나 결제 과정에서 단계별로
          데이터를 전달
        </li>
        <li>
          <strong>대시보드:</strong> 사용자 정보를 여러 위젯 컴포넌트에 전달
        </li>
        <li>
          <strong>테마 시스템:</strong> 테마 설정을 모든 UI 컴포넌트에 전파
        </li>
        <li>
          <strong>권한 관리:</strong> 사용자 권한을 기반으로 UI를 조건부 렌더링
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        관련 예제
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/guide/props"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/props');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Props 가이드
          </a>{' '}
          - Props 기본 사용법
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
