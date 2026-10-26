# MANUAL_TEST_CHECKLIST — 코어 구조 개선의 최종 확인

- 기준일: 2026-10-26. 상태: **DC-23 완료. compact13 유지 + native 이벤트 직접 등록. 전체 검증 통과, 원래 proxy 실험/증거 보존. 현재 CPU 목표는6/9이며 새 timing은 수집하지 않았다.**
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md).
- 체크에는 결과·실행 시각·소스/번들 해시·증거 경로를 남긴다. 후보에 해당하지 않는 항목은 이유와 함께 N/A로 기록한다. 자동 테스트가 대신한 항목도 해당 증거를 연결한다.
- 각 항목은 표시된 Phase에서 해당 증거를 확보하며 M-1·M-2는 후보 구현 전에도 수행한다. 최종 채택에는 정합성/빌드·B1~B4 검증과 성능 산출물이 필요하다. B2 크기 수치/기존 script 결과는 공개하되 현재 R11/R34에 따라 소폭 초과만으로 CPU/메모리 평가를 중단하지 않는다. 정합성 실패를 시간·메모리 교환으로 허용하지 않으며 개별 성능 손해나 소폭 크기만으로 자동 판정하지 않는다.

## M-18. 번들 여유 조사 — R67~R69, DC-24

- [x] current/후보의 Node/zlib와 raw/gzip/Brotli·source/bundle hash를 고정했다.
- [x] map 주석 제거와 map 파일 생성을 구분하고 실제 빌드로 재현했다. 크기상 유효한 후보의 AST/closure를 확인했다. hidden은 전체 실행 AST가 같고 표준 rename은 byte가 같으며 custom alphabet은 크기 악화로 미채택이다.
- [x] 제한 압축의 scope/메모리/성능 추가 검증 필요 여부를 명시했다. 크기 절감만으로 안전성을 선언하지 않았다.
- [x] 추천·실측·채택 상태를 구분하고 DC-23 증거/현재 코드를 보존했다.

## M-17. native 복원 — R62~R66, DC-23

아래는 현재 최종본에 대한 gate다. 기존 M-14~M-16의 proxy 채택 완료 체크는 DC-22 당시 이력으로 유지한다.

- [x] compact13 두 파일을 유지하고 event runtime만 `fb481f3`로 복원했다. proxy 실험 source·56 archive·기존 manifest가 그대로다.
- [x] 양코어 trusted alias 첫/다음 클릭·중첩 dispatch·target 교체 시 첫 클릭 누락/다음 새 callback·ancestor 전파·throw 후 다음 callback을 native 계약대로 확인했다.
- [x] 원 callback의 외부 native dedup/remove 및 교체 후 상대 순서, ref/mountCallback capture/cleanup, portal/shared target·concurrent retry/abandon을 확인했다.
- [x] 전체 build·B1/B4 하위 suite·strict types/lint·Playwright와 양코어 세 package 형식이 통과했다. 자동 검증 범위와 수동 관찰을 구분한다.
- [x] 세 base JS가 고정 native B와 일치하고 source·compressed size·guard를 기록했다. gzip 5KB 미만으로 홍보하지 않는다.
- [x] 기존 B CPU/heap을 재사용한 조건·peer 목표·포기한 inline 이득을 보고서에 기록했다. 새 실측으로 표현하지 않았다.

## M-1. 기준선과 작업 상태 — RC-1/RC-4, Phase 0·1·6

- [x] DC-12의 별도 source tree/package/bundle이 기본 runtime과 분리돼 있고, 기본 source/번들28개와 public exports가 전후 일치한다.
- [x] Phase 1 기준선의 base 1.25.2/concurrent 0.2.2 소스/번들 해시, 변경 파일, HEAD를 [보고서와 manifest](../benchmark/STRUCTURAL_BASELINE_RESULTS.md)에 기록했다. 새 코어 후보는 없으며 최종 후보 해시는 Phase 6에서 다시 확인한다.
- [x] 원래 upstream 앱, 초기 targeted 실험 앱, 이번 진단/production staging을 구별했다. 원래 앱을 기존 evidence의 `official-main.tsx`에서 추출하고 실제 upstream targeted 앱을 보존했다.
- [x] 과거 문서/보고서와 미채택 결정을 보존했다. Phase 1은 현재 기준선의 별도 진단으로 기록했다.
- [x] 최종 작업 트리에서 실행한 후보와 보고서가 일치한다. 채택하지 않은 코드가 dist에만 남거나 반대로 소스만 남지 않았다.

