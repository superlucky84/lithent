# DESIGN — 공식 라우터 (`@lithent/router`)

- 작성일: 2026-11-26
- 상태: **초안** — 확정: DC-1~DC-7, DC-17. 나머지는 제안이며 §15에서 `TBD`로 관리한다
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 표기: **확정**은 사용자가 결정했거나 사실에서 나온 것, **제안**은 아직 결정 대기(`TBD`)인 설계다

## 1. 위치 잡기 (DC-1)

RR(8.x)의 **계층, 용어, 데이터 모델**을 따른다. 컴포넌트에서 값을 읽는 쪽만 lithent의 클로저 모델에 맞춘다.
RR의 hook은 렌더할 때마다 다시 호출돼 그 시점의 값을 돌려준다. lithent 컴포넌트는 setup이 한 번만 돌기 때문에, 이름을
같게 두되 setup에서 한 번 호출해 render에서 `.value`로 읽는 반응형 참조를 돌려준다(DC-6).

| RR | lithent | 비고 |
|---|---|---|
| Data mode: `createBrowserRouter`, 라우트 객체 | `createBrowserRouter`, 라우트 객체 | core. 플러그인 없이 동작 |
| Framework mode: `app/routes.ts`, `route`·`index`·`layout`·`prefix` | 같음 (`@lithent/router/routes`) | Vite 플러그인 필요 |
| `@react-router/fs-routes`의 `flatRoutes()` | `@lithent/router/fs-routes`의 `flatRoutes()` | 규칙 동일 (RQ-12) |
| 라우트 모듈 `default`·`loader`·`ErrorBoundary`·`handle` | 같음 (오류 화면 이름 DC-11) | `action`·`meta`·`links`는 후속 |
| 라우트 컴포넌트 props `loaderData`·`params`·`matches` | 같음 (DC-5) | RR framework mode의 `Route.ComponentProps` |
| `useParams()` 등 hook | `useParams()` 등, setup에서 호출하고 `.value`로 읽음 (DC-6) | 이름은 같고 호출 시점이 다르다 |
| `useNavigation().state` | 같음 | `idle`·`loading` (`submitting`은 action과 함께 후속) |
| `redirect()`·`data()`·`isRouteErrorResponse()` | 같음 | |
| `createStaticHandler`·`StaticRouterProvider` | 같음 (`@lithent/router/server`) | SSR |
| `<Await>`·`defer`·스트리밍 | 없음 | Suspense 없음 (비목표) |
| `startTransition` 기반 전환 | concurrent 코어의 `deferRender` (DC-9) | base 코어에서는 동기 |

TanStack Router에서는 기능 단위로만 가져온다(search 스키마, loader 캐시, intent preload — 모두 후속).

## 2. 패키지와 진입점 (DC-3 확정)

`packages/router/`, 패키지 이름 `@lithent/router`. 하위 경로:

| 진입점 | 실행 위치 | 내용 |
|---|---|---|
| `@lithent/router` | 브라우저·서버 | `createBrowserRouter`, `createMemoryRouter`, `RouterProvider`, `Outlet`, `Link`, `NavLink`, `use*`, `redirect`, `data`, `isRouteErrorResponse`, 타입 |
| `@lithent/router/server` | 서버 | `createStaticHandler`, `StaticRouterProvider`, `serializeHydrationData` |
| `@lithent/router/routes` | Node(빌드) | `route`, `index`, `layout`, `prefix`, `RouteConfig` 타입 |
| `@lithent/router/fs-routes` | Node(빌드) | `flatRoutes()` |
| `@lithent/router/vite` | Node(빌드) | Vite 플러그인 |

- peer: `lithent`(필수), `vite`(선택 — `/vite` 진입점만 사용).
- 별도 패키지로 두는 이유: 0.x로 코어와 따로 버전을 올린다. Node 전용 코드(fs 스캔, Vite 플러그인)를 `lithent` 패키지에
  넣지 않는다. 선례는 `@lithent/lithent-vite`다. 비용은 새 패키지의 신뢰 발행 설정이다(test-utils DC-1이 하위 경로를 고른 이유).

## 3. 라우트 정의

### 3.1 라우트 객체 (data mode)

