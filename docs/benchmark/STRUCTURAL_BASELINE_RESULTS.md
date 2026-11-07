# 코어 구조 개선 Phase 1 — 기준선과 갱신 작업량

- 날짜: 2026-10-21. 기준 HEAD: `dbbd320a5b92c63262d43b667692396ae5d53322`.
- 정본: [REQUIREMENTS](../performance-improvement/REQUIREMENTS.md), [DESIGN](../performance-improvement/DESIGN.md), [IMPLEMENT](../performance-improvement/IMPLEMENT.md), [수동 검사](../performance-improvement/MANUAL_TEST_CHECKLIST.md).
- 상태: **Phase 1 완료. C1 한정 프로토타입을 다음 작업으로 선정했으며 새 코어 구현은 아직 없다.**
- [원본 결과](./structural-baseline-results.json), [압축 증거](./structural-baseline-evidence.json.gz), [재현 도구](./structural-baseline.mjs).

1천·1만 행과 변경 항목 수를 바꾼 38개 진단에서 세 가지 작업을 구분했다. 원래 Table 앱은 작은 변경에도 전체 목록을 처리한다. 행별 갱신은 diff 범위를 줄이지만 부모 배열에서 현재 노드를 찾는 검색이 남는다. 중첩 입력 예제에서는 조상 slot 배열 검색도 같은 방식으로 증가했다. **카운터는 논리적인 작업량이며 시간 비중·공식 점수·후보 개선율이 아니다.**

## 기준선과 측정 경계

| 대상       | 확인 결과                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| base       | 런타임 소스 16개와 ESM/UMD/CJS가 설치된 npm `lithent@1.25.2`와 바이트까지 일치                                                                               |
| concurrent | `0.2.2`; 런타임 소스는 `085137b` 이후 변경 없음, ESM/UMD는 이전 복원 증거와 해시 일치                                                                        |
| 원래 앱    | 기존 `select-partial-evidence.json.gz`의 `official-main.tsx`를 새 staging에 추출. SHA-256 `4fcb17e3dcd841f628d4130a7d47ca3011550972675ba2da18e324a5f541d632` |
| 행별 앱    | `targeted-main.tsx`와 현재 sibling `src/main.tsx` 일치. SHA-256 `314efbb41cf0669c13449c4b4800c4ed5e2b193167f20ccebf7d3f7303e5d76b`                           |
| sibling    | HEAD `ecbff5f54b75244b89b0b14d34f11e32bca59345`; 기존 앱 수정 보존. 이번 실행 전후 앱 해시·git 상태 동일                                                     |
| 도구       | Node `20.3.0`, 진단 Vite `5.4.8`, production 앱 Vite `5.4.21`, Playwright `1.63.0`                                                                           |
| 환경       | Apple M4 Pro, macOS arm64. 고정 Chrome `155.0.8059.85`의 실행 파일·엔진 해시를 시작·종료에 확인                                                              |

진단 빌드는 원래/행별 앱에 `store`·`renewTable` 접근점만 추가하고, base 소스 및 npm 동봉 `cacheUpdate` 소스에 staging transform으로 카운터를 넣었다. 코어 소스·배포 번들은 수정하지 않았다. production 계약 검사에는 카운터 없는 npm 배포 코어와 helper를 사용했다. 두 종류의 번들·해시는 결과에서 분리한다.

원래 앱에는 첫 선택·선택 이동·말미 선택·k개 라벨 갱신·변화 없는 부모 갱신을, 행별 앱에는 같은 작업을 적용했다. `k = 1, 10, n/10`이며 갱신 위치는 `floor(i*n/k)`다. 중첩 예제는 두 Shell slot을 통과하는 입력 필드에서 처음/마지막 1개와 k개 값을 바꾼다. 10k 부분 갱신·가변 k·부모 재실행·중첩 입력은 공식 CPU 시나리오와 구분하는 진단이다. 각 크기에서 한 context 안의 정해진 순서로 실행했고, 시나리오마다 카운터를 초기화했다.

