import { mount } from 'lithent';
import { createRetainedHost, createScopedTask } from 'lithent/helper';

const copy = {
  en: {
    hide: 'Hide editor',
    show: 'Show editor',
    remove: 'Remove permanently',
    create: 'Create new editor',
    draft: 'Draft',
    undo: 'Undo',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved draft',
    none: 'None yet',
    slow: 'Slow search A',
    fast: 'Fast search B',
    waiting: 'Searching…',
    idle: 'Search idle',
    result: 'Search result',
    ticks: 'Polling ticks',
    instance: 'Instance',
    hidden:
      'The editor is hidden. Polling has stopped; an instance save can still finish.',
    removed:
      'The editor has been disposed. Create a new one to start with an empty draft.',
    note: 'Local mock requests use managed renew without child freezing. Slow search A ignores abort so you can see the stale-result guard. This example retains managed updates; native child freezing requires Concurrent.',
  },
  ko: {
    hide: '편집기 숨기기',
    show: '편집기 다시 열기',
    remove: '영구 제거',
    create: '새 편집기 만들기',
    draft: '초안',
    undo: '되돌리기',
    save: '저장',
    saving: '저장 중…',
    saved: '저장한 초안',
    none: '아직 없음',
    slow: '느린 검색 A',
    fast: '빠른 검색 B',
    waiting: '검색 중…',
    idle: '검색 대기',
    result: '검색 결과',
    ticks: '폴링 횟수',
    instance: '인스턴스',
    hidden:
      '편집기를 숨겼습니다. 폴링은 멈추고 이미 시작한 인스턴스 저장은 계속됩니다.',
    removed: '편집기를 폐기했습니다. 새로 만들면 빈 초안으로 시작합니다.',
    note: '자식 갱신 중단 없이 관리된 renew와 로컬 모의 요청을 사용합니다. 느린 검색 A는 abort를 무시해 오래된 결과 차단을 보여줍니다. 관리된 갱신을 보존하며, 자식 native renew 중단에는 Concurrent가 필요합니다.',
  },
};

const buttonClass =
  'px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40';

export const LifecycleDemo = mount<{ language: 'en' | 'ko' }>(
  (renew, props) => {
    const t = copy[props.language];
    let active = true;
    let present = true;
    let instances = 0;

    const Editor = createRetainedHost((draw, scope) => {
      const instance = ++instances;
      const search = createScopedTask(scope);
      const save = createScopedTask(scope, 'instance');
      const history: string[] = [];
      let draft = '';
      let saved = '';
      let result = '';
      let pending = false;
      let saving = false;
      let ticks = 0;

      // Mock transports deliberately ignore abort; final disposal still owns
      // their timers. Real fetch work should pass its supplied AbortSignal.
      const respondAfter = (value: string, delay: number) =>
        new Promise<string>(resolve => {
          const timer = setTimeout(() => {
            release();
            resolve(value);
          }, delay);
          const release = scope.own(() => clearTimeout(timer));
        });

      scope.onActive(() => {
        pending = false;
        draw();
        const timer = setInterval(() => {
          ticks++;
          draw();
        }, 1000);
        return () => clearInterval(timer);
      });

      const find = (query: 'A' | 'B') => {
        void search.run(
          () =>
            respondAfter(`${t.result} ${query}`, query === 'A' ? 1200 : 150),
          {
            success: value => {
              result = value;
              draw();
            },
            pending: value => {
              pending = value;
              draw();
            },
          }
        );
      };

      return () => (
        <div
          class="space-y-4 rounded-lg bg-white dark:bg-gray-800 p-4"
          data-lifecycle-editor
        >
          <p class="text-sm">
            {t.instance}: <output data-instance>{instance}</output>
          </p>
          <label class="block">
            {t.draft}
            <textarea
              class="block w-full mt-2 p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
              rows={3}
              data-draft
              value={draft}
              onInput={(event: Event) => {
                history.push(draft);
                draft = (event.target as HTMLTextAreaElement).value;
                draw();
              }}
            />
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class={buttonClass}
              data-undo
              disabled={!history.length}
              onClick={() => {
                draft = history.pop() ?? '';
                draw();
              }}
            >
              {t.undo}
            </button>
            <button
              type="button"
              class={buttonClass}
              data-save
              disabled={saving}
              onClick={() => {
                const payload = draft;
                void save.run(() => respondAfter(payload, 700), {
                  success: value => {
                    saved = value;
                    draw();
                  },
                  pending: value => {
                    saving = value;
                    draw();
                  },
                });
              }}
            >
              {t.save}
            </button>
            <button
              type="button"
              class={buttonClass}
              data-search-a
              onClick={() => find('A')}
            >
              {t.slow}
            </button>
            <button
              type="button"
              class={buttonClass}
              data-search-b
              onClick={() => find('B')}
            >
              {t.fast}
            </button>
          </div>
          <div class="text-sm space-y-2" aria-live="polite">
            <p data-pending>{pending ? t.waiting : t.idle}</p>
            <p>
              {t.result}: <output data-result>{result || t.none}</output>
            </p>
            <p>
              {t.saved}:{' '}
              <output data-saved>{saving ? t.saving : saved || t.none}</output>
            </p>
            <p>
              {t.ticks}: <output data-ticks>{ticks}</output>
            </p>
          </div>
        </div>
      );
    });

    return () => (
      <section
        data-lifecycle-demo
        class="p-5 my-6 rounded-lg border border-[#42b883] bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
      >
        <p class="text-sm mb-4">{t.note}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            class={buttonClass}
            data-toggle
            disabled={!present}
            aria-expanded={present && active}
            onClick={() => {
              active = !active;
              renew();
            }}
          >
            {active ? t.hide : t.show}
          </button>
          <button
            type="button"
            class={buttonClass}
            data-remove
            onClick={() => {
              present = !present;
              if (present) active = true;
              renew();
            }}
          >
            {present ? t.remove : t.create}
          </button>
        </div>
        {present ? <Editor active={active} /> : null}
        {(!present || !active) && (
          <p class="text-sm mt-4" data-lifecycle-status>
            {present ? t.hidden : t.removed}
          </p>
        )}
      </section>
    );
  }
);
