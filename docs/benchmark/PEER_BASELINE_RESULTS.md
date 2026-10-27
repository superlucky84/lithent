# 고정 React/Preact 전체 비교 — DC-16

사용자가 확정한 목표는 **CPU 9항목 각각에서 고정 네 peer 중 가장 빠른 전체 시간 중앙값의 1.10배 이내**다.
이번 합산 결과는 **5/9항목 통과**, 첫 차수 5/9, 반대 차수 6/9다.
아직 전 항목 목표를 달성하지 못했다.
CPU 1,450표본·공식 메모리 150표본을 같은 production 두 순서에서 새로 수집했다.
기본 core/helper·package는 유지했다. C3는 이번 비교에 포함하지 않는다.

[비교표](./PEER_BASELINE_TABLE.html), [raw](./peer-baseline-results.json),
[증거](./peer-baseline-evidence.json.gz), [재현 도구](../../experiments/peer-baseline/README.md),
[요구사항](../performance-improvement/REQUIREMENTS.md).

## 비교 조건

| 조건           | 고정 버전      | production 빌드                      |
| -------------- | -------------- | ------------------------------------ |
| lithent        | 1.25.2 default | 원래 monolithic cacheUpdate 앱, Vite |
| react-hooks    | 19.2.0         | `webpack`                            |
| react-classes  | 19.0.0         | `node esbuild.config.js`             |
| preact-hooks   | 11.0.0         | `rollup -c --environment production` |
| preact-classes | 11.0.0         | `webpack`                            |

upstream의 실제 source/lock/빌드 설정을 그대로 사용했다. React hooks 19.2.0과 classes 19.0.0은
서로 다른 고정 버전이다. 이 결과는 네 실제 구현의 비교이며 React 버전이나 hooks 효과를 분리한 실험이 아니다.
이전 설치본은 source/lock·모든 설치 package 버전·npm 의존성 트리가 일치할 때 재사용하고 새 staging에서 다시 빌드했다.
네 peer를 모두 공개하며 유리한 한 구현만 선택하지 않는다.
다섯 앱 모두 별도 DOM 정체성 계약과 공식 keyed/9동작/font를 통과했다.
framework별 bulk 제거 mutation 수가 같은지는 요구하지 않았다.

## CPU 전체 시간과 목표

공식 클릭→최종 paint의 total 중앙값(ms)이 주 지표다. 각 차수에 선택25/나머지15표본씩 수집했다.
합산은 이번 두 차수의 원본 표본만 사용한다. 색상은 고정 Common.ts 함수와 **다섯 앱 최저값**으로 계산한다.
사용자 목표는 **네 peer 최저값** 기준이며 색상·평균으로 항목별 판정을 대체하지 않는다.
표시는 소수3자리로 반올림하지만 통과 여부는 반올림하지 않은 중앙값의 비율로 계산한다.

| 항목                   | lithent | react-hooks | react-classes | preact-hooks | preact-classes | L/최저 peer | 1.10 목표 |
| ---------------------- | ------: | ----------: | ------------: | -----------: | -------------: | ----------: | --------- |
| 01_run1k               |  27.474 |      24.599 |        26.614 |       26.216 |         26.417 |      1.117× | 미달      |
| 02_replace1k           |  32.091 |      31.446 |        31.167 |       30.857 |         30.378 |      1.056× | 통과      |
| 03_update10th1k_x16    |  18.895 |      17.127 |        15.847 |       24.065 |         14.889 |      1.269× | 미달      |
| 04_select1k            |   7.506 |       6.485 |         6.592 |       15.058 |          4.606 |      1.630× | 미달      |
| 05_swap1k              |  17.462 |     100.451 |        98.549 |       25.233 |         16.371 |      1.067× | 통과      |
| 06_remove-one-1k       |  12.930 |      13.756 |        14.029 |       16.189 |         11.726 |      1.103× | 미달      |
| 07_create10k           | 287.495 |     442.305 |       384.483 |      289.704 |        288.076 |      0.998× | 통과      |
| 08_create1k-after1k_x2 |  31.317 |      30.587 |        30.608 |       33.011 |         30.596 |      1.024× | 통과      |
| 09_clear1k_x8          |  13.173 |      19.383 |        19.639 |       14.193 |         14.009 |      0.940× | 통과      |

