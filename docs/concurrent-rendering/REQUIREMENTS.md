# REQUIREMENTS — Lithent Concurrent 렌더링 (별도 빌드)

- 브랜치: `feat/concurrentRendering` / 기준 커밋 `f3921cc`
- 작성일: 2026-08-28 (최종 수정: 2026-08-31)
- 상태: **T1 완성 / T1.5 진행 중 — Phase 5 완료 (2026-09-01)**
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 선행 작업: [../performance-improvement/](../performance-improvement/) (keyed diff Map+LIS, `f185dd2`~`f3921cc`)

## 1. 배경 및 목적

### 1.1 제품 결정 (2026-08-28)

기존 `lithent` 코어는 **현 상태로 완성**으로 본다. 경량·핵심 기능만 유지한다는 철학에서
concurrent 모드는 벗어나며, 대부분의 사용 환경(SSR 페이지에 인터랙티브 컴포넌트 삽입)에서
체감 이득이 없다.

따라서 concurrent는 **기존 코어를 수정하지 않고**, 인터페이스 호환되는
**대규모 사이트용 별도 빌드**로 만든다. 같은 레포에서 2중 빌드한다 (§3).

> **재확인 (2026-09-01, DC-16)** — T1 완성 후 "T1만이라도 기본 `lithent`에 합칠까"를
> 다시 검토했고, **합치지 않기로 확정**했다. T1.5/T2를 계속하므로 지금 통합해도 아끼는
> 것이 없고 기본 코어만 무거워진다. 아래 §1.2의 "기본 코어 동결"은 T2까지 유효하다.
> 같은 검토에서 저우선순위 API 이름을 `startTransition` → **`deferRender`**,
> pending 조회를 `isPending` → **`hasPendingRender`** 로 바꿨다 (DC-15).

### 1.2 지켜야 할 것

1. **기본 코어 동결** — `src/`는 이 작업에서 한 줄도 변경하지 않는다.
   기본 빌드 크기는 회귀 가드로 고정한다 (RC-4).
2. **클로저 컴포넌트 모델** — mounter 1회 실행, 상태는 클로저에
   (`src/wDom.ts:254` `createComponentResolver`, `helper/src/hook/state.ts`).
   **파이버를 도입해도 이 모델은 유지된다** (§7.7).
3. **인터페이스 호환** — 위성 패키지(helper·ssr·devHelper·ftags·tag·jsx-runtime)와
   빌드 툴링(`packages/*`)이 양쪽 코어에서 수정 없이 동작해야 한다.

## 2. 용어 정의 (문서 전체에서 이 정의를 따른다)

| 용어 | 정의 | 필요 장치 |
|---|---|---|
| **미루기 (deferral)** | 렌더를 *언제 시작할지* 제어. 작업 단위 사이에서 yield | 스케줄러 (T1) |
| **중단 (interruption)** | 이미 시작한 트리 순회를 *중간에* 멈춤 | 재개 가능한 순회 (T2) |
| **재개 (resume)** | 멈춘 지점부터 이어감. 버리는 것 없음 | 순회 커서 |
| **폐기 (abandon)** | 만들던 WIP 트리를 버리고 재시작 | 원본 트리 불변성 (T1.5) |
| **더블 버퍼링** | 원본 트리와 WIP 트리가 동시에 온전히 존재 | diff 순수화 (T1.5) |

**중요**: 더블 버퍼링은 *폐기*의 조건이지 *중단*의 조건이 아니다.
중단의 조건은 **재개 가능한 순회 구조**다.

### 2.1 언제 "concurrent"라 부를 수 있는가 (2026-09-01 확정)

이름은 DC-15와 같은 규칙을 따른다 — **없는 보장을 이름이 끌어오지 않게 한다.**