## 원래 Table 앱: 변경량과 무관한 전체 처리

| 행 수·작업             | 캐시 검사 | cache miss | updater 실행 `runUpdate` | 전체 diff | 실제 DOM 변경 |
| ---------------------- | --------: | ---------: | -----------------------: | --------: | ------------- |
| 1k 첫 선택             |     1,000 |          1 |                        1 |     1,012 | class 1       |
| 1k 선택 이동           |     1,000 |          2 |                        1 |     1,021 | class 2       |
| 1k 라벨 1개            |     1,000 |          1 |                        1 |     1,012 | text 1        |
| 1k 라벨 100개          |     1,000 |        100 |                        1 |     1,903 | text 100      |
| 1k 부모 갱신, 값 동일  |     1,000 |          0 |                        1 |     1,003 | 없음          |
| 10k 선택 이동          |    10,000 |          2 |                        1 |    10,021 | class 2       |
| 10k 라벨 1,000개       |    10,000 |      1,000 |                        1 |    19,003 | text 1,000    |
| 10k 부모 갱신, 값 동일 |    10,000 |          0 |                        1 |    10,003 | 없음          |

1k 결과는 [기존 진단](./SELECT_PARTIAL_UPDATE_ANALYSIS.md)의 첫 선택 1,012·선택 이동 1,021·부분 갱신 1,903 diff를 재현했다. Table의 updater는 1회이며 1,001회가 아니다. 전체 diff는 DOM 쓰기 수가 아니다. 모든 시나리오에서 행 DOM 정체성이 유지됐다.

같은 순서인 원래 목록은 n행에 대해 아래 처리를 수행했다. LIS와 오른쪽부터의 이동/삽입 placement loop는 0회이고 DOM 삽입·삭제도 없다.

| 처리                                |                    n행당 관찰 횟수 |
| ----------------------------------- | ---------------------------------: |
| 이전 key Map 구성 방문 / has / set  |                             각각 n |
| 새 key Map get / delete / used 기록 |                             각각 n |
| 미사용 원본 filter                  |                                  n |
| render 순서 계획 / content pass     |                             각각 n |
| 행 목록의 `clearDiffMeta`           | n; 하위 변경 노드 정리는 별도 추가 |

**C2의 진입 증명도 유료다.** 별도 shadow 검사에서 배열 길이·순서가 같고 모든 key가 유일한지 확인했다. 위 목록에서 쌍 방문 n, key 읽기 2n, `Set.has` n, `Set.add` n으로 통과했다. 이 검사는 실제 diff/render를 대체하지 않고 추가로 실행했다. 특수 키·중복·혼합 목록의 일반 경로를 수정하지도 않았다. 따라서 n회짜리 검사를 없앴다는 결과나 Set 방식의 실행 시간 우열로 쓰지 않는다.

후속 C2라면 진입 검사 뒤 기존 Map 구성/조회/삭제·filter와 render의 순서 계획 중 무엇을 실제로 제거하는지 밝혀야 한다. 기존 ordered 후보의 배열 할당 지연, keymatch의 `Map.delete` 대체, type identity의 같은 객체 비교 생략과 구별되는 부분은 **검증한 동일 순서 결과를 render까지 전달하는 것**이다. 캐시 검사·변경 자식 diff·content/metadata 순회가 자동으로 사라지는 것은 아니다.

## 행별 갱신: 좁아진 diff와 남은 위치 검색

`parentSearchEstimatedVisits`는 기존 native `indexOf`의 반환 위치에 1을 더하거나 실패 시 배열 길이를 사용한 논리적 방문량이다. dense WDom 배열의 비교 예산을 설명하며 실제 엔진의 메모리 접근 수나 소요 시간은 아니다. 검색 결과·호출 수·대상 배열 길이·성공/실패는 raw 카운터에 따로 있다.

