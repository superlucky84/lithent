# C4 P3 — key snapshot 비교 결과

P3 key snapshot은 미채택이다. 새 P2/P3/Preact class 비교의 CPU870·공식 메모리90에서 P3/P2 가중 전체 +1.78%(main +1.62%, reverse +1.24%), JS +2.47%였고 전체 삭제 +15.01%가 관찰됐다. 중복 조회를 줄였지만 실제 이득을 입증하지 못했다.

## 비교 범위와 판단

- 브랜치 `perf/c4-key-snapshot`. 기존 진단/P1/P2를 커밋한 `7f4df5c`의 P2 owner가 이번 baseline이다. 이번 P3는 별도 실험 파일이며 기본 runtime/public export/guard는 그대로다.
- 같은 P2 owner 앱·row cache·source core를 두 번 빌드하고 controller의 key snapshot 한 축만 바꿨다. Preact class11은 고정 source/lock/설치 inventory에서 다시 빌드했다.
- 새 CPU870/공식 메모리90표본을 양순서로 수집했다. 원래 A 앱은 이번 비교에 없으며 과거 P2 개선율과 곱하거나 합산하지 않는다. 네 peer/Vue 목표 검증도 아니다.
- 판단: **미채택 — 후속 실험 기준은 P2 owner 유지**. 두 순서에서 가중 전체 시간이 늘었으며 Preact class1.10 범위도 두 후보 모두7/9로 개선되지 않았다. 1만 행 메모리 +0.03197MB(+0.112%), 앱 Brotli +3B다. key snapshot의 추가 저장/쓰기 비용을 부담할 근거가 없다.
- 같은 검증 조회 미세 조정은 반복하지 않는다. 큰 이득을 노리는 다음 가설은 구조 변경 정보를 통해 전체 keyed 순회를 줄이거나 compiler가 동적 필드/정적 자식 정보를 전달하는 별도 경로다. 기존 targeted/retained 행별 컴포넌트 실험과 구분해 계약·정합성·추가 정보 유지 비용부터 설계해야 하며 예상 개선율은 미확정이다. P2의 제품 통합/기존 BUG-3 해결과 네 peer/Vue 동시 비교도 별도다.

## 전체/JS/paint — P3/P2 가중 변화

항목별 중앙값 비율의 기존 가중 기하평균이다. 음수는 P3가 작다. 순서별/pooled 분포(p25/p75/min/max)와 peer 비율은 [JSON](./c4-key-snapshot-results.json)에 있다. 표본 변동이 있으므로 작은 pooled 차이만으로 원인이나 우위를 확정하지 않는다.

| 순서    |   전체 |     JS |  paint |
| ------- | -----: | -----: | -----: |
| main    | +1.62% | +3.02% | +1.29% |
| reverse | +1.24% | +3.48% | +4.33% |
| pooled  | +1.78% | +2.47% | +2.80% |

## 9항목 pooled 전체 시간

단위 ms. JS 열은 P3/P2 변화다. Preact class1.10 이내는 P2 7/9, P3 7/9다. Preact 대비 가중 전체는 P2 -0.01%, P3 +1.77%다. 이는 이번 한 peer의 비교다.

| 항목                   |       P2 |       P3 | 전체 변화 | JS 변화 | Preact class | P3/Preact |
| ---------------------- | -------: | -------: | --------: | ------: | -----------: | --------: |
| 01_run1k               |  26.6655 |  26.6035 |    -0.23% |  -0.01% |      25.2820 |     1.052 |
| 02_replace1k           |  27.8525 |  27.8750 |    +0.08% |  +1.12% |      29.3040 |     0.951 |
| 03_update10th1k_x16    |  13.3755 |  13.8850 |    +3.81% |  +4.64% |      13.4120 |     1.035 |
| 04_select1k            |   5.1835 |   5.2220 |    +0.74% |  +1.83% |       4.2495 |     1.229 |
| 05_swap1k              |  16.9280 |  16.7805 |    -0.87% |  +4.00% |      14.4270 |     1.163 |
| 06_remove-one-1k       |  12.3735 |  12.1860 |    -1.52% |  +0.16% |      11.2800 |     1.080 |
| 07_create10k           | 269.5215 | 270.2860 |    +0.28% |  -0.09% |     266.5745 |     1.014 |
| 08_create1k-after1k_x2 |  29.5595 |  29.5875 |    +0.09% |  -0.40% |      29.4630 |     1.004 |
| 09_clear1k_x8          |  10.5700 |  12.1570 |   +15.01% | +16.07% |      14.0720 |     0.864 |

