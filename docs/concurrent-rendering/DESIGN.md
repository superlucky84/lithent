# DESIGN — Lithent Concurrent 렌더링 (별도 빌드 + 파이버)

- 작성일: 2026-08-28 (최종 수정: 2026-08-31)
- 상태: **DC-1~DC-20 확정. T1·T1.5 완성, T2 진행 중 (Phase 8 완료, 2026-09-01)**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [IMPLEMENT.md](./IMPLEMENT.md)

## 1. 설계 원칙

- **P1. 기본 코어 동결.** `src/`를 수정하지 않는다 (REQUIREMENTS N2).
  공유 모듈 변경이 불가피하면 양쪽 테스트 통과 + 기본 크기 가드 준수가 조건.
- **P2. 클로저 모델 불가침.** `mount(setup → updater)`와 `state`/`lstate`의 클로저 보관을
  바꾸지 않는다. **파이버를 도입해도 유지된다** (REQUIREMENTS §7.7).
- **P3. 인터페이스 호환.** 위성의 bare `lithent` import와 공개 export가 무수정 동작.
  실측(2026-08-31): import **41건**(구현 24 + 테스트 17), deep import **0건**,
  공개 export **값 21개 + 타입 16개**. `concurrent-exportSurface.test.ts`가 이를 고정한다.
  파이버 전환 시 `getParent` 호환 접근자 필수 (D10).
- **P4. 단계 독립성.** T1 / T1.5 / T2는 각각 단독 머지 가능.
- **P5. 순수화 우선.** 중단 능력보다 diff 순수화를 먼저 한다. 순수화는 그 자체로 품질 개선이고,
  폐기 능력(더블 버퍼링)이 부산물로 따라온다.
- **P6. N1 경계 사수.** 파이버 완성 후 Suspense-throw는 기계장치의 80%가 갖춰져 유혹적이 된다.
  넘는 순간 클로저 모델이 무너진다. 별도의 명시적 결정 없이는 넘지 않는다.

## 2. 배포 구조 설계

### 2.1 패키지 레이아웃

```
src/                        ← 동결
lithentConcurrent/          ← name: lithent-concurrent
  src/{diff,render,wDom,scheduler,index}.ts
  package.json  vite.config.js
```

### 2.2 alias — 공유분 재사용 + **Fragment 동일성 함정**

`lithentConcurrent/vite.config.js`:

```js
const r = p => resolve(__dirname, p);
alias: [
  // 구체적인 것 먼저 — 분기본으로 해석
  { find: /^@\/wDom$/,          replacement: r('src/wDom.ts') },
  { find: /^@\/diff$/,          replacement: r('src/diff.ts') },
  { find: /^@\/render$/,        replacement: r('src/render.ts') },
  { find: /^@\/utils\/redraw$/, replacement: r('src/scheduler.ts') },
  // 나머지는 기본 코어 공유 (709줄)
  { find: '@',                  replacement: r('../src') },
]
```

**함정**: 공유 모듈이 분기 모듈을 역참조하는 곳이 정확히 2군데 있다.

| 위치 | import | 위험 |
|---|---|---|
| `src/utils/predicator.ts:1` | `import { Fragment } from '@/wDom'` | `checkFragmentFunction`이 `target === Fragment` **동일성 비교**. alias 누락 시 concurrent의 Fragment가 base와 달라 **fragment 판정이 통째로 깨진다** |
| `src/hook/useRenew.ts:3` | `import { componentUpdate } from '@/utils/redraw'` | 스케줄러가 아닌 기본 redraw에 연결되어 우선순위가 무시된다 |

둘 다 위 alias로 해소되지만 **놓치면 디버깅이 괴로운 종류**다 → Phase 0에서 전용 검증(0-5, 0-6).

> **Phase 0 구현 반영 (D12).** 이 표는 `lithentConcurrent/alias.js` 한 곳에 `forkModules`로
> 두고 vite 빌드·vitest·타입 생성 세 소비자가 공유한다. 인라인으로 흩어 두면 셋이
> 어긋나도 아무 데서도 안 터진다. 구현된 형태는 아래와 같고, catch-all이 마지막에
> 오는 것은 배열 조립 순서로 **구조적으로 보장**된다.
>
> ```js
> export const forkModules = {
>   '@/index': 'index',   '@/wDom': 'wDom',   '@/diff': 'diff',
>   '@/render': 'render', '@/scheduler': 'scheduler',
>   '@/utils/redraw': 'scheduler',
> };
> export const concurrentAlias = pkgDir => [
>   ...Object.entries(forkModules).map(([spec, name]) => ({
>     find: new RegExp(`^${spec.replace(/\//g, '\\/')}$`),
>     replacement: resolve(pkgDir, 'src', `${name}.ts`),
>   })),
>   { find: /^@\//, replacement: `${resolve(pkgDir, '..', 'src')}/` },
> ];
> ```
>
> catch-all을 `{ find: '@' }`(문자열 prefix)가 아니라 `/^@\//`(정규식)로 둔 이유:
> 문자열 형태는 `@scope/pkg` 같은 스코프 패키지 이름도 삼킨다. 현재 코어는 그런 import가
> 없어 기본 빌드에서는 드러나지 않지만, 공유 범위가 넓어질수록 위험이 커진다.

### 2.3 빌드 파이프라인 편입

- `pnpm build:concurrent` 추가, `build:sequence`에 core 이후로 편입 (공유 소스 의존).
- 위성 테스트를 양쪽 코어로 2회 실행 (RC-9). alias 스위치는 vitest config의 resolve.alias로 제어.