| 항목                   | 최저 peer      | 첫 차수 L/최저 | 반대 차수 L/최저 | 목표 초과 ms | 목표까지 현재 시간 감축 |
| ---------------------- | -------------- | -------------: | ---------------: | -----------: | ----------------------: |
| 01_run1k               | react-hooks    |         1.119× |           1.116× |        0.415 |                   1.51% |
| 02_replace1k           | preact-classes |         1.049× |           1.065× |        0.000 |                   0.00% |
| 03_update10th1k_x16    | preact-classes |         1.282× |           1.191× |        2.517 |                  13.32% |
| 04_select1k            | preact-classes |         1.697× |           1.575× |        2.439 |                  32.50% |
| 05_swap1k              | preact-classes |         0.953× |           1.092× |        0.000 |                   0.00% |
| 06_remove-one-1k       | preact-classes |         1.135× |           1.056× |        0.031 |                   0.24% |
| 07_create10k           | preact-classes |         1.032× |           0.978× |        0.000 |                   0.00% |
| 08_create1k-after1k_x2 | react-hooks    |         1.027× |           1.073× |        0.000 |                   0.00% |
| 09_clear1k_x8          | preact-classes |         0.939× |           0.900× |        0.000 |                   0.00% |

감축률은 `max(0, 1−1.10/(L/최저 peer))`다. 모든 항목을 같은 비율로 개선할 수 있다는 예측이 아니다.
실행 순서는 각 항목마다 교대하며 두 번째 차수는 첫 차수의 반대 순서다.
두 차수가 시간 변화·외부 부하·구현 간 간격을 모두 제거하지는 않는다.
작은 차이나 순서별 경계 교차는 불확실하며 통계적 유의성을 주장하지 않는다.
배치 종료 시 기록한1분 load 범위는 첫 차수 1.738~6.249,
반대 차수 1.686~6.905였다.
load는 대기 작업 수의 OS 지표이며 CPU 사용률이나 특정 표본의 오차를 계산하는 값이 아니다.

## 보조 CPU 지표

다음은 Lithent/각 peer의 upstream 가중 기하평균이다. 1보다 작으면 Lithent가 빠르다.
전체9항목 목표는 이 평균과 별도로 판정한다.

| peer           | 첫 전체 | 반대 전체 | 합산 전체 |  첫 JS | 반대 JS | 합산 JS |
| -------------- | ------: | --------: | --------: | -----: | ------: | ------: |
| react-hooks    |  0.888× |    0.879× |    0.889× | 0.873× |  0.885× |  0.881× |
| react-classes  |  0.894× |    0.904× |    0.902× | 0.844× |  0.853× |  0.851× |
| preact-hooks   |  0.893× |    0.897× |    0.897× | 0.746× |  0.757× |  0.753× |
| preact-classes |  1.088× |    1.065× |    1.083× | 1.401× |  1.406× |  1.403× |

합산 JS 중앙값(ms):

