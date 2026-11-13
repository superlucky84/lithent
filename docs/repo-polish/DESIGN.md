# DESIGN — 홍보 전 저장소 정비 (repo-polish)

- 작성일: 2026-11-13
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 표기: **확정** = 사용자가 정한 것, **제안** = 반영 전 사용자 확인이 필요한 초안

## 1. 크기 수치 기준 (RQ-1)

같은 방법으로 실측한 값만 쓴다. 측정일 2026-11-13, Node `zlib` 기본 brotli, gzip level 9, minified 파일 기준.

| 대상 | 파일 | gzip | brotli |
|---|---|---|---|
| lithent 코어 | `dist/lithent.umd.js` | 5,134 B | **4,763 B** |
| lithent 코어 + helper | `+ helper/dist/lithentHelper.umd.js` | 9,282 B | 8,461 B |
| lithent/element | `element/dist/lithentElement.umd.js` | 1,119 B | 968 B |
| Preact 11.2.0 코어 | `dist/preact.mjs` | 4,972 B | 4,541 B |
| Preact 11.2.0 + hooks | `+ hooks/dist/hooks.mjs` | 6,555 B | 5,978 B |
| React 19.3.1 + react-dom/client | `cjs/*.production.js` | 115,104 B | 93,725 B |

**결론과 표기 규칙**

- 공개 문구는 **"~4.8KB (brotli)"** 로 통일한다. "4KB"는 쓰지 않는다.
- lithent는 **Preact와 같은 체급**이지 Preact보다 작지 않다. "가장 작다", "Preact보다 작다"는 쓰지 않는다.
- 차별점은 크기가 아니라 **모델**(클로저 상태, hooks 규칙 없음, 수동/반응형 선택, 빌드 없는 템플릿, Custom Element 래퍼)에서 찾는다.

## 2. npm 메타데이터 (RQ-2) — 확정

`package.json`(루트 `lithent` 패키지):

```json
"description": "Lightweight virtual DOM library with closure-based components. ~4.8KB core, JSX or no-build templates, SSR and Custom Elements.",
"keywords": ["lithent", "virtual-dom", "vdom", "jsx", "htm", "ui", "ui-library", "frontend", "components", "reactive", "closure", "lightweight", "no-build", "ssr", "web-components", "custom-elements", "typescript"],
"homepage": "https://superlucky84.github.io/lithent/",
"bugs": { "url": "https://github.com/superlucky84/lithent/issues" }
```

- 다음 `lithent` 릴리스에 함께 나간다. 별도 릴리스는 하지 않는다.

## 3. GitHub 설명·토픽·설정 (RQ-3, RQ-9) — 확정, 2026-11-13 반영

**설명** (현재 → 제안)

- 현재: `➿ Lightweight virtual DOM library for predictable UIs. 4KB core with closure-based state.`
- 제안: `➿ Lightweight virtual DOM library with closure-based components. ~4.8KB core, JSX or no-build templates, SSR and Custom Elements.`

**토픽** (20개)

- 제거: `generators`, `lithentjs`
- 유지: `lithent`, `virtual-dom`, `vdom`, `jsx`, `htm`, `javascript`, `components`, `framework`, `dom`
- 추가: `typescript`, `ui-library`, `frontend`, `reactive`, `closures`, `lightweight`, `no-build`, `ssr`, `web-components`, `custom-elements`, `concurrent-rendering`

**설정**

- Wiki 끄기 (`gh repo edit --enable-wiki=false`)
- Discussions는 유지

**반영 명령** (확인 후 실행)

```bash
gh repo edit superlucky84/lithent --description "<제안 설명>" --enable-wiki=false \
  --remove-topic generators,lithentjs \
  --add-topic typescript,ui-library,frontend,reactive,closures,lightweight,no-build,ssr,web-components,custom-elements,concurrent-rendering
```

## 4. 소셜 미리보기 이미지 (RQ-4) — 확정

- 크기 1280×640 PNG, 1MB 미만(GitHub 권장). 위치: `lithentDocs/public/social-preview.png`
  - 문서 사이트가 `https://superlucky84.github.io/lithent/social-preview.png`로 같이 서비스하므로 원본을 한 곳에 둔다.
