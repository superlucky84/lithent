# IMPLEMENT — Lithent Concurrent 렌더링 (별도 빌드 + 파이버)

- 작성일: 2026-08-28 (최종 수정: 2026-08-28)
- 상태: **Phase 1 완료 (2026-08-31) — Phase 2 착수 가능**
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

## Phase 2 — 값 단위 deferred API + `whenIdle` (D3, D11)

진입: Phase 1 종료. / 종료: RC-2·RC-3 통과, BC-4 완화 확인.

- [ ] 2-1. `helper/src/hook/ldeferred.ts` 신규 (lstate 패턴, setter만 `startTransition`)
- [ ] 2-2. `deferred(value, renew)` — mount 모드용
- [x] 2-3a. 스케줄러 `hasPending(compKey, lane)` 노출 — **Phase 1에서 선행 완료** (위 참조)
- [ ] 2-3b. helper `isPending`으로 감싸기
- [ ] 2-4. 스케줄러 `whenIdle(): Promise<void>` 노출 (DC-9) — **`nextTick` 의미는 변경 금지**
- [ ] 2-5. `helper/src/index.ts` export 추가 (가산적 — 기본 코어에서도 import 가능해야 함)
- [ ] 2-6. 기준 테스트: helper 스위트 양쪽 통과
- [ ] 2-7. 신규 테스트 — RC-2 (저우선순위 렌더 전까지 이전 DOM 유지)
- [ ] 2-8. 신규 테스트 — RC-3 (`isPending` 전이)
- [ ] 2-9. 신규 테스트 — BC-4: `nextTick` 후에는 low 렌더가 미반영, `whenIdle` 후에는 반영
- [ ] 2-10. 크기 실측

## Phase 3 — T1 출하 게이트

진입: Phase 2 종료. / 종료: T1 릴리스 판정.

- [ ] 3-1. RC-4: concurrent ≤ 5,400 B **및 기본 ≤ 4,800 B 무회귀**
- [ ] 3-2. C2: bench 회귀 0
- [ ] 3-3. RC-9: 위성 양쪽 코어 통과
- [ ] 3-4. 수동 체크리스트 A·B·D 수행
- [ ] 3-5. **T1 단독 릴리스 판정** — 여기서 멈춰도 `startTransition`은 완성 상태

---

# 단계 T1.5 — 순수화 + tearing (concurrent br ≤ 6,200)

## Phase 4 — 커밋 이펙트 리스트 (D4)

진입: Phase 3 종료. / 종료: diff 단계에서 DOM·원본 트리 변형 0.

- [ ] 4-1. `CommitEffect` 타입 정의
- [ ] 4-2. `makeNewWDomTree`에 effects 수집기 **인자** 추가 (전역 금지 — 중첩 렌더 오염)
- [ ] 4-3. `diff.ts:81-82` unmount·detach → effect
- [ ] 4-4. `diff.ts:237` `typeDeleteUnused` → `delete` effect
- [ ] 4-5. `diff.ts:57-58` `il`/`delete children` → `retire` effect (**폐기 능력의 핵심**)
- [ ] 4-6. `wDom.ts:155,158` splice·syncAncestor → effect
- [ ] 4-7. `replaceWDom`에 커밋 함수 도입, DESIGN D4 순서대로 실행
- [ ] 4-8. 기준 테스트 — 특히 `core-destroy`, `core-destroyForLoop`, `core-unmount`,
      `core-nestedUnmount`, `core-loopkey`, `core-loopMoveOrder`
- [ ] 4-9. 신규 테스트 — 동치성: effect 리스트 실행 결과가 기본 코어 DOM과 동일
- [ ] 4-10. 신규 테스트 — WIP 폐기 후 원본 트리로 정상 렌더 (**더블 버퍼링 확보 증명**)
- [ ] 4-11. 크기 실측

## Phase 5 — 커밋 경계 단일화 (D5, BC-1)

진입: Phase 4 종료. / 종료: RC-5 통과.

- [ ] 5-1. `render.ts:185, 200, 284, 429`의 `execMountedQueue()` 제거
- [ ] 5-2. 커밋 종료 1곳으로 통합 (`:43` 위치 재정의)
- [ ] 5-3. **기대값 재검토** (통과 여부만 보지 말 것): `core-loopLifecycleOrder`,
      `core-mountreadycallback`, `core-callback`, `core-nestedUnmount`, `core-destroy`
- [ ] 5-4. 변경된 순서 문서화 — BC-1 체인지로그 초안
- [ ] 5-5. 기준 테스트 전량 통과
- [ ] 5-6. 크기 실측

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
- next: **Phase 2 — 값 단위 deferred API + `whenIdle` (D3, D11)**.
  - 2-3a(`hasPending`)는 Phase 1에서 선행 완료. 남은 것은 helper 래핑(2-3b)이다.
  - helper에 추가하는 것은 **가산적**이어야 한다 — 기본 코어에서도 import 가능해야 하고,
    `startTransition`은 concurrent에만 있으므로 helper가 그것을 **정적으로 import하면 안 된다**.
    (기본 코어 사용자의 빌드가 깨진다. 주입/옵셔널 경로를 설계할 것.)
  - `whenIdle`은 low 큐가 빈 시점에 resolve해야 하는데, 지금 `flushLow`는 이월 시
    `scheduleFlush('low')` 후 반환한다. 완료 시점 판정을 그 경로와 함께 넣을 것.
  - `scripts/size-report.js` 예산은 T1.5 진입 시 **6,200**으로.
- blockers: 없음.
- 진행 원칙:
  - **`src/`는 수정하지 않는다** (P1). Phase 0에서 `git status src/`가 비어 있음을 확인했다.
  - **Phase 3에서 멈춰도 완결된 결과물이다** (startTransition 완성).
  - **Phase 0의 가드 4종을 지우지 말 것.** alias 함정은 증상이 엉뚱한 곳에서 터진다.
  - **10-10을 유지할 것.** N1 경계는 코드가 아니라 테스트로 지킨다.
  - **스케줄러 테스트는 작성 후 돌연변이로 검증할 것.** 레인 동작은 통과하는 테스트를
    쓰기는 쉽고 *구분하는* 테스트를 쓰기는 어렵다 (Phase 1에서 두 번 겪었다).
- 검증 명령:
  ```bash
  pnpm build          # core -> concurrent -> 나머지
  pnpm test           # core + concurrent + 위성 + 툴링
  pnpm test:dual      # RC-9: 위성 스위트를 양쪽 코어로 2회
  pnpm size           # RC-4 게이트 (예산 초과 시 exit 1)

  # C2 벤치 — 같은 하니스를 코어만 바꿔 돌린다 (Phase 1에서 전환 가능하게 함)
  node docs/performance-improvement/bench/verify-order.mjs
  node docs/performance-improvement/bench/bench10k.mjs
  LITHENT_CORE=concurrent node docs/performance-improvement/bench/verify-order.mjs
  LITHENT_CORE=concurrent node docs/performance-improvement/bench/bench10k.mjs
  ```
- 기준 커밋: `f3921cc` (설계 기준) / Phase 0: `95ae243` / **Phase 1: `16d9e74`**
