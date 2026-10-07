# 개선 적용 후 추가 진단 — 2026-10-07

기준 HEAD: `3989671` (`7f14950`의 코어 개선 포함).
`npx ctxbin help`, `npx ctxbin ctx load --meta`로 작업자 로그도 확인했다.
로그 작성자는 claude, 저장 시각은 `2026-10-07T09:51:32.447Z`다.
이번에는 코어를 수정하거나 커밋하지 않고 임시 빌드에서 후보를 비교했다.

## 판단

앞서 지적한 삭제의 O(n²), 메타데이터 삭제, props 파괴, redraw 함수 재생성은 이미 개선됐다.
같은 문제를 다시 개선 대상으로 삼을 필요는 없다.

추가 여지는 있지만 효과는 작아졌다. 가장 구체적인 후보는 다음과 같다.

1. **빈 슬롯·빈 훅 큐에서 불필요한 배열 생성을 줄이기** — 크기 예산 안에서 가능한 작은 정리.
2. **이미 같은 VDOM 객체인 경우 diff 입구에서 반환하기** — 일부 갱신에서 개선 신호. 약 17B 증가.
3. **키와 순서가 같을 때 Map 구성을 생략하기** — 선택 개선 신호가 있지만 다른 작업과 크기 검증 필요.

전체 삭제의 큰 차이를 메우는 값싼 변경은 이번 실험에서 찾지 못했다.
기존 로그의 일괄 DOM 삭제 약 7%, 리스너 해제 생략 약 18% 결과는 이번에 재측정한 값이 아니다.

## 1. 현재까지 적용된 작업 확인

`7f14950`에는 다음이 반영돼 있다.

- 형제 수 세기를 후보 수 + 1에서 중단: 다중 루트 컴포넌트 삭제도 선형화.
- 내부 메타데이터를 `delete` 대신 `undefined`로 정리.
- 이전 DOM props 객체를 파괴하지 않는 `updateProps`.
- 컴포넌트 props에서 실제로 사라진 키만 삭제.
- base의 redraw 등록을 컴포넌트당 한 번으로 변경.

작업자 로그에 따르면 최종 전체 테스트·dual·e2e 50개가 통과했다.
현재 빌드의 size report도 base **4,799 / 4,800B**, concurrent 6,287B와 일치했다.
기존 공식 러너의 로컬 결과는 Lithent 1.72, Preact 1.57, React 1.73이다.
이 값들은 이번 후보 적용 후의 점수가 아니다.

## 2. 추가 후보

### A. 빈 배열 처리 줄이기

관련 코드:

- `src/diff.ts:130` — `syncResolverChildren`.
- `src/hook/internal/useUpdate.ts:50` — 업데이트 후 콜백 큐 처리.
- `src/hook/mountCallback.ts`, `src/utils/universalRef.ts` — mount/unmount 큐 처리.

현재는 슬롯이 없는 행에서도 `children.splice(0, children.length)`를 호출한다.
길이가 0이어도 반환할 배열을 만드는 작업이며, 그 반환값은 사용하지 않는다.
`children.length = 0`이면 공유 배열 참조를 유지하면서 이 작업을 없앨 수 있다.

또한 `if (newWDom.ctor && queue)`에서 빈 배열도 참이므로, 훅이 없는 행도 `upCB = []`를 실행한다.
mount/unmount에도 같은 형태가 있다. 큐 길이가 0이면 이 재할당과 순회를 생략할 수 있다.
훅 순서 인덱스와 현재 컴포넌트 설정은 그대로 유지하는 실험이다.

슬롯 변경 단독은 brotli **4,795B**, 빈 큐 처리까지 합친 `queues`는 **4,799B**였다.
개별 실험에서 선택·부분 갱신에 작은 개선 신호가 있었지만 편차가 있어 큰 성능 개선으로 평가하지 않는다.
결합 `queues`는 크기·브라우저 동작만 확인했고 성능은 별도로 재지 않았다.

### B. 동일 VDOM의 빠른 반환

