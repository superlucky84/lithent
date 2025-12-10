import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const MountReadyHooksKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Mount Ready Hooks
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mountReadyCallback이란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountReadyCallback은{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Virtual DOM이 생성된 직후, 실제 DOM에 마운트되기 전에 실행되는 훅
      </strong>
      입니다.
      <br />
      <br />
      mountCallback보다{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        더 빠른 시점
      </strong>
      에 실행되므로, DOM이 필요 없는 초기화 작업에 적합합니다. 하지만 이
      시점에는 아직 실제 DOM이 생성되지 않았으므로,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        ref.value는 null
      </strong>
      입니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback } from 'lithent';

const Component = mount((renew) => {
  let isInitialized = false;

  mountReadyCallback(() => {
    console.log('Virtual DOM 생성됨 (DOM은 아직 없음)');
    isInitialized = true;

    // cleanup 함수: 언마운트 시 실행
    return () => {
      console.log('Component unmounted');
    };
  });

  return () => <div>{isInitialized ? 'Initialized' : 'Not ready'}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mountCallback vs mountReadyCallback
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      두 훅의 차이를 정확히 이해하는 것이 중요합니다:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ul class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              mountReadyCallback
            </strong>
            : Virtual DOM 생성 직후 실행. <strong>DOM 접근 불가</strong>. 더
            빠른 초기화.
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              mountCallback
            </strong>
            : 실제 DOM 마운트 후 실행. <strong>DOM 접근 가능</strong>. 가장
            일반적으로 사용.
          </div>
        </li>
      </ul>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback, mountCallback, ref } from 'lithent';

const Example = mount(() => {
  const divRef = ref<HTMLDivElement>(null);

  mountReadyCallback(() => {
    console.log('1. mountReadyCallback 실행');
    console.log('   divRef.value:', divRef.value); // null
  });

  mountCallback(() => {
    console.log('2. mountCallback 실행');
    console.log('   divRef.value:', divRef.value); // <div>Hello</div>
  });

  return () => <div ref={divRef}>Hello</div>;
});

// 실행 순서:
// 1. mountReadyCallback 실행
//    divRef.value: null
// (DOM 생성 및 마운트)
// 2. mountCallback 실행
//    divRef.value: <div>Hello</div>`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언제 사용해야 할까?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountReadyCallback은 특수한 경우에만 사용됩니다. 대부분의 경우
      mountCallback으로 충분합니다.
      <br />
      <br />
      mountReadyCallback이 적합한 경우:
      <br />
      <br />
      • DOM이 필요 없는 데이터 초기화
      <br />
      • 상태 관리 구독 (store subscription)
      <br />
      • 로깅 및 분석 초기화
      <br />
      • 가능한 한 빠른 시점의 초기화가 필요한 경우
      <br />
      <br />
      mountCallback이 적합한 경우:
      <br />
      <br />
      • DOM 요소 접근이 필요한 경우 (대부분의 경우)
      <br />
      • 외부 라이브러리 초기화 (차트, 에디터 등)
      <br />
      • DOM 이벤트 리스너 등록
      <br />• 타이머 설정
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      데이터 초기화 예제
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      DOM이 필요 없는 데이터 초기화는 mountReadyCallback을 사용하여 더 빠르게
      수행할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback } from 'lithent';

const DataLoader = mount((renew) => {
  let data = null;
  let loading = true;

  mountReadyCallback(() => {
    console.log('데이터 로딩 시작 (DOM 생성 전)');

    // 비동기 데이터 로딩
    fetch('/api/initial-data')
      .then(res => res.json())
      .then(result => {
        data = result;
        loading = false;
        renew();
        console.log('데이터 로딩 완료');
      });

    // cleanup: 언마운트 시 진행 중인 요청 취소 등
    return () => {
      console.log('Component unmounting');
    };
  });

  return () => (
    <div>
      {loading ? <p>Loading...</p> : <p>Data: {JSON.stringify(data)}</p>}
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 예제는 DOM이 생성되기 전에 데이터 로딩을 시작하여, 초기 렌더링 성능을
      개선할 수 있습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      상태 관리 구독 예제
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      전역 상태 관리 스토어 구독은 DOM과 무관하므로 mountReadyCallback을 사용할
      수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback } from 'lithent';
import { globalStore } from './store';

const StoreSubscriber = mount((renew) => {
  let storeData = globalStore.getState();

  mountReadyCallback(() => {
    console.log('스토어 구독 시작');

    // 스토어 구독
    const unsubscribe = globalStore.subscribe((newState) => {
      storeData = newState;
      renew();
    });

    // cleanup: 언마운트 시 구독 해제
    return () => {
      console.log('스토어 구독 해제');
      unsubscribe();
    };
  });

  return () => (
    <div>
      <p>User: {storeData.user.name}</p>
      <p>Theme: {storeData.theme}</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      여러 개의 mountReadyCallback 등록하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountCallback과 마찬가지로, 여러 개의 mountReadyCallback을 등록할 수
      있습니다. 각각 독립적인 cleanup 함수를 가질 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback } from 'lithent';

const MultipleReady = mount((renew) => {
  let analyticsReady = false;
  let dataReady = false;

  // 첫 번째 mountReadyCallback: 분석 초기화
  mountReadyCallback(() => {
    console.log('Analytics 초기화');
    analytics.init();
    analyticsReady = true;

    return () => {
      analytics.cleanup();
    };
  });

  // 두 번째 mountReadyCallback: 데이터 프리페치
  mountReadyCallback(() => {
    console.log('데이터 프리페치 시작');
    prefetchData();
    dataReady = true;

    return () => {
      cancelPrefetch();
    };
  });

  return () => (
    <div>
      <p>Analytics: {analyticsReady ? 'Ready' : 'Loading'}</p>
      <p>Data: {dataReady ? 'Ready' : 'Loading'}</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      동작 원리
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountReadyCallback의 실행 흐름:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>
            마운터 실행 시 mountReadyCallback 호출로 콜백 함수 등록 (아직 실행
            안 됨)
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>Updater 실행 → Virtual DOM 생성</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>
            Virtual DOM 생성 직후, 등록된 mountReadyCallback 함수들을 순서대로
            실행
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>cleanup 함수가 반환되면 unmount 시점까지 보관</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>Virtual DOM을 실제 DOM으로 변환</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            6.
          </span>
          <span>DOM을 화면에 렌더링</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            7.
          </span>
          <span>mountCallback 함수들 실행 (이제 DOM 접근 가능)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            8.
          </span>
          <span>
            컴포넌트 언마운트 시 cleanup 함수들을 역순으로 실행하여 정리
          </span>
        </li>
      </ol>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      mountReadyCallback은 3단계에서 실행되고, mountCallback은 7단계에서
      실행됩니다. 이 차이가 두 훅의 핵심입니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      전체 생명주기 흐름
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      모든 훅의 실행 순서를 종합하면 다음과 같습니다:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountReadyCallback, mountCallback, updateCallback } from 'lithent';

const FullLifecycle = mount((renew) => {
  let count = 0;

  mountReadyCallback(() => {
    console.log('1. mountReadyCallback (Virtual DOM 생성 직후)');

    return () => {
      console.log('Cleanup: mountReadyCallback');
    };
  });

  mountCallback(() => {
    console.log('2. mountCallback (DOM 마운트 후)');

    return () => {
      console.log('Cleanup: mountCallback');
    };
  });

  updateCallback(() => {
    console.log('3. updateCallback (업데이트 전)');

    return () => {
      console.log('4. updateCallback 반환 함수 (DOM 업데이트 후)');
    };
  });

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// 마운트 시:
// 1. mountReadyCallback (Virtual DOM 생성 직후)
// 2. mountCallback (DOM 마운트 후)
// 3. updateCallback (업데이트 전)
// 4. updateCallback 반환 함수 (DOM 업데이트 후)

// 버튼 클릭 시:
// 3. updateCallback (업데이트 전)
// (DOM 업데이트)
// 4. updateCallback 반환 함수 (DOM 업데이트 후)

// 언마운트 시:
// Cleanup: updateCallback
// Cleanup: mountCallback
// Cleanup: mountReadyCallback`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ DOM 접근 불가:</span> mountReadyCallback
        실행 시점에는 아직 DOM이 생성되지 않았습니다. ref.value는 항상
        null입니다. DOM이 필요하다면 mountCallback을 사용하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 대부분 불필요:</span> 대부분의 경우
        mountCallback으로 충분합니다. mountReadyCallback은 정말 빠른 초기화가
        필요하거나 DOM이 절대 필요 없는 경우에만 사용하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ cleanup은 선택적:</span> cleanup 함수를
        반환하지 않아도 됩니다. 정리 작업이 필요 없다면 아무것도 반환하지
        마세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 마운터에서만 호출:</span>{' '}
        mountReadyCallback은 마운터 내부에서만 호출해야 합니다. Updater나 이벤트
        핸들러에서 호출하면 안 됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      요약: 어떤 훅을 사용해야 할까?
    </h2>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 권장 사용법:
        </span>
        <br />
        <br />
        <strong>99%의 경우 → mountCallback 사용</strong>
        <br />
        DOM 접근이 필요하거나, 일반적인 초기화 작업에 사용하세요.
        <br />
        <br />
        <strong>DOM 없이 최대한 빨리 초기화 → mountReadyCallback 사용</strong>
        <br />
        데이터 프리페치, 스토어 구독, 분석 초기화 등 특수한 경우에만 사용하세요.
        <br />
        <br />
        <strong>매 업데이트마다 작업 → updateCallback 사용</strong>
        <br />
        상태 변경 시마다 부수 효과가 필요한 경우 사용하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/inner-html"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/inner-html');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          콘텐츠 렌더링: innerHTML →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Markdown이나 서버에서 내려온 HTML 문자열을 그대로 렌더링할 수 있는
          innerHTML 사용법과 보안 주의사항을 살펴봅니다.
        </p>
      </a>
    </div>
  </div>
);
