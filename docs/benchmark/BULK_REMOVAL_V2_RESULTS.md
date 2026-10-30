# 대량 삭제 v2 — component/Fragment 행 목록의 한 번 삭제

**판단: 채택 권장(기본 경로, 새 API 없음). 사용자 요청으로 `perf/c4-key-snapshot`에 커밋했다. main 병합/release는 별도다.**

- **공식 A 앱:** 가중 전체 −0.09%(main −1.18/reverse −0.36), active +0.32%(main −0.32/reverse −0.37)로 중립이다.
- **행 component 앱 C:** 전체 삭제(09_clear1k_x8)가 전체 −7.84%(main −8.80/reverse −5.95), JS −10.40%, active −8.41%였다. 같은 Chrome 안에서 번갈아 잰 진단에서도 −4.98%였고, 40라운드 중 29번 더 빨랐다(p=0.006). C의 가중 전체는 −0.68%(main −1.55/reverse +0.41)다.
- **메모리와 크기:** 메모리 변화는 ±0.6% 이내다. base UMD Brotli는 4,819→4,817B(guard 4,824B), concurrent는 6,935→6,953B(guard 9,000B)다.
- **정합성:** HEAD는 외부 코드가 목록의 DOM 자식 하나를 다른 노드로 바꿔 둔 경우 그 외부 노드까지 지웠는데, 이번 변경으로 고쳐진다.
- **남는 비용:** 일반 element 행인 A 앱의 전체 삭제에서 약 +1%의 비용이 있을 수 있다. 가중 점수로는 약 0.1% 이하다.

## 배경

2026-10-19 [bulk removal](./BULK_REMOVAL_RESULTS.md)은 전체 삭제를 줄였지만 select 증가로 미채택했다. 그 select 증가는 [select 프레임 대기 분석](./SELECT_VSYNC_PHASE.md)에서 runner 강제 GC 시간이 정하는 BeginFrame 대기로 확인됐다. select는 삭제 경로를 지나가지 않는다. REQUIREMENTS의 "같은 실패안을 근거 없이 반복하지 않음"에 대해, 기각 근거가 측정 아티팩트였다는 새 근거로 현재 core에 다시 옮겨 측정했다. 이번에도 같은 변경의 A 앱 select가 전체 −8.91%(main −16.52/reverse −3.30), active −0.28%였다. 지난번과 반대 방향이고 active는 그대로다.

## 바꾼 것

`findChildWithRemoveElement`(base `src/render.ts`, concurrent `lithentConcurrent/src/render.ts`, 같은 변경)를 바꿨다.

- **HEAD:** 삭제할 항목이 모두 element/text이고 부모의 자식 **개수**가 같을 때만 `parent.textContent = ''`로 지웠다. 행이 component나 Fragment이면(nodeType 11) 이 경로를 못 타고, 행마다 `remove()`를 1,000번 했다. 개수만 비교했으므로, 외부 노드가 자식 하나를 대체한 경우에도 개수가 맞아 외부 노드까지 지웠다.
- **후보:** 삭제할 root를 Fragment/component 래퍼를 통과하며 순서대로 걸으면서, 각 DOM이 부모의 다음 자식과 **같은 노드**인지 비교한다. 처음 어긋나는 곳에서 멈추고, 끝까지 같고 뒤에 남는 자식이 없을 때만 한 번에 지운다. portal과 `<html>`은 기존 항목별 경로로 처리한다. 걷는 길이는 삭제 대상 root 수를 넘지 않으므로 긴 목록의 일부를 지울 때 나머지 형제를 걷지 않는다.
- unmount callback은 이전과 같이 DOM 제거 전에 실행된다(`inheritPropForRender` 'D', `typeDeleteUnused`의 `runUnmountQueueFromWDom`).
- **영향 범위:** 목록 전체 삭제만 바뀐다. remove-one이나 keyed 불일치 항목 삭제는 component 하나당 root가 1개라 `items.length > 1`에서 빠지고 HEAD와 같은 경로다. replace(02)의 옛 행도 keyed 항목별 삭제라 바뀌지 않는다.

## 측정 조건

- 기준 HEAD `a56bae1`. 네 앱 모두 Vite 5.4.8로 source core를 묶었다. A 앱 원본과 `cacheUpdate`는 C4 P2 staging, 앱 C는 [component cost 증거](./COMPONENT_COST_RESULTS.md)의 `row-memo-main.tsx`(보통 Lithent 코드, 행 하나당 `mount` component와 cache)다.

