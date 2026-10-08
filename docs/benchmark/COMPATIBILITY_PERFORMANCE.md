# props·portal 수정의 성능 영향 — 2026-10-08

**전체 가중 결과는 거의 같지만, 전체 삭제 항목은 두 실행 순서에서 느려졌다.**
props 오류와 외부 portal 호스트의 리스너 누적 수정이 벤치 수치에 영향을 주는지 실제 공식
CPU 러너로 비교했다. 수정 뒤 아무 영향도 없다고 결론 내리지는 않는다.

## 비교 조건

- 기준은 마지막 성능 종료본이다. `identity-evidence.json.gz`에서 최종 채택한 기준 core를
  복원했고, 같은 Vite 5.4.21 설정으로 만든 앱 번들의 SHA-256이 당시 측정 번들과 일치한다.
- 수정본은 현재 미커밋 props·portal 수정이 포함된 base core다. HEAD `4356120`만으로 수정본을
  식별할 수 없으므로, sourceState·소스·core·helper·앱 번들 해시를 각각 기록했다.
- 양쪽 앱 소스와 helper는 동일하다. 벤치 앱은 `8839611`이며, 구현이나 공식 러너는 변경하지 않았다.
  기존 wrapper에 선택적 항목별 순서 교대 기능만 추가했다. 준비·새 탭·GC·CPU throttling·trace·
  paint 계산은 그대로 사용했다. 기본 wrapper 실행 방식은 유지한다.
- Apple M4, 10코어, 24GB, 시스템 Chrome 154.0.8037.98 headless.
- CPU 9개 항목에서 선택은 각 25회, 나머지는 각 15회: **290개 표본**이다.
  항목별로 수정 전/후의 실행 순서를 교대했다.
- 전체 삭제는 반대 순서로 각 15회 더 측정했다. 공식 표본 합계는 **320개**다.
- 첫 차수의 1분 load average는 **10.28 → 3.07**, 추가 차수는 **2.79**에서 시작했다.
  CPU 측정 동안 다른 빌드·단위 테스트·브라우저 검사를 실행하지 않았다. 전용 격리 머신은
  아니므로 환경 오차는 남는다.
- 양쪽 공식 keyed 검사, 9개 동작·DOM 정체성·폰트 검사 모두 통과했다.
  benchmark 저장소의 tracked 파일은 바꾸지 않았다.

## 첫 차수: 9개 항목

각 칸은 해당 코어 표본의 중앙값이다. 전체 시간과 JS 중앙값을 서로 더해 해석하지 않는다.

| 항목 | 전체 수정 전 | 전체 수정 후 | 전체 변화 | JS 수정 전 | JS 수정 후 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 01 1,000행 생성 | 28.341ms | 28.435ms | +0.3% | 8.962ms | 9.137ms |
| 02 1,000행 교체 | 32.741ms | 31.666ms | -3.3% | 12.999ms | 11.952ms |
| 03 부분 갱신 | 19.639ms | 19.700ms | +0.3% | 6.335ms | 6.412ms |
| 04 선택 | 6.289ms | 6.471ms | +2.9% | 3.248ms | 3.195ms |
| 05 교환 | 18.213ms | 18.386ms | +0.9% | 4.032ms | 3.959ms |
| 06 1행 삭제 | 13.750ms | 12.788ms | -7.0% | 1.634ms | 1.634ms |
| 07 10,000행 생성 | 291.933ms | 291.849ms | -0.03% | 68.848ms | 68.452ms |
| 08 1,000행 추가 | 33.211ms | 32.783ms | -1.3% | 10.148ms | 10.041ms |
| 09 전체 삭제 | 12.241ms | 13.463ms | +10.0% | 9.976ms | 11.026ms |

로컬 공식 결과표의 가중치를 적용한 수정 후/전 비율은 전체 **0.9968**(약 -0.3%), JS **0.9999**
(사실상 동일)다. 공개 공식 점수가 아니라 이번 9개 항목 A/B의 가중 비율이다.
작은 종합 차이를 확정된 개선으로 취급하거나 과거 다른 프레임워크의 수치와 합쳐 계산하지 않는다.

## 전체 삭제 재확인

첫 차수의 전체 삭제는 수정본을 먼저 측정했다. 추가 차수에서는 기준을 먼저 측정했다.

