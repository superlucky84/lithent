# js-framework-benchmark 등재 준비 — 중간 상태

2026-10-08 후속: 행별 `mount`를 없앤 벤치마크 앱과 `cacheUpdate` 의존 배열 길이 검사를 적용했다.
같은 코어로 전후 앱을 공식 러너에서 15/25회 비교했다. 가중 지표는 1.609 → 1.388(약 13.8% 감소),
같은 측정의 Preact는 1.529, React는 1.565다. 이 수치는 로컬 vanillajs 기준이며 공개 공식 점수가 아니다.
검증·원본 자료·재현 방법은 [PRODUCTION_RESULTS.md](./PRODUCTION_RESULTS.md)에 있다.
이번 머신은 Apple M4(10코어, 24GB)로 확인했다. 아래의 과거 측정값과 환경 표기는 당시 기록이다.
이어 반복 갱신에서 이전 VDOM이 회수되지 않는 문제도 발견해 base/concurrent의 부모 getter를
격리했다. WeakRef 회귀 테스트와 브라우저 52개, dual 테스트를 통과했다. 최종 가중 CPU 지표는
같은 추가 측정의 Preact 대비 0.911(약 8.9% 빠름), 코어 수정 전후 차이는 약 +0.6%였다.
100회 갱신 후 JS heap은 17.77 → 4.03MB, 최종 base 크기는 br 4,757 / 4,800B다.
2026-10-08 인계: 사용자가 이번 변경의 커밋·푸시와 ctxbin 업데이트를 요청했다.
최신 커밋과 내일의 작업 순서는 [HANDOFF.md](./HANDOFF.md)를 먼저 읽는다.

- 작성일: 2026-10-07
- 출처: [../adoption/README.md](../adoption/README.md) "성능 증거" 항목 ([../ideas/IDEAS.md](../ideas/IDEAS.md) §2.2)
- 상태: **코어 갱신 경로 개선까지 적용·검증 완료(§5.3). 로컬 기하평균 3.45 → 1.72. 등재(PR)는 하지 않음. 코어·테스트·벤치마크 앱 변경이 모두 커밋되지 않은 채 있다.**

후속 확인: 기존 코어·테스트 개선은 `7f14950`, 분석 문서는 `3989671`에 커밋됐다.
아래의 "미커밋" 표기는 당시 기록이다. 적용 후 추가 후보 분석은
[FOLLOWUP_ANALYSIS.md](./FOLLOWUP_ANALYSIS.md)에 있으며, 그 후보는 코어에 적용하지 않았다.

2026-10-07 추가: 버려지는 DOM의 리스너 해제를 코어에서 뺐다 (§5.4, `71e54c1`). §5.4의 "미커밋"도
당시 기록이다. 그 뒤 공식 러너로 다시 쟀다 (§4.4).

추가 진단: [CORE_ANALYSIS.md](./CORE_ANALYSIS.md) — 메타데이터 처리 A/B, 캐시 적중 후의 호출 횟수,
다중 루트 컴포넌트에 남은 O(n²) 삭제 경로를 확인했다. 그 후보 중 채택한 것과 버린 것은 §5.3에 있다.

## 1. 한 줄 요약

로컬에서 공식 러너로 재 보니 lithent는 vanillajs 대비 기하평균 **3.45**로 비교 대상 중 가장 느렸다.
세 단계로 고쳤다.

| 단계 | 내용 | 기하평균 |
|---|---|---|
| 1차 측정 | 기존 앱, 기존 코어 | 3.45 |
| 2차 측정 | 앱에 `cacheUpdate`, 코어의 O(n²) 제거 경로 1차 수정 | 2.00 |
| 3차 측정 | 코어 갱신 경로 개선 (§5.3) | **1.72** |
| 4차 측정 | 버려지는 DOM의 리스너 해제 제거 (§5.4). 비교 대상 버전이 3차와 다르다 (§4.4) | **1.75** (preact 1.74, react 1.91) |

3차에서 react(1.73)와 같고 preact(1.57)보다 뒤다. preact와의 차이는 거의 **전체 삭제** 한 시나리오에서
난다 (28.0ms 대 15.6ms). 코어 크기는 brotli 4,799 / 4,800B로 예산 안이다.

## 2. 위치

| 무엇 | 경로 |
|---|---|
| lithent 저장소 | `~/project/lithent` (`main`, 기준 커밋 `326a181`) |
| 벤치마크 저장소 | `~/project/js-framework-benchmark` |
| 벤치마크 앱 | `~/project/js-framework-benchmark/frameworks/keyed/lithent` |
| 러너 | `~/project/js-framework-benchmark/webdriver-ts` (`dist/`가 이미 빌드돼 있음) |
| 러너 결과(JSON) | `~/project/js-framework-benchmark/webdriver-ts/results/` — **git 추적 안 됨, 다시 돌리면 덮어씀** |
| 서버 | `~/project/js-framework-benchmark/server` (포트 8080) |
| 이 문서의 측정값 사본 | [results.json](./results.json) (세 번의 측정, 시나리오별 중앙값·표준편차·횟수) |
| 프로파일 스크립트 | [prof.mjs](./prof.mjs) |

벤치마크 저장소에 대해 알아둘 것:

- `origin`은 `https://github.com/superlucky84/testbench.git`이다. `krausest/js-framework-benchmark`의
  **fork가 아니라 복사본**(커밋 2개: `256ad1f first commit`, `b0ba4db middle commit`, 2025-12-01)이라
  여기서는 원본에 PR을 낼 수 없다.