정의가 두 갈래다. 느슨하게 "우선순위 기반 스케줄링"을 concurrent라 부르면 T1도 해당하고,
엄격하게 "렌더가 중단 가능하다"를 뜻하면 T2부터다. **사용자의 기대치는 React가 정해놨으므로
실무에서 유효한 것은 엄격한 쪽이다.**

| 속성 | 채워지는 단계 | 현재 |
|---|---|---|
| 우선순위 | T1 (Phase 1) | ✅ |
| 폐기 (원본 트리 불변) | T1.5 (Phase 4) | ✅ |
| tearing 방지 | T1.5 (Phase 6) | 미착수 |
| **중단** | T2 (Phase 8) | 미착수 |
| **재개** | T2 (Phase 8) | 미착수 |
| 폐기 시 훅 상태 정합 | T2 (Phase 9, §7.4) | 미착수 |

**T1 현재 상태는 concurrent rendering이 아니다.** `flushLow`의 `shouldYield()`는 큐 항목
*사이*에서만 확인되고 항목 하나는 컴포넌트 렌더 전체다 — 즉 yield 입자가 "컴포넌트 1개"이며
트리 순회 도중에 멈추는 지점이 없다. §8 "T1의 이득 구간" 실측이 이것의 지문이다:
렌더 60ms / 입력 100ms에서 이득이 **정확히 0**인 이유는 그 60ms를 쪼갤 수 없기 때문이다.

**T2 완주 후에는 "concurrent rendering"이 정확한 서술이 된다.** 위 표에 빈 칸이 없어진다.

**그때도 `concurrent mode`라는 표현은 쓰지 않는다.** 그것은 React가 특정 *기능 묶음*
(transition + Suspense + `useDeferredValue` + 선택적 하이드레이션)에 붙였던 고유명사이고,
우리가 갖는 것은 그 묶음이 아니라 **그 아래의 렌더러 속성**이다. 이 표현을 쓰면
`startTransition`을 썼을 때와 같은 오해를 산다 (DC-15).

- 사용자 대면 문구: **"중단 가능한 렌더링(interruptible rendering)"** 또는
  "우선순위 기반 concurrent rendering"
- README·릴리스 노트에 `concurrent mode`를 넣지 않는다. 내부 코드네임으로는 무해하다.
- 패키지명 `lithent-concurrent`는 **T2 완주를 전제로** 정직하다 (DC-16이 그 전제를 확정했다).
  T1만 단독 릴리스한다면 이름을 재검토한다 (IMPLEMENT 3-5).

**T2 완주 후에도 없는 것** — 결함이 아니라 다른 제품이다:

1. **transition 의미론.** 파이버는 순회를 중단 가능하게 만들지 상태를 버전화하지 않는다.
   상태가 컴포넌트 클로저에 있는 한(N6) "새 UI가 준비될 때까지 이전 값이 보인다"와
   반응성 pending은 T2 이후에도 없다. §8 "RC-2의 단서"·"RC-3의 단서"는 임시 제약이 아니라
   이 아키텍처의 영구 속성이다.
2. **Suspense / `use()`.** N1은 목표 미달이 아니라 **불변 조건**이다 (§5).

**이름은 코드가 아니라 측정으로 번다.** 파이버 자료구조가 들어간 시점이 아니라
**RC-10(수동 E-4)이 통과하는 시점**에 위 주장이 참이 된다.

## 3. 배포 구조 — 모노레포 2중 빌드

### 3.1 결정 근거 (실측)

| 구분 | 줄 수 | 비율 |
|---|---|---|
| **분기 대상** (`diff` `render` `wDom` `redraw`) | 1,461 | **15%** |
| 코어 내 공유 (types, predicator, utils, universalRef, hooks) | 709 | 7% |
| 위성 패키지 (helper 1,046 / ssr 346 / devHelper 222 / ftags 84 / jsx-runtime 34 / tag 4) | 1,736 | 18% |
| 빌드 툴링 (`packages/*`) | 5,886 | 60% |

