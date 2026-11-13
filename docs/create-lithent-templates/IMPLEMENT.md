# IMPLEMENT — create-lithent 기본 앱 교체 (create-lithent-templates)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 규칙: 커밋하지 않는다. main 병합이 곧 배포이므로(REQUIREMENTS §3-1) Phase 7을 통과하기 전에는 PR을 병합하지 않는다.
- 각 템플릿 명령은 템플릿 디렉터리에서 `pnpm <script>`로 실행한다(워크스페이스 멤버라 의존성이 이미 설치되어 있다).

## 진행 현황

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 문서 작성 | done |
| 1 | basic: 데이터·상태·라우터·화면 | done |
| 2 | basic: 정리·README | done |
| 3 | express: 데이터·상태·화면 | done |
| 4 | express: 직렬화 보안 수정·정리·README | done |
| 5 | createLithent README·교차 확인 | done |
| 6 | Test Hardening | done |
| 7 | Integration Test | done (병합 후 수동 항목 남음) |

## Phase 0 — 문서 작성: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4, RQ-5, RQ-6, RQ-7, RQ-8, RQ-9, RQ-10, RQ-11, RQ-12, DC-0, DC-1, DC-2, DC-3, DC-4, DC-5

- [x] 두 템플릿, CLI 템플릿 URL, `check:scaffold`, CI 빌드 경로 조사
- [x] express XSS 경로 확인 (`JSON.stringify(props)`를 `<script>`에 삽입, `props.query`가 사용자 입력)
- [x] `lithent/ssr` `renderToString`이 텍스트·속성을 escape하는 것 확인 (`ssr/src/renderToString.ts:15-25`)
- [x] 사용자 결정 반영 (DC-0, DC-5)

Files:
- `docs/create-lithent-templates/REQUIREMENTS.md` (added)
- `docs/create-lithent-templates/DESIGN.md` (added)
- `docs/create-lithent-templates/IMPLEMENT.md` (added)
- `docs/create-lithent-templates/MANUAL_TEST_CHECKLIST.md` (added)

## Phase 1 — basic: 데이터·상태·라우터·화면: done

Refs: RQ-1, RQ-3, RQ-4, RQ-5, RQ-6, RQ-7, RQ-10, DC-1, DC-2, DC-3

- 진입 조건: Phase 0 완료
- [x] `src/data/recipes.ts` (DESIGN §1.2) — 카테고리 5개, 레시피 15개(카테고리당 3개)
- [x] `src/favorites.ts` (DESIGN §1.3)
- [x] `src/router.ts`, `src/components/Link.tsx` (DESIGN §2, DC-2, DC-3)
- [x] `src/App.tsx`: `mountCallback`에서 popstate 등록·해제, 즐겨찾기 로드
- [x] `Header`, `Counters`, `NotFound`, `Home`, `Category`, `RecipeDetail`
- [x] `index.tsx`·`index.html`: `#app`에 렌더, 제목 변경, `vite.config.js`의 `server.open`을 `/`로(지금 `/index.html`은 Not Found 경로가 된다)
- [x] Tailwind `content` 경로가 새 파일을 포함하는지 확인 — `./src/**/*.{tsx,ts,...}`라 포함
- 기본 테스트: `pnpm type-check`, `pnpm lint`, `pnpm build`
- 종료 조건: 세 명령 통과, 빌드 결과를 `vite preview`로 열어 세 경로가 렌더됨
- 결과 (2026-11-13): 세 명령 통과. `vite preview` + Playwright 스모크(스크래치 `smoke.mjs`) 21개 항목 통과.
  확인한 항목: 카운터 2종, 클라이언트 이동, 검색·정렬, 실제 href, 인분 계산, 즐겨찾기 배지·새로고침 유지, 뒤로/앞으로, Not Found 3종, 375px 가로 스크롤 없음, 콘솔 에러 없음.
