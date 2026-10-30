# 정적/동적 HTML 정보 — 수동 blueprint 실험 결과

이번 수동 blueprint/overlay 경로는 미채택이다. 부분 갱신 전체 -12.33%·JS -20.09%의 이득은 관찰했지만, 전체 가중은 −0.04%(main +2.38%/reverse −2.07%)로 방향이 갈렸고 가중 JS +2.98%였다. 1만 행 메모리 +1.44025MB(+5.11%)와 앱 Brotli +1,472B가 늘어 현재 형태의 기본 채택/자동 compiler 전체 구현으로 이어갈 근거가 부족하다.

## 비교와 판단

- 기준 HEAD `4109bd3`. stock은 원래 A 앱/원래 core, control은 같은 앱/overlay, candidate는 같은 목록 map/cache에 수동 row blueprint를 쓴 overlay다. C4 알림이나 행별 component는 추가하지 않았다.
- 자동 compiler 변환을 구현하기 전의 opt-in 정보 원리 검증이다. 생성은 readonly plan/static props 공유와 기존 createWDom layout을 쓰는 새 경로도 포함하므로 비교 생략만의 단독 효과가 아니다.
- stock 번들 SHA `95f96c9a…`/Brotli5,491B는 기존 A와 같지만 과거 timing을 합산하지 않는다. 이번 새 CPU870/공식 메모리90 양순서만 사용한다. peer/Vue/일반 JSX 무수정 개선·기본 채택 검증은 아니다.
- 판단: **수동 blueprint 구현 미채택; 자동 compiler 제품 구현은 보류**. stock 대비 전체 가중의 안정적인 이득이 없고 순서별 방향이 반대다. 생성 JS +8.36%, 교체 JS +12.28%, 1만 행 생성 JS +9.88%처럼 초기/구조 작업의 비용도 늘었다. 같은 overlay에서 정보 활용은 가중 전체 −1.64%/JS −0.86%였지만, control/stock 가중 JS +3.87%와 생성/metadata 비용을 포함한 net JS는 +2.98%다. 이는 이번 두 코드 경로의 비교이며 정보 한 필드만의 단독 기여율은 아니다. 1만 행 메모리 28.16923→29.60948MB(+1.44025MB/+5.11%), 앱 Brotli5,491→6,963B(+1,472B)다.
- 같은 수동 schema/WeakMap 경로의 미세 조정이나 전체 compiler 구현은 바로 확대하지 않는다. 후속을 한다면 정적 구조/동적 필드에서 전용 생성·patch 코드를 직접 생성해 일반 metadata/값 배열/검사 비용을 줄일 수 있는지부터 별도 설계·작은 검증으로 판단한다. 이번 generic helper 결과를 모든 compiler 최적화의 불가능성으로 일반화하지 않는다. 기존 C4와의 결합·Vue/peer 동시 비교도 이번 결과에 포함하지 않는다.

## 전체/JS/paint 가중 변화

각 항목 중앙값의 기존 가중 기하평균이다. net=candidate/stock, information=candidate/control, hooks=control/stock이다. pooled는 합친 표본에서 중앙값을 다시 구한 값이며 순서별 개선율의 평균이 아니다. 음수는 빠른 것이다. 전체 분포·순서별 값은 [JSON](./static-dynamic-results.json)에 보존했다.

| 순서    | 비교        |   전체 |     JS |  paint |
| ------- | ----------- | -----: | -----: | -----: |
| main    | net         | +2.38% | +3.56% | +2.47% |
| main    | information | -1.69% | -1.20% | +0.88% |
| main    | hooks       | +4.14% | +4.82% | +1.58% |
| reverse | net         | -2.07% | +2.43% | -4.67% |
| reverse | information | -1.43% | -0.34% | -0.25% |
| reverse | hooks       | -0.65% | +2.78% | -4.43% |
| pooled  | net         | -0.04% | +2.98% | -1.43% |
| pooled  | information | -1.64% | -0.86% | +0.04% |
| pooled  | hooks       | +1.62% | +3.87% | -1.47% |

## 9항목 pooled 전체 시간

단위 ms. candidate/stock을 총 변화, candidate/control을 같은 overlay에서 정보 활용의 변화로 본다.

