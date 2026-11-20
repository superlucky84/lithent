# create-lithent 위젯 템플릿 (`createLithent/widget`)

- 작성일: 2026-11-20
- 출처: [../ideas/IDEAS.md](../ideas/IDEAS.md) §2.1 "외부에 심는 위젯 / SDK", §3.1 `lithent/element`
- 상태: **create-lithent 0.5.0으로 발행 완료 (2026-11-20).** 템플릿은 `lithent ^1.25.12`, `@lithent/lithent-vite ^0.4.1`.

## 1. 목적

`lithent/element`는 부품이다. "React 사이트든 jQuery 사이트든 `<script>` 하나로 어디에나 심는다"를
사용자가 바로 해볼 수 있는 출발점이 없었다. `npx create-lithent my-widget --template widget`으로
다음을 한 번에 얻게 한다.

- 빌드하면 `dist/<프로젝트 이름>.js` 한 파일(IIFE, lithent 포함)과 `.mjs`(ES 모듈)
- 그 파일만 `<script>`로 불러 쓰는 데모 호스트 페이지
- 크기 리포트와 예산(brotli 10KB 초과 시 빌드 실패)
- 컴포넌트 HMR

데모 위젯은 피드백 카드 `<feedback-widget>`이다. 문자열 속성, kebab-case → camelCase 변환,
Object 프로퍼티, 취소 가능한 이벤트, CSS 변수 테마, `::part`, slot을 모두 쓴다.

## 2. 구조

| 파일 | 역할 |
|---|---|
| `index.html` | 고객사 페이지 역할. lithent를 모르고 속성·프로퍼티·DOM 이벤트로만 위젯을 다룬다 |
| `src/main.ts` | 번들 진입점. `defineElement` 호출 |
| `src/FeedbackWidget.tsx` | 컴포넌트. `mount` + 클로저 상태 + `renew()` (helper 없음) |
| `src/feedbackProps.ts` | 공개 계약: props 선언과 이벤트 detail 타입 |
| `src/feedback-widget.css` | Shadow DOM 스타일. `?inline`으로 문자열이 되어 `styles`로 들어간다 |
| `scripts/size.mjs` | raw/gzip/brotli 리포트, 예산 검사 |
| `vite.config.js` | 라이브러리 모드(iife + es), 파일 이름은 `package.json`의 `name`에서 |

## 3. 결정과 이유

- **파일 이름을 `package.json`의 `name`에서 만든다.** CLI가 `name`을 프로젝트 이름으로 바꾸므로
  `my-widget` 프로젝트는 `dist/my-widget.js`가 된다. 바꿀 곳이 한 군데다.
- **`dist/index.html`을 빌드 때 생성한다.** 개발용 `index.html`에서
  `<script type="module" src="/src/main.ts">`를 `<script src="./<name>.js">`로 바꿔 쓴다.
  `npm run preview`로 실제 배포 파일을 같은 데모 페이지에서 확인한다. 이 줄이 없으면 빌드가 오류를 낸다.
- **`sideEffects: false`를 두지 않는다.** basic 템플릿에는 있지만, 위젯 진입점은 엘리먼트 등록이라는
  부수 효과 자체다. 번들러로 `import 'my-widget'` 하는 소비자에서 통째로 빠질 수 있다.
- **Tailwind를 넣지 않는다.** Shadow DOM 안에서는 페이지의 유틸리티 CSS가 닿지 않고, 크기 예산이
  핵심 메시지다. 일반 CSS 파일 하나를 `?inline`으로 넣는다.
- **HMR 플러그인을 `.tsx`에만 적용한다** (`lithentVitePlugin({ include: /\.tsx$/ })`).
  처음에는 기본 설정으로 했는데, 컴포넌트·CSS를 고쳐도 화면이 바뀌지 않고 새로고침도 되지 않았다.
  원인은 두 가지였다.
  1. `FeedbackWidget.tsx`가 `feedbackProps` 객체도 export했다. 모듈을 다시 평가할 때마다 새 객체라
     플러그인이 "exports changed"로 보고 갱신을 `main.ts`로 넘겼다. → props 선언을 `feedbackProps.ts`로
     옮기고 컴포넌트 파일은 `import type`만 한다.
  2. 플러그인은 컴포넌트가 없는 모듈에도 `if ([].length) { import.meta.hot.accept(...) }`를 넣는다.
     Vite 서버는 accept를 **정적으로** 찾으므로 `main.ts`를 self-accepting으로 보고 전파를 멈춘다.
     브라우저에서는 accept가 호출된 적이 없어 갱신을 버린다. 재실행도 새로고침도 없이 수정이 사라졌다.
     → `main.ts`를 변환 대상에서 뺀다. 이제 `main.ts`·props·CSS 수정은 전체 새로고침이 된다.
     플러그인 자체는 [../hmr-propagation/](../hmr-propagation/)에서 고쳤다. 0.4.1 발행 뒤 이 우회를 뺐다(2026-11-20).
     지금은 기본 설정 그대로 같은 동작이다: 컴포넌트 수정은 새로고침 없이, `main.ts`·props·CSS 수정은 새로고침.
