# IMPLEMENT — 코어 구조 개선 실행 계획

> DC-21 측정 완료: flat은 slot 대비 추가 heap−77.63~80.06%, baseline 대비 inline update−29.01~37.07%다. Native 관찰 차이로 기본 미채택이며 후보를 보존하고 runtime17 source를 compact13으로 복원했다. [결과](../benchmark/EVENT_PROXY_FLAT_RESULTS.md).

> DC-20 고정 이벤트 프록시: inline 업데이트−27~34%이나 native event 관찰 차이·dispatch/heap 비용 및 noevent 대조 회귀로 **미채택**. [결과](../benchmark/EVENT_PROXY_RESULTS.md). 후보를 보존하고 runtime17 source를 compact13으로 복원했다.

DC-19/19B 두 후보는 미채택으로 종료했고 당시 runtime17 source를 `8056e02` compact13으로 복원했다. [복원/재빌드 감사](../benchmark/fragment-anchor-restoration.json)와 HANDOFF의 구현 커밋을 확인한다.

> DC-19 클라우드 독립 실험 완료: 이 브랜치의 앵커 범위 탐색은 **미채택 프로토타입**이다. 기본 compact13/C2와 구분하며 [결과](../benchmark/FRAGMENT_ANCHOR_RESULTS.md)를 참조한다. 아래 DC-18 수치는 로컬 이력이다.

- 기준일: 2026-10-24. 상태: **DC-18 compact13 기본 반영·한정 통합/보존 감사 완료. 가중 total−5.8917%/JS−14.4232%,10k 메모리+2.4747%,UMD4,824B(4,800+검증24B/여유0). 전체 peer1.10 목표는 미검증**.
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 이 문서의 체크박스는 실제 완료만 표시한다. 명령·검사 계획과 실행 증거를 구분하며, 아직 결과가 없는 항목은 완료로 표시하지 않는다.

## 공통 실행 규칙

- 시작 시 현재 diff·브랜치·HEAD와 두 저장소 상태를 저장한다. 사용자/다른 작업자의 변경을 덮어쓰지 않는다. 코어 후보는 독립 작업 공간 또는 파일별 원본 스냅샷으로 분리하며, 실험 중인 앱과 baseline 앱을 같은 이름으로 취급하지 않는다.
- 실험별 새 출력 디렉터리를 사용한다. 소스·빌드·의존 lock·러너·브라우저 실행 파일과 엔진 SHA-256, 머신/OS/Node, 시간·부하, 설정, raw samples, trace 위치, 실패 배치·재시도, 판정을 manifest로 보존한다. `/tmp`만을 최종 증거 저장소로 삼지 않는다.
- **계측 build와 공식 production build를 분리한다.** 성능 측정 중 빌드·단위 테스트·다른 벤치마크를 동시에 돌리지 않는다. 공식 warmup·CPU throttle·GC·paint 계산은 유지한다.
- 아래 기준 검사 묶음은 매 단계의 gate다. 같은 소스·번들·환경 해시에서 이미 통과한 결과는 재사용할 수 있다. 문서만 바뀐 경우 무거운 테스트를 다시 돌리지 않는다. 런타임 변경·실패·해결되지 않은 우려가 생기면 관련 검사를 다시 수행한다.
- **B1 기본 계약:** 변경 관련 공통 core 테스트를 base와 concurrent에 각각 실행하고, 해당 단계 종료 전에 `pnpm test:dual` 결과를 확보한다. 두 코어 중 하나를 수정하지 않더라도 공유 타입/helper 영향과 기본 동작을 확인한다.
- **B2 빌드·크기:** 필요한 타입/패키지 빌드를 통과하고 `pnpm size`의 기존 기준/실제 초과량을 공개한다. 현재 사용자 지시(R11/R34)는 렌더 성능 우선이므로 소폭 크기 초과만으로 CPU/메모리 평가를 멈추지 않는다. 기존 script의 실패를 통과로 표시하거나 영구 숫자 예산을 임의 변경하지 않는다. 최종 `pnpm build`와 `pnpm verify:concurrent`의 타입/코드생성·정합성 결함은 해결하며 크기 초과 결과는 위 정책으로 분리한다. 크기 스크립트는 파일이 없으면 skip하므로 대상 세 UMD가 존재하는지 먼저 확인한다.
- **B3 앱 계약:** 기존 `targeted-update.mjs contracts`와 `verify`에서 keyed, 9개 동작, glyph font, DOM 정체성·mutation·일괄 갱신 순서·재생성을 기준/후보 양쪽에 확인한다. 러너의 기존 계약 검사로 새 API 경로를 검증할 수 없는 경우 명시적으로 확장한다.
- **B4 전체 회귀:** `pnpm build`, `pnpm test`, `pnpm test:dual`, `pnpm test:e2e`를 최종 후보 해시에 대해 확보한다. 수정 파일의 ESLint/Prettier 및 `git diff --check`도 포함한다.

## Phase 0 — 문서와 근거 정리

진입: 사용자 요구와 기존 조사 자료 확인. 종료: 네 문서가 연결되고 열린 결정의 담당 시점이 분명함.

- [x] 현재 목표·일부 손해 허용·미완료 비교를 REQUIREMENTS에 기록.
- [x] C1~C4 후보, 기존 API/수명 계약과 비용 위험을 DESIGN에 기록.
- [x] 기존 7~8월 문서·측정 결과를 history에 보존하고 현재 게이트와 분리.
- [x] 아래 실행 단계와 수동 검증 매핑 작성.
- [x] 기준 검사: 정본·이력·benchmark 연결 문서 11개의 로컬 링크 111개, 단계/결정 ID, package 명령 경로, 과거 원문 SHA-256, 현재 git diff를 검토했다. 현재 문서의 Prettier와 `git diff --check`를 통과했다. 문서 변경만 있으므로 런타임 테스트는 실행하지 않았다.

## Phase 1 — 기준선 재확인과 비용 분해

진입: Phase 0 정리 완료. 종료: 원본·실험 앱/코어가 구별되고, C1/C2의 구현 진입 또는 C3/C4 계약 연구로 진행할 계측 근거가 있음.

현재 상태: 2026-10-21 후속 착수 요청으로 완료했다. 문서·설계 담당과 실행·증거 담당을 나누고, 벤치마크·테스트·빌드는 실행 담당이 직렬 수행했다. 증거는 [기준선 보고서](../benchmark/STRUCTURAL_BASELINE_RESULTS.md), [raw manifest·카운터](../benchmark/structural-baseline-results.json), [영구 증거](../benchmark/structural-baseline-evidence.json.gz), [재현 도구](../benchmark/structural-baseline.mjs)에 보존한다.

