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
- [x] 1-6. `deferRender` export (DC-1 ambient) + `CONCURRENT_ONLY`에 동시 등록
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
- [x] 2-3b. `hasPendingRender()` — `Computed<boolean>` 모양, 마운터에서 compKey 캡처
- [x] 2-4. 스케줄러 `whenIdle(): Promise<void>` 노출 (DC-9) — `nextTick` 의미 변경 없음
- [x] 2-5. export — `lithent-concurrent/helper` 서브패스 신설 (DC-13).
      `helper/src/index.ts`는 **건드리지 않았다**
- [x] 2-6. 기준 테스트: helper 스위트 양쪽 코어 통과 (37개, 기존 그대로)
- [x] 2-7. 신규 테스트 — RC-2
- [x] 2-8. 신규 테스트 — RC-3 (`hasPendingRender` 전이 + 컴포넌트별 격리 + 비반응성)
- [x] 2-9. 신규 테스트 — BC-4 (`nextTick` 미반영 / `whenIdle` 반영)
- [x] 2-10. 크기 실측 — concurrent 코어 br **5,057** / 5,400 (`whenIdle` 몫 +68 B)

### Phase 2 실측 결과

| 항목 | 기본 `lithent` | `lithent-concurrent` |
|---|---|---|
| **코어 brotli** | **4,734** / 4,800 (무변동) | **5,057** / 5,400 (343 B 여유) |
| helper 번들 | br 1,973 (무변경) | `/helper` br **379** (신규, 별도 번들) |
| helper 스위트 | 37개 (무변경) | `/helper` 7개 (신규) |

### DC-13 — concurrent 전용 helper는 어디에 사는가

`deferred`·`ldeferred`·`hasPendingRender`는 low 레인이 있어야 의미가 있다.
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

레인 관련 export(`deferRender`·`hasPending`·`whenIdle`)는 스케줄러 기능이므로
**코어에 남는다.** concurrent helper는 이를 **external**로 가져간다 — 번들에 스케줄러
사본이 들어가면 레인 큐가 둘로 갈라진다.

### 테스트 유효성 검증 (돌연변이)

| 돌연변이 | 결과 |
|---|---|
| `ldeferred`가 `deferRender` 대신 `renew()` | ✓ 4개 실패 |
| `hasPendingRender`가 항상 false | ✓ 2개 실패 |
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
- [ ] 3-5b. **T1 단독 릴리스 시 패키지명 재검토** — `lithent-concurrent`라는 이름은
      **T2 완주를 전제로만** 정직하다. T1은 우선순위 스케줄링이지 concurrent rendering이
      아니다 (REQUIREMENTS §2.1). T1만 내보낸다면 스케줄러 쪽 이름을 쓰거나
      릴리스를 T2까지 미룬다. DC-16으로 T2까지 가기로 했으므로 **현재는 유지**이며,
      이 항목은 그 전제가 바뀔 때만 발동한다.

### 3-3b. 산출물 검증 — 왜 따로 필요한가

지금까지의 모든 테스트는 **소스**를 돈다. 코어 스위트는 `@/…` alias 표를 통해,
위성 이중 실행은 vite alias를 통해 소스에 닿는다. **소비자가 실제로 설치하는 것**
— `package.json` `exports`가 가리키는 번들과 emit된 `.d.ts` — 은 아무도 안 본다.

export map 오타, 단독 로드 실패, `@/`가 남은 선언 파일은 **전부 CI를 통과하고
설치 시점에 깨진다.** `lithentConcurrent/scripts/verifyArtifacts.js`가 그 구간을 막는다.

| 검사 | 항목 |
|---|---|
| export map 대상 6개가 전부 존재 | A-10 |
| concurrent 번들이 base와 다른 산출물 (`deferRender` 유무로 교차 확인) | A-10 |
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

**섹션 B는 지금까지 수행 자체가 불가능했다.** 레포 어디에서도 `deferRender`를
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

표시기를 **부모**에 둔 것도 우연이 아니다. `hasPendingRender`는 조회라서 스스로 렌더를
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
| 3-5 릴리스 판정 | 제품 결정 (3-5b 패키지명 조건 포함) |

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

## Phase 5 — 커밋 경계 단일화 (D5, BC-1) ✅ 완료 (2026-09-01)

진입: Phase 4 종료. / 종료: RC-5 통과.

- [x] 5-1. `render.ts`의 내부 `execMountedQueue()` 4곳 제거 (typeAdd 2곳, typeReplace, updateChildren)
- [x] 5-2. 커밋 종료 1곳으로 통합 — **`commit()`에 넣을 것. `wDomUpdate` 아님** (아래)
- [x] 5-3. **기대값 재검토**: `core-loopLifecycleOrder`, `core-mountreadycallback`,
      `core-callback`, `core-nestedUnmount`, `core-destroy` → **전부 기대값 유지** (근거 아래)
- [x] 5-4. 변경된 순서 문서화 — BC-1 체인지로그 초안 (아래)
- [x] 5-5. 기준 테스트 전량 통과
- [x] 5-6. 4-9 동치성 테스트 재검토 — 의도된 차이를 **실행 가능한 주장으로** 고정했다 (아래)
- [x] 5-7. 크기 실측 — concurrent br **5,086** / 6,200 (Phase 4 대비 **−16 B**)

### Phase 5 실측 결과

| | 기본 (동결) | concurrent |
|---|---|---|
| **brotli** | **4,734** / 4,800 (무변동) | **5,086** / 6,200 (1,114 B 여유) |
| 코어 스위트 | — | 110개 전량 통과 |
| 동치성 (4-9) | — | 8개 통과 (기존 5 + BC-1 3) |
| `test:dual` · `verify:concurrent` | 통과 | 통과 |

호출 지점이 4개 줄고 1개 늘어 **−16 B**. `render.ts`가 **Phase 5에서 처음 base와 갈라졌다**
(제거 4곳). `wDom.ts`의 `commit()`이 이제 마운트 큐 flush까지 책임진다.

### 5-3 기대값 재검토 결과 — 5개 파일 전부 변경 없음

예비 실험의 예측대로였고, "통과했다"가 아니라 **왜 옳은지**로 확인했다.

| 파일 | 무엇을 단언하는가 | BC-1 영향 |
|---|---|---|
| `core-loopLifecycleOrder` | mount끼리·unmount끼리의 **상대 순서**만 | 없음 — 큐가 FIFO이고 push 순서(DOM 생성 순서)가 그대로 |
| `core-mountreadycallback` | `mountReadyCallback`의 실행과 `dom-not-exists` 타이밍 | 없음 — **다른 경로**다. `runWDomCallbacksFromWDom`은 `wDomToDom()` 안에서 돌고 `execMountedQueue`와 무관 |
| `core-callback` | `console.log`만 하고 단언이 없다 | 해당 없음 |
| `core-nestedUnmount` | 마운트·언마운트 **횟수**와 최종 DOM | 없음 — 횟수는 flush 지점 수와 무관 |
| `core-destroy` | 최종 DOM 문자열 | 없음 |

### 5-6 동치성 테스트 — 의도된 차이를 테스트로 못 박았다

기존 5개 시나리오는 **그대로 통과한다.** mount↔mount, unmount↔unmount 상대 순서는
BC-1이 건드리지 않기 때문이다. 그래서 주석만 달면 "동치성이 아직 완전하다"는 인상을 준다.

`concurrent-commitEquivalence.test.ts`에 **양쪽 코어를 서로 다른 값에 고정하는** 블록을 넣었다
— 형제 컴포넌트 둘이 한 갱신에서 마운트될 때 각자가 본 부모의 자식 수:

| | base | concurrent |
|---|---|---|
| 첫 형제가 본 DOM | `A:1` (절반만 지어진 상태) | `A:2` (커밋 완료 상태) |
| 둘째 형제가 본 DOM | `B:2` | `B:2` |
| 결과 DOM | 동일 | 동일 |

**돌연변이로 검증했다** (규약):

| 돌연변이 | 결과 |
|---|---|
| `typeAdd`에 flush 되살리기 (Phase 5 부분 원복) | ✓ 실패 — `['A:1','B:2']` |
| `commit()`의 flush 제거 (전부 원복) | ✓ 실패 2건 — 로그가 비고, 기존 keyed 시나리오도 깨짐 |

### 5-4 BC-1 체인지로그 초안

> **BC-1 — `mountCallback` flush 시점이 커밋 경계 1곳으로 통일** (T1.5, semver **minor** + 명시)
>
> `mountCallback`은 이제 DOM 삽입 지점마다가 아니라 **커밋이 끝난 뒤 1회** 실행된다.
>
> **바뀌는 것**
> - 한 갱신에서 여러 형제가 마운트될 때, 앞선 형제의 `mountCallback`이 보는 DOM이
>   *절반만 지어진 상태* → **완성된 커밋 상태**. (대체로 개선이다.)
> - `mountCallback` ↔ `updateCallback`의 **교차 순서**. 갱신 콜백이 먼저 몰리고
>   마운트 콜백이 뒤따른다.
>
> **바뀌지 않는 것**
> - `mountCallback`끼리의 상대 순서 (FIFO, DOM 생성 순서)
> - `updateCallback`끼리의 상대 순서 (`typeUpdate` 안이라 범위 밖)
> - 언마운트 계열 전부 (`runUnmountEffects` 경로, `execMountedQueue`가 아니다)
> - `mountReadyCallback` (`wDomToDom()` 안에서 실행, 별개 경로)
> - 결과 DOM — BC-1은 콜백이 트리를 *언제 보는지*를 바꾸지 트리가 *무엇이 되는지*는 바꾸지 않는다
>
> **영향받는 코드**: `mountCallback` 안에서 형제 노드의 존재를 가정하던 코드는 이제
> 더 완성된 DOM을 본다. 반대로 "아직 없을 것"을 가정했다면 깨진다.
> keyed 리스트 경로는 이미 마지막에 한 번만 flush했으므로 사실상 영향이 없다.

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

