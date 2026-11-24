# REQUIREMENTS — JSX 타입: 컴포넌트 children과 key (jsx-types)

- 브랜치: `fix/jsx-intrinsic-attributes` / 기준 커밋 `5b3550d`
- 작성일: 2026-11-13
- 상태: **구현·자동 검증 완료, 릴리스 준비** — [IMPLEMENT.md](./IMPLEMENT.md) 참고
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 배경: [../create-lithent-templates/DESIGN.md](../create-lithent-templates/DESIGN.md) §3.7, §7 (후속 과제)
- 코드 범위: `src/index.ts`, `src/types/index.ts`, `src/wDom.ts`, `lithentConcurrent/src/index.ts`, `lithentConcurrent/src/wDom.ts`, `scripts/verify-release.mjs`

## 1. 배경

create-lithent 템플릿을 새로 설치해 보니(TypeScript 5.9.3) children을 받는 컴포넌트에서 타입 오류가 났다.
lithent의 전역 `JSX`에는 `IntrinsicElements`만 있다.

| 패턴 | TS 5.7 | TS 5.8+ |
|---|---|---|
| children을 받는 컴포넌트 `<Card title="t"><p /></Card>` | 통과 | **TS2322** |
| 리스트 안 컴포넌트에 `key` `<Row key={id} … />` | **TS2322** | **TS2322** |

lithent는 children을 마운터의 세 번째 인자로, `key`를 리스트 diff에서 읽는다. 둘 다 props 타입에 넣을 이유가 없다.

## 2. 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| RQ-1 | 타입을 지정한 컴포넌트에 JSX children을 넘겨도 TS 5.7~5.9에서 오류가 없다 | 패턴 비교, verify-release 픽스처 |
| RQ-2 | 리스트 안 컴포넌트에 `key`를 줄 수 있다 | 같음 |
| RQ-3 | 기존에 통과하던 패턴은 그대로 통과한다(props 타입 없는 `mount`/`lmount`에 props 전달, `ReturnType<typeof mount>`) | 패턴 비교, 저장소 전체 빌드 |
| RQ-4 | 기존에 막던 오류는 그대로 막는다(잘못된 타입, 누락, 초과 props) | 패턴 비교, `@ts-expect-error` 픽스처 |
| RQ-5 | 두 코어(`lithent`, `lithent-concurrent`)가 같은 JSX 선언을 갖는다 | `concurrent-exportSurface` 테스트 전제, diff |
| RQ-6 | 런타임 코드와 번들 크기는 바뀌지 않는다 | `pnpm size` |

## 3. 비목표

- 컴포넌트 안에서 props 타입이 없는 경우의 `props` 타입(`unknown`) 변경
- `h()` 직접 호출의 타입 개선(타입 있는 컴포넌트를 `h(Comp, props)`로 부르면 이전부터 오류)