- **CLI에 이름으로 템플릿 고르기를 추가했다.** `--template ssr|spa|widget`. 그 외 값은 기존처럼
  경로·GitHub 축약·URL이다. 같은 이름의 로컬 폴더는 `./widget`처럼 쓴다.
- **CLI `tsconfig.json`에서 `basic`, `widget`을 제외했다.** 지금까지 `express`만 제외돼 있어서
  `createLithent/dist/basic/`에 SPA 템플릿의 `.ts`가 컴파일되어 create-lithent 패키지에 함께
  배포되고 있었다. 이제 `npm pack`에 CLI 파일만 들어간다.

## 4. 검증 (2026-11-20, Node 22.23.5)

이 환경에는 Node 24.22.1이 없어 pnpm의 runtime 검사를 `pnpm_config_runtime_on_fail=ignore`로
넘기고 Node 22로 실행했다. 템플릿의 `engines`(`^20.19.0 || >=22.12.0`)는 만족한다.

| 확인 | 결과 |
|---|---|
| 템플릿 `type-check`, `lint`, `format:check`, `build` | 통과. `dist/…js` 15.84KB raw / 6.65KB gzip / **6.09KB brotli** |
| 빌드 결과 브라우저 확인 (Chromium, `vite preview`) | 20개 항목 통과: shadow 렌더, slot, 페이지 CSS 차단, rate·submit 이벤트, 취소 시 폼 유지, page-id 변경 시 초기화, Object 프로퍼티, CSS 변수, 이동 시 상태 유지, 콘솔 에러 없음 |
| 개발 서버에서 같은 20개 항목 | 통과 |
| HMR | 컴포넌트 수정 → 새로고침 없이 반영. CSS 수정 → 새로고침 후 반영 |
| `.mjs` 단독 로드 | 렌더됨, 전역 변수 없음 |
| CLI `--help`, 대화형 선택(pty), `--template ./<로컬 복사본>` | 세 선택지 표시, 위젯 선택됨. 생성된 `package.json`의 `name`이 프로젝트 이름 |
| 생성 프로젝트를 npm 레지스트리에서 새로 설치·빌드 | `lithent@1.25.11`, `@lithent/lithent-vite@0.4.0`, TypeScript 5.9.3, Vite 8.3.8로 통과. `dist/my-widget.js` 생성, 브라우저 20개 항목 통과 |
| `--template spa` (main에서 다운로드) | 통과 |
| `--template widget` | URL로 바뀜. main에 아직 없어 "path not found" — 병합 후 동작 |
| `node scripts/check-templates-fresh.mjs widget` | 통과 |
| `e2e/widget-template.spec.ts` (Chromium, base 프로젝트) | 2개 통과. CSP 테스트는 페이지에 inline style을 넣은 변형에서 실패하는 것을 확인 |
| `scripts/tests/*.test.mjs` (`--experimental-test-isolation=none`) | 49개 통과 |

Firefox·WebKit E2E는 이 환경에 브라우저가 없어 돌리지 않았다. CI가 돌린다.

## 5. CI 연결

- `pnpm-workspace.yaml`에 추가 → `pnpm build`의 병렬 단계에서 빌드된다(타입·린트·크기 예산 포함).
- `scripts/ci-build-artifacts.mjs`에 `createLithent/widget/dist` 추가 → E2E 잡이 같은 빌드를 받는다.
- `scripts/check-templates-fresh.mjs` 기본 목록에 `widget` 추가 → 주간 새 설치 검사.
- `e2e/widget-template.spec.ts` → 빌드된 데모 페이지와 strict CSP. 번들에 base 코어가 들어 있으므로
  concurrent 프로젝트에서는 `testIgnore`로 뺀다.

## 6. 남은 일

1. ~~main 병합~~ — PR #129 (`ac690e9`).
2. ~~create-lithent 0.5.0 발행~~ — 2026-11-20. `npx create-lithent@0.5.0 my-widget --template widget`으로
   만든 프로젝트가 설치·빌드·브라우저 20개 항목을 통과했다.
3. ~~문서 사이트~~ — Custom Elements 가이드(영어·한국어) 첫 절에 "위젯 프로젝트 시작하기"를 넣었다.
4. ~~`@lithent/lithent-vite` 버그~~ — 0.4.1로 발행, 이 템플릿의 `include` 우회를 뺐다
   ([../hmr-propagation/](../hmr-propagation/)).
5. ~~비교 쇼케이스~~ — React·Preact·Lit으로 만든 같은 위젯의 크기·로딩 비교 페이지,
   [../widget-compare/](../widget-compare/). brotli lithent 6.07KB, React 58.56KB, Preact 6.73KB, Lit 6.67KB.
