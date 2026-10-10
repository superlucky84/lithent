# 4단계 — 서브트리 갱신 중단의 최소 코어 연동

- 작성일: 2026-10-10
- 브랜치: `experiment/closure-lifecycle-core`
- 기준: 코어 무수정 3단계 `925b4aa98c40ca20b309ea2613cc625d260fa5b1`
- 상태: **별도 브랜치의 opt-in 프로토타입. 공개 API·기본 브랜치 반영은 하지 않는다.**

## 결과와 범위

숨긴 경계 안에서는 자식의 독립적인 native `renew()`와 부모 diff에 따른 재평가를 막을 수 있다.
업데이터와 이후 `updateCallback` action/commit callback은 실행하지 않고, 기존 클로저·DOM·컴포넌트
인스턴스를 유지한다. 재개하면 최신 모델과 부모 props·slot을 경계 루트에서 반영한다.
최종 제거와 교체는 정상 unmount를 수행한다.

이 동작에는 코어 수정이 필요하지만, 4단계에서 변경한 코어 소스는 7개 파일, 37행 추가·4행 삭제다.
기존 helper·element 소스와 패키지 exports는 바꾸지 않는다. 기존 `componentMap`에 붙인
`renderGate`는 실험용 내부 프로토콜이며 안정된 공개 API로 약속하지 않는다.
`ComponentMap` 타입도 이 프로토콜을 표현하도록 변경했으므로 출시 전 타입 호환성 검토가 필요하다.

크기는 작지만 부모 탐색 비용과 Concurrent 숨기기의 동기 대기 시간이 남는다.
**동작 검증을 통과했다는 사실만으로 이 구현을 바로 출시할 근거는 부족하다.**

## 코어가 검사하는 지점

| 위치                                      | 역할                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| 두 코어의 `wDom.ts` `replaceWDom` 입구    | 큐에서 실제 실행할 때 숨김 경계를 확인한다. hide 직전에 큐에 들어간 갱신도 차단한다.   |
| 두 코어의 `diff.ts` `runUpdate`           | 최신 props·slot은 보관하되, 숨김이면 기존 WDOM을 반환해 자식 재평가·effect를 건너뛴다. |
| 공유 `universalRef.ts`와 `types/index.ts` | 내부 프로토콜을 제공하고 렌더 실행 안에서의 pause를 거부한다.                          |
| Concurrent `scheduler.ts`                 | pause 전에 이미 시작해 parked 상태인 작업을 현재 활성 상태에서 동기 완료한다.          |

검사는 `renew()` 호출 자체를 거절하지 않는다. 살아 있는 자식의 renew는 true를 반환하고 큐에
들어갈 수 있으나, 실행할 때 렌더를 차단하고 경계를 dirty로 표시한다. 따라서 정지시키지 않은
외부 타이머가 계속 renew하면 큐 처리 비용은 남는다. 타이머·구독·요청의 수명은 ActivityScope로 관리한다.

부모가 숨긴 경계의 props·slot을 여러 번 바꿔도 DOM은 유지한다. 재개 시 마지막 값을 사용한다.
삭제·타입 교체·key 변경에 따른 새 인스턴스 생성은 보존 대상이 아니다. 같은 key의 순서 변경은
기존 인스턴스를 유지한다. 단순 `pause()`는 CSS 숨김을 적용하지 않으므로 호스트가 별도로 숨겨야 한다.

## 실험 어댑터

[`renderBoundary.ts`](../../experiments/closure-lifecycle/src/renderBoundary.ts)의
`useRenderBoundary(initialActive = true)`는 mounter에서 컴포넌트당 한 번 호출한다.
mount commit 뒤에만 경계를 등록하고 unmount 시 제거한다. SSR과 실패한 초기 구성은 등록하지 않는다.
최초 구성은 inactive 경계에서도 한 번 허용한다.

- `pause()`: 진행 중인 Concurrent 작업을 끝낸 뒤 inactive로 바꾼다. 이벤트·호스트 commit 등 렌더 밖에서 호출한다.
- `resume()`: active로 바꾸고, 차단된 갱신이 있으면 루트 renew를 요청한다. dirty 갱신은 합쳐서 처리한다.
- `dispose()`: 경계 등록을 해제한다. DOM/컴포넌트의 최종 제거는 기존 render destroy 또는 부모 제거가 담당한다.

숨긴 경계가 없으면 어댑터는 부모 탐색 없이 false를 반환한다. 하나라도 숨긴 경계가 있으면
WDOM의 `getParent()`를 따라 모든 숨긴 조상을 찾아 dirty로 표시한다. 이 방식은 중첩 경계와
portal 자식도 처리하지만, 다른 루트의 갱신에도 탐색 비용을 추가한다. 마지막 경계 폐기 후에는
`blocks` callback을 제거한다. 동일 런타임에 서로 다른 복사본의 어댑터를 중복 설치하는 것은 거부한다.

