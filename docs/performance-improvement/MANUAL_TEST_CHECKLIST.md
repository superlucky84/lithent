# MANUAL_TEST_CHECKLIST — 코어 구조 개선의 최종 확인

두 클라우드 후보는 미채택이며 현재 runtime17 source는 `8056e02` compact13과 같다. [복원/재빌드 감사](../benchmark/fragment-anchor-restoration.json)와 HANDOFF의 구현 커밋을 확인한다.

> DC-19 클라우드 독립 실험 완료: 이 브랜치의 앵커 범위 탐색은 **미채택 프로토타입**이다. 기본 compact13/C2와 구분하며 [결과](../benchmark/FRAGMENT_ANCHOR_RESULTS.md)를 참조한다. 아래 DC-18 수치는 로컬 이력이다.

- 기준일: 2026-10-24. 상태: **DC-18 compact13 기본 반영·한정 통합/보존 감사 완료. 가중 total−5.8917%/JS−14.4232%,10k 메모리+2.4747%,UMD4,824B(4,800+검증24B/여유0). 전체 peer1.10 목표는 미검증**.
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md).
- 체크에는 결과·실행 시각·소스/번들 해시·증거 경로를 남긴다. 후보에 해당하지 않는 항목은 이유와 함께 N/A로 기록한다. 자동 테스트가 대신한 항목도 해당 증거를 연결한다.
- 각 항목은 표시된 Phase에서 해당 증거를 확보하며 M-1·M-2는 후보 구현 전에도 수행한다. 최종 채택에는 정합성/빌드·B1~B4 검증과 성능 산출물이 필요하다. B2 크기 수치/기존 script 결과는 공개하되 현재 R11/R34에 따라 소폭 초과만으로 CPU/메모리 평가를 중단하지 않는다. 정합성 실패를 시간·메모리 교환으로 허용하지 않으며 개별 성능 손해나 소폭 크기만으로 자동 판정하지 않는다.

## M-1. 기준선과 작업 상태 — RC-1/RC-4, Phase 0·1·6

- [x] DC-12의 별도 source tree/package/bundle이 기본 runtime과 분리돼 있고, 기본 source/번들28개와 public exports가 전후 일치한다.
- [x] Phase 1 기준선의 base 1.25.2/concurrent 0.2.2 소스/번들 해시, 변경 파일, HEAD를 [보고서와 manifest](../benchmark/STRUCTURAL_BASELINE_RESULTS.md)에 기록했다. 새 코어 후보는 없으며 최종 후보 해시는 Phase 6에서 다시 확인한다.
- [x] 원래 upstream 앱, 초기 targeted 실험 앱, 이번 진단/production staging을 구별했다. 원래 앱을 기존 evidence의 `official-main.tsx`에서 추출하고 실제 upstream targeted 앱을 보존했다.
- [x] 과거 문서/보고서와 미채택 결정을 보존했다. Phase 1은 현재 기준선의 별도 진단으로 기록했다.
- [ ] 최종 작업 트리에서 실행한 후보와 보고서가 일치한다. 채택하지 않은 코드가 dist에만 남거나 반대로 소스만 남지 않았다.

통과: 원본과 후보를 문서만으로 재구성할 수 있다. 이번 문서 작성 완료와 실행 완료가 혼동되지 않는다.

## M-2. 실제로 줄인 작업 — DC-1/DC-6, Phase 1·2

- [x] 원래 Table·행별 갱신·일반 nested slot 예제에서 updater, cache, keyed 매칭, diff, 부모/slot 검색 방문 추정, placement, DOM mutation을 [38개 시나리오](../benchmark/structural-baseline-results.json)로 분리했다.
- [x] 1k/10k와 `k = 1, 10, n/10`, 선택 위치·parent-refresh를 바꿔 전체 목록과 변경 범위 처리를 구분했다. 계측 값과 uniqueness shadow를 공식 production 속도 개선으로 사용하지 않았다.
- [x] C1 위치 유지의 lookup/hit/cold/stale/map 생성/쓰기와 생성·메모리 비용을 [C1 결과](../benchmark/PARENT_POSITION_RESULTS.md)에 기록했다. C2 구현/uniqueness 유지비 검증은 보류다.
- [x] C1의 원래 앱 core-only 공식 290표본과 일반 입력 예제의 비공식 JS+nextTick 진단을 분리했다.

통과: 어떤 작업이 제거되고 어떤 작업이 남는지 증거로 설명할 수 있다. 아직 O(n)인 경로에 O(1) 또는 변경 수만큼이라는 표현을 쓰지 않는다.

