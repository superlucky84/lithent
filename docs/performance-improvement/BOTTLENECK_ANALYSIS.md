# BOTTLENECK_ANALYSIS — js-framework-benchmark 기준 병목 분석

- 작성일: 2026-07-27
- 측정 환경: Node 20.3.0 + jsdom, `dist/lithent.mjs` (feat/alterSpeed 클린 상태 빌드)
- 측정 스크립트: js-framework-benchmark(keyed) 시나리오 재현 마이크로벤치
  (table > tr[key] > td×3 구조, renew() 후 microtask flush까지 측정)
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md)

## 1. 측정 결과 (기준선)

### 스케일링 (N행 keyed 리스트)

| N | create | 부분갱신(1/10) | swap | replace all | append(+10%) | clear |
|------:|------:|------:|------:|------:|------:|-----:|
| 500 | 26.8ms | 11.8ms | 13.8ms | 37.4ms | 11.1ms | 4.2ms |
| 1,000 | 43.3ms | 26.3ms | 40.1ms | 87.1ms | 33.1ms | 7.5ms |
| 2,000 | 74.9ms | 85.3ms | 126.6ms | 259.0ms | 121.9ms | 14.6ms |
| 4,000 | 154.0ms | 379.5ms | 394.2ms | 878.7ms | 419.2ms | 34.2ms |

**판정**: create/clear는 O(n) (2배 스케일 → 약 2배).
부분갱신·swap·replace·append는 2배 스케일에 **3~4배** 증가 → **O(n²) 확정**.

### js-framework-benchmark 실제 조건 (10,000행)

| 시나리오 (jsfb 대응) | 측정값 | 비고 |
|---|------:|---|
| create 10,000 rows | 414ms | O(n)이지만 상수비용 큼 |
| partial update (1/10 of 10k) | 700ms | 10개 행만 바뀌어도 전체 재-diff |
| **swap 2 rows (10k table)** | **2,719ms** | 최악 — 전 행 DOM 재삽입 발생 |
| **append 1,000 to 10,000** | **3,031ms** | 신규 행마다 형제 전체 스캔 |
| clear 10,000 rows | 90ms | 행 단위 removeChild + 이벤트 재귀 해제 |

> jsdom 측정이므로 절대값은 실브라우저와 다르지만, 스케일링 특성과 병목 순위는 동일하게 적용된다.
> jsfb 상위권 프레임워크는 이들 시나리오를 수십 ms 안에 처리한다.

## 2. 병목 목록 (영향도 순)

### B1. 순서 변경 시 전체 행 DOM 재삽입 — swap 2.7s의 주범

- 위치: `src/render.ts:117` (`typeSortedUpdate`), `src/render.ts:195` (`startFindNextBrotherElement`)
- 내용: keyed 리스트에서 순서가 하나라도 어긋나면(`chkDiffLoopOrder` 실패) 모든 자식이
  `T`(sorted update) 타입이 되어 행마다 DOM에서 뽑아 `insertBefore`로 재삽입한다.
  삽입 위치 탐색(`startFindNextBrotherElement`)이 `indexOf` + `slice` + 재귀 형제 스캔으로
  행당 O(n) → 전체 **O(n²) + 10k회 실제 DOM 이동**.
- 개선안: LIS(최장 증가 부분 수열) 기반으로 **이동이 필요한 최소 노드만** 재배치.
  swap이라면 2개 노드만 이동해야 정상. jsfb 상위권 구현의 표준 기법.

### B2. 신규 노드 삽입 위치 탐색 O(n²) — append 3.0s의 주범

- 위치: `src/render.ts:195-222` (`startFindNextBrotherElement`), `src/render.ts:224-239`
- 내용: `A`(add) 타입 노드마다 부모 children에서 `indexOf`(O(n)) + `slice`로 배열 복사 +
  뒤쪽 형제 전체를 스캔해 다음 실제 엘리먼트를 찾는다. 리스트 끝에 붙는 append조차
  "뒤에 형제가 없음"을 확인하기 위해 전체 스캔 → 1,000개 추가 시 1,000 × O(10k).
- 개선안: diff 단계에서 자식 인덱스/다음 형제 엘리먼트를 알고 있으므로 역순 순회로
  `nextSibling` 캐시를 넘기며 탐색을 O(1)화. `indexOf` 제거(부모가 인덱스 전달).

### B3. keyed 키 매칭 O(n²) — replace/부분갱신/append의 diff 비용

- 위치: `src/diff.ts:303` (`findSameKeyOriginalItem`), `src/diff.ts:291` (`splice(indexOf)`)
- 내용: 새 자식마다 이전 자식 배열을 `Array.find`로 선형 탐색.
  - replace all: 키가 전부 miss → 매번 전체 스캔 = n² 회 `getKey` 호출.
  - 부분갱신(순서 동일): find는 index 0에서 히트하지만 `splice(0,1)`이 매번 배열 전체를
    shift → O(n²) 메모리 이동.
- 개선안: 이전 자식들로 `Map<key, WDom>`을 1회(O(n)) 구축하고 조회 O(1),
  사용된 항목은 마킹만(“splice 제거” 폐지). 남은 항목이 unUsedChildren.