- [x] 기준 커밋 `085137b0447a8bbe7d28d3bf55c0a997779132b2`, base 1.25.2/concurrent 0.2.2, 런타임 소스·세 번들·크기 해시 재확인. base 소스 16개와 ESM/UMD/CJS는 npm 1.25.2와 일치하며 concurrent도 기준 소스·과거 evidence 해시를 확인했다.
- [x] upstream 원래 앱을 기존 select-partial evidence의 `official-main.tsx`에서 새 staging으로 추출하고 해시 저장. 현재 upstream `src/main.tsx`의 targeted 실험본은 그대로 보존.
- [x] 공식 러너의 `03_update10th1k_x16`, `09_clear1k_x8` 등 실제 행 수·반복·throttle·GC를 manifest에 기록. README 설명과 다른 1,000행 준비 조건을 실행 코드 근거로 명시.
- [x] 원래 앱·행별 갱신·일반 nested slot 예제의 별도 계측 38개 시나리오에서 cache/diff/updater/부모·slot 검색/placement/DOM을 분리했다. 1k/10k와 `k = 1, 10, n/10`, 선택 위치·parent-refresh를 바꿔 비교했고 DOM/입력 정체성·값 검증을 통과했다.
- [x] C1 검색 방문 추정과 C2 uniqueness shadow의 추가 작업을 기록하고 과거 후보와 다른 제거 작업을 식별했다. 방문량을 시간 비중으로 해석하지 않는다. 실제 후보의 제거량·생성/메모리 비용은 미측정이다.
- [x] IC-1 초기 제안은 React/Preact hooks·classes 전체 항목, 공식 전체 시간의 항목별 중앙값·분포·baseline/peer 비율과 가중 전체 지표다. 최종 표·색상·startup 포함 범위·수치 임계치는 미확정이며 이번 peer 실측은 없다.
- [x] B1 `pnpm test:dual`, B2 core/concurrent/element 빌드·size, B3 양쪽 앱 contracts 및 공식 keyed·9개 동작·폰트 verify를 확보했다. M-1·M-2의 기준선 범위를 수행했으며 후속 후보 전용 체크는 미완료다.

산출물: 새 실험 manifest·기준선 카운터, 후보별 예상 제거 작업/새 비용, DC-6 선택 근거. 단계가 끝나도 새 성능 개선을 입증한 것은 아니다. M-1·M-2 중 최종 후보 일치·후보 유지 비용·core-only 성능 비교 등 후속 단계에만 해당하는 체크는 이번 종료 판정과 구분해 미완료로 남긴다.

분기: C1이 원래 앱에 효과가 없고 C2의 진입 증명 비용이 크다는 근거가 있으면 Phase 2 후보들을 모두 구현하지 않고 바로 Phase 3의 C3/C4 계약 연구로 진행할 수 있다. 내부 개선 우선 검토는 미세 최적화 소진 의무가 아니다.

당시 분기: 일반 nested slot에서도 반복 검색 증가가 재현되어 C1 한정 프로토타입을 택했다. original/Table의 전체 순회 해결책으로 설명하지 않는다. C1의 실제 결과와 채택 보류는 아래 Phase 2에 기록하며, 이후 Phase 3 C3 후보와 DC-12 별도 렌더러의 한정 검증으로 이어졌다. C2는 실제 시간상 기각 없이 보류한다.

## Phase 2 — 기존 계약 안의 내부 후보 C1/C2

진입: Phase 1에서 해당 비용이 확인되고 DC-6의 저장/진입 방식이 정해짐. 종료: 후보별 정합성·작업량 감소 여부·비용이 기록되어 다음 분기로 판단 가능.

C1 실행 당시 상태: Phase 1 `979f88f` 뒤의 C1 한정 검증을 완료했다. [보고서](../benchmark/PARENT_POSITION_RESULTS.md), [raw 결과](../benchmark/parent-position-results.json), [압축 증거](../benchmark/parent-position-evidence.json.gz), [후보 패치](../benchmark/parent-position-candidate.patch)에 보존했다. slot/concurrent는 미수정이다. 큰 목록 반복 자체 갱신의 이득은 확인했지만 원래 앱 가중 전체 −0.55% 단일 차수·크기 한도 +53B여서 기본 채택은 보류하고 baseline으로 복원했다. 당시 C2는 구현하지 않은 보류 후보여서 Phase 3의 C3 계약·기준 회귀로 진행했다. 후속 C2 실행은 아래 DC-17과 구분한다.

- [x] 이 Phase에서는 C1만 독립 구현·검증했다. 당시 C2는 미구현 보류이며 완료로 간주하지 않는다.
- [x] C1 구현 전에 [부모 위치 회귀 4개](../../src/tests/core-parentPosition.test.tsx)를 추가하고 기준선 base/concurrent 각각 4개 통과: index 0·말미 반복/재정렬/추가/삭제 뒤 자체 renew, shared slot의 앞쪽 live alias 첫 등장 동기화, 같은 컴포넌트 VDOM 설명의 다중 위치 독립 수명, compKey 없는 공개 `replaceWDom`. 이는 후보 통과가 아니며 C2 전용 same-order 중복 키·mixed 목록은 재개 시 별도 준비한다.
- [x] C1의 base/concurrent 공유 회귀·기존 lifecycle suite와 브라우저 계약 통과. 새 배열·합성 stale fallback, slot 첫 등장 동기화 확인. concurrent 이식은 하지 않음.
- [x] C1의 68개 카운터 검사, 24개 시간 context, 6개 heap/회수 context에서 새 비용 기록. 조상 slot과 원래 Table의 전체 순회는 남음. C2 Set 비용은 Phase 1 shadow 이외 새 측정 없음.
- [x] 공식 9항목 290표본 사전 비교 완료. 전체 −0.55%, JS −1.13%; 일부 회귀만으로 기각하지 않고 작은 단일 차수 신호·미해결 주 병목·크기 비용으로 채택 보류. Phase 4 전체 역순/peer 검증은 미실행.
- [x] C1 B1 dual 1,050 passed·3 skipped, B2 core build 성공/size 한도 53B 초과 기록, B3 양쪽 contracts·keyed·9동작·폰트 통과. size 실패를 통과로 바꾸지 않고 baseline 복원 후 기존 게이트 재확인. M-3~M-6의 최종 채택 범위는 남김.

분기: 내부 후보로 충분한 이득이 보이면 Phase 4로 진행할 수 있다. 기존 정보의 한계가 주요 원인이면 Phase 3을 구체화한다. 효과가 없으면 소스·측정·기각 이유를 보존하고 baseline으로 복원한다.

## Phase 3 — 추가 계약이 필요한 후보 C3/C4 (조건부)

진입: 내부 최적화만으로 남는 작업과 정보 부족이 설명됨. 먼저 DC-4 또는 DC-5의 계약을 구체화하고, 해당 결정이 닫힌 후보만 구현에 진입한다. 종료: 채택 여부를 비교할 수 있는 동작·API·비용 증거가 있음.

