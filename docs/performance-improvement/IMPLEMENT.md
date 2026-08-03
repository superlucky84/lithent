# IMPLEMENT — Lithent 렌더링 성능 개선

- 작성일: 2026-07-27
- 상태: **페이즈 1 진행 중**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [DESIGN.md](./DESIGN.md)

공통 종료 조건 (모든 페이즈): `pnpm build && pnpm test` 전체 통과 +
`bench/bench.mjs`·`bench/bench10k.mjs` 재측정 기록 + min 빌드 brotli 실측 기록.

## Phase 1 — Map 매칭 + 앵커 O(1) (D1, D2, D4)

진입: DC-1 확정 완료. / 종료: swap 제외 전 시나리오 O(n) 스케일링 확인.

- [x] 1-1. `diffLoopChildren` Map 기반 재작성 (`src/diff.ts`) — `findSameKeyOriginalItem`·splice 제거
- [x] 1-2. `chkDiffLoopOrder` O(n) 재작성 (인덱스 Map + 증가 수열 검사, 동작 동일)
  — 페이즈 2에서 LIS로 대체·삭제됨
- [x] 1-3. `typeUpdate` 자식 처리에 역순 앵커 사전계산 도입 (`src/render.ts`)
  — 페이즈 2에서 통합 placement 패스로 대체됨
- [x] 1-4. 앵커 힌트 전달 경로 — 페이즈 2에서 불필요해져 제거 (updateChildren이 직접 배치)
- [x] 1-5. 기준 테스트: 전체 통과 (core 43파일/183테스트 포함, 실패 0)
- [x] 1-6. 벤치 재측정 완료 — swap 제외 전 시나리오 선형화 확인
- [x] 1-7. br 실측 4,317B (+148B) → 페이즈 2 진입 승인

발견/수정: Phase 1의 앵커 사전계산이 리스트 경계를 넘는 다음 형제(예: 리스트 뒤 footer)를
무시해 append가 형제 뒤에 삽입되는 버그 유입 → Phase 2 통합 시
`startFindNextBrotherElement`로 초기 앵커를 잡아 수정. 회귀 방지 테스트는 Phase 4에서 추가.

동작 보존 노트:
- 중복 key 시 기존은 "남은 것 중 첫 번째 매칭", Map은 "첫 등장만 유지" — 중복 key는
  정의되지 않은 사용(문서상 금지)이므로 허용. 테스트로 회귀 없음만 확인.
- diff 단계에서 unused 자식의 `typeDelete`(DOM 제거)가 실행되는 기존 순서 유지.

### 측정 기록 (Phase 1)

| 항목 | before | after P1 |
|---|---|---|
| replace 4k (jsdom) | 878.7ms | 183.6ms |
| append 1k→10k | 3,031ms | 109.9ms |
| partial 1/10 @10k | 700ms | 120ms |
| swap @10k (참고, P2 대상) | 2,719ms | 186.1ms |
| min 빌드 br | 4,169B | 4,317B |

## Phase 2 — LIS 최소 이동 (D3)

진입: Phase 1 br 실측 후 예산 확인. / 종료: swap @10k ≤ 100ms (RC-2).

- [x] 2-1. `getLisPositions`(이진 탐색 LIS) 추가, oldIndex(`oi`)를 D1 매칭에서 기록
- [x] 2-2. `chkDiffLoopOrder` 삭제 — `'L'` 타입은 더 이상 부여되지 않음 (DC-1: 'T' 재활용)
- [x] 2-3. `updateChildren` 통합 알고리즘: LTR 콘텐츠 패스(라이프사이클 순서 보존,
  신규는 생성만) → LIS로 제자리 노드 선별 → RTL placement 패스(신규+비LIS 이동만 삽입).
  꼬리 연속 신규 run은 appendChild fast path (jsdom insertBefore가 O(위치)라 실측 왜곡 +
  실브라우저에도 이득). 이동 없는 경우 placement 스캔 생략.
- [x] 2-4. 정합성 검증: 스크래치 verify-order.mjs — swap/역순/셔플×5/중간삽입/산발삭제/
  clear/재충전 + 리스트 경계(footer) 침범 검사 전부 통과. 전체 테스트 통과.
- [x] 2-5. 벤치 + br 실측 — 아래 표. 예산 내로 LIS 확정 (폴백 불필요).

### 측정 기록 (Phase 2)

| 항목 | 기준선 | after P2 | RC-2 목표 | 판정 |
|---|---:|---:|---:|---|
| swap 2 @10k | 2,719ms | 97.2ms | ≤100ms | ✅ |
| append 1k→10k | 3,031ms | 108.7ms | ≤200ms | ✅ |
| partial 1/10 @10k | 700ms | 128.7ms | ≤300ms | ✅ |
| create 10k | 414ms | 435.7ms | ≤350ms | P3 대상 |
| clear 10k | 90ms | 86.1ms | ≤50ms | P3 대상 |
| min 빌드 br | 4,169B | 4,678B | ≤5,120B | ✅ (여유 442B) |

## Phase 3 — 할당·상수비용 절감 (D5, D6)

진입: DC-2·DC-3·DC-4 결정. / 종료: create/clear 개선 실측 (RC-2: create ≤ 350ms, clear ≤ 50ms).

