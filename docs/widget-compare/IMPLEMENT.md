# IMPLEMENT — 같은 위젯, 네 프레임워크 (widget-compare)

- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [DESIGN.md](./DESIGN.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 문서 작성 | done |
| 1 | 네 구현과 빌드 | done |
| 2 | 동작 동일성 E2E | done |
| 3 | 측정과 공개 페이지 | todo |
| 4 | CI·배포 연결, 문서 사이트 링크 | todo |

## Phase 0 — 문서 작성: done

Refs: RQ-1~RQ-8, DC-1~DC-10

Files:
- `docs/widget-compare/REQUIREMENTS.md` (added)
- `docs/widget-compare/DESIGN.md` (added)
- `docs/widget-compare/IMPLEMENT.md` (added)
- `docs/widget-compare/MANUAL_TEST_CHECKLIST.md` (added)

## Phase 1 — 네 구현과 빌드: done

Refs: RQ-2, RQ-3, RQ-4, DC-1, DC-2, DC-3

- [x] 패키지 `showcase/widget-compare` (`lithent-widget-compare`, private). React 19.3.1, Preact 11.2.0,
  Lit 3.3.3, `@types/react`·`@types/react-dom` 19.3.0 고정. `pnpm-workspace.yaml`에 추가 →
  `pnpm build`의 병렬 단계에서 type-check·lint·빌드
- [x] 공용 래퍼 `src/shared/define-element.ts`, 공용 문구 `src/shared/labels.ts`,
  템플릿에서 가져오는 것(props 선언, 이벤트 타입, CSS)은 `src/shared/template.ts` 한 곳
- [x] React·Preact(함수 컴포넌트 + `useState`, `page-id`가 바뀌면 `key`로 초기화)·Lit(`LitElement`) 구현
- [x] `scripts/build.mjs`: 네 빌드, 호스트 페이지, `sizes.json`
- [x] type-check(3개 프로젝트), lint, prettier 통과
- 결과 (2026-11-20, Vite 8.3.6):

  | 버전 | minify | gzip | brotli | lithent 대비 |
  |---|---|---|---|---|
  | lithent 1.25.12 | 15.83 KB | 6.63 KB | **6.07 KB** | 1.00× |
  | React 19.3.1 | 218.57 KB | 68.02 KB | **58.56 KB** | 9.64× |
  | Preact 11.2.0 | 17.47 KB | 7.46 KB | **6.73 KB** | 1.11× |
  | Lit 3.3.3 | 19.72 KB | 7.47 KB | **6.67 KB** | 1.10× |

  - lithent 빌드는 템플릿 자체 빌드(`createLithent/widget/dist/…js`)와 sourcemap 주석 한 줄만 다르다.
  - React 번들에 `development` 문자열 0개(production 빌드).
  - 해석: React 대비로는 IDEAS의 주장대로 약 10분의 1이다. Preact·Lit 대비로는 약 10% 작을 뿐이다.

Files:
- `showcase/widget-compare/**` (added)
- `pnpm-workspace.yaml`, `pnpm-lock.yaml` (modified)

## Phase 2 — 동작 동일성 E2E: done

Refs: RQ-1, RQ-8, DC-4, DC-5

- [x] `e2e/widget-compare.spec.ts`: 네 빌드에 같은 시나리오(템플릿 스펙 + 기본 문구, `part`, 다른 페이지의
  rate, JSON 속성), 엄격한 CSP, `sizes.json`에 정확히 네 버전, 전역 변수 기대값
- [x] concurrent 프로젝트에서 제외(`playwright.config.ts`), `scripts/ci-build-artifacts.mjs`에 `showcase/widget-compare/dist`
- [x] 음성 대조: Preact의 `key` 초기화를 빼면 `page-id` 변경 단계에서, Lit 이벤트의 `cancelable`을 빼면
  취소 단계에서 실패. 되돌린 뒤 크기가 같은 것을 확인
- 결과 (2026-11-20, Chromium 로컬): 새 스펙 9개 + 템플릿 스펙 2개 통과.
  전역 변수: lithent·React·Preact 없음, Lit `litPropertyMetadata`, `reactiveElementVersions`,
  `litHtmlVersions`, `litElementVersions`.
- `scripts/tests/*.test.mjs` 49개 통과 (ci-build-artifacts 목록 변경)

Files:
- `e2e/widget-compare.spec.ts` (added)
- `playwright.config.ts` (modified)
- `scripts/ci-build-artifacts.mjs` (modified)

## Phase 3 — 측정과 공개 페이지: todo

Refs: RQ-5, RQ-6, RQ-7, DC-6, DC-7, DC-8, DC-10

- [ ] `scripts/measure.mjs` → `results.json`
- [ ] `scripts/page.mjs` → `dist/index.html`
- [ ] 측정 실행, 결과 커밋

## Phase 4 — CI·배포 연결, 문서 사이트 링크: todo

Refs: RQ-7, DC-9

- [ ] `docs.yml`: 복사, 경로 트리거
- [ ] Custom Elements 가이드(영어·한국어)에 링크와 요약
- [ ] [../widget-template/README.md](../widget-template/README.md) §6-5, IDEAS §2.1 갱신