- [x] C3는 base `useParentMemo` setup hook의 새 명시적 옵트인으로 한정 설계·구현했다. incoming props의 deps 복사·Object.is·key shape 무효화, nonempty slots fallback, self 경로 우회, hit의 두 단계 callback 생략, 기존 miss 배칭, 성공 후 스냅샷 게시·실패/삭제 정리를 검증했다. 후보는 패치에 보존했으며 baseline 복원 뒤 기본 API/export에는 없다.
- [x] **C3 기준 회귀:** `core-parentUpdateContract`에서 양방향 부모/자식 예약·두 단계 callback·재진입·삭제·자체 출력 보존 **10개씩**을 base/concurrent로 확인했다. 기존 updatePaths·cached identity·parentChildSync·composedRenew·removedRedraw를 포함한 B1 `pnpm test:dual` **1,070 passed·3 skipped**(13개 suite 집계, base runner 409/concurrent runner 312), `pnpm exec tsc --noEmit` 통과. 이는 후보 T1~T7 통과가 아니다.
- [x] **C3-T1:** base setup 등록·중복/외부/잘못된 시점 오류·lmount·실제 ESM/CommonJS API·consumer 타입을 확인했다. concurrent import는 TS2305와 ESM missing export로 실패한다. 패키지 배포는 하지 않았다.
- [x] **C3-T2/T3:** 동기화 전 selector·복사 스냅샷·deps 길이/NaN/−0·공유 mutable 값·key 추가/삭제·선언 누락·nonempty slots/특수 props fallback을 전용 회귀로 검증했다.
- [x] **C3-T4/T5 한정 검증:** hit/miss 양방향 배칭·pre/post·재예약, keyed 이동·생성자 교체·같은 설명의 독립 수명·삭제, selector/pre/updater/post/DOM/mount 실패·실패한 초기화의 하위 등록 정리를 전용 **33개**에서 확인했다. 일반 UI의 key 유지 dispose/GC 9context에서도 등록·관찰한 VDOM/host 잔류 0개다. 전체 base 트리/hook cursor의 예외 롤백을 구현한 것은 아니며 추가 hardening/100회 churn은 미실행이다.
- 구현 단위: base 전용 memo sidecar/setup/work scope → self/parent diff 경계 → DOM 방문/성공 게시 → 전용 계약 회귀·공통 dual → 타입/실제 exports/크기. 후보 소스와 baseline은 별도 스냅샷으로 보존하며 크기 초과를 자동 채택하지 않는다.
- [ ] C4가 필요하면 목록 소유권·구조 version·dirty item·외부 mutation·fallback을 정의. C4를 구현하지 않는다면 이유와 연구 상태를 남기고 완료로 체크하지 않음.
- [x] **C3-T6 동작 대조:** 동일한 일반 1k 입력 앱에 baseline/후보 비사용/후보 opt-in을 3context씩 실행했다. refresh 자식 updater 1,000→0회·한 props 변화 1,000→1회, 자체 갱신·DOM/state/focus·이동·삭제를 확인했다. 공식 시간 비교는 미실행이다. 기존 retainedView/renderBoundary 의미는 유지한다.
- [x] helper는 미수정이다. 원래 앱 B3 manifest에서 양쪽 helper/appSource 동일성과 후보 core 해시를 확인했다. candidate helper staging 지원 추가는 이번에는 N/A다.
- [x] **C3-T7 비용/기준 검사:** 후보 B1 dual **1,070 passed·3 skipped**, B2 core build/타입 성공·br **5,691/4,800B 실패**, B3 동일 원래 앱 contracts·keyed·9동작·폰트 통과. 크기 실패를 통과로 바꾸지 않고 증거 보존 뒤 baseline 복원했다. 당시 비사용자 시간·공식 메모리는 미측정이었으며 DC-12/DC-15에서 보완했다. 전체 최종 검증은 남아 있다.

산출물: [C3 보고서](../benchmark/PARENT_MEMO_RESULTS.md), [raw 결과](../benchmark/parent-memo-results.json), [압축 증거](../benchmark/parent-memo-evidence.json.gz), [후보 패치](../benchmark/parent-memo-candidate.patch), [전용 회귀·도구](../../experiments/parent-memo/README.md). 한정 구현·동작/회수 검증은 완료했고 크기 한도 +891B로 기본 채택을 보류했다. 당시 비사용자 시간 비용은 미측정이었다. 아래 DC-12에서 별도 렌더러의 비참여 대조만 추가했으며 Phase 4 전체 peer/메모리 검증은 미완료다. 패치를 역적용해 자신의 코어 변경만 복원했고 source/산출물 **28개 SHA-256**과 실제 sibling 앱의 해시가 이전 baseline과 일치한다. 복원 후 core build/size·관련 base **21**/concurrent **23** 회귀가 통과했다. 후속 DC-12 격리 계약·검증은 아래에 기록한다.

분기: API/메모리/번들 비용이 목표에 맞지 않으면 미채택으로 보존한다. 한도 변경은 IC-3에서 구체적인 수치와 대안을 검토하며 기존 게이트를 임의 수정하지 않는다. 일상적인 내부 구현 선택마다 사용자 재승인을 요구하지 않는다.

## Phase 4 — 전체 성능과 교환 비용 검증

### DC-12 한정 실행 — 기본 경로 보존과 별도 렌더러 비용

- [x] 검증된 C3 source를 독립 staging으로 복원·재빌드하고 source/bundle/types provenance를 기록한다. 기본 28파일과 public exports는 바꾸지 않는다.
- [x] 전용 33회귀를 staging alias로, 공유 core 회귀와 기존 dual을 각각 확보한다. 실제 타입/패키지·혼용 실패도 확인한다.
- [x] 동일 입력 UI 9context와 원래 앱 B3를 재실행한다. 재사용하는 이전 도구에는 명시적인 candidate package/source override만 추가하고 기본 사용법을 보존한다.
- [x] 새 출력 위치의 원래 앱 core-only 대조를 두 실행 순서로 수행한다. 전체 580표본·고정 Chrome/엔진 해시·같은 앱/helper를 감사한다. 공식 CPU 동안 빌드·단위 테스트를 병행하지 않는다.
- [x] 항목별 전체/JS·양차수/합산 분포·실패/재시도와 기본/별도 번들 비용을 보존한다. 별도 렌더러 비참여 앱의 비용이며 C3 기능 개선율이나 최종 목표 달성으로 쓰지 않는다.
- [x] 보고서·raw·영구 증거와 done/next/blockers/실제 SHA로 인계한다. public subpath·크기 예산·배포는 별도 결정이고 Phase 5/6 완료로 표시하지 않는다.

[DC-12 결과](../benchmark/PARENT_MEMO_ISOLATION_RESULTS.md): 양순서 580표본/실패0, 가중 전체 +0.10%/JS +0.32%로 불확실하며 기본 런타임은 그대로다. 보고서·raw·영구 압축 증거를 보존했다. 이 검사는 DC-12의 한정 사전 비교다. 아래 Phase 4 전체의 peer/메모리/새 기능 대조를 모두 마쳤다는 뜻이 아니다.

### DC-13 한정 실행 — 같은 행 앱의 memo on/off

- [x] 기존 isolated core·기본28파일/package/sibling 해시와 재사용할251/dual1070 증거를 감사한다. 새 행 앱/source·같은 JS/HTML 설정 차이·diagnostic 분리를 manifest에 기록한다.
- [x] 새 앱 타입, production B3 contracts/공식 keyed·9동작/font, diagnostic updater 수·identity/batching·dispose/GC를 통과한다.
- [x] 공식 CPU9항목 양순서580표본과 공식 메모리5항목 양순서60표본을 같은 빌드/브라우저로 직렬 실행한다. 정상 CPU 중 빌드/테스트를 병행하지 않는다.
- [x] production retention3context×두 조건에서 생성/삭제100회·부분 갱신100회를 실행한다. 진단 heap/DOM/listener와 공식 메모리를 구분한다.
- [x] 항목별·양차수/합산 전체/JS·메모리·분포·크기와 실패/재시도·부하를 보고서/raw/영구 증거에 보존한다. 기본 원래 앱/전체peer 개선율로 해석하지 않는다.
- [x] 정본4문서·HANDOFF에 done/next/blockers/실제 commit을 갱신한다. 기본 코어 채택/예산 확정이나 Phase5/6 완료로 표시하지 않는다.

[DC-13 결과](../benchmark/PARENT_MEMO_OPTIN_RESULTS.md): CPU580·메모리60·100회 churn을 완료했다. 통제 앱의 가중 전체−8.12%와 생성/메모리 비용·heap 미귀속을 함께 공개했다. 메모리23/26 등록/메타데이터 오류2회는 기존 정의를 프로세스 안에서 복원해 해결하고 유효12표본의 resume을 감사했다.

