# DC-19B: snapshot을 보존한 앵커 loop 실험

2026-10-24, `experiment/fragment-anchor-cloud`, 기준 compact13 `8056e02`.
**미채택.** 첫 range 후보의 getter 차이를 해결했지만 이 환경/전용 화면에서 시간 이득을 입증하지 못했다. 후보는 patch/증거/구현 커밋에 보존하고 실행 소스는 compact13으로 복원한다.

## 변경과 관찰 계약

- suffix slice는 원래 위치에 남겨 snapshot을 유지했다. 배열 helper의 길이 고정·빈 슬롯 검사·값 읽기 순서를 명시적 for로 옮겼다. 앵커를 찾은 뒤에도 남은 index getter는 읽으며 해당 WDom 탐색만 생략한다.
- 단일 노드 helper를 분리해 placement의 `[item]`을 없앴다. 이미 캡처한 item을 넘기며 원본 children[i]를 다시 읽지 않는다. Map/LIS/C2 proof·factory·events·wrapper는 그대로다.
- exact source helper의 sparse/moving·getter 후속 원소 변이·사용되지 않는 index getter·직접 재귀 배열의 뒤 getter/throw·길이 snapshot 관찰은 baseline과 같았다. stub nodeType 기반 검사이며 전체 JavaScript prototype monkeypatch 동등성 증명은 아니다.

## 새 독립 A/B

- 수집 UTC `2026-10-23T23:02:45.457Z` ~ `2026-10-23T23:04:00.786Z`. Linux/Node v24.19.0, Chromium 151.0.7922.173 headless, CPU quota 200000 100000,8GiB. executable/protocol/source/fixture hash를 전후 고정했다.
- 세 화면×두 조건×두 순서×3 fresh page×30 retained=1,080표본. page별 warmup10, variant 순서를 round별 교대하고 다음 order에서 반전했다. 실패0이며 측정 중 build/test를 병행하지 않았다.
- 첫 후보와 시간 간격이 크다. 같은 8056 baseline으로 새로 수집했고 이전 range/Mac 표본과 합산하거나 후보 간 무작위 직접 비교로 해석하지 않는다.

| 화면                       | pooled update ms 기준→후보 |       첫 순서 |     반대 순서 | pooled 두 rAF ms |
| -------------------------- | -------------------------: | ------------: | ------------: | ---------------: |
| 형제1,000개 앞 노출/숨김   |              0.100 → 0.100 | 0.100 → 0.100 | 0.100 → 0.100 |  33.300 → 33.300 |
| 200행 다중 DOM 재정렬/교체 |              3.200 → 3.200 | 3.200 → 3.200 | 3.200 → 3.400 |  33.300 → 33.300 |
| 같은 위치 텍스트 대조군    |              0.200 → 0.200 | 0.200 → 0.200 | 0.200 → 0.200 |  33.300 → 33.300 |

update 값은0.1ms grid에 놓였고 세 pooled 중앙값은 표시 정밀도에서 같았다. 재정렬은 반대 순서3.2→3.4ms(+6.25%)였지만 첫 순서는 같았다. 작은 차이/부하를 확정 회귀로 해석하지 않는다. 두 rAF는 약33.3ms로 같았다. 이는 공식 클릭→최종 paint/peer 결과가 아니다.

## 제거된 소스 수준 작업

화면별12회 별도 진단이다. callback 횟수는 소스상 의미적 호출 수이며 V8 inline 여부나 물리적 allocation/time share를 직접 측정한 값이 아니다.

| 화면                       | suffix 배열 |   복사 원소 | singleton 배열 | helper 방문 | reduce callback |   노드 읽기 |
| -------------------------- | ----------: | ----------: | -------------: | ----------: | --------------: | ----------: |
| 형제1,000개 앞 노출/숨김   |     12 → 12 | 6006 → 6006 |          0 → 0 | 6006 → 6006 |        6006 → 0 |       6 → 6 |
| 200행 다중 DOM 재정렬/교체 |     19 → 19 |     12 → 12 |       1400 → 0 | 5612 → 4212 |        5612 → 0 | 4212 → 4212 |
| 같은 위치 텍스트 대조군    |       0 → 0 |       0 → 0 |          0 → 0 |       0 → 0 |           0 → 0 |       0 → 0 |