| 작업                |      n | 갱신 컴포넌트 |  diff | 부모 검색 예상 방문 | 실제 DOM 변경 |
| ------------------- | -----: | ------------: | ----: | ------------------: | ------------- |
| 처음→두 번째 선택   |  1,000 |             2 |    12 |                   3 | class 2       |
| 처음→두 번째 선택   | 10,000 |             2 |    12 |                   3 | class 2       |
| 두 번째→마지막 선택 |  1,000 |             2 |    12 |               1,002 | class 2       |
| 두 번째→마지막 선택 | 10,000 |             2 |    12 |              10,002 | class 2       |
| 라벨 10개           |  1,000 |            10 |    80 |               4,510 | text 10       |
| 라벨 100개          |  1,000 |           100 |   800 |              49,600 | text 100      |
| 라벨 10개           | 10,000 |            10 |    80 |              45,010 | text 10       |
| 라벨 1,000개        | 10,000 |         1,000 | 8,000 |           4,996,000 | text 1,000    |

여기서 C1이 겨냥할 작업은 `replaceWDom`의 부모 배열 검색이다. 방문 합계는 `k + n*(k-1)/2`이며, 이 위치 분포에서 k=n/10이면 n을 10배 늘릴 때 약 100배가 된다. 주변 행만 선택한 결과로 모든 자체 갱신이 O(1)이라고 일반화할 수 없다. 이 앱에서는 slot 검색 예상 방문이 0회였고 빈 compChild 배열의 검색 호출은 존재했다. 조상 연결 기능을 제거해도 된다는 근거가 아니다.

변화 없는 부모 재실행에서는 행별 앱도 n행을 다시 처리했다. 1k에서 updater 1,001회·diff 2,003회·캐시 검사 1,000회, 10k에서 updater 10,001회·diff 20,003회·캐시 검사 10,000회다. DOM 변경은 0회였다. **C3의 부모 기인 updater 생략 계약을 연구할 근거**이며, 원래 Table-only 앱의 결과와 섞지 않는다.

## 일반 중첩 입력 예제: 조상 slot도 별도 비용

두 Shell 컴포넌트가 필드들을 children으로 전달한다. 각 필드의 자체 갱신은 input 값과 표시 문자열을 갱신한다. benchmark의 행 id·매 10행 패턴에 의존하지 않는다.

| n·작업              |  diff | 부모 검색 예상 방문 | slot 검색 예상 방문 | 실제 text 변경 |
| ------------------- | ----: | ------------------: | ------------------: | -------------: |
| 1k 마지막 필드 1개  |     5 |               1,000 |               1,001 |              1 |
| 10k 마지막 필드 1개 |     5 |              10,000 |              10,001 |              1 |
| 1k 필드 100개       |   500 |              49,600 |              49,700 |            100 |
| 10k 필드 1,000개    | 5,000 |           4,996,000 |           4,997,000 |          1,000 |

필드·input DOM 정체성, 바뀐 필드 수, input 값과 표시 문자열 일치, 삽입·삭제 없음까지 검사했다. 검증을 보강한 두 번째 실행의 38개 카운터는 첫 실행과 모두 같았다. 첫 실행도 별도 보존했다. slot 검색이 부모 검색과 다른 배열을 대상으로 수행됨을 확인했으므로 C1은 두 연결을 구별해야 한다.

## 다음 후보 결정