```ts
type RouteObject = {
  id?: string;                 // 없으면 위치로 만든다 ("0-1-2"). config에서는 파일 경로로 만든다 (§10)
  path?: string;               // 없으면 pathless layout
  index?: boolean;             // children을 가질 수 없다
  caseSensitive?: boolean;     // 기본 false (RR과 같음)
  children?: RouteObject[];
  Component?: TagFunction;
  loader?: LoaderFunction;
  ErrorBoundary?: TagFunction; // 이름은 DC-11
  handle?: unknown;
  lazy?: () => Promise<RouteModule>;
};

type LoaderFunctionArgs = { params: Params; request: Request };
type LoaderFunction = (args: LoaderFunctionArgs) => unknown | Promise<unknown>;
type Params = Readonly<Record<string, string | undefined>>;
```

### 3.2 라우트 모듈 계약

```ts
// routes/category.tsx
import { mount } from 'lithent';
import { data } from '@lithent/router';
import type { RouteProps, LoaderFunctionArgs } from '@lithent/router';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const category = getCategory(params.category!);
  if (!category) throw data(null, { status: 404 });
  return { category, recipes: getRecipes(category.id) };
};

export const handle = { title: (d: Awaited<ReturnType<typeof loader>>) => d.category.name };

export default mount<RouteProps<typeof loader>>(() => ({ loaderData, params }) => (
  <section>
    <h1>{loaderData.category.name}</h1>
    {/* … */}
  </section>
));

export const ErrorBoundary = mount(() => () => <NotFound />);
```

- `lazy`로 받은 모듈의 `default`는 `Component`로, 나머지 export는 같은 이름의 라우트 필드로 들어간다.
- `RouteProps<typeof loader>`는 `loaderData`를 `Awaited<ReturnType<typeof loader>>`로 추론한다(throw한 값은 제외).

## 4. 매칭

RR의 `flattenRoutes`·`rankRouteBranches` 규칙을 그대로 옮긴다(DC-1). 서버와 클라이언트가 같은 함수를 쓴다(RQ-2).

- 트리를 잎까지의 가지로 펼친 뒤 점수로 정렬한다: 세그먼트 수를 기본으로 하고 세그먼트마다 정적 +10, 동적 +3,
  빈 세그먼트 +1을 더한다. index는 +2, splat이 있으면 −2. 점수가 같으면 선언 순서로 정한다.
- 선택 세그먼트 `:x?`는 있는 경로와 없는 경로로 펼친다.
- 끝 `/`는 무시한다. 대소문자는 기본으로 구분하지 않는다. params는 `decodeURIComponent`로 풀고, 잘못된 인코딩이면 원문을 쓴다.
- 지금 템플릿 규칙("처음 다른 자리에서 고정 세그먼트가 파라미터를 이긴다")은 이 점수 규칙에 포함된다.
- 검증: RR 소스·문서의 순위 사례와 지금 템플릿의 `blog._slug` 대 `index._category._recipe` 사례를 단위 테스트로 옮긴다.

## 5. 라우터 상태와 이동

### 5.1 상태

```ts
type RouterState = {
  location: Location;                        // { pathname, search, hash, state, key }
  matches: RouteMatch[];                     // { route, params, pathname }[]
  loaderData: Record<string, unknown>;       // 라우트 id → 데이터
  errors: Record<string, unknown> | null;    // 오류 화면을 그릴 라우트 id → 오류
  navigation: { state: 'idle' } | { state: 'loading'; location: Location };
  historyAction: 'PUSH' | 'REPLACE' | 'POP';
};

type Router = {
  readonly state: RouterState;
  subscribe(fn: (state: RouterState) => void): () => void;
  navigate(to: To, opts?: { replace?: boolean; state?: unknown; preventScrollReset?: boolean }): Promise<void>;
  ready(): Promise<void>;   // 첫 매치의 lazy 모듈을 받았을 때 풀린다 (hydration 전, §9)
  dispose(): void;
};
```

### 5.2 이동 순서 (DC-8 제안: RR과 같음)

