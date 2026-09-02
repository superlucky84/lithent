# lithent-concurrent

`lithent`의 **인터페이스 호환 별도 빌드**. 큰 목록을 다루는 화면에서 **무거운 렌더가 입력을
통째로 막는 시간**을 줄인다.

기본 `lithent`는 이 패키지를 위해 **한 줄도 바뀌지 않았다.** 두 빌드는 같은 레포에서
같은 공개 인터페이스로 나오며, 소비자는 번들러 alias 한 줄로 갈아끼운다.

> **이름에 대하여.** 이 패키지는 렌더의 **빌드 단계**를 중단 가능하게 만든다.
> 그것을 `concurrent mode`라고 부르지 않는다 — 그 말은 React가 특정 기능 묶음
> (transition + Suspense + `useDeferredValue` + 선택적 하이드레이션)에 붙인 고유명사이고,
> 여기에는 그 묶음이 없다. 있는 것은 그 아래의 렌더러 속성뿐이다.

## 언제 값을 하는가 — 그리고 언제 안 하는가

실측이다 (10,000행, 실브라우저):

| 워크로드                          | 한 단위 | 이 빌드가 돕는가                                  |
| --------------------------------- | ------: | ------------------------------------------------- |
| 1,000행 (생성·교체·갱신)          |   4~8ms | **아니오.** 애초에 프레임을 안 넘는다             |
| 10,000행 신규 마운트              |   ~40ms | **예** — 그중 74%가 중단 가능                     |
| 10,000행 갱신                     |   ~44ms | **예** — 약 50%가 중단 가능                       |
| 10,000행 대량 교체(언마운트 동반) |   ~60ms | **거의 아니오** — 98%가 커밋이고 커밋은 못 쪼갠다 |

**경계는 1,000행과 10,000행 사이에 있다.** SSR 페이지에 인터랙티브 컴포넌트를 몇 개
꽂는 용도라면 이 빌드로 얻을 것이 없다. 기본 `lithent`를 쓰면 된다.

처리량은 기본 코어와 사실상 같다 (대형 시나리오 평균 1.04배). 중단은 **빨라지는 것이
아니라 쪼개지는 것**이므로, 총 시간이 아니라 **한 번에 붙잡고 있는 최대 구간**이 줄어든다.

## 쓰는 법

```bash
npm install lithent-concurrent
```

번들러에서 코어만 바꾼다. **정규식으로 정확히 `lithent`만** 걸어야 한다 —
접두사 매칭을 쓰면 `lithent/jsx-dev-runtime` 같은 서브패스가 함께 망가진다.

```js
// vite.config.js
export default {
  resolve: {
    alias: [{ find: /^lithent$/, replacement: 'lithent-concurrent' }],
  },
};
```

```js
// webpack
resolve: {
  alias: {
    lithent$: 'lithent-concurrent';
  }
}
```

`lithent/helper`, `lithent/jsx-runtime` 등 서브패스는 **그대로 둔다.** 교체 대상은 코어뿐이다.

## 늘어난 API

기본 코어의 export는 전부 그대로 있고, 아래가 더해진다.

### `deferRender(scope)`

`scope` 안에서 발생한 갱신을 **저우선순위 레인**으로 보낸다.

```js
import { deferRender } from 'lithent'; // 번들러에서 concurrent로 alias

input.oninput = e => {
  query = e.target.value; // 급한 것: 입력창은 즉시
  renewInput();
  deferRender(() => {
    // 무거운 것: 미룬다
    rows = filter(query);
    renewList();
  });
};
```

**`scope`는 지금 동기로 실행된다.** 미뤄지는 것은 그것이 일으킨 **렌더**뿐이다.

> **React의 `startTransition`과 다르다.** 그 이름은 (1) 새 UI가 준비될 때까지 이전 상태가
> 보인다는 전환 의미론과 (2) 반응성 `isPending`을 함께 뜻한다. **여기엔 둘 다 없다.**
> 상태는 컴포넌트 클로저에 있고 setter가 그 자리에서 바꾸므로, 같은 컴포넌트가 그 사이
> 급한 우선순위로도 렌더되면 새 값이 즉시 보인다. 이름을 `deferRender`로 둔 이유다.

### `whenIdle(): Promise<void>`

저우선순위 레인이 비면 resolve된다. `await nextTick()`은 **동기 커밋까지만** 보장한다
(BC-4) — 미룬 렌더까지 기다리려면 이쪽을 쓴다.