## Phase 6 — store tearing (D6) ✅ 완료 (2026-09-01)

진입: Phase 5 종료. / 종료: RC-6 통과.

- [x] 6-1. `helper/src/hook/store.ts`의 Proxy set에서 코어에 쓰기 통지 (아래 DC-17)
- [x] 6-2. `lstore.ts` 동일 적용
- [x] 6-3. 빌드 시작 시 version 기록 / 커밋 직전 비교 / 불일치 시 폐기·재실행
- [x] 6-4. 재시도 상한(`MAX_STORE_RETRY = 2`) + 초과 시 그 자리에서 커밋
- [x] 6-5. 기준 테스트: helper 스위트 양쪽 통과 (기본 코어에서 무해 — 40개 양쪽 통과)
- [x] 6-6. 신규 테스트 — RC-6: 빌드 도중 store 쓰기 시 일관된 값 관측
- [x] 6-7. 신규 테스트 — 재시도 상한 초과 시 종료(무한 루프 아님)
- [x] 6-8. 크기 실측 — concurrent br **5,433** / 6,200 (Phase 5 대비 **+347 B**)

### Phase 6 실측 결과

| | 기본 (동결) | concurrent |
|---|---|---|
| **brotli** | **4,734** / 4,800 (무변동) | **5,433** / 6,200 (767 B 여유) |
| 코어 스위트 | — | 116개 통과 (기존 110 + 신규 6) |
| helper 스위트 | 40개 통과 | 40개 통과 (`test:dual`) |
| `verify:concurrent` | 통과 | 통과 |

`helper/`를 이 작업에서 **처음 수정했다.** 추가된 것은 API가 아니라 쓰기 통지 1줄이며,
기본 코어에서는 무동작이다 (아래 DC-17).

### DC-17 — 배선은 단방향·선택적이다

코어는 helper를 import할 수 없고(의존성 역전), helper는 **동결된 base 코어에서도**
빌드·동작해야 한다. 그래서 helper가 이렇게 한다:

```ts
import * as lithentCore from 'lithent';

const notifyStoreWrite = () =>
  (lithentCore as { notifyStoreWrite?: () => void }).notifyStoreWrite?.();
```

named import였다면 base 빌드에서 링크 에러가 난다. 모듈 네임스페이스의 없는 속성은
그냥 `undefined`이므로 base에서는 무동작이고 store 거동은 이전과 완전히 같다.

### DC-18 — 무엇을 폐기해도 되는가

**`useUpdated`는 이펙트를 커밋이 아니라 빌드 중에 실행한다.** (`src/hook/internal/useUpdate.ts`)
이미 실행된 사용자 이펙트는 폐기로 되돌릴 수 없고, 그 빌드를 다시 지으면 **두 번 돈다.**
설계 시점에 없던 사실이고, 테스트가 먼저 잡아냈다 (`updates`가 2로 나왔다).

규칙은 한 문장이다 — **관측 가능한 일을 아무것도 하지 않은 빌드만 폐기한다.**

| 빌드가 한 일 | 폐기 가능? | 이유 |
|---|---|---|
| 아무것도 | ✅ | Phase 4가 빌드를 순수하게 만들어 뒀다 |
| 새 컴포넌트 마운트 | ❌ 그대로 커밋 | `componentMap` 등록이 이미 끝났다 (DC-7) |
| `updateCallback` 발화 | ❌ 그대로 커밋 | 이펙트가 이미 실행됐다 |
| 재시도 2회 소진 | ❌ 그대로 커밋 | 무한 루프 방지 (6-4) |

대가는 그 빌드가 **tearing인 채 남는다**는 것이고, 테스트가 그것을 명시적으로 단언한다
(`commits a build that already fired an update callback` → `<b>1</b><i>2</i>`).
T2 Phase 9에서 재검토 대상이다.

`updateCallback` 발화 여부는 `checkNeedPushQueue`를 스냅샷 대비 현재 `upD`로 다시 계산해
판정한다. 동결된 base 코어(P1)에서 export를 늘릴 수 없어 복제했고, 같은 이유로 어긋날 수 없다.

### Phase 9-3을 앞당겨 왔다 — 재시도의 전제 조건

`useUpdated`는 빌드 중에 `upD`를 쓰고 `upS`를 전진시키는데 `upS`는 **커밋에서만** 0으로
돌아간다 (§7.4). 복원 없이 두 번째 빌드를 돌리면 어긋난 슬롯을 읽는다. 재시도가
성립하려면 필요하므로 Phase 6에 포함했다 — `wDomMaker` 진입 시 `upD`/`upCB`/`upS`/`mts`
스냅샷, 폐기 시 복원. **Phase 9-3은 이 구현을 확장하는 작업이 된다.**

### T1.5에서 이 체크가 실제로 잡는 것

빌드가 동기이므로, 끼어들 수 있는 store 쓰기는 **그 빌드 안에서 시작된 것**뿐이다
(렌더 중 store에 쓰는 컴포넌트). 실재하는 경우이고 6-6이 그것을 잡는다.
다만 **본래의 이득은 T2**다 — 렌더가 태스크를 가로지르는 순간 외부 쓰기가
빌드 중간에 들어올 수 있게 된다. 지금은 그 기계장치를 미리 세워 두는 단계다.

### 돌연변이 검증 (규약)

| 돌연변이 | 결과 |
|---|---|
| 버전 비교 제거 (항상 커밋) | ✓ 3개 실패 |
| 훅 상태 복원 제거 | ✓ 1개 실패 |
| 재시도 상한 제거 (`< 1000`) | ✓ 실패 — `builds`가 1001 |
| 이펙트 발화 감지 제거 | ✓ 1개 실패 — 이펙트 2회 실행 |
| `store.ts`의 통지 제거 | ✓ `test:dual` concurrent 쪽 실패, base는 정상 통과 |

> **helper 배선 테스트는 처음에 무의미하게 통과했다.** 코어를 기능 탐지(`storeVersion`이
> 있는가)로 판별했는데 그때 번들을 다시 굽지 않아 concurrent 실행이 base 분기를 탔다.
> 판별을 `process.env.LITHENT_CORE`로 바꿔서, 없는 export가 조용한 스킵이 아니라
> **실패**가 되게 했다.

## Phase 7 — T2 진입 게이트 (RC-7)

진입: Phase 6 종료. / 종료: T2 착수 여부 판정.

코드 변경 없음. 측정과 판정만 한다.

> **기본 코어 때보다 기준이 완화된다.** concurrent 빌드의 대상은 대규모 사이트이고
> 중단 가능성이 그 존재 이유이므로, "흔한가"가 아니라 "대상 워크로드에서 실재하는가"를 묻는다.

- [x] 7-1. 실브라우저 프로파일링 — 단일 작업 단위(`replaceWDom` 1회) 소요 시간 분포
- [x] 7-2. js-framework-benchmark 시나리오별 단위 소요 시간 기록
- [x] 7-3. **판정: 실재한다.** 10k행 워크로드의 단위가 18~60ms — 프레임의 1~4배
- [x] 7-4. 해당 없음 (실재함)
- [x] 7-5. **Phase 8 진입 승인** (2026-09-01)

### 7-1·7-2 측정 방법 (하네스, 2026-09-01 추가)

```bash
pnpm bench:units      # 두 코어를 빌드하고 브라우저를 연다
```

페이지에서 **run** → 표가 채워지면 **copy as markdown** → 아래 "실측" 자리에 붙인다.

**한 단위를 어떻게 재는가.** 모든 시나리오가 **단일 컴포넌트**를 구동하므로 `renew()` 1회가
곧 `replaceWDom` 1회다. 코어를 건드리지 않고 이렇게 잰다:

```
t0 -> renew() -> await nextTick() -> t1
```

`renew`는 `flushSync`를 마이크로태스크로 걸고 `nextTick()`은 `Promise.resolve()`라
연속 실행이 커밋 **뒤에** 온다. 두 마크 사이에 들어오는 것은 빌드 + 커밋의 **스크립트 시간**,
즉 프레임 예산을 쓰는 바로 그것이다. 페인트는 이후이며 세지 않는다 —
롱태스크 옵저버가 그 교차 확인이다.

**왜 소스가 아니라 빌드 산출물인가.** `vitedev.config.js`는 포크의 alias 표로 **소스**를
돌리는데, 거동 데모에는 맞고 타이밍에는 틀리다. 번들되지 않은 소스와 minify된 번들을
비교하면 코어가 아니라 빌드를 재게 된다. `vitebench.config.js`는 양쪽 다 **빌드 산출물**로
띄운다 (`pnpm build` 선행 필요 — `bench:units`가 알아서 한다).

**측정 시 주의**: 다른 탭을 닫고 이 탭을 포커스에 둔다(백그라운드 스로틀링이 꼬리를 왜곡).
2~3회 돌려 안정된 쪽을 취한다 — 첫 회는 JIT 비용을 낸다.

시나리오 10종 × 코어 2개 × 5회. 리스트는 keyed 테이블(js-framework-benchmark 형태):
create 1k/10k, replace all 1k/10k, update every 10th, select row, swap rows,
append 1k, clear, 그리고 400단 중첩 트리의 리프 갱신.

**base도 함께 재는 이유**: T1.5는 회귀 0을 주장한다(C2). 이 단계에서 두 코어는 구별되지
않아야 하며, 차이가 나면 그 자체가 발견이다.

#### 7-1·7-2 실측 (2026-09-01, Chrome)

