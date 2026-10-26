# REQUIREMENTS — 코어 갱신 범위와 전체 렌더링 성능 개선

> **현재 결정은 DC-23이다.** DC-22의 proxy 적용/검증/측정은 당시 이력으로 보존하며 아래 R62~R66이 현재 이벤트 계약을 정의한다.

- 기준일: 2026-10-26. 상태: **DC-23 완료. compact13 유지 + native 이벤트 직접 등록. 전체 검증 통과, 원래 proxy 실험/증거 보존. 현재 CPU 목표는6/9이며 새 timing은 수집하지 않았다.**
- 조사 시작 기준 커밋: `085137b0447a8bbe7d28d3bf55c0a997779132b2`.
- 문서 순서: REQUIREMENTS → [DESIGN](./DESIGN.md) → [IMPLEMENT](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 이 폴더가 범용 코어 성능 작업의 정본이다. 7~8월 Map/LIS 계획·실측은 [과거 문서](./history/2026-07-map-lis/README.md)에 보존한다. 당시 5KB 예산·jsdom 목표·미완료 상태를 이번 기준으로 사용하지 않는다.

## DC-24 — 동작을 유지하는 추가 번들 절감 조사

- R67. 사용자 후속 요청은 현재 compact13/native에서 작은 번들 여유를 찾는 것이다. 기능/API·native 이벤트·메모리 수명·compact13 layout을 바꾸지 않는 출력/코드 후보를 먼저 조사한다.
- R68. 현재 UMD raw/gzip/Brotli를 기준으로 같은 compressor에서 실제 후보를 비교한다. source map 주석·identifier 출력·제한적인 압축을 구분하고 디버깅/성능/정합성 비용을 공개한다. 단순 이름 단축이나 raw 감소를 압축 크기 감소로 추론하지 않는다.
- R69. 후보는 별도 출력에 보존하고 현재 DC-23 산출물/증거를 덮어쓰지 않는다. 이번 조사는 가능한 절감과 추천까지이며, 미검증 후보를 기본 빌드에 채택하지 않는다. → DESIGN DC-24, IMPLEMENT DC-24, M-18.

## DC-23 — 이벤트 proxy 제외와 compact13 유지

2026-10-26 사용자 승인: 기본 proxy를 제거하고 제품의 작은 크기·단순한 native 이벤트 동작을 우선한다. DC-22를 충분히 검토한 뒤 내린 후속 제품 선택이며 이전 실측 이득을 부정하지 않는다. 아래 DC-22/R56/R60/R61의 proxy 기본 계약은 당시 이력이다. 현재 계약은 R62~R66이 우선한다.

- R62. compact13(`src/wDom.ts`, `src/utils/createWDom.ts`)은 유지한다. base/concurrent render와 공유 portal teardown의 이벤트 처리만 `fb481f3`의 native 직접 등록으로 복원하고 runtime event utility를 제거한다. 새 옵션/API를 추가하지 않는다.
- R63. 함수/객체 원본을 native listener로 등록한다. 교체 시 이전 callback을 제거하고 새 callback을 등록하므로 상대 순서·dedup·remove·진행 중 dispatch는 브라우저 규칙을 따른다. inline callback 갱신의 등록 비용이 돌아오는 점을 공개한다.
- R64. proxy source·수정 회귀·모든 raw/trace와 별도 브랜치를 보존한다. `95d6faf` 및 `experiments/comprehensive/`와 기존 보고서/manifest를 과거 증거로 유지한다. 전체 revert로 자료를 삭제하지 않는다.
- R65. 최종 build의 runtime source와 세 base JS가 고정 native B와 일치할 때 기존 B CPU/메모리 자료를 재사용한다. 신규 성능 측정으로 표현하거나 compact13 개선율과 합산하지 않는다. 일치하지 않으면 차이를 해결하거나 새 대조를 수행한다.
- R66. 양코어 정합성·전체 빌드·타입·B1/B4 하위 suite·실브라우저 회귀·패키지 형식을 검증한다. raw/gzip/Brotli를 같은 compressor로 비교하고 base guard에서 proxy 182B allowance를 제거한다. 공개 크기는 Brotli와 gzip을 구분한다.

## 1. 사용자 목표와 판단 기준

**벤치마크 앱만 복잡하게 바꾸는 대신, 일반 Lithent 앱에도 유효한 코어 개선으로 전체 렌더링 성능을 높인다.** 최근 upstream 병합 직후의 작은 앱 캐시 PR보다 근본적인 개선을 우선한다. Phase 1은 `979f88f`에 보존했고, 후속 진행 요청으로 Phase 2의 C1 한정 프로토타입을 검증했다. [C1 결과](../benchmark/PARENT_POSITION_RESULTS.md)는 10k 일반 자체 갱신의 이득과 원래 앱의 작은 공식 전체 신호를 구분한다. C1 채택은 보류했다. 당시 Phase 3의 [C3 한정 구현·검증](../benchmark/PARENT_MEMO_RESULTS.md)까지 완료했고, 크기 한도 초과로 후보를 보존한 뒤 baseline을 복원했다. [DC-12 격리 실험](../benchmark/PARENT_MEMO_ISOLATION_RESULTS.md)에서 기본 경로를 보존하고 비참여 원래 앱의 공식 CPU 580표본을 확보했다. 가중 전체 +0.10%는 양차수 방향이 달라 불확실하며, [DC-13](../benchmark/PARENT_MEMO_OPTIN_RESULTS.md)에서 같은 행 앱의 기능 이득·비용까지 검증했다. [DC-14](../benchmark/PARENT_MEMO_HEAP_RESULTS.md)는 추가 heap의 주된 원인을 outputs WeakMap table 용량으로 귀속했다. [DC-15 실제 캐시 앱 대조](../benchmark/PARENT_MEMO_CACHE_RESULTS.md)는 양순서 전체CPU1,450/메모리150표본을 완료했다. 기존 앱 대비 전체+21.08%·같은 행 helper 대비+3.75%여서 현재 C3를 기존 앱의 개선안으로 채택하지 않는다. DC-16 전체 peer 기준 뒤 DC-18 compact13을 기본 반영하고 한정 통합 검증을 완료했다. 후속 DC-22는 E 반영·통합을 완료했으며 전체 peer 목표는 6/9로 미달이다. 다른 후보의 조건부 연구와 구분한다.

- R1. 행 선택·부분 업데이트의 넓은 탐색, 부모 갱신 시 변경 없는 컴포넌트 재실행, 자식 자체 갱신의 부모 연결 비용을 검토한다. 최신 작은 코어 후보의 실패를 코어가 최적이라는 증거로 해석하지 않는다.
- R2. **개별 작업의 시간·CPU/JS·메모리 손해를 허용할 수 있다.** 한 항목의 회귀만으로 자동 탈락시키지 않는다. 전체 이득, 상대적으로 느린 항목, 손해의 절대량·반복성·실사용 영향으로 판정한다.
- R3. 사용자가2026-10-23에 확정한 CPU 목표는 **전체9항목 각각에서, 고정한 React/Preact hooks/classes 네 구현의 가장 빠른 전체 시간 중앙값의1.10배 이내**다. 같은 환경/차수의 합산 중앙값으로 항목별 판정하고 양차수의 일관성을 함께 공개한다. 평균·색상 이름으로 전 항목 달성을 대체하지 않는다. 메모리/size/startup은 별도 비용이며 이 CPU 임계치를 적용하지 않는다.
- R4. DC-16 비교군은 upstream 기본 `react-hooks`19.2.0, `react-classes`19.0.0, `preact-hooks`11.0.0, `preact-classes`11.0.0의 고정 lock/source다. 버전 차이도 실제 구현의 조건으로 기록하며 유리한 구현만 사후 선택/제외하지 않는다. 네 구현 모두의 결과와 항목별 최저값을 공개한다. 원래 Lithent baseline을 함께 비교하며 C3는 포함하지 않는다.
- R5. JS 실행 시간이 아닌 **공식 클릭→최종 paint 전체 시간**을 렌더링 성능의 주 지표로 삼는다. JS, 메모리, 번들, 생성·삭제 비용은 별도 지표로 함께 공개한다.
- R6. 기존 API를 사용하는 앱의 결과·DOM 정체성·수명·배칭·예외 복구 계약을 보존한다. 현재 이벤트 계약은 DC-23/R62~R66의 native 직접 등록을 따른다. DC-22/R56/R61은 이전 선택 이력이다. 추가 옵트인 기능이 필요하면 새 계약을 명시하고 기존 기본 동작과 구분한다.

## 2. 현재 근거와 한계

현재 기본은 **compact13 layout + DC-22 E 이벤트 최적화**다. [종합 보고서](../benchmark/COMPREHENSIVE_RESULTS.md)가 최신 근거다. base/concurrent 지원·최종 artifact/회귀/비용을 연결했고9항목 목표는 6/9로 미달이다. 아래 DC-18 수치는 당시 layout 선택의 이력이며 DC-22 표본과 합산하지 않는다.

DC-18에서는 compact13 WDom factory를 반영했다. 선택한 측정 후보와 default ESM/UMD/CJS3개의 SHA-256이 일치한다. [DC-18 결과](../benchmark/NODE_SHAPE_RESULTS.md)와 [raw/적용 manifest](../benchmark/node-shape-results.json)가 당시 근거다. full22는 미채택 대안으로 보존한다. 두 실험은 각각 자신의 fresh baseline과 비교했으며 후보 간 무작위 직접 대조나 raw 합산을 하지 않았다.

compact는 CPU580/공식 메모리60·retention6context를 확보했다. 가중 total0.9410829170477876(−5.8917%)·JS0.8557676779058773(−14.4232%), main/reverse total−6.6228%/−5.1433%이며9항목 pooled total 중앙값이 모두 낮았다. 공식10k 메모리는27.483558→28.163685MB(+0.6801MB/+2.4747%),1k+1.7657%/update5+1.1177%다. CPU reverse partial의 detached Frame1회·메모리 main ready의 Target closed1회는 자동 재시도했고 실패 원자료를 보존했다. CPU 경고는0이다. retention의 DOM/listener 증가0을 전체 heap 누수 부재로 해석하지 않는다.

full22는 별도 baseline 대비 total−4.8664%/JS−12.1886%였지만10k 메모리+14.95%,UMD br4,854B였다. compact의 측정 이득과 낮은 메모리/크기 비용을 근거로 선택했다. 두 실험 합계384분포/18가중값을 독립 Python1e-12로 감사했다. 비격리 머신의 기술 통계이며 유의성·보편적 속도 보장이나 전체 peer 목표 달성이 아니다.

입력은 archive의 원래 앱/cacheUpdate·runner dist/src·CSS/fonts185파일, 동일 package.json·별도 matching upstream lock, Node25.6.1·고정 Chrome156.0.8078.47/V8 15.6.75.19다. source probe/IC/deopt flags는 실제 시간/메모리 lane에서 제외했다. 별도 IC 진단의 ever-N39→9·wrong-map66→27과 probe Map13→3은 기전 근거이며 CPU 점수로 합산하지 않는다. Chrome155 과거 점수도 별도다. 최소 smoke의 sandbox 실패와 CPU 전 wrapper 스키마 오류·실제 compact2실패 배치를 각각 보존했다.

측정 종료/적용 직전까지29파일 guard가 통과했고 `before-adoption.json`을 남겼다. 그 뒤 `src/wDom.ts`와 새 `src/utils/createWDom.ts`를 적용했다. 최종79파일 manifest에서 초기29 중6개(wDom·baseJS3·stale concurrentJS2)가 달라졌으며 concurrent 소스는 수정하지 않았다. build:sequence/build:parallel·verify:concurrent, dual1,092 passed/3 existing skipped, strict core/concurrent/e2e 타입·ESLint·Playwright64/retry0과 strict size를 통과했다. optional metadata own-key 변화는 공개하고 props/값·참조/수명 동작을 검증했으며 전면 own-key 동등성을 주장하지 않는다.

[영구 증거](../benchmark/node-shape-evidence.json.gz)는1,367entries/33,532,074B·SHA-256 `86b390a2c9ed09503361cd474cd122dfe16677d5afc7405689b1d956024baaef`다. 독립 감사는384분포/18가중값·4,380IC access-site 검사·724raw deopt·CPU1,160/메모리120/retention12·최종79파일을 확인했다. [선택 패치](../benchmark/node-shape-candidate.patch)·[full 대안](../benchmark/node-shape-full-candidate.patch)·[재현/감사 도구](../../experiments/node-shape/README.md)를 보존했다. 아래 기존 조사와 DC-16/17은 당시 기준의 역사이며 전체 fixed-peer1.10 목표·광범위 Phase5/6은 별도로 남는다.

| 근거                                                                                                                                                            | 관찰                                                                                                            | 이번 설계에 주는 의미                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [원본 진단](../benchmark/SELECT_PARTIAL_UPDATE_ANALYSIS.md)                                                                                                     | 1,000행 진단에서 선택은 1~2 class 변경에 캐시 검사·keyed 매칭 1,000행, 부분 갱신은 100 text 변경에 diff 1,903회 | 작은 변경에도 전체 목록 처리 비용이 남음. Table 컴포넌트 갱신은 1회이며 1,001회가 아님. LIS·DOM 이동은 0회                                            |
| [초기 행별 renew](../benchmark/TARGETED_UPDATE_RESULTS.md)                                                                                                      | 전체 가중 시간 +4.7%, 선택·부분 갱신 개선                                                                       | 갱신 범위 축소는 효과가 있으나 행 컴포넌트의 생성·유지 비용이 있음                                                                                    |
| [행 VDOM 재사용](../benchmark/STRUCTURAL_UPDATE_RESULTS.md)                                                                                                     | 첫 차수 전체 −2.1%, JS −9.4%; 1,000행 메모리 3.506→4.145MB                                                      | 선택 7.920→3.507ms, 부분 갱신 18.438→14.403ms.전체 삭제 11.554→16.371ms와 생성·추가 손해도 함께 판단. 메모리 +0.639MB 자체를 치명적으로 단정하지 않음 |
| [앱 full/static/scalar](../benchmark/OVERALL_UPDATE_RESULTS.md)                                                                                                 | 첫 차수 전체 각각 −3.0/−1.9/−0.3%                                                                               | full 메모리·전체 역순 미완료. 위 행 재사용과 다른 차수이므로 직접 순위 확정·표본 합산 금지                                                            |
| [ordered](../benchmark/ORDERED_CORE_RESULTS.md), [keymatch](../benchmark/KEYMATCH_CORE_RESULTS.md), [type identity](../benchmark/TYPE_IDENTITY_CORE_RESULTS.md) | 전체 이득을 일관되게 입증하지 못해 복원                                                                         | 순회 내부 비용 실험이며 전체 방문 범위 축소 실험이 아님                                                                                               |
| [동일 VDOM 조기 반환](../benchmark/PERFORMANCE_CLOSEOUT.md), [bulk removal](../benchmark/BULK_REMOVAL_RESULTS.md)                                               | JS 또는 삭제 이득과 다른 작업 손해가 공존                                                                       | 같은 실패안을 근거 없이 반복하지 않음. 다른 진입 조건·비용 구조를 검증할 때만 별도 후보로 기록                                                        |

위 앱 후보 수치는 코어 개선율이 아니다. 진단 표본과 공식 CPU 표본을 분리한다. 공식 시나리오의 행 수·반복·스로틀은 README 문구나 ID만으로 추정하지 않고 실제 고정 러너에서 확인한다. 현재 로컬 러너의 부분 갱신 `03_update10th1k_x16`과 전체 삭제 `09_clear1k_x8`는 `#run`으로 1,000행을 준비한다. 문서 설명과 실행 코드가 다르면 manifest에 불일치를 기록하고 실행 조건을 기준으로 삼는다.

[Phase 1 기준선 보고서](../benchmark/STRUCTURAL_BASELINE_RESULTS.md)는 production 런타임을 변경하지 않은 별도 계측의 **38개 시나리오**다. 원래 앱의 1k 선택 이동은 cache 1,000회·diff 1,021회에 class 변경 2회였다. 행별 갱신과 일반 중첩 slot 예제에서는 변경 위치에 따라 부모/slot 검색 방문 추정이 n·k와 함께 증가했다. 기준선 계약·빌드·크기는 통과했으나 공식 CPU/메모리 개선을 측정한 결과는 아니다. 이 근거로 Phase 2에서 **base의 부모 children 검색만** 다루는 C1 한정 후보를 검증했고 채택을 보류했다. 당시 C2는 미구현 보류였으며 C3의 부모 기인 재실행 감소는 아래 한정 계약으로 구체화했다.

[DC-16 전체 비교](../benchmark/PEER_BASELINE_RESULTS.md)에서 새 CPU1,450/메모리150표본과 분포480/가중69개를 독립 감사했다. 목표는 합산5/9, 첫 차수5/9, 반대6/9 통과로 미달이다. 선택1.630×·부분 갱신1.269×가 큰 격차이며 1k생성1.117×·한 행 삭제1.103×도 합산 미달이다. 한 행 삭제는 차수별 경계를 오가므로 작은 초과는 불확실하다. 별도 profile119/120유효·독립 trace4context/40구간은 비용 위치를 좁히는 진단이며 공식 스코어와 합산하지 않는다. 당시 다음 후보는 아래 R27의 C2였다. 현재 실행 순서는 DC-22의 이벤트 수정·C2 재평가·결합 비교이며 최종 채택/목표 달성은 아직 아니다.

## 3. 포함 범위와 비범위

포함 범위는 `src/{diff,render,wDom}.ts`, 이벤트 utility와 공유 portal teardown(`src/hook/internal/unmount.ts`), 갱신 스케줄·컴포넌트 메타데이터 및 필요 시 대응 concurrent 경로다. 별도 브랜치의 소스·회귀·재현 도구를 검토하고 필요한 변경을 현재 기준선에 이식한다. 기존 정보로 충분한 내부 개선을 우선 검토하고, 정보가 부족할 때만 명시적 무효화·부모 재실행 생략·리스트 구조 안정성 계약을 검토한다. 공개 API 추가가 필수라고 미리 결정하지 않는다.

helper나 타입·export 수정은 범용 계약의 배치가 확정된 경우에 한한다. benchmark 전용 분기, 특정 행 수·id·매 10행 패턴, 직접 DOM 쓰기를 범용 최적화처럼 코어/helper에 옮기지 않는다. 앱 후보는 가설 검증용 증거로 보존한다.

이번 비범위는 upstream 제출, 패키지 버전·배포, 기존 앱 실험본 덮어쓰기, 선언되지 않은 immutable props/children 가정 도입이다. base와 concurrent의 스케줄러를 하나로 재작성하는 일도 목표가 아니다.

## 4. 보존해야 하는 계약과 비용 제약

- R7. keyed 소비 규칙을 유지한다. 중복 키의 첫 등장 소비, falsy/NaN/Symbol/object 키, null·unkeyed 혼합과 노드당 한 번의 소비·unmount를 기존 테스트 기준으로 검증한다.
- R8. 같은 VDOM이라도 empty 전환은 삭제해야 한다. 다른 위치의 동일 VDOM은 독립 인스턴스를 유지한다. 캐시 hit에서의 `updateCallback`, 이동 후 자식 `renew`, props/children 배열의 공유 참조를 보존한다.
- R9. Fragment/portal/HTML root/외부 형제/SSR·hydration, 예외 뒤 갱신 재개, 삭제 뒤 예약 갱신, 부모·자식 동시 갱신을 검증한다. concurrent는 중단·재시작·폐기된 작업의 상태 누출·render boundary와의 상호작용을 추가 검증한다.
- R10. 임의 mutable 상태를 읽는 부모가 새 children 배열을 반환하면, 코어가 변경 행·구조 불변을 자동으로 안다고 가정하지 않는다. 변경 정보의 생산자와 신뢰 조건을 설계에 명시한다.
- R11. 사용자 후속 지시에 따라 렌더 성능과 실제 메모리/크기 교환을 평가해 compact13을 선정했다. [크기 guard](../../scripts/size-report.js)는 base **4,800B reference + 검증된24B DC-18 allowance = 4,824B**이며 실제 UMD4,824B로 추가 여유0B다. 기존 baseline4,798B 대비 증가는26B다. concurrent6,903/9,000B·element998/1,000B는 유지한다. 이는 이번 측정/적용 artifact의 한정 allowance이고 광범위한 영구 새 예산을 정한 것이 아니다. DC-17의 당시 크기 종료/미측정 역사는 보존하며, 다른 후보도 크기만으로 평가를 중단하거나 자동 채택하지 않는다.
- R12. 메모리 증가의 허용 상한은 미정이다. 공식 메모리의 절대 MB·비율, 생성/삭제 반복 후 DOM·listener·heap 잔류를 함께 보고한다. 구조적 누수·정합성 손상은 허용 가능한 속도 교환으로 취급하지 않는다.

### Phase 3 C3의 한정 범위

- R13. 부모 갱신 생략은 새 명시적 옵트인으로 제공한다. 첫 후보는 **base 코어의 `useParentMemo` setup hook**으로 설계하며, 기존 `cacheUpdate`·`createRetainedView`·`useRenderBoundary`의 의미는 유지한다. 이름과 타입은 실험 후보의 결정이고 배포 확정이 아니다.
- R14. 의존성 selector는 동기화 전의 **incoming props를 인자로 받아** 값 배열을 만든다. 코어는 배열을 복사해 마지막 성공한 출력의 스냅샷과 비교한다. mutable 객체 참조 하나로 내부 변경을 감지한다고 약속하지 않는다. 출력·이벤트에 영향을 주는 props/외부 상태를 빠뜨리면 생략될 수 있으며, 사용자가 값을 선언하거나 자체 `renew`해야 한다.
- R15. props key의 추가·삭제와 nonempty children/slots는 첫 후보에서 강제로 기존 갱신 경로를 사용한다. children을 같은 참조로 재사용해도 생략하지 않는다. 생성자/key가 달라진 인스턴스는 기존 reconciliation 규칙을 따른다. 모든 VDOM/slot의 deep snapshot을 추가하는 방식은 이번 범위가 아니다.
- R16. 부모 생략 hit는 해당 자식의 updater와 두 단계 `updateCallback`을 모두 생략하지만 props는 기존 참조에 동기화한다. 자체 `renew`는 생략 검사를 우회한다. hit 때문에 예약된 자체 갱신을 소비하거나 live wrapper를 교체하지 않는다. miss에서는 각 코어의 기존 배칭을 유지한다. 따라서 base와 concurrent의 기존 실행 횟수가 같다고 가정하지 않는다.
- R17. 실패한 출력의 의존성을 성공한 스냅샷으로 게시하지 않는다. unmount/초기화 실패 후 새 memo 상태와 pending 상태를 정리한다. 첫 구현은 base만 지원하고 concurrent는 해당 API를 export하지 않아 잘못된 조합이 import/type 검사에서 드러나도록 한다. concurrent 지원은 commit/abandon 계약과 별도 검증 뒤 확장한다.
- R18. DC-12 첫 격리 후보는 **실험 전용의 별도 렌더러 번들**이다. 기존 base source/bundle·package exports에 분기나 새 API를 넣지 않는다. 선택한 앱은 core·JSX/helper가 동일한 렌더러 인스턴스를 사용하도록 alias한다. 서로 다른 렌더러의 h/mount/hooks를 섞는 조합은 지원하지 않는다.
- R19. 기본 렌더러의 크기/실행 경로 보존과 별도 렌더러의 비용을 분리한다. 별도 번들의 전체 raw/gzip/br를 공개하고 기존 4,800B 한도를 통과했다고 주장하지 않는다. 공개 subpath·배포·별도 크기 예산은 아직 확정하지 않는다.
- R20. 이번 공식 CPU 대조는 **새 memo를 쓰지 않는 동일 원래 앱**의 baseline/별도 렌더러 비용이다. 전체 9항목 양순서 기본 580표본을 계획한다. C3 기능 사용 이득·기본 base의 회귀·최종 전체 목표 달성으로 해석하지 않는다. 정상 측정 중 빌드/테스트를 병행하지 않는다.
- R21. DC-13 기능 대조는 **같은 행 컴포넌트 앱·같은 isolated core·같은 production JS**에서 시작 시 memo 등록만 on/off한다. 모든 동작은 부모 Table을 갱신하며 행별 직접 renew·VDOM 캐시를 추가하지 않는다. deps는 incoming row identity/id/label과 selected 값을 명시한다. 기본 원래 앱 대비 종단 개선율과 구분한다.
- R22. DC-13은 공식 CPU 9항목 양순서580표본, 공식 메모리5항목 양순서60표본, 기존 production retention의3 fresh context×두 조건/100회 생성·삭제와100회 부분 갱신을 확보한다. 새 앱의 B3·별도 작업량/최종 dispose 검사도 수행한다. 같은 해시에서 통과한 기존 core/dual 증거는 재사용하며 기본 package/28파일·실제 sibling 앱을 보존한다.
- R23. DC-14는 DC-13의 동일 production JS로 생성/clear를300회까지 확장하고 GC 뒤 heap 증가를 귀속한다. snapshot 없는3 fresh context/조건과 별도 snapshot context/조건을 구분한다. V8 self size·객체 수·강한 보유 경로를 근거로 설명하며 특정 객체의 부재를 전체 누수 부재로 확대하지 않는다. 코어 변경 없이 측정하고 기존 공식 CPU/메모리 표본과 합산하지 않는다.
- R24. 실제 캐시 앱 대조는 원래 monolithic `cacheUpdate` 앱, 같은 행 앱의 helper cache, C3 memo를 구분한다. 같은 renderer의 앱 구조 차이와 같은 구조의 기능 차이를 분리하고 다음 공식 측정 전 조건·해시·전체9항목/양순서 계획을 고정한다.
- R25. DC-16은 원래 Lithent/default와 고정 React/Preact 네 구현의 전체 CPU1,450표본·공식 메모리150표본을 두 순서로 새로 수집한다. 각 앱의 upstream production 설정을 그대로 쓰고 기존 결과와 합산하지 않는다. 소스/lock/설치 의존성/빌드·Chrome/엔진·runner/가중치/정규화/색상 함수를 고정하고 keyed·9동작/font gate를 통과한다.
- R26. 목표 대비 차이가 큰 항목의 전체/JS/paint와 별도 trace 근거를 확인해 다음 코어 후보를 선정한다. 공식 스코어와 추가 진단을 분리하고, 특정 비교군의 가장 느린 구현만을 골라 달성을 선언하지 않는다. CPU 동안 build/test를 병행하지 않는다.

### DC-17 C2의 한정 범위

- R27. DC-17은 기존 general keyed Map 매칭·키 읽기 순서·첫 중복 소비를 유지하고, 현재 diff에서 확인한 같은 위치/길이·구조 변화 없음의 결과를 render에 전달하는 C2 한정 후보다. 이전 목록의 uniqueness 캐시·새 uniqueness Set/preflight·선언되지 않은 immutable 가정·공개 API를 도입하지 않는다. 기존 Map·used/filter·미사용 삭제를 그대로 수행하고, 증명이 없으면 같은 diff 결과를 기존 render 경로에 넘긴다. general diff를 다시 실행하거나 이미 발생한 lifecycle/DOM 변경을 롤백한다고 약속하지 않는다.
- R28. 첫 메타데이터 저장은 `replaceWDom`의 동기 diff→wrapper 게시→render 한 번에만 존재하는 `WeakMap<WDom, WDom[]>` sidecar다. node와 현재 children 배열을 함께 확인하고 `typeUpdate`의 loop 진입에서 props/DOM setter/콜백보다 먼저 삭제해 한 번만 소비한다. diff 성공 전에는 사용할 수 없으며 throw·삭제·미방문 작업은 root 종료 때 전체 폐기한다. 중첩 재진입은 바깥 frame을 무효화한다. WDom shape·clone·공개 타입에 영구 필드를 추가하지 않는다. 세부 상태 전이는 [DESIGN DC-17](./DESIGN.md#dc-17--c2의-diff-결과를-render에-전달하는-한정-후보)이 정본이다.
- R29. 후보는 기존 좌→우 content 갱신, 전체 자식의 diff metadata 정리, mount queue 실행 순서를 유지한다. **DC-17 당시**에는 B1~B3/size 통과 뒤 CPU580/메모리60·retention, size 실패 시 보존/종료 분기를 적용했다. DC-18 당시에는 factory와 C2를 분리했다. 현재는 R11/R34/R57에 따라 compact13 위에서 C2를 재평가하고 이벤트와의 결합도 검증한다. 공식 성능 미측정을 개선이나 시간상 기각으로 표현하지 않는다.

### DC-18 object-layout 원인귀속 진단

- R30. 다음 독립 실행은 WDom 생성 layout·필드/transition·fast-property·`HaveSameMap` 그룹과 hot access site의 IC/deopt를 구분하는 엔진별 진단이다. 현재 사용 가능한 Chrome156.0.8078.47의 별도 복사본·실행 파일/엔진/source/build/flags를 고정하고 DC-16 Chrome155의 원인·함수 시간·공식 표본과 합산하지 않는다. intrinsic/logging 지원은 smoke로 먼저 확인하고 미지원·미수집 이유를 보존한다.
- R31. baseline의 hash 고정 원래 앱에서 select/partial/create/clear, 별도 일반 component 예제를 관찰한다. 객체 field/Map 그룹 수만으로 특정 IC site의 megamorphism·deopt 또는 CPU 격차를 단정하지 않는다. 계측이 만드는 추가 객체·참조·프로브 효과와 관측 범위를 기록한다. 진단 통계는 공식 CPU·GC/보유 메모리 이득이나 최종 목표 달성 근거로 쓰지 않는다.
- R32. DC-18의 제한 A/B는 node 생성 layout 한 축과 optional 필드 존재·`Object.keys`·getter 접근 순서의 영향을 명시하고 Map/LIS/helper/wrapper 수/event/app를 동시에 변경하지 않았다. 진단 실행은 size gate와 독립이다. 실제 성능 평가에는 R11/R34의 우선순위와 정합성/빌드·앱 계약을 적용했다. 당시 event proxy는 범위 밖이었으며, 현재는 별도 DC-22에서 명시적으로 포함한다. 새 full-list skip·새 공개 계약·영구 숫자 예산 상향을 자동 도입하지 않는다.
- R33. 첫 full22 A/B는 WDom22 own field를 고정한 단일 allocation site의 unified factory다. type·props·helper·Map/LIS·wrapper 수·events는 고정하고 별도 stage/snapshot으로 기본 runtime source16개를 보존한다. optional metadata own-presence·`Object.keys` 변화는 공개하고 실제 소비자 영향을 확인한다. 이 사실만으로 R6 실패·새 public contract·별도 사용자 승인 필요를 단정하지 않는다. 제한 구현/회귀·크기/IC 진단과 실제 속도/메모리 평가를 구분하고, 결과·메모리·통합 검증에 따라 기본 적용까지 판단할 수 있다. compact13 후속은 R37로 분리한다.
- R34. 현재 factory의 fresh 동일 설정 IC 대조는 baseline ever-N39/final N36/H10/P67, candidate ever-N9/final N9/P22~24와 wrong-map66→12를 보였지만 timing이 아니다. 독립 fresh CPU9항목·반대 순서와 공식 메모리5항목으로 실제 latency/paint/heap 영향을 검증한다. baseline/candidate의 같은 앱/helper·브라우저/엔진·production 설정과 확정 표본 수를 고정하고 native/IC/Map logging·source probe를 측정 lane에서 제외한다. 크기 비용을 공개한 채 평가하고 결과로 판단하며, 기존 Chrome155/DC-17·별도 diagnostic 표본과 합산하지 않는다. 같은 환경의 새 전체 peer 비교 전에는9항목 peer 목표 달성을 선언하지 않는다.
- R35. 공개 WDom 타입/문서에서 optional 내부 metadata가 생성 시 반드시 부재하거나 정확한 own-key 집합을 보장한다는 근거는 찾지 못했다. 현재 core229/B3의 렌더·참조/정체성·수명 동작은 보존됐으며 props의 own-enumeration 계약과 WDom metadata 열거는 구분한다. 외부 `in`/own-key 검사·spread/`Object.assign` 병합·custom JSON replacer의 관찰 차이는 구체적으로 공개하고, 측정 뒤 SSR/hydration·helper/context·devHelper/HMR·실제 consumer 통합을 검증한다. 이미 확인한 동작과 아직 검증하지 않은 범위를 근거로 평가하며 metadata 차이만으로 기본 적용 가능성을 차단하지 않는다.
- R36. full22의4,854B/+54B는 당시 평가 허용 범위였으며 full은 미채택 대안으로 보존한다. 최종 선택은 compact13의4,824B/+24B이며 성능·메모리·통합 검증과 정확한 artifact 연결을 근거로 R11의 guard를 적용한다. 다른 hash/후보로 이득·allowance를 자동 이전하지 않고9항목 전체 peer 목표·배포와 기본 구현 적용을 구분한다.
- R37. full22 첫 순서 메모리10k 약15%·1k/partial 약11% 증가를 관찰해 compact 후보1개를 별도 `compact-experiment`에 준비했다. 당시 reverse/retention 종료 전에는 compact build/test/browser를 실행하지 않았고, full 전체 수집 완료 뒤229core/17 declaration pair 빌드를 확인했다. 초기 공통 hot13필드는 `type,nr,tag,props,text,children,getParent,el,oi,oc,op,il,[wdomSymbol]`, 희소9필드 `isRoot,we,ae,ctor,compKey,compProps,compChild,reRender,rs`는 필요 시 추가한다. allocation site/함수 인자·Map/helper/LIS/events를 고정해 초기 선언 범위만 바꾸며 full source/hash·CPU580/메모리60/retention 결과를 덮어쓰지 않는다. 이제 compact IC·실제 CPU/메모리를 직렬 비교하고 선정하며 full 이득/크기 예외를 자동 이전하지 않는다.
- R38. full/compact는 각각 새 baseline의 CPU580·메모리60·retention6context를 확보했고 합계384분포/18가중값을 독립 Python1e-12로 검증했다. compact의 total−5.8917%/JS−14.4232%, main−6.6228%/reverse−5.1433%·9항목 pooled total 중앙값 하락·10k 메모리+2.4747%(+0.6801MB)를 확인했다. CPU reverse partial detached Frame1배치·메모리 main ready Target closed1배치는 자동 재시도/원자료 보존했고 CPU 경고0이다. full은 실패/경고0의 미채택 대안이다. IC 진단/후보 raw를 합산하거나 DOM/listener 증가0을 전체 heap 누수 부재로 확대하지 않는다.
- R39. compact의 측정 바이트를 `src/wDom.ts`와 새 `src/utils/createWDom.ts`에 반영하고 default ESM/UMD/CJS3개 hash가 측정 후보와 같음을 확인했다. 적용 직전29guard/`before-adoption.json`과 적용 후79파일 manifest를 구분한다. 기존29파일 중6개(wDom·baseJS3·초기 stale concurrentJS2)가 의도적으로 바뀌었으며 concurrent 소스는 수정하지 않았다. build:sequence·build:parallel·verify:concurrent, dual1,092 passed/3 existing skipped, strict core/concurrent/e2e 타입·ESLint와 Playwright64/retry0을 통과했다. 이는 DC-18 한정 적용/통합 완료이며 전체 fixed-peer1.10 목표·광범위 Phase5/6 전체 완료·전면 own-key 동등성을 의미하지 않는다.

각 한정 계약의 정본은 [DESIGN C3](./DESIGN.md#c3--부모-갱신과-자식-자체-갱신의-분리), [DC-17 C2](./DESIGN.md#dc-17--c2의-diff-결과를-render에-전달하는-한정-후보), [DC-18](./DESIGN.md#dc-18--엔진별-object-layouticdeopt-원인귀속-진단)이다. DC-18 도구/예제는 `experiments/node-shape/`, 결과는 `docs/benchmark/NODE_SHAPE_RESULTS.md`에 보존한다. 각 독립 후보는 별도 snapshot으로 검증한 뒤 DC-22에서 조합한다. C1의 추가 결합은 새로운 검색 병목 근거가 있을 때만 연다. 계약·진단·격리 구현의 한정 검증·공식 성능 검증/최종 채택을 구분한다.

## 5. 비교와 채택 정책

1. 같은 원래 앱·helper + 기준 코어/후보 코어를 먼저 비교한다. 새 옵트인 계약이 필요한 후보는 같은 앱 구조의 구기능/신기능 대조도 분리해 기능의 효과를 구한다. 앱과 코어를 동시에 바꾼 종단 개선율만으로 코어 이득을 주장하지 않는다.
2. 전체 9 CPU 항목을 두 실행 순서로 반복하고, 코드·앱·브라우저·엔진·비교군 해시가 같은 차수만 합산 가능성을 검토한다. 동일 조건이어도 시간 간격·부하와 분산을 기록한다. 작거나 불일치하는 차이는 `불확실`로 남긴다.
3. 채택 후보에는 공식 메모리 5항목, retention 진단, raw/gzip/brotli, 비교군 전체 결과가 필요하다. startup/전송 크기는 공식 CPU 점수와 분리한다. 사용자가 말한 전체 표에 포함할 startup 항목·표 모드도 IC-1에서 정한다.
4. 전체 가중 시간과 항목별 baseline/React/Preact 비율을 함께 표로 제시한다. 가중치·정규화·색상 함수를 보존한다. 일부 손해만으로 탈락시키지 않으며, 전체 목표가 미확정이면 목표 달성 판정을 유보한다.
5. 정확성 실패, 해시/측정 조건 불일치, 증거 유실은 먼저 해결한다. 속도·메모리 교환과 별개의 검증 실패다. 후보별 채택/보류/기각 이유를 남기고 기각 후보 소스·실측도 보존한다.

upstream은 [제출 규칙](https://github.com/krausest/js-framework-benchmark#44-submitting-your-implementation)에서 일반적인 사용 방식과 HTML/keyed 정합성을 요구하며, [수동 DOM/VDOM 캐싱 주석 #1261](https://github.com/krausest/js-framework-benchmark/issues/1261)이 있다. 앱 캐싱을 helper로 옮기면 주석이 면제된다는 근거는 없다. 기존 full·행 VDOM 재사용 후보의 적용 여부나 새 기능의 리뷰 통과는 maintainer 판정 전까지 **추론/미확정**이다. 코어 기능 자체의 일반적 유용성을 먼저 검증한다.

## 6. 요구사항 결정 대장

- [x] **RC-1 확정:** 코어의 범용 구조 개선 우선. 근거: 2026-10-21 사용자 방향. → Phase 1~3, M-1.
- [x] **RC-2 확정:** 개별 시간·메모리 손해 허용 가능, 한 항목 회귀 자동 탈락 금지. → Phase 4·6, M-7~M-9.
- [x] **RC-3 확정:** 기존 기본 계약 보존, 새 옵트인은 별도 계약. → DC-2~DC-5, M-3~M-6.
- [x] **RC-4 확정:** 정본 위치는 이 폴더, 기존 실측은 benchmark 보고서와 과거 문서로 보존. → Phase 0, M-1.
- [x] **RC-5 CPU 확정:** 고정 네 peer·전체 시간 중앙값·항목별 가장 빠른 peer 대비1.10배 이하/9항목 전부. 사용자 선택을 반영했다. → IC-1, DC-16, M-7. 메모리 허용 상한·size/startup의 최종 표시 범위는 별도 미정이다.
- [x] **RC-6 사용자 후속 지시 확정:** 렌더 성능을 우선하고 소폭 크기 초과는 실제 성능/메모리 뒤 고려한다. 당시 full4,854B 평가를 새 영구 예산 숫자 때문에 멈추지 않았고 DC-18은 compact4,824B/검증24B allowance를 선정했고, DC-22는 검증한 E의182B를 더해5,006B로 반영했다. 광범위 새 예산·추가 여유를 만들지 않으며 DC-17 당시 종료는 역사로 보존한다. → R11/R34/R39, DC-18, M-11.
- [x] **RC-7 종합 반영 방향 확정:** 2026-10-25 사용자 지시. 별도 브랜치의 이벤트 이득을 적극 검토하고 소폭 크기 증가를 수용 가능한 비용으로 평가한다. flat 수정본·C2·결합본의 검증과 최종 반영을 이번 계획에 포함한다. 과거 미채택/복원 또는 크기 초과만으로 검토를 끝내지 않는다. → R52~R61, DC-22, Phase4A~4E·5·6, M-12~M-16.

## 7. 별도 브랜치를 포함한 종합 반영 — DC-22

실행 기준은 현재 `fb481f3aa6d315c3d55fb1b2cb97d86f4e53c2e4`의 compact13이다. 독립 실험의 고정 보존점은 `experiment/event-proxy-flat-cloud`의 `6993a93cecf67e445b30ee4ea014ca419235d946`이다. 해당 tip은 runtime 복원 뒤 상태이므로 아래 활성 소스와 구분한다. 이전 실험의 R40~R51/DC-19~DC-21/M-12~M-15는 그 브랜치의 이력으로 보존하고, 이번 실행 계약은 R52 이후와 DC-22를 따른다.

| 검토 대상                 | 보존 근거와 이번 역할                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| compact13 / full22        | [DC-18](../benchmark/NODE_SHAPE_RESULTS.md). compact13을 유지한 기준선. full22는 메모리 비용이 큰 비교 이력으로 검토 완료했으며 새 병목 근거 없이 재실행하지 않는다.                                                                                                                                                                                                                                                                                       |
| flat 이벤트               | [DC-21 보고서](https://github.com/superlucky84/lithent/blob/6993a93cecf67e445b30ee4ea014ca419235d946/docs/benchmark/EVENT_PROXY_FLAT_RESULTS.md), 활성 소스 `7e838bcd723261cb3840388f4f0ce1dd8c13e7ec`. **우선 반영 후보**. inline 갱신−29.01~37.07%, live heap 증가분+6.99~8.73%, dispatch+6.58~11.19%, UMD br+168B는 과거 synthetic 관찰이다. 수정 후 다시 측정한다.                                                                                     |
| slot 이벤트               | [DC-20 보고서](https://github.com/superlucky84/lithent/blob/6993a93cecf67e445b30ee4ea014ca419235d946/docs/benchmark/EVENT_PROXY_RESULTS.md), 활성 소스 `189ddef82e20959ea1267ab2eb8b2f5007c4ba9a`. alias 처리의 비교 구현과 flat 메모리 절감 근거로 사용한다. 별도 실행의 noevent+21%를 새3-way 결과와 합산하지 않는다.                                                                                                                                    |
| Fragment range / snapshot | [DC-19](https://github.com/superlucky84/lithent/blob/6993a93cecf67e445b30ee4ea014ca419235d946/docs/benchmark/FRAGMENT_ANCHOR_RESULTS.md), [DC-19B](https://github.com/superlucky84/lithent/blob/6993a93cecf67e445b30ee4ea014ca419235d946/docs/benchmark/FRAGMENT_ANCHOR_SNAPSHOT_RESULTS.md). range는 getter 관찰 차이, snapshot은 시간 이득 미확인이다. source `f997302`/`3afd8de`를 검토 목록에 포함하며 새 hotspot/수정 가설이 있을 때만 추가 조합한다. |
| C2 proof 전달             | [DC-17](../benchmark/KEYED_PLACEMENT_RESULTS.md). 공식 시간·메모리 미측정이므로 **compact13 위에서 재평가**한다. 과거 br4,952B를 현재 빌드의 크기로 사용하지 않는다.                                                                                                                                                                                                                                                                                       |
| C1 / C3 / C4              | [C1](../benchmark/PARENT_POSITION_RESULTS.md), [C3 실제 캐시 대조](../benchmark/PARENT_MEMO_CACHE_RESULTS.md). C1은 자체 갱신 검색 병목이 남을 때, C3는 원래 앱과 다른 명시적 사용 사례가 있을 때 재개한다. C4는 변경 정보 소유권부터 필요한 조건부 연구다. 이번 기본 조합에 근거 없이 모두 넣지 않는다.                                                                                                                                                   |

- R52. 위 목록 전체의 이득·비용·미해결 사항과 이번 반영/조건부 재개 사유를 검토 기록에 남긴다. 별도 브랜치에 보관됐다는 이유로 이벤트 후보를 부차적인 참고로만 다루지 않는다. 원자료와 역사적 계획은 원래 보존점에 두고 필요한 구현·회귀·도구만 이식한다.
- R53. 소폭 크기 증가는 사용자 수용 범위다. 현재4,824B guard 또는 과거 C2 초과만으로 정합성을 통과한 후보의 성능/메모리 평가를 멈추지 않는다. raw/gzip/br의 절대량·증가율과 실제 이득으로 채택을 판단하고, 최종 반영 시 검증한 산출물에 맞춰 guard와 근거를 함께 갱신한다. 새 숫자 상한이나 무제한 증가 허용을 사용자 합의로 만들지 않는다.
- R54. 이벤트 이득은 inline-only/inline-text/stable-text/noevent-text와 실제 앱형 화면에서 검증한다. JS update→nextTick, 실제 입력→최종 paint, mount, dispatch, 공식 메모리와 별도 GC heap을 구분한다. 원래 cached benchmark의 select/partial rebind0이라는 사실은 일반 inline 앱의 이득을 무효화하지 않으며, 그 이득을 원래 benchmark의 개선으로 추론하지도 않는다.
- R55. flat의 active-dispatch alias 전환은 우선 수정한다. 공개 h/mount/render/renew와 trusted click에서 첫 클릭의 기존 A, 다음 클릭의 A/B가 보존되는지를 단언한다. 기존 재현 스크립트의 성공은 버그 검출이므로 수정본의 통과 판정으로 재사용하지 않는다. synthetic/중첩 dispatch·handler 교체/삭제·portal/공유 target도 포함한다. → DC-22-1, M-15.
- R56. 사용자2026-10-25 선택은 **기본 proxy 최적화 + 엄격한 native 연동의 직접 등록 경로**다. 일반 on* props는 Lithent가 handler 교체/삭제를 관리한다. 외부 native listener와의 교체 후 상대 순서 및 원 callback의 외부 remove/dedup은 직접 등록과 동일하다고 약속하지 않는다. 엄격한 등록 순서·identity·options가 필요한 이벤트는 해당 on* prop 대신 기존 ref·mountCallback의 add/removeEventListener로 관리한다. 새 전역 모드/필수 opt-in API는 추가하지 않으며 실제 사용 예제와 회귀를 제공한다. → DC-22-2, M-14·M-15.
- R57. compact13 기준 B, 이벤트 수정본 E, C2 재평가본 K, 결합본 EK를 같은 앱/도구/환경에서 비교한다. 이벤트와 C2 각각의 추가 이득 및 EK의 상호작용을 측정하고 과거 개선율을 더하거나 곱하지 않는다. C2의 general Map·관찰 순서·proof 수명/fallback 계약은 유지한다. → DC-22-3, M-16.
- R58. 최종 선택 후보는 현재 compact13과 고정 네 peer를 포함해 공식 CPU9항목·메모리5항목을 새 동일 환경/반대 순서로 비교한다. 전체9항목1.10 목표와 일반 이벤트 앱의 실용적 이득을 각각 판정한다. 한쪽 목표 미달을 숨기거나 다른 쪽의 실측 이득을 지우지 않는다. → M-7·M-16.
- R59. 최종 후보의 source/번들 hash로 Test Hardening·Integration Test·반복 회수·소비자 통합을 완료하고, 해당 변경을 현재 코어/필요한 공유 경로에 반영한다. 보고서·guard·회귀·정본 문서를 실제 반영본에 연결한다. 계획 수립, 구현, 실측, 채택, 패키지 릴리스는 별도 상태로 기록한다. → Phase5·6, M-10·M-16.
- R60. 이벤트 proxy는 base와 concurrent의 branched render에 같은 utility로 이식하고 공유 teardown의 native 직접 등록 fallback을 유지한다. 격리 concurrent329회귀 뒤 실제 산출물/portal commit/abandon·consumer 통합을 검증하며 자동으로 같은 속도 이득을 주장하지 않는다. C2 proof는 base에만 적용한다. → DC-22-4.
- R61. 기본 proxy는 실행 시점의 최신 handler를 호출하고, 진행 중인 이벤트에서 변경되지 않은 기존 handler를 alias 전환 때문에 누락시키지 않는다. 함수 this/currentTarget·object receiver·frozen handler·동일 Event 객체 재사용을 보존한다. native add/remove가 결정하는 신규 등록/삭제 시점과 proxy의 최신 handler 교체 관찰을 구분해 문서화한다. Preact11의 logical clock·callback/Event stamping은 별도 검토 대상이며 이번 alias 수정에 그대로 도입하지 않는다. → DC-22-1/2, M-15.

## 상태 / 핸드오프

- done: DC-23 compact13/native 복원·검증을 유지한다. DC-24 추가 크기 조사에서 출력41개/실제 빌드12개를 비교했고 hidden map의 동일 실행 AST·소스맵6형식을 확인했다. [조사 결과](../benchmark/BUNDLE_SIZE_RESULTS.md)·[검증](../benchmark/bundle-size-proof.json)에 연결한다. 기본 runtime/빌드와 DC-23 증거는 그대로다.
- next: 이번 번들 조사는 완료했다. hidden map은 Brotli26B를 줄이지만 자동 디버깅 연결을 잃어 기본 변경은 추천하지 않는다. 구문 압축은 추가9~16B 후보로 보류하며 runtime/heap/performance를 검증하지 않았다. 사용자는 추가 축소를 보류하고 현재 설정 유지를 확정했다. 새로운 구조 후보·CPU6/9 목표 연구·배포는 별도 요청에 따른다.
- blockers: 조사 실행 블로커 없음. 미채택 구문 후보의 추가 검증은 미실행으로 명시한다.
- commit: DC-23 복원·검증과 DC-24 조사 구현 커밋은 `4baf0e51483134ab3426817035e06e21f0285022`다. 후속 인계 문서 커밋을 포함한 tip은 `git log -1` 및 브랜치 ctxbin 최신 인계로 확인한다. native B `fb481f3`, compact13 `ff8b80a`, 보존 E `95d6faf`. 원자료의 `463c6cd`/uncommitted 표시는 검증 당시 기준이며 수정하지 않는다.
