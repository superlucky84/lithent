# REQUIREMENTS — 코어 갱신 범위와 전체 렌더링 성능 개선

- 기준일: 2026-10-23. 상태: **DC-16 CPU1,450/메모리150·독립 감사·별도 진단 완료. CPU 목표 합산5/9 통과로 미달. 다음은 DC-17 C2 한정 후보이며 기본 runtime 보존**.
- 기준 커밋: `085137b0447a8bbe7d28d3bf55c0a997779132b2`.
- 문서 순서: REQUIREMENTS → [DESIGN](./DESIGN.md) → [IMPLEMENT](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST](./MANUAL_TEST_CHECKLIST.md).
- 이 폴더가 범용 코어 성능 작업의 정본이다. 7~8월 Map/LIS 계획·실측은 [과거 문서](./history/2026-07-map-lis/README.md)에 보존한다. 당시 5KB 예산·jsdom 목표·미완료 상태를 이번 기준으로 사용하지 않는다.

## 1. 사용자 목표와 판단 기준

**벤치마크 앱만 복잡하게 바꾸는 대신, 일반 Lithent 앱에도 유효한 코어 개선으로 전체 렌더링 성능을 높인다.** 최근 upstream 병합 직후의 작은 앱 캐시 PR보다 근본적인 개선을 우선한다. Phase 1은 `979f88f`에 보존했고, 후속 진행 요청으로 Phase 2의 C1 한정 프로토타입을 검증했다. [C1 결과](../benchmark/PARENT_POSITION_RESULTS.md)는 10k 일반 자체 갱신의 이득과 원래 앱의 작은 공식 전체 신호를 구분한다. C1 채택은 보류했다. 현재 Phase 3의 [C3 한정 구현·검증](../benchmark/PARENT_MEMO_RESULTS.md)까지 완료했고, 크기 한도 초과로 후보를 보존한 뒤 baseline을 복원했다. [DC-12 격리 실험](../benchmark/PARENT_MEMO_ISOLATION_RESULTS.md)에서 기본 경로를 보존하고 비참여 원래 앱의 공식 CPU 580표본을 확보했다. 가중 전체 +0.10%는 양차수 방향이 달라 불확실하며, [DC-13](../benchmark/PARENT_MEMO_OPTIN_RESULTS.md)에서 같은 행 앱의 기능 이득·비용까지 검증했다. [DC-14](../benchmark/PARENT_MEMO_HEAP_RESULTS.md)는 추가 heap의 주된 원인을 outputs WeakMap table 용량으로 귀속했다. [DC-15 실제 캐시 앱 대조](../benchmark/PARENT_MEMO_CACHE_RESULTS.md)는 양순서 전체CPU1,450/메모리150표본을 완료했다. 기존 앱 대비 전체+21.08%·같은 행 helper 대비+3.75%여서 현재 C3를 기존 앱의 개선안으로 채택하지 않는다. DC-16의 baseline 전체 peer 비교는 완료했으며 새 후보·Phase4~6의 최종 채택 검증은 미완료다.

- R1. 행 선택·부분 업데이트의 넓은 탐색, 부모 갱신 시 변경 없는 컴포넌트 재실행, 자식 자체 갱신의 부모 연결 비용을 검토한다. 최신 작은 코어 후보의 실패를 코어가 최적이라는 증거로 해석하지 않는다.
- R2. **개별 작업의 시간·CPU/JS·메모리 손해를 허용할 수 있다.** 한 항목의 회귀만으로 자동 탈락시키지 않는다. 전체 이득, 상대적으로 느린 항목, 손해의 절대량·반복성·실사용 영향으로 판정한다.
- R3. 사용자가2026-10-23에 확정한 CPU 목표는 **전체9항목 각각에서, 고정한 React/Preact hooks/classes 네 구현의 가장 빠른 전체 시간 중앙값의1.10배 이내**다. 같은 환경/차수의 합산 중앙값으로 항목별 판정하고 양차수의 일관성을 함께 공개한다. 평균·색상 이름으로 전 항목 달성을 대체하지 않는다. 메모리/size/startup은 별도 비용이며 이 CPU 임계치를 적용하지 않는다.
- R4. DC-16 비교군은 upstream 기본 `react-hooks`19.2.0, `react-classes`19.0.0, `preact-hooks`11.0.0, `preact-classes`11.0.0의 고정 lock/source다. 버전 차이도 실제 구현의 조건으로 기록하며 유리한 구현만 사후 선택/제외하지 않는다. 네 구현 모두의 결과와 항목별 최저값을 공개한다. 원래 Lithent baseline을 함께 비교하며 C3는 포함하지 않는다.
- R5. JS 실행 시간이 아닌 **공식 클릭→최종 paint 전체 시간**을 렌더링 성능의 주 지표로 삼는다. JS, 메모리, 번들, 생성·삭제 비용은 별도 지표로 함께 공개한다.
- R6. 기존 API를 사용하는 앱의 결과·DOM 정체성·수명·배칭·예외 복구 계약을 보존한다. 추가 옵트인 기능이 필요하면 새 계약을 명시하고 기존 기본 동작과 구분한다.