### DC-14 한정 실행 — heap 귀속과 캐시 대조 준비

- [x] 같은 source/JS/HTML/browser와 기본28파일/package/sibling을 검증하고 초기 상태를 보존한다.
- [x] snapshot 없는3context/조건의300회 churn과 별도1context/조건의 snapshot을 직렬 수집한다. DOM/listener 및 heap을 함께 기록한다.
- [x] snapshot schema/self size 합계·보유 경로·live/clear 객체 수를 감사하고 결과와 원본 증거를 보존한다.
- [x] 실제 원래 cacheUpdate/row helper/C3 대조의 사전 조건을 고정하고 문서4종/HANDOFF를 갱신한다.

기준 검사: 기존 DC-13의 same-hash 타입/B3/core 회귀를 재사용한다. 새 도구에는 형식 검사와 실제 snapshot 합계/경로 감사를 수행한다. 코어 해시 변경 시 이전 검증을 재사용하지 않는다.

[DC-14 결과](../benchmark/PARENT_MEMO_HEAP_RESULTS.md):300회 churn6context·별도14 snapshot/2context·WeakMap table/AllocationSite 귀속·Python 독립 감사를 완료했다. 코어 수정과 새 공식 CPU/메모리 표본은 없다.

### DC-15 완료 — 실제 캐시 앱 대조

- [x] [고정한 다섯 조건](../benchmark/PARENT_MEMO_CACHE_PLAN.md)을 immutable staging에 빌드하고 타입/B3·diagnostic gate를 통과한다. row off/helper/memo는 같은 JS로 만든다.
- [x] 양순서 CPU1,450·메모리150표본과 retention15context/dispose·크기를 확보한다. 원래 앱 종단 차이와 같은 행 구조의 기능 차이를 구분한다.
- [x] 전 표본·실패·trace·해시/분포를 감사하고 결과/정본4문서/HANDOFF를 갱신한다.

기준 검사: 새 앱 타입·keyed/9동작/font·정체성/작업량·동일 JS와 측정 전후28파일/package/sibling hash. 동일 core의 기존 회귀는 재사용한다. outputs table 개선을 섞으면 새 후보로 gate부터 재검증한다.

[DC-15 결과](../benchmark/PARENT_MEMO_CACHE_RESULTS.md): 양순서CPU1,450/메모리150·churn15context·dispose·독립 통계/183파일 감사를 완료했다. 기존 앱 대비 전체+21.08%/JS+70.27%여서 현재 C3를 기존 앱 개선안으로 채택하지 않는다. 공식 측정은2026-10-22UTC, 추가 churn은2026-10-23UTC이며 시간 간격을 공개한다. 최종 peer/Phase5~6 완료는 아니다.

### DC-16 완료 — 원래 앱과 React/Preact 전체 비교

- [x] 사용자 CPU1.10 목표·고정 네 peer/source/lock·원래 앱을 manifest에 고정하고 각 upstream production 설정으로 새 staging을 빌드한다. 설치본 재사용 시 lock/package/의존성 트리와 source 일치를 감사한다.
- [x] 모든 앱의 keyed/9동작/font·DOM 정체성 gate를 통과하고 양순서 CPU1,450·메모리150표본을 직렬 수집한다. 과거 표본과 합산하지 않는다.
- [x] 전체/JS/paint·분포·네 peer 최저 대비1.10 판정/가중치/색상 함수·MB/크기·실패/부하를 보고한다. Python으로 중앙값/분포/비율/가중 지표를 독립 감사한다.
- [x] 목표 격차 상위 최대 두 항목의 원래 Lithent와 가장 빠른 peer를 별도 profile/trace로 진단하고 다음 코어 후보/미확정 원인을 기록한다.
- [x] raw/trace/소스/빌드/도구/lock/명령/로그를 보존하고 정본4문서/HANDOFF에 실제 commit과 done/next/blockers를 갱신한다.

기준 검사: 측정 전후 default28파일/package/sibling·peer source/lock/의존성·Chrome/엔진·runner hash, 앱별 gate, 표본 완전성·반대 순서·독립 통계·로컬 링크. CPU 중 build/test 금지. 최종 Phase5/6의 새 후보 검증은 별도다.

### DC-17 — C2의 현재 diff 결과 전달·size 탈락 후보 정리

진입: DC-16 전체 비교·진단과 DESIGN DC-17의 범위·metadata 수명 계약 확정. 종료: gate 통과 시 같은 원래 앱의 core-only 이득/손해와 정합성·메모리·크기·복원 증거로 판단하거나, gate 실패 시 후보·실패 증거·runtime 복원과 미실행 범위를 남겨 이번 후보를 미채택으로 종료함.

- [x] 범위: 기존 general keyed Map 이후의 현재 결과를 render에 전달해 중복 인덱스/배열 처리를 줄인다. 새 key preflight/Set/immutable 가정/공개 API 없이 시작한다.
- [x] metadata 계약은 root-scoped `frame={proofs: WeakMap<WDom,WDom[]>, ready, invalid}`로 확정했다. 현재 general diff가 성공한 node/children 배열을 stage하고 root diff·wrapper 게시 뒤 ready, `typeUpdate`의 loop 진입에서 props/DOM setter/콜백 전 get/delete 후 identity/ready/invalid 검사, root finally에서 frame 전체 폐기/이전 frame 복원이다. 중첩 재진입은 바깥 frame을 무효화한다. WDom shape/clone 필드·uniqueness 사전검사는 추가하지 않는다. 구현·비용 검증 완료를 뜻하지 않는다.
- [x] 재개 시 과거 upstream sibling·staging·고정 Chrome155가 없었고, 실행 중 clean 원래앱 upstream checkout이 외부에서 출현했다. 그 checkout은 과거 targeted 앱과 다르며 이번 작업은 생성/수정하지 않았다. staging/고정 Chrome155 부재가 계속되어 B3/공식 측정은 같은 환경 복원 전 불가하다. 초기 부재·외부 출현과 기본28파일/package 사전 상태를 구분한다. size 실패 시 측정용 환경을 새로 설치하지 않는다.
- [x] [공통 회귀](../../src/tests/core-placementProof.test.tsx)는 초기10개를 기본 base/concurrent에서 먼저 통과했고 최종 children getter 순서1개를 추가해 base/concurrent/candidate 각각11개 통과했다. 특수/중복/혼합 키·empty/tag 교체·pre callback 후속 key mutation·Fragment arity·portal/외부 형제·focus/자체 renew·callback/재예약·diff throw 뒤 live sibling 재개·동기 wrapper 교체를 확인했다. base/concurrent의 기존 매칭/children 읽기 순서 차이도 보존한다.
- [x] 실제 사전29파일·소스/격리 baseline·후보·앱/helper·도구 hash와 환경 변동을 [raw](../benchmark/keyed-placement-results.json)에 고정했다. archive에서 원래 앱/cacheUpdate를 hash 검증해 추출했다. 브라우저 부재 기록은 B3 복원 완료를 뜻하지 않는다.
- [x] base 프로토타입은 영구 WDom 필드 없이17모듈로 격리 구현했다. 원래 Map 구성 뒤 children을 읽는 관측 순서를 유지한다. 최종 엄격 타입/빌드·17모듈 declaration pair, 후보 shared229+수명4=233회귀, root/candidate source·test strict 타입과 변경 TypeScript ESLint/Prettier가 통과했다.
- [x] 기본 `pnpm test:dual`은 초기10회귀 시점1,090 passed·3 skipped였다. 첫 실행의 기존 lithentVite3실패는 stale hmr-parser dist였으며 소스 변경 없이 `pnpm build:hmrParser` 후 통과했다. 마지막 read-order1개는 unchanged base/concurrent targeted와 후보 전체233에서 추가 확인했다. 초기 full dual과 최종 targeted·후보 전체를 구분한다.
- [x] 별도 JSDOM11동작씩에서 선택/선택이동/partial의4배열·1,000인덱스 방문이0으로 줄고 Map/키 접근·content/cleanup은 전동작 동등했다. fallback 배열/방문은 그대로이며 proof lookup/delete가 추가된다. 매동작 frame1개 생성/정리를 확인했다. [수명4회귀](../../experiments/keyed-placement/lifetime.test.tsx)는 stage/consume, 뒤 diff throw의 미방문 proof 폐기, DOM throw, 중첩 invalidation/복원을 확인했다. 실제 보유 메모리나 모든 in-place VDOM mutation을 검증한 것은 아니다.
- [ ] 최종 채택 후보의 B1~B3/size 전체 통과: 이번 후보는 아래 size 실패로 미완료이며 B3 원래 앱/keyed/9동작/font 실브라우저 검사는 미실행이다.
- [x] 후보 UMD raw/gzip/br13,210/5,348/4,952B를 baseline12,741/5,178/4,798B와 대조했다. br+154B이며 한도152B 초과다. 이번 프로토타입은 미채택으로 보존하고 공식 CPU580/메모리60·retention/B3는 실행하지 않는 분기를 확정했다. 전체 후보 gate 통과로 체크하지 않는다.
- [ ] **이번 후보는 size 실패로 미실행:** gate 통과 후 같은 앱의 CPU9항목 양순서580·공식 메모리60·3context/조건 retention·독립 통계/전후 hash 감사. DC-16과 표본을 합치지 않는다.
- [x] size 실패 분기의 [결과](../benchmark/KEYED_PLACEMENT_RESULTS.md)·[패치](../benchmark/keyed-placement-candidate.patch)·[영구 증거](../benchmark/keyed-placement-evidence.json.gz)·[재현 도구](../../experiments/keyed-placement/README.md)를 보존했다. 기본29파일은 사전 상태와 바이트 일치하고 root runtime 복원은 불필요했다. sibling은 외부 출현 상태를 읽기만 했다. Python의212개 archive entry·154counter 비교·size/29guard·패치17source replay 감사를 통과했다. 공식 CPU/메모리/retention/B3는 미실행이며 이번 프로토타입만 미채택으로 종료한다.

