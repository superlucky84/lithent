# IMPLEMENT — 코어 구조 개선 실행 계획

- 기준일: 2026-10-26. 상태: **DC-23 완료. compact13 유지 + native 이벤트 직접 등록. 전체 검증 통과, 원래 proxy 실험/증거 보존. 현재 CPU 목표는6/9이며 새 timing은 수집하지 않았다.**
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 이 문서의 체크박스는 실제 완료만 표시한다. 명령·검사 계획과 실행 증거를 구분하며, 아직 결과가 없는 항목은 완료로 표시하지 않는다.
- 완료한 DC-22 실행 순서: [Phase4A~4E](#dc-22--종합-반영-실행-phase4a4e) → [Phase5](#phase-5--test-hardening) → [Phase6](#phase-6--integration-test와-채택인계). 앞선 Phase0~4의 완료 기록은 보존하며, 과거 size 중단·미채택을 현재 후속의 자동 종료 조건으로 쓰지 않는다.

## DC-24 — 추가 크기 조사

- [x] S0 기준: DC-23 UMD 12,759B raw / 5,187B gzip / 4,824B Brotli와 기존 dirty tree를 확인했다. 기존 변경을 보존한다.
- [x] S1 후보: 별도 디렉터리에서 map 주석·identifier/reprint·scope를 보존하는 제한 압축을 비교한다. baseline: 실제 bytes/compressor와 AST/closure 경계를 고정한다.
- [x] S2 Test Hardening: 유효한 후보만 실제 빌드로 재현하고 export·parent getter scope·source map 보존과 필요한 브라우저 동작을 확인한다. 출력만 달라지면 전체 suite를 불필요하게 반복하지 않는다.
- [x] S3 Integration Test/인계: 현재 기본 빌드와 후보를 구분하고 실제 절감·기능/디버깅 비용·남은 검증을 보고서/네 문서에 기록한다. 기본 채택은 검증된 범위로만 판단한다.

## DC-23 — 복원 실행

진입: 사용자 승인과 clean HEAD `463c6cd`. 종료: compact13/native와 보존 B 일치, 양코어 검증·공개 문서·크기 guard 정합성 확인. 기존 DC-22 로그/아카이브는 수정하지 않는다.

- [x] P0 계획: R62~R66, DC-23 계약과 M-17을 순서대로 기록한다. baseline: clean diff와 `fb481f3` 대비 네 event runtime 파일만 차이임을 확인했다.
- [x] P1 구현: 세 기존 event 파일 복원·utility 제거, 공개 이벤트 문서·guard 갱신. baseline/exit: compact13 두 파일과 전체 native runtime source hash 비교.
- [x] P2 Test Hardening: 양코어 원 callback remove/dedup·교체 후 순서, trusted alias/replace/ancestor·exceptions·portal/frozen Event 회귀. baseline: 보존 native 코드의 계약, proxy 기대값을 현재 native로 조정한다.
- [x] P3 Integration Test: 전체 build·verify:concurrent·size·strict types/lint·`pnpm test` + base SSR + concurrent satellites로 B1/B4 중복 suite를 충족하고 Playwright 및 양코어 ESM/UMD/CJS package probe를 수행한다. baseline: 고정 B 번들·기존 공개 export와 비교한다.
- [x] P4 인계: source/artifact·로그·검증 JSON과 복원 보고서를 영구 보존하고 네 정본/HANDOFF에 완료·다음·블로커·커밋을 기록한다. 새로운 CPU 측정 없이 과거 B를 재사용했음을 공개한다.

## 공통 실행 규칙

- 시작 시 현재 diff·브랜치·HEAD와 두 저장소 상태를 저장한다. 사용자/다른 작업자의 변경을 덮어쓰지 않는다. 코어 후보는 독립 작업 공간 또는 파일별 원본 스냅샷으로 분리하며, 실험 중인 앱과 baseline 앱을 같은 이름으로 취급하지 않는다.
- 실험별 새 출력 디렉터리를 사용한다. 소스·빌드·의존 lock·러너·브라우저 실행 파일과 엔진 SHA-256, 머신/OS/Node, 시간·부하, 설정, raw samples, trace 위치, 실패 배치·재시도, 판정을 manifest로 보존한다. `/tmp`만을 최종 증거 저장소로 삼지 않는다.
- **계측 build와 공식 production build를 분리한다.** 성능 측정 중 빌드·단위 테스트·다른 벤치마크를 동시에 돌리지 않는다. 공식 warmup·CPU throttle·GC·paint 계산은 유지한다.
- 아래 기준 검사 묶음은 매 단계의 gate다. 같은 소스·번들·환경 해시에서 이미 통과한 결과는 재사용할 수 있다. 문서만 바뀐 경우 무거운 테스트를 다시 돌리지 않는다. 런타임 변경·실패·해결되지 않은 우려가 생기면 관련 검사를 다시 수행한다.
- **B1 기본 계약:** 변경 관련 공통 core 테스트를 base와 concurrent에 각각 실행하고, 해당 단계 종료 전에 `pnpm test:dual` 결과를 확보한다. 두 코어 중 하나를 수정하지 않더라도 공유 타입/helper 영향과 기본 동작을 확인한다.
- **B2 빌드·크기:** 필요한 타입/패키지 빌드를 통과하고 `pnpm size`의 기존 기준/실제 초과량을 공개한다. 현재 사용자 지시(R11/R34)는 렌더 성능 우선이므로 소폭 크기 초과만으로 CPU/메모리 평가를 멈추지 않는다. 기존 script의 실패를 통과로 표시하거나 영구 숫자 예산을 임의 변경하지 않는다. 최종 `pnpm build`와 `pnpm verify:concurrent`의 타입/코드생성·정합성 결함은 해결하며 크기 초과 결과는 위 정책으로 분리한다. 크기 스크립트는 파일이 없으면 skip하므로 대상 세 UMD가 존재하는지 먼저 확인한다.
- **B3 앱 계약:** 기존 `targeted-update.mjs contracts`와 `verify`에서 keyed, 9개 동작, glyph font, DOM 정체성·mutation·일괄 갱신 순서·재생성을 기준/후보 양쪽에 확인한다. 러너의 기존 계약 검사로 새 API 경로를 검증할 수 없는 경우 명시적으로 확장한다.
- **B4 전체 회귀:** `pnpm build`, `pnpm test`, `pnpm test:dual`, `pnpm test:e2e`를 최종 후보 해시에 대해 확보한다. 수정 파일의 ESLint/Prettier 및 `git diff --check`도 포함한다.

DC-22 최종 B1/B4 실행에서는 같은 최종 해시의 중복 suite를 재사용한다. `pnpm test`가 core/concurrent(+concurrent helper)와 base helper/devHelper/ftags/element를 포함하므로, base SSR과 `LITHENT_CORE=concurrent pnpm test:satellites`를 추가하면 `test:dual`의 모든 하위 gate를 충족한다. literal `pnpm test:dual`을 다시 실행했다고 기록하지 않고 명령별 로그와 동일 source/산출물 hash를 연결한다. base 단계에서는 상속된 `LITHENT_CORE`를 제거한다. 이는 위 동일 해시 재사용 규칙의 실행 방식이며 체크 범위를 줄이는 예외가 아니다.

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
- [x] **I 보존/독립 감사:** [보고서](../benchmark/NODE_SHAPE_RESULTS.md)·[raw/적용 manifest](../benchmark/node-shape-results.json)·[선택 패치](../benchmark/node-shape-candidate.patch)·[full 패치](../benchmark/node-shape-full-candidate.patch)·[증거](../benchmark/node-shape-evidence.json.gz)·[도구](../../experiments/node-shape/README.md)를 보존했다. 최종1,367entries/18packed rawlogs·33,532,074B·SHA-256 `86b390a2c9ed09503361cd474cd122dfe16677d5afc7405689b1d956024baaef`다.384분포/18가중·4,380IC access-site/724raw deopt·CPU1,160/메모리120/retention12/최종79파일 독립 감사 완료다.

판정: compact13을 기본 base에 반영했다. full22는 미채택 대안으로 유지한다. 전체 peer1.10 목표·다른 후보 연구·광범위 Phase5/6은 별도 미완료다. DOM/listener0을 전체 heap 누수 부재로, core/통합 검사를 전면 own-key 동등성으로 확대하지 않는다. compact13 구현은 이후 `ff8b80a`에 커밋·푸시됐으며 패키지는 릴리스하지 않았다.

### DC-22 — 종합 반영 실행 (Phase4A~4E)

실행 계약: [REQUIREMENTS R52~R61](./REQUIREMENTS.md#7-별도-브랜치를-포함한-종합-반영--dc-22), [DESIGN DC-22](./DESIGN.md#dc-22--별도-브랜치를-포함한-종합-반영). 이번 작업은 별도 실험 검토부터 실제 채택본 반영까지 포함한다. 계획 작성 완료와 아래 실행 완료를 구분한다.

#### Phase4A — 보존 실험 검토와 현재 기준선 고정

진입: 사용자 종합 반영 방향 확정. 종료: 모든 후보의 이번 역할과 현재 baseline/소스·도구·앱·브라우저가 manifest에 고정됨.

- [x] `6993a93`의 DC-19/19B/20/21 보고서와 flat 활성 source·trusted-click 재현을 읽고 후보 목록/우선순위를 정본에 반영했다. 이전 native 차이/버그·heap/dispatch 손해와 inline 이득을 함께 기록했다.
- [x] 현재 Git/sibling 상태, compact13 source/production3형식·의존 lock/러너/브라우저·엔진·환경 hash를 새 실행 manifest에 고정한다. 과거 Chrome155/156/Linux151 중 가용한 것을 임의 혼합하지 않고 이번 한 환경을 선택한다.
- [x] `7e838bc` flat / `189ddef` slot / `f997302` range / `3afd8de` snapshot / 현재 C2 patch를 비교한다. archive/재현 도구를 해시 검증해 새 staging으로 추출하고 원래 branch·raw·실험 앱을 보존한다.
- [x] 현재 API 문서와 native listener/ref/custom-element 소비자 사용을 조사해 DC-22-2의 필수 계약/대안표를 작성한다. 크기 허용은 확정 사항이며 다시 승인받을 진입 조건으로 삼지 않는다.
- [x] 기준 검사: B1/B2/B3의 baseline 증거를 확인하고 필요한 현재 해시 검사를 수행한다. 원래 앱/keyed9동작/font/DOM 정체성, 별도 이벤트 fixture의 현재 A→A/B 기대값, M-12~M-16의 입력 출처를 고정한다.

완료 근거: `comprehensive-initial-inputs.json`·`app-inputs.json`·`preserved-fragment-inputs.json`과 baseline242core/17declaration pairs,8앱 공통 DOM/공식 keyed9동작/font gate. 원래 앱과343설치 package metadata를 확인했고 runner 전용 배칭 기대를 peer 전체에 적용한 초기 gate 실패는 별도로 보존했다.

#### Phase4B — flat 이벤트 수정과 적용 계약 확정

진입: Phase4A의 frozen B와 재현 도구 준비. 종료: DC-22-1/2/4 결정 및 수정 E의 관련 회귀·production 앱 gate 통과. 성능 실측/채택은 다음 단계다.

- [x] 보존 flat에서 A 누락을 재현하고, 수정 E가 첫 A/다음 A,B를 요구하는 trusted 회귀를 추가했다. 원본 flat은 누락을 보이는 negative control이며 synthetic 회귀 통과와 구분한다. baseline/slot controls와 실제 trusted click을 포함한다. 기존 `knownFlatRegressionReproduced` 성공 로그와 수정 통과를 구분한다.
- [x] 기존 proxy 보존/lazy alias Set/native 경로의 상태·정리 모델을 확정하고 DC-22-1의 격리 구현·한정 검증을 닫았다. 큰 빈도/작은 빈도 경로와 메모리 비용을 기록한다.
- [x] native interop 조사·Preact11 고정 source 확인과 사용자 선택으로 DC-22-2를 닫았다. 기본 경로 보존/fallback 또는 명시적 opt-in 경계를 문서화한다. 외부 등록을 자동 검출한다고 가정하거나 성능 이득만으로 동작 차이를 숨기지 않는다.
- [x] `src/render.ts`·event utility·공유 unmount에 필요한 변경만 이식한다. callback `this`/currentTarget·object/frozen handler·alias dedup/독립 event·SVG/custom element·retained DOM·portal shared target을 검증한다.
- [x] base/concurrent proxy + 공유 teardown의 native 직접 등록 fallback으로 DC-22-4 범위를 닫았다. 격리 E의 공통/전용 concurrent329회귀를 통과했다. concurrent proxy를 선택하면 해당 구현/회귀를 별도 기록한다.
- [x] 기준 검사: 수정 E에 B1/B2/B3, M-14·M-15-S1. 이벤트 회귀는 base/concurrent에 실행하고 ESM/UMD/CJS 실제 공개 API·브라우저 검사를 수행한다. 기존 크기 초과는 수치로 기록하며 평가를 계속한다.

#### Phase4C — C2 재평가와 조합 준비

진입: Phase4A의 B 고정. E와 독립적으로 준비할 수 있으나 성능 수집은 직렬 수행한다. 종료: K와 EK가 관련 계약 gate를 통과하고4조건의 소스/빌드가 동결됨.

- [x] 보존 C2 patch를 compact13에 rebase했다. createWDom import context의 첫 적용 실패/부분 source를 보존하고 rebase patch를 따로 고정했다. 키 Map/관찰 순서·first duplicate·root frame proof 수명/throw/reentry·content/cleanup/mount queue를 유지한다. 추가 비용 절감 대안을 바꾸면 새 후보 해시와 이유를 기록한다.
- [x] K와 E를 합친 EK를 구성했고 K/EK 각각246core·4proof lifetime 회귀 포함·엄격 타입/빌드를 통과했다. event 중 renew/중첩 render·DOM setter·portal teardown이 proof 수명과 충돌하지 않는 회귀를 추가한다.
- [x] 별도 계측에서 render 임시 배열·인덱스 방문의 실제 제거량과 proof fallback 비용을 센다. E에는 native rebind 호출을 센다. 진단 코드를 timing 번들에 넣지 않는다.
- [x] 기준 검사: B/K/E/EK 관련 B1/B2/B3와 기존 `core-placementProof`·수명4회귀·M-3~M-6·M-15·M-16을 확보한다. 과거229/233/240통과를 새 해시 검증으로 대체하지 않는다. size 초과만으로 K/EK 실측을 생략하지 않는다.

#### Phase4D — 이벤트 앱과4조건의 실제 이득/비용 비교

진입: Phase4B/C의 구현·계약 gate 통과, frozen production artifacts와 사전 표본 계획. 종료: E/K/EK의 독립·결합 이득과 모든 대조군/비용이 보고되고 DC-22-5의 잠정 선택 근거가 있음.

- [x] 이벤트 전용4workload를 B/E/K/EK로 확장해2순서×4round×4workload×4조건=128fresh pages와 별도48GC contexts를 수집한다. C2와 이벤트의 UI 상호작용을 확인하기 위한 수집 전 확정이며 slot은 보존 재현 대조로 유지한다. mount·dispatch·100updates·10mount-dispose·즉시/settled 회수를 기록한다.
- [x] 실제 앱형 폼/목록에서 inline closure 갱신과 trusted input→최종 paint를 별도 측정한다. stable/noevent 대조·새 handler·삭제/중첩 갱신을 포함하고 event latency와 JS wall time을 구분한다.
- [x] 공식 원래 앱의9항목 합계145표본×B/E/K/EK4조건×2순서=CPU1,160, 공식 메모리5×3×4×2=120을 새 조건으로 수집한다. 조건 순서를 균형 배치하고 build/test/profiler와 병행하지 않는다.
- [x] 각 조건별3fresh context의100회 생성/clear·100회 partial과 최종 dispose에서 DOM/listener/heap 잔류를 검사한다. 이벤트 전용 GC 표본과 공식 메모리·retention을 합산하지 않는다.
- [x] 각 순서/pooled의 전체·JS·paint·분포·메모리MB·raw/gzip/br·실패/재시도를 독립 감사한다. E/B·K/B·EK/B·EK/E·EK/K를 보고하고 과거 개선율을 합성하지 않는다.
- [x] Fragment/C1/C3/C4의 이번 미반영 또는 추가 재개 이유를 기록한다. 최종 trace가 새 병목을 입증하면 수정 가설/기준 회귀·별도 조건을 추가하고 동일 gate를 적용한다.
- [x] 기준 검사: 수집 전후 source/앱/도구/browser hash·B3 및 표본 완전성·계산 감사, M-7·M-8·M-12~M-16. tiny/order-dependent 차이는 불확실로 남긴다.

#### Phase4E — 최종 선택과 전체 peer 목표 검증

진입: Phase4D의 잠정 선택 후보/근거. 종료: 현재 B/최종 후보/고정 네 peer의9항목 목표와 비용이 같은 환경에서 검증되고 DC-22-5가 확정됨.

- [x] 6앱 전체 CPU1,740·공식 메모리180을 양순서로 수집한다. 중복 앱 조건 제거/동일 해시 증거 재사용은 시작 전에 이유·범위·시간 간격을 manifest에 고정한다.9항목 중 일부만 실행하는 기존 peer `suite`로 대체하지 않는다.
- [x] 네 peer의 결과·항목별 최저 대비1.10 판정·차수별 일관성과 가중치/색상 계산을 보존한다. 일반 inline 앱의 이득과 원래 benchmark 목표 달성 여부를 각각 보고한다.
- [x] E/K/EK 중 최종 포함/제외와 heap·dispatch·mount·크기 교환을 정한다. 소폭 용량 증가만으로 재승인을 요구하거나 과거 guard 실패를 기각 근거로 대신하지 않는다. 미달 항목은 최종 기록에 남긴다.
- [x] 기준 검사: 모든 앱 B3·lock/source·실제 production/브라우저 hash·표본/분포/가중 통계 감사, M-7·M-16. 코드가 바뀌면 영향 있는 Phase4D/E를 새 후보로 재검증한다.

### 후속 채택 후보의 전체 성능 검증 — Phase4D/E 공통 기준

진입: 후보별 정합성/B1·B2 타입/빌드·앱/B3와 immutable production staging 완료, 실제 크기 비용 공개 및 R11/R34 평가 정책 적용. 소폭 크기 초과 단독 중단은 적용하지 않음. 종료: 모든 항목의 실제 이득/손해와 불확실성이 같은 환경에서 비교됨.

- [x] 같은 앱·helper의 core-only 대조 및 필요 시 동일 구조의 opt-in 대조를 분리. 원래 앱 대비 최종 앱 결과는 별도 표로 제공.
- [x] 전체 9 CPU 항목을 원순서·반대 순서로 측정. 기본 표본 계획은 선택 25개/다른 항목 15개씩, 두 앱×두 차수 580개이며 정확한 러너 버전·설정을 기록. 부족한 신뢰도나 실패가 있으면 이유와 추가 계획을 먼저 기록.
- [x] 코드/앱/Chrome 실행 파일·엔진 해시를 시작·종료에 확인. 실패 배치는 부분 표본을 섞지 않고 별도 디렉터리에 보존하여 재시도 trace가 덮어쓰이지 않게 함.
- [x] 공식 메모리 5개(21/22/23/25/26)를 같은 조건으로 비교. retention은 fresh context 3차수의 반복 생성/삭제·갱신과 GC 뒤 DOM/listener/heap을 기록하며 공식 메모리와 분리.
- [x] raw/gzip/brotli와 생성/clear/append 비용을 기록했다. startup·전송 latency 진단은 IC-1의 이번 범위 제외로 N/A다. 손해가 있어도 전체·상대 성능과 절대량으로 검토.
- [x] baseline+후보+IC-1의 React/Preact 비교군에 **전체 항목** 실행. 기존 `suite`는 peer CPU를 03/04만 실행하므로 전체 비교 완료 절차로 사용하지 않음.
- [x] 항목별 baseline·peer 비율/분포, 가중 전체 지표, 색상 계산 설정을 보존. 확정된 CPU1.10 항목별 목표를 판정하고 미정인 메모리 교환 상한과 구분한다.
- [x] 기준 검사: 시작 전 B3와 B1/B2 결과의 후보 해시 일치 확인, 종료 후 manifest·표본 완전성/실패 로그 감사, M-7·M-8. 성능 측정 중 무거운 테스트 실행 금지.

판정: 채택 검토/추가 실험/기각과 근거를 기록한다. 한 항목 회귀=기각, 메모리 증가=기각, 첫 차수 평균 개선=채택 규칙을 사용하지 않는다.

## Phase 5 — Test Hardening

진입: 검증할 후보의 구현·공개 계약이 안정됨. 종료: 정합성·수명·예외·메모리 회수의 회귀 위험을 검사함.

- [x] DC-22 최종 해시의 trusted/synthetic alias 전환·등록/삭제/교체·중첩 dispatch·전파 중 ancestor 갱신·stopImmediatePropagation·예외를 검사한다. native interop의 기대값은 확정된 DC-22-2 계약과 연결한다.
- [x] K/EK의 격리 event/proof·수명 회귀를 보존했다. 최종 E에는 proof가 없으므로 결합 proof hardening은 N/A다. E의 portal shared target·custom element·SVG·ordinary retained DOM과 양코어 commit/abandon을 전체 회귀/실제 package에서 확인했다. → M-15·M-16.
- [x] 공통 core suite: keyed 소비, 동일 VDOM 다중 위치·empty, 이동한 자식 renew, slot 참조, Fragment/portal/외부 형제, DOM 상태·focus 보존.
- [x] 같은 task의 부모/자식 양방향 갱신, 삭제 뒤 예약 갱신, render throw 후 큐 복구, 같은 컴포넌트 재예약, teardown 중 재진입.
- [x] concurrent: low 작업 중 high 갱신, 중단/재시작/abandon, live 연결 publication, commit 동등성, boundary pause/resume/dispose와 retention.
- [x] 생성 실패·unmount 뒤 metadata/callback/listener가 회수되는지 실브라우저에서 확인. 새 관리 구조가 있으면 반복 크기에 따른 잔류 기울기를 확인.
- [x] 기준 검사: B4 전체, 필요 시 기존 `pnpm test:e2e:mutations`와 관련 fuzz/seed 회귀. 관련 검사만 추가하고 변화 없는 구현을 재검증하려는 반복은 피함.
- [x] M-3~M-6·M-8 완료 및 실패 수정 기록. 수정된 후보의 성능 해시가 달라지면 Phase 4로 돌아가 필요한 비교를 다시 수행.

## Phase 6 — Integration Test와 채택·인계

진입: Phase 4의 비교 증거와 Phase 5의 정합성 증거가 동일 최종 후보를 가리킴. 종료: 최종 상태와 미달/미확정 항목을 포함한 재현 가능한 인계 완료.

- [x] DC-22 채택본을 현재 source와 필요한 공유 경로에 반영한다. 기본/호환/opt-in 및 concurrent 지원 범위의 API·문서·소비자 예제가 실제 코드와 일치해야 한다.
- [x] 최종 실제 ESM/UMD/CJS와 측정/검증 후보 hash를 대조한다. raw/gzip/br 증가·실측 근거에 맞춰 size guard를 갱신하고 `pnpm size`를 확인한다. 소폭 증가 수용 방향 안에서 구현하며 임의의 추가 여유나 새 전역 숫자 상한을 만들지 않는다.
- [x] 실제 package import로 base/concurrent·helper·JSX/SSR/hydration·element·예제 통합 확인. 선택적 API라면 비사용자 bundle과 실제 사용 bundle을 함께 확인.
- [x] 원래 upstream과 별도 staging의 `isKeyed`, 9개 동작·font·DOM 계약을 최종 산출물에 실행. 실제 upstream 앱 파일을 자동 교체하거나 PR을 올리지 않음.
- [x] IC-1/IC-2의 전체 비교·교환 판정을 보고서에 기록. 목표 미달/미정이어도 측정을 완료한 사실과 목표 달성은 구분.
- [x] 채택이면 정확한 후보 SHA와 산출물/테스트/성능 연결을 기록. 기각이면 자신이 만든 변경만 guarded restore하고 두 코어 빌드·핵심 회귀·원본 해시를 확인.
- [x] 새 실험 증거를 영구 보관하고 손실된 trace가 있으면 그 범위 명시. 각 보고서와 HANDOFF에서 정본 문서에 연결.
- [x] 기준 검사: 동일 해시의 B4 재사용 가능 여부 확인, 최종 package/브라우저 통합과 B2/B3, M-1~M-10의 해당 항목 완료·미실행 이유 기록.
- [x] done/next/blockers/실제 commit SHA로 인계. 커밋·푸시·릴리스는 당시 사용자 요청 범위에 따름.

## 재현 도구 사용 시 주의

현재 도구는 [targeted-update.mjs](../benchmark/targeted-update.mjs), [production-run.mjs](../benchmark/production-run.mjs)다. 실제 실행 전에 소스의 mode·환경변수를 확인한다.

- `LITHENT_BENCHMARK_ROOT`는 사용자 지정 sibling checkout, `LITHENT_PRODUCTION_OUT`은 매번 새 출력 경로, `LITHENT_CHROME_BINARY`는 고정 브라우저를 지정한다.
- core-only `prepare`는 **`LITHENT_BASELINE_SOURCE`와 `LITHENT_CANDIDATE_SOURCE`를 같은 보존 원본으로 명시**하고 `LITHENT_CANDIDATE_CORE`만 후보 ESM으로 지정한다. 기본값은 현재 upstream 실험 앱/targeted 후보를 사용하므로 그대로 실행하지 않는다.
- `contracts`, `verify`, `cpu`, `mem`, `retention` 모드를 분리해 실행한다. 반대 차수는 새 출력 위치와 앱 순서를 사용한다. `LITHENT_PRODUCTION_ALTERNATE_ORDER=1`과 실제 실행 순서를 manifest에 남긴다.
- React/Preact 비교군은 DC-16/IC-1의 고정 lockfile `react-hooks`19.2.0, `react-classes`19.0.0, `preact-hooks`/`preact-classes`11.0.0의 네 구현이다. peer를 재빌드하면 해시를 갱신하고 과거 다른 버전 수치와 섞지 않는다.
- 성능 검사에 브라우저 실행·네트워크·sibling 쓰기가 필요하면 해당 환경의 실행 권한 절차를 따른다. 원래 upstream 실험 앱을 보존하고 새 staging을 사용한다.

## 실행 결정 대장

- [x] **IC-0 확정:** Phase 1·C1 검증/복원 뒤 C3 DC-4 계약·기준 회귀를 `ddd545e`에 커밋했다. 이어 C3 base 한정 구현/검증과 증거 보존·baseline 복원까지 완료했다. 그 결과를 `d660fdf`에 커밋한 뒤 DC-12 별도 렌더러·비참여 580표본까지 검증했다. DC-13 통제 앱 CPU/메모리·DC-14 heap 귀속·DC-15 실제 캐시 앱 대조도 완료했다. 현재 C3는 기존 앱 개선안으로 채택하지 않는다. DC-16 전체 peer 기준·진단 뒤 DC-17 C2 sidecar 프로토타입의 한정 검증/계측·size 탈락·증거 보존으로 실험을 종료했다. DC-17 당시 다른 후보·최종 채택은 미완료였다. 후속 DC-22의 E 반영 완료는 IC-4·IC-6에 기록한다.
- [x] **IC-1 CPU 확정:** 사용자2026-10-23 선택으로 고정 React/Preact hooks/classes 네 peer 최저 전체 시간 중앙값 대비1.10배 이하를9항목 전부 만족하는 목표를 택했다. DC-16의 같은 차수 합산/차수별 수치와 upstream 가중치/색상 함수를 보존한다. memory·size는 별도 비용, startup은 이번 범위 제외이며 최종 메모리 교환 상한은 IC-2에 남긴다.
- [x] **IC-2 E 교환 판정 완료:** E 단독을 일반 UI 이득과 UMDbr+182B·공식10k+0.912574MB(+3.24%)·dispatch 비용으로 선택했다. 향후 모든 후보에 적용할 숫자 상한은 새로 만들지 않았다. 후보별 시간·메모리 교환은 실제 절대량과 전체/peer 비교 뒤 판단하며 특정 퍼센트를 사용자 합의로 꾸미지 않음.
- [ ] **IC-3 조건부 TBD(이번 E에는 N/A):** 기본 경로 격리는 DC-12에서 검증했지만 별도 렌더러는 br 5,691B다. 기능 이득·비용을 본 뒤 공개 경로/별도 예산을 결정한다. 기존 한도 변경이나 초과 해소로 표시하지 않는다.
- [x] **IC-4 E 단독 반영 완료:** 최종 채택은 E 단독이다. K/EK는 재평가했으나 추가 앱 이득이 작고 엇갈려 보류했다. C1/C3/C4·Fragment도 보고서의 명시한 재개 조건으로 보류하며 독립·결합 증거를 보존했다.
- [x] **IC-5 실행 순서 확정:** DC-22 Phase4A~4E→5→6. flat 이벤트 수정과 C2/결합 비교를 실제 반영 후보로 다룬다. 후보 검토 완료와 새 구현/공식 측정 완료를 구분한다.
- [x] **IC-6 실행 완료:** DC-22-1/2/4 계약·구현과 DC-22-5 최종 선택을 닫고 측정 artifact·회귀·size guard·채택 source를 일치시킨다. → M-15·M-16.

### DC-22 계획 문서 검증 — 2026-10-25 (계획 시점 이력)

- [x] 정본4문서와 HANDOFF의 로컬 경로/앵커238개, 보존 브랜치 고정 링크18개의 Git object 존재, R52~R61/DC-22-0~6/Phase4A~4E/M-12~M-16의 연결과 표본 산식을 확인했다.
- [x] 현재 compact13 archive의 SHA-256·gzip33,532,074B·1,367entry를 확인하고 오래된 최종 증거/커밋 표기를 정정했다. Prettier와 `git diff --check`를 통과했다. 이번 변경은 문서5개이며 runtime 테스트/성능 수집은 미실행이다.

## 상태 / 핸드오프

- done: DC-23 compact13/native 복원·검증을 유지한다. DC-24 추가 크기 조사에서 출력41개/실제 빌드12개를 비교했고 hidden map의 동일 실행 AST·소스맵6형식을 확인했다. [조사 결과](../benchmark/BUNDLE_SIZE_RESULTS.md)·[검증](../benchmark/bundle-size-proof.json)에 연결한다. 기본 runtime/빌드와 DC-23 증거는 그대로다.
- next: 이번 번들 조사는 완료했다. hidden map은 Brotli26B를 줄이지만 자동 디버깅 연결을 잃어 기본 변경은 추천하지 않는다. 구문 압축은 추가9~16B 후보로 보류하며 runtime/heap/performance를 검증하지 않았다. 사용자는 추가 축소를 보류하고 현재 설정 유지를 확정했다. 새로운 구조 후보·CPU6/9 목표 연구·배포는 별도 요청에 따른다.
- blockers: 조사 실행 블로커 없음. 미채택 구문 후보의 추가 검증은 미실행으로 명시한다.
- commit: DC-23 복원·검증과 DC-24 조사 구현 커밋은 `4baf0e51483134ab3426817035e06e21f0285022`다. 후속 인계 문서 커밋을 포함한 tip은 `git log -1` 및 브랜치 ctxbin 최신 인계로 확인한다. native B `fb481f3`, compact13 `ff8b80a`, 보존 E `95d6faf`. 원자료의 `463c6cd`/uncommitted 표시는 검증 당시 기준이며 수정하지 않는다.