## 3. 아키텍처 진화도

```
[기본 lithent — 동결]
  renew() → redrawQueue.set(compKey, exec) → queueMicrotask → forEach exec
            exec = replaceWDom = [makeNewWDomTree(오염됨) + wDomUpdate] 원자적

[T1]  스케줄러 삽입. 작업 단위는 원자적 유지.
  renew() → lanes[sync|low].set(compKey, exec)
          → sync: queueMicrotask / low: MessageChannel 유휴
          → shouldYield() 기준으로 단위 사이에서 yield

[T1.5]  단위 내부를 build / commit으로 실제 분리.
  exec = [makeNewWDomTree(순수) → CommitEffectList] → commit(effects + wDomUpdate)
         ↑ 트리 2개 공존 = 더블 버퍼링 성립 (폐기 가능)

[T2 파이버]  순회를 work loop로. 중단·재개·폐기.
  workLoop: while (wip && !shouldYield()) wip = performUnitOfWork(wip)
            노드에 child/sibling/return + alt(alternate) 포인터
            폐기 시 wip 버리고 훅 스냅샷 롤백
```

## 4. 상세 설계 — T1 (스케줄러)

### D1. 우선순위 큐 (`lithentConcurrent/src/scheduler.ts`)

기본 `redraw.ts`의 `redrawQueue: Map<Props, () => void>` 1개를 레인별 Map으로 확장.
**compKey 기준 dedup은 유지**한다 (낡은 전환 폐기가 여기서 나온다).

```
lanes: { sync: Map<CompKey, exec>, low: Map<CompKey, exec> }

setRedrawAction(compKey, exec):
  comp.up = () => {
    lanes[laneRef.value].set(compKey, exec)
    scheduleFlush(laneRef.value)
  }

scheduleFlush(sync) → queueMicrotask(flush)      // 기본과 동일 타이밍
scheduleFlush(low)  → port.postMessage(null)     // MessageChannel
```

- 같은 compKey가 두 레인에 동시에 있으면 **sync가 이기고 low에서 제거**.
- `flush(low)`는 `shouldYield()` true 시 잔여 항목을 다음 태스크로 이월.

#### Phase 1 구현 반영

- **`flushSync`는 base `execRedrawQueue`의 형태를 그대로 유지한다** (BC-3).
  `forEach` → `clear` → 플래그 해제 순서가 관측 가능한 계약이다: flush 도중 플래그가
  true로 남아 있어서 렌더 중 발생한 갱신이 **새 마이크로태스크를 잡지 않고 같은 pass에
  합류**한다. 기존 스위트가 이 동작에 의존한다.
- **low 예산은 5 ms** (`LOW_LANE_BUDGET`). `flushLow`는 항목을 실행 **전에** 큐에서
  제거하므로, 이월되는 잔여분이 정확히 "아직 안 돈 것"과 일치한다.
- **`shouldYield()`를 export**한다. Phase 8의 work loop가 작업 단위 사이에서 쓴다.

#### sync 우선 규칙은 정확성이 아니라 낭비 제거다 — Phase 1에서 확인

낡은 큐 항목은 이미 무해하다. `setRedrawAction`이 렌더마다 새 `exec`로 `comp.up`을
덮어쓰고, 큐에 남은 낡은 `exec`는 `replaceWDom`의 `if (originalWDom.il) return;`에
걸려 no-op이 된다 (REQUIREMENTS 7.6).

따라서 이 규칙을 **지워도 렌더 횟수가 변하지 않는다**. 얻는 것은 돌지 않을 작업을
큐에 두지 않는 것뿐이다.

> 이 사실의 실질적 귀결은 **테스트 방법**이다. 렌더 횟수로는 규칙의 유무를 구분할 수
> 없으므로, 큐 상태를 직접 볼 수단이 필요하다. 그래서 2-3의 스케줄러 몫인
> `hasPending(compKey, lane?)`을 Phase 1로 앞당겼다 (Phase 2는 helper 래핑만 남는다).

### D2. 우선순위 표현 — **DC-1 확정: (A) ambient**

`laneRef: { value: Lane }`를 모듈 전역으로 두고 `deferRender`가 세운다.
`Renew = () => boolean` 시그니처 변경 0 → helper 파급 없음 (REQUIREMENTS C3).
기존 `needDiffRef`/`compKeyRef` 관행과 일치.

#### ⚠ 전환은 렌더를 미루지 **상태를 미루지 않는다** — 클로저 모델의 귀결

React는 레인마다 상태 큐를 따로 들고 있어서, 전환 중인 값과 현재 값이 동시에 존재한다.
Lithent는 상태가 컴포넌트 클로저에 있고 setter가 그 자리에서 값을 바꾼다 (P2, N6).
`deferRender`가 미룰 수 있는 것은 **언제 렌더할지**뿐이다.

관측 가능한 차이:

| 상황 | React | Lithent concurrent |
|---|---|---|
| 전환 값만 바뀜 | 이전 화면 유지 | 이전 화면 유지 (동일) |
| 전환 중 같은 컴포넌트가 sync로도 렌더됨 | 전환 값은 **아직 안 보임** | 전환 값이 **즉시 보인다** |

RC-2("저우선순위 렌더 진행 전까지 이전 화면 유지")는 **그 사이에 같은 컴포넌트의 sync
렌더가 끼어들지 않는 한** 성립한다고 읽어야 한다.