Phase 1은 예상 작업량까지, Phase 2 C1은 실제 제거량·유지비와 공식 사전 비교까지 완료했다. 당시 C2는 미구현이었으며 현재 DC-17의 격리 프로토타입과 구분한다. C1의 68개 카운터 검사, 24개 시간 context, 6개 회수 context, dual 1,050 passed·3 skipped와 B3 검사는 최종 후보의 Phase 4~6 검증을 대신하지 않는다. 후보 size는 53B 초과해 실패한 상태로 기록했다.

## M-3. keyed 정체성·이동·부모 위치 — DC-2/DC-6, Phase 2·5

- [ ] 상태가 있는 행을 생성하고 선택/입력 → 앞·중간 삽입 → 원거리 swap → 역순 → 일부 삭제 → 다시 갱신한다. DOM 객체와 행의 내부 상태가 올바른 key에 유지된다.
- [ ] 같은 순서/바뀐 순서의 중복 키, 0/false/빈 문자열/NaN/Symbol/object 키, null·unkeyed 혼합이 baseline의 소비·삭제와 일치한다. 각 인스턴스는 한 번만 unmount된다.
- [ ] C1 후보에서 저장 위치가 stale인 삭제/이동/reparent 후 자체 renew가 다른 형제를 덮어쓰지 않는다. 부모 children과 조상 compChild의 공유 참조가 유지된다.
- [x] C1의 index 0·cold/warm·배열 교체·합성 in-place 재정렬 stale fallback은 카운터/DOM 검사로, 다중 위치·중복 재사용·hydration·직접 `replaceWDom`·slot 첫 등장은 dual 회귀로 확인했다. 최종 통합 e2e는 미실행이다.
- [ ] C2 후보에서 진입 실패 시 이미 수행한 lifecycle·DOM 변경이 없고 일반 경로로 돌아간다. 중간에 tag/type이 바뀌거나 empty가 된 같은 key도 처리된다.
- [ ] 리스트 뒤 footer, 빈 Fragment, 여러 실제 DOM을 내는 행, portal이 섞인 삽입/이동에서도 경계를 넘지 않는다.

통과: 최종 DOM만 아니라 정체성·상태·mount/unmount 순서가 baseline과 같다. 공유 core spec를 base와 concurrent에서 확인한다.

## M-4. 캐시·자체 renew·부모 갱신 — DC-2/DC-4/DC-5, Phase 2·3·5

- [x] DC-15 새 행 앱의 off/helper/memo9context에서 updater 진입과 JSX view 수를 분리하고 mutable label·선택·swap·양방향 배칭·key identity·삭제·dispose를 확인했다. helper refresh는1,000/0, memo는0/0이며 key1,000개 유지 후 등록/관찰 출력/host0개였다.
- [x] DC-13의 off/on diagnostic에서 부모 refresh·선택·mutable label·swap의 실제 updater 수와 props 동기화·DOM 정체성·batched 결과·최종 dispose/GC가 계약과 같다. 6context·key1,000개 유지 후 등록/관찰한 VDOM/host0개를 확인했다.
- [x] C3 기준 회귀에서 기존 parent→child의 base/concurrent 실행 수 차이, child→parent의 두 번 실행, pre/post callback·callback 재예약·삭제를 확인했다. 새 회귀 양쪽 **10개씩**, 전체 dual **1,070 passed·3 skipped**·타입 검사 통과. 이 baseline 결과를 별도 C3 hit/miss 전용 검증과 구분한다.
- [x] C3-T1~T4: 전용 33회귀에서 setup 등록 오류, incoming selector·복사/Object.is·길이·key 변화, mutable row·빠뜨린 deps, nonempty slots·특수 props fallback을 확인했다. 후보 소스/실험 타입도 통과했다.
- [x] C3 부모 hit의 props 동기화·live wrapper·자체 요청 유지와 updater/pre/post 생략, self/public replace 우회·miss 배칭 표를 확인했다. 최종 회귀는 후보 패치·[보고서](../benchmark/PARENT_MEMO_RESULTS.md)에 보존한다.
- [ ] 기존 API에서 cache hit 후에도 `updateCallback`과 updater가 기존 규칙대로 실행된다. 동일 cached 객체의 `type = null` 전환이 삭제로 반영된다.
- [ ] 같은 VDOM을 다른 위치에 재사용해도 독립적인 DOM·컴포넌트 상태가 만들어진다. 이동한 cached subtree의 자식 자체 renew가 계속 작동한다.
- [ ] mutable props의 변경·삭제, frozen props, children/slots 교체와 외부 상태 변경을 처리한다. 참조 동일성만으로 필요한 갱신을 누락하지 않는다.
- [ ] 새 C3/C4 계약이 있다면 선언한 deps/토큰/구조 정보의 변경과 무효화 누락의 처리 규칙을 각각 검증한다. 기본 API와 새 옵트인의 callback 의미 차이가 문서와 같다.
- [ ] 부모→자식/자식→부모 갱신을 같은 task에 각각 예약한 뒤 swap·partial·삭제를 섞는다. 자체 renew를 삼키거나 낡은 wrapper로 되돌리지 않는다.
- [ ] C4가 있다면 구조 변경 없는 항목 갱신과 삽입·삭제·정렬의 fallback, 외부 mutation에 대한 선언된 동작을 확인한다.

