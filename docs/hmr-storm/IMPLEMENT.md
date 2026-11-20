# IMPLEMENT — HMR 반복 감지 E2E (hmr-storm)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 탐색 측정 (스크립트, git 밖) | done |
| 1 | 픽스처·스펙 | done |
| 2 | DOM 변경 감시, 음성 대조 | done |
| 3 | Integration Test | done |

## Phase 0 — 탐색 측정: done

- [x] `.e2e-work/stress/`의 일회용 스크립트로 직접 만든 앱 13개, SSR 템플릿 5개 시나리오를 재서 모두 멈추는 것을
  확인했다 ([../hmr-propagation/IMPLEMENT.md](../hmr-propagation/IMPLEMENT.md) Phase 3a). 그 과정에서
  `<html>` Layout 교체 버그를 찾았다 ([../hmr-root-remount/](../hmr-root-remount/)). 스크립트는 이 스펙으로 옮기고 지웠다.

## Phase 1 — 픽스처·스펙: done

Refs: RQ-1, RQ-3, RQ-4, RQ-5, DC-1, DC-5

- [x] `e2e/fixtures/hmr/storm/`: `index.html`·`main.tsx`(진입점), `App.tsx`, `Items.tsx`, `store.ts`, `Mixed.tsx`,
  `Thrower.tsx`, `CycleA.tsx`·`CycleB.tsx`, `document.html`·`document-main.tsx`·`Layout.tsx`
- [x] `e2e/server.mjs`: 플러그인 `include`에 `.e2e-work/<core>/storm/` 전체
- [x] `e2e/hmr-storm.spec.ts`: 테스트 3개 — 일반 편집(오류 없음), 예외·문법 오류(`plain`), `<html>` Layout
- 결과 (2026-11-20): 6개(3 × 두 코어) 통과, 1.1분.

Files:
- `e2e/hmr-storm.spec.ts` (added)
- `e2e/fixtures/hmr/storm/*` (added, 12개)
- `e2e/server.mjs` (modified)

## Phase 2 — DOM 변경 감시, 음성 대조: done

Refs: RQ-2, RQ-6, DC-2, DC-4

- [x] `addInitScript`로 `MutationObserver` 설치, settle 판정에 DOM 변경 수 포함
- [x] `e2e/server.mjs`: `LITHENT_E2E_MUTATION=hmr-storm`이면 `lithent/devHelper`를 소스로 보내고 `stormMutation`이
  `createBoundary.ts`를 고친다
- [x] `e2e/check-mutations.mjs`: `['hmr-storm', 'HMR storm: component', 1, /HMR still active/]`, 마지막 문구의 개수를
  `cases.length`로
- 결과 (2026-11-20): 결함 주입 시 concurrent에서 `component edit: HMR still active after 8000ms
  (updates/reloads/warnings/DOM changes 1/1/0/6706)`로 실패. DOM 변경 감시가 없으면 콘솔 값(갱신 1, 경고 0)만으로는
  멈춘 것으로 보였을 경우다. 정상 실행은 계속 통과.

Files:
- `e2e/hmr-storm.spec.ts` (modified)
- `e2e/server.mjs` (modified)
- `e2e/check-mutations.mjs` (modified)

## Phase 3 — Integration Test: done

Refs: RQ-5, RQ-6

- [x] `hmr-storm.spec.ts --repeat-each 3`: 18개 통과 (3.3분)
- [x] `node e2e/check-mutations.mjs`: 6개 음성 대조 모두 검출
- [x] Chromium E2E 전체(base·concurrent): **100개 통과** (1.9분, 기존 94 + 6)
- [x] `tsc -p e2e/tsconfig.json`, prettier 통과
- 환경: Node 22.23.5, Chromium만. Firefox·WebKit은 CI가 돌린다. 시간 기준(조용함 1초)이 느린 CI 러너에서
  흔들리면 `QUIET`·`LIMIT`을 조정한다.

Files:
- `e2e/README.md` (modified)
