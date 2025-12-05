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
      모든 depth의 중첩 객체와 배열에 대해 반응성을 제공하여, 복잡한 데이터
      구조에서도 편리하게 상태를 관리할 수 있습니다.
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
      함수를 사용하여 store를 생성합니다. 생성된 store는 renew 함수를 전달받아
      컴포넌트와 연결됩니다.
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
      것입니다. 모든 depth의 속성에 대해 .value를 통한 직접 변경이 가능합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createStore } from 'state-ref';

// 깊은 중첩 구조의 store 생성
const appStore = createStore({
  user: {
    profile: {
      name: 'John',
      age: 25,
      address: {
        city: 'Seoul',
        country: 'Korea'
      }
    },
    settings: {
      theme: 'light',
      notifications: true
    }
  },
});

const UserProfile = mount(renew => {
  const app = appStore(renew);

  const changeName = () => {
    // ✅ 3depth 중첩 속성 직접 변경 - 반응성 동작함!
    app.user.profile.name.value = 'Jane';
  };

  const changeCity = () => {
    // ✅ 4depth 중첩 속성 직접 변경 - 반응성 동작함!
    app.user.profile.address.city.value = 'Busan';
  };

  const toggleTheme = () => {
    // ✅ 다른 경로의 중첩 속성도 동일하게 동작
    app.user.settings.theme.value =
      app.user.settings.theme.value === 'light' ? 'dark' : 'light';
  };

  return () => (
    <div>
      <h2>Profile</h2>
      <p>Name: {app.user.profile.name.value}</p>
      <p>Age: {app.user.profile.age.value}</p>
      <p>City: {app.user.profile.address.city.value}</p>
      <p>Theme: {app.user.settings.theme.value}</p>

      <button onClick={changeName}>Change Name</button>
      <button onClick={changeCity}>Change City</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      배열 반응성
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      state-ref에서 배열을 다룰 때는 프록시 setter가 호출되도록 인덱스를 통한
      직접 할당을 사용해야 합니다. 배열 내부 객체의 속성 변경은 .value를 통해
      감지됩니다.
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
    // ✅ 인덱스를 통한 직접 할당 - 반응성 동작함
    const newTodo = {
      id: Date.now(),
      text: 'New Todo',
      done: false,
    };
    store.todos.value[store.todos.value.length] = newTodo;
  };

  const toggleTodo = (index: number) => {
    // ✅ 배열 내부 객체 속성 변경 - 반응성 동작함
    const todo = store.todos.value[index];
    todo.done.value = !todo.done.value;
  };

  const removeTodo = (index: number) => {
    // ✅ 인덱스를 통한 삭제 - filter로 새 배열 생성
    store.todos.value = store.todos.value.filter((_, i) => i !== index);
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
      언제 사용해야 할까?
    </h2>

    <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 mb-6 rounded-r">
      <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
        ✅ state-ref가 유용한 경우
      </h3>
      <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
        <li>
          • 깊은 중첩 구조의 복잡한 데이터 (예: 폼 데이터, 설정 객체, API 응답)
        </li>
        <li>• 배열 내부 객체의 속성을 자주 변경하는 경우</li>
        <li>• 여러 depth의 속성을 동시에 업데이트해야 하는 경우</li>
        <li>• 트리 구조나 그래프 같은 재귀적 데이터 구조</li>
        <li>• 복잡한 상태 관리가 필요한 대시보드나 폼</li>
      </ul>
    </div>

    <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">
      실제 사용 예시
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      다음과 같은 실제 시나리오에서 state-ref가 특히 유용합니다:
    </p>

    <ul class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-3 mb-6 list-disc list-inside">
      <li>
        <strong class="font-semibold">다단계 폼:</strong> 여러 섹션으로 나뉜
        폼에서 각 필드를 개별적으로 업데이트
      </li>
      <li>
        <strong class="font-semibold">설정 패널:</strong> 다양한 카테고리와 하위
        설정을 가진 애플리케이션 설정
      </li>
      <li>
        <strong class="font-semibold">채팅 애플리케이션:</strong> 사용자,
        메시지, 채널이 중첩된 구조
      </li>
      <li>
        <strong class="font-semibold">대시보드:</strong> 위젯, 차트, 필터가
        복잡하게 구성된 데이터 시각화
      </li>
      <li>
        <strong class="font-semibold">파일 탐색기:</strong> 폴더와 파일이 트리
        구조로 구성된 인터페이스
      </li>
    </ul>

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
        를 통해 접근해야 합니다. 이를 생략하면 Proxy 객체가 반환되어 예상과 다른
        동작이 발생할 수 있습니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 배열 메서드 주의:</span> push, pop, splice
        같은 배열 메서드를 직접 호출하면 프록시 setter가 트리거되지 않아
        반응성이 동작하지 않습니다. 대신 인덱스를 통한 직접 할당{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          arr.value[0] = item
        </code>{' '}
        또는 전체 배열 교체{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          arr.value = [...]
        </code>
        를 사용하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ mount 권장:</span> state-ref는 renew를
        명시적으로 전달하는 방식이므로{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          mount
        </code>
        와 함께 사용하는 것이 자연스럽습니다. lmount에서 사용하려면 useRenew()를
        직접 호출해야 합니다.
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
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/vite-plugin"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/vite-plugin');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          템플릿: Vite Plugin →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          JSX나 다양한 템플릿 방식을 사용하기 위한 Vite 플러그인 설정 방법을
          알아보세요.
          <br />
          프로젝트에 맞는 템플릿 방식을 선택할 수 있습니다.
        </p>
      </a>
    </div>
  </div>
);
