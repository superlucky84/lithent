# IMPLEMENT — 컴포넌트 테스트 유틸 (`lithent/test`)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 문서 작성 | done |
| 1 | 패키지와 테스트 (두 코어) | done |
| 2 | 배포 연결 (exports, 빌드, 테스트, 릴리스 검사, CI 산출물) | done |
| 3 | 문서 사이트, README, CHANGELOG | done |
| 4 | 통합 검증 | done |

## Phase 0 — 문서 작성: done

Refs: RQ-1~RQ-9, DC-1~DC-7

Files:
- `docs/test-utils/REQUIREMENTS.md` (added)
- `docs/test-utils/DESIGN.md` (added)
- `docs/test-utils/IMPLEMENT.md` (added)
- `docs/test-utils/MANUAL_TEST_CHECKLIST.md` (added)

## Phase 1 — 패키지와 테스트: done

Refs: RQ-1~RQ-6, DC-2~DC-6, DC-9

- [x] `test/` 패키지 `lithent-test`: `src/index.ts`, vite·tsconfig (element와 같은 구성, `LITHENT_CORE=concurrent` alias).
  빌드 결과 `lithentTest.mjs` 1.68KB(gzip 0.90KB), `.cjs`, `index.d.ts`·`.d.cts`
- [x] 테스트 5개 파일:
  - `test-render`: 컨테이너·baseElement, 첫 렌더의 mountCallback, 사용자 컨테이너 유지, unmount·cleanup,
    언마운트 콜백 오류(코어가 정리를 끝내고 `reportError`로 알림 — 처음 테스트는 동기 throw를 가정해 틀렸다), DOM 없음
  - `test-act`: renew, 콜백 결과·비동기·거절, mountCallback 연쇄(`nextTick` 두 단계), store, 가짜 타이머,
    concurrent `deferRender` 시간 분할(base에서 skip)
  - `test-actScheduler`: 흉내 낸 스케줄러로 기다리기 규칙 (DC-9)
  - `test-interop`: `screen`·`within`·`fireEvent`·`findBy*`, `user-event` 입력
  - `test-autoCleanup`: 전역 `afterEach` 있음·없음, `LITHENT_TEST_SKIP_AUTO_CLEANUP`
- [x] 음성 대조:
  - 매크로태스크 한 번만 기다리게 바꾸면: 실물 concurrent `deferRender` 테스트는 **통과**(Node MessageChannel 순서, DC-9),
    `test-actScheduler`는 3개 모두 실패
  - `whenIdle`을 한 번만 기다리게 바꾸면: "idle 뒤 새 작업"과 "끝나지 않는 작업"이 실패
- 결과 (2026-11-20): base 24 통과 + 1 skip, concurrent 25 통과. `@testing-library/dom` 10.4.2, `user-event` 14.6.8 (devDependencies)

Files:
- `test/**` (added)
- `pnpm-workspace.yaml`, `pnpm-lock.yaml` (modified)

## Phase 2 — 배포 연결: done

Refs: RQ-6, RQ-7, RQ-8, DC-1, DC-7

- [x] 루트 `package.json`: `exports["./test"]`(import·require, 타입 포함), `files`(`test/dist`, `test/src/index.ts`,
  `test/package.json`, `test/README.md` — 테스트 파일은 넣지 않는다), `build:test`, `build:sequence`,
  `build:parallel` 제외 목록, `test:satellites`·`test`
- [x] 루트 vitest `exclude`에 `test/**` (넣지 않으면 루트 실행이 이 패키지 테스트 5개를 `@` alias가 다른 채로 모은다)
- [x] `.github/release-policy.json` lithent `sourcePaths`에 `test/`
- [x] `scripts/verify-release.mjs`: 경로 12개, ESM 내보내는 이름 `['act','cleanup','render']`, Node에서 `render`가
  DOM 없음 오류를 내는지(ESM·CJS), Bundler·Node16·NodeNext 타입 소비자에 `lithent/test`
- [x] `scripts/ci-build-artifacts.mjs`에 `test/dist`
- 결과: `verify-release` ALL PASS (12 public import paths). packed `lithent-1.25.12.tgz`에 `package/test/` 9개 파일

Files:
- `package.json`, `vite.config.js`, `.github/release-policy.json`, `scripts/verify-release.mjs`,
  `scripts/ci-build-artifacts.mjs` (modified)

## Phase 3 — 문서: done

Refs: RQ-9, DC-8

- [x] 문서 사이트 Testing 페이지(영어·한국어) `/guide/testing`, 사이드바 "Testing › Component Tests".
  390px에서 API 표가 긴 이름(`LITHENT_TEST_SKIP_AUTO_CLEANUP=1`) 때문에 33px 넘쳐, 표를 가로 스크롤 영역으로 감쌌다
  (SSR 페이지도 같은 원인으로 118px 넘치지만 이번 범위 밖)
- [x] `test/README.md`, CHANGELOG `Unreleased`(lithent 다음 minor, 템플릿 `@types/node`)
- [x] SPA·위젯 템플릿 `@types/node` `^20.19.0` → `^22.12.0` (DC-8), `check-templates-fresh basic widget` 통과
- [x] [../adoption/README.md](../adoption/README.md) "테스트" 행, IDEAS 우선순위 표

Files:
- `lithentDocs/src/pages/Testing.tsx`, `Testing_ko.tsx` (added), `Layout.tsx`, `Sidebar.tsx` (modified)
- `test/README.md` (added), `CHANGELOG.md` (modified)
- `createLithent/basic/package.json`, `createLithent/widget/package.json` (modified)
- `docs/adoption/README.md`, `docs/ideas/IDEAS.md` (modified)

## Phase 4 — 통합 검증: done

- [x] `pnpm build` (1분 56초), `pnpm test:dual`: base 511, concurrent 390 + helper 8, 위성(두 코어) helper 51,
  devHelper 12, ftags 10, ssr 30, element 86(+3 skip)/89, test 24(+1 skip)/25 — 모두 통과
- [x] `pnpm size`: base 4,774B (변화 없음), `verify:concurrent`, `verify-release` ALL PASS, 스크립트 테스트 49개,
  reliability mutations 모두 검출 (Node 22라 `--experimental-test-isolation=none`인 임시 사본으로 실행)
- [x] MANUAL M-1~M-3
- 환경: Node 22.23.5 (저장소 요구 24.22.1 없음, `pnpm_config_runtime_on_fail=ignore`), Chromium만