기준 검사: baseline 회귀 → 후보 B1~B3/size → 통과 시 실제 제거 작업/전체CPU·메모리, 실패 시 실패 증거/미실행 기록 → 복원28파일/package/sibling·local links. 진단 위치나 수명 계약 확정이 실제 비용 절감·전 항목 목표 달성을 보장하지 않는다.

DC-17 당시에는 고정 staging/Chrome155가 없어 B3/공식 측정이 미실행이었다. 기본28파일·package 사전 hash와 sibling의 초기 부재→clean 원래앱 외부 출현을 구분하며 새 checkout을 수정하지 않았다. 과거 targeted sibling의 hash 보존이나 브라우저 검증 완료를 주장하지 않는다. 별도 JSDOM 구조계측은 영구 DC-16 archive에서 원래앱/cacheUpdate를 hash 검증해 추출했고 공식 B3/실브라우저/CPU/retention과 구분했다. 당시의 core/size gate 종료를 현재 후속의 조기 종료 조건으로 적용하지 않으며 새 측정은 R11/R34와 DC-18에 따른다.

이번 실행은 size 실패 분기를 완료했다. 기본 runtime은 격리 실험 전 사전29파일 상태로 유지되며 공식 시간·공식 메모리·retention·브라우저 B3·최종 B4/Phase5/6은 미실행/미완료다. 최종 증거는212entries/1,089,255B·SHA-256 `8ee32f171df7a45df6b2bc4494a2589cc025c0c8581ed6ed336883af811b555e`다. 이전 br4,951B의 archive/results/patch/report는 내부 `superseded/source-order-v1/`에 보존하며 현 최종 수치·hash와 합치지 않는다. C2의 다른 전달비용 대안은 후속 미결정으로 남긴다.

### DC-18 — compact13 기본 반영·한정 통합/보존 감사 완료

진입: DC-17/Preact 검토 보존과 엔진별 layout 진단 범위 확정. 종료: 선택 compact13의 실제 성능/메모리·동일 default artifact·한정 통합/영구 보존 감사 완료. 전체 peer 목표·광범위 Phase5/6 완료와 구분한다.

- [x] **A 입력/smoke:** 고정 Chrome156.0.8078.47/V8 15.6.75.19·Node25.6.1, archive 원래앱/helper/runner/CSS/fonts185파일·동일 package.json/별도 lock을 고정했다. source probe/IC flags와 실제 CPU/메모리 production lane을 분리했다. sandbox smoke 실패·CPU 전 자체 wrapper 스키마 오류는 보존하고 공식 runner/workload는 변경하지 않았다.
- [x] **B baseline/후보 진단:** baseline/full/compact의 fast-property·Map·IC/deopt/함수/source 귀속을 구분했다. 모든 live dictionary0과 ever-N39→9를 확인했지만 이 계수 자체를 속도 점수로 쓰지 않았다. exact V8 tag·raw H 해석·누락/프로브 한계를 보존했다.
- [x] **C full22 대조:**229shared/17pairs, CPU580/메모리60/retention6context·실패/경고0과192분포/9가중값을 확보했다. total−4.8664%/JS−12.1886%·10k 메모리+14.95%·UMD4,854B를 미채택 대안으로 보존했다. compact 준비/실행으로 자료를 취소하거나 덮어쓰지 않았다.
- [x] **D compact 범위/회귀:** hot13 초기 선언·희소9 필요 시 추가로 제한하고 allocation site/인자·Map/LIS/helper·wrapper/event/앱을 유지했다. full 수집 뒤 별도 `compact-experiment`에서229shared/17pairs와 UMD4,824B를 확인했다. IC3context ever-N9/final-N9/P73·wrong-map27·probe Map3/fast/dictionary0을 보존했다.
- [x] **E compact 실제 수집/감사:** 새 동차수 baseline으로 CPU580/메모리60/retention6을 직렬 수집했다. total−5.8917%/JS−14.4232%, main−6.6228%/reverse−5.1433%·9pooled total 중앙값 하락·10k 메모리+2.4747%(+0.6801MB)를 확인했다. CPU reverse partial/메모리 main ready 각1실패는 자동 재시도·원자료 보존했고 CPU 경고0이다. 두 실험 합계384분포/18가중값 독립 Python1e-12 감사 완료이며 raw를 합산하지 않았다.
- [x] **F 기본 source 적용:** 적용 전29guard/`before-adoption.json` 뒤 측정한 `src/wDom.ts`·새 `src/utils/createWDom.ts`를 복사했다. default3JS가 측정 후보와 byte/hash 일치한다. 최종79파일 manifest와 초기29 중6변경을 기록했다. concurrent 소스 미수정이며2concurrent JS 변화는 초기 stale 산출물 재빌드다.
- [x] **G 한정 통합:** 측정 종료 뒤 build:sequence/build:parallel·verify:concurrent ALL PASS, dual1,092 passed/3 existing skipped, strict core/concurrent/e2e 타입·ESLint·Playwright64/retry0을 통과했다. SSR/hydration·HMR·helper/context·예제/docs를 포함하며 optional metadata own-key 차이는 공개했다. root Vitest420 등 dual에 포함된 검사를 별도 pnpm test로 반복하지 않았다. 광범위 B4/Phase5/6 전체 완료는 주장하지 않는다.
- [x] **H size guard:** reference4,800B+이번 검증24B allowance=4,824B/실제4,824B·추가 여유0, concurrent6,903/9,000B·element998/1,000B strict 통과다. full+54B 허용이나 광범위 영구 예산을 compact에 자동 이전한 것이 아니다. 형식/압축 환경 차이를 기록하고 실제 선택 artifact와 연결했다.
- [x] **I 보존/독립 감사:** [보고서](../benchmark/NODE_SHAPE_RESULTS.md)·[raw/적용 manifest](../benchmark/node-shape-results.json)·[선택 패치](../benchmark/node-shape-candidate.patch)·[full 패치](../benchmark/node-shape-full-candidate.patch)·[증거](../benchmark/node-shape-evidence.json.gz)·[도구](../../experiments/node-shape/README.md)를 보존했다. 최종1,367entries/18packed rawlogs·33,532,452B·SHA-256 `3fdb0309e89519c0bc9806b50bf27af3c8fd302e241607c2f20ad1402819950b`다.384분포/18가중·4,380IC access-site/724raw deopt·CPU1,160/메모리120/retention12/최종79파일 독립 감사 완료다.

