# REQUIREMENTS — 공식 라우터 (`@lithent/router`)

- 브랜치: `claude/laughing-cray-axwyfr` / 기준 커밋 `72222f3`
- 작성일: 2026-11-26
- 상태: **설계 중 (Phase 0)** — 열린 결정은 [DESIGN.md](./DESIGN.md) §15
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 출처: 사용자 대화 (2026-11-26). 처음 제시된 과제: "공식 라우터 (`@lithent/router`) — express 템플릿이 state-ref로
  routeStore를 직접 만들어 쓴다. 중첩 라우트, 데이터 로더, 코드 스플리팅을 갖추고 concurrent 렌더링과 맞물리게 한다"
- 문서 위치: `docs/router/` — 새 패키지, 두 템플릿, 문서 사이트, 릴리스 스크립트에 걸친 작업이라 저장소 `docs/` 아래에
  둔다(기존 `docs/<feature>/` 관례).
- 코드 범위: `packages/router/`(새 패키지 `@lithent/router`, DESIGN DC-3), `createLithent/express/`,
  `createLithent/basic/`(DC-14), 루트 `package.json`·`pnpm-workspace.yaml`, `.github/release-policy.json`,
  `scripts/check-scaffold.mjs`·`scripts/verify-release.mjs`·`scripts/size-report.js`(필요 시), `e2e/`, `lithentDocs/`, `skills/`
- 참고 기준: React Router 문서 (최신 8.5.3, 2026-11-26 확인) — Modes, Framework Routing, File Route Conventions

## 1. 배경

### 1.1 출발 상태 (2026-11-26 확인)

| 구분 | 현재 |
|---|---|
| express 클라이언트 라우팅 | `src/base/route.ts`가 직접 매칭한다. 파일 이름의 `.`은 경로 구분자이고 `_`는 파라미터다. 중첩 레이아웃은 없다(모든 페이지가 `layout.tsx` 하나 아래). state-ref store `src/base/routeStore.ts`에 `page`·`renew`·`rVDom`·`loading`을 담고, 레이아웃 WDom의 `compProps`를 직접 고친 뒤 `renew`한다 |
| express 서버 라우팅 | `server.js`가 `src/pages` 파일마다 express 라우트를 등록하고, 등록 순서는 `sortFiles.js`가 정한다. 같은 순위 규칙이 `route.ts`에 한 번 더 구현돼 있다(주석 "Same order as the server") |
| 데이터 | 페이지 모듈의 `preload(props)`. 서버는 렌더 직전 같은 동기 구간에서 `globalThis.pagedata`를 설정한다(create-lithent-templates DC-12). 컴포넌트는 `getPreloadData()`로 전역을 읽는다 |
| 로딩 UI | `layout.tsx`가 `loading` 동안 페이지 대신 `<LoadingText />`를 그린다. 이동하는 동안 이전 화면이 사라진다 |
| 코드 스플리팅 | 클라이언트는 `import.meta.glob('../pages/*.{tsx,mdx}')`. 빌드는 페이지마다 lib entry를 만들고, 운영 서버는 `getScriptPath`가 `dist`를 뒤져 파일을 찾는다 |
| basic(SPA) | `src/router.ts`: `lithent/helper` store와 손으로 쓴 `matchRoute` |
| concurrent | `deferRender`·`whenIdle`·`hasPending`은 `lithent-concurrent`에만 있다. 사용자는 bundler alias로 코어를 바꾼다. 커밋은 쪼갤 수 없다(concurrent-rendering RC-10) |
| 템플릿 배포 | CLI가 템플릿을 GitHub main에서 바로 받는다(create-lithent-templates §1.1). main 병합이 곧 배포다 |

### 1.2 목적

벤치마크로 관심을 가진 사용자가 실제 앱을 만들 때 먼저 부딪히는 공백 — 중첩 라우트, 데이터 로딩, 코드 스플리팅,
SSR과의 연결 — 을 공식 패키지로 메운다. 템플릿마다 라우터를 손으로 짜는 상태를 끝낸다.

### 1.3 사용자 요청·결정 (2026-11-26 대화)

- react-router와 비슷하게 만들어, 나중에 react-router **프레임워크 모드**의 기능을 참고해 가져오기 쉽게 한다.
  TanStack Router도 비교 대상으로 언급했다. → DESIGN DC-1
- 파일 규칙·디렉토리 단위 라우팅도 되어야 한다. → DC-2
- framework 모드의 config 방식은 사용자가 디렉토리를 임의로 정하고 config에서 연결만 하면 된다는 점을 확인했다. → DC-2
- 대화에서 제안한 범위(① data mode core ② `routes.ts` config + Vite 플러그인 ③ `flatRoutes()` ④ 디렉토리 규칙은 문서 예제)로
  문서 설계를 시작하라고 요청했다. → DC-2