- 벤치마크 앱은 2025-12-01에 만들어 둔 것이다. lithent를 npm이 아니라 **로컬 폴더**에서 가져온다
  (`vite.config.js`의 alias가 `~/project/lithent/dist/lithent.mjs`와 `helper/dist/lithentHelper.mjs`를
  가리킨다). 따라서 **앱을 빌드하기 전에 lithent를 먼저 빌드해야** 최신 코어로 측정된다.

## 3. 측정 방법

### 3.1 준비

```bash
# 1) lithent 빌드 (앱이 dist를 직접 읽는다)
cd ~/project/lithent && pnpm build          # 코어만 바꿨으면 pnpm build:core

# 2) 벤치마크 앱 빌드
cd ~/project/js-framework-benchmark/frameworks/keyed/lithent
node node_modules/vite/bin/vite.js build

# 3) 서버 시작 (포트 8080)
cd ~/project/js-framework-benchmark/server
node_modules/.bin/tsx index.ts
```

**이 머신에서는 `npm`이 실행되지 않는다** (`Volta error: Node is not available`). `node`와 `pnpm`은
된다. 그래서 `npm start`, `npm run rebuild-ci` 대신 위처럼 바이너리를 직접 부른다.
비교용 프레임워크는 각 폴더에서 `pnpm install --ignore-workspace && pnpm run build-prod`로 빌드했다
(이때 생기는 `pnpm-lock.yaml`은 측정 후 지웠다. `node_modules`와 `dist`는 git 무시 대상이라 남아 있다).

### 3.2 공식 러너

```bash
cd ~/project/js-framework-benchmark/webdriver-ts

# CPU 시나리오 9개
node dist/benchmarkRunner.js --headless \
  --framework keyed/lithent keyed/vanillajs keyed/preact-hooks \
  --benchmark 01_ 02_ 03_ 04_ 05_ 06_ 07_ 08_ 09_

# keyed 판정 검사
node dist/isKeyed.js --headless --framework keyed/lithent
```

- 프레임워크 3개 × 9개 시나리오에 10분 남짓, 7개 프레임워크는 약 25분 걸렸다.
- 측정 중에는 다른 CPU 작업을 하지 않는다.
- 결과는 `webdriver-ts/results/<framework>_<benchmark>.json`에 쓰인다.

### 3.3 프로파일 (원인 분석용)

[prof.mjs](./prof.mjs)는 lithent 저장소의 Playwright로 Chromium을 띄워, 4배 CPU 스로틀에서
시나리오별 CPU 프로파일을 떠 함수별 self time 상위를 출력한다. 함수 이름이 보이도록 **난독화하지
않은 빌드**를 쓴다.

```bash
# 프로파일용 빌드 (lithent 소스를 직접 묶음, minify 없음) → dist-prof/
cd ~/project/js-framework-benchmark/frameworks/keyed/lithent
node node_modules/vite/bin/vite.js build --config vite.prof.config.js

# 서버가 떠 있는 상태에서
cd ~/project/lithent
node docs/benchmark/prof.mjs dist-prof            # 전체
node docs/benchmark/prof.mjs dist-prof clear      # 한 시나리오 (select|update|swap|remove|clear|replace)
```

프로파일 숫자는 공식 러너의 숫자와 측정 방식이 달라 **직접 비교할 수 없다.** 전후 비교와 병목
위치 확인에만 쓴다.

### 3.4 측정 조건

- Apple M4 Pro, macOS, headless Chrome, 시나리오당 15회(행 선택은 25회).
- 러너가 쓴 Chrome 빌드는 기록하지 않았다 (시스템에는 Chrome 154.0.8037.98이 설치돼 있다).
- 메모리·시작 시간·번들 크기 항목은 재지 않았다.
- 비교 대상의 실제 설치 버전: preact 10.29.8, react 19.3.0, solid 1.9.16, svelte 5.57.2,
  vue 3.6.0-rc.10. 결과 파일 이름에는 `package-lock.json` 기준의 다른 버전이 찍힌다
  (`pnpm`으로 설치해 lock을 따르지 않았기 때문).

## 4. 결과

총 소요 시간 중앙값(ms). 괄호 없는 "배수"는 같은 측정의 vanillajs 대비.

### 4.1 1차 측정 — 기존 앱, 코어 `01a7ee2` 빌드

| 시나리오 | vanillajs | solid | svelte | vue | preact | react | lithent | lithent 배수 |
|---|---|---|---|---|---|---|---|---|
| 01 1,000행 생성 | 21.7 | 22.4 | 21.4 | 25.4 | 26.0 | 24.9 | 29.6 | 1.36 |
| 02 1,000행 교체 | 22.5 | 25.0 | 25.9 | 28.3 | 30.2 | 31.4 | 45.7 | 2.03 |
| 03 10행마다 갱신 | 11.6 | 11.5 | 13.9 | 14.7 | 21.4 | 15.4 | 59.5 | 5.13 |
| 04 행 선택 | 3.2 | 7.7 | 6.6 | 4.3 | 12.7 | 5.3 | 50.7 | 15.84 |
| 05 행 교환 | 12.6 | 14.2 | 14.7 | 15.3 | 24.2 | 93.2 | 62.4 | 4.95 |
| 06 행 1개 삭제 | 11.3 | 12.1 | 12.3 | 13.8 | 14.9 | 13.8 | 31.3 | 2.77 |
| 07 10,000행 생성 | 218.8 | 235.9 | 239.2 | 270.6 | 287.4 | 437.6 | 308.9 | 1.41 |
| 08 1,000행 추가 | 25.8 | 25.9 | 26.8 | 30.2 | 31.8 | 30.5 | 46.1 | 1.79 |
| 09 전체 삭제 | 9.7 | 12.2 | 13.1 | 15.2 | 13.8 | 17.3 | 85.3 | 8.79 |
| **기하평균** | 1.00 | 1.18 | 1.21 | 1.27 | 1.60 | 1.72 | **3.45** | |