관련 코드: `src/diff.ts:18`의 `makeNewWDomTree`와 `:97` 부근의 렌더 유형 판정.

현재도 같은 객체면 `N`으로 처리한다. 다만 그 전에 VDOM 유형 판별, 같은 타입 검사,
`generalize`, 렌더 유형 판정 등을 거친다. `cacheUpdate`가 반환한 동일한 행 VDOM에도 반복된다.

실험은 diff 입구에서 `newWDom === originalWDom`이면 `nr = 'N'`을 설정하고 반환한다.
빈 VDOM의 삭제 동작은 유지하도록 `originalWDom.type`도 확인한다.
컴포넌트 실행이나 업데이트 훅을 props 비교로 생략하는 변경이 아니다.

| 진단 시간 중앙값 |   현재 | 동일 객체 빠른 반환 |   감소 |
| ---------------- | -----: | ------------------: | -----: |
| 선택             | 4.05ms |              3.70ms |  약 9% |
| 10행마다 갱신    | 5.70ms |              5.55ms |  약 3% |
| 교환             | 4.50ms |              4.00ms | 약 11% |
| 행 하나 삭제     | 4.50ms |              3.65ms | 약 19% |

코어 크기는 **4,816B**, 현재보다 +17B로 예산을 16B 넘는다.
부분 갱신의 차이는 작고 표본 편차도 있어, 릴리스용 적용 판단에는 공식 러너 재측정이 필요하다.
이 후보를 적용한 생성·전체 삭제의 정식 성능 검증은 하지 않았다.

### C. 같은 키·같은 순서에서 Map 구성 생략

관련 코드: `src/diff.ts:251`의 `diffLoopChildren`.

1,000개 키가 순서까지 같아도 Map에 전부 넣고 다시 조회·삭제한다.
길이와 각 위치의 키가 같으면 인덱스로 매칭하고, 다르면 현재 Map 경로를 쓰는 실험을 했다.
LIS를 생략하는 기존 실험과는 다른 부분이다.

첫 비교 묶음에서 선택 **4.25 → 3.35ms**, 부분 갱신 **5.85 → 5.45ms**였다.
크기는 **4,841B**로 +42B다. 생성에서는 일관된 개선이 없었고 전체 조합도 일관되게 빨라지지 않았다.
선택만 보고 바로 적용할 후보는 아니다. 고유 key를 전제로 한 실험이며 중복 key 지원을 추가하지 않는다.

## 3. 전체 삭제: 순회 단순화만으로는 큰 효과가 없음

`runUnmountQueueFromWDom`/`recursiveRunUnmount`를 하나로 줄이고, unmount와 이벤트 해제의
자식 순회를 `forEach`에서 인덱스 루프로 바꿨다. 이벤트 해제와 생명주기 순서는 유지했다.

충분히 반복하는 첫 비교에서는 전체 삭제가 **10.85 → 9.85ms**였다.
하지만 새 페이지마다 준비 실행 5회 후 여섯 번째 삭제만 재면 다음과 같았다.

| 후보               | 12개 새 페이지의 삭제 중앙값 |
| ------------------ | ---------------------------: |
| 현재               |                      10.20ms |
| 순회 단순화        |                      10.05ms |
| 빈 훅 큐 처리 생략 |                      10.35ms |

첫 비교의 약 9% 개선을 일반적인 효과로 주장할 수 없다.
순회 단순화는 크기도 4,812B로 늘었다. 현재 우선순위에서는 제외하는 편이 낫다.

더 큰 변경을 검토한다면, 이벤트를 가진 노드나 자식 컴포넌트의 정리 정보를 따로 관리하여
실제 정리 대상만 방문하는 설계가 다음 가설이다. 리스너 해제를 유지하면서 전체 VDOM 순회를
줄일 수 있을지 확인하는 것이다. 이번에는 구현·측정하지 않았다.
등록·갱신 비용, 메모리, unmount 순서, portal, 크기 예산을 함께 따져야 한다.

## 4. 제외한 후보와 측정 도구 주의점