| 시나리오 | 코어 | n | p50 | p95 | max | >16ms |
|---|---|---:|---:|---:|---:|---:|
| create 1,000 | base | 5 | 4.9 | 8.0 | 8.0 | 0/5 |
| create 1,000 | concurrent | 5 | 3.7 | 6.4 | 6.4 | 0/5 |
| create 10,000 | base | 5 | 34.1 | 34.8 | 34.8 | 5/5 |
| create 10,000 | concurrent | 5 | 31.9 | 33.5 | 33.5 | 5/5 |
| replace all 1,000 | base | 5 | 4.6 | 7.7 | 7.7 | 0/5 |
| replace all 1,000 | concurrent | 5 | 5.1 | 7.9 | 7.9 | 0/5 |
| replace all 10,000 | base | 5 | 60.4 | 62.9 | 62.9 | 5/5 |
| replace all 10,000 | concurrent | 5 | 57.7 | 60.8 | 60.8 | 5/5 |
| update every 10th (10,000) | base | 5 | 43.5 | 96.0 | 96.0 | 5/5 |
| update every 10th (10,000) | concurrent | 5 | 41.3 | 41.8 | 41.8 | 5/5 |
| select row (10,000) | base | 5 | 42.5 | 97.2 | 97.2 | 5/5 |
| select row (10,000) | concurrent | 5 | 39.2 | 40.9 | 40.9 | 5/5 |
| swap rows (10,000) | base | 5 | 40.3 | 44.6 | 44.6 | 5/5 |
| swap rows (10,000) | concurrent | 5 | 39.1 | 39.7 | 39.7 | 5/5 |
| append 1,000 to 10,000 | base | 5 | 45.0 | 47.7 | 47.7 | 5/5 |
| append 1,000 to 10,000 | concurrent | 5 | 43.7 | 44.7 | 44.7 | 5/5 |
| clear 10,000 | base | 5 | 18.5 | 22.3 | 22.3 | 5/5 |
| clear 10,000 | concurrent | 5 | 17.8 | 20.3 | 20.3 | 4/5 |
| deep tree x400 | base | 5 | 0.2 | 0.3 | 0.3 | 0/5 |
| deep tree x400 | concurrent | 5 | 0.3 | 0.6 | 0.6 | 0/5 |

16ms 초과 단위 **69개, 최대 97.2ms**. 롱태스크 교차 확인 100건, 최대 161.0ms.

#### 이 표가 말하는 것 넷

**1. 7-3은 통과다 — 넉넉하게.** 10k행 시나리오 8종이 **전 샘플 초과**이고 p50이
프레임의 1~4배다. "16ms를 넘는 단위가 있는가"가 아니라 "10k에서는 넘지 않는 단위가 없다"에
가깝다. T2의 존재 근거가 측정으로 성립했다.

**2. 경계는 1k와 10k 사이다.** 1,000행은 전 시나리오 4~8ms로 **한 건도 넘지 않는다.**
이것이 §1.1의 제품 판단을 다시 확인해 준다 — SSR 페이지에 컴포넌트 몇 개 꽂는 용도라면
넘을 일이 없고, T2가 값을 하는 지점은 정확히 별도 빌드로 뺀 이유인 대규모 사이트다.
동시에 DC-16(통합하지 않음)의 근거이기도 하다.

**3. 비용은 깊이가 아니라 너비에 있다 — 설계 입력이다.**
400단 중첩 트리의 리프 갱신이 **0.2~0.6ms**다. 즉 **컴포넌트 경계에서만 yield하는 설계는
아무것도 사지 못한다.** 비싼 단위는 "컴포넌트 하나가 형제 10,000개를 훑는" 모양이고,
쪼개야 하는 지점은 `updateChildren`/`remakeChildrenForDiff`의 **자식 루프 안**이다.
D7의 `child`/`sibling` 포인터 + work loop가 정확히 그 입자를 준다 —
이 측정이 그 선택을 사후 정당화한다. Phase 8-4에서 `shouldYield()`를
**형제 사이**에 넣을 것. 깊이 방향에만 넣으면 위 표는 하나도 안 움직인다.

**4. 두 코어는 구별되지 않는다 (C2 유지).** p50 차이가 전 시나리오 5% 이내이고
concurrent가 더 느린 항목이 없다. base의 p95 96.0 / 97.2 두 건은
**단일 이상치이며 성능 발견이 아니다** — 시나리오마다 base가 먼저 돌아 GC를 떠안은
것으로 보인다. "concurrent가 더 빠르다"로 읽지 말 것. `clear 10,000`의 4/5 대 5/5도
17~20ms 경계에 걸친 것이라 의미 없다.

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

> **⚠ Phase 9가 끝나기 전에 "중단 가능"을 주장하지 말 것** (REQUIREMENTS §2.1).
> T2는 Phase 8만이 아니라 **8 + 9 + 10 전부**다. §7.4가 걸려 있다 — WIP 훅 슬롯 없이
> 파이버만 넣고 중단하면 `upD`에 새 deps가 먼저 박혀 재시도 비교가 "같음"이 되고
> **이펙트가 유실**되며 `upCB`는 중복 누적된다. *중단은 되는데 결과가 틀리는* 중간 지점이
> 실재하고, 그것이 이름만 얻고 정확성을 잃는 최악의 상태다.
> 명명 근거는 코드가 아니라 **RC-10(수동 E-4) 통과**다 — Phase 9-11이 그 자동 대응물이다.

- [x] 8-1. ~~노드에 `child`/`sibling`/`return`/`ci` 필드 추가~~ → **명시적 스택으로 대체** (DC-19)
- [x] 8-2. `getParent` 유지 — shim이 필요 없어졌다. 노드 모양을 안 건드리므로 그대로 (DC-19)
- [x] 8-3. `makeNewWDomTree` 재귀를 `beginWork`/`completeWork`로 분해
- [x] 8-4. work loop + `shouldPause` 연동 — **형제 사이에서 검사한다**
- [x] 8-5. diff 알고리즘(키 매칭 Map, LIS, `checkSameWDomWithOriginal`) 그대로 이식
- [x] 8-6. 중단 시 재개 지점 저장 / 다음 태스크에서 이어가기 (**low 레인 한정** — DC-20)
- [x] 8-7. 기준 테스트 전량 통과 (코어 126개)
- [x] 8-8. RC-9 재확인 — `pnpm test:dual` 통과. `getParent` 시그니처 무변경
- [x] 8-9. 신규 테스트 — 중단 후 재개 결과가 무중단 렌더와 동일
- [x] 8-10. bench 재측정 (2026-09-01, 아래) — 처리량 대가 +11%p → 할당 축소 후 **+9%p**.
      DC-6 허용폭 안이나, 같은 측정에서 **빌드가 한 단위의 11~22%뿐**임이 드러났다 (아래)
- [x] 8-11. 크기 실측 — concurrent br **5,893** / 9,000 (Phase 6 대비 +460 B)

### 8-10 실측 — work loop의 대가 (2026-09-01)

런 간 base 자체가 ±10% 흔들리므로 **같은 실행 안의 concurrent/base 비율**로 읽는다.

| 시나리오 | Phase 7 c/b | Phase 8 c/b | 변화 |
|---|---:|---:|---:|
| create 1,000 | 0.76 | 0.86 | +10%p |
| **create 10,000** | 0.94 | **1.21** | **+28%p** |
| replace all 1,000 | 1.11 | 1.11 | 0 |
| replace all 10,000 | 0.96 | 1.09 | +14%p |
| update every 10th (10k) | 0.95 | 1.05 | +10%p |
| select row (10k) | 0.92 | 0.85 | −7%p (base p95 101ms — 노이즈) |
| swap rows (10k) | 0.97 | 1.15 | +18%p |
| append 1,000 to 10,000 | 0.97 | 0.99 | +2%p |
| clear 10,000 | 0.96 | 1.11 | +15%p |
| deep tree x400 | 1.50 | 1.00 | (0.2ms 대 0.3ms, 무의미) |
| **대형 7종 평균** | **0.95** | **1.07** | **+12%p** |

**판정 (DC-6).** DC-6은 T2를 "기본 대비 회귀 없음"이 아니라 "대규모 시나리오 총 체감"으로
판정한다고 이미 정해뒀다. 처리량 +12%는 그 허용폭 안이며, 중단이 사는 것은 처리량이
아니라 **응답성**이다. 다만 공짜가 아니라는 사실은 기록해 둔다.

**어디서 나오는가.** `create 10,000`(전부 새 노드)이 최악인 것이 단서다 — 순회 상태를
JS 콜스택에서 힙으로 옮기면서 **노드마다** Frame 객체 + `getParent` 클로저 + 배열 4개를
할당하고 있었다. 재귀에서는 리프가 아무것도 할당하지 않았다.

**줄인 것** (같은 기계, 10k 생성 빌드 단독 측정): **3.3ms → 2.2ms (−33%)**

- 자식 없는 노드는 공유 빈 배열 하나를 쓴다. 실제 트리는 대부분 리프이고 텍스트 노드는
  전부 리프다.
- `getParent` 클로저는 자식이 있는 노드에서만 만든다 (재귀도 부모당 1개였다).
- `children.slice()` 제거 — `wip.children`은 이 프레임의 `completeWork`에서만 교체되고,
  그때는 커서가 이미 다 소비한 뒤다.
- `originals`/`matchedIndexes`는 실제로 짝지을 게 있을 때만 할당한다.

> **재확인 필요**: 위 −33%는 빌드 단계만 jsdom에서 잰 값이다. `pnpm bench:units`를
> 한 번 더 돌려 대형 7종 평균 비율이 1.07에서 얼마나 내려오는지 표에 채워 넣을 것.