통과: 기존 동작이 보존되고 새 기능은 명시된 계약에서만 생략한다. 새로운 API를 설계하지 않았다면 해당 전용 항목은 N/A다.

## M-5. lifecycle·예외·브라우저 통합 — R8/R9, Phase 2·5·6

- [ ] mount/update/unmount 순서, hook 정리, 삭제 뒤 queued renew, render throw 후 남은 queue 복구를 확인한다.
- [ ] 텍스트·input/checkbox/select·SVG·event handler 교체가 정상이며 focus·selection 등 유지되어야 할 DOM 상태가 보존된다.
- [ ] Fragment/portal/HTML root의 생성·갱신·삭제와 외부 형제 보존을 확인한다.
- [ ] SSR 출력 → hydration → keyed 갱신에서 노드 정체성과 이벤트가 정상이다. 예제/문서 앱에 새 콘솔 오류가 없다.

통과: B4와 관련 e2e 증거가 최종 후보 해시를 가리키며 실브라우저 결과가 기대와 같다.

## M-6. concurrent와 기존 retained 기능 — DC-3/DC-7, Phase 3·5·6

- [x] DC-12의 staging alias 회귀·실제 consumer 타입이 통과한다. helper/JSX는 같은 core 인스턴스로 alias하며 default setup에서 isolated hook을 섞으면 명시적 오류가 난다.
- [x] C3 첫 후보는 base만 지원하며 concurrent의 새 API 부재를 실행 검증했다. DC-11의 commit/abandon 새 기능 지원은 미구현이다.
- [x] C3-T1: 실제 ESM/CommonJS·consumer 타입을 확인했다. concurrent named import는 ESM missing export/TS2305로 실패하고 기존 helper/공통 dual·원래 앱 B3는 통과했다.
- [ ] 공통 core spec와 concurrent 고유 scheduler/commit/abandon 테스트를 수행했다. base 성능 결과를 concurrent 개선율로 표시하지 않는다.
- [ ] 중단 가능한 low 작업 중 high 작업을 실행해 폐기된 후보의 부모 연결·캐시·dirty 정보가 live 상태에 남지 않는다.
- [ ] `createRetainedView` show/hide/dispose와 `useRenderBoundary` pause/resume 중 자식 갱신, 이동·삭제가 기존 규칙대로 동작한다.
- [ ] 새 기능이 두 코어에서 지원되는지 명시하고, 미지원 조합은 의도된 방식으로 실패하거나 기존 경로를 사용한다. 공유 export/type이 깨지지 않는다.

통과: 새 memo/갱신 범위 계약이 기존 숨김·freeze 수명 계약과 혼동되거나 암묵적으로 교체되지 않는다.

## M-7. 공식 전체 성능과 비교표 — RC-2/RC-5/IC-1/IC-2, Phase 4·6