```
navigate(to) / popstate:
  next = resolve(to, 현재 위치, basename)
  이전 이동의 AbortController.abort(); 새 controller
  matches' = match(routes, next.pathname)          // 없으면 루트에 404 오류 (§7)
  hash만 다르면: loader 없이 바로 커밋 (스크롤만)
  navigation = { state: 'loading', location: next } → 알림 (sync)
  매치된 라우트의 lazy 모듈을 병렬로 받는다 (signal)
  실행할 loader = 새 라우트 | 그 라우트의 pathname이 바뀐 라우트 | search가 바뀌었으면 전부 | 같은 URL이면 전부
  Promise.allSettled(loader들)
  signal이 중단됐으면 버린다
  redirect가 있으면: navigate(그 주소, { replace: true }) — 연쇄 20회를 넘으면 오류
  오류 → 그 라우트와 위쪽에서 가장 가까운 오류 화면에 배정 (§7)
  PUSH·REPLACE면 history.pushState / replaceState  (POP은 이미 바뀌어 있음)
  state 갱신, navigation = idle → 알림 (DC-9의 우선순위)
  스크롤 (DC-18)
```

- 커밋 전까지 이전 화면이 그대로 있다. 표시기는 `useNavigation()`으로 그린다(RQ-6).
- 커밋 때 그대로 남는 라우트의 `loaderData`는 이전 값을 유지한다.

## 6. 컴포넌트 API

### 6.1 그리기

```tsx
const router = createBrowserRouter(routes, { basename?, hydrationData? });
render(<RouterProvider router={router} />, document.getElementById('app'));
```

- `RouterProvider`는 라우터 상태를 구독하고 `matches[0]`부터 그린다. 매치마다 내부 `RouteRenderer`가 라우트 context
  (몇 번째 매치인지)를 내려주고, `Outlet`은 그 context를 읽어 다음 매치를 그린다. context 구현은 DC-19.
- 라우트 컴포넌트에는 props `{ loaderData, params, matches }`를 넘긴다(DC-5). 데이터가 바뀌면 같은 인스턴스가 새 props로
  다시 그려진다. 같은 라우트에서 params만 바뀌어도(`/pasta` → `/soups`) **인스턴스를 유지한다**(DC-7, RR과 같음).
- DC-7의 결과: setup은 처음 한 번만 돌기 때문에, setup에서 `props.loaderData`를 지역 변수로 옮겨 두면 다음 이동 때 낡은 값이
  남는다. 문서와 템플릿은 **데이터를 render 함수의 props에서 읽는** 형태만 보여 준다.
- 상태를 주소마다 초기화해야 하는 라우트는 keyed 자식으로 감싼다(RR에서 `key`를 주는 것과 같은 역할):

```tsx
export default mount<RouteProps<typeof loader>>(() => props => [
  <CategoryBody key={props.params.category} {...props} />,
]);
```

### 6.2 읽기 함수 (DC-6 확정)

```ts
// setup에서 한 번 호출, render에서 .value로 읽는다
const params = useParams();          // { value: Params }
const location = useLocation();      // { value: Location }
const navigation = useNavigation();  // { value: RouterState['navigation'] }
const matches = useMatches();        // { value: UIMatch[] }  — { id, pathname, params, data, handle }
const data = useLoaderData<typeof loader>(); // 가장 가까운 라우트의 데이터
const error = useRouteError();       // 오류 화면 안에서
const [search, setSearch] = useSearchParams();
const navigate = useNavigate();      // 함수. 구독하지 않는다
```

- 인자 없이 호출한다. 안에서 `useRenew()`로 현재 컴포넌트의 renew를 얻는다. `useRenew`는 코어가 export하고
  `lithent/helper`의 `lstore`도 이 방식을 쓰므로 `mount`와 `lmount` 모두에서 동작한다(Phase 1에서 확인).
- 언마운트 때 구독을 해제한다. 상태가 바뀔 때 그 함수가 읽는 조각을 이전 값과 비교해 달라졌을 때만 renew한다.
- 이름은 RR과 같지만 **호출 시점이 다르다**는 점을 문서 첫머리에 적는다.

### 6.3 Link·NavLink

- `<Link to replace? state? preventScrollReset?>`: `<a href>`를 그린다(`basename` 포함). 왼쪽 클릭이고 보조키·`target`
  (`_self` 외)·`download`가 없고 같은 origin이며 기본 동작이 막히지 않았을 때만 `preventDefault` 후 `navigate`한다.