- 위성 → 코어 import **41건 전부 bare `'lithent'`, deep import 0건** (실측 2026-08-31.
  구현 24 + 테스트 17. 최초 기록 39건은 측정 시점 차이).
  공개 인터페이스는 `src/index.ts`의 **값 export 21개 + 타입 export 16개**
  (최초 기록 "11개"는 오기) → 인터페이스만 지키면 양쪽에서 공유된다.
  Phase 0에서 `concurrent-exportSurface.test.ts`로 이 집합을 고정했다.
- 전체의 15%만 갈라진다. 별도 레포로 가면 나머지 85%를 복제하거나 크로스 레포 의존을 관리해야 한다.
- **비대칭**: 나중에 쪼개는 것은 디렉터리 이동으로 끝나지만, 나중에 합치는 것은 어렵다.

### 3.2 레이아웃

```
src/                        ← 동결. 기본 코어
  types/  utils/predicator.ts  utils/index.ts
  utils/universalRef.ts  hook/*                   ← 공유 (709줄)
  diff.ts  render.ts  wDom.ts  utils/redraw.ts    ← 기본 전용 (1,461줄)

lithentConcurrent/          ← 워크스페이스 패키지 (name: lithent-concurrent). Phase 0에서 생성
  src/
    diff.ts  render.ts  wDom.ts                    ← 분기본 (아직 base와 바이트 동일)
    scheduler.ts                                   ← 분기본 (Phase 1에서 2레인으로 재작성)
    index.ts                                       ← base와 동일 + concurrent 전용 3개
    tests/                                         ← alias 함정 가드 + export 계약 가드 + 레인 테스트
  alias.js  alias.d.ts                             ← 분기 표 단일 원본 (DESIGN D12)
  scripts/emitTypes.js                             ← 타입 선언 생성 (DESIGN D13)
  package.json  tsconfig.json  tsconfig.build.json
  vite.config.js                                   ← 빌드. alias로 공유분 재사용
  vitest.config.js                                 ← 공유 core 스위트를 concurrent 코어로 실행

  helper/                   ← 워크스페이스 패키지 (name: lithent-concurrent-helper). Phase 2
    src/hook/{deferred,ldeferred,hasPendingRender}.ts     ← 레인이 있어야 의미 있는 helper (DC-13)
    src/types.ts  src/index.ts  src/tests/
    package.json  tsconfig.json  vite.config.js    ← 코어는 external
```

`helper/`(기본)는 **이 작업에서 무변경**이다. 기본 코어에서 no-op이 되는 API를
거기 두지 않는다는 것이 DC-13의 요지다.

소비자 측은 preact/compat과 동일한 패턴 — 번들러에서 `lithent` → `lithent-concurrent` alias.

### 3.3 크기 철학은 레포 경계가 아니라 빌드 게이트가 지킨다

기본 빌드가 가벼운 것을 보장하는 것은 **별도 entry point + `sideEffects: false`(이미 설정됨)
+ RC-4 게이트**다. 한 레포에 있어도 기본 사용자는 concurrent 코드를 1바이트도 받지 않는다.

## 4. 범위 — 3단계

### T1 — 스케줄러
우선순위 큐(2레인), 저우선순위 유휴 실행, ambient `deferRender`, 값 단위 deferred state.
작업 단위(컴포넌트 1개의 `replaceWDom`)는 **원자적으로 유지**한다.

### T1.5 — diff 순수화 + tearing
diff 단계의 부수효과를 커밋 이펙트 리스트로 분리, 커밋 경계 단일화, store 버전 체크.
**파이버의 전제**이기도 하다 (원본 트리 불변성 = 폐기 능력).

### T2 — 파이버 중단
child/sibling/return 포인터 + 명시적 work loop + alternate(current/WIP) 도입.
크기 예산이 해제되었으므로 제너레이터가 아닌 **진짜 파이버**로 간다 (DC-6).

