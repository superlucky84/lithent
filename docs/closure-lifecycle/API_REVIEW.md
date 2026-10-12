# 공개 helper API 검토안

- 작성일: 2026-10-10
- 대상: `experiment/closure-lifecycle-performance`의 검증된 구현
- 상태: 7단계 당시의 API·배치 제안 기록. 현재 공개 통합 계약은 [DESIGN](./DESIGN.md), 진행 상태는 [IMPLEMENT](./IMPLEMENT.md)가 정본이다. npm 배포 전이다.
- 근거: [6단계 결과](./PHASE6.md), [7단계 정리](./PHASE7.md)

## 빌드와 배치

기본 코어와 기존 Concurrent 빌드 두 개를 유지한다. lifecycle 전용 코어 빌드나
사용 여부를 고르는 런타임 옵션은 추가하지 않는다. 갱신 차단에 필요한 내부 연결은
기존 Concurrent에 포함하고, 소유권·작업·보존 화면 API는 기존 `lithent/helper`에 배치하는 안이다.

소유권과 작업 관리는 두 코어에서 사용할 수 있다. 자식 native renew 차단은 Concurrent에서만
제공한다. `lithent`만 정확히 alias하는 기존 설정을 유지하고, helper가 같은 코어 인스턴스를
사용하도록 한다. 내부 `componentMap.renderGate`와 `boundaryOwner`는 공개 API로 내보내지 않는다.

helper를 사용하지 않는 앱의 기본 코어에는 새 의존성을 추가하지 않는다.
ESM에서 필요한 API만 가져올 때의 최종 비용과 전체 helper UMD의 크기는 공개 연결 후 따로 측정한다.
현재 별도 실험 UMD의 크기를 공개 helper의 증가분으로 그대로 해석하지 않는다.

## API 후보

| 이름                                                            | 지원 코어       | 계약                                                                            |
| --------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------- |
| `createOwnerScope()`                                            | 기본·Concurrent | 자원 등록, 수동 정리, 최종 폐기. 생성만으로 외부 작업을 시작하지 않음           |
| `useOwnerScope(reportCleanupError?)`                            | 기본·Concurrent | mounter에서 생성하고 확정된 컴포넌트의 언마운트에 폐기를 연결                   |
| `createLatestTask(scope)`                                       | 기본·Concurrent | 작업 그룹마다 최신 실행의 결과·오류·pending observer만 반영                     |
| `createActivityScope()`                                         | 기본·Concurrent | 처음에는 비활성. 인스턴스와 활성 세대의 자원 수명을 구분                        |
| `createScopedTask(scope, lifetime?)`                            | 기본·Concurrent | 기본값 `activity`. `instance` 작업은 화면을 숨겨도 수명을 유지                  |
| `createRetainedView(host, initialize, options?)`                | 기본·Concurrent | 처음에는 숨긴 독립 루트. `show`·`hide`·`dispose`로 상태와 DOM을 명시적으로 보존 |
| `createRetainedHost(initialize, reportCleanupError?, options?)` | 기본·Concurrent | 확정된 외부 호스트가 독립 보존 루트를 소유. 최종 제거는 폐기                    |
| `useRenderBoundary(initialActive?)`                             | Concurrent      | mounter에서 한 경계를 생성. 기본값 활성. 갱신 차단만 담당                       |
| `supportsRenderBoundary()`                                      | 기본·Concurrent | 같은 코어가 해당 실험의 차단 capability를 갖추었는지 확인                       |

현재 함수 이름과 기본값을 우선 유지한다. 반환값에는 `OwnerScope`, `ActivityScope`,
`RenderBoundary`, 작업 outcome·handlers, 보존 화면 options·host props의 명시적인 타입을 제공한다.
공개 연결 때 보존 화면과 작업 핸들의 이름 있는 반환 타입도 정리한다.

## 사용자가 알아야 할 동작

### 작업과 정리

