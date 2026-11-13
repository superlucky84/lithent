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
- **DC-4 Not Found의 HTTP 상태** — 확정: 서버 구조를 바꾸지 않으려고 200을 유지한다(RQ-9). 404 상태 반환은 후속 과제로 기록한다.
- `Link`는 `@/base/route`의 `navigate`를 쓴다. 클릭 처리 규칙은 basic과 같다.
- `layout.tsx`는 `bg-pokemon-*` 대신 중립 배경을 쓴다. `<title>`은 `preload.layout.title`이고, 기본값은 `Lithent App`이다.
- `assets/` 포켓몬 SVG를 삭제한다. 정적 경로 `/assets`는 서버에 그대로 둔다(사용자가 쓸 수 있는 자리).

### 3.1 스크립트 직렬화 (RQ-8) — 확정

- `serverHelper/helper.js`에 `serializeForScript(value)`를 추가한다.
  - `JSON.stringify` 결과에서 `<` `>` `&` U+2028 U+2029를 `<` `>` `&` ` ` ` `로 바꾼다.
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
- 컴포넌트가 `getPreloadData()`로 전역을 읽는 기존 계약은 유지한다(RQ-9). 요청별 컨텍스트로 바꾸는 재설계는 하지 않는다.
- `addLoaderFromPageString`은 대체 문자열 대신 함수를 넘긴다(`

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
- [x] DC-4 express Not Found 상태 코드 — 200 유지, 404는 후속 과제
- [x] DC-5 범위 — basic + express 둘 다 (사용자, 2026-11-13)
- [x] DC-6 페이지 상태 초기화 — 경로를 key로 단 래퍼 배열 (§2, §3.4)
- [x] DC-7 express glob — 중괄호 확장 `*.{tsx,mdx}` (§3.2)
- [x] DC-8 preload 전역 설정 시점 — 렌더 직전 동기 구간, 요청별 컨텍스트 재설계는 하지 않음 (§3.3)
- [x] DC-9 라우트 우선순위 — 고정 세그먼트 우선, 서버·클라이언트 같은 비교 함수 (§3.5)
- [x] DC-10 개발 모드 404 — `appType: 'custom'`, 404 핸들러 공통 등록 (§3.6)
- [x] DC-11 최신 범위 의존성 호환 — 템플릿에서 우회(`children?: unknown`, 짧은 유니온), 코어 타입 수정은 후속 (§3.7)

## 7. 후속 과제 (이번 범위 밖)

- express 템플릿의 사용하지 않는 devDependencies 정리(`happy-dom`, `jsdom`, `@testing-library/jest-dom` 등, 실제 사용 여부 확인 필요)
- express Not Found를 HTTP 404로 응답
- 문서 사이트 `Mounter.tsx`·`Mounter_ko.tsx`의 PokeAPI 예제 교체
- **lithent 코어 JSX 타입**: TypeScript 5.8+에서 children을 받는 컴포넌트마다 props에 `children`이 필요하다. `JSX.ElementChildrenAttribute` 선언 등 코어 타입 수정 검토 (§3.7)
- 템플릿 CI가 lockfile 버전만 검사한다: 생성 프로젝트처럼 최신 범위로 설치해 빌드하는 검사 추가 검토
- express preload 데이터를 전역 대신 요청별 컨텍스트로 전달(서버 렌더 중 비동기 컴포넌트가 생기면 §3.3 방식으로는 부족하다)
` 패턴 방지).

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
- [x] DC-4 express Not Found 상태 코드 — 200 유지, 404는 후속 과제
- [x] DC-5 범위 — basic + express 둘 다 (사용자, 2026-11-13)
- [x] DC-6 페이지 상태 초기화 — 경로를 key로 단 래퍼 배열 (§2)

## 7. 후속 과제 (이번 범위 밖)

- express 템플릿의 사용하지 않는 devDependencies 정리(`happy-dom`, `jsdom`, `@testing-library/jest-dom` 등, 실제 사용 여부 확인 필요)
- express Not Found를 HTTP 404로 응답
- 문서 사이트 `Mounter.tsx`·`Mounter_ko.tsx`의 PokeAPI 예제 교체