| 항목                   |    stock |  control | candidate | 총 전체 변화 | 총 JS 변화 | 정보 전체 변화 |
| ---------------------- | -------: | -------: | --------: | -----------: | ---------: | -------------: |
| 01_run1k               |  26.6980 |  27.2375 |   27.1040 |       +1.52% |     +8.36% |         -0.49% |
| 02_replace1k           |  27.8080 |  28.8270 |   29.5545 |       +6.28% |    +12.28% |         +2.52% |
| 03_update10th1k_x16    |  16.8070 |  17.0285 |   14.7355 |      -12.33% |    -20.09% |        -13.47% |
| 04_select1k            |   6.4220 |   7.1140 |    6.7160 |       +4.58% |     +9.30% |         -5.59% |
| 05_swap1k              |  16.6705 |  17.2590 |   15.9120 |       -4.55% |     -5.45% |         -7.80% |
| 06_remove-one-1k       |  12.1390 |  12.0915 |   11.7350 |       -3.33% |     -0.14% |         -2.95% |
| 07_create10k           | 269.7650 | 276.1590 |  274.9935 |       +1.94% |     +9.88% |         -0.42% |
| 08_create1k-after1k_x2 |  30.0340 |  29.7730 |   31.4360 |       +4.67% |    +10.12% |         +5.59% |
| 09_clear1k_x8          |  11.9290 |  11.8135 |   12.1585 |       +1.92% |     +4.04% |         +2.92% |

일반 fixture의1천행/1행 변경은 WDom11→4지만 diff1,010→1,003이다. 100행 변경은 WDom803→103·diff1,703→1,003이며 실제 text 쓰기는100으로 같다. 정적 subtree 생성/비교 감소는 유효하지만 전체 목록 map·memo 검사·key Map 매칭은 남는다. 실제 앱의 부분 갱신은 pooled 전체 −12.33%/JS −20.09%였고 양순서 JS가 줄었다. 선택은 전체 +4.58%/JS +9.30%다. swap/삭제처럼 template의 동적 patch를 직접 실행하지 않는 경로의 시간 차이를 static 생략의 이득으로 귀속하지 않는다. 시스템 부하와 프레임 구간도 변동했으며 작은 pooled 전체 차이를 성과로 확정하지 않는다.

## 실제 제거한 작업과 남는 비용

schema는 고정 HTML tag/arity/static props와 동적 text/attr/direct event slot을 한 번 검증·복사한다. 인스턴스의 순수 값 배열을 snapshot하고 첫 생성은 독립 WDom/DOM을 소유한다. 같은 blueprint/key는 정적 자식을 재생성·diff 방문하지 않고 값이 바뀐 slot만 기존 updateProps/updateText로 commit한다. child parent 연결과 VDOM 값도 갱신한다. clone은 description snapshot을 독립적으로 materialize하고 다른 blueprint/key/plain 전환은 일반 full diff로 처리한다.

아래는 별도 diagnostic build의 **비시간 실측 counter**다. DOM 쓰기 수가 같은 상태에서 생성/방문 감소를 확인했다. 목록 map·key Map 매칭·불변 행 방문은 남으며 O(n)을 없앤 것이 아니다. 값 tuple 생성/복사·slot 비교·metadata/refs·최초 materialize·global hook 비용도 candidate/control에 포함한다.

|     n |   k | 조건   | WDom 생성 | diff 방문 | update 방문 | text 쓰기 | slot 비교 |
| ----: | --: | ------ | --------: | --------: | ----------: | --------: | --------: |
|  1000 |   1 | plain  |        11 |      1010 |           8 |         1 |         0 |
|  1000 |   1 | hinted |         4 |      1003 |           4 |         1 |         4 |
|  1000 | 100 | plain  |       803 |      1703 |         503 |       100 |         0 |
|  1000 | 100 | hinted |       103 |      1003 |         103 |       100 |       400 |
| 10000 |   1 | plain  |        11 |     10010 |           8 |         1 |         0 |
| 10000 |   1 | hinted |         4 |     10003 |           4 |         1 |         4 |
| 10000 | 100 | plain  |       803 |     10703 |         503 |       100 |         0 |
| 10000 | 100 | hinted |       103 |     10003 |         103 |       100 |       400 |

V1의 변경 없는 cached row fixture에서 전체 WeakMap.get 호출 계수는1k/10k행2013/20013회였다. V2는 일반 core 경로를 유지하고 block hook만 동일 객체에서 건너뛰어13/13회로 줄였다. V1 부분 CPU 수집은 중단·보존했으며 아래 최종 수치는 재검증한 V2의 새 전체 수집만 사용한다.

Chrome의 실제 candidate 앱에서 partial100/선택1/선택 전환2행의 fast block과 text100/class1/class2 쓰기도 확인했다. 공식 번들에는 diagnostic counter가 없다.

## 공식 메모리와 앱 크기

메모리 단위는 공식 runner의 MB다. 전체 JS heap 무누수를 보장하는 검사가 아니며 readonly schema/static props와 per-instance metadata/값·refs/DOM을 모두 포함한다.