- 상대 `to`는 RR 기본값(`relative="route"`)처럼 그 라우트의 경로를 기준으로 푼다.
- `<NavLink end?>`: `location.pathname`이 `to`와 같거나 세그먼트 경계로 시작하면 활성이다. `end`면 같을 때만.
  `class`는 문자열 또는 `({ isActive, isPending }) => string`. 활성이면 `aria-current="page"`.

## 7. 오류·리다이렉트

- `redirect(url, status = 302)`와 `data(value, { status, headers? })`는 표식이 있는 객체를 만든다. loader가 반환하거나
  throw할 수 있다. 서버에서는 redirect가 3xx 응답이 된다.
- 오류 배정: 실패한 라우트부터 위로 올라가며 `ErrorBoundary`가 있는 첫 라우트. 그 라우트는 자기 컴포넌트 대신
  `ErrorBoundary`를 그리고, 그 아래 매치는 그리지 않는다. 어디에도 없으면 라우터의 기본 오류 화면(텍스트)을 그린다.
- 매치가 없으면 루트 라우트에 `{ status: 404 }` 오류를 배정한다(RR과 같음).
- 상태 코드: 배정된 오류가 `data()`·404면 그 status, 그 밖의 throw면 500.
- 범위: loader·lazy·매치 실패만 잡는다. 컴포넌트 렌더 중 throw는 잡지 않는다(코어에 오류 경계가 없다). 이 차이를
  `ErrorBoundary` 이름과 함께 문서에 적는다(DC-11).

## 8. 두 코어 (DC-9 제안)

- `import * as core from 'lithent'`로 받은 뒤 `core.deferRender`가 있으면 concurrent로 본다. `lithent/test`가 `whenIdle`을
  찾는 방식과 같다. 사용자가 `lithent`를 `lithent-concurrent`로 alias하면 라우터도 concurrent 네임스페이스를 받는다는 가정은
  Phase 1에서 확인한다(REQUIREMENTS §4).
- `createBrowserRouter(routes, { priority: 'auto' | 'sync' | 'deferred' })`, 기본 `'auto'`:
  - `navigation = loading` 알림은 sync — 표시기가 바로 뜬다.
  - 최종 커밋 알림은 `deferRender(() => notify())` — 새 화면 빌드가 입력 사이에 쪼개진다.
  - base 코어에서는 모두 sync다.
- 한계: 커밋은 쪼갤 수 없다(RC-10). 이득은 새 화면의 **빌드** 구간에만 있다. 화면이 작으면 차이가 없다.

## 9. SSR·hydration (DC-4 확정, DC-10 제안)

### 9.1 서버

```ts
import { createStaticHandler, StaticRouterProvider, serializeHydrationData } from '@lithent/router/server';
import { renderToString } from 'lithent/ssr';

const handler = createStaticHandler(routes, { basename });
const context = await handler.query(request);        // Fetch Request
if (context instanceof Response) return sendRedirect(context);   // 3xx
const html = renderToString(<StaticRouterProvider context={context} />);   // 동기
const script = `window.__lithentRouterState = ${serializeHydrationData(context)}`;
// status: context.statusCode
```

- loader를 모두 끝낸 뒤 동기 렌더를 한다. 데이터는 `context`를 통해 props·라우트 context로만 전달하므로
  **전역(`globalThis.pagedata`)이 없다**. 동시 요청이 서로의 데이터를 볼 수 없다(RQ-9). create-lithent-templates DC-12
  ("렌더가 동기라 전역으로 충분")를 이 기능 범위에서 다시 열어 바꾼다.
- `serializeHydrationData`는 템플릿 `serializeForScript`와 같은 이스케이프(`<` `>` `&` U+2028 U+2029)를 쓴다.
  `Error`는 운영 빌드에서 메시지를 숨기고, `data()` 오류는 `{ status, statusText, data }`를 보낸다.
- loader 실행 위치(DC-4 확정): 1차는 **같은 loader가 SSR에서는 서버, 클라이언트 이동에서는 브라우저**에서 돈다.
  RR data mode + `createStaticHandler` 구성과 같고, 지금 템플릿 `preload`와도 같다. RR framework mode식 서버 전용
  `loader` + `clientLoader` + 데이터 요청은 후속이며, 그때 라우트 모듈 계약이 넓어질 뿐 1차 계약은 바뀌지 않는다.

### 9.2 클라이언트

