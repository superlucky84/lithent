# IMPLEMENT — 코어 구조 개선 실행 계획

- 기준일: 2026-10-30. 상태: **DC-27 수동 정적/동적 blueprint 검증을 완료하고 미채택으로 판단했다. stock/control/candidate CPU870·메모리90 양순서에서 candidate/stock 가중 전체 −0.04%(main+2.38/reverse−2.07), JS+2.98%다. 부분 갱신은 전체−12.33%/JS−20.09%지만 10k 메모리+1.44025MB(+5.11%)·앱 Brotli+1,472B다. V1은 보완 전 부분 수집으로 분리 보존하며 최종 V2에 합산하지 않는다. 기본 runtime/guard·공개 API와 이전 C4 증거는 유지한다. 자동 compiler/제품 지원은 별도다.**
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 이 문서의 체크박스는 실제 완료만 표시한다. 명령·검사 계획과 실행 증거를 구분하며, 아직 결과가 없는 항목은 완료로 표시하지 않는다.
- 완료한 DC-22 실행 순서: [Phase4A~4E](#dc-22--종합-반영-실행-phase4a4e) → [Phase5](#phase-5--test-hardening) → [Phase6](#phase-6--integration-test와-채택인계). 앞선 Phase0~4의 완료 기록은 보존하며, 과거 size 중단·미채택을 현재 후속의 자동 종료 조건으로 쓰지 않는다.

## DC-27 — 실행 G0~G4

- [x] **G0 계약/대조:** 진입은 사용자 1번 선택과 clean HEAD `4109bd3`, 기준은 정적 정보를 쓰지 않는 현재 A 앱이다. R101~R106/DC-27-1~6/M-24와 stock/control/candidate 범위를 정했다. 종료는 정보·소유권·fallback·지원 제한과 측정 계획 확정이다.
- [x] **G1 격리 구현/작업량:** 진입은 G0. base 사본과 수동 blueprint를 구현하고 일반 HTML 목록에서 생성/방문·slot 비교/DOM writes·fallback을 계수한다. 종료는 기대 작업 감소와 남는 전체 keyed 순회·추가 allocation 확인이다.
- [x] **G2 Test Hardening:** 진입은 G1. strict types와 정상 h/core 회귀, static/dynamic/clone/retired/pending/keyed 이동/수명/오류를 검증한다. 기존 portal BUG-3은 해결한 것으로 표시하지 않는다. 종료는 후보 계약과 일반 경로 정합성 통과다.
- [x] **G3 Integration Test/측정:** 진입은 G2와 source/app/browser/runner hash 고정이다. Chrome 일반 fixture/retention와 3앱 공식 keyed/9동작/font 뒤 CPU870·메모리90을 양순서 직렬 수집한다. 종료는 independent 분포/가중/비율·크기·입력 감사다. 수집 중 build/test/profile/다른 benchmark를 실행하지 않는다.
- [x] **G4 판단/보존:** 진입은 G3. 실제 소스/patch/번들·raw/trace·실패·재현 도구와 결과를 별도 archive에 보존한다. 종료는 네 정본/HANDOFF·채택 또는 보류 이유와 다음 단계 일치다. 자동 compiler/제품 기본 지원·release는 별도다.

## DC-26 — 진단과 조건부 후속 계획

R80~R84 / DC-26-1~6 / M-21. **D0 완료 후 사용자 요청으로 D1/D2 및 한정 D3/D4 실험을 진행 중이다.** 제품 수준 양코어/SSR/HMR 통합과 최종 API 채택은 별도다.

### D0 — 기록 대조와 진단 (완료)

진입: 사용자 원인 분석 요청, HEAD `4de76ef`. 기준 검사: clean tree, 최신 DC-25 및 10월 28일 미채택 기록, 현재 source/peer source. 종료: 재계산 가능한 격차·기시도 표·관찰 반례·미결정 개선안을 연결한다.

- [x] DC-25 baseline/Preact class 9항목과 전체/JS/paint 가중 비율을 재계산했다.
- [x] 현재 source와 로컬 Preact class/Vue 앱, 공식 문서를 대조했다. Vue timing/컴파일 산출물 부재를 명시했다.
- [x] 부모 getter 생성 시 대입 제거의 메모리 내 negative control을 실행했다. 최종 HTML은 같아도 render 전/mountReady의 부모 관찰은 다르다.
- [x] [보고서](../benchmark/RENDER_GAP_DIAGNOSIS.md), [JSON](../benchmark/render-gap-diagnosis.json), [재현 도구](../../experiments/render-gap-diagnosis/analyze.mjs)와 네 정본을 연결했다. 제품 소스/빌드/guard는 변경하지 않았다.
- [x] 별도 Python으로 입력/소스/snapshot 해시, 가중 비율 3개, 9항목 표본 수를 검산했다. 상대 파일 링크 199개·변경 문서/도구 포맷·`git diff --check`를 확인했다. 새 runtime이 없어 전체 suite는 재실행하지 않았다.

### D1 — 정보 계약 설계 (첫 격리 계약 확정)

진입: DC-26-5 또는 6의 후속 방향 선택. 기준: 기존 C4/DC-5와 targeted/C3의 상쇄 비용. 종료: 정보 생산자·소유권·외부 mutation 처리·fallback·lifecycle/재진입·양코어 지원·크기 비용의 계약을 닫는다.

- [x] C4를 선택하고 DESIGN DC-26-C4-P1로 정보 생산자·소유권·key/출력 제한·scheduler/dispose·양코어 비범위를 정했다. 일반 편집 목록에서 명시적 key 알림과 구조 변경을 검증한다.

### D2 — 격리한 원리 검증 (첫 C4 실험 완료)

진입: D1 계약 확정. 기준: 같은 앱 구조의 구기능/새 기능, 기존 A 앱은 별도 대조. 종료: n=1k/10k × k=1/2/100/1k의 작업량·오류·할당과 생성/교체/삭제 비용을 확보한다.

- [x] 진단과 production 빌드를 분리했다. C4의 새 API 이득을 기존 앱 무수정 이득으로 표시하지 않는다. 실험 후 코드가 같아지는 경우도 유지 비용을 공개한다. 이번 첫 비교는 두 앱 모두 source core를 같은 Vite 설정으로 앱과 함께 묶으며, 배포된 prebuilt core와 과거 수치를 직접 연결하지 않는다.

#### D2 첫 C4 한정 검증

- [x] plain keyed item의 O(k) slot 갱신과 구조 변경의 전체 keyed fallback, key/index Map·자체 scheduler/dispose를 구현했다.
- [x] strict source/core/B/C types, JSDOM 일반 목록22회귀, 공식 B/C keyed/9동작/font, Chrome9진단과 조건별3contexts retention을 통과했다. 실패 setup/타입 수정 전 입력도 보존했다.
- [x] CPU9항목×양순서580표본과 공식 메모리60표본 수집 완료. 과거 peer와 합산하지 않았다.
- [x] 공식 메모리60표본·독립192분포/9가중값/표본/순서/번들 감사·영구 보존과 [보고서](../benchmark/C4_LIST_BOUNDARY_RESULTS.md)를 완료했다. 아래 D3/D4의 전체 제품 지원 범위를 완료한 것으로 표시하지 않는다.

### D3 — Test Hardening (제안, 미착수)

진입: D2에서 구현 후보를 남길 근거 확보. 기준: 공통 B1, 부모 반례, key/slots/portal/focus/native/lifetime 회귀. 종료: invalidation 누락·throw/reentry·clone/dispose·concurrent interrupt/abandon을 검사하고 오류 후보를 배제한다.

- [ ] 변경 관련 양코어·helper 회귀와 수명 검증, 필요한 브라우저 계약을 수행한다.

### D4 — Integration Test와 성능 판정 (제안, 미착수)

진입: D3 정합성 통과. 기준: 공통 B2~B4와 새로 고정한 도구/브라우저·앱/peer. 종료: 공식 9항목 양순서·메모리·크기·일반 예제·통합을 확인하고 후보를 채택/보류한다. Vue 비교를 주장하려면 같은 실행에 Vue를 포함한다.

- [ ] 기존 네 peer의 항목별 1.10 목표와 Vue 추가 비교를 구분한다. JS만 좋아지거나 작은 pooled 차이만 있는 경우 전체 개선을 단정하지 않는다. 후보/실제 산출물 해시·미실행 검증·인계를 보존한다.

## C4 P2 — 후속 실행 E0~E4

- [x] **E0 계약:** R89~R94와 P2-1~5를 기록했다. 진입은 사용자 후속 요청, 기준은 P1 원자료/소스 보존. 종료는 owner·배치·오류·지원 범위와 수집 계획 확정이다.
- [x] **E1 구현/기준:** 별도 owner controller/View와 edit·세션 cleanup·fault 처리를 구현한다. baseline은 P1의 raw node와 기존 base 문맥이다. 종료는 parent renew/중첩/queue/오류 회귀와 strict types 통과다.
- [x] **E2 Test Hardening(한정):** 제거/재마운트·중첩 자체 renew/Fragment/portal·callback 재알림·두 owner 거부·throw/reentry/focus·retention을 확인한다. 진입은 E1, 종료는 한정 계약 회귀와 실제 Chrome 정합성 통과다.
- [x] **E3 Integration Test/측정(한정):** source core/B/C와 고정 Preact class를 빌드하고 공식 keyed/9동작/font 뒤 CPU870/메모리90을 양순서 직렬 수집한다. 진입은 E2와 고정 manifest, 종료는 원자료·분포·실제 비용·peer 비교의 독립 검산이다. 전체 제품 D3/D4 지원 완료로 표시하지 않는다.
- [x] **E4 보존/판단:** 실제 후보 source/bundle과 원자료/trace/실패를 새 archive에 보존하고 네 문서/HANDOFF를 맞춘다. 진입은 E3, 종료는 검증된 범위와 미지원 경계·다음 단계·최신 commit을 재현 가능하게 남기는 것이다.

- [x] **E3 추가 진단(R95):** 기존 선택150trace의 선정 이벤트 coverage/구간을 확인했고 GC 주원인이나 scheduler 원인으로 단정하지 않았다. 별도 class 표현 앱은 DOM/keyed/9동작/font 뒤 선택100표본을 양순서 수집했으나 전체 방향이 갈려 미채택이다. 다중 root 교체 오류 후 owner remount도 별도 확인했다.

## C4 P3 — 실행 F0~F4

- [x] **F0 커밋/계약:** 브랜치 생성과 기존43파일/증거 커밋 `7f4df5c` 완료. R96~R100·P3-1~5·M-23을 작성했다. 종료는 P2 기준 소스와 한 변수 범위 확정이다.
- [x] **F1 구현/작업량:** 별도 P3 snapshot을 구현하고 P2 대비 keyOf/Map.get과 snapshot 쓰기를 계수한다. 진입은 F0, 기준은 커밋의 P2, 종료는 keyOf/Map.get 실제 계수와 코드상 n snapshot 쓰기/저장 비용 확인이다.
- [x] **F2 Test Hardening(한정):** 기존 owner19/Chrome12·앱9와 key mutation·세대 분리·retry/remount/dispose를 검증한다. 진입은 F1, 종료는 strict types와 같은 계약 통과다. portal BUG-3은 기존 한계로 남긴다.
- [x] **F3 Integration Test/측정:** 새 P2/P3/Preact class3앱 keyed/9동작/font 뒤 CPU870·메모리90을 양순서 직렬 수집한다. 진입은 F2와 입력 해시 고정, 종료는 분포·가중·peer·메모리/크기의 독립 감사다.
- [x] **F4 판단/보존:** 후보 채택/보류 이유, 실제 소스/번들·원자료/trace·실패와 감사를 새 archive에 보존한다. 진입은 F3, 종료는 네 문서/HANDOFF·명령·최신 commit·다음 단계가 일치하는 것이다. 제품 기본 반영/공개 API는 별도다.

## DC-25 — 실행 계획

최종 상태: 첫 후보는 전체 이득 불확실·목표 개선 없음·size +268B를 근거로 미채택이다. 아래 체크의 조건부 조기 반환은 관찰 회귀로 제외했고, allowance 변경/실제 기본 반영/복원은 기본 소스를 수정하지 않아 N/A다. 후보와 최종 default의 검증을 구분하며 전체 B4는 default pnpm test1,008 + SSR15 + concurrent satellites172, 각각의 browser78 및 동일 default build hash 재사용으로 충족했다.

이번 첫 후보의 실행 순서는 아래 P0~P5다. 뒤의 기존 Phase 0~6/DC-17~24 완료 체크는 과거 검증이며 새 기준선/후보의 완료로 재사용하지 않는다. 각 단계는 R72~R79, DESIGN DC-25-1~7, MANUAL M-20과 연결한다.

### P0 — 분기와 문서 정리

진입: 1.25.3 배포 및 main에서 새 브랜치로 진행하라는 사용자 요청. 종료: 분기 기준·확정 정책·단계별 미결정과 네 정본의 연결이 일치한다.

- [x] `git fetch origin main --tags` 후 clean main `14d47e83770958eb78a91c564bf39e47c4a25dba`에서 `perf/dc25-keyed-fast-path` 생성. 릴리스 태그 `7842b57cf400834ce65ecad703bd4babb6c9249c`, package 1.25.3 확인.
- [x] 로컬 designer agent/skill을 읽고 REQUIREMENTS → DESIGN → IMPLEMENT → MANUAL 순서로 초안 작성. 사용자 선택인 중복 key 유지·초과 후보 실측을 반영.
- [x] 기준 검사: 문서 상대 링크/앵커 266개, R72~R79·DC-25-1~6·P0~P5·M-20 매핑, 변경 문서 5개의 Prettier와 `git diff --check`를 통과했다. 변경 범위는 문서 5개뿐이며 runtime/lock/기존 증거는 변경하지 않았다. 문서만 변경해 런타임 테스트는 실행하지 않았다.

### P1 — 현재 main 기준선과 회귀 고정

진입: P0 문서 검사 완료. 종료: 실제 도구/브라우저·앱·러너·코어/산출물·기준 관찰이 고정되고 P2의 설계 선택에 필요한 증거가 있다.

- [x] 새 출력 경로를 선택하고 manifest를 만든다. 위치는 `experiments/dc25-keyed-fast-path/`와 `docs/benchmark/DC25_KEYED_FAST_PATH_RESULTS.md`다. 기존 archive·`/tmp` 완료 배치를 덮어쓰지 않는다. sibling 저장소의 branch/HEAD/diff와 원래 cached 앱을 확인하고 별도 staging으로 추출한다.
- [x] Node 24.22.1·pnpm 12.15.0·현재 lock/의존성, 머신/OS·browser/V8 실행 파일 해시와 CPU·GC·warmup 설정을 고정한다. 과거 hard-coded Chrome/Node 경로를 새 환경과 혼용하지 않는다. 브라우저 버전/해시·실제 러너별 표본 수는 이 단계에서 확정한다.
- [x] 기준 회귀: `core-keyedConsumption`, `core-placementProof`, `core-cachedIdentity`, loop move/lifecycle, structural/fuzz, portal siblings를 base/concurrent에서 확인한다. 새 getter/throw·callback 후속 key mutation·중복/±0·자체 renew·same-object metadata 사례도 먼저 baseline 기대값으로 고정한다. 기존 코어 차이는 기록하고 한쪽 기대값을 다른 쪽에 강제하지 않는다.
- [x] 기준 B1/B2/B3: 양코어 관련 회귀와 `test:dual` 하위 suite, 필요한 core/concurrent/element 빌드·strict types, 세 UMD 존재·`pnpm size`, 원래 앱 contracts/keyed 9동작/font/DOM 정체성을 확보한다. baseline의 raw/gzip/br와 실제 guard 결과를 기록한다.
- [x] getter/콜백의 key 관찰 순서와 중간 fallback 요구를 원자료로 남기고 DC-25-4의 매칭·증명 저장 방식을 P2 코드 작성 전에 문서로 확정한다. Set/snapshot·list 필드·root sidecar의 작업/shape/수명 비용과 탈락 사유를 기록한다. 안전한 Map 생략을 설계하지 못하면 그 부분을 보류하고 평가 범위를 명시한다.

### P2 — 격리 결합 후보와 구조 검증

진입: P1 기준선 및 DC-25-4 확정. 종료: 현재 계약을 만족하는 base 결합 후보와 제거 작업/fallback 비용, 다음 공식 측정의 정확한 해시가 있다.

검증 시점 정리(2026-10-27): baseline의 전체 `test:dual`은 P1에서 확보했다. 후보의 P2 진입 검사는 frozen 공통 core·unchanged concurrent·proof lifetime·타입/빌드·B3 앱 계약이며, 후보를 연결한 전체 satellite/패키지 `test:dual` 하위 suite는 P4/P5에서 채택 전에 확보한다. 기존 공통 B1의 전체 범위를 완료한 것으로 표시하지 않는다. 동일 최종 해시라면 이 검증 순서 때문에 성능 표본을 중복 수집하지 않으며, 수정이 생기면 P2/P3 관련 검사를 다시 수행한다.

- [x] 소스/빌드 사본으로 base 후보를 격리한다. 순서 유지 매칭과 render 재분석 생략을 함께 구현하고 keymatch/ordered 단독 재실험을 반복하지 않는다. 동일 VDOM 조기 반환은 정합성 대조 후 조건부로 추가한다.
- [x] 기준 회귀: P1 사례를 동일 baseline/candidate에서 대조한다. 중복/중간 mismatch에서 prefix diff·callback이 재실행되지 않고 원래 first-match/삭제·좌→우 content·cleanup/mount 시점을 유지해야 한다. portal 경계·하위 arity 변화·예외/동기 재진입은 실패 시 기존 경로로 돌아간다.
- [x] 별도 계측 build에서 Map/Set/snapshot·key 읽기·content 방문·render 배열/인덱스·증명 stage/consume/discard·clone/fallback 비용을 기록한다. 제거된 배치 분석과 남아 있는 O(n) 작업을 구분한다. 메타데이터 수명 회귀와 새 WDom own-field/shape 영향을 확인한다.
- [x] 위 P2 범위의 후보 core/lifetime·B2/B3와 raw/gzip/br·guard 초과를 확보했다. 전체 satellite/패키지 suite는 P4/P5에 남아 있다. 정합성 실패는 공식 후보 측정을 막지만 소폭 size 초과만으로 측정을 중단하지 않는다. 조기 반환에 관찰 차이가 남아 DC-25-5를 제외로 닫고 결합 후보를 고정했다.

### P3 — 공식 CPU·메모리와 peer 재비교

진입: P2 정합성/B1~B3 통과와 production 소스/번들·표본 계획 고정. 종료: baseline/후보의 효과·비용과 최종 peer 9항목 목표를 감사할 원자료가 있다.

- [x] 측정 전 기준 검사: baseline/candidate production source/build hash·원래 앱·runner/browser manifest와 B3를 다시 대조한다. 계측 코드가 공식 번들에 섞이지 않고 측정 중 빌드/테스트/다른 benchmark를 함께 실행하지 않도록 한다.
- [x] CPU 9항목×양순서 baseline/candidate 580표본·공식 메모리 60표본, 조건별 3 fresh contexts의 별도 retention을 수집한다. 전체/JS/paint·분포·순서별/pooled 수치, 실패/재시도·trace, churn/dispose의 DOM/listener/heap 관찰을 보존한다.
- [x] 조기 반환을 포함했다면 partial/select/swap뿐 아니라 생성·추가·삭제의 회귀도 대조해 DC-25-5를 결정한다. 관찰 차이 또는 이득 불확실/손해가 크면 제외 후보의 해시로 필요한 비교를 다시 수행한다. 손해 항목 하나만으로 자동 기각하지 않고 교환 근거를 기록한다.
- [x] baseline/최종 후보/고정 네 peer의 CPU 1,740·메모리 180 계획을 수행한다. 앞선 동일 해시/환경 자료 재사용은 수집 전에 manifest에 정한 경우에만 허용하며 실제 신규 표본 수·중복 제외·시간 간격을 공개한다. 네 peer 최저 전체 중앙값 대비 1.10배/9항목을 각각 판정한다.
- [x] 별도 계산으로 통계·비율·가중값·초과 바이트·증거 해시를 감사한다. 과거 6/9나 진단 카운터를 신규 목표 달성으로 표시하지 않는다. 실측 결과 뒤 채택/보류, size 한도 변경의 필요와 정확한 제안을 기록한다.

### P4 — Test Hardening

진입: 고정 후보의 P2/P3 증거. 종료: 최종 코드의 fallback·수명 경계와 concurrent 범위가 정해지고 실패가 해결되었다.

- [x] 기준 검사: P1/P2 회귀와 수명/관찰 counter의 동일 해시 결과를 재사용하거나 변경된 부분을 재실행한다. hit/miss·중복/혼합·getter/throw·key mutation·retired/hoisted clone·후속 자체 renew·DOM 실패 뒤 복구를 보강한다.
- [x] Fragment/portal/외부 형제·입력 값/선택/focus·native listener identity·콜백/재예약/mount/unmount 순서를 실제 브라우저에서 확인한다. portal 대상 컨테이너가 보존되고 다른 내용이 지워지지 않아야 한다.
- [x] DC-25-6을 확정한다. concurrent 적용 시 priority 중단·retry·abandon·동기 재진입·portal commit 전 metadata 게시 금지와 폐기를 검사한다. 기존 경로 유지 시 그 범위와 공유 factory/type 영향 없음 또는 해당 회귀 결과를 명시한다.
- [x] hardening 수정으로 측정 코드/실행 번들 해시가 달라지면 필요한 P2/P3를 다시 수행한다. 다른 해시의 성능 증거로 최종 코드를 승인하지 않는다.

### P5 — Integration Test와 채택·인계

진입: P4 완료, 최종 후보와 측정 해시 일치. 종료: 채택/보류 이유·실제 통합 상태와 미달 목표가 문서/증거로 재현된다.

- [x] 기준 검사/최종 B4: `pnpm build`, `pnpm test` 및 `test:dual`의 모든 하위 suite, `pnpm test:e2e`, base/concurrent/e2e strict types, 변경 파일 ESLint/Prettier·`git diff --check`, `pnpm verify:concurrent`를 확보한다. 동일 해시의 중복 suite는 공통 실행 규칙대로 재사용하며 실행하지 않은 literal 명령을 실행했다고 기록하지 않는다.
- [x] SSR/hydration·helper/context·HMR·element/CSP·문서/예제, ESM/UMD/CJS exports/package probe와 source map 연결을 확인한다. 최종 base/concurrent/element UMD의 raw/gzip/br 및 `pnpm size` 실제 결과를 공개한다.
- [x] size 한도 초과 시 사용자에게 실측 이득·메모리 비용·정확한 allowance 제안을 제시하고 최종 한도 결정을 기록한다. 기존 guard를 바꿔 실패를 숨기지 않는다. 채택 시 실제 코드/패키지 해시가 측정 후보와 일치함을 검증하고, 보류 시 후보·패치·원자료를 보존하고 자신의 runtime 변경만 복원한다.
- [x] 결과·manifest·원자료/실패 trace·재현 도구·감사 결과를 영구 보존한다. 네 문서와 benchmark HANDOFF의 done/next/blockers/실제 commit을 갱신한다. 미달 항목·미실행 검증을 남기며 릴리스/버전 변경은 별도 요청으로 진행한다.

## DC-24 — 추가 크기 조사

- [x] S0 기준: DC-23 UMD 12,759B raw / 5,187B gzip / 4,824B Brotli와 기존 dirty tree를 확인했다. 기존 변경을 보존한다.
- [x] S1 후보: 별도 디렉터리에서 map 주석·identifier/reprint·scope를 보존하는 제한 압축을 비교한다. baseline: 실제 bytes/compressor와 AST/closure 경계를 고정한다.
- [x] S2 Test Hardening: 유효한 후보만 실제 빌드로 재현하고 export·parent getter scope·source map 보존과 필요한 브라우저 동작을 확인한다. 출력만 달라지면 전체 suite를 불필요하게 반복하지 않는다.
- [x] S3 Integration Test/인계: 현재 기본 빌드와 후보를 구분하고 실제 절감·기능/디버깅 비용·남은 검증을 보고서/네 문서에 기록한다. 기본 채택은 검증된 범위로만 판단한다.
- [x] S4 재확인(2026-10-26): 소스 사본 빌드로 대조 해시를 재현하고 Terser flag 29개·Module 태그·소스 편집 3종·실제 hidden 빌드를 비교했다. jsdom 동등성 확인만 했고 전체 suite·Playwright·package probe는 실행하지 않았다(미채택). → [재확인](../benchmark/BUNDLE_SIZE_RESULTS.md#재확인--2026-10-26), [도구](../../experiments/bundle-size-recheck/README.md).
- [x] S5 채택(2026-10-26, 사용자 결정): `vite.config.js`에 구문 4종과 `generatedCode.symbols: false`를 반영했다. 실제 빌드 해시가 측정 후보와 같다(UMD `1501e239…`, CJS `8a22f1e4…`, ESM `6665eac4…`는 반영 전과 동일). jsdom 동등성(반영 전 UMD와 DOM·로그·예외·export 동일), CJS/ESM export 21개 동일, Chromium portal 재현 통과. 전체 build, `pnpm test` 996 passed / 3 skipped, base SSR 15, concurrent satellites 172, Playwright 78(UMD를 쓰는 CSP·element fixture 포함, retry 0), `pnpm size` 4,819/4,824B, `pnpm verify:concurrent`, ESLint/Prettier가 통과했다. 고정 Chrome이 필요한 기존 package probe 스크립트는 이 환경에 그 브라우저가 없어 실행하지 않았다. CHANGELOG는 릴리스 때 적는다(Module 태그 제거, portal 수정).

DC-25는 2026-10-27 정식 착수했으며 현재 계획은 위 P0~P5와 [DESIGN DC-25](./DESIGN.md#dc-25--같은-순서-keyed-빠른-경로)를 따른다. 위 S0~S5는 DC-24 당시 완료 이력이다.

## BUG-1 — portal 형제 정합성 수정

진입: 사용자 요청(2026-10-26). 종료: 양코어 회귀 통과와 전체 검증. 크기 결정은 별도다.

- [x] B0 재현: 회귀 11개를 먼저 작성했다. 수정 전 base 10개, concurrent 6개가 실패했다(A~E, DESIGN 표).
- [x] B1 구현: 공용 `checkPortalElement`를 추가하고, 양코어 render의 기준점·이동·삭제·교체 경로와 diff의 `tag='portal'` 덮어쓰기를 수정했다.
- [x] B2 Test Hardening: 대상 안의 다른 내용을 지우지 않는지, 같은 자리 portal ↔ 컴포넌트 전환, keyed 행 삭제를 추가했다.
- [x] B3 Integration Test: 전체 build, `pnpm test` 996 passed / 3 skipped, base SSR 15, concurrent satellites 172, Playwright 78(retry 0), strict tsc 3종, ESLint/Prettier, `pnpm verify:concurrent`가 통과했다. Chromium 재현도 통과한다.
- [x] B4 크기: 수정만으로는 4,860B였고, S5 출력 절감과 함께 4,819/4,824B로 통과한다.

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

- done: HEAD `4109bd3`에서 DC-27 수동 blueprint와 base overlay를 구현했다. 일반 h/map/cache는 유지하고 고정 HTML의 동적 text/attr/event만 기존 updater로 commit한다. snapshot clone·fallback·값/parent 동기화·fault/remount를 검증했다. 계약/작업량27·기존 core26파일/186검사·stock/overlay strict types·Chrome14·3앱 공식 keyed/9동작/font·앱별3context retention을 통과했다.
- result: 최종 V2 stock/control/candidate CPU870·메모리90 양순서를 완료했다. candidate/stock 가중 전체−0.04%(main+2.38/reverse−2.07), JS+2.98%다. 부분 갱신 전체−12.33%/JS−20.09%는 유효했지만 10k 메모리+1.44025MB(+5.11%), 앱 Brotli+1,472B가 늘어 **이번 수동 경로 미채택**이다. 같은 overlay의 정보 경로 전체−1.64%, control/stock 가중 JS+3.87%도 분리했다. [보고서](../benchmark/STATIC_DYNAMIC_RESULTS.md). 모든 compiler 최적화의 가능성을 부정하거나 C4/peer/Vue와 합산하지 않는다.
- validation: 독립288분포/288비율/27가중·양순서/표본과 root23+추가9/stage121·browser/bundle/runner185/package343 해시를 통과했다. counters는 공식 번들에서 제거됐다. 최종 수집 실패/재시도/warnings0이다. V1은 같은 cached row에도 metadata를 조회해 부분 수집 후 중단·보존했고, V2는 일반 core 경로를 유지하고 block hook만 같은 객체에서 생략한다. 1k/10k행 WeakMap.get2013/20013→13/13을 별도로 계수했다. V1 표본은 합산하지 않는다.
- preparation: 타입 설정의 JSX 중복/alias 누락과 회귀의 넓은 root 탐색은 `-setup`에 남겼다. 그 설정 수정 중 runtime/번들은 같았으나 V2는 별도 overlay 변경과 전체 재검증/새 수집이다. 최종 staging은 `/private/tmp/lithent-static-dynamic-20261030-v2`다.
- preservation: 실제 소스/patch/번들·최종 raw/trace·V1 부분 시도·준비 실패·도구를 새 archive/manifest(2,241entries/56,706,937B, SHA-256 `a260c129dbec5d3b03b059d1acee602cc935c0cef92b14f93e5a0ac6bf68baa3`)에 보존했다. 압축/member 전체 재검산·실측 입력/도구 해시·집계 JSON 대조·상대 링크/앵커332개·포맷/공백 검사를 통과했다. G0~G4 완료다. 같은 generic schema/WeakMap 경로를 바로 미세 조정하거나 자동 compiler를 전면 구현하지 않는다. 후속은 전용 생성/patch 코드를 통한 generic metadata 비용 축소의 작은 별도 검증부터 설계할 수 있으며 예상 이득은 미확정이다.
- blockers/limits: 수집/검산 블로커 없음. 내부 per-node hook/VDOM callback·component/portal/Fragment/ref/style/input/SVG/custom element·동적 구조/getters/spread·외부 subtree mutation/사전 내부 관찰·concurrent/SSR/HMR/제품 공개 지원은 별도다. 기존 portal BUG-3과 default runtime/exports/guard는 유지한다.
- commit: 측정 기준 HEAD는 `4109bd3`다. 사용자 요청으로 DC-27 소스/문서/증거를 이 변경을 포함하는 커밋에 보존하고 `origin/perf/c4-key-snapshot`에 push한다. 최종 커밋 SHA와 원격 동기화는 `git log -1 --format=%H`와 `git status -sb`로 확인한다. 이전 C4 자료를 유지하고 성공한 수집을 반복하지 않는다.