통과: 원본과 후보를 문서만으로 재구성할 수 있다. 이번 문서 작성 완료와 실행 완료가 혼동되지 않는다.

## M-2. 실제로 줄인 작업 — DC-1/DC-6, Phase 1·2

- [x] 원래 Table·행별 갱신·일반 nested slot 예제에서 updater, cache, keyed 매칭, diff, 부모/slot 검색 방문 추정, placement, DOM mutation을 [38개 시나리오](../benchmark/structural-baseline-results.json)로 분리했다.
- [x] 1k/10k와 `k = 1, 10, n/10`, 선택 위치·parent-refresh를 바꿔 전체 목록과 변경 범위 처리를 구분했다. 계측 값과 uniqueness shadow를 공식 production 속도 개선으로 사용하지 않았다.
- [x] C1 위치 유지의 lookup/hit/cold/stale/map 생성/쓰기와 생성·메모리 비용을 [C1 결과](../benchmark/PARENT_POSITION_RESULTS.md)에 기록했다. C2 구현/uniqueness 유지비 검증은 보류다.
- [x] C1의 원래 앱 core-only 공식 290표본과 일반 입력 예제의 비공식 JS+nextTick 진단을 분리했다.

통과: 어떤 작업이 제거되고 어떤 작업이 남는지 증거로 설명할 수 있다. 아직 O(n)인 경로에 O(1) 또는 변경 수만큼이라는 표현을 쓰지 않는다.

Phase 1은 예상 작업량까지, Phase 2 C1은 실제 제거량·유지비와 공식 사전 비교까지 완료했다. 당시 C2는 미구현이었으며 현재 DC-17의 격리 프로토타입과 구분한다. C1의 68개 카운터 검사, 24개 시간 context, 6개 회수 context, dual 1,050 passed·3 skipped와 B3 검사는 최종 후보의 Phase 4~6 검증을 대신하지 않는다. 후보 size는 53B 초과해 실패한 상태로 기록했다.

## M-3. keyed 정체성·이동·부모 위치 — DC-2/DC-6, Phase 2·5

- [x] 상태가 있는 행을 생성하고 선택/입력 → 앞·중간 삽입 → 원거리 swap → 역순 → 일부 삭제 → 다시 갱신한다. DOM 객체와 행의 내부 상태가 올바른 key에 유지된다.
- [x] 같은 순서/바뀐 순서의 중복 키, 0/false/빈 문자열/NaN/Symbol/object 키, null·unkeyed 혼합이 baseline의 소비·삭제와 일치한다. 각 인스턴스는 한 번만 unmount된다.
- [x] N/A(최종 E는 C1 위치 cache 미도입). C1 후보에서 저장 위치가 stale인 삭제/이동/reparent 후 자체 renew가 다른 형제를 덮어쓰지 않는다. 부모 children과 조상 compChild의 공유 참조가 유지된다.
- [x] C1의 index 0·cold/warm·배열 교체·합성 in-place 재정렬 stale fallback은 카운터/DOM 검사로, 다중 위치·중복 재사용·hydration·직접 `replaceWDom`·slot 첫 등장은 dual 회귀로 확인했다. 최종 통합 e2e는 미실행이다.
- [x] K/EK 격리246회귀로 확인; 최종 E는 C2 미도입. C2 후보에서 진입 실패 시 이미 수행한 lifecycle·DOM 변경이 없고 일반 경로로 돌아간다. 중간에 tag/type이 바뀌거나 empty가 된 같은 key도 처리된다.
- [x] 리스트 뒤 footer, 빈 Fragment, 여러 실제 DOM을 내는 행, portal이 섞인 삽입/이동에서도 경계를 넘지 않는다.