```ts
const router = createBrowserRouter(routes, { hydrationData: window.__lithentRouterState });
await router.ready();   // 첫 매치의 lazy 모듈. loader는 실행하지 않는다
hydration(<RouterProvider router={router} />, document.documentElement);
```

- `hydrationData`에 있는 라우트의 loader는 실행하지 않는다(RQ-9). 없는 라우트(데이터가 없는 라우트)는 그대로 둔다.

### 9.3 Express 연결 (DC-16 제안)

- 템플릿 안에 `req` → Fetch `Request` 변환 함수 하나(URL = protocol + host + `originalUrl`, method, headers)를 둔다.
  패키지에 express 의존을 넣지 않는다.
- 개발 서버에서는 `vite.middlewares`를 먼저 걸고 그 뒤에 catch-all 처리기를 건다. 지금의 `excludeRoutePath` 목록이 필요 없어진다.

## 10. config 헬퍼·Vite 플러그인

### 10.1 `routes.ts` (DC-12 제안: `src/`)

```ts
// src/routes.ts — 빌드·개발 시 Node에서 실행된다
import { route, index, layout, prefix } from '@lithent/router/routes';
import type { RouteConfig } from '@lithent/router/routes';

export default [
  index('routes/home.tsx'),
  route(':category', 'routes/category.tsx'),
  route(':category/:recipe', 'routes/recipe.tsx'),
] satisfies RouteConfig;
```

- 루트 라우트는 `src/root.tsx`다(RR의 `app/root.tsx`와 같은 역할). `routes.ts`의 항목은 루트의 children이 된다.
- 파일 경로는 `appDirectory` 기준이다. 라우트 id는 확장자를 뺀 파일 경로(`routes/category`)다.
- `routes.ts`는 그냥 코드다. 직접 만든 규칙을 섞을 수 있다: `[...(await flatRoutes()), ...(await myRoutes())]`.
- 헬퍼 결과 형식(`RouteConfigEntry`): `{ id?, path?, index?, file, caseSensitive?, children? }`.

### 10.2 플러그인

```ts
// vite.config.ts
import lithentRouter from '@lithent/router/vite';
plugins: [lithentRouter({ appDirectory: 'src' }), lithentVitePlugin(), ...]
```

- Vite의 모듈 러너로 `routes.ts`를 Node에서 실행해 `RouteConfigEntry[]`를 얻는다.
- 가상 모듈 `virtual:lithent-router/routes`: `{ id, path, index, lazy: () => import('/src/routes/category.tsx'), children }`
  트리를 export한다. 서버(`ssrLoadModule`·운영 빌드)와 클라이언트가 같은 모듈을 쓴다(RQ-2·RQ-11).
- 운영 빌드: Vite `build.manifest`로 라우트 id → `{ file, css[], imports[] }`를 만든다. 서버는 매치된 라우트의 chunk를
  `<link rel="modulepreload">`와 CSS로 넣는다. 지금의 `getScriptPath` 검색과 페이지별 lib entry가 없어진다.
- 개발: 라우트 파일 변경은 `@lithent/lithent-vite`의 HMR이 처리한다. `routes.ts`·라우트 파일 추가·삭제는 전체 새로고침.
- 1차 비목표: 라우트 모듈 분리(클라이언트 번들에서 loader 제거) — DC-4 후속과 함께.

## 11. `flatRoutes()`

- 구조: 순수 함수 `flatRoutesFromFiles(files, opts) → RouteConfigEntry[]`와 fs를 읽는 `flatRoutes({ rootDirectory = 'routes',
  ignoredRouteFiles })`. 테스트는 순수 함수에 파일 목록을 넣는다.
- 규칙(RR 8.5.3 문서):

| 파일 (`routes/` 아래) | URL | 비고 |
|---|---|---|
| `_index.tsx` | `/` | 루트의 index |
| `about.tsx` | `/about` | |
| `concerts.tsx` | `/concerts` | `concerts.*`의 레이아웃 (`<Outlet />`) |
| `concerts._index.tsx` | `/concerts` | `concerts` 안의 index |
| `concerts.$city.tsx` | `/concerts/:city` | `concerts` 안에 중첩 |
| `concerts_.mine.tsx` | `/concerts/mine` | 끝 `_`: `concerts` 레이아웃 밖 |
| `_auth.tsx` | — | pathless 레이아웃 |
| `_auth.login.tsx` | `/login` | `_auth` 안 |
| `($lang).about.tsx` | `/:lang?/about` | 선택 세그먼트 |
| `files.$.tsx` | `/files/*` | splat |
| `sitemap[.]xml.tsx` | `/sitemap.xml` | 이스케이프 |
| `concerts.$city/route.tsx` | `/concerts/:city` | 폴더 = 라우트 하나. 폴더 안 다른 파일은 라우트가 아니다 |