| 이름             | 앱                                        | core      | 번들 Brotli B |
| ---------------- | ----------------------------------------- | --------- | ------------: |
| `baseline`       | 공식 A 앱(일반 element 행, `cacheUpdate`) | HEAD      |         5,491 |
| `candidate`      | 같음                                      | 작업 트리 |         5,516 |
| `rows-baseline`  | 앱 C(행 component + cache)                | HEAD      |         5,488 |
| `rows-candidate` | 같음                                      | 작업 트리 |         5,503 |

- `baseline` 번들 SHA `95f96c9a…`는 기존 A 앱과 같지만 과거 timing을 합산하지 않는다. 이번 CPU 1,160(순서당 580: 앱당 select 25, 나머지 항목 15)과 공식 메모리 120을 main/reverse로 직렬 수집했다.
- Chrome 156.0.8078.74(binary와 framework hash 고정), Apple M4 Pro 12코어 24GB. 공식 gate(4앱 keyed/9동작/font)를 통과했다. 실패 batch와 warnings는 0이다.
- 수집 중 build/test/profile/다른 benchmark는 실행하지 않았다. 아래 진단(Chrome 삭제 기록, 교차 timing)은 수집 전후에 따로 실행했다.

| 순서/모드   | 시작 UTC                 | 종료 UTC                 | Chrome               | 표본 | 부하 시작→끝(1분) |
| ----------- | ------------------------ | ------------------------ | -------------------- | ---: | ----------------- |
| main/cpu    | 2026-10-30T08:20:16.442Z | 2026-10-30T08:35:19.594Z | Chrome/156.0.8078.74 |  580 | 3.23→1.30         |
| reverse/cpu | 2026-10-30T08:35:34.820Z | 2026-10-30T08:50:39.900Z | Chrome/156.0.8078.74 |  580 | 1.25→3.05         |
| main/mem    | 2026-10-30T08:50:55.567Z | 2026-10-30T09:03:57.709Z | Chrome/156.0.8078.74 |   60 | 3.10→2.28         |
| reverse/mem | 2026-10-30T09:04:03.860Z | 2026-10-30T09:17:16.571Z | Chrome/156.0.8078.74 |   60 | 2.26→4.09         |

## 가중 변화

각 항목 중앙값에 기존 가중 기하평균을 적용했다. active는 공식 구간 안 main thread 작업 합집합이다([정의](./SELECT_VSYNC_PHASE.md)). pooled는 합친 표본의 중앙값 비율이라 순서별 값 사이에 있지 않을 수 있다. 음수가 빠른 쪽이다.

| 비교                         | 순서    |   전체 | active |     JS |
| ---------------------------- | ------- | -----: | -----: | -----: |
| candidate/baseline           | main    | -1.18% | -0.32% | -0.14% |
| candidate/baseline           | reverse | -0.36% | -0.37% | +0.28% |
| candidate/baseline           | pooled  | -0.09% | +0.32% | +0.16% |
| rows-candidate/rows-baseline | main    | -1.55% | -1.63% | -0.84% |
| rows-candidate/rows-baseline | reverse | +0.41% | +0.30% | -0.67% |
| rows-candidate/rows-baseline | pooled  | -0.68% | -0.71% | -1.02% |

## 9항목 — 공식 A 앱(candidate/baseline)

| 항목                   | 기준 ms | 후보 ms |   전체 | active |     JS | main 전체 | reverse 전체 |
| ---------------------- | ------: | ------: | -----: | -----: | -----: | --------: | -----------: |
| 01_run1k               |  26.478 |  26.491 | +0.05% | +0.05% | +0.78% |    +1.06% |       -0.31% |
| 02_replace1k           |  27.570 |  27.806 | +0.86% | +0.86% | +1.05% |    +0.80% |       -0.31% |
| 03_update10th1k_x16    |  15.496 |  15.925 | +2.77% | +2.71% | -2.74% |    +3.76% |       -0.16% |
| 04_select1k            |   6.957 |   6.337 | -8.91% | -0.28% | +3.26% |   -16.52% |       -3.30% |
| 05_swap1k              |  16.286 |  15.985 | -1.85% | -1.73% | -2.22% |    -6.41% |       -1.55% |
| 06_remove-one-1k       |  11.896 |  11.627 | -2.26% | -2.25% | -0.27% |    -1.05% |       -4.75% |
| 07_create10k           | 268.670 | 269.946 | +0.47% | +0.48% | -0.09% |    -0.09% |       +0.58% |
| 08_create1k-after1k_x2 |  29.726 |  29.660 | -0.22% | -0.22% | +0.35% |    +0.25% |       +0.02% |
| 09_clear1k_x8          |  10.864 |  11.035 | +1.58% | +1.54% | +2.03% |    -7.60% |       +4.96% |