| 차수 | 전체 수정 전 | 전체 수정 후 | 전체 변화 | JS 변화 |
| --- | ---: | ---: | ---: | ---: |
| 첫 차수, 각 15회 | 12.241ms | 13.463ms | +10.0% | +10.5% |
| 반대 순서, 각 15회 | 13.045ms | 14.098ms | +8.1% | +9.8% |
| 두 차수 합침, 각 30회 | 12.632ms | 13.688ms | **+8.4%** | **+8.1%** |

전체 삭제는 로컬 공식 설정의 **4배 CPU throttling** 조건이다.
합친 JS 중앙값은 **10.302 → 11.139ms**다. 두 순서에서 같은 방향의 비용 증가가 나타나므로
이 항목을 단순히 첫 차수의 순서 차이로 넘기지 않는다. 추가 차수는 09만 측정했으므로
첫 차수 9개 항목의 가중 비율에 임의로 합치지 않았다.

벤치 앱에는 portal과 개별 행 컴포넌트가 없다. component props 갱신과 portal 전용 해제의
직접 영향은 작지만, 일반 DOM props의 삭제 판단은 갱신 때 실행되고 unmount의 portal 확인은
일반 노드 삭제 때도 실행된다. 새 unmount 분기가 전체 삭제 비용 증가의 원인 후보라는 것은
**소스 검토에 따른 추정**이며, 이번 시간 측정만으로 각 수정의 기여도를 분리하지는 않았다.

**판단:** 종합 성능이 크게 떨어진 상황은 아니지만, 전체 삭제에는 약 8~10%의 악화 신호가 있다.
정확한 props 반영과 외부 호스트의 리스너 정리는 유지할 수정이다. 일반 DOM의 리스너를
모두 해제하는 정책으로 되돌리지 않았다. 이 턴은 영향 검증이며 추가 런타임 최적화를 적용하지 않았다.

## 크기와 원본

실제 벤치 앱 JS는 brotli **5,494 → 5,597B**(+103B), gzip **5,974 → 6,071B**(+97B)다.
core UMD의 기존 크기 게이트 **4,855 / 4,800B**(55B 초과)는 그대로 남아 있다.
크기 한도를 올리거나 버전·릴리스 설정을 수정하지 않았고, 커밋·푸시·배포하지 않았다.
concurrent의 CPU 성능은 이번 base benchmark 비교에 포함하지 않았다.

- [compatibility-performance-results.json](./compatibility-performance-results.json): 320개 원본 CPU
  표본, 두 차수의 환경·검증·해시, 첫 차수의 종합 비율과 전체 삭제 재확인 결과.
- [compatibility-performance-evidence.json.gz](./compatibility-performance-evidence.json.gz): 실행한
  두 앱·core·helper와 최소화 번들, 양쪽 런타임 소스, 준비 및 실행 wrapper. 압축 해시는 결과의
  evidenceSHA256이다. baseline 번들 해시와 현재 작업 소스 해시도 검증했다.
- [compatibility-performance-prepare.mjs](./compatibility-performance-prepare.mjs),
  [compatibility-performance-summarize.mjs](./compatibility-performance-summarize.mjs): 준비·집계 도구.

새 출력 경로에서 준비 후 공식 wrapper를 실행한다. 기존 결과를 덮어쓰지 않는다.

```sh
LITHENT_PRODUCTION_OUT=/tmp/lithent-compat-perf-rerun \
  node docs/benchmark/compatibility-performance-prepare.mjs
LITHENT_PRODUCTION_OUT=/tmp/lithent-compat-perf-rerun \
  node docs/benchmark/production-run.mjs verify lithent-before,lithent
LITHENT_PRODUCTION_OUT=/tmp/lithent-compat-perf-rerun \
  LITHENT_PRODUCTION_ALTERNATE_ORDER=1 \
  node docs/benchmark/production-run.mjs cpu lithent-before,lithent
```

전체 삭제를 재확인할 때는 같은 빌드와 manifest를 별도 경로에 보존하고, 기준을 먼저 측정하는
`cpu lithent-before,lithent 09_`를 실행한다. 현재 benchmark wrapper는 이 비교에서 실제 시스템
Chrome을 사용한다. 새 런타임 수정 뒤에는 빌드부터 다시 준비해야 한다.
