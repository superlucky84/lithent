# DESIGN — 컴포넌트 테스트 유틸 (`lithent/test`)

- 작성일: 2026-11-20
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

## 1. API

```ts
import { render, act, cleanup } from 'lithent/test';

render(ui: WDom, options?: { container?: HTMLElement; baseElement?: HTMLElement }): {
  container: HTMLElement;   // ui가 그려진 요소
  baseElement: HTMLElement; // container를 붙인 곳 (기본 document.body)
  unmount(): void;          // 이 트리만 해제
};
act<T>(fn?: () => T | Promise<T>): Promise<T>; // fn 실행 → 반영이 끝날 때까지 대기
cleanup(): void;                                // render한 트리 전부 해제, 만든 컨테이너 제거
```

`@testing-library/dom`과 함께:

```tsx
import { render, act } from 'lithent/test';
import { screen, fireEvent } from '@testing-library/dom';

render(<Counter />);
await act(() => fireEvent.click(screen.getByRole('button', { name: '+1' })));
expect(screen.getByText('count: 1')).toBeTruthy();
```

## 2. 기다리기 (`act`)

| 코어 | 반영 시점 | `act`가 기다리는 것 |
|---|---|---|
| base | `renew()` → `queueMicrotask`로 모아 그린다 (`src/utils/redraw.ts`). `mountCallback`은 그린 직후 동기 | 마이크로태스크가 다 빠질 때까지: 매크로태스크 하나 |
| concurrent | sync 레인은 마이크로태스크, low 레인(`deferRender`)은 MessageChannel 태스크로 5ms씩 나눠 처리. `whenIdle()`이 low 레인이 빌 때 풀린다 | 매크로태스크 → `whenIdle()` → 그 사이 새 작업이 생겼으면 반복 |

```
act(fn):
  result = await fn()
  repeat (최대 100회):
    await macrotask()            // 대기 중인 마이크로태스크(기본 코어 redraw, helper, sync 레인) 모두 실행
    if core.whenIdle 없음: return result      // base
    if idle 즉시(whenIdle()가 이미 풀린 약속): return result
    await whenIdle()             // low 레인 대기. 끝난 뒤 생긴 sync 작업은 다음 바퀴의 macrotask가 처리
  throw Error('lithent/test: rendering did not settle …')
```

- **코어 판별**: `import * as core from 'lithent'`의 `core.whenIdle`. base 코어에는 없다. 사용자가 bare `lithent`를
  `lithent-concurrent`로 alias하면 `lithent/test`도 concurrent 네임스페이스를 받는다. `lithent/helper` store가
  `notifyStoreWrite`를 찾는 방식과 같다.
- **"이미 idle" 판별**: `whenIdle()`은 idle이면 `Promise.resolve()`를 돌려준다. `.then`을 걸고 마이크로태스크 한 번을
  기다려 실행됐는지 본다. 대기 중이면 실행되지 않는다.
- **매크로태스크**: `MessageChannel`이 있으면 그것, 없으면 `setTimeout(0)`. 가짜 타이머는 `setTimeout`을 가로채지만
  MessageChannel은 건드리지 않는다(RQ-3). concurrent의 low 레인도 MessageChannel을 쓴다.
- **상한 100회**: 렌더가 렌더를 끝없이 부르는 경우 테스트가 시간 초과 대신 원인이 적힌 오류로 끝난다.
  마이크로태스크만으로 도는 무한 루프는 매크로태스크가 오지 않으므로 잡지 못한다(테스트 러너 시간 초과).
- **범위 밖**: 사용자 코드의 `setTimeout`·`fetch` 같은 비동기는 기다리지 않는다. `findBy*`·`waitFor`
  (`@testing-library/dom`)나 가짜 타이머를 쓴다.

## 3. 정리 (`cleanup`)

- `render`는 마운트 목록에 `{ destroy, container, ownsContainer }`를 넣는다. `destroy`는 `lithent`의 `render`가
  돌려주는 해제 함수다(언마운트 콜백 실행).
- `cleanup()`은 목록을 비우며 각각 해제하고, `lithent/test`가 만든 컨테이너만 문서에서 뗀다.
  사용자가 넘긴 `container`는 비우기만 하고 남긴다.
