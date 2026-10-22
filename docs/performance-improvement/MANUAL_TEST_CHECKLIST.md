# MANUAL_TEST_CHECKLIST — 코어 구조 개선의 최종 확인

- 기준일: 2026-10-22. 상태: **DC-14 production300회 churn·14 snapshot의 heap 귀속 완료. DC-15 캐시 대조 계획 확정, 공식 측정 미실행. 기본 runtime 보존·채택 보류**.
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md).
- 체크에는 결과·실행 시각·소스/번들 해시·증거 경로를 남긴다. 후보에 해당하지 않는 항목은 이유와 함께 N/A로 기록한다. 자동 테스트가 대신한 항목도 해당 증거를 연결한다.
- 각 항목은 표시된 Phase에서 해당 증거를 확보하며 M-1·M-2는 후보 구현 전에도 수행한다. 최종 채택 확인에서는 후보의 B1~B4 통과와 성능 측정 산출물이 필요하다. 정합성 실패를 시간·메모리 교환으로 허용하지 않는다. 개별 성능 손해 자체는 실패 판정이 아니다.

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

Phase 1은 예상 작업량까지, Phase 2 C1은 실제 제거량·유지비와 공식 사전 비교까지 완료했다. C2는 미구현이다. C1의 68개 카운터 검사, 24개 시간 context, 6개 회수 context, dual 1,050 passed·3 skipped와 B3 검사는 최종 후보의 Phase 4~6 검증을 대신하지 않는다. 후보 size는 53B 초과해 실패한 상태로 기록했다.

## M-3. keyed 정체성·이동·부모 위치 — DC-2/DC-6, Phase 2·5

- [ ] 상태가 있는 행을 생성하고 선택/입력 → 앞·중간 삽입 → 원거리 swap → 역순 → 일부 삭제 → 다시 갱신한다. DOM 객체와 행의 내부 상태가 올바른 key에 유지된다.
- [ ] 같은 순서/바뀐 순서의 중복 키, 0/false/빈 문자열/NaN/Symbol/object 키, null·unkeyed 혼합이 baseline의 소비·삭제와 일치한다. 각 인스턴스는 한 번만 unmount된다.
- [ ] C1 후보에서 저장 위치가 stale인 삭제/이동/reparent 후 자체 renew가 다른 형제를 덮어쓰지 않는다. 부모 children과 조상 compChild의 공유 참조가 유지된다.
- [x] C1의 index 0·cold/warm·배열 교체·합성 in-place 재정렬 stale fallback은 카운터/DOM 검사로, 다중 위치·중복 재사용·hydration·직접 `replaceWDom`·slot 첫 등장은 dual 회귀로 확인했다. 최종 통합 e2e는 미실행이다.
- [ ] C2 후보에서 진입 실패 시 이미 수행한 lifecycle·DOM 변경이 없고 일반 경로로 돌아간다. 중간에 tag/type이 바뀌거나 empty가 된 같은 key도 처리된다.
- [ ] 리스트 뒤 footer, 빈 Fragment, 여러 실제 DOM을 내는 행, portal이 섞인 삽입/이동에서도 경계를 넘지 않는다.

통과: 최종 DOM만 아니라 정체성·상태·mount/unmount 순서가 baseline과 같다. 공유 core spec를 base와 concurrent에서 확인한다.

## M-4. 캐시·자체 renew·부모 갱신 — DC-2/DC-4/DC-5, Phase 2·3·5

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

- [ ] DC-15의 실제 캐시 앱 다섯 조건을 같은 차수로 비교하고 row helper/memo와 원래 앱 종단 차이를 분리한다. 사전 계획CPU1,450/메모리150표본은 아직 미실행이다.
- [x] DC-13의 같은 JS/core·설정만 다른 두 조건으로 CPU580/메모리60표본의 양순서·분포·실패/부하를 감사했다. 기능 대조이며 원래 앱 종단/전체peer 판정과 구분한다.
- [x] DC-12 core-only 양순서 대조의 앱/helper/렌더러/Chrome/엔진 해시·580표본·배치 실패를 감사했다. C3를 쓰지 않는 별도 렌더러의 비용으로만 해석하고 기능 이득·기본 렌더러 회귀·전체 peer 판정과 분리한다.
- [ ] 최종 동일 앱·코어/helper·브라우저/엔진·lockfile 해시로 원순서/반대 순서의 전체 9 CPU 항목을 확보했다. 실제 러너의 ID·행 수·throttle·warmup·GC 설정을 기록했다.
- [ ] raw 표본 수·완료 상태·실패 배치·재시도·trace가 보존된다. 다른 앱/브라우저/코어 버전이나 사전 후보의 표본을 합치지 않았다.
- [ ] IC-1의 React/Preact 기본 비교군에 선택·부분 갱신만이 아닌 전체 항목을 실행했다. 비교군의 버전·소스와 표의 정규화/가중치/색상 모드가 고정되어 있다.
- [ ] 전체 시간과 JS를 구분하고 항목별 baseline/peer 비율, 전체 가중 지표, 분포·시간 간격/부하 한계를 표시했다.
- [ ] 개선 항목과 악화 항목을 모두 공개했다. 일부 악화에도 전체/상대 목표에 적합한지 판단했고, 한 항목 회귀만으로 탈락시키지 않았다.
- [ ] 빠른 색상 구간의 수치 기준이 미확정이면 `목표 판정 미정`으로 쓴다. 평균 개선이나 예쁜 표만으로 모든 항목 목표 달성을 선언하지 않는다.

통과: 비교가 완전하고 재현 가능하다. **측정 통과와 사용자의 전 항목 목표 달성은 별도 판정**이다.

## M-8. 메모리·생성/삭제·번들 — R11/R12/IC-2/IC-3, Phase 2·4·5·6

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

## 상태 / 핸드오프

- done: [DC-14 heap 귀속](../benchmark/PARENT_MEMO_HEAP_RESULTS.md). 동일 production의300회 churn6context와 별도14 snapshot을 확인했다. outputs WeakMap table은5→25회+196,608B,25→300회 같은 ID/262,164B였고 clear 뒤 Hole/Map만 남았다. 실제 row/memo/snapshot/output0개와 App/Table2개를 확인하고 AllocationSite 템플릿을 분리했다. Python으로 전체 snapshot 합계·shape·강한 경로를 감사했다. 기존 DC-13 공식 결과와 기본28파일/package/sibling은 보존했다.
- next: [DC-15 캐시 대조](../benchmark/PARENT_MEMO_CACHE_PLAN.md)의 기존 앱 default/isolated와 행 앱 off/helper/memo를 빌드·타입/B3/diagnostic gate 후 동차수 공식 비교한다. 계획은 CPU1,450/메모리150표본이다. 아직 측정하지 않았다. outputs 게시 후 정리는 별도 후보 가설이며 이번 코어에 적용하지 않았다.
- blockers: 실행 블로커 없음. on 한 context의 추가 heap 변동은 미귀속이다. 장기 누수 부재·원래 앱/전체peer·공개 예산·concurrent 새 지원·최종 B4/Test Hardening/Integration·RC-5/IC-1은 미완료다.
- commit: 최신 `aa20ccc84f4252c46e5a89ce1abb9ead0c6ee387` — `perf: validate isolated parent memo overhead and opt-in tradeoffs`. DC-12/DC-13은 커밋했고 DC-14 후속 도구·문서·증거는 작업 트리다. 기본 runtime은 baseline이다.