### B4. chkDiffLoopOrder O(n²) — 모든 keyed 업데이트마다 실행

- 위치: `src/diff.ts:137-162`
- 내용: `filter` 안에 `find` 중첩 ×2회 + `every` — 순서 비교에 3중 O(n²),
  호출마다 배열 복사 2회, `getKey` 호출 폭증. keyed 리스트가 갱신될 때마다 무조건 실행됨.
- 개선안: key → index Map으로 O(n) 비교. B1의 LIS 도입 시 이 검사 자체를 흡수 가능
  (순서 판별과 최소 이동 계산을 한 번의 O(n log n) 패스로 통합).

### B5. 전체 리스트 재-diff + 노드당 할당 비용 — partial update 700ms, create 414ms

- 위치: `src/wDom.ts:204-210` (`remakeChildren`), `src/diff.ts:246-262`, `src/diff.ts:31-65`
- 내용:
  - 10개 행만 바뀌어도 10,000행 전체의 wDom을 새로 만들고 전체를 재귀 diff.
  - 노드당 `getParent: () => ...` 클로저를 **h() 단계와 diff 단계에서 각각 새로 할당** +
    `Object.assign` 호출. 행당 노드 ~10개 × 10k행 = 렌더당 클로저 20만 개 수준.
  - 텍스트/props가 동일해도 노드 재생성 자체는 항상 수행됨.
- 개선안: 클로저 대신 `parent` 필드 직접 참조(할당 1회·공유), props 얕은 비교로
  변경 없는 노드의 `U` 처리 조기 종료, `assign` 대신 리터럴 생성.

### B6. prop/이벤트 처리의 상수 비용 — create·clear 경로

- 위치: `src/render.ts:329-394` (`updateProps`), `src/render.ts:265-277` (`removeEvent`),
  `src/utils/predicator.ts:131-138` (`hasAccessorMethods`), `src/utils/predicator.ts:96-97` (`checkVirtualType`)
- 내용:
  - prop마다 `Object.entries` 배열 생성 + `/^on/` 정규식 매칭.
  - 일반 attr마다 `hasAccessorMethods` → `Object.getOwnPropertyDescriptor` 프로토타입 조회
    (create 10k에서 attr 수만큼 반복).
  - `checkVirtualType`이 호출마다 `['f','l']` 배열을 새로 만들어 `includes` — 최다 빈도 호출부.
  - clear: 행마다 `removeChild` + `recursiveRemoveEvent` 전체 재귀.
- 개선안: `for-in` 루프 + `key[0]==='o'&&key[1]==='n'` 문자 비교, accessor 검사 결과를
  태그·키별로 캐시, `checkVirtualType`은 `type === 'f' || type === 'l'`로 교체,
  clear는 전체 삭제 감지 시 부모 `textContent = ''` 일괄 처리.

## 3. 시나리오 → 병목 매핑 (jsfb keyed 기준)

| jsfb 시나리오 | 지배 병목 | 예상 효과 |
|---|---|---|
| swap rows | **B1** (+B4) | O(n²)+전행 DOM 이동 → 노드 2개 이동 |
| append rows to large table | **B2** (+B3) | 3.0s → O(n) 수준 |
| replace all rows | **B3, B4** | diff 자체 O(n)화 |
| partial update | B3(splice), B4, B5 | 700ms 중 diff 고정비 제거 |
| create rows (1k/10k) | B5, B6 | 상수비용 절감 |
| select row | B5 | 전체 재-diff 고정비 절감 |
| remove row | B3, B2 | 동반 개선 |
| clear rows | B6 | 90ms → 일괄 삭제 |
| startup/메모리 | B5(클로저), B6 | 노드당 할당 감소 |

## 4. 권장 작업 순서

1. **P0 — B3+B4**: keyed diff를 Map 기반 O(n)으로 (diff.ts 국소 변경, 리스크 낮음, replace/partial 즉효)
2. **P0 — B2**: 삽입 위치 탐색 O(1)화 (render.ts, append/create 즉효)
3. **P1 — B1**: LIS 기반 최소 이동 (B4의 순서 검사와 통합, swap 해결 — 구조 변경 폭 가장 큼)
4. **P1 — B5**: 클로저/assign 할당 절감 + 무변경 노드 조기 종료
5. **P2 — B6**: 상수 비용 미세 최적화 (정규식/디스크립터/배열 할당 제거, clear 일괄 삭제)

각 단계는 독립적으로 벤치 전/후 측정 가능하며, 1→2→3 순서로만 해도
jsfb 주요 시나리오(swap 제외)의 O(n²)가 제거된다.

## 5. 재현 방법

측정 스크립트: [`bench/bench.mjs`](./bench/bench.mjs) (스케일링 500~4k),
[`bench/bench10k.mjs`](./bench/bench10k.mjs) (jsfb 10k 조건). `node bench/bench.mjs`로 실행.
핵심: jsdom 전역 세팅 → `dist/lithent.mjs` import → keyed tr 리스트 → `renew()` 후
`await Promise.resolve()`(microtask 배칭 flush)까지 측정.
