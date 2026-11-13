# DESIGN — create-lithent 기본 앱 교체 (create-lithent-templates)

- 작성일: 2026-11-13
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 표기: **확정** = 사용자 결정 또는 근거와 함께 닫은 결정, **제안** = 사용자 확인 전

## 1. 데모: 레시피 카탈로그 (RQ-1, RQ-3, RQ-4) — 확정

### 1.1 화면과 경로 (두 템플릿 공통)

| 경로 | 화면 | 보여 주는 lithent 기능 |
|---|---|---|
| `/` | 소개 문구, **Manual vs Reactive 카운터 카드 2개**, 카테고리 그리드 | `mount`+`renew()` / `lmount`+`lstate` |
| `/:category` | 카테고리 레시피 목록, 검색 입력, 정렬(시간·이름), 결과 수 | 클로저 변수 + `renew()`, `computed`, keyed 리스트 |
| `/:category/:recipe` | 레시피 상세, 인분 −/+ 로 재료 양 다시 계산, 즐겨찾기 토글 | 클로저 상태, 공유 `store` |
| 공통 헤더 | 홈 링크, 즐겨찾기 수 배지 | 다른 컴포넌트와 같은 `store` 구독 |
| 없는 경로·카테고리·레시피 | Not Found | — |

- basic은 `/main` 접두사를 없앤다. Vite dev·preview 서버는 SPA 경로를 `index.html`로 돌려준다.
- 화면 문구는 영어 (사용자 결정 2026-11-13).

### 1.2 데이터 (`src/data/recipes.ts`, 두 템플릿에 같은 파일)

```ts
export type Category = { id: string; name: string; emoji: string; color: string; blurb: string };
export type Ingredient = { amount: number; unit: string; name: string };
export type Recipe = {
  id: string; category: string; name: string; emoji: string;
  minutes: number; difficulty: 'easy' | 'medium' | 'hard';
  servings: number; summary: string;
  ingredients: Ingredient[]; steps: string[];
};
export const categories: Category[];
export const recipes: Recipe[];
export function getCategory(id: string): Category | undefined;
export function getRecipes(category: string): Recipe[];
export function getRecipe(category: string, id: string): Recipe | undefined;
```

- 카테고리 5개(breakfast, salads, soups, pasta, desserts), 카테고리당 레시피 3~4개.
- 이미지 없이 이모지와 카테고리 색만 쓴다. 외부 자산·폰트는 없다.
- 색은 Tailwind 정적 클래스 문자열로 데이터에 둔다(예: `bg-amber-500`). 동적으로 클래스를 조합하지 않아 Tailwind가 클래스를 찾을 수 있다.
  - Tailwind 설정의 `content` 경로가 `src/**`를 포함하는지 Phase 1에서 확인한다.

### 1.3 공유 상태: 즐겨찾기 (RQ-4, RQ-5)

- `src/favorites.ts`: `store<{ ids: string[] }>({ ids: [] })` (`lithent/helper`)
  - 함수: `toggleFavorite(id)`, `isFavorite(id)`, `loadFavorites()`, `saveFavorites()`
- **DC-1 저장 시점** — 확정: 앱 루트(basic `App`, express `Layout`)의 `mountCallback`에서 `localStorage`를 읽는다.
  - 서버와 첫 클라이언트 렌더는 둘 다 빈 목록이라 하이드레이션이 어긋나지 않는다.
  - `localStorage` 접근은 `try/catch`로 감싼다(사파리 프라이빗 모드 등).
- 헤더 배지와 상세 페이지 토글은 같은 store를 각자 `renew`로 구독한다. 한쪽에서 바꾸면 다른 쪽도 다시 그려진다.

## 2. basic(SPA) 구조

```
src/
├── index.tsx           render(<App />, root)
├── App.tsx             헤더 + 현재 경로 화면, popstate 등록/해제, 즐겨찾기 로드
├── router.ts           경로 store, navigate(), matchRoute()
├── favorites.ts
├── data/recipes.ts
├── components/
│   ├── Header.tsx
│   ├── Link.tsx        <a href> + 클릭 가로채기
│   ├── Counters.tsx    ManualCounter(mount) / ReactiveCounter(lmount)
│   └── NotFound.tsx
├── pages/
│   ├── Home.tsx
│   ├── Category.tsx
│   └── RecipeDetail.tsx
└── input.css
```

- **DC-2 라우터** — 확정: 직접 만든 작은 라우터를 유지한다. 패키지를 추가하지 않는다(README가 "dedicated router package is planned"라고 안내한다).
  - `router.ts`: `store({ path })`, `navigate(path)`은 `pushState`, `matchRoute(path)` → `{ name: 'home' | 'category' | 'recipe' | 'notfound', params }`.
  - `popstate`는 `App`의 `mountCallback`에서 등록하고, 반환하는 cleanup에서 해제한다(RQ-7).
  - 생성 시점 부수 효과는 없앤다. 초기 경로는 store 초기값 `location.pathname`으로 읽는다.
