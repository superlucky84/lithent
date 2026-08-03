# REQUIREMENTS — Lithent 렌더링 성능 개선

- 브랜치: `feat/alterSpeed`
- 작성일: 2026-07-27 (최종 수정: 2026-07-27)
- 상태: **병목 분석 완료 — RC-2/RC-3 결정 대기**
- 관련 문서: [BOTTLENECK_ANALYSIS.md](./BOTTLENECK_ANALYSIS.md) → DESIGN.md (예정) → IMPLEMENT.md (예정) → MANUAL_TEST_CHECKLIST.md (예정)

## 1. 배경 및 목적

Lithent는 diff 시 최적화 알고리즘 없이 트리를 정직하게 전부 비교하는 구조라서
[js-framework-benchmark](https://github.com/krausest/js-framework-benchmark)(keyed)로
측정하면 성능 지표가 잘 나오지 않는다.
**이번 작업의 목적은 기존 동작을 그대로 유지하면서 js-framework-benchmark에서
좋은 성능 지표를 얻는 것**이다.

병목은 코드 분석 + jsdom 마이크로벤치 실측으로 확인 완료 —
상세는 [BOTTLENECK_ANALYSIS.md](./BOTTLENECK_ANALYSIS.md) 참조. 요약:

| 순위 | 병목 | 실측 근거 (10k행, jsdom) |
|---|---|---|
| B1 | 순서 변경 시 전 행 DOM 재삽입 (`render.ts` T-경로) | swap 2rows = **2,719ms** |
| B2 | 신규 노드 삽입 위치 탐색 O(n²) (`startFindNextBrotherElement`) | append 1k = **3,031ms** |
| B3 | keyed 키 매칭 O(n²) (`findSameKeyOriginalItem` + splice) | replace 4k = 879ms (2배당 ×3.4) |
| B4 | `chkDiffLoopOrder` O(n²) — keyed 갱신마다 실행 | 부분갱신 4k = 380ms (2배당 ×4) |
| B5 | 전체 리스트 재-diff + 노드당 클로저 2회 할당 | partial 1/10 of 10k = 700ms |
| B6 | prop 처리 상수비용 (정규식/디스크립터/배열 할당) | create 10k = 414ms, clear = 90ms |

## 2. 목표

- G1. js-framework-benchmark(keyed) 주요 시나리오에서 O(n²) 경로를 제거한다:
  swap / append / replace all / partial update가 리스트 크기에 선형(또는 n log n)으로 스케일.
- G2. 모든 최적화는 **벤치마크 전/후 실측 수치로 입증**한다.
- G3. 기존 동작(렌더 결과, 라이프사이클 순서, 공개 API)을 100% 유지한다.
  기존 전체 테스트(`pnpm build && pnpm test`) 통과가 필수 조건.
- G4. 코어 번들 크기: **최소화(minified) 빌드 brotli 기준 5KB 이하 유지** (RC-3 확정).
  - 크기 기준선 (2026-07-27 실측, zlib brotli 기본 옵션):

    | 파일 | raw | gzip | brotli |
    |---|---:|---:|---:|
    | lithent.umd.js (minified) | 11,309B | 4,510B | **4,169B** |
    | lithent.mjs (비압축최적화) | 15,983B | 5,076B | 4,626B |
    | preact 10.29.7 min (참고) | 11,360B | 4,839B | 4,410B |

  - 유효 예산: 4,169B → 5,120B, **여유 +951B (br)**.
  - 스트레치 목표: preact min(4,410B br)보다 작게 유지.

### 정량 기준선 (jsdom, 10k행 — 개선 목표는 RC-2에서 확정)

| 시나리오 | 기준선 | 목표 |
|---|------:|---|
| swap 2 rows | 2,719ms | O(n) 스케일링 달성 (수치 목표 `TBD RC-2`) |
| append 1,000 rows | 3,031ms | 〃 |
| partial update (1/10) | 700ms | 〃 |
| create 10,000 rows | 414ms | 상수비용 절감 (`TBD RC-2`) |

## 3. 범위

### 포함 (확정 — RC-1 결정 완료)

- S1. 성능 계측 수단: js-framework-benchmark 시나리오 재현 벤치 스크립트를 저장소에 추가.
- S2. keyed 리스트 diff 최적화 (B3, B4) — Map 기반 O(n) 키 매칭.
- S3. 렌더 경로 최적화 (B1, B2) — 삽입 위치 탐색 O(1)화, LIS 기반 최소 이동.
- S4. 할당 절감 (B5) — 클로저/assign 감소, 무변경 노드 조기 종료.
- S5. 상수비용 최적화 (B6) — 정규식/디스크립터 조회/배열 할당 제거, clear 일괄 삭제.
- S6. 변경 전후 동등성 검증: 기존 전체 테스트 통과 + 필요 시 keyed 시나리오 테스트 보강.

### 비범위 (Non-goals)

- N1. 공개 API 변경·추가 (`h`, `mount`, `lmount`, `render`, `portal`, `Fragment` 등 시그니처 불변).
- N2. helper / ssr / tag / ftags 패키지의 직접 수정 (코어 개선의 파급 효과는 허용).
- N3. 스케줄링/배칭 등 새 렌더링 모델 도입 (기존 microtask 배칭 유지).
- N4. js-framework-benchmark 공식 저장소 등재 작업 자체 (측정용 구현 작성은 S1 범위).

## 4. 제약

- C1. 패키지 매니저는 pnpm, 전체 테스트는 빌드 후 실행 (`pnpm build` → `pnpm test`).
- C2. WDom 노드의 `props`/`children` **배열·객체 참조 안정성**을 깨면 안 된다
  — 조상/클로저가 같은 배열 인스턴스를 공유 (`src/diff.ts:184-190` 주석 참조).
- C3. `nr`, `oc`, `op` 등 short-key 메타데이터 규약 유지 (번들 크기 사유).
- C4. Fragment / portal / hydration 경로의 동작 보존 (SSR 패키지가 코어에 의존).
- C5. `renew()`의 microtask 배칭(`queueMicrotask`, `src/utils/redraw.ts`) 동작 유지.
- C6. TypeScript strict 모드, 기존 ESLint/Prettier 규칙 준수.

## 5. 가정

- A1. jsdom 마이크로벤치의 절대값은 실브라우저와 다르지만 스케일링 특성·병목 순위는 동일하다.
  최종 지표 확인은 실브라우저(js-framework-benchmark 하네스)로 수행한다.
- A2. 기존 테스트 스위트가 렌더 결과 동등성의 1차 안전망이다.
  keyed 정렬/이동 경로는 커버리지 보강이 선행될 수 있다 (DESIGN.md에서 판단).
- A3. dist 빌드는 현재 src와 동기화된 상태로 측정되었다 (클린 워킹트리).

## 6. 검증 요구사항

- V1. 모든 최적화 단계는 벤치 전/후 수치를 IMPLEMENT.md에 기록한다.
- V2. `pnpm build && pnpm test` 전체 통과가 각 단계(phase)의 종료 조건이다.
- V3. 번들 크기(gzip)는 각 단계 종료 시 측정해 기준선과 비교 기록한다.
- V4. 최종 검증은 js-framework-benchmark 하네스(실브라우저)로 keyed 시나리오를 측정한다.
- V5. 릴리스 전 수동 확인 항목은 MANUAL_TEST_CHECKLIST.md에서 관리한다.

## 7. 결정 기록 (Requirements Checklist)

- [x] **RC-1**: 범위 — 렌더 경로(S3)·할당 절감(S4)·diff 구조 개선 **모두 포함**.
  근거: 실측 결과 최대 병목(swap 2.7s, append 3.0s)이 diff가 아닌 렌더 경로에 있어
  diff만 고쳐서는 jsfb 지표가 나오지 않음. (2026-07-27 사용자 결정)
- [x] **RC-4**: 벤치마크 — **js-framework-benchmark 시나리오 기준**.
  개발 중에는 저장소 내 재현 스크립트(jsdom)로 회귀 측정, 최종은 실브라우저 하네스.
  근거: 사용자 목적 자체가 jsfb 지표 개선. (2026-07-27 사용자 결정)
- [x] **RC-3**: 번들 크기 상한 — **minified 빌드 brotli ≤ 5KB** (스트레치: preact min 4,410B br 이하).
  근거: 실측상 현재 min 빌드는 4,169B br로 preact보다 작음. 풀 최적화(LIS 포함)의
  순증 예상은 +200~500B br(제거되는 O(n²) 코드로 일부 상쇄)로 예산 내 수용 가능.
  (2026-07-27 사용자 결정)
- [x] **RC-2**: 정량 목표 — DESIGN.md §5 제안 수치로 확정 (2026-07-27):
  jsdom @10k 기준 swap ≤ 100ms, append 1k ≤ 200ms, partial(1/10) ≤ 300ms,
  create ≤ 350ms, clear ≤ 50ms. 실브라우저 1차 목표는 react 수준, 2차 preact 근접.

## 8. 상태 / 핸드오프

- done: 병목 분석 (B1~B6 실측), RC-1·RC-3·RC-4 결정, 크기 기준선 실측
  (lithent min 4,169B br vs preact 4,410B br), DESIGN.md 초안 (Map+LIS 채택, D1~D6).
- next: RC-2 수치 확정 (DESIGN.md §5 제안 검토) → DC-1~DC-4 결정 → IMPLEMENT.md.
- blockers: DC-1(이동 마킹 방식)은 구현 착수 전 확정 필요.
- commit: (문서 커밋 전)