- [x] 3-1. `getParent` 클로저 공유화 — h()단계(`wDom.ts`)·diff단계 3개소 모두 부모당 1개로
- [x] 3-2. `checkVirtualType` 문자 비교화, `/^on/`·prop 순회를 문자비교+for-in으로
  (render.ts의 `entries`/`keys` 의존 제거)
- [x] 3-3. `hasAccessorMethods` — nodeName+key 캐시 (HTML 대문자/SVG 소문자라 충돌 없음)
- [x] 3-4. clear 일괄 삭제 (DC-4) — `findChildWithRemoveElement`에 bulk fast path.
  주의 2가지: ① 전체 clear는 keyed 경로가 아닌 리스트 'R' 경로로 흐르므로 bulk는
  `typeDeleteUnused`가 아닌 여기 위치해야 함. ② jsdom에서 `parent.childNodes` 접근은
  live NodeList를 만들어 이후 모든 DOM 변형을 느리게 함(벤치 오염) —
  `firstChild`/`nextSibling` 포인터 순회로 카운트할 것.
- [x] 3-5. 전체 테스트 통과 + 벤치 + br 실측 (아래)
- 추가 발견: `wDomChildrenToDom`이 부모 노드마다 중간 DocumentFragment를 생성
  (10k행 create 시 ~4만 개) → 직접 appendChild로 교체, create 433→~300ms.

### 측정 기록 (Phase 3)

| 항목 | after P2 | after P3 | RC-2 목표 | 판정 |
|---|---:|---:|---:|---|
| create 10k | 435.7ms | 283~317ms | ≤350ms | ✅ |
| partial 1/10 @10k | 128.7ms | 85~122ms | ≤300ms | ✅ |
| swap 2 @10k | 97.2ms | 77~108ms (편차 큼) | ≤100ms | 경계 — P5 실브라우저 판정 |
| append 1k→10k | 108.7ms | 90~117ms | ≤200ms | ✅ |
| clear 10k | 86.1ms | 정상상태 62~66ms (cold 86~99) | ≤50ms | 미달 — 프로파일상 GC 21%+jsdom 해체 비용 지배, 알고리즘 여지 없음 → P5 실브라우저 판정으로 이관 |
| min 빌드 br | 4,678B | 4,797B | ≤5,120B | ✅ (여유 323B) |

### 코드 골프 패스 (Phase 3 후속, 동작 불변)

- `insertBefore(el, anchor || null)`로 append/insert 분기 통합, `getElementFromFragment`의
  내장 virtual 체크 활용, hasLeftNew 루프 → 생성 카운터, clearDiffMeta 일괄화,
  `updateProps` 중복 비교 제거, `[1,3].includes` → 직접 비교.
- 죽은 코드 제거: `'L'` RenderType은 chkDiffLoopOrder 삭제 후 부여처가 없어져
  타입·핸들러·분기(`typeSortedUpdate`/`typeAdd`) 전부 제거.
- 결과: min gzip 5,205→5,133B(−72B), br 4,797→**4,734B**(−63B, 예산 여유 386B).
  전체 테스트·정합성·벤치 회귀 없음 (swap 83ms, append 94ms, partial 96ms, create 301ms).

## Phase 4 — 테스트 하드닝

- [x] 4-1. `src/tests/core-loopMoveOrder.tsx` — 원거리 swap, 역순, 셔플+삽입/삭제 혼합,
  append, prepend/중간삽입, 전체 clear, 재충전 (8 케이스)
- [x] 4-2. 경계 테스트 — 리스트 뒤 형제(`li.tail`) 침범 검증을 모든 케이스에 포함
  (Phase 1에서 유입됐던 경계 버그의 회귀 방지). 중복 key는 정의되지 않은 사용으로 제외.
- [x] 4-3. `src/tests/core-loopLifecycleOrder.tsx` — 초기/삽입 mount LTR 순서,
  이동 시 재마운트 없음, 삭제 시 unmount 순서 (4 케이스)
- [x] 4-4. 전체 통과: core 45파일/195테스트 (신규 12개 포함)

## Phase 5 — 통합 검증 (실브라우저)

- [ ] 5-1. js-framework-benchmark 하네스에 lithent keyed 구현 작성 (로컬 실행)
- [ ] 5-2. keyed 시나리오 측정 → react·preact와 비교표 작성
- [ ] 5-3. RC-2 달성 판정 및 REQUIREMENTS.md 상태 갱신
- [ ] 5-4. MANUAL_TEST_CHECKLIST.md 작성 및 수행

## 상태 / 핸드오프

- done: Phase 1~4 완료. keyed diff Map+LIS(oi 기록→`updateChildren` 통합 배치),
  클로저 공유·for-in·accessor 캐시·DF 제거·clear bulk. 전체 195테스트 통과,
  br 4,797B(예산 내). 회귀 테스트 12개 추가. MANUAL_TEST_CHECKLIST.md 작성.
- next: Phase 5 — js-framework-benchmark 하네스 실브라우저 측정 (5-1~5-4),
  swap·clear 최종 판정. 이후 문서·코드 커밋.
- blockers: 없음. (jsdom 벤치의 swap 편차·clear 미달은 실브라우저 판정으로 이관)
- commit: (커밋 전 — 작업 트리에 src/diff.ts, src/render.ts, src/wDom.ts,
  src/types/index.ts, src/utils/predicator.ts, src/tests/ 신규 2파일, docs/ 변경 있음)
