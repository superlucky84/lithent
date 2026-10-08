# 생성 경로 프로파일링 및 타입 비교 생략 — 2026-10-08

이후 동일 VDOM 후보의 최종 검증과 성능 작업 종료 결정은
[PERFORMANCE_CLOSEOUT.md](./PERFORMANCE_CLOSEOUT.md)에 정리했다. 이 문서의 생성 최적화는 유지한다.

새 노드에 대응하는 이전 VDOM이 없으면 타입 비교를 생략하도록 base/concurrent를 수정했다.
1,000행 생성의 공식 러너 JavaScript 중앙값은 **9.564 → 9.128ms**, 약 **4.5% 감소**했다.
페인트를 포함한 전체 시간은 **28.673 → 28.380ms**, 약 **1.0% 감소**다.
전체 시간의 차이는 작으며, 이번 측정만으로 모든 작업의 체감 개선을 주장하지 않는다.

기준은 코어 `039cba6`, 벤치 앱 `8839611`이다. 앱과 helper는 A/B 양쪽에서 동일하다.
이번 결과는 [이전 프로덕션 결과](./PRODUCTION_RESULTS.md)와 별도 측정이다.
이전 Preact 결과와 이번 Lithent 결과를 섞어 비교하거나 새 가중 점수를 만들지 않았다.

## 프로파일에서 확인한 비용

최적화 전 코어와 현재 앱으로 CPU 4배, 준비 6회, 시나리오별 12개 CPU 프로파일을 수집했다.
함수명이 남는 번들이므로 프로파일 자체의 시간을 프로덕션 점수로 사용하지 않는다.
샘플 간격은 100μs이며, 아래 시간은 호출한 하위 함수까지 포함하는 샘플 평균이다.
재귀 호출은 같은 프레임에 중복 합산하지 않았다. V8 인라인 처리에 따라 비용 귀속은 달라질 수 있다.

| 경로 | 1,000행 | 10,000행 |
| --- | ---: | ---: |
| DOM 생성·속성·자식 삽입 `wDomToDom` | 11.910ms | 119.854ms |
| diff 준비 `makeNewWDomTree` | 4.071ms | 36.481ms |
| VDOM 생성 `h` | 1.042ms | 9.802ms |
| 모델·캐시·핸들러 초기화 `buildData` | 0.115ms | 1.647ms |

1,000행에서 전체 활성 샘플은 18.530ms였다. DOM 처리 경로가 약 64%, diff가 약 22%다.
캐시·핸들러 초기화를 바꾸는 것보다 매 노드의 diff 준비를 줄이는 후보를 먼저 검토했다.

시간 측정과 별도로 카운터를 넣어 호출 수도 확인했다. 아래는 준비 실행을 제외한 생성 한 번이다.

| 호출 | 1,000행 | 10,000행 |
| --- | ---: | ---: |
| `h` | 8,001 | 80,001 |
| 자식 정규화 | 8,002 | 80,002 |
| 행 모델 생성 | 1,000 | 10,000 |
| 추가 자식 diff 준비 | 10,001 | 100,001 |
| 그중 자식 없는 노드 | 4,000 | 40,000 |
| `createElement` | 8,000 | 80,000 |
| `createTextNode` | 2,000 | 20,000 |
| `setAttribute` | 6,000 | 60,000 |
| `addEventListener` | 2,000 | 20,000 |
| `appendChild` | 10,000 | 100,000 |
| `insertBefore` | 1 | 1 |

할당 샘플링도 시나리오별 5회 수집했다. 16KiB 간격으로 회수된 객체까지 포함하는 추정치다.
1,000행의 할당 추정 중앙값은 약 5.08MB, 10,000행은 약 49.69MB다.
VDOM·diff 준비와 DOM 래퍼가 큰 비중을 차지했다. 이는 누적 할당 진단이며
GC 후 보유 힙이나 공식 UASM 메모리 지표가 아니다. 이번 변경의 메모리 개선율은 측정하지 않았다.

## 후보 선택

현재 `makeNewWDomTree`는 새로 추가하는 모든 노드에도 `getWDomType`과 같은 타입 검사를 한다.
이전 노드가 없으면 일치할 수 없으므로 `!!originalWDom && ...`로 이 검사를 생략했다.
기존 노드가 있을 때의 비교와 empty 노드의 삭제 판정은 그대로 실행한다.
concurrent에서는 `sameTypeAs`에 같은 조건을 넣고, 작업 중단·재개와 commit 경로는 유지했다.

각 후보를 따로 최소화 번들로 빌드하여 2라운드 × 12회 비교했다.
두 번째 라운드에서 후보 순서를 뒤집었다. 시간은 클릭부터 마이크로태스크 렌더 완료까지다.
아래 중앙값은 24개 표본의 가운데 두 값의 평균이며, 페인트를 포함하지 않는다.

| 시나리오 | 변경 전 | 타입 비교 생략 | 자식 없는 노드 준비 생략 |
| --- | ---: | ---: | ---: |
| 1,000행 생성 | 15.050ms | 14.150ms | 15.450ms |
| 10,000행 생성 | 169.800ms | 162.650ms | 165.100ms |
| 1,000행 교체 | 25.100ms | 23.350ms | 24.850ms |

자식 없는 노드 준비 생략은 1,000행에서 일관된 개선이 없어 채택하지 않았다.
타입 비교 생략만 런타임에 적용했다. 동일 VDOM 조기 반환과 빈 훅 큐 후보는 별도 후속 작업이다.
원본 진단의 `base`는 변경 전, `addType`은 채택한 후보다. 현재 도구에서는
`beforeAddType`이 변경 전 경로를 복원하고 `base`가 현재 코어를 뜻한다.

