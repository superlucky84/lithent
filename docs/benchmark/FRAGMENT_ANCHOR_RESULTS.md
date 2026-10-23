# DC-19: Fragment 앵커의 범위 탐색 — 클라우드 독립 실험

2026-10-24. `experiment/fragment-anchor-cloud`, compact13 기준 `8056e02`에서 수행했다.
**프로토타입은 실험 브랜치에 보존하며 기본 채택은 보류한다.** C2 proof 전달·key Map/LIS·factory·event·wrapper는 변경하지 않았다.

## 관측 결과와 판정

긴 형제 목록에서 suffix 복사와 불필요한 callback 호출은 줄었다. 업데이트 시간은 아래 값으로 관측됐지만 **두 rAF 시간 중앙값은 세 화면 모두 약 33.3ms로 같았다.** 클릭→최종 paint의 공식 스코어가 아니며 전체 렌더링 속도 개선이나 peer 목표 달성의 증거로 사용하지 않는다.

| 전용 화면                          | pooled update ms (기준→후보) |    첫 순서 ms |  반대 순서 ms |
| ---------------------------------- | ---------------------------: | ------------: | ------------: |
| 형제 1,000개 앞 Fragment 노출/숨김 |                0.200 → 0.100 | 0.200 → 0.100 | 0.200 → 0.100 |
| 200개 다중 DOM 행 재정렬/교체      |                3.300 → 3.200 | 3.400 → 3.200 | 3.150 → 3.150 |
| 같은 위치의 텍스트 갱신 대조군     |                0.200 → 0.200 | 0.200 → 0.200 | 0.200 → 0.200 |

모든 update 값은 관측상 0.1ms grid에 놓였다. 노출 화면의 0.2→0.1ms를 견고한 50% 렌더링 개선으로 해석하지 않는다. 재정렬의 pooled 3.3→3.2ms는 첫 순서에서만 차이가 있고 반대 순서에서는 같아 작은 이득이 불확실하다. 전용 stress 사례이며 일반 앱/전체 upstream 9항목 결과가 아니다.

**관찰 차이:** 실제 source helper를 추출한 검사에서, virtual child의 getter가 뒤쪽 배열 원소를 바꾸면 기존 slice snapshot은 `old`, 후보는 `new`를 반환했다. 사용되지 않는 배열 index getter도 기존은 읽고 후보는 읽지 않았다. sparse slot/moving 제외 결과는 같았다. stub DOM 기반 helper 검사이며 전체 브라우저 계약 검사와 구분한다. 새로운 immutable 계약을 선언하지 않았고 이 차이 때문에 자동 기본 채택하지 않는다.

## 실제 제거된 작업

진단 build만 계측했다. 각 화면 12회 갱신의 합계다. `visits`는 reduce callback/새 loop 진입 횟수이며 실제 WDom field 읽기·전체 diff 방문 수와 구분한다.

| 화면                               | suffix 배열 (기준→후보) | 복사 원소 | singleton 배열 | helper 방문 | 실제 노드 읽기 |
| ---------------------------------- | ----------------------: | --------: | -------------: | ----------: | -------------: |
| 형제 1,000개 앞 Fragment 노출/숨김 |                  12 → 0 |  6006 → 0 |          0 → 0 |    6006 → 6 |          6 → 6 |
| 200개 다중 DOM 행 재정렬/교체      |                  19 → 0 |    12 → 0 |       1400 → 0 | 5612 → 4212 |    4212 → 4212 |
| 같은 위치의 텍스트 갱신 대조군     |                   0 → 0 |     0 → 0 |          0 → 0 |       0 → 0 |          0 → 0 |

`indexOf`·조상 탐색·key matching·content 방문·LIS·실제 DOM 작업은 남는다. O(1) 갱신이나 목록 전체 방문 제거로 설명하지 않는다.

## 환경·표본·검증

- Linux x86_64, AMD EPYC 9V74 80-Core Processor, CPU quota 200000 100000, memory limit 8GiB, Node v24.19.0, Chromium 151.0.7922.173 headless. exact executable/protocol/hash는 raw에 보존했다.
- 수집 UTC `2026-10-23T19:32:59.438Z` ~ `2026-10-23T19:34:13.390Z`. Mac/Chrome155·156의 기존 측정과 합산하지 않았다.
- 각 variant/화면/순서 3 fresh page, page별 warmup10/retained30. 두 순서의 variant 순서를 반대로 하고 각 round에서도 교대했다. 시간 표본1,080개, 실패0. timing 중 build/test/별도 profiler를 실행하지 않았다.
- 후보 base와 unchanged concurrent의 공통 core 각각232개/54파일 통과. 300seed×15step fuzz 포함. 새 앵커3회귀는 frozen baseline과 concurrent에서도 먼저 확인했다. strict TypeScript·변경 source ESLint·Prettier 통과.
- 같은 설정으로 source snapshot17개와 실제 세 형식 번들을 빌드했다. baseline/candidate의 render 외16개 source는 같다. ESM 실브라우저6gate와 별도6진단, CJS/UMD 실제 exports/노드생성 smoke를 통과했다. full monorepo test:dual/64e2e나 전체 package/build 완료로 확대하지 않는다.
- 초기 pnpm HOME 경로/넓은 test filter의 패키지 의존성, 빈 demo fixture 수집, 타입/동기 spawn 준비 오류는 로그에 남겼다. source alias와 전용 공통 core runner/비동기 git 실행으로 최종 검증했다. 준비 오류와 브라우저 표본 실패를 구분한다.
- Python이 모든 raw 분포/중앙값/비율·표본 수·source/번들/실행파일 hash·진단 노드 읽기 동등성을 독립 재계산했다. 통계적 유의성이나 비격리 머신의 부하 제거를 주장하지 않는다.

