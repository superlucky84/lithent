# IMPLEMENT — 코어 구조 개선 실행 계획

- 기준일: 2026-10-21. 상태: **Phase 1 완료, 다음은 C1 한정 프로토타입의 구현 전 결정. Phase 2 이후 미착수**.
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 이 문서의 체크박스는 실제 완료만 표시한다. 명령·검사 계획과 실행 증거를 구분하며, 아직 결과가 없는 항목은 완료로 표시하지 않는다.

## 공통 실행 규칙

- 시작 시 현재 diff·브랜치·HEAD와 두 저장소 상태를 저장한다. 사용자/다른 작업자의 변경을 덮어쓰지 않는다. 코어 후보는 독립 작업 공간 또는 파일별 원본 스냅샷으로 분리하며, 실험 중인 앱과 baseline 앱을 같은 이름으로 취급하지 않는다.
- 실험별 새 출력 디렉터리를 사용한다. 소스·빌드·의존 lock·러너·브라우저 실행 파일과 엔진 SHA-256, 머신/OS/Node, 시간·부하, 설정, raw samples, trace 위치, 실패 배치·재시도, 판정을 manifest로 보존한다. `/tmp`만을 최종 증거 저장소로 삼지 않는다.
- **계측 build와 공식 production build를 분리한다.** 성능 측정 중 빌드·단위 테스트·다른 벤치마크를 동시에 돌리지 않는다. 공식 warmup·CPU throttle·GC·paint 계산은 유지한다.
- 아래 기준 검사 묶음은 매 단계의 gate다. 같은 소스·번들·환경 해시에서 이미 통과한 결과는 재사용할 수 있다. 문서만 바뀐 경우 무거운 테스트를 다시 돌리지 않는다. 런타임 변경·실패·해결되지 않은 우려가 생기면 관련 검사를 다시 수행한다.
- **B1 기본 계약:** 변경 관련 공통 core 테스트를 base와 concurrent에 각각 실행하고, 해당 단계 종료 전에 `pnpm test:dual` 결과를 확보한다. 두 코어 중 하나를 수정하지 않더라도 공유 타입/helper 영향과 기본 동작을 확인한다.
- **B2 빌드·크기:** 필요한 패키지를 빌드하고 `pnpm size`로 기존 한도를 확인한다. 최종 단계에서는 `pnpm build`와 `pnpm verify:concurrent`도 통과해야 한다. 크기 스크립트는 파일이 없으면 skip하므로 대상 세 UMD가 존재하는지 먼저 확인한다.
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

이번 분기: 일반 nested slot에서도 반복 검색 증가가 재현되어 **다음은 C1 한정 프로토타입**이다. original/Table의 전체 순회 해결책으로 설명하지 않는다. C2는 실제 시간상 기각 없이 보류하고, C3의 필요 근거인 parent-refresh updater n+1을 후속 연구로 유지한다. C1의 DC-6 하위 결정을 닫기 전에는 Phase 2 구현 완료로 표시하지 않는다.

## Phase 2 — 기존 계약 안의 내부 후보 C1/C2

진입: Phase 1에서 해당 비용이 확인되고 DC-6의 저장/진입 방식이 정해짐. 종료: 후보별 정합성·작업량 감소 여부·비용이 기록되어 다음 분기로 판단 가능.