- [x] DC-16 원래 Lithent·고정 React/Preact 네 구현의 새 전체 CPU1,450/메모리150표본·양순서·source/lock/production 빌드/의존성을 확인한다. 사용자 목표는 각 CPU 전체 시간 중앙값의 네 peer 최저 대비1.10배 이하/9항목 전부다. 색상과 목표의 정규화 범위를 구분한다.
- [x] 목표 격차 상위 최대 두 항목의 별도 profile/trace를 공식 스코어와 분리해 확인하고 다음 코어 후보 또는 원인 미확정을 기록한다.
- [x] DC-15의 실제 캐시 앱 다섯 조건을 같은 차수/반대 순서로 비교했다. CPU1,450/메모리150표본, 분포480/가중36개 Python 감사를 완료했고 row helper/memo와 원래 앱 종단 손해를 분리했다.
- [x] DC-13의 같은 JS/core·설정만 다른 두 조건으로 CPU580/메모리60표본의 양순서·분포·실패/부하를 감사했다. 기능 대조이며 원래 앱 종단/전체peer 판정과 구분한다.
- [x] DC-12 core-only 양순서 대조의 앱/helper/렌더러/Chrome/엔진 해시·580표본·배치 실패를 감사했다. C3를 쓰지 않는 별도 렌더러의 비용으로만 해석하고 기능 이득·기본 렌더러 회귀·전체 peer 판정과 분리한다.
      아래 미완료 체크는 최종 후보 검증이며 DC-16 baseline 완료와 구분한다.

- [ ] 최종 동일 앱·코어/helper·브라우저/엔진·lockfile 해시로 원순서/반대 순서의 전체 9 CPU 항목을 확보했다. 실제 러너의 ID·행 수·throttle·warmup·GC 설정을 기록했다.
- [ ] raw 표본 수·완료 상태·실패 배치·재시도·trace가 보존된다. 다른 앱/브라우저/코어 버전이나 사전 후보의 표본을 합치지 않았다.
- [x] DC-16 baseline 범위에서 IC-1의 React/Preact 기본 비교군에 선택·부분 갱신만이 아닌 전체 항목을 실행했다. 비교군의 버전·소스와 표의 정규화/가중치/색상 모드가 고정되어 있다.
- [ ] 전체 시간과 JS를 구분하고 항목별 baseline/peer 비율, 전체 가중 지표, 분포·시간 간격/부하 한계를 표시했다.
- [ ] 개선 항목과 악화 항목을 모두 공개했다. 일부 악화에도 전체/상대 목표에 적합한지 판단했고, 한 항목 회귀만으로 탈락시키지 않았다.
- [ ] 빠른 색상 구간의 수치 기준이 미확정이면 `목표 판정 미정`으로 쓴다. 평균 개선이나 예쁜 표만으로 모든 항목 목표 달성을 선언하지 않는다.

통과: 비교가 완전하고 재현 가능하다. **측정 통과와 사용자의 전 항목 목표 달성은 별도 판정**이다.

DC-17 전용 추가 gate(기준 회귀와 후보 검증 분리):

- [x] [공통 회귀11개](../../src/tests/core-placementProof.test.tsx)가 기본 base/concurrent/candidate에서 각각 최종 통과했다. 초기10개 뒤 추가한 children getter 순서도 각 코어의 기존 동작을 따른다. pre callback의 뒤 key mutation은 base의 remount/concurrent의 retain을 구분하며 diff throw는 live sibling 재개만 확인해 실패한 부모 tree의 자동 롤백을 요구하지 않는다.
- [x] 초기10회귀 시점의 기본 dual1,090 passed·3 skipped, 마지막 read-order1개의 양 코어 targeted, 격리 후보 shared229+수명4=233 passed·엄격 타입/빌드·17모듈 declaration pair를 구분했다. 기존 lithentVite3실패는 stale hmr-parser dist를 소스 변경 없이 재빌드한 후 해소했다.
- [x] DC-17 당시 UMD br4,952B가 baseline4,798B 대비+154B·기존4,800B 한도152B 초과임을 확인해 미채택으로 종료했고 공식 CPU580/메모리60·retention/B3는 미실행이었다. CPU 개선/회귀나 다른 C2 대안의 기각으로 확대하지 않는다. 현재 후속 정책(R11/R34)에 따라 필요하면 별도 재평가할 수 있다.
- [x] [manifest/raw](../benchmark/keyed-placement-results.json)에 기본28파일+package29개 사전/사후 일치, sibling의 초기 부재→외부 clean 원래앱 출현·미수정, staging/Chrome155의 계속된 부재를 구분했다. 과거 targeted sibling 보존이나 B3 통과를 주장하지 않으며 root runtime 복원/측정 환경 설치는 불필요했다.
- [x] [별도 JSDOM11동작](../benchmark/KEYED_PLACEMENT_RESULTS.md)에서 Map/키 접근·content/cleanup 횟수 동등성과 선택/선택이동/partial의4배열·1,000인덱스 방문 제거를 확인했다. fallback의 원래 배열/방문과 추가 proof get/delete, 매동작 frame1개 생성/정리를 공개했다. 계수는 시간·보유 바이트·공식 B3가 아니다.
- [x] [수명4회귀](../../experiments/keyed-placement/lifetime.test.tsx)에서 stage/ready→render 전 일회 소비, 뒤 diff throw 시 미방문 proof 폐기, DOM throw와 중첩 invalidation/복원을 확인했다. source의 node/children association 검사와 root finally를 검토했다. 모든 삭제/clone/내부 mutation 경로의 일반 보장이나 메모리 누수 부재로 확대하지 않는다.
- [x] 공통11회귀와 후보233회귀에서 같은 순서 특수/중복/empty/key 변화·pre callback key mutation·getter 관측 순서·출력 arity/Fragment/portal/외부 형제·focus·자체 renew·동기 wrapper 재진입을 확인했다. 기존 좌→우 callback/재예약·mount 순서와 전체 cleanup 횟수는 한정 회귀/계측 범위에서 유지됐다.
- [ ] 임의 in-place VDOM 내부 구조 변이와 callback이 관찰하는 모든 metadata 조합, 전체 삭제/clone/경계 조합의 정합성·보유 메모리/실브라우저 일반 보장은 미검증이다. 새 후보 재개 시 별도 hardening 항목으로 검증한다.
- [x] size 실패·미채택 이유, [후보 패치](../benchmark/keyed-placement-candidate.patch)·[영구 증거](../benchmark/keyed-placement-evidence.json.gz)·[재현 도구](../../experiments/keyed-placement/README.md)와 공식 CPU/메모리/retention/B3 미실행을 남겼다. 최종212archive entry·154counter 비교·size/29guard·패치17source replay를 독립 감사했다. 기존4,800B 한도를 유지했다.
- [ ] DC-17의 공식 CPU580/메모리60·retention/B3 및 최종 peer/Phase5/6: 당시 size 종료로 미실행/미완료다. 새 평가 정책으로 재개하면 독립 후보/표본으로 분리하고 DC-16이나 factory와 합치지 않는다.