> 제너레이터안(구 "T2-lite")은 폐기되었다. 유일한 장점이 크기(+1~1.5KB vs +4.5~7KB)였는데
> 별도 빌드에서 예산이 풀렸고, 단점인 `yield*` 위임 런타임 오버헤드는 정확히
> 대규모 사이트에서 아픈 부분이다.

## 5. 비목표 (Non-goals)

- **N1. Suspense-via-throw / `use()` 훅. — 불변 조건(INVARIANT)**
  렌더 중 Promise를 던지고 언와인딩하는 패턴. mounter를 본문 중간에서 끊었다가
  처음부터 재호출해야 하는데, 클로저 상태 모델과 근본적으로 충돌한다
  (JS는 throw로 빠져나간 일반 함수를 재개할 수 없다).
  > **⚠ 파이버 도입 후 특히 주의.** 언와인딩은 "throw 잡고 `return` 포인터 타고 올라가기"인데
  > 파이버가 그 포인터를 이미 깔아준다. 기계장치의 80%가 공짜로 생기므로 유혹이 커진다.
  > **N1을 넘는 것은 아키텍처 변경이 아니라 사용자 인터페이스 파괴**이며,
  > 원한다면 별도의 명시적 결정으로 다뤄야 한다. 슬금슬금 넘어가서는 안 되는 선이다.
  >
  > 대체: 경계 컴포넌트가 promise를 명시적으로 받는 `<Async>` 패턴 (코어 변경 불필요).
- **N2. 기존 `src/` 수정.** 기본 코어는 동결이다. 공유 모듈 변경이 불가피하면
  양쪽 테스트 스위트를 모두 통과해야 하며 기본 빌드 크기 가드(RC-4)를 지켜야 한다.
- **N3. 에러 바운더리 언와인딩.** 현행 `devHelper/createBoundary.ts`는 **HMR 바운더리**이지
  에러 바운더리가 아니다 (fallback UI 렌더 코드 없음, `catch`는 144행 HMR 교체 실패 warn 1곳).
  필요하면 `try/catch` + fallback 상태를 가진 경계 컴포넌트로 별도 진행한다.
- **N4. 선택적(selective) hydration.** `ssr/src/hydration.ts`는 단일 동기 재귀 구조라 전면 재작성 필요.
- **N5. SSR 스트리밍.** N4와 함께 별도 과제.
- **N6. 클로저 상태 모델 변경.** `state`/`lstate`의 클로저 보관 방식을 바꾸지 않는다.

## 6. 제약 (Constraints)

- **C1. 크기 예산 이원화** — 기본 코어는 회귀 가드, concurrent는 단계별 상한 (RC-4).
- **C2. 벤치마크** — T1·T1.5는 회귀 0. T2 파이버는 DC-6 허용폭 적용.
  단, concurrent 빌드의 판정 기준은 "기본 코어 대비"가 아니라 "대규모 시나리오에서의 총 체감"이다.
- **C3. 인터페이스 보존** — 위성의 bare `lithent` import 41건과 공개 export
  (값 21 + 타입 16)가 무수정 동작해야 한다 (§3.1 실측).
  Phase 0의 `concurrent-exportSurface.test.ts`가 이름 집합을 자동 고정하며,
  concurrent 전용 export 추가는 그 파일의 `CONCURRENT_ONLY`에 명시해야 통과한다.
  파이버 전환 시 **`getParent` 호환 접근자를 반드시 유지**한다 (§7.7).
- **C4. 참조 안정성** — WDom의 `props`/`children` 배열 인스턴스는 조상·클로저가 공유하므로
  in-place 동기화만 허용 (`src/diff.ts:144-165`).
- **C5. 단계별 독립 출하** — T1, T1.5, T2는 각각 단독 머지·릴리스 가능해야 한다.
- **C6. 테스트 통과** — `pnpm build && pnpm test` 전량 통과 + 위성 스위트를 **양쪽 코어에서**
  실행 (`pnpm test:dual`). Phase 0에서 이 인프라가 완성되었다.

