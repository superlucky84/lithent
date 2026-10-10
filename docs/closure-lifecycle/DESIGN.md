# DESIGN — 코어 수정 없는 소유권 실험

## 구성

- `createOwnerScope()`: 외부 작업을 시작하지 않는 인스턴스 소유 범위.
- `scope.own(cleanup)`: 동기 정리 함수를 등록하고, 한 번만 실행되는 수동 정리 함수를 반환.
- `scope.dispose()`: 먼저 폐기 상태로 바꾸고 등록 목록을 비운 뒤 전체 정리를 실행.
- `createLatestTask(scope)`: 독립적인 최신 작업 그룹. 요청마다 새 `AbortController`를 생성.
- `useOwnerScope(reportCleanupError?)`: 초기화 때 범위를 만들고 `mountCallback` 반환 함수로 정리.

이 이름은 실험 폴더의 API이며 `lithent`의 공개 API가 아니다.
이벤트 핸들러와 `await` 이후에는 초기화에서 확보한 명시적 범위를 사용한다.

## 정리 계약

등록마다 한 번 정리한다. 같은 원본 함수를 두 번 등록하면 서로 다른 두 자원 등록으로 취급한다.
수동 정리는 소유 목록에서 등록을 제거한 뒤 실행한다. 최종 정리의 실패는 모든 정리 시도 후
`AggregateError`로 보고한다. 정리 도중 중복 폐기는 아무 작업도 하지 않는다.
폐기된 범위에 늦게 등록하면 즉시 정리하고, 실패는 등록한 호출자에게 전달한다.

Lithent 어댑터는 최종 정리 오류를 reporter에 전달해서 기존 코어의 자식 정리와
DOM 제거가 계속되도록 한다. 기본 reporter는 `console.error`이다.
사용자 reporter는 예외를 던지지 않아야 한다. 비동기 cleanup의 완료는 기다리지 않는다.

## 최신 작업 계약

새 controller를 현재 실행으로 먼저 게시한 다음 이전 controller를 abort한다.
abort listener가 재진입해서 다른 요청을 시작해도 이전 실행이 그 요청을 덮지 않는다.
성공·오류·pending observer마다 현재 controller와 범위의 폐기 여부를 확인한다.
observer가 새 작업을 시작해도 이전 `finally`는 새 pending 상태를 변경하지 않는다.

`run()`은 `success`, `error`, `stale` 결과를 반환한다. work의 실패는 현재 실행에서만
error observer와 결과로 전달한다. observer의 실패는 `run()` Promise를 reject하며,
work의 실패로 다시 처리하지 않는다. 취소·폐기 이후의 observer는 실행하지 않는다.
`cancel()`은 현재 실행을 무효화하고 abort하며 pending=false를 발행하지 않는다.
계속 표시되는 UI에서 수동 취소를 표현하려면 호출자가 pending 상태를 명시적으로 바꾼다.

이 보장은 제공된 observer를 통한 반영에 적용된다. work 안에서 직접 상태를 쓰거나
외부 부수효과를 실행하면 라이브러리가 막거나 되돌릴 수 없다.
취소를 무시하는 Promise를 강제로 끝내지는 않는다. 그런 작업은 실제 완료까지 참조를 유지할 수 있다.
작업이 완료된 뒤에도 유지할 리스너·타이머는 별도로 `scope.own()`에 등록해야 한다.

## 마운트와 SSR

어댑터를 mounter에서 한 번 호출하되, 외부 작업의 시작은 `mountCallback`이나 이벤트에 둔다.
범위 자체는 초기화 때 외부 부수효과를 만들지 않는다. SSR은 mount callback을 실행하지 않는다.
사용자가 초기화에서 직접 `task.run()`을 호출하는 행위까지 자동으로 차단하지는 않는다.
아직 커밋되지 않은 초기화 시도의 폐기나 활동 범위의 재시작 기능은 추가하지 않는다.

## 크기 해석

코어와 일반 helper는 실험을 import하지 않는다. 실험 번들은 `lithent`를 external로 둔다.
UMD를 별도 파일로 로드하는 경우 코어 압축 크기와 실험 압축 크기를 합산할 수 있다.
ESM 앱의 최종 번들 비용은 minify·tree shaking·압축 구성이 달라 별도 측정해야 한다.
이 실험의 크기는 전체 화면 보존 기능의 크기 추정치가 아니다.