### 4.2 2차 측정 — `cacheUpdate` 앱 + 코어 제거 경로 수정

lithent·vanillajs·preact만 다시 돌렸다.

| 시나리오 | vanillajs | preact | lithent 1차 | lithent 2차 | 2차 스크립트 | 2차 배수 |
|---|---|---|---|---|---|---|
| 01 1,000행 생성 | 21.6 | 26.3 | 29.6 | 29.8 | 10.7 | 1.38 |
| 02 1,000행 교체 | 22.5 | 29.8 | 45.7 | 36.4 | 15.7 | 1.62 |
| 03 10행마다 갱신 | 13.8 | 23.0 | 59.5 | 28.9 | 16.0 | 2.09 |
| 04 행 선택 | 2.8 | 12.0 | 50.7 | 15.6 | 11.0 | 5.57 |
| 05 행 교환 | 14.9 | 23.1 | 62.4 | 29.7 | 13.6 | 1.99 |
| 06 행 1개 삭제 | 11.2 | 16.0 | 31.3 | 18.4 | 6.2 | 1.64 |
| 07 10,000행 생성 | 222.3 | 288.6 | 308.9 | 317.6 | 91.5 | 1.43 |
| 08 1,000행 추가 | 25.1 | 32.6 | 46.1 | 38.5 | 14.4 | 1.53 |
| 09 전체 삭제 | 8.9 | 13.3 | 85.3 | 24.5 | 21.6 | 2.75 |
| **기하평균** | 1.00 | 1.59 | 3.45 | **2.00** | | |

- preact의 기하평균이 1차 1.60, 2차 1.59로 같아서 두 측정의 환경은 안정적이었다.
- solid·svelte·vue·react는 2차에 다시 재지 않았다. lithent 2.00과의 비교는 1차 수치 기준이다.

### 4.3 3차 측정 — 코어 갱신 경로 개선 후

7개 프레임워크를 모두 다시 돌렸다. 앱은 2차와 같다.

| 시나리오 | vanillajs | solid | svelte | vue | preact | react | lithent | lithent 스크립트 | 배수 | preact 대비 |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 1,000행 생성 | 21.4 | 22.5 | 22.0 | 25.6 | 25.9 | 25.6 | 29.5 | 10.3 | 1.38 | 1.14 |
| 02 1,000행 교체 | 22.5 | 24.5 | 25.9 | 28.4 | 29.9 | 30.9 | 33.4 | 13.2 | 1.48 | 1.12 |
| 03 10행마다 갱신 | 11.0 | 11.3 | 12.9 | 15.0 | 21.6 | 15.7 | 22.9 | 10.3 | 2.08 | 1.06 |
| 04 행 선택 | 2.9 | 5.1 | 6.2 | 4.5 | 12.7 | 5.0 | 10.5 | 7.0 | 3.62 | 0.83 |
| 05 행 교환 | 13.9 | 13.8 | 14.4 | 14.7 | 22.5 | 92.1 | 22.1 | 8.0 | 1.59 | 0.98 |
| 06 행 1개 삭제 | 14.4 | 12.3 | 11.4 | 12.8 | 14.6 | 13.6 | 14.1 | 3.5 | 0.98 | 0.97 |
| 07 10,000행 생성 | 224.2 | 239.1 | 239.4 | 269.1 | 287.0 | 434.6 | 302.5 | 84.9 | 1.35 | 1.05 |
| 08 1,000행 추가 | 26.7 | 28.9 | 28.4 | 31.5 | 32.1 | 34.6 | 37.0 | 13.4 | 1.39 | 1.15 |
| 09 전체 삭제 | 9.5 | 12.8 | 13.0 | 15.0 | 15.6 | 20.3 | 28.0 | 25.2 | 2.95 | 1.79 |
| **기하평균** | 1.00 | 1.12 | 1.16 | 1.24 | 1.57 | 1.73 | **1.72** | | | |

읽을 때 주의할 점:

- **이번 측정은 머신 부하가 높았다** (load average 4.5~7.5, 1·2차는 2~3). vanillajs의 06번이 14.4ms로
  1·2차(11.3, 11.2)보다 느리게 나왔고, 그래서 lithent의 06번 배수 0.98은 실제보다 좋게 보인다.
- 세 측정의 vanillajs 중앙값을 기준으로 다시 계산하면 lithent **1.76**, react 1.77, preact 1.61,
  vue 1.27, svelte 1.19, solid 1.15다. 순위와 결론은 같다.
- 전체 삭제는 이번 측정에서 모든 프레임워크가 약 15% 느리게 나왔다 (preact 13.3 → 15.6,
  react 17.3 → 20.3, lithent 24.5 → 28.0). lithent의 전체 삭제가 2차보다 나빠진 것이 아니다.