- **자식 없는 노드의 배열 정규화·diff 준비 생략**: 크기 4,817B. 생성 시간의 일관된 개선이 없었다.
- **props가 둘 다 없는 경우 `updateProps` 즉시 반환**: 크기 4,804B. 선택 4.05 → 4.00ms로 차이가 작았다.
- **`Object.keys(props).forEach`를 단순 `for...in`으로 치환**: 크기는 4,787B로 줄지만 그대로 채택하면 안 된다.
  상속 속성이 있는 Proxy props에서 기존에는 없던 `deleteProperty('inherited')` 호출이 발생했다.
  현재 코어에서는 통과하고 이 후보에서 실패하는 진단 테스트로 확인했다.
  이 후보가 들어간 `compact`도 동일한 이유로 추천하지 않는다.
- **여러 후보의 일괄 적용**: 첫 비교 묶음에서 부분 갱신이 5.85 → 6.15ms였다.
  개선율을 합산해서 기대하면 안 된다.
- 기존 `audit.mjs`의 `props`, `op`, `metadata` 후보는 과거 소스 문자열을 치환한다.
  지금 소스에는 해당 문자열이 없어 변경 없이 실행될 수 있다. 현재 개선 전후 비교에 그대로 사용하면 안 된다.
  새 도구는 치환 대상이 사라지면 실패하도록 했다.

## 5. 검증과 해석 범위

- Chromium 153.0.8010.12, 최소화 빌드, 실제 benchmark CSS를 인라인으로 포함.
  폰트 URL은 빈 data URL로 대체했다.
- 일반 비교: CPU 4배, 준비 6회, 12회 × 2라운드, 두 번째 라운드는 후보 순서를 반대로 배치.
  표는 합친 24개 표본의 중앙값이다. 서로 다른 비교 묶음의 기준값을 혼용하면 안 된다.
- 새 페이지 삭제 비교: 후보마다 새 페이지 12개, 준비 실행은 1배, 측정은 4배, 측정 직전 GC.
  공식 러너의 준비 방식에 가깝게 만든 진단이며 공식 러너 자체는 아니다.
- 시간은 클릭부터 마이크로태스크 렌더 완료까지다. 페인트를 포함한 공식 점수로 환산하지 않았다.
- 기준 빌드, `identity + slots + empty`, `walk` 각각에서 임시 테스트 구성의 **110개**가 통과했다.
  저장소에서 복사한 코어 테스트와 3개 추가 계약 테스트이며, 전체 workspace/dual/e2e 검증은 아니다.
- 추가 계약은 캐시 적중 시 업데이트 훅 실행, unmount 콜백 후 리스너 해제,
  상속·Proxy props에서 own key만 삭제하는 기존 동작이다.
- 브라우저에서는 현재/identity/keys/queues × 8시나리오, **32개 조합**의 행 수·내용·선택·keyed DOM 정체성을 확인했다.
- propsLoop의 계약 테스트 1개 실패는 이 임시 후보의 회귀다. 현재 코어의 실패가 아니다.

## 재현 자료

- [followup-audit.mjs](./followup-audit.mjs): 현재 소스에서 메모리 내 임시 번들을 만든다.
- [followup-edits.mjs](./followup-edits.mjs): 측정한 후보의 정확한 변경 내용. 채택된 패치가 아니다.
- [followup-results.json](./followup-results.json): 원본 시간 표본, 크기, 검증 요약.
- 기본 출력 경로는 `/tmp/lithent-followup-audit`이며 `LITHENT_AUDIT_OUT`으로 변경할 수 있다.

```sh
node docs/benchmark/followup-audit.mjs measure base,walk,empty,slots,leaf,keys,combined select,update,clear,replace,create10k
node docs/benchmark/followup-audit.mjs measure base,propsGuard,identity,propsLoop,compact select,update,swap,remove
node docs/benchmark/followup-audit.mjs cold base,walk,empty clear
node docs/benchmark/followup-audit.mjs verify base,identity,keys,queues
node docs/benchmark/followup-audit.mjs size
```