보존 루트 연결은 기본값 false인 `freezeChildren` 옵션을 사용한다.

```ts
const Editor = createRetainedHost(initialize, console.error, {
  freezeChildren: true,
});
const view = createRetainedView(host, initialize, { freezeChildren: true });
```

show는 ActivityScope 활성화와 경계 재개를 연결하고, hide는 경계 pause 뒤 활동을 중단하고 DOM을 숨긴다.
옵션 false는 3단계 동작을 유지한다. true에는 같은 런타임의 4단계 코어가 필요하며, 이전 코어에서는
명시적으로 실패한다. 이 브랜치의 일반 호스트·Custom Element 시연은 true로 실행한다.

## Concurrent 정책

`updateCallback` action은 build 중 이미 실행될 수 있다. 그런 작업을 단순 폐기한 뒤 재시도하면
되돌릴 수 없는 action을 중복 실행할 수 있다. 최소 구현에서는 그 작업을 취소하지 않고 pause 전에
완료한다. 그동안 경계는 active이고, `pause()`가 반환한 뒤에는 작업이 새로 커밋되지 않는다.
아직 실행하지 않은 sync/low 큐 항목은 이후 갱신 입구에서 차단한다.

이 완료는 전역 scheduler에 현재 parked된 한 작업을 대상으로 한다. 경계와 무관한 작업도 완료할 수
있으며 큰 트리에서는 입력 응답성을 떨어뜨린다. 단순 취소·재시작과 달리 effect 중복은 방지하지만,
즉시 숨기기를 보장하는 설계는 아니다.

## 검증

| 검증                                | 결과                                             |
| ----------------------------------- | ------------------------------------------------ |
| 실험 단위 테스트, base / concurrent | 각각 63/63, 9개 파일                             |
| 기본 runner 전체 회귀               | 255/255, core 및 parser/plugin 테스트 포함       |
| Concurrent 공유 core·전용 회귀      | 222/222, 실제 parked·queued render gate 2개 포함 |
| 기존 element, base / concurrent     | 82 통과·3 기존 concurrent 전용 skip / 85 통과    |
| Chromium, 두 코어·두 호스트         | 32/32, page JavaScript 오류 없음                 |
| TypeScript·수정 파일 ESLint·빌드    | 통과                                             |

새 단위 시나리오는 큐 대기 전후의 자식 renew, effect 억제·한 번 재개, 최신 부모 props·slot,
정상 sibling 갱신, 숨김 중 최종 제거·late renew, keyed 이동, 중첩 경계, portal 자식,
보존 루트의 opt-in 적용과 updater 내부 pause 거부를 검증한다.
Concurrent 전용 테스트는 zero slice와 제어한 task 실행으로 **실제로 parked된 작업**을 확인한다.
그 작업의 build effect가 이미 1회 실행된 상태에서 pause하고, commit 1회와 재개 시 최신 갱신 1회를 확인한다.

브라우저에서는 숨긴 일반 호스트와 Custom Element의 자식에 native renew를 100번 호출한다.
숨김 중 child updater/effect 수가 변하지 않고, 재개 시 최신 100을 표시한다.
기존 draft·undo·DOM identity·검색 경쟁·숨김 중 저장·활동 중단·DOM 이동·최종 제거 시나리오도 통과했다.

기본 `vite.config.js`의 테스트 제외 목록에 `experiments/`를 추가했다. 선택적 실험은 자체 설정으로
실행하며, 기본 Vitest runner가 Playwright spec을 수집하지 않도록 한다.

## 크기

기준·현재는 같은 Node v24.19.0/Vite 빌드이며 source map은 제외했다.
gzip level 9와 Node 기본 Brotli 설정을 사용했다. 전체 9개 산출물의 해시·raw·gzip·Brotli는
[SIZE_RESULTS_PHASE4.json](./SIZE_RESULTS_PHASE4.json)에 기록한다.

| UMD Brotli                  |  3단계 |  4단계 |     증가 |
| --------------------------- | -----: | -----: | -------: |
| base core                   | 4,758B | 4,859B | **101B** |
| concurrent core             | 6,385B | 6,502B | **117B** |
| 기존 helper                 | 1,879B | 1,879B |       0B |
| 선택적 실험 라이브러리 전체 | 1,582B | 2,045B |     463B |

base ESM/CJS Brotli 증가는 각각 89B/90B, concurrent ESM/CJS는 131B/132B다.
full 실험 라이브러리는 기존 소유권·작업·활동·호스트와 새 경계 어댑터를 모두 포함한다.
코어의 크기 증가와 선택적으로 쓰는 라이브러리 크기는 구분해야 한다.

## 성능 측정