최종 DC-22 자동 검증 근거는 [validation](../benchmark/comprehensive-validation.json)·[실제 package](../benchmark/comprehensive-package-dispatch.json)에 있다. C1/C3/C4 전용 항목은 미도입 N/A이고 K/EK는 격리 증거로 한정한다.

통과: 최종 DOM만 아니라 정체성·상태·mount/unmount 순서가 baseline과 같다. 공유 core spec를 base와 concurrent에서 확인한다.

## M-4. 캐시·자체 renew·부모 갱신 — DC-2/DC-4/DC-5, Phase 2·3·5

- [x] DC-15 새 행 앱의 off/helper/memo9context에서 updater 진입과 JSX view 수를 분리하고 mutable label·선택·swap·양방향 배칭·key identity·삭제·dispose를 확인했다. helper refresh는1,000/0, memo는0/0이며 key1,000개 유지 후 등록/관찰 출력/host0개였다.
- [x] DC-13의 off/on diagnostic에서 부모 refresh·선택·mutable label·swap의 실제 updater 수와 props 동기화·DOM 정체성·batched 결과·최종 dispose/GC가 계약과 같다. 6context·key1,000개 유지 후 등록/관찰한 VDOM/host0개를 확인했다.
- [x] C3 기준 회귀에서 기존 parent→child의 base/concurrent 실행 수 차이, child→parent의 두 번 실행, pre/post callback·callback 재예약·삭제를 확인했다. 새 회귀 양쪽 **10개씩**, 전체 dual **1,070 passed·3 skipped**·타입 검사 통과. 이 baseline 결과를 별도 C3 hit/miss 전용 검증과 구분한다.
- [x] C3-T1~T4: 전용 33회귀에서 setup 등록 오류, incoming selector·복사/Object.is·길이·key 변화, mutable row·빠뜨린 deps, nonempty slots·특수 props fallback을 확인했다. 후보 소스/실험 타입도 통과했다.
- [x] C3 부모 hit의 props 동기화·live wrapper·자체 요청 유지와 updater/pre/post 생략, self/public replace 우회·miss 배칭 표를 확인했다. 최종 회귀는 후보 패치·[보고서](../benchmark/PARENT_MEMO_RESULTS.md)에 보존한다.
- [x] 기존 API에서 cache hit 후에도 `updateCallback`과 updater가 기존 규칙대로 실행된다. 동일 cached 객체의 `type = null` 전환이 삭제로 반영된다.
- [x] 같은 VDOM을 다른 위치에 재사용해도 독립적인 DOM·컴포넌트 상태가 만들어진다. 이동한 cached subtree의 자식 자체 renew가 계속 작동한다.
- [x] mutable props의 변경·삭제, frozen props, children/slots 교체와 외부 상태 변경을 처리한다. 참조 동일성만으로 필요한 갱신을 누락하지 않는다.
- [x] N/A(새 C3/C4 API 없음). 새 C3/C4 계약이 있다면 선언한 deps/토큰/구조 정보의 변경과 무효화 누락의 처리 규칙을 각각 검증한다. 기본 API와 새 옵트인의 callback 의미 차이가 문서와 같다.
- [x] 부모→자식/자식→부모 갱신을 같은 task에 각각 예약한 뒤 swap·partial·삭제를 섞는다. 자체 renew를 삼키거나 낡은 wrapper로 되돌리지 않는다.
- [x] N/A(C4 미도입). C4가 있다면 구조 변경 없는 항목 갱신과 삽입·삭제·정렬의 fallback, 외부 mutation에 대한 선언된 동작을 확인한다.

통과: 기존 동작이 보존되고 새 기능은 명시된 계약에서만 생략한다. 새로운 API를 설계하지 않았다면 해당 전용 항목은 N/A다.

## M-5. lifecycle·예외·브라우저 통합 — R8/R9, Phase 2·5·6

