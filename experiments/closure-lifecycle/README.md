# Closure lifecycle experiment

코어를 변경하지 않고 소유권, 최신 작업, 활동 수명과 명시적인 화면 보존을 검증하는 실험이다.
공개 패키지 exports에는 연결하지 않는다. [1단계 결과](../../docs/closure-lifecycle/IMPLEMENT.md),
[1단계 계약](../../docs/closure-lifecycle/DESIGN.md), [2단계 결과·계약](../../docs/closure-lifecycle/PHASE2.md)을 참고한다.

## 사용 예시

```ts
import { h, mount, mountCallback } from 'lithent';
import { createLatestTask, useOwnerScope } from './src';

const Search = mount(renew => {
  const owner = useOwnerScope();
  const search = createLatestTask(owner);
  let result = '';
  let pending = false;

  const submit = (query: string) =>
    search.run(
      async signal => {
        const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
          signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      },
      {
        success: text => {
          result = text;
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

  mountCallback(() => {
    const listener = () => {
      void submit('initial');
    };
    window.addEventListener('online', listener);
    owner.own(() => window.removeEventListener('online', listener));
  });

  return () =>
    h(
      'button',
      {
        onClick: () => {
          void submit('Lithent');
        },
      },
      pending ? 'Searching…' : result || 'Search'
    );
});
```

느린 검색 A 뒤에 B를 시작하면 A를 abort하며, A가 취소를 무시해도 그 결과를 반영하지 않는다.
컴포넌트를 제거하면 등록한 listener와 진행 중인 요청을 정리한다.
observer가 예외를 던질 수 있는 코드에서는 `run()`의 reject도 처리해야 한다.

## 2단계 — 활동과 화면 보존

`createRetainedView`는 숨긴 독립 루트를 한 번 만든다. 제공된 갱신 함수를 사용하면 숨김 중
모델 변경을 재활성화에 한 번 반영한다. 폴링은 활동에, 저장은 인스턴스에 연결한다.

```ts
import { h } from 'lithent';
import { createRetainedView, createScopedTask } from './src';

const host = document.querySelector<HTMLElement>('#widget')!;
const view = createRetainedView(host, (renew, scope) => {
  let draft = '';
  let status = 'editing';
  const history: string[] = [];
  const poll = createScopedTask(scope); // 기본값: activity
  const save = createScopedTask(scope, 'instance');

  scope.onActive(() => {
    const timer = setInterval(() => {
      void poll.run(
        signal =>
          fetch('/status', { signal }).then(response => response.text()),
        {
          success: text => {
            status = text;
            renew();
          },
        }
      );
    }, 10_000);
    return () => clearInterval(timer);
  });

  return () =>
    h(
      'div',
      {},
      h('input', {
        value: draft,
        onInput: (event: Event) => {
          history.push(draft);
          draft = (event.target as HTMLInputElement).value;
          renew();
        },
      }),
      h(
        'button',
        {
          onClick: () => {
            draft = history.pop() ?? '';
            renew();
          },
        },
        'Undo'
      ),
      h(
        'button',
        {
          onClick: () => {
            const payload = draft;
            void save.run(
              async signal => {
                const response = await fetch('/save', {
                  method: 'POST',
                  body: payload,
                  signal,
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return 'saved';
              },
              {
                success: text => {
                  status = text;
                  renew();
                },
                error: error => {
                  status = String(error);
                  renew();
                },
              }
            );
          },
        },
        'Save'
      ),
      h('span', {}, status)
    );
});

view.show();
// 탭을 닫을 때: view.hide();   다시 열 때: view.show();
// 위젯을 영구 제거할 때: view.dispose();
```

숨김은 기존 클로저·DOM을 유지하며 폴링 요청과 타이머를 정리한다. 이미 시작한 저장은 계속 진행하고,
숨김 중 결과는 모델에만 반영한다. 재활성화는 저장을 다시 실행하지 않는다.
저장과 폴링이 같은 status를 반영하는 앱에서는 제품 규칙에 따라 표시 상태를 따로 관리할 수 있다.
활동 작업의 취소는 pending=false를 발행하지 않으므로 pending UI를 쓰면 활성화에 초기화한다.
임의 자식의 독립 `renew`, 기존 effect, portal을 자동으로 중단하지 않는다.
CSS 숨김만으로 영상·iframe을 정지시키지 않으며 브라우저 DOM 상태의 자동 복원도 제공하지 않는다.

## 재현

저장소 루트에서 설치된 로컬 실행기를 사용한다. 표준 `pnpm build:core`,
`pnpm build:concurrent`, `pnpm build:helper`도 동일한 Vite 빌드를 실행한다.
현재 검증 환경에서는 pnpm 실행기가 별도 자동 설치를 시도하므로 아래 직접 실행 방식을 사용했다.

```sh
./node_modules/.bin/vite build
(cd lithentConcurrent && ../node_modules/.bin/vite build)
(cd helper && ../node_modules/.bin/vite build)
mkdir -p work/closure-lifecycle
node experiments/closure-lifecycle/measure.mjs --output work/closure-lifecycle/baseline.json
./node_modules/.bin/vite build --config experiments/closure-lifecycle/vite.config.ts
./node_modules/.bin/vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
LITHENT_CORE=concurrent ./node_modules/.bin/vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
./node_modules/.bin/tsc -p experiments/closure-lifecycle/tsconfig.json
./node_modules/.bin/eslint experiments/closure-lifecycle/src experiments/closure-lifecycle/tests experiments/closure-lifecycle/vite.config.ts experiments/closure-lifecycle/measure.mjs
node experiments/closure-lifecycle/measure.mjs --compare work/closure-lifecycle/baseline.json
```

기존 번들의 **재빌드 후** 해시까지 비교하려면 마지막 측정 전에 처음의 코어·helper 빌드를 반복한다.
`measure.mjs`는 기존 소스 변경이나 9개 산출물의 해시 변화가 있으면 실패한다.
