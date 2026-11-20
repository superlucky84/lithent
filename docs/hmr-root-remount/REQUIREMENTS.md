# REQUIREMENTS — `<html>` 루트 컴포넌트의 반복 교체 (hmr-root-remount)

- 브랜치: `ccr-3e48bc24-eapswq` / 기준 커밋 `d4fdef9`
- 작성일: 2026-11-20
- 상태: **발행 완료 (2026-11-20, `lithent` 1.25.12 / `lithent-concurrent` 0.2.8)** — [IMPLEMENT.md](./IMPLEMENT.md) 참고
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 배경: [../hmr-propagation/IMPLEMENT.md](../hmr-propagation/IMPLEMENT.md) Phase 3a
- 코드 범위: `src/render.ts`, `lithentConcurrent/src/render.ts`, `devHelper/src/tests/`, `ssr/src/tests/`

## 1. 배경

SSR(Express) 템플릿의 `src/layout.tsx`는 `<html>` 문서 전체를 렌더한다. 개발 서버에서 이 파일을 두 번
고치면 두 번째에 페이지 본문(`header`, `main`)이 사라진다. 콘솔 오류는 없고 새로고침해야 돌아온다.
hmr-propagation 수정 뒤에는 `src/favorites.ts`를 고쳐도 Layout이 교체되므로 더 자주 만난다.
수정 전 코드(`395aaee`)에서도 같다.

| 붙이는 방식 | 1차 교체 | 2차 교체 |
|---|---|---|
| `hydration(<Layout />, document.documentElement)` (SSR 템플릿) | 정상 | **본문 사라짐** |
| `render(<Layout />, document.documentElement)` | **본문 사라짐** | 사라짐 |

두 코어(`lithent`, `lithent-concurrent`) 모두 같다. jsdom에서도 재현된다.

### 원인

루트의 감싸는 요소(`we`)가 `<html>`이면, 루트를 넣을 때 `we.replaceWith(새 요소)`로 `<html>` 자체를
바꾼다. 그러나 루트 WDom의 `we`는 문서에서 떨어져 나간 옛 `<html>`을 계속 가리킨다.
다음 교체(devHelper `replaceWDom` → `typeSortedReplace`)에서:

1. 삭제: 살아 있는 `<html>`의 내용을 비운다(`innerHTML = ''`).
2. 삽입: 떨어져 나간 옛 `<html>`에 `replaceWith` → 부모가 없어 아무 일도 없다.

`render`는 첫 렌더에서 이미 `<html>`을 바꾸므로 1차 교체부터, `hydration`은 첫 렌더에서 바꾸지 않으므로
2차 교체부터 깨진다.

## 2. 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| RQ-1 | `<html>`을 렌더하는 루트 컴포넌트를 HMR로 여러 번 교체해도 본문이 남고 최신 내용이 보인다 (hydration, render 둘 다) | devHelper·ssr 단위 테스트(두 코어), SSR 템플릿 수동 확인 |
| RQ-2 | 두 코어가 같은 동작을 한다 | `test:satellites`, `test:satellites:concurrent` |
| RQ-3 | `<html>`이 아닌 루트, `afterElement`가 있는 루트의 삽입은 그대로다 | `test:dual` |
| RQ-4 | base 코어 크기 예산(brotli 4,800B)을 지킨다 | `pnpm size` |

## 3. 비목표

- `<html>` 요소를 바꾸지 않고 내용만 옮기는 방식으로의 변경 (DESIGN DC-1)
- 문서 밖의 `<html>`에 렌더하는 경우의 동작 변경 (지금도 화면에 붙지 않는다)
