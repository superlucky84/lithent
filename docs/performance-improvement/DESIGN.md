# DESIGN — Lithent 렌더링 성능 개선

- 작성일: 2026-07-27
- 상태: **초안 — DC-1~DC-4 결정 대기 (구현 착수 전 확정)**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [BOTTLENECK_ANALYSIS.md](./BOTTLENECK_ANALYSIS.md)

## 1. 설계 원칙

- P1. **2-pass 구조 유지**: diff(`makeNewWDomTree` → `nr` 마킹) / render(`wDomUpdate` → 실행)
  분리를 바꾸지 않는다. 알고리즘 교체는 각 pass 내부에서만 일어난다 (REQUIREMENTS N3).
- P2. **참조 안정성 유지 (C2)**: WDom의 `props`/`children` 배열 인스턴스는 조상·클로저가
  공유하므로 교체가 아닌 in-place 뮤테이션으로만 동기화한다 (`src/diff.ts:184-190`).
- P3. **계약 보존**: 새 노드의 `el` 상속, `nr`/`oc`/`op` short-key 규약, unmount 큐 실행
  시점, microtask 배칭을 기존과 동일하게 유지한다.
- P4. **크기 게이트**: 각 페이즈 종료 시 min 빌드 brotli를 실측하고, 예산(5,120B br)
  초과가 예상되면 다음 페이즈 진입 전에 설계를 재검토한다.

## 2. 채택 알고리즘 (확정)

**Vue3 조합 = Map 기반 키 매칭 + LIS 기반 최소 이동** (2026-07-27 사용자 결정)

- 매칭: 이전 자식들로 `Map<key, {node, index}>`를 1회 구축(O(n)), 새 자식마다 O(1) 조회.
- 이동: 매칭된 자식들의 oldIndex 수열에서 LIS(최장 증가 부분 수열)를 O(n log n)으로
  계산, LIS에 속한 노드는 제자리 유지, 나머지만 `insertBefore`로 이동.
- 폴백: 페이즈 1 크기 실측 후 LIS 예산 초과 시 React식 lastPlacedIndex 휴리스틱
  (+200~300B)으로 후퇴 가능하도록 이동 로직을 단일 함수로 격리한다.

## 3. 상세 설계

### D1. keyed 매칭 Map화 — B3 해결 (`src/diff.ts`)

`diffLoopChildren` 재작성:

1. `origCh`로 `Map<key, WDom>` + oldIndex 기록을 1회 구축. 중복 key는 첫 항목 우선
   (현행 `find` 동작과 동일 — 동작 보존).
2. 새 자식 순회: Map 조회로 짝을 찾고 `makeNewWDomTree(item, orig)` 호출(기존과 동일).
   사용된 항목은 Map에서 `delete` (splice 제거 폐지 — O(1)).
3. 순회 후 Map에 남은 항목 = `unUsedChildren` (기존 unmount/이벤트 해제 경로 그대로).
4. 각 새 자식에 매칭된 oldIndex를 임시 필드로 기록 → D3의 LIS 입력.
   (short-key, diff 종료 시 삭제 — `nr`/`oc`와 동일한 수명 관리)

`el` 상속, `runUpdate` in-place 동기화(P2), `getParent` 연결은 기존 코드 경로를 그대로
지나므로 변경 없음.

### D2. chkDiffLoopOrder 제거 — B4 해결 (`src/diff.ts:137-162`)

- 함수 전체 삭제. "순서가 같은가"라는 사전 판정 자체가 불필요해진다 —
  D3의 LIS가 "순서가 같으면 이동 0개"라는 사실을 자연스럽게 도출하기 때문.
- `'L'` RenderType의 의미 재정의 필요 → **DC-1**.

### D3. LIS 기반 최소 이동 — B1 해결 (`src/diff.ts` 계산, `src/render.ts` 실행)

- diff 단계: D1이 기록한 oldIndex 수열로 LIS 계산 (Vue3 `getSequence` 방식,
  이진 탐색 + predecessor 역추적, ~40줄). LIS 밖의 노드에만 이동 마크.
