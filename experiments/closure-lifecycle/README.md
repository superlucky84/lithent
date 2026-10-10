# Closure lifecycle experiment

코어를 변경하지 않고 인스턴스 자원 정리와 최신 작업 반영을 검증하는 실험이다.
공개 패키지 exports에는 연결하지 않는다. [검증 결과](../../docs/closure-lifecycle/IMPLEMENT.md)와
[계약](../../docs/closure-lifecycle/DESIGN.md)을 참고한다.

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
