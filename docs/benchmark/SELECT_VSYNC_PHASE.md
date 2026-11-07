# select1k 프레임 대기 — 보존 trace 재분석

04_select1k의 공식 전체 시간에는 클릭 JS와 프레임 작업 외에 **다음 60Hz BeginFrame까지 기다리는 시간**이 들어간다. 그 대기는 runner가 클릭 직전에 강제하는 major GC 시간을 16.67ms로 나눈 나머지가 정한다. 그래서 select가 지나가지 않는 코드를 바꿔 번들이나 heap만 달라져도 select 전체 시간이 크게 움직인다. Lithent 앱은 select 외 8개 항목의 대기 중앙값이 모두 0.05ms 이하라 이 영향은 사실상 select에만 있다. 공식 점수 정의는 바꾸지 않는다. select를 판단할 때는 실제 main thread 작업(active)을 함께 본다.

새 측정 없이 기존 staging/archive의 공식 trace만 다시 읽었다. DC-28 bulk removal v2 수집도 같은 도구로 분석해 덧붙였다. 재현 도구는 [README](../../experiments/select-vsync-phase/README.md), 전체 수치는 [JSON](./select-vsync-phase.json)에 있다.

## 공식 구간과 대기가 생기는 과정

- 공식 CPU 값(webdriver-ts `computeResultsCPU`)은 click `EventDispatch` 시작부터, 마지막 logic event(click/FireAnimationFrame/TimerFire/Layout/FunctionCall) 뒤 첫 `Commit`이 끝날 때까지다. 그런 Commit이 없으면 마지막 Commit을 쓴다. 이 도구는 이 구간을 다시 계산하며, bulk-v2의 1,160개 trace에서 공식 값과 1e-6ms 이내로 일치했다.
- runner 순서: tracing 시작 → `wait(50)` → `window.gc({type:'major',execution:'sync',flavor:'last-resort'})` → `page.$` → IntersectionObserver 프레임 → 입력. Puppeteer 25.3 `elem.click()`은 move/down/up을 동시에 보내 하나의 input task에서 처리된다.
- headless=new Chrome의 Viz는 16.67ms 격자로 BeginFrame을 낸다. GC 시작은 이 격자의 약 12–13ms 위상에 고정된다(R 0.60–0.89, 행 component 앱은 약 16ms). GC 종료에서 클릭까지는 중앙값 14.1–16.8ms로 거의 일정하다. 따라서 클릭 위상은 대략 (GC 시작 위상 + GC 시간 + 그 간격) mod 16.67로 정해진다.
- 클릭이 tick 끝 무렵에 들어오면 화면 반영(Commit)이 다음 tick까지 밀리고, 그 사이 main thread는 쉬는 상태가 된다. **active**는 공식 구간 안 main thread의 모든 X 이벤트 합집합, **대기**는 전체 − active다. input task의 untraced 꼬리도 active로 세므로 active는 보수적(크게 잡힘)이다.
- Preact class의 강제 GC는 약 40–43ms, React는 약 19–23ms, Lithent A 앱은 약 45–54ms, 행 component 앱 C는 약 55ms다. 같은 클릭 JS라도 GC 길이에 따라 운 좋은 위상과 나쁜 위상이 갈린다.

## 세션별 select 분해

중앙값이며 ms 단위다. 위상은 측정 프레임 뒤 Viz tick 사슬로 추정한 값이다(휴리스틱, 원형 평균과 R). 전체/active/대기 중앙값은 각각 따로 구했으므로 서로 더해지지 않는다.