- 10,000행 생성의 lithent 표준편차는 12.5ms로 다른 시나리오(0.3~2.9ms)보다 크다.
- 02·09번의 lithent·preact 결과 파일은 이후 실험으로 덮어써져 최종 코드로 다시 쟀다
  (lithent 02 34.8, 09 26.6). 표는 전체 측정 때의 값이다.

### 4.4 4차 측정 — 리스너 해제 제거 후 (`71e54c1`)

벤치마크 저장소의 의존성을 다시 설치하고 7개 프레임워크를 모두 돌렸다. 앱은 2차와 같다.

**3차와 조건이 다르다.** 이번에는 `npm ci`로 설치해 비교 대상이 lock 파일 버전이다 (preact 10.27.1,
react 19.2.0, solid 1.9.3, svelte 5.42.1, vue 3.6.0-alpha.2). 3차는 더 최신 버전이었다 (§3.4).
lithent 앱만 `npm ci`가 실패해 (`file:` 의존성의 lock 항목 누락) `pnpm install --ignore-workspace`로
설치했다. 시스템 Chrome은 154.0.8037.98이다. 측정 시작 때 load average가 5.7이었고 (다른 프로세스,
8분을 기다려도 내려가지 않았다) 끝날 때 3.2였다. lithent를 가장 먼저 쟀다.

| 시나리오 | vanillajs | solid | svelte | vue | preact | react | lithent | lithent 스크립트 | 배수 | preact 대비 |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 1,000행 생성 | 19.5 | 20.4 | 20.8 | 23.6 | 24.3 | 24.1 | 28.1 | 9.9 | 1.44 | 1.16 |
| 02 1,000행 교체 | 21.0 | 23.4 | 24.2 | 26.4 | 33.2 | 29.5 | 32.0 | 12.2 | 1.52 | 0.96 |
| 03 10행마다 갱신 | 10.5 | 11.3 | 11.6 | 13.7 | 20.9 | 14.8 | 21.0 | 9.8 | 2.00 | 1.00 |
| 04 행 선택 | 2.9 | 6.7 | 5.2 | 3.8 | 13.1 | 7.8 | 9.7 | 6.6 | 3.34 | 0.74 |
| 05 행 교환 | 11.7 | 13.6 | 13.9 | 14.3 | 24.1 | 89.9 | 21.2 | 8.0 | 1.81 | 0.88 |
| 06 행 1개 삭제 | 10.2 | 14.1 | 13.1 | 12.8 | 15.3 | 14.2 | 14.0 | 3.5 | 1.37 | 0.92 |
| 07 10,000행 생성 | 210.7 | 227.1 | 230.7 | 259.1 | 278.8 | 394.1 | 289.3 | 83.8 | 1.37 | 1.04 |
| 08 1,000행 추가 | 22.6 | 24.1 | 24.6 | 27.3 | 31.5 | 28.9 | 34.1 | 11.7 | 1.51 | 1.08 |
| 09 전체 삭제 | 8.8 | 10.5 | 10.9 | 12.1 | 12.7 | 17.3 | 18.2 | 16.3 | 2.07 | 1.43 |
| **기하평균** | 1.00 | 1.23 | 1.21 | 1.26 | 1.74 | 1.91 | **1.75** | | | |

- **전체 삭제**: lithent 28.0 → 18.2ms (스크립트 25.2 → 16.3). preact 대비 1.79 → 1.43배. 같은 측정에서
  preact도 15.6 → 12.7로 빨라졌으므로(부하·버전 차이) lithent의 개선분 전부가 §5.4 때문은 아니다.
- **preact 대비 기하평균**: 3차 1.10 → 4차 **1.01**. 9개 중 5개에서 lithent가 같거나 빠르다.
- vanillajs 대비 기하평균이 1.72 → 1.75로 오른 것은 vanillajs가 이번에 더 빨리 나와서다
  (06번 14.4 → 10.2ms). 3차는 부하가 높아 vanillajs가 느리게 나왔다 (§4.3). 측정 간 절대 배수는
  비교하지 말고 같은 측정 안의 순위를 본다.
- lithent의 표준편차는 0.3~2.1ms다. vanillajs의 03번(6.2ms)과 09번(1.6ms)은 편차가 컸다.
- 공식 결과표는 가중 기하평균을 쓴다. 여기 수치는 가중하지 않았다.

**메모리** (MB, 각 1회 측정, `21_ 22_ 23_ 25_ 26_`):

| 시나리오 | vanillajs | preact | react | lithent |
|---|---|---|---|---|
| 21 로드 직후 | 0.55 | 0.61 | 1.16 | 0.56 |
| 22 1,000행 생성 후 | 1.88 | 3.21 | 4.42 | 4.27 |
| 23 5회 갱신 후 | 1.87 | 3.33 | 4.84 | 5.50 |
| 25 생성·삭제 5회 후 | 0.54 | 0.78 | 1.98 | 0.90 |
| 26 10,000행 생성 후 | 12.90 | 26.24 | 30.71 | 35.07 |

- 25번이 로드 직후 수준(0.56 → 0.90)으로 돌아온다. 리스너를 떼지 않아도 버려진 행이 수거된다.
- 행을 들고 있는 동안의 메모리는 preact보다 30% 남짓 많고 react와 비슷하거나 많다.
- 시작 시간(`30_`)과 크기(`40_`)는 재지 않았다.

### 4.5 2025-12-01의 옛 결과