### `hasPending(compKey, lane?)`

해당 컴포넌트가 레인에 대기 중인지. 저수준 조회다.

### `lithent-concurrent/helper`

레인이 있어야 의미가 있는 helper. `lithent/helper`는 **무변경**이며 그대로 쓴다.

```js
import {
  deferred,
  ldeferred,
  hasPendingRender,
} from 'lithent-concurrent/helper';
```

- `deferred(value, renew)` / `ldeferred(value)` — 저우선순위로 렌더되는 `state`/`lstate`
- `hasPendingRender()` — 이 컴포넌트에 미룬 렌더가 대기 중인지

> **`hasPendingRender`는 조회이지 반응성이 아니다.** `.value`를 읽는 것만으로는 리렌더가
> 일어나지 않는다. pending 표시는 **동기로 렌더되는 부모나 형제**에 두고, 무거운 쪽만
> `deferred`로 미루는 조합으로 쓴다.

## 하지 않는 것

- **transition 의미론** — "새 UI가 준비될 때까지 이전 값이 보인다"는 보장이 없다.
  상태가 클로저에 있어 레인별 사본을 둘 수 없기 때문이며, 이것은 영구 속성이다.
- **Suspense / `use()`** — 렌더 중 Promise를 던지고 언와인딩하는 패턴은 **비목표**다.
  클로저 상태 모델과 근본적으로 충돌한다 (JS는 throw로 빠져나간 함수를 재개할 수 없다).
- **커밋 중단** — 커밋은 원자적이다. 중간에 멈추면 반쯤 갱신된 화면이 보인다.
  React도 커밋은 동기다.

## 호환성

기본 코어에서 이 빌드로 갈아탈 때 관측 가능하게 달라지는 것들이다.
전부 **minor**이며 아래에 명시한다 (DC-8).

### BC-1 — `mountCallback` flush 시점이 커밋 경계 1곳으로

DOM 삽입 지점마다가 아니라 **커밋이 끝난 뒤 1회** 실행된다.

- **바뀜**: 한 갱신에서 여러 형제가 마운트될 때, 앞선 형제의 `mountCallback`이 보는 DOM이
  _절반만 지어진 상태_ → **완성된 커밋 상태**. `mountCallback` ↔ `updateCallback`의 교차 순서.
- **안 바뀜**: `mountCallback`끼리의 상대 순서, `updateCallback`끼리의 상대 순서,
  언마운트 계열 전부, `mountReadyCallback`, **결과 DOM**.

### BC-2 — mounter 계약 (예약, 현재 미발동)

계약이 "mounter 정확히 1회"에서 **"커밋된 mounter만 유효, 시도는 여러 번 가능"**으로 넓어진다.

**오늘 이 완화는 발동하지 않는다.** 스케줄러가 마운트를 한 빌드를 폐기하지 않으므로
mounter 본문은 커밋되는 컴포넌트마다 정확히 한 번 실행된다. 계약을 넓혀 두는 이유는
그 보장이 이제 구조가 아니라 스케줄러 정책에 기대기 때문이다.

영향받는 것은 **mounter 본문에서 직접 일으키는 부수효과**뿐이다. `mountCallback`은
커밋에서만 돌므로 지금도 앞으로도 안전하다 — 부수효과는 `mountCallback`에 두는 것이
어차피 옳다.

### BC-3 — 저우선순위 렌더는 유휴 태스크에서 flush된다

기본 우선순위는 여전히 마이크로태스크다. `deferRender`를 쓰지 않으면 무영향이다.

### BC-4 — `nextTick()`의 보장은 sync 레인에 한정된다

`await nextTick()`은 **동기 커밋**까지만 보장한다. 미룬 렌더 완료를 기다리려면
`whenIdle()`을 쓴다. `nextTick` 자체의 의미는 바뀌지 않았다 (DC-9).

## 크기

| 빌드                   |  brotli |
| ---------------------- | ------: |
| `lithent` (기본, 동결) | 4,734 B |
| `lithent-concurrent`   | 6,149 B |

## 더 읽을 것

설계 근거·측정·결정 기록은 레포의 `docs/concurrent-rendering/`에 있다 —
`REQUIREMENTS.md` → `DESIGN.md` → `IMPLEMENT.md` → `MANUAL_TEST_CHECKLIST.md`.