- **DC-3 Link** — 확정: `<a href={to}>`를 렌더한다. 수정키(meta/ctrl/shift/alt)나 가운데 클릭이 아니면 `preventDefault` 후 `navigate`한다(RQ-6).
- `.env.example`은 데모가 쓰지 않으므로 삭제한다. `public/assets/` 포켓몬 SVG를 삭제한다.
- `index.html` 제목은 `Lithent App`. 본문 루트는 `<div id="app">`. `document.body`에 직접 렌더하지 않는다.
- **DC-6 페이지 상태 초기화** — 확정 (구현 중 실험, 2026-11-13): `App`이 현재 페이지를 `[<div key={route.path}>…</div>]`로 감싼다.
  - lithent의 `key`는 리스트 diff에만 쓰이고 컴포넌트 props 타입에도 없다.
  - 같은 페이지 컴포넌트가 다른 props로 다시 쓰일 때 검색어·인분 같은 클로저 상태가 남지 않게 한다.

## 3. express(SSR) 구조

기반 코드는 유지한다(RQ-9): `server.js`, `sortFiles.js`, `watch-serve.js`, `serverHelper/*`, `src/base/*`.

```
src/
├── layout.tsx                  html/head/body, Header, 페이지 영역, 즐겨찾기 로드
├── favorites.ts, data/recipes.ts
├── components/  Header, Link, Counters, Loading, NotFound, Oops
└── pages/
    ├── index.tsx                     /           preload: categories
    ├── index._category.tsx           /:category  preload: category, recipes
    └── index._category._recipe.tsx   /:category/:recipe  preload: category, recipe
```

- 기존 `index._type.tsx`, `index._type._name.tsx`는 삭제한다.
  - 새 파일 이름이 서버 라우트(`server.js`의 `_` → `:`)와 클라이언트 매칭(`route.ts`)에 그대로 들어간다.
- `preload`는 로컬 데이터만 읽는다. 없는 카테고리·레시피면 `{ notFound: true }`를 돌려주고, 페이지가 `NotFound`를 렌더한다(RQ-10).
- **DC-4 Not Found의 HTTP 상태** — 확정: 서버 구조를 바꾸지 않으려고 200을 유지한다(RQ-9). 404 상태 반환은 후속 과제로 기록한다. → 후속 과제에서 404로 바꿨다(§3.8).
- `Link`는 `@/base/route`의 `navigate`를 쓴다. 클릭 처리 규칙은 basic과 같다.
- `layout.tsx`는 `bg-pokemon-*` 대신 중립 배경을 쓴다. `<title>`은 `preload.layout.title`이고, 기본값은 `Lithent App`이다.
- `assets/` 포켓몬 SVG를 삭제한다. 정적 경로 `/assets`는 서버에 그대로 둔다(사용자가 쓸 수 있는 자리).

### 3.1 스크립트 직렬화 (RQ-8) — 확정

- `serverHelper/helper.js`에 `serializeForScript(value)`를 추가한다.
  - `JSON.stringify` 결과에서 `<` `>` `&` U+2028 U+2029를 JSON 유니코드 이스케이프(백슬래시-u와 16진수 네 자리)로 바꾼다.
  - JS 문자열로서의 값은 그대로이고 HTML 파서가 `</script>`를 볼 수 없다.
- `devMakePage.js`, `prodMakePage.js`의 `load(...)` 인자 3개(key, props, initProp)를 모두 이 함수로 직렬화한다. key는 `JSON` 문자열 리터럴로 넣는다.
- 검증: 쿼리 `?q=</script><script>alert(1)</script>`로 요청했을 때 응답 HTML에 `</script><script>alert(1)`이 없다(Phase 4, M-4).

### 3.2 페이지 모듈 glob (RQ-13) — 확정, 구현 중 발견

- `src/base/route.ts`: `import.meta.glob('../pages/*.(tsx|mdx)')` → `import.meta.glob('../pages/*.{tsx,mdx}')`.
  - Vite 8이 괄호 대안 문법을 매칭하지 못해 빈 객체가 됐다. 중괄호 확장은 매칭된다.
  - 빌드 결과에 세 페이지의 동적 import가 들어간 것을 확인했다.

### 3.3 preload 데이터 전달 (RQ-14) — 확정, 구현 중 발견

- `makePageData`는 값만 돌려준다.
- `commonPageToString(Layout, Page, initProp)`이 `globalThis.pagedata = initProp` 직후 같은 동기 구간에서 `renderToString`을 호출한다.
- `run404`·`runOops`는 `null`을 넘긴다.
- 컴포넌트가 `getPreloadData()`로 전역을 읽는 기존 계약은 유지한다(RQ-9). 요청별 컨텍스트로 바꾸는 재설계는 하지 않는다(DC-12).
- `addLoaderFromPageString`은 대체 문자열 대신 함수를 넘긴다(`$'` 패턴 방지).