## 별도 GC·메모리 진단

variant/화면별3 fresh context에서100회 갱신 뒤2회 GC, 마지막 dispose 뒤2회 GC를 수행했다. 아래는 CDP JS heap 중앙값(MiB)이며 공식 measureUserAgentSpecificMemory 수치가 아니다.

| 화면                               | 조건      | initial → after → disposed heap MiB | DOM nodes initial → after → disposed | listeners initial → after → disposed |
| ---------------------------------- | --------- | ----------------------------------: | -----------------------------------: | -----------------------------------: |
| 형제 1,000개 앞 Fragment 노출/숨김 | baseline  |            1.5879 → 1.6627 → 1.4006 |                     2018 → 2018 → 11 |                         13 → 13 → 13 |
| 형제 1,000개 앞 Fragment 노출/숨김 | candidate |            1.5856 → 1.6637 → 1.4015 |                     2018 → 2018 → 11 |                         13 → 13 → 13 |
| 200개 다중 DOM 행 재정렬/교체      | baseline  |            1.5797 → 1.8698 → 1.4722 |                     1616 → 1616 → 11 |                         13 → 13 → 13 |
| 200개 다중 DOM 행 재정렬/교체      | candidate |            1.5826 → 1.8958 → 1.4715 |                     1616 → 1616 → 11 |                         13 → 13 → 13 |
| 같은 위치의 텍스트 갱신 대조군     | baseline  |            1.2853 → 1.3828 → 1.2948 |                       415 → 415 → 11 |                         13 → 13 → 13 |
| 같은 위치의 텍스트 갱신 대조군     | candidate |            1.2854 → 1.3827 → 1.2958 |                       415 → 415 → 11 |                         13 → 13 → 13 |

각 context에서 갱신 후 DOM/listener 수가 초기와 같고 dispose 후 host는 비었다. JS heap은 warmup/code/앱 상태를 포함하므로 증가분 전체를 누수로 보거나 DOM/listener 안정만으로 모든 heap 누수 부재를 선언하지 않는다.

## 번들 비용

Node24의 같은 gzip(level9)/Brotli 설정으로 비교했다. 기존 크기 guard는 변경하지 않았다. UMD br4,824→4,847B(+23B), 현재 guard보다23B 초과이며 이를 통과로 표시하지 않는다.

| 형식           | baseline raw/gzip/br B | candidate raw/gzip/br B |
| -------------- | ---------------------: | ----------------------: |
| lithent.mjs    |        18868/6343/5802 |         18928/6366/5831 |
| lithent.umd.js |        12759/5187/4824 |         12795/5210/4847 |
| lithent.cjs    |        12606/5234/4857 |         12644/5258/4883 |

## 보존과 다음 작업

- [raw 요약·분포·비용](./fragment-anchor-results.json), [영구 증거](./fragment-anchor-evidence.json.gz), [후보 패치](./fragment-anchor-candidate.patch), [재현 도구](../../experiments/fragment-anchor/README.md).
- 증거 128entries/890850B, SHA-256 `46d05f396300c5b95aab80b732d517850adc5cc0fe72567bee4ca643890604d1`. base64 decoded hash/size를 검사할 수 있다. raw·source/build·source maps·진단·경계 검사·실패/성공 검증 로그·도구·lock을 보존했다. Chromium 바이너리와 node_modules 전체는 포함하지 않는다.
- done: 독립 branch/worktree, 한정 prototype·회귀·실브라우저·시간/메모리·크기·독립 감사.
- next: snapshot/read-order를 보존하는 대안 또는 적용 가능한 계약을 검토한 뒤 새 후보로 비교한다. C2 결합·기본 채택·전체 peer 목표 판정은 별도다.
- blockers: 관찰 차이가 남고 two-rAF 이득을 입증하지 못했다. 작은 update 시간 차이/크기 비용을 함께 공개한다.
- commit: base `8056e0243c49a29ec9f4efcf5b00f90f6c1bbca7`. 구현 결과는 `experiment/fragment-anchor-cloud`에 보존하며 실제 tip은 `git log -1`로 확인한다. 원래 worktree의 docs 브랜치와 source는 유지했다.