- 결정 질문에 답했다: 패키지는 `@lithent/router`(DC-3), loader는 서버·브라우저 둘 다에서 실행(DC-4), 라우트 데이터는
  props `{ loaderData, params, matches }`와 RR 이름의 읽기 함수(DC-5·DC-6), 같은 라우트에서 params만 바뀌면 RR처럼
  인스턴스를 유지(DC-7). DC-7은 설계자 제안(다시 마운트)과 다르게 정했다.

나머지 항목은 **제안**이며 DESIGN §15에서 `TBD`로 관리한다.

## 2. 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| RQ-1 | 라우트 트리: `path`, `index`, path 없는 layout 라우트, `children`. 경로 문법은 `:param`, `:param?`(선택), `*`(splat) | 단위 테스트 |
| RQ-2 | 매칭 순위는 선언 순서와 무관하게 RR 규칙을 따른다(DESIGN §4). 서버와 클라이언트가 **같은 matcher**를 쓴다 | RR 순위 사례를 옮긴 단위 테스트, 템플릿에서 서버·클라이언트가 같은 모듈을 import |
| RQ-3 | `<Outlet />`이 부모 라우트 안에 자식 매치를 그린다. index 라우트는 부모 URL에서 그려진다 | 단위 테스트(두 코어) |
| RQ-4 | 이동: `<Link to>`(보조키·`target`·다른 origin·`download`는 브라우저에 맡김), `<NavLink>`(활성 class·`aria-current="page"`), `navigate(to, { replace, state })`, 뒤로·앞으로(popstate), `basename` | 단위 테스트, M-2 |
| RQ-5 | 데이터: 라우트 `loader({ params, request })`. 매치된 라우트들의 loader를 병렬 실행한다. 이동할 때 다시 실행하는 기준은 RR 기본값(새 라우트, 그 라우트의 경로 변경, search 변경, 같은 URL로 이동. hash만 바뀌면 실행하지 않음) | 단위 테스트 |
| RQ-6 | 대기 상태: loader가 끝날 때까지 **이전 화면을 유지**하고 `navigation.state`(`idle`·`loading`)와 대상 location을 노출한다. push 이동의 URL은 커밋할 때 바뀐다. 연속 이동은 마지막 것만 커밋하고 앞선 loader는 `request.signal`로 중단한다 | 단위 테스트, M-1 |
| RQ-7 | 리다이렉트·오류: loader가 `redirect()`를 반환하거나 throw하면 그 주소로 replace 이동한다(연쇄 상한 있음). loader·lazy 오류와 매치 없음(404)은 가장 가까운 라우트의 오류 화면 export로 그린다. 컴포넌트 **렌더 중 오류는 범위 밖**(코어에 오류 경계가 없다) | 단위 테스트 |
| RQ-8 | 코드 스플리팅: 라우트 `lazy: () => import()`. 라우트 모듈은 `default`(컴포넌트), `loader`, 오류 화면, `handle`을 export한다. 매치된 라우트들의 lazy 모듈은 병렬로 받는다 | 단위 테스트, 빌드 결과에서 라우트별 chunk 확인 |
| RQ-9 | SSR: 서버가 요청 하나로 매칭·loader·렌더를 한다. loader 데이터는 **요청별로** 전달한다(전역 없음). 상태 코드 200·404·500과 3xx 리다이렉트. 응답 HTML에 라우트별 loader 데이터를 안전하게 직렬화하고(`</script>` 차단), 클라이언트 hydration은 loader를 다시 실행하지 않는다 | 단위 테스트(동시 요청 두 개가 서로의 데이터를 보지 않음 포함), M-3 |
| RQ-10 | 두 코어: base와 `lithent-concurrent`에서 같은 API로 동작한다. concurrent에서는 이동 뒤 새 화면을 빌드하는 동안 입력이 막히지 않는다(DC-9) | 두 코어 테스트 실행, M-4 |
| RQ-11 | config: `routes.ts`에서 `route`·`index`·`layout`·`prefix`로 URL과 파일을 연결한다. 파일 위치는 사용자가 정한다. Vite 플러그인이 라우트마다 chunk를 만들고, 서버와 클라이언트가 같이 쓰는 라우트 모듈과 manifest를 만든다 | 픽스처 프로젝트 빌드 테스트, M-5 |
| RQ-12 | `flatRoutes()`: RR `@react-router/fs-routes`와 같은 결과를 낸다 — 점(`.`) 중첩, `$param`, `_index`, `_` pathless, 세그먼트 끝 `_` 중첩 탈출, `$` splat, `($opt)`, `[ ]` 이스케이프, 폴더 + `route.tsx`(폴더 안 다른 파일은 라우트 아님), `ignoredRouteFiles`, `rootDirectory` | RR 문서 예시를 옮긴 단위 테스트, M-6 |
| RQ-13 | 템플릿: express 템플릿이 라우터로 옮겨 간다. URL, 404·500 응답, 쿼리 직렬화 안전성(create-lithent-templates M-4), 즐겨찾기, `<title>`이 지금과 같게 동작하고 `.mdx` 라우트 파일도 쓸 수 있다. `route.ts`·`routeStore.ts`·`sortFiles.js`·`getScriptPath` 검색은 없어진다. basic은 DC-14 | `check:scaffold`(두 코어), e2e, M-3 |
| RQ-14 | 코어 무변경: `lithent` 코어의 크기·API를 바꾸지 않는다. 라우터 런타임 크기 예산은 DC-15 | `pnpm size`, 코어 소스 diff 없음, 라우터 크기 측정 |
| RQ-15 | 배포: ESM·CommonJS, `.d.ts`·`.d.cts`. 런타임 의존성 없음(peer: `lithent`, 플러그인 entry만 `vite`) | 설치 소비자 검사(ESM·CJS·타입) |
| RQ-16 | 문서: 문서 사이트 가이드(영어·한국어), 패키지 README, 에이전트 스킬 참고 문서, **디렉토리 규칙을 직접 만드는 예제**(§1.3) | 문서 빌드, M-7 |

