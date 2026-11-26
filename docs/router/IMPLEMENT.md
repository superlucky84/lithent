# IMPLEMENT — 공식 라우터 (`@lithent/router`)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 실행 환경 메모: 저장소 안에서는 `pnpm_config_runtime_on_fail=ignore`를 붙여 pnpm을 실행한다(REQUIREMENTS §4). 두 코어 실행은
  `LITHENT_CORE=concurrent`.

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 문서 작성, 열린 결정 정리 | in progress |
| 1 | 스파이크: 위험한 가정 확인 | todo |
| 2 | 패키지 골격, 경로·매칭 | todo |
| 3 | 브라우저 라우터 (이동, loader, 오류, 컴포넌트, 읽기 함수) | todo |
| 4 | SSR·hydration | todo |
| 5 | config 헬퍼 + Vite 플러그인 | todo |
| 6 | `flatRoutes()` | todo |
| 7 | 배포 연결 (workspace, 빌드, exports, 릴리스 검사, 크기) | todo |
| 8 | Test Hardening | todo |
| 9 | 템플릿 이전 (express, basic) — 병합은 Phase 12 뒤 | todo |
| 10 | 문서 (사이트, README, 에이전트 스킬, 디렉토리 규칙 예제) | todo |
| 11 | Integration Test | todo |
| 12 | 릴리스 (`@lithent/router` 0.1.0 발행 → 템플릿 병합) | todo |

## Phase 0 — 문서 작성: in progress

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-5, RQ-6, RQ-7, RQ-8, RQ-9, RQ-10, RQ-11, RQ-12, RQ-13, RQ-14, RQ-15, RQ-16, DC-1, DC-2, DC-3, DC-4, DC-5, DC-6, DC-7, DC-8, DC-9, DC-10, DC-11, DC-12, DC-13, DC-14, DC-15, DC-16, DC-17, DC-18, DC-19

- [x] 출발 상태 조사: express·basic 템플릿 라우팅, SSR 데이터 전달, concurrent export, 템플릿 배포 경로, 신뢰 발행 제약
- [x] RR 8.5.3 문서 확인: 세 가지 mode, `routes.ts` 헬퍼, `flatRoutes()` 폴더 규칙(폴더 = 라우트 하나)
- [x] 문서 4개 초안, `docatlas check` 오류 0 (docatlas 0.10.0)
- [x] DC-3·DC-4·DC-5·DC-6·DC-7 확정 (사용자, 2026-11-26). DC-7은 설계자 제안과 다르게 "RR처럼 유지"
- [ ] 남은 결정: DC-8~DC-16, DC-18 (DC-15는 Phase 3, DC-19는 Phase 1에서 측정·스파이크로 확정해도 된다)

진입 기준: 사용자 요청(2026-11-26).
완료 기준: Phase 1을 막는 남은 결정(DC-8·DC-10)이 확정되고 네 문서가 서로 맞는다.

## Phase 1 — 스파이크: 위험한 가정 확인: todo

Refs: RQ-3, RQ-9, RQ-10, DC-5, DC-6, DC-7, DC-9, DC-10, DC-19

진입 기준: Phase 0 완료.

- [ ] `Outlet` 깊이 전달(DC-19): `createContext`와 경량 context 두 후보를 base·concurrent·`renderToString`·`hydration`에서 시험
- [ ] alias 가정: `node_modules` 안 패키지의 `import * as core from 'lithent'`가 사용자 alias를 따라 concurrent를 받는지 — Vite dev, `vite build`, Vitest 각각
- [ ] `useRenew()` 기반 읽기 함수가 `mount`·`lmount`에서 동작하고 언마운트 때 구독이 풀리는지
- [ ] DC-7: params만 바뀔 때 인스턴스가 유지되고 props가 갱신되는지, keyed 자식 패턴(DESIGN §6.1)이 SSR 마크업·hydration과 어긋나지 않는지
- [ ] `deferRender`로 감싼 커밋이 두 코어에서 같은 최종 DOM을 내는지
- [ ] 결과를 DESIGN에 적고 DC-19·DC-9를 확정한다. 확정된 DC-6·DC-7이 가정과 다르게 동작하면 사용자에게 다시 묻는다. 스파이크 코드는 scratch에 두고 저장소에 넣지 않는다

기본 테스트: 스파이크마다 base·concurrent 실행 결과를 기록한다.
완료 기준: 위 다섯 항목의 결과가 DESIGN에 있고, 가정이 틀린 항목은 설계를 고쳤다.

## Phase 2 — 패키지 골격, 경로·매칭: todo

Refs: RQ-1, RQ-2, RQ-15, DC-1, DC-3

진입 기준: Phase 1 완료.