## M-8. 메모리·생성/삭제·번들 — R11/R12/IC-2/IC-3, Phase 2·4·5·6

- [x] DC-16의 메모리150표본·JS/HTML raw/gzip/br를 공개했다. memory에 CPU1.10 목표를 적용하지 않았고 새 retention/최종 메모리 예산 완료로 간주하지 않는다.

- [x] DC-15 다섯 조건의300회 create/clear·100회 partial/15context와 공식 메모리150표본을 분리해 기록했다. DOM/listener 증가는0, 원래 앱 dispose6context의 행1,000개+host 회수는0잔류였다. memo 한 churn context의 추가 heap은 미귀속으로 남겼다. JS/HTML의 raw/gzip/br와 같은 행 JS 동일성을 확인했다.
- [x] DC-14의300회 churn·snapshot 별도 조건·V8 self size 합계·강한 보유 경로와 미귀속을 확인한다. 공식 MB나 최종 누수 부재 판정과 혼동하지 않는다.
- [x] DC-13의 production100회 생성/삭제·100회partial/조건별3context에서 GC 뒤 DOM/listener/heap을 기록하고 full dispose 검사·공식 MB와 구분했다. 같은 JS의 raw/gzip/br와 기본 런타임 보존을 확인했다.
- [x] DC-12 기본 bundle 보존과 별도 렌더러의 전체 크기를 따로 공개했다. 별도 package/subpath·예산을 승인된 것으로 다루지 않는다.
- [x] C3-T5/T7 한정 회수: pending 게시 금지·실패/초기화 하위 등록·삭제 정리, key 1,000개 유지 dispose 후 등록·관찰한 VDOM/host 0개를 3조건×3context에서 확인했다. 첫 후보 시점의 비사용자 시간 미측정은 위 DC-12 대조로 보완했고 100회 churn은 미실행이다.
- [x] eager `h()`/실제 mount의 성공을 구분하고 selector/pre/updater/post/DOM/mount 실패와 재예약 세대를 회귀로 확인했다. baseline의 실패한 부모 tree/hook cursor 자동 롤백은 지원하지 않으며 관련 재시도 범위를 보고서에 기록했다.
- [x] C3 size 실패를 공개했다: base br 5,691/4,800B(+891B 초과), concurrent 6,903B·element 998B. 후보를 보존하고 baseline 복원 후 세 게이트·28개 source/산출물 해시와 base21/concurrent23 회귀를 확인했다.
- [ ] 공식 메모리 21/22/23/25/26의 절대 MB와 baseline/peer 비율을 기록한다. JS heap 진단과 `measureUserAgentSpecificMemory()`를 같은 지표로 섞지 않는다.
- [ ] fresh context에서 생성/삭제 반복, partial 반복, 최종 dispose 후 DOM·listener·heap 잔류를 관찰한다. 데이터 문자열 증가와 참조 누수를 구분한다.
- [x] C1 map 생성/조회/쓰기·cold/warm/stale를 분리했다. 1천 key를 유지한 dispose 후 1천 VDOM+부모 배열의 생존 0개를 양쪽 3context씩 확인했다. 반복 부모 갱신 중 모든 과거 배열의 회수 및 100회 churn 검사는 미실행이다.
- [ ] 행/경계별 메타데이터·wrapper 비용이 1k/10k 생성, append, clear에 주는 영향을 공식 전체 시간과 함께 기록한다.
- [x] C1의 세 UMD 존재와 size 실행 결과를 기록했다. 후보 base br 4,853/4,800B 실패, concurrent 6,903B·element 998B. 공개 옵트인 API 추가는 없었다.
- [x] C1은 +55B/한도 +53B와 채택 보류를 공개했다. 저장 구조 변경·옵트인 분리/상쇄는 후속 가설이며 한도를 변경하지 않았다.

