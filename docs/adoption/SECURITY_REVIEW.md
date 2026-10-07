# 보안 검토 자료

- 작성일: 2026-10-07
- 대상: `lithent` 1.23.0 이후 소스 (`renderToString` 속성 이스케이프 수정 포함)
- 신고 창구·지원 버전: [/SECURITY.md](../../SECURITY.md)

보안 심사에서 나오는 질문에 대한 답과 그 근거다. "검증"은 테스트로 확인한 것, "소스"는 코드를
읽고 확인한 것이다.

## 1. Content-Security-Policy

**아래 정책에서 위반 없이 동작한다.** (검증: `e2e/csp.spec.ts`, Chromium, base·concurrent 코어 각각)

```
default-src 'none'; script-src 'self'; style-src 'self';
require-trusted-types-for 'script'
```

확인한 동작: 최초 렌더, 텍스트·속성·style 객체 갱신, 키 있는 리스트 재정렬, 이벤트,
`lithent/element`의 Shadow DOM 렌더와 `styles` 적용, 속성 변경, 커스텀 이벤트.

| 요구 | 필요 여부 | 근거 |
|---|---|---|
| `script-src 'unsafe-eval'` | 불필요 | 런타임 번들에 `eval`·`new Function` 없음 (소스 + 빌드 산출물 검색) |
| `script-src 'unsafe-inline'` | 불필요 | 이벤트는 `addEventListener`로 붙임. 속성 문자열 핸들러를 만들지 않음 |
| `style-src 'unsafe-inline'` | 클라이언트 렌더는 불필요 | style 객체는 CSSOM으로 적용. `lithent/element`의 `styles`는 `adoptedStyleSheets` |

주의할 경우:

- **SSR의 inline style**: `renderToString`은 style 객체를 `style="..."` 속성으로 쓴다.
  `'unsafe-inline'`이 없는 정책에서는 브라우저가 이 속성을 무시하고, hydration 때 CSSOM으로
  다시 적용된다. hydration 전까지 스타일이 빠져 보일 수 있다. (소스)
- **`adoptedStyleSheets`가 없는 브라우저**: `lithent/element`는 `<style>` 엘리먼트로 대체하는데,
  이 경로는 `style-src 'unsafe-inline'` 또는 nonce가 필요하다. (소스)

## 2. Trusted Types

`require-trusted-types-for 'script'`에서 일반 렌더·갱신은 동작한다. (검증)

sink에 문자열을 대입하는 경로는 두 곳이고, 기본 정책(default policy)이 없으면 거부된다.

| 경로 | 위치 | 확인 |
|---|---|---|
| `innerHTML` prop | `src/render.ts`, `lithentConcurrent/src/render.ts` | 검증 — `TypeError`로 거부됨 |
| lithent가 렌더한 `<html>` 엘리먼트를 제거할 때 `innerHTML = ''` | 같은 파일 | 소스 |

위젯·영역 단위로 쓰고 `innerHTML` prop을 쓰지 않으면 해당 없다.

## 3. HTML 주입 경로

| 입력 | 브라우저 | `renderToString` |
|---|---|---|
| 텍스트 | `createTextNode` — HTML로 해석되지 않음 | `&` `<` `>` 이스케이프 |
| 속성 값 | `setAttribute` — 속성 밖으로 못 나감 | `&` `<` `>` `"` 이스케이프 (1.23.0까지는 안 함) |
| 속성 이름 | prop 키 그대로 | 공백·따옴표·`<>/=`가 든 이름은 쓰지 않음 |
| `innerHTML` prop | HTML로 해석 | HTML로 해석 |

애플리케이션이 책임질 것:

- `innerHTML` prop에 신뢰할 수 없는 입력을 넣지 않는다. React의 `dangerouslySetInnerHTML`과 같다.
- `href`·`src` 같은 URL 속성은 검사하지 않는다. `javascript:` URL은 애플리케이션이 걸러야 한다.
- 신뢰할 수 없는 객체를 props로 펼치지(`{...data}`) 않는다. 어떤 속성과 이벤트 핸들러를 붙일지
  데이터가 정하게 된다.

## 4. 격리 (`lithent/element`)

- Shadow DOM 기본값은 open이다. `shadow: 'closed'`로 호스트 페이지 스크립트가 내부 DOM에
  접근하지 못하게 할 수 있다.
- 위젯 CSS와 호스트 CSS는 양방향으로 새지 않는다. (검증: `e2e/element.spec.ts`)
- 한 페이지에 lithent 사본이 둘 있어도 서로 간섭하지 않는다. 호스트의 lithent 버전과 무관하게
  위젯이 자기 사본을 쓸 수 있다. (검증: `e2e/element.spec.ts` R-1)

## 5. 공급망

- `lithent` 코어는 런타임 의존성이 없다. `lithent/tag`만 `htm`에 의존한다.
- 릴리스 전 `pnpm verify:release`가 실제로 패키징한 tarball을 풀어서 검사한다.
- UMD 번들은 전역 `lithent`, `lithentHelper`, `lithentElement`만 만든다. 내장 프로토타입을
  수정하지 않는다. (소스)