- [ ] `packages/router/` workspace 패키지: vite·tsconfig·vitest(`LITHENT_CORE=concurrent` alias, test 패키지와 같은 구성)
- [ ] 경로 유틸: `resolve`(상대·절대·`basename`), `createPath`·`parsePath`
- [ ] 매칭: 가지 펼치기, 선택 세그먼트 확장, 점수 순위(DESIGN §4), params 디코딩, 대소문자
- [ ] 테스트: RR 순위 사례, 템플릿의 `blog._slug` 대 `:category/:recipe` 사례, 끝 `/`, 잘못된 인코딩

기본 테스트: `pnpm --filter @lithent/router test` (두 코어), 기존 `pnpm test:dual` 변화 없음.
완료 기준: 매칭 테스트 통과, 코어 소스 diff 없음.

## Phase 3 — 브라우저 라우터: todo

Refs: RQ-3, RQ-4, RQ-5, RQ-6, RQ-7, RQ-8, RQ-10, RQ-14, DC-5, DC-6, DC-7, DC-8, DC-9, DC-11, DC-15, DC-18, DC-19

진입 기준: Phase 2 완료, DC-8·DC-9·DC-11·DC-18 확정.

- [ ] history(browser·memory), 상태와 `subscribe`, 이동 순서(DESIGN §5.2): lazy·loader 병렬, 재실행 기준, 중단, redirect 연쇄 상한
- [ ] 오류 배정, 404, 기본 오류 화면, `redirect`·`data`·`isRouteErrorResponse`
- [ ] `RouterProvider`, `Outlet`, `Link`, `NavLink`, 라우트 props, 읽기 함수(DESIGN §6)
- [ ] 우선순위 `auto`·`sync`·`deferred`(DESIGN §8), 스크롤(DC-18)
- [ ] 크기 측정 → DC-15 확정
- [ ] 테스트: `lithent/test`로 컴포넌트 테스트, 연속 이동·중단, 대기 중 이전 화면 유지, params만 바뀔 때 인스턴스 유지·props 갱신과 keyed 자식 초기화(DC-7), `lmount` 읽기 함수

기본 테스트: 패키지 테스트 두 코어, `pnpm test:dual` 변화 없음.
완료 기준: RQ-3~RQ-8, RQ-10 테스트 통과, 크기 예산 확정.

## Phase 4 — SSR·hydration: todo

Refs: RQ-9, DC-4, DC-10

진입 기준: Phase 3 완료, DC-10 확정.

- [ ] `createStaticHandler(routes).query(request)`: 매칭, loader, redirect → `Response`, 상태 코드
- [ ] `StaticRouterProvider`, `serializeHydrationData`(이스케이프, 운영 오류 숨김)
- [ ] 클라이언트 `hydrationData`, `router.ready()`, hydration에서 loader 미실행
- [ ] 테스트: 동시 요청 두 개가 겹쳐도 각자 데이터만 렌더, `</script>` 포함 데이터, hydration 뒤 첫 이동에서만 loader 실행

기본 테스트: 패키지 테스트 두 코어, `lithent/ssr` 테스트 변화 없음.
완료 기준: RQ-9 테스트 통과.

## Phase 5 — config 헬퍼 + Vite 플러그인: todo

Refs: RQ-11, DC-2, DC-12

진입 기준: Phase 4 완료, DC-12 확정.

- [ ] `@lithent/router/routes`: `route`·`index`·`layout`·`prefix`, `RouteConfig` 타입, 라우트 id 규칙
- [ ] `@lithent/router/vite`: `routes.ts` 실행, 가상 모듈, 운영 manifest, `routes.ts` 변경 시 새로고침
- [ ] 테스트: 임시 디렉토리 픽스처 프로젝트 `vite build` → 라우트별 chunk, manifest, SSR import 동작. 손으로 만든 규칙 함수를 섞은 config

기본 테스트: 패키지 테스트, `pnpm test:toolchain` 변화 없음.
완료 기준: RQ-11 테스트 통과.

## Phase 6 — `flatRoutes()`: todo

Refs: RQ-12, DC-2

진입 기준: Phase 5 완료.

- [ ] `flatRoutesFromFiles`(순수 함수)와 `flatRoutes`(fs)
- [ ] 테스트: DESIGN §11 표 전체, `ignoredRouteFiles`, `rootDirectory`, 폴더 안 다른 파일 무시, 이름 충돌 오류

기본 테스트: 패키지 테스트.
완료 기준: RQ-12 테스트 통과.

## Phase 7 — 배포 연결: todo

Refs: RQ-14, RQ-15, DC-3, DC-15

진입 기준: Phase 6 완료.

- [ ] `pnpm-workspace.yaml`, 루트 `build:router`·`build:sequence`·`build:parallel` 제외 목록, 테스트 스크립트 연결
- [ ] 패키지 `exports`(5개 진입점, import·require·타입), `files`, peer 의존성
- [ ] `.github/release-policy.json`에 패키지 추가, 설치 소비자 검사(ESM·CJS·Node16·NodeNext 타입), CI 산출물
- [ ] 크기 예산 검사(DC-15)
- [ ] 신뢰 발행 설정 요청을 사용자에게 남긴다(저장소 관리자 작업)