통과: 새로운 구조적 누수가 없고 비용이 공개되어 있다. 단순 메모리 증가나 개별 시간 손해의 수용 여부는 IC-2에서 별도로 판단한다.

## M-9. 범용성·문서·upstream 해석 — RC-1/DC-7, Phase 3·6

- [ ] 일반 편집 목록/nested 입력 예제에서도 새 기능의 필요성과 계약을 설명할 수 있다. benchmark 행 수·id·매 10행 조건이 코어/helper에 들어 있지 않다.
- [ ] 새 API가 있으면 기존 사용자의 동작, 무효화 책임, lifecycle, concurrent 지원, 비용과 제한을 문서화했다.
- [ ] 수동 VDOM 캐싱을 라이브러리로 옮겨 upstream note #1261 면제를 보장하지 않는다. 실제 구현의 설명과 [제출 규칙](https://github.com/krausest/js-framework-benchmark#44-submitting-your-implementation)·[해당 주석](https://github.com/krausest/js-framework-benchmark/issues/1261)을 연결한다.
- [ ] 원래 앱의 core-only 이득, 새 공개 기능 사용 이득, 최종 앱의 종단 이득을 구분한다. maintainer 리뷰 통과는 확인 전까지 미확정이다.

통과: 일반 사용자에게 유용한 기능/내부 개선이며 benchmark 결과만으로 안정성·리뷰 승인을 약속하지 않는다.

## M-10. 복원·증거·인계 — RC-4/IC-4, Phase 6

- [ ] 채택/보류/기각과 이유, 완료/미완료 항목, 다음 작업·블로커·실제 commit SHA를 남겼다.
- [ ] 기각 시 파일별 사전 상태와 현재 상태를 확인한 뒤 자신이 만든 변경만 복원했다. 두 코어 build·핵심 회귀와 산출물 해시를 확인했다.
- [ ] 결과 JSON·소스·번들·러너·로그·압축 증거의 해시를 감사했다. trace 미보존 등 제한도 명시했다.
- [ ] 실제 upstream 실험 앱·기존 조사 자료·다른 사람의 변경이 보존되었다. 요청하지 않은 배포·PR·버전 변경을 하지 않았다.

통과: 다음 작업자가 문서만으로 선택된 후보·현재 런타임·미결정 사항을 파악하고 재현할 수 있다.

## M-11. DC-18 object-layout 원인귀속·실제 평가 — R30~R39, Phase4 DC-18

