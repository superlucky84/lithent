# C4 P2 — owner 컴포넌트와 중첩 수명 확장 (2026-10-29)

**부모 renew·중첩 컴포넌트·수명/오류 처리를 확장한 C4를 구현했다.** 새 baseline/C4 P2/Preact class11의 공식 CPU 870·메모리 90표본을 양순서 수집했다. C4의 baseline 대비 가중 전체 변화는 **-3.44%**, JS는 **-8.20%**다.

정본은 [P2 설계](../performance-improvement/DESIGN.md#dc-26-c4-p2--owner와-갱신-배치-계약), [E0~E4](../performance-improvement/IMPLEMENT.md#c4-p2--후속-실행-e0e4), [M-22](../performance-improvement/MANUAL_TEST_CHECKLIST.md#m-22-c4-p2-owner중첩-확장--r89r94)다. [집계 JSON](./c4-owner-results.json), [재현 도구](../../experiments/c4-owner/README.md)를 연결한다. 첫 [C4 P1](./C4_LIST_BOUNDARY_RESULTS.md)의 표본과 합산하지 않았다.

## 달라진 동작과 남은 범위

- 목록당 하나의 View 컴포넌트가 content와 mount 세션을 소유한다. 같은 owner identity/위치의 부모 renew는 현재 content를 반환해 item 재방문을 피한다. item slot은 최신 owner wrapper에서 갱신하며 행마다 component를 강제로 추가하지 않는다.
- view/diff의 needDiffRef 문맥을 보존해 중첩 component와 keyed component root를 기존 base 매칭으로 처리한다. props 동기화·자체 renew·다중 DOM 출력·mount/unmount를 검증했다.
- edit(key, fn)는 수정 뒤 자동 알림한다. set/invalidate도 지원하며 직접 외부 mutation에는 명시적 알림이 계속 필요하다. key 변경이나 throw가 이미 발생시킨 데이터 변경까지 rollback하지 않는다.
- 이번 CPU 앱은 P1과 맞춰 set/invalidate로 변경 key를 전달한다. edit는 일반 계약 검사와 Chrome fixture에서 검증했으며 edit 호출 자체의 성능을 별도로 측정한 결과는 아니다. unmount는 원하는 item 데이터를 보존하고 dispose는 controller 소유 참조를 해제한다. 호출자가 보관한 cache의 DOM 수명까지 대신 관리하지 않는다.
- flush가 items/indexes/dirty 배치를 분리해 lifecycle의 새 알림을 다음 배치로 보존한다. k개 slot lookup/view 뒤 index 정렬 O(k log k)로 좌→우 content 순서를 유지한다. 구조 변경은 기존 전체 keyed diff/render와 Map 재작성이다.
- 순수 view 안의 쓰기/flush 재진입은 거부한다. view 오류는 명시적 retry, diff/DOM 오류는 fault로 commit을 잠근 뒤 owner unmount/remount를 요구한다. 최초 view 실패는 owner 세션을 해제하고 dispose는 멱등이다.
- controller당 한 active owner다. 기존 owner cleanup 전에 새 setup이 발생하는 subtree handover/clone은 지원하지 않으며 먼저 별도 commit으로 unmount해야 한다. concurrent·SSR/HMR·공개 API 채택은 미완료다.

## 새로 확인한 기존 portal 한계

**BUG-3:** 일반 element 안에 portal을 중첩하면 바깥 element 삭제 후 target 내용이 남을 수 있다. 이번 검사에서 C4와 변경 없는 일반 base 컴포넌트 경로 모두 재현했다. P2가 만든 회귀로 분류하지 않았고 기본 core 수정을 이번 성능 후보에 섞지 않았다. portal teardown 지원 완료나 제품 전체 안정화로 표시하지 않는다.

## 측정 조건

Apple M4 Pro 12코어/24GB, Node24.22.1, Vite5.4.8, Chrome/156.0.8078.48, 비격리 머신이다. B/C는 같은 변경 없는 source core와 원래 A row cache/view를 앱과 함께 production 빌드했다. Preact class11은 보존 source/lock과 검증한 설치 inventory에서 새 staging으로 다시 빌드했다. 원래 sibling·기존 archive를 수정하지 않았다.

CPU 조건/차수별 선택25·나머지15, 공식 메모리는 항목/조건/차수별3이다. 차수별 앱 실행 순서는 반대이며 수집 중 build/test/진단 browser를 병행하지 않았다. 같은 환경의 세 앱을 비교했지만 다른 React/Preact peer와 Vue는 측정하지 않았다. 이 한 peer의 1.10 판정을 기존 네 peer 최저 목표로 대신하지 않는다.

| 차수    | 가중 전체 C/B | 가중 JS C/B | 가중 전체 C/Preact class |
| ------- | ------------: | ----------: | -----------------------: |
| main    |        -1.17% |      -6.74% |                   1.0370 |
| reverse |        -4.82% |      -9.21% |                   0.9999 |
| pooled  |        -3.44% |      -8.20% |                   1.0129 |

## CPU 전체 시간

전체는 클릭→최종 paint ms 중앙값이다. 각 조건 pooled N=30, 선택50이다. 독립 중앙값인 전체·JS·paint를 합산하지 않는다. 차수별/IQR/range·JS/paint·비율은 JSON에 있다.

| 항목       |    B ms | C4 P2 ms | Preact class ms | C/B 변화 | C/P 비율 |
| ---------- | ------: | -------: | --------------: | -------: | -------: |
| 1k 생성    |  26.681 |   26.614 |          25.302 |   -0.25% |    1.052 |
| 1k 교체    |  27.428 |   27.643 |          28.599 |    0.79% |    0.967 |
| 부분 갱신  |  15.774 |   13.420 |          13.518 |  -14.93% |    0.993 |
| 선택       |   6.915 |    5.068 |           4.110 |  -26.72% |    1.233 |
| 교환       |  16.195 |   16.695 |          14.618 |    3.08% |    1.142 |
| 한 행 삭제 |  11.480 |   11.816 |          11.207 |    2.92% |    1.054 |
| 10k 생성   | 264.368 |  263.880 |         263.666 |   -0.18% |    1.001 |
| 1k 추가    |  29.147 |   29.511 |          29.110 |    1.25% |    1.014 |
| 전체 삭제  |  11.760 |   11.152 |          12.546 |   -5.17% |    0.889 |

Preact class 한 구현 대비 전체 시간 1.10 이내는 pooled **7/9**다. 특정 항목의 초과/이득과 각 차수 분포를 함께 읽고 평균만으로 전 항목 우위를 주장하지 않는다.
같은 수집의 가중 전체 B/Preact class는 1.0491, C4/Preact class는 1.0129다. P1의 다른 세션 개선율과 직접 차감하지 않는다.

## 공식 메모리와 앱 크기

| 항목                |   B MB | C4 P2 MB | Preact class MB | C/B 변화 |
| ------------------- | -----: | -------: | --------------: | -------: |
| 21_ready-memory     |  0.632 |    0.635 |           0.654 |    0.61% |
| 22_run-memory       |  3.539 |    3.584 |           3.492 |    1.25% |
| 23_update5-memory   |  3.634 |    3.663 |           3.519 |    0.81% |
| 25_run-clear-memory |  0.891 |    0.926 |           0.796 |    3.98% |
| 26_run-10k-memory   | 28.167 |   28.429 |          27.641 |    0.93% |

앱 전체 B→C4 P2는 raw 14172→17226B, gzip9 5946→7153B, Brotli 5491→6601B(**+1110B**)다. base UMD의 새 크기나 allowance가 아니며 기본 runtime/guard는 변경하지 않았다. P1과 시간 표본을 섞지 않는다.

## 검증과 증거

- Strict types는 source core·B/C·진단 fixture를 확인했다. JSDOM19개 중 18개는 owner/item/오류 계약 검사, 1개는 기존 portal 한계의 동등 관찰이다. CPU 측정 전에 타입 오류와 fault-test 준비 오류를 해결했다.
- 실제 Chrome owner fixture12검사와 기존 앱 진단9개, 세 앱의 공식 keyed/9동작/font를 확인했다. B/C 각각3 fresh contexts에서100회 생성/삭제와100회 partial 후 clear를 수행했고 최종 강제 GC 뒤 DOM/listener 수가 초기값과 같았다. JS heap 수치는 별도 JSON이며 전체 누수 부재의 증명이 아니다.
- 수집 후 추가한 다중 DOM root 교체 오류 진단의 owner unmount/remount로 복구됐다. 이 추가 사례는 별도 fault-probe.json에 있으며 일반적인 DOM rollback 전체를 증명하지 않는다.
- 공식 실패 배치/재시도 0, CPU/메모리 warnings 0다. Preact 빌드의 오래된 browserslist 안내는 준비 로그에 따로 남겼다. 초기 v1 strict types와 portal/fault-test 관찰도 성능 표본과 분리했다.
- 독립 Python으로 분포·가중값·표본 수·반대 순서·peer 비율/1.10 판정·실제 앱 해시를 검산했다. [영구 manifest](./c4-owner-evidence-manifest.json)와 [archive](./c4-owner-evidence.tar.gz)에 source/lock·실제 번들·raw/trace·도구/실패·감사를 보존하고 decoded member hash를 대조했다. node_modules와 Chrome 자체는 제외하고 설치 inventory와 binary/engine hash를 남겼다.

## 판단과 후속

owner와 중첩 component를 확장한 경로에서 얻은 실제 성능·메모리·크기를 위 표로 판단한다. 제품 기본 채택은 하지 않았다. 다음 제품 계약에는 portal teardown BUG-3, owner handover/clone, 변경 정보 소유권/알림 누락과 concurrent·SSR/HMR을 포함해야 한다. 이번 한 peer 결과를 네 peer/Vue 전체 우위로 표현하지 않는다.

### 선택 trace와 class 값 별도 진단

[별도 진단 JSON](./c4-owner-selection-diagnostics.json)은 기존 선택 trace150개와 추가 class 표현 pilot100표본을 연결한다. 주 비교870/90에 pilot을 합산하지 않는다.

기존 선택 trace의 C4 pooled JS 중앙값은0.8505ms, Preact class는1.291ms다. 클릭 thread의 선정 JS/렌더 이벤트 union으로 덮이지 않은 구간의 중앙값은 각각2.259/0.677ms였다. C4의 가장 큰 미포함 구간은50개 중38개에서 PrePaint -> PrePaint 사이였다. 전체 commit 수 중앙값은1, 검사한 GC 이벤트 coverage 중앙값은0다. 이 구간은 CPU idle이나 특정 scheduler 원인, VDOM 비용으로 귀속한 값이 아니다. 공식 점수 계산은 변경하지 않았다.

DOM 검사에서 기존 앱의 비선택 class는 처음에는 없고 선택 해제 뒤 문자열 undefined로 남았다. 대조 앱은 빈 문자열만 쓰도록 한 축을 바꿨다. 양쪽 keyed/9동작/font는 통과했다. 공식 선택 pilot 100표본에서 전체 변화는 첫 차수14.20%, 반대-13.99%, pooled-3.63%다. 양순서 모두 전체 감소 여부는 false다. 이번에는 방향이 갈려 채택하지 않았다. 초기 생성/메모리에는 class 속성 수 비용도 생길 수 있어 이 pilot으로 전체 개선을 주장하지 않는다.

교환 경로의 정적 후속 가설은 C4의 구조 검증 중 추가 n회 Map.get과 중복 keyOf 호출을 key snapshot 증명으로 대체하는 것이다. 검사 자체를 없애거나 성능 이득을 확정한 제안이 아니다. snapshot 배열/쓰기/메모리 비용까지 다음 별도 후보에서 검증해야 한다. 기존 Map 삭제/LIS 미세 최적화의 반복과 구분한다.

최종 보존/검증: archive **1,553 entries / 44,227,718B**의 decoded hash를 모두 대조했다. 독립 감사는 주 비교288분포·9 C/B가중·180 peer비율/가중, 별도 pilot18분포를 확인했다. frozen 입력21개·runner343/peer258개 설치 package 해시, 보고서 JSON과 감사된 집계 일치, 포맷·로컬 링크/앵커·`git diff --check`를 확인했다. 최종 Markdown은 frozen 실행 입력과 별도로 관리한다.
