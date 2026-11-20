# DESIGN — 같은 위젯, 네 프레임워크 (widget-compare)

- 작성일: 2026-11-20
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

## 1. 구조

```
showcase/widget-compare/          private workspace 패키지 lithent-widget-compare
  src/react/FeedbackWidget.tsx     React 19 컴포넌트 (hooks)
  src/react/main.ts                공용 래퍼로 등록
  src/preact/FeedbackWidget.tsx    Preact 11 컴포넌트 (hooks)
  src/preact/main.ts
  src/lit/main.ts                  LitElement 하나
  src/shared/define-element.ts     React·Preact용 커스텀 엘리먼트 래퍼 (DC-3)
  src/shared/labels.ts             React·Preact·Lit이 쓰는 기본 문구·얼굴 (템플릿과 같은 값)
  scripts/build.mjs                네 빌드 + 호스트 페이지 + sizes.json + 공개 페이지
  scripts/measure.mjs              로딩 측정 → results.json
  scripts/page.mjs                 dist/index.html(영어)·index.ko.html(한국어) 생성 (build.mjs가 부른다)
  scripts/frameworks.mjs           네 버전의 목록(진입점, 소스, 패키지 버전)
  results.json                     커밋하는 측정 결과
dist/
  index.html, index.ko.html        공개 페이지
  lithent/ react/ preact/ lit/     각각 index.html(템플릿 호스트 페이지) + widget.js
  sizes.json
```

lithent 빌드의 진입점은 `createLithent/widget/src/main.ts`다(RQ-2). 템플릿을 고치면 비교도 바뀐다.

## 2. 같은 위젯의 기준

`createLithent/widget`의 `<feedback-widget>`:

| 항목 | 내용 |
|---|---|
| props | `question`(String), `pageId`(String, 속성 `page-id`), `labels`(Object, 속성은 JSON) |
| 이벤트 | `feedback-rate {pageId, rating}`, `feedback-submit {pageId, rating, comment(trim)}` — `bubbles`·`composed`·`cancelable`. submit을 취소하면 폼 유지 |
| 상태 | 별점, 댓글, 보냄 여부. `page-id`가 바뀌면 처음부터 |
| DOM | open shadow root, `part="card"`·`part="send"`, `<slot name="footer">`, 같은 class 이름 |
| CSS | `createLithent/widget/src/feedback-widget.css` 한 파일을 네 빌드가 `?inline`으로 쓴다 |
| 문구 | 템플릿의 `defaultLabels`, 얼굴 이모지 5개 |

## 3. 빌드 (RQ-3)

- Vite JS API로 네 번 `build()`. 공통: `build.lib` IIFE 하나, `target`은 템플릿과 같은
  `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`, minify 기본값, sourcemap 없음,
  `define: { 'process.env.NODE_ENV': '"production"' }`(React는 이것이 없으면 개발 빌드가 들어간다.
  라이브러리 모드는 `process.env`를 바꾸지 않는다), `emptyOutDir: false`.
- 프레임워크별 차이: JSX `importSource`(lithent·react·preact), Lit은 JSX 없음.
- 호스트 페이지: 템플릿 `index.html`의 개발용 `<script type="module" src="/src/main.ts">`를
  `<script src="./widget.js">`로 바꾼 같은 페이지를 네 디렉터리에 쓴다. 템플릿 `vite.config.js`의
  `hostPage`와 같은 규칙이며, 그 줄이 없으면 빌드가 실패한다.
- 크기: 각 `widget.js`의 raw, gzip, brotli. 템플릿 `scripts/size.mjs`와 같은 방식(zlib 기본값: gzip level 6,
  brotli quality 11)이라 lithent 값이 템플릿 빌드 로그와 맞는다.

## 4. 결정

- [x] **DC-1 비교 대상은 React, Preact, Lit.** React는 IDEAS의 비교 상대, Preact는 "작은 React"의 기준,
  Lit은 커스텀 엘리먼트를 만들 때 가장 먼저 고르는 라이브러리다. Lit을 빼면 비교가 쉬운 상대만 고른 것이 된다.
  버전은 2026-11-20 기준 최신 안정판으로 고정한다: React 19.3.1, Preact 11.2.0, Lit 3.3.3.
- [x] **DC-2 컴포넌트는 각 프레임워크의 보통 쓰는 방식으로 쓴다.** React·Preact는 함수 컴포넌트와
  `useState`·`useEffect`, Lit은 `LitElement`와 `static properties`·`html`. 크기를 줄이려는 특수한 작성법을
  쓰지 않는다(lithent도 템플릿 그대로다).