- [x] mount/update/unmount 순서, hook 정리, 삭제 뒤 queued renew, render throw 후 남은 queue 복구를 확인한다.
- [x] 텍스트·input/checkbox/select·SVG·event handler 교체가 정상이며 focus·selection 등 유지되어야 할 DOM 상태가 보존된다.
- [x] Fragment/portal/HTML root의 생성·갱신·삭제와 외부 형제 보존을 확인한다.
- [x] SSR 출력 → hydration → keyed 갱신에서 노드 정체성과 이벤트가 정상이다. 예제/문서 앱에 새 콘솔 오류가 없다.

통과: B4와 관련 e2e 증거가 최종 후보 해시를 가리키며 실브라우저 결과가 기대와 같다.

## M-6. concurrent와 기존 retained 기능 — DC-3/DC-7, Phase 3·5·6

- [x] DC-12의 staging alias 회귀·실제 consumer 타입이 통과한다. helper/JSX는 같은 core 인스턴스로 alias하며 default setup에서 isolated hook을 섞으면 명시적 오류가 난다.
- [x] C3 첫 후보는 base만 지원하며 concurrent의 새 API 부재를 실행 검증했다. DC-11의 commit/abandon 새 기능 지원은 미구현이다.
- [x] C3-T1: 실제 ESM/CommonJS·consumer 타입을 확인했다. concurrent named import는 ESM missing export/TS2305로 실패하고 기존 helper/공통 dual·원래 앱 B3는 통과했다.
- [x] 공통 core spec와 concurrent 고유 scheduler/commit/abandon 테스트를 수행했다. base 성능 결과를 concurrent 개선율로 표시하지 않는다.
- [x] 중단 가능한 low 작업 중 high 작업을 실행해 폐기된 후보의 부모 연결·캐시·dirty 정보가 live 상태에 남지 않는다.
- [x] `createRetainedView` show/hide/dispose와 `useRenderBoundary` pause/resume 중 자식 갱신, 이동·삭제가 기존 규칙대로 동작한다.
- [x] 새 기능이 두 코어에서 지원되는지 명시하고, 미지원 조합은 의도된 방식으로 실패하거나 기존 경로를 사용한다. 공유 export/type이 깨지지 않는다.

통과: 새 memo/갱신 범위 계약이 기존 숨김·freeze 수명 계약과 혼동되거나 암묵적으로 교체되지 않는다.

## M-7. 공식 전체 성능과 비교표 — RC-2/RC-5/IC-1/IC-2, Phase 4·6

- [x] DC-16 원래 Lithent·고정 React/Preact 네 구현의 새 전체 CPU1,450/메모리150표본·양순서·source/lock/production 빌드/의존성을 확인한다. 사용자 목표는 각 CPU 전체 시간 중앙값의 네 peer 최저 대비1.10배 이하/9항목 전부다. 색상과 목표의 정규화 범위를 구분한다.
- [x] 목표 격차 상위 최대 두 항목의 별도 profile/trace를 공식 스코어와 분리해 확인하고 다음 코어 후보 또는 원인 미확정을 기록한다.
- [x] DC-15의 실제 캐시 앱 다섯 조건을 같은 차수/반대 순서로 비교했다. CPU1,450/메모리150표본, 분포480/가중36개 Python 감사를 완료했고 row helper/memo와 원래 앱 종단 손해를 분리했다.
- [x] DC-13의 같은 JS/core·설정만 다른 두 조건으로 CPU580/메모리60표본의 양순서·분포·실패/부하를 감사했다. 기능 대조이며 원래 앱 종단/전체peer 판정과 구분한다.
- [x] DC-12 core-only 양순서 대조의 앱/helper/렌더러/Chrome/엔진 해시·580표본·배치 실패를 감사했다. C3를 쓰지 않는 별도 렌더러의 비용으로만 해석하고 기능 이득·기본 렌더러 회귀·전체 peer 판정과 분리한다.
      아래 완료 체크는 DC-22 최종 후보 검증이며 DC-16 baseline 완료와 구분한다.