벤치마크 저장소에 남아 있던 lithent 결과(1,000행 생성 중앙값 2,645ms, 표준편차 718ms)는 편차가
너무 커서 신뢰할 수 없다. 당시 측정 자체가 비정상이었던 것으로 보인다. [results.json](./results.json)에
사본만 남겼다.

## 5. 원인과 수정

### 5.1 코어: 제거 경로가 O(n²) — 수정함, 미커밋

`src/render.ts`의 `findChildWithRemoveElement`는 "부모가 이 자식들만 가지고 있으면 한 번에 비우는"
빠른 경로를 판단하려고 **호출될 때마다 부모의 자식 노드를 전부 셌다.** 목록의 각 항목이
컴포넌트이면 항목마다(Fragment이므로) 이 함수가 한 번씩 불린다. 1,000행을 지우면 약 50만 번
노드를 순회한다. 프로파일에서 전체 삭제의 73%, 1,000행 교체의 51%가 이 함수였다.

수정: 개수 세기를 `items.length > 1`이고 모든 항목이 단순 엘리먼트일 때만 하도록 조건 뒤로 옮겼다.
동작은 같고 불필요한 순회만 없앤다.

추가 확인: 이 수정으로 단일 DOM을 반환하는 행의 O(n²)는 사라지지만, 여러 형제 DOM을 반환하는
컴포넌트는 여전히 조건을 통과한다. 1,000개 컴포넌트가 각각 두 DOM 형제를 반환하는 경우,
전체 삭제에서 부모의 형제 노드를 1,001,000회 순회했다. 상세는 추가 진단 문서 §2.4를 참고한다.

| 프로파일 (4배 스로틀) | 수정 전 | 수정 후 |
|---|---|---|
| 전체 삭제 | 76.7ms | 15.9ms |
| 1,000행 교체 | 103.7ms | 43.9ms |

- 이 수정은 §5.3의 1번으로 이어진다 (다중 루트 컴포넌트까지 선형화, concurrent 코어 적용, 검증과 크기는 §5.3).
- 벤치마크와 무관하게, 컴포넌트로 된 긴 목록을 지우는 모든 앱에 영향이 있는 문제다.

### 5.2 벤치마크 앱: 행 메모이제이션 누락 — 수정함, 미커밋

lithent 코어는 부모가 다시 그려지면 자식 컴포넌트를 **무조건 다시 실행한다** (`src/diff.ts`의
`runUpdate`는 props가 같아도 `reRender()`를 부른다). 기존 앱은 렌더마다 모든 행에 `onSelect`,
`onRemove` 클로저를 새로 만들어 넘겼고, 그래서 행 하나를 선택해도 1,000행의 가상 DOM을 전부 다시
만들고 props를 전부 다시 맞췄다. 갱신·선택·교환·삭제가 모두 스크립트 45ms 안팎으로 같았던 이유다.

로컬 react 구현은 행에 `memo`를 쓴다. 로컬 preact-hooks 구현은 `map`에서 직접 `tr`를 생성하며
행에 `memo`를 쓰지 않는다. lithent의 문서화된 헬퍼 `cacheUpdate`(`lithent/helper`)는 의존 값이
같으면 이전 가상 DOM 객체를 그대로 돌려주고, diff는 같은 객체를 보면 그 서브트리를 건너뛴다.
다만 컴포넌트 props 동기화와 래퍼 생성은 그 전에 수행되므로 React memo와 생략 범위는 다르다.

앱 수정 (`frameworks/keyed/lithent/src/main.tsx`):

- 행 핸들러를 mounter에서 한 번만 만든다 (`props`는 제자리에서 갱신되므로 `props.row.id`는 항상 최신).
- 행의 updater를 `cacheUpdate(() => [props.row, props.selected], ...)`로 감쌌다.
- `vite.config.js`에 `lithent/helper` alias를 추가했다.

| 프로파일 (4배 스로틀) | 수정 전 | 수정 후 |
|---|---|---|
| 행 선택 | 31.6ms | 7.9ms |
| 10행마다 갱신 | 30.7ms | 9.9ms |
| 행 교환 | 31.3ms | 7.7ms |
| 행 1개 삭제 | 31.7ms | 7.6ms |

- 검증: `isKeyed` 통과 ("keyed for 'run benchmark', 'remove row benchmark', 'swap rows benchmark'").

### 5.3 코어: 갱신 경로 개선 — 수정함, 미커밋

[CORE_ANALYSIS.md](./CORE_ANALYSIS.md)의 후보를 하나씩 적용하고 측정해서 고른 것이다.

**채택**

| # | 변경 | 파일 |
|---|---|---|
| 1 | 형제 노드 세기를 "후보 수 + 1"에서 멈춤. 두 형제를 반환하는 컴포넌트 목록의 삭제도 선형이 됨 | `src/render.ts` |
| 2 | `op`·`oi`·`nr`·`oc`·`el`·`children`을 `delete` 대신 `undefined` 대입 | `src/render.ts`, `src/diff.ts` |
| 3 | `updateProps`가 이전 props 객체를 수정하지 않음 (지우면서 순회하던 것을 `in` 검사로 바꿈) | `src/render.ts` |
| 4 | 컴포넌트 props 동기화에서 전체 삭제 후 복사 대신 사라진 키만 삭제 | `src/diff.ts` |
| 5 | 렌더마다 만들던 redraw 클로저를 컴포넌트당 한 번만 묶음 (`bindRedraw`). 메타 정보는 임시 객체 없이 직접 대입 | `src/wDom.ts`, `src/utils/redraw.ts` |

