# 순서를 유지하는 목록의 코어 할당 비용 검토 — 2026-10-20

**미채택이며 이 후보의 소스·번들은 복원했다.** 공식 CPU는 두 차수에 총 **580개 표본**을
수집했지만, 전체 성능이 안정적으로 좋아졌다는 근거를 확보하지 못했다.

| 차수                    | Chrome        | 가중 전체 시간 변화 | 가중 JS 시간 변화 |
| ----------------------- | ------------- | ------------------: | ----------------: |
| 첫 차수                 | 155.0.8059.82 |               +1.2% |             −1.1% |
| 순서를 뒤집은 후속 차수 | 155.0.8059.85 |               −0.2% |             −3.0% |

**두 차수 사이에 Chrome이 자동 업데이트됐다.** 동일 브라우저 조건의 재현이라고 볼 수 없고,
두 차수의 표본을 합쳐 점수·개선율을 산출하지 않는다. 각 행은 해당 차수 안의 전후 비교다.
이 문제를 확인한 뒤 측정 도구에 `LITHENT_CHROME_BINARY`를 추가했다. 후속 실험은 복사해
고정한 Chrome을 사용하며 실행 파일·렌더링 엔진의 시작/종료 해시를 확인한다.

첫 차수의 선택은 **7.677→7.187ms**, 별도 브라우저 버전의 후속 차수는 **8.112→7.694ms**였다.
반면 부분 갱신은 각각 **18.117→19.721ms**, **17.842→17.553ms**로 방향이 달랐다.
전체 삭제도 **12.267→13.026ms**, **12.345→12.373ms**였다. 선택의 JS 비용 감소만으로
전체 성능 개선이라고 판단하지 않았다. 성능 채택 기준을 통과하지 못해 추가 메모리 측정은 하지 않았다.

[ordered-core-results.json](./ordered-core-results.json)에 차수별 전체 표본과 비교를,
[ordered-core-evidence.json.gz](./ordered-core-evidence.json.gz)에 전후 소스·번들·검사 로그·
실제로 사용한 측정 도구를 보존했다. 이후 실험의 변경과 구별한다.

## 후보의 범위

사용자가 라이브러리 코어 개선을 우선한다고 재확인한 뒤, **앱 소스를 고정하고 코어만 바꿔**
비교했다. 앞선 [앱 후보 비교](./OVERALL_UPDATE_RESULTS.md)의 개선율과 합산하지 않는다.

base·concurrent의 `updateChildren`은 순서가 같은 갱신에서도 매번 `matchedIndexes`와
`oiSeq`를 만들고, 매칭된 모든 자식의 인덱스를 두 배열에 채웠다. 이미 LIS 실행 자체는
재정렬이 있을 때로 제한했지만, 입력 배열의 준비 비용은 항상 지불하고 있었다.

후보는 먼저 이전 인덱스의 증가 여부만 검사하고, 순서가 바뀔 때에만 LIS 입력을 만든다.
base는 재정렬 때도 별도 위치 매핑 배열을 없애고, 추가·교체 노드를 건너뛰는 인덱스 배열과
LIS의 유지 위치 마스크를 사용한다. concurrent는 기존 LIS 계산과 commit 구조를 유지한다.

목록을 순회하는 O(n) 비용과 keyed diff의 Map은 여전히 남는다. 변경된 행만 처리하는 방식이나
벤치마크 전용 경로가 아니며, 이동·삭제·갱신 콜백의 실행 순서는 유지한다.

## 검증과 측정 조건

- 변경 파일: `src/render.ts`, `lithentConcurrent/src/render.ts`.
- 최종 후보에서 `pnpm test:dual` 통과: base 394개, concurrent 297개와 관련 패키지 검사.
  숨겨진 행, 중간 추가·교체, 재정렬, 캐시된 VDOM, 자식 갱신을 포함하는 기존 fuzz·동작 검사를 사용했다.
- `pnpm test:e2e`: **64개 통과**. 두 코어의 DOM 정체성, 포커스, 생명주기, scheduler 등을 검사했다.
- 두 빌드, 변경 파일 ESLint·Prettier, 크기 검사 통과. base UMD brotli는 **4,798→4,789B**,
  concurrent는 **6,903→6,953B**로 각각 **4,800 / 9,000B** 한도 안이다.
- 전후의 공식 keyed·9개 동작·폰트 검사와 별도 DOM 계약 검사 통과. 선택 class 변경 2개,
  부분 갱신 text 변경 100개, 전체 삭제 제거 기록 1개이며 전후 같다.
- 사용자 지정 `~/project/js-framework-benchmark-upstream`의 공식 Puppeteer 러너 사용.
  원본 앱·helper 해시를 고정하고 npm **1.25.2** 코어와 **로컬 미배포 후보**를 비교한다.
- 공식 CPU 비교는 base 코어 대상이다. concurrent는 단위·브라우저 동작과 빌드를 검증했으며,
  concurrent의 공식 성능 개선율로 해석하지 않는다.
- Apple **M4 Pro / 12코어 / 24GB**, Chrome **155.0.8059.82 / 155.0.8059.85**, Vite **5.4.21**.
  전용 격리 머신이 아니므로 실행 순서와 시스템 부하를 원본에 함께 기록한다.
- 공식 warmup·CPU throttling·GC·trace·paint 계산은 변경하지 않았다.
  선택은 차수당 25개, 나머지 항목은 각각 15개 표본의 중앙값을 비교한다.

작업 경로: `/tmp/lithent-ordered-core-20261020`. `before`와 `after`에 두 코어의 소스·ESM·UMD,
`main`에 동일 앱으로 빌드한 전후 번들·결과·trace를 보존한다. 초기에 크기 한도를 넘었던
중간 구현은 공식 측정에 사용하지 않았으며, `after`의 최종 후보만 측정한다.

```sh
LITHENT_PRODUCTION_OUT=/tmp/lithent-ordered-core-20261020/main \
LITHENT_BASELINE_SOURCE=/tmp/lithent-overall-20261019/original-main.tsx \
LITHENT_CANDIDATE_SOURCE=/tmp/lithent-overall-20261019/original-main.tsx \
LITHENT_CANDIDATE_CORE=/Users/n250109005/project/lithent/dist/lithent.mjs \
node docs/benchmark/targeted-update.mjs prepare

export LITHENT_BENCHMARK_ROOT="$HOME/project/js-framework-benchmark-upstream"
export LITHENT_PRODUCTION_OUT=/tmp/lithent-ordered-core-20261020/main
export LITHENT_PRODUCTION_ALTERNATE_ORDER=1
node docs/benchmark/production-run.mjs verify lithent-before,lithent
node docs/benchmark/production-run.mjs cpu lithent-before,lithent
```

후보를 복원할 때는 `after`의 소스를 사용하고 현재 `dist`가 후보라고 가정하지 않는다.
같은 출력 경로에 재측정해 기존 trace를 덮어쓰지 않는다.