- [x] 최종 동일 앱·코어/helper·브라우저/엔진·lockfile 해시로 원순서/반대 순서의 전체 9 CPU 항목을 확보했다. 실제 러너의 ID·행 수·throttle·warmup·GC 설정을 기록했다.
- [x] raw 표본 수·완료 상태·실패 배치·재시도·trace가 보존된다. 다른 앱/브라우저/코어 버전이나 사전 후보의 표본을 합치지 않았다.
- [x] DC-16 baseline 범위에서 IC-1의 React/Preact 기본 비교군에 선택·부분 갱신만이 아닌 전체 항목을 실행했다. 비교군의 버전·소스와 표의 정규화/가중치/색상 모드가 고정되어 있다.
- [x] 전체 시간과 JS를 구분하고 항목별 baseline/peer 비율, 전체 가중 지표, 분포·시간 간격/부하 한계를 표시했다.
- [x] 개선 항목과 악화 항목을 모두 공개했다. 일부 악화에도 전체/상대 목표에 적합한지 판단했고, 한 항목 회귀만으로 탈락시키지 않았다.
- [x] 빠른 색상 구간의 수치 기준이 미확정이면 `목표 판정 미정`으로 쓴다. 평균 개선이나 예쁜 표만으로 모든 항목 목표 달성을 선언하지 않는다.

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
- [x] 공식 메모리 21/22/23/25/26의 절대 MB와 baseline/peer 비율을 기록한다. JS heap 진단과 `measureUserAgentSpecificMemory()`를 같은 지표로 섞지 않는다.
- [x] fresh context에서 생성/삭제 반복, partial 반복, 최종 dispose 후 DOM·listener·heap 잔류를 관찰한다. 데이터 문자열 증가와 참조 누수를 구분한다.
- [x] C1 map 생성/조회/쓰기·cold/warm/stale를 분리했다. 1천 key를 유지한 dispose 후 1천 VDOM+부모 배열의 생존 0개를 양쪽 3context씩 확인했다. 반복 부모 갱신 중 모든 과거 배열의 회수 및 100회 churn 검사는 미실행이다.
- [x] 행/경계별 메타데이터·wrapper 비용이 1k/10k 생성, append, clear에 주는 영향을 공식 전체 시간과 함께 기록한다.
- [x] C1의 세 UMD 존재와 size 실행 결과를 기록했다. 후보 base br 4,853/4,800B 실패, concurrent 6,903B·element 998B. 공개 옵트인 API 추가는 없었다.
- [x] C1은 +55B/한도 +53B와 채택 보류를 공개했다. 저장 구조 변경·옵트인 분리/상쇄는 후속 가설이며 한도를 변경하지 않았다.

통과: 검사한 조건의 DOM/listener/관찰 WeakRef 회수와 비용이 공개되어 있다. 전체 heap 누수 부재를 보장하지 않는다. 단순 메모리 증가나 개별 시간 손해의 수용 여부는 IC-2에서 별도로 판단한다.

## M-9. 범용성·문서·upstream 해석 — RC-1/DC-7, Phase 3·6

- [x] 일반 편집 목록/nested 입력 예제에서도 새 기능의 필요성과 계약을 설명할 수 있다. benchmark 행 수·id·매 10행 조건이 코어/helper에 들어 있지 않다.
- [x] 새 API는 N/A이며 기존 on\* 계약과 native 직접 등록 예제를 공개했다. 새 API가 있으면 기존 사용자의 동작, 무효화 책임, lifecycle, concurrent 지원, 비용과 제한을 문서화했다.
- [x] 수동 VDOM 캐싱을 라이브러리로 옮겨 upstream note #1261 면제를 보장하지 않는다. 실제 구현의 설명과 [제출 규칙](https://github.com/krausest/js-framework-benchmark#44-submitting-your-implementation)·[해당 주석](https://github.com/krausest/js-framework-benchmark/issues/1261)을 연결한다.
- [x] 원래 앱의 core-only 이득, 새 공개 기능 사용 이득, 최종 앱의 종단 이득을 구분한다. maintainer 리뷰 통과는 확인 전까지 미확정이다.

