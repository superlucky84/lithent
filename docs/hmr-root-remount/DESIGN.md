# DESIGN — `<html>` 루트 컴포넌트의 반복 교체 (hmr-root-remount)

- 작성일: 2026-11-20
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

## 1. 변경

두 코어에서 루트를 넣는 곳을 `insertRoot(wDom, element)` 하나로 모으고, `<html>`을 바꿀 때 루트의
`we`를 새 `<html>`로 옮긴다.

```ts
const insertRoot = (wDom: WDom, element: Node) => {
  const { we, ae } = wDom as { we: HTMLElement; ae?: HTMLElement };
  if (ae) we.insertBefore(element, ae);
  else if (we.tagName === 'HTML') {
    wDom.we = (element.nodeType === 11 ? element.firstChild : element) as HTMLElement;
    we.replaceWith(element);
  } else we.appendChild(element);
};
```

- base: 기존 `insertRoot(wrapElement, element, afterElement)`를 `insertRoot(wDom, element)`로 바꾼다.
  호출하는 곳은 `render`와 `typeAdd` 두 곳이다.
- concurrent: `render`와 `typeAdd`에 각각 있던 같은 분기를 이 함수로 바꾼다.
- 컴포넌트 루트는 DocumentFragment로 그려지므로 그 첫 자식(새 `<html>`)을 `we`로 삼는다.
  `replaceWith` 뒤에는 fragment가 비므로 먼저 잡아 둔다.

## 2. 결정

- [x] DC-1 고치는 방식 — 새 `<html>`을 wrapper로 삼는다.
  - 대안 A: `replaceWith` 뒤 `document.documentElement`를 `we`로 삼는다. 더 짧지만, 문서 밖의
    `<html>`에 렌더한 경우(지금은 아무것도 붙지 않음) 이후 갱신이 실제 페이지를 덮어쓴다.
  - 대안 B: `<html>`을 바꾸지 않고 속성과 자식을 기존 `<html>`로 옮긴다. html WDom의 `el`도
    바꿔야 해서 코드와 바이트가 크다. base 코어는 여유가 37B였다.
  - 채택안은 문서 밖의 경우 지금과 같게 아무 일도 하지 않고, 살아 있는 경우만 고친다.
- [x] DC-2 검증 위치 — 위성 패키지 단위 테스트 두 곳.
  - HMR이 쓰는 경로(`createBoundary` → `replaceWDom`) 그대로이고, `LITHENT_CORE=concurrent`로
    두 코어를 모두 돈다. jsdom에서 수정 전 코드로 재현된다.
  - `render`로 붙인 경우는 devHelper, `hydration`으로 붙인 경우는 ssr 패키지에 둔다. 빌드는 테스트 파일까지
    타입 검사하고 `build:sequence`에서 devHelper가 ssr보다 먼저라, devHelper 테스트는 `lithent/ssr`을 import할 수
    없다(PR #129 첫 CI에서 TS2307). 코어 `render(…, null, true)`만으로는 대신할 수 없다: 서버 노드를 짝짓는
    `hydrateChildren`이 먼저 돌아야 해서 단독 호출은 `updateProps`에서 실패한다.
  - 실제 브라우저·Vite는 SSR 템플릿 수동 확인(MANUAL M-1, M-2)과, 다음 작업인 HMR 반복 감지 E2E에서 본다.
- [x] DC-3 릴리스 — 사용자 확정(2026-11-20): `lithent` 1.25.11 → 1.25.12,
  `lithent-concurrent` 0.2.7 → 0.2.8 (patch). 두 코어의 런타임 코드가 바뀐다.
  hmr-propagation의 `@lithent/hmr-parser` 0.2.6, `@lithent/lithent-vite` 0.4.1과 함께 내는 것을 권한다
  (그 수정으로 Layout 교체가 늘어난다).
