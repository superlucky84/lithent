# MANUAL_TEST_CHECKLIST — 렌더링 성능 개선 릴리스 전 수동 확인

- 작성일: 2026-08-03
- 대상: `feat/alterSpeed` 브랜치 (keyed diff Map+LIS, 렌더 배치 재작성, 할당·상수비용 절감)
- 사전 조건: `pnpm build && pnpm test` 전체 통과 상태에서 수행

## A. 자동 검증 재확인 (릴리스 직전 1회)

- [ ] A-1. `pnpm build && pnpm test` 전체 통과 (0 실패)
- [ ] A-2. `node docs/performance-improvement/bench/verify-order.mjs` → ALL PASS
- [ ] A-3. `node docs/performance-improvement/bench/bench10k.mjs` → RC-2 수치 회귀 없음
- [ ] A-4. min 빌드 brotli ≤ 5,120B
  (`node -e` zlib.brotliCompressSync on dist/lithent.umd.js)

## B. 예제/문서 앱 육안 확인 (실브라우저)

- [ ] B-1. `pnpm dev` (html/portal.html) — portal 데모가 지정 위치에 렌더되고
  버튼 인터랙션 후에도 위치·내용 정상
- [ ] B-2. `pnpm dev:examples` — 예제 전반 클릭/입력 인터랙션 정상,
  콘솔 에러 0건
- [ ] B-3. `pnpm dev:docs` — 문서 사이트 페이지 이동·코드 데모 정상
- [ ] B-4. 리스트 데모에서 추가/삭제/정렬 반복 후 DOM 순서가 데이터와 일치
  (개발자 도구로 실제 노드 순서 확인)

## C. SSR / Hydration

- [ ] C-1. createLithent 보일러플레이트(또는 ssr 예제)로 SSR 페이지 생성 →
  hydration 후 이벤트 동작 확인 (재렌더 없이 인터랙티브해지는지)
- [ ] C-2. hydration 후 keyed 리스트 갱신(추가/삭제/정렬)이 정상 동작

## D. 실브라우저 성능 판정 (Phase 5, RC-2 최종)

- [ ] D-1. js-framework-benchmark 하네스에 lithent keyed 구현 추가, 로컬 실행
- [ ] D-2. keyed 시나리오(create 1k/10k, replace, partial, select, swap,
  remove, append, clear) 측정값 기록
- [ ] D-3. 동일 머신에서 react·preact와 비교표 작성 — 1차 목표: react 수준
- [ ] D-4. swap·clear의 jsdom 경계/미달 항목이 실브라우저에서 목표 충족하는지 판정
- [ ] D-5. 결과를 REQUIREMENTS.md §8 상태와 IMPLEMENT.md Phase 5에 기록

## 통과 기준

- A·B·C 전 항목 체크 + 콘솔 에러 0건.
- D는 측정·기록 완료가 기준 (수치 미달 시 릴리스 보류가 아니라
  REQUIREMENTS.md RC-2 재협의 대상).