| 항목                   | lithent | react-hooks | react-classes | preact-hooks | preact-classes |
| ---------------------- | ------: | ----------: | ------------: | -----------: | -------------: |
| 01_run1k               |   8.049 |       5.359 |         7.210 |        6.754 |          6.679 |
| 02_replace1k           |  11.777 |      11.134 |        11.300 |       10.846 |         10.441 |
| 03_update10th1k_x16    |   6.213 |       4.740 |         4.050 |       11.037 |          2.644 |
| 04_select1k            |   4.387 |       3.277 |         3.559 |       10.672 |          1.503 |
| 05_swap1k              |   3.651 |      21.053 |        20.855 |        9.102 |          1.617 |
| 06_remove-one-1k       |   1.332 |       1.341 |         1.774 |        4.665 |          0.749 |
| 07_create10k           |  64.245 |     214.521 |       155.613 |       61.257 |         55.698 |
| 08_create1k-after1k_x2 |   8.037 |       6.827 |         7.392 |        8.685 |          6.958 |
| 09_clear1k_x8          |  10.431 |      16.864 |        17.142 |       11.526 |         11.430 |

total·script·paint의 각 차수/합산 표본 수·중앙값·Tukey 절반 사분위·min/max를 raw에 보존했다.
짝수 중앙값은 가운데 두 값의 평균이며 홀수 사분위는 가운데 값을 제외한 절반의 중앙값이다.
독립 Python 감사가 분포 480개·가중 값 69개와 색상/목표를
원본 표본에서 재계산해1e−12 이내 일치를 확인했다. 평균·JS만으로 최종 목표를 선언하지 않는다.

## 공식 메모리와 전송 크기

각 앱/항목/차수3표본, 합산6개의 중앙값이다. MB=bytes/1024²다.
공식 measureUserAgentSpecificMemory를 사용하며 CDP heap과 다르다.
CPU1.10 목표를 메모리에 적용하지 않는다. 별도 메모리 예산은 확정하지 않았다.

| 항목                | lithent MB | react-hooks MB | react-classes MB | preact-hooks MB | preact-classes MB | L/최저 peer | 차이 MB |
| ------------------- | ---------: | -------------: | ---------------: | --------------: | ----------------: | ----------: | ------: |
| 21_ready-memory     |      0.641 |          1.188 |            1.188 |           0.643 |             0.657 |      0.998× |  -0.001 |
| 22_run-memory       |      3.501 |          4.432 |            4.539 |           3.308 |             3.490 |      1.058× |   0.192 |
| 23_update5-memory   |      3.581 |          4.896 |            5.007 |           3.359 |             3.525 |      1.066× |   0.222 |
| 25_run-clear-memory |      0.893 |          1.976 |            1.944 |           0.790 |             0.775 |      1.152× |   0.118 |
| 26_run-10k-memory   |     27.465 |         30.748 |           31.565 |          26.238 |            27.645 |      1.047× |   1.228 |

각 production의 HTML/전체 JS 크기(B)다. 공유 CSS/fonts와 startup 시간은 포함하지 않는다.
HTML과 JS를 개별 압축했으며 gzip level9, brotli 기본 quality11, Nodev20.3.0/zlib1.2.13.1-motley다.

| 조건           | 종류 |    raw |  gzip | brotli |
| -------------- | ---- | -----: | ----: | -----: |
| lithent        | html |    292 |   207 |    128 |
| lithent        | js   |  14815 |  6163 |   5687 |
| react-hooks    | html |    246 |   193 |    103 |
| react-hooks    | js   | 194643 | 61128 |  52434 |
| react-classes  | html |    240 |   187 |    104 |
| react-classes  | js   | 188803 | 59366 |  51159 |
| preact-hooks   | html |    254 |   196 |    103 |
| preact-hooks   | js   |  14915 |  6308 |   5760 |
| preact-classes | html |    239 |   189 |    108 |
| preact-classes | js   |  17741 |  6643 |   6077 |

## 별도 병목 진단과 다음 후보

