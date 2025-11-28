import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const MountHooks = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mount Hooks
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mountCallback이란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountCallback은{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        컴포넌트가 DOM에 마운트된 후 실행되는 훅
      </strong>
      입니다. 마운터 내부에서 호출하며, 컴포넌트가 화면에 표시된 직후에
      실행됩니다.
      <br />
      <br />
      mountCallback의 주요 용도:
      <br />
      <br />
      • 타이머 설정 (setTimeout, setInterval)
      <br />
      • DOM 이벤트 리스너 등록
      <br />
      • 외부 라이브러리 초기화
      <br />
      • 데이터 구독 (subscription)
      <br />
      • 초기 데이터 로딩
      <br />
      <br />
      그리고{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        cleanup 함수를 반환
      </strong>
      하면, 컴포넌트가 언마운트될 때 자동으로 정리 작업을 수행합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback } from 'lithent';

const Timer = mount((renew) => {
  let seconds = 0;

  mountCallback(() => {
    // 마운트 후 실행: 타이머 시작
    const intervalId = setInterval(() => {
      seconds += 1;
      renew();
    }, 1000);

    // cleanup 함수 반환: 언마운트 시 타이머 정리
    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {seconds}s</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      DOM 요소에 접근하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountCallback은 DOM이 생성된 후에 실행되므로, ref로 DOM 요소에 안전하게
      접근할 수 있습니다. 이는 외부 라이브러리를 초기화하거나 DOM 이벤트
      리스너를 등록할 때 유용합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback, ref } from 'lithent';

const Chart = mount(() => {
  const canvasRef = ref<HTMLCanvasElement>(null);

  mountCallback(() => {
    // 이 시점에 canvasRef.value는 실제 DOM 요소
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d');

      // 차트 라이브러리 초기화 (예: Chart.js)
      const chart = new ChartLibrary(ctx, {
        type: 'line',
        data: { /* ... */ }
      });

      // cleanup: 차트 인스턴스 정리
      return () => {
        chart.destroy();
      };
    }
  });

  return () => <canvas ref={canvasRef} width="400" height="300" />;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      이벤트 리스너 등록하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      window나 document 같은 전역 객체에 이벤트 리스너를 등록할 때
      mountCallback을 사용합니다. cleanup 함수에서 리스너를 제거하면 메모리
      누수를 방지할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback } from 'lithent';

const WindowSize = mount((renew) => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  mountCallback(() => {
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renew();
    };

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // cleanup: 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return () => (
    <div>
      Window size: {width} x {height}
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      데이터 구독하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      WebSocket 연결, 이벤트 스트림, 또는 상태 관리 라이브러리 구독 등에도
      mountCallback을 사용합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback } from 'lithent';

const LiveData = mount((renew) => {
  let data = null;
  let status = 'connecting';

  mountCallback(() => {
    // WebSocket 연결
    const ws = new WebSocket('wss://example.com/live');

    ws.onopen = () => {
      status = 'connected';
      renew();
    };

    ws.onmessage = (event) => {
      data = JSON.parse(event.data);
      renew();
    };

    ws.onerror = () => {
      status = 'error';
      renew();
    };

    // cleanup: WebSocket 연결 종료
    return () => {
      ws.close();
    };
  });

  return () => (
    <div>
      <p>Status: {status}</p>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      여러 개의 mountCallback 등록하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      하나의 컴포넌트에서 여러 개의 mountCallback을 등록할 수 있습니다. 각각의
      mountCallback은 독립적으로 동작하며, 등록된 순서대로 실행됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback } from 'lithent';

const MultipleCallbacks = mount((renew) => {
  let mousePos = { x: 0, y: 0 };
  let time = new Date();

  // 첫 번째 mountCallback: 마우스 이동 추적
  mountCallback(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };
      renew();
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  });

  // 두 번째 mountCallback: 시간 업데이트
  mountCallback(() => {
    const intervalId = setInterval(() => {
      time = new Date();
      renew();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  // 세 번째 mountCallback: 초기 로그
  mountCallback(() => {
    console.log('Component mounted!');

    return () => {
      console.log('Component unmounted!');
    };
  });

  return () => (
    <div>
      <p>Mouse: ({mousePos.x}, {mousePos.y})</p>
      <p>Time: {time.toLocaleTimeString()}</p>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      각 mountCallback은 독립적인 cleanup 함수를 가질 수 있어서, 관련된 설정과
      정리 작업을 함께 묶어두면 코드가 깔끔해집니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mountReadyCallback과의 차이
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent는 두 가지 마운트 관련 훅을 제공합니다:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ul class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              mountCallback
            </strong>
            : <strong>DOM 마운트 후</strong> 실행. DOM 요소에 접근 가능하며,
            가장 일반적으로 사용됨.
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              mountReadyCallback
            </strong>
            : <strong>Virtual DOM 생성 직후, DOM 마운트 전</strong> 실행. DOM에
            접근할 수 없지만, 더 빠른 시점에 실행됨.
          </div>
        </li>
      </ul>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback, mountReadyCallback, ref } from 'lithent';

const Example = mount(() => {
  const divRef = ref<HTMLDivElement>(null);

  mountReadyCallback(() => {
    console.log('1. Virtual DOM created');
    console.log('divRef.value:', divRef.value); // null (아직 DOM 없음)
  });

  mountCallback(() => {
    console.log('2. DOM mounted');
    console.log('divRef.value:', divRef.value); // HTMLDivElement (DOM 존재)
  });

  return () => <div ref={divRef}>Hello</div>;
});

// 실행 순서:
// 1. Virtual DOM created
// divRef.value: null
// 2. DOM mounted
// divRef.value: <div>Hello</div>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      대부분의 경우{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        mountCallback
      </strong>
      만 사용하면 충분합니다. mountReadyCallback은 특수한 경우에만 사용합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      동작 원리
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountCallback의 실행 흐름:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>
            마운터 실행 시 mountCallback 호출로 콜백 함수 등록 (아직 실행 안 됨)
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>Virtual DOM을 실제 DOM으로 변환</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>DOM을 화면에 렌더링</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>
            등록된 mountCallback 함수들을 순서대로 실행 (이제 DOM 접근 가능)
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>cleanup 함수가 반환되면 unmount 시점까지 보관</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            6.
          </span>
          <span>
            컴포넌트 언마운트 시 cleanup 함수들을 역순으로 실행하여 정리
          </span>
        </li>
      </ol>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ cleanup은 선택적:</span> cleanup 함수를
        반환하지 않아도 됩니다. 정리 작업이 필요 없다면 아무것도 반환하지
        마세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 마운터에서만 호출:</span> mountCallback은
        마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면
        안 됩니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 비동기 함수 주의:</span> mountCallback에
        async 함수를 전달하면 cleanup 함수를 제대로 등록할 수 없습니다. 비동기
        작업이 필요하다면 내부에서 처리하세요.
        <br />
        <br />
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          {`// ❌ 잘못된 사용
mountCallback(async () => {
  await fetchData();
  return () => cleanup(); // async 함수는 Promise를 반환하므로 작동 안 함
});

// ✅ 올바른 사용
mountCallback(() => {
  fetchData().then(data => { /* ... */ });
  return () => cleanup();
});`}
        </code>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/update-hooks"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/update-hooks');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          기본 기능: Update Hooks →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          컴포넌트가 업데이트될 때 실행되는 updateCallback 훅에 대해 알아보세요.
          <br />
          상태 변경 후 추가 작업을 수행하는 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
