# MANUAL_TEST_CHECKLIST — 코어 구조 개선의 최종 확인

- 기준일: 2026-10-21. 상태: **Phase 1의 M-1·M-2 기준선 범위 완료. 후보 구현·최종 검증은 미수행**.
- 정본: [REQUIREMENTS](./REQUIREMENTS.md), [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md).
- 체크에는 결과·실행 시각·소스/번들 해시·증거 경로를 남긴다. 후보에 해당하지 않는 항목은 이유와 함께 N/A로 기록한다. 자동 테스트가 대신한 항목도 해당 증거를 연결한다.
- 각 항목은 표시된 Phase에서 해당 증거를 확보하며 M-1·M-2는 후보 구현 전에도 수행한다. 최종 채택 확인에서는 후보의 B1~B4 통과와 성능 측정 산출물이 필요하다. 정합성 실패를 시간·메모리 교환으로 허용하지 않는다. 개별 성능 손해 자체는 실패 판정이 아니다.

## M-1. 기준선과 작업 상태 — RC-1/RC-4, Phase 0·1·6

- [x] Phase 1 기준선의 base 1.25.2/concurrent 0.2.2 소스/번들 해시, 변경 파일, HEAD를 [보고서와 manifest](../benchmark/STRUCTURAL_BASELINE_RESULTS.md)에 기록했다. 새 코어 후보는 없으며 최종 후보 해시는 Phase 6에서 다시 확인한다.
- [x] 원래 upstream 앱, 초기 targeted 실험 앱, 이번 진단/production staging을 구별했다. 원래 앱을 기존 evidence의 `official-main.tsx`에서 추출하고 실제 upstream targeted 앱을 보존했다.
- [x] 과거 문서/보고서와 미채택 결정을 보존했다. Phase 1은 현재 기준선의 별도 진단으로 기록했다.
- [ ] 최종 작업 트리에서 실행한 후보와 보고서가 일치한다. 채택하지 않은 코드가 dist에만 남거나 반대로 소스만 남지 않았다.

통과: 원본과 후보를 문서만으로 재구성할 수 있다. 이번 문서 작성 완료와 실행 완료가 혼동되지 않는다.

## M-2. 실제로 줄인 작업 — DC-1/DC-6, Phase 1·2

- [x] 원래 Table·행별 갱신·일반 nested slot 예제에서 updater, cache, keyed 매칭, diff, 부모/slot 검색 방문 추정, placement, DOM mutation을 [38개 시나리오](../benchmark/structural-baseline-results.json)로 분리했다.
- [x] 1k/10k와 `k = 1, 10, n/10`, 선택 위치·parent-refresh를 바꿔 전체 목록과 변경 범위 처리를 구분했다. 계측 값과 uniqueness shadow를 공식 production 속도 개선으로 사용하지 않았다.
- [ ] C1 위치 유지와 C2 uniqueness/순서 검사 등 새 비용을 카운터와 생성·메모리 비교에 포함했다.
- [ ] 원래 앱을 바꾸지 않은 core-only 결과와 앱 구조/공개 기능을 사용하는 결과가 별도로 표시된다.

통과: 어떤 작업이 제거되고 어떤 작업이 남는지 증거로 설명할 수 있다. 아직 O(n)인 경로에 O(1) 또는 변경 수만큼이라는 표현을 쓰지 않는다.

Phase 1 범위: 현재 작업량·후보의 예상 제거 작업까지만 확인했다. C1의 실제 위치 유지, C2의 대체 구현, 생성/메모리 비용과 core-only 후보 성능은 미실행이므로 위의 후속 후보 전용 두 체크는 미완료다. 진단의 DOM/입력 정체성·값, B1~B3는 통과했지만 최종 후보 검증을 대신하지 않는다.

## M-3. keyed 정체성·이동·부모 위치 — DC-2/DC-6, Phase 2·5

- [ ] 상태가 있는 행을 생성하고 선택/입력 → 앞·중간 삽입 → 원거리 swap → 역순 → 일부 삭제 → 다시 갱신한다. DOM 객체와 행의 내부 상태가 올바른 key에 유지된다.
- [ ] 같은 순서/바뀐 순서의 중복 키, 0/false/빈 문자열/NaN/Symbol/object 키, null·unkeyed 혼합이 baseline의 소비·삭제와 일치한다. 각 인스턴스는 한 번만 unmount된다.
- [ ] C1 후보에서 저장 위치가 stale인 삭제/이동/reparent 후 자체 renew가 다른 형제를 덮어쓰지 않는다. 부모 children과 조상 compChild의 공유 참조가 유지된다.
- [ ] C2 후보에서 진입 실패 시 이미 수행한 lifecycle·DOM 변경이 없고 일반 경로로 돌아간다. 중간에 tag/type이 바뀌거나 empty가 된 같은 key도 처리된다.
- [ ] 리스트 뒤 footer, 빈 Fragment, 여러 실제 DOM을 내는 행, portal이 섞인 삽입/이동에서도 경계를 넘지 않는다.