- [x] 고정 Chrome156/V8·Node25.6.1·원래 앱/helper/runner/HTML/CSS/fonts·별도 lock과 source/build hash를 고정했다. IC/probe·과거 Chrome155·full/compact raw를 실제 성능 표본으로 합산하지 않았다.
- [x] smoke/IC·Map/deopt/source probe에서 fast-property·Map 그룹·access site/property-case·function-level 귀속과 exact tag/로그 한계를 구분했다. dictionary0이나 낮은 raw N만으로 CPU 원인을 단정하지 않았다.
- [x] full22의229shared/17pairs·CPU580/메모리60/retention6context·실패/경고0·total−4.8664%/JS−12.1886%·10k 메모리+14.95%·UMD4,854B를 미채택 대안으로 보존했다.
- [x] compact13은 hot13/희소9·동일 allocation site/인자·알고리즘/helper/event/앱을 유지했고229shared/17pairs·IC/probe를 완료했다. full 수집 종료 뒤 별도 실행했으며 자료를 덮어쓰지 않았다.
- [x] compact CPU580/메모리60/retention6context를 완료하고 total−5.8917%/JS−14.4232%·main−6.6228%/reverse−5.1433%·9pooled total 중앙값 하락·10k 메모리+2.4747%(+0.6801MB)를 확인했다. 순서/분포와9항목 peer 목표를 구분했다.
- [x] compact 실패2배치(CPU reverse partial detached Frame·메모리 main ready Target closed) 후 자동 재시도했고 실패 원자료/trace를 보존했다. CPU 경고0과 무실패는 다르다. 초기 smoke·wrapper 스키마 실패도 실제 표본 실패와 구분했다.
- [x] 두 실험 합계384분포/18가중값을 독립 Python1e-12로 검증했다. 각각 retention6context의 DOM/listener 증가0과 heap 체크포인트를 보존하되 모든 heap retention/누수 부재를 주장하지 않는다.
- [x] 적용 직전29guard/`before-adoption.json` 뒤 측정한 `src/wDom.ts`·새 factory를 반영했다. default ESM/UMD/CJS3개의 hash가 측정 후보와 같다. 최종79파일과 초기29 중6변경을 구분하고 concurrent 소스 미수정을 확인했다.
- [x] build:sequence·build:parallel·verify:concurrent, dual1,092 passed/3 existing skipped, strict core/concurrent/e2e 타입·ESLint·Playwright64/retry0을 통과했다. SSR/hydration·HMR·helper/context·예제/docs와 props/값·참조/lifecycle 계약을 확인했다. 전면 own-key 동등성을 주장하지 않고 optional metadata 관찰 차이를 공개했다.
- [x] 사용자 렌더 성능 우선 지시 아래 compact의 실제 교환으로 선정했다. size guard는4,800B reference+검증24B allowance=4,824B/실제4,824B·여유0이며 광범위 새 예산으로 확대하지 않았다. concurrent6,903/9,000B·element998/1,000B strict 통과다.
- [x] [결과](../benchmark/NODE_SHAPE_RESULTS.md)·[raw/manifest](../benchmark/node-shape-results.json)·[선택 패치](../benchmark/node-shape-candidate.patch)·[full 대안](../benchmark/node-shape-full-candidate.patch)·[증거](../benchmark/node-shape-evidence.json.gz)·[재현/감사](../../experiments/node-shape/README.md)를 보존했다.1,367entries/33,532,452B·SHA-256 `3fdb0309e89519c0bc9806b50bf27af3c8fd302e241607c2f20ad1402819950b`,384분포/18가중·4,380IC/724deopt·CPU1,160/메모리120/retention12/79파일 독립 감사 완료다.
- [ ] 네 fixed peer를 같은 새 환경에서 전체9항목 재비교해1.10 목표를 판정한다. DC-18은 이 범위 밖이며 완료로 표시하지 않는다.
- [ ] 다른 후보/조합과 광범위 Phase5/6의 잔여 검증은 해당 후속 범위에서 수행한다. DC-18 한정 통합 완료를 전체 연구 종료로 확대하지 않는다.

통과: compact13 기본 반영·한정 통합/보존 감사는 완료했다. 모든 앱/환경의 성능·전면 own-key 동등성·전체 heap 누수 부재·전체 peer 목표는 보장하지 않는다.

## M-12. DC-19 클라우드 Fragment 앵커 — R40~R43

- [x] baseline/candidate/current source·branch·runtime·브라우저/엔진 hash를 기록하고 Linux 결과를 Mac과 분리한다.
- [x] 빈→다중 출력·긴 형제 목록·중첩 Fragment·keyed 이동/추가/삭제·portal·root afterElement·외부 형제·focus/수명 순서와 no-op을 확인한다. baseline base/concurrent를 후보와 구분한다.
- [x] `slice`의 snapshot과 lazy 범위 읽기의 accessor/변이 차이를 별도 검증하고 일반적인 관찰 동등성을 과장하지 않는다.
- [x] 진단에서 제거된 suffix/singleton 배열·복사량·callback/loop 방문과 남은 indexOf/Map/LIS를 구분한다. 실제 시간 build에는 계측을 넣지 않는다.
- [x] 동일 앱/build/browser의 fresh page·warmup·양순서 raw/분포와 같은 순서 대조군을 확인한다. build/test를 측정과 병행하지 않는다.
- [x] 별도 GC/heap/DOM/listener·dispose와 세 형식 raw/gzip/br를 확인한다. 공식 메모리·전체 peer 목표/기본 채택으로 확대하지 않는다.
- [x] 한정 hardening/번들 통합·압축 증거/패치/source hash·원래 worktree 보존과 done/next/blockers/실제 commit을 남긴다.