판정: compact13을 기본 base에 반영했다. full22는 미채택 대안으로 유지한다. 전체 peer1.10 목표·다른 후보 연구·광범위 Phase5/6은 별도 미완료다. DOM/listener0을 전체 heap 누수 부재로, core/통합 검사를 전면 own-key 동등성으로 확대하지 않는다. 커밋/푸시/릴리스는 하지 않았다.

### 후속 채택 후보의 전체 성능 검증

진입: 후보별 정합성/B1·B2 타입/빌드·앱/B3와 immutable production staging 완료, 실제 크기 비용 공개 및 R11/R34 평가 정책 적용. 소폭 크기 초과 단독 중단은 적용하지 않음. 종료: 모든 항목의 실제 이득/손해와 불확실성이 같은 환경에서 비교됨.

- [ ] 같은 앱·helper의 core-only 대조 및 필요 시 동일 구조의 opt-in 대조를 분리. 원래 앱 대비 최종 앱 결과는 별도 표로 제공.
- [ ] 전체 9 CPU 항목을 원순서·반대 순서로 측정. 기본 표본 계획은 선택 25개/다른 항목 15개씩, 두 앱×두 차수 580개이며 정확한 러너 버전·설정을 기록. 부족한 신뢰도나 실패가 있으면 이유와 추가 계획을 먼저 기록.
- [ ] 코드/앱/Chrome 실행 파일·엔진 해시를 시작·종료에 확인. 실패 배치는 부분 표본을 섞지 않고 별도 디렉터리에 보존하여 재시도 trace가 덮어쓰이지 않게 함.
- [ ] 공식 메모리 5개(21/22/23/25/26)를 같은 조건으로 비교. retention은 fresh context 3차수의 반복 생성/삭제·갱신과 GC 뒤 DOM/listener/heap을 기록하며 공식 메모리와 분리.
- [ ] raw/gzip/brotli, 생성/clear/append의 비용, startup·전송량 진단을 별도 기록. 손해가 있어도 전체·상대 성능과 절대량으로 검토.
- [ ] baseline+후보+IC-1의 React/Preact 비교군에 **전체 항목** 실행. 기존 `suite`는 peer CPU를 03/04만 실행하므로 전체 비교 완료 절차로 사용하지 않음.
- [ ] 항목별 baseline·peer 비율/분포, 가중 전체 지표, 색상 계산 설정을 보존. 확정된 CPU1.10 항목별 목표를 판정하고 미정인 메모리 교환 상한과 구분한다.
- [ ] 기준 검사: 시작 전 B3와 B1/B2 결과의 후보 해시 일치 확인, 종료 후 manifest·표본 완전성/실패 로그 감사, M-7·M-8. 성능 측정 중 무거운 테스트 실행 금지.

판정: 채택 검토/추가 실험/기각과 근거를 기록한다. 한 항목 회귀=기각, 메모리 증가=기각, 첫 차수 평균 개선=채택 규칙을 사용하지 않는다.

## Phase 5 — Test Hardening

진입: 검증할 후보의 구현·공개 계약이 안정됨. 종료: 정합성·수명·예외·메모리 회수의 회귀 위험을 검사함.

- [ ] 공통 core suite: keyed 소비, 동일 VDOM 다중 위치·empty, 이동한 자식 renew, slot 참조, Fragment/portal/외부 형제, DOM 상태·focus 보존.
- [ ] 같은 task의 부모/자식 양방향 갱신, 삭제 뒤 예약 갱신, render throw 후 큐 복구, 같은 컴포넌트 재예약, teardown 중 재진입.
- [ ] concurrent: low 작업 중 high 갱신, 중단/재시작/abandon, live 연결 publication, commit 동등성, boundary pause/resume/dispose와 retention.
- [ ] 생성 실패·unmount 뒤 metadata/callback/listener가 회수되는지 실브라우저에서 확인. 새 관리 구조가 있으면 반복 크기에 따른 잔류 기울기를 확인.
- [ ] 기준 검사: B4 전체, 필요 시 기존 `pnpm test:e2e:mutations`와 관련 fuzz/seed 회귀. 관련 검사만 추가하고 변화 없는 구현을 재검증하려는 반복은 피함.
- [ ] M-3~M-6·M-8 완료 및 실패 수정 기록. 수정된 후보의 성능 해시가 달라지면 Phase 4로 돌아가 필요한 비교를 다시 수행.

## Phase 6 — Integration Test와 채택·인계

진입: Phase 4의 비교 증거와 Phase 5의 정합성 증거가 동일 최종 후보를 가리킴. 종료: 최종 상태와 미달/미확정 항목을 포함한 재현 가능한 인계 완료.

- [ ] 실제 package import로 base/concurrent·helper·JSX/SSR/hydration·element·예제 통합 확인. 선택적 API라면 비사용자 bundle과 실제 사용 bundle을 함께 확인.
- [ ] 원래 upstream과 별도 staging의 `isKeyed`, 9개 동작·font·DOM 계약을 최종 산출물에 실행. 실제 upstream 앱 파일을 자동 교체하거나 PR을 올리지 않음.
- [ ] IC-1/IC-2의 전체 비교·교환 판정을 보고서에 기록. 목표 미달/미정이어도 측정을 완료한 사실과 목표 달성은 구분.
- [ ] 채택이면 정확한 후보 SHA와 산출물/테스트/성능 연결을 기록. 기각이면 자신이 만든 변경만 guarded restore하고 두 코어 빌드·핵심 회귀·원본 해시를 확인.
- [ ] 새 실험 증거를 영구 보관하고 손실된 trace가 있으면 그 범위 명시. 각 보고서와 HANDOFF에서 정본 문서에 연결.
- [ ] 기준 검사: 동일 해시의 B4 재사용 가능 여부 확인, 최종 package/브라우저 통합과 B2/B3, M-1~M-10의 해당 항목 완료·미실행 이유 기록.
- [ ] done/next/blockers/실제 commit SHA로 인계. 커밋·푸시·릴리스는 당시 사용자 요청 범위에 따름.