#### 8-10 재확인 실측 (2026-09-01) — **되돌린 것은 2%p뿐이다**

| 대형 7종 평균 c/b | Phase 7 | Phase 8 | 할당 축소 후 |
|---|---:|---:|---:|
| | **0.952** | **1.065** | **1.044** |

빌드 단독으로는 −33%였는데 전체로는 2%p밖에 안 움직였다. **왜인지가 이 단계에서
가장 중요한 발견이다.**

### 빌드/커밋 비중 — 시나리오마다 다르다 (2026-09-01 실측)

> **먼저 정정.** 이 절은 처음에 "빌드는 한 단위의 11~22%뿐"이라고 적혀 있었다.
> **틀렸다.** 그 수치는 *생성* 경로만 재고 일반화한 것이었다. 갱신 경로는 정반대다.

한 단위를 단계별로 계측했다 (jsdom, 10,000행):

| 시나리오 | 전체 | 빌드 | **빌드 비중** | 커밋 | 커밋의 내역 |
|---|---:|---:|---:|---:|---|
| update every 10th | 29ms | 14ms | **48%** | 15ms | 순회 11ms (그중 실제 DOM 쓰기 3.4ms) |
| create 10,000 | 68ms | 12ms | **17%** | 56ms | **`wDomToDom` 39.5ms (71%)** + 나머지 |

**갱신 경로는 이미 절반이 중단 가능하다.** 실제 앱이 시간을 쓰는 곳은 10k행을 처음
만드는 자리가 아니라 갱신이므로, 이쪽이 더 대표적인 숫자다.

**생성 경로의 커밋은 71%가 `wDomToDom`이다 — 그리고 그것은 옮길 수 있다.**
`wDomToDom`은 **문서에 붙지 않은 분리된 DOM 노드를 만드는 순수 할당**이다. 관측 가능한
부수효과가 없으므로 커밋이 아니라 **빌드 단계에서 해도 된다.** React가 정확히 그렇게 한다
(호스트 인스턴스를 `completeWork`에서 만들고 커밋은 삽입만 한다).

옮기면 생성 경로의 중단 가능 비중이 **17% → 약 75%**가 된다. 진짜로 통짜여야 하는 것은
문서에 붙이는 삽입뿐이다.

**그래서 T2의 효과가 작다는 결론은 성급했다.** 한계는 파이버에 있는 게 아니라
**빌드/커밋 경계를 어디에 그었느냐**에 있고, 그 선은 옮길 수 있다.

**폐기했던 가설**: "커밋 walk가 `updateProps`에 시간을 낭비한다" — **아니다.**
`updateProps`가 10,003번 불려도 1.8ms이고, `updateText` 1,000번이 1.8~4.1ms다.
커밋 순회 11ms 중 실제 DOM 작업은 3.4ms뿐이며 나머지는 노드당 ~0.7µs의 순회 비용이다.
여기서 뽑아낼 것은 없다.

### D16 — `wDomToDom`을 커밋에서 빌드로 (2026-09-01 완료)

위 실측대로 옮겼다. **결과: 생성 경로의 빌드 비중 16% → 74%**, 커밋 60.5ms → 19.2ms.
총 시간은 그대로다(~73ms). 갱신 경로는 48% → 52%.

| 시나리오 | 옮기기 전 빌드 비중 | 옮긴 후 |
|---|---:|---:|
| create 10,000 | 16% | **74%** |
| update every 10th | 48% | 52% |

**정정: `wDomToDom`은 순수하지 않았다.** 앞 절에서 "부수효과가 없으므로 폐기 안전성
논증도 필요 없다"고 적었는데 **틀렸다.** 두 가지 관측 가능한 일을 한다 —
사용자의 `mountReadyCallback` 실행(`runWDomCallbacksFromWDom`)과 마운트 큐 등록
(`addMountedQueue`).

그래서 **생성만 옮기고 그 둘은 커밋의 원래 자리에서 실행한다.** Phase 4의 이펙트 리스트와
같은 방식이다(DC-14) — `wDomToDom`에 수집기를 넘기면 둘을 실행 대신 기록하고,
커밋이 준비된 엘리먼트를 **가져가는 그 지점**에서 순서대로 재생한다. 즉 base가 그 둘을
실행하던 시점과 정확히 같다.

폐기는 그래서 청소가 필요 없다 — 아무도 안 가져가면 콜백은 실행되지 않고 엘리먼트와
기록은 그대로 수거된다.

**노드당 저장은 WeakMap이다.** `WDom`이 동결 코어에 있어 필드를 못 늘린다 (DC-19와 같은 이유).

**`el` 되돌리기.** `wDomToDom`은 만든 엘리먼트를 `wDom.el`에 꽂는데, replace 경로에서는
**옛 엘리먼트가 커밋까지 살아 있어야 한다** — `typeReplace`가 바꿔칠 대상으로,
`typeDelete`가 지울 대상으로 읽는다. 그래서 준비 단계에서 `el`을 원래대로 되돌리고,
커밋이 가져갈 때 새 것으로 바꾼다.

**여기서 실제 버그가 하나 나왔다 — 삽입 앵커.** 아직 커밋되지 않은 형제가 이제
**엘리먼트를 이미 가지고 있다**(문서에는 없는 채로). 앵커 탐색이 그것을 집어 오고
`insertBefore`가 `NotFoundError`를 던진다. base에서는 그 형제가 아직 엘리먼트 자체가
없어서 앵커가 `null`이었다. 그래서 **앵커가 실제로 그 부모의 자식일 때만 쓴다**
(`anchorIn`) — 아니면 `null`로 떨어져 append가 되고, 그게 base의 거동이다.
동치성 테스트(4-9)가 이것을 잡았다.

#### D16의 처리량 대가 — 두 번 줄여서 0으로

첫 구현은 **브라우저에서 처리량을 오히려 악화시켰다**. 대형 7종 평균 c/b가
1.044 → **1.071**, `create 10,000`은 1.16 → **1.40**.

| 구현 | create 10k (jsdom p50) | update every 10th |
|---|---:|---:|
| D16 이전 | 50.0ms | 16.7ms |
| 1차: 노드마다 thunk 2개 | 브라우저에서 +24%p (jsdom 52.6ms) | 17.9ms |
| 2차: thunk 대신 **노드 참조 배열** | 52.6ms | 17.9ms |
| 3차: **`compKey` 있는 노드만 기록** | **49.3ms** | **16.9ms** |

- 1차의 문제는 `pending.push(() => …)` — 10,000행이면 노드 ~20,000개에 **클로저 2개씩**,
  base가 내지 않는 세금이다.
- 2차로 노드 참조만 담게 바꿨다. 두 리스트가 원래처럼 교차할 필요는 없다 —
  `addMountedQueue`는 나중에 flush되는 큐에 넣기만 하고 그 사이에 관측할 방법이 없다.
- 3차: 두 부수효과 모두 **`compKey`가 없으면 무동작**이다. 평범한 엘리먼트 10,000개짜리
  리스트는 이제 **아무것도 기록하지 않는다.**

최종 대가는 **노이즈 범위**다 (create 50.0 → 49.3, update 16.7 → 16.9).
그러면서 생성 경로의 중단 가능 비중은 16% → 74%가 됐다.

#### D16 브라우저 확정 실측 (2026-09-01)

| 대형 7종 평균 c/b | Phase 7 | Phase 8 초기 | Phase 8 최종 | D16 1차 | **D16 3차** |
|---|---:|---:|---:|---:|---:|
| | 0.952 | 1.065 | 1.044 | 1.071 | **1.045** |

D16은 **처리량 중립**이다 (1.044 → 1.045). `create 10,000`은 오히려 나아졌다
(1.21 → **1.11**). 비용 0으로 생성 경로의 중단 가능 비중을 16% → 74%로 옮겼다.

컴포넌트 행 시나리오 (신규, 기준선 없음): create **1.04**, update **1.15**.

#### 다음 최적화 후보 — 컴포넌트 갱신 1.15

`component rows: update every 10th`만 유독 높다 (D16 1차에서는 1.42였다가 1.15로 내려왔다).
**가설: Phase 6의 훅 슬롯 스냅샷이다.** `traceHookState`가 렌더되는 **컴포넌트마다**
`upD`/`upCB`/`mts`를 복사하므로, 10,000개 컴포넌트 행이면 한 번의 렌더에 객체 1개 +
배열 복사 3개 × 10,000 ≈ 40,000 할당이다. 평범한 엘리먼트 행에서는 컴포넌트가 하나뿐이라
드러나지 않는다.

아직 확인하지 않은 가설이다. 확인한다면 "빈 훅 상태는 복사하지 않는다" 정도가
첫 시도가 될 것이다.

#### 남은 것

- RC-10 판정은 이제 의미가 있다. **커밋에 남은 ~19ms 중 얼마가 진짜 원자적이어야
  하는지**가 다음 질문이다.

> 벤치에 **컴포넌트 행 시나리오 2종을 추가했다** (`component rows: create 10,000`,
> `component rows: update every 10th`). 기존 시나리오는 행이 평범한 엘리먼트라
> 빌드 비중을 과소평가한다 — 실제 앱의 모양은 컴포넌트 쪽이다.

### DC-19 — 노드 포인터가 아니라 명시적 스택

D7은 `child`/`sibling`/`return`/`ci`를 노드에 붙이는 그림이었다. **불가능하다** —
`WDom`은 동결된 base 코어(`src/types/index.ts`)에 있고 인덱스 시그니처가 없어서
포크가 넓힐 수 없다 (P1).

대안으로 간 명시적 스택이 오히려 더 낫다:

| | 노드 포인터 | 명시적 스택 |
|---|---|---|
| 추가 메모리 | O(노드 수) | **O(깊이)** |
| 노드 모양 | 바뀜 → 모든 `WDom` 소비자에 영향 | **무변경** (C3 유지) |
| `getParent` | D10 shim 필요 | **필요 없음** — 기존 클로저 그대로 |

React가 `return` 포인터를 쓰는 이유는 스택 없이 되올라가야 하기 때문인데, 우리는
스택을 들고 있으므로 그 제약이 없다. Phase 9의 `alt`(current↔WIP)는 별개이며
필요하면 그때 추가한다.

### DC-20 — 중단은 low 레인 전용

sync 플러시는 마이크로태스크이고, **`await nextTick()`이 "커밋 완료"를 뜻한다는 계약에
44개 파일·72곳이 의존한다.** 거기서 yield하면 그 계약과 RC-1(sync 우선)이 함께 깨진다.
그래서 `isFlushingLow()`가 참일 때만 중단한다.

`flushSync`는 자기 주변에서 그 표시를 **끈다.** low 슬라이스 안에서 올라온 sync 렌더가
low 표시를 물려받아 스스로 멈춰 서는 일을 막는다 — 실제로 그 상태에서는 **미룬 갱신과
급한 갱신이 둘 다 유실되고** 화면이 이전 상태에 머물렀다.

### Phase 8에서 드러난 것

**1. 재개가 슬라이스 경계에서 끝나면 `whenIdle()`이 영영 안 풀렸다.** 재개 후 무조건
early return 하는 바람에 idle 대기자 해제 지점을 건너뛰었다. 5ms 예산에서도 실재하는
버그였고, **강제 중단 테스트가 아니었으면 못 잡았다** — 그전까지 jsdom에서는 예산을
넘는 일이 없어 중단 경로 자체가 한 번도 실행되지 않았다.

**2. 멈춘 빌드를 버리는 것은 지금 안전하지 않다.** 그 빌드는 이미 컴포넌트 업데이터를
돌렸고 `runUpdate`가 `compProps`/`compChild`를 제자리에서 동기화한다. 반쯤 소비된 그
상태 위에 새 빌드를 얹으면 **예외로 죽는다** (실제로 겪었다). 그래서 정책은
**"멈춘 빌드를 먼저 끝낸다"**이고, 그 커밋이 노드를 은퇴시키면 새 렌더를 그 시점의
노드 기준으로 **다시 큐에 넣는다**(`componentUpdate`). 그냥 return하면 새 상태가
조용히 유실된다. 제대로 버리는 것은 Phase 9의 alternate/롤백(D8·D9) 몫이다.

### 테스트로 덮은 것과 못 덮은 것

| 항목 | 상태 |
|---|---|
| 중단/재개 결과가 무중단과 동일 (트리·이펙트) | ✅ `shouldPause`를 직접 주입해 결정론적으로 |
| 형제 사이에서 멈춘다 | ✅ 60형제 1단 트리에서 pause 6회 이상 |
| 실제 스케줄러 경유 중단·재개 | ✅ `setLowLaneBudget(0)`로 강제 |
| sync 레인은 안 멈춘다 | ✅ |
| **멈춰 있는 빌드를 sync 렌더가 추월** | ❌ **미검증** — jsdom에서 그 인터리브를 결정론적으로 만들지 못했다(모든 프로브가 재개 체인을 먼저 다 비운다). `replaceWDom`의 재요청 경로는 방어적이며 Phase 9(RC-8)에서 덮는다 |

> `setLowLaneBudget`은 의도적 이음매다. `index.ts`로 내보내지 않으므로 공개 표면이 아니다.
> 없을 때는 재개 경로가 "기계가 느릴 때만" 실행돼서, **`scheduleWork`를 통째로 지워도
> 테스트가 하나도 안 깨졌다.** 그 상태의 통과는 통과가 아니다.

### 돌연변이 검증 (규약)

| 돌연변이 | 결과 |
|---|---|
| `shouldPause` 무시 (절대 안 멈춤) | ✓ 3개 실패 |
| sync 레인도 중단 허용 | ✓ 31개 실패 |
| 재개를 스케줄하지 않음 | ✓ 2개 실패 (예산 이음매 도입 **후에만**) |
| 은퇴 노드에서 재요청 생략 | ✗ 안 잡힘 — 위 표의 미검증 항목과 같은 이유 |


## 섹션 E가 잡은 것 (2026-09-02, 실브라우저 1차 수행)

E-4를 처음 돌렸더니 **concurrent 쪽 최장 블록이 base보다 오히려 컸다.** 두 개의 버그였다.

### 1. 폐기 자격과 중단 자격을 혼동했다 (코어)

```ts
const wantsPause = (pass) =>
  shouldYield() && !buildRanUpdateEffects(pass.trace.snapshots);   // ← 틀림
```

DC-18은 **버려도 되는가**에 대한 규칙인데 그것을 **멈춰도 되는가**에 갖다 붙였다.
결과: `updateCallback`이 한 번이라도 발화하면 **그 빌드의 남은 전체가 중단 불가**가 된다.
실제 앱의 갱신은 대부분 여기 해당한다.

게다가 그 검사는 **유닛마다 O(컴포넌트 수)** 스캔이다. 예산 초과 후에는 매 유닛마다
돌므로 10,000행이면 **O(n²)**. 안 멈추는 데다 느리기까지 했다.

**멈추는 것은 언제나 안전하다.** 못 버리는 빌드는 버리는 대신 끝까지 돌리면 된다.
그래서 `wantsPause = () => shouldYield()`로 바꾸고, 추월당한 빌드는 관측 가능한 일을
했으면 **drain**(그 커밋이 노드를 갈아치웠으면 새 노드로 재조준), 아니면 discard 한다.

> 이 버그는 단위 테스트로는 잡히지 않는다. 성립하려면 (a) 컴포넌트가 수천 개이고
> (b) `updateCallback`이 실제로 발화해야 한다. **실브라우저 수행이 아니었으면 그대로
> 나갔을 것이다.**

### 2. 마운트 포함 빌드가 추월당하면 폐기됐다 (코어, E-2)

DC-7의 (B)안 — "마운트를 포함한 빌드는 폐기하지 않고 완주시킨다" — 이 **store 재시도
경로에만 있고 추월 경로에는 없었다.** 10,000개를 마운트하던 빌드가 급한 갱신에 추월당하면
그냥 버려지고 mounter가 다시 돈다. 폐기 조건에 `trace.mounted`를 넣어 고쳤다.

### 3. 데모가 E-1을 항상 실패로 만들었다 (테스트 도구)

두 패널이 각자 `makeRows`를 부르는데 그것이 모듈 전역 카운터를 쓴다 — base는 id 1~10000,
concurrent는 10001~20000. **라벨이 달라 DOM 비교가 무조건 실패했다.** 행 데이터를
한 번 만들어 양쪽에 같은 값을 넘기도록 고쳤다.

### 4. 데모가 E-3·E-6을 공허하게 통과시켰다 (테스트 도구)

빈 리스트에서 돌면 `0 === 0`, `undefined === undefined`가 되어 **아무것도 검증하지 않고
초록색**이 떴다. 이 프로젝트가 세 번이나 경고로 적어둔 실패 모드를, 그 경고를 아는 데모가
그대로 저질렀다. 시나리오가 스스로 행을 채우게 하고, 검증 대상이 없으면 통과 대신
**「측정 불가」**를 띄우도록 고쳤다.

### 그리고 RC-10을 좁혔다

고친 뒤 재수행에서 신규 마운트와 갱신은 예상대로 차이가 났지만, **대량 교체에서는
차이가 없었다.** 계측하니 그 워크로드는 빌드가 2%뿐이다 —
자세한 것과 결정은 REQUIREMENTS §8 "RC-10의 단서".

## Phase 9 — alternate + 폐기/롤백 (D8, D9)

진입: Phase 8 종료. / 종료: RC-8·RC-10 통과.

### 착수 전 정리 (2026-09-01)

**절반은 이미 끝나 있다.** Phase 6이 재시도를 성립시키려고 앞당겨 가져갔다:

| 항목 | 상태 |
|---|---|
| 9-3 훅 스냅샷/롤백 | ✅ Phase 6 (`traceHookState`/`restoreHookState`) |
| 9-4 마운트 포함 단위 마킹 | ✅ Phase 6 (`markBuildMounted`) |
| 9-5 마킹된 단위는 폐기 대신 완주 | ✅ Phase 6 (DC-18, `updateCallback` 발화까지 확장) |

**막고 있는 것은 9-1(`alt`)이고, 원인을 특정했다.**

멈춘 빌드를 버리고 같은 컴포넌트를 새로 빌드하면 터진다:

```
TypeError: Cannot read properties of undefined (reading 'type')
  at addReRenderTypeProperty  ← generalize()가 undefined를 돌려줬다
```

`runUpdate`가 `vDom.reRender()`를 부르는데 그 `vDom`에 **type도 tag도 compKey도
reRender도 없다** — 렌더된 노드가 아니라 빈 껍데기다. 즉 폐기된 빌드가
**원본 트리의 `children`에 정상이 아닌 항목을 남긴다.**

**이것이 Phase 4의 순수성 주장에 뚫린 구멍이다.** "빌드는 원본을 건드리지 않는다"는
D4의 전제인데, `runUpdate`만은 예외다 — `syncResolverProps`/`syncResolverChildren`이
**원본 노드의 `compProps`/`compChild`를 제자리에서 동기화한다.** 그 파일의 주석이
그렇게 하는 이유를 적어두고 있다(공유 참조를 유지해야 조상·클로저가 안 깨진다).
한 번 커밋될 빌드에서는 문제가 없지만, **버려질 수 있는 빌드에서는 원본을 오염시킨다.**

