# IMPLEMENT — 컴포넌트 없는 모듈의 HMR 전파 (hmr-propagation)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 문서 작성 | done |
| 1 | 실패하는 테스트 (단위, E2E) | done |
| 2 | 수정 | done |
| 3 | Integration Test (toolchain, E2E, mutation, 템플릿) | done |
| 3a | HMR 반복 점검 | done |
| 4 | 릴리스 준비 | 대기 — DESIGN DC-3 확정 필요 |

## Phase 0 — 문서 작성: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-5, DC-1, DC-2, DC-3, DC-4

- [x] 증상 재현: basic `src/favorites.ts`·`src/index.tsx`, widget `src/main.ts` 수정 시 서버 로그
  `hmr update <파일>`, 화면 변화·새로고침 없음 (2026-11-20, Vite 8.3.6, Chromium)
- [x] 원인 확인: `strings.ts`의 `if (${componentNames}.length)` 안의 `import.meta.hot.accept(`,
  Vite 클라이언트 `fetchUpdate`의 `if (!mod) return;`
- [x] 계약 확인: `packages/lithentVite/README.md` "Files without component boundaries propagate updates to their importers."

Files:
- `docs/hmr-propagation/REQUIREMENTS.md` (added)
- `docs/hmr-propagation/DESIGN.md` (added)
- `docs/hmr-propagation/IMPLEMENT.md` (added)
- `docs/hmr-propagation/MANUAL_TEST_CHECKLIST.md` (added)

## Phase 1 — 실패하는 테스트: done

Refs: RQ-1, RQ-2, DC-2

- [x] 단위: `packages/hmrParser/src/tests/propagation.test.ts`
  - 컴포넌트 없음 4종(store 모듈, render만 하는 진입점, `defineElement` 진입점, 컴포넌트 없는 marker 파일):
    변환 결과에 `import.meta.hot.accept`가 없고 `dispose`·`prune`은 있다.
  - 컴포넌트 있음 4종(`mount`, stateless, marker, 같은 파일에서 render): accept가 있다.
- [x] E2E: `e2e/hmr-propagation.spec.ts`, 픽스처 `e2e/fixtures/hmr/propagation.html`,
  `propagation-app.tsx`(render만 하는 진입점) → `Greeting.tsx`(컴포넌트) → `greeting-store.ts`
  (`lithent/helper` store, 컴포넌트 없음). `e2e/server.mjs`의 플러그인 `include`에 세 파일을 추가했다.
- 결과 (2026-11-20, 수정 전 코드):
  - 단위: 컴포넌트 없음 4종 실패(`expected true to be false`), 컴포넌트 있음 4종 통과.
  - E2E: base·concurrent 둘 다 첫 단계에서 실패 — `Expected: "next label"`, `Received: "original label"`.

Files:
- `packages/hmrParser/src/tests/propagation.test.ts` (added)
- `e2e/hmr-propagation.spec.ts` (added)
- `e2e/fixtures/hmr/propagation.html` (added)
- `e2e/fixtures/hmr/propagation-app.tsx` (added)
- `e2e/fixtures/hmr/Greeting.tsx` (added)
- `e2e/fixtures/hmr/greeting-store.ts` (added)
- `e2e/server.mjs` (modified)

## Phase 2 — 수정: done

Refs: RQ-1, RQ-3, RQ-4, DC-1

- [x] `createAcceptBlock(componentNames)`: 컴포넌트가 없으면 빈 문자열. accept 본문은 그대로 옮겼다.
- [x] `createHmrBootstrapBlock`의 `if (${componentNames}.length) { ... }`를 `${createAcceptBlock(componentNames)}`로 교체
- 결과 (2026-11-20): hmr-parser 38개 통과(새 8개 포함). prettier·eslint·tsc 통과.
  수정 후 E2E 새 스펙 base·concurrent 통과.

Files:
- `packages/hmrParser/src/strings.ts` (modified)

## Phase 3 — Integration Test: done

Refs: RQ-2, RQ-3, RQ-4, RQ-5

- [x] `pnpm test:toolchain`: hmr-parser 38, MDX 6, lithent-vite 5, template-parser 126, template-vite 5 통과
- [x] devHelper 11 통과
- [x] Chromium E2E 전체(base·concurrent): 94개 통과
- [x] HMR 스펙(`hmr-mixed-exports`, `hmr-propagation`, `hmr-stateless`, `contracts`) `--repeat-each 3`: 54개 통과
- [x] `node e2e/check-mutations.mjs`: 5개 음성 대조 모두 검출 (`hmr-reload` 포함)
- [x] MANUAL M-1~M-3 (MANUAL_TEST_CHECKLIST 참고)
- 실행 중 고친 것:
  - **테스트 간 간섭.** 첫 전체 실행에서 `hmr-stateless`가 두 코어 모두 마지막 `hmrToken` 검사에서 실패했다.
    새 스펙이 끝에서 진입점을 되돌리면 전체 새로고침이 생기는데, Vite는 JS 모듈 때문에 생기는 새로고침을
    `path: "*"`로 보내 그 서버의 **모든** 페이지를 새로고침한다. 그 신호가 다음 테스트 페이지에 도착했다.
    수정 전 코드에서는 `hmr-stateless` 단독 실행이 2회 모두 통과하는 것도 확인했다.
    → 새 스펙이 되돌린 내용이 자기 페이지에 반영될 때까지 기다린 뒤 끝나도록 했다.
  - 첫 전체 실행의 `scheduler` 실패 2건(concurrent)은 로컬에서 `lithent-concurrent/helper`를 빌드하지 않아
    생긴 HTTP 500이었다. 빌드 후 통과.