통과: 일반 사용자에게 유용한 기능/내부 개선이며 benchmark 결과만으로 안정성·리뷰 승인을 약속하지 않는다.

## M-10. 복원·증거·인계 — RC-4/IC-4, Phase 6

- [x] 채택/보류/기각과 이유, 완료/미완료 항목, 다음 작업·블로커·실제 commit SHA를 남겼다.
- [x] N/A(격리 K/EK는 기본에 적용하지 않았고 E는 채택). 기각 시 파일별 사전 상태와 현재 상태를 확인한 뒤 자신이 만든 변경만 복원했다. 두 코어 build·핵심 회귀와 산출물 해시를 확인했다.
- [x] 결과 JSON·소스·번들·러너·로그·압축 증거의 해시를 감사했다. trace 미보존 등 제한도 명시했다.
- [x] 실제 upstream 실험 앱·기존 조사 자료·다른 사람의 변경이 보존되었다. 요청하지 않은 배포·PR·버전 변경을 하지 않았다.

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
- [x] [결과](../benchmark/NODE_SHAPE_RESULTS.md)·[raw/manifest](../benchmark/node-shape-results.json)·[선택 패치](../benchmark/node-shape-candidate.patch)·[full 대안](../benchmark/node-shape-full-candidate.patch)·[증거](../benchmark/node-shape-evidence.json.gz)·[재현/감사](../../experiments/node-shape/README.md)를 보존했다.1,367entries/33,532,074B·SHA-256 `86b390a2c9ed09503361cd474cd122dfe16677d5afc7405689b1d956024baaef`,384분포/18가중·4,380IC/724deopt·CPU1,160/메모리120/retention12/79파일 독립 감사 완료다.
- [x] 후속 DC-22에서 네 fixed peer를 같은 새 환경에서 전체9항목 재비교해1.10 목표를 판정한다. DC-18은 이 범위 밖이며 완료로 표시하지 않는다.
- [x] 후속 DC-22의 E/K/EK 재평가와 최종 E의 Phase5/6을 완료했다. DC-18 당시 검증으로 소급하지 않는다. DC-18 한정 통합 완료를 전체 연구 종료로 확대하지 않는다.

통과: compact13 기본 반영·한정 통합/보존 감사는 완료했다. 모든 앱/환경의 성능·전면 own-key 동등성·전체 heap 누수 부재·전체 peer 목표는 보장하지 않는다.

## M-12. 보존 Fragment range 검토 — R52, DC-22, Phase4A/D

