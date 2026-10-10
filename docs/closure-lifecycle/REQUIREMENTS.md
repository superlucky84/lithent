# REQUIREMENTS — 공개 lifecycle helper 통합

- 갱신일: 2026-10-10
- 브랜치: `feature/closure-lifecycle-helper`
- 기준 커밋: `123c243476b00336faf40e3c249ffde8b118dc8d` (7단계 성능 검증 완료)
- 상태: 공개 helper 연결과 소비자 검증 완료, [draft PR #96](https://github.com/superlucky84/lithent/pull/96) 리뷰 단계. npm 배포·main 병합은 범위 밖이다.
- 적용 절차: 사용자가 제공한 `doc-driven-designer-v1` 플레이북.
- 배경: [아이디어](../ideas/CLOSURE_LIFECYCLE.md), [최종 성능 기록](./PERFORMANCE_FINAL.md)
- 현재 계약: [DESIGN](./DESIGN.md), 계획·인계: [IMPLEMENT](./IMPLEMENT.md), [출시 체크리스트](./MANUAL_TEST_CHECKLIST.md)

## 위치와 범위

현재 요구사항·계약·계획의 정본은 이 네 문서다. 구현 정본은 `helper/src/lifecycle/`, 공개 진입점은 기존 `helper/src/index.ts`다.
`experiments/closure-lifecycle/`은 공개 import 회귀·시연과 과거 측정 재현에 사용한다.
PHASE2~7·성능·기존 크기 기록은 당시 결과이며 현재 계약을 대체하지 않는다.

## 요구사항과 통과 기준

| ID    | 요구사항                                                                                                  | 검증                                 |
| ----- | --------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| FR-1  | 등록마다 한 번 정리한다. 재진입·예외가 있어도 남은 정리를 시도하고 폐기 후 등록은 즉시 정리한다.          | owner 회귀                           |
| FR-2  | 최신 작업만 success/error/pending observer에 반영한다. abort 무시·observer 재진입도 처리한다.             | latest 회귀                          |
| FR-3  | 활동·인스턴스 수명을 분리한다. 활동 작업은 비활성 중 실행하지 않고 instance 작업은 숨김 중 계속된다.      | activity/scopedTask·브라우저         |
| FR-4  | 보존 view·host는 클로저·DOM을 유지하고 최종 제거는 자원과 독립 루트를 정리한다.                           | retainedView/host·브라우저           |
| FR-5  | native child renew 중단은 기존 Concurrent에서만 지원한다. base freeze 요청은 초기화·DOM 삽입 전 실패한다. | support/boundary·두 코어 소비자      |
| FR-6  | 함수 9개와 이름 있는 핸들·설정·결과 타입을 기존 `lithent/helper`에서 제공한다.                            | ESM/CJS·엄격한 TS 소비자             |
| FR-7  | 같은 태스크의 element 이동은 유지, 실제 제거·재연결은 폐기·새 생성한다.                                   | element·브라우저                     |
| FR-8  | import·scope 생성·SSR만으로 요청·타이머를 시작하지 않는다. SSR host는 shell만 렌더한다.                   | Node SSR·패키지 import               |
| NFR-1 | 기준 이후 두 코어 소스·공개 타입·exports와 ESM/CJS/UMD 6개 산출물은 변경하지 않는다.                      | git diff·SHA-256                     |
| NFR-2 | 기존 helper API와 두 코어의 기존 helper 회귀 51개를 유지한다.                                             | helper 51개 × 2                      |
| NFR-3 | 기존 두 코어 빌드를 유지한다. 새 코어 빌드·런타임 활성 옵션을 만들지 않는다.                              | 빌드·패키지 diff                     |
| NFR-4 | 배포 패키지의 ESM/CJS·Bundler/Node16/NodeNext 선언과 exact core alias가 동작한다.                         | 격리 패키지 통합                     |
| NFR-5 | 미사용 lifecycle 코드·컬렉션은 ESM 앱에서 제거한다. 전체 helper UMD 증가분은 별도 공개한다.               | 이전 helper와 tree shaking·크기 비교 |

## 제약·가정·제외

기본 코어의 작고 빠른 특성을 유지한다. Concurrent에 이미 포함한 내부 연결을 그대로 사용한다.
이번 단계는 공개 배치이며 scheduler·pause 정책·성능 보장을 바꾸지 않는다.
helper와 컴포넌트는 같은 코어 인스턴스를 사용해야 한다. 오래된 Concurrent는 freeze 검사를 통과하지 못할 수 있다.

cleanup은 동기 함수이며 reporter는 예외를 던지지 않는다. cancel은 pending=false를 발행하지 않는다.
observer 밖의 상태 변경·서버 저장은 취소로 되돌리지 않는다. 재시도·저장 순서·rollback·state-ref/query 자동 연결은 제외한다.
숨김은 메모리 해제가 아니다. 포커스·선택 자동 복원, portal·영상·iframe 자동 중단은 제공하지 않는다.
실제 서버·Firefox·Safari·접근성은 제품 적용 시 별도 검증 항목이다.

기존 helper 사용자는 import·인자·동작 변경이 없다. 실험 사용자는 `./src`를 `lithent/helper`로 바꾼다.
실험 entry는 호환 재수출만 남긴다. 버전 변경·배포·데이터 마이그레이션은 없다.