기본 테스트: `pnpm build`, `pnpm size`(코어 변화 없음), `pnpm verify:release`.
완료 기준: 설치 소비자 검사 통과, 크기 예산 안.

## Phase 8 — Test Hardening: todo

Refs: RQ-1, RQ-2, RQ-4, RQ-5, RQ-6, RQ-7, RQ-9, RQ-12

진입 기준: Phase 7 완료.

- [ ] 경계 사례: 인코딩된 params, 끝 `/`, `basename` 밖 주소, 같은 URL 이동, hash만 바뀌는 이동, 빠른 연속 이동, Error가 아닌 값 throw,
  redirect 순환, 언마운트 중 이동, loader가 `undefined` 반환
- [ ] 음성 대조: 순위 규칙·중단·hydration loader 미실행·요청별 데이터·`flatRoutes` 중첩 탈출을 일부러 깨뜨린 사본에서 테스트가 실패하는지 기록

기본 테스트: 패키지 테스트 두 코어.
완료 기준: 음성 대조가 모두 검출된다.

## Phase 9 — 템플릿 이전: todo

Refs: RQ-13, DC-7, DC-8, DC-13, DC-14, DC-16, DC-17

진입 기준: Phase 8 완료, DC-13·DC-14·DC-16 확정. 템플릿 변경은 이 단계에서 브랜치에만 두고, 병합은 Phase 12의 발행 뒤에 한다(DC-17).

- [ ] express: DESIGN §13.1 대응표대로 옮긴다. 개발 중에는 workspace 링크로 라우터를 쓴다
- [ ] basic: DC-14에 따른다
- [ ] `scripts/check-scaffold.mjs`: 라우터 구조에 맞게 고치고 기존 검사(SSR 200·404, 쿼리 직렬화, CSS) 유지
- [ ] e2e: 이동, 뒤로·앞으로, 대기 표시기, 404·500

기본 테스트: `pnpm check:scaffold`, `pnpm check:scaffold:concurrent`, `pnpm test:e2e`.
완료 기준: RQ-13 통과, 템플릿 README 갱신.

## Phase 10 — 문서: todo

Refs: RQ-16, DC-2, DC-6, DC-11

진입 기준: Phase 9 완료.

- [ ] 문서 사이트 가이드(영어·한국어): data mode, `routes.ts`, `flatRoutes()`, 디렉토리 규칙 예제, SSR, 두 코어, RR과 다른 점(호출 시점, 오류 범위)
- [ ] 패키지 README, CHANGELOG, 에이전트 스킬 참고 문서
- [ ] 디렉토리 규칙 예제 코드를 실행해 결과 config 확인

기본 테스트: `pnpm build:docs`.
완료 기준: M-7 통과.

## Phase 11 — Integration Test: todo

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-5, RQ-6, RQ-7, RQ-8, RQ-9, RQ-10, RQ-11, RQ-12, RQ-13, RQ-14, RQ-15, RQ-16

진입 기준: Phase 10 완료.

- [ ] `pnpm build`, `pnpm test:dual`, `pnpm test:toolchain`, 라우터 패키지 두 코어, `pnpm size`, `pnpm verify:release`, `pnpm test:ci`
- [ ] `check:scaffold` 두 코어, `test:e2e`
- [ ] MANUAL M-1~M-7

완료 기준: 모두 통과, 결과를 이 문서에 기록.

## Phase 12 — 릴리스: todo

Refs: RQ-13, RQ-15, DC-17

진입 기준: Phase 11 완료, 신뢰 발행 설정 완료.

- [ ] 라우터 PR 병합(템플릿 변경 제외) → `@lithent/router` 0.1.0 발행
- [ ] 템플릿 PR: 의존성을 발행된 버전으로 바꿔 병합
- [ ] 발행 후 MANUAL M-8

완료 기준: M-8 통과.

## Handoff

- 완료: Phase 0 문서 초안 4개 (`docs/router/`), DC-3~DC-7 확정. 원격 ctxbin의 `doc-driven-designer-v1` 스킬·에이전트 룰이
  로컬 설치본과 같음을 확인했다(2026-11-26).
- 다음: 남은 결정 확정. Phase 1을 막는 것은 DC-8(대기 UI)·DC-10(SSR 요청별 context). 그 뒤 DC-9·DC-11~DC-16·DC-18.
- 막힌 것: 없음. 참고로 저장소 안에서 `npx`는 `EBADDEVENGINES`로 멈추므로 저장소 밖에서 실행했다.
- 기준 커밋: `72222f3` (이 문서를 넣는 커밋은 브랜치 `claude/laughing-cray-axwyfr`의 다음 커밋)
