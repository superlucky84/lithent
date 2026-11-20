# REQUIREMENTS — 컴포넌트 없는 모듈의 HMR 전파 (hmr-propagation)

- 브랜치: `ccr-3e48bc24-eapswq` / 기준 커밋 `395aaee`
- 작성일: 2026-11-20
- 상태: **구현·자동 검증·릴리스 준비 완료, 발행 대기** — [IMPLEMENT.md](./IMPLEMENT.md) 참고
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 배경: [../widget-template/README.md](../widget-template/README.md) §3, §6-4
- 코드 범위: `packages/hmrParser/src/strings.ts`, `packages/hmrParser/src/tests/`, `e2e/`

## 1. 배경

위젯 템플릿을 만들다가, 개발 서버에서 어떤 파일을 고쳐도 화면이 바뀌지 않고 새로고침도 되지 않는
경우를 만났다. 서버 로그에는 `hmr update <파일>`이 찍힌다. SPA 템플릿에서도 재현된다.

| 모듈 | 예 | 지금 | `@lithent/lithent-vite` README의 약속 |
|---|---|---|---|
| 컴포넌트 없이 `lithent/*`를 import하는 모듈 | basic `src/favorites.ts` (store) | 수정이 무시된다 | importer로 전파 |
| render만 하는 진입점 | basic `src/index.tsx` | 수정이 무시된다 | importer(HTML)로 전파 → 전체 새로고침 |
| `defineElement`만 하는 진입점 | widget `src/main.ts` | 수정이 무시된다 | 같음 |

README: "Files without component boundaries propagate updates to their importers."

### 원인

`@lithent/hmr-parser`는 컴포넌트가 없는 모듈에도 다음을 넣는다(`packages/hmrParser/src/strings.ts`).

```js
if ([].length) {
  import.meta.hot.accept(mod => { ... });
}
```

런타임에서는 `if`가 막지만, Vite 서버는 `import.meta.hot.accept(`를 **소스에서 정적으로** 찾아
모듈을 self-accepting으로 등록한다. 수정이 생기면 서버는 그 모듈에서 전파를 멈추고 브라우저에
갱신을 보낸다. 브라우저에서는 `accept`가 호출된 적이 없어 `hotModulesMap`에 모듈이 없고,
Vite 클라이언트의 `fetchUpdate`가 `if (!mod) return;`으로 갱신을 버린다.
재실행도 새로고침도 일어나지 않는다.

`lithent/*` 서브패스를 import하거나 `lithent`에서 `render`·`mount`·`lmount`를 import하는 모듈은
모두 변환 대상이므로(`detectLithentUsage`), store·context·`lithent/element` 진입점이 모두 해당된다.

## 2. 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| RQ-1 | 컴포넌트 경계가 없는 모듈의 변환 결과에 `import.meta.hot.accept`가 없다 | hmr-parser 단위 테스트 |
| RQ-2 | 그런 모듈을 고치면 importer로 전파된다. 컴포넌트 importer가 있으면 그 경계에서 새로고침 없이, 진입점이면 전체 새로고침으로 반영된다 | E2E |
| RQ-3 | 컴포넌트가 있는 모듈의 기존 HMR은 그대로다 (경계 교체, 부모 상태 유지, 내보내기 변경 시 전파, 무효화 예산) | 기존 단위·E2E 테스트 |
| RQ-4 | render 가드, `dispose`, `prune` 동작은 그대로다 | 기존 단위 테스트 |
| RQ-5 | 프로덕션 빌드 출력은 바뀌지 않는다 | 플러그인은 개발 서버에서만 변환(기존 동작) |

## 3. 비목표

- 컴포넌트 없는 모듈을 변환 대상에서 아예 빼는 것 (DESIGN DC-1)
- 위젯 템플릿의 `include: /\.tsx$/` 우회 제거 — 수정된 플러그인이 발행된 뒤 (DESIGN DC-4)
- 진입점 수정을 새로고침 없이 반영하는 새 기능
