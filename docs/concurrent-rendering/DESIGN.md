# DESIGN — Lithent Concurrent 렌더링 (별도 빌드 + 파이버)

- 작성일: 2026-08-28 (최종 수정: 2026-08-28)
- 상태: **DC-1~DC-9 전부 확정. Phase 0 착수 가능**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [IMPLEMENT.md](./IMPLEMENT.md)

## 1. 설계 원칙

- **P1. 기본 코어 동결.** `src/`를 수정하지 않는다 (REQUIREMENTS N2).
  공유 모듈 변경이 불가피하면 양쪽 테스트 통과 + 기본 크기 가드 준수가 조건.
- **P2. 클로저 모델 불가침.** `mount(setup → updater)`와 `state`/`lstate`의 클로저 보관을
  바꾸지 않는다. **파이버를 도입해도 유지된다** (REQUIREMENTS §7.7).
- **P3. 인터페이스 호환.** 위성 39개 import와 공개 export 11개가 무수정 동작.
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

### D2. 우선순위 표현 — **DC-1 확정: (A) ambient**

`laneRef: { value: Lane }`를 모듈 전역으로 두고 `startTransition`이 세운다.
`Renew = () => boolean` 시그니처 변경 0 → helper 파급 없음 (REQUIREMENTS C3).
기존 `needDiffRef`/`compKeyRef` 관행과 일치.

### D3. 값 단위 deferred API (`helper/`)

반응성이 이미 값 단위이므로 helper 레벨에서 `renew` 호출만 감싼다. 코어 변경 불필요.

```ts
export const ldeferred = <T>(value: T): State<T> => {
  let result = value;
  const renew = useRenew();
  return {
    get value() { return result; },
    set value(v) { result = v; startTransition(renew); }
  };
};
```

`isPending` (RC-3): 스케줄러가 `hasPending(compKey, 'low')` 노출 → helper가 감싼다.

### D11. transition 완료 프로미스 — **DC-9** (BC-4 완화)

`nextTick = () => Promise.resolve()` (`src/hook/ref.ts:2`)는 마이크로태스크라
**sync 레인에서만** "await 후 DOM 갱신됨"이 성립한다. 위성에서 12회 사용된다.

→ 스케줄러가 `whenIdle(): Promise<void>` (low 레인 큐가 빌 때 resolve)를 제공하고,
helper가 `nextTickRender` 계열과 함께 노출한다. `nextTick` 자체의 의미는 **변경하지 않는다**
(기존 코드 호환). 문서에 레인 의존성을 명시한다.

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
- 커밋 순서: `unmount` → `detach` → `delete` → `wDomUpdate(tree)` → `splice`/`syncAncestor` → `retire`.
  기존 동작과 동치여야 하며 Phase 4에서 테스트로 고정한다.
- **`retire`를 커밋으로 미루는 것이 폐기 능력의 핵심.** 원본 `children`이 커밋 전까지
  살아있어야 WIP를 버리고 원본으로 되돌아갈 수 있다.

### D5. 커밋 경계 단일화 (BC-1)

`execMountedQueue()` 5곳(`render.ts:43, 185, 200, 284, 429`)을 커밋 종료 1곳으로 통합.

**BC-1** — 관측 가능한 순서 변화. `core-loopLifecycleOrder.tsx`, `core-mountreadycallback.tsx`,
`core-callback.tsx`, `core-nestedUnmount.tsx`, `core-destroy.tsx`는 통과 여부가 아니라
**기대값 자체를 재검토**한다.

### D6. store tearing — **DC-5 확정: (A) 버전 체크 후 재시작**

렌더 시작 시 `version` 기록, 커밋 직전 재비교, 다르면 폐기·재실행.
`useSyncExternalStore`와 동일 발상. 재시도 상한 초과 시 sync 폴백.
`helper/src/hook/store.ts`·`lstore.ts`의 `updater` Proxy set에서 버전 증가.

> Lithent는 `replaceWDom`이 컴포넌트 단위 bottom-up이라 tearing 노출 구간이
> **한 컴포넌트의 서브트리 안**으로 제한된다 (React는 루트 단위). 그럼에도 T1에서
> 저우선순위 지연으로 창이 넓어지므로 T1.5에서 처리한다.

## 6. 상세 설계 — T2 (파이버)

### D7. 파이버 자료구조 + work loop — **DC-6 확정: 진짜 파이버**

제너레이터안 폐기. 근거: 유일한 장점이 크기(+1~1.5KB vs +4.5~7KB)였는데 별도 빌드에서
예산이 풀렸고, `yield*` 위임 오버헤드는 정확히 대규모 시나리오에서 아프다.

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

## 7. 결정 체크리스트

- [x] **DC-1**: 우선순위 API 표현 → **(A) ambient `startTransition`**.
  근거: `Renew` 시그니처 변경 0, helper 파급 없음, 기존 전역 플래그 관행과 일치.
- [x] **DC-2**: 레인 개수 → **2단계 (sync / low)**.
  근거: 3단계의 실이득 미검증. 후속 추가는 하위 호환.
- [x] **DC-3**: 저우선순위 스케줄링 → **MessageChannel**.
  근거: 브라우저 호환성, `requestIdleCallback` 타이밍 부정확, `scheduler.postTask` 지원 부족.
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

## 8. 설계 ↔ 검증 연결

| 설계 | 검증 |
|---|---|
| §2.2 alias / Fragment 동일성 | Phase 0-5·0-6, 수동 A-5 |
| D1 우선순위 큐 | RC-1 (Phase 1), 수동 B-1 |
| D2 우선순위 표현 | C3 회귀 (기존 helper 테스트 무수정 통과) |
| D3 deferred API | RC-2·RC-3 (Phase 2), 수동 B-2 |
| D11 `whenIdle` | BC-4, 수동 B-9 |
| D4 커밋 이펙트 리스트 | Phase 4 동치성 테스트, RC-5 |
| D5 커밋 경계 단일화 | RC-5, 수동 C-1~C-6 |
| D6 store 버전 | RC-6 (Phase 6), 수동 F |
| D7 파이버 work loop | RC-7·RC-10 (Phase 8), 수동 E-1·E-4 |
| D8 훅 스냅샷 | RC-8 (Phase 9), 수동 E-3 |
| D9 마운트 정책 | RC-8, 수동 E-2 |
| D10 `getParent` shim | **RC-9** (양쪽 코어 위성 통과), 수동 A-6 |

## 9. 상태 / 핸드오프

- done: 배포 구조 설계(alias + Fragment 함정), D1~D11, DC-1~DC-9 전부 확정, 설계↔검증 매핑.
- next: [IMPLEMENT.md](./IMPLEMENT.md) Phase 0 착수.
- blockers: 없음.
- 기준 커밋: `f3921cc`
