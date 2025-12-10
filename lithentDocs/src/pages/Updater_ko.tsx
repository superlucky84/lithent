import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const UpdaterKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Updater
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Updater란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Updater는 마운터가 반환하는 함수입니다. 마운터가 컴포넌트 생성 시{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        단 한 번만 실행
      </strong>
      되는 것과 달리, Updater는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        상태가 변경될 때마다 호출
      </strong>
      됩니다.
      <br />
      <br />
      Updater의 역할은 현재 상태를 기반으로{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        새로운 Virtual DOM을 생성
      </strong>
      하는 것입니다. Lithent는 이전 Virtual DOM과 새로운 Virtual DOM을
      비교(diffing)하여 실제로 변경된 부분만 실제 DOM에 반영합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const Counter = mount((renew, _props) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew(); // Updater를 다시 호출하여 화면 업데이트
  };

  // 👇 이 함수가 바로 Updater입니다
  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      위 예제에서 화살표 함수로 반환되는 부분이 Updater입니다. renew()가 호출될
      때마다 이 함수가 다시 실행되어 새로운 Virtual DOM을 생성합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      클로저를 통한 상태 접근
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Updater는 마운터 내부에서 정의되므로, 클로저를 통해 마운터에서 선언한 모든
      변수와 함수에 접근할 수 있습니다. 이것이 Lithent의{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        클로저 기반 상태 관리
      </strong>
      의 핵심입니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const TodoList = mount((renew, _props) => {
  // 마운터에서 정의한 상태와 메서드
  const todos = [];
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos.push({ id: Date.now(), text: inputValue });
      inputValue = '';
      renew();
    }
  };

  const removeTodo = (id: number) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index > -1) {
      todos.splice(index, 1);
      renew();
    }
  };

  // Updater는 클로저를 통해 위의 모든 변수/함수에 접근 가능
  return () => (
    <div>
      <input
        value={inputValue}
        onInput={(e) => {
          inputValue = e.target.value;
          renew();
        }}
        placeholder="Add a todo"
      />
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
      Updater 내부에서 todos, inputValue, addTodo, removeTodo 등 마운터에서
      정의한 모든 것을 자유롭게 사용할 수 있습니다. 이는 JavaScript의 클로저
      특성을 활용한 것입니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lmount에서의 Updater
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lmount를 사용할 때도 Updater의 개념은 동일합니다. 차이점은 renew를
      명시적으로 호출하지 않아도 lstate 값이 변경될 때 자동으로 Updater가
      호출된다는 점입니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount((_props) => {
  const count = lstate(0);

  const increase = () => {
    count.value += 1; // lstate 값 변경 시 자동으로 Updater 호출
  };

  // 이 함수가 Updater
  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstate의 value를 변경하면 내부적으로 renew가 자동 호출되어 Updater가
      실행됩니다. 결과적으로 새로운 Virtual DOM이 생성되고 화면이
      업데이트됩니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Updater 실행 흐름
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent 컴포넌트의 업데이트 흐름은 다음과 같습니다:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>상태 변경 (변수 값 변경 또는 lstate.value 변경)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>renew() 호출 (수동 또는 lstate에 의해 자동)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>Updater 함수 실행 → 새로운 Virtual DOM 생성</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>이전 Virtual DOM과 새로운 Virtual DOM 비교(Diffing)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>변경된 부분만 실제 DOM에 반영(Patching)</span>
        </li>
      </ol>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이러한 흐름을 통해 Lithent는 효율적으로 화면을 업데이트합니다. Updater가
      매번 전체 Virtual DOM을 반환하지만, 실제 DOM 조작은 변경된 부분에만
      이루어지므로 성능이 최적화됩니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/props"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/props');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          기본 기능: Props →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          컴포넌트 간 데이터를 전달하는 Props에 대해 알아보세요.
          <br />
          부모 컴포넌트에서 자식 컴포넌트로 데이터와 함수를 전달하는 방법을
          배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
