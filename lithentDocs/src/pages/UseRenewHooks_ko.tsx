import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const UseRenewHooksKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      useRenew Hook
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      useRenew란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      useRenew는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        lmount 컴포넌트 내에서 renew 함수를 가져오는 훅
      </strong>
      입니다.
      <br />
      <br />
      lmount는 일반적으로 lstate와 같은 반응형 헬퍼와 함께 사용되어 자동으로
      UI가 업데이트됩니다. 하지만 클로저 변수를 사용하면서 수동으로 업데이트를
      트리거해야 하는 특별한 경우에 useRenew를 사용할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count += 1;
    renew(); // 수동으로 업데이트 트리거
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언제 사용해야 할까?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      useRenew는 다음과 같은 특별한 상황에서 유용합니다:
      <br />
      <br />
      • lmount 컴포넌트에서 클로저 변수를 사용할 때
      <br />
      • lstate를 사용하지 않고 단순한 값을 관리할 때
      <br />
      • 외부 라이브러리와의 통합에서 수동 업데이트가 필요할 때
      <br />
      <br />
      하지만 대부분의 경우{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        lstate를 사용하는 것이 더 권장
      </strong>
      됩니다. lstate를 사용하면 자동으로 업데이트되므로 renew를 명시적으로
      호출할 필요가 없습니다.
      <br />
      <br />
      또한 클로저 변수와 함께 renew가 필요하다면,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        lmount + useRenew보다는 그냥 mount를 사용하는 것이 더 효과적
      </strong>
      입니다. mount는 renew를 매개변수로 직접 제공하므로 더 간결하고
      직관적입니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      useRenew vs lstate 비교
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      같은 기능을 useRenew와 lstate로 구현한 예시를 비교해봅시다:
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      useRenew 사용 (수동 업데이트)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count += 1;
    renew(); // 명시적으로 renew 호출 필요
  };

  return () => <div>Count: {count}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      lstate 사용 (자동 업데이트) - 권장
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);

  const increment = () => {
    count.value += 1; // 자동으로 업데이트됨
  };

  return () => <div>Count: {count.value}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 권장사항:
        </span>{' '}
        lmount를 사용한다면 lstate를 함께 사용하는 것이 더 간결하고
        직관적입니다. useRenew는 특별한 경우에만 사용하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실용적인 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      외부 라이브러리 통합
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      외부 라이브러리의 이벤트를 받아서 UI를 업데이트해야 할 때 useRenew가
      유용할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount, useRenew, mountCallback } from 'lithent';

const ExternalLibComponent = lmount(() => {
  let data = null;
  const renew = useRenew();

  mountCallback(() => {
    // 외부 라이브러리 초기화
    const library = initExternalLibrary();

    // 외부 라이브러리의 이벤트 리스너
    library.on('data', (newData) => {
      data = newData;
      renew(); // 데이터 변경 시 업데이트
    });

    // cleanup: 언마운트 시 리스너 제거
    return () => {
      library.off('data');
    };
  });

  return () => (
    <div>
      {data ? <p>Data: {JSON.stringify(data)}</p> : <p>Loading...</p>}
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      타이머 예제
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount, useRenew, mountCallback } from 'lithent';

const Timer = lmount(() => {
  let seconds = 0;
  const renew = useRenew();

  mountCallback(() => {
    const intervalId = setInterval(() => {
      seconds += 1;
      renew();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {seconds} seconds</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mount vs lmount + useRenew
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lmount에서 useRenew를 사용하는 것과 mount를 사용하는 것은 거의 동일합니다.
      차이점은 renew 함수를 어떻게 받느냐입니다.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          mount (renew 매개변수로 받음)
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { mount } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const inc = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
        />
      </div>
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          lmount + useRenew (훅으로 받음)
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { lmount, useRenew } from 'lithent';

const Counter = lmount(() => {
  let count = 0;
  const renew = useRenew();

  const inc = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});`}
        />
      </div>
    </div>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        두 방식 모두 동일하게 동작합니다. 클로저 변수를 사용한다면 mount를
        사용하는 것이 더 일반적이고, lmount는 lstate 같은 반응형 헬퍼와 함께
        사용하는 것이 권장됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ lmount에서만 사용:</span> useRenew는 lmount
        컴포넌트 내에서만 사용할 수 있습니다. mount 컴포넌트에서는 매개변수로
        renew를 직접 받으므로 useRenew가 필요 없습니다.
        <br />
        <br />
        <span class="font-medium">⚠️ lstate 사용 권장:</span> lmount를
        사용한다면 대부분의 경우 lstate를 사용하는 것이 더 직관적입니다.
        useRenew는 특별한 경우에만 사용하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 마운터에서만 호출:</span> useRenew는 마운터
        내부에서만 호출해야 합니다. Updater나 이벤트 핸들러에서 호출하면 안
        됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/state"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/state');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: State →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Core 기능 학습을 완료했습니다!
          <br />
          이제 Helper 기능을 알아봅시다. State 헬퍼부터 시작해보세요.
        </p>
      </a>
    </div>
  </div>
);
