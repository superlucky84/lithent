# IMPLEMENT — Lithent Concurrent 렌더링 (별도 빌드 + 파이버)

- 작성일: 2026-08-28 (최종 수정: 2026-08-28)
- 상태: **Phase 4 완료 (2026-08-31) — T1.5 진행 중. Phase 5 착수 가능**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [DESIGN.md](./DESIGN.md), [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

공통 종료 조건 (모든 Phase):
`pnpm build && pnpm test` 전량 통과 + **위성 스위트 양쪽 코어 2회 실행(RC-9)** +
양쪽 빌드 brotli 실측 기록 + `docs/performance-improvement/bench/` 재측정 기록.

크기 실측:
```bash
node -e "const z=require('zlib'),f=require('fs');for(const p of ['dist/lithent.umd.js','lithentConcurrent/dist/lithentConcurrent.umd.js']){try{const b=f.readFileSync(p);console.log(p,'raw',b.length,'gzip',z.gzipSync(b,{level:9}).length,'br',z.brotliCompressSync(b).length)}catch(e){console.log(p,'(없음)')}}"
```

기준선 (`f3921cc`, Node zlib): `dist/lithent.umd.js` raw 12,532 / gzip 5,133 / **br 4,734**

예산 (RC-4): 기본 **≤ 4,800 B 전 기간 고정** / concurrent T1 ≤ 5,400 · T1.5 ≤ 6,200 · T2 ≤ 9,000

> **P1 원칙**: `src/`는 이 작업에서 수정하지 않는다. 모든 코드 변경은
> `lithentConcurrent/` 또는 `helper/`(가산적)에서 일어난다.

---

## Phase 0 — 패키지 스캐폴딩 + alias 검증 ✅ 완료 (2026-08-31)

진입: 없음. / 종료: 순수 포크 상태에서 기존 테스트 전량 통과 + 크기가 기본과 동등.

이 Phase는 **동작 변경이 0**이다. 분기 뼈대만 세우고 alias가 옳게 걸렸는지 증명한다.

- [x] 0-1. `lithentConcurrent/` 워크스페이스 생성 (`pnpm-workspace.yaml` 등록)
      — name `lithent-concurrent`, exports/types 구조는 루트 `package.json` 패턴 복제
- [x] 0-2. `src/{diff,render,wDom}.ts`를 `lithentConcurrent/src/`로 **무변경 복사**,
      `src/utils/redraw.ts` → `lithentConcurrent/src/scheduler.ts`로 무변경 복사
      → 5개 파일 전부 `diff -q`로 **바이트 동일** 확인. 순수 포크임이 기계적으로 증명된다.
- [x] 0-3. `lithentConcurrent/src/index.ts` — 기본 코어와 **동일한 export**
      (문서상 11개로 적혀 있었으나 실측 **값 export 21개 + 타입 export 16개** — REQUIREMENTS §3.1 갱신)
- [x] 0-4. `alias.js` 작성 (DESIGN §2.2, D12) — 분기 항목 5개 먼저, `@/` catch-all 마지막
- [x] 0-5. **함정 검증 ①**: Fragment 동일성 — `concurrent-aliasFragment.tsx`
- [x] 0-6. **함정 검증 ②**: `useRenew` → scheduler 연결 — `concurrent-aliasScheduler.tsx`
- [x] 0-7. `build:concurrent` / `watch:concurrent` / `test:concurrent` / `size` 스크립트 추가,
      `build:sequence`에 core 직후로 편입 (+ `build:parallel`에서 중복 제외)
- [x] 0-8. 위성 테스트를 concurrent 코어로 실행하는 스위치 추가 —
      `LITHENT_CORE=concurrent` (D13). `test:satellites` / `test:satellites:concurrent` / `test:dual`
- [x] 0-9. 기준 테스트: 기본 45파일 195테스트 / concurrent 39파일 94테스트 전량 통과
- [x] 0-10. 위성 스위트 양쪽 통과 — helper 37 / devHelper 2 / ftags 10 / ssr 8, 양쪽 동일
- [x] 0-11. 크기 실측 — 기본 br **4,734** / concurrent br **4,742** (차이 8 B). 둘 다 ≤ 4,800

### Phase 0 실측 결과

| 항목 | 기본 `lithent` | `lithent-concurrent` |
|---|---|---|
| raw | 12,532 | 12,552 |
| gzip | 5,121 | 5,128 |
| **brotli** | **4,734** / 4,800 | **4,742** / 4,800 |

8 B 차이는 UMD 전역 이름 문자열(`lithent` → `lithentConcurrent`) 뿐이다.
alias 오류가 있었다면 공유 모듈 중복 번들링으로 훨씬 큰 차이가 났을 것이므로,
이 수치 자체가 alias 정합성의 보조 증거다 (0-11의 판정 근거).

### Phase 0에서 확정된 추가 결정

Phase 0 착수 중 DESIGN에 없던 문제 3건이 드러났고 DC-10~DC-12로 확정했다
([DESIGN.md](./DESIGN.md) §D12~D14, §7).

### Phase 0에서 추가된 회귀 가드 (영구 보존)

`lithentConcurrent/src/tests/`:

| 파일 | 지키는 것 |
|---|---|
| `concurrent-aliasFragment.tsx` | Fragment 동일성 (0-5). 포크가 base와 **다른 인스턴스**임을 단언 |
| `concurrent-aliasScheduler.tsx` | `useRenew` → fork scheduler 연결 (0-6). base redraw와 **다름**을 단언 |
| `concurrent-aliasTable.test.ts` | catch-all 최후 순서 + `@/diff`·`@/render`·`@/wDom`·`@/scheduler` 4개 전부 포크 해석 |
| `concurrent-exportSurface.test.ts` | **C3 계약** — 빌드된 기본 번들과 export 이름 집합 일치 |

> **가드가 실제로 작동하는지 확인했다.** `forkModules`에서 `@/wDom`·`@/utils/redraw`를
> 제거하고 돌려서 3개 단언이 실패하는 것을 확인한 뒤 복구했다.
> "포크와 base가 다른 인스턴스인가"를 묻는 단언만 실패하고, 동일성 단언은 통과한다 —
> alias가 **통째로** 빠지면 전부 일관되게 base로 가므로 버그가 아니기 때문이다.
> 실제 함정은 **일부만** 빠질 때 생기고, 그것을 잡는 것이 distinctness 단언이다.

---

# 단계 T1 — 스케줄러 (concurrent br ≤ 5,400)

## Phase 1 — 우선순위 큐 (D1, D2) ✅ 완료 (2026-08-31)

진입: Phase 0 종료. / 종료: RC-1 통과 + 기존 테스트 무수정 통과.

- [x] 1-1. `lithentConcurrent/src/scheduler.ts`에 `laneRef: { value: Lane }` 도입
- [x] 1-2. 레인별 큐로 재작성 — **compKey dedup 유지** (REQUIREMENTS 7.6)
- [x] 1-3. sync 레인 `queueMicrotask` 유지 (BC-3 무영향 보장), low 레인 MessageChannel (DC-3)
      — `flushSync`는 base `execRedrawQueue`의 `forEach` → `clear` → 플래그 해제 **순서까지 그대로**
      유지했다. 이 순서가 "렌더 중 발생한 갱신이 같은 flush에 합류한다"는 기존 동작을 만든다.
- [x] 1-4. `shouldYield()` — low flush가 예산(5 ms) 초과 시 다음 태스크로 이월
- [x] 1-5. 같은 compKey가 두 레인에 있을 때 sync 우선 + low에서 제거
- [x] 1-6. `startTransition` export (DC-1 ambient) + `CONCURRENT_ONLY`에 동시 등록
- [x] 1-7. 기준 테스트: 양쪽 코어 전량 무수정 통과 (기본 우선순위 타이밍 불변)
- [x] 1-8. 신규 테스트 `concurrent-schedulerLane.test.tsx` — RC-1 + RC-2
- [x] 1-9. 신규 테스트 — low 항목이 sync 갱신으로 무효화되는 경로 (양방향)
- [x] 1-10. 크기 실측 — concurrent br **4,989** / 5,400 (Phase 0 대비 **+247 B**)

### Phase 1 실측 결과

| 항목 | 기본 `lithent` | `lithent-concurrent` |
|---|---|---|
| **brotli** | **4,734** / 4,800 (무변동) | **4,989** / 5,400 (411 B 여유) |
| core 스위트 | 45파일 195테스트 | 40파일 102테스트 |
| bench10k (3회, ms) | create10k 299~304 | create10k 298~301 |
| verify-order | ALL PASS | ALL PASS |

bench는 두 코어가 서로 노이즈 범위 안에 있다 → **C2(T1 회귀 0) 충족**.
sync 경로에 추가된 것은 `comp.up`의 분기 하나뿐이다.

### Phase 1에서 드러난 것 (DESIGN §4에 반영)

1. **전환은 렌더를 미루지 상태를 미루지 않는다** (D2 보강).
   클로저 모델(P2)의 직접적 귀결이며, RC-2의 정확한 서술을 좁힌다.
2. **sync 우선 규칙은 정확성이 아니라 낭비 제거다** (D1 보강).
   `replaceWDom`의 `il` 가드가 낡은 `exec`를 이미 무력화하므로, 규칙을 지워도
   렌더 횟수는 변하지 않는다. → 관측 수단이 없어 **2-3의 스케줄러 몫(`hasPending`)을
   Phase 1로 당겨왔다.**
3. **MessageChannel은 지연 생성 + `setTimeout` 폴백** (DC-3 보강).

### Phase 1 테스트의 유효성 검증

작성한 테스트가 **실제로 기능을 붙잡고 있는지** 돌연변이로 확인했다.
1차 작성본은 두 돌연변이를 모두 통과해 버려서 다시 썼다.

| 돌연변이 | 1차 작성본 | 현재 |
|---|---|---|
| `flushLow`의 yield 제거 | ✗ 통과(무의미) | ✓ 실패 |
| sync 우선 dedup 제거 | ✗ 통과(무의미) | ✓ 실패 (2건) |

- yield 테스트가 무의미했던 이유: 급한 갱신을 low flush **이전에** 큐잉하면
  마이크로태스크가 어차피 먼저 돈다. 지금은 **low flush 도중(첫 커밋 안에서)**
  급한 갱신을 일으켜서, yield가 있어야만 `a, urgent, b, c` 순서가 나오게 했다.
- dedup 테스트가 무의미했던 이유: 위 §2의 `il` 가드. 지금은 `hasPending`으로
  **큐 상태를 직접** 단언한다.

## Phase 2 — 값 단위 deferred API + `whenIdle` (D3, D11) ✅ 완료 (2026-08-31)

진입: Phase 1 종료. / 종료: RC-2·RC-3 통과, BC-4 완화 확인.

> **소재 변경**: 2-1·2-2·2-3b·2-5는 원래 `helper/`에 넣는 계획이었으나,
> **`lithent-concurrent/helper`** 로 확정했다 (DC-13). `helper/`는 무변경이다.

- [x] 2-1. `ldeferred` — `lithentConcurrent/helper/src/hook/ldeferred.ts`
- [x] 2-2. `deferred(value, renew)` — mount 모드용
- [x] 2-3a. 스케줄러 `hasPending(compKey, lane)` 노출 — **Phase 1에서 선행 완료**
- [x] 2-3b. `isPending()` — `Computed<boolean>` 모양, 마운터에서 compKey 캡처
- [x] 2-4. 스케줄러 `whenIdle(): Promise<void>` 노출 (DC-9) — `nextTick` 의미 변경 없음
- [x] 2-5. export — `lithent-concurrent/helper` 서브패스 신설 (DC-13).
      `helper/src/index.ts`는 **건드리지 않았다**
- [x] 2-6. 기준 테스트: helper 스위트 양쪽 코어 통과 (37개, 기존 그대로)
- [x] 2-7. 신규 테스트 — RC-2
- [x] 2-8. 신규 테스트 — RC-3 (`isPending` 전이 + 컴포넌트별 격리 + 비반응성)
- [x] 2-9. 신규 테스트 — BC-4 (`nextTick` 미반영 / `whenIdle` 반영)
- [x] 2-10. 크기 실측 — concurrent 코어 br **5,057** / 5,400 (`whenIdle` 몫 +68 B)

### Phase 2 실측 결과

| 항목 | 기본 `lithent` | `lithent-concurrent` |
|---|---|---|
| **코어 brotli** | **4,734** / 4,800 (무변동) | **5,057** / 5,400 (343 B 여유) |
| helper 번들 | br 1,973 (무변경) | `/helper` br **379** (신규, 별도 번들) |
| helper 스위트 | 37개 (무변경) | `/helper` 7개 (신규) |

### DC-13 — concurrent 전용 helper는 어디에 사는가

`deferred`·`ldeferred`·`isPending`은 low 레인이 있어야 의미가 있다.
`lithent-concurrent/helper`에 두고, `lithent` ↔ `lithent/helper` 구조를 복제했다.

```
lithent            ↔  lithent/helper              ← 무변경
lithent-concurrent ↔  lithent-concurrent/helper   ← 신규
```

**두 대안을 실제로 만들어 보고 물렸다** ([DESIGN.md](./DESIGN.md) §D12b):

| 대안 | 물린 이유 |
|---|---|
| `lithent/helper`에 넣고 네임스페이스 import로 옵셔널 접근 | 동작은 하지만 기본 코어 사용자에게 **조용히 no-op인 API**가 생긴다. 크기가 아니라 약속의 문제 |
| concurrent **코어**에 직접 export | 기본 코어가 `state`/`lstate`를 export하지 않는데 concurrent만 `ldeferred`를 내면 드롭인 대칭이 깨진다 |

부수 효과로 테스트가 훨씬 단순해졌다. 한 파일에서 두 코어를 분기 단언할 필요가 없어져
`if (concurrent)` 분기가 전부 사라졌다.

레인 관련 export(`startTransition`·`hasPending`·`whenIdle`)는 스케줄러 기능이므로
**코어에 남는다.** concurrent helper는 이를 **external**로 가져간다 — 번들에 스케줄러
사본이 들어가면 레인 큐가 둘로 갈라진다.

### 테스트 유효성 검증 (돌연변이)

| 돌연변이 | 결과 |
|---|---|
| `ldeferred`가 `startTransition` 대신 `renew()` | ✓ 4개 실패 |
| `isPending`이 항상 false | ✓ 2개 실패 |
| 코어 `whenIdle`이 항상 즉시 resolve | ✓ 5개 실패 |

### 파일 명명 규약 함정

처음에 helper 테스트를 `deferred.test.tsx`로 만들었더니 **루트 러너가 수집**해서 깨졌다
(루트 config에서 `@`는 코어 `src/`를 가리킨다). 위성 테스트는 `*.tsx` +
`import.meta.vitest` in-source 방식이어야 루트의 `includeSource`(`src/tests/*`)에
걸리지 않는다. → **위성 테스트 파일에 `.test.`를 붙이지 말 것.**

## Phase 3 — T1 출하 게이트 (자동 항목 완료, 사람 몫 대기)

진입: Phase 2 종료. / 종료: T1 릴리스 판정.

- [x] 3-1. RC-4: concurrent **5,057** ≤ 5,400 B, 기본 **4,734** ≤ 4,800 B (무회귀)
- [x] 3-2. C2: bench 회귀 0 — 두 코어가 서로 노이즈 범위 안 (3회 측정)
- [x] 3-3. RC-9: 위성 양쪽 코어 통과 (`pnpm test:dual`)
- [x] 3-3b. **빌드 산출물 검증** (`pnpm verify:concurrent`) — 아래
- [x] 3-4. 수동 체크리스트 A·B·D 수행 — **실브라우저 필요. 사람 몫**
- [ ] 3-5. **T1 단독 릴리스 판정** — 사람 몫

### 3-3b. 산출물 검증 — 왜 따로 필요한가

지금까지의 모든 테스트는 **소스**를 돈다. 코어 스위트는 `@/…` alias 표를 통해,
위성 이중 실행은 vite alias를 통해 소스에 닿는다. **소비자가 실제로 설치하는 것**
— `package.json` `exports`가 가리키는 번들과 emit된 `.d.ts` — 은 아무도 안 본다.

export map 오타, 단독 로드 실패, `@/`가 남은 선언 파일은 **전부 CI를 통과하고
설치 시점에 깨진다.** `lithentConcurrent/scripts/verifyArtifacts.js`가 그 구간을 막는다.

| 검사 | 항목 |
|---|---|
| export map 대상 6개가 전부 존재 | A-10 |
| concurrent 번들이 base와 다른 산출물 (`startTransition` 유무로 교차 확인) | A-10 |
| 출하 번들에서 Fragment 판정 정상 (실제 렌더로 확인) | A-5 |
| `lithent-concurrent/helper`가 단독 로드되고 3개를 export | A-11 |
| emit된 `.d.ts` 21개에 `@/` 잔여 0건 | A-9 |
| 소비자 파일이 출하 선언만으로 `tsc --strict` 통과 | A-9 |
| **데모 페이지가 출하 패키지 기준으로 타입 통과** | B-* |

> 이 스크립트도 **작동 검증**을 했다. helper 번들을 숨기면 2건, `.d.ts`에 `@/`를
> 되살리면 1건이 실패한다.
>
> 처음 작성본에는 버그가 있었다 — async 검사의 실패가 결과에 반영되지 않아
> **번들이 없는데도 A-11이 통과**했다. 검사 목록을 먼저 모으고 순차로 `await`하도록
> 고쳤다. (검증 도구야말로 검증이 필요하다는 예다.)

### 3-4를 위한 준비 — 데모 페이지

**섹션 B는 지금까지 수행 자체가 불가능했다.** 레포 어디에서도 `startTransition`을
쓰지 않으므로 B-1~B-5·B-9를 확인할 대상이 없었다.

```bash
pnpm dev:concurrent      # helper 빌드 후 dev 서버 → /html/transition.html
```

`lithentConcurrent/demo/transition.tsx` — 3개 섹션, 각각 대응 항목과 기대 동작을
화면에 적어 두었다 (문서를 띄워 놓지 않아도 확인할 수 있게).

| 섹션 | 덮는 항목 |
|---|---|
| **sync vs deferred 나란히 비교** (같은 목록, 커밋 방식만 다름) | B-1 · B-2 · B-3 · B-5 |
| urgent vs deferred 커밋 순서 로그 | B-4 |
| `nextTick` / `whenIdle` 비교 | B-9 |

#### 첫 버전이 실패한 이유 (사용자 피드백으로 발견)

초판은 **구별이 안 됐다.** 두 가지가 잘못돼 있었다.

1. **작업이 진짜가 아니었다.** 500개짜리 배열을 만들어 `slice(0, 60)`으로 60개만
   그렸다. 배열 생성은 공짜라 저우선순위 렌더가 한 프레임 안에 끝나고, sync와
   구분이 안 된다.
2. **대조군이 없었다.** 지연은 비교 대상이 있어야 보인다.

수정: 행 수를 **컨트롤로** 뽑아(1k/3k/6k/12k) 각자 기계에서 차이가 보일 때까지
올릴 수 있게 하고, **sync 패널과 deferred 패널을 나란히** 두고 각각 자기 렌더
횟수를 센다. 느낌이 아니라 숫자로 구분된다 — 타이핑 8회에 sync는 8번, deferred는
그보다 적게 렌더한다.

> **T1이 주는 것을 정확히 보여줘야 한다.** T1의 이득은 렌더가 중단 가능해지는 것이
> 아니라(그건 T2다) **중간 입력이 아예 렌더되지 않는 것**이다. 같은 compKey의 큐
> 항목이 새 것으로 교체되기 때문이다. 렌더 횟수가 그 이득의 직접적 척도다.

표시기를 **부모**에 둔 것도 우연이 아니다. `isPending`은 조회라서 스스로 렌더를
일으키지 않으므로, deferred 컴포넌트 안에 두면 영영 안 보인다 (RC-3의 단서).
데모가 그 사용법을 보여주는 역할도 한다.

이 성질은 데모에만 맡기지 않고 **테스트로 고정했다** —
`lithentConcurrent/helper/src/tests/deferred.tsx`의 "coalescing" 케이스가
"연속 8회 갱신 → sync 8렌더 / deferred 그 미만"을 단언한다.
타자 속도나 기계 성능에 의존하지 않는 형태로 같은 것을 검증한다.

dev 서버의 모듈 그래프가 빌드와 같은지 확인했다:
공유 `predicator.ts`가 **포크 `wDom`** 을 참조하고(Fragment 함정), 공유 유틸은
`../src`로 간다.

### 남은 것

| 항목 | 왜 사람이 해야 하는가 |
|---|---|
| B-1 입력 응답성 | 끊김은 사람이 느끼는 것이다. 자동화하려면 프레임 타이밍 계측이 필요 |
| B-2 · B-5 화면 유지 | 단위 테스트로는 DOM 문자열까지만 확인했다. 깜빡임은 눈으로 |
| B-6~B-8 기존 앱 | `pnpm dev` / `dev:examples` / `dev:docs` 실행 후 콘솔 확인 |
| D SSR/hydration/HMR | 서버 + 브라우저 왕복 |
| A-6 `getParent` shim | **T2 항목이므로 지금은 N/A** |
| 3-5 릴리스 판정 | 제품 결정 |

---

# 단계 T1.5 — 순수화 + tearing (concurrent br ≤ 6,200)

## Phase 4 — 커밋 이펙트 리스트 (D4) ✅ 완료 (2026-08-31)

진입: Phase 3 종료. / 종료: diff 단계에서 DOM·원본 트리 변형 0.

- [x] 4-1. 이펙트 타입 정의 — `Effects = (() => void)[]` (DC-14, 아래)
- [x] 4-2. `makeNewWDomTree`에 effects 수집기 **인자** 추가 (전역 금지 — 중첩 렌더 오염)
- [x] 4-3. `diff.ts:81-82` unmount·detach → effect
- [x] 4-4. `diff.ts:237` `typeDeleteUnused` → `delete` effect
- [x] 4-5. `diff.ts:57-58` `il`/`delete children` → `retire` effect (**폐기 능력의 핵심**)
- [x] 4-6. `wDom.ts:155,158` splice·syncAncestor → effect
- [x] 4-7. `replaceWDom`에 `commit()` 도입 — `commitEffects(effects)` → `wDomUpdate(tree)`
- [x] 4-8. 기준 테스트 — 공유 core 스위트 79개 **무수정 통과**
- [x] 4-9. 신규 테스트 — 동치성 (`concurrent-commitEquivalence.test.ts`)
- [x] 4-10. 신규 테스트 — WIP 폐기 (`concurrent-abandon.test.tsx`)
- [x] 4-11. 크기 실측 — concurrent br **5,104** / 6,200 (Phase 3 대비 **+47 B**)

### Phase 4 실측 결과

| 항목 | 기본 `lithent` | `lithent-concurrent` |
|---|---|---|
| **brotli** | **4,734** / 4,800 (무변동) | **5,104** / 6,200 (1,096 B 여유) |
| core 스위트 | 45파일 195테스트 | 43파일 110테스트 |
| bench10k `create10k` | 293 / 298 | 294 / 299 |
| verify-order | ALL PASS | ALL PASS |

### 포크가 처음으로 갈라졌다

Phase 0~3 동안 `diff.ts`·`render.ts`·`wDom.ts`는 base와 **바이트 동일**이었다.
그래서 동치성 증명이 공짜였다. Phase 4부터는 아니다.

| 파일 | base 대비 |
|---|---|
| `diff.ts` | **96줄** — effects 인자 스레딩 + 부수효과 5곳을 push로 |
| `wDom.ts` | **30줄** — splice/syncAncestor를 effect로, `commit()` 도입 |
| `render.ts` | 바이트 동일 (아직) |

**동치성은 이제 테스트로만 지킨다** — 4-9가 그 역할이다.

### DC-14 — 이펙트 순서: 태그된 유니온이 아니라 수집 순서

설계(D4)는 태그된 유니온과 그룹별 실행 순서를 스케치했다
(`unmount` → `detach` → `delete` → `wDomUpdate` → `splice`/`syncAncestor` → `retire`).
구현은 **thunk 배열 + 수집 순서 그대로 재생**으로 갔다.

근거: 수집 순서가 **base 코어의 실행 순서 그 자체**다. 그대로 재생하면 동치성이
구성상 보장되고, "어떤 재배치가 안전한가"를 매번 따질 필요가 없다.

> **처음에 잘못된 근거를 적었다가 검증하고 고쳤다.**
> "자식의 retire가 부모의 unmount 순회를 잘라주므로 그룹핑하면 깨진다"고 썼는데,
> **실제로 그룹핑해서 돌려보니 통과한다.** 이유를 확인했다: 넓은 순회가 중복
> 실행할 수 있는 두 효과가 모두 멱등이다 — `runUnmountEffects`는 실행 후
> `umts`를 비우고(`universalRef.ts:57`), `removeEventListener`는 이미 뗀 핸들러에
> 대해 아무 일도 하지 않는다.
>
> 그래서 그룹핑이 **틀린 것은 아니다.** 다만 효과가 하나 추가될 때마다 그 논증을
> 다시 해야 하고, 수집 순서는 그럴 필요가 없다. 그것이 채택 이유다.

### 테스트 유효성 검증 (돌연변이)

| 돌연변이 | 결과 |
|---|---|
| 효과 순서 전체 역순 | ✓ 동치성 4건 실패 |
| unmount/detach 효과 누락 | ✓ 동치성 4건 + 기존 `core-mountreadycallback` 2건 실패 |
| retire를 다시 diff 중 즉시 실행 (Phase 4 이전 동작) | ✓ 폐기 테스트 2건 실패 |
| retire만 마지막으로 그룹핑 (D4 원안) | **통과** — 위 DC-14 참조 |

### 부수적으로 고친 것 — 가드 테스트의 타입 오염

`concurrent-aliasFragment` / `aliasScheduler` / `aliasTable`이 base 모듈을
**정적 import**해서 distinctness를 단언하고 있었다. 포크가 갈라지자 base `wDom.ts`가
포크의 새 `makeNewWDomTree` 시그니처로 타입 검사를 받아 빌드가 깨졌다.

가드가 원하는 것은 **런타임 모듈 동일성**이지 타입 결합이 아니므로,
`src/tests/baseCore.ts`의 계산된 specifier 동적 import로 바꿨다.
Phase 5 이후 포크가 더 갈라져도 같은 문제가 재발하지 않는다.

## Phase 5 — 커밋 경계 단일화 (D5, BC-1)

진입: Phase 4 종료. / 종료: RC-5 통과.

- [ ] 5-1. `render.ts`의 내부 `execMountedQueue()` 4곳 제거 (typeAdd 2곳, typeReplace, updateChildren)
- [ ] 5-2. 커밋 종료 1곳으로 통합 — **`commit()`에 넣을 것. `wDomUpdate` 아님** (아래)
- [ ] 5-3. **기대값 재검토**: `core-loopLifecycleOrder`, `core-mountreadycallback`,
      `core-callback`, `core-nestedUnmount`, `core-destroy`
- [ ] 5-4. 변경된 순서 문서화 — BC-1 체인지로그 초안
- [ ] 5-5. 기준 테스트 전량 통과
- [ ] 5-6. 4-9 동치성 테스트 재검토 — 라이프사이클 순서 차이는 **의도된 것**이므로,
      어떤 차이가 의도된 것인지 그 파일에 명시할 것
- [ ] 5-7. 크기 실측

### 예비 실험 (Phase 4 중, 2026-08-31)

Phase 5를 실험적으로 적용해서 blast radius를 먼저 쟀다. 실험 코드는 원복했다.

**⚠ 구현 함정 — flush를 `wDomUpdate` 끝에 넣으면 안 된다.**
`wDomUpdate`는 **재귀 함수**다 (`render.ts:343`, `:366`에서 자식마다 자기를 부른다).
거기 넣으면 노드마다 flush되어 **지금보다 더 흩어진다.** 커밋 경계는 재귀 밖,
`wDom.ts`의 `commit()`이어야 한다. 실험에서 실제로 이 순서로 틀렸다가 고쳤다.

**실측된 순서 변화** (새 노드 삽입이 기존 노드 갱신보다 앞 위치에 있을 때):

```
[현재]                              [BC-1 이후]
UPDATE existing (빌드 단계)          UPDATE existing (빌드 단계)
MOUNT  new1     DOM에 요소 2개        UPDATE existing (커밋 단계)
UPDATE existing (커밋 단계)           MOUNT  new1     DOM에 요소 3개
MOUNT  new2     DOM에 요소 3개        MOUNT  new2     DOM에 요소 3개
```

| | BC-1 영향 |
|---|---|
| `mountCallback`끼리의 상대 순서 | **없음** — 큐가 FIFO이고 push 순서(DOM 생성 순서)가 그대로다 |
| `updateCallback`끼리의 상대 순서 | **없음** — `runUpdatedQueueFromWDom`은 `typeUpdate` 안이라 범위 밖 |
| `mountCallback` ↔ `updateCallback` 교차 | **바뀜** (위 실측) |
| `mountCallback`이 보는 DOM 상태 | 부분 완성 → **커밋 완료 상태**. 대체로 개선 |
| keyed 리스트 경로 | 거의 없음 — `updateChildren`은 이미 마지막에 한 번만 flush한다 |
| unmount 계열 | **없음** — cleanup은 `runUnmountEffects` 경로이고 `execMountedQueue`가 아니다 |

**예상보다 영향이 작다.** 실험 적용 상태에서 **core 스위트 110개가 전량 통과**했다.
5-3이 지목한 5개 파일도 기대값이 바뀌지 않았다. 흩어진 flush의 실질 영향 범위가
비루프 삽입·교체 경로에 한정되기 때문으로 보인다.

> 5-3을 삭제하지는 말 것. "통과했다"와 "기대값이 옳다"는 다른 문제이고,
> 위 표의 교차 순서 변화는 실재한다. 다만 착수 전 예상보다 부담이 작다는 것은
> 판단에 반영할 수 있다.

**docs 예제 영향**: `lithentDocs`의 Example14(3단 중첩 unmount 순서)를 양쪽 코어로
돌려 비교했고, Phase 4 상태와 BC-1 실험 적용 상태 **모두 base와 완전히 동일**했다.
서브트리가 한 번에 삽입되는 형태라 flush 지점 수와 무관하다.

## Phase 6 — store tearing (D6)

진입: Phase 5 종료. / 종료: RC-6 통과.

- [ ] 6-1. `helper/src/hook/store.ts`에 `version` + Proxy set에서 증가
- [ ] 6-2. `lstore.ts` 동일 적용
- [ ] 6-3. 렌더 시작 시 version 기록 / 커밋 직전 비교 / 불일치 시 폐기·재실행
- [ ] 6-4. 재시도 상한 + 초과 시 sync 폴백
- [ ] 6-5. 기준 테스트: helper 스위트 양쪽 통과 (**기본 코어에서 무해해야 함** — 가산적 변경)
- [ ] 6-6. 신규 테스트 — RC-6: 렌더 도중 store 쓰기 시 일관된 값 관측
- [ ] 6-7. 신규 테스트 — 재시도 상한 초과 시 sync 폴백
- [ ] 6-8. 크기 실측

## Phase 7 — T2 진입 게이트 (RC-7)

진입: Phase 6 종료. / 종료: T2 착수 여부 판정.

코드 변경 없음. 측정과 판정만 한다.

> **기본 코어 때보다 기준이 완화된다.** concurrent 빌드의 대상은 대규모 사이트이고
> 중단 가능성이 그 존재 이유이므로, "흔한가"가 아니라 "대상 워크로드에서 실재하는가"를 묻는다.

- [ ] 7-1. 실브라우저 프로파일링 — 단일 작업 단위(`replaceWDom` 1회) 소요 시간 분포
- [ ] 7-2. js-framework-benchmark 시나리오별 단위 소요 시간 기록
- [ ] 7-3. **판정**: 대상 워크로드(10k행 리스트, 깊은 트리)에서 16ms 초과 단위가 실재하는가
- [ ] 7-4. 실재하지 않으면 T2 보류하고 근거를 REQUIREMENTS §10에 기록
- [ ] 7-5. 실재하면 Phase 8 진입

### 예비 측정 (Phase 3 중, 2026-08-31)

`docs/concurrent-rendering/bench/coalescing.mjs` — T1의 이득이 **어느 구간부터**
생기는지 잰다. 10회 입력, 100ms 간격, jsdom:

| 렌더 1회 비용 | sync 렌더 | deferred 렌더 | sync 총시간 | deferred 총시간 |
|---:|---:|---:|---:|---:|
| 0ms | 10 | 10 | 1,304ms | 1,303ms |
| 60ms | 10 | 10 | 1,302ms | 1,303ms |
| 150ms | 10 | **7** | 1,604ms | 1,303ms |
| 400ms | 10 | **4** | 4,106ms | 1,705ms |

**단일 렌더가 입력 간격을 넘어야 이득이 생긴다. 그 아래에서는 정확히 0이다.**
렌더가 빠르면 MessageChannel 태스크가 다음 입력 전에 이미 발화하므로 병합할 것이 없다.

이 결과는 두 가지를 말한다.

1. **REQUIREMENTS §1.1의 제품 판단을 측정이 뒷받침한다.** "SSR 페이지에 인터랙티브
   컴포넌트 삽입"에서 렌더는 100ms를 넘지 않고, 그 구간에서 T1의 이득은 0이다.
   이득이 나타나는 지점이 정확히 별도 빌드로 뺀 이유인 대규모 사이트다.
2. **7-3의 질문이 T1에도 그대로 적용된다.** "16ms 초과 단위가 실재하는가"는
   T2뿐 아니라 T1을 쓸 가치가 있는지도 가른다.

> **측정 설계 주의 (두 번 틀렸다가 고쳤다).**
> - 한 프로세스에서 sync/deferred를 같이 돌리면 sync 쪽 blocking이 deferred 쪽
>   타이머를 밀어 결과가 오염된다 → 프로세스를 나눈다.
> - `await setTimeout` 체이닝은 "렌더가 막는 동안 입력이 쌓이는" 거동을 재현하지
>   못한다. 앞 렌더가 끝나야 다음 타이머가 시작되므로 겹침이 영영 안 생긴다
>   → 키 입력을 **절대 시각에 미리 예약**해야 한다.

> **helper 스위트의 coalescing 테스트를 이 수치로 읽지 말 것.** 그 테스트는 버스트가
> 한 태스크 안에서 일어나는 **최선의 경우**이며, 큐 항목이 교체된다는 *메커니즘*을
> 고정할 뿐 전형적 워크로드의 이득을 주장하지 않는다.

---

# 단계 T2 — 파이버 (concurrent br ≤ 9,000)

## Phase 8 — 파이버 자료구조 + work loop (D7, D10)

진입: Phase 7 판정 통과. / 종료: 중단·재개 동작 + RC-9 유지.

- [ ] 8-1. 노드에 `child`/`sibling`/`return`/`ci`(child cursor) 필드 추가 — **가산적**
- [ ] 8-2. `getParent` 호환 접근자 유지: `() => node.return` (**C3 필수**, D10)
- [ ] 8-3. `makeNewWDomTree` 재귀를 `beginWork`/`completeWork`로 분해
- [ ] 8-4. `workLoop` + `performUnitOfWork` 구현, `shouldYield()` 연동
- [ ] 8-5. diff 알고리즘(키 매칭 Map, LIS, `checkSameWDomWithOriginal`) **그대로 이식**
- [ ] 8-6. 중단 시 재개 지점 저장 / 다음 태스크에서 이어가기
- [ ] 8-7. 기준 테스트 전량 통과
- [ ] 8-8. **RC-9 재확인** — `getParent` shim으로 `helper/context`·`lcontext`가 무수정 동작
- [ ] 8-9. 신규 테스트 — 중단 후 재개 결과가 무중단 렌더와 동일
- [ ] 8-10. bench 재측정 — DC-6 판정 기준(대규모 시나리오 총 체감) 적용
- [ ] 8-11. 크기 실측

## Phase 9 — alternate + 폐기/롤백 (D8, D9)

진입: Phase 8 종료. / 종료: RC-8·RC-10 통과.

- [ ] 9-1. `alt` 포인터로 current ↔ WIP 짝 구성
- [ ] 9-2. **current·WIP가 같은 컴포넌트 인스턴스 클로저를 공유하는지 확인**
      (`reRender` 재사용 — REQUIREMENTS §7.7. 복제하면 클로저 상태가 갈라진다)
- [ ] 9-3. 렌더 시작 시 `comp.upD`/`comp.upCB` 스냅샷, 폐기 시 롤백 (~10줄)
- [ ] 9-4. `generalize()`의 `resolve()` 호출 여부로 "마운트 포함 단위" 마킹
- [ ] 9-5. 마킹된 단위는 폐기 대신 완주 (DC-7 병행안)
- [ ] 9-6. BC-2 문서화
- [ ] 9-7. 기준 테스트 전량 통과
- [ ] 9-8. 신규 테스트 — RC-8: 폐기 후 재시작 시 `updateCallback` 유실 없음
- [ ] 9-9. 신규 테스트 — RC-8: 폐기 후 재시작 시 중복 실행 없음
- [ ] 9-10. 신규 테스트 — 마운트 포함 단위가 폐기되지 않음
- [ ] 9-11. 신규 테스트 — RC-10: 무거운 단일 컴포넌트 렌더 중 sync 갱신이 선점됨
- [ ] 9-12. 크기 실측

---

# 마무리 단계

## Phase 10 — 테스트 하드닝

진입: 착수한 마지막 단계의 종료. / 종료: 커버리지 공백 0.

- [ ] 10-1. 레인 경합 — sync·low가 같은 컴포넌트를 동시 큐잉
- [ ] 10-2. 중첩 컴포넌트에서 부모·자식이 서로 다른 레인
- [ ] 10-3. `portal`·`Fragment`·keyed 리스트 각각 저우선순위 경로
- [ ] 10-4. 낡은 큐 항목 가드 — 언마운트된 컴포넌트가 큐에 남은 경우
      (`replaceWDom`의 `il` 가드, `componentMap.get` 실패 경로)
- [ ] 10-5. `cacheUpdate`·`nextTickRender`·`computed`·`effect` 상호작용
- [ ] 10-6. `context`/`lcontext` 갱신이 레인을 넘어 전파 (**`getParent` shim 경로 집중**)
- [ ] 10-7. 엣지: 렌더 중 `startTransition` 중첩 호출
- [ ] 10-8. 엣지: 커밋 중 발생한 갱신 요청
- [ ] 10-9. 엣지: 파이버 중단 중 컴포넌트 언마운트
- [ ] 10-10. **N1 경계 회귀 감시**: 렌더 중 throw가 언와인딩으로 처리되지 **않는지**
      (Suspense가 슬금슬금 들어오지 않았음을 보증하는 테스트)

## Phase 11 — 통합 테스트

진입: Phase 10 종료. / 종료: 릴리스 판정.

- [ ] 11-1. `pnpm build && pnpm test` 전량 통과 (core + concurrent + 위성 + 툴링)
- [ ] 11-2. **RC-9 최종**: 위성 스위트 양쪽 코어 전량 통과
- [ ] 11-3. SSR → hydration 경로에서 스케줄러 동작 (`ssr/src/tests`)
- [ ] 11-4. `devHelper` HMR 바운더리가 concurrent 코어에서 동작
      (`componentMap`/`replaceWDom` 직접 호출 경로)
- [ ] 11-5. `ftags`·`tag`(HTM) 문법 동일 동작
- [ ] 11-6. 소비자 alias 시나리오 — `lithent` → `lithent-concurrent` 치환 후 예제 앱 동작
- [ ] 11-7. `examples`·`lithentDocs` 빌드·실행
- [ ] 11-8. `createLithent` 보일러플레이트로 신규 프로젝트 → SSR+hydration
- [ ] 11-9. 수동 체크리스트 전량 수행
- [ ] 11-10. 최종 크기 실측 + RC-4 판정 (**기본 코어 무회귀 포함**)
- [ ] 11-11. 체인지로그 (BC-1~BC-4) + concurrent 패키지 README (alias 설정법 포함)

---

## 상태 / 핸드오프

- done:
  - Phase 0~11 구성, 각 Phase 진입·종료 조건 및 기준 테스트 배치.
  - **Phase 0 완료 (2026-08-31)** — 0-1~0-11 전부. 순수 포크 상태에서 동작 변경 0을
    바이트 동일성 + 양쪽 테스트 동일 통과 + 크기 8 B 차이로 증명.
  - Phase 0 중 발견된 3건을 DC-10~DC-12로 확정 (DESIGN §D12~D14).
  - **Phase 1 완료 (2026-08-31)** — 1-1~1-10 전부 + 2-3a 선행. 2레인 스케줄러,
    ambient `startTransition`, 5 ms 예산 yield. concurrent br 4,989 / 5,400,
    기본 코어 4,734 무변동, bench 노이즈 범위 (C2 충족).
  - Phase 1 테스트는 **돌연변이로 유효성을 확인**했다 (1차 작성본은 무의미했음).
  - **Phase 2 완료 (2026-08-31)** — `deferred`/`ldeferred`/`isPending` (신규 서브패스
    `lithent-concurrent/helper`) + 코어 `whenIdle`. DC-13으로 소재 확정, `helper/`는 무변경.
    concurrent 코어 br 5,057 / 5,400. RC-2·RC-3·BC-4 통과, 돌연변이 3종 확인.
  - **Phase 3 자동 항목 완료 (2026-08-31)** — 3-1~3-3 + 산출물 검증(3-3b, 신규).
    섹션 B 수행을 위한 데모 페이지(`pnpm dev:concurrent`)를 만들었다.
    남은 것은 실브라우저 확인(3-4)과 릴리스 판정(3-5) — 둘 다 사람 몫이며 **미완**이다.
  - **Phase 4 완료 (2026-08-31)** — diff 단계가 순수해졌다. 부수효과 6종이 전부
    커밋 이펙트로 옮겨졌고, 폐기 능력(더블 버퍼링)을 테스트로 증명했다.
    이펙트 순서는 DC-14로 확정. concurrent br 5,104 / 6,200.
    **포크가 처음으로 base와 갈라졌다** — 동치성은 이제 4-9 테스트가 지킨다.
- next: **Phase 5 — 커밋 경계 단일화 (D5, BC-1)**. 예비 실험을 마쳤다 (§Phase 5).
  - **flush는 `commit()`에 넣을 것.** `wDomUpdate`는 재귀 함수라 거기 넣으면 더 흩어진다.
  - `render.ts`는 아직 base와 바이트 동일하다. Phase 5에서 갈라진다.
  - 실험 결과 **기존 테스트 110개가 전량 통과**했고 5-3이 지목한 5개도 기대값이
    바뀌지 않았다. 그래도 5-3은 남겨둘 것 — 교차 순서 변화는 실재한다.
  - **4-9 동치성 테스트도 함께 재검토**해야 한다. BC-1은 의도된 차이이므로
    어떤 차이가 의도된 것인지 그 파일에 명시할 것.
- 미완 (사람 몫): 3-4 수동 체크리스트 A·B·D, 3-5 T1 릴리스 판정.
- blockers: 없음.
- 진행 원칙:
  - **`src/`는 수정하지 않는다** (P1). Phase 0에서 `git status src/`가 비어 있음을 확인했다.
  - **Phase 3에서 멈춰도 완결된 결과물이다** (startTransition 완성).
  - **Phase 0의 가드 4종을 지우지 말 것.** alias 함정은 증상이 엉뚱한 곳에서 터진다.
  - **10-10을 유지할 것.** N1 경계는 코드가 아니라 테스트로 지킨다.
  - **스케줄러 테스트는 작성 후 돌연변이로 검증할 것.** 레인 동작은 통과하는 테스트를
    쓰기는 쉽고 *구분하는* 테스트를 쓰기는 어렵다 (Phase 1에서 두 번 겪었다).
  - **위성 테스트 파일에 `.test.`를 붙이지 말 것.** 루트 러너가 수집해서 `@` alias가
    어긋난다. 기존 규약대로 `*.tsx` + `import.meta.vitest`.
  - **`helper/`(기본)에 concurrent 전용 API를 넣지 말 것** (DC-13). 기본 코어에서
    no-op이 되는 API는 거기 있으면 안 된다. `lithentConcurrent/helper/`에 넣는다.
  - **concurrent helper는 코어를 external로 둘 것.** 번들에 스케줄러 사본이 들어가면
    레인 큐가 둘로 갈라진다.
- 검증 명령:
  ```bash
  pnpm build          # core -> concurrent -> 나머지
  pnpm test           # core + concurrent + 위성 + 툴링
  pnpm test:dual      # RC-9: 위성 스위트를 양쪽 코어로 2회
  pnpm size           # RC-4 게이트 (예산 초과 시 exit 1)
  pnpm verify:concurrent   # 빌드 산출물 검증 (소스가 아니라 출하물)
  pnpm dev:concurrent      # 수동 체크리스트 섹션 B용 데모
  # test:concurrent 는 코어 스위트 + lithent-concurrent/helper 스위트를 함께 돈다

  # C2 벤치 — 같은 하니스를 코어만 바꿔 돌린다 (Phase 1에서 전환 가능하게 함)
  node docs/performance-improvement/bench/verify-order.mjs
  node docs/performance-improvement/bench/bench10k.mjs
  LITHENT_CORE=concurrent node docs/performance-improvement/bench/verify-order.mjs
  LITHENT_CORE=concurrent node docs/performance-improvement/bench/bench10k.mjs
  ```
- 기준 커밋: `f3921cc` (설계 기준) / Phase 0: `95ae243` / Phase 1: `16d9e74` /
  Phase 2: `3ebf375` / Phase 3: `299d4cd` / **Phase 4: `d094a4e`**