### 3.4 페이지 상태 초기화 (express)

- `layout.tsx`도 페이지를 `[<div key={routeRef.page.value}>…</div>]`로 감싼다(DC-6).
  - 같은 페이지 파일 안에서 경로만 바뀔 때(`/pasta` → `/soups`) 마운터가 다시 실행돼 새 preload 데이터를 읽는다.

### 3.5 라우트 우선순위 (RQ-15) — 확정, Phase 6에서 발견

- 규칙: 두 라우트가 처음 달라지는 위치에서 고정 세그먼트가 파라미터(`_name`)보다 먼저다. 그 외에는 긴 라우트가 먼저다(기존 동작).
- 서버 `sortFiles.js`를 이 비교 함수 하나로 다시 쓴다.
  - Express는 등록 순서로 매칭하고, 깊이가 다른 라우트끼리는 서로 매칭되지 않는다.
- 클라이언트 `src/base/route.ts`의 `findMatch`도 같은 비교 함수로 정렬한 뒤 찾는다.
  - 두 파일에 같은 규칙을 둔다. 서버는 JS, 클라이언트는 번들된 TS라 모듈을 공유하지 않는다.

### 3.6 개발 모드 404 (RQ-16) — 확정, Phase 7에서 발견

- `createViteServer`에 `appType: 'custom'`, `middlewareMode: true`를 준다.
  - Vite가 HTML과 404를 처리하지 않고 모듈만 서빙한다(Vite SSR 문서의 권장 설정).
- 404 핸들러를 개발·운영 공통으로 등록한다(`isDev`, `vite` 전달). 응답을 끝낸 뒤 부르던 `next()`는 지운다.

### 3.7 최신 범위 의존성 호환 (RQ-17) — 확정, 병합 후 발견

생성된 프로젝트는 lockfile 없이 캐럿 범위의 최신 버전을 받는다(2026-11-13 기준 TypeScript 5.9.3, ESLint 9.39.5, Prettier 3.10.1, Vite 8.3.8).
워크스페이스는 lockfile 버전(TypeScript 5.7.2, Prettier 3.4.2)이라 CI가 이 차이를 보지 못한다.

- **TypeScript 5.8+**: lithent의 JSX 타입에 `ElementChildrenAttribute`가 없어서, JSX children이 `children` prop으로 컴포넌트 props 타입과 대조된다.
  - 템플릿 `Link`의 props에 `children?: unknown`을 둔다(런타임 children은 마운터의 세 번째 인자).
  - 근본 해결은 lithent 코어 JSX 타입이다(§7 후속 과제).
- **Prettier 3.4.2 ↔ 3.10.1**: 여러 줄 유니온 타입의 포맷이 서로 다르다.
  - 두 버전이 같은 결과를 내도록 `CategoryFound`·`RecipeFound` 타입을 따로 두고 짧은 유니온으로 쓴다.

### 3.8 후속 과제 (RQ-18 ~ RQ-21) — 확정, 2026-11-13

- **HTTP 상태 (RQ-18)**: `MakePage`에 `status`를 둔다.
  - `run()`은 preload 결과가 `notFound`이면 404, 아니면 200이다. `runOops()`는 500, `run404()`는 404다.
  - `server.js`는 이 값으로 응답한다. DC-4를 대체한다.
- **의존성 정리 (RQ-19)**:
  - express: 쓰지 않는 `happy-dom`, `jsdom`, `@testing-library/jest-dom`, `vitest`, `terser`, `@tailwindcss/typography`, `@tailwindcss/postcss`, `eslint-config-prettier`를 지운다. `vite.config.js`의 빈 `test` 설정도 지운다.
  - basic: Tailwind를 `@tailwindcss/vite`와 `postcss.config.js`(`@tailwindcss/postcss`)로 두 번 처리했다. PostCSS 설정과 `@tailwindcss/postcss`, `postcss`, 쓰지 않는 `autoprefixer`를 지운다.
  - 검증: 정리 전후 빌드 CSS가 바이트 단위로 같아야 한다.
- **새 설치 정기 검사 (RQ-20)**: `scripts/check-templates-fresh.mjs`가 템플릿을 임시 폴더로 복사해 `npm install`(lockfile 없음) → `npm run build`를 한다(빌드에 TypeScript·ESLint 검사 포함).
  - express는 운영 서버를 띄워 `/` 200과 마크업, 없는 카테고리 404를 확인한다.
  - `.github/workflows/templates-fresh.yml`이 매주 월요일과 수동 실행으로 돌린다(DC-13).