레인별 상태를 두려면 값의 사본이 필요하고, 그것은 클로저 보관 방식을 바꾸는 일이라
**N6에 걸린다**. 넘지 않는다. 문서화하고 사는 쪽을 택한다 (BC 추가 없음 — 기본 코어에는
전환 자체가 없으므로 호환성 문제가 아니다).

### D3. 값 단위 deferred API (`helper/`)

반응성이 이미 값 단위이므로 helper 레벨에서 `renew` 호출만 감싼다. 코어 변경 불필요.
(소재는 `lithent-concurrent/helper` — D12b.)

```ts
export const ldeferred = <T>(value: T): State<T> => {
  let result = value;
  const renew = useRenew();
  return {
    get value() { return result; },
    set value(v) { result = v; deferRender(renew); }
  };
};
```

`hasPendingRender` (RC-3): 스케줄러가 `hasPending(compKey, 'low')` 노출 → helper가 감싼다.

#### Phase 2 구현 반영

- `deferred(value, renew)` / `ldeferred(value)` — `state`/`lstate`와 같은 모양,
  setter만 `deferRender`를 통과한다.
- `hasPendingRender()`은 **`Computed<boolean>`** 모양으로 돌려준다.
  마운터에서 호출해 compKey를 캡처하므로 컴포넌트 인스턴스에 묶인다 — `useRenew`와 같은 방식.
- **`hasPendingRender`는 그 자체로 리렌더를 일으키지 않는다.** 반응성이 아니라 조회다.
  pending 표시는 sync로 렌더되는 곳(부모·형제의 `state`/`lstate`)에 두고,
  무거운 쪽만 `deferred`로 미루는 조합으로 쓴다. RC-3의 "조회할 수 있다"가 이 의미다.

### D12b. concurrent 전용 helper의 소재 — **DC-13 확정: 별도 서브패스 패키지**

`deferred`·`ldeferred`·`hasPendingRender`는 low 레인이 있어야 의미가 있다. 어디에 둘 것인가.

**확정**: `lithent-concurrent/helper` (워크스페이스 패키지 `lithent-concurrent-helper`).
`lithent` ↔ `lithent/helper` 관계를 그대로 복제한다. `helper/`는 **한 줄도 건드리지 않는다.**

```
lithent            ↔  lithent/helper              ← 기본. 무변경
lithent-concurrent ↔  lithent-concurrent/helper   ← 신규
```

소비자 관점:

```ts
import { h, mount, deferRender } from 'lithent';   // 번들러에서 concurrent로 alias
import { lstate, computed } from 'lithent/helper';      // 기존 helper 그대로
import { ldeferred, hasPendingRender } from 'lithent-concurrent/helper';  // concurrent 전용
```

경로가 곧 "이건 concurrent에서만 동작한다"는 표시가 된다.

#### 폐기한 대안 두 가지 (둘 다 실제로 만들어 보고 물렸다)

**(a) `lithent/helper`에 넣고 네임스페이스 import로 옵셔널 접근.**

```ts
import * as core from 'lithent';
const concurrent = core as unknown as ConcurrentCore;  // 없는 이름은 undefined
```

동작은 한다. 기본 코어 폴백도 "참인 답"으로 만들 수 있다 (레인이 없으면 전환은 즉시,
pending인 것은 없음). 문제는 **기본 코어 사용자의 `lithent/helper`에 조용히 아무것도
하지 않는 API가 생긴다**는 것이다. `ldeferred`가 미루지 않고 `hasPendingRender`가 늘 false인
API를 API 목록에 두는 것은, 크기가 아니라 **약속의 문제**다.
부수적으로 테스트도 한 파일에서 두 코어를 분기 단언해야 해서 읽기 어려워진다.

**(b) concurrent 코어(`lithent-concurrent`)에 직접 export.**

concurrent 코어는 `lithent`의 드롭인 대체다. 기본 코어가 `state`/`lstate`를 export하지
않는데 concurrent만 `ldeferred`를 export하면 그 대칭이 깨진다. "최소 코어 + 선택적 helper"는
이 프로젝트의 선언된 구조이므로(CLAUDE.md), 상태 helper를 코어에 넣지 않는다.

#### 레인 관련 코어 export는 코어에 남는다

`deferRender`·`hasPending`·`whenIdle`은 스케줄러 기능이므로 **코어**에 있다.
concurrent helper는 이것들을 `lithent-concurrent`에서 **external로** import한다 —
번들에 스케줄러 사본이 들어가면 레인 큐가 둘로 갈라지기 때문이다
(`helper/`가 `lithent`를 external로 두는 것과 같은 이유).

## 5. 상세 설계 — T1.5 (순수화 + tearing)

### D4. 커밋 이펙트 리스트

diff가 즉시 수행하던 부수효과(REQUIREMENTS 7.1)를 **기록만** 하고 커밋에서 실행한다.

```
type CommitEffect =
  | { k: 'unmount', wDom }                    // diff.ts:81
  | { k: 'detach',  wDom }                    // diff.ts:82
  | { k: 'delete',  items }                   // diff.ts:237
  | { k: 'splice',  parent, index, next }     // wDom.ts:155
  | { k: 'syncAncestor', parent, prev, next } // wDom.ts:158
  | { k: 'retire',  originalWDom }            // diff.ts:57-58
```

- `makeNewWDomTree(newWDom, originalWDom, effects)` — 수집기를 **인자로** 넘긴다
  (모듈 전역이면 중첩 렌더에서 섞인다).
