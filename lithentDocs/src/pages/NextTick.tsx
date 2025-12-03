import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const NextTick = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      nextTick
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      nextTick이란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick은{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        현재 실행 컨텍스트가 끝난 후 다음 마이크로태스크 큐에서 실행되도록
        보장하는 함수
      </strong>
      입니다.
      <br />
      <br />
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Promise.resolve()
      </code>
      를 반환하는 간단한 API로,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        DOM 업데이트가 완료된 후
      </strong>
      에 특정 작업을 수행해야 할 때 유용합니다.
      <br />
      <br />
      renew()를 호출하면 Virtual DOM이 생성되고 실제 DOM이 업데이트됩니다. 이
      과정은 동기적으로 실행되지만, nextTick을 사용하면 DOM 업데이트가 완전히
      끝난 후의 시점을 보장받을 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const Counter = mount((renew) => {
  const divRef = ref<HTMLDivElement>(null);
  let count = 0;

  const increase = async () => {
    count += 1;
    renew(); // DOM 업데이트 시작

    // nextTick을 사용하여 DOM 업데이트 완료 대기
    await nextTick();

    // 여기서는 DOM이 업데이트된 상태가 보장됨
    if (divRef.value) {
      console.log('Updated text:', divRef.value.textContent);
      // "Count: 1" 출력됨
    }
  };

  return () => (
    <div>
      <div ref={divRef}>Count: {count}</div>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick은 Promise를 반환하므로{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        await
      </code>
      키워드와 함께 사용하거나{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        .then()
      </code>
      으로 체이닝할 수 있습니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      await 사용
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick } from 'lithent';

const App = mount((renew) => {
  let message = 'Hello';

  const update = async () => {
    message = 'Updated!';
    renew();

    await nextTick();
    console.log('DOM updated:', message);
  };

  return () => <div>{message}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      .then() 사용
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick } from 'lithent';

const App = mount((renew) => {
  let message = 'Hello';

  const update = () => {
    message = 'Updated!';
    renew();

    nextTick().then(() => {
      console.log('DOM updated:', message);
    });
  };

  return () => <div>{message}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실용적인 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      DOM 요소 측정
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      업데이트된 DOM 요소의 크기나 위치를 측정해야 할 때 nextTick을 사용할 수
      있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const DynamicContent = mount((renew) => {
  const contentRef = ref<HTMLDivElement>(null);
  let items: string[] = ['Item 1'];

  const addItem = async () => {
    items.push(\`Item \${items.length + 1}\`);
    renew();

    // DOM 업데이트 완료 대기
    await nextTick();

    // 업데이트된 높이 측정
    if (contentRef.value) {
      const height = contentRef.value.offsetHeight;
      console.log('New height:', height);
    }
  };

  return () => (
    <div>
      <div ref={contentRef}>
        {items.map(item => (
          <div key={item}>{item}</div>
        ))}
      </div>
      <button onClick={addItem}>Add Item</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      포커스 설정
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      새로 추가된 입력 필드에 자동으로 포커스를 설정할 때 유용합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const DynamicForm = mount((renew) => {
  const inputRef = ref<HTMLInputElement>(null);
  let showInput = false;

  const addInput = async () => {
    showInput = true;
    renew();

    // DOM에 input이 추가될 때까지 대기
    await nextTick();

    // 새로 추가된 input에 포커스
    inputRef.value?.focus();
  };

  return () => (
    <div>
      {showInput && <input ref={inputRef} type="text" placeholder="Enter text" />}
      <button onClick={addInput}>Add Input</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      스크롤 위치 조정
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      채팅 메시지를 추가한 후 스크롤을 맨 아래로 이동할 때 사용할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const ChatWindow = mount((renew) => {
  const containerRef = ref<HTMLDivElement>(null);
  const messages: string[] = ['Hello!'];

  const addMessage = async (text: string) => {
    messages.push(text);
    renew();

    // 새 메시지가 DOM에 렌더링될 때까지 대기
    await nextTick();

    // 스크롤을 맨 아래로 이동
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    }
  };

  return () => (
    <div>
      <div
        ref={containerRef}
        style="height: 300px; overflow-y: auto; border: 1px solid #ccc;"
      >
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <button onClick={() => addMessage('New message!')}>
        Add Message
      </button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      애니메이션 트리거
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      DOM이 업데이트된 후 CSS 애니메이션이나 트랜지션을 트리거할 때 사용합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, ref } from 'lithent';

const AnimatedList = mount((renew) => {
  const newItemRef = ref<HTMLDivElement>(null);
  const items: string[] = ['Item 1', 'Item 2'];

  const addItem = async () => {
    items.push(\`Item \${items.length + 1}\`);
    renew();

    // 새 아이템이 DOM에 추가될 때까지 대기
    await nextTick();

    // 애니메이션 클래스 추가
    if (newItemRef.value) {
      newItemRef.value.classList.add('fade-in');
    }
  };

  return () => (
    <div>
      {items.map((item, i) => (
        <div
          key={item}
          ref={i === items.length - 1 ? newItemRef : null}
          class="item"
        >
          {item}
        </div>
      ))}
      <button onClick={addItem}>Add Item</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      테스트에서 사용
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick은 테스트 코드에서도 매우 유용합니다. DOM 업데이트를 기다린 후
      검증할 때 사용할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, render, nextTick } from 'lithent';
import { expect, test } from 'vitest';

test('counter updates correctly', async () => {
  const Counter = mount((renew) => {
    let count = 0;

    const increase = () => {
      count += 1;
      renew();
    };

    return () => (
      <div>
        <span id="count">{count}</span>
        <button onClick={increase}>Increase</button>
      </div>
    );
  });

  const container = document.createElement('div');
  render(<Counter />, container);

  // 초기 상태 확인
  expect(container.querySelector('#count')?.textContent).toBe('0');

  // 버튼 클릭
  container.querySelector('button')?.click();

  // DOM 업데이트 대기
  await nextTick();

  // 업데이트된 상태 확인
  expect(container.querySelector('#count')?.textContent).toBe('1');
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      동작 원리
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick은 내부적으로{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Promise.resolve()
      </code>
      를 반환합니다:
    </p>

    <CodeBlock
      language="tsx"
      code={`export const nextTick = () => Promise.resolve();`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      JavaScript의 이벤트 루프에서 Promise는 마이크로태스크 큐에 추가됩니다.
      현재 실행 중인 모든 동기 코드와 DOM 업데이트가 완료된 후, 마이크로태스크
      큐의 작업들이 실행됩니다.
      <br />
      <br />
      실행 순서:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>renew() 호출 → Virtual DOM 생성</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>Diff 알고리즘 실행 → 변경사항 계산</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>실제 DOM 업데이트 (동기 작업)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>현재 콜 스택의 나머지 코드 실행</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>마이크로태스크 큐 실행 (nextTick의 콜백이 여기서 실행됨)</span>
        </li>
      </ol>
    </div>

    <CodeBlock
      language="tsx"
      code={`const update = async () => {
  console.log('1. Before renew');

  count += 1;
  renew();
  // DOM 업데이트는 동기적으로 완료됨

  console.log('2. After renew');

  await nextTick();
  // 마이크로태스크 큐가 처리될 때까지 대기

  console.log('3. After nextTick');
  // 여기서는 모든 DOM 업데이트와 브라우저 렌더링이 완료됨
};

// 출력 순서:
// 1. Before renew
// 2. After renew
// 3. After nextTick`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      updateCallback과의 차이
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      nextTick과 updateCallback의 반환 함수는 비슷해 보이지만 사용 목적이
      다릅니다:
    </p>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              특성
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              nextTick
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              updateCallback 반환 함수
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              사용 위치
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              어디서든 (이벤트 핸들러, 함수 내부 등)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              마운터에서만 등록
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              실행 시점
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              명시적으로 호출한 시점
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              매 업데이트마다 자동 실행
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              의존성
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              없음
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              의존성 배열 기반
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              용도
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              일회성 DOM 업데이트 대기
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              반복적인 업데이트 후 작업
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, nextTick, updateCallback } from 'lithent';

const Example = mount((renew) => {
  let count = 0;

  // updateCallback: 매 업데이트마다 자동 실행
  updateCallback(() => {
    console.log('Before update');

    return () => {
      console.log('After update (automatic)');
    };
  });

  // nextTick: 필요할 때만 명시적으로 호출
  const increase = async () => {
    count += 1;
    renew();

    await nextTick();
    console.log('After update (manual)');
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 동기적 DOM 업데이트:</span> Lithent의
        renew()는 DOM을 동기적으로 업데이트합니다. nextTick이 필요한 이유는
        브라우저 렌더링이 완료될 때까지 기다리기 위함이 아니라, 마이크로태스크
        큐를 활용하여 현재 실행 컨텍스트 이후를 보장받기 위함입니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 과도한 사용 지양:</span> 대부분의 경우
        updateCallback의 반환 함수로 충분합니다. nextTick은 일회성 작업이나
        이벤트 핸들러 내부에서 필요할 때만 사용하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 브라우저 렌더링:</span> nextTick은
        마이크로태스크 큐까지만 보장합니다. 브라우저의 실제 화면 렌더링(paint)을
        기다려야 한다면 requestAnimationFrame을 사용하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 에러 처리:</span> nextTick이 반환하는
        Promise는 항상 resolve됩니다. try-catch로 감쌀 필요는 없지만, nextTick
        이후의 코드에서 발생하는 에러는 적절히 처리해야 합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언제 사용해야 할까?
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ nextTick 사용 권장
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>• 이벤트 핸들러에서 DOM 업데이트 후 작업이 필요할 때</li>
          <li>• 새로 추가된 요소에 포커스를 설정하거나 측정할 때</li>
          <li>• 테스트 코드에서 DOM 업데이트를 기다릴 때</li>
          <li>• 일회성으로 업데이트 완료를 기다려야 할 때</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 updateCallback 사용 권장
        </h3>
        <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
          <li>• 매 업데이트마다 반복적으로 실행해야 하는 작업</li>
          <li>• 특정 의존성이 변경될 때만 실행하고 싶을 때</li>
          <li>• 컴포넌트 생명주기에 맞춘 작업</li>
          <li>• 외부 라이브러리와의 지속적인 동기화</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/mount-hooks"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/mount-hooks');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          기본 기능: Mount Hooks →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          컴포넌트 마운트 시점에 실행되는 mountCallback 훅에 대해 알아보세요.
          <br />
          초기화 작업과 클린업 처리 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