구조 변경의 직접 대상인 교환은 pooled 전체 −0.87%지만 JS +4.00%였다. 1만 행 생성 JS −0.09%와 최초 생성 JS −0.01%는 큰 이득이 아니다. 전체 삭제는 main +18.19%/reverse +14.09%로 모두 악화했고 pooled 전체 +15.01%, JS +16.07%였다. 부분 갱신/선택의 직접 경로는 그대로이므로 해당 차이를 구조 Map 조회 감소의 이득으로 귀속하지 않는다. 삭제 회귀를 추가 배열 할당·GC 또는 특정 core 함수 때문이라고 확정하지 않는다. 이번 개입은 조회 감소와 snapshot 저장을 함께 바꾼 것이므로 조회 한 번의 비용을 단독으로 분리한 실험은 아니다.

## 추가·제거한 작업

set의 기존 순회에서 keys[index]를 저장하고 items/keys/indexes를 검증 후 함께 게시한다. 구조 flush와 최초 owner view는 저장한 key를 describe에 전달한다. describe의 현재 key/출력 key 검사는 남긴다. 실패한 set은 기존 snapshot을 유지하며 lifecycle set은 다음 배치 snapshot을 만든다. 부분 갱신의 Map 조회·정렬과 일반 keyed core의 O(n) 매칭은 유지한다.

아래는 별도 **비시간 작업량 검사**다. keyOf/전역 Map.get은 해당 격리 fixture의 실제 호출 계수이며 일반 성능 비율을 뜻하지 않는다. snapshot key 쓰기 수는 set 입력 길이와 소스의 대입문에서 산정한 값으로, 배열 쓰기 counter나 할당 바이트 실측이 아니다. 배열 n개 쓰기/저장 비용이 추가된다.

| 행 수 | 조건      | 작업   | keyOf | Map.get | 코드상 snapshot key 쓰기 |
| ----: | --------- | ------ | ----: | ------: | -----------------------: |
|  1000 | baseline  | create |  3000 |    1000 |                        0 |
|  1000 | baseline  | swap   |  3000 |    2000 |                        0 |
|  1000 | candidate | create |  2000 |       0 |                     1000 |
|  1000 | candidate | swap   |  2000 |    1000 |                     1000 |
| 10000 | baseline  | create | 30000 |   10000 |                        0 |
| 10000 | baseline  | swap   | 30000 |   20000 |                        0 |
| 10000 | candidate | create | 20000 |       0 |                    10000 |
| 10000 | candidate | swap   | 20000 |   10000 |                    10000 |

순수 keyOf/view·불변 고유 string/number key라는 기존 실험 계약을 전제로 한다. 일반 getter 호출 횟수 보존 최적화로 적용하지 않는다. 구조 갱신의 전체 순회 자체를 없애지는 못했다.

## 공식 메모리와 앱 크기

메모리 단위는 공식 runner의 MB다. 별도 retention에서 P2/P3 각각3context의100회 create/clear와100회 partial 뒤 clear를 확인했고 DOM/listener는 초기 수준으로 돌아왔다. 전체 JS heap 누수 부재를 보장하지 않는다.

| 항목                |   P2 MB |   P3 MB | 차이 MB |   변화 | Preact MB |
| ------------------- | ------: | ------: | ------: | -----: | --------: |
| 21_ready-memory     |  0.6348 |  0.6419 |  0.0071 | +1.12% |    0.6539 |
| 22_run-memory       |  3.6061 |  3.6123 |  0.0061 | +0.17% |    3.4902 |
| 23_update5-memory   |  3.6657 |  3.6659 |  0.0002 | +0.01% |    3.5187 |
| 25_run-clear-memory |  0.9256 |  0.9226 | -0.0029 | -0.32% |    0.8018 |
| 26_run-10k-memory   | 28.4389 | 28.4709 |  0.0320 | +0.11% |   27.6369 |

