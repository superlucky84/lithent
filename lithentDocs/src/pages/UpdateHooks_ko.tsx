import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const UpdateHooksKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Update Hooks
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      updateCallback이란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      updateCallback은{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        컴포넌트가 업데이트될 때 실행되는 훅
      </strong>
      입니다. 중요한 점은{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        두 단계로 동작
      </strong>
      한다는 것입니다:
      <br />
      <br />
      1.{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        updateCallback 함수 자체
      </strong>
      : dependencies가 변경되었을 때 <strong>업데이트 전에</strong> 실행
      <br />
      2.{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        반환하는 함수
      </strong>
      : <strong>DOM 업데이트 후에</strong> 실행
      <br />
      <br />
      updateCallback의 주요 용도:
      <br />
      <br />
      • 업데이트 전 준비 작업 (데이터 가져오기, 계산 등)
      <br />
      • DOM 업데이트 후 작업 (스크롤 조정, 애니메이션 등)
      <br />
      • 외부 라이브러리와 동기화
      <br />• 특정 값 변경 감지 및 부수 효과 실행
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  updateCallback(() => {
    console.log('1. 업데이트 전: Count is', count);

    // 반환하는 함수는 DOM 업데이트 후 실행
    return () => {
      console.log('2. 업데이트 후: DOM updated with count', count);
    };
  });

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// 버튼 클릭 시 출력 순서:
// 1. 업데이트 전: Count is 1
// (DOM 업데이트)
// 2. 업데이트 후: DOM updated with count 1`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      dependencies로 실행 조건 지정하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      updateCallback의 두 번째 인자로{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        dependencies 함수
      </strong>
      를 전달하면, 지정한 값이 변경되었을 때만 실행됩니다. 이는 불필요한 실행을
      방지하여 성능을 최적화합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback } from 'lithent';

const UserProfile = mount((renew) => {
  let userId = 1;
  let theme = 'light';

  const changeUser = () => {
    userId += 1;
    renew();
  };

  const toggleTheme = () => {
    theme = theme === 'light' ? 'dark' : 'light';
    renew();
  };

  // userId가 변경될 때만 실행
  updateCallback(() => {
    console.log('User changed! Loading new data for user:', userId);
    // API 호출 등 부수 효과 실행
  }, () => [userId]); // dependencies: userId만 감시

  // theme가 변경될 때만 실행
  updateCallback(() => {
    console.log('Theme changed to:', theme);
    document.body.className = theme;
  }, () => [theme]); // dependencies: theme만 감시

  return () => (
    <div>
      <p>User ID: {userId}</p>
      <p>Theme: {theme}</p>
      <button onClick={changeUser}>Change User</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      위 예제에서 "Change User"를 클릭하면 userId 관련 updateCallback만
      실행되고, "Toggle Theme"를 클릭하면 theme 관련 updateCallback만
      실행됩니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      반환 함수: DOM 업데이트 후 작업
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      updateCallback이 반환하는 함수는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        DOM 업데이트 후
      </strong>
      에 실행됩니다. 이는 업데이트된 DOM에 접근하거나 외부 라이브러리를 동기화할
      때 유용합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback, ref } from 'lithent';

const AnimatedBox = mount((renew) => {
  const boxRef = ref<HTMLDivElement>(null);
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  updateCallback(() => {
    console.log('업데이트 시작, count:', count);

    // 반환 함수: DOM 업데이트 후 실행
    return () => {
      if (boxRef.value) {
        // 업데이트된 DOM 요소에 애니메이션 적용
        boxRef.value.classList.add('flash');
        setTimeout(() => {
          boxRef.value?.classList.remove('flash');
        }, 300);
        console.log('DOM 업데이트 완료, 애니메이션 실행');
      }
    };
  }, () => [count]);

  return () => (
    <div>
      <div ref={boxRef}>Count: {count}</div>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 예제는 count가 변경될 때마다 DOM 업데이트 후 애니메이션을 트리거합니다.
      반환 함수가 실행되는 시점에는 이미 DOM이 업데이트되어 있으므로,
      boxRef.value로 최신 DOM 요소에 안전하게 접근할 수 있습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실전 예제: 채팅 스크롤 자동 조정
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      반환 함수는 DOM 업데이트 후 실행되므로, 새로운 DOM 요소에 접근할 수
      있습니다. 채팅 메시지가 추가될 때 스크롤을 자동으로 맨 아래로 이동하는
      예제입니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback, ref } from 'lithent';

const ChatMessages = mount((renew) => {
  const messages = [];
  const containerRef = ref<HTMLDivElement>(null);

  const addMessage = (text: string) => {
    messages.push({ id: Date.now(), text });
    renew();
  };

  // messages가 변경될 때마다 실행
  updateCallback(() => {
    console.log('메시지 개수:', messages.length);

    // 반환 함수: DOM 업데이트 후 스크롤 조정
    return () => {
      if (containerRef.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight;
        console.log('스크롤 위치 조정 완료');
      }
    };
  }, () => [messages.length]);

  return () => (
    <div>
      <div ref={containerRef} style="height: 300px; overflow-y: auto;">
        {messages.map(msg => (
          <div key={msg.id}>{msg.text}</div>
        ))}
      </div>
      <button onClick={() => addMessage('New message')}>
        Add Message
      </button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실전 예제: 외부 라이브러리 동기화
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent의 상태가 변경될 때 외부 차트 라이브러리를 동기화하는 예제입니다.
      업데이트 전에 데이터를 준비하고, DOM 업데이트 후 차트를 갱신합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback, ref } from 'lithent';

const DataChart = mount((renew) => {
  const canvasRef = ref<HTMLCanvasElement>(null);
  const data = [10, 20, 30, 40, 50];
  let chart = null;

  const addData = () => {
    data.push(Math.floor(Math.random() * 100));
    renew();
  };

  updateCallback(() => {
    console.log('데이터 준비:', data.length, 'points');

    // 반환 함수: DOM 업데이트 후 차트 동기화
    return () => {
      if (!canvasRef.value) return;

      if (!chart) {
        // 첫 실행: 차트 생성
        chart = new ChartLibrary(canvasRef.value, {
          type: 'line',
          data: { values: data }
        });
        console.log('차트 생성 완료');
      } else {
        // 이후 실행: 차트 데이터 갱신
        chart.updateData({ values: data });
        console.log('차트 업데이트 완료');
      }
    };
  }, () => [data.length]);

  return () => (
    <div>
      <canvas ref={canvasRef} />
      <button onClick={addData}>Add Data Point</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      여러 개의 updateCallback 등록하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      하나의 컴포넌트에서 여러 개의 updateCallback을 등록할 수 있습니다. 각각
      다른 dependencies를 가질 수 있어서, 관련된 로직을 분리하여 관리할 수
      있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback } from 'lithent';

const Dashboard = mount((renew) => {
  let activeTab = 'overview';
  let dataRefreshCount = 0;
  let lastUpdate = new Date();

  const switchTab = (tab: string) => {
    activeTab = tab;
    renew();
  };

  const refreshData = () => {
    dataRefreshCount += 1;
    lastUpdate = new Date();
    renew();
  };

  // 1. activeTab 변경 시 로깅
  updateCallback(() => {
    console.log('Tab switched to:', activeTab);
    // 분석 전송
  }, () => [activeTab]);

  // 2. 데이터 갱신 시 알림 표시
  updateCallback(() => {
    if (dataRefreshCount > 0) {
      console.log('Data refreshed at:', lastUpdate);
      // 토스트 알림 표시
    }
  }, () => [dataRefreshCount]);

  // 3. 모든 업데이트 시 실행 (dependencies 없음)
  updateCallback(() => {
    console.log('Component updated');
  });

  return () => (
    <div>
      <button onClick={() => switchTab('overview')}>Overview</button>
      <button onClick={() => switchTab('details')}>Details</button>
      <button onClick={refreshData}>Refresh Data</button>
      <div>Active: {activeTab}</div>
      <div>Refresh count: {dataRefreshCount}</div>
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
      여야 합니다. 이 함수가 반환하는 배열의 값이 변경되었을 때만
      updateCallback이 실행됩니다.
      <br />
      <br />
      Lithent는 클로저 기반으로 동작하므로, updateCallback 내부에서 외부 변수를
      자유롭게 참조할 수 있습니다. 의존성 배열은 React와 달리 모든 외부 값을
      포함할 필요가 없으며, 단순히 콜백을 재실행할 시점을 결정하는 조건으로만
      사용됩니다.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 왜 함수로 설계되었나요?</span>
        <br />
        <br />
        Lithent는 <strong class="font-semibold">클로저 기반 상태 관리</strong>를
        사용합니다. 컴포넌트의 상태(userId, status 등)는 클로저 변수로 존재하며,
        매 업데이트 시점마다 변경 여부를 확인하려면{' '}
        <strong class="font-semibold">그 시점의 최신 값</strong>을 읽어야
        합니다.
        <br />
        <br />
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          () =&gt; [userId, status]
        </code>
        처럼 함수로 설계하면, 의존성을 확인할 때마다 이 함수를 호출하여{' '}
        <strong class="font-semibold">항상 최신 클로저 값</strong>을 가져올 수
        있습니다. 함수 호출 시점에 userId와 status의 현재 값을 읽어 배열로
        반환하므로, 이전 값과 비교하여 변경 여부를 정확히 감지할 수 있습니다.
      </p>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, updateCallback } from 'lithent';

const UserProfile = mount<{ userId: number }>((renew, props) => {
  // 클로저 변수로 상태 관리
  let userName = 'John';
  let userAge = 25;

  updateCallback(() => {
    console.log('User or age changed!');
  }, () => [userName, userAge]);
  // ☝️ 함수를 호출하여 [userName, userAge]를 반환
  //    매 업데이트 시점의 최신 값으로 배열 생성

  const updateName = () => {
    userName = 'Jane';
    renew();
    // renew 호출 → 업데이트 시작
    // → () => [userName, userAge] 함수 실행
    // → ['Jane', 25] 반환
    // → 이전 값 ['John', 25]와 비교
    // → 변경 감지! updateCallback 실행
  };

  return () => (
    <div>
      <h1>User: {userName}</h1>
      <p>Age: {userAge}</p>
      <button onClick={updateName}>Change Name</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        React의 useEffect와 달리, Lithent의 updateCallback은 클로저를 통해 항상
        최신 값을 참조합니다. 의존성 배열은 단순히 "언제 재실행할지"만
        결정합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mountCallback vs updateCallback
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      두 훅의 차이를 명확히 이해하는 것이 중요합니다:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ul class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              mountCallback
            </strong>
            : 컴포넌트가 <strong>처음 마운트될 때 단 한 번</strong> 실행. 초기화
            작업에 적합.
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">•</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              updateCallback
            </strong>
            : 컴포넌트가 <strong>업데이트될 때마다</strong> 실행. 상태 변경에
            대한 부수 효과에 적합.
          </div>
        </li>
      </ul>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, mountCallback, updateCallback } from 'lithent';

const Example = mount((renew) => {
  let count = 0;

  // 마운트 시 단 한 번 실행
  mountCallback(() => {
    console.log('1. mountCallback 실행');

    return () => {
      console.log('Unmounted!');
    };
  });

  // 매 업데이트마다 실행 (마운트 시에도 실행됨)
  updateCallback(() => {
    console.log('2. updateCallback 실행 (업데이트 전)');

    return () => {
      console.log('3. updateCallback 반환 함수 (DOM 업데이트 후)');
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
// 1. mountCallback 실행
// 2. updateCallback 실행 (업데이트 전)
// (DOM 마운트)
// 3. updateCallback 반환 함수 (DOM 업데이트 후)

// 버튼 클릭 시:
// 2. updateCallback 실행 (업데이트 전)
// (DOM 업데이트)
// 3. updateCallback 반환 함수 (DOM 업데이트 후)`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      동작 원리
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      updateCallback의 실행 흐름:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>마운터 실행 시 updateCallback 호출로 콜백 함수 등록</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>renew() 호출로 Updater 실행 → 새로운 Virtual DOM 생성</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>등록된 updateCallback들의 dependencies 확인</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>
            dependencies가 변경된 경우, effectAction <strong>즉시 실행</strong>
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>effectAction이 반환하는 함수를 큐(upCB)에 저장</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            6.
          </span>
          <span>Virtual DOM 비교 및 실제 DOM 업데이트</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            7.
          </span>
          <span>큐에 저장된 반환 함수들을 순서대로 실행 (DOM 업데이트 후)</span>
        </li>
      </ol>
    </div>

    <CodeBlock
      language="tsx"
      code={`// 실행 흐름 예시
updateCallback(() => {
  console.log('A. dependencies 변경 감지됨 - 즉시 실행');

  return () => {
    console.log('B. DOM 업데이트 후 실행');
  };
}, () => [someValue]);

// renew() 호출 시:
// 1. Updater 실행 (Virtual DOM 생성)
// 2. dependencies 확인
// 3. "A. dependencies 변경 감지됨 - 즉시 실행" 출력
// 4. 반환 함수 큐에 저장
// 5. DOM 업데이트
// 6. "B. DOM 업데이트 후 실행" 출력`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 두 단계 실행 이해하기:</span>{' '}
        updateCallback 자체는 dependencies 변경 시 즉시 실행되고, 반환 함수는
        DOM 업데이트 후 실행됩니다. 이 차이를 정확히 이해해야 합니다.
        <br />
        <br />
        <span class="font-medium">⚠️ dependencies는 함수로 전달:</span>{' '}
        dependencies는 배열이 아닌 <strong>배열을 반환하는 함수</strong>로
        전달해야 합니다. Lithent의 클로저 기반 상태 관리 방식 때문입니다. 자세한
        내용은 위의 "의존성 배열 동작" 섹션을 참고하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 무한 루프 주의:</span> 반환 함수에서
        renew()를 호출하면 무한 루프가 발생할 수 있습니다. 조건부로 renew()를
        호출하거나 dependencies를 잘 설정하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 마운터에서만 호출:</span> updateCallback은
        마운터 내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면
        안 됩니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 첫 렌더링에도 실행:</span> updateCallback은
        마운트 시점에도 실행됩니다. 마운트 이후 업데이트만 감지하려면 별도의
        플래그를 사용하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/mount-ready-hooks"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/mount-ready-hooks');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          기본 기능: Mount Ready Hooks →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Virtual DOM 생성 직후 실행되는 mountReadyCallback 훅에 대해
          알아보세요.
          <br />
          DOM 마운트 전에 실행해야 하는 작업을 처리하는 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
