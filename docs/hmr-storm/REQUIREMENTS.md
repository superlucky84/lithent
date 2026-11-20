# REQUIREMENTS — HMR 반복 감지 E2E (hmr-storm)

- 브랜치: `ccr-3e48bc24-eapswq` / 기준 커밋 `122e11d`
- 작성일: 2026-11-20
- 상태: **구현·검증 완료** — [IMPLEMENT.md](./IMPLEMENT.md) 참고
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 배경: [../hmr-propagation/IMPLEMENT.md](../hmr-propagation/IMPLEMENT.md) Phase 3a
- 코드 범위: `e2e/hmr-storm.spec.ts`, `e2e/fixtures/hmr/storm/`, `e2e/server.mjs`, `e2e/check-mutations.mjs`

## 1. 배경

개발 모드에서 저장 한 번에 HMR이 끝없이 이어지는 버그가 여러 번 고쳐진 뒤에도 재발했다.
원인은 매번 달랐고(invalidate 반복, DOM 없는 인스턴스 재시도, 교체 중 새 자손 재교체) 경로마다 상한을 두어
막았다. 기존 테스트는 "수정이 반영됐는가"만 보고 "반영된 뒤 멈췄는가"는 보지 않아, 새 경로가 생기면
CI가 잡지 못한다.

## 2. 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| RQ-1 | 저장마다 기대한 화면에 도달한 뒤, HMR 갱신·새로고침·Lithent HMR 경고·DOM 변경이 정해진 시간 안에 멈추는지 검사한다 | `e2e/hmr-storm.spec.ts` |
| RQ-2 | 원인을 가정하지 않는다. 콘솔에 아무것도 남기지 않는 루프(DOM만 계속 바뀜)도 잡는다 | 결함 주입 `hmr-storm` |
| RQ-3 | 과거 반복 경로와 최근 수정이 바꾼 경로를 시나리오로 포함한다 | 스펙 |
| RQ-4 | 저장 한 번의 작업량(갱신·새로고침·경고 수)에 시나리오별 상한을 둔다 | 스펙 |
| RQ-5 | CI의 기존 E2E 실행(`pnpm test:e2e`, 브라우저 3종 × 코어 2종)에 들어가고, 다른 스펙을 방해하지 않는다 | Chromium 전체 실행 |
| RQ-6 | 검사가 루프를 실제로 잡는다는 것을 음성 대조로 보인다 | `pnpm test:e2e:mutations` |

## 3. 비목표

- 화면 변화 없이 CPU만 쓰는 루프(예: DOM이 없는 인스턴스를 상한 없이 재시도) 감지. 콘솔·DOM·새로고침
  어느 것도 남기지 않아 이 방식으로는 보이지 않는다 (DESIGN DC-3).
- 사용자가 겪은 정확한 재현 조건 재현 (모름)
- SSR(Express) 템플릿 자체를 E2E로 띄우는 것