1. **C1 한정 프로토타입에 진입한다.** 부모/slot 검색은 일반 입력에서도 재현되는 별도 작업이며 기존 Map/LIS 실험과 다르다. 컴포넌트가 소유하는 위치 hint를 우선 검토하고, 부모 children과 각 조상 compChild의 현재 배열 참조·index를 각각 검증한다. `array[index] === originalWDom` 확인이 실패하면 기존 검색으로 돌아가야 한다. 정확한 field/sidecar 선택·생성/이동 시 유지 비용·concurrent commit publication은 구현 전에 DC-6 하위 결정으로 확정한다.
2. **C1이 원래 Table 앱의 전체 순회를 해결한다고 주장하지 않는다.** 이 앱의 부모 검색은 갱신당 1회 방문뿐이다. 생성·이동·clear·메모리·번들 비용과 전체 공식 시간을 포함한 C1의 순이득은 아직 모른다. 2B의 base 여유를 몰래 늘리지 않는다.
3. **C2는 우선 보류한다.** 진입 증명에도 O(n) 처리가 남는다. shadow 카운터만으로 실행 시간이 나쁘다고 기각하지 않으며 실제 제거할 작업과 저장 비용이 분명할 때 별도 후보로 돌아온다.
4. **C3/C4는 다음 분기를 유지한다.** 부모 기인 updater n회가 남는다는 근거를 확보했다. C1로 충분하지 않으면 C3의 명시적인 무효화·자체 renew·callback 계약부터 닫고 연구한다. C4는 구조 변경 정보의 소유권을 따로 설계해야 한다.

이는 연구 순서 결정이며 어떤 코어 변경의 채택이나 전체 성능 목표 달성이 아니다.

## 기준 검사와 실제 러너 조건

- B1: `pnpm test:dual` 성공. 전체 13개 suite 실행 합계 1,042 passed·3 skipped. 기본 core 395, concurrent core 298, concurrent helper 8을 포함한다. 변경 없는 baseline의 검사다.
- B2: `pnpm build:core`, `pnpm build:concurrent`, `pnpm build:element`, `pnpm size` 성공. 대상 세 UMD 파일 존재 확인. brotli는 base **4,798/4,800B**, concurrent **6,903/9,000B**, element **998/1,000B**다. raw/gzip/br와 시작/종료 해시는 증거에 보존했다.
- B3: 두 production 앱 모두 DOM 정체성·선택 class 2개·부분 갱신 text 100개·부모/자식 배칭 2순서·20회 재생성 검사 통과. 공식 `isKeyed`의 생성/삭제/교환 및 9개 동작·glyph font 검사도 통과했다.
- 계측: 3앱 × 2행 수, 총 38시나리오에서 값·DOM 정합성 및 콘솔 오류 없음 확인. 새 코어 후보의 회귀/생성·메모리·전체 CPU 검사는 Phase 2 이후다.
- 정리 검사: 재현 도구 ESLint·문서/도구 Prettier·`git diff --check` 통과. 정본 4개·HANDOFF·이번 보고서의 로컬 링크 94개, 압축 증거 94파일의 SHA-256 및 raw/실제 번들·도구 해시 일치를 확인했다.

고정 러너의 실제 `03_update10th1k_x16`·`09_clear1k_x8`은 모두 1,000행을 사용하고 이 checkout의 throttle은 **4배**다. ID의 x16/x8을 실제 배수로 해석하지 않는다. 부분 갱신 warmup은 3회, clear는 5회다. select 메타데이터 warmupCount는 5지만 현재 실행 코드는 다섯 번째 행을 **1회** 미리 선택한 뒤 두 번째 행을 측정한다. 공식 CPU 경로의 init 후 trace 안에서 동기 major GC를 요청하는 코드와 warmup·반복·설정은 manifest 및 src/dist runner에 보존했다. 이번 턴에서는 공식 CPU 점수를 측정하지 않았다.

IC-1의 초기 비교군 제안은 `react-hooks`, `preact-hooks`, `react-classes`, `preact-classes` 전체다. 공식 클릭→최종 paint 중앙값·분포, 항목별 baseline/peer 비율과 가중 전체 지표를 분리해 제시한다. 이번 진단에서 peer 성능을 새로 측정하지 않았다. 표의 색상·정규화·통계 모드, 빠른 구간 수치 임계치와 startup 포함 범위는 여전히 미확정이다.

## 재현과 증거

원래 sibling 앱을 바꾸지 않고 새 출력 디렉터리에서 실행한다. 도구는 기존 진단 빌드/결과를 덮어쓰지 않는다. Chrome과 이미 설치된 로컬 의존성이 필요하다.