- 3번은 **버그 수정이기도 하다.** 같은 props 객체를 여러 렌더에 넘기면 기존 코드는 그 객체의 키를
  지워 버렸다. 새 테스트 2개가 기존 코드에서 실패하는 것을 확인했다.
- 5번은 "`renew()`가 불린 시점의 노드를 다시 그린다. 그 사이 부모가 그 노드를 이미 다시 그렸으면
  건너뛴다"는 기존 동작을 유지한다. 테스트로 고정했다.

진단 측정 (`audit.mjs measure base`, 4배 스로틀, 두 라운드의 중앙값 ms):

| 시나리오 | 적용 전 | 1~3 적용 | 1~5 적용 |
|---|---|---|---|
| 행 선택 | 6.4 / 5.4 | 5.4 / 4.7 | 3.7 / 3.5 |
| 10행마다 갱신 | 8.4 / 8.3 | 6.6 / 6.3 | 5.5 / 5.4 |
| 행 교환 | 5.6 / 6.3 | 5.1 / 4.9 | 4.1 / 4.6 |
| 행 1개 삭제 | 6.2 / 5.5 | 4.8 / 5.2 | 3.6 / 3.8 |
| 전체 삭제 | 9.3 / 8.4 | 8.6 / 9.2 | 8.8 / 8.8 |
| 1,000행 교체 | 34.3 / 30.5 | 31.5 / 30.6 | 27.5 / 27.3 |
| 1,000행 생성 | 16.9 / 17.0 | 15.6 / 16.1 | 15.9 / 15.2 |
| 10,000행 생성 | 182.8 / 185.7 | 177.3 / 178.4 | 170.4 / 183.6 |

**해 보고 버린 것**

| 후보 | 결과 |
|---|---|
| 삭제를 뒤에서부터 (위치 선택자 무효화 회피 가설) | 스타일시트가 있는 실제 페이지에서 효과 없음. 되돌림 |
| 컴포넌트 목록 일괄 삭제 (`textContent = ''`) | 공식 러너에서 전체 삭제 27.0 → 25.2ms(약 7%). 약 100B가 들어 예산을 넘는다. 채택 안 함 |
| 순서가 그대로일 때 LIS 생략 | 분석 문서의 실험에서 효과가 작고 엇갈림. 시도하지 않음 |

**concurrent 코어**: 1~4번을 `lithentConcurrent/src`의 `render.ts`·`diff.ts`에 같이 적용했다.
5번은 적용하지 않았다. concurrent는 redraw 등록을 커밋 시점으로 미루는 구조(`publish`)라 그대로
옮길 수 없다. `setRedrawAction`은 concurrent가 쓰므로 그대로 두었다.

**검증** (최종 코드 기준)

- `pnpm test`, `pnpm test:dual`(두 코어 × 위성 패키지), `pnpm verify:concurrent`, `pnpm test:e2e` 50개 통과.
- 크기: base **4,799 / 4,800B**, concurrent 6,287 / 9,000B, element 998 / 1,000B.
- 회귀 테스트 8개 추가: `src/tests/core-updatePaths.test.tsx`. 이 파일은 concurrent 코어에서도 돈다.
- 벤치마크 `isKeyed` 통과.

**이 작업에서 드러난 기존 차이**: 부모와 자식의 `renew()`를 같은 틱에 부르면 base는 자식을 한 번만
다시 그리고, concurrent는 한 번 더 그린다. 이번 변경 전의 concurrent에서도 같다. 테스트에는 코어별
기대값으로 적어 두었다.

### 5.4 코어: 버려지는 DOM의 리스너 해제 제거 — 수정함, 미커밋

**결정**: 제거되는 노드의 리스너를 하나씩 떼지 않는다. unmount 콜백 실행과 DOM 제거는 그대로다.
리스너 해제는 2023년에 메모리 누수를 막으려는 의도로 넣은 것이고(당시 IE 대응), 지금 브라우저에서는
노드가 버려지면 리스너도 함께 수거된다. 성능을 우선해 뺐다.

**바꾼 것** (base와 concurrent 모두):

- `recursiveRemoveEvent`와 `removeEvent`를 삭제했다. 호출부는 `render()`의 destroy 함수,
  `typeDeleteUnused`, `typeDelete`, `inheritPropForRender`(삭제·교체 `D`/`R`/`S`)였다.
- 남아 있는 노드의 핸들러 교체는 그대로 `updateEvent`가 옛 핸들러를 떼고 새 핸들러를 붙인다.

**달라지는 동작**:

1. 제거된 노드를 `ref` 등으로 쥐고 있다가 이벤트를 보내면 핸들러가 호출된다 (테스트로 고정).
2. 핸들러가 자기 조상을 지우면, 이미 시작된 버블링이 지워진 조상의 핸들러까지 간다. preact와 같다.
   코드에서 추론한 것이고 브라우저 테스트로 확인하지 않았다.
3. 분리된 `<img>`·`<video>` 등의 뒤늦은 `load`·`ended` 이벤트가 핸들러를 부른다. 그 안에서
   `renew()`를 불러도 은퇴 표시(`il`) 때문에 다시 그려지지 않는다.
4. `h('portal', { portal: el, onClick })`처럼 portal 노드에 직접 건 리스너는 portal이 사라져도
   사용자의 `el`에 남는다. `el`은 버려지지 않는 유일한 대상이다. 공개 API `portal(wDom, el)`은
   리스너 props를 넘기지 않으므로 해당하지 않는다.

