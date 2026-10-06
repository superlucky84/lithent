# DESIGN — `lithent/element` (Custom Element 래퍼)

- 작성일: 2026-10-06
- 상태: **DC-1~DC-9 확정 (2026-10-06, 사용자 승인: 권장안 일괄). R-1 해소 (Phase 0). B-1 코어 버그 수정 (Phase 1, §10.1).**
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md), [IMPLEMENT.md](./IMPLEMENT.md), [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

## 1. 설계 원칙

- **P1. 코어 무수정.** `h`, `render`, `mount`만 사용한다 (REQUIREMENTS §1.3-1). 예외: B-1 버그 수정 (§10.1).
- **P2. 사용자 컴포넌트 무수정.** 기존 `mount`/`lmount` 컴포넌트를 그대로 넘긴다.
- **P3. 작게.** 런타임 목표는 ≤ 1,000 B(brotli). 기능을 더할 때마다 RC-3을 다시 잰다.
- **P4. 표준 그대로.** 호스트 페이지는 lithent를 몰라도 된다. 속성·프로퍼티·DOM 이벤트·slot만 쓴다.

## 2. 핵심 메커니즘 — 호스트 래퍼 컴포넌트

### 2.1 근거가 되는 코어 동작 (코드로 확인함)

| 사실 | 위치 | 의미 |
|---|---|---|
| `render()`는 destroy 함수를 반환한다 | `src/render.ts:41` | `disconnectedCallback`에서 호출하면 unmount 훅까지 실행된다 |
| `renew`는 microtask 큐로 합쳐진다 | `src/utils/redraw.ts:7-19` | 같은 태스크의 속성 변경 N회 → 렌더 1회 (FR-3 자동 충족) |
| 부모 재렌더 시 자식 props 객체를 **제자리 갱신** | `src/diff.ts:122-123` | 내부 컴포넌트가 setup에서 잡은 `props` 참조가 계속 최신 값을 본다 |
| root `render`의 `wrapElement`는 `appendChild`/`insertBefore`만 쓴다 | `src/render.ts:30-38`, `typeAdd` | `ShadowRoot`(DocumentFragment)도 렌더 루트가 될 수 있다 (타입만 캐스팅) |

### 2.2 구조

```
<pay-button amount="1000">          ← 호스트 요소 (LithentElement)
  #shadow-root                      ← 렌더 루트
    [<style> 폴백]                   ← §5
    Host 컴포넌트 (mount)            ← element 패키지가 만든 래퍼. renew를 쥐고 있다
      PayButton(props)              ← 사용자 컴포넌트 (무수정)
```

```ts
// 의사 코드 — 실제 구현은 IMPLEMENT Phase 1~6
class LithentElement extends HTMLElement {
  static observedAttributes = attrNames;      // FR-3
  declare p: Props;                           // 현재 props (호스트가 소유, 생성자에서 {})
  declare r?: () => void;                     // Host의 renew
  declare d?: () => void;                     // render()가 돌려준 destroy
  // 렌더 루트는 모듈 WeakMap `roots`에 보관 (§2.4)

  connectedCallback() {
    if (this.d) return;                       // DC-4: 이동이면 아무것도 안 함
    const root = getRenderRoot(this);         // DC-8
    applyStyles(root);                        // §5
    const Host = mount(renew => {
      this.r = renew;
      return () => h(component, { ...this.p, host: this });   // DC-5
    });
    this.d = render(h(Host, {}), root as HTMLElement);
  }

  disconnectedCallback() {
    queueMicrotask(() => {                    // DC-4
      if (!this.isConnected && this.d) { this.d(); this.d = this.r = undefined; }
    });
  }

  attributeChangedCallback(name, _old, value) {
    this.p[camel(name)] = convert(value, spec[camel(name)]);  // DC-2
    this.r?.();                               // 연결 전이면 r 없음 → 첫 렌더에 반영
  }
}
// 선언된 각 prop에 대해 prototype에 get/set 접근자 정의 (FR-4)
```

### 2.3 왜 이 구조인가 (대안 비교)

| 대안 | 문제 | 판정 |
|---|---|---|
| **A. 호스트 래퍼 컴포넌트 + renew** | 컴포넌트 1단계 추가(비용 미미) | **채택** |
| B. 사용자 컴포넌트를 직접 render하고 props 객체를 바깥에서 변경 | 갱신 트리거가 없다 — 내부 renew에 접근 불가. `componentUpdate(compKey)`는 공개돼 있지만 compKey가 props 객체 동일성에 묶여 있어 깨지기 쉽다 | 기각 |
| C. 속성 변경마다 destroy + render | 상태 유실, 비용 큼 | 기각 |
| D. 코어에 element 지원 추가 | P1 위반 | 기각 |

### 2.4 구현 메모 (Phase 1에서 확정)

- **렌더 루트 보관**: closed shadow root는 `el.shadowRoot`가 `null`이라 재연결 시 다시 `attachShadow`하면
  예외가 난다. 그래서 루트를 보관해야 하는데, 공개 필드면 closed root가 새어 나간다.
  `#private` 필드는 esbuild가 WeakMap 헬퍼로 낮춰 **br 669 B**가 됐다. 모듈 수준 `WeakMap<HTMLElement, root>`와
  `declare` 필드(생성자에서 대입)로 바꿔 **br 444 B**. 동작·은닉성은 같다.
- **컴포넌트 매개변수 타입**: 코어 `TagFunction`은 `lmount` 결과를 포함하지 않는다. element는
  `ElementComponent = (props: never, children?: never) => unknown`을 받아 mount·lmount·임의 props 타입을 모두 허용하고,
  내부에서 `TagFunction`으로 캐스팅한다. props 타입 추론은 Phase 7.

## 3. 패키지 레이아웃 (DC-1)

```
element/                    ← name: lithent-element (private, 다른 위성과 동일)
  src/index.ts              defineElement, (DC-5 결과에 따라) emit
  src/tests/*.test.ts       jsdom 단위 테스트
  html/                     dev 데모
  package.json  vite.config.js  tsconfig.json
```

- 루트 `package.json` `exports["./element"]`, `files`에 `element/dist`, `element/src`, `element/package.json` 추가.
- `vite.config.js`는 `ftags/vite.config.js`를 복제하고 `coreAlias`(RC-2)를 그대로 쓴다.
- UMD 전역 이름 `lithentElement`, 파일 `element/dist/lithentElement.{mjs,umd.js}`.
- `scripts/size-report.js` `targets`에 element 항목 추가 (RC-3).

## 4. 속성·프로퍼티 → props

### 4.1 선언 형식 (DC-2)

```ts
defineElement('pay-button', PayButton, {
  props: { amount: Number, currency: String, disabled: Boolean, options: Object },
});
```

| 선언 | 속성 → 값 | 속성 제거 시 |
|---|---|---|
| `String` | 그대로 | `undefined` |
| `Number` | `+v` (`NaN`이면 `undefined`. 빈 문자열 `amount=""`은 JS 규칙대로 `0`) | `undefined` |
| `Boolean` | 속성 존재 = `true` (`"false"` 문자열도 `true`, HTML 관례) | `false` — **처음부터 속성이 없을 때도 `false`** (생성자에서 초기화) |
| `Object` | `JSON.parse(v)`, 실패 시 `undefined` (경고 없음, §4.4) | `undefined` |

- 이름 변환: `max-count` 속성 ↔ `maxCount` prop. `observedAttributes`는 kebab-case 목록.
- 프로퍼티 할당은 **변환 없이** 그대로 props에 들어간다 (객체·함수 전달 경로).

- 처음부터 없는 String·Number·Object 속성은 props에 키가 없다(`undefined`로 읽힘). 브라우저는 존재하지 않는 속성에
  `attributeChangedCallback`을 부르지 않으므로 Boolean만 생성자에서 `false`로 채운다.
- `observedAttributes`는 static 필드가 아니라 getter다 (static 필드는 다운레벨 헬퍼를 만든다, RC-3).

### 4.2 업그레이드 전 할당 (FR-4)

호스트 페이지가 스크립트 로드 전에 `el.items = [...]`를 할당하면 인스턴스 own property로 남아
접근자를 가린다. 선언된 키마다 `hasOwnProperty`면 값을 꺼내 `delete` 후 접근자로 다시 할당한다
(Web Components 표준 관용구).

**위치는 생성자다 (Phase 3에서 변경).** 처음엔 `connectedCallback` 첫 진입으로 적었지만, 업그레이드는 *기존 객체 위에서*
생성자를 실행하므로 그 시점에 own property가 이미 있다. 생성자에서 흡수하면 연결 전에 `el.items`를 읽어도 접근자를 거친
일관된 값이 나오고, 연결 여부를 따로 추적할 필요가 없다.

### 4.2.1 네이티브 프로퍼티와 같은 이름 (제약)

`title`, `hidden`, `id`처럼 `HTMLElement`에 이미 있는 이름을 prop으로 선언하면 prototype 접근자가 네이티브 접근자를
가린다. `el.title = 'x'`는 prop만 바꾸고 `title` 속성은 설정하지 않는다(툴팁 등 네이티브 효과 없음). 속성 쪽
(`setAttribute('title', …)`)은 여전히 prop으로 들어온다. 검사 코드는 넣지 않는다(RC-3). 사용자 문서에
"네이티브 이름은 피할 것"으로 안내한다 (Phase 10). 동작은 `element-properties.test.ts`의 특성화 테스트로 고정.

### 4.3 반영(reflect) (DC-3)

v1은 프로퍼티 → 속성 반영을 하지 않는다 (권장). 필요하면 v2에서 prop별 `reflect` 옵션.

### 4.4 개발 모드 경고를 두지 않는다 (Phase 2에서 확정)

런타임 패키지(core·helper·ssr)에는 개발 전용 빌드나 `NODE_ENV` 분기가 없고, 경고는 devHelper(HMR)에만 있다.
element에 경고를 넣으면 프로덕션에도 문자열이 그대로 실린다(RC-3). 그래서 잘못된 JSON·숫자는 조용히 `undefined`,
non-shadow 모드의 `styles`는 조용히 무시한다. 이 규칙이 §5와 IMPLEMENT 4-3의 "dev 경고"를 대체한다.

## 5. 스타일 (FR-6)

```ts
defineElement('pay-button', PayButton, { styles: [css] });
```

- 정의당 `CSSStyleSheet`를 **1회** 만들어 모든 인스턴스가 공유한다(`adoptedStyleSheets`). 생성 시점은 정의가 아니라
  **첫 인스턴스의 루트 생성 시**다 — 정의만 하고 쓰지 않으면 시트를 만들지 않고, `replaceSync`가 없는 환경(jsdom)에서
  정의 단계가 예외를 내지 않는다.
- 스타일은 **루트당 1회**, 루트를 만들 때 넣는다. 루트와 그 안의 폴백 `<style>`은 분리·재연결 후에도 남는다.
- `adoptedStyleSheets` 미지원(jsdom, 구형 Safari)이면 렌더 루트 맨 앞에 `<style>`을 삽입한다.
- **주의 — 폴백 `<style>`과 lithent의 일괄 삭제 경로.** `findChildWithRemoveElement`
  (`src/render.ts:96-115`)는 "부모의 자식 수 == 루트 자식 수"일 때 `textContent = ''`로 일괄 삭제한다.
  `<style>`이 있으면 개수가 달라 이 경로를 타지 않으므로 `<style>`은 보존된다.
  단, **이 판단은 코어 내부 동작에 의존**하므로 Phase 4에 회귀 테스트(4-4)로 고정한다.
  → **확인됨 (Phase 4):** 루트 자식 2 → 0 → 3, 언마운트, 재마운트를 거쳐도 `<style>`은 정확히 1개, 항상 첫 자식.
- **크기 메모:** `adoptedStyleSheets` 분기는 br 약 60 B다(`<style>`만 쓰면 775 B, 현재 835 B). 예산이 넘치면
  첫 번째 축소 후보로 사용자에게 올린다 — 브라우저가 같은 텍스트의 `<style>`을 캐시하므로 기능상 손실은 작다.
- **유지 결정 (2026-10-06, 사용자):** `styles` 옵션과 `adoptedStyleSheets` 공유 분기를 그대로 둔다. 근거: shadow DOM이 CSS를
  양방향으로 막으므로 위젯 CSS는 위젯이 가지고 들어가야 하고, "스크립트 한 줄 + 태그 하나로 스타일까지 완성된 위젯"이
  제품 목표(REQUIREMENTS §1.1)와 맞는다. 컴포넌트 안에서 `h('style')`을 직접 렌더하는 방법도 동작하지만 편의·공유가 없다.
  호스트 쪽 커스터마이즈는 CSS 변수와 `::part()`로 안내한다 (Phase 10).
- non-shadow 모드에서 `styles`는 무시한다 (전역 오염 방지, 경고 없음 §4.4).

## 6. 이벤트 발행 (DC-5)

권장안: 내부 컴포넌트 props에 **예약 키 `host`**(호스트 요소)를 넣고, 유틸 `emit`을 제공한다.

```ts
import { emit } from 'lithent/element';
const PayButton = mount<{ amount: number; host: HTMLElement }>((_r, props) =>
  () => <button onClick={() => emit(props.host, 'pay', { amount: props.amount })}>Pay</button>);
// emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }))
```

- `emit`은 shadow **안**이 아니라 **호스트 요소 자체**에서 발행한다. 그래서 일반 버블링만으로 호스트 페이지에 닿는다.
  `composed: true`가 필요한 경우는 **위젯 요소가 다른 컴포넌트의 shadow root 안에 있을 때**다(호스트 앱이 웹 컴포넌트로
  만들어진 경우). 없으면 이벤트가 그 바깥 루트에서 멈춘다. (초안의 "composed로 shadow 경계를 넘는다"는 설명은 틀렸다 —
  Phase 5 돌연변이 검증에서 발견, 테스트를 중첩 shadow 상황으로 교체.)
- `cancelable: true` (Phase 5 추가, br 11 B): 호스트 페이지가 `preventDefault()`하면 `emit`이 `false`를 반환한다.
  예: 결제 위젯의 `pay`를 고객사가 막는 "before" 이벤트 패턴.
- **네 번째 인자 `init?: EventInit` (출하 전 추가, 사용자 요청, +1 B):** 기본값 위에 덮어쓴다
  (`{ bubbles: true, composed: true, cancelable: true, ...init, detail }`). `detail`은 항상 세 번째 인자가 이긴다.
  용도: 자주 발생하는 이벤트를 `bubbles: false`로 요소에만, 바깥 컴포넌트 안에만 머물 이벤트를 `composed: false`로.
  `emit`은 편의 함수일 뿐이며 `props.host.dispatchEvent(...)`를 직접 써도 된다고 가이드에 명시.
- `props.host` 이름은 예약어. `options.props`에 `host`를 선언하면 정의 시 예외 `Error('"host" is reserved')`.
  메시지를 짧게 한 이유는 크기(긴 메시지 대비 −18 B).
- 기각한 대안: `useHost()` 훅 — 모듈 전역 "현재 호스트" 참조가 필요한데,
  diff 모드에서 하위 컴포넌트가 나중에 resolve되는 경로(`src/wDom.ts:250-300`)에서 참조가 어긋날 수 있다.
  v2에서 context(`lithent/helper`)로 재검토.

## 7. 생명주기

| 사건 | 동작 |
|---|---|
| 정의 전 요소가 이미 문서에 있음 | `customElements.define` 시 브라우저가 업그레이드 → `connectedCallback` |
| 연결 | 첫 연결이면 렌더. `this.d`가 있으면(이동 직후) 무시 |
| 분리 | microtask 후 `isConnected`가 여전히 false면 destroy (DC-4) |
| 분리 후 같은 태스크에 재연결 (2회 호출 이동) | microtask가 돌 때 이미 연결돼 있으므로 destroy하지 않음. 상태 보존 |
| 연결 전 속성/프로퍼티 변경 | `this.p`만 갱신. 첫 렌더에 반영 |
| 분리 후 속성 변경 | destroy 대기 중엔 `this.r`가 남아 있어 renew가 예약되지만, 먼저 예약된 destroy가 컴포넌트를 retired로 표시해(B-1 경로의 `il`) 그 redraw는 건너뛴다. destroy 후엔 `this.r`가 없어 무시. 재연결 시 최신 `this.p`로 새로 렌더 |
| 같은 이름 재정의 | 기존 생성자 반환 (DC-7) |

### 7.0 이동과 Custom Element 반응 타이밍 (Phase 6에서 확인)

표준상 `connectedCallback`/`disconnectedCallback`은 **DOM API 호출이 끝난 뒤** 실행된다(CE reactions).
그래서 `appendChild`·`insertBefore`·`replaceChildren`처럼 **한 번의 호출로 하는 이동**은 `disconnectedCallback`이
돌 때 요소가 이미 새 위치에 있다 — `isConnected` 검사만으로 처리된다. microtask 대기가 실제로 필요한 경우는
`el.remove()` 후 같은 태스크에서 다시 삽입하는 **두 번의 호출로 나뉜 이동**이다(프레임워크·리스트 재정렬에 흔함).
초기 테스트는 한 번 호출 이동만 다뤄서, "즉시 destroy" 돌연변이를 잡지 못했다 → 2회 호출 이동 테스트 추가.

### 7.1 non-shadow 모드의 기존 자식 (DC-6)

권장안: 첫 렌더 직전에 호스트의 기존 자식을 비운다(서버 폴백 콘텐츠 교체 용도).
**구현 (Phase 4):** non-shadow 모드는 *매 마운트* 직전에 비운다. 분리된 동안 누가 자식을 넣었어도 재마운트가 깨끗하다.
shadow 모드의 light DOM 자식은 건드리지 않는다(slot 투영 대상).
자식을 props로 넘기는 기능은 v2.

## 8. 타입 (RC-5) — Phase 7에서 확정

```ts
type PropSpec = Record<string, StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor>;

// Boolean만 항상 존재(기본 false, §4.1). 나머지는 없을 수 있으므로 선택적.
type PropsOf<S> = { [K in keyof S as S[K] extends BooleanConstructor ? K : never]: boolean }
                & { [K in keyof S as S[K] extends BooleanConstructor ? never : K]?: PropType<S[K]> };
type ElementProps<S> = PropsOf<S> & { host: HTMLElement };   // 내부 컴포넌트가 받는 것
type LithentElementOf<S> = HTMLElement & PropsOf<S>;         // 등록된 요소

declare function defineElement<S extends PropSpec & { host?: never } = Record<never, never>>(
  name: `${string}-${string}`,
  component: (props: ElementProps<S>, children?: never) => unknown,
  options?: { props?: S; shadow?: boolean | 'open' | 'closed'; styles?: string[] }
): (new () => LithentElementOf<S>) | undefined;
```

타입이 잡는 것 (모두 `element-types.test.ts`의 `@ts-expect-error`로 고정, 빌드 타입체크가 강제):

| 상황 | 결과 |
|---|---|
| 컴포넌트가 선언된 prop을 **필수**로 받음 (`{ amount: number }`) | 오류 — 속성이 없을 수 있다 |
| 타입 불일치 (`Number` 선언, 컴포넌트는 `string`) | 오류 |
| 컴포넌트가 선언되지 않은 필수 prop을 요구 | 오류 |
| 컴포넌트가 **선택적** prop만 갖는데 선언 안 함 | 오류 (TS weak type 검사) — 선언 누락을 잡아줌 |
| `host` 선언, `host` 타입 불일치, 하이픈 없는 이름, `Date` 같은 미지원 생성자 | 오류 |
| `mount`(제네릭 없음)·`lmount`·부분 일치 컴포넌트 | 통과 |

- **`NoInfer`를 두지 않는다.** `S`는 key remapping mapped 타입 안에만 있어 TS가 컴포넌트에서 추론하지 않는다.
  Phase 7에서 있을 때·없을 때 결과가 같음을 확인했다(돌연변이에서 테스트가 아무것도 잡지 못해 조사). 내장 `NoInfer`는
  TS 5.4+ 전용이라 소비자 호환에도 불리했다.
- 런타임은 그대로 — 컴포넌트를 `TagFunction`으로 캐스팅해 `h`에 넘긴다. 크기 변화 0 B.

## 9. 결정 체크리스트

2026-10-06 사용자가 "권장안대로 확정"으로 전부 승인했다. 각 항목의 근거는 본문 해당 절에 있다.

- [x] **DC-1. 배포 위치** — 권장: `lithent/element` 서브패스(다른 위성과 동일). 대안: 별도 npm 패키지.
  검증: Phase 0 0-4 (exports 해석). — **확정 2026-10-06 (권장안)**
- [x] **DC-2. props 선언 형식** — 권장: 생성자 기반 `{ amount: Number }` (Vue/Lit 관례, 런타임 최소).
  대안: 문자열 `'number'`, 또는 변환 함수 `(v) => T`. 검증: Phase 2 테스트. — **확정 2026-10-06 (권장안)**
- [x] **DC-3. reflect** — 권장: v1 미지원. — **확정 2026-10-06 (권장안)**
- [x] **DC-4. DOM 이동 처리** — 권장: destroy를 microtask로 지연, 재연결이면 취소(상태 보존).
  대안: 즉시 destroy(단순하나 이동 시 상태 유실). 검증: Phase 6, MT-5. — **확정 2026-10-06 (권장안)**
- [x] **DC-5. 이벤트 API** — 권장: 예약 prop `host` + `emit` 유틸 (§6). — **확정 2026-10-06 (권장안)**
- [x] **DC-6. non-shadow 기존 자식** — 권장: 첫 렌더 전 비움. — **확정 2026-10-06 (권장안)**
- [x] **DC-7. 중복 정의** — 권장: 조용히 기존 생성자 반환. 대안: dev 경고 추가. — **확정 2026-10-06 (권장안)**
- [x] **DC-8. shadow 기본값** — 권장: 기본 `open` shadow, `shadow: false`로 끔. — **확정 2026-10-06 (권장안)**
- [x] **DC-9. jsdom에서의 렌더 루트 캐스팅** — `render(wDom, shadowRoot as unknown as HTMLElement)`.
  코어 타입 변경 없이 캐스팅으로 해결. 검증: Phase 1 1-3, Phase 4 4-1. — **확정 2026-10-06 (권장안)**

## 10. 리스크

| ID | 리스크 | 대응 |
|---|---|---|
| R-1 | 한 페이지에 lithent가 2벌(호스트 앱 + 위젯 UMD) 로드될 때 `Symbol.for('lithentWDomSymbol')`(`src/utils/universalRef.ts:3`)이 **전역 공유**된다. 한쪽 WDom을 다른 쪽이 자기 것으로 오인할 수 있다 | **해소 (2026-10-06, Phase 0).** `e2e/element.spec.ts`: base 2벌, base 호스트 + concurrent 위젯 모두 통과. 위젯을 호스트가 관리하는 DOM 안에 마운트하고 양쪽을 번갈아 갱신해도 서로의 DOM·keyed 노드 동일성이 유지됐다. 심볼 공유는 *WDom 객체를 번들 사이로 넘길 때만* 문제가 되며, element는 그런 경로가 없다 (경계는 DOM 속성·이벤트뿐). 이 가정은 Phase 9 E2E에서 실제 Custom Element로 다시 확인한다 |
| R-2 | §5의 `<style>` 보존이 코어 내부 삭제 경로에 의존 | 회귀 테스트 4-4. 코어가 바뀌면 렌더 루트를 내부 컨테이너로 전환 |
| R-3 | 사용자가 `props.host`를 다른 의미로 이미 쓰는 컴포넌트를 넘김 | 정의 시 `props` 선언 충돌만 검사 가능. 문서에 명시 |
| R-5 | prop 이름이 네이티브 프로퍼티와 겹침 (§4.2.1) | 검사하지 않음. 특성화 테스트 + Phase 10 문서 안내 |
| R-4 | concurrent 코어의 deferred 렌더 중 분리 | **해소 (Phase 8)**: 실행 전·시작 후 제거 모두 다시 그려지지 않고 unmount 1회, 이동 시 새 위치에서 커밋. `element-hardening.test.ts` |

### 10.1 발견된 코어 버그

| ID | 내용 | 처리 |
|---|---|---|
| B-1 | `render()`가 돌려준 destroy가 **루트 컴포넌트가 한 번이라도 재렌더된 경우에만** unmount 큐를 실행했다 (`src/render.ts:48`, `lithentConcurrent/src/render.ts:122`의 `if (comp !== wDom)`). 갓 렌더한 컴포넌트 루트, 요소 루트 아래 컴포넌트는 `mountCallback` cleanup이 실행되지 않음. 순수 lithent로 base·concurrent 모두 재현. element의 FR-2를 직접 막음 | **수정 (2026-10-06, 사용자 승인 "코어 수정")**. 조건을 지워 항상 실행. `98db595`. 회귀 테스트 `src/tests/core-destroyUnmount.test.tsx`, `lithentConcurrent/src/tests/concurrent-destroyUnmount.test.tsx` (각 5건, 옛 코드에서 3건 실패). 크기 base 4,739→4,738, concurrent 6,233→6,228 B. `test:dual`·`verify:concurrent`·`verify:release`·E2E 24/24 통과. CHANGELOG Unreleased에 기록 |
