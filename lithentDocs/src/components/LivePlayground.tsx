import { mount, mountCallback, ref } from 'lithent';
import { mountLive } from 'lithent/live';
import type { LiveError, LiveHandle } from 'lithent/live';
import { sandboxRuntimeCode } from 'lithent/live/runtime';
import type { ToolDescriptor } from 'lithent/agent';

type Language = 'en' | 'ko';

/** What a model might generate: build-less code, actions and state declared. */
export const SAMPLE_WIDGET = [
  'return lmount(props => {',
  '  const budget = lstate(props.budget || 500);',
  '  const items = lstate([]);',
  '  const spent = () => items.value.reduce((sum, item) => sum + item.amount, 0);',
  '  const { div, input, p, ul, li, strong } = fTags;',
  '',
  '  agentAction({',
  "    name: 'set_budget',",
  "    description: 'Set the trip budget in dollars',",
  '    params: { amount: { type: Number, required: true } },',
  '    run: ({ amount }) => { budget.value = amount; return budget.value; },',
  '  });',
  '  agentAction({',
  "    name: 'add_expense',",
  "    description: 'Add an expense to the trip',",
  '    params: {',
  '      label: { type: String, required: true },',
  '      amount: { type: Number, required: true },',
  '    },',
  '    run: ({ label, amount }) => {',
  '      items.value = [...items.value, { label, amount }];',
  '      return spent();',
  '    },',
  '  });',
  '  agentAction({',
  "    name: 'clear_expenses',",
  "    description: 'Remove every expense',",
  '    confirm: true,',
  '    run: () => { items.value = []; return 0; },',
  '  });',
  "  agentState('trip', () => ({",
  '    budget: budget.value,',
  '    spent: spent(),',
  '    left: budget.value - spent(),',
  '    expenses: items.value,',
  '  }));',
  '',
  '  return () =>',
  "    div({ class: 'trip' },",
  "      p({}, 'Budget: ', strong({}, '$' + budget.value)),",
  '      input({',
  "        type: 'range', min: 100, max: 2000, step: 50, value: budget.value,",
  '        onInput: e => { budget.value = +e.target.value; },',
  '      }),',
  "      ul({}, ...items.value.map(item => li({}, item.label + ': $' + item.amount))),",
  "      p({ class: spent() > budget.value ? 'over' : '' },",
  "        'Left: $' + (budget.value - spent())));",
  '});',
].join('\n');

/** The same widget with a typical model mistake: JSX in build-less code. */
const BROKEN_WIDGET = [
  'return lmount(() => {',
  '  const count = lstate(0);',
  '  return () => <button onClick={() => count.value++}>{count.value}</button>;',
  '});',
].join('\n');

const WIDGET_STYLES = [
  '.trip { font: 14px/1.5 system-ui, sans-serif; color: #1f2937; padding: 12px; }',
  '.trip input { width: 100%; accent-color: var(--brand); }',
  '.trip strong { color: var(--brand); }',
  '.trip ul { padding-left: 1.2em; margin: 6px 0; }',
  '.trip .over { color: #dc2626; font-weight: 600; }',
];

const DEFAULT_ARGS: Record<string, string> = {
  set_budget: '{ "amount": 800 }',
  add_expense: '{ "label": "Hotel", "amount": 320 }',
  clear_expenses: '{}',
};

const copy = {
  en: {
    code: 'Generated widget code',
    run: 'Run in the sandbox',
    broken: 'Try a broken version',
    reset: 'Back to the sample',
    widget: 'The widget (a person uses it here)',
    agent: 'Agent panel: call the tools a model would call',
    call: 'Call as the agent',
    state: 'Live state (bridge.getState)',
    log: 'Calls',
    error: 'The widget did not start',
    hint: 'Hint for the model',
    confirm: 'The agent wants to run',
  },
  ko: {
    code: '생성된 위젯 코드',
    run: '샌드박스에서 실행',
    broken: '망가진 버전 넣어 보기',
    reset: '샘플로 되돌리기',
    widget: '위젯 (사람이 여기서 조작)',
    agent: '에이전트 패널: 모델이 부를 도구를 호출',
    call: '에이전트로 호출',
    state: '실시간 상태 (bridge.getState)',
    log: '호출 기록',
    error: '위젯이 시작하지 못했습니다',
    hint: '모델에게 줄 힌트',
    confirm: '에이전트가 실행하려는 액션',
  },
};