## 7. 현행 코드 분석 (concurrent 구현의 substrate)

### 7.1 렌더 단계가 순수하지 않음 (T1.5에서 해소) — **Phase 4에서 해소됨**

> **완료 (2026-08-31).** 아래 5곳이 전부 커밋 이펙트로 옮겨졌다
> (`lithentConcurrent/src/{diff,wDom}.ts`). diff 단계는 이제 새 트리 밖의
> 어떤 것도 건드리지 않으며, 원본 트리는 커밋 전까지 온전하다 —
> 즉 **더블 버퍼링이 성립한다**. `concurrent-abandon.test.tsx`가 이를 고정한다.

| 위치 | 하는 일 | 영향 |
|---|---|---|
| `src/diff.ts:57-58` | `originalWDom.il = true; delete originalWDom.children` | 원본 트리 파괴 → 폐기 불가 |
| `src/diff.ts:81-82` | `runUnmountQueueFromWDom` + `recursiveRemoveEvent` | 커밋 전 unmount 이펙트·이벤트 해제 |
| `src/diff.ts:237` | `typeDeleteUnused(unUsedChildren)` | **diff 중 실제 DOM 삭제** |
| `src/wDom.ts:155` | `brothers.splice(index, 1, newWDomTree)` | 커밋 전 부모 children 변형 |
| `src/wDom.ts:158` | `syncAncestorComponentChildren` | 커밋 전 조상 `compChild` 변형 |

### 7.2 커밋 경계가 흩어져 있음 (T1.5에서 해소)

`execMountedQueue()` 호출 지점 5곳: `src/render.ts:43, 185, 200, 284, 429`.

### 7.3 재개 가능한 순회 구조 없음 (T2에서 해소)

`makeNewWDomTree → remakeChildrenForDiff → .map() → 재귀`.
순회 상태가 JS 콜스택에 있어 함수 반환 시 소멸하고, `.map()` 중간에서 멈출 수 없다.

### 7.4 훅 상태에 WIP 슬롯 없음 (T2에서 해소)

`src/hook/internal/useUpdate.ts`의 `useUpdated`:
```ts
upD[upS.value] = nextDependencies;   // 렌더 중 기록
component.upCB.push(callback);        // 렌더 중 누적
```
폐기 시 `upD`에 새 deps가 이미 박혀 재시도 비교가 "같음"이 되어 **이펙트 유실**,
`upCB`는 **중복 누적**된다.

### 7.5 store에 스냅샷 없음 (T1.5에서 해소)

`helper/src/hook/store.ts` / `lstore.ts`는 Proxy로 `value`를 직통 읽으며 버전이 없다.

### 7.6 유리한 조건

- **이미 build-then-commit 구조.** `replaceWDom`이 `makeNewWDomTree()`로 트리를 완성한 뒤
  `wDomUpdate()`로 커밋한다. 오염(7.1)만 걷어내면 별도 alternate 없이도 더블 버퍼링이 성립한다.
- **큐 dedup이 이미 있다.** `redrawQueue: Map<Props, () => void>`가 compKey 기준 병합 → 낡은 전환 폐기.
- **낡은 큐 항목 가드가 있다.** `replaceWDom`의 `if (originalWDom.il) return;`, `componentMap.get` 실패 시 `false`.
- **훅 상태가 외부화·소형.** `upD`/`upCB`는 배열 2개 → 스냅샷 & 롤백(~10줄)으로 충분.
- **반응성이 이미 값 단위.** `state`/`lstate`는 값마다 `renew`, `store`는 구독자별 `run`.

### 7.7 파이버가 클로저 모델을 깨지 않는 이유 (핵심)

