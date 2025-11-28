import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Effect = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Effect Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      effect란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      effect는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        부수 효과(Side Effect)를 관리하는 헬퍼
      </strong>
      입니다.
      <br />
      <br />
      컴포넌트의 마운트, 업데이트, 언마운트 시점에 특정 작업을 실행하고, 필요한
      경우 클린업(정리)할 수 있습니다. 내부적으로 mountCallback과
      updateCallback을 사용하여 구현되어 있습니다.
      <br />
      <br />
      API 호출, DOM 이벤트 리스너 등록, 타이머 설정 등의 부수 효과를 선언적으로
      관리할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const Timer = mount(renew => {
  const seconds = state(0, renew);

  let intervalId: number;

  effect(
    () => {
      // 마운트/업데이트 시 실행
      intervalId = setInterval(() => {
        seconds.value += 1;
      }, 1000);
    },
    () => {
      // 클린업
      clearInterval(intervalId);
    },
    () => [] // dependencies (빈 배열 = 마운트 시에만 실행)
  );

  return () => <div>Seconds: {seconds.value}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      effect는 세 가지 인자를 받습니다:
      <br />
      <br />• <strong>forward</strong>: 부수 효과를 실행하는 함수
      <br />• <strong>backward</strong>: 클린업 함수 (선택적)
      <br />• <strong>dependencies</strong>: 의존성 배열을 반환하는 함수
      (선택적, 기본값은 빈 배열)
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { effect } from 'lithent/helper';

const App = mount(renew => {
  effect(
    // forward: 부수 효과 실행
    () => {
      console.log('Effect executed');
    },
    // backward: 클린업 함수 (선택적)
    () => {
      console.log('Cleanup');
    },
    // dependencies: 의존성 배열 반환 함수 (선택적)
    () => []
  );

  return () => <div>Hello</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      핵심 특징
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        1. mount와 lmount 모두 사용 가능
      </strong>
      <br />
      effect는 renew를 필요로 하지 않으므로 mount, lmount 어디서든 사용할 수
      있습니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        2. 의존성 기반 실행
      </strong>
      <br />
      dependencies 배열의 값이 변경되었을 때만 effect가 재실행됩니다. 빈 배열을
      전달하면 마운트 시에만 실행됩니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        3. 자동 클린업
      </strong>
      <br />
      backward 클린업 함수는 컴포넌트 언마운트 시 또는 다음 업데이트 전에
      자동으로 실행됩니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실용적인 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      타이머 구현
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const Timer = mount(renew => {
  const seconds = state(0, renew);
  const isRunning = state(true, renew);
  let intervalId: number;

  effect(
    () => {
      if (!isRunning.value) return;

      intervalId = setInterval(() => {
        seconds.value += 1;
      }, 1000);
    },
    () => {
      // 클린업: 인터벌 제거
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
    () => [isRunning.value] // isRunning이 변경될 때마다 재실행
  );

  return () => (
    <div>
      <p>Seconds: {seconds.value}</p>
      <button onClick={() => (isRunning.value = !isRunning.value)}>
        {isRunning.value ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      DOM 이벤트 리스너
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const WindowSize = mount(renew => {
  const width = state(window.innerWidth, renew);
  const height = state(window.innerHeight, renew);

  const handleResize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  effect(
    () => {
      window.addEventListener('resize', handleResize);
    },
    () => {
      // 클린업: 이벤트 리스너 제거
      window.removeEventListener('resize', handleResize);
    },
    () => [] // 마운트 시에만 실행
  );

  return () => (
    <div>
      Window size: {width.value} x {height.value}
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      API 데이터 가져오기
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const UserProfile = mount<{ userId: number }>((renew, props) => {
  const user = state<any>(null, renew);
  const loading = state(true, renew);
  const error = state<Error | null>(null, renew);
  let cancelled = false;

  effect(
    () => {
      cancelled = false;

      const fetchUser = async () => {
        loading.value = true;
        error.value = null;

        try {
          const response = await fetch(\`/api/users/\${props.userId}\`);
          const data = await response.json();

          if (!cancelled) {
            user.value = data;
          }
        } catch (err) {
          if (!cancelled) {
            error.value = err as Error;
          }
        } finally {
          if (!cancelled) {
            loading.value = false;
          }
        }
      };

      fetchUser();
    },
    () => {
      // 클린업: API 요청 취소 플래그 설정
      cancelled = true;
    },
    () => [props.userId] // userId가 변경될 때마다 재실행
  );

  return () => (
    <div>
      {loading.value && <p>Loading...</p>}
      {error.value && <p>Error: {error.value.message}</p>}
      {user.value && (
        <div>
          <h2>{user.value.name}</h2>
          <p>{user.value.email}</p>
        </div>
      )}
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      로컬 스토리지 동기화
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const ThemeToggle = mount(renew => {
  const theme = state<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    renew
  );

  // 테마 변경 시 로컬 스토리지에 저장
  effect(
    () => {
      localStorage.setItem('theme', theme.value);
      document.body.className = theme.value;
    },
    undefined,
    () => [theme.value]
  );

  return () => (
    <div>
      <p>Current theme: {theme.value}</p>
      <button
        onClick={() => {
          theme.value = theme.value === 'light' ? 'dark' : 'light';
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      의존성 배열 동작
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      dependencies는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        배열을 반환하는 함수
      </strong>
      여야 합니다. 이 함수가 반환하는 배열의 값이 변경되었을 때만 effect가
      재실행됩니다.
      <br />
      <br />
      Lithent는 클로저 기반으로 동작하므로, effect 내부에서 외부 변수를 자유롭게
      참조할 수 있습니다. 의존성 배열은 React와 달리 모든 외부 값을 포함할
      필요가 없으며, 단순히 effect를 재실행할 시점을 결정하는 조건으로만
      사용됩니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      빈 배열: 마운트 시에만 실행
    </h3>

    <CodeBlock
      language="tsx"
      code={`effect(
  () => {
    console.log('Only once on mount');
  },
  undefined,
  () => [] // 빈 배열 = 마운트 시에만 실행
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      특정 값 의존: 값 변경 시마다 실행
    </h3>

    <CodeBlock
      language="tsx"
      code={`const count = state(0, renew);

effect(
  () => {
    console.log('Count changed:', count.value);
  },
  undefined,
  () => [count.value] // count.value가 변경될 때마다 실행
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      여러 값 의존
    </h3>

    <CodeBlock
      language="tsx"
      code={`const count = state(0, renew);
const message = state('', renew);

effect(
  () => {
    console.log('Count or message changed');
  },
  undefined,
  () => [count.value, message.value] // 둘 중 하나라도 변경되면 실행
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      클로저 안전성 (React와의 차이점)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 클로저 기반으로 동작하므로, 의존성 배열에 포함하지 않은 값도
      안전하게 참조할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`const count = state(0, renew);
const multiplier = state(2, renew);

effect(
  () => {
    // multiplier는 의존성 배열에 없지만 안전하게 참조 가능
    console.log('Result:', count.value * multiplier.value);
  },
  undefined,
  () => [count.value] // count 변경 시에만 재실행
);

// count가 변경되면 effect 재실행 (최신 multiplier 값 사용)
// multiplier가 변경되어도 effect는 재실행되지 않음`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        React의 useEffect와 달리, Lithent의 effect는 클로저를 통해 항상 최신
        값을 참조합니다. 의존성 배열은 단순히 "언제 재실행할지"만 결정합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mount vs lmount에서 사용
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      effect는 renew를 필요로 하지 않으므로 mount와 lmount 모두에서 동일하게
      사용할 수 있습니다.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          mount에서 사용
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const App = mount(renew => {
  const count = state(0, renew);

  effect(
    () => {
      console.log('Count:', count.value);
    },
    () => {
      console.log('Cleanup');
    },
    () => [count.value]
  );

  return () => (
    <div>{count.value}</div>
  );
});`}
        />
      </div>
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          lmount에서 사용
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { lmount } from 'lithent';
import { lstate, effect } from 'lithent/helper';

const App = lmount(() => {
  const count = lstate(0);

  effect(
    () => {
      console.log('Count:', count.value);
    },
    () => {
      console.log('Cleanup');
    },
    () => [count.value]
  );

  return () => (
    <div>{count.value}</div>
  );
});`}
        />
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 마운터에서만 호출:</span> effect는 마운터
        내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안
        됩니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 클린업 필수:</span> 타이머, 이벤트 리스너,
        구독 등을 설정한 경우 반드시 클린업 함수에서 정리해야 메모리 누수를
        방지할 수 있습니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 의존성은 함수로 전달:</span> dependencies는
        배열 자체가 아니라 배열을 반환하는 함수여야 합니다. Lithent는 클로저
        기반으로 동작하므로, React와 달리 모든 외부 값을 의존성에 포함하지
        않아도 안전합니다. 의존성 배열은 effect를 재실행할 시점을 결정하는
        용도로만 사용됩니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 비동기 처리:</span> async/await를 사용할
        경우, forward 함수를 async로 만들지 말고 내부에서 async 함수를
        호출하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/store"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/store');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Store →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          전역 상태 관리를 위한 Store 헬퍼에 대해 알아보세요.
          <br />
          여러 컴포넌트 간 상태를 공유하는 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
