# REQUIREMENTS — 클로저 수명 관리 1단계 검증

- 작성일: 2026-10-10
- 브랜치: `experiment/closure-lifecycle`
- 기준 커밋: `0a3dcc8753317382b5272bd6d399f4eb3793bfb9`
- 상태: 실험 프로토타입. 공개 API·패키지 출하는 결정하지 않는다.
- 배경: [아이디어](../ideas/CLOSURE_LIFECYCLE.md)
- 관련: [DESIGN](./DESIGN.md), [IMPLEMENT](./IMPLEMENT.md), [체크리스트](./MANUAL_TEST_CHECKLIST.md)

## 목표

작업 소유권을 코어 수정 없이 제공할 수 있는지, 선택적으로 사용할 때의 다운로드
비용이 어느 정도인지 검증한다. 일반 클로저 변수·명시적 `renew`를 사용하는 컴포넌트가 대상이다.

| ID   | 요구사항                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------- |
| FR-1 | 인스턴스가 명시적으로 등록한 자원을 소유하고, 수동 정리·최종 폐기 시 등록마다 한 번 정리한다.         |
| FR-2 | 정리 중 예외·재진입이 있어도 남은 자원을 정리한다. 폐기 후 등록은 즉시 정리한다.                      |
| FR-3 | 작업 그룹의 새 실행은 이전 실행을 무효화하고 `AbortSignal`로 취소를 요청한다.                         |
| FR-4 | 이전 실행의 성공·오류·pending 완료는 새 실행이나 폐기된 인스턴스에 반영되지 않는다.                   |
| FR-5 | 독립 작업 그룹은 서로 취소하지 않는다. 오류 observer와 work 오류를 구분한다.                          |
| FR-6 | 기존 `mountCallback`으로 언마운트 시 범위를 폐기한다. 같은 인스턴스의 재렌더에서는 재생성하지 않는다. |
| FR-7 | Custom Element의 기존 이동 보존·제거 정리 계약을 유지한다.                                            |
| FR-8 | import·범위 생성·SSR만으로 요청과 타이머를 시작하지 않는다.                                           |

## 검증 기준

- `src/`, `lithentConcurrent/src/`, `helper/src/`, `element/src/`, 공개 exports와 lockfile 변경 0.
- base·concurrent에서 동일한 동작 테스트 통과.
- TypeScript 및 ESLint 검사 통과.
- 기존 base·concurrent·helper의 ESM/CJS/UMD 9개 파일은 기준 빌드와 SHA-256이 동일.
- 외부 `lithent`를 포함하지 않은 실험 UMD의 raw/gzip/Brotli 크기를 별도 측정한다.
- 실험 구현·빌드 설정은 `experiments/closure-lifecycle/`에 둔다.

## 이번 단계의 범위

인스턴스 소유권, 최종 정리, 요청 취소, 최신 결과 반영만 검증한다.
활동 세대, 활성화·비활성화, DOM 보존, 서브트리 갱신 차단,
진행 중인 concurrent build 취소, state-ref/query 연결은 다음 단계의 설계 과제다.
현재 공개 진입점에 새 export를 추가하지 않는다.
