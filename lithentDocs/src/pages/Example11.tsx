import { CodeBlock } from '@/components/CodeBlock';
import { Example11 } from '@/components/examples/example11';
import type { Introduction } from '@/pages/Introduction';

const example11Code = `import { mount } from 'lithent';
import { createContext } from 'lithent/helper';

type ThemeMode = 'light' | 'dark';
type AccentColor = 'emerald' | 'sky' | 'amber';

type AppContext = {
  user: string;
  theme: ThemeMode;
  accent: AccentColor;
};

const appContext = createContext<AppContext>();
const { Provider, contextState, useContext } = appContext;

// Context를 제공하는 루트 컴포넌트
const App = mount(renew => {
  const userState = contextState('Alice');
  const themeState = contextState<ThemeMode>('light');
  const accentState = contextState<AccentColor>('emerald');

  return () => (
    <Provider user={userState} theme={themeState} accent={accentState}>
      <Header />
      <Main />
    </Provider>
  );
});

// 여러 Consumer가 같은 Context를 구독
const Header = mount(renew => {
  const ctx = useContext(appContext, renew, ['user', 'theme']);

  return () => (
    <header>
      <span>Signed in as {ctx.user.value}</span>
      <span>Theme: {ctx.theme.value}</span>
    </header>
  );
});

const Controls = mount(renew => {
  const ctx = useContext(appContext, renew, ['user', 'theme', 'accent']);

  const cycleUser = () => {
    const next = ctx.user.value === 'Alice'
      ? 'Bob'
      : ctx.user.value === 'Bob'
      ? 'Charlie'
      : 'Alice';
    ctx.user.value = next;
  };

  const toggleTheme = () => {
    ctx.theme.value = ctx.theme.value === 'light' ? 'dark' : 'light';
  };

  const setAccent = (color: AccentColor) => {
    ctx.accent.value = color;
  };

  return () => (
    <section>
      <button onClick={cycleUser}>사용자 바꾸기</button>
      <button onClick={toggleTheme}>테마 토글</button>
      <button onClick={() => setAccent('emerald')}>Emerald</button>
      <button onClick={() => setAccent('sky')}>Sky</button>
      <button onClick={() => setAccent('amber')}>Amber</button>
    </section>
  );
});`;

export const Example11Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Context Helper (테마 & 사용자 패널)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이 예제는 여러 컴포넌트가{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Context
      </code>
      를 통해 <strong>user / theme / accent</strong> 값을 공유하는 작은 "테마
      &amp; 사용자" 패널입니다. 상단 배지, 컨트롤 패널, 프리뷰 카드가 모두 같은
      Context를 구독하고 있습니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      위/아래 컴포넌트들은 서로 독립적인 마운터이지만,{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Provider
      </code>
      로 감싼 트리 안에 있기 때문에{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useContext
      </code>
      로 같은 데이터를 읽고, 변경 사항도 함께 반영됩니다.
    </p>

    <CodeBlock language="tsx" code={example11Code} />

    <div class="not-prose mt-6 mb-10">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example11 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        관련 문서
      </h2>
      <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2">
        <li>
          <a
            href="/guide/context"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/context');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Context 가이드
          </a>{' '}
          - createContext / Provider / useContext / contextState API와 선택적
          구독(subscribeKeys) 패턴을 자세히 설명합니다.
        </li>
        <li>
          <a
            href="/guide/store"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/store');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Store 가이드
          </a>{' '}
          - 트리 범위에 한정된 Context와 달리, 전역 store로 상태를 공유하는
          방식과의 차이를 비교해 볼 수 있습니다.
        </li>
      </ul>
    </div>
  </div>
);
