# 최종 성능 비교 — 기능 추가 전 Concurrent 대비

- 작성일: 2026-10-10
- 원본: `925b4aa98c40ca20b309ea2613cc625d260fa5b1`, lifecycle 코어 연결 전 Concurrent
- 최종 구현: `16c6e9d8635a239f5f3cd5373fff5ea5a882e8cf`, 7단계 콜백 정리 포함
- Chromium `151.0.7922.173`, Node `v24.19.0`
- 원본 표본·번들 SHA-256: [PERFORMANCE_RESULTS_FINAL.json](./PERFORMANCE_RESULTS_FINAL.json)

## 관측한 시간 증가

같은 작업의 **동기 JavaScript 갱신 시간**을 기능 추가 전 Concurrent와 비교한다.
각 브라우저에서 9개 표본의 중앙값끼리 비율을 계산하고, 새 브라우저 3회의 비율 중앙값을 보고한다.
CPU·실행 조건이 달라지는 브라우저 간 시간을 한데 합쳐 비교하지 않는다.

| 작업                                | 기능 미사용 | 경계 등록·모두 활성 | 다른 화면 중단 |
| ----------------------------------- | ----------: | ------------------: | -------------: |
| 16 DOM 단계 아래 자식 갱신          |   **+2.9%** |               +2.5% |          −0.1% |
| 자식 64개를 포함한 부모 갱신        |   **+1.8%** |               +2.4% |          +5.0% |
| 입력 이벤트·결과 컴포넌트 32개 갱신 |   **+1.6%** |               +3.4% |         +14.1% |

양수는 원본보다 갱신 시간이 길게 측정됐다는 뜻이다. 처리량 손실률이나 paint·입력 지연율은 아니다.
작업 비중이 다른 세 결과를 평균해서 하나의 전체 손실률로 제시하지 않는다.
−0.1%는 속도 개선이나 추가 검사 비용 0을 입증하는 결과로 해석하지 않는다.

개별 브라우저 3회의 미사용 시간 증가 범위는 자식 **+2.1~+9.7%**,
부모 **−0.3~+1.9%**, 입력 **+0.4~+2.3%**였다.
표의 중앙값은 모든 앱이나 장치에서 손실이 3% 이하라는 보장이 아니다.

## 중단 상태의 추가 작업

자식·부모 작업의 중단 상태는 다른 독립 루트에 중단 경계가 하나 있는 경우다.
해당 작업은 자기 화면을 평소대로 갱신하며, 중단 경계 탐색·캐시가 영향을 미치는지를 본다.

입력 작업의 중단 상태에는 8,192행 편집 화면을 숨겨 보존한다.
입력마다 숨긴 자식의 native renew도 요청하고 차단한다. 원본·미사용·활성 상태에는 이 편집 화면과
추가 renew 요청이 없다. 따라서 +14.1%는 **추가 갱신 요청·차단과 보존 화면을 포함한 비용**이며,
코어 조건 검사만의 손실률이 아니다. 3회의 범위는 +8.8~+21.0%다.

숨김 중 자식 draw는 0회, 재개 시 최신 모델 draw는 1회이며 draft·같은 input DOM을 유지하는지
매 표본 확인한다. 구성·숨김·재개 시간은 측정에서 제외한다.
이미 effect·초기화를 실행한 parked 작업의 동기 pause 시간은 이번에 다시 측정하지 않았다.

## 변동과 기본 코어 대조군

기본 코어는 원본·최종 ESM의 SHA-256이 같으며 source와 세 포맷의 번들 변경이 없다.
그런데 같은 코드의 시간 비교에서도 자식 작업은 −11.0~+12.9%가 나왔다.
부모는 +0.2~+1.5%, 입력은 −2.7~+2.3%였다. 코드가 같은 기본 코어의 차이를 기능 비용으로 계산하지 않는다.

이 대조군은 작은 퍼센트 차이에 실행·JIT·GC 변동이 상당히 섞일 수 있음을 보여 준다.
Concurrent 미사용의 1.6~2.9%는 이번 조건의 관측 중앙값이며 정확한 인과적 비용이나 최악 손실률은 아니다.
기본 코어에는 이 기능을 위한 렌더 코드 증가가 없고, Concurrent에는 여전히 조건 검사·속성 조회가 남는다.

## 측정과 재현

테스트·빌드·다른 벤치마크를 함께 실행하지 않았다. 각 실행은 새 Chromium 프로세스를 사용한다.
variant마다 완전한 warmup 3회를 하고, 표본의 정확한 트리에서 200회 추가 warmup한 뒤 측정한다.
variant 실행 순서는 매 round 정순·역순으로 바꾼다. 코어 module instance를 분리해 경계 사용 이력이
미사용 module의 JIT 상태를 바꾸지 않도록 했다. cleanup 뒤 blocks·reparent·adapter 예약 해제도 확인한다.

처음에 세 작업을 기본 반복 횟수로 각각 새 브라우저 3회, variant당 9개 표본씩 측정했다.
짧은 자식 갱신은 변동이 커서 해당 작업만 표본당 10,000회에서 **100,000회**로 늘려
새 브라우저 3회 재측정했다. 위 표의 자식 결과는 긴 재측정 27개 표본을 사용한다.
부모는 표본당 2,000회, 입력은 1,000회이며 각각 초기 27개 표본을 사용한다.
초기 자식 표본도 JSON에 모두 남겼다.

이전에 보관한 원본 ESM 두 파일과 최종 실험 라이브러리 빌드를 사용한다.
다음 명령은 기본 세 작업과 자식의 긴 측정을 각각 1회 실행하며, 결과 기록에는 각각 3회 사용했다.

```sh
LITHENT_CHROMIUM_PATH=/usr/bin/chromium node experiments/closure-lifecycle/benchmark-core.mjs --baseline /path/to/original-base.mjs --baseline-concurrent /path/to/original-concurrent.mjs --baseline-commit 925b4aa98c40ca20b309ea2613cc625d260fa5b1 --current-commit 16c6e9d8635a239f5f3cd5373fff5ea5a882e8cf --output /path/to/run.json
LITHENT_CHROMIUM_PATH=/usr/bin/chromium node experiments/closure-lifecycle/benchmark-core.mjs --baseline /path/to/original-base.mjs --baseline-concurrent /path/to/original-concurrent.mjs --baseline-commit 925b4aa98c40ca20b309ea2613cc625d260fa5b1 --current-commit 16c6e9d8635a239f5f3cd5373fff5ea5a882e8cf --workload leaf --iterations-multiplier 10 --output /path/to/leaf-long.json
```

현재 수치는 로컬 합성 시나리오의 동기 갱신 시간이다. `deferRender`의 입력 응답성,
실제 앱의 프레임·낮은 사양 장치·다른 브라우저 성능은 별도 확인 대상이다.