- 지금 템플릿 규칙과 다른 점: lithent 템플릿의 `_`는 파라미터였지만 RR에서 `_`는 pathless다. `flatRoutes()`는 RR 규칙만 따른다.

## 12. 디렉토리 규칙 예제 (문서용, DC-2)

- 공식 생성기는 만들지 않는다. 가이드에 `src/features/**/page.tsx`를 라우트로 바꾸는 30줄 안팎의 함수 예제를 싣고,
  `routes.ts`에서 펼쳐 쓰는 방법을 보여 준다. 폴더 깊이가 곧 중첩인 방식(TanStack식)과 RR 폴더 규칙의 차이도 적는다.
- 예제 코드는 문서 빌드 테스트에서 실행해 결과 config를 확인한다.

## 13. 템플릿 이전 (DC-13·DC-14 제안)

### 13.1 express

| 지금 | 이후 |
|---|---|
| `src/layout.tsx` | `src/root.tsx` — html·head·body, Header, `<Outlet />`, 즐겨찾기 로드, 이동 표시기 |
| `src/pages/index.tsx` | `src/routes/home.tsx` |
| `src/pages/index._category.tsx` | `src/routes/category.tsx` (`routes.ts`의 `:category`) |
| `src/pages/index._category._recipe.tsx` | `src/routes/recipe.tsx` (`:category/:recipe`, category의 자식이 아님) |
| `preload` + `getPreloadData()` | `loader` + props `loaderData` |
| `{ notFound: true }` + 페이지 안 `NotFound` | `throw data(null, { status: 404 })` + 루트 `ErrorBoundary` |
| `preload.layout.title` | `handle.title(data)`를 루트가 `useMatches()`로 읽는다 |
| `routeRef.loading`으로 페이지 교체 | 이전 화면 유지 + `useNavigation()` 표시기 (DC-8) |
| `<div key={page}>`로 페이지 초기화 (create-lithent-templates DC-6) | 인스턴스 유지(DC-7). 주소마다 초기화가 필요한 상태(카테고리 페이지의 정렬 등)는 §6.1의 keyed 자식으로 옮긴다 |
| `src/base/load.ts` | `src/entry.client.tsx` (§9.2) |
| `server.js` + `sortFiles.js` + 페이지별 express 라우트 | catch-all 처리기 하나 (§9.1·§9.3) |
| `serverHelper/*`의 `getEntries`·`getScriptPath`·`excludeRoutePath` | 플러그인 manifest. `serializeForScript`는 `serializeHydrationData`로 |
| `src/base/route.ts`, `routeStore.ts`, `data.ts` | 삭제 |
| `vite.config.js` 페이지별 lib entry | 앱 빌드 + `build.manifest` + 라우터 플러그인 |

- URL·상태 코드·마크업은 지금과 같게 유지한다(RQ-13). `check:scaffold` 검사는 그대로 통과해야 한다.
- 템플릿은 `flatRoutes()` 대신 `routes.ts`를 직접 보여 준다(DC-13 제안): 사용자가 어디를 고치면 되는지 한 파일에서 보인다.
  `flatRoutes()`는 문서에서 보여 준다.

### 13.2 basic (DC-14 제안)

- `src/router.ts`를 data mode 라우터(라우트 객체 + `lazy`, 플러그인 없음)로 바꾼다. SPA에서 플러그인 없는 경로를 보여 준다.

## 14. 크기·시험

### 14.1 크기 (DC-15 제안)

- `@lithent/router` 런타임 entry ≤ 4.0KB gzip(제안). 서버·빌드 entry는 예산을 두지 않는다. 측정 후 확정한다.
- 런타임 의존성 없음(RQ-15).

### 14.2 시험