공식 실행 완료 후 목표 대비 비율이 큰 미달 항목 최대 두 개에만 profiler를 붙였다.
각 항목의 Lithent와 최저 peer를3 fresh context×10action씩 교차 실행했다.
CPU1x·sampling250µs·action 후2rAF이며 공식 warmup/throttle과 다르다.
CPU profile과 trace는 동시 수집하지 않고, trace는 항목/앱별 별도 fresh context4개에서10action씩 수집했다.
reset은 profile 밖이며 trace는 표시된 action 구간만 집계한다.
샘플링·native/idle/driver·profiler 비용이 포함되므로 이 시간은 공식 스코어가 아니다.
trace의 FunctionCall/EventDispatch/layout/paint는 포괄·중첩 시간으로 더할 수 없다.
첫 진단에 음수 timeDelta가 있는 profile 41개가 있어 첫 시도를 전량 함수 시간 순위에서 제외하고 보존했다.
분리 수집 120profile 중 음수 간격이 있는 1개는 해당 profile 전체를 제외했다. 유효 119개의 간격은 모두 비음수다.
조건별 유효 profile 수를 아래에 공개하며 이 합계를 조건 간 속도비로 사용하지 않는다.
음수 간격의 원인은 미확정이며 값을0으로 고치거나 시간순으로 재배열하지 않았다.
새 CPU profile UTC: 2026-10-23T10:12:28.417Z ~ 2026-10-23T10:12:35.874Z; 별도 trace: 2026-10-23T10:12:54.458Z ~ 2026-10-23T10:12:56.938Z.
공식 수집과 진단 사이 시간 간격이 크며 시간·부하 조건이 동일하다는 가정으로 합산하지 않는다.

별도 hidden source map 빌드의 JS가 측정 bundle과 byte 단위로 일치해 원래 소스 위치를 사용했다.
함수 위치는 전체 함수가 비용의 원인이라는 증거가 아니며 top30/context 집계 밖의 함수는 순위에서 빠질 수 있다.
기존 default ESM이 연결한 core map의14개 embedded source도 고정 runtime 해시와 일치했다.
이 보조 map의 위치는 core 재빌드로 새로 생성한 결과와 구분해 raw provenance에 기록한다.

### 04_select1k / lithent

유효 profile/context: 10/10/10.

| 함수        | app self 샘플 ms(유효 profile 합) | 소스 위치                          |
| ----------- | --------------------------------: | ---------------------------------- |
| (anonymous) |                             1.282 | `../src/render.ts:322:19`          |
| Qe          |                             0.970 | `../src/utils/predicator.ts:143:2` |
| (anonymous) |                             0.963 | `../src/diff.ts:267:47`            |
| pt          |                             0.891 | `../src/diff.ts:45:22`             |
| bt          |                             0.827 | `../src/diff.ts:255:25`            |
| Le          |                             0.696 | `../src/wDom.ts:219:23`            |
| Se          |                             0.684 | `../src/render.ts:426:23`          |
| (anonymous) |                             0.669 | `../src/wDom.ts:226:23`            |

### 04_select1k / preact-classes

유효 profile/context: 10/10/10.

| 함수        | app self 샘플 ms(유효 profile 합) | 소스 위치         |
| ----------- | --------------------------------: | ----------------- |
| I           |                             1.734 | `main.js:1:7169`  |
| L           |                             1.110 | `main.js:1:4141`  |
| R           |                             0.635 | `main.js:1:3744`  |
| H           |                             0.575 | `main.js:1:10236` |
| render      |                             0.325 | `main.js:1:15897` |
| (anonymous) |                             0.322 | `main.js:1:8335`  |
| M           |                             0.317 | `main.js:1:3321`  |

### 03_update10th1k_x16 / lithent

유효 profile/context: 10/10/10.

| 함수        | app self 샘플 ms(유효 profile 합) | 소스 위치                 |
| ----------- | --------------------------------: | ------------------------- |
| kt          |                             4.380 | `../src/wDom.ts:182:17`   |
| ct          |                             2.716 | `../src/render.ts:494:20` |
| K           |                             1.909 | `../src/diff.ts:21:31`    |
| nt          |                             1.851 | `../src/render.ts:293:24` |
| se          |                             1.610 | `../src/render.ts:265:20` |
| (anonymous) |                             1.267 | `../src/diff.ts:258:23`   |
| F           |                             1.150 | `../src/render.ts:472:27` |
| dt          |                             1.050 | `../src/diff.ts:91:29`    |