- render 단계: 리스트 자식을 **역순 순회**하며 `anchor`(다음 실제 DOM 엘리먼트)를
  로컬 변수로 전달. 이동 마크 노드만 `insertBefore(el, anchor)`, 나머지는 anchor 갱신만.
- 신규 노드(`A`)도 같은 역순 순회에서 anchor를 재사용 → D4와 자연 통합.
- 이동 마킹 방식(새 `nr` 코드 vs 기존 `T` 재활용) → **DC-1**.

### D4. 삽입 앵커 O(1)화 — B2 해결 (`src/render.ts:195-239`)

- 리스트 경로: D3의 역순 순회 anchor로 대체 — `startFindNextBrotherElement` 호출 자체가
  사라진다 (`indexOf`/`slice`/재귀 스캔 제거).
- 비리스트 경로(Fragment 혼합, 단일 `A` 노드 등): `startFindNextBrotherElement`를
  유지하되 `indexOf` → 부모가 자식 순회 시 인덱스를 인자로 전달, `slice` 복사 제거
  (인덱스 기반 순회로 대체). Fragment/portal 재귀 탐색 로직은 동작 보존.

### D5. 할당 절감 — B5 해결 (`src/wDom.ts:204-210`, `src/diff.ts:246-292`)

- `getParent: () => nodeParentPointer.value` 노드별 클로저 → 같은 부모의 자식들이
  **하나의 클로저를 공유** (부모당 1개 생성, 자식들은 같은 참조 할당).
  `getParent()` 함수 인터페이스는 유지되므로 호출부 변경 없음 → 리스크 최소.
  필드 직접 참조(`parent` 필드)로의 전환 여부 → **DC-2**.
- diff 단계 `assign(x, { getParent })` → 직접 대입으로 교체 (함수 호출/객체 리터럴 제거).
- 무변경 노드 조기 종료: 같은 text·같은 props 참조인 노드의 하위 재귀 생략 여부 → **DC-3**.

### D6. 상수비용 제거 — B6 해결

| 대상 | 현재 | 변경 |
|---|---|---|
| `checkVirtualType` (`predicator.ts:96`) | `['f','l'].includes(type)` — 호출마다 배열 할당 | `type === 'f' \|\| type === 'l'` |
| 이벤트 키 판별 (`render.ts:270,343,367`) | `/^on/` 정규식 | `key[0]==='o' && key[1]==='n'` 문자 비교 |
| `hasAccessorMethods` (`predicator.ts:131`) | prop마다 `getOwnPropertyDescriptor` | `Map<tagName+key, boolean>` 캐시 |
| prop 순회 (`render.ts:337,391`) | `Object.entries`/`keys` 배열 생성 | `for-in` 루프 |
| clear (전량 삭제) | 행마다 `removeChild` + 이벤트 재귀 해제 | 리스트 자식 전부 `D`일 때 부모 일괄 삭제 → **DC-4** |

## 4. 페이즈 구성 (IMPLEMENT.md에서 상세화)

| 페이즈 | 내용 | 종료 게이트 |
|---|---|---|
| 1 | D1 + D2 + D4 (Map 매칭, 앵커 개선) | 벤치: replace/append/partial O(n) 확인, 테스트 통과, **br 실측** |
| 2 | D3 (LIS) — 페이즈 1 크기 실측 후 진입 | 벤치: swap @10k 선형화, br ≤ 5,120B |
| 3 | D5 + D6 (상수비용) | create/clear 개선 실측, br 재확인 |
| 4 | 테스트 하드닝 (keyed 이동/정렬/Fragment 혼합 커버리지 보강) | 신규 테스트 통과 |
| 5 | 통합 검증 (실브라우저 jsfb 하네스, RC-2 수치 판정) | RC-2 달성 여부 보고 |

## 5. RC-2 수치 목표 제안 (jsdom @10k, 기준선 → 목표)