## 3. 비목표 (1차)

후속 단계 후보 — RR·TanStack에서 가져올 것:

- action·`<Form>`·fetcher (RR) — 후속 1순위
- 서버 전용 `loader` + `clientLoader` + 데이터 요청 (RR framework mode) — DC-4
- `shouldRevalidate`, `meta`·`links` export, `<Scripts />`·`<Meta />`·`<Links />` (RR)
- search param 스키마 검증, loader 캐시(`staleTime`), intent preload (TanStack)
- 타입 생성(RR `+types`). 1차는 `typeof loader`로 데이터 타입만 추론한다

1차에 하지 않는 것:

- 스트리밍 SSR, `defer`·`<Await>` — lithent에 Suspense가 없다
- 렌더 오류 경계 — 코어에 없다
- Declarative mode(JSX 안의 `<Routes><Route>`) — data mode로 대신한다
- 디렉토리 중첩 규칙을 공식 생성기로 제공하기 — 문서 예제로 대신한다(§1.3, DC-2)
- hash history, view transitions, prerender·SSG
- Vite 밖의 번들러용 플러그인 — data mode는 번들러와 무관하게 쓸 수 있다
- `lithent` 코어 수정

## 4. 제약·가정

- 템플릿은 GitHub main에서 바로 배포되므로, 템플릿 이전은 라우터를 npm에 발행한 **뒤에** 병합한다(DC-17).
- 새 npm 패키지는 신뢰 발행(trusted publishing) 설정을 따로 해야 한다(test-utils DC-1). 설정은 저장소 관리자가 한다.
- concurrent 감지는 `lithent/test`와 같은 방식(`import * as core from 'lithent'`로 받은 뒤 기능 확인)으로 하고,
  사용자의 alias가 `node_modules` 안 패키지의 `lithent` import에도 적용된다고 **가정**한다. Phase 1에서 확인한다.
- 개발 환경: 저장소는 Node 24.22.1을 요구하고 이 컨테이너는 22.23.5다. 저장소 안에서 `npx`가 `EBADDEVENGINES`로 멈추므로,
  pnpm은 `pnpm_config_runtime_on_fail=ignore`로 실행한다(test-utils Phase 4 기록과 같음).
- RR 기준 버전은 8.5.3 문서다. RR 규칙과 다르게 하는 곳은 DESIGN에 이유와 함께 적는다.

## 5. 이전(migration)

- 이미 생성된 express·basic 프로젝트는 스캐폴드 복사본이라 영향이 없다. 새로 만든 프로젝트부터 새 구조를 받는다.
- 페이지 모듈 계약이 바뀐다(템플릿 사용자용 안내를 문서에 넣는다): `preload` → `loader`, `getPreloadData()` → 라우트 컴포넌트
  props `loaderData`(DC-5), `{ notFound: true }` → `throw data(null, { status: 404 })`, 파일 이름의 `_param` → `routes.ts` 경로
  `:param`(DC-13). 대응표는 DESIGN §13.