- 구현 중 결정 (DESIGN §2에 반영):
  - **페이지 상태 초기화**: lithent의 `key`는 리스트 diff에서만 쓰이고, JSX 타입도 컴포넌트 props에 `key`를 허용하지 않는다.
    `App`에서 페이지를 `[<div key={route.path}>…</div>]` 배열로 감싸 경로마다 새로 마운트한다.
    코어로 실험해 보니 key 래퍼가 있으면 새로 마운트(`b:0`, mount 2회)되고, 없으면 이전 상태가 남는다(`b:1`).
  - Link의 children은 마운터에서만 받지만, 코어가 `compChild`를 그 자리에서 갱신하므로(`src/diff.ts:170`) 부모가 다시 렌더할 때 최신 값이 보인다.
  - 문구: "1 favorite", "Clicked 1 time"처럼 단수형을 맞췄다.
- 빌드 경고: `lithent/helper` store의 `notifyStoreWrite` namespace 조회 경고. 일부러 그렇게 만든 것이고(`helper/src/hook/store.ts` 주석), 이전 템플릿도 store를 써서 같은 경고가 났다.

Files:
- `createLithent/basic/src/data/recipes.ts` (added)
- `createLithent/basic/src/favorites.ts` (added)
- `createLithent/basic/src/router.ts` (added)
- `createLithent/basic/src/App.tsx` (added)
- `createLithent/basic/src/components/Link.tsx` (added)
- `createLithent/basic/src/components/Header.tsx` (added)
- `createLithent/basic/src/components/Counters.tsx` (added)
- `createLithent/basic/src/components/NotFound.tsx` (added)
- `createLithent/basic/src/pages/Home.tsx` (added)
- `createLithent/basic/src/pages/Category.tsx` (added)
- `createLithent/basic/src/pages/RecipeDetail.tsx` (added)
- `createLithent/basic/src/index.tsx` (modified)
- `createLithent/basic/index.html` (modified)
- `createLithent/basic/vite.config.js` (modified)

## Phase 2 — basic: 정리·README: done

Refs: RQ-2, RQ-11

- 진입 조건: Phase 1 완료
- [x] 포켓몬 파일 삭제: `src/pages/pokemon*.tsx`, `src/components/Main.tsx`, `mainbody.tsx`, `src/store.ts`, `src/helper/*`, `public/assets/*.svg`, `.env.example`
- [x] `src/input.css`에서 `bg-pokemon-*`, `text-pokemon-*` 제거(v3 테두리 호환 블록은 유지)
- [x] `tailwind.config.js`에서 basic이 쓰지 않는 `dots` 애니메이션 제거
- [x] `README.md` 다시 쓰기 (DESIGN §5)
- 기본 테스트: `grep -ri pokemon createLithent/basic --exclude-dir=node_modules --exclude-dir=dist` 결과 없음, `pnpm build` 통과
- 종료 조건: 위 두 검사 통과
- 결과 (2026-11-13): grep 결과 없음, `pnpm build`·`pnpm format:check` 통과. `public/` 폴더는 비어서 없어졌다.

Files:
- `createLithent/basic/.env.example` (deleted)
- `createLithent/basic/public/assets/*.svg` (deleted, 18 files)
- `createLithent/basic/src/components/Main.tsx` (deleted)
- `createLithent/basic/src/components/mainbody.tsx` (deleted)
- `createLithent/basic/src/helper/calculator.ts` (deleted)
- `createLithent/basic/src/helper/constants.ts` (deleted)
- `createLithent/basic/src/helper/request.ts` (deleted)
- `createLithent/basic/src/pages/pokemon.tsx` (deleted)
- `createLithent/basic/src/pages/pokemonDetail.tsx` (deleted)
- `createLithent/basic/src/pages/pokemonType.tsx` (deleted)
- `createLithent/basic/src/store.ts` (deleted)
- `createLithent/basic/src/input.css` (modified)
- `createLithent/basic/tailwind.config.js` (modified)
- `createLithent/basic/README.md` (modified)

## Phase 3 — express: 데이터·상태·화면: done

Refs: RQ-1, RQ-3, RQ-4, RQ-5, RQ-6, RQ-9, RQ-10, RQ-13, DC-1, DC-3, DC-4, DC-6, DC-7