- **문서 사이트 예제 (RQ-21)**: `Mounter.tsx`·`Mounter_ko.tsx`의 PokeAPI 예제를 `/api/users/:id`를 읽는 `UserCard` 예제로 바꾼다. 마운터에서 한 번 불러오는 설명은 그대로다.
- **템플릿 `Link` 우회 제거**: lithent 1.25.10([jsx-types](../jsx-types/DESIGN.md))이 발행된 뒤 템플릿의 `children?: unknown`을 지우고 `lithent` 의존 범위를 `^1.25.10`으로 올린다.

## 4. 화면 스타일

- 두 템플릿 공통: 밝은 중립 배경, 카드 UI, 카테고리 색은 포인트로만 쓴다. 모바일 1열, `sm` 2열, `lg` 3열.
- `input.css`/`main.css`에서 `bg-pokemon-*` 유틸리티와 v3 호환 블록 외의 데모 전용 CSS를 지운다. Loading 점 애니메이션 등 남은 컴포넌트가 쓰는 CSS는 유지한다.

## 5. README (RQ-11)

- `createLithent/basic/README.md`, `createLithent/express/README.md`를 새로 쓴다.
  - 시작 명령(`npm install`, `npm run dev`, pnpm은 괄호로), 경로 표, 프로젝트 구조, "여기부터 고치세요"(데모 삭제 방법), 배포 메모(SPA는 history fallback 필요).
- `createLithent/README.md`의 템플릿 설명에 "recipe catalog demo"를 한 줄 넣는다.

## 6. 결정 목록

- [x] DC-0 데모 주제·UI 언어 — 레시피 카탈로그(홈→카테고리→상세), 영어 (사용자, 2026-11-13. 주제의 레시피 선택은 제안을 따름)
- [x] DC-1 즐겨찾기 저장 — 루트 `mountCallback`에서 `localStorage` 로드 (SSR 불일치 방지)
- [x] DC-2 basic 라우터 — 작은 자체 라우터 유지, 리스너 lifecycle 정리
- [x] DC-3 Link — 실제 href + 클릭 가로채기, 수정키·가운데 클릭은 브라우저에 맡김
- [x] DC-4 express Not Found 상태 코드 — 처음에는 200 유지 → 후속 과제에서 404로 변경 (§3.8)
- [x] DC-5 범위 — basic + express 둘 다 (사용자, 2026-11-13)
- [x] DC-6 페이지 상태 초기화 — 경로를 key로 단 래퍼 배열 (§2, §3.4)
- [x] DC-7 express glob — 중괄호 확장 `*.{tsx,mdx}` (§3.2)
- [x] DC-8 preload 전역 설정 시점 — 렌더 직전 동기 구간 (§3.3)
- [x] DC-9 라우트 우선순위 — 고정 세그먼트 우선, 서버·클라이언트 같은 비교 함수 (§3.5)
- [x] DC-10 개발 모드 404 — `appType: 'custom'`, 404 핸들러 공통 등록 (§3.6)
- [x] DC-11 최신 범위 의존성 호환 — 템플릿에서 우회(`children?: unknown`, 짧은 유니온), 코어 타입은 jsx-types에서 수정 (§3.7)
- [x] DC-12 preload 요청별 컨텍스트 — 하지 않는다 (2026-11-13). `lithent/ssr`의 `renderToString`이 동기라서, 렌더 직전 전역 설정(§3.3)으로 요청 사이가 끊긴다. 서버 렌더가 비동기가 되면 다시 검토한다.
- [x] DC-13 새 설치 검사 시점 — PR이 아니라 매주·수동 (2026-11-13). npm 레지스트리 상태에 따라 결과가 달라질 수 있어 PR을 막지 않는다.
- [x] DC-14 basic의 Tailwind 처리 — Vite 플러그인만 남긴다. 빌드 CSS가 바이트 단위로 같음을 확인했다 (§3.8)

## 7. 후속 과제

| 과제 | 상태 |
|---|---|
| express 템플릿의 사용하지 않는 devDependencies 정리 | 완료 (Phase 9) — basic의 중복 PostCSS 처리도 정리 |
| express Not Found를 HTTP 404로 응답 | 완료 (Phase 9) — Oops는 500 |
| 문서 사이트 `Mounter.tsx`·`Mounter_ko.tsx`의 PokeAPI 예제 교체 | 완료 (Phase 9) |
| lithent 코어 JSX 타입 (TypeScript 5.8+ children, 리스트 key) | 완료 — [jsx-types](../jsx-types/IMPLEMENT.md), PR #118, lithent 1.25.10 |
| 새 설치 기준 템플릿 빌드 검사 | 완료 (Phase 9) — 매주·수동 워크플로 |
| express preload 요청별 컨텍스트 | 하지 않음 (DC-12) |
| 템플릿 `Link`의 `children?: unknown` 우회 제거 | 완료 (Phase 10) |
