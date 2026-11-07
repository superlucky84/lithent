# keyed 매칭의 중복 Map 삭제 제거 — 2026-10-20

**미채택이며 두 코어의 소스와 빌드 산출물을 실험 전으로 복원했다.** 원본 앱을 고정하고
코어만 바꾼 공식 CPU **580개 표본**에서 전체 성능 이득을 확인하지 못했다.

| 차수         | 가중 전체 시간 변화 | 가중 JS 시간 변화 |
| ------------ | ------------------: | ----------------: |
| 첫 차수      |               +2.5% |             +1.1% |
| 반대 순서    |               +0.7% |             +0.3% |
| 두 차수 합산 |               +1.7% |             +1.0% |

가중치는 로컬 upstream 결과표의 값을 사용하며 항목별 중앙값의 비율을 가중 기하평균한다.
합산 행은 같은 Chrome·앱·코어 번들에서 수집한 표본을 항목별로 합쳐 다시 계산한 값이다.
공개 결과표의 점수나 다른 프레임워크 대비 비율이 아니다.

| 공식 항목     | 첫 차수 원본 | 첫 차수 후보 | 반대 순서 원본 | 반대 순서 후보 |
| ------------- | -----------: | -----------: | -------------: | -------------: |
| 1,000행 생성  |       27.601 |       27.362 |         27.275 |         27.694 |
| 1,000행 교체  |       30.796 |       31.177 |         31.334 |         31.472 |
| 부분 갱신     |       18.968 |       19.674 |         18.825 |         19.081 |
| 행 선택       |        7.584 |        7.617 |          7.958 |          7.823 |
| 행 교환       |       17.848 |       18.861 |         17.372 |         18.742 |
| 한 행 삭제    |       12.064 |       12.255 |         12.625 |         12.526 |
| 10,000행 생성 |      286.435 |      286.142 |        288.058 |        287.688 |
| 1,000행 추가  |       30.458 |       31.025 |         31.407 |         30.835 |
| 전체 삭제     |       11.902 |       13.578 |         11.656 |         12.170 |

단위는 ms, 실제 클릭부터 최종 paint까지의 전체 시간 중앙값이다. 선택의 JS 시간은 두 차수에서
약 2.3~2.5% 줄었지만, 부분 갱신·교환·전체 삭제의 전체 시간은 두 차수 모두 늘었다.
함수 호출을 없애고 코드 크기를 줄였다는 사실만으로 렌더링 개선으로 채택하지 않았다.
성능 채택 기준을 통과하지 못해 추가 메모리·retention 측정은 하지 않았다.

비격리 머신의 관측값이며 작은 차이를 통계적으로 확정된 회귀라고 주장하지 않는다.
첫 차수에서 후보의 선택 측정 중 Chrome CDP의 `Runtime.callFunctionOn` 시간 초과가 두 번
발생했다. 실패한 배치의 부분 표본을 버리고 25개 전체를 다시 측정했으며, 세 번째 배치가 완료됐다.
이 때문에 기준과 후보의 선택 완료 시각이 약 7분 벌어졌다. 원인은 확정하지 않았다.
반대 순서 차수는 재시도 없이 완료했다. 오류 기록은 원본 `failedBatches`에 남아 있으며,
실패 시도의 trace 파일은 재시도 때 덮어써져 별도 보존되지 않았다.

[keymatch-core-results.json](./keymatch-core-results.json)에 차수별·합산 결과와 원본 표본을,
[keymatch-core-evidence.json.gz](./keymatch-core-evidence.json.gz)에 전후 소스·번들·검사 로그·
측정 도구·복원 검증을 보존했다.

## 변경 내용

`src/diff.ts`와 `lithentConcurrent/src/diff.ts`의 keyed 매칭 경로를 비교한다.
기존 구현은 key가 매칭되면 Map에서 해당 key를 삭제하고, 같은 인덱스를 `used` 배열에도 표시했다.
후보는 `used` 표시로 이미 매칭한 인덱스의 재사용을 막고 Map을 그대로 둔다. 따라서 매칭된
행마다 수행하던 Map 삭제가 없어지며, 새 캐시나 행별 상태를 추가하지 않는다.