| 시나리오 | 기준선 | 제안 목표 |
|---|------:|------:|
| swap 2 rows | 2,719ms | **≤ 100ms** |
| append 1,000 | 3,031ms | **≤ 200ms** |
| partial update (1/10) | 700ms | **≤ 300ms** |
| create 10,000 | 414ms | **≤ 350ms** |
| clear 10,000 | 90ms | **≤ 50ms** |

> 근거: O(n²) 제거 시 각 시나리오는 create(O(n), 414ms)보다 가벼운 작업이 된다.
> 실브라우저 최종 판정은 jsfb 하네스의 vanilla 대비 배율로 별도 확인 (1차: react 수준).

## 6. 검증 매핑

- D1/D2/D3 → 기존 keyed 테스트 + 페이즈 4 신규 테스트(swap/역순/부분삭제+삽입 혼합,
  Fragment 자식 혼합, 중복 key), `bench/bench.mjs` 스케일링 재측정.
- D4 → Fragment/portal 삽입 테스트 (기존 스위트) + append 벤치.
- D5 → 전체 테스트 (getParent 의존 경로: `syncAncestorComponentChildren`,
  `findRealParentElement`, `getElementFromFragment`).
- D6 → 전체 테스트 + create/clear 벤치. accessor 캐시는 SVG/input 경로 테스트 필수.
- 크기 → 페이즈 1~3 각각 `min 빌드 br` 실측 기록 (IMPLEMENT.md).

## 7. 열린 결정 (Design Checklist)

- [x] **DC-1**: 이동 마킹 — **기존 `'T'` 재활용, 새 `nr` 코드 추가 안 함**.
  근거: 새 상수는 render 핸들러 맵·타입 정의까지 연쇄 증가시켜 번들 크기에 불리
  (2026-07-27 사용자 결정). LIS 밖 노드 = `'T'`(이동), LIS 안 노드 = `'U'`(제자리).
- [x] **DC-2**: getParent — **클로저 공유안 채택** (부모당 1개, 호출부 무변경).
  `parent` 필드 직접 참조는 호출부 전면 수정 + 순환 참조 리스크 대비 이득이
  불분명해 보류. (2026-08-03)
- [x] **DC-3**: 무변경 노드 조기 종료 — **미도입**. Phase 3 완료 시점에 partial
  85~122ms로 목표(≤300ms) 대비 충분, 얕은 비교 추가는 코드 증가 대비 이득 불확실.
  (2026-08-03)
- [x] **DC-4**: clear 일괄 삭제 — **도입**. 위치는 `findChildWithRemoveElement`
  (전체 clear는 리스트 'R' 경로로 흐르므로). 안전 조건: 부모의 실제 자식 수 ==
  삭제 대상 수 && 전부 element/text && portal/HTML 아님. unmount·이벤트 해제는
  기존 순서 그대로 선행 실행. (2026-08-03)

## 8. 리스크

- R1. LIS 실행 경로에서 `el` 없는 노드(Fragment/빈 노드)가 리스트 자식에 섞이면 anchor
  계산이 복잡해진다 — `getElementFromFragment` 경로와의 통합 테스트 필수 (페이즈 4).
- R2. D5의 클로저 공유는 `nodeParentPointer.value`가 노드 생성 후에 채워지는 현재 순서에
  의존 — 초기화 순서 회귀 테스트 필요.
- R3. jsdom과 실브라우저의 DOM 조작 비용 비율이 달라 페이즈 5에서 순위가 재편될 수
  있음 — RC-2 최종 판정은 실브라우저 기준.

## 9. 상태 / 핸드오프

- done: 알고리즘 확정(Map+LIS), D1~D6 상세 설계, 페이즈 구성, RC-2 수치 제안.
- next: DC-1~DC-4 결정(DC-1은 페이즈 1 착수 전 필수) → IMPLEMENT.md 작성 → 페이즈 1.
- blockers: DC-1 (구현 착수 전 확정 필요, 나머지는 해당 페이즈 전까지 유예 가능).
- commit: (문서 커밋 전)
