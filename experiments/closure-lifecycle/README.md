# Closure lifecycle experiment

소유권, 최신 작업, 활동 수명과 명시적인 화면 보존을 검증하는 실험이다.
`experiment/closure-lifecycle`의 1~3단계는 코어를 변경하지 않는다.
`experiment/closure-lifecycle-core`의 4단계는 자식 native renew와 부모 diff를 막는
최소 코어 연동을 별도로 검증한다.
`experiment/closure-lifecycle-concurrent`의 5단계는 기본 코어를 원본으로 복원하고
갱신 중단을 Concurrent에만 연결한다.
현재 `experiment/closure-lifecycle-performance`의 6단계는 컴포넌트 소속 캐시와
관련 작업만 처리하는 중단 정책으로 Concurrent 비용을 줄인다.
7단계는 중단 경계가 없으면 차단 콜백을 제거하고, 추가 빌드 분기 없이 기존 Concurrent를
사용하는 [공개 helper API 검토안](../../docs/closure-lifecycle/API_REVIEW.md)을 작성한다.
공개 패키지 exports에는 연결하지 않는다. [1단계 결과](../../docs/closure-lifecycle/IMPLEMENT.md),
[1단계 계약](../../docs/closure-lifecycle/DESIGN.md), [2단계 결과·계약](../../docs/closure-lifecycle/PHASE2.md),
[3단계 호스트·브라우저 결과](../../docs/closure-lifecycle/PHASE3.md),
[4단계 코어·크기·성능 결과](../../docs/closure-lifecycle/PHASE4.md),
[5단계 Concurrent 전용 결과](../../docs/closure-lifecycle/PHASE5.md),
[6단계 성능 개선 결과](../../docs/closure-lifecycle/PHASE6.md),
[7단계 활성 경계·API 정리](../../docs/closure-lifecycle/PHASE7.md)를 참고한다.

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

## 3단계 — 호스트 연결과 시연

`createRetainedHost(initialize, reportCleanupError?)`는 초기화 함수를 일반 `mount` 컴포넌트로 감싼다.
부모가 `active` Boolean prop으로 활동을 제어하고, 실제 제거 시 안쪽 보존 루트를 정리한다.
같은 컴포넌트를 기존 `defineElement`의 `{ props: { active: Boolean } }`에 연결할 수 있다.
보존은 DOM에 연결된 상태로 숨길 때 적용된다. element의 실제 제거·재연결은 폐기·새 생성이다.

시연 페이지에 두 호스트를 나란히 배치했다. 초안·undo, 느린 검색과 빠른 검색,
숨김 중 저장, 외부 알림 재연결, DOM 이동과 영구 제거를 비교할 수 있다.
요청은 로컬 타이머로 모의한다. 페이지의 수명 계수로 타이머·구독·draw·요청 반영 횟수를 확인한다.

저장소 루트에서 실행한다. base·concurrent 코어 빌드가 필요하다.

```sh
./node_modules/.bin/vite --config experiments/closure-lifecycle/demo/vite.config.ts --host 127.0.0.1 --port 43140 --strictPort
```

concurrent 시연은 별도 터미널에서 실행한다.

```sh
LITHENT_CORE=concurrent ./node_modules/.bin/vite --config experiments/closure-lifecycle/demo/vite.config.ts --host 127.0.0.1 --port 43141 --strictPort
```

`http://127.0.0.1:43140` 또는 `http://127.0.0.1:43141`을 연다.
자동 브라우저 검증은 위 수동 서버를 종료한 뒤 실행한다. 테스트가 두 서버를 직접 시작하고 종료한다.

```sh
./node_modules/.bin/playwright test --config experiments/closure-lifecycle/playwright.config.ts
```

Playwright 브라우저 대신 시스템 Chromium을 사용할 때는 `LITHENT_CHROMIUM_PATH=/usr/bin/chromium`을 지정한다.
이 검증 환경에서는 로컬 소켓 제한으로 서버·Chromium 실행에 샌드박스 외부 실행이 필요했다.
다른 브라우저와 실제 저장 API는 별도 확인 대상이다.

시연 빌드와 미리보기:

```sh
./node_modules/.bin/vite build --config experiments/closure-lifecycle/demo/vite.config.ts
LITHENT_CORE=concurrent ./node_modules/.bin/vite build --config experiments/closure-lifecycle/demo/vite.config.ts
./node_modules/.bin/vite preview --config experiments/closure-lifecycle/demo/vite.config.ts --host 127.0.0.1 --port 43142
```

