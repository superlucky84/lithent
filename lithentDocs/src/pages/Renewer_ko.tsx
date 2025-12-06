import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const RenewerKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Renewer
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      renew()란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      renew()는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        컴포넌트를 업데이트하는 핵심 함수
      </strong>
      입니다. mount 함수의 첫 번째 인자로 제공되며, 상태가 변경되었을 때 이
      함수를 호출하여 UI를 업데이트합니다.
      <br />
      <br />
      renew()를 호출하면 Updater 함수가 다시 실행되어 새로운 Virtual DOM이
      생성되고, 이전 Virtual DOM과 비교하여 변경된 부분만 실제 DOM에 반영됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Counter = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew(); // 👈 상태 변경 후 renew() 호출
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      renew()를 호출하지 않으면 상태가 변경되어도 화면이 업데이트되지 않습니다.
      이것이 Lithent의{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        명시적 업데이트
      </strong>{' '}
      철학입니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언제 renew()를 호출해야 할까?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      renew()는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        상태가 변경되어 화면을 업데이트해야 할 때
      </strong>{' '}
      호출합니다. 일반적으로 이벤트 핸들러 내부에서 상태를 변경한 후 호출합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const TodoList = mount((renew, _props) => {
  const todos = [];
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos.push({ id: Date.now(), text: inputValue });
      inputValue = '';
      renew(); // 배열에 항목 추가 후 renew()
    }
  };

  const removeTodo = (id: number) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index > -1) {
      todos.splice(index, 1);
      renew(); // 배열에서 항목 제거 후 renew()
    }
  };

  const handleInput = (e: Event) => {
    inputValue = (e.target as HTMLInputElement).value;
    renew(); // 입력값 변경 후 renew()
  };

  return () => (
    <div>
      <input value={inputValue} onInput={handleInput} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      위 예제처럼 상태를 변경하는 모든 이벤트 핸들러에서 renew()를 호출하여
      화면을 업데이트합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      비동기 작업과 renew()
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      비동기 작업(API 호출, setTimeout 등)의 결과로 상태를 업데이트할 때도
      renew()를 호출해야 합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const UserProfile = mount((renew, _props) => {
  let user = null;
  let loading = true;
  let error = null;

  const fetchUser = async () => {
    try {
      loading = true;
      renew(); // 로딩 시작 시 renew()

      const response = await fetch('/api/user');
      user = await response.json();
      error = null;
    } catch (err) {
      error = err.message;
      user = null;
    } finally {
      loading = false;
      renew(); // 데이터 로드 완료 후 renew()
    }
  };

  fetchUser();

  return () => (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {user && (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      비동기 작업의 각 단계(시작, 성공, 실패)에서 상태가 변경될 때마다 renew()를
      호출하여 UI를 업데이트합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      renew()의 동작 원리
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      renew()가 호출되면 다음과 같은 과정이 진행됩니다:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>renew() 호출</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>Updater 함수 실행 → 새로운 Virtual DOM 생성</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>이전 Virtual DOM과 새로운 Virtual DOM 비교(Diffing)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>변경된 부분만 실제 DOM에 반영(Patching)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>updateCallback 훅 실행 (등록된 경우)</span>
        </li>
      </ol>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 과정을 통해 Lithent는 효율적으로 화면을 업데이트합니다. 전체 DOM을 다시
      그리는 것이 아니라, 변경된 부분만 업데이트하므로 성능이 최적화됩니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      renew() 최적화
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      renew()를 불필요하게 자주 호출하면 성능이 저하될 수 있습니다. 다음과 같은
      방법으로 최적화할 수 있습니다:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const OptimizedCounter = mount((renew, _props) => {
  let count = 0;
  let pendingUpdate = false;

  const scheduleUpdate = () => {
    if (!pendingUpdate) {
      pendingUpdate = true;
      // 다음 프레임에서 한 번만 업데이트
      requestAnimationFrame(() => {
        pendingUpdate = false;
        renew();
      });
    }
  };

  const increaseMany = () => {
    // 여러 번 상태를 변경하더라도 renew()는 한 번만 호출
    count += 1;
    count += 1;
    count += 1;
    scheduleUpdate(); // 배칭된 업데이트
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increaseMany}>Increase by 3</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        대부분의 경우 일반적인 renew() 호출로 충분합니다. 위와 같은 최적화는
        매우 빈번하게 업데이트가 발생하는 특수한 경우에만 필요합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lmount에서는 renew가 필요없다
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lmount와 lstate를 사용하면 renew()를 명시적으로 호출할 필요가 없습니다.
      lstate의 value가 변경되면 자동으로 renew()가 호출됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const increase = () => {
    count.value += 1; // renew() 자동 호출 ✨
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstate를 사용하면 개발이 편리하지만, renew() 호출 시점을 명시적으로 제어할
      수 없다는 trade-off가 있습니다. 프로젝트의 요구사항에 따라 mount와 lmount
      중 적합한 방식을 선택하세요.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/render"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/render');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          기본 기능: Render →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          컴포넌트를 실제 DOM에 렌더링하는 방법을 알아보세요.
          <br />
          render 함수의 사용법과 컴포넌트를 마운트/언마운트하는 방법을
          배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
