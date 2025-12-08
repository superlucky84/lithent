import { mount } from 'lithent';
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

const ThemePreview = mount(renew => {
  const ctx = useContext(appContext, renew, ['theme', 'accent', 'user']);

  return () => {
    const isDark = ctx.theme.value === 'dark';
    const accent = ctx.accent.value;
    const bg =
      accent === 'emerald'
        ? 'from-emerald-500/80 to-emerald-700/90'
        : accent === 'sky'
          ? 'from-sky-500/80 to-sky-700/90'
          : 'from-amber-500/80 to-amber-700/90';

    return (
      <div
        class={`relative overflow-hidden rounded-xl border shadow-sm transition-colors ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
        }`}
      >
        <div class={`absolute inset-0 bg-gradient-to-br ${bg} opacity-60`} />
        <div class="relative p-5 space-y-3">
          <div class="text-xs uppercase tracking-wide text-gray-100/80">
            Context Preview
          </div>
          <div class="text-2xl font-bold text-white">
            {ctx.user.value || 'Guest'}
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-100/90">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 text-xs font-medium">
              <span
                class={`inline-block w-2 h-2 rounded-full ${
                  isDark ? 'bg-gray-100' : 'bg-yellow-300'
                }`}
              />
              {isDark ? 'Dark theme' : 'Light theme'}
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 text-xs font-medium">
              🎨 Accent: {accent}
            </span>
          </div>
          <p class="text-xs text-gray-100/80">
            This card and the badge below both subscribe to the same Context.
          </p>
        </div>
      </div>
    );
  };
});

const UserBadge = mount(renew => {
  const ctx = useContext(appContext, renew, ['user', 'theme']);

  return () => (
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
      <span class="w-2 h-2 rounded-full bg-emerald-500" />
      <span class="text-xs font-medium text-gray-700 dark:text-gray-200">
        Signed in as{' '}
        <span class="font-semibold text-[#42b883]">{ctx.user.value}</span>
      </span>
      <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
        {ctx.theme.value === 'dark' ? 'Dark' : 'Light'}
      </span>
    </div>
  );
});

const ContextControls = mount(renew => {
  const ctx = useContext(appContext, renew, ['user', 'theme', 'accent']);

  const cycleUser = () => {
    const current = ctx.user.value;
    const next =
      current === 'Alice' ? 'Bob' : current === 'Bob' ? 'Charlie' : 'Alice';
    ctx.user.value = next;
  };

  const toggleTheme = () => {
    ctx.theme.value = ctx.theme.value === 'light' ? 'dark' : 'light';
  };

  const setAccent = (color: AccentColor) => {
    ctx.accent.value = color;
  };

  return () => (
    <div class="space-y-4">
      <div class="space-y-2">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Change user & theme
        </h4>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={cycleUser}
            class="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
          >
            Switch user
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            class="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Toggle theme ({ctx.theme.value === 'light' ? 'Light' : 'Dark'})
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Accent color
        </h4>
        <div class="flex flex-wrap gap-2">
          {[
            { id: 'emerald' as const, label: 'Emerald' },
            { id: 'sky' as const, label: 'Sky' },
            { id: 'amber' as const, label: 'Amber' },
          ].map(option => (
            <button
              type="button"
              onClick={() => setAccent(option.id)}
              class={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                ctx.accent.value === option.id
                  ? 'border-[#42b883] bg-[#42b883]/10 text-[#42b883]'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-[#42b883]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export const Example11 = mount(_renew => {
  const userState = contextState('Alice');
  const themeState = contextState<ThemeMode>('light');
  const accentState = contextState<AccentColor>('emerald');

  return () => (
    <Provider user={userState} theme={themeState} accent={accentState}>
      <div class="space-y-6">
        <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
            💡 Context Helper demo
          </h3>
          <p class="text-xs md:text-sm text-emerald-800 dark:text-emerald-200">
            Multiple components <strong>subscribe to and share</strong> a single
            Context (AppContext). The top and bottom views are separate
            components, but they reference the same user/theme/accent values in
            real time.
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <UserBadge />
          <div class="text-[11px] text-gray-500 dark:text-gray-400">
            Header, Controls, and Preview all use the same Context instance.
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4">
            <ContextControls />
          </div>
          <ThemePreview />
        </div>
      </div>
    </Provider>
  );
});