같은 compressor의 앱 번들 전체 크기다. base UMD의 guard와 직접 비교하지 않는다. P3의 Brotli 차이는 3B다.

| 조건           | raw B | gzip B | Brotli B |
| -------------- | ----: | -----: | -------: |
| baseline       | 17226 |   7153 |     6601 |
| candidate      | 17195 |   7165 |     6604 |
| preact-classes | 17741 |   6666 |     6074 |

## 정합성·수집·감사

- strict source/core/P2/P3 types 통과. 공유 owner19검사(계약18 + 기존 portal 관찰1), snapshot 추가5검사, 1k/10k 작업량8조건을 통과했다. set 이후 key mutation/재시도·caller 배열 변경·실패한 set 원자성·lifecycle 다음 배치·falsy/±0/dispose를 확인했다.
- 실제 Chrome owner12 + 앱9검사, 세 앱 공식 keyed/9동작/font 검증, 조건별3context retention을 통과했다. P2의 지원 범위 안에서 부모 renew/중첩/root component/오류/focus/제거·재마운트를 확인했다.
- 독립 Python 감사: 288분포, 9가중, 180peer 비율/가중 검산과 순서·표본·bundle 해시 통과. source/browser/runner/peer inventory는 별도 integrity.json에 보존했다.
- 중단 사이 Chrome이156.0.8078.48→156.0.8078.74로 바뀌어 첫 collection이 **표본 수집 전** 해시 guard에서 중단됐다. 이전 검증/오류를 보존했다. 준비 도구가 과거 framework 경로를 그대로 쓰던 점도 현재 Current의 실경로를 고정하도록 수정하고 최종 staging에서 native gate를 반복했다. 이번 timing은 현재 브라우저의 새 세션만 포함한다.
- 공식 수집 중 별도 build/test/profile/benchmark를 실행하지 않았다. 준비의 기존 Browserslist 데이터 알림은 고정 의존성 그대로 기록했으며 timing 경고와 구분한다.

| 순서/모드   | 시작 UTC                 | 종료 UTC                 | Chrome               | 실패 batch | warnings |
| ----------- | ------------------------ | ------------------------ | -------------------- | ---------: | -------: |
| main/cpu    | 2026-10-30T01:11:25.462Z | 2026-10-30T01:22:41.422Z | Chrome/156.0.8078.74 |          0 |        0 |
| main/mem    | 2026-10-30T01:34:26.077Z | 2026-10-30T01:44:05.033Z | Chrome/156.0.8078.74 |          0 |        0 |
| reverse/cpu | 2026-10-30T01:22:56.651Z | 2026-10-30T01:34:10.395Z | Chrome/156.0.8078.74 |          0 |        0 |
| reverse/mem | 2026-10-30T01:44:11.900Z | 2026-10-30T01:53:53.250Z | Chrome/156.0.8078.74 |          0 |        0 |

## 지원 한계와 재현

중첩 portal을 보통 요소 아래에서 삭제할 때 target 내용이 남는 기존 BUG-3은 P3에서도 지원 한계다. 단일 owner 수명/동일 위치 parent renew를 유지하며 새 owner를 먼저 만드는 교대·일반 clone·concurrent/SSR/HMR·최종 API는 별도 설계/검증이 필요하다. 모든 diff/DOM 오류의 rollback을 약속하지 않는다.

[도구와 명령](../../experiments/c4-key-snapshot/README.md), [정본 인계](../performance-improvement/IMPLEMENT.md#상태--핸드오프). staging은 `/private/tmp/lithent-c4-key-snapshot-20261030-v2`이다. [새 archive](https://github.com/superlucky84/lithent/releases/download/benchmark-evidence/c4-key-snapshot-evidence.tar.gz)와 [manifest](./c4-key-snapshot-evidence-manifest.json)에 실제 소스/번들·raw/trace·runner/lock/설치 inventory·준비 이력과 도구를 보존한다. 기존 P1/P2 자료는 유지한다.
