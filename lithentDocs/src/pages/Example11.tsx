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

// Root component that provides context
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

// Multiple consumers subscribe to the same context
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
      Context Helper (Theme & User Panel)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      This example is a small "theme &amp; user" panel where multiple components
      share <strong>user / theme / accent</strong> values via{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Context
      </code>
      . The header badge, control panel, and preview card all consume the same
      Context.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Even though the components above and below are mounted independently, they
      sit inside the same{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Provider
      </code>{' '}
      tree, so{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useContext
      </code>{' '}
      reads the same data and all changes are reflected across them.
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
        Related docs
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
            Context guide
          </a>{' '}
          - Explains the createContext / Provider / useContext / contextState
          APIs and the optional subscription (subscribeKeys) pattern in detail.
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
            Store guide
          </a>{' '}
          - Compares Context, which is scoped to a tree, with sharing state via
          a global store.
        </li>
      </ul>
    </div>
  </div>
);