`alt`(D8)가 존재하는 이유가 정확히 이것이다: current와 WIP를 **분리된 두 트리**로 두면
빌드가 current를 만질 일이 없어진다.

> 그러므로 9-1을 먼저 하고, 그 위에서 9-8~9-11을 쓴다. Phase 8이 남긴
> "멈춰 있는 빌드를 sync 렌더가 추월" 미검증 항목도 9-11에서 함께 닫힌다.
> 그때까지 `replaceWDom`은 **멈춘 빌드를 먼저 끝내는** 보수적 정책을 유지한다.

### 추적 결과 — `alt`는 필요 없었다 (2026-09-01)

**위 진단이 틀렸다.** "폐기가 원본 트리를 오염시킨다"까지는 맞았지만, 원인을 잘못 짚었다.

두 번의 실험과 한 번의 추적으로 좁혔다.

**실험 1 — `compProps`/`compChild` 스냅샷/복원.** `runUpdate`가 제자리 동기화하기 직전에
두 값을 기록하고 폐기 시 되돌렸다. **같은 예외가 그대로 났다.** 값이 문제가 아니었다.

**추적 — 실제로 무엇이 새는가.** 폐기 직후 원본 트리를 전부 훑어 resolver를 셌다:

| 측정 지점 | leak |
|---|---:|
| 매 pause (예산 0으로 8회 강제) | **0** |
| 폐기 직전 | **1** — `ul.children[1]` 한 칸 |

**중단만으로는 원본이 오염되지 않는다.** Phase 4의 순수성은 온전했다.
그리고 새는 것은 그래프가 아니라 **한 지점**이었다.

**원인.** 두 스캔이 서로 다른 트리를 보고 있었다. `addComponentProps`가 **빌드 중에**
바깥세상을 이 노드로 돌려놓는다:

```ts
setRedrawAction(compKey, () => replaceWDom(..., wDom));   // 미래의 renew가 실행할 클로저
getComponentSubInfo(compKey, 'vd').value = wDom;          // componentMap이 내주는 라이브 노드
```

그래서 빌드 도중에 도착한 렌더가 **반쯤 지어진 노드**를 대상으로 잡는다 —
그 노드의 `children`에는 아직 resolver가 들어 있는 게 정상이다.
원본이 오염된 게 아니라, **원본이 아닌 것을 원본으로 잡은 것**이다.

Phase 8 전에는 빌드가 항상 한 번에 끝나서 드러날 수 없었다.

**고침.** D4가 다른 모든 부수효과에 적용한 규칙을 여기에도 적용했다 —
**기록해 두었다가 커밋에서 재생한다.** 5줄이다.

`alt`도 DC-7(`compKey`/`props` 분리)도 필요 없었다. 폐기가 그대로 동작한다.

> **교훈**: 예외 스택 하나로 구조 문제라고 결론 내렸던 것이 두 번 다 틀렸다.
> 두 번 다 측정이 바로잡았다 (leak 위치 카운트, pause 대 폐기 대조).

- [x] 9-1. ~~`alt` 포인터로 current ↔ WIP 짝 구성~~ → **불필요.** 실제 원인은
      `addComponentProps`의 빌드 중 발행이었고, 커밋으로 미루는 것으로 해결했다 (위 참조)
- [x] 9-2. **current·WIP가 같은 컴포넌트 인스턴스 클로저를 공유하는지 확인**
      — **수동 E-6이 실증했다 (2026-09-02)**: 폐기를 겪고도 행의 `#인스턴스 번호`가
      `#1`로 유지된다. 그 번호는 mounter 클로저에 있으므로 바뀌면 클로저가 갈아엎힌 것이다
- [x] 9-3. ~~렌더 시작 시 스냅샷, 폐기 시 롤백~~ — Phase 6에서 완료
- [x] 9-4. ~~`resolve()` 호출 여부로 마운트 포함 단위 마킹~~ — Phase 6에서 완료
- [x] 9-5. ~~마킹된 단위는 폐기 대신 완주~~ — Phase 6에서 완료 (DC-18)
- [x] 9-6. BC-2 문서화 (아래 초안)
- [x] 9-7. 기준 테스트 전량 통과 (코어 128개)
- [x] 9-8. 신규 테스트 — RC-8: 폐기 후 재시작 시 `updateCallback` 유실 없음
      (`leaves the hook slots where they were`, 돌연변이로 검증)
- [x] 9-9. 신규 테스트 — RC-8: 중복 실행 없음 (같은 테스트가 **정확히 1회**를 단언한다)
- [x] 9-10. 신규 테스트 — 마운트 포함 단위가 폐기되지 않음
      (`never discards a build that has mounted`, 돌연변이로 검증)
- [x] 9-11. 신규 테스트 — 멈춘 빌드를 sync 렌더가 선점한다
      (`does not swallow a sync render raised from inside it` — 이제 폐기 경로를 탄다.
      Phase 8이 남긴 미검증 항목이 여기서 닫혔다)
- [x] 9-12. 크기 실측 — concurrent br **6,123** / 9,000

### 9-6 BC-2 체인지로그 초안 — **예약했지만 아직 쓰지 않은 완화**

> **BC-2 — "mounter 정확히 1회" → "커밋된 mounter만 유효, 시도는 여러 번 가능"**
> (T2, semver **minor** + 명시)
>
> **오늘 이 완화는 발동하지 않는다.** 스케줄러는 **마운트를 한 빌드를 폐기하지 않는다**
> (DC-7 (B)) — store tearing 재시도 경로와 추월 경로 **양쪽 모두**에서 `trace.mounted`를
> 확인하고, 해당하면 버리는 대신 완주시킨다. 그러므로 `mount`의 mounter 본문은
> **커밋되는 컴포넌트마다 정확히 한 번** 실행된다. 지금까지와 같다.
>
> **그런데 왜 계약을 열어두는가.** 그 보장이 이제 **구조가 아니라 스케줄러 정책**에
> 기대기 때문이다. 지연 시간을 위해 그 정책을 완화하는 순간(예: 마운트 빌드도 폐기 허용)
> mounter 본문은 여러 번 실행될 수 있다. 계약을 나중에 좁히는 것보다 지금 넓혀 두는 편이
> 정직하다.
>
> **영향받는 코드**: mounter 본문에서 **직접** 부수효과를 일으키는 코드
> (fetch 발사, 전역 등록, 카운터 증가 등). `mountCallback`은 커밋에서만 돌므로
> 지금도 앞으로도 안전하다 — **"부수효과는 `mountCallback`에"는 어차피 옳은 조언이었다.**
>
> **어떻게 지켜지는가**: 단위 테스트 `never discards a build that has mounted`
> (돌연변이로 검증 — 조건에서 `trace.mounted`를 빼면 mounter 8개가 돌고 화면엔 2행만 남는다)
> 와 수동 E-2 (살아있는 마운트 = 행 수).


---

# 마무리 단계

## Phase 10 — 테스트 하드닝

진입: 착수한 마지막 단계의 종료. / 종료: 커버리지 공백 0.

- [x] 10-1. 레인 경합 — sync·low가 같은 컴포넌트를 동시 큐잉 (렌더 횟수로 단언)
- [x] 10-2. 중첩 컴포넌트에서 부모·자식이 서로 다른 레인
- [x] 10-3. `portal`·`Fragment`·keyed 리스트 각각 저우선순위 경로 (예산 0으로 강제 중단)
- [x] 10-4. 낡은 큐 항목 가드 — 언마운트된 컴포넌트가 큐에 남은 경우
      (`replaceWDom`의 `il` 가드, `componentMap.get` 실패 경로)
- [x] 10-5. `computed`·`effect`·`cacheUpdate` 상호작용 — `helper/src/tests/laneInteraction.tsx`,
      `test:dual`로 양쪽 코어. `nextTickRender`는 미포함 (아래)
- [x] 10-6. `context` 갱신이 레인을 넘어 전파 (`getParent` 경로) — `laneInteraction.tsx`,
      `test:dual`로 양쪽 코어. `lcontext`는 미포함 (아래)
- [x] 10-7. 엣지: 렌더 중 `deferRender` 중첩 호출
- [x] 10-8. 엣지: 커밋 중 발생한 갱신 요청
- [x] 10-9. 엣지: 파이버 중단 중 컴포넌트 언마운트
- [x] 10-10. **N1 경계 회귀 감시**: 렌더 중 throw가 언와인딩으로 처리되지 **않는지**
      — 일반 예외 / 던져진 Promise가 그대로 나오는지 / 공개 표면에 Suspense형 API 없음

### Phase 10 실측 결과 (2026-09-02)

10개 중 **9개 완료, 1개 부분(10-5의 `nextTickRender` 제외).**

| | 어디에 |
|---|---|
| 10-1·10-2·10-3·10-4·10-7·10-8·10-9·10-10 | `concurrent-hardening.test.tsx` (신규 12개) |
| 10-5·10-6 | `helper/src/tests/laneInteraction.tsx` — `test:dual`로 양쪽 코어 |

코어 스위트 **141개**, helper **43개** (양쪽 코어).

**저우선순위 경로는 예산 0(`setLowLaneBudget(0)`)으로 강제 중단시킨 뒤 확인한다.**
그러지 않으면 jsdom에서 5ms를 넘는 일이 없어 새 경로가 한 번도 실행되지 않는다 —
Phase 8에서 겪은 그대로다.

#### 10-5가 `nextTickRender`를 빼놓은 이유