중복 바인딩은 생기지 않는다. `D`/`R`/`S`는 항상 새 DOM을 만들고, 옛 DOM은 다시 쓰지 않는다.

**크기** (br): base 4,799 → 4,747B, concurrent 6,287 → 6,228B. 아래의 핸들러 prop 수정(+7B)까지
넣으면 base **4,754B** (여유 46B), concurrent 6,235B다.

**측정** (`followup-audit.mjs`, 새 변형 `detach`가 옛 해제 코드를 되살린 기준이다. 진단 수치이며
공식 러너 수치와 비교할 수 없다. Chromium 153.0.8010.12, load average 약 3):

| 시나리오     | 방식                            | 해제 있음 (`detach`) | 해제 없음 (현재) |
| ------------ | ------------------------------- | -------------------: | ---------------: |
| 전체 삭제    | `cold`, 새 페이지 12개의 중앙값 |                9.6ms |  8.2ms (약 -15%) |
| 전체 삭제    | `measure`, 2라운드              |         10.2 / 9.9ms |      8.5 / 8.1ms |
| 1,000행 교체 | `measure`, 2라운드              |        31.3 / 28.8ms |    26.2 / 27.6ms |
| 행 1개 삭제  | `measure`, 2라운드              |          3.6 / 3.6ms |      3.5 / 3.5ms |
| 교환         | `measure`, 2라운드              |          4.2 / 4.0ms |      3.9 / 3.9ms |
| 선택         | `measure`, 2라운드              |          3.4 / 3.4ms |      3.4 / 3.4ms |

`cold`의 12개 라운드 모두에서 현재 쪽이 빨랐다.

**검증**: `pnpm test`, `pnpm test:dual`, `pnpm verify:concurrent`, `pnpm test:e2e` 50/50 통과.
새 테스트 `src/tests/core-discardedListeners.test.tsx` 8개가 양쪽 코어에서 통과한다 (unmount 콜백,
버려진 노드의 리스너, 핸들러 교체와 제거, 반복 갱신·교체·키 재정렬·portal 토글 뒤 핸들러 1회 호출).
검증은 아래 핸들러 prop 수정까지 넣은 상태에서 다시 돌렸다.

**이 작업에서 드러난 기존 버그 — 수정함, 미커밋**: 남아 있는 노드에서 `onClick` 같은 핸들러 prop이
아예 빠지면 리스너가 떼어지지 않았다. `updateProps`의 "사라진 props" 루프가 `removeAttribute`만
불렀다. 이번 변경 전에도, `7f14950` 전에도 같았다. 이제 그 루프가 `on*` 키를 `updateEvent`로 넘겨
옛 핸들러를 뗀다 (base와 concurrent 모두). 측정 표는 이 수정 전의 값이다.

**당시 하지 않은 것** (이후 §4.4에서 함): 공식 러너 재측정. 벤치마크 저장소의 `node_modules`와 빌드 산출물(`dist`,
`webdriver-ts/dist`)이 지워져 있어 §3.1의 설치부터 다시 해야 한다.
`css/bootstrap/dist/css/bootstrap.min.css`만 upstream에서 받아 복구했다 (진단 도구가 읽는다).

## 6. 남은 병목 (고치지 않음)

1. **전체 삭제.** preact와의 차이가 남은 유일한 큰 항목이다 (3차 28.0ms 대 15.6ms, 스크립트 25.2 대 12.5).
   - DOM 제거 자체는 preact와 같은 비용이다. 같은 프로파일 스크립트로 재면 `remove()`/`removeChild()`
     1,000회가 양쪽 모두 약 8.6ms다.
   - lithent가 더 하는 일은 행마다 도는 unmount 순회와 이벤트 리스너 해제 순회다.
   - 리스너 해제를 건너뛰는 실험에서 전체 삭제가 27.0 → 22.1ms(약 18%)가 됐다. **동작이 바뀌는
     변경**(버려지는 DOM에 리스너가 남는다)이라 당시에는 채택하지 않았다. preact는 unmount 때 리스너를
     떼지 않는다. **이후 채택했다 (§5.4).** 남은 것은 행마다 도는 unmount 순회다.
   - 공식 러너는 페이지를 새로 띄워 6번째 삭제를 잰다. JIT가 덜 데워진 상태라 실행하는 JS의 양이
     그대로 드러난다. 반복 측정하는 `prof.mjs`·`audit.mjs`에서는 이 차이가 작게 보인다 (약 14ms 대 12ms).
2. **생성 경로.** 1,000행 생성·추가가 preact 대비 1.14~1.15배다. diff 단계가 새 트리를 한 번 더 순회하고
   (`remakeNewWDom`), 노드마다 속성을 나중에 붙인다. 이번에 손대지 않았다.
3. **바뀌지 않은 행의 고정 비용.** 많이 줄었지만 구조는 그대로다. 컴포넌트를 입구에서 건너뛰는 방식은
   props 참조 안정성·slots·생명주기 의미를 함께 설계해야 해서 하지 않았다.

## 7. 지금 남아 있는 미커밋 변경

**`~/project/lithent`**

