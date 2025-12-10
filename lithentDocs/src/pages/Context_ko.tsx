import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const ContextKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Context Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Context란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Context는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        컴포넌트 트리에서 데이터를 공유
      </strong>
      하는 헬퍼입니다.
      <br />
      <br />
      Props drilling 없이 깊은 계층의 컴포넌트에 데이터를 전달할 수 있으며,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew를 명시적으로 전달
      </strong>
      하는 방식으로 동작합니다. 따라서 mount 컴포넌트와 함께 사용하는 것이
      자연스럽습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

// 1. Context 생성
type AppContext = {
  user: string;
  theme: string;
};

const appContext = createContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

// 2. Provider 컴포넌트 (데이터 제공)
const App = mount(renew => {
  // renew 없이 생성 (권장)
  const userState = contextState('John');
  const themeState = contextState('light');

  return () => (
    <Provider user={userState} theme={themeState}>
      <Header />
      <Main />
    </Provider>
  );
});

// 3. Consumer 컴포넌트 (데이터 사용 및 변경)
const Header = mount(renew => {
  // Consumer에서 renew로 구독
  const ctx = useContext(appContext, renew);

  const changeUser = () => {
    // Consumer에서 값 변경
    ctx.user.value = 'Jane';
  };

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
      <p>Theme: {ctx.theme.value}</p>
      <button onClick={changeUser}>Change User</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      1. Context 생성
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        createContext
      </code>
      로 Context를 생성합니다. 타입 인자로 Context가 관리할 데이터 구조를
      정의합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { createContext } from 'lithent/helper';

// Context 타입 정의
type UserContext = {
  name: string;
  age: number;
};

// Context 생성
const userContext = createContext<UserContext>();

// 구조분해로 필요한 것들 추출
const { Provider, contextState, useContext } = userContext;`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      2. contextState로 상태 생성
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Provider에 전달할 상태를{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        contextState
      </code>
      로 생성합니다. 초기값을 인자로 전달합니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        일반적으로 renew를 전달하지 않습니다.
      </strong>{' '}
      Provider는 초기값을 제공하는 역할만 하고, Consumer에서 값을 구독하고
      변경합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const App = mount(renew => {
  // contextState로 상태 생성 (renew 없이)
  const nameState = contextState('John');
  const ageState = contextState(25);

  // Provider에 전달할 준비 완료
  return () => (
    <Provider name={nameState} age={ageState}>
      <Content />
    </Provider>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      3. Provider로 Context 제공
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Provider 컴포넌트로 하위 컴포넌트들에게 Context를 제공합니다. Context
      타입에 정의된 키들을 props로 전달합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`const App = mount(renew => {
  // renew 없이 생성 (권장)
  const nameState = contextState('John');
  const ageState = contextState(25);

  const updateName = () => {
    // 값 변경은 가능하지만, Provider는 리렌더링 안 됨
    nameState.value = 'Jane';
    // Consumer들은 이 변경사항을 받아서 리렌더링됨
  };

  return () => (
    <div>
      <Provider name={nameState} age={ageState}>
        {/* Provider 내부의 모든 컴포넌트가 Context 사용 가능 */}
        <Header />
        <Content />
        <Footer />
      </Provider>

      {/* Provider 외부에서 상태 변경 가능 */}
      <button onClick={updateName}>Change Name</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      4. useContext로 Context 사용
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      하위 컴포넌트에서{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useContext
      </code>
      로 Context를 사용합니다. renew를 전달하여 Context 변경 시 리렌더링되도록
      합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`const Header = mount(renew => {
  // useContext로 Context 접근
  const ctx = useContext(userContext, renew);

  const changeName = () => {
    // Consumer에서 값 변경 가능
    ctx.name.value = 'Alice';
  };

  return () => (
    <div>
      <p>Name: {ctx.name.value}</p>
      <p>Age: {ctx.age.value}</p>
      <button onClick={changeName}>Change Name</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      선택적 구독
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      useContext의 세 번째 인자로 구독할 키를 지정할 수 있습니다. 특정 필드의
      변경에만 반응하도록 최적화할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type AppContext = {
  user: string;
  theme: string;
  count: number;
};

const appContext = createContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

const App = mount(renew => {
  // renew 없이 생성
  const userState = contextState('John');
  const themeState = contextState('light');
  const countState = contextState(0);

  return () => (
    <Provider user={userState} theme={themeState} count={countState}>
      <FullSubscribe />
      <UserOnly />
      <ThemeAndCount />
    </Provider>
  );
});

// 모든 키 구독 (기본값)
const FullSubscribe = mount(renew => {
  const ctx = useContext(appContext, renew);
  // user, theme, count 중 하나라도 변경되면 리렌더링

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
      <p>Theme: {ctx.theme.value}</p>
      <p>Count: {ctx.count.value}</p>
    </div>
  );
});

// user만 구독
const UserOnly = mount(renew => {
  const ctx = useContext(appContext, renew, ['user']);
  // user만 변경될 때만 리렌더링 (성능 최적화)

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
    </div>
  );
});

// theme과 count만 구독
const ThemeAndCount = mount(renew => {
  const ctx = useContext(appContext, renew, ['theme', 'count']);
  // theme 또는 count 변경 시에만 리렌더링

  return () => (
    <div>
      <p>Theme: {ctx.theme.value}</p>
      <p>Count: {ctx.count.value}</p>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 성능 최적화:
        </span>{' '}
        여러 필드를 가진 큰 Context에서는 선택적 구독을 사용하는 것이 좋습니다.
        필요한 필드만 구독하면 불필요한 리렌더링을 방지할 수 있습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Context 값 변경
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      기본적으로{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        contextState
      </code>
      로 생성한 상태는 Provider와 Consumer 어디서든 값을 변경할 수 있습니다.
      <br />
      <br />
      하지만{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew 없이 생성하면 Consumer에서만 구독
      </strong>
      되므로, Provider에서 값을 변경해도 Provider 자체는 리렌더링되지 않습니다.
      실질적으로는 단방향처럼 동작합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type CounterContext = {
  count: number;
};

const counterContext = createContext<CounterContext>();
const { Provider, contextState, useContext } = counterContext;

const App = mount(renew => {
  // ⚠️ renew 없이 생성 - Provider는 구독하지 않음
  const countState = contextState(0);

  const incrementFromProvider = () => {
    // ⚠️ 값은 변경되지만 Provider는 리렌더링 안 됨
    countState.value += 1;
    // Consumer는 이 변경사항을 받아서 리렌더링됨
  };

  return () => (
    <div>
      <Provider count={countState}>
        <Counter />
      </Provider>

      {/* Provider에서 변경 */}
      <button onClick={incrementFromProvider}>
        Increment from Provider
      </button>

      {/* ⚠️ Provider는 리렌더링 안 되므로 이 값은 갱신 안 됨 */}
      <p>Provider count: {countState.value}</p>
    </div>
  );
});

const Counter = mount(renew => {
  // ✅ Consumer는 renew로 구독함
  const ctx = useContext(counterContext, renew);

  const incrementFromConsumer = () => {
    // ✅ Consumer에서 값 변경 - Consumer만 리렌더링
    ctx.count.value += 1;
  };

  return () => (
    <div>
      {/* ✅ Consumer는 변경사항을 항상 반영 */}
      <p>Consumer count: {ctx.count.value}</p>
      <button onClick={incrementFromConsumer}>
        Increment from Consumer
      </button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 권장 패턴:</span> 일반적으로{' '}
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          contextState
        </code>
        는 renew 없이 생성하고, Consumer에서만 값을 읽고 변경하는 것이 좋습니다.
        Provider는 초기값만 제공하는 역할로 사용하세요.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      양방향 동기화 (권장하지 않음)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        contextState
      </code>
      의 두 번째 인자로 renew를 전달하면 진짜 양방향 동기화가 가능하지만,{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        권장하지 않습니다.
      </strong>
    </p>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ 양방향 동기화 문제:</span>
        <br />
        <br />
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          contextState(initialValue, renew)
        </code>
        <br />
        <br />
        위처럼 renew를 전달하면 Provider에서 값 변경 시 Provider가 리렌더링되어
        양방향 동기화가 가능합니다. 하지만{' '}
        <strong class="font-semibold">
          Provider 하위 트리 전체가 리렌더링
        </strong>
        되는 부작용이 발생합니다.
        <br />
        <br />
        Consumer는 선택적 구독으로 필요한 컴포넌트만 리렌더링하지만, Provider에
        renew를 전달하면 모든 하위 컴포넌트가 영향을 받아 성능 문제가 발생할 수
        있습니다.
        <br />
        <br />
        <strong class="font-semibold">
          권장: renew를 전달하지 말고 Consumer에서만 값을 관리하세요.
        </strong>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      중첩 Provider
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Provider는 중첩될 수 있으며, Consumer는 가장 가까운 상위 Provider를
      사용합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type ThemeContext = {
  color: string;
};

const themeContext = createContext<ThemeContext>();
const { Provider, contextState, useContext } = themeContext;

const App = mount(renew => {
  // renew 없이 생성
  const blueTheme = contextState('blue');
  const redTheme = contextState('red');

  return () => (
    <Provider color={blueTheme}>
      <Child /> {/* blue 사용 */}

      {/* 중첩 Provider */}
      <Provider color={redTheme}>
        <Child /> {/* red 사용 (가까운 Provider) */}
      </Provider>
    </Provider>
  );
});

const Child = mount(renew => {
  const ctx = useContext(themeContext, renew);

  return () => (
    <div style={{ color: ctx.color.value }}>
      Theme: {ctx.color.value}
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      여러 Context 사용
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      하나의 컴포넌트에서 여러 Context를 동시에 사용할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

// 여러 Context 정의
type UserContext = { name: string };
type ThemeContext = { mode: string };

const userContext = createContext<UserContext>();
const themeContext = createContext<ThemeContext>();

const App = mount(renew => {
  // renew 없이 생성
  const userName = userContext.contextState('John');
  const themeMode = themeContext.contextState('dark');

  return () => (
    <userContext.Provider name={userName}>
      <themeContext.Provider mode={themeMode}>
        <Content />
      </themeContext.Provider>
    </userContext.Provider>
  );
});

const Content = mount(renew => {
  // 여러 Context 동시 사용
  const user = userContext.useContext(userContext, renew);
  const theme = themeContext.useContext(themeContext, renew);

  return () => (
    <div>
      <p>User: {user.name.value}</p>
      <p>Theme: {theme.mode.value}</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Context vs Store 비교
    </h2>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              특성
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Context
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Store
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              범위
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Provider 하위 컴포넌트
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              전역 (모든 컴포넌트)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              중첩
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              가능 (Provider 중첩)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              불가능 (전역 단일)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              사용 케이스
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              특정 트리 내 공유
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              앱 전역 상태
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Props drilling
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              해결함
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              해결함
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              선택적 구독
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              지원 (subscribeKeys)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              지원 (makeObserver)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              대상 컴포넌트
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ Context 사용 권장
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>• 특정 컴포넌트 트리 내에서만 공유되는 데이터</li>
          <li>• 같은 타입의 Context를 여러 곳에서 독립적으로 사용</li>
          <li>• UI 테마, 언어 설정 등 트리별로 다를 수 있는 설정</li>
          <li>• Props drilling을 피하고 싶을 때</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          ✅ Store 사용 권장
        </h3>
        <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
          <li>• 앱 전역에서 공유되는 상태</li>
          <li>• 사용자 인증 정보, 전역 설정 등</li>
          <li>• 컴포넌트 트리와 무관하게 접근해야 하는 데이터</li>
          <li>• 더 단순한 API를 원할 때</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ mount 전용:</span> Context는 renew를
        명시적으로 전달하는 방식이므로{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          mount
        </code>{' '}
        컴포넌트에서 사용해야 합니다. lmount에서는{' '}
        <a
          href="/guide/lcontext"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/lcontext');
          }}
          class="underline hover:no-underline font-medium"
        >
          lcontext
        </a>
        를 사용하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ Provider 필수:</span> useContext를
        사용하려면 상위에 Provider가 반드시 있어야 합니다. Provider가 없으면
        Context를 찾을 수 없습니다.
        <br />
        <br />
        <span class="font-medium">⚠️ .value 접근:</span> contextState로 생성한
        상태는{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          .value
        </code>
        를 통해 접근하고 변경해야 합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/11"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/11');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          예제: Context로 테마 &amp; 사용자 공유 →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          여러 컴포넌트가 같은 Context(AppContext)를 구독하고,
          <br />
          user / theme / accent 값을 함께 공유하는 실제 예제를 실행해 보세요.
        </p>
      </a>

      <a
        href="/guide/lcontext"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/lcontext');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: LContext →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          lmount 컴포넌트에서 사용하는 LContext에 대해 알아보세요.
          <br />
          자동 renew 관리로 더 간편한 Context 사용 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
