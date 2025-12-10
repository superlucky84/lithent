import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const LstateKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Lstate
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lstate란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstate는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        lmount 컴포넌트에서 사용하는 반응형 상태 헬퍼
      </strong>
      입니다.
      <br />
      <br />
      lstate의 핵심은{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew를 자동으로 처리
      </strong>
      한다는 점입니다. state와 달리 renew를 인자로 전달할 필요가 없으며,
      내부적으로 useRenew 훅을 사용하여 자동으로 renew를 가져옵니다. 이것이
      state와의 근본적인 차이이며, lmount와 함께 사용하는 것이 자연스럽고 올바른
      방식입니다.
      <br />
      <br />
      값이 변경될 때마다 자동으로 renew()가 호출되어 UI가 업데이트되므로, 선언형
      패턴에 최적화되어 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0); // renew 인자 불필요

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
      lstate는 초기값만 인자로 받습니다. renew는 내부적으로 자동 처리됩니다.
      반환된 객체의{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        value
      </code>{' '}
      프로퍼티를 통해 값을 읽고 쓸 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const App = lmount(() => {
  // lstate 생성: lstate(초기값) - renew 불필요!
  const count = lstate(0);
  const message = lstate('Hello');

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
      state vs lstate 비교
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state와 lstate의 차이를 비교해봅시다. 핵심 차이는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew를 어떻게 처리하는가
      </strong>
      입니다:
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      state (mount + 명시적 renew 위임)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew); // renew 명시적 전달

  const increment = () => {
    count.value += 1;
  };

  return () => <div>Count: {count.value}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      lstate (lmount + 자동 renew 처리)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0); // renew 자동 처리

  const increment = () => {
    count.value += 1;
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
          lstate는 lmount와 함께 사용하는 것이 자연스럽고 올바른 방식입니다.
        </strong>{' '}
        lstate는 renew를 자동으로 처리하여 선언형 패턴에 최적화되어 있으며,
        state는 renew를 명시적으로 위임하여 수동 제어에 최적화되어 있습니다.
        mount를 사용한다면 state를, lmount를 사용한다면 lstate를 선택하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실용적인 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      여러 개의 lstate 사용
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Form = lmount(() => {
  const name = lstate('');
  const email = lstate('');
  const age = lstate(0);

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
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Accordion = lmount(() => {
  const isOpen = lstate(false);

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
      탭 컴포넌트
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Tabs = lmount(() => {
  const activeTab = lstate('tab1');

  return () => (
    <div>
      <div class="tab-buttons">
        <button
          onClick={() => activeTab.value = 'tab1'}
          class={activeTab.value === 'tab1' ? 'active' : ''}
        >
          Tab 1
        </button>
        <button
          onClick={() => activeTab.value = 'tab2'}
          class={activeTab.value === 'tab2' ? 'active' : ''}
        >
          Tab 2
        </button>
        <button
          onClick={() => activeTab.value = 'tab3'}
          class={activeTab.value === 'tab3' ? 'active' : ''}
        >
          Tab 3
        </button>
      </div>
      <div class="tab-content">
        {activeTab.value === 'tab1' && <div>Content 1</div>}
        {activeTab.value === 'tab2' && <div>Content 2</div>}
        {activeTab.value === 'tab3' && <div>Content 3</div>}
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
      lstate는 원시 값뿐만 아니라 객체나 배열도 저장할 수 있습니다. 하지만
      객체나 배열의 경우, 새로운 참조를 할당해야 변경이 감지됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const TodoList = lmount(() => {
  const todos = lstate<string[]>([]);

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
      복잡한 상태 관리 예제
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      여러 개의 lstate를 조합하여 복잡한 상태를 관리할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp = lmount(() => {
  const todos = lstate<Todo[]>([]);
  const filter = lstate<'all' | 'active' | 'completed'>('all');
  const inputValue = lstate('');

  const addTodo = () => {
    if (!inputValue.value.trim()) return;

    todos.value = [
      ...todos.value,
      {
        id: Date.now(),
        text: inputValue.value,
        completed: false,
      },
    ];
    inputValue.value = '';
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter(todo => todo.id !== id);
  };

  const getFilteredTodos = () => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(todo => !todo.completed);
      case 'completed':
        return todos.value.filter(todo => todo.completed);
      default:
        return todos.value;
    }
  };

  return () => (
    <div>
      <input
        type="text"
        value={inputValue.value}
        onInput={(e: Event) => {
          inputValue.value = (e.target as HTMLInputElement).value;
        }}
        placeholder="What needs to be done?"
      />
      <button onClick={addTodo}>Add</button>

      <div>
        <button onClick={() => filter.value = 'all'}>All</button>
        <button onClick={() => filter.value = 'active'}>Active</button>
        <button onClick={() => filter.value = 'completed'}>Completed</button>
      </div>

      <ul>
        {getFilteredTodos().map(todo => (
          <li>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Remove</button>
          </li>
        ))}
      </ul>
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
        <span class="font-medium">⚠️ lmount와 함께 사용:</span> lstate는 lmount
        컴포넌트에서 사용하는 것이 자연스럽고 올바른 방식입니다. mount에서는
        state를 사용하세요. lstate는 renew를 자동으로 처리하는 방식이며, 이것이
        state와의 근본적인 차이입니다.
        <br />
        <br />
        <span class="font-medium">⚠️ renew 자동 처리:</span> lstate는 내부적으로
        useRenew를 사용하여 renew를 자동으로 가져옵니다. 따라서 renew를 인자로
        전달할 필요가 없으며, 이는 선언형 패턴에 최적화된 설계입니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 마운터에서만 호출:</span> lstate는 마운터
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
        href="/guide/computed"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/computed');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Computed →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          다른 상태로부터 파생된 값을 계산하는 computed에 대해 알아보세요.
          <br />
          읽기 전용 파생 값을 만드는 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