```sh
export LITHENT_PHASE1_OUT=/tmp/lithent-structural-baseline-fresh
export LITHENT_BENCHMARK_ROOT=/Users/n250109005/project/js-framework-benchmark-upstream
export LITHENT_CHROME_BINARY='/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome'
mkdir "$LITHENT_PHASE1_OUT"
pnpm test:dual > "$LITHENT_PHASE1_OUT/test-dual.log" 2>&1
pnpm build:core > "$LITHENT_PHASE1_OUT/build-core.log" 2>&1
pnpm build:concurrent > "$LITHENT_PHASE1_OUT/build-concurrent.log" 2>&1
pnpm build:element > "$LITHENT_PHASE1_OUT/build-element.log" 2>&1
pnpm size > "$LITHENT_PHASE1_OUT/size.log" 2>&1
node docs/benchmark/structural-baseline.mjs prepare
node docs/benchmark/structural-baseline.mjs measure

export LITHENT_PRODUCTION_OUT="$LITHENT_PHASE1_OUT/production"
export LITHENT_BASELINE_SOURCE="$LITHENT_PHASE1_OUT/original-main.tsx"
export LITHENT_CANDIDATE_SOURCE=/Users/n250109005/project/lithent/docs/benchmark/targeted-main.tsx
node docs/benchmark/targeted-update.mjs prepare
node docs/benchmark/targeted-update.mjs contracts lithent-before,lithent
node docs/benchmark/targeted-update.mjs verify lithent-before,lithent
node docs/benchmark/structural-baseline.mjs check
node docs/benchmark/structural-baseline.mjs pack
```

`check`는 이 고정 기준선의 13개 suite·1,042 passed·3 skipped·세 번들 크기 및 카운터/앱/브라우저 해시를 검사한다. 새 코어 후보의 합격 기준으로 재사용하지 않는다. `pack`의 기본 출력은 새 작업 경로의 `preserved/`이며, 기존 증거 파일이 있으면 실패한다. 이번 정본 증거 생성에는 `LITHENT_PHASE1_ARTIFACT_DIR=docs/benchmark`를 명시했다.

압축 증거의 `files`는 각 파일의 UTF-8 content와 SHA-256을 갖는다. 기준선 소스/번들·원래/실험/일반 예제·카운터 빌드·source map·production 빌드·runner·도구·검사 로그와 결과를 함께 보존했다. 압축본 해시는 raw 결과의 `evidence.sha256`에 있다. 현재 출력 경로는 `/tmp/lithent-structural-baseline-20261021`이고, 이 경로가 없어져도 압축본에서 재구성할 수 있다. Chrome 실행 파일 자체와 node_modules는 동봉하지 않는다.

production prepare 첫 시도는 Vite가 sibling에 임시 config 파일을 만들 때 sandbox EPERM으로 실패했다. 같은 명령을 권한 실행으로 재시도해 성공했다. 앱 소스는 변경하지 않았다. 입력 값 검사 보강 전 진단도 별도 파일로 보존했고 최종 검증 실행만 정본 결과에 연결했다. CPU 실패 배치나 재시도 표본은 없다.

## 상태 / 핸드오프

- done: Phase 1 기준선 동등성, 38개 작업량 진단, B1/B2/B3, 일반 slot 예제, 초기 비교군 기록과 C1 다음 후보 선정.
- next: DC-6의 저장/유지 비용·concurrent publication 결정을 닫고 C1 한정 프로토타입을 별도 후보로 구현·검증. C2/C3/C4와 처음부터 합치지 않는다.
- blockers: Phase 1 블로커 없음. C1의 실제 성능 이득과 비용, 최종 표 임계치는 미검증/미확정이다.
- commit: `dbbd320a5b92c63262d43b667692396ae5d53322`에서 시작. 이번 산출물은 작업 트리에 있으며 새 커밋·push·배포는 하지 않았다.