| | 훅 상태 위치 | alternate 도입 시 |
|---|---|---|
| **React** | 파이버 노드 안 (`memoizedState` 링크드 리스트) | 훅 상태도 복제 필요 → WIP 훅 리스트 |
| **Lithent** | `componentMap` (WeakMap, 트리 **밖**). 값은 updater 클로저, 클로저는 `reRender`에 매달림 | current·WIP 노드가 **같은 인스턴스 클로저를 공유** → 복제 불필요 |

`runUpdate`가 `vDom.reRender()`로 원본 노드의 클로저를 재사용하는 현행 구조가 그대로 성립한다.
alternate가 추가로 요구하는 것은 폐기 시 `upD`/`upCB` 롤백뿐이다.

**코어 밖에서 WDom 내부를 읽는 곳은 정확히 4군데**이며, 구조적 영향은 하나뿐이다:

| 위치 | 필드 | 파이버 영향 |
|---|---|---|
| `helper/context.tsx:100`, `lcontext.tsx:99` | `wdom.getParent?.()` | **유일** — `return` 포인터로 바뀜 |
| `helper/context.tsx:93-96`, `lcontext.tsx` | `wdom.compProps` | 없음 |
| `devHelper/createBoundary.ts:127` | `currentWDom.el` | 없음 |
| `ssr/hydration.ts:26,84,119,136` | `item.el` 대입 | 없음 |

→ **호환 접근자 1줄로 해소** (C3): `getParent: () => node.return`

## 8. 수용 기준 (Acceptance Criteria)

| ID | 기준 | 판정 방법 |
|---|---|---|
| **RC-1** | 급한 업데이트가 저우선순위 업데이트보다 먼저 커밋된다 | 단위 테스트 (큐 순서) — **Phase 1 통과** |
| **RC-2** | 저우선순위 렌더 진행 전까지 이전 화면이 유지된다 | 단위 테스트 + 수동 B-2 — **Phase 1 통과** (단서는 아래) |
| **RC-3** | `hasPendingRender` 상당 상태를 조회할 수 있다 | 단위 테스트 — **Phase 2 통과** (조회 전용, 아래 단서) |
| **RC-4** | 크기 예산 준수 (기본 가드 + concurrent 단계별) | 각 Phase 종료 시 실측 |
| **RC-5** | 라이프사이클 콜백이 커밋 경계 1곳에서만 flush된다 | `core-loopLifecycleOrder` 등 재검토 — **Phase 5 통과** (5개 파일 기대값 유지, 근거는 IMPLEMENT §Phase 5) |
| **RC-6** | 한 렌더 패스 내 store 읽기 값이 일관된다 (tearing 없음) | 단위 테스트 |
| **RC-7** | 단일 작업 단위가 프레임(16ms)을 초과하는 시나리오가 실재한다 | Phase 7 프로파일링 (예비 측정은 IMPLEMENT Phase 7) |
| **RC-8** | 폐기된 렌더가 이펙트 유실·중복을 일으키지 않는다 | 단위 테스트 |
| **RC-9** | **위성 패키지가 양쪽 코어에서 무수정 통과한다** | `pnpm test:dual` (Phase 0에서 인프라 완성) |
| **RC-10** | 단일 컴포넌트의 무거운 렌더(10k행) 중 입력이 차단되지 않는다 | 수동 E-4 — **T2의 존재 이유이자 "concurrent" 명명 근거** (§2.1) |

### RC-4 크기 예산

측정: `dist/lithent.umd.js`(기본) / `lithentConcurrent/dist/lithentConcurrent.umd.js`(concurrent), Node zlib brotli.

| 빌드 | 단계 | br 상한 | 비고 |
|---|---|---|---|
| **기본 `lithent`** | 전 기간 | **≤ 4,800 B** | 현재 4,734 B. **회귀 가드** — 철학 보호선 |
| concurrent | Phase 0 (순수 포크) | ≤ 4,800 B | **실측 4,742 B** — 기본과 8 B 차이 (UMD 전역 이름 문자열) |
| concurrent | T1 | **≤ 5,400 B** | **실측 5,057 B** (Phase 0 대비 +315 B) |
| concurrent | T1.5 | **≤ 6,200 B** | Phase 4 5,104 B → rename 5,102 B → **Phase 5 실측 5,086 B** |
| concurrent | T2 (파이버) | **≤ 9,000 B** | 파이버 raw +4.5~7KB 반영 |