- 커밋 순서 — **DC-14 확정: 태그된 유니온 대신 thunk 배열 + 수집 순서 재생.**

  위 유니온과 그룹별 순서는 설계 스케치였고, 구현은 `Effects = (() => void)[]`를
  수집 순서 그대로 재생한다. 수집 순서가 **base 코어의 실행 순서 그 자체**이므로
  동치성이 구성상 보장되고, 어떤 재배치가 안전한지 매번 논증할 필요가 없다.

  > 스케치한 그룹 순서도 **실제로 넣어보고 확인했다 — 통과한다.**
  > 넓어진 순회가 중복 실행할 수 있는 두 효과가 멱등이기 때문이다:
  > `runUnmountEffects`는 실행 후 `umts`를 비우고, `removeEventListener`는
  > 이미 뗀 핸들러에 대해 무동작이다. 그러므로 그룹핑이 틀린 것은 아니고,
  > 효과가 추가될 때마다 그 논증을 다시 해야 한다는 것이 차이다.
- **`retire`를 커밋으로 미루는 것이 폐기 능력의 핵심.** 원본 `children`이 커밋 전까지
  살아있어야 WIP를 버리고 원본으로 되돌아갈 수 있다.

### D5. 커밋 경계 단일화 (BC-1) — **Phase 5 완료 (2026-09-01)**

`execMountedQueue()` 5곳(`render.ts:43, 185, 200, 284, 429`)을 커밋 종료 1곳으로 통합.

**BC-1** — 관측 가능한 순서 변화. `core-loopLifecycleOrder.tsx`, `core-mountreadycallback.tsx`,
`core-callback.tsx`, `core-nestedUnmount.tsx`, `core-destroy.tsx`는 통과 여부가 아니라
**기대값 자체를 재검토**한다.

**구현 결과.** 내부 4곳을 제거하고 `wDom.ts`의 `commit()`에 넣었다. `render()`(초기 마운트)의
flush 1곳은 남는다 — `commit()`을 거치지 않는 별도 진입점이고 그 자체가 커밋 경계다.
`wDomUpdate` 끝은 **오답**이다: 재귀 함수라 노드마다 flush되어 지금보다 더 흩어진다
(예비 실험에서 실제로 이 순서로 틀렸다).

재검토 결과 5개 파일의 기대값은 **전부 유지**됐다. 근거는 파일별로
IMPLEMENT §Phase 5에 있다. 의도된 차이(형제 마운트 콜백이 보는 DOM 완성도)는
`concurrent-commitEquivalence.test.ts`가 **양쪽 코어를 서로 다른 값에 고정**해 못 박는다.

### D6. store tearing — **DC-5 확정: (A) 버전 체크 후 재시작** — Phase 6 완료 (2026-09-01)

렌더 시작 시 `version` 기록, 커밋 직전 재비교, 다르면 폐기·재실행.
`useSyncExternalStore`와 동일 발상. 재시도 상한 초과 시 sync 폴백.
`helper/src/hook/store.ts`·`lstore.ts`의 `updater` Proxy set에서 버전 증가.

**구현하며 좁혀진 두 가지.**

1. **배선은 단방향·선택적이다 (DC-17).** 코어는 helper를 import할 수 없고(의존성 역전),
   helper는 동결된 base 코어에서도 빌드·동작해야 한다. 그래서 helper가
   `import * as lithentCore from 'lithent'` 후 `notifyStoreWrite`를 **있으면 호출**한다.
   named import였다면 base에서 링크 에러가 나지만, 모듈 네임스페이스의 없는 속성은
   그냥 `undefined`다. base에서는 무동작이고 store는 이전과 완전히 같다.

2. **폐기 자격 (DC-18).** `useUpdated`는 이펙트를 **커밋이 아니라 빌드 중에** 실행한다.
   이미 실행된 사용자 이펙트는 폐기로 되돌릴 수 없으므로, 그런 빌드를 다시 지으면
   이펙트가 두 번 돈다. 규칙은 한 문장이다 —
   **관측 가능한 일을 아무것도 하지 않은 빌드만 폐기한다.**
   마운트를 포함한 빌드(DC-7)와 `updateCallback`이 발화한 빌드는 그대로 커밋한다.
   그 대가로 그 빌드는 tearing인 채 남는다. 테스트가 이 대가를 명시적으로 단언한다.

**훅 슬롯 스냅샷/복원은 Phase 9-3에서 앞당겨 왔다.** `useUpdated`가 빌드 중에
`upD`를 쓰고 `upS`를 전진시키는데 `upS`는 커밋에서만 0으로 돌아간다(§7.4).
복원 없이 두 번째 빌드를 돌리면 어긋난 슬롯을 읽는다. 재시도의 전제 조건이라
Phase 6에 포함했다.

**T1.5에서 이 체크가 실제로 잡는 것.** 빌드가 동기이므로 store 쓰기는 그 빌드
*안에서* 시작된 것만 끼어들 수 있다(렌더 중 store에 쓰는 컴포넌트). 값은 그때도
실재하며 테스트가 그것을 잡는다. 다만 **본래의 이득은 T2**다 — 렌더가 태스크를
가로지르는 순간 외부 쓰기가 빌드 중간에 들어올 수 있게 된다.

