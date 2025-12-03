import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const LContext = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      LContext Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      LContext란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      LContext는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        lmount 컴포넌트 전용 Context
      </strong>
      입니다.
      <br />
      <br />
      <a
        href="/guide/context"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/context');
        }}
        class="text-[#42b883] hover:underline font-medium"
      >
        Context
      </a>
      와 달리{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew를 자동으로 관리
      </strong>
      하며, lmount의{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useRenew()
      </code>{' '}
      훅을 내부적으로 사용합니다. 따라서 lmount 컴포넌트에서 더 간편하게
      Context를 사용할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

// 1. LContext 생성
type AppContext = {
  user: string;
  theme: string;
};

const appContext = createLContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

// 2. Provider 컴포넌트
const App = lmount((props, children) => {
  const userState = contextState('John');
  const themeState = contextState('light');

  return () => (
    <Provider user={userState} theme={themeState}>
      <Header />
      <Main />
    </Provider>
  );
});

// 3. Consumer 컴포넌트 (자동 renew 관리)
const Header = lmount((props, children) => {
  // renew 전달 불필요 - useRenew()로 자동 관리
  const ctx = useContext(appContext);

  const changeUser = () => {
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
      1. LContext 생성
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        createLContext
      </code>
      로 LContext를 생성합니다. 타입 인자로 Context가 관리할 데이터 구조를
      정의합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { createLContext } from 'lithent/helper';

// LContext 타입 정의
type UserContext = {
  name: string;
  age: number;
};

// LContext 생성
const userContext = createLContext<UserContext>();

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
        Context와 달리 renew 파라미터가 없습니다.
      </strong>{' '}
      Consumer에서 useContext를 호출할 때 자동으로 renew가 연결됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';

const App = lmount((props, children) => {
  // contextState로 상태 생성 (renew 없음)
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
      code={`const App = lmount((props, children) => {
  const nameState = contextState('John');
  const ageState = contextState(25);

  const updateName = () => {
    // Provider에서 값 변경 가능
    nameState.value = 'Jane';
    // Consumer들이 자동으로 리렌더링됨
  };

  return () => (
    <div>
      <Provider name={nameState} age={ageState}>
        {/* Provider 내부의 모든 컴포넌트가 Context 사용 가능 */}
        <Header />
        <Content />
        <Footer />
      </Provider>

      {/* Provider 외부에서 상태 변경 */}
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
      로 Context를 사용합니다.{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew를 전달하지 않습니다
      </strong>{' '}
      - 내부적으로{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useRenew()
      </code>
      를 자동으로 호출하여 리렌더링을 관리합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`const Header = lmount((props, children) => {
  // renew 전달 불필요 - 자동으로 관리됨
  const ctx = useContext(userContext);

  const changeName = () => {
    // Consumer에서 값 변경
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

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 자동 renew 관리:</span> LContext는 lmount의{' '}
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          useRenew()
        </code>{' '}
        훅을 사용하여 renew를 자동으로 관리합니다. 따라서 Context보다 더
        간편하게 사용할 수 있습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      선택적 구독
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      useContext의 두 번째 인자로 구독할 키를 지정할 수 있습니다. 특정 필드의
      변경에만 반응하도록 최적화할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

type AppContext = {
  user: string;
  theme: string;
  count: number;
};

const appContext = createLContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

const App = lmount((props, children) => {
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
const FullSubscribe = lmount((props, children) => {
  const ctx = useContext(appContext);
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
const UserOnly = lmount((props, children) => {
  const ctx = useContext(appContext, ['user']);
  // user만 변경될 때만 리렌더링 (성능 최적화)

  return () => (
    <div>
      <p>User: {ctx.user.value}</p>
    </div>
  );
});

// theme과 count만 구독
const ThemeAndCount = lmount((props, children) => {
  const ctx = useContext(appContext, ['theme', 'count']);
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
      LContext의{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        contextState
      </code>
      는 renew 파라미터를 받지 않습니다. 따라서{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        Provider는 Context 값 변경을 구독하지 않습니다.
      </strong>
      <br />
      <br />
      Provider에서 값을 변경하면 Consumer들은 업데이트되지만, Provider 자체는
      리렌더링되지 않습니다. 실질적으로는 단방향처럼 동작합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

type CounterContext = {
  count: number;
};

const counterContext = createLContext<CounterContext>();
const { Provider, contextState, useContext } = counterContext;

const App = lmount((props, children) => {
  // contextState는 renew를 받지 않음 - Provider는 구독하지 않음
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

const Counter = lmount((props, children) => {
  // Consumer는 useRenew()로 자동 구독
  const ctx = useContext(counterContext);

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
        <span class="font-medium">💡 권장 패턴:</span> Provider는 초기값만
        제공하는 역할로 사용하고, Consumer에서만 값을 읽고 변경하는 것이
        좋습니다. 이는{' '}
        <a
          href="/guide/context"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/context');
          }}
          class="underline hover:no-underline font-medium"
        >
          Context
        </a>
        와 동일한 패턴입니다.
      </p>
    </div>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ 양방향 동기화 불가:</span> LContext의{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          contextState
        </code>
        는 renew 파라미터를 받지 않으므로, Provider에서 양방향 동기화를 구현할
        수 없습니다.
        <br />
        <br />
        만약 Provider에서도 Context 값 변경에 반응해야 한다면, 일반적으로{' '}
        <strong class="font-semibold">권장하지 않지만</strong>{' '}
        <a
          href="/guide/context"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/context');
          }}
          class="underline hover:no-underline font-medium"
        >
          Context
        </a>
        를 사용하고{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          contextState(value, renew)
        </code>
        로 renew를 전달할 수 있습니다. 하지만 이 경우 Provider 하위 트리 전체가
        리렌더링되는 성능 문제가 있습니다.
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
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

type ThemeContext = {
  color: string;
};

const themeContext = createLContext<ThemeContext>();
const { Provider, contextState, useContext } = themeContext;

const App = lmount((props, children) => {
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

const Child = lmount((props, children) => {
  const ctx = useContext(themeContext);

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
      code={`import { lmount } from 'lithent';
import { createLContext } from 'lithent/helper';

// 여러 LContext 정의
type UserContext = { name: string };
type ThemeContext = { mode: string };

const userContext = createLContext<UserContext>();
const themeContext = createLContext<ThemeContext>();

const App = lmount((props, children) => {
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

const Content = lmount((props, children) => {
  // 여러 Context 동시 사용
  const user = userContext.useContext(userContext);
  const theme = themeContext.useContext(themeContext);

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
      Context vs LContext 비교
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
              LContext
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              대상 컴포넌트
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              lmount
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              renew 관리
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              수동 (renew 전달)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              자동 (useRenew 사용)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              contextState
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              contextState(value, renew?)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              contextState(value)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              useContext
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              useContext(ctx, renew, keys?)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              useContext(ctx, keys?)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Provider 구독
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              renew 전달 시 (비권장)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              불가 (renew 없음)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              선택적 구독
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              지원
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              지원
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              사용 편의성
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              보통 (명시적 관리)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              높음 (자동 관리)
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ LContext 사용 권장
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>• lmount 컴포넌트를 사용하는 경우</li>
          <li>• renew를 자동으로 관리하고 싶을 때</li>
          <li>• Consumer에서만 Context 값을 변경하는 단방향 패턴</li>
          <li>• 더 간편한 API를 원할 때</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          ✅ Context 사용 권장
        </h3>
        <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
          <li>• mount 컴포넌트를 사용하는 경우</li>
          <li>• renew를 명시적으로 관리하고 싶을 때</li>
          <li>• Provider는 초기값만 제공하는 단방향 패턴을 원할 때</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ lmount 전용:</span> LContext는{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          lmount
        </code>{' '}
        컴포넌트 전용입니다. mount 컴포넌트에서는{' '}
        <a
          href="/guide/context"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/context');
          }}
          class="underline hover:no-underline font-medium"
        >
          Context
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
        <br />
        <br />
        <span class="font-medium">⚠️ useRenew 의존성:</span> LContext는
        내부적으로{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          useRenew()
        </code>
        를 사용하므로, lmount의 Hook 규칙을 따라야 합니다. useContext는 조건문
        안에서 호출하지 마세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/context"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/context');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          ← Helper: Context
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          mount 컴포넌트에서 사용하는 Context에 대해 알아보세요.
          <br />
          명시적 renew 관리 방식을 배워봅시다.
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
          Helper: Store →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          전역 상태 관리를 위한 Store Helper에 대해 알아보세요.
        </p>
      </a>
    </div>
  </div>
);
