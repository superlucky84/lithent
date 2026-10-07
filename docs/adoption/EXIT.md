# 걷어내는 방법

- 작성일: 2026-10-07

lithent는 페이지 전체가 아니라 위젯·영역 단위로 넣는 것을 전제로 한다. 넣은 단위가 곧 빼는
단위다. 아래는 도입 형태별로 제거에 필요한 작업이다.

## 1. `lithent/element`로 넣은 위젯

```html
<script src="https://cdn.example.com/pay.js"></script>
<pay-button amount="1000"></pay-button>
```

**제거: 태그와 `<script>`를 지운다.** 호스트 페이지에 남는 것이 없다.

- 호스트 코드와의 접점은 표준 DOM뿐이다 — 속성, 프로퍼티, `addEventListener`로 받는 이벤트.
  호스트는 lithent API를 호출하지 않는다.
- CSS는 Shadow DOM 안에 있어서 지울 호스트 스타일이 없다.
- **다른 구현으로 교체**할 때도 같은 태그 이름·속성·이벤트를 지키는 Custom Element면 호스트
  페이지는 수정하지 않는다. React, Lit, 순수 JS 무엇으로 다시 만들어도 된다.

## 2. `render()`로 특정 영역에 마운트한 컴포넌트

```ts
const destroy = render(<OrderTable />, document.getElementById('orders'));
```

**제거: `destroy()`를 호출하고 마운트 코드를 지운다.** `render`가 돌려주는 함수가 DOM과 이벤트
리스너를 정리한다. 컨테이너 엘리먼트는 그대로 남으므로 다른 것으로 채울 수 있다.

## 3. 다른 프레임워크로 옮길 때 다시 써야 하는 것

제거가 아니라 이전(migration)이면 컴포넌트를 다시 써야 한다. 범위는 다음과 같다.

| 부분 | 이전 비용 |
|---|---|
| JSX 마크업 | 거의 그대로. `class` → `className` 같은 속성 이름 차이 정도 |
| 이벤트 핸들러, 순수 로직 | 그대로 |
| `mount`의 클로저 상태 + `renew()` | 대상 프레임워크의 상태 방식으로 다시 작성 |
| `lithent/helper` (`state`, `computed`, `effect`, `store`) | 대응하는 훅·시그널로 다시 작성 |
| `mountCallback`, `updateCallback` | 대응하는 생명주기로 다시 작성 |

컴포넌트 하나의 크기에 비례하는 작업이고, 위젯 단위로 도입했다면 위젯 수만큼이다.

## 4. 잠기지 않는 이유

- **빌드 도구 의존이 없다.** UMD 한 줄로 동작하므로 걷어낼 번들러 설정·플러그인이 없을 수 있다.
  JSX를 썼다면 `tsconfig`/Vite의 JSX 설정만 되돌린다.
- **전역 오염이 없다.** UMD 전역 이름 외에는 페이지에 남기는 것이 없다.
- **데이터 형식을 강제하지 않는다.** 상태는 일반 객체와 클로저 변수다. 서버 API나 저장 형식에
  lithent 고유의 것이 들어가지 않는다.
