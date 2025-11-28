import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const State = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      State
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      state란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        mount 컴포넌트에서 사용하는 반응형 상태 헬퍼
      </strong>
      입니다.
      <br />
      <br />
      state의 핵심은{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew 함수를 명시적으로 인자를 통해 위임
      </strong>
      한다는 점입니다. 이것이 lstate와의 근본적인 차이이며, mount와 함께
      사용하는 것이 자연스럽고 올바른 방식입니다.
      <br />
      <br />
      클로저 변수는 값을 변경한 후 renew()를 직접 호출해야 하지만, state를
      사용하면 renew를 한 번 위임한 후 값이 변경될 때마다 자동으로 renew()가
      호출되어 UI가 업데이트됩니다. mount의 명시적 제어와 자동 업데이트의
      편리함을 함께 누릴 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew);

  const increment = () => {
    count.value += 1; // 자동으로 renew() 호출
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state는 초기값과 renew 함수를 인자로 받습니다. 반환된 객체의{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        value
      </code>{' '}
      프로퍼티를 통해 값을 읽고 쓸 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const App = mount((renew) => {
  // state 생성: state(초기값, renew 함수)
  const count = state(0, renew);
  const message = state('Hello', renew);

  const increment = () => {
    count.value += 1; // setter - 자동으로 renew() 호출
  };

  const updateMessage = () => {
    message.value = 'World'; // setter - 자동으로 renew() 호출
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <p>Message: {message.value}</p>
      <button onClick={increment}>+1</button>
      <button onClick={updateMessage}>Change Message</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      클로저 변수 vs state 비교
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      클로저 변수와 state의 차이를 비교해봅시다. state는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew를 명시적으로 위임하는 방식
      </strong>
      으로, mount 컴포넌트의 철학과 완벽하게 일치합니다:
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      클로저 변수 (수동 renew 호출)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Counter = mount((renew) => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew(); // 명시적으로 renew 호출 필요
  };

  return () => <div>Count: {count}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      state 헬퍼 (자동 renew 호출)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew);

  const increment = () => {
    count.value += 1; // 자동으로 renew 호출됨
  };

  return () => <div>Count: {count.value}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 선택 기준:
        </span>{' '}
        <strong class="font-medium text-gray-700 dark:text-gray-300">
          state는 mount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다.
        </strong>{' '}
        간단한 값이라면 state를 사용하는 것이 편리하며, renew를 명시적으로
        위임하여 제어권을 명확히 할 수 있습니다. 복잡한 객체나 배열을 다룬다면
        클로저 변수를 사용하고 필요할 때만 renew()를 호출하는 것이 더 효율적일
        수 있습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실용적인 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      여러 개의 state 사용
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Form = mount((renew) => {
  const name = state('', renew);
  const email = state('', renew);
  const age = state(0, renew);

  const handleSubmit = () => {
    console.log({
      name: name.value,
      email: email.value,
      age: age.value,
    });
  };

  return () => (
    <form onSubmit={(e: Event) => e.preventDefault()}>
      <input
        type="text"
        value={name.value}
        onInput={(e: Event) => {
          name.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="Name"
      />
      <input
        type="email"
        value={email.value}
        onInput={(e: Event) => {
          email.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="Email"
      />
      <input
        type="number"
        value={age.value}
        onInput={(e: Event) => {
          age.value = parseInt((e.target as HTMLInputElement).value, 10);
        }}
        placeholder="Age"
      />
      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      토글 상태 관리
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Accordion = mount((renew) => {
  const isOpen = state(false, renew);

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  return () => (
    <div>
      <button onClick={toggle}>
        {isOpen.value ? 'Close' : 'Open'} Accordion
      </button>
      {isOpen.value && (
        <div class="content">
          <p>This is the accordion content!</p>
        </div>
      )}
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      카운터 그룹
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const CounterGroup = mount((renew) => {
  const countA = state(0, renew);
  const countB = state(0, renew);
  const countC = state(0, renew);

  return () => (
    <div>
      <div>
        <p>Counter A: {countA.value}</p>
        <button onClick={() => countA.value += 1}>+</button>
        <button onClick={() => countA.value -= 1}>-</button>
      </div>
      <div>
        <p>Counter B: {countB.value}</p>
        <button onClick={() => countB.value += 1}>+</button>
        <button onClick={() => countB.value -= 1}>-</button>
      </div>
      <div>
        <p>Counter C: {countC.value}</p>
        <button onClick={() => countC.value += 1}>+</button>
        <button onClick={() => countC.value -= 1}>-</button>
      </div>
      <div>
        <p>Total: {countA.value + countB.value + countC.value}</p>
      </div>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      객체와 배열 다루기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state는 원시 값뿐만 아니라 객체나 배열도 저장할 수 있습니다. 하지만 객체나
      배열의 경우, 새로운 참조를 할당해야 변경이 감지됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const TodoList = mount((renew) => {
  const todos = state<string[]>([], renew);

  const addTodo = (text: string) => {
    // 새로운 배열을 생성해야 변경 감지됨
    todos.value = [...todos.value, text];
  };

  const removeTodo = (index: number) => {
    // 새로운 배열을 생성
    todos.value = todos.value.filter((_, i) => i !== index);
  };

  return () => (
    <div>
      <button onClick={() => addTodo('New Todo')}>Add Todo</button>
      <ul>
        {todos.value.map((todo, index) => (
          <li>
            {todo}
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 주의:</span> 객체나 배열의 내부를 직접
        변경하면 UI가 업데이트되지 않습니다.
        <br />
        <br />
        <code class="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm">
          todos.value.push('new') // ❌ 동작하지 않음
        </code>
        <br />
        <code class="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-sm">
          todos.value = [...todos.value, 'new'] // ✅ 새 참조로 할당
        </code>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ mount와 함께 사용:</span> state는 mount
        컴포넌트에서 사용하는 것이 자연스럽고 올바른 방식입니다. lmount에서는
        lstate를 사용하세요. state는 renew를 명시적으로 인자를 통해 위임하는
        방식이며, 이것이 lstate와의 근본적인 차이입니다.
        <br />
        <br />
        <span class="font-medium">⚠️ renew 명시적 위임:</span> state는 두 번째
        인자로 renew 함수를 반드시 전달해야 합니다. 이는 제어권을 명확히
        위임하는 mount의 철학을 따릅니다. renew를 전달하지 않으면 값이
        변경되어도 UI가 업데이트되지 않습니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 마운터에서만 호출:</span> state는 마운터
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
        href="/guide/lstate"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/lstate');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Lstate →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          lmount에서 사용하는 반응형 상태 관리인 lstate에 대해 알아보세요.
          <br />
          state와 유사하지만 renew를 자동으로 처리하는 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