- [ ] C1/C2를 한 후보씩 구현. 파일 책임은 DESIGN의 모듈 표를 따른다. 서로 다른 후보를 처음부터 합쳐 효과를 섞지 않는다.
- [ ] 구현 전에 실제 위험을 재현하는 최소 회귀 사례 추가: 위치 stale 후 자체 renew, slot 공유, same-order 중복 키, keyed/unkeyed/null 전환, cache empty 전환 등. 구현을 그대로 흉내 내는 테스트는 만들지 않는다.
- [ ] fallback과 lifecycle 순서가 기존 결과와 같은지 확인. concurrent 이식 여부는 구조 적합성을 검토한 뒤 정하며, 미이식이면 그 범위를 명시한다.
- [ ] 진단 카운터로 제거 작업뿐 아니라 인덱스 유지·Set 검사·메모리/생성 비용을 기록. 전체 O(n) 검사가 남으면 그대로 명시.
- [ ] 공식 전체 CPU 사전 비교로 다음 후보 진행 여부를 판단. 일부 회귀 자체는 탈락 사유가 아니며 작은 신호만으로 채택하지 않음.
- [ ] 기준 검사: 변경마다 관련 base/concurrent 회귀, 단계 종료 B1·B2·B3, M-3~M-6. 동일 후보 해시의 이미 확보한 결과는 재사용.

분기: 내부 후보로 충분한 이득이 보이면 Phase 4로 진행할 수 있다. 기존 정보의 한계가 주요 원인이면 Phase 3을 구체화한다. 효과가 없으면 소스·측정·기각 이유를 보존하고 baseline으로 복원한다.

## Phase 3 — 추가 계약이 필요한 후보 C3/C4 (조건부)

진입: 내부 최적화만으로 남는 작업과 정보 부족이 설명됨. 먼저 DC-4 또는 DC-5의 계약을 구체화하고, 해당 결정이 닫힌 후보만 구현에 진입한다. 종료: 채택 여부를 비교할 수 있는 동작·API·비용 증거가 있음.

- [ ] C3의 기존 API 조합/옵트인 새 계약 중 선택. deps·props/children 무효화, 자체 renew, callback, 부모/자식 동시 갱신, disposal을 구현 전에 DESIGN에 확정 기록.
- [ ] C4가 필요하면 목록 소유권·구조 version·dirty item·외부 mutation·fallback을 정의. C4를 구현하지 않는다면 이유와 연구 상태를 남기고 완료로 체크하지 않음.
- [ ] 공개 API 이름/위치/타입이 추가되면 사용 예제와 비사용자의 기본 동작을 함께 검증. 기존 retainedView/renderBoundary 의미를 재정의하지 않음.
- [ ] 기준 행 컴포넌트 앱과 새 기능 앱의 구조를 가능한 한 같게 유지한 대조를 준비. 일반 편집 목록 또는 nested 입력 UI를 추가해 benchmark 특수 동작이 아님을 확인.
- [ ] 코어/helper/API를 함께 바꾸는 경우 현재 staging 도구가 후보 helper를 정말 사용하는지 검증하고 필요한 지원을 명시적으로 추가. 현재 `targeted-update.mjs prepare`는 helper를 설치된 npm 패키지에서 복사한다.
- [ ] 기준 검사: B1·B2·B3 + 새 계약의 양쪽 코어 테스트·타입/exports·수명/경계 검증, M-4~M-6. 새 API가 concurrent 미지원이면 지원 범위와 안전한 실패를 명시.

분기: API/메모리/번들 비용이 목표에 맞지 않으면 미채택으로 보존한다. 한도 변경은 IC-3에서 구체적인 수치와 대안을 검토하며 기존 게이트를 임의 수정하지 않는다. 일상적인 내부 구현 선택마다 사용자 재승인을 요구하지 않는다.

## Phase 4 — 전체 성능과 교환 비용 검증

진입: 후보별 B1~B3 통과 및 immutable production staging 완료. 종료: 모든 항목의 실제 이득/손해와 불확실성이 같은 환경에서 비교됨.