suffix 복사·전체 목록/diff 탐색·indexOf·실제 DOM 작업은 남는다. callback/singleton 제거만으로 사용자 체감 렌더링 향상을 약속하지 않는다.

## 검증·별도 메모리·크기

- 새 source의 공통 base core232개/54파일·strict TypeScript·ESLint/Prettier 통과. unchanged concurrent232와 frozen baseline의 새3회귀 증거는 같은 source/hash로 재사용했다. ESM 브라우저6gate/6진단·실제 CJS/UMD exports/생성 smoke 통과. full monorepo dual/64e2e 완료로 확대하지 않는다.
- variant/화면별3 fresh context,100갱신 전/후와 dispose 뒤 각각2회 GC. CDP heap은 공식 메모리와 구분한다. 모든 context에서 갱신 후 DOM/listener 수는 초기와 같고 dispose 뒤 host는 비었다. heap 전체 누수 부재를 확정하지 않는다.

| 화면                       | 조건      | initial → after → disposed heap MiB |        DOM nodes |    listeners |
| -------------------------- | --------- | ----------------------------------: | ---------------: | -----------: |
| 형제1,000개 앞 노출/숨김   | baseline  |            1.5878 → 1.6617 → 1.3995 | 2018 → 2018 → 11 | 13 → 13 → 13 |
| 형제1,000개 앞 노출/숨김   | candidate |            1.5880 → 1.6626 → 1.4004 | 2018 → 2018 → 11 | 13 → 13 → 13 |
| 200행 다중 DOM 재정렬/교체 | baseline  |            1.5791 → 1.8684 → 1.4686 | 1616 → 1616 → 11 | 13 → 13 → 13 |
| 200행 다중 DOM 재정렬/교체 | candidate |            1.5825 → 1.8995 → 1.4782 | 1616 → 1616 → 11 | 13 → 13 → 13 |
| 같은 위치 텍스트 대조군    | baseline  |            1.2853 → 1.3841 → 1.2963 |   415 → 415 → 11 | 13 → 13 → 13 |
| 같은 위치 텍스트 대조군    | candidate |            1.2855 → 1.3839 → 1.2952 |   415 → 415 → 11 | 13 → 13 → 13 |

| 형식           | baseline raw/gzip/br B | candidate raw/gzip/br B |
| -------------- | ---------------------: | ----------------------: |
| lithent.mjs    |        18868/6343/5802 |         18976/6368/5833 |
| lithent.umd.js |        12759/5187/4824 |         12836/5213/4845 |
| lithent.cjs    |        12606/5234/4857 |         12686/5261/4873 |

동일 Node24/zlib 설정의 UMD Brotli4,824→4,845B(+21B), 현재 guard+21B다. guard를 변경하거나 초과를 통과로 표시하지 않았다. 크기만으로 중단하지 않고 실제 시간·메모리까지 평가한 결과 미채택이다.

## 보존·판정·다음

- [raw 요약/분포](./fragment-anchor-snapshot-results.json), [후보 patch](./fragment-anchor-snapshot-candidate.patch), [영구 증거](./fragment-anchor-snapshot-evidence.json.gz), [도구](../../experiments/fragment-anchor/README.md).
- evidence 121entries/874531B, SHA-256 `bc1da9e7d1c9150a647e3e0af68f7ab15e883dc06dca20d8d778ef525ee3bc85`. raw·source17/실제 세 번들/maps·helper 관찰·검증 로그·도구·lock을 보존했다. Chromium/node_modules 전체는 미포함이다.
- Python이 모든 분포/중앙값/비율·1,080표본/18memory context·source/hash·작업량/관찰을 독립 감사했다. render 외16source는 baseline과 같다.
- done: 관찰 차이를 해결한 두 번째 한정 후보의 검증·새 A/B·비용·보존. 전체 peer 목표나 기본 채택은 달성하지 않았다.
- next: 다른 비용 축을 선정할 때 새 문서/가설/대조군으로 시작한다. 원래 C2 작업과 자동 결합하지 않는다.
- blockers: 이 전용 측정에서는 시간 이득이 없고 크기가 증가했다. prototype은 보존하고 현재 runtime은 compact13으로 복원한다. 실제 source/복원 커밋은 HANDOFF와 git log에서 확인한다.
