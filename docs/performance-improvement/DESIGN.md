# DESIGN — 변경 범위의 근거를 보존하는 코어 최적화

- 기준일: 2026-10-21. 상태: **Phase 1 완료, 다음은 C1 한정 프로토타입. 저장·유지 방식 확정 전이며 채택 구현 없음**.
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [IMPLEMENT](./IMPLEMENT.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 과거 Map/LIS 설계는 [역사 문서](./history/2026-07-map-lis/DESIGN.md)다. 현재 코어에 이미 있는 Map/LIS를 새 최적화로 제안하지 않는다.

## 1. 실제 경로와 정보의 한계

원래 앱의 선택·부분 갱신은 Table의 `renew` → `rows.map(row.view)` → `cacheUpdate` 의존 배열 검사 → `diffLoopChildren`의 이전 key Map/전체 매칭/미사용 삭제 검사 → `updateChildren`의 목록 처리로 흐른다. 캐시 적중이 하위 재귀를 줄여도 행별 입구와 목록 처리가 남는다.

행별 `renew`는 Table 전체 재실행을 피하지만 [replaceWDom](../../src/wDom.ts)의 부모 `children.indexOf(originalWDom)`와 `syncAncestorComponentChildren`의 조상 slot 배열 `indexOf`를 수행한다. 따라서 현재 행 선택을 엄밀한 O(1)로 설명할 수 없다. 행 컴포넌트 수만큼 wrapper·hook 상태·갱신 함수·수명 정리도 생긴다.

코어가 새 children 배열을 받는 일반 경로에서 변경 범위는 알려져 있지 않다. 동일 길이·같은 props 참조·같은 VDOM 객체만으로 전체 처리를 안전하게 생략할 수 없다. 기존 empty 전환, 다른 위치 재사용, mutable props, slots, update callback과 자식 자체 갱신 계약을 먼저 적용해야 한다.

## 2. 후보 묶음과 우선순위

Phase 1의 비용 분해로 **C1 한정 프로토타입을 다음 작업**, C2를 보류로 정했다. C3/C4는 기존 정보로 얻을 수 없는 이득을 위한 **조건부 설계**다. 네 후보를 모두 구현하는 계획이 아니며, 한 번에 하나씩 기준선과 비교한다.

| 후보                                               | 줄이려는 작업                                                    | 필요한 정보                                                  | 한계와 진입 조건                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **C1. 컴포넌트의 부모 위치 연결 개선**             | 자체 renew마다 부모/조상 배열에서 이전 노드를 찾는 비용          | 현재 live component, 소유 부모, 검증 가능한 위치             | 원래 Table-only 앱의 주요 비용을 해결하지 않음. 행별/일반 자식 갱신에서 검색 작업량이 확인될 때 구현             |
| **C2. 순서 유지 keyed 목록의 대조·배치 경로**      | Map get/delete, used 배열/삭제 filter, 불필요한 위치 계획의 중복 | 같은 구성·순서이며 기존 key 소비 규칙과 같은 매칭이라는 증명 | 진입 검사 자체는 O(n). 1,000행 방문 제거라고 주장하지 않음. 기존 ordered 할당 실험과 달라지는 작업을 먼저 수치화 |
| **C3. 명시적 컴포넌트 부모 갱신 생략 계약**        | 부모 구조 갱신 때 이미 유지되는 자식 updater 재실행              | 사용자가 선언한 출력 의존성/무효화와 코어의 현재 인스턴스    | 새 옵트인 또는 기존 계약 확장 여부 TBD. 행 컴포넌트 생성·메모리 비용이 남음                                      |
| **C4. 구조 변경과 항목 변경을 분리하는 목록 계약** | 리스트가 불변일 때 전체 key 대조·변경 행 탐색                    | 모든 구조 변경을 포착하는 소유권과 명시적 변경 항목          | 가장 큰 구조 변경. 임의 mutable 배열에 자동 적용 불가. C1~C3의 한계와 일반 사용 사례가 입증된 경우에만 구체화    |

[Phase 1 보고서](../benchmark/STRUCTURAL_BASELINE_RESULTS.md)의 분기 근거:

- C1: targeted의 n=10,000·k=1,000 자체 갱신에서 부모 검색 방문 추정 4,996,000회, 일반 nested 예제에서 부모 4,996,000회·slot 4,997,000회였다. nested 말미 한 항목 갱신은 diff 5회에 부모 n·slot n+1회다. 첫 위치 위주의 선택만으로 일반 갱신을 O(1)이라 설명할 수 없다. 일반 예제에서 같은 검색 경로를 확인했으므로 한정 프로토타입의 근거가 있다. 이는 검색 시간 비중이나 공식 속도 이득의 증명이 아니다.
- C2: 원래 same-order 목록의 Map set/get/delete·미사용 검사·위치 계획·콘텐츠 방문은 각각 n회이며, 별도 uniqueness shadow 검사도 n쌍 방문·2n key 읽기·Set has/add 각 n회다. 제거 가능한 중복 작업은 있지만 진입 검사 후에도 O(n)이 남는다. 실제 대체 구현의 시간 비용을 재지 않았으므로 시간상 기각하지 않고 우선 보류한다.
- C3: targeted의 변경 없는 parent-refresh에서 n=1,000/10,000에 updater 1,001/10,001회였다. 부모 기인 재실행 생략의 필요 근거로 보존하며, C1의 효과와 섞지 않고 DC-4에서 별도 계약을 연구한다.

### C1 — 검증 가능한 부모 위치

대상은 `src/wDom.ts`의 `replaceWDom`/조상 동기화, 부모 연결을 만드는 `src/diff.ts`·`src/wDom.ts`, 대응 `lithentConcurrent/src/wDom.ts`다.

- 소유 부모와 위치를 컴포넌트 메타데이터 또는 별도 연결에 저장하는 안을 비교한다. 모든 WDom에 무조건 필드를 추가하는 안과 컴포넌트에만 추가하는 안의 생성·메모리·번들 비용을 먼저 산정한다.
- Phase 1 이후에는 **컴포넌트 소유의 위치 hint**를 우선 검토한다. 부모 children과 각 조상 compChild의 현재 배열 참조·index를 독립적으로 검증하는 모델이다. 정확한 저장 위치와 field/sidecar 선택, 최초 생성·구조 변경 때 유지 비용, concurrent publication은 DC-6을 닫기 전에 산정한다. 모든 WDom의 고정 비용을 먼저 늘리거나 전체 목록 hint 재작성 비용을 감추지 않는다.
- 위치는 반드시 `parent.children[index] === originalWDom`으로 확인한다. 맞지 않으면 기존 검색으로 돌아가고 위치를 갱신한다. 키만으로 위치를 인정하지 않는다. 삭제·교환·prepend·reparent 후 낡은 위치가 다른 노드를 덮어쓰면 안 된다.
- 조상 `compChild`는 부모 `children`과 별도 배열이다. 하나의 인덱스로 둘을 대체하지 않는다. 각 참조 안정성과 슬롯 전달을 보존한다.
- concurrent에서는 미완료 work-in-progress가 현재 연결을 바꾸지 않는다. 연결 publication 시점은 commit 또는 기존 안전한 동기화 지점이어야 한다. 폐기 작업은 새 연결을 남기지 않는다.
- **가설:** 갱신 위치가 안정적인 컴포넌트 목록에서 반복 검색을 줄일 수 있다. 조상 탐색·배열 이동·인덱스 유지 비용이 남으므로 전체 갱신 O(1)은 약속하지 않는다.

검증: M-3·M-4·M-6, `core-parentChildSync`, `core-mixedComponentUpdate`, `core-composedRenew`, `core-removedRedraw`, `core-cachedIdentity` 및 concurrent 폐기/commit 동등성 테스트. 별도의 비벤치마크 예제로 nested slots 안의 여러 입력 필드를 갱신한다.

### C2 — 순서 유지의 증명과 fallback

대상은 `src/diff.ts:diffLoopChildren`, `src/render.ts:updateChildren`, 대응 concurrent diff/render다. 배열 할당 시점만 미루던 ordered 후보와 달리 **대조 결과를 다음 단계가 재검사하지 않도록 전달할 수 있는지** 검토한다.

1. fast path 판정이 실패해도 아직 lifecycle·DOM·원본 메타데이터를 변경하지 않은 상태여야 한다. 안전한 사전 검사 후 기존 일반 경로로 fallback한다.
2. 길이와 위치별 키 동일성만으로는 중복 키의 첫 등장 소비를 보장하지 못한다. unique keyed 전용 진입을 선택한다면 uniqueness를 어떻게 증명할지 명시한다. 매번 Set으로 검사하는 비용과 이전 commit에서 유지한 정보의 검증/무효화 비용을 비교한다.
3. 비교는 현재 Map의 SameValueZero 의미(NaN 포함), falsy·Symbol·object 키를 유지한다. unkeyed/null/중복/키 변경 또는 증명할 수 없는 재사용은 일반 경로로 보낸다. 관측 가능한 키 접근을 추가하는 경우도 기존 동작과 대조한다.
4. same key여도 tag/type·empty·component resolver가 바뀌면 기존 diff와 생명주기를 수행한다. 같은 행 위치가 하위 DOM 불변을 뜻하지 않는다.
5. 위치 메타데이터 생략 여부는 render의 Fragment/portal/신규·교체 앵커 계약까지 증명한 뒤 정한다. 콘텐츠는 기존 좌→우 순서로 처리한다. 구조가 바뀌면 현행 LIS/배치 경로를 사용한다.

**가설:** 목록 전체의 O(n) 검사는 남지만 중복 처리·할당을 줄일 수 있다. Set/버전 관리가 더 비쌀 수도 있다. 진입 검증과 실패 경로를 포함한 카운터·공식 전체 시간이 개선되어야 의미가 있다.

검증: M-3·M-5, `core-keyedConsumption`, `core-loopMoveOrder`, `core-loopLifecycleOrder`, `core-structuralRegressions`, `core-renderFuzz`, cache identity. 같은 순서의 중복 키와 첫 위치만 바뀐 목록을 별도 회귀 사례로 추가한다.

### C3 — 부모 갱신과 자식 자체 갱신의 분리

현재 retained-row 앱은 공개 export `getComponentSubInfo(key, 'vd')`로 코어의 **현재 live VDOM**을 읽는다. 이를 고수준 범용 계약으로 제공할지, 기존 API 조합으로 충분한지는 미결정이다. 단순 props 참조 비교나 전역 동일 VDOM 조기 반환을 기본 동작에 넣지 않는다.

후보 계약의 필수 조건은 다음과 같다. API 이름·인자·패키지 위치는 DC-4에서 확정한다.

- 생략은 명시적으로 참여한 컴포넌트의 부모 기인 갱신에만 적용한다. 기존 컴포넌트의 updater·`updateCallback` 횟수를 바꾸지 않는다.
- 출력 의존성은 비교 전 저장된 값/스냅샷 또는 명시적인 무효화 토큰으로 판단한다. in-place props 동기화 뒤 old/new가 같은 객체라는 이유로 생략하지 않는다. 빠뜨린 외부 상태의 책임과 사용 제약을 문서화한다.
- props 삭제·children/slots 변경·생성자/key 변경은 기본적으로 무효화한다. mutable children을 신뢰하려면 별도의 소유권 계약이 필요하다.
- 자체 `renew`는 부모 캐시 적중으로 삼켜지지 않는다. 자식의 갱신 결과가 현재 인스턴스로 연결되고 다음 부모 갱신에도 유지되어야 한다.
- 부모·자식이 한 microtask에 갱신되거나 이동/삭제되는 경우의 결과와 callback 순서를 정의한다. 정확한 중복 갱신 합치기 정책은 기존 동작을 먼저 계측한 뒤 결정한다. 새 옵트인에서 updater/callback을 생략한다면 명시적 새 의미이며 기존 기본 규칙과 혼동하지 않는다.
- 캐시는 컴포넌트 소유이며 unmount/실패한 초기화/폐기된 concurrent 작업 뒤 오래된 subtree나 listeners를 붙잡지 않는다. 다른 위치의 동일 설명은 독립 인스턴스다.

기존 [createRetainedView](../../helper/src/lifecycle/retainedView.ts)는 독립 host의 show/hide/dispose, [useRenderBoundary](../../helper/src/lifecycle/renderBoundary.ts)는 concurrent 자식 갱신 pause/resume를 제공한다. 둘은 행의 부모 재실행 memo와 목적이 다르다. 이름을 재사용하거나 숨김/freeze 의미를 암묵적으로 바꾸지 않는다. 수명 정리·capability 연결의 검증 사례는 참고하되 그대로 대체 API로 채택하지 않는다.

검증: M-4·M-6, cached identity의 기존 callback 계약, 새 옵트인 전용 상태 전이 테스트, 부모와 자식 갱신 양방향 순서, paused boundary에서 변경 후 resume, dispose 중 queued renew. 앱 비교는 행 컴포넌트 구조를 고정하고 경계 유무만 바꾼 대조를 포함한다.

### C4 — 목록의 변경 정보가 필요한 경우

부모가 재생성한 불투명 배열만으로 전체 순회를 없앨 수 없다는 한계가 남으면, 항목 identity와 구조 version/변경 항목을 함께 소유하는 계약을 검토한다. 이는 아직 API 제안 초안 이전의 설계 분기다.

- 일반 항목 변경과 삽입·삭제·정렬을 구분하는 정보 생산자를 정한다. 외부 배열 mutation을 모두 가로채지 못하면 구조 불변을 보장한다고 말하지 않는다.
- 구조가 그대로라면 알려진 변경 항목에만 갱신을 전달하고, 구조 변경 시 일반 keyed reconciliation으로 돌아가는 모델을 검토한다. 변경 item을 찾는 자체 비용도 포함한다.
- 경계/항목당 메타데이터가 행별 컴포넌트보다 실제로 가벼운지 측정한다. API를 쓰지 않는 앱에 고정 비용을 부과하지 않는 방식을 우선 검토한다.
- 일반적인 편집 목록·대시보드 등 별도 예제로 유용성을 입증한다. benchmark 특유의 store를 라이브러리에 숨겨 이득을 만들지 않는다.

진입 전에 DC-5로 소유권, 무효화 누락의 처리, fallback, disposal, concurrent publication, API/크기 비용을 구체화한다. 정의가 불완전하면 C4는 계속 연구 후보이며 구현 완료 체크를 하지 않는다.

## 3. 모듈 책임과 경계

| 모듈                                                                           | 역할                                         | 변경 시 검증                                                                |
| ------------------------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------- |
| `src/diff.ts`, `src/render.ts`                                                 | keyed 매칭, 변경 판정, DOM 배치와 수명 순서  | C2, 중복 키·empty·Fragment·portal·정체성                                    |
| `src/wDom.ts`, `src/utils/redraw.ts`                                           | live 노드 교체, 부모/slot 참조, 갱신 큐      | C1/C3, stale renew·같은 task 순서·예외 복구                                 |
| `src/utils/universalRef.ts`, `src/types/index.ts`, `src/index.ts`              | 컴포넌트 상태·타입·공개 export               | 새 상태 크기/회수, 기존 타입/exports 호환                                   |
| `lithentConcurrent/src/{diff,render,wDom}.ts`, `scheduler.ts`, `renderGate.ts` | 재개 가능한 작업, commit, priority, boundary | 동작 공유 검증 + 폐기/중단/재시작. base 알고리즘을 기계적으로 이식하지 않음 |
| `helper/src/hook/cacheUpdate.ts`, `helper/src/lifecycle/*`                     | 기존 캐시·수명 기능                          | 필요성을 입증한 경우만 수정, 기존 helper 계약과 이름 보존                   |
| `src/tests`, `lithentConcurrent/src/tests`, `e2e`                              | 공통 정합성과 브라우저 수명 검증             | 공유 core spec를 두 코어로 실행, browser에서 실제 DOM identity/잔류 확인    |
| `docs/benchmark`의 러너·새 실험 폴더                                           | 독립 staging, 공식 측정·증거                 | 원본 수정 금지, manifest·표본·실패 배치 보존                                |

## 4. 성능 증명과 상쇄 비용

계측 build와 production build를 분리한다. 진단 카운터는 row/cache 검사, key Map/Set 작업, diff 호출, 컴포넌트 updater, 부모·slot 검색 방문 수, 위치 계획, DOM mutation을 분리한다. 1k/10k 및 변경 행 수를 바꿔 **n 전체 탐색인지 k 변경 범위인지** 확인하되 진단 시간을 공식 점수로 사용하지 않는다.

Phase 1에서는 다음 기준으로 카운터의 의미와 시나리오를 기록한다. 현재 제거 가능한 작업과 후보가 추가할 작업을 구분하며, 아직 구현하지 않은 후보의 예상 비용을 실측으로 표시하지 않는다.

| 측정 경계                | 기록할 작업                                                                                    | 진입 판단에 사용하는 근거                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 원래 Table 갱신          | Table/행 updater, row view, cache 호출·deps 검사·hit/miss, diff 호출                           | 전체 n개 방문과 실제 변경 k개의 분리                               |
| keyed 대조·배치          | 이전 key Map 생성·set/get/delete, 매칭·미사용 검사, 위치 계획·LIS·배치 방문, 실제 DOM mutation | C2가 기존 ordered/keymatch와 달리 없앨 중복 작업 및 남는 O(n) 검증 |
| 행별·중첩 자식 자체 갱신 | 부모 children과 조상 compChild 검색을 따로 기록: 호출, 배열 길이, 성공 위치/실패, 방문 합계    | C1의 검색 비용과 위치 저장·검증·유지 비용의 비교                   |

검색 방문 수가 `indexOf` 반환 위치와 배열 길이로 계산한 값이면 산출 방식과 dense 배열이라는 적용 범위를 명시하며 시간 비중으로 해석하지 않는다. 해당 앱에서 slot 검색 방문 추정이 0회여도 일반적인 slot 경로가 없다고 결론 내리지 않고 중첩 예제로 확인한다. 1k/10k에서 첫 선택·선택 이동·말미 선택, 변경 행 수가 다른 label 갱신과 구조 갱신을 구별한다. 공식 runner에 없는 10k 부분 갱신이나 일반 중첩 예제는 별도 진단이며 공식 CPU 항목으로 표시하지 않는다. 계측한 진단 시나리오·변경 위치·k·실제 DOM 변경 수를 함께 보존한다. C2의 same-order uniqueness shadow 검사는 기존 목록에서 가상 진입 검증의 방문/lookup을 관찰하는 계측이며, 구현·공식 성능 개선 증거가 아니다.

코어-only 대조는 동일한 원래 앱·helper를 사용한다. C1/C3/C4처럼 사용 패턴이 필요한 후보는 동일한 행별/일반 예제 구조에서 구기능과 새 기능도 비교하고, 원래 앱 대비 최종 결과는 따로 표시한다. 비용 attribution이 불가능한 조합은 그 한계를 적는다.

가중 전체 개선과 개별 상대 성능을 함께 본다. 생성·clear가 느려지거나 메모리가 늘어도 자동 탈락시키지 않는다. 기존 4,800B 게이트를 넘으면 별도 파일/선택적 export, 기존 비용 제거, 명시적 예산 재검토 중 어떤 대안이 가능한지 수치와 함께 기록한다. 무관한 코드 골프로 성능·계약을 흐리지 않는다.

## 5. 설계 결정 대장

체크는 **결정이 닫혔음**을 뜻하며 구현·검증 완료가 아니다.

- [x] **DC-1 확정:** C1/C2 내부 후보와 C3/C4 추가 정보 후보를 분리한다. Phase 1의 일반 nested 검색 증가 근거로 다음은 C1 한정 프로토타입, C2는 보류, C3는 조건부 계약 연구로 정한다. 근거: 원래 앱과 row-renew의 비용 발생 지점이 다름. → Phase 1~3, M-2.
- [x] **DC-2 확정:** 기본 동작의 불명확한 identity/props 생략 금지, 증명 불가 시 기존 경로 사용. 근거: cached identity·keyed 소비 테스트. → Phase 2·5, M-3~M-5.
- [x] **DC-3 확정:** base와 concurrent의 관찰 가능한 계약을 각각 검증한다. 성능 측정은 우선 base이며 concurrent 개선을 추론하지 않는다. → Phase 2~6, M-6.
- [ ] **DC-4 검증 대기:** C3가 필요한지, 기존 기능 조합으로 충분한지, 새 API·callback 의미·패키지 위치. Phase 3 진입 시 비용 분해와 일반 예제로 결정. → M-4·M-6·M-9.
- [ ] **DC-5 TBD:** C4의 목록 소유권/변경 정보/무효화·fallback 계약. C3까지로 목표에 접근 가능한지 본 뒤 분기. → Phase 3, M-4·M-9.
- [ ] **DC-6 구현 전 결정 대기:** C1은 컴포넌트 소유 hint와 parent/각 slot의 독립적인 배열 참조·index 검증을 우선 검토한다. field/sidecar 저장 위치, 최초 생성·이동/삭제/부모 재실행 때 유지 비용, concurrent commit publication을 산정해 Phase 2 구현 전에 닫는다. C2를 재개하면 uniqueness/순서 진입 증명 방식과 추가 비용도 별도로 확정한다. → Phase 2, M-2·M-3·M-8.
- [x] **DC-7 확정:** 기존 retainedView/renderBoundary와 새 memo 의미를 구분하며 benchmark 주석 회피를 설계 동기로 삼지 않는다. → Phase 3·6, M-6·M-9.

## 상태 / 핸드오프

- done: Phase 1의 38개 시나리오와 일반 nested 예제로 작업량을 확인하고 C1 우선·C2 보류·C3 계약 연구 유지로 분기했다. 공식 성능 채택 판정은 없다.
- next: DC-6의 C1 저장·유지·concurrent publication을 구체화한 뒤 한정 프로토타입을 구현한다. C3/C4를 자동 채택하지 않는다.
- blockers: Phase 1 완료의 블로커 없음. DC-4~DC-6은 각 후보의 구현 진입 조건이다.
- commit: 런타임 기준 `085137b0447a8bbe7d28d3bf55c0a997779132b2`; Phase 0 문서 `dbbd320a5b92c63262d43b667692396ae5d53322`. 이번 실행 변경은 미커밋이며 채택 구현 없음.