`computed`·`effect`·`cacheUpdate`는 넣었다. `nextTickRender`는 `nextTick` 의미론에
얹혀 있고 그것은 DC-9/BC-4에서 이미 다뤘으므로(`whenIdle`이 레인 인지 대기다)
여기서 다시 세우는 것이 중복이라 뺐다. 필요해지면 같은 파일에 추가하면 된다.

#### 10-6 — 한 번 실패하고 나서 닫았다

처음 쓴 것은 소비자가 provider를 찾지 못해 **양쪽 코어에서 똑같이 실패**했다.
concurrent 회귀가 아니라 테스트 작성 문제였고, 원인은 하나였다 —
**`render()` 뒤에 `await nextTick()`을 넣지 않았다.** 컨텍스트 해소는 그 틱 뒤에 끝난다.
`helper/src/tests/context.tsx`의 동작하는 형태(모듈 스코프 `createContext`,
wrapper가 상태 소유, `useContext(ctx, renew, [key])`, `ctx.key?.value`, 그리고 그 틱)를
그대로 베끼고 나서 통과했다.

`lcontext`(lmount용)는 넣지 않았다. `context`와 같은 `getParent` 경로를 쓰므로
레인 관점에서 새로 덮이는 것이 없다 — 필요하면 같은 파일에 같은 모양으로 추가하면 된다.

#### 10-1이 스스로 못 잡는 것

`lanes.low.delete`를 지워도 10-1은 통과한다. 낡은 low 항목의 클로저가 sync 커밋이
은퇴시킨 노드를 가리키고 `replaceWDom`의 `il` 가드가 되돌려보내기 때문이다 —
**방어선이 두 겹**이라는 뜻이고, 드롭 자체는 `concurrent-schedulerLane`의 큐 상태
단언이 잡는다. 테스트 주석에 적어 뒀다.

## Phase 11 — 통합 테스트

### Phase 11 진행 상황 (2026-09-02)

11개 중 **7개 완료**(11-1·11-2·11-3·11-5·11-6·11-10·11-11), **4개는 사람 몫**이다.

| 남은 것 | 왜 자동이 아닌가 |
|---|---|
| 11-4 devHelper HMR | 실행 중 모듈 교체다. 스위트는 `test:dual`에서 통과하지만 그것은 바운더리 로직이지 HMR 동작이 아니다 |
| 11-7 `examples`·`lithentDocs` 실행 | 빌드는 `pnpm build`가 하지만 실행·확인은 브라우저다 |
| 11-8 `createLithent` 보일러플레이트 | `npx create-lithent`로 새 프로젝트를 만들어 SSR+hydration까지 |
| 11-9 수동 체크리스트 전량 | 섹션 E는 끝났고 A·B·C·D·F·G가 남았다 |

### 11-6 — 소비자 앱 (`lithentConcurrent/consumer/`)

```bash
pnpm check:consumer        # lithent -> lithent-concurrent
pnpm check:consumer:base   # alias 없음
```

**두 번 다 검사표가 전부 통과해야 11-6이다.** 페이지가 스스로 검사하고 결과를 표로
띄운다 — "화면이 멀쩡해 보인다"가 판정이 되지 않게 했다.

앱이 지키는 조건:

- 모든 import가 **bare specifier**다 (`lithent`, `lithent/helper`). 워크스페이스 패키지로
  등록해 실제 소비자와 같은 해소 경로를 탄다.
- **소스는 한 글자도 바뀌지 않는다.** 바뀌는 것은 vite alias 한 줄뿐이다.
- alias는 **anchored** (`/^lithent$/`)이고 **빌드 산출물**을 가리킨다. 확인해 보면
  `lithent` → concurrent 번들, **`lithent/helper` → base helper 그대로**다 —
  접두사 매칭이었다면 여기가 함께 망가진다 (Phase 0에서 실제로 ssr이 그렇게 깨졌다).

검사 항목: 코어 판별 · `lithent/helper` 서브패스 · keyed 리스트 2,000행 · Fragment ·
portal · store 초기값과 **갱신** · context 초기값과 **갱신** · (concurrent일 때)
`deferRender`가 실제로 미루는지와 `whenIdle` 뒤 반영되는지.

> 초기 렌더만 확인하면 아무것도 증명하지 못하므로 store와 context는 **버튼을 눌러
> 갱신까지** 확인한다. 컨텍스트 해소는 `render()` 다음 틱에 끝나므로 검사 전에
> `await nextTick()`을 한다 — 10-6에서 이것을 빠뜨려 양쪽 코어에서 실패했었다.

#### 결과 (2026-09-02) — 통과

| | 검사 | 결과 |
|---|---|---|
| `check:consumer` | 13개 | **전부 통과** |
| `check:consumer:base` | 10개 | **전부 통과** |

차이는 레인 3항목뿐이다 (`deferRender가 미룬다` · `whenIdle 이 풀린다` ·
`whenIdle 뒤 반영`). 나머지 10개는 **양쪽에서 같은 소스로 같은 결과**다 —
그것이 drop-in이라는 주장의 내용이고, `lithent/helper`가 alias에 휩쓸리지 않는다는
증거이기도 하다.

#### 이 앱이 잡은 것 (2026-09-02)

1차 실행에서 **`deferRender가 미룬다`가 실패했다.** 코어가 아니라 앱이 틀렸다 —
입력창(급한 것)과 무거운 리스트(미룰 것)를 **같은 컴포넌트**에 뒀다. 그러면 급한 renew가
먼저 큐에 들어가고 low renew는 거기 흡수되며(`setRedrawAction`), 급한 렌더가
**이미 동기로 써진** 값을 그대로 그린다. RC-2의 단서 그대로다 —
`deferRender`는 렌더를 미루지 상태를 미루지 않는다.

무거운 쪽을 별도 컴포넌트로 분리해서 고쳤고, **그 지침을 README에 경고 블록으로 넣었다.**
이 API를 쓸 때 가장 흔히 밟을 함정이며, 검사표가 아니었으면 앱이 조용히 "잘 도는 것처럼"
보였을 것이다.

> 그전에 더 기본적인 실수도 있었다 — `index.html`에 `<script type="module">` 태그를
> 넣지 않았다. `/app.tsx`를 curl로 직접 받아 200을 보고 "서빙 정상"이라 판단했고,
> **페이지가 그것을 부르는지는 확인하지 않았다.** 지금은 서빙된 HTML에서 태그를
> 확인한다.

**절반은 이미 자동으로 덮여 있다** — `pnpm verify:concurrent`가 출하 선언 파일로
소비자 파일을 `tsc --strict` 통과시키고, `pnpm test:dual`이 위성 전체를
"`lithent` → concurrent 번들 alias" 상태로 돌린다. 이 앱이 더하는 것은
**실제 앱이 실제 브라우저에서 도는가**다.

진입: Phase 10 종료. / 종료: 릴리스 판정.

- [x] 11-1. `pnpm build && pnpm test` 전량 통과 — 2026-09-02 확인
- [x] 11-2. **RC-9 최종**: `pnpm test:dual` 전량 통과 — 2026-09-02 확인
- [x] 11-3. SSR → hydration 경로에서 스케줄러 동작 — `ssr/src/tests/laneHydration.tsx`,
      `test:dual`로 양쪽 코어. 돌연변이 2종 검증(deferRender 무시 / 노드 재사용 깨기)
- [ ] 11-4. `devHelper` HMR 바운더리가 concurrent 코어에서 동작 — 스위트는 `test:dual`에서
      통과하지만 **HMR 자체는 실행 중 교체라 자동 확인 불가**. 사람 몫 (아래)
      (`componentMap`/`replaceWDom` 직접 호출 경로)
- [x] 11-5. `ftags`·`tag`(HTM) 문법 동일 동작 — `test:dual`에 포함, 전량 통과
- [x] 11-6. 소비자 alias 시나리오 — **통과 (2026-09-02)**. concurrent 13/13, base 10/10 (아래)
- [ ] 11-7. `examples`·`lithentDocs` 빌드·실행
- [ ] 11-8. `createLithent` 보일러플레이트로 신규 프로젝트 → SSR+hydration
- [ ] 11-9. 수동 체크리스트 전량 수행
- [x] 11-10. 최종 크기 실측 + RC-4 판정 — 기본 **4,734**/4,800 (무회귀), concurrent **6,149**/9,000
- [x] 11-11. 체인지로그(BC-1~BC-4) + README — `lithentConcurrent/README.md` 하나에 합쳤다
      - **README·`package.json` description·릴리스 노트는 REQUIREMENTS §2.1을 따른다** —
        `concurrent mode`를 쓰지 않고, "중단 가능한 렌더링"은 RC-10 통과 후에만 서술한다.
        (`package.json`의 description은 2026-09-01에 현재 단계에 맞게 이미 고쳤다.)

---

## 상태 / 핸드오프

