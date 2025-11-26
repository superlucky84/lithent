
# 📘 **Lithent**

[![npm version](https://img.shields.io/npm/v/lithent.svg)](https://www.npmjs.com/package/lithent)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)


# **Lithent**

**Lithent는 미니멀리즘 철학을 기반으로, 작고 예측 가능한 UI 구성 요소를 만들기 위한 JavaScript 라이브러리입니다.**
불필요한 마법이나 번잡한 API를 걷어내고, 단순하고 예측 가능한 방식으로 동작하는 lightweight UI 엔진을 목표로 합니다.
ㅓ
Lithent의 핵심 의도는 과한 구조 없이 필요한 만큼만 동작하는 UI 엔진을 제공하는 것입니다.
가벼운 DOM 조작이 필요한, 용량에 민감한 라이브러리에서도 부담 없이 사용할 수 있으며, 상황에 따라 선언형 패턴을 선택적으로 적용할 수도 있습니다.

이런 목적을 위해 Lithent는 다음의 두 가지 방식을 제공합니다.
두 방식은 충돌 없이 함께 사용할 수 있으며, 프로젝트 성격에 따라 자연스럽게 혼합해 적용할 수 있습니다.

## **수동 제어 기반 (Manual Mode)**

명시적 갱신을 기반으로 동작하는 방식입니다.
상태는 클로저에 자연스럽게 저장되며, 사용자가 api를 통해 컴포넌트의 갱신 시점을 직접 제어할 수 있습니다.

## **선언형 기반 (Light API Mode)**

상태 변화가 자동으로 UI에 반영되는 단순한 선언형 패턴입니다.
코어와 낮게 결합된 helper를 통해 제공되며, 필요할 때만 가볍게 가져다 쓸 수 있습니다.
상태, 컨텍스트 등 추가 기능을 원할 때 선택적으로 활용할 수 있습니다.

---

## Installation

* 간단 사용법 설명
* 설치
* create lithent app 사용하기


---

## Documentation

* 수동 제어 기반 설명

* 선언형 기반 설명

* 기본 훅 설명
    * useRenew
    * mountCallback
    * updateCallback
    * mountReadyCallback

* 헬퍼 기반 훅 설명
    * state
    * store
    * computed
    * effect
    * context

* 템플릿 (jsx)
    * jsx
    * ftags
    * tags
    * lithent template

---

## Example

가장 기본적인 카운터 예제입니다.

### **lmount + lstate (자동 갱신)**

```jsx
import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);

  const inc = () => {
    count.value += 1;
  };

  return () => (
    <div>
      <p>{count.value}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});
```

### **mount (수동 갱신)**

```jsx
import { mount } from 'lithent';

const App = mount((renew) => {
  let count = 0;

  const inc = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>{count}</p>
      <button onClick={inc}>+</button>
    </div>
  );
});
```

---

## Contributing

Lithent는 오픈 소스 프로젝트로, 누구나 개선에 참여할 수 있습니다.

* 이슈 제기
* 버그 리포트
* 문서 수정
* 코드 기여(PR)

자세한 내용은 `CONTRIBUTING.md`를 참고하세요(준비 중).

---

## License

[MIT](LICENSE)

---

# 🧩 특징

README는 심플해야 하니 위에는 넣지 않았지만, React README처럼 아래 footer 정도로 “특징"을 간단히 정리할 수도 있음:

```
Lithent는 클로저 기반의 컴포넌트 모델을 기반으로 하며, mount(수동)와 l-시리즈(자동) 두 가지 갱신 방식을 제공합니다.
```

---

# ✔ 이 README의 특징

* 광고 문구 없음
* 짧고 담백함
* React/Svelte 스타일 그대로
* 필요한 핵심 요소만 포함
* 나중에 영어로 번역하기 쉬움
* GitHub README로 바로 붙여도 깔끔한 레이아웃

---

원하면 여기에:

* 배지(badge) 몇 개 더 추가
* 로고/배너 추가
* 문서 페이지 링크를 미리 만들어둠
* examples/ 폴더 구조 추천

같은 것도 정리해줄게!