통과: 최종 DOM만 아니라 정체성·상태·mount/unmount 순서가 baseline과 같다. 공유 core spec를 base와 concurrent에서 확인한다.

## M-4. 캐시·자체 renew·부모 갱신 — DC-2/DC-4/DC-5, Phase 2·3·5

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

- [ ] 공통 core spec와 concurrent 고유 scheduler/commit/abandon 테스트를 수행했다. base 성능 결과를 concurrent 개선율로 표시하지 않는다.
- [ ] 중단 가능한 low 작업 중 high 작업을 실행해 폐기된 후보의 부모 연결·캐시·dirty 정보가 live 상태에 남지 않는다.
- [ ] `createRetainedView` show/hide/dispose와 `useRenderBoundary` pause/resume 중 자식 갱신, 이동·삭제가 기존 규칙대로 동작한다.
- [ ] 새 기능이 두 코어에서 지원되는지 명시하고, 미지원 조합은 의도된 방식으로 실패하거나 기존 경로를 사용한다. 공유 export/type이 깨지지 않는다.

통과: 새 memo/갱신 범위 계약이 기존 숨김·freeze 수명 계약과 혼동되거나 암묵적으로 교체되지 않는다.

## M-7. 공식 전체 성능과 비교표 — RC-2/RC-5/IC-1/IC-2, Phase 4·6

- [ ] 최종 동일 앱·코어/helper·브라우저/엔진·lockfile 해시로 원순서/반대 순서의 전체 9 CPU 항목을 확보했다. 실제 러너의 ID·행 수·throttle·warmup·GC 설정을 기록했다.
- [ ] raw 표본 수·완료 상태·실패 배치·재시도·trace가 보존된다. 다른 앱/브라우저/코어 버전이나 사전 후보의 표본을 합치지 않았다.
- [ ] IC-1의 React/Preact 기본 비교군에 선택·부분 갱신만이 아닌 전체 항목을 실행했다. 비교군의 버전·소스와 표의 정규화/가중치/색상 모드가 고정되어 있다.
- [ ] 전체 시간과 JS를 구분하고 항목별 baseline/peer 비율, 전체 가중 지표, 분포·시간 간격/부하 한계를 표시했다.
- [ ] 개선 항목과 악화 항목을 모두 공개했다. 일부 악화에도 전체/상대 목표에 적합한지 판단했고, 한 항목 회귀만으로 탈락시키지 않았다.
- [ ] 빠른 색상 구간의 수치 기준이 미확정이면 `목표 판정 미정`으로 쓴다. 평균 개선이나 예쁜 표만으로 모든 항목 목표 달성을 선언하지 않는다.

통과: 비교가 완전하고 재현 가능하다. **측정 통과와 사용자의 전 항목 목표 달성은 별도 판정**이다.

## M-8. 메모리·생성/삭제·번들 — R11/R12/IC-2/IC-3, Phase 2·4·5·6

- [ ] 공식 메모리 21/22/23/25/26의 절대 MB와 baseline/peer 비율을 기록한다. JS heap 진단과 `measureUserAgentSpecificMemory()`를 같은 지표로 섞지 않는다.
- [ ] fresh context에서 생성/삭제 반복, partial 반복, 최종 dispose 후 DOM·listener·heap 잔류를 관찰한다. 데이터 문자열 증가와 참조 누수를 구분한다.
- [ ] 행/경계별 메타데이터·wrapper 비용이 1k/10k 생성, append, clear에 주는 영향을 공식 전체 시간과 함께 기록한다.
- [ ] base/concurrent/element UMD 존재를 확인한 뒤 `pnpm size`를 실행했다. raw/gzip/br 및 선택적 API 사용/미사용 번들 비용을 기록한다.
- [ ] 기존 한도 초과 시 수치·격리/상쇄 대안·미채택 상태를 표시했다. 한도를 조용히 바꾸거나 2B 여유를 코어 개선 불가능의 근거로 쓰지 않았다.

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

- done: Phase 1의 M-1·M-2 기준선 재구성·38개 진단·B1~B3 근거를 연결했다. 후보 전용·최종 단계 항목은 미완료로 유지한다.
- next: DC-6을 닫은 C1 프로토타입에서 M-2~M-6·M-8의 해당 항목을 수행하고 실제 후보 해시의 증거를 연결한다.
- blockers: 현재 없음. 새 기능 전용 항목은 후보 선정 후 적용 범위를 결정한다.
- commit: 런타임 기준 `085137b0447a8bbe7d28d3bf55c0a997779132b2`; Phase 0 문서 `dbbd320a5b92c63262d43b667692396ae5d53322`. 이번 실행 변경은 미커밋.