/**
 * Bidirectional Generative UI in one place (docs/agent-ui Phase 6): run the
 * generated code in a sandbox, drag the slider as a person, call the tools as
 * the agent, and watch both sides read and change the same state.
 */
export const LivePlayground = mount<{ language: Language }>(
  (renew, { language }) => {
    const box = ref<HTMLElement | null>(null);
    let code = SAMPLE_WIDGET;
    let handle: LiveHandle | undefined;
    let tools: ToolDescriptor[] = [];
    let state = '{}';
    let failure: LiveError | undefined;
    let log: string[] = [];
    const args: Record<string, string> = { ...DEFAULT_ARGS };

    const refresh = () => {
      if (!handle) return;
      tools = handle.bridge.listTools();
      state = JSON.stringify(handle.bridge.getState(), null, 2);
      renew();
    };

    const run = async () => {
      if (handle) handle.destroy();
      handle = undefined;
      tools = [];
      state = '{}';
      failure = undefined;
      log = [];
      renew();
      try {
        handle = await mountLive({
          code,
          container: box.value as HTMLElement,
          runtimeCode: sandboxRuntimeCode,
          props: { budget: 500 },
          styles: WIDGET_STYLES,
          theme: { '--brand': '#42b883' },
        });
        handle.bridge.subscribe(refresh);
        handle.bridge.setConfirmHandler(({ name, args: called }) =>
          window.confirm(
            `${copy[language].confirm}: ${name}(${JSON.stringify(called)})`
          )
        );
        refresh();
      } catch (error) {
        failure = error as LiveError;
        renew();
      }
    };

    const call = async (name: string) => {
      if (!handle) return;
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(args[name] || '{}');
      } catch {
        log = [`${name}: arguments are not JSON`, ...log];
        renew();
        return;
      }
      const result = await handle.bridge.callTool(name, parsed);
      log = [
        `${name}(${JSON.stringify(parsed)}) → ${JSON.stringify(result)}`,
        ...log,
      ].slice(0, 6);
      refresh();
    };

    mountCallback(() => {
      run();
      return () => handle && handle.destroy();
    });

    const button =
      'px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-800';

    return () => {
      const t = copy[language];
      return (
        <div class="not-prose my-6 space-y-4">
          <div class="space-y-2">
            <p class="text-sm font-medium">{t.code}</p>
            <textarea
              class="w-full h-64 font-mono text-xs p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              spellcheck={false}
              value={code}
              onInput={(event: Event) => {
                code = (event.target as HTMLTextAreaElement).value;
              }}
            />
            <div class="flex flex-wrap gap-2">
              <button class={button} onClick={run}>
                ▶ {t.run}
              </button>
              <button
                class={button}
                onClick={() => {
                  code = BROKEN_WIDGET;
                  run();
                }}
              >
                {t.broken}
              </button>
              <button
                class={button}
                onClick={() => {
                  code = SAMPLE_WIDGET;
                  run();
                }}
              >
                {t.reset}
              </button>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <p class="text-sm font-medium">{t.widget}</p>
              <div
                ref={box}
                class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white min-h-[4rem]"
              />
              {failure ? (
                <div class="text-sm rounded-lg border border-red-300 p-3 space-y-1">
                  <p class="font-medium text-red-600">
                    {t.error} ({failure.phase})
                  </p>
                  <p>
                    <code>{failure.message}</code>
                  </p>
                  {failure.hint ? (
                    <p>
                      {t.hint}: {failure.hint}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium">{t.agent}</p>
              {tools.map(tool => (
                <div class="flex flex-wrap items-center gap-2 text-sm">
                  <code class="min-w-[8rem]">{tool.name}</code>
                  <input
                    class="flex-1 min-w-[10rem] font-mono text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
                    value={args[tool.name] ?? '{}'}
                    onInput={(event: Event) => {
                      args[tool.name] = (
                        event.target as HTMLInputElement
                      ).value;
                    }}
                  />
                  <button class={button} onClick={() => call(tool.name)}>
                    {t.call}
                    {tool.requiresConfirm ? ' 🔒' : ''}
                  </button>
                </div>
              ))}
              <p class="text-sm font-medium pt-2">{t.state}</p>
              <pre class="text-xs p-3 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-auto max-h-48">
                {state}
              </pre>
              {log.length ? (
                <div class="text-xs space-y-1">
                  <p class="font-medium">{t.log}</p>
                  {log.map(line => (
                    <p>
                      <code>{line}</code>
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    };
  }
);