| 항목                | stock MB | control MB | candidate MB | candidate-stock MB | 총 변화 |
| ------------------- | -------: | ---------: | -----------: | -----------------: | ------: |
| 21_ready-memory     |   0.6255 |     0.6380 |       0.6611 |             0.0356 |  +5.69% |
| 22_run-memory       |   3.5737 |     3.5889 |       3.7680 |             0.1943 |  +5.44% |
| 23_update5-memory   |   3.6318 |     3.6546 |       3.8648 |             0.2330 |  +6.41% |
| 25_run-clear-memory |   0.9091 |     0.9314 |       1.0274 |             0.1183 | +13.02% |
| 26_run-10k-memory   |  28.1692 |    28.1290 |      29.6095 |             1.4402 |  +5.11% |

같은 compressor의 전체 앱 번들이다. 기존 base UMD guard와 직접 비교하지 않는다.

| 조건      | raw B | gzip B | Brotli B |
| --------- | ----: | -----: | -------: |
| stock     | 14172 |   5946 |     5491 |
| control   | 16628 |   6837 |     6283 |
| candidate | 18426 |   7533 |     6963 |

## 정합성·감사·준비 기록

- JSDOM 계약/작업량 27검사(일반 HTML 계약19 + 작업량8), 기존 core 26파일/186검사와 stock/overlay 분리 strict types 통과. 값/schema 복사·text/attrs/events·undefined/빈 문자열·plain/blueprint fallback·parent/callback·keyed 이동/삭제·같은 description/clone·pending/retired snapshot·focus·fault/remount를 확인했다.
- 세 앱 공식 keyed/9동작/font와 Chrome 14검사 통과. 세 앱 각각3context의100회 create/clear·100회 partial 뒤 DOM/listener는 초기 수준으로 돌아왔다. heap 증가량은 별도 browser.json에 보존하며 전체 JS heap 누수 부재로 확대하지 않는다.
- 독립 288분포/288비율/27가중 검산과 반대 순서·표본·source/browser/bundle·runner/설치 hash 통과. 입력은 root23+추가root9/stage121, runner185/package343다.
- 최초 준비에서 두 core의 JSX 전역을 함께 type-check한 중복 선언과 diagnostic alias 누락을 수정했다. 일반 core 회귀의 넓은 root 탐색은 중단하고 격리 root로 제한해 통과했다. runtime/공식 번들은 그 설정 수정 전후 같다. 실패한 setup은 archive의 별도 prefix에 보존한다.
- 공식 수집은 직렬이며 build/test/profile/다른 benchmark를 함께 실행하지 않았다. 기존 C4/DC-25와 같은 source 원본을 쓰지만 과거 CPU·memory 표본은 가져오지 않는다.

| 순서/모드   | 시작 UTC                 | 종료 UTC                 | Chrome               | 실패 batch | warnings |
| ----------- | ------------------------ | ------------------------ | -------------------- | ---------: | -------: |
| main/cpu    | 2026-10-30T05:27:01.215Z | 2026-10-30T05:38:18.118Z | Chrome/156.0.8078.74 |          0 |        0 |
| main/mem    | 2026-10-30T05:50:04.012Z | 2026-10-30T05:59:49.054Z | Chrome/156.0.8078.74 |          0 |        0 |
| reverse/cpu | 2026-10-30T05:38:34.514Z | 2026-10-30T05:49:48.438Z | Chrome/156.0.8078.74 |          0 |        0 |
| reverse/mem | 2026-10-30T05:59:55.328Z | 2026-10-30T06:09:49.118Z | Chrome/156.0.8078.74 |          0 |        0 |

## 계약 한계와 재현

block은 일반 h의 내부 표현 관찰과 다른, 순수 값 tuple의 불투명 opt-in description이다. materialize 전 subtree 관찰/외부 WDom mutation을 지원하지 않는다. blueprint 내부 per-node hook/VDOM callback·component/portal/Fragment/ref/style/input/SVG/custom element·동적 구조/getter/spread는 지원하지 않으며 일반 h 경로를 사용한다. 자동 JSX/template compiler·concurrent/SSR/HMR·제품 API·일반 rollback은 범위 밖이다. 기존 portal BUG-3을 해결한 것으로 표시하지 않는다. 기본 runtime/exports/guard는 유지했다.

[도구/명령](../../experiments/static-dynamic/README.md), [정본 인계](../performance-improvement/IMPLEMENT.md#상태--핸드오프). staging은 `/private/tmp/lithent-static-dynamic-20261030-v2`이다. [증거 archive](https://github.com/superlucky84/lithent/releases/download/benchmark-evidence/static-dynamic-evidence.tar.gz)와 [manifest](./static-dynamic-evidence-manifest.json)에 실제 원본/overlay/patch·앱/번들·raw/trace·입력/runner/lock·준비 실패와 도구를 보존했다. 기존 C4 자료는 유지한다.