## 공식 러너 검증

두 코어를 각각 기존 Vite 5.4.21 프로덕션 설정으로 **같은 앱 소스·helper**와 빌드했다.
공식 `executeBenchmark`의 준비 횟수, 새 탭, GC, trace 및 paint 계산을 변경하지 않았다.
선택한 생성 항목은 공식 설정에서도 CPU throttling이 없는 항목이다.

- Apple M4, 10코어, 24GB, 시스템 Chrome 154.0.8037.98, headless.
- 생성·교체·추가 4개 항목 × 2개 코어 × 15회 = 120개 표본.
- 주 대상인 1,000행은 실행 순서를 뒤집어 각 15회 추가했다. 합계 **150개 표본**이다.
- 첫 차수의 시작 load average는 3.97, 일부 묶음에서는 13.08이었다.
  순서를 뒤집은 차수는 4.18에서 시작했다. 전용 격리 머신이 아니므로 환경 오차가 남는다.

| 시나리오 | 코어당 표본 | 전체 변경 전 | 전체 변경 후 | JS 변경 전 | JS 변경 후 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1,000행 생성, 두 순서 합침 | 30 | 28.673ms | 28.380ms | 9.564ms | 9.128ms |
| 1,000행 교체 | 15 | 34.294ms | 34.742ms | 13.397ms | 12.694ms |
| 10,000행 생성 | 15 | 297.055ms | 292.509ms | 71.740ms | 68.733ms |
| 1,000행 추가 | 15 | 33.816ms | 33.962ms | 10.271ms | 10.001ms |

1,000행 JS는 첫 차수에서 약 5.2%, 순서를 뒤집은 차수에서 약 4.0% 감소했다.
10,000행 JS는 약 4.2%, 전체 시간은 약 1.5% 감소했다.
교체·추가는 JS 중앙값이 줄었지만 전체 중앙값은 조금 늘었다. 페인트 변동과 시스템 부하가 있어
이를 확정된 전체 성능 개선이나 코어 수정으로 인한 회귀로 해석하지 않는다.

## 동작·크기 검증

- `pnpm test:dual`, `pnpm test` 통과. 새 keyed 자식의 슬롯, 자식 renew, 이동 후 DOM 정체성,
  mount/unmount 순서를 base/concurrent 양쪽에서 검사했다.
- base/concurrent 빌드 및 변경 파일 ESLint 통과.
- Playwright **52개 통과**, 이전 VDOM 회수와 concurrent scheduler 검사 포함.
- A/B 양쪽 모두 공식 keyed 검사와 9개 동작·DOM 정체성·폰트 검사 통과.
- `pnpm size`: base **4,763 / 4,800B**(+6B), concurrent **6,249 / 9,000B**(-5B),
  element **998 / 1,000B**. base 여유는 **37B**다.

## 자료와 재현

- [creation-results.json](./creation-results.json): 모든 시간 표본, 프로파일 집계, 할당 결과,
  소스·번들 SHA-256, 두 차수의 환경·검증 기록.
- [creation-evidence.json.gz](./creation-evidence.json.gz): 24개 원본 CPU 프로파일, 10개 원본
  할당 프로파일, 함수명이 남는 번들, 진단 번들 3개, 프로덕션 빌드에 사용한 앱·core·helper.
  압축 파일의 SHA-256은 결과 JSON의 `evidenceSHA256`에 있다.
- [followup-audit.mjs](./followup-audit.mjs): 프로파일 원본과 소스·번들 해시를 저장한다.
- [creation-allocations.mjs](./creation-allocations.mjs): 호출 수와 할당을 시간 측정과 분리한다.
- [creation-prepare.mjs](./creation-prepare.mjs): 현재 dist를 `before`/`after` 각각 한 번
  스냅샷으로 보존하고 같은 앱으로 프로덕션 빌드한다. 과거 코어를 자동 복원하는 명령은 아니다.
- [creation-summarize.mjs](./creation-summarize.mjs): 원본 결과와 압축 증거를 묶는다.

현재 소스에서 진단을 다시 실행할 때는 새 출력 디렉터리를 사용한다.

```sh
export LITHENT_AUDIT_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export LITHENT_AUDIT_OUT=/tmp/lithent-create-rerun
node docs/benchmark/followup-audit.mjs profile beforeAddType create,create10k
node docs/benchmark/followup-audit.mjs measure beforeAddType,base,addLeaf create,create10k,replace
LITHENT_CREATION_PROFILE="$LITHENT_AUDIT_OUT" \
  LITHENT_CREATION_BUNDLE=beforeAddType-profile.js \
  LITHENT_CREATION_OUT=/tmp/lithent-create-allocation-rerun \
  node docs/benchmark/creation-allocations.mjs
```

공식 A/B는 변경 전 dist를 빌드한 상태에서 `creation-prepare.mjs before`, 변경 후 dist를 빌드한
상태에서 `after`를 실행한다. 양쪽 앱·helper 해시가 다르면 실패한다. 출력 경로는
`LITHENT_PRODUCTION_OUT`으로 지정하고, 이어 `production-run.mjs verify lithent-before,lithent`와
`cpu lithent-before,lithent 01_,02_,07_,08_`을 실행한다. CPU·메모리 측정과 테스트는 동시에 돌리지 않는다.

현재 남은 큰 비용은 DOM 준비와 페인트다. 추가 생성 최적화는 이 경로를 좁혀 조사하고,
행 캐시의 동일 VDOM 빠른 반환은 갱신 성능을 위한 별도 후보로 평가한다.
