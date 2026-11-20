# DESIGN — HMR 반복 감지 E2E (hmr-storm)

- 작성일: 2026-11-20
- 관련 문서: [REQUIREMENTS.md](./REQUIREMENTS.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

## 1. 측정

- 브라우저 쪽에서 센다: 콘솔 `[vite] hot updated:`(갱신), `load` 이벤트(새로고침),
  `[Lithent HMR]`(경고), `MutationObserver`가 문서 전체에서 본 변경 수(`addInitScript`로 매 로드마다 설치).
- 저장 한 번 = 파일 쓰기 → 기대 화면 도달 → **settle**: 네 값이 1초 동안 변하지 않으면 멈춘 것.
  8초가 지나도 변하면 `HMR still active`로 실패.
- 멈춘 뒤 저장 한 번에 쓴 갱신·새로고침·경고 수를 시나리오별 상한과 비교한다.
- 시나리오가 끝날 때마다 파일을 되돌리고, 되돌린 저장도 같은 방식으로 검사한다. 되돌릴 때 생기는 전체
  새로고침이 다음 테스트로 새지 않는다(hmr-propagation에서 겪은 문제).

## 2. 픽스처 (`e2e/fixtures/hmr/storm/`, 플러그인 `include`에 디렉터리 전체)

| 시나리오 | 겨냥하는 경로 | 상한 (갱신/새로고침/경고) |
|---|---|---|
| 한 파일 여러 컴포넌트(Outer 2·Inner 4·Item 40) 수정·복원 | #95 교체 중 새 자손 재교체 | 2/0/0 |
| 40ms 간격 저장 5회 | 연속 이벤트 | 5/0/0 |
| 숨긴 상태에서 수정 후 표시 | 2025-12 DOM 없는 인스턴스 재시도 | 2/0/0 |
| store 모듈 | hmr-propagation | 2/0/0 |
| 비컴포넌트 export | 상한 없는 `module exports changed` invalidate | 3/0/0 |
| 순환 import의 값 | Vite `circular import invalidate` | 4/1/2 |
| render만 하는 진입점 | hmr-propagation (새로고침 1회) | 0/1/0 |
| 렌더 중 예외 → 복구 | 2025-11 실패 invalidate 반복 | 4/2/6 |
| 문법 오류 → 수정 | 저장 중간 상태 | 4/2/6 |
| `<html>` Layout 3회 교체 | hmr-root-remount | 1/0/0 |

예외·문법 오류 시나리오는 의도한 콘솔 오류가 나므로 오류를 실패로 보는 공용 fixture 대신
`@playwright/test`의 `test`를 쓴다.

## 3. 결정

- [x] DC-1 원인별 검사가 아니라 활동량 검사. 다음 반복 원인이 무엇이든 같은 기준으로 잡힌다.
- [x] DC-2 DOM 변경을 활동에 넣는다. 결함 주입에서 콘솔은 갱신 1·경고 0인데 DOM 변경이 8초에 6,706번이었다.
  DOM 변경을 빼면 이 루프를 놓친다.
- [x] DC-3 CPU만 쓰는 루프는 범위 밖. devHelper에 개발용 계측 카운터를 두면 잡을 수 있지만 제품 코드를
  테스트를 위해 바꾸는 일이라 이번에 하지 않는다.
- [x] DC-4 음성 대조 `hmr-storm`: E2E 서버가 devHelper를 소스로 불러와 (1) 교체에 성공한 인스턴스를 다시
  대기열에 넣고 (2) 재시도 상한을 없앤다. 압축된 dist 대신 소스를 고쳐 변수명 변화에 영향받지 않게 하고,
  고칠 문자열이 없으면 서버가 오류를 내서 조용히 넘어가지 않게 한다. 기존 대조들처럼 수동 명령
  (`pnpm test:e2e:mutations`)이다.
- [x] DC-5 시간 기준: 조용함 1초, 한계 8초. 정상 시나리오의 활동은 수백 ms 안에 끝났다.
  전체 스펙 시간은 두 코어 합쳐 약 1.1분.
