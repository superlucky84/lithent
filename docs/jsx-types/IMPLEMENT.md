# IMPLEMENT — JSX 타입: 컴포넌트 children과 key (jsx-types)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

| Phase | 내용 | 상태 |
|---|---|---|
| 1 | 타입 변경 | done |
| 2 | Test Hardening (패턴 비교, 픽스처) | done |
| 3 | Integration Test (전체 빌드·테스트·릴리스 검증) | done |
| 4 | 릴리스 준비 | done |

## Phase 1 — 타입 변경: done

Refs: RQ-1, RQ-2, RQ-3, RQ-5, DC-1, DC-2

- [x] 두 코어 `index.ts`에 `JSX.IntrinsicAttributes { key?, children? }`
- [x] `MountProps<T>` 추가, `mount`/`lmount` 반환 함수의 props 매개변수에 적용(두 코어)
- 기본 테스트: `pnpm build`(모든 패키지의 선언 생성과 테스트 파일 타입 검사)
- 종료 조건: 빌드 성공
- 결과 (2026-11-13): 성공. 과정에서 두 번 실패했다(DESIGN DC-2).
  - `IntrinsicAttributes`만 넣었을 때: `core-nestedUnmount.tsx:68`에서 props 없는 컴포넌트에 props를 넘기는 곳이 깨졌다.
  - `T = Props` 기본값을 썼을 때: `renderToString.test.tsx`의 `ReturnType<typeof mount>`가 깨졌다.

Files:
- `src/index.ts` (modified)
- `src/types/index.ts` (modified)
- `src/wDom.ts` (modified)
- `lithentConcurrent/src/index.ts` (modified)
- `lithentConcurrent/src/wDom.ts` (modified)

## Phase 2 — Test Hardening: done

Refs: RQ-1, RQ-2, RQ-3, RQ-4

- [x] 패턴 비교(스크래치): 게시된 1.25.9 vs 새 패키지(`pnpm pack`), TS 5.7.3·5.9.3
- [x] `scripts/verify-release.mjs` 설치 소비자 픽스처에 children·리스트 key·`@ts-expect-error` 추가
- 결과 (2026-11-13), 오류 난 줄:

| 패턴 | 1.25.9 TS5.7 | 1.25.9 TS5.9 | 새 TS5.7 | 새 TS5.9 |
|---|---|---|---|---|
| props 없는 `mount`/`lmount`에 props | 통과 | 통과 | 통과 | 통과 |
| 잘못된 타입·누락·초과 props | 오류 | 오류 | 오류 | 오류 |
| 타입 있는 컴포넌트에 children | 통과 | 오류 | 통과 | 통과 |
| 리스트 안 컴포넌트 `key` | 오류 | 오류 | 통과 | 통과 |
| `ReturnType<typeof mount>`에 props 없는 컴포넌트 | 통과 | 통과 | 통과 | 통과 |
| props 없는 컴포넌트 안에서 `props.x` | 오류 | 오류 | 오류 | 오류 (비목표) |
| `h(Typed, { label })` 직접 호출 | 오류 | 오류 | 오류 | 오류 (비목표) |

- 템플릿 재현: 생성된 SPA에서 `Link` 우회 코드를 빼고 리스트 key를 넣은 상태로 새 패키지를 쓰면 TS 5.7.3·5.8.3·5.9.3 모두 오류 0건.

Files:
- `scripts/verify-release.mjs` (modified)

## Phase 3 — Integration Test: done

Refs: RQ-3, RQ-5, RQ-6

- [x] `pnpm build`, `pnpm test:dual`, `pnpm test:toolchain`, `pnpm test:ci`, `pnpm verify:release`, `pnpm size`
- 결과 (2026-11-13): 모두 통과. 크기 변화 없음(base 4,763B, concurrent 6,667B, element 968B).
  `verify:release`의 strict JSX 소비자(Bundler, Node16, NodeNext) 통과.
  로컬에서는 macOS 임시 폴더 문제 때문에 `TMPDIR`을 실제 경로로 지정해 실행했다.

Files: none

## Phase 4 — 릴리스 준비: done

Refs: DC-3

- [x] `lithent` 1.25.9 → 1.25.10, `lithent-concurrent` 0.2.6 → 0.2.7
- [x] CHANGELOG, RELEASING
- 결과: 다음 Handoff 참고

Files:
- `package.json` (modified)
- `lithentConcurrent/package.json` (modified)
- `CHANGELOG.md` (modified)
- `RELEASING.md` (modified)

## Handoff

- 완료: Phase 1~4
- 다음: PR 병합 → main에서 Validate 수동 실행으로 발행 → 템플릿의 `Link` 우회 코드 제거와 `lithent` 의존 범위 상향(create-lithent-templates 후속)
- 블로커: 없음