> Lithent는 `replaceWDom`이 컴포넌트 단위 bottom-up이라 tearing 노출 구간이
> **한 컴포넌트의 서브트리 안**으로 제한된다 (React는 루트 단위). 그럼에도 T1에서
> 저우선순위 지연으로 창이 넓어지므로 T1.5에서 처리한다.

## 6. 상세 설계 — T2 (파이버)

### D7. 파이버 자료구조 + work loop — **DC-6 확정: 진짜 파이버**

제너레이터안 폐기. 근거: 유일한 장점이 크기(+1~1.5KB vs +4.5~7KB)였는데 별도 빌드에서
예산이 풀렸고, `yield*` 위임 오버헤드는 정확히 대규모 시나리오에서 아프다.

> **yield 입자는 형제 사이다 — Phase 7 실측이 정한다.**
> 400단 중첩 트리의 리프 갱신이 **0.2~0.6ms**인 반면 형제 10,000개를 훑는 단위는
> **18~60ms**다 (IMPLEMENT §Phase 7). 즉 **컴포넌트 경계나 깊이 방향에서만 yield하는
> 설계는 아무것도 사지 못한다.** 쪼개야 하는 곳은 `updateChildren` /
> `remakeChildrenForDiff`의 자식 루프 안이고, `child`/`sibling` 포인터 + work loop가
> 정확히 그 입자를 준다. 이 측정이 DC-6을 사후 정당화한다.

노드에 추가하는 필드 (모두 **가산적** — 기존 `WDom` 소비자 무영향):

| 필드 | 의미 |
|---|---|
| `child` / `sibling` / `return` | 순회 포인터 (`return` = 부모) |
| `alt` | alternate (current ↔ WIP 짝) |
| `ci` | child cursor — 몇 번째 자식까지 처리했는가 |

```
workLoop():
  while (wip && !shouldYield()) wip = performUnitOfWork(wip)
  if (wip) scheduleContinue()   // 다음 태스크에서 재개
  else commitRoot()
```

`makeNewWDomTree`의 재귀를 `beginWork`/`completeWork`로 분해한다.
diff 로직(키 매칭 Map, LIS, `checkSameWDomWithOriginal` 테이블)은 **알고리즘 그대로 이식**한다.

### D8. 훅 스냅샷 & 롤백

React가 WIP 훅 링크드 리스트를 만든 이유는 훅 상태가 파이버 노드 안에 있기 때문이다.
Lithent의 훅 상태는 `componentMap`에 외부화된 **배열 2개**다 (REQUIREMENTS §7.7).

```ts
const snap = { upD: comp.upD.slice(), upCB: comp.upCB.slice() };  // 렌더 시작
comp.upD = snap.upD; comp.upCB = snap.upCB;                        // 폐기 시
```

`upS`는 렌더마다 0으로 리셋되므로(`runUpdatedQueueFromWDom`) 롤백 대상이 아니다.
REQUIREMENTS 7.4의 이펙트 유실·중복이 모두 해소된다 (RC-8).

### D9. 마운트 포함 단위의 폐기 정책 — **DC-7 확정: (A)+(B) 병행**

폐기 시 실제로 깨지는 것은 **mounter 본문의 부수효과**뿐이다 (BC-2).
`mountCallback`은 `execMountedQueue`로 커밋에서만 돌므로 안전하다.

- (A) BC-2를 문서화하고 폐기를 허용. "부수효과는 `mountCallback`에"는 어차피 옳은 조언.
- (B) `generalize()`가 `resolve()`를 호출했는지로 "마운트 포함 단위"를 마킹하고,
  마킹된 단위는 폐기 대신 완주시킨다 (스케줄러 휴리스틱).

`compKey === props` 결합(`src/wDom.ts:254`)은 **건드리지 않는다** — 불변 props 스냅샷은
N1(Suspense-throw)에서만 필요하고, 폐기·재시작만으로는 props를 새로 만들 이유가 없다.

### D10. `getParent` 호환 접근자 (C3 필수)

파이버는 부모 접근을 `return` 포인터로 바꾸지만, 외부 소비자 2곳이 `getParent()`를 호출한다
(`helper/context.tsx:100`, `lcontext.tsx:99`). 시그니처를 유지한다:

```ts
node.getParent = () => node.return;   // 1줄 shim, 기존 인터페이스 보존
```

이것 외에 코어 밖에서 읽는 WDom 필드(`compProps`, `el`)는 파이버가 그대로 유지한다
(REQUIREMENTS §7.7 표).

## 6.5. Phase 0에서 확정된 빌드 인프라 설계

### D12. 분기 표를 단일 원본으로 — **DC-10 확정**

§2.2 참조. `alias.js`의 `forkModules` 하나를 vite 빌드 · vitest · 타입 생성이 공유한다.
"무엇이 분기본인가"에 대한 답이 세 군데에 복제되면, 그중 하나만 어긋났을 때
**런타임 그래프와 타입 표면이 서로 다른 코어를 가리키는** 상태가 조용히 만들어진다.

### D13. 타입 선언 생성 — **DC-11 확정: `tsc` + specifier 재작성**

문제: `vite-plugin-dts`는 소스 루트가 하나라고 가정한다. 이 패키지는 의도적으로 둘이다
(`lithentConcurrent/src` 분기본 + `../src` 공유분 709줄). 결과는 `TS6059 rootDir` 오류이며,
`rootDir`/`entryRoot`/`root`를 어떻게 조합해도 **분기본과 공유분이 함께 나오는 조합이 없었다**.