- done:
  - Phase 0~11 구성, 각 Phase 진입·종료 조건 및 기준 테스트 배치.
  - **Phase 0 완료 (2026-08-31)** — 0-1~0-11 전부. 순수 포크 상태에서 동작 변경 0을
    바이트 동일성 + 양쪽 테스트 동일 통과 + 크기 8 B 차이로 증명.
  - Phase 0 중 발견된 3건을 DC-10~DC-12로 확정 (DESIGN §D12~D14).
  - **Phase 1 완료 (2026-08-31)** — 1-1~1-10 전부 + 2-3a 선행. 2레인 스케줄러,
    ambient `deferRender`, 5 ms 예산 yield. concurrent br 4,989 / 5,400,
    기본 코어 4,734 무변동, bench 노이즈 범위 (C2 충족).
  - Phase 1 테스트는 **돌연변이로 유효성을 확인**했다 (1차 작성본은 무의미했음).
  - **Phase 2 완료 (2026-08-31)** — `deferred`/`ldeferred`/`hasPendingRender` (신규 서브패스
    `lithent-concurrent/helper`) + 코어 `whenIdle`. DC-13으로 소재 확정, `helper/`는 무변경.
    concurrent 코어 br 5,057 / 5,400. RC-2·RC-3·BC-4 통과, 돌연변이 3종 확인.
  - **Phase 3 자동 항목 완료 (2026-08-31)** — 3-1~3-3 + 산출물 검증(3-3b, 신규).
    섹션 B 수행을 위한 데모 페이지(`pnpm dev:concurrent`)를 만들었다.
    남은 것은 실브라우저 확인(3-4)과 릴리스 판정(3-5) — 둘 다 사람 몫이며 **미완**이다.
  - **Phase 4 완료 (2026-08-31)** — diff 단계가 순수해졌다. 부수효과 6종이 전부
    커밋 이펙트로 옮겨졌고, 폐기 능력(더블 버퍼링)을 테스트로 증명했다.
    이펙트 순서는 DC-14로 확정. concurrent br 5,104 / 6,200.
    **포크가 처음으로 base와 갈라졌다** — 동치성은 이제 4-9 테스트가 지킨다.
  - **API 이름 확정 (2026-09-01, DC-15/DC-16)** — `startTransition` → `deferRender`,
    helper `isPending` → `hasPendingRender`. 코어의 `hasPending(compKey, lane?)`은 불변.
    같은 검토에서 **T1을 기본 `lithent`에 통합하지 않기로 확정**했다 (DC-16) —
    `lithent-concurrent`는 별도 빌드로 남고 P1(`src/` 동결)은 T2까지 유효하다.
    `lithent-concurrent`가 `private: true`라 rename 비용이 0인 지금 처리했다.
    `pnpm test` / `test:dual` / `size` / `verify:concurrent` 전부 통과, `git status src/ helper/`
    비어 있음. concurrent br **5,102** / 6,200 (이름이 짧아져 −2 B), 기본 4,734 무변동.
  - **Phase 5 완료 (2026-09-01)** — 커밋 경계 단일화(BC-1). `render.ts`의 내부 flush 4곳을
    빼고 `wDom.ts`의 `commit()` 1곳으로 모았다. **`render.ts`가 처음 base와 갈라졌다.**
    5-3의 5개 파일은 전부 기대값이 유지됐고, 그 이유를 파일별로 기록했다.
    4-9에는 의도된 차이를 **양쪽 코어를 서로 다른 값에 고정하는** 블록으로 못 박았고
    돌연변이 2종으로 검증했다. concurrent br 5,086 / 6,200 (−16 B), 기본 4,734 무변동.
  - **Phase 6 완료 (2026-09-01)** — store tearing(D6, DC-5). 빌드 시작/커밋 직전 버전 비교,
    불일치 시 폐기·재빌드. 배선은 DC-17(helper→코어 선택적 네임스페이스 호출),
    폐기 자격은 DC-18(관측 가능한 일을 하지 않은 빌드만). Phase 9-3의 훅 슬롯
    스냅샷/복원을 **앞당겨 왔다** — 재시도의 전제 조건이다. `helper/`를 처음 수정했고
    기본 코어에서는 무동작이다. concurrent br 5,433 / 6,200 (+347 B), 기본 4,734 무변동.
    돌연변이 5종 검증.
  - **Phase 7 완료 (2026-09-01)** — `pnpm bench:units` 하네스 신설, 실브라우저 실측.
    **7-3 통과**: 10k행 시나리오 8종이 전 샘플 16ms 초과(p50 18~60ms, 최대 97ms).
    1,000행은 한 건도 넘지 않아 경계가 1k~10k 사이임이 드러났다. C2 유지(두 코어 구별 불가).
    **깊이는 공짜, 너비가 비싸다**(400단 트리 0.2ms) — Phase 8의 yield 입자를 가르는 실측이다.
  - **Phase 8 완료 (2026-09-01, 8-10 제외)** — 재귀를 명시적 스택 순회로 바꾸고
    (DC-19: 노드 포인터 불가 — `WDom`이 동결 코어에 있다) low 레인 빌드가 슬라이스마다
    멈췄다 이어가게 했다 (DC-20: 중단은 low 전용, `nextTick` 계약 때문). 코어 126개 통과,
    concurrent br 5,909 / 9,000. 8-10 실측 결과 처리량 대가가 **+12%p**로 나왔고,
    노드당 할당을 줄여(빌드 단독 −33%) 되돌리는 중이다 — **재확인 1회 필요**.
  - **D16 완료 (2026-09-01)** — `wDomToDom`을 빌드 단계로 옮겼다. 생성 경로의 중단 가능
    비중 **16% → 74%**, 처리량 대가는 노이즈 범위(3차 구현). 부수효과 2종은 커밋의 원래
    자리에서 재생하고, 준비된 형제 엘리먼트를 삽입 앵커로 집는 버그를 `anchorIn`으로
    막았다 (동치성 테스트가 잡았다).
  - **D16 브라우저 확정 (2026-09-01)** — 처리량 중립(1.045). §Phase 8 표 참조.
  - **Phase 9 대부분 완료 (2026-09-01)** — `alt`는 불필요했다. 실제 원인은
    `addComponentProps`가 빌드 중에 컴포넌트를 발행한 것이었고, 커밋으로 미뤄서 해결했다.
    폐기가 동작하며 RC-8(9-8·9-9)과 sync 선점(9-11)이 테스트로 닫혔다.
  - **섹션 E 전 항목 통과 (2026-09-02)** — 수행 중 **코어 버그 2건 + 데모 버그 2건**이
    나왔다 (§"섹션 E가 잡은 것"). 단위 테스트 128개가 전부 통과하는 상태였다.
    그 결과로 **RC-10을 "빌드 단계 비차단"으로 좁혔고**(REQUIREMENTS §8),
    E-6이 **9-2를 실증**했다.
  - **Phase 9 완료 (2026-09-02)** — 9-6(BC-2 체인지로그 초안)과 9-10(마운트 빌드 폐기
    금지 테스트)까지 닫혔다. **BC-2는 예약해 뒀지만 오늘 발동하지 않는다** — 그 보장이
    구조가 아니라 스케줄러 정책(DC-7 (B))에 기대므로 계약은 열어 둔다.
- next: **Phase 10 — 테스트 하드닝 (10-1 ~ 10-10)**.
  - 지금 통과하는 129개는 정상 경로 위주다. 저우선순위 렌더가 portal·Fragment·keyed
    리스트·`context`를 지날 때 어떻게 되는지는 **한 번도 확인하지 않았다.**
  - **10-9(중단 중 언마운트)와 10-6(`getParent` shim 경로)이 특히 새 경로다.**
  - 10-10(N1 경계 회귀 감시)은 지우지 말 것 — 파이버 이후 그 선을 지키는 것이 그 테스트다.
  - Phase 10(하드닝 10개)과 Phase 11(통합 11개)은 그대로 남아 있다.
  - Phase 9가 덮어야 할 것 두 가지가 Phase 8에서 드러났다:
    (a) 멈춘 빌드를 **안전하게 버리는** 방법 — 지금은 반쯤 소비된 상태 때문에 못 버리고
    끝까지 돌린다. (b) 그 경로의 테스트 — jsdom에서 인터리브를 못 만들었다.
  - **아직 "중단 가능"을 주장하지 말 것** (REQUIREMENTS §2.1). RC-10(수동 E-4)이 명명 근거다.
  - 실재하지 않으면 T2 보류하고 근거를 REQUIREMENTS §10에 기록한다(7-4).
  - **판정은 사람 몫이다.** 자동으로 넘길 수 있는 단계가 아니다.
  - 7-3을 통과해 Phase 8에 들어가면 §Phase 8 진입부의 경고를 먼저 읽을 것 —
    Phase 9 전에 "중단 가능"을 주장하지 말 것 (REQUIREMENTS §2.1).
- 미완 (사람 몫): 3-4 수동 체크리스트 A·B·D, 3-5 T1 릴리스 판정(+3-5b 패키지명),
  C 섹션(BC-1 라이프사이클 순서) — **C-6은 이제 수행 가능하다.** 체인지로그 초안이
  §Phase 5에 있다. **7-1~7-3 T2 진입 판정**도 사람 몫이다.
- blockers: 없음.
- 진행 원칙:
  - **`src/`는 수정하지 않는다** (P1). Phase 0에서 `git status src/`가 비어 있음을 확인했다.
  - **Phase 3에서 멈춰도 완결된 결과물이다** (deferRender 완성).
  - **Phase 0의 가드 4종을 지우지 말 것.** alias 함정은 증상이 엉뚱한 곳에서 터진다.
  - **10-10을 유지할 것.** N1 경계는 코드가 아니라 테스트로 지킨다.
  - **스케줄러 테스트는 작성 후 돌연변이로 검증할 것.** 레인 동작은 통과하는 테스트를
    쓰기는 쉽고 *구분하는* 테스트를 쓰기는 어렵다 (Phase 1에서 두 번 겪었다).
  - **위성 테스트 파일에 `.test.`를 붙이지 말 것.** 루트 러너가 수집해서 `@` alias가
    어긋난다. 기존 규약대로 `*.tsx` + `import.meta.vitest`.
  - **`helper/`(기본)에 concurrent 전용 API를 넣지 말 것** (DC-13). 기본 코어에서
    no-op이 되는 API는 거기 있으면 안 된다. `lithentConcurrent/helper/`에 넣는다.
    - Phase 6의 `notifyStoreWrite` 배선은 이 규칙의 예외가 아니다 — **API가 아니라
      내부 통지**이고, 사용자에게 보이는 표면이 늘지 않으며 base에서 무동작이다 (DC-17).
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