- [x] 보존점 `6993a93`의 [DC-19 보고서](https://github.com/superlucky84/lithent/blob/6993a93cecf67e445b30ee4ea014ca419235d946/docs/benchmark/FRAGMENT_ANCHOR_RESULTS.md)와 source `f997302`의 역할을 검토했다. suffix 복사 제거와 getter snapshot 차이·시간 grid/순서 한계를 종합 후보 목록에 반영했다.
- [x] 최종 검토표에 이번 보류 사유 또는 재개 근거를 남긴다. 재개한다면 getter/index 읽기·뒤 원소 변이/throw·sparse/길이 snapshot을 B와 대조하고 새 구현의 실측·크기·메모리를 확보한다.

통과: 과거 이득과 호환성 한계를 검토한 기록이 있고, 이번 미반영/재개 이유가 남는다. 보류를 새 후보 검사 통과로 표시하지 않는다.

## M-13. snapshot 보존 Fragment 후속 검토 — R52, DC-22, Phase4A/D

- [x] [DC-19B 보고서](https://github.com/superlucky84/lithent/blob/6993a93cecf67e445b30ee4ea014ca419235d946/docs/benchmark/FRAGMENT_ANCHOR_SNAPSHOT_RESULTS.md)와 source `3afd8de`의 역할을 검토했다. callback/singleton 제거는 확인했으나 pooled 시간 이득 미확인·br+21B였음을 기록했다. 크기만으로 탈락시킨 결과가 아니다.
- [x] 최종 trace의 앵커 hotspot과 새로운 수정 가설 유무로 이번 보류/재개를 기록한다. 재개하면 source/번들·양순서·현재 baseline을 고정하고 새 대조를 수행한다.

통과: range와 snapshot 후보를 구분하고, 단순 할당 감소를 최종 렌더링 개선으로 표시하지 않는다.

## M-14. slot 이벤트와 native 연동 계약 — R52/R56, DC-22-2, Phase4A/B

- [x] [DC-20 보고서](https://github.com/superlucky84/lithent/blob/6993a93cecf67e445b30ee4ea014ca419235d946/docs/benchmark/EVENT_PROXY_RESULTS.md)의 inline 이득·heap/dispatch 비용과 slot `189ddef`를 비교 구현으로 검토했다. 이전 slot/noevent+21%와 새3-way의 재현되지 않은 결과를 분리했다.
- [x] 실제 API 문서·ref/native listener/custom-element 사용을 확인하고 native 상대 순서·원 callback remove/dedup·active dispatch 교체의 baseline/slot/E 기대값을 표로 고정한다.
- [x] DC-22-2의 기본/호환/opt-in 경계를 선택하고, 달라지는 관찰·영향받는 사용·회피 경로를 문서와 회귀로 연결한다. 외부 listener 존재를 모두 자동 검출할 수 있다고 가정하지 않는다.

통과: 관련 계약이 명시되고 선택한 경로의 기대값이 실브라우저에서 맞는다. 과거 미채택만으로 검토를 닫거나, 크기 허용을 이벤트 동작 변경의 승인으로 간주하면 실패다.

## M-15. flat 이벤트 수정과 일반 UI 이득 — R54~R56/R60, DC-22-1/2/4, Phase4B/D·5

- [x] [DC-21 보고서](https://github.com/superlucky84/lithent/blob/6993a93cecf67e445b30ee4ea014ca419235d946/docs/benchmark/EVENT_PROXY_FLAT_RESULTS.md), 활성 source `7e838bc`, [추가 버그 원자료](https://github.com/superlucky84/lithent/blob/6993a93cecf67e445b30ee4ea014ca419235d946/docs/benchmark/event-proxy-flat-alias-dispatch.json)와 재현 스크립트를 검토했다. inline 갱신−29.01~37.07%·UMD br+168B를 우선 후보 선정 근거로 포함했다.
- [x] **M-15-S1 격리 E 확인:** [production trusted 원자료](../benchmark/comprehensive-event-dispatch.json)에서 먼저 등록된 native listener가 renew로 `onclick=B`를 추가해도 기존 A는 첫 클릭1회·다음 A/B 각1회였다. nested는 A2회를 보존했다. baseline/slot과 같은 기대값이며 보존 flat의 A 누락은 negative control로 남긴다. 최종 채택 source가 바뀌면 재검증한다.
- [x] synthetic/중첩 dispatch·현재/다른 target·alias 추가/교체/삭제·동일 callback dedup·stopImmediatePropagation·handler throw 뒤 재개를 확인한다. 외부 listener 관찰은 DC-22-2에서 확정한 계약과 대조한다.
- [x] 함수 this/currentTarget·object.handleEvent receiver·frozen 함수/객체·독립 event·SVG/custom element·retained ordinary DOM·portal shared target을 확인한다. concurrent 직접 등록/portal commit/abandon도 실제 bundle로 검사한다.
- [x] 수집 전 확정한 B/E/K/EK의 inline-only/inline-text/stable-text/noevent-text128fresh pages·별도48GC contexts에서 update→nextTick·mount·dispatch·live heap·churn/dispose·settled DOM/listener를 보고한다.
- [x] 실제 앱형 폼/목록에서 새 inline closure와 trusted input→최종 paint를 별도 trace/원자료로 확인한다. 기존 cached benchmark rebind0과 일반 inline 이득을 각각 기록한다.

통과: A 누락이 해결되고 확정한 이벤트 계약·회수 검사를 만족하며, 새 해시의 이득/손해를 모두 평가한다. 정확성 실패는 채택 차단이다. 개별 dispatch/메모리 손해나 소폭 크기 증가만으로 자동 기각하지 않는다.

## M-16. 종합 조합·최종 목표·코어 반영 — R53/R57~R59, DC-22-3/5/6, Phase4C~6

- [x] 같은 compact13 B, 이벤트 수정 E, C2 K, 결합 EK의 소스/lock/앱/도구/browser·엔진 hash와 조건 순서/표본 계획을 동결한다. 기존 C2의4,952B/이벤트의4,992B는 과거 artifact의 값으로 남기고 새 크기를 측정한다.
- [x] K의 general Map·key 관찰·proof 게시/한 번 소비/throw·reentry 폐기와 EK의 event→renew 상호작용이 baseline 계약을 지킨다. 원래 앱/keyed9동작/font·DOM 정체성 B3를4조건에 확인한다.
- [x] 공식4조건 CPU1,160/메모리120·조건별3fresh context retention을 확보한다. E/B·K/B·EK/B·EK/E·EK/K의 차수별/pooled 전체·JS·paint·절대MB·번들·실패/재시도를 독립 감사한다.
- [x] 최종 B/선택 후보/네 fixed peer의 CPU1,740·공식 메모리180을 새 동일 조건으로 비교한다. 재사용/중복 제거 시 사전 manifest의 이유·해시·시간 간격을 확인한다. 네 peer 최저 대비9항목1.10 판정을 일반 이벤트 앱 이득과 별도로 남긴다.
- [x] compact13/full22·flat/slot·Fragment 두 후보·C1~C4의 최종 포함/제외/조건부 재개 이유가 모두 있다. 미측정·불확실·목표 미달을 완료/달성으로 바꾸지 않는다.
- [x] 선택 후보의 Test Hardening·Integration Test/B4와 SSR/hydration·helper/HMR·element·예제/docs·base/concurrent 지원 범위 검증이 같은 최종 source/산출물을 가리킨다.
- [x] 채택 source와 실제 production3형식이 측정 후보와 일치한다. raw/gzip/br 증가·이득/비용을 근거로 guard/정본/보고서를 갱신하고 `pnpm size`와 회귀를 확보한다. 과거4,824B를 이유로 소폭 증가 후보의 평가를 생략하거나 임의의 숫자 상한·여유를 만들지 않는다.

통과: 선택/교환 근거·정합성·측정·최종 반영 코드가 연결된다.9항목1.10 미달이 남으면 목표는 미달로 보고하고 별도 채택 근거를 명시한다. 계획 완료와 구현/실측/코어 반영 완료를 구분한다.

## 상태 / 핸드오프

- done: DC-23 compact13/native 복원·검증을 유지한다. DC-24 추가 크기 조사에서 출력41개/실제 빌드12개를 비교했고 hidden map의 동일 실행 AST·소스맵6형식을 확인했다. [조사 결과](../benchmark/BUNDLE_SIZE_RESULTS.md)·[검증](../benchmark/bundle-size-proof.json)에 연결한다. 기본 runtime/빌드와 DC-23 증거는 그대로다.
- next: 이번 번들 조사는 완료했다. hidden map은 Brotli26B를 줄이지만 자동 디버깅 연결을 잃어 기본 변경은 추천하지 않는다. 구문 압축은 추가9~16B 후보로 보류하며 runtime/heap/performance를 검증하지 않았다. 새로운 구조 후보·CPU6/9 목표 연구·배포는 별도 작업이다.
- blockers: 조사 실행 블로커 없음. 미채택 구문 후보의 추가 검증은 미실행으로 명시한다.
- commit: 시작/최신 `463c6cd`; DC-23 복원과 이번 DC-24 조사 문서/도구는 미커밋이다. native B `fb481f3`, compact13 `ff8b80a`, 보존 E `95d6faf`. 기존 원자료/아카이브를 덮어쓰지 않았다.