- 진입 조건: Phase 1 완료(같은 데이터·컴포넌트 설계를 옮긴다)
- [x] `src/data/recipes.ts`, `src/favorites.ts` (basic과 같은 내용)
- [x] `components/Header`(basic과 같음), `Link`(`navigate` 사용), `Counters`(basic과 같음), `NotFound`·`Oops` 새 스타일(default export 유지)
- [x] `pages/index.tsx`, `index._category.tsx`, `index._category._recipe.tsx` (`preload`는 로컬 데이터, 없으면 `notFound`)
- [x] 옛 페이지 `index._type.tsx`, `index._type._name.tsx` 삭제
- [x] `layout.tsx`: 헤더, 중립 배경, 제목 `<페이지> · Lithent App`, `mountCallback`에서 즐겨찾기 로드, 페이지 key 래퍼(DESIGN §3.4)
- [x] **구현 중 발견**: 하이드레이션 고장 → glob 수정(DESIGN §3.2)
- 기본 테스트: `pnpm build`, `pnpm exec tsc --noEmit`, `pnpm exec eslint "src/**/*.{ts,tsx}"`
- 종료 조건: 세 명령 통과
- 결과 (2026-11-13): 세 명령 통과.
  운영 서버(`NODE_ENV=production node server.js`)에 basic과 같은 Playwright 스모크 21개 항목이 통과했다.
  - 처음 돌렸을 때는 카운터·검색·즐겨찾기가 모두 실패했고 콘솔에 `TypeError: s.v[e] is not a function`가 찍혔다.
  - main 템플릿을 `git archive`로 스크래치에 풀어 빌드해 보니 glob이 똑같이 `Object.assign({})`였다. 기존부터 있던 고장이다.
  - glob을 고친 뒤 통과했다.
  - 스모크 스크립트도 손봤다: express는 페이지 모듈을 비동기로 불러오므로 heading을 `waitFor`로 기다리게 했다.
    서버가 의도대로 404를 돌려주는 `/a/b/c` 요청의 에러는 집계에서 뺐다.
  - SSR 응답: `/`, `/pasta`, `/pasta/pesto-pasta`가 200이고 제목과 본문(재료 `200 g`, 단계)이 HTML에 들어 있다.
    `/nope`, `/pasta/nope`는 200 + Not Found(DC-4), `/a/b/c`는 404.

Files:
- `createLithent/express/src/data/recipes.ts` (added)
- `createLithent/express/src/favorites.ts` (added)
- `createLithent/express/src/components/Counters.tsx` (added)
- `createLithent/express/src/components/Header.tsx` (added)
- `createLithent/express/src/components/Link.tsx` (added)
- `createLithent/express/src/components/NotFound.tsx` (modified)
- `createLithent/express/src/components/Oops.tsx` (modified)
- `createLithent/express/src/pages/index.tsx` (modified)
- `createLithent/express/src/pages/index._category.tsx` (added)
- `createLithent/express/src/pages/index._category._recipe.tsx` (added)
- `createLithent/express/src/pages/index._type.tsx` (deleted)
- `createLithent/express/src/pages/index._type._name.tsx` (deleted)
- `createLithent/express/src/layout.tsx` (modified)
- `createLithent/express/src/base/route.ts` (modified)

## Phase 4 — express: 직렬화 보안 수정·정리·README: done

Refs: RQ-2, RQ-8, RQ-11, RQ-14, DC-8

- 진입 조건: Phase 3 완료
- [x] `serverHelper/helper.js`에 `serializeForScript` 추가, dev/prod `addLoaderFromPageString`에 적용 (DESIGN §3.1)
- [x] 대체 문자열을 함수로 바꿈 (DESIGN §3.3)
- [x] 직렬화 단위 검사: `</script>`, `<!--`, U+2028을 넣은 값이 `JSON.parse` 왕복으로 같고, 결과에 `<`가 없음
- [x] **구현 중 발견**: 요청 간 데이터 섞임 → preload 전역 설정을 렌더 직전으로 옮김 (DESIGN §3.3)
- [x] 포켓몬 파일 삭제: `src/helper/*` 전부(쓰는 곳 없음), `assets/*.svg`, `main.css`의 `bg-pokemon-*`·`text-pokemon-*`
- [x] `README.md` 다시 쓰기 (DESIGN §5)
  - 잘못된 생성 명령 `npx create-lithent-ssr`을 고쳤다.
  - 라우팅 규칙과 `preload` 동작, 상태 코드 메모를 넣었다.