- 자동 등록: 모듈이 로드될 때 전역 `afterEach`가 함수면 `afterEach(cleanup)`. Vitest `globals: true`, Jest가 해당한다.
  전역이 없으면 사용자가 `afterEach(cleanup)`을 직접 둔다(문서에 적는다). `@testing-library/react`와 같은 규칙이다.

## 4. 결정

- [x] **DC-1 `lithent` 패키지의 하위 경로 `lithent/test`.** 기존 하위 경로(`helper`, `ssr`, `element`…)처럼
  `test/` workspace 패키지(`lithent-test`, private)로 만들고 루트 `exports`로 낸다. 별도 npm 패키지는 신뢰 발행 설정과
  버전 관리가 하나 더 생긴다.
- [x] **DC-2 의존성 없음. 쿼리·이벤트는 `@testing-library/dom`에 맡긴다.** `lithent/test`는 lithent에만 의존한다.
  `@testing-library/dom`을 optional peer로 두고 `screen`·`fireEvent`를 다시 내보내는 방식(`@testing-library/preact`)도
  있지만, 그러면 코어 패키지에 peer 의존성이 처음 생기고 그 라이브러리를 안 쓰는 사람도 import 오류를 만난다.
  lithent가 그리는 것은 실제 DOM이라 `screen`이 그대로 동작하고, lithent에 고유한 부분은 "기다리기"와 "정리"뿐이다.
  이벤트 함수는 감싸지 않고 `act`로 감싼다(`await act(() => fireEvent.click(el))`).
- [x] **DC-3 이름은 React·Preact와 같게.** `render`·`act`·`cleanup`. `act`는 React의 같은 이름 함수처럼
  "이 안의 일과 그 결과 렌더를 끝낸 뒤 진행"이다. 기본 코어와 달리 React의 `act`는 동기로도 쓰이지만,
  lithent는 반영이 마이크로태스크 뒤라 항상 `await`한다.
- [x] **DC-4 `render`는 동기.** 두 코어 모두 첫 렌더와 `mountCallback`이 `render()` 안에서 끝난다
  (`src/render.ts`, `lithentConcurrent/src/render.ts`). `mountCallback`이 `renew`를 부르는 경우처럼 첫 렌더 직후의
  갱신까지 보려면 `await act()`.
- [x] **DC-5 `rerender`·`debug`·`renderHook` 없음.** lithent는 같은 컨테이너에 `render`를 다시 부르면 덧붙이므로
  React식 `rerender`(같은 루트에 새 props)를 흉내 내면 의미가 다르다. props 변경은 부모 컴포넌트와 `act`로 시험한다(문서 예시).
  `debug`는 `screen.debug()`가 있다.
- [x] **DC-6 DOM 필요.** `document`가 없으면 `render`가 "jsdom이나 happy-dom 환경에서 실행하라"는 오류를 낸다.
- [x] **DC-7 빌드 형식은 ESM·CommonJS만.** 테스트 러너에서만 쓰므로 UMD·CDN 빌드와 크기 예산은 두지 않는다.
  다른 하위 경로처럼 `.d.ts`·`.d.cts`를 낸다.
- [x] **DC-8 템플릿의 `@types/node`를 `^22.12.0`으로 올린다.** M-1에서 문서대로
  `npm install --save-dev vitest`를 하자 Vitest 5(2026-09 출시, 현재 최신)가 `@types/node` `^22 || >=24`를
  peer로 요구해 SPA·위젯 템플릿의 `^20.19.0`과 충돌했다(ERESOLVE). 템플릿이 지원하는 Node 범위
  (`^20.19.0 || >=22.12.0`)는 그대로 두고 타입 패키지만 올린다. Express 템플릿은 `@types/node`가 없다.
  이미 만든 프로젝트를 위해 문서에 `npm install --save-dev @types/node@22` 안내를 둔다.
- [x] **DC-9 시험 방법.** concurrent 코어 실물로 `deferRender` 시간 분할을 시험하지만, Node의 MessageChannel은
  스케줄러의 이어지는 메시지를 테스트의 메시지보다 먼저 처리해서 "한 태스크만 기다리는" 잘못된 구현도 통과한다.
  그래서 기다리기 규칙 자체는 `whenIdle`을 흉내 낸 스케줄러(`vi.mock('lithent')`)로 따로 시험한다:
  idle까지 기다림, idle 뒤 새 작업이면 다시 기다림, 끝나지 않으면 오류.
