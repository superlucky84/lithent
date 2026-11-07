# 남은 렌더링 격차 진단 — 2026-10-29

현재 코어 `4de76ef`와 기존 실험을 대조했다. **작은 변경에도 변경 없는 목록을 여러 단계에서 처리하는 비용이 남아 있다.** 다만 Preact class도 전체 목록을 순회하므로, O(n)이라는 사실만으로 두 구현의 시간 차이를 설명할 수는 없다. 차이는 순회 안의 작업량과 캐시 적중 후 생략 범위다. 클로저 컴포넌트라서 더 빨라질 수 없다는 결론은 근거가 없다.

이번 작업은 원인 분석과 후속 설계다. 새 공식 CPU/메모리 측정이나 최적화 구현은 하지 않았다. 기존 숫자를 재계산하고, 소스를 대조하고, 부모 연결 제거의 반례를 실행했다. [재계산·소스 snapshot·반례 결과](./render-gap-diagnosis.json), [재현 스크립트](../../experiments/render-gap-diagnosis/analyze.mjs)를 보존했다. 현재 계획은 [DC-26](../performance-improvement/DESIGN.md#dc-26--남은-격차-진단과-후속-분기)다.

후속 사용자 요청으로 [C4 첫 원리 검증](./C4_LIST_BOUNDARY_RESULTS.md)을 진행했다. 아래는 구현 전 진단이며 후속 결과와 구분한다. 이어 [P2 owner 확장과 Preact class 재비교](./C4_OWNER_RESULTS.md)를 진행했다.

## 1. 현재 무엇이 얼마나 느린가

최신 **동일 세션 peer 비교**는 10월 27일 [DC-25 원자료](./dc25-keyed-fast-path-final-results.json)다. 채택하지 않은 candidate 대신 **baseline**을 사용했다. 이후 10월 28일 실험도 모두 미채택이므로 현재 runtime과 연결되는 비교다. 10월 28일 앱 구조 비교와 다른 환경의 과거 결과를 합산하지 않았다.

| 동작          | Lithent 전체 ms | Preact class 전체 ms |       L/P | Lithent JS ms | Preact class JS ms |
| ------------- | --------------: | -------------------: | --------: | ------------: | -----------------: |
| 1,000행 생성  |          26.961 |               25.540 |     1.056 |         7.536 |              6.253 |
| 1,000행 교체  |          28.245 |               29.013 |     0.974 |         8.867 |             10.031 |
| 10행마다 갱신 |          15.649 |               14.614 |     1.071 |         4.177 |              2.591 |
| 행 선택       |           6.342 |                4.625 | **1.371** |     **3.114** |          **1.394** |
| 행 교환       |          16.965 |               15.529 |     1.093 |         3.320 |              1.538 |
| 한 행 삭제    |          11.966 |               12.163 |     0.984 |         1.155 |              0.707 |
| 10,000행 생성 |         270.872 |              272.621 |     0.994 |        53.587 |             50.298 |
| 1,000행 추가  |          29.562 |               29.617 |     0.998 |         7.370 |              6.617 |
| 전체 삭제     |          12.279 |               13.128 |     0.935 |         9.826 |             10.619 |

- 공식 가중 기하평균 L/P는 전체 **1.02172**, JS **1.24097**이다. 전체의 큰 격차는 선택에 집중되며, 모든 항목에서 뒤처지는 상태는 아니다. 비격리 머신의 작은 차이를 확정적인 우열로 읽지 않는다.
- 기존 목표인 네 peer 최저의 1.10배를 선택에서도 만족하려면, 이 표본 기준 6.342 → **5.08695ms** 이하, 즉 **1.25505ms / 19.79%** 감소가 필요하다. Preact와 동률이 되는 목표와는 다르다.
- 선택 paint 중앙값은 Lithent **2.371ms**, Preact class **2.544ms**다. 부분 갱신·교환도 JS 차이가 크게 보인다. 따라서 JS의 반복 작업이 우선 진단 대상이다. 독립적으로 구한 전체·JS·paint 중앙값을 더하거나 빼서 정확한 원인별 시간으로 배분하지 않는다.
- 이 최신 비교에는 **Vue가 없다**. 과거 STATUS의 Vue 수치, 다른 브라우저·앱·코어 수치로 현재 배수를 만들 수 없다. 아래 Vue 분석은 로컬 앱과 공식 문서의 구조 대조이며 새 성능 검증은 아니다.

## 2. 캐시가 있는데도 남는 일

현재 공식 A 앱은 행마다 `mount`하는 구조가 아니다. Table만 갱신하고 각 행의 `cacheUpdate`가 기존 VDOM을 돌려준다. 따라서 행 컴포넌트 1,000개의 lifecycle이 현재 A 앱의 주원인이라는 설명은 맞지 않는다.

| 단계           | 현재 Lithent가 하는 일                                                    | 변경 없는 행에도 남는가      |
| -------------- | ------------------------------------------------------------------------- | ---------------------------- |
| 앱             | `rows.map(row => row.view(row))`, 각 `[label, selected === id]` 생성·비교 | 남음                         |
| `h` 정규화     | 배열을 목록 WDom으로 만들고 자식 배열·부모 getter 연결                    | 남음                         |
| diff           | 이전 key Map 구성, 조회·소비, used 표시, 미사용 항목 검사                 | 남음                         |
| 같은 객체 판정 | 일반화/유형·empty 판정 뒤 `nr='N'`, el/op/oi/parent 처리                  | 일부 남음                    |
| render         | 위치 분석, 콘텐츠 방문, diff 메타데이터 정리                              | 남음; 같은 순서면 LIS는 생략 |
| 실제 DOM       | 선택 class 1~2개, 부분 갱신 text 100개                                    | 변경한 노드만                |

근거: [wDom](../../src/wDom.ts), [diff](../../src/diff.ts), [render](../../src/render.ts), [cacheUpdate](../../helper/src/hook/cacheUpdate.ts). 기존 [선택 계측](./SELECT_PARTIAL_UPDATE_ANALYSIS.md)은 1,000행 첫 선택에서 캐시 검사 1,000회·행 diff 1,000회, DOM class 1개를 관찰했다. [DC-25](./DC25_KEYED_FAST_PATH_RESULTS.md)도 콘텐츠 방문과 cleanup이 남는 것을 확인했다. 이 계수를 이번에 새로 측정한 시간 비중으로 표현하지 않는다.

부분 갱신은 여기에 **변경된 행 내부의 재생성**이 더해진다. 라벨만 바뀌어도 `tr/td/a/span`을 다시 만든다. 과거 계측의 100행 갱신은 `h` 801회·전체 diff 1,903회였다. 일반 `h()` API는 어떤 속성/자식이 정적인지 전달하지 않으므로 코어가 다시 비교한다.

## 3. Preact class와 Vue는 무엇이 다른가

### Preact class

로컬 `preact-classes/src/Main.jsx`도 매 갱신에 1,000개 `<Row>`를 생성한다. `Row.jsx`는 `data` 참조와 `styleClass` 두 값으로 `shouldComponentUpdate`를 판정한다. Preact 11은 이 판정이 false면 기존 DOM/children을 이어받아 자식 render/diff를 생략한다. 부모 링크 등의 유지 작업은 여전히 한다. [Preact 11 diff 원문](https://github.com/preactjs/preact/blob/11.0.0/src/diff/index.js#L194-L232).

따라서 **class 문법 자체가 빠르다는 근거가 아니다.** 특정 앱의 명시적인 생략 조건과 runtime의 처리 비용을 함께 보는 비교다. Lithent A도 이미 행 VDOM 생성을 캐시하므로, SCU 하나를 추가하면 격차가 사라진다는 해석도 틀리다. 일반 행 컴포넌트 C에서는 updater 내부 캐시 전에 props 동기화가 있고, 캐시 적중 후 Fragment 래퍼와 diff가 남는다. 그 비용은 별도 [컴포넌트 실험](./COMPONENT_COST_RESULTS.md)에 실측돼 있다.

### Vue

로컬 `vue/src/App.vue`는 `shallowRef(rows)`와 **`v-memo="[label, id === selected]"`**를 쓴다. 변경하지 않은 행의 VNode를 재사용하며 subtree diff를 생략하는 명시적 캐시다. Vue 역시 이 앱에서 memo 조건을 평가하는 목록 순회가 사라지는 것은 아니다. [Vue v-memo 문서](https://vuejs.org/api/built-in-directives.html#v-memo).

Vue 템플릿 경로는 동적인 class/text/props를 compiler가 표시하는 patch flag와 block 구조를 이용해 정적인 부분의 검사를 줄일 수 있다. 이것이 임의 `h()` 출력만 받는 Lithent와의 중요한 정보 차이다. [Vue 렌더링 문서](https://vuejs.org/guide/extras/rendering-mechanism.html#compiler-informed-virtual-dom). 이번에는 해당 로컬 Vue의 컴파일 산출물·실제 설치 버전·trace를 확보하지 않았으므로 특정 flag나 정확한 절감량을 이 앱에서 확인했다고 주장하지 않는다.

Lithent에도 template parser가 있으나 현재 [codegen](../../packages/lithentTemplateParser/src/codegen/createElement.ts)의 일반 요소 출력은 `h(tag, props, ...children)` 형태다. 템플릿 문법 지원 자체가 Vue와 같은 동적 노드 정보 전달을 의미하지 않는다. 현재 benchmark는 JSX 경로이므로 template parser만 바꿔도 기존 점수가 자동 개선되지는 않는다.

## 4. 이미 시도한 것은 재추천하지 않는다

| 시도                                                                                                                                    | 확인된 결과                                                                  | 이번 처리                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [compact13](./NODE_SHAPE_RESULTS.md)                                                                                                    | object layout 개선 채택                                                      | 이미 기본에 포함                                                  |
| [Map 삭제 제거](./KEYMATCH_CORE_RESULTS.md)·[ordered 할당](./ORDERED_CORE_RESULTS.md)·[타입 비교 생략](./TYPE_IDENTITY_CORE_RESULTS.md) | 안정적 전체 이득 없음                                                        | 같은 후보 반복 제외                                               |
| [C2 + 동일 순서 매칭 DC-25](./DC25_KEYED_FAST_PATH_RESULTS.md)                                                                          | 전체 −0.171%, 선택 JS −12.845%지만 선택 전체 +2.775%, +268B                  | 단순 Map/배치 재분석 재시도 제외                                  |
| [행별 renew](./TARGETED_UPDATE_RESULTS.md)·[retained row](./STRUCTURAL_UPDATE_RESULTS.md)                                               | 작은 갱신 개선과 생성/교체/삭제 등의 상쇄 비용                               | 행마다 컴포넌트 추가하는 제안 제외                                |
| [C1](./PARENT_POSITION_RESULTS.md)                                                                                                      | 큰 자체 갱신 검색 개선, 원래 앱 전체 이득 작음                               | 검색이 다시 병목으로 확인될 때만 재개                             |
| [C3 캐시](./PARENT_MEMO_CACHE_RESULTS.md)                                                                                               | 원래 앱 대비 전체 +21.08%, 같은 행 helper 대비 +3.75%                        | SCU/memo 추가를 새 해결책으로 제시하지 않음                       |
| [bulk removal](./BULK_REMOVAL_RESULTS.md)                                                                                               | 삭제 개선, 선택 회귀                                                         | 현재 선택 문제의 후보에서 제외                                    |
| [이벤트 proxy](./COMPREHENSIVE_RESULTS.md) → [native 복원](./NATIVE_EVENTS_RESULTS.md)                                                  | inline handler 이득과 계약/크기 비용을 평가한 뒤 사용자 선택으로 native 유지 | A 앱 선택/부분 갱신은 listener 재등록 0회; 원인으로 지목하지 않음 |
| [래퍼 재사용·경량 컴포넌트·h V1~V4](./COMPONENT_COST_RESULTS.md)                                                                        | 전체 이득 불확실; V1 4세션 −0.6%                                             | 그대로 반복하지 않음                                              |

위 결과는 서로 다른 세션이며 개선율을 합산하지 않는다. 실패한 특정 후보가 해당 설계 공간 전체의 불가능성을 입증하지도 않는다.

## 5. 새로 확인한 부모 getter 제거의 반례

10월 28일 기록의 미착수 단서는 “`h`에서 붙인 부모 getter가 mount/diff에서 덮어써진다”였다. **덮어쓰기 전 읽을 수 있는 경로가 실제로 있다.**

공개 API로 `mountReadyCallback`을 등록한 부모 컴포넌트에서, 캡처한 자식의 `getParent()`를 읽었다. 기준 소스와 `remakeChildren`의 부모 대입 한 줄만 제거한 메모리 내 negative control을 비교했다.

| 관찰 시점                   | 기준      | 생성 시 부모 대입 제거 |
| --------------------------- | --------- | ---------------------- |
| `h(App)` 후, render 전      | 실제 부모 | 없음                   |
| 부모의 `mountReadyCallback` | 실제 부모 | 없음                   |
| render 완료 후              | 실제 부모 | 실제 부모              |
| 최종 HTML                   | 동일      | 동일                   |

`wDomToDom`은 현재 노드의 mountReady 콜백을 **자식의 부모 연결을 다시 쓰기 전에** 실행한다. DOM 결과만 비교하면 이 차이를 놓친다. `map`은 primitive/null/배열 정규화도 하므로 부모 대입과 함께 무조건 삭제할 수 없다.

이 반례는 일반 helper/context가 반드시 깨진다는 주장이 아니다. 부모 연결을 읽는 관찰이 없다는 전제를 반박한다. 모든 공개 WDom 관찰을 보존하는 다른 지연 연결 설계까지 기각하지 않지만, “중복이니 바로 삭제”하는 작은 변경으로는 진행하지 않는다. 기존 parent-getter scope의 retention 제약도 유지해야 한다.

## 6. 개선 우선순위와 검증할 가설

### 1순위: 아직 구현하지 않은 C4의 변경 정보 계약

기존 [C4](../performance-improvement/DESIGN.md#c4--목록의-변경-정보가-필요한-경우)를 이제 구체화할 가치가 있다. 새 이름을 붙인 재실험이 아니라 **기존 조건부 연구 분기의 다음 단계**다.

- 목록 경계가 항목 identity, 구조 version, 변경 항목 집합을 소유한다. 구조가 그대로면 알려진 항목의 갱신만 실행하고, 삽입·삭제·정렬은 일반 keyed 경로를 사용한다.
- 행별 `mount`/resolver/lifecycle을 1,000개 추가하지 않는 가벼운 갱신 단위를 연구한다. targeted/C3의 생성·삭제·heap 비용을 피할 수 있는지 별도로 검증한다.
- **변경 항목을 찾는 비용도 포함**한다. 예를 들어 선택에 의존하는 1,000개의 effect를 모두 실행한다면 다시 O(n)이다. 선택의 이전/다음 항목 전달, 의존성 추적, compiler 중 정보 생산자를 먼저 정해야 한다.
- 임의 mutable 배열의 변화는 코어가 공짜로 알 수 없다. 소유권 경계를 우회하는 쓰기를 금지/포착/fallback하는 계약이 필요하다. key 조회 Map을 여기에 추가한다면 유지 메모리와 구조 갱신 비용도 포함한다.
- 갱신 범위가 k개라도 row 내부 VDOM 재생성은 남을 수 있다. 렌더 대상 축소와 동적 필드만 갱신하는 최적화를 구분한다.

**미결정:** API 형태, opt-in 여부의 최종 제품 결정, 변경 정보 생산자, mutable 입력 처리, lifecycle/throw/reentry, concurrent publication. 이 문서는 구현 승인이나 이득의 증거가 아니다. 권장 검증은 n=1k/10k × k=1/2/100/1k와 생성/교체/전체 삭제의 작업량·시간·메모리다. 일반 편집 목록에서도 검증한다.

### 2순위: compiler가 동적 부분을 전달하는 별도 경로

기존 JSX 변환 또는 template parser에서 정적인 자식과 동적 class/text/props를 구분하고, opt-in runtime 경로가 그 정보로 불필요한 재생성·비교를 생략하는 설계를 검토한다. 현재 C4와는 다른 축이며 처음부터 결합하지 않는다.

동적 정보는 compiler가 증명할 수 있는 범위에만 붙인다. spread, getter, 조건부 children, 사용자 함수의 임의 mutation은 일반 경로로 돌아가야 한다. 우선 AST/생성 코드의 가능 범위를 조사하고, 임의 closure의 상태를 완전히 추론한다고 약속하지 않는다. 필드/번들 증가와 HMR·SSR/hydration·concurrent 지원 비용이 있으며 기본 JSX 점수 개선은 해당 경로의 채택 후 별도 비교가 필요하다.

### 기존 API만 유지하는 작은 변경

현재 증거로 강하게 추천할 새 미세 최적화는 없다. 기본 경로만 계속 조사한다면 우선 최신 production trace에서 cache 검사·diff·commit·GC 시간을 분리해야 한다. 그 뒤 **변경 없는 자식의 commit 방문/정리를 줄이는** 가설을 제한적으로 검토할 수 있다. 이는 DC-25의 배열 4개 생략과 다른 범위지만, dirty 목록 생성·순서/cleanup 보존 비용을 더하고도 이득이 있는지는 미측정이다. 동일 객체 조기 반환이나 모든 루프 교체로 바로 치환하지 않는다.

## 재현과 한계

`node experiments/render-gap-diagnosis/analyze.mjs`는 기존 DC-25 JSON의 baseline/Preact class 비율을 재계산하고, 로컬 peer 소스·해시를 기록하며, JSDOM 반례를 실행한다. runtime/빌드/guard/벤치마크 앱은 변경하지 않는다. source snapshot은 형제 checkout에서 읽었으며 당시 timed artifact와 같다는 전제로 사용하지 않았다.

후속 단계는 C4 계약 설계 또는 compiler 조사 중 하나를 택하는 것이다. 공개 결과표의 현재 Vue 격차를 수치로 논하려면 Vue까지 동일 환경으로 다시 빌드·측정해야 한다. 이번 진단의 결론은 남는 작업과 후보의 타당성까지이며, 원인별 ms나 앞으로의 개선율은 미확정이다.

검증: JSDOM 반례의 기준/negative control 단언 통과, 별도 Python의 가중 비율 3개·9항목 표본 수와 입력/소스/snapshot 해시 검산 통과, 보고서·정본의 상대 파일 링크 199개 확인. 변경 문서/도구의 포맷과 `git diff --check`를 확인했다. 제품 코드 변경이 없어 전체 runtime suite는 재실행하지 않았다.
