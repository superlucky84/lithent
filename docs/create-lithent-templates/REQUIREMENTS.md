# REQUIREMENTS — create-lithent 기본 앱 교체 (create-lithent-templates)

- 브랜치: `feat/create-lithent-demo`(PR #116), `fix/create-lithent-fresh-install`(PR #117), `chore/template-followups` / 기준 커밋 `9bbfb65`
- 작성일: 2026-11-13
- 상태: **배포 완료(PR #116·#117), 후속 과제 진행 중** — 진행 상황은 [IMPLEMENT.md](./IMPLEMENT.md)의 진행 현황 표와 Handoff 참고
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 배경: [../repo-polish/REQUIREMENTS.md](../repo-polish/REQUIREMENTS.md) (홍보 전 저장소 정비, PR #115). README의 "Try it online"이 `createLithent/basic`을 연다.
- 문서 위치: `docs/create-lithent-templates/` — 두 템플릿(`createLithent/basic`, `createLithent/express`)에 걸친 작업이라 저장소 `docs/` 아래에 둔다.
- 코드 범위: `createLithent/basic/`, `createLithent/express/`, `createLithent/README.md`, `scripts/check-scaffold.mjs`(필요 시), 후속 과제의 `scripts/check-templates-fresh.mjs`·`.github/workflows/templates-fresh.yml`·`lithentDocs/src/pages/Mounter*.tsx`
- 관련 문서: 코어 JSX 타입 후속 과제는 [../jsx-types/REQUIREMENTS.md](../jsx-types/REQUIREMENTS.md)

## 1. 배경 및 목적

`npx create-lithent`로 처음 만든 앱과 README의 "Try it online"은 **새 사용자가 lithent 코드를 처음 보는 곳**이다.
지금 두 템플릿은 포켓몬 데모라서 다음 문제가 있다.

### 1.1 출발 상태 (2026-11-13 확인)

| 구분 | 문제 |
|---|---|
| 배포 경로 | CLI가 템플릿을 **GitHub main에서 직접** 받는다(`createLithent/index.ts:324-325`). main 병합이 곧 모든 사용자에게 배포된다. npm 릴리스는 필요 없다 |
| 상표·자산 | 포켓몬 이름, 타입 아이콘 SVG 18개×2, `bg-pokemon-*` 색. 공식 템플릿이 남의 IP를 쓴다 |
| 외부 의존 | PokeAPI(`pokeapi.co`) 호출. 네트워크가 없거나 느리면 첫 화면이 비고, express는 SSR `preload`가 실패해 Oops 페이지가 된다. `scripts/check-scaffold.mjs`의 SSR 검사도 네트워크에 의존한다 |
| 보여 주는 것 | lithent의 핵심(클로저 상태, `renew()` vs `lstate`, 공유 store, lifecycle)이 첫 화면에서 안 보인다 |
| 코드 품질 (basic) | `popstate` 리스너 미해제, 생성 시점 부수 효과, `href="#"` 링크, `alt="Thumbnail"`, Next.js `<Image>` 잔재(`data-nimg`, 인라인 style), `shardStore` 오타, 모든 경로에 `/main` 접두사, `.env.example`이 쓰이지 않는 변수만 정의, README가 없는 `util.ts`를 안내 |
| 코드 품질 (express) | `index._type.tsx`의 `class="bg-pokemon-${params.type} ..."`가 템플릿 리터럴이 아니라 값이 안 들어간다. 같은 `href="#"`·`alt`·`data-nimg` 문제 |
| **보안 (express)** | `serverHelper/devMakePage.js`, `prodMakePage.js`가 `JSON.stringify(props)`·`JSON.stringify(initProp)`를 `<script>` 안에 그대로 넣는다. `props.query`는 요청 쿼리라서 `?q=</script><script>...`로 **반사형 XSS**가 된다 |
| 안내 불일치 | CLI·`createLithent/README.md`는 `npm install`, 템플릿 README는 pnpm 권장 |
| **하이드레이션 고장 (express, 구현 중 발견)** | `src/base/route.ts`의 `import.meta.glob('../pages/*.(tsx\|mdx)')`가 Vite 8 빌드에서 빈 객체가 된다. main의 템플릿을 스크래치에서 빌드해도 `Object.assign({})`였다. 브라우저의 `load()`가 `s.v[e] is not a function`으로 실패해 **SSR 화면만 보이고 클릭이 동작하지 않는다** |
| **요청 간 데이터 섞임 (express, 구현 중 발견)** | `serverHelper/makePage.js`가 preload 결과를 `globalThis.pagedata`에 넣는 시점과 렌더 시점 사이에 `await`가 있다. 여러 요청이 같은 프로미스(캐시된 API·DB 호출)를 기다리면 다른 요청의 데이터로 렌더된다. 스크래치 시뮬레이션에서 500건 중 499건이 섞였다. 서버 404 화면은 이전 요청의 제목을 보였다 |
| 라우트 우선순위 (express, Phase 6에서 발견) | 서버는 언더스코어 위치·길이로 라우트를 정렬하고, 클라이언트는 glob 키의 알파벳 순서로 매칭한다. `blog._slug.tsx`를 추가하면 서버는 `/blog/hello`를 `/:category/:recipe`로 보내 Not Found를 렌더하고, 클라이언트 이동은 Post를 렌더한다 |
| 개발 모드 404 (express, Phase 7에서 발견) | 404 핸들러가 운영 모드에만 있다. 개발 모드에서는 Vite 미들웨어(기본 `appType: 'spa'`)가 빈 본문 404를 돌려준다 |
| 대체 문자열 패턴 (express) | `html.replace('</body>', 문자열)`이 직렬화된 데이터 안의 `$'`·`$&`를 특수 패턴으로 해석한다 |
| 새 설치의 도구 버전 (병합 후 발견) | 생성된 프로젝트는 lockfile 없이 최신 범위 버전(TypeScript 5.9, Prettier 3.10)을 받는다. 워크스페이스·CI는 lockfile 버전이라 이 차이를 보지 못했고, 두 템플릿의 `npm run build`가 실패했다(Phase 8) |

## 2. 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| RQ-1 | 두 템플릿의 데모를 **레시피 카탈로그**(홈 → 카테고리 → 레시피 상세)로 바꾼다. 데이터는 템플릿 안 로컬 모듈이고 외부 API를 호출하지 않는다 | M-1, M-2, Phase 6 grep |
| RQ-2 | 포켓몬 관련 이름·자산·색·API 코드를 모두 제거한다 | Phase 6 grep (`pokemon`, `pokeapi`) |
| RQ-3 | 홈 화면에서 lithent 핵심을 보여 준다: `mount`+`renew()`와 `lmount`+`lstate`로 같은 카운터를 나란히 구현 | M-1, M-2 |
| RQ-4 | 카테고리 페이지에 검색·정렬(클로저 상태), 상세 페이지에 인분 조절(클로저 상태)과 즐겨찾기(여러 컴포넌트가 공유하는 store)를 둔다 | M-1, M-2 |
| RQ-5 | 즐겨찾기는 `localStorage`에 저장하고, 읽기는 마운트 후에 한다(SSR 하이드레이션 불일치 방지) | M-2, M-3 |
| RQ-6 | 링크는 실제 `href`를 갖고 클릭을 가로채 클라이언트 라우팅한다(가운데 클릭·새 탭·검색엔진 동작) | M-1, M-2 |
| RQ-7 | 전역 리스너 등 부수 효과는 lifecycle 안에서 등록하고 해제한다 | 코드 리뷰, Phase 6 grep |
| RQ-8 | express의 `<script>` 직렬화를 안전하게 바꿔 XSS를 막는다 | Phase 4 테스트, M-4 |
| RQ-9 | express의 기존 기반 구조(파일 기반 라우팅, `preload`, 레이아웃, 서버 헬퍼, dev/prod 경로)는 유지한다 | M-3, `check:scaffold --check` |
| RQ-10 | 없는 카테고리·레시피는 Not Found 화면을 보여 준다 | M-1, M-3 |
| RQ-11 | 템플릿 README를 새 데모·경로·명령에 맞게 다시 쓰고, `npm` 명령으로 통일한다(pnpm은 대안으로 표기) | Phase 5 |
| RQ-12 | 오프라인에서도 `pnpm build`와 `check:scaffold --check`가 통과한다 | Phase 7 |
| RQ-13 | express 클라이언트가 페이지 모듈을 찾아 하이드레이션한다(`.tsx`, `.mdx`) | Phase 3 스모크, M-2 |
| RQ-14 | 동시 요청이 서로의 preload 데이터로 렌더되지 않는다. 404·Oops는 이전 요청 데이터를 쓰지 않는다 | Phase 4 시뮬레이션 |
| RQ-15 | 같은 깊이의 라우트는 고정 세그먼트가 파라미터보다 먼저 매칭되고, 서버와 클라이언트의 순서가 같다 | Phase 6 라우트 검사 |
| RQ-16 | 어느 페이지에도 맞지 않는 주소는 개발·운영 모드 모두 Not Found 화면과 HTTP 404를 돌려준다 | Phase 7 dev 스모크 |
| RQ-17 | 새로 생성한 프로젝트가 `npm install`로 받는 최신 범위 버전(TypeScript, ESLint, Prettier 등)에서도 `npm run build`가 통과한다 | Phase 8, Phase 9 정기 검사 |
| RQ-18 | (후속) preload가 `{ notFound: true }`를 돌려주면 HTTP 404, 렌더 오류(Oops)는 HTTP 500으로 응답한다 | Phase 9 |
| RQ-19 | (후속) 템플릿이 쓰지 않는 개발 의존성과 중복 CSS 처리를 없앤다. 빌드 결과 CSS는 같아야 한다 | Phase 9 |
| RQ-20 | (후속) 새 설치 기준 템플릿 빌드를 정기적으로 검사한다 | Phase 9 |
| RQ-21 | (후속) 문서 사이트에서 PokeAPI 예제를 없앤다 | Phase 9 grep |

## 3. 제약

1. **main 병합 = 배포.** 병합 전에 두 템플릿을 실제 생성 경로(스크래치 복사 → 빌드 → 실행)로 확인한다.
2. **사용 패키지 버전은 바꾸지 않는다.** 업그레이드는 비목표(§4). 데모가 쓰지 않게 된 코드와 의존성만 지운다.
3. **lithent 공개 API만 쓴다.** `lithent`, `lithent/helper`, `lithent/ssr`. 이 문서 범위에서는 코어를 수정하지 않는다(코어 JSX 타입은 [jsx-types](../jsx-types/REQUIREMENTS.md)에서 다룬다).
4. **두 템플릿의 데이터·화면은 같게** 만든다. 각 템플릿은 따로 다운로드되므로 데이터 모듈은 각자 갖는다(중복 허용).
5. Tailwind 4는 유지한다. StackBlitz에서 basic이 실행되는 것을 사용자가 확인했다(repo-polish DC-2, 2026-11-13).
6. 커밋·푸시·PR·병합은 사용자가 요청할 때만 한다.

## 4. 비목표

- express 라우터·서버 구조 재설계, `state-ref` 의존 제거
- 패키지 업그레이드
- preload 데이터를 요청별 컨텍스트로 전달하는 재설계 (DESIGN DC-12)
- `create-lithent` CLI 코드 변경
- 다국어 UI (화면 문구는 영어 — 사용자 결정 2026-11-13)