## 재현 도구 사용 시 주의

현재 도구는 [targeted-update.mjs](../benchmark/targeted-update.mjs), [production-run.mjs](../benchmark/production-run.mjs)다. 실제 실행 전에 소스의 mode·환경변수를 확인한다.

- `LITHENT_BENCHMARK_ROOT`는 사용자 지정 sibling checkout, `LITHENT_PRODUCTION_OUT`은 매번 새 출력 경로, `LITHENT_CHROME_BINARY`는 고정 브라우저를 지정한다.
- core-only `prepare`는 **`LITHENT_BASELINE_SOURCE`와 `LITHENT_CANDIDATE_SOURCE`를 같은 보존 원본으로 명시**하고 `LITHENT_CANDIDATE_CORE`만 후보 ESM으로 지정한다. 기본값은 현재 upstream 실험 앱/targeted 후보를 사용하므로 그대로 실행하지 않는다.
- `contracts`, `verify`, `cpu`, `mem`, `retention` 모드를 분리해 실행한다. 반대 차수는 새 출력 위치와 앱 순서를 사용한다. `LITHENT_PRODUCTION_ALTERNATE_ORDER=1`과 실제 실행 순서를 manifest에 남긴다.
- React/Preact 비교군은 DC-16/IC-1의 고정 lockfile `react-hooks`19.2.0, `react-classes`19.0.0, `preact-hooks`/`preact-classes`11.0.0의 네 구현이다. peer를 재빌드하면 해시를 갱신하고 과거 다른 버전 수치와 섞지 않는다.
- 성능 검사에 브라우저 실행·네트워크·sibling 쓰기가 필요하면 해당 환경의 실행 권한 절차를 따른다. 원래 upstream 실험 앱을 보존하고 새 staging을 사용한다.

## 실행 결정 대장

- [x] **IC-0 확정:** Phase 1·C1 검증/복원 뒤 C3 DC-4 계약·기준 회귀를 `ddd545e`에 커밋했다. 이어 C3 base 한정 구현/검증과 증거 보존·baseline 복원까지 완료했다. 그 결과를 `d660fdf`에 커밋한 뒤 DC-12 별도 렌더러·비참여 580표본까지 검증했다. DC-13 통제 앱 CPU/메모리·DC-14 heap 귀속·DC-15 실제 캐시 앱 대조도 완료했다. 현재 C3는 기존 앱 개선안으로 채택하지 않는다. DC-16 전체 peer 기준·진단 뒤 DC-17 C2 sidecar 프로토타입의 한정 검증/계측·size 탈락·증거 보존으로 실험을 종료했다. 다른 후보·최종 채택은 미완료다.
- [x] **IC-1 CPU 확정:** 사용자2026-10-23 선택으로 고정 React/Preact hooks/classes 네 peer 최저 전체 시간 중앙값 대비1.10배 이하를9항목 전부 만족하는 목표를 택했다. DC-16의 같은 차수 합산/차수별 수치와 upstream 가중치/색상 함수를 보존한다. memory·size는 별도 비용, startup은 이번 범위 제외이며 최종 메모리 교환 상한은 IC-2에 남긴다.
- [ ] **IC-2 검증 대기:** 후보별 허용할 시간·메모리 교환. 실제 절대량과 전체/peer 비교 뒤 판단하며 특정 퍼센트를 사용자 합의로 꾸미지 않음.
- [ ] **IC-3 조건부 TBD:** 기본 경로 격리는 DC-12에서 검증했지만 별도 렌더러는 br 5,691B다. 기능 이득·비용을 본 뒤 공개 경로/별도 예산을 결정한다. 기존 한도 변경이나 초과 해소로 표시하지 않는다.
- [ ] **IC-4 검증 대기:** C1/C2/C3/C4 중 최종 채택 조합. 각 후보의 독립 결과 뒤 결합 상호작용을 확인.

## DC-19 — 클라우드 Fragment 앵커 한정 실행

진입: `8056e02` clean baseline, 독립 브랜치/worktree와 R40~R43 범위 확정. 종료: 한정 후보의 동작·작업량·Linux 전용 A/B·교환 비용 및 미검증 경계를 재현할 수 있음.

- [x] 독립 브랜치/worktree 생성과 범위·검사·표본 계획 기록.
- [x] baseline source/환경/hash를 보존하고 앵커 전용 회귀를 baseline base/concurrent에서 먼저 통과한다.
- [x] base helper의 suffix/singleton 할당·불필요한 callback만 변경한다. baseline 대비 patch와 비범위 source hash를 확인한다.
- [x] Test Hardening: 새 앵커 회귀·공유 structural/keyed/fuzz/lifecycle/recovery·기본 core 전체 및 concurrent 공통 회귀·엄격 타입을 실행한다. accessor snapshot 경계도 별도로 확인한다.
- [x] 동일 production 설정으로 baseline/candidate를 빌드하고 세 형식 size/hash, 실브라우저 DOM/identity/focus/mount/portal gate와 별도 작업량을 확인한다.
- [x] 새 Linux 전용 stress/대조 workload를 두 순서로 직렬 수집한다. warmup·raw·실패·브라우저 hash·부하를 보존하고 통계를 독립 계산한다. 공식 peer 측정으로 표시하지 않는다.
- [x] Integration: 별도 fresh context의 GC/DOM/listener·dispose와 실제 번들 import를 확인한다. artifact·source·패치/hash와 원래 worktree 전후 동일성을 감사한다.
- [x] 결과·보류/채택 범위·done/next/blockers/실제 commit을 정본4종/HANDOFF에 기록한다. 별도 요청 전 원래 브랜치 적용·push/release는 하지 않는다.

재현 도구/실험 계획: `experiments/fragment-anchor/README.md`. 기존 DC-16 runner의 Mac 고정 guard를 변경하거나 과거 표본을 재사용하지 않는다.

DC-19 종료: 공통 core base/concurrent 각232/54파일·새 baseline3·strict 타입/lint·ESM6gate/CJS·UMD smoke·진단6조건·CPU1,080/메모리18context·Python 입력/통계 감사를 통과했다. 초기 환경/테스트 수집 오류와 getter 관찰 차이는 증거에 보존했다. two-rAF 이득은 입증하지 못했고 후보는 미채택이다. 현재 guard 대비br+23B이며 기존 guard를 바꾸지 않았다. [보고서](../benchmark/FRAGMENT_ANCHOR_RESULTS.md)에서 범위·분포·원자료·완료/다음을 확인한다.

## DC-19B — snapshot 보존 후속 실행

진입: 첫 후보 `f997302` 보존, R44/R45 계약 확정. 종료: 새 source의 getter/회귀·동일 조건 A/B와 비용/미실행 범위를 인계함.

- [x] 기존 source/결과를 커밋하고 범위·새 출력·계약을 문서화.
- [x] snapshot suffix + getter 순서 보존 for + 단일 노드 helper만 구현.
- [x] Test Hardening: helper snapshot/index read/변이/sparse/길이/throw·공통 core232·strict 타입/lint. unchanged concurrent232 증거는 source가 같은 범위에서 재사용.
- [x] Integration: 동일 설정의 세 형식·ESM 브라우저6gate/CJS·UMD·진단6조건, 별도 새 시간1,080/메모리18context를 직렬 확보.
- [x] 독립 통계·archive/source/hash/patch 감사, 첫 결과 보존과 새 결과/정본/HANDOFF 업데이트. 기본 채택·C2 결합·peer 목표와 구분.