`own()`은 등록마다 한 번 정리한다. 중복 dispose는 아무 작업도 하지 않으며,
폐기 뒤 늦게 등록한 자원은 즉시 정리한다. 정리 실패는 남은 정리를 시도한 뒤 보고한다.
컴포넌트 어댑터의 cleanup reporter는 예외를 던지지 않아야 한다.

새 작업은 이전 실행을 무효화하고 abort를 요청한다. 취소를 무시한 작업의 늦은 결과도
observer에 전달하지 않는다. work 내부의 직접적인 상태 변경이나 서버 저장을 되돌리지는 않는다.
`cancel()`은 pending=false를 자동 발행하지 않는다. observer가 던진 예외는 `run()`을 reject한다.

활동 작업은 재활성화마다 새 세대를 사용한다. 비활성 상태에서 활동 작업을 요청하면
work를 실행하지 않고 stale 결과를 반환한다. 인스턴스 작업도 새 실행이 이전 실행을 대체한다.
서버 저장의 순서·롤백·재시도는 애플리케이션의 별도 계약이다.

### 보존과 갱신 차단

`freezeChildren`의 기본값은 false다. 이때 보존 루트가 제공한 renew는 숨김 중 모아 두지만,
자식이 직접 호출하는 native renew까지 막지는 않는다.

`freezeChildren: true`는 Concurrent에서만 허용한다. 지원하지 않는 코어에서는 초기화 전에
명시적으로 실패한다. 숨김 중 차단한 갱신은 dirty로 기록하고 재개 시 최신 모델을 반영한다.
최종 제거는 중단 여부와 관계없이 자원과 컴포넌트를 정리한다.

`useRenderBoundary().pause()`는 DOM을 숨기거나 네트워크 작업을 취소하지 않는다.
활동 수명과 DOM 숨김은 보존 view·host가 함께 연결한다. pause는 렌더 함수 밖에서 호출한다.
초기 비활성 경계도 첫 구성은 허용하며 등록은 mount가 확정된 뒤에 한다.

관련 없는 대기 렌더는 low lane에서 이어간다. 관련된 순수 대기 작업은 버리고 재개 시 반영한다.
이미 effect·초기화를 실행한 관련 작업은 활성 상태에서 동기 완료한 뒤 pause한다.
따라서 pause가 항상 한 프레임 안에 끝난다고 약속하지 않는다.

숨김은 메모리 해제가 아니다. 보존 개수와 최종 폐기 책임을 호출자가 정한다.
포커스·선택 영역의 자동 복원, 외부 portal DOM의 숨김, CSS로 숨긴 자식의 모든 외부 작업 정지는
제공하지 않는다. 화면·구독·작업 수명은 필요한 곳에 명시적으로 연결한다.

### SSR와 호스트

import·scope 생성만으로 요청과 타이머를 시작하지 않는다. 외부 작업은 mount가 확정된 콜백이나
이벤트에서 시작한다. 보존 host의 SSR은 껍데기만 렌더하며, DOM을 요구하는 view 생성은 브라우저에서 한다.
이미 만들어진 host의 같은 태스크 내 Custom Element 이동은 인스턴스를 유지한다.
실제 제거 후 재연결은 새 인스턴스를 만든다.

## 공개 연결 순서

1. 검증된 구현을 helper 내부로 옮기고 기존 helper entry에서 export한다. 코어 export는 늘리지 않는다.
2. 기본·Concurrent 소비 앱에서 ESM/CJS, 타입 선언, 같은 코어 인스턴스 연결과 tree shaking을 확인한다.
3. 검색·보존 편집기 예제를 공개 import로 바꾸고 사용 계약과 크기를 helper 문서에 기록한다.

실험에서 이미 통과한 동작은 이동으로 영향을 받는 부분을 다시 확인한다.
Firefox·Safari, 실제 편집기의 포커스·접근성, 실제 서버 저장 연동은 제품 적용 전 별도 확인 대상이다.
현재의 Chromium 합성 성능 수치로 그 환경까지 통과했다고 주장하지 않는다.