기존 Map은 중복 key 중 첫 번째 이전 행만 저장한다. 이미 사용한 첫 행의 인덱스를 거부하면
Map에서 key를 지웠을 때와 동일하게 다음 중복 행은 새로 만들어지고, 남은 이전 행은 정리된다.
key가 없는 항목은 기존대로 같은 위치의 key 없는 항목에 매칭한다.

앞선 [순서 유지 목록 후보](./ORDERED_CORE_RESULTS.md)는 복원했으며 두 최적화를 섞지 않았다.
원본 upstream 앱·helper를 고정해 npm 1.25.2 코어와 로컬 미배포 코어를 비교한다.

## 검증 조건

- 새 `core-keyedConsumption.test.tsx`는 중복 key, `0`, `false`, 빈 문자열, 객체, Symbol, NaN과
  숨겨진 행이 섞인 재정렬에서 DOM 정체성·컴포넌트 상태·중복 행 정리를 검사한다.
  변경 전 두 코어에서도 통과하며, 후보에서도 통과했다.
- 후보의 `pnpm test:dual` 통과: base **395개**, concurrent **298개**, 관련 패키지 검사.
- `pnpm test:e2e`: **64개 통과**. 두 코어 빌드·ESLint·크기 검사 통과.
- base UMD brotli **4,798→4,793B**, concurrent **6,903→6,903B**.
- 동일 앱의 전후 공식 keyed·9개 동작·glyph 폰트 검사 통과. 별도 DOM 계약 검사에서
  선택 class 2개, 부분 갱신 text 100개, 전체 삭제 제거 기록 1개로 전후 같다.
- CPU·동작 검증에는 복사해 고정한 **Chrome 155.0.8059.85**를 사용했다.
  `LITHENT_CHROME_BINARY`를 upstream 러너의 기존 `chromeBinaryPath` 옵션에 전달한다.
  실행 파일과 Chrome Framework의 해시를 기록하고 실행 종료 때 같은지 검사했다.
- 공식 CPU 비교는 **base 코어** 대상이다. concurrent에는 같은 변경을 적용해 단위·브라우저
  동작과 빌드를 검증했으며, concurrent의 공식 성능 개선율로 해석하지 않는다.
- Apple **M4 Pro / 12코어 / 24GB**, Vite **5.4.21**. 앱·helper·코어·생성 번들의 SHA-256 보존.
  공식 warmup·CPU throttling·GC·trace·paint 계산은 그대로다.
- 같은 항목 안에서 두 앱을 연속 측정하고, 항목마다 선행 앱을 교대한다.
  반대 순서 차수에서도 모든 항목의 전후 순서가 정확히 뒤집힌다.

작업 경로는 `/tmp/lithent-keymatch-core-20261020`이다. `before`, `after`에 코어 소스·번들을,
`main`, `main/reverse`에 측정 결과와 trace를 분리해서 보존한다.

```sh
export LITHENT_CHROME_BINARY='/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome'
export LITHENT_BENCHMARK_ROOT="$HOME/project/js-framework-benchmark-upstream"
export LITHENT_PRODUCTION_OUT=/tmp/lithent-keymatch-core-20261020/main
export LITHENT_PRODUCTION_ALTERNATE_ORDER=1
node docs/benchmark/production-run.mjs verify lithent-before,lithent
node docs/benchmark/production-run.mjs cpu lithent-before,lithent
```

브라우저 복사본과 `main`의 전후 빌드를 먼저 준비해야 한다. 새 실행에는 별도 결과 경로를 사용한다.

## 최종 작업트리

두 코어를 다시 빌드해 ESM·UMD·CJS와 소스맵까지 복원했다. 변경했던 diff·render 소스와
ESM·UMD는 실험 전 해시와 같다. base 런타임 소스 16개와 세 형식의 번들은 설치된 npm
**1.25.2**와 바이트까지 일치한다. 크기는 base **4,798 / 4,800B**, concurrent
**6,903 / 9,000B**이며 크기 검사를 통과했다.

새 keyed 정체성·상태·정리 회귀 테스트는 남겼으며 복원한 두 코어에서도 통과했다.
실제 upstream `src/main.tsx`는 기존 `targeted-main.tsx` 그대로다. 이번 실험의 원본 앱이나
미채택 코어로 실제 upstream 작업트리를 교체하지 않았다. 버전 변경·커밋·배포는 하지 않았다.
