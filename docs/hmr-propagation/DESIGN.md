# DESIGN — 컴포넌트 없는 모듈의 HMR 전파 (hmr-propagation)

- 작성일: 2026-11-20
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

## 1. 변경

`createHmrBootstrapBlock`(`packages/hmrParser/src/strings.ts`)이 `accept` 블록을 **변환 시점에** 고른다.
컴포넌트 이름이 하나도 없으면 `import.meta.hot.accept(...)` 코드를 만들지 않는다.

```js
// 전: 모든 모듈에 들어가고 런타임에서만 막힌다
if ([].length) {
  import.meta.hot.accept(mod => { ... });
}

// 후: 컴포넌트가 있을 때만 들어간다
import.meta.hot.accept(mod => { ... });
```

`dispose`·`prune` 등록, render 가드, 내보내기 스냅샷은 그대로 둔다. marker 경로
(`markerParse.ts`)와 marker 없는 경로(`noMarkerParse.ts`)가 같은 함수를 쓰므로 둘 다 고쳐진다.

## 2. 결정

- [x] DC-1 고치는 위치 — 생성 시점 분기.
  - 대안: 컴포넌트가 없는 모듈은 변환하지 않는다(`shouldTransform`을 바꾼다).
    - 변환 조건(`detectLithentUsage`, marker 이름, 이름 없는 mount)과 header import를 함께 다시 봐야 해서
      검토 범위가 커진다.
  - 생성 시점 분기는 accept 한 곳만 바꾸고, 기존 주석("Entries without components must propagate to
    importers")이 의도한 동작을 정적 분석에서도 그대로 만든다.
- [x] DC-2 검증 방법.
  - 단위: 변환 결과에 `import.meta.hot.accept` 문자열이 없는지 본다. Vite의 import 분석이 정적으로
    찾는 것과 같은 기준이다. store 모듈, render만 하는 진입점, `defineElement` 진입점, marker 경로를 본다.
  - 실제 Vite 모듈 그래프(`isSelfAccepting`)를 단위 테스트에서 보려면 dev 서버와 의존성 사전 번들링을
    띄워야 해서 단위 테스트에 넣지 않는다. 실제 Vite·브라우저 동작은 E2E로 본다.
  - E2E: 새 픽스처 — store 모듈(`lithent/helper`) ← 컴포넌트 모듈 ← render만 하는 진입점.
    - store를 고치면 새로고침 없이 새 값이 보인다.
    - 진입점을 고치면 페이지가 한 번 새로고침되고, 앱은 하나만 있다.
  - 고치기 전 코드에서 두 테스트가 실패하는 것을 먼저 확인한다.
- [x] DC-3 릴리스 — 사용자 확정(2026-11-20): `@lithent/hmr-parser` 0.2.5 → 0.2.6,
  `@lithent/lithent-vite` 0.4.0 → 0.4.1 (둘 다 patch).
  - `lithent-vite`는 `@lithent/hmr-parser`를 `workspace:*`로 의존하고, 발행할 때 정확한 버전으로
    고정된다. hmr-parser만 올리면 기존 lithent-vite 사용자에게 닿지 않는다.
  - 권장: SSR 템플릿의 Layout(`<html>` 루트) 두 번째 교체 시 본문이 사라지는 기존 버그
    (IMPLEMENT Phase 3a)를 먼저 고친다. 이번 수정으로 store 수정도 Layout을 교체하게 되어 더 자주 드러난다.
    → 수정 완료 [../hmr-root-remount/](../hmr-root-remount/). 두 수정을 함께 릴리스한다.
- [x] DC-4 위젯 템플릿의 `lithentVitePlugin({ include: /\.tsx$/ })` 우회는 이번에 그대로 둔다.
  템플릿은 발행된 `@lithent/lithent-vite ^0.4.0`을 설치하므로, 0.4.1 발행 뒤 범위를 올리면서 뺀다.
  `feedbackProps.ts` 분리는 우회가 아니라 설계라서 유지한다
  (컴포넌트 파일이 매번 새 객체를 내보내면 경계에서 갱신하지 못하고 전파된다).
  → 발행 뒤(2026-11-20) 범위를 `^0.4.1`로 올리고 우회를 뺐다. 발행된 0.4.1로 만든 새 위젯 프로젝트에서 동작을 확인했다.