> 선행 작업(performance-improvement)의 예산 5,120 B는 기본 코어에 한해 유효하며,
> 위 "기본 4,800 B" 가드로 더 엄격하게 대체된다 (DC-4).

### RC-2의 단서 (Phase 1에서 확정)

`deferRender`는 **렌더를 미루지 상태를 미루지 않는다.** 상태가 컴포넌트 클로저에
있고 setter가 그 자리에서 바꾸기 때문이며(P2·N6), 레인별 상태 사본을 두는 것은 N6 위반이다.

→ RC-2는 **"전환 중 같은 컴포넌트의 sync 렌더가 끼어들지 않는 한"** 성립한다.
끼어들면 전환 값이 그 시점에 화면에 나타난다. 자세한 것은 [DESIGN.md](./DESIGN.md) §4 D2.

### T1의 이득 구간 (Phase 3 예비 측정)

`docs/concurrent-rendering/bench/coalescing.mjs` 실측: **단일 렌더가 입력 간격을
넘어야 이득이 생기고, 그 아래에서는 정확히 0이다** (렌더 60ms/입력 100ms → sync·deferred
모두 10렌더, 총시간 동일. 렌더 400ms → 10렌더 4.1초 vs 4렌더 1.7초).

이는 §1.1의 제품 판단 — "대부분의 사용 환경에서 체감 이득이 없다" — 을
측정으로 확인해 준다. 2026-09-01 통합 여부 재검토에서 이 표가 근거였고,
**별도 빌드 유지로 확정**했다 (DC-16, [IMPLEMENT.md](./IMPLEMENT.md) Phase 7 예비 측정).

### RC-3의 단서 (Phase 2에서 확정)

`hasPendingRender`는 `lithent-concurrent/helper`에 있으며, **조회**이지 반응성 상태가 아니다. `.value`를 읽는 것만으로는 리렌더가
일어나지 않는다. pending 표시는 sync로 렌더되는 곳(부모·형제의 `state`/`lstate`)에 두고
무거운 쪽만 `deferred`/`ldeferred`로 미루는 조합으로 쓴다.

React의 `useTransition`이 `isPending` 변화로 sync 렌더를 일으키는 것과 다르다.
그렇게 하려면 전환 값의 레인별 사본이 필요한데 N6에 걸린다 (RC-2의 단서와 같은 뿌리).

## 9. 계약 변경 (호환성 우려)

| ID | 변경 | 단계 | 영향 |
|---|---|---|---|
| **BC-1** | 라이프사이클 콜백 flush 시점이 커밋 경계 1곳으로 통일 | T1.5 | 흩어진 순서에 의존하던 코드·테스트 |
| **BC-2** | "mounter 정확히 1회" → "**커밋된 mounter만 유효, 시도는 여러 번 가능**" | T2 | mounter 본문의 직접 부수효과 중복 (`mountCallback`은 커밋에서만 돌므로 안전) |
| **BC-3** | 저우선순위 렌더의 flush가 마이크로태스크 → 유휴 프레임 | T1 | 기본 우선순위를 마이크로태스크로 유지하면 기존 코드 무영향 |
| **BC-4** | **`nextTick()`의 DOM 갱신 보장이 sync 레인에 한정** | T1 | `nextTick = () => Promise.resolve()` (`src/hook/ref.ts:2`), 위성에서 12회 사용. 저우선순위 렌더 완료 대기에는 별도 수단 필요 |

BC-1·BC-2는 minor + 체인지로그 명시 (DC-8). BC-4는 transition 완료 프로미스 제공으로 완화 (DC-9).