## 2. 현재 근거와 한계

기준 런타임은 base **1.25.2**, concurrent **0.2.2**다. 이전 복원 검증에서 base 런타임 소스 16개와 ESM/UMD/CJS가 설치된 npm 1.25.2와 일치했다. 실험 착수 시 다시 해시를 확인한다. 실제 `../js-framework-benchmark-upstream/frameworks/keyed/lithent/src/main.tsx`는 초기 행별 `renew` 실험본이므로 원래 앱과 구분한다.

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

[DC-16 전체 비교](../benchmark/PEER_BASELINE_RESULTS.md)에서 새 CPU1,450/메모리150표본과 분포480/가중69개를 독립 감사했다. 목표는 합산5/9, 첫 차수5/9, 반대6/9 통과로 미달이다. 선택1.630×·부분 갱신1.269×가 큰 격차이며 1k생성1.117×·한 행 삭제1.103×도 합산 미달이다. 한 행 삭제는 차수별 경계를 오가므로 작은 초과는 불확실하다. 별도 profile119/120유효·독립 trace4context/40구간은 비용 위치를 좁히는 진단이며 공식 스코어와 합산하지 않는다. 다음은 아래 R27의 C2이며 최종 채택/목표 달성은 아니다.

## 3. 포함 범위와 비범위

포함 범위는 `src/{diff,render,wDom}.ts`, 갱신 스케줄·컴포넌트 메타데이터 및 필요 시 대응 concurrent 경로다. 기존 정보로 충분한 내부 개선을 우선 검토하고, 정보가 부족할 때만 명시적 무효화·부모 재실행 생략·리스트 구조 안정성 계약을 검토한다. 공개 API 추가가 필수라고 미리 결정하지 않는다.

helper나 타입·export 수정은 범용 계약의 배치가 확정된 경우에 한한다. benchmark 전용 분기, 특정 행 수·id·매 10행 패턴, 직접 DOM 쓰기를 범용 최적화처럼 코어/helper에 옮기지 않는다. 앱 후보는 가설 검증용 증거로 보존한다.

이번 비범위는 upstream 제출, 패키지 버전·배포, 기존 앱 실험본 덮어쓰기, 선언되지 않은 immutable props/children 가정 도입이다. base와 concurrent의 스케줄러를 하나로 재작성하는 일도 목표가 아니다.

## 4. 보존해야 하는 계약과 비용 제약

