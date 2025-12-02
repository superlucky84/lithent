import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const StateRef = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      State-Ref
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      state-ref란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <a
        href="https://github.com/superlucky84/state-ref"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[#42b883] hover:underline font-medium"
      >
        state-ref
      </a>
      는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        중첩 객체에 대한 깊은 반응성(deep reactivity)
      </strong>
      을 제공하는 외부 라이브러리입니다.
      <br />
      <br />
      Lithent의 기본 store와 lstore는 1depth(루트 레벨)만 반응성을
      제공하지만, state-ref는 모든 depth의 중첩 객체와 배열에 대해 반응성을
      제공합니다.
      <br />
      <br />
      Lithent와 함께 사용하도록 최적화되어 있으며, 복잡한 중첩 구조를 다루는
      경우 매우 유용합니다.
    </p>

    <div class="border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <span class="font-medium">📦 설치:</span>
        <br />
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          npm install state-ref
        </code>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state-ref는{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        createStore
      </code>{' '}
      함수를 사용하여 store를 생성합니다. 생성된 store는 renew 함수를
      전달받아 컴포넌트와 연결됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createStore } from 'state-ref';

// 타입 정의
type Info = {
  age: number;
  house: { color: string; floor: number }[]
};

type People = {
  john: Info;
  brown: Info;
  sara: Info
};

// store 생성
const peopleStore = createStore<People>({
  john: {
    age: 20,
    house: [
      { color: 'red', floor: 5 },
      { color: 'blue', floor: 3 },
    ],
  },
  brown: {
    age: 26,
    house: [{ color: 'green', floor: 5 }]
  },
  sara: {
    age: 26,
    house: [{ color: 'yellow', floor: 5 }]
  },
});

// 컴포넌트에서 사용
const Component = mount(renew => {
  const peopleRef = peopleStore(renew);

  const changeAge = () => {
    // ✅ 깊은 중첩 속성도 직접 변경 가능!
    peopleRef.john.age.value += 1;
  };

  return () => (
    <div>
      <p>John's age: {peopleRef.john.age.value}</p>
      <button onClick={changeAge}>Increase Age</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 .value 접근:</span> state-ref의 모든 속성은{' '}
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          .value
        </code>
        를 통해 접근하고 변경합니다. 이는 Proxy를 통한 반응성 추적을 위한
        것입니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      중첩 객체 반응성
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state-ref의 가장 큰 장점은 깊은 중첩 구조에서도 반응성이 동작한다는
      것입니다. Lithent의 store/lstore와 비교해보세요.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createStore } from 'state-ref';
import { store } from 'lithent/helper';

// Lithent store (1depth만 반응성)
const lithentStore = store({
  user: {
    profile: { name: 'John', age: 25 },
  },
});

// state-ref (모든 depth 반응성)
const stateRefStore = createStore({
  user: {
    profile: { name: 'John', age: 25 },
  },
});

const LithentStoreExample = mount(renew => {
  const app = lithentStore(renew);

  const changeName = () => {
    // ❌ 2depth 변경 - 반응성 동작 안 함
    app.user.profile.name = 'Jane';
  };

  const changeNameCorrect = () => {
    // ✅ 1depth 전체 교체 - 반응성 동작함
    app.user = {
      ...app.user,
      profile: { ...app.user.profile, name: 'Jane' },
    };
  };

  return () => (
    <div>
      <p>Name: {app.user.profile.name}</p>
      <button onClick={changeName}>직접 변경 (동작 안 함)</button>
      <button onClick={changeNameCorrect}>객체 교체 (동작함)</button>
    </div>
  );
});

const StateRefExample = mount(renew => {
  const app = stateRefStore(renew);

  const changeName = () => {
    // ✅ 2depth 직접 변경 - 반응성 동작함!
    app.user.profile.name.value = 'Jane';
  };

  return () => (
    <div>
      <p>Name: {app.user.profile.name.value}</p>
      <button onClick={changeName}>직접 변경 (동작함!)</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      배열 반응성
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state-ref는 배열 메서드(push, pop, splice 등)도 반응성으로 추적합니다.
      배열 내부 객체의 속성 변경도 감지됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createStore } from 'state-ref';

type Todo = { id: number; text: string; done: boolean };

const todoStore = createStore<{ todos: Todo[] }>({
  todos: [
    { id: 1, text: 'Learn Lithent', done: false },
    { id: 2, text: 'Build App', done: false },
  ],
});

const TodoList = mount(renew => {
  const store = todoStore(renew);

  const addTodo = () => {
    // ✅ 배열 push - 반응성 동작함
    store.todos.value.push({
      id: Date.now(),
      text: 'New Todo',
      done: false,
    });
  };

  const toggleTodo = (index: number) => {
    // ✅ 배열 내부 객체 속성 변경 - 반응성 동작함
    const todo = store.todos.value[index];
    todo.done.value = !todo.done.value;
  };

  const removeTodo = (index: number) => {
    // ✅ 배열 splice - 반응성 동작함
    store.todos.value.splice(index, 1);
  };

  return () => (
    <div>
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {store.todos.value.map((todo, index) => (
          <li>
            <span style={{
              textDecoration: todo.done.value ? 'line-through' : 'none'
            }}>
              {todo.text.value}
            </span>
            <button onClick={() => toggleTodo(index)}>Toggle</button>
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      store vs state-ref 비교
    </h2>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              특성
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              store / lstore
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              state-ref
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              반응성 depth
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              1depth (얕은 반응성)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              모든 depth (깊은 반응성)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              중첩 객체 변경
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              객체 전체 교체 필요
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              직접 변경 가능
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              배열 메서드
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              반응성 없음 (교체 필요)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              반응성 있음 (push, pop 등)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              속성 접근
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              직접 접근 (store.name)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              .value 필요 (store.name.value)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              번들 크기
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Lithent 내장
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              외부 라이브러리 (+약 2KB)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              성능
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              더 빠름 (단순 Proxy)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              약간 느림 (깊은 추적)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              권장 사용
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              단순 구조, 성능 중요
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              복잡한 중첩 구조
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언제 사용해야 할까?
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ state-ref 사용 권장
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>
            • 깊은 중첩 구조의 복잡한 데이터 (예: 폼 데이터, 설정 객체)
          </li>
          <li>• 배열 내부 객체의 속성을 자주 변경하는 경우</li>
          <li>• 여러 depth의 속성을 동시에 업데이트해야 하는 경우</li>
          <li>• 불변성(immutability) 패턴을 피하고 싶은 경우</li>
        </ul>
      </div>

      <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ store/lstore 사용 권장
        </h3>
        <ul class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed space-y-2">
          <li>• 단순하고 평평한(flat) 데이터 구조</li>
          <li>• 성능이 매우 중요한 경우</li>
          <li>• 번들 크기를 최소화해야 하는 경우</li>
          <li>• 외부 라이브러리 의존성을 줄이고 싶은 경우</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ .value 필수:</span> state-ref의 모든 속성은{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          .value
        </code>
        를 통해 접근해야 합니다. 이를 생략하면 Proxy 객체가 반환되어 예상과
        다른 동작이 발생할 수 있습니다.
        <br />
        <br />
        <span class="font-medium">⚠️ mount 권장:</span> state-ref는 renew를
        명시적으로 전달하는 방식이므로{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          mount
        </code>
        와 함께 사용하는 것이 자연스럽습니다. lmount에서 사용하려면 useRenew()를
        직접 호출해야 합니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 성능 고려:</span> 매우 큰 객체나 깊은 중첩
        구조에서는 성능 저하가 발생할 수 있습니다. 이 경우 store/lstore의 flat한
        구조를 고려하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      더 알아보기
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="https://github.com/superlucky84/state-ref"
        target="_blank"
        rel="noopener noreferrer"
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          GitHub Repository →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          state-ref의 전체 API 문서와 더 많은 예제를 확인하세요.
        </p>
      </a>

      <a
        href="/guide/store"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/store');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          ← Store Helper
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Lithent 내장 store의 사용법을 다시 확인하세요.
        </p>
      </a>
    </div>
  </div>
);