- 환경: Node 22.23.5(저장소 요구 24.22.1 없음, `pnpm_config_runtime_on_fail=ignore`), Chromium만.
  Firefox·WebKit은 CI에서 돈다.

Files:
- `e2e/hmr-propagation.spec.ts` (modified)
- `packages/lithentVite/README.md` (modified) — 진입점 수정은 새로고침된다는 문장 추가
- `docs/widget-template/README.md` (modified) — 원인 설명을 바로잡고 §6-4를 이 문서로 연결

## Phase 3a — HMR 반복(무한 루프) 점검: done

Refs: RQ-2, RQ-3

사용자 우려: 저장 한 번에 HMR이 끝없이 이어지는 버그가 여러 번 고쳐진 뒤에도 재발했다.

- 이력: 반복 경로는 매번 달랐고 경로별로 막혀 있다.
  | 시기 | 경로 | 장치 |
  |---|---|---|
  | 2025-11 (#82, `502f357`) | 경계 적용 실패 → invalidate 반복 | `__lithentSafeInvalidate` 상한 3회 |
  | 2025-12 (`2a3cdef`) | DOM 없는 인스턴스 재시도를 `setTimeout`으로 무한 반복 | devHelper `MAX_RETRY` 3 |
  | 2026-10 (#95, `5c0cd86`) | 교체 중 새로 등록된 자손을 다시 교체 | 교체 전 인스턴스 스냅샷 |
- Vite 쪽 방어: 한 모듈은 HMR 타임스탬프당 invalidate 1회(`lastHMRInvalidationReceived`),
  invalidate가 처음 모듈로 돌아오면 전체 새로고침(`circular import invalidate`).
- 이번 수정과의 관계: 버려지던 갱신을 전달할 뿐이다. 저장 한 번에 importer 경계 갱신 1회 또는
  새로고침 1회가 추가되고, 새 반복 경로는 없다.
- 실측 (2026-11-20, 수정 후 코드, Chromium): 저장 후 3초 동안의 HMR 갱신·새로고침·경고를 세고,
  이어지는 2.5초(SSR 3초) 동안 아무 활동이 없는지 본다. 되돌린 뒤에도 같은 검사를 한다.
  - 직접 만든 앱 13개 시나리오: 한 파일 여러 컴포넌트(Outer 2·Inner 4·Item 40), 40ms 간격 저장 5회,
    숨긴 상태에서 수정, store 수정, 진입점 수정, 비컴포넌트 export 3연속, 렌더 중 예외, 예외 후 복구,
    순환 import 3종, 문법 오류 후 복구, export 삭제 → **모두 수렴, 꼬리 활동 0**.
    가장 긴 경우가 렌더 중 예외(갱신 2, invalidate 2, 새로고침 1)였다.
  - SSR(Express) 템플릿 5개 시나리오: 페이지, 레이아웃, store, 클라이언트 진입점(`src/base/load.ts`),
    라우트 헬퍼 → **모두 수렴, 꼬리 활동 0**.
  - 한계: 사용자가 겪은 정확한 재현 조건은 모른다. 측정 스크립트는 E2E로 옮겼다
    → [../hmr-storm/](../hmr-storm/).
- **별도 버그 발견 (수정 전부터 있음):** SSR 템플릿에서 `<html>`을 렌더하는 `src/layout.tsx`를 두 번
  수정하면 두 번째에 `header`·`main`이 사라진다. 콘솔 오류는 없다. 첫 수정은 정상이고 Header만 수정할
  때는 정상이다. 수정 전 코드(`395aaee`)에서도 같다. 이번 수정 뒤에는 `src/favorites.ts` 수정도 Layout을
  교체하므로 이 버그를 만나는 경로가 늘어난다. → 릴리스 전에 고치는 것을 권한다 (DESIGN DC-3).
  → 수정 완료: [../hmr-root-remount/](../hmr-root-remount/).

## Phase 4 — 릴리스 준비: 대기

Refs: DC-3, DC-4

- [ ] DC-3 확정 후 `@lithent/hmr-parser` 0.2.6, `@lithent/lithent-vite` 0.4.1, CHANGELOG, RELEASING
- [ ] 발행 후 위젯 템플릿: `@lithent/lithent-vite` 범위를 `^0.4.1`로 올리고 `include` 우회 제거 (DC-4, M-3에서 동작 확인)
- [ ] 발행 후 MANUAL M-4