A 앱의 일반 element 행은 HEAD에서도 한 번에 지워졌다(Chrome 삭제 기록 1건). 후보는 개수 대신 정체성을 비교할 뿐이라 같은 작업량이다. 전체 삭제는 순서별로 −7.60%/+4.96%로 갈렸다.

## 9항목 — 행 component 앱 C(rows-candidate/rows-baseline)

| 항목                   | 기준 ms | 후보 ms |   전체 | active |      JS | main 전체 | reverse 전체 |
| ---------------------- | ------: | ------: | -----: | -----: | ------: | --------: | -----------: |
| 01_run1k               |  26.998 |  26.889 | -0.40% | -0.41% |  +0.18% |    -0.54% |       +0.06% |
| 02_replace1k           |  30.116 |  30.104 | -0.04% | -0.04% |  +0.43% |    -0.34% |       +0.50% |
| 03_update10th1k_x16    |  21.095 |  20.243 | -4.04% | -4.03% |  -2.80% |    -5.64% |       -1.27% |
| 04_select1k            |  10.289 |  10.263 | -0.25% | +0.48% |  -0.33% |    -0.18% |       +0.06% |
| 05_swap1k              |  22.370 |  22.533 | +0.73% | +0.73% |  +1.40% |    -3.93% |       +6.01% |
| 06_remove-one-1k       |  13.762 |  14.171 | +2.98% | +2.97% |  +0.25% |    +2.01% |       +3.23% |
| 07_create10k           | 281.423 | 283.908 | +0.88% | +0.88% |  +0.85% |    +0.70% |       +1.02% |
| 08_create1k-after1k_x2 |  32.855 |  33.543 | +2.09% | +2.10% |  +1.62% |    +0.62% |       +3.07% |
| 09_clear1k_x8          |  13.311 |  12.267 | -7.84% | -8.41% | -10.40% |    -8.80% |       -5.95% |

- 전체 삭제만 이번 변경이 지나가는 항목이다. 순서별 bootstrap 95% 구간(전체)은 main −8.80% [−15.91, +0.39], reverse −5.95% [−13.51, −0.88]이다. JS는 main −7.89% [−15.05, +0.41], reverse −12.00% [−18.28, −3.05]다. 후보 표본이 기준 표본보다 작을 확률은 0.72–0.78이다. 고정 seed 4,000회이며 [집계](./bulk-removal-v2-results.json)의 `ci`에 모든 항목이 있다.
- remove-one +2.98%는 JS가 +0.25%(main −0.24/reverse +2.86)로 거의 같고, 위 영향 범위상 코드 경로도 HEAD와 같다. create10k/append(07/08)는 삭제가 없다. 이 차이들은 이번 변경의 효과로 보지 않는다. 작업량이 같은 A 앱 전체 삭제도 reverse에서 +4.96% [+1.52, +16.15], main에서 −7.60% [−14.00, +2.65]가 나왔다. 이번 수집의 항목별 잡음은 순서에 따라 ±5–8%에 이른다.

## 전체 삭제 교차 진단

공식 점수가 아닌 진단이다(`clear-ab.mjs`). 공식 수집이 끝난 뒤 같은 Chrome 한 프로세스에서 실행했다. CPU 8배 throttle을 걸었다. 매 라운드 네 앱의 순서를 섞고, 앱마다 새 페이지를 열어 예열 2회 뒤 3회 측정한 중앙값을 쓴다. script는 클릭부터 redraw microtask가 끝날 때까지, layout은 그 뒤 강제 layout까지다.

| 비교                         |                 script |               후보가 빠른 라운드 | layout 포함 |               후보가 빠른 라운드 |
| ---------------------------- | ---------------------: | -------------------------------: | ----------: | -------------------------------: |
| candidate/baseline           | +0.97% (20.60→20.80ms) | 12/40, 느림 27, 동률 1 (p=0.024) |      +0.71% |          15/40, 느림 25 (p=0.15) |
| rows-candidate/rows-baseline | −4.98% (23.10→21.95ms) |         29/40, 느림 11 (p=0.006) |      −5.26% | 28/40, 느림 11, 동률 1 (p=0.009) |