- 패키지 단위 테스트: Vitest + jsdom. `LITHENT_CORE=concurrent`로 alias해 두 코어에서 같은 테스트를 돌린다(element·test 패키지와 같음).
- 컴포넌트 테스트는 `lithent/test`의 `render`·`act`를 쓴다.
- 플러그인: 임시 디렉토리의 픽스처 프로젝트를 `vite build`해 chunk와 manifest를 확인한다.
- 템플릿: `scripts/check-scaffold.mjs`(두 코어)와 Playwright e2e(이동, 뒤로·앞으로, 대기 표시기, 404·500).
- 음성 대조: 핵심 규칙(순위, 중단, hydration에서 loader 미실행, 요청별 데이터)을 일부러 깨뜨린 사본에서 테스트가 실패하는지 확인한다.

## 15. 결정

- [x] **DC-1 기준 모델은 RR(8.x)의 data·framework mode다.** (사용자, 2026-11-26) 계층·용어·데이터 모델을 RR과 같게 둬서
  RR framework mode 기능을 나중에 옮기기 쉽게 한다. TanStack은 기능 단위로만 후속 후보로 둔다.
- [x] **DC-2 라우트 정의는 4계층.** (사용자, 2026-11-26 — 이 범위로 문서 설계를 요청) ① data mode 라우트 객체
  ② `routes.ts` config + Vite 플러그인 ③ RR 호환 `flatRoutes()` ④ 디렉토리 중첩 규칙은 공식 기능이 아니라 문서 예제.
  근거: RR도 파일 규칙을 "config를 만드는 함수"로 두고, config에서는 사용자가 파일 위치를 정한다. 모든 규칙이 같은 config를
  만들므로 core는 하나다.
- [x] **DC-3 패키지는 `@lithent/router`.** (사용자, 2026-11-26) `packages/router`, 하위 경로 진입점 5개(§2). 근거: 0.x로 코어와
  따로 버전을 올리고, Node 전용 플러그인 코드를 `lithent` 패키지에 넣지 않는다. 비용: 새 패키지의 신뢰 발행 설정(Phase 7·12).
  버린 대안: `lithent/router` 하위 경로.
- [x] **DC-4 1차 loader는 서버·브라우저 둘 다에서 실행.** (사용자, 2026-11-26) 같은 loader가 SSR은 서버, 클라이언트 이동은
  브라우저에서 돈다. 근거: RR data mode + `createStaticHandler` 구성과 같고 지금 `preload`와 같아 1차 범위가 작다. RR framework
  mode식 서버 전용 `loader` + `clientLoader` + 데이터 요청은 후속이며, 라우트 모듈 계약이 넓어질 뿐 1차 계약은 바뀌지 않는다.
  버린 대안: 처음부터 서버 전용 loader.
- [x] **DC-5 라우트 컴포넌트 데이터는 props `{ loaderData, params, matches }`.** (사용자, 2026-11-26) 근거: RR framework mode의
  `Route.ComponentProps`와 같은 이름이고, lithent render 함수가 props를 매번 새로 받는다.
- [x] **DC-6 읽기 함수는 RR 이름, setup에서 인자 없이 호출, `.value`로 읽는다.** (사용자, 2026-11-26) `useParams` 등(§6.2),
  안에서 `useRenew()`. 근거: RR 코드를 옮길 때 이름을 바꾸지 않는다. 호출 시점이 다르다는 점은 문서 첫머리에 적는다.
  버린 대안: lithent식 이름(`routeParams(renew)` 등).
- [x] **DC-7 같은 라우트에서 params만 바뀌면 인스턴스를 유지한다.** (사용자, 2026-11-26 — 설계자 제안 "다시 마운트"와 다르게 결정)
  RR과 같은 동작이라 DC-1과 맞는다. 결과: setup에서 읽어 둔 값이 낡을 수 있으므로 문서·템플릿은 render props에서 읽는 형태만
  보여 주고, 주소마다 초기화할 상태는 keyed 자식 패턴(§6.1)을 쓴다. 템플릿의 페이지별 키 초기화(create-lithent-templates DC-6)는
  이 패턴으로 옮긴다(§13.1). 버린 대안: 그 라우트의 params가 바뀌면 다시 마운트.