- 구성: 왼쪽에 로고(`lithentDocs/public/lithent.png`)와 "Lithent", 한 줄 소개, `~4.8KB · closures · JSX / no-build`. 오른쪽에 README의 Manual Mode 카운터 코드.
- 제작: 원본 HTML(`docs/repo-polish/social-preview.html`)을 저장소에 있는 Playwright로 1280×640 스크린샷.
  - 원본을 남겨 두면 문구가 바뀔 때 다시 만들 수 있다.
- 문서 사이트 `lithentDocs/index.html` 수정:
  - `og:image`, `twitter:image`를 새 이미지로 바꾸고 `og:image:width/height`를 1280/640으로 맞춘다.
  - description 3곳의 "4KB"를 §1 표기로 바꾼다.
- GitHub 업로드는 사용자가 Settings → Social preview에서 직접 한다.

## 5. README 첫 화면 (RQ-5) — 확정 방향

**DC-1 비교표 넣기** — 확정 (2026-11-13, 사용자 결정). 사실 항목만 넣고 주관적 평가는 뺀다.

| | Lithent | Preact | React |
|---|---|---|---|
| 코어 크기 (brotli) | ~4.8KB | ~4.5KB | ~94KB (react + react-dom/client) |
| 컴포넌트 상태 | 클로저 변수 | hooks (또는 signals) | hooks |
| hooks 호출 순서 규칙 | 없음 | 있음 (hooks 사용 시) | 있음 |
| 업데이트 방식 | 수동 `renew()` 또는 반응형 helper | 자동 | 자동 |
| 빌드 없는 템플릿 | 패키지에 포함 (`lithent/ftags`, `lithent/tag`) | 별도 `htm` 패키지 | 내장 없음 (`createElement` 또는 서드파티) |
| 컴포넌트를 Custom Element로 내보내기 | 패키지에 포함 (`lithent/element`, <1KB) | 별도 `preact-custom-element` 패키지 | 내장 없음 (서드파티) |

- README에서 위 표는 영어로 쓰고 측정 버전과 방법을 각주로 단다.

**구조 변경**

1. 배지 줄에 CI 배지(`.github/workflows/ci.yml`, 워크플로 이름 `Validate`)를 추가한다.
2. "Get Started · Documentation · Examples" 줄에 **Try it online**(StackBlitz, `createLithent/basic`)을 추가한다.
   - **DC-2 StackBlitz 동작 여부**: `createLithent/basic`이 Tailwind 4(네이티브 바인딩)를 써서 WebContainer에서 실패할 수 있다. M-6에서 확인하고, 실패하면 링크를 빼고 기록한다. — 미확정
3. "Why Lithent?" 바로 아래에 §5 비교표를 넣는다.
4. 아래 세 문단은 각각 한 줄 링크로 줄인다(내용은 이미 문서 사이트와 `skills/`에 있다).
   - props 얕은 복사 안내(1.25.2)
   - `onClick` 네이티브 리스너 계약
   - concurrent 코어 alias 안내
5. 크기 표기는 §1 규칙을 따른다.

## 6. 커뮤니티 파일 (RQ-6) — 확정

| 파일 | 내용 |
|---|---|
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1. 신고 창구는 공개 이메일 대신 **GitHub 비공개 신고**와 저장소 관리자 연락으로 안내한다(이메일을 새로 공개하지 않음) |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | 패키지 선택(lithent, helper, ssr, element, concurrent, create-lithent, tooling), 버전, 재현 코드/링크, 기대·실제 동작, 환경 |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | 해결하려는 문제, 제안, 대안 |
| `.github/ISSUE_TEMPLATE/config.yml` | 질문은 Discussions, 보안은 Security Advisory, 문서 링크 |
| `.github/pull_request_template.md` | 변경 요약, 관련 이슈, 체크리스트(`pnpm test`, 크기 영향, CHANGELOG). [CONTRIBUTING.md](../../CONTRIBUTING.md) 링크 |

- 라벨은 기존 것(`bug`, `enhancement`, `question`)을 템플릿에서 쓴다. 새 라벨은 만들지 않는다.