- R7. keyed 소비 규칙을 유지한다. 중복 키의 첫 등장 소비, falsy/NaN/Symbol/object 키, null·unkeyed 혼합과 노드당 한 번의 소비·unmount를 기존 테스트 기준으로 검증한다.
- R8. 같은 VDOM이라도 empty 전환은 삭제해야 한다. 다른 위치의 동일 VDOM은 독립 인스턴스를 유지한다. 캐시 hit에서의 `updateCallback`, 이동 후 자식 `renew`, props/children 배열의 공유 참조를 보존한다.
- R9. Fragment/portal/HTML root/외부 형제/SSR·hydration, 예외 뒤 갱신 재개, 삭제 뒤 예약 갱신, 부모·자식 동시 갱신을 검증한다. concurrent는 중단·재시작·폐기된 작업의 상태 누출·render boundary와의 상호작용을 추가 검증한다.
- R10. 임의 mutable 상태를 읽는 부모가 새 children 배열을 반환하면, 코어가 변경 행·구조 불변을 자동으로 안다고 가정하지 않는다. 변경 정보의 생산자와 신뢰 조건을 설계에 명시한다.
- R11. 현재 [크기 게이트](../../scripts/size-report.js)는 UMD brotli base **4,798/4,800B**, concurrent **6,903/9,000B**, element **998/1,000B**다. base 여유는 2B다. 오래된 `base frozen` 설명은 과거 concurrent 작업 범위이고 이번 사용자는 코어 수정을 허용했지만, 크기 한도 상향까지 승인한 것은 아니다. 한도 초과 후보는 비용을 공개하고 미채택 상태로 유지하며 한도를 조용히 바꾸지 않는다. 이 한도가 구조 개선 가능성 자체를 부정하는 근거는 아니다.
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

- R27. DC-17은 기존 general keyed Map 매칭·키 읽기 순서·첫 중복 소비를 유지하고, 현재 diff에서 확인한 같은 위치/길이·구조 변화 없음의 결과를 render에 전달하는 C2 한정 후보다. 이전 목록의 uniqueness 캐시·새 Set/preflight·선언되지 않은 immutable 가정·공개 API를 도입하지 않는다. metadata 수명/실패 시 폐기·fallback·비용을 먼저 정하고 후보별 gate를 통과한다.

세부 계약·상태 전이·검증 항목의 정본은 [DESIGN의 C3 절](./DESIGN.md#c3--부모-갱신과-자식-자체-갱신의-분리)이다. C1은 결합하지 않는다. C3도 부모의 전체 keyed 순회·행 컴포넌트 생성·부모 연결 검색을 없애지 못한다. 이 한정 계약을 준비한 것과 후보 구현·성능 검증을 완료한 것은 구분한다.

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

## 상태 / 핸드오프

- done: DC-16의 고정 다섯 production gate·CPU1,450/메모리150표본을 양순서 실패0으로 완료했다. 분포480/가중69개와 목표·색상/정규화를 독립 감사했다. 별도 profile119/120유효·독립 trace4context/40구간과 첫 제외 시도도 보존했고 Python으로 제외/함수 합계/구간을 감사했다. [결과](../benchmark/PEER_BASELINE_RESULTS.md)·[비교표](../benchmark/PEER_BASELINE_TABLE.html)·raw/증거·재현 도구를 남겼다.
- goal: CPU 기준은 각9항목의 고정 네 peer 최저 total 중앙값 대비1.10배 이하다. 합산5/9·첫5/9·반대6/9 통과로 미달이다. 선택1.630×/부분 갱신1.269×가 큰 격차다. 한 행 삭제1.103×는 차수별 경계를 오가므로 작은 초과를 확정하지 않는다. memory/size는 별도 비용이다.
- next: DC-17 C2의 현재 diff 증명→render 전달 범위에서 metadata 수명/fallback을 먼저 확정하고 baseline 회귀→base 프로토타입→B1~B3/size→같은 앱 CPU580/메모리60·retention→복원/증거 순으로 진행한다. 기존 Map 소비/키 읽기·helper와 실제 sibling 앱을 유지한다.
- blockers: 실행 블로커 없음. CDP 음수 간격 원인은 미확정이며 제외 원본을 보존했다. C2 구현/이득·메모리 교환 상한·최종 B4/Test Hardening/Integration은 미완료다. C3는 기존 앱 개선안으로 미채택이다.
- commit: DC-16 측정 기준은 `6bd3b3317ae73562afc49479bd3ed0ba952ce8ab`다. DC-16 도구/문서/증거와 DC-17 계획을 `perf: record fixed peer baseline and C2 follow-up plan`으로 함께 기록한다. 후속 확정 SHA와 푸시 상태는 `git log -1` 및 이 브랜치의 ctxbin 컨텍스트에서 확인한다. default28파일/package/sibling·고정 입력1,228개를 보존했다.