DC-19 종료: 공통 core base/concurrent 각232/54파일·새 baseline3·strict 타입/lint·ESM6gate/CJS·UMD smoke·진단6조건·CPU1,080/메모리18context·Python 입력/통계 감사를 통과했다. 초기 환경/테스트 수집 오류와 getter 관찰 차이는 증거에 보존했다. two-rAF 이득은 입증하지 못했고 후보는 미채택이다. 현재 guard 대비br+23B이며 기존 guard를 바꾸지 않았다. [보고서](../benchmark/FRAGMENT_ANCHOR_RESULTS.md)에서 범위·분포·원자료·완료/다음을 확인한다.

## M-13. DC-19B snapshot 보존 후속 — R44/R45

- [x] getter가 뒤 원소를 바꿔도 suffix snapshot 결과가 같고, 앵커 뒤 index getter/throw와 sparse/길이/moving 관찰이 baseline과 같다.
- [x] 실제 base core232/타입·ESM/CJS/UMD/실브라우저 정합성과 unchanged concurrent 재사용 범위를 구분한다.
- [x] suffix 복사·전체 배열 방문은 남고 callback/singleton만 줄었음을 별도 계측한다.
- [x] 새 양순서1,080시간/18메모리 context·size·독립 통계/보존 감사를 확인하고 첫 후보/Mac과 합산하지 않는다.
- [x] 결과와 미검증/다음/블로커/실제 구현 커밋을 기록한다. 기본 적용은 별도 판단이다.

후속 종료: [새 결과](../benchmark/FRAGMENT_ANCHOR_SNAPSHOT_RESULTS.md)의232core/strict·6browser gate/6진단·1,080시간/18memory·Python hash/통계 감사 완료. getter 관찰 차이는 검사 범위에서 해결했으나 시간 이득이 없고UMD+21B여서 미채택이다. 두 후보를 각각 보존하고 현재 runtime은 compact13으로 복원한다. 최종 source/복원 SHA와 인계는 HANDOFF/git log에 남긴다.

## 상태 / 핸드오프 (DC-18 당시 기록)

- done: DC-18 compact13을 기본 base에 반영했다. [결과](../benchmark/NODE_SHAPE_RESULTS.md)의 독립 same-baseline 대조는 total−5.8917%/JS−14.4232%,10k 메모리+2.4747%,UMD4,824B다. default3JS는 측정 후보와 일치하고4,800B reference+검증24B allowance/여유0을 적용했다. build 두 단계·verify:concurrent·dual1,092/3 existing skipped·strict/lint·64e2e/retry0·384분포/18가중·최종1,367entry/79파일 보존 감사를 완료했다. full22는 미채택 대안, DC-17 C2는 당시 미측정/보류 역사로 보존한다.
- next: 별도 후속에서 같은 새 환경의 네 fixed peer/전체9항목1.10 목표와 다른 원인/후보를 검토한다. DC-18 한정 작업은 완료했으며 새 실험을 자동 선정하거나 전 연구/광범위 Phase5/6 완료로 표시하지 않는다.
- blockers: DC-18의 남은 구현/검사/보존 블로커는 없다. 전체 peer 목표는 미검증이다. optional metadata own-key 차이를 공개하며 전면 동등성·모든 heap 누수 부재·보편적 성능 우위를 주장하지 않는다. compact2실패 배치/재시도와 full/compact 시점·표본은 분리 보존한다.
- commit: 현재 HEAD는 `452dc2eeae29d1e555f7f7b467f01de2baa55c0d`이며 이번 변경은 미커밋이다. 푸시/릴리스/upstream 제출은 하지 않았다. 적용 직전29guard 뒤2소스/size guard를 반영했고 최종79파일 manifest에 의도된6기존파일 변화를 기록했다. concurrent 소스는 미수정이다. 최종 증거 SHA-256은 `3fdb0309e89519c0bc9806b50bf27af3c8fd302e241607c2f20ad1402819950b`다.