- [ ] **DC-8 대기 UI는 RR과 같게** — `TBD`. 제안: 커밋 전까지 이전 화면 유지, push URL은 커밋 때 변경, `useNavigation()` 표시기(§5.2).
- [ ] **DC-9 concurrent 우선순위** — `TBD`. 제안: `priority: 'auto'` 기본. `loading` 알림은 sync, 최종 커밋은 `deferRender`(§8).
- [ ] **DC-10 SSR 데이터는 요청별 context** — `TBD`. 제안: `StaticRouterProvider`가 props·라우트 context로만 전달하고 전역을 쓰지 않는다(§9.1).
- [ ] **DC-11 오류 화면 export 이름** — `TBD`. 제안: `ErrorBoundary`(RR 이름, 잡는 범위가 다르다는 점을 문서화). 대안: `ErrorView`.
- [ ] **DC-12 앱 디렉토리 기본값** — `TBD`. 제안: `appDirectory: 'src'`, `src/root.tsx`, `src/routes.ts`(lithent 템플릿 관례). RR 기본은 `app/`이고 옵션으로 바꿀 수 있다.
- [ ] **DC-13 express 템플릿의 라우트 정의** — `TBD`. 제안: `routes.ts`를 직접 쓴다(§13.1). 대안: `flatRoutes()`.
- [ ] **DC-14 basic 템플릿** — `TBD`. 제안: data mode 라우터로 옮긴다(§13.2). 대안: 지금 손으로 쓴 라우터 유지.
- [ ] **DC-15 런타임 크기 예산** — `TBD`. 제안: ≤ 4.0KB gzip. Phase 3 측정 후 확정.
- [ ] **DC-16 Express 요청 변환 위치** — `TBD`. 제안: 템플릿 안 함수(§9.3). 대안: `@lithent/router/express` 진입점.
- [x] **DC-17 배포 순서는 라우터 npm 발행 → 템플릿 병합.** (사실 기반, 2026-11-26) 템플릿은 GitHub main에서 바로 배포되므로,
  발행 전에 병합하면 새 프로젝트가 없는 패키지를 설치하려다 실패한다.
- [ ] **DC-18 스크롤** — `TBD`. 제안: PUSH·REPLACE는 맨 위(`preventScrollReset`으로 끔), hash는 그 요소, POP은 history key별로
  메모리에 저장한 위치 복원(새로고침하면 사라짐).
- [ ] **DC-19 `Outlet`에 매치 위치를 전달하는 방법** — `TBD`(Phase 1 스파이크로 결정). 후보: `lithent/helper`의 `createContext`,
  또는 `getComponentSubInfo`로 부모 사슬을 찾는 라우터 전용 경량 context. 조건: base·concurrent·`renderToString`·hydration에서 동작.

## 16. 결정 → 검증

| 결정 | 검증 |
|---|---|
| DC-1 | 매칭 순위·이동 순서 단위 테스트가 RR 사례를 그대로 옮긴다 (Phase 2·3) |
| DC-2 | `routes.ts` 헬퍼, `flatRoutes()`, 직접 만든 규칙이 같은 config 형식을 내고 섞어 쓸 수 있다 (Phase 5·6, M-5·M-6) |
| DC-3 | 설치 소비자 검사 (Phase 7) |
| DC-4 | hydration에서 loader 미실행, 이동 시 브라우저 실행 테스트 (Phase 4), M-3 |
| DC-5·DC-6 | `mount`·`lmount` 컴포넌트 테스트, 구독 해제 테스트 (Phase 1·3) |
| DC-7 | params만 바뀔 때 setup이 다시 돌지 않고 props가 갱신되는지, keyed 자식 패턴이 초기화하는지 테스트 (Phase 1·3), M-1 |
| DC-8 | 대기 중 이전 화면 유지·중단 테스트 (Phase 3), M-1 |
| DC-9 | 두 코어 테스트, M-4 |
| DC-10 | 동시 요청 테스트 (Phase 4) |
| DC-11 | 오류 배정 테스트 (Phase 3) |
| DC-12·DC-13·DC-16 | `check:scaffold` 두 코어 (Phase 9) |
| DC-14 | basic 빌드·e2e (Phase 9) |
| DC-15 | 크기 측정 (Phase 7) |
| DC-17 | 릴리스 순서 (Phase 12) |
| DC-18 | 스크롤 테스트, M-2 |
| DC-19 | 스파이크 결과 (Phase 1) |