## 7. 이슈 정리 (RQ-7, RQ-8) — 확정, 2026-11-13 반영

**#66, #67 닫기** — 확정 (2026-11-13, 사용자 결정). 코멘트 초안:

> Closing this old placeholder issue: it has no description and testing has moved on since 2024 (Vitest unit tests, Playwright E2E and the release verification in CI). If there is a concrete testing gap, please open a new issue with the case to cover.

**good first issue** — 확정, 2026-11-13 등록 (#112, #113, #114). 라벨: `good first issue`, `documentation`.

근거: `helper/`와 `element/`에는 README가 있고 루트 README의 Ecosystem 표가 그 README로 연결된다.
`ssr/`, `ftags/`, `tag/`에는 README가 없어서 표가 npm 루트 페이지로만 연결된다.
`devHelper`는 HMR 내부용이라 첫 기여 과제로는 맞지 않아 뺐다.
세 이슈는 같은 틀을 쓰고 아래 항목만 다르다.

| 이슈 | 제목 | 다룰 export | 참고 |
|---|---|---|---|
| GFI-1 (#112) | `docs: add a README for lithent/ssr` | `renderToString`, `hydration`, `renderWithHydration`, `run` (`ssr/src/index.ts`) | `createLithent/express` 템플릿, `ssr/src/tests`. 문서 사이트에는 SSR 가이드가 없다(처음 초안의 Example 12는 Mixed DOM 예제라 등록 뒤 고쳤다) |
| GFI-2 (#113) | `docs: add a README for lithent/ftags` | `fTags`, `fFragment`, `fMount`, `flMount` (`ftags/src/index.ts`) | 문서 사이트 FTags 가이드 |
| GFI-3 (#114) | `docs: add a README for lithent/tag` | `lTag` (`tag/src/index.ts`, htm 기반) | 문서 사이트 HTM 가이드 |

공통 본문 (영어, `<pkg>`·`<exports>`·`<refs>`만 바꾼다):

> `lithent/helper` and `lithent/element` each have a README next to their source, and the root README links to them. `<pkg>` has none, so the Ecosystem table only links to the npm package page.
>
> **Task**
> - Add `<dir>/README.md`: what the entry point is for, how to import it, and one minimal runnable example covering `<exports>`.
> - Point the `<pkg>` row of the Ecosystem table in the root `README.md` to the new file.
> - Add `<dir>/README.md` to `files` in the root `package.json` (as `helper/README.md` is).
>
> **References**: `helper/README.md` and `element/README.md` for tone and length; `<refs>`.
>
> **Done when** the example works against the current `lithent` release, links resolve, and `pnpm exec prettier --check <dir>/README.md` passes.

## 8. 루트 정리 (RQ-10) — 확정

| 항목 | 처리 | 근거 |
|---|---|---|
| `sample.ts` | 삭제 | 빌드·문서·스크립트 어디에서도 참조하지 않는다. 2025-10 이후 갱신되지 않아 소스와 어긋났다 |
| `MANUAL.md` | 유지, "zip 3kb" 문구만 §1 표기로 수정 | 2026-10에도 갱신된 살아 있는 문서 |
| `experiments/`, `html/`, `lithent-agent-addon.md` | 유지 | 빌드·문서 사이트·CONTRIBUTING이 참조(REQUIREMENTS §3-5) |

## 9. 결정 목록

- [x] DC-1 README 비교표 — 넣는다. 사실 항목만 (사용자, 2026-11-13)
- [ ] DC-2 StackBlitz 링크 — M-6 결과로 결정
- [x] DC-3 GitHub 공개 설정 — 초안 확인 후 `gh`로 반영 (사용자, 2026-11-13)
- [x] DC-4 #66·#67 — 닫는다 (사용자, 2026-11-13)
- [x] DC-5 루트 정리 범위 — 참조 없는 오래된 것만 (사용자, 2026-11-13)
- [x] DC-6 크기 표기 — "~4.8KB (brotli)", Preact와 같은 체급으로 표현 (§1 실측 근거)
- [x] DC-7 CoC 신고 창구 — 새 이메일을 공개하지 않고 GitHub 경로로 안내