### 03_update10th1k_x16 / preact-classes

유효 profile/context: 10/9/10.

| 함수        | app self 샘플 ms(유효 profile 합) | 소스 위치         |
| ----------- | --------------------------------: | ----------------- |
| L           |                             3.576 | `main.js:1:4141`  |
| H           |                             2.863 | `main.js:1:10236` |
| I           |                             2.599 | `main.js:1:7169`  |
| W           |                             0.632 | `main.js:1:4570`  |
| render      |                             0.531 | `main.js:1:438`   |
| update      |                             0.360 | `main.js:1:15439` |
| updateData  |                             0.318 | `main.js:1:1615`  |
| (anonymous) |                             0.315 | `main.js:1:8335`  |

별도 trace의 표시된10action 안 main-thread 포괄 시간(ms):

| 항목                | 앱             | FunctionCall | style | layout |  paint |
| ------------------- | -------------- | -----------: | ----: | -----: | -----: |
| 04_select1k         | lithent        |        5.119 | 1.378 |  0.000 | 10.013 |
| 04_select1k         | preact-classes |        2.676 | 1.021 |  0.000 |  9.797 |
| 03_update10th1k_x16 | lithent        |       10.565 | 0.000 | 19.402 |  7.207 |
| 03_update10th1k_x16 | preact-classes |        6.083 | 0.000 | 19.330 |  7.131 |

- 합산 CPU는 5/9 통과다. 미달은 1k 생성 1.116852×, 부분 갱신 1.269015×, 선택 1.629545×, 한 행 삭제 1.102673×다. 한 행 삭제는 차수별 1.134519×/1.055783×로 경계를 오가므로 작은 합산 초과를 확정 회귀로 해석하지 않는다.
- 목표까지 현재 total의 선택 32.50%(2.439ms), 부분 갱신 13.32%(2.517ms) 감축이 필요하다. 이는 현재 표본의 목표 차이이며 후보 개선율 예측이 아니다.
- Lithent의 합산 가중 total은 React hooks 대비 0.888638×, React classes 대비 0.901626×, Preact hooks 대비 0.897331×지만 Preact classes 대비 1.082659×다. 평균이나 유리한 구현 선택으로 9항목 목표를 대체하지 않는다.
- 선택의 유효 profile에서 render.ts:322의 matchedIndexes/oiSeq 수집과 diff.ts:255/267의 keyed 매칭, 부분 갱신에서는 wDom.ts:182의 노드 생성·render.ts:494의 text 갱신·render.ts:293의 자식 순회가 관찰됐다. 특정 함수 하나가 전체 격차의 원인이라는 증거는 아니다.
- 독립 trace의 10action 포괄 FunctionCall은 선택 Lithent 5.119/Preact 2.676ms, 부분 갱신 10.565/6.083ms였다. 같은 진단의 부분 갱신 layout은 19.402/19.330ms, paint는 7.207/7.131ms였다. 중첩 시간과 다른 진단 조건이므로 공식 스코어와 합산하거나 차감하지 않는다.
- 첫 진단 120profile 중 41개에 음수 간격이 있어 첫 시도 전체를 시간 순위에서 제외하고 보존했다. profile/trace 분리 후 120개 중 −1µs가 있는 1개를 통째로 제외해 119개를 사용했다. 독립 Python 감사가 제외·함수 합계·40trace 구간을 확인했다. 음수의 원인은 미확정이다.

