# 전체 성능 우선 후보 비교 — 2026-10-20

**앱 비교의 첫 차수만 완료했으며 채택하지 않았다.** 사용자가 라이브러리 코어 개선을
우선한다고 재확인해, 앱 후보의 메모리·반대 순서 측정 대신 동일 앱을 고정한 코어 실험으로
전환했다. 아래 수치는 앱 구조 변경의 효과이며 코어 개선율이 아니다.

9개 CPU 항목의 가중 전체 시간은 원본 대비 `full` **−3.0%**, `static` **−1.9%**,
`scalar` **−0.3%**였다. 첫 차수만 보면 `full`이 가장 균형 잡혔지만 생성은 소폭 느려졌고,
메모리를 아직 비교하지 않았으므로 전체 우수 후보로 확정하지 않는다.

| 공식 항목     |    원본 |    full |  scalar |  static |
| ------------- | ------: | ------: | ------: | ------: |
| 1,000행 생성  |  27.446 |  27.686 |  27.446 |  27.579 |
| 1,000행 교체  |  31.163 |  29.993 |  30.705 |  30.371 |
| 부분 갱신     |  18.284 |  17.739 |  19.067 |  16.421 |
| 행 선택       |   7.825 |   7.440 |   7.296 |   7.528 |
| 행 교환       |  19.125 |  16.129 |  17.216 |  16.381 |
| 한 행 삭제    |  12.658 |  12.100 |  12.286 |  12.583 |
| 10,000행 생성 | 288.854 | 291.353 | 287.083 | 292.991 |
| 1,000행 추가  |  30.616 |  30.557 |  31.345 |  31.324 |
| 전체 삭제     |  12.474 |  11.251 |  12.616 |  12.509 |

단위는 ms, 각 항목의 전체 시간 중앙값이다. 가중 JS 시간은 각각 `full` **−5.7%**,
`scalar` **−4.1%**, `static` **−7.3%**다. 가중치는 로컬 upstream 결과표의 값을 사용하며
공개 표의 절대 점수와 구분한다. 시스템 부하가 변하는 비격리 머신의 한 차수 결과다.

공식 keyed·9개 동작·폰트, DOM 정체성·선택/부분 갱신 mutation·일괄 갱신 순서·20회 재생성
계약 검사, 후보 3개의 strict TypeScript·ESLint·Prettier 검사는 통과했다.
원본과 표본은 [overall-update-results.json](./overall-update-results.json),
소스·번들·러너는 [overall-update-evidence.json.gz](./overall-update-evidence.json.gz)에 보존한다.
실제 upstream 앱은 기존 `targeted-main.tsx` 그대로이며, 이번 앱 후보를 설치하지 않았다.

## 비교 목적과 기준

행 선택·부분 갱신 두 항목의 이득보다 전체 성능을 우선한다. 기준은 upstream 원본 앱과
npm `lithent@1.25.2`다. 현재 upstream 작업트리에 있는 행별 renew 실험 앱과 구별한다.
코어·helper를 바꾸지 않고 앱의 행 캐시 구조만 비교한다.

- `full`: 변경 행의 전체 VDOM을 명시적으로 다시 만든다. 최초 행 VDOM 생성은 Table 렌더까지
  미루며, 변경하지 않은 행의 VDOM을 재사용한다. 정적 셀은 따로 캐시하지 않는다.
- `scalar`: 원본의 `cacheUpdate`와 의존 배열을 라벨·선택 상태의 직접 비교로 바꾼다.
  Table 갱신 때 모든 행의 캐시를 확인하는 원본 구조는 유지한다.
- `static`: `full`과 같은 명시적 갱신에 정적 셀과 라벨 셀의 캐시를 추가한다.
  정적 셀은 행 모델을 만들 때 생성하고, 행 루트의 최초 생성은 Table 렌더까지 미룬다.

원본 대비 9개 항목의 가중 기하평균, 개별 항목의 악화, 공식 메모리 5개 항목을 함께 본다.
차이가 작은 결과는 순서를 바꾼 추가 차수로 확인한다. 이전 실험의 다른 시점 수치와
이번 수치를 섞어 새로운 개선율을 계산하지 않는다.

표의 색은 각 항목에서 비교 대상 중 최솟값에 대한 비율로 계산된다. 초록에서 노랑으로
이어지는 연속 색상이며 고정된 합격선이 아니다. 이번 원본 대비 비교만으로 공개 표의
모든 항목이 초록색이 된다고 주장하지 않는다.

## 조건과 재현

- 사용자 지정 checkout: `~/project/js-framework-benchmark-upstream`.
- npm core/helper **1.25.2**, Vite **5.4.21**, Apple **M4 Pro / 12코어 / 24GB**,
  Chrome **155.0.8059.82**. 네 앱의 core/helper 해시는 같다.
- 첫 차수는 원본과 후보 3개, 9개 항목에 총 **580개 표본**을 완료했다.
  선택은 앱당 25개, 나머지는 앱당 15개다. 원본 결과의 `complete`와 표본 수를 검증했다.
- 기존 공식 Puppeteer 러너의 warmup, CPU throttling, GC, 새 탭, trace와 paint 계산은 유지한다.
  기록한 전체 시간은 실제 클릭부터 최종 paint까지의 측정이다.
- 별도 진단은 4배 CPU에서 2차수 × 16회, 네 앱의 6개 시나리오를 측정했다.
  이 **768개 JS+microtask 진단 표본**은 공식 CPU 점수에 합치지 않는다.
- 계약 검사에서 발견한 초기 선택 갱신 누락을 고친 뒤 새 번들을 만들었다.
  `full-v2`, `static-v2`, `scalar`에서 모은 `screen-v2`만 최종 비교에 사용한다.
  수정 전 번들은 성능 비교에 포함하지 않는다.

빌드와 측정 자료의 작업 경로는 `/tmp/lithent-overall-20261019/screen-v2`다.
10월 19일의 빌드·진단 뒤, 공식 측정은 10월 20일에 수행했다.

```sh
export LITHENT_BENCHMARK_ROOT="$HOME/project/js-framework-benchmark-upstream"
export LITHENT_PRODUCTION_OUT=/tmp/lithent-overall-20261019/screen-v2
export LITHENT_PRODUCTION_FOLDERS='{"full":"/tmp/lithent-overall-20261019/screen-v2/full","scalar":"/tmp/lithent-overall-20261019/screen-v2/scalar","static":"/tmp/lithent-overall-20261019/screen-v2/static"}'
node docs/benchmark/production-run.mjs verify lithent-before,full,scalar,static
node docs/benchmark/production-run.mjs cpu lithent-before,full,scalar,static
```

메모리와 반대 순서 재측정은 이 앱 비교에서 실행하지 않았다.

실행마다 새 결과 경로를 사용한다. 기존 trace를 덮어쓰지 않으며, 완료된 동일 번들 차수의
연속 실행만 `LITHENT_PRODUCTION_RESUME=1`로 진행한다.