| 세션           | 앱             | 전체 ms | active ms | 대기 ms | 클릭 JS ms | 강제 GC ms | GC 시작 위상 ms (R) | 클릭 위상 ms |
| -------------- | -------------- | ------: | --------: | ------: | ---------: | ---------: | ------------------: | -----------: |
| dc25           | baseline       |   6.342 |     6.079 |    0.00 |       3.11 |       47.6 |        12.72 (0.84) |         8.28 |
| dc25           | candidate      |   6.518 |     5.716 |    0.00 |       2.71 |       48.0 |        13.05 (0.83) |         8.26 |
| dc25           | react-hooks    |   6.357 |     6.331 |    0.00 |       3.10 |       22.5 |        12.70 (0.82) |         1.69 |
| dc25           | react-classes  |   6.183 |     6.115 |    0.00 |       2.99 |       20.6 |        12.90 (0.87) |        16.31 |
| dc25           | preact-hooks   |  14.624 |    14.622 |    0.00 |      10.58 |       46.3 |         1.21 (0.81) |        12.20 |
| dc25           | preact-classes |   4.625 |     4.545 |    0.00 |       1.39 |       42.8 |        13.47 (0.79) |         3.37 |
| c4-owner       | baseline       |   6.915 |     6.161 |    0.00 |       3.16 |       47.1 |        12.71 (0.70) |         9.17 |
| c4-owner       | candidate      |   5.068 |     3.744 |    1.26 |       0.85 |       52.9 |        12.11 (0.77) |        13.36 |
| c4-owner       | preact-classes |   4.110 |     4.034 |    0.00 |       1.29 |       42.5 |        13.06 (0.83) |         2.77 |
| key-snapshot   | baseline       |   5.184 |     3.926 |    0.84 |       0.71 |       53.5 |        12.30 (0.82) |        14.59 |
| key-snapshot   | candidate      |   5.222 |     3.660 |    0.91 |       0.72 |       53.4 |        12.14 (0.84) |        13.15 |
| key-snapshot   | preact-classes |   4.249 |     4.191 |    0.00 |       1.31 |       42.2 |        12.75 (0.83) |         2.24 |
| static-dynamic | stock          |   6.422 |     6.185 |    0.00 |       3.16 |       46.9 |        12.86 (0.87) |         7.41 |
| static-dynamic | control        |   7.114 |     6.392 |    0.59 |       3.26 |       49.8 |        12.75 (0.89) |         9.98 |
| static-dynamic | candidate      |   6.716 |     6.587 |    0.00 |       3.46 |       47.9 |        13.30 (0.80) |        10.28 |
| dc22-core      | baseline       |   5.878 |     5.849 |    0.00 |       3.02 |       45.7 |        12.38 (0.60) |         6.03 |
| dc22-core      | event          |   6.007 |     5.963 |    0.00 |       2.96 |       45.5 |        13.25 (0.66) |         4.31 |
| dc22-core      | c2             |   5.917 |     5.577 |    0.00 |       2.61 |       45.7 |        11.95 (0.74) |         6.43 |
| dc22-core      | combined       |   5.904 |     5.678 |    0.00 |       2.80 |       45.8 |        12.42 (0.71) |         6.30 |
| dc22-final     | baseline       |   5.912 |     5.910 |    0.00 |       3.05 |       45.0 |        12.32 (0.73) |         4.32 |
| dc22-final     | event          |   5.814 |     5.800 |    0.00 |       3.03 |       44.6 |        12.21 (0.74) |         3.85 |
| dc22-final     | react-hooks    |   6.073 |     5.821 |    0.00 |       2.98 |       21.0 |        12.06 (0.74) |        15.09 |
| dc22-final     | react-classes  |   6.043 |     5.816 |    0.06 |       2.84 |       18.7 |        12.21 (0.81) |        13.53 |
| dc22-final     | preact-hooks   |  14.395 |    14.391 |    0.00 |      10.38 |       44.2 |         0.41 (0.77) |         8.24 |
| dc22-final     | preact-classes |   4.236 |     4.148 |    0.00 |       1.31 |       40.2 |        12.06 (0.72) |         0.10 |
| bulk-v2        | baseline       |   6.957 |     6.151 |    0.33 |       3.11 |       47.1 |        12.96 (0.85) |         7.91 |
| bulk-v2        | candidate      |   6.337 |     6.133 |    0.00 |       3.21 |       46.3 |        12.75 (0.89) |         7.15 |
| bulk-v2        | rows-baseline  |  10.289 |    10.152 |    0.00 |       6.44 |       55.3 |        15.61 (0.84) |         3.10 |
| bulk-v2        | rows-candidate |  10.263 |    10.201 |    0.00 |       6.42 |       54.9 |        15.95 (0.79) |         1.77 |

select 외 항목의 대기 중앙값은 Lithent 앱에서 모두 0.05ms 이하다. 예외는 peer의 06_remove-one-1k(React hooks/classes 1.08–1.99ms, dc22-final Preact class 0.50ms)다. 그래서 peer 대비 active 비율은 remove-one에서도 공식 비율과 조금 다르다.

## 과거 판단 재검토

가중치는 기존 [DC-25 가중 기하평균](./dc25-keyed-fast-path-final-results.json)과 같다. pooled는 합친 표본의 중앙값 비율이다. 음수가 빠른 쪽이다.

