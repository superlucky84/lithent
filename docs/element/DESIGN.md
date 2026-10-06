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
    upgradeProps(this);                       // FR-4: 정의 전 할당 흡수
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
| `Number` | `Number(v)` (`NaN`이면 `undefined`) | `undefined` |
| `Boolean` | 속성 존재 = `true` (`"false"` 문자열도 `true`, HTML 관례) | `false` |
| `Object` | `JSON.parse(v)`, 실패 시 `undefined` + dev 경고 | `undefined` |

- 이름 변환: `max-count` 속성 ↔ `maxCount` prop. `observedAttributes`는 kebab-case 목록.
- 프로퍼티 할당은 **변환 없이** 그대로 props에 들어간다 (객체·함수 전달 경로).

### 4.2 업그레이드 전 할당 (FR-4)

호스트 페이지가 스크립트 로드 전에 `el.items = [...]`를 할당하면 인스턴스 own property로 남아
접근자를 가린다. `connectedCallback` 첫 진입에서 선언된 키마다
`hasOwnProperty`면 값을 꺼내 `delete` 후 접근자로 다시 할당한다 (Web Components 표준 관용구).

### 4.3 반영(reflect) (DC-3)

v1은 프로퍼티 → 속성 반영을 하지 않는다 (권장). 필요하면 v2에서 prop별 `reflect` 옵션.

## 5. 스타일 (FR-6)

```ts
defineElement('pay-button', PayButton, { styles: [css] });
```

- 정의 시점에 `CSSStyleSheet`를 **1회** 생성해 모든 인스턴스가 공유한다(`adoptedStyleSheets`).
- `adoptedStyleSheets` 미지원(jsdom, 구형 Safari)이면 렌더 루트 맨 앞에 `<style>`을 삽입한다.
- **주의 — 폴백 `<style>`과 lithent의 일괄 삭제 경로.** `findChildWithRemoveElement`
  (`src/render.ts:96-115`)는 "부모의 자식 수 == 루트 자식 수"일 때 `textContent = ''`로 일괄 삭제한다.
  `<style>`이 있으면 개수가 달라 이 경로를 타지 않으므로 `<style>`은 보존된다.
  단, **이 판단은 코어 내부 동작에 의존**하므로 Phase 4에 회귀 테스트(4-4)로 고정한다.
- non-shadow 모드에서 `styles`는 무시하고 dev 경고 (전역 오염 방지).

## 6. 이벤트 발행 (DC-5)

권장안: 내부 컴포넌트 props에 **예약 키 `host`**(호스트 요소)를 넣고, 유틸 `emit`을 제공한다.

```ts
import { emit } from 'lithent/element';
const PayButton = mount<{ amount: number; host: HTMLElement }>((_r, props) =>
  () => <button onClick={() => emit(props.host, 'pay', { amount: props.amount })}>Pay</button>);
// emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))
```

- `composed: true`로 shadow 경계를 넘어 호스트 페이지까지 전달된다.
- `props.host` 이름은 예약어. `options.props`에 `host`를 선언하면 정의 시 예외.
- 기각한 대안: `useHost()` 훅 — 모듈 전역 "현재 호스트" 참조가 필요한데,
  diff 모드에서 하위 컴포넌트가 나중에 resolve되는 경로(`src/wDom.ts:250-300`)에서 참조가 어긋날 수 있다.
  v2에서 context(`lithent/helper`)로 재검토.

## 7. 생명주기

| 사건 | 동작 |
|---|---|
| 정의 전 요소가 이미 문서에 있음 | `customElements.define` 시 브라우저가 업그레이드 → `connectedCallback` |
| 연결 | 첫 연결이면 렌더. `this.d`가 있으면(이동 직후) 무시 |
| 분리 | microtask 후 `isConnected`가 여전히 false면 destroy (DC-4) |
| 연결 전 속성/프로퍼티 변경 | `this.p`만 갱신. 첫 렌더에 반영 |
| 분리 후 속성 변경 | `this.r`가 없으므로 무시. 재연결 시 최신 `this.p`로 새로 렌더 |
| 같은 이름 재정의 | 기존 생성자 반환 (DC-7) |

### 7.1 non-shadow 모드의 기존 자식 (DC-6)

권장안: 첫 렌더 직전에 호스트의 기존 자식을 비운다(서버 폴백 콘텐츠 교체 용도).
자식을 props로 넘기는 기능은 v2.

## 8. 타입 (RC-5)

```ts
type Spec = Record<string, StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor>;
type PropsOf<S extends Spec> = { [K in keyof S]?: S[K] extends NumberConstructor ? number
  : S[K] extends BooleanConstructor ? boolean : S[K] extends StringConstructor ? string : unknown };

declare function defineElement<S extends Spec>(
  name: `${string}-${string}`,           // 하이픈 없는 이름을 컴파일 타임에 거부
  component: ElementComponent,           // mount/lmount 결과 (§2.4)
  options?: { props?: S; shadow?: boolean | 'open' | 'closed'; styles?: string[] }
): CustomElementConstructor | undefined;
```

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
| R-4 | concurrent 코어의 deferred 렌더 중 분리 | Phase 8 하드닝 테스트에 포함 |

### 10.1 발견된 코어 버그

| ID | 내용 | 처리 |
|---|---|---|
| B-1 | `render()`가 돌려준 destroy가 **루트 컴포넌트가 한 번이라도 재렌더된 경우에만** unmount 큐를 실행했다 (`src/render.ts:48`, `lithentConcurrent/src/render.ts:122`의 `if (comp !== wDom)`). 갓 렌더한 컴포넌트 루트, 요소 루트 아래 컴포넌트는 `mountCallback` cleanup이 실행되지 않음. 순수 lithent로 base·concurrent 모두 재현. element의 FR-2를 직접 막음 | **수정 (2026-10-06, 사용자 승인 "코어 수정")**. 조건을 지워 항상 실행. `98db595`. 회귀 테스트 `src/tests/core-destroyUnmount.test.tsx`, `lithentConcurrent/src/tests/concurrent-destroyUnmount.test.tsx` (각 5건, 옛 코드에서 3건 실패). 크기 base 4,739→4,738, concurrent 6,233→6,228 B. `test:dual`·`verify:concurrent`·`verify:release`·E2E 24/24 통과. CHANGELOG Unreleased에 기록 |