- [ ] 같은 앱·helper의 core-only 대조 및 필요 시 동일 구조의 opt-in 대조를 분리. 원래 앱 대비 최종 앱 결과는 별도 표로 제공.
- [ ] 전체 9 CPU 항목을 원순서·반대 순서로 측정. 기본 표본 계획은 선택 25개/다른 항목 15개씩, 두 앱×두 차수 580개이며 정확한 러너 버전·설정을 기록. 부족한 신뢰도나 실패가 있으면 이유와 추가 계획을 먼저 기록.
- [ ] 코드/앱/Chrome 실행 파일·엔진 해시를 시작·종료에 확인. 실패 배치는 부분 표본을 섞지 않고 별도 디렉터리에 보존하여 재시도 trace가 덮어쓰이지 않게 함.
- [ ] 공식 메모리 5개(21/22/23/25/26)를 같은 조건으로 비교. retention은 fresh context 3차수의 반복 생성/삭제·갱신과 GC 뒤 DOM/listener/heap을 기록하며 공식 메모리와 분리.
- [ ] raw/gzip/brotli, 생성/clear/append의 비용, startup·전송량 진단을 별도 기록. 손해가 있어도 전체·상대 성능과 절대량으로 검토.
- [ ] baseline+후보+IC-1의 React/Preact 비교군에 **전체 항목** 실행. 기존 `suite`는 peer CPU를 03/04만 실행하므로 전체 비교 완료 절차로 사용하지 않음.
- [ ] 항목별 baseline·peer 비율/분포, 가중 전체 지표, 색상 계산 설정을 보존. 임계치 미확정이면 수치와 표를 제공하되 전 항목 목표 달성 판정은 미정으로 남김.
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
- React/Preact는 고정 lockfile의 `react-hooks`, `preact-hooks`, `react-classes`, `preact-classes`를 우선 후보군으로 기록하되 최종 표 포함 범위는 IC-1에서 확정한다. peer를 재빌드하면 해시를 갱신하고 과거 다른 버전 수치와 섞지 않는다.
- 성능 검사에 브라우저 실행·네트워크·sibling 쓰기가 필요하면 해당 환경의 실행 권한 절차를 따른다. 원래 upstream 실험 앱을 보존하고 새 staging을 사용한다.

## 실행 결정 대장

- [x] **IC-0 확정:** 앞선 문서/계획은 Phase 0에서 완료했고, 2026-10-21 후속 착수 요청으로 Phase 1을 완료했다. 다음은 C1 한정 프로토타입의 구현 전 결정이다. 후보 구현은 각 단계 진입 조건을 따르며, 실행 결과가 없는 항목은 미완료로 유지한다.
- [ ] **IC-1 TBD:** 최종 표의 비교군, 정규화·색상/통계 모드, CPU/메모리/startup 표시 범위, 빠른 구간의 수치 임계치. Phase 1에서 제안·기록하고 Phase 6 목표 판정 전에 닫음.
- [ ] **IC-2 검증 대기:** 후보별 허용할 시간·메모리 교환. 실제 절대량과 전체/peer 비교 뒤 판단하며 특정 퍼센트를 사용자 합의로 꾸미지 않음.
- [ ] **IC-3 조건부 TBD:** 크기 한도 초과 후보의 격리·상쇄·예산 재검토. 초과가 없으면 해당 없음으로 닫음. 한도 변경은 별도 명시적 결정.
- [ ] **IC-4 검증 대기:** C1/C2/C3/C4 중 최종 채택 조합. 각 후보의 독립 결과 뒤 결합 상호작용을 확인.

## 상태 / 핸드오프

- done: Phase 0 계획과 Phase 1 기준선 동등성·38개 진단·B1~B3 완료. 보고서·raw·영구 증거·재현 도구를 연결하고 후보 분기를 기록했다. 새 코어 후보 구현·공식 CPU/메모리 실측은 없다.
- next: DESIGN DC-6에서 C1의 컴포넌트 소유 hint 저장·유지·concurrent publication을 확정한 뒤 Phase 2 한정 프로토타입을 진행한다.
- blockers: 현재 없음. 선택적 후보의 공개 계약과 최종 성능 목표의 미확정은 각 단계에서 관리.
- commit: 런타임 기준 `085137b0447a8bbe7d28d3bf55c0a997779132b2`; Phase 0 문서 `dbbd320a5b92c63262d43b667692396ae5d53322`. 이번 실행 변경은 미커밋.