확정안: `tsconfig.build.json`(`rootDir: '..'`, `emitDeclarationOnly`)로 `tsc`를 돌리고,
`scripts/emitTypes.js`가 살아남은 `@/…` specifier를 상대 경로로 재작성한다.

- 재작성은 **`forkModules`를 그대로 사용**한다 (D12). 따라서 타입 표면이 런타임 그래프와
  다른 모듈을 가리키는 일이 원리적으로 불가능하다.
- 재작성 후 `@/`가 남아 있으면 **exit 1**. 조용히 깨진 `.d.ts`를 내보내지 않는다.
- 산출 경로: `dist/types/lithentConcurrent/src/*.d.ts`(분기본) + `dist/types/src/**`(공유분).
  `package.json`의 `types`는 전자의 `index.d.ts`를 가리킨다.
- 검증: 이 선언만으로 외부 소비자 파일이 `tsc --strict`를 통과하는 것을 확인했다.

> 대안으로 "concurrent는 기본 코어의 `.d.ts`를 그대로 쓴다"도 검토했다. C3(인터페이스 동일)
> 때문에 Phase 0에서는 성립하지만, T1에서 `deferRender`가 추가되는 순간 거짓이 된다.
> 계약을 문서가 아니라 **생성물로** 유지하는 쪽을 택했다.

### D14. 위성 스위트의 코어 전환 — **DC-12 확정: `LITHENT_CORE` + 빌드 산출물 alias**

RC-9은 위성 스위트를 양쪽 코어에서 돌릴 것을 요구한다. 순진한 방법(위성 테스트에서
`lithent`를 concurrent **소스**로 alias)은 성립하지 않는다 — 위성 패키지도 자기 `src`를
`@`로 alias하는데, concurrent 소스 역시 `@`로 코어를 참조하므로 **같은 `@`가 두 의미를
가져야** 하기 때문이다.

확정안: 각 위성의 `vite.config.js`에서 `LITHENT_CORE=concurrent`일 때 bare `lithent`를
**빌드된 번들**(`../lithentConcurrent/dist/lithentConcurrent.mjs`)로 돌린다.

- 번들은 `@`를 이미 해소한 상태이므로 `@` 충돌이 원천적으로 없다.
- 소비자가 실제로 하는 일(번들러에서 `lithent` → `lithent-concurrent` alias)과 **동일한 경로**를
  검증하게 된다. 소스 alias보다 계약에 가깝다.
- **매칭은 반드시 anchored `/^lithent$/`**여야 한다. Vite의 객체형 alias는 prefix 매칭이라
  `lithent/jsx-dev-runtime` → `<번들경로>/jsx-dev-runtime`으로 망가진다.
  (Phase 0에서 실제로 ssr 스위트가 이 형태로 깨졌고, 배열형 + 정규식으로 고쳤다.)
  서브패스(`lithent/helper`, `lithent/jsx-dev-runtime`)는 실제 패키지로 남아야 한다 —
  **교체 대상은 코어뿐**이다.
- 스크립트: `pnpm test:satellites` / `pnpm test:satellites:concurrent` / `pnpm test:dual`.
- 이 alias가 실제로 작동함을 확인했다: concurrent 번들을 숨기면 `Failed to resolve import
  "lithent"`로 실패하고, 되돌리면 통과한다. 즉 통과가 공허하지 않다.

### D15. RC-4를 실행 가능한 게이트로

`scripts/size-report.js`가 두 빌드의 brotli를 재고 예산 초과 시 **exit 1**. 기본 코어 예산은
목표가 아니라 **회귀 가드**다 — `src/`가 동결(P1)이므로 움직였다면 경계를 넘어 뭔가 샌 것이다.
concurrent 예산 상수(`CONCURRENT_BUDGET`)는 단계 진입 시에만 올린다.

---

## 7. 결정 체크리스트

- [x] **DC-1**: 우선순위 API 표현 → **(A) ambient `deferRender`**.
  근거: `Renew` 시그니처 변경 0, helper 파급 없음, 기존 전역 플래그 관행과 일치.
- [x] **DC-2**: 레인 개수 → **2단계 (sync / low)**.
  근거: 3단계의 실이득 미검증. 후속 추가는 하위 호환.
- [x] **DC-3**: 저우선순위 스케줄링 → **MessageChannel**.
  근거: 브라우저 호환성, `requestIdleCallback` 타이밍 부정확, `scheduler.postTask` 지원 부족.
  Phase 1 구현: 채널은 **첫 low 갱신에서 지연 생성**하고(전환을 안 쓰면 비용 0),
  `MessageChannel`이 없는 런타임에서는 `setTimeout` 폴백.
- [x] **DC-4**: 크기 예산 → **이원화** (기본 회귀 가드 ≤ 4,800 B / concurrent 단계별 상한).
  근거: 별도 빌드이므로 concurrent 예산 해제, 대신 **기본 코어 가드를 더 엄격하게**
  (선행 작업 5,120 B → 4,800 B). 철학 보호선은 여기다.
- [x] **DC-5**: tearing → **(A) 버전 체크 후 재시작**.
  근거: ~30줄, 클로닝 없음, `useSyncExternalStore`와 동일 발상.
- [x] **DC-6**: 중단 구현 → **진짜 파이버** (제너레이터안 폐기).
  근거: 예산 해제로 제너레이터의 유일한 장점 소멸. `yield*` 오버헤드는 대규모 시나리오에서 치명적.
  C2 허용폭: concurrent 빌드는 "기본 대비 회귀"가 아니라 **"대규모 시나리오 총 체감"**으로 판정.