## 10. 상태 / 핸드오프

- done:
  - 배포 구조 확정(모노레포 2중 빌드), 3단계 범위 확정, 파이버 채택,
    N1 불변 조건 격상, 인터페이스 영향 실측(§7.7), DC-1~DC-9 전부 결정.
  - **Phase 0 완료 (2026-08-31)** — `lithentConcurrent/` 스캐폴딩, alias 함정 검증,
    RC-9 이중 실행 인프라, RC-4 게이트 스크립트. 구현 중 드러난 3건을
    DC-10~DC-12로 확정 ([DESIGN.md](./DESIGN.md) §6.5).
  - 실측 갱신: 위성 import 41건 / 공개 export 값 21 + 타입 16 (본문 §3.1 반영).
  - **Phase 1 완료 (2026-08-31)** — 2레인 스케줄러 + ambient `deferRender`.
    RC-1·RC-2 통과, C2 회귀 없음, concurrent br 4,989 / 5,400.
  - **Phase 2 완료 (2026-08-31)** — `deferred`/`ldeferred`/`hasPendingRender`/`whenIdle`.
    RC-3·BC-4 통과, concurrent br 5,057 / 5,400. concurrent 공개 export는 값 **24개**
    (`deferRender`·`hasPending`·`whenIdle` 추가), helper는 **가산적**으로 4개 추가.
  - **Phase 3 자동 항목 완료 (2026-08-31)** — 3-1~3-3 + 산출물 검증(3-3b).
    소스가 아니라 **출하 번들·선언 파일**을 보는 검증을 추가했다 (`pnpm verify:concurrent`).
    섹션 B 수행용 데모 페이지 신설 (`pnpm dev:concurrent`).
  - **Phase 4 완료 (2026-08-31)** — §7.1의 순수성 문제 해소. 커밋 이펙트 리스트 도입,
    이펙트 표현·순서를 DC-14로 확정. concurrent br 5,104 / 6,200.
    **포크가 처음으로 base와 갈라졌다** (`diff.ts` 96줄, `wDom.ts` 30줄) —
    동치성은 이제 테스트로만 지킨다.
  - **API 이름 확정 (2026-09-01)** — DC-15(`deferRender`·`hasPendingRender`),
    DC-16(T1 통합 안 함), §2.1(언제 concurrent라 부를 수 있는가) 신설.
  - **Phase 5 완료 (2026-09-01)** — §7.2의 흩어진 커밋 경계 해소. `render.ts`의 내부
    flush 4곳을 `wDom.ts`의 `commit()` 1곳으로 통합(BC-1). `render.ts`도 갈라졌다.
    RC-5 통과. concurrent br 5,086 / 6,200 (−16 B), 기본 4,734 무변동.
- Phase 0 판정:

  | 수용 기준 | 결과 |
  |---|---|
  | 동작 변경 0 | 포크 5개 파일 **바이트 동일**, core 스위트 양쪽 통과 |
  | RC-4 | 기본 **4,734** / concurrent **4,742**, 둘 다 ≤ 4,800 |
  | RC-9 인프라 | `pnpm test:dual` 통과 — helper 37 / devHelper 2 / ftags 10 / ssr 8, 양쪽 동일 |
  | N2 (`src/` 동결) | `git status src/` 비어 있음 |

- next: Phase 5 (커밋 경계 단일화, BC-1). 3-4 수동 확인과 3-5 릴리스 판정은 미완이며 사람 몫.
- blockers: 없음.
- 미결(경미):
  - `lithent-concurrent`는 현재 `private: true`. 배포 시 `dist/types/` 경로와
    npm 공개 여부를 정해야 한다 (Phase 11-11 범위).
- 기준 커밋: `f3921cc` (설계 기준) / Phase 0: `95ae243` / Phase 1: `16d9e74` /
  Phase 2: `3ebf375` / Phase 3: `299d4cd` / **Phase 4: `d094a4e`**
