import { h, mount, mountCallback, updateCallback } from 'lithent';
import { createScopedTask } from '../src';
import type { ActivityScope } from '../src';
import type { Renew } from 'lithent';
import type { EditorMetrics } from './metrics';
import { readStatus } from './status';

/** Local simulated transport. Slow search deliberately ignores cancellation. */
const request = (
  delay: number,
  signal: AbortSignal,
  ignoreAbort: boolean,
  onAbort: () => void
) =>
  new Promise<void>((resolve, reject) => {
    const abort = () => {
      onAbort();
      if (!ignoreAbort) {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        reject(new DOMException('Cancelled', 'AbortError'));
      }
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, delay);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });

export const createEditor =
  (metrics: EditorMetrics, changed: () => void) =>
  (renew: Renew, scope: ActivityScope) => {
    metrics.created++;
    metrics.live++;
    changed();
    scope.own(() => {
      metrics.live--;
      changed();
    });
    let draft = '';
    const history: string[] = [];
    let result = '아직 검색하지 않았습니다';
    let pending = false;
    let saved = '편집 중';
    let external = '외부 알림 대기';
    const search = createScopedTask(scope);
    const save = createScopedTask(scope, 'instance');

    // Deliberately uses the native child renew, outside the managed root renew.
    const NativeChild = mount(nativeRenew => {
      let value = 0;
      mountCallback(() => {
        const listener = (event: Event) => {
          if ((event as CustomEvent).detail !== metrics) return;
          value++;
          nativeRenew();
        };
        window.addEventListener('closure-demo-child', listener);
        return () => window.removeEventListener('closure-demo-child', listener);
      });
      updateCallback(() => {
        metrics.childEffects++;
      });
      return () => {
        metrics.childDraws++;
        return h('output', { class: 'native-child' }, String(value));
      };
    });

    scope.onActive(() => {
      metrics.activations++;
      metrics.timers++;
      metrics.subscriptions++;
      if (pending) {
        pending = false;
        renew();
      }
      const timer = setInterval(() => {
        metrics.ticks++;
        changed();
        renew();
      }, 250);
      const listener = (event: Event) => {
        external = String((event as CustomEvent).detail);
        metrics.externalEvents++;
        changed();
        renew();
      };
      window.addEventListener('closure-demo-status', listener);
      const latest = readStatus();
      if (external !== latest) {
        external = latest;
        renew();
      }
      changed();
      return () => {
        clearInterval(timer);
        window.removeEventListener('closure-demo-status', listener);
        metrics.timers--;
        metrics.subscriptions--;
        changed();
      };
    });

    const startSearch = (query: 'A' | 'B') => {
      void search.run(
        async signal => {
          metrics.searchesStarted++;
          changed();
          await request(query === 'A' ? 900 : 80, signal, query === 'A', () => {
            metrics.searchesAborted++;
            changed();
          });
          metrics.searchesFinished++;
          changed();
          return `검색 결과 ${query}`;
        },
        {
          success: value => {
            result = value;
            metrics.searchesCommitted++;
            changed();
            renew();
          },
          error: error => {
            result = String(error);
            renew();
          },
          pending: value => {
            pending = value;
            renew();
          },
        }
      );
    };

    const startSave = () => {
      const payload = draft;
      saved = '저장 중';
      renew();
      void save.run(
        async signal => {
          metrics.savesStarted++;
          changed();
          await request(500, signal, false, () => {
            metrics.savesAborted++;
            changed();
          });
          metrics.savesFinished++;
          changed();
          return payload;
        },
        {
          success: value => {
            saved = `저장됨: ${value}`;
            metrics.savesCommitted++;
            changed();
            renew();
          },
          error: error => {
            saved = String(error);
            renew();
          },
        }
      );
    };

    return () => {
      metrics.draws++;
      changed();
      return h(
        'article',
        { class: 'editor' },
        h(NativeChild, {}),
        h(
          'label',
          {},
          '초안',
          h('textarea', {
            class: 'draft',
            value: draft,
            rows: 3,
            onInput: (event: Event) => {
              history.push(draft);
              draft = (event.target as HTMLTextAreaElement).value;
              renew();
            },
          })
        ),
        h(
          'div',
          { class: 'actions' },
          h(
            'button',
            {
              class: 'undo',
              onClick: () => {
                draft = history.pop() ?? '';
                renew();
              },
            },
            '되돌리기'
          ),
          h('button', { class: 'save', onClick: startSave }, '저장'),
          h(
            'button',
            { class: 'search-a', onClick: () => startSearch('A') },
            '느린 검색 A'
          ),
          h(
            'button',
            { class: 'search-b', onClick: () => startSearch('B') },
            '빠른 검색 B'
          )
        ),
        h(
          'p',
          { class: 'pending', 'aria-live': 'polite' },
          pending ? '검색 중' : '검색 대기'
        ),
        h('p', { class: 'result' }, result),
        h('p', { class: 'saved', 'aria-live': 'polite' }, saved),
        h('p', { class: 'external' }, external),
        h('small', { class: 'heartbeat' }, `활동 업데이트 ${metrics.ticks}`)
      );
    };
  };