- 기본 테스트: `grep -ri pokemon createLithent/express --exclude-dir=node_modules --exclude-dir=dist` 결과 없음, `pnpm build` 통과
- 종료 조건: 위 검사와 직렬화 검사 통과
- 결과 (2026-11-13):
  - 직렬화 검사 7건 통과(스크래치 `serialize-test.mjs`): `</script>`, `<!--`, U+2028/2029, `
## Phase 5 — createLithent README·교차 확인: done

Refs: RQ-1, RQ-11

- 진입 조건: Phase 2, 4 완료
- [x] `createLithent/README.md` 템플릿 설명 갱신 — 데모 소개 문단, SPA 정적 호스팅에 fallback 필요 안내
- [x] 두 템플릿의 `data/recipes.ts`·`favorites.ts`가 같은지 `diff` — `Counters.tsx`, `Header.tsx`까지 4개 모두 같음
- [x] 문서 사이트 QuickStart가 템플릿 내용(포켓몬, `/main`)을 언급하지 않는지 확인 — 없음
- 기본 테스트: `diff` 결과 없음
- 종료 조건: 위 확인 완료
- 결과 (2026-11-13): 완료. `createLithent/basic/index.html`은 Prettier 기준(`<!doctype html>`)으로 맞췄다. 원본도 Prettier를 통과하지 않던 파일이다.

Files:
- `createLithent/README.md` (modified)

## Phase 6 — Test Hardening: done

Refs: RQ-2, RQ-7, RQ-8, RQ-12, RQ-15, DC-9

- 진입 조건: Phase 1~5 완료
- [x] 두 템플릿 `src/`에 `fetch(`·`http` 호출 없음 (grep)
- [x] `pokemon`·`pokeapi` 흔적 없음 (`createLithent/`, `scripts/check-scaffold.mjs`)
- [x] `addEventListener`마다 대응하는 `removeEventListener`가 lifecycle cleanup에 있음 (basic `router.ts`). express는 `base/route.ts`의 앱 수명 popstate 리스너만 남음
- [x] XSS 회귀 검사: 운영·개발 모드 express 서버에 악성 쿼리로 요청 → `</script><script>alert(1)` 0회
- [x] 두 템플릿 prettier 검사 — basic `format:check`, express `src`·`serverHelper`·`server.js`·`sortFiles.js`·README 통과
- [x] README 라우팅 규칙 검증: 스크래치 복사본에 `about.tsx`, `blog._slug.tsx`, `zoo._slug.tsx`, `docs.mdx`를 추가해 SSR 응답과 브라우저 하이드레이션 확인
  - 이 검사에서 라우트 우선순위 문제를 발견해 고쳤다(DESIGN §3.5).
- 종료 조건: 모두 통과, 결과 기록
- 결과 (2026-11-13):
  - 라우트 검사 수정 전: 서버 `/blog/hello`가 Not Found를 렌더했다(클라이언트 이동은 정상).
  - 라우트 검사 수정 후: `/about`, `/blog/hello`, `/zoo/hello`, `/docs`(MDX), `/pasta`, `/pasta/pesto-pasta`가 모두 맞는 페이지를 렌더한다.
    `/pasta/nope`은 Not Found. 브라우저에서 `/about` 클릭 하이드레이션, MDX 렌더, `/zoo/client` 클라이언트 매칭 통과, 콘솔 에러 없음.
  - 스크래치 복사 때 셸 `*`이 `.prettierrc`를 빠뜨려 기본 설정으로 lint가 실패했다. 복사 방식의 문제였고, `ls -A`로 다시 복사해 확인했다.
    CLI와 `check-scaffold`는 점 파일을 포함해 복사한다.

Files:
- `createLithent/express/sortFiles.js` (modified)
- `createLithent/express/src/base/route.ts` (modified)
- `createLithent/basic/index.html` (modified)

## Phase 7 — Integration Test: done (병합 후 수동 항목 남음)

Refs: RQ-1, RQ-3, RQ-4, RQ-5, RQ-6, RQ-9, RQ-10, RQ-12, RQ-13, RQ-14, RQ-16, DC-10

- 진입 조건: Phase 6 완료
- [x] 저장소 루트 `pnpm build` (CI와 같은 전체 빌드, 두 템플릿 포함)
- [x] `node scripts/check-scaffold.mjs --check` (express 복사 → 빌드 → SSR 마크업·CSS), 기본·concurrent 코어 둘 다
- [x] Playwright 스모크 (스크래치 `smoke.mjs`, 21개 항목): basic preview, basic dev, express 운영, express dev
  - 홈 렌더, 카운터 두 개 클릭 증가, 카테고리 이동·검색·정렬, 상세 인분 조절, 즐겨찾기 토글 → 헤더 배지 → 새로고침 후 유지, 없는 경로 Not Found, 콘솔 에러 없음
  - express는 첫 응답 HTML에 레시피 마크업이 있고(SSR) 하이드레이션 후 클릭이 동작
- [x] 스크래치에 템플릿을 복사해 `npm install` 없이 워크스페이스 의존성으로 빌드 (`check-scaffold`와 Phase 6 라우트 검사)
- 종료 조건: 모두 통과, MANUAL_TEST_CHECKLIST의 병합 전 항목 결과 기록
- 결과 (2026-11-13):
  - `pnpm build` 성공. lint 경고 1건(`lithentConcurrent/helper/src/tests/deferred.tsx`)은 이번 변경과 관계없는 기존 파일이다.
  - `check:scaffold --check`: 기본 코어 9개 [ok], concurrent 코어 9개 [ok].
  - 스모크: basic preview 21/21, basic dev 21/21, express 운영 21/21, express dev 21/21.
  - **express dev에서 발견**: `/a/b/c` 테스트가 실패했다(빈 본문 404). `server.js`에 `appType: 'custom'`과 공통 404 핸들러를 넣었다(DESIGN §3.6).
    수정 뒤 dev 21/21이다. `/src/layout.tsx`, `/@vite/client`, `/src/base/load`, `/src/main.css`는 200으로 계속 서빙된다.
    TypeScript·ESLint checker는 0 errors이다.
  - `server.js` 수정 뒤 다시 검사: check-scaffold 9 [ok], 운영 스모크 21/21, 경쟁 조건 시뮬레이션 0건(두 방식).
  - 로컬에서 하지 못한 것: 실제 `npm install`로 새 폴더 생성(M-7), 네트워크 차단 실행(M-5).
    대신 src에 외부 호출이 없음(grep)과 SSR 검사가 로컬 데이터만으로 통과함을 확인했다.

Files:
- `createLithent/express/server.js` (modified)

## Handoff

- 완료: Phase 0~7. 커밋하지 않은 상태다.
- 다음 (사용자):
  1. 변경분 리뷰 → 커밋 → PR → CI 통과 후 병합. **병합이 곧 `npx create-lithent` 배포다.**
  2. 병합 후 MANUAL_TEST_CHECKLIST M-7(`npx create-lithent` 실제 생성), M-8(StackBlitz) 확인
- 후속 과제: DESIGN §7
- 블로커: 없음
- 블로커: 없음
- 브랜치 `feat/create-lithent-demo`, 기준 커밋 `9bbfb65` (작업분 미커밋)
 - [ ] `serverHelper/helper.js`에 `serializeForScript` 추가, dev/prod `addLoaderFromPageString`에 적용 (DESIGN §3.1)
- [ ] 직렬화 단위 검사: `</script>`, `<!--`, U+2028을 넣은 값이 `JSON.parse` 왕복으로 같고, 결과에 `<`가 없음
- [ ] 포켓몬 파일 삭제: `src/helper/*`(쓰지 않게 된 것), `assets/*.svg`, `main.css`의 `bg-pokemon-*`
- [ ] `README.md` 다시 쓰기 (DESIGN §5)
- 기본 테스트: `grep -ri pokemon createLithent/express --exclude-dir=node_modules --exclude-dir=dist` 결과 없음, `pnpm build` 통과
- 종료 조건: 위 검사와 직렬화 검사 통과
 $\``, null, 문자열 key, 중첩 객체.
  - 운영 서버에 `/?q=</script><script>alert(1)</script>`로 요청: 응답에 `</script><script>alert(1)`가 0회, 쿼리는 `\u003c/script\u003e…`로 들어갔다.
    `?q=
## Phase 5 — createLithent README·교차 확인: todo

Refs: RQ-1, RQ-11

- 진입 조건: Phase 2, 4 완료
- [ ] `createLithent/README.md` 템플릿 설명 갱신
- [ ] 두 템플릿의 `data/recipes.ts`·`favorites.ts`가 같은지 `diff`
- [ ] 문서 사이트 QuickStart가 템플릿 내용(포켓몬, `/main`)을 언급하지 않는지 확인
- 기본 테스트: `diff` 결과 없음
- 종료 조건: 위 확인 완료

## Phase 6 — Test Hardening: todo

Refs: RQ-2, RQ-7, RQ-8, RQ-12

- 진입 조건: Phase 1~5 완료
- [ ] 두 템플릿 `src/`에 `fetch(`·`http` 호출 없음 (grep)
- [ ] `pokemon`·`pokeapi` 흔적 없음 (`createLithent/`, `scripts/check-scaffold.mjs`)
- [ ] `addEventListener`마다 대응하는 `removeEventListener`가 lifecycle cleanup에 있음 (basic), express는 `base/route.ts`의 앱 수명 리스너만 남음
- [ ] XSS 회귀 검사: 운영 모드 express 서버에 악성 쿼리로 요청해 응답 확인
- [ ] 두 템플릿 prettier 검사 (`format:check` 또는 `prettier --check`)
- 종료 조건: 모두 통과, 결과 기록

## Phase 7 — Integration Test: todo

Refs: RQ-1, RQ-3, RQ-4, RQ-5, RQ-6, RQ-9, RQ-10, RQ-12

- 진입 조건: Phase 6 완료
- [ ] 저장소 루트 `pnpm build` (CI와 같은 전체 빌드, 두 템플릿 포함)
- [ ] `node scripts/check-scaffold.mjs --check` (express 복사 → 빌드 → SSR 마크업·CSS)
- [ ] Playwright 스모크 (스크래치 스크립트): basic preview와 express 운영 서버에서
  - 홈 렌더, 카운터 두 개 클릭 증가, 카테고리 이동·검색·정렬, 상세 인분 조절, 즐겨찾기 토글 → 헤더 배지 → 새로고침 후 유지, 없는 경로 Not Found, 콘솔 에러 없음
  - express는 첫 응답 HTML에 레시피 마크업이 있고(SSR) 하이드레이션 후 클릭이 동작
- [ ] 스크래치에 템플릿을 복사해 `npm install` 없이 워크스페이스 의존성으로 빌드 (`check-scaffold` 방식)
- 종료 조건: 모두 통과, MANUAL_TEST_CHECKLIST의 병합 전 항목 결과 기록

## Handoff

- 완료: Phase 0~2 (문서, basic 템플릿)
- 다음: Phase 3 (express 구현)
- 블로커: 없음
- 브랜치 `feat/create-lithent-demo`, 기준 커밋 `9bbfb65` (작업분 미커밋)
`도 원래 값 그대로 직렬화됐다.
  - 경쟁 조건 시뮬레이션(스크래치 `race-unit.mjs`, `MakePage`를 직접 구동, 동시 500건):
    - 수정 전: 공유 프로미스를 기다리는 preload에서 499건이 섞였다. 요청별 무작위 지연에서는 0건이었다.
    - 수정 후: 두 경우 모두 0건.
    - 실제 서버에 1,000건을 동시에 보낸 시험에서는 수정 전에도 0건이었다. 로컬 데이터라 preload가 바로 끝나기 때문이다.
  - grep 결과 없음, `pnpm build`·prettier 통과.

Files:
- `createLithent/express/serverHelper/helper.js` (modified)
- `createLithent/express/serverHelper/makePage.js` (modified)
- `createLithent/express/serverHelper/devMakePage.js` (modified)
- `createLithent/express/serverHelper/prodMakePage.js` (modified)
- `createLithent/express/src/helper/calculator.ts` (deleted)
- `createLithent/express/src/helper/clsx.ts` (deleted)
- `createLithent/express/src/helper/constants.ts` (deleted)
- `createLithent/express/src/helper/request.ts` (deleted)
- `createLithent/express/assets/*.svg` (deleted, 18 files)
- `createLithent/express/src/main.css` (modified)
- `createLithent/express/README.md` (modified)

## Phase 5 — createLithent README·교차 확인: todo

Refs: RQ-1, RQ-11

- 진입 조건: Phase 2, 4 완료
- [ ] `createLithent/README.md` 템플릿 설명 갱신
- [ ] 두 템플릿의 `data/recipes.ts`·`favorites.ts`가 같은지 `diff`
- [ ] 문서 사이트 QuickStart가 템플릿 내용(포켓몬, `/main`)을 언급하지 않는지 확인
- 기본 테스트: `diff` 결과 없음
- 종료 조건: 위 확인 완료

## Phase 6 — Test Hardening: todo

Refs: RQ-2, RQ-7, RQ-8, RQ-12

- 진입 조건: Phase 1~5 완료
- [ ] 두 템플릿 `src/`에 `fetch(`·`http` 호출 없음 (grep)
- [ ] `pokemon`·`pokeapi` 흔적 없음 (`createLithent/`, `scripts/check-scaffold.mjs`)
- [ ] `addEventListener`마다 대응하는 `removeEventListener`가 lifecycle cleanup에 있음 (basic), express는 `base/route.ts`의 앱 수명 리스너만 남음
- [ ] XSS 회귀 검사: 운영 모드 express 서버에 악성 쿼리로 요청해 응답 확인
- [ ] 두 템플릿 prettier 검사 (`format:check` 또는 `prettier --check`)
- 종료 조건: 모두 통과, 결과 기록

## Phase 7 — Integration Test: todo

Refs: RQ-1, RQ-3, RQ-4, RQ-5, RQ-6, RQ-9, RQ-10, RQ-12

- 진입 조건: Phase 6 완료
- [ ] 저장소 루트 `pnpm build` (CI와 같은 전체 빌드, 두 템플릿 포함)
- [ ] `node scripts/check-scaffold.mjs --check` (express 복사 → 빌드 → SSR 마크업·CSS)
- [ ] Playwright 스모크 (스크래치 스크립트): basic preview와 express 운영 서버에서
  - 홈 렌더, 카운터 두 개 클릭 증가, 카테고리 이동·검색·정렬, 상세 인분 조절, 즐겨찾기 토글 → 헤더 배지 → 새로고침 후 유지, 없는 경로 Not Found, 콘솔 에러 없음
  - express는 첫 응답 HTML에 레시피 마크업이 있고(SSR) 하이드레이션 후 클릭이 동작
- [ ] 스크래치에 템플릿을 복사해 `npm install` 없이 워크스페이스 의존성으로 빌드 (`check-scaffold` 방식)
- 종료 조건: 모두 통과, MANUAL_TEST_CHECKLIST의 병합 전 항목 결과 기록

## Handoff

- 완료: Phase 0~2 (문서, basic 템플릿)
- 다음: Phase 3 (express 구현)
- 블로커: 없음
- 브랜치 `feat/create-lithent-demo`, 기준 커밋 `9bbfb65` (작업분 미커밋)
