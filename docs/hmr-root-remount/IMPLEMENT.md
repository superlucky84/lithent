# IMPLEMENT — `<html>` 루트 컴포넌트의 반복 교체 (hmr-root-remount)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 재현·원인 확인, 문서 | done |
| 1 | 수정 (두 코어) | done |
| 2 | 회귀 테스트 | done |
| 3 | Integration Test | done |
| 4 | 릴리스 준비 | done — 발행 대기 |

## Phase 0 — 재현·원인 확인: done

Refs: RQ-1, RQ-2

- [x] SSR 템플릿: `src/layout.tsx` 3회 수정 → 2회째부터 `header=0 main=0 h1=0`, 오류 없음.
  수정 전 코드(`395aaee`)에서도 같다.
- [x] jsdom 재현(devHelper `createBoundary` + 두 코어): hydration은 2차, render는 1차 교체부터 본문이 사라진다.
- [x] 원인: 교체 뒤 루트 WDom의 `we`가 문서 밖의 옛 `<html>`을 가리킨다(`we === document.documentElement`가
  hydration은 1차 교체 뒤, render는 첫 렌더부터 false).

## Phase 1 — 수정: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4, DC-1

- [x] `src/render.ts`: `insertRoot(wDom, element)`, `render`·`typeAdd` 호출부
- [x] `lithentConcurrent/src/render.ts`: 같은 함수 추가, `render`·`typeAdd`의 분기를 교체
- 결과 (2026-11-20): base brotli 4,763 → **4,774B** (예산 4,800, 여유 26B).
  concurrent 6,667 → 6,690B (예산 9,000).

Files:
- `src/render.ts` (modified)
- `lithentConcurrent/src/render.ts` (modified)

## Phase 2 — 회귀 테스트: done

Refs: RQ-1, RQ-2

- [x] `devHelper/src/tests/boundary-htmlRoot.test.tsx`: `render`로 붙인 루트, 3회 교체 후
  `header` 1개, `h1` 1개, 최신 내용, `<html lang>` 유지
- [x] `ssr/src/tests/hydrationHtmlRootHmr.test.tsx`: `hydration`으로 붙인 루트(SSR 템플릿과 같은 상태), 3회 교체
- 결과 (2026-11-20): 수정 전 코어에서 두 테스트 모두 두 코어에서 실패, 수정 후 모두 통과.
- PR #129 첫 CI 실패: 처음에는 두 경우를 devHelper 테스트 하나에 두고 `lithent/ssr`을 import했다.
  devHelper 빌드가 테스트를 타입 검사할 때 ssr이 아직 빌드되지 않아 TS2307로 Quality가 멈췄다
  (로컬은 ssr dist가 이미 있어 드러나지 않음). hydration 경우를 ssr 패키지로 옮기고, dist를 모두 지운 뒤
  CI 순서대로 다시 확인했다(Phase 3).

Files:
- `devHelper/src/tests/boundary-htmlRoot.test.tsx` (added)
- `ssr/src/tests/hydrationHtmlRootHmr.test.tsx` (added)

## Phase 3 — Integration Test: done

Refs: RQ-2, RQ-3, RQ-4

- [x] `pnpm test:dual`: base 511, concurrent 390 + helper 8, 위성(두 코어) helper 51, devHelper 13,
  ftags 10, ssr 29, element 86(+3 skip, base)/89 — 모두 통과
- [x] `pnpm size`: 세 예산 모두 통과
- [x] `pnpm verify:concurrent`: 7개 통과 (이 환경은 Node 22라 `npm_config_force=true`로 엔진 검사만 넘김)
- [x] MANUAL M-1, M-2
- 주의 — **Vite 사전 번들 캐시.** 템플릿은 `@lithent/lithent-vite`가 `lithent`를 `optimizeDeps.include`로
  사전 번들한다. 워크스페이스에서 코어를 다시 빌드해도 `node_modules/.vite/deps/lithent.js`는 갱신되지
  않아, 처음 확인에서는 수정 전 코어로 돌았다. 템플릿으로 코어 수정을 확인할 때는 그 템플릿의
  `node_modules/.vite`를 지운다. npm 사용자는 버전이 바뀌면 lockfile이 바뀌어 캐시가 새로 만들어진다.

Files: none

## Phase 4 — 릴리스 준비: done (발행 대기)

Refs: DC-3

- [x] `lithent` 1.25.12, `lithent-concurrent` 0.2.8, CHANGELOG, RELEASING (2026-11-20, `21d7d89`).
  준비 검증은 [RELEASING](../../RELEASING.md) 첫 절.
- [ ] 발행 후 MANUAL M-3