현재·기준의 실제 ESM 빌드를 같은 Chromium 151.0.7922.173에서 실행한다. 일반 경로와 opt-in
경로는 별도 모듈 인스턴스로 로드해 어댑터 사용 이력이 일반 경로의 JIT에 섞이지 않게 한다.
3회 전체 warmup, 각 sample의 동일 트리 200회 warmup, 순서를 번갈아 바꾼 9회 중앙값을 사용한다.
측정 시 다른 테스트·빌드·벤치마크는 실행하지 않는다. 숫자는 합성 workload의 지역 측정이며
개선·무회귀·일반적인 비율을 보장하는 지표로 해석하지 않는다.

상세 sample과 중앙값은 [PERFORMANCE_RESULTS_PHASE4.json](./PERFORMANCE_RESULTS_PHASE4.json)에 기록한다.
16개 DOM 조상 아래 leaf renew 10,000회, 64개 자식이 있는 parent renew 2,000회를 비교한다.
경계 미사용, 경계가 전부 active인 경우, 무관한 별도 루트 하나가 paused인 경우를 각각 측정한다.

| 코어·갱신                 | 기준 ms | 현재 미사용 ms | 모두 active ms | 다른 루트 paused ms | paused 추가 비용¹ |
| ------------------------- | ------: | -------------: | -------------: | ------------------: | ----------------: |
| base leaf 10,000회        |    32.7 |           33.3 |           33.6 |                48.2 |            +44.7% |
| concurrent leaf 10,000회  |    42.6 |           41.6 |           43.3 |                63.1 |            +51.7% |
| base parent 2,000회       |   236.7 |          216.1 |          225.7 |               269.4 |            +24.7% |
| concurrent parent 2,000회 |   247.5 |          241.9 |          256.8 |               286.1 |            +18.3% |

¹ 같은 현재 코어의 경계 미사용 중앙값 대비. 현재 미사용과 기준의 차이는 -8.7%~+1.8%로,
이 측정에서 일관된 일반 경로 회귀는 보이지 않았다. 음수 차이를 최적화 효과로 단정하지 않는다.
모두 active인 경우는 같은 현재 코어 대비 +0.9%~+6.2%다.
다른 루트 하나가 paused일 때의 +18.3%~+51.7%는 조상 탐색 비용이 출시 전 개선 대상임을 보여 준다.
leaf에서는 10,000회 전체 추가 시간이 약 15~22ms지만, 반복이 많은 화면에서는 누적된다.

pause 시간은 내부 scheduler 관측만 추가한 별도 bundle로 측정한다. zero slice로 실제 parked 상태를
확인한 뒤 동기 pause를 재고, pause 전 commit 1회·숨김 중 저우선순위 갱신 차단·재개 1회를 함께 확인한다.
sample은 warmup 1회 이후 5회다. 상세 결과는 [PAUSE_RESULTS_PHASE4.json](./PAUSE_RESULTS_PHASE4.json)에 둔다.

| parked 트리 | pause 중앙값 | 5회 중 최대 |
| ----------- | -----------: | ----------: |
| 1,024행     |        4.8ms |       7.7ms |
| 8,192행     |       17.9ms |      42.4ms |

이 수치는 pause의 동기 호출 시간이며 일반 화면의 평균 숨기기 시간으로 볼 수 없다.
8,192행에서는 중앙값도 60Hz 한 프레임 예산을 넘는다. 재개·effect 정확성은 같은 측정에서 검증했지만
큰 parked 작업의 동기 완료는 응답성 측면에서 출시 전 개선해야 한다.

## 남은 제한과 판단

작은 코어 변경으로 독립 child renew와 parent diff를 중단하는 것은 가능하다.
출시 검토 전 다음 두 비용을 개선해야 한다.

1. 숨긴 경계가 있을 때 모든 갱신이 조상을 찾는 비용. 경계 소속을 효율적으로 전달·보관하되
   keyed 이동·중첩 경계·portal·Concurrent 커밋의 일관성을 유지하는 방식이 필요하다.
2. 큰 parked 작업을 pause 전에 동기 완료하는 지연. 이미 실행한 build action을 중복하지 않으면서
   안전하게 보류·폐기하는 정책은 별도 설계와 검증이 필요하다.

경계는 기존에 시작한 effect·타이머·요청을 자동 취소하지 않고, 임의 사용자 함수·직접 DOM 변경·직접
`reRender()` 호출도 제어하지 않는다. 활동 수명은 이전 단계의 명시적 scope를 사용한다.
portal은 자식 갱신·cleanup을 제어하지만 외부 host의 가시성은 호스트가 관리한다.
기존 코어의 portal root 제거 정책에 따라 외부 host의 DOM이 남는 것도 유지한다.
SSR은 호스트 shell만 확인했으며 hydration·다른 브라우저·실제 네트워크 API는 이번 검증 범위에 포함하지 않는다.

[실행 명령](../../experiments/closure-lifecycle/README.md#4단계--opt-in-자식-갱신-중단)과 계측 스크립트를
함께 저장했다. 1~3단계의 코어 무수정 브랜치는 그대로 유지한다.