| 세션           | 비교                         | 가중 전체 pooled (main/reverse) | 가중 active pooled (main/reverse) | select 전체 | select active |
| -------------- | ---------------------------- | ------------------------------: | --------------------------------: | ----------: | ------------: |
| dc25           | candidate/baseline           |          -0.17% (+0.40%/-1.26%) |            -0.70% (-0.29%/-1.31%) |      +2.78% |        -5.96% |
| c4-owner       | candidate/baseline           |          -3.44% (-1.17%/-4.82%) |            -4.18% (-2.87%/-4.41%) |     -26.72% |       -39.24% |
| key-snapshot   | candidate/baseline           |          +1.78% (+1.62%/+1.24%) |            +1.41% (+1.24%/+0.94%) |      +0.74% |        -6.77% |
| static-dynamic | candidate/stock              |          -0.04% (+2.38%/-2.07%) |            -0.11% (+2.27%/-2.10%) |      +4.58% |        +6.49% |
| dc22-core      | event/baseline               |          +0.47% (-0.31%/+1.12%) |            +0.46% (-0.04%/+0.95%) |      +2.19% |        +1.95% |
| dc22-core      | c2/baseline                  |          +1.40% (-0.17%/+4.27%) |            +0.55% (-0.25%/+4.04%) |      +0.66% |        -4.66% |
| dc22-core      | combined/baseline            |          +0.47% (-0.23%/+1.04%) |            +0.32% (-0.17%/+0.94%) |      +0.44% |        -2.93% |
| dc22-final     | event/baseline               |          +0.44% (+0.96%/+0.11%) |            +0.38% (+0.89%/+0.00%) |      -1.66% |        -1.85% |
| bulk-v2        | candidate/baseline           |          -0.09% (-1.18%/-0.36%) |            +0.32% (-0.32%/-0.37%) |      -8.91% |        -0.28% |
| bulk-v2        | rows-candidate/rows-baseline |          -0.68% (-1.55%/+0.41%) |            -0.71% (-1.63%/+0.30%) |      -0.25% |        +0.48% |

peer 중 가장 빠른 값의 1.10배 이내 항목 수(R3)다. peer가 함께 수집된 세션만 있다.

| 세션         | 앱        | 1.10 이내 (전체) | select 비율 (전체) | 1.10 이내 (active) | select 비율 (active) |
| ------------ | --------- | ---------------: | -----------------: | -----------------: | -------------------: |
| dc25         | baseline  |              8/9 |              1.371 |                8/9 |                1.338 |
| dc25         | candidate |              8/9 |              1.409 |                8/9 |                1.258 |
| c4-owner     | baseline  |              6/9 |              1.683 |                6/9 |                1.527 |
| c4-owner     | candidate |              7/9 |              1.233 |                8/9 |                0.928 |
| key-snapshot | baseline  |              7/9 |              1.220 |                7/9 |                0.937 |
| key-snapshot | candidate |              7/9 |              1.229 |                8/9 |                0.874 |
| dc22-final   | baseline  |              6/9 |              1.396 |                6/9 |                1.425 |
| dc22-final   | event     |              6/9 |              1.373 |                7/9 |                1.398 |

- **2026-10-19 [bulk removal](./BULK_REMOVAL_RESULTS.md):** select 증가로 미채택했다(main 5.001→5.778ms, reverse 4.194→5.496ms). 기록된 클릭→프레임 간격 증가(2.165→3.218, 0.872→2.564, 0.767→1.366ms)가 전체 증가와 거의 같았다. 동일 번들 대조군 JS 0.717ms와 후보 0.721ms도 같았다. select는 삭제 경로를 지나가지 않으므로 이 기각 사유는 프레임 대기로 본다. 당시 trace는 `/tmp`에서 사라져 이 표에 없다. 현재 core로 다시 옮겨 측정한 결과가 [bulk removal v2](./BULK_REMOVAL_V2_RESULTS.md)이며, 같은 변경의 A 앱 select가 이번에는 전체 −8.91%, active −0.28%로 나왔다.
- **DC-25:** select 전체 +2.78%가 active로는 −5.96%다. 가중은 −0.17%(순서 방향 갈림)에서 −0.70%(양순서 개선)가 된다. 1.10 이내 항목은 여전히 8/9다. 기각 근거 중 select 손해는 약해지지만 가중 이득 자체는 작다.
- **C4 P2(owner)·P3(key snapshot):** P2의 select active 비율은 Preact class의 0.928배로, 공식 1.233배와 다르다. 다만 C4는 행 소유자 정보를 쓰는 opt-in 경로이고 BUG-3/handover/concurrent 계약이 남아 있다. 이 재해석으로 기본 경로 후보가 되지는 않는다. P3/P2는 active로도 +1.41%라 미채택이 그대로다.
- **DC-27 static-dynamic·DC-22 K/EK/E:** active로도 방향과 크기가 비슷해 기존 판단을 바꾸지 않는다.

## 한계

- 공식 점수를 대체하지 않는다. 기록 점수는 공식 전체 시간이며 active는 select 해석용 진단이다.
- active는 main thread 이벤트 합집합이라 input task의 untraced 꼬리를 포함한다. 대기는 작게, active는 크게 잡힌다.
- 위상 추정은 측정 프레임 뒤 Viz tick 사슬이 2개 이상일 때만 계산하며 휴리스틱이다. 전체/active/대기 값에는 쓰지 않는다.
- select를 GC/heap 크기 조정으로 맞추려 하지 않는다. 번들·heap 변화가 위상을 바꾸는 효과는 제품 사용자에게 의미가 없다.
- DC-22 trace는 `comprehensive-traces-*.tar.gz`의 실패 시도 제외 본을 풀어 읽었다. 다른 세션은 각 evidence archive와 같은 staging이다.