| 파일 | 내용 |
|---|---|
| `src/render.ts`, `src/diff.ts`, `src/wDom.ts`, `src/utils/redraw.ts` | §5.1, §5.3 |
| `lithentConcurrent/src/render.ts`, `lithentConcurrent/src/diff.ts` | §5.3의 1~4번 |
| `src/tests/core-updatePaths.test.tsx` (새 파일) | 회귀 테스트 8개 |
| `docs/benchmark/` (새 폴더) | 이 문서, `CORE_ANALYSIS.md`, `results.json`, `audit-results.json`, `prof.mjs`, `audit.mjs` |
| `docs/adoption/README.md` | 성능 증거 항목에 이 문서 링크 |
| `dist/` 등 빌드 산출물 (git 무시) | 최종 코드로 `pnpm build`한 상태 |

**`~/project/js-framework-benchmark`**

| 파일 | 내용 |
|---|---|
| `frameworks/keyed/lithent/src/main.tsx` | §5.2 수정 |
| `frameworks/keyed/lithent/vite.config.js` | `lithent/helper` alias 추가 |
| `frameworks/keyed/lithent/vite.prof.config.js` (새 파일) | 프로파일용 빌드 설정 |
| `frameworks/keyed/lithent/dist-prof/` (새 폴더) | 프로파일용 빌드 산출물. 지워도 된다 |
| `frameworks/keyed/{preact-hooks,react-hooks,solid,svelte,vue}/` | `node_modules`, `dist` 생김 (git 무시) |
| `webdriver-ts/results/` (git 무시) | 3차 측정 결과. lithent·preact의 02·09번만 이후 재측정 값 |

벤치마크 서버는 꺼 두었다.

## 8. 결정이 필요한 것

1. **릴리스.** §5.1·§5.3은 벤치마크와 무관한 개선이고 버그 수정 1건(재사용한 props 객체가 비워짐)을
   포함한다. 미릴리스 상태인 SSR 속성 이스케이프 수정(`d41ff48`)과 함께 patch로 낼 수 있다.
   concurrent도 소스가 바뀌었으므로 같이 올려야 한다.
2. **등재 기준.** 3차의 1.72는 react와 같은 수준이고 preact(1.57)보다 뒤였다. 4차(§4.4)에서는
   preact와 같고(1.75 대 1.74) react(1.91)보다 앞이다. 성능만 보면 등재할 수 있는 수준이다. 남은
   선행 조건은 릴리스와 §9의 앱 정리다.
3. **전체 삭제를 더 줄이려면** 둘 중 하나가 필요하다.
   - 삭제 시 리스너 해제를 건너뛰는 동작 변경 (약 18%). **적용함 (§5.4).** 릴리스 노트에 동작
     변경으로 적어야 한다.
   - 일괄 삭제 경로 추가 (약 7%, 약 100B → **크기 예산 4,800B를 올려야 한다**).
4. **코어 크기 예산.** §5.4 이후 여유가 46B다. FOLLOWUP_ANALYSIS의 후보 B(+17B)나 C(+42B) 중
   하나는 예산 안에 들어간다.

## 9. 등재 절차 (아직 하지 않음)

벤치마크 저장소 README §4 기준이다. 그쪽 위키의 "Process for merging a pull request"는 읽지 않았다.

1. GitHub에서 `krausest/js-framework-benchmark`를 **fork**한다 (`testbench`는 쓸 수 없다).
2. `frameworks/keyed/lithent/` 폴더만 넣는다. 결과 파일과 루트 파일은 건드리지 않는다.
3. 루트에서 `npm run rebuild-ci keyed/lithent`로 검증한다 (빌드, 실행, keyed 판정, HTML 구조).
4. PR을 낸다. 병합되면 메인테이너가 측정해 공식 결과표에 올린다.

지금 앱에서 고쳐야 하는 것:

| 항목 | 지금 | 필요한 것 |
|---|---|---|
| lithent 의존성 | `file:../../../../lithent` + 로컬 `dist` alias | npm의 `lithent` 고정 버전, alias 제거 |
| 버전 표시 | `"frameworkVersion": "local-build"` | `"frameworkVersionFromPackage": "lithent"` |
| 홈 URL | `https://github.com/lithent/lithent` | `https://github.com/superlucky84/lithent` |
| 의존성 버전 | `^` 범위 | 고정 버전 |
| lock 파일 | `package-lock.json` + `pnpm-lock.yaml` | `npm install`로 만든 `package-lock.json`만 |
| 버튼 연결 | 정적 HTML의 버튼에 `getElementById(...).onclick` | 화면 전체를 lithent로 렌더 (수동 DOM 조작은 주석 #772 대상) |

선행 조건:

- **측정 대상은 npm에 배포된 lithent다.** §5.1 수정이 릴리스돼야 2차 측정의 숫자가 나온다.
- **`npm`이 이 머신에서 돌아야 한다.** 검증 도구가 `npm`을 쓴다.
- README는 과한 최적화를 금한다. 수동 이벤트 위임(#801), 앱 코드의 `requestAnimationFrame`(#796),
  행별 선택 플래그(#800)는 주석이 붙는다. `cacheUpdate`는 preact·react의 `memo`에 해당하는 문서화된
  API라 관용적 사용으로 본다.

## 10. 다음 단계

1. §8의 릴리스·등재 기준 결정.
2. 릴리스한다면: `CHANGELOG.md`, 버전, `pnpm verify:release`.
3. 전체 삭제를 더 줄이기로 하면 §8의 3번 중 하나를 적용하고, 조용한 머신에서 7개 프레임워크를 다시 측정.
4. 기준을 넘으면 §9의 앱 정리 → fork → PR.