후속 종료: [새 결과](../benchmark/FRAGMENT_ANCHOR_SNAPSHOT_RESULTS.md)의232core/strict·6browser gate/6진단·1,080시간/18memory·Python hash/통계 감사 완료. getter 관찰 차이는 검사 범위에서 해결했으나 시간 이득이 없고UMD+21B여서 미채택이다. 두 후보를 각각 보존하고 현재 runtime은 compact13으로 복원한다. 최종 source/복원 SHA와 인계는 HANDOFF/git log에 남긴다.

## 상태 / 핸드오프 (DC-18 당시 기록)

- done: DC-18 compact13을 기본 base에 반영했다. [결과](../benchmark/NODE_SHAPE_RESULTS.md)의 독립 same-baseline 대조는 total−5.8917%/JS−14.4232%,10k 메모리+2.4747%,UMD4,824B다. default3JS는 측정 후보와 일치하고4,800B reference+검증24B allowance/여유0을 적용했다. build 두 단계·verify:concurrent·dual1,092/3 existing skipped·strict/lint·64e2e/retry0·384분포/18가중·최종1,367entry/79파일 보존 감사를 완료했다. full22는 미채택 대안, DC-17 C2는 당시 미측정/보류 역사로 보존한다.
- next: 별도 후속에서 같은 새 환경의 네 fixed peer/전체9항목1.10 목표와 다른 원인/후보를 검토한다. DC-18 한정 작업은 완료했으며 새 실험을 자동 선정하거나 전 연구/광범위 Phase5/6 완료로 표시하지 않는다.
- blockers: DC-18의 남은 구현/검사/보존 블로커는 없다. 전체 peer 목표는 미검증이다. optional metadata own-key 차이를 공개하며 전면 동등성·모든 heap 누수 부재·보편적 성능 우위를 주장하지 않는다. compact2실패 배치/재시도와 full/compact 시점·표본은 분리 보존한다.
- commit: 현재 HEAD는 `452dc2eeae29d1e555f7f7b467f01de2baa55c0d`이며 이번 변경은 미커밋이다. 푸시/릴리스/upstream 제출은 하지 않았다. 적용 직전29guard 뒤2소스/size guard를 반영했고 최종79파일 manifest에 의도된6기존파일 변화를 기록했다. concurrent 소스는 미수정이다. 최종 증거 SHA-256은 `3fdb0309e89519c0bc9806b50bf27af3c8fd302e241607c2f20ad1402819950b`다.

## DC-20 고정 이벤트 프록시 독립 실행

진입: clean `0dc3305`에서 별도 branch/worktree 생성, R46~R48/DC-20 계약 확정. 종료: 한정 source/동작 차이와 fresh A/B/메모리/size 증거 보존 및 기본 runtime 복원.

- [x] P1 baseline: native 직접 등록의 이벤트 계약 관찰과 기존 core 테스트, baseline source snapshot/hash.
- [x] P2 후보: slot 기반 updateEvent/portal 정리 구현, 같은 공통 동작 검증·strict type/lint. phase baseline은 frozen source로 같은 공통 테스트 통과.
- [x] P3 Test Hardening: alias/dedup·this/object·drop/readd·retained DOM·portal·native stopImmediatePropagation·외부 order/removal·동일 dispatch 중 교체를 검사한다. 알려진 차이를 예상 관찰값으로 별도 기록한다.
- [x] P4 Integration Test: production ESM browser gates/UMD/CJS smoke 뒤 serial 양순서 update/mount/dispatch·별도 memory/size, 입력 hash와 독립 통계 검증. 정상 회귀와 관찰 차이를 혼합하지 않는다.
- [x] P5 보존/복원: source/patch/raw/보고서·재현 도구/commit, unchanged concurrent·원래 checkout 확인, base runtime 복원 뒤 관련 회귀와 strict 검사. 광범위 dual/e2e와 fixed peer 전체 목표는 범위 밖.

DC-20 P4 종료: base/concurrent 각238/55파일, concurrent portal commit4, strict/ESLint, CJS/UMD 및 actual ESM 공통 계약·native6관찰/variant·등록 진단8조건, 시간48page/1,440update batches/480dispatch batches·메모리24context·별도settled-retention24context와 Python hash/통계 감사를 완료했다. 최초 shared teardown의 concurrent portal5실패는 fallback 수정/전체 재검증과 함께 보존한다. 미채택 판단은 native 관찰 차이·교환 비용/대조 회귀에 근거하며 크기만으로 종료하지 않았다. P5까지 완료: source commit `189ddef82e20959ea1267ab2eb8b2f5007c4ba9a`, 복원17 source hash 일치·관련31회귀/strict/lint·재현6번들 해시/크기 일치·후보 patch 적용 감사를 확인했다.

## DC-21 flat table 독립 실행

진입: clean `80afb8f`, R49~R51/회전3-way 설계 확정. 종료: 범위 내 회귀·시간/heap 비교·증거/후보 보존·runtime baseline 복원.

- [x] F1 baseline: baseline/slot 소스와 기존 증거를 보존하고 새 계약을 같은 frozen source에 실행한다.
- [x] F2 구현: flat table·공유 function proxy·alias native fallback·portal native fallback. strict 타입/ESLint 및 base 공통 회귀 통과가 종료 기준.
- [ ] F3 Test Hardening (DC-21-S1 보충 검토에서 재개방): frozen callback, independent events, alias 공통→복수→단일→삭제 전환, this/object/portal/retained DOM, 알려진 native 관찰 차이. concurrent 전체 공통 회귀와 portal commit 테스트로 shared cleanup 경계를 검증한다.
- [x] F4 Integration Test: ESM gates·CJS/UMD smoke·등록 진단 뒤 serial72page/36memory context, 3variant9production bundle size/source scope/hash·독립 Python 통계/완전성 감사. 이전 표본은 합산하지 않는다.
- [x] F5 보존/복원: source commit/패치/raw/압축 증거/보고서·HANDOFF, 기본17source 복원/관련 회귀/strict와 후보 재빌드 hash 재현. fixed peers/전체 monorepo/e2e는 미검증 범위로 남긴다.

DC-21 F4 종료: flat base/concurrent 각240/55파일·baseline/slot event8씩·concurrent portal commit4·strict/lint·3format integration·actual ESM lifecycle/native6observations×3/등록12조건을 확인했다.72timing pages/2,160update batches/720dispatch batches와36memory contexts의 immediate/settled를 보존했고 settled 추가DOM/listener는 모두0이다. Slot과flat 사이 utility1파일만 다르며 Python9bundle/source scope/회전 순서/표본·통계 감사를 완료했다. F5도 완료: source `7e838bcd723261cb3840388f4f0ce1dd8c13e7ec`, 복원17 source/관련33회귀·strict/lint, archived slot/flat 입력을 사용한9production bundle hash/size 재현과 patch 적용 감사를 확인했다.

DC-21-S1 추가 검토: observe-alias-dispatch.mjs와 별도 JSON에서 source helper 및 production UMD 공개 API/trusted mouse click의 flat 전용 A누락을 재현했다. 성능 실험/복원은 완료 상태로 유지하되 alias active-dispatch 정합성은 미해결이며 F3를 재개방한다. 구현/새 performance 비교는 이번 질문에서 수행하지 않았다.