- [x] **DC-7**: 마운트 단위 폐기 → **(A)+(B) 병행**. `compKey`/`props` 분리는 **보류**.
- [x] **DC-8**: BC-1·BC-2 semver → **minor + 체인지로그 명시**.
  근거: BC-1은 순서 정합성 개선, BC-2는 옵트인 경로에서만 발생.
- [x] **DC-9**: BC-4(`nextTick` 레인 의존성) → **`whenIdle()` 신규 제공, `nextTick` 의미는 불변**.
  근거: 기존 12개 사용처 호환 유지가 우선.
- [x] **DC-10**: 분기 표의 위치 → **`alias.js`의 `forkModules` 단일 원본** (D12).
  근거: 빌드·테스트·타입 생성 세 소비자가 어긋나면 런타임과 타입이 다른 코어를 가리킨다.
- [x] **DC-11**: 타입 선언 생성 → **`tsc` + specifier 재작성** (D13). `vite-plugin-dts` 폐기.
  근거: 소스 루트가 둘이라 플러그인이 성립하지 않음. 재작성이 `forkModules`를 공유하므로
  타입 표면이 런타임 그래프와 갈라질 수 없다.
- [x] **DC-12**: 위성 스위트 코어 전환 → **`LITHENT_CORE` + 빌드 산출물 alias (anchored)** (D14).
  근거: 소스 alias는 위성의 `@`와 코어의 `@`가 충돌한다. 번들 alias는 충돌이 없고
  소비자의 실제 경로와 동일하다.
- [x] **DC-13**: concurrent 전용 helper의 소재 → **`lithent-concurrent/helper` 별도 서브패스** (D12b).
  근거: `lithent/helper`에 두면 기본 코어 사용자에게 조용히 no-op인 API가 생긴다.
  코어에 두면 "최소 코어 + 선택적 helper" 구조가 깨진다. 경로가 곧 적용 범위 표시가 된다.
- [x] **DC-14**: 커밋 이펙트 표현·순서 → **thunk 배열 + 수집 순서 재생** (D4).
  근거: 수집 순서 = base의 실행 순서이므로 동치성이 구성상 보장된다.
  그룹 순서도 통과하지만(효과들이 멱등), 효과가 늘 때마다 안전성을 재논증해야 한다.
- [x] **DC-15**: 저우선순위 API 이름 → **`deferRender`** (구 `startTransition`),
  helper의 pending 조회는 **`hasPendingRender`** (구 `isPending`). 확정 2026-09-01.
  근거: React의 `startTransition`은 (1) 새 UI가 준비될 때까지 이전 상태가 보인다는
  전환 의미론과 (2) 반응성 `isPending`을 함께 뜻한다. 여기엔 **둘 다 없다** —
  값은 즉시 쓰이고(RC-2의 단서), pending은 조회다(RC-3의 단서). 이름이 없는 보장을
  끌어오면 그 오해는 조용히 잘못된 UI로 나타나므로, 실제 계약("렌더를 미룬다")을 이름에 둔다.
  코어의 저수준 `hasPending(compKey, lane?)`은 **그대로 둔다**. helper 쪽에 같은 이름을
  쓰면 시그니처·반환 타입이 다른 동명 API가 두 패키지에 생겨 문서가 모호해진다.
  → 같은 규칙을 프로젝트 이름에도 적용한 것이 REQUIREMENTS **§2.1**이다
  (T2 완주 전까지 "concurrent rendering"이라 서술하지 않고, 완주 후에도 `concurrent mode`는
  쓰지 않는다). 명명 근거는 RC-10(수동 E-4) 통과다.
- [x] **DC-19**: 순회 상태의 소재 → **명시적 스택** (노드 포인터 폐기). 확정 2026-09-01 (Phase 8).
  근거: `WDom`이 동결 코어에 있고 인덱스 시그니처가 없어 포크가 넓힐 수 없다(P1).
  스택은 O(깊이)이고 노드 모양을 안 바꾸므로 C3가 유지되며 D10 shim도 필요 없다.
- [x] **DC-20**: 무엇을 중단할 수 있는가 → **low 레인 빌드만.** 확정 2026-09-01 (Phase 8).
  근거: sync 플러시는 마이크로태스크이고 `await nextTick()` = "커밋 완료" 계약에
  44개 파일·72곳이 의존한다. `flushSync`는 자기 주변에서 low 표시를 끈다 —
  안 끄면 low 슬라이스에서 올라온 sync 렌더가 스스로 멈춰 서고 두 갱신이 모두 유실된다.
- [x] **DC-17**: 코어↔helper store 배선 방향 → **helper가 코어 네임스페이스에서 선택적 호출**
  (`notifyStoreWrite`). 확정 2026-09-01 (Phase 6).
  근거: 코어는 helper를 import할 수 없고 helper는 동결된 base에서도 돌아야 한다.
  named import는 base에서 링크 에러, 네임스페이스의 없는 속성은 `undefined`다.
- [x] **DC-18**: 무엇을 폐기해도 되는가 → **관측 가능한 일을 하지 않은 빌드만.**
  확정 2026-09-01 (Phase 6).
  근거: `useUpdated`가 이펙트를 빌드 중에 실행하므로 폐기가 그것을 되돌리지 못한다.
  마운트 포함(DC-7)과 `updateCallback` 발화 빌드는 그대로 커밋하고, 그 빌드가
  tearing인 채 남는 것을 대가로 받아들인다. T2 Phase 9에서 재검토 대상.
