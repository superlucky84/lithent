<img src="./lithentDocs/public/lithent.png" alt="Lithent" height="60" align="left" style="margin-right: 10px;" />

# Lithent &nbsp; [![npm version](https://img.shields.io/npm/v/lithent.svg)](https://www.npmjs.com/package/lithent) [![Bundle Size](https://img.shields.io/bundlephobia/minzip/lithent)](https://bundlephobia.com/package/lithent) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

<br clear="left"/>



**Lithent는 친숙한 클로저 패턴을 사용하여 예측 가능하고 가벼운 UI를 만드는 JavaScript 라이브러리입니다.**

불필요한 마법이나 복잡한 API를 걷어내고, 단순하고 예측 가능한 방식으로 동작하는 것을 목표로 합니다.

<br />

## 왜 Lithent를 만들었나요? &nbsp; [→ 자세히 보기](https://superlucky84.github.io/lithent/guide/introduction)

**가벼운 DOM 조작이 필요한, 용량에 민감한 환경**에서도 부담 없이 사용할 수 있는 라이브러리가 필요했습니다. 기존의 많은 프레임워크들은 강력하지만, 작은 프로젝트나 라이브러리에 포함시키기엔 무겁습니다.

Lithent는 이런 배경에서 탄생했습니다. **Core만으로도 완전히 동작하는 UI를 만들 수 있습니다**. 상태 관리, 반응성 시스템 같은 추가 기능이 필요하다면, 언제든지 **Helper를 확장팩처럼 선택적으로 추가**할 수 있습니다.

필요한 것만 가져다 쓰는 방식으로, 프로젝트 규모와 요구사항에 맞춰 유연하게 확장할 수 있습니다.

### 설계 철학

- **Small Bundle** — 4KB core with optional extensions
- **Closure-based State** — No magic, just JavaScript
- **Manual or Reactive** — Choose your update strategy
- **Progressive Enhancement** — From static HTML to full SPA

<br />

## 빠른 시작 &nbsp; [→ 자세히 보기](https://superlucky84.github.io/lithent/guide/quick-start)

### 새 프로젝트 생성

```bash
npx create-lithent@latest
```

프로젝트 이름과 템플릿(SSR/SPA)을 선택하고 시작하세요.

### NPM으로 설치

```bash
npm install lithent
```

### CDN으로 바로 사용

```html
<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js"></script>
```

빌드 단계 없이 HTML에서 바로 사용할 수 있습니다.

<br />

## 두 가지 방식 &nbsp; [→ 자세히 보기](https://superlucky84.github.io/lithent/guide/mounter)

Lithent는 두 가지 스타일을 제공하며, 한 프로젝트에서 자유롭게 혼용할 수 있습니다.

### 수동 제어 (Manual Mode)

명시적으로 `renew()`를 호출해 갱신 시점을 제어합니다.
상태는 클로저에 담기며, 예측 가능한 흐름을 제공합니다.

```tsx
import { mount } from 'lithent';

const Counter = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew(); // 명시적 갱신
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
});
```

### 선언형 (Light API Mode)

상태 변화가 자동으로 UI에 반영됩니다.
Helper 패키지를 통해 `lstate`, `computed`, `effect` 등을 선택적으로 사용할 수 있습니다.

```tsx
import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);

  const increment = () => {
    count.value += 1; // 자동 갱신
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
});
```

<br />

## 주요 기능

### Core 기능
- **[mount / lmount](https://superlucky84.github.io/lithent/guide/mounter)** — 컴포넌트 생성 및 초기화
- **[Portal](https://superlucky84.github.io/lithent/guide/portal)** — 다른 DOM 위치에 렌더링
- **[Hooks](https://superlucky84.github.io/lithent/guide/mount-hooks)** — mountCallback, updateCallback, mountReadyCallback
- **[Ref](https://superlucky84.github.io/lithent/guide/state-ref)** — DOM 요소 직접 참조

### Helper 기능 (선택 사항)
- **[state / lstate](https://superlucky84.github.io/lithent/guide/state)** — 반응형 상태 관리
- **[computed](https://superlucky84.github.io/lithent/guide/computed)** — 파생 상태 자동 계산
- **[effect](https://superlucky84.github.io/lithent/guide/effect)** — 사이드 이펙트 실행
- **[store / lstore](https://superlucky84.github.io/lithent/guide/store)** — 전역 상태 관리
- **[context / lcontext](https://superlucky84.github.io/lithent/guide/context)** — 컴포넌트 간 데이터 공유

### 템플릿 지원
- **[JSX](https://superlucky84.github.io/lithent/guide/vite-plugin)** — Vite 플러그인으로 간편하게
- **[FTags](https://superlucky84.github.io/lithent/guide/ftags)** — 함수형 태그 API (빌드 불필요)
- **[HTM](https://superlucky84.github.io/lithent/guide/htm-tags)** — Tagged template literals
- **[Template Strings](https://superlucky84.github.io/lithent/guide/template-strings)** — 커스텀 템플릿

<br />

## 문서

완전한 가이드와 API 문서는 공식 문서에서 확인하세요:

**[https://superlucky84.github.io/lithent](https://superlucky84.github.io/lithent)**

### 빠른 링크
- [소개](https://superlucky84.github.io/lithent/guide/introduction)
- [빠르게 시작하기](https://superlucky84.github.io/lithent/guide/quick-start)
- [예제 모음](https://superlucky84.github.io/lithent/examples/1)
- [API 참조](https://superlucky84.github.io/lithent/guide/mounter)

<br />

## 생태계

| 패키지 | 설명 |
|--------|------|
| [lithent](https://www.npmjs.com/package/lithent) | Core 라이브러리 (~4KB) |
| [lithent/helper](https://www.npmjs.com/package/lithent) | 반응형 상태 관리 헬퍼 |
| [lithent/ssr](https://www.npmjs.com/package/lithent) | 서버 사이드 렌더링 |
| [lithent/ftags](https://www.npmjs.com/package/lithent) | 함수형 태그 API |
| [lithent/tag](https://www.npmjs.com/package/lithent) | HTM 템플릿 지원 |
| [create-lithent](https://www.npmjs.com/package/create-lithent) | 프로젝트 생성 도구 |

<br />

## 라이선스

[MIT](LICENSE) © [superlucky84](https://github.com/superlucky84)

<br />

<div align="center">
  <sub>Built with ❤️ by the Lithent community</sub>
</div>