**다음 단계:** DC-17에서 C2의 base 한정 후보를 검증한다. 기존 general keyMap 소비를 유지하고, 같은 길이·모든 원래 인덱스 동일·추가/삭제/교체/이동 없는 결과의 증명을 render에 전달해 배치 판정과 임시 배열의 중복 처리를 줄인다. 새 uniqueness Set/preflight·immutable 가정·공개 API는 추가하지 않는다. 먼저 metadata 수명/fallback과 기준 회귀를 정하고 동일 앱 core-only 대조를 수행한다.

- C2는 Map 매칭이나 helper의 전체 deps 검사, 부분 갱신의 VDOM 생성·text/DOM 비용을 모두 없애지 못한다. 1.10 목표 달성을 보장하는 후보로 표현하지 않는다.
- 유효 profile은 선택 양조건 30개씩, 부분 갱신 Lithent 30/Preact 29개다. 희소 샘플의 함수 위치·순위는 정확한 비중이나 예상 절감 ms가 아니다. 진단과 공식 수집의 시간 간격도 크다.
- 기본 28파일/package/sibling과 크기 한도는 유지한다. 다음 후보의 정확성·생성/삭제·메모리/retention·raw/gzip/br·전체 CPU 검증 전 채택하지 않는다. C3 미채택·C4 조건부 연구·최종 hardening/integration 미완료는 유지한다.

## 증거와 보존

- 기준 commit: `6bd3b3317ae73562afc49479bd3ed0ba952ce8ab`.
- 공식 실행 UTC: 2026-10-23T01:28:22.927Z ~ 2026-10-23T02:38:37.020Z.
- CPU 실패 배치 0개, 메모리 실패 배치 0개. raw에 시도·표본·machine/load/명령을 보존했다.
- source/lock·의존 package·runtime·runner/CSS·manifest·production 1228파일을 전후 검사했다. 기본28파일·package·실제 sibling 앱도 유지했다.
- 원래 앱/source: `4fcb17e3dcd841f628d4130a7d47ca3011550972675ba2da18e324a5f541d632`; baseline ESM: `3aff372ac9a7e8de09f73f5ddcde5c80ef27d7f6dee8bf2221c0e9cc8121a964`.
- Lithent production JS: `12d25a3bf28c163d67c6734119ad7407473b362b136b91bc8f3ef7523db9be12`. 모든 공식 차수에서 Chrome/engine hash가 일치한다.
- 정상 trace 1450개의 hash/size와 선택 index0/조건/차수 10개 내용을 보존했다. 모든 실패 시도와 별도 진단 profile/trace는 전체 보존한다. 나머지 정상 trace 내용은 임시 경로에 있다.
- 같은 해시의 기존 type/B3/core/dual 증거는 DC-15 archive에 포함해 재사용했다. 변경 없는 core의 회귀 suite를 반복 실행한 결과로 쓰지 않는다.
- evidence SHA256: `5ec4db084140ac0e1379d82c2c691d7fc437c24e1e4484d8cc823a0d7071412e`, 774 entries, 7941577B. 디코딩한 모든 entry hash를 검사했다.

## 상태 / 핸드오프

- done:DC-16 전체 peer gate·CPU1,450/메모리150·독립 감사·별도 profile·영구 증거.
- next:DC-17에서 C2의 base 한정 후보를 검증한다. 기존 general keyMap 소비를 유지하고, 같은 길이·모든 원래 인덱스 동일·추가/삭제/교체/이동 없는 결과의 증명을 render에 전달해 배치 판정과 임시 배열의 중복 처리를 줄인다. 새 uniqueness Set/preflight·immutable 가정·공개 API는 추가하지 않는다. 먼저 metadata 수명/fallback과 기준 회귀를 정하고 동일 앱 core-only 대조를 수행한다.
- blockers:실행 블로커 없음. 전 항목 CPU 목표 미달 또는 순서 일관성 미확정. 공개 예산·concurrent·후보 hardening/integration은 별도 추적한다.
- commit:`6bd3b3317ae73562afc49479bd3ed0ba952ce8ab`; 이번 DC-16 변경은 작업 트리다.