빌드 파일은 `demo/dist/base`와 `demo/dist/concurrent`에 생성하며 Git에 넣지 않는다.
코어와 실험의 크기·해시 기록은 [3단계 결과](../../docs/closure-lifecycle/PHASE3.md#크기)를 참고한다.

## 6단계 — Concurrent 성능 개선

`experiment/closure-lifecycle-performance`를 사용한다. 기본·helper·element·패키지 설정은 변경하지 않는다.
새 adapter는 이번 Concurrent core와 함께 사용한다. 이전 실험 core는 지원 확인에서 거부한다.

빌드·실험/element 테스트·Chromium 실행은 아래 5단계 명령과 같다.
성능은 3단계 원본과 함께 5단계의 core·adapter를 직접 비교할 수 있다.
5단계 브랜치에서 core·실험 라이브러리·benchmark probe를 빌드해 별도 경로에 보관한 뒤,
6단계에서 같은 산출물을 빌드한다. 이전 probe에도 5단계의 실제 adapter가 포함되어야 한다.

```sh
node experiments/closure-lifecycle/measure-core.mjs --concurrent-only --baseline /path/to/baseline.json --output /path/to/sizes.json
LITHENT_CHROMIUM_PATH=/usr/bin/chromium node experiments/closure-lifecycle/benchmark-core.mjs --baseline /path/to/baseline.mjs --baseline-concurrent /path/to/baseline-concurrent.mjs --baseline-commit 925b4aa98c40ca20b309ea2613cc625d260fa5b1 --previous-concurrent /path/to/phase5-core.mjs --previous-adapter /path/to/phase5-adapter.mjs --previous-commit 25821b015d23f258a1012a0e1721d7a4c5b8839b --output /path/to/performance.json
LITHENT_CHROMIUM_PATH=/usr/bin/chromium node experiments/closure-lifecycle/benchmark-pause.mjs --previous-probe /path/to/phase5-probe.mjs --output /path/to/pause.json
```

`--previous-concurrent`와 `--previous-adapter`는 함께 전달한다.
이 비교에는 8,192행 보존 편집 화면 옆의 input 이벤트 시나리오가 추가된다.
`--workload retained-host`로 해당 시나리오만 실행할 수 있다.
서로 다른 벤치마크·회귀·빌드를 동시에 실행하지 않는다.

## 5단계 — Concurrent 전용 경계

현재 시연은 기본에서 `freezeChildren: false`, Concurrent에서 true를 명시적으로 선택한다.
기본은 명시적 루트의 관리된 renew를 제어하고, Concurrent는 native 자식 renew와 부모 diff도 중단한다.
기본에서 `freezeChildren: true`를 요청하면 호스트 생성/편집기 초기화 전에 오류를 던진다.
`supportsRenderBoundary()`는 실험 어댑터가 현재 런타임의 지원 여부를 확인하는 함수다.
기본 core 코드·타입·ESM/CJS/UMD는 3단계 원본과 동일하다.

3단계의 기준 산출물을 별도 경로에 보관한 뒤 현재 코어·실험을 빌드한다.
측정 기준 커밋은 `925b4aa98c40ca20b309ea2613cc625d260fa5b1`이다.

```sh
./node_modules/.bin/vite build
(cd lithentConcurrent && ../node_modules/.bin/vite build)
./node_modules/.bin/vite build --config experiments/closure-lifecycle/vite.config.ts
node experiments/closure-lifecycle/measure-core.mjs --concurrent-only --baseline /path/to/baseline.json --output /path/to/sizes.json
./node_modules/.bin/vitest run --maxWorkers 2 --minWorkers 1
(cd lithentConcurrent && ../node_modules/.bin/vitest run --maxWorkers 2 --minWorkers 1)
./node_modules/.bin/vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
LITHENT_CORE=concurrent ./node_modules/.bin/vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
./node_modules/.bin/playwright test --config experiments/closure-lifecycle/playwright.config.ts
```

CPU 작업을 끝낸 뒤 각 성능 측정기를 따로 실행한다.

```sh
LITHENT_CHROMIUM_PATH=/usr/bin/chromium node experiments/closure-lifecycle/benchmark-core.mjs --baseline /path/to/baseline.mjs --baseline-concurrent /path/to/baseline-concurrent.mjs --baseline-commit 925b4aa98c40ca20b309ea2613cc625d260fa5b1 --output /path/to/performance.json
./node_modules/.bin/vite build --config experiments/closure-lifecycle/benchmark/vite.config.ts
LITHENT_CHROMIUM_PATH=/usr/bin/chromium node experiments/closure-lifecycle/benchmark-pause.mjs --output /path/to/pause.json
```

## 4단계 — opt-in 자식 갱신 중단 (양쪽 코어 브랜치)

`experiment/closure-lifecycle-core`의 시연은 `createRetainedHost(initialize, console.error, { freezeChildren: true })`로
자식의 native renew까지 중단한다. 기본값 false는 3단계의 명시적 루트 동작을 유지한다.
같은 코어 인스턴스의 4단계 내부 프로토콜이 필요하다. 공개 패키지 API로 출하하지 않았다.

일반 컴포넌트의 mounter에서는 `useRenderBoundary()`로 경계를 만들 수 있다.
pause는 렌더 실행 밖에서 호출하며, resume는 숨김 중 차단된 갱신이 있으면 경계 루트 갱신을 요청한다.
pause 자체는 DOM을 숨기거나 자원을 취소하지 않는다. 보존 루트가 DOM 숨김과 ActivityScope를 연결한다.

아래 성능 비교는 기준 커밋의 **재빌드한** ESM 두 파일과 9개 산출물 측정 JSON을 별도 경로에 준비한다.
기준은 `925b4aa98c40ca20b309ea2613cc625d260fa5b1`이다. 기준 산출물을 보관한 뒤 이 브랜치에서
코어 두 개와 실험 라이브러리를 빌드한다. 이전 `measure.mjs --compare`는 코어 무수정만 허용하므로
4단계에는 아래 별도 측정기를 사용한다.

```sh
./node_modules/.bin/vite build
(cd lithentConcurrent && ../node_modules/.bin/vite build)
./node_modules/.bin/vite build --config experiments/closure-lifecycle/vite.config.ts
node experiments/closure-lifecycle/measure-core.mjs --baseline /path/to/baseline.json --output /path/to/sizes.json
LITHENT_CHROMIUM_PATH=/usr/bin/chromium node experiments/closure-lifecycle/benchmark-core.mjs --baseline /path/to/baseline.mjs --baseline-concurrent /path/to/baseline-concurrent.mjs --baseline-commit 925b4aa98c40ca20b309ea2613cc625d260fa5b1 --output /path/to/performance.json
./node_modules/.bin/vite build --config experiments/closure-lifecycle/benchmark/vite.config.ts
LITHENT_CHROMIUM_PATH=/usr/bin/chromium node experiments/closure-lifecycle/benchmark-pause.mjs --output /path/to/pause.json
```

성능 측정은 테스트·빌드 등 CPU를 사용하는 작업을 모두 끝낸 뒤 하나씩 실행한다.
pause 측정용 bundle만 내부 scheduler 계측을 노출한다. 제품 산출물에는 포함하지 않는다.
단위·회귀 검증은 다음과 같다. 브라우저는 3단계의 Playwright 명령을 사용한다.

```sh
./node_modules/.bin/vitest run --maxWorkers 2 --minWorkers 1
(cd lithentConcurrent && ../node_modules/.bin/vitest run --maxWorkers 2 --minWorkers 1)
./node_modules/.bin/vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
LITHENT_CORE=concurrent ./node_modules/.bin/vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
```

## 1~3단계 재현 (코어 무수정 브랜치)

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
./node_modules/.bin/eslint experiments/closure-lifecycle/src experiments/closure-lifecycle/tests experiments/closure-lifecycle/demo/*.ts experiments/closure-lifecycle/browser experiments/closure-lifecycle/playwright.config.ts experiments/closure-lifecycle/vite.config.ts experiments/closure-lifecycle/measure.mjs
node experiments/closure-lifecycle/measure.mjs --compare work/closure-lifecycle/baseline.json
```

기존 번들의 **재빌드 후** 해시까지 비교하려면 마지막 측정 전에 처음의 코어·helper 빌드를 반복한다.
`measure.mjs`는 기존 소스 변경이나 9개 산출물의 해시 변화가 있으면 실패한다.