- [x] **DC-16**: T1을 기본 `lithent`에 통합할 것인가 → **통합하지 않는다. 별도 빌드 유지.**
  확정 2026-09-01 (사용자 결정).
  근거: T1.5/T2를 계속하므로 지금 통합해도 아끼는 것이 없고 기본 코어만 무거워진다
  (BC-1은 T1.5, 파이버는 +4~7 KB). 이중 빌드 기계장치(DC-10~DC-13)는 그 전제 위에서
  값을 한다. §1.1의 제품 결정과 REQUIREMENTS §"T1의 이득 구간" 실측이 그대로 유효하다.
  → 이 결정으로 P1(`src/` 동결)은 T2까지 유지된다.

## 8. 설계 ↔ 검증 연결

| 설계 | 검증 |
|---|---|
| §2.2 alias / Fragment 동일성 | Phase 0-5·0-6, 수동 A-5 |
| D1 우선순위 큐 | RC-1 (Phase 1) ✅, 수동 B-1 |
| D1 sync 우선 규칙 | `hasPending` 기반 큐 상태 단언 (렌더 횟수로는 관측 불가) |
| D1 yield | low flush 도중 발생한 sync 갱신이 잔여 low보다 먼저 커밋 |
| D2 우선순위 표현 | C3 회귀 (기존 helper 테스트 무수정 통과) ✅ |
| D2 lane 복원 | `deferRender` 스코프가 throw해도 이전 레인 복원 / 중첩 |
| D3 deferred API | RC-2·RC-3 (Phase 2) ✅, 수동 B-2 |
| D5 커밋 경계 | RC-5 (Phase 5) ✅, 4-9 BC-1 블록(양쪽 코어 상이값 고정), 수동 C-1·C-6 |
| D6 store tearing | RC-6 (Phase 6) ✅ `concurrent-storeTearing`, 배선은 `helper/…/storeVersion` × `test:dual` |
| D7 yield 입자 | RC-7 (Phase 7) ✅ `pnpm bench:units` — 형제 10k 18~60ms vs 깊이 400단 0.2ms |
| D7 work loop 중단·재개 | Phase 8 ✅ `concurrent-workLoop` — `shouldPause` 주입 + `setLowLaneBudget(0)` 강제 |
| D12b helper 소재 | `helper/` 무변경(`git status helper/`) + concurrent helper 스위트 7개 |
| D11 `whenIdle` | BC-4 (Phase 2) ✅, 수동 B-9 |
| D4 커밋 이펙트 리스트 | `concurrent-commitEquivalence.test.ts` — DOM + 라이프사이클 순서를 **양쪽 빌드 산출물**로 비교 |
| D4 폐기 능력 (더블 버퍼링) | `concurrent-abandon.test.tsx` — 빌드 후 미커밋 시 원본 무손상 |
| D5 커밋 경계 단일화 | RC-5, 수동 C-1~C-6 |
| D6 store 버전 | RC-6 (Phase 6), 수동 F |
| D7 파이버 work loop | RC-7·RC-10 (Phase 8), 수동 E-1·E-4 |
| D8 훅 스냅샷 | RC-8 (Phase 9), 수동 E-3 |
| D9 마운트 정책 | RC-8, 수동 E-2 |
| D10 `getParent` shim | **RC-9** (양쪽 코어 위성 통과), 수동 A-6 |
| D12 분기 표 단일 원본 | `concurrent-aliasTable.test.ts` (Phase 0-4) |
| D13 타입 선언 생성 | `emitTypes.js`의 잔여 `@/` exit 1 + 외부 소비자 `tsc --strict` 통과 |
| D14 위성 코어 전환 | **RC-9** — `pnpm test:dual`, 번들 은닉 시 실패 확인 |
| D15 크기 게이트 | **RC-4** — `pnpm size` (exit 1) |
| 출하 산출물 (export map · 번들 · `.d.ts`) | `pnpm verify:concurrent` — 소스가 아닌 설치물을 본다 |
| C3 export 표면 | `concurrent-exportSurface.test.ts` (빌드된 기본 번들과 이름 집합 비교) |

## 9. 상태 / 핸드오프

- done: 배포 구조 설계, D1~D11, DC-1~DC-9 확정, 설계↔검증 매핑.
  **Phase 0** — D12~D15 / DC-10~DC-12.
  **Phase 1** — D1·D2 구현 반영 (전환의 상태 의미론 한계, sync 우선 규칙의 성격).
  **Phase 2** — D3·D11 구현 반영, D12b / DC-13.
  **Phase 4 (2026-08-31)** — D4 구현 반영, **DC-14**. diff 단계가 순수해졌다.
- next: Phase 5 (커밋 경계 단일화, D5 / BC-1).
  - **BC-1은 의도된 관측 가능한 변화다.** 지금까지와 달리 "기존 테스트 무수정 통과"가
    목표가 아니며, 4-9의 라이프사이클 순서 비교도 함께 재검토해야 한다.
  - `render.ts`는 아직 base와 바이트 동일하다. Phase 5에서 갈라진다.
- blockers: 없음. (3-4 수동 확인과 3-5 릴리스 판정은 미완이며 사람 몫)
- 기준 커밋: `f3921cc` (설계 기준) / Phase 0: `95ae243` / Phase 1: `16d9e74` /
  Phase 2: `3ebf375` / Phase 3: `299d4cd` / **Phase 4: `d094a4e`**