- [x] **DC-3 React·Preact의 커스텀 엘리먼트 래퍼는 직접 쓴 공용 파일 하나.**
  `lithent/element`와 같은 기능만 한다: 선언한 props의 속성 변환(String·Object), 프로퍼티 접근자,
  정의 전에 할당한 값 넘겨받기, open shadow root와 `adoptedStyleSheets`(없으면 `<style>`),
  이동할 때 인스턴스 유지(microtask 뒤 분리돼 있으면 unmount), `emit`과 같은 이벤트 기본값.
  두 프레임워크가 같은 래퍼를 쓰고 렌더·해제 함수만 다르다. 래퍼 코드는 번들 크기에 들어간다
  (lithent 번들에도 `lithent/element`가 들어 있다).
  `@r2wc/react-to-web-component`·`preact-custom-element`를 쓰지 않는 이유: 기능이 서로 다르고
  (취소 가능한 이벤트, `adoptedStyleSheets` 등), 비교가 프레임워크가 아니라 래퍼 선택의 문제가 된다.
  페이지에 이 선택과 래퍼 소스 링크를 밝힌다.
- [x] **DC-4 같은 동작은 E2E로 보인다.** 위젯 템플릿 E2E의 시나리오(렌더, slot, 페이지 CSS 차단, rate·submit,
  취소, page-id 변경, Object 프로퍼티, CSS 변수)를 네 빌드에 똑같이 돌린다.
  `page.goto`는 `file://`의 `dist/<fw>/index.html`이다(템플릿 스펙과 같다). 번들에 base 코어가 들어 있어
  concurrent 프로젝트에서는 뺀다.
- [x] **DC-5 전역 변수는 실패가 아니라 기록이다.** Lit은 설계상 `litElementVersions` 등을 `window`에 남긴다.
  E2E는 위젯을 불러오기 전후 `window`의 키를 비교해 프레임워크별 기대값과 같은지 본다.
  바뀌면 테스트가 알려 주고, 페이지 표도 같은 값을 보여 준다.
- [x] **DC-6 로딩 지표 두 가지.** (a) **표시까지**: navigation start부터 질문 문구가 shadow DOM에 들어간
  시각까지. `addInitScript`에서 `customElements.whenDefined` 뒤 `MutationObserver`로 잰다(React·Lit은 첫
  렌더가 비동기라 정의 시각과 다르다). (b) **스크립트 실행**: (a) − `widget.js`의 Resource Timing `responseEnd`.
  내려받기를 뺀 파싱·실행·첫 렌더 시간이다.
- [x] **DC-7 측정 조건.** Playwright Chromium. 요청마다 새 컨텍스트(캐시 없음), 로컬 서버가 brotli(quality 11)로
  보낸다(CDN의 정적 압축과 같다). 프로필 둘: **모바일** — CDP로 CPU 4배 느리게, RTT 150ms, 내려받기 1.6Mbps
  (Lighthouse 모바일 기본값), **제한 없음**. 프레임워크당 프로필당 30회, 앞의 2바퀴는 버린다.
  바퀴마다 순서를 돌려 시간에 따른 기계 상태 변화가 한쪽에 몰리지 않게 한다. 중앙값과 25·75 백분위를 싣는다.
- [x] **DC-8 결과는 커밋한다.** CI 러너에서 매번 재면 값이 흔들리므로 측정은 수동이다. `results.json`에
  환경(브라우저 버전, CPU 모델·코어 수, OS, Node), 날짜, 커밋, 프레임워크 버전, 측정한 번들의 sha256과 크기를
  담는다. 페이지 생성 때 현재 번들 해시와 다르면 "번들이 측정 뒤 바뀌었다"를 표시한다. 크기 표는 항상 현재 빌드다.
- [x] **DC-9 공개 위치.** 문서 사이트와 같은 GitHub Pages의 `/lithent/widget-compare/`. `docs.yml`이
  `showcase/widget-compare/dist`를 `site/widget-compare/`로 복사한다. Custom Elements 가이드에서 링크한다.
- [x] **DC-10 공개 페이지는 빌드 때 만든 정적 HTML.** 표는 `sizes.json`과 `results.json`에서 만든다.
  데모는 네 호스트 페이지를 iframe으로 나란히 띄운다(같은 태그 이름 `feedback-widget`을 쓰므로 한 문서에
  둘 수 없다. iframe은 실제 고객 페이지처럼 각자 독립이다).

## 5. 한계 (페이지에도 쓴다)

- 위젯 하나의 비교다. 큰 앱의 렌더 성능이나 개발 경험은 다루지 않는다.
- 시간은 한 기계의 실험실 측정이다. 절댓값보다 같은 조건에서의 차이를 본다.
- React·Preact 래퍼는 직접 쓴 것이다. 다른 래퍼 라이브러리를 쓰면 크기가 달라진다.
- 호스트 페이지가 이미 같은 프레임워크를 쓰면 런타임을 공유할 수 있다. 이 비교는 독립 위젯(고객 페이지가
  무엇으로 만들어졌는지 모르는 경우)을 가정한다.
