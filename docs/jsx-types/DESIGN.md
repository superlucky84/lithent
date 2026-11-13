# DESIGN — JSX 타입: 컴포넌트 children과 key (jsx-types)

- 작성일: 2026-11-13
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

## 1. 변경

두 코어의 `declare global { namespace JSX }`에 다음을 넣는다.

```ts
interface IntrinsicAttributes {
  key?: unknown;
  children?: unknown;
}
```

`mount`/`lmount`가 돌려주는 함수의 props 매개변수를 `T`에서 `MountProps<T>`로 바꾼다(`src/types/index.ts`).

```ts
export type MountProps<T> = unknown extends T ? Props : T;
```

## 2. 결정

- [x] DC-1 `IntrinsicAttributes` vs `ElementChildrenAttribute` — `IntrinsicAttributes`.
  - `ElementChildrenAttribute { children: {} }`는 children을 props 타입과 대조하게 만들어 TS 5.7에서도 오류 7건이 됐다(실험).
  - `IntrinsicAttributes`는 모든 요소·컴포넌트에 더해지는 속성이라, lithent처럼 children과 key가 props 밖에 있는 모델에 맞다.
- [x] DC-2 props 타입 없는 컴포넌트 호환 — `MountProps<T>`.
  - `IntrinsicAttributes`에 선택 속성만 생기면, props가 `unknown`인 컴포넌트에 props를 넘길 때 TypeScript가 초과 속성 오류를 낸다(저장소 테스트 `core-nestedUnmount.tsx:68`에서 발견).
  - 첫 시도 `mount<T = Props>`는 `ReturnType<typeof mount>`(`(_props: unknown) => …`)에 props 없는 컴포넌트를 넘기는 코드를 깨뜨렸다(`ssr/src/tests/renderToString.test.tsx`).
  - `MountProps<T>`는 `T`가 `unknown`일 때만 `Props`로 바꾼다.
    - `ReturnType<typeof mount>`도 같은 `Props`가 된다.
    - 타입을 지정한 컴포넌트의 시그니처는 그대로다.
  - 컴포넌트 안의 `props` 타입(`Component<T>`)은 바꾸지 않는다.
- [x] DC-3 두 코어 함께 릴리스 — `lithent` 1.25.10, `lithent-concurrent` 0.2.7(패치, 타입만 넓어짐).

## 3. 검증 방법

- 패턴 비교: 게시된 1.25.9 타입과 새 타입을 TS 5.7.3·5.9.3으로 같은 파일에 대해 검사하고, 오류가 난 줄을 비교한다.
- `scripts/verify-release.mjs`의 설치 소비자 `types.tsx`에 children·리스트 key·`@ts-expect-error`(잘못된 props 타입) 사례를 추가한다. CI는 lockfile의 TS 5.7.2로 검사한다.
- 템플릿 재현: 생성된 SPA에서 `Link`의 우회 코드를 빼고 TS 5.7·5.8·5.9로 검사한다.