- p는 동률을 뺀 라운드별 양측 부호 검정이다([집계](./bulk-removal-v2-results.json)의 `clearAB.*.signTest`). 처음 두 번은 앱마다 페이지 하나를 재사용했는데, A 앱이 60라운드 +1.74%(25/60 빠름), 150라운드 −8.81%(114/150 빠름, p<1e-10)로 서로 반대였다. 한 번의 실행 안에서는 매우 "유의"해도 페이지별 상태가 결과를 끌고 갈 수 있다는 뜻이라, 새 페이지 방식만 보고한다. 두 결과는 `clear-ab-60.json`, `clear-ab-150.json`으로 보존했다.
- 행 앱의 이득은 공식 수집과 교차 진단이 같은 방향이다. A 앱은 공식 수집에서 방향이 갈렸고, 교차 진단의 script만 약 +1%(8배 throttle에서 약 0.2ms)를 보였다. 실제로 있다면 공식 가중으로 약 0.1% 이하다.

## Chrome 삭제 기록

1,000행 생성 뒤 Clear에서 `#tbody` childList 기록을 센 결과다(`browser-check.mjs`). 네 앱 모두 1,000개 노드가 지워졌고 다시 만들 수 있었다.

| 앱             | 삭제 기록 수 | 지운 노드 |
| -------------- | -----------: | --------: |
| baseline       |            1 |     1,000 |
| candidate      |            1 |     1,000 |
| rows-baseline  |        1,000 |     1,000 |
| rows-candidate |            1 |     1,000 |

## 공식 메모리

단위는 공식 runner의 MB다.

| 항목                | baseline | candidate |   변화 | rows-baseline | rows-candidate |   변화 |
| ------------------- | -------: | --------: | -----: | ------------: | -------------: | -----: |
| 21_ready-memory     |   0.6309 |    0.6314 | +0.08% |        0.6328 |         0.6311 | -0.27% |
| 22_run-memory       |   3.5788 |    3.5752 | -0.10% |        4.2785 |         4.2826 | +0.10% |
| 23_update5-memory   |   3.6338 |    3.6296 | -0.12% |        4.3637 |         4.3612 | -0.06% |
| 25_run-clear-memory |   0.9087 |    0.9143 | +0.61% |        0.9435 |         0.9487 | +0.55% |
| 26_run-10k-memory   |  28.1668 |   28.1498 | -0.06% |       34.9391 |        34.9404 | +0.00% |

## 정합성과 크기

- 새 공유 테스트 `src/tests/core-bulkRemoval.test.tsx`(base·concurrent 6검사):

  - component 행 cleanup 뒤 한 번의 mutation과 오래된 renew 취소
  - 바깥 형제 보존과 keyed 삭제 callback 가시성
  - 외부 노드가 자식을 대체한 경우 외부 노드 보존
  - portal을 그리는 행에서 기존 경로로 떨어지며 target의 남 소유 내용 보존
  - 일반 element 목록의 한 번 삭제
  - portal 안 중첩 root를 지우되 호출자가 가진 host 보존

  HEAD에서는 첫 번째(한 번 삭제)와 세 번째(외부 노드)가 실패한다.

- `test:dual` 통과(base 457, concurrent 360, 부속 패키지 포함 1,166, 기존 skip 3), Playwright e2e 78 통과, `verify:concurrent` 통과다.
- base UMD Brotli 4,819→4,817B(guard 4,824B). concurrent 6,935→6,953B(guard 9,000B). 앱 번들은 A +25B, C +15B다.

## 판단과 한계

- **채택 권장.** 새 API 없이 보통의 component 행 목록에서 전체 삭제의 DOM 작업을 1,000건에서 1건으로 줄인다. 실측으로는 전체 삭제가 약 5–8% 빨라진다. 공식 A 앱은 중립이고, 기존 외부 노드 삭제 버그를 고치며, 크기는 guard 안이다.
- 이득은 목록이 부모 element의 유일한 내용일 때, 그리고 그 목록의 전체 삭제에서만 생긴다. 공식 A 앱은 이미 같은 경로를 탔으므로 R3(peer 1.10배) 결과는 바뀌지 않는다.
- A 앱 같은 일반 element 행의 전체 삭제는 약 +1% 비용이 있을 수 있다(교차 진단 script만 p=0.024, layout 포함 p=0.15). 이를 줄이려면 같은 검증과 공식 수집을 다시 해야 한다.
- 기존 portal BUG-3(일반 element 안 중첩 portal)은 이번 변경과 별개다. portal 행은 기존 경로로 떨어진다.
- concurrent는 같은 변경과 공유 테스트만 확인했다. concurrent 앱의 공식 timing은 측정하지 않았다.

[도구/명령](../../experiments/bulk-removal-v2/README.md), [집계](./bulk-removal-v2-results.json), [증거 archive](https://github.com/superlucky84/lithent/releases/download/benchmark-evidence/bulk-removal-v2-evidence.tar.gz)와 [manifest](./bulk-removal-v2-evidence-manifest.json). staging은 `/private/tmp/lithent-bulk-removal-v2-20261030`이다.
