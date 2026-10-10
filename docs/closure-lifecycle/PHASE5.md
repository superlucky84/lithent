# 5단계 — 기본 코어를 보존하는 Concurrent 전용 경계

- 작성일: 2026-10-10
- 브랜치: `experiment/closure-lifecycle-concurrent`
- 출발: 양쪽 코어의 경계를 검증한 4단계 `5a6efb2a58f356c4895592b376ce8c4b3d0a6bc4`
- 원본 비교: 코어 무수정 3단계 `925b4aa98c40ca20b309ea2613cc625d260fa5b1`
- 상태: **Concurrent 전용 opt-in 프로토타입. 기본 코어의 소스·타입·번들 복원 검증. 공개 API 미출하.**

## 판단

기본 코어의 성능을 우선하려면 이 분리가 적절하다. 서브트리의 자식 renew와 부모 diff를 멈추는
갱신 경계만 Concurrent가 제공하고, 기본 코어는 기존 갱신 경로를 유지한다.
소유권·최신 요청·ActivityScope와 명시적인 보존 루트는 기존처럼 두 코어에서 사용할 수 있다.

기본 `src/`는 3단계와 diff가 없고, 재빌드한 ESM·CJS·UMD 세 파일은 원본 SHA-256과 모두 같다.
공유 `ComponentMap` 타입도 원래 WeakMap 타입으로 돌아왔다. 따라서 기본 코어의 크기 증가와
갱신 경로에 추가한 검사 비용은 **0**이다. 이 판단의 근거는 벤치마크의 작은 차이가 아니라 코드·번들의 동일성이다.

Concurrent에 남은 부모 탐색·동기 pause 비용은 별도 개선 대상이다.
이 분리는 기본 코어를 보호하며, Concurrent 경계 자체의 성능 문제를 해결하지는 않는다.

## 구조와 지원 범위

[`lithentConcurrent/src/renderGate.ts`](../../lithentConcurrent/src/renderGate.ts)가
Concurrent 런타임의 componentMap에만 내부 프로토콜을 설치한다.
Concurrent의 wDom·diff·scheduler는 같은 전용 객체를 사용한다. 공통 universalRef나 공통 타입에는
프로토콜을 추가하지 않는다. 전용 파일끼리 상대 import하므로 기존 alias table도 바꾸지 않는다.
기존 코어의 exports와 패키지 설정을 유지한다.

| 기능                                         | 기본   | Concurrent                    |
| -------------------------------------------- | ------ | ----------------------------- |
| OwnerScope·최신 요청·ActivityScope           | 지원   | 지원                          |
| 명시적 보존 루트·일반 호스트·Custom Element  | 지원   | 지원                          |
| 관리된 루트 renew의 숨김 중 억제             | 지원   | 지원                          |
| 독립 자식 native renew·부모 diff의 경계 동결 | 미지원 | `freezeChildren: true`로 선택 |

[`renderProtocol.ts`](../../experiments/closure-lifecycle/src/renderProtocol.ts)는
실험 어댑터가 내부 capability를 읽는 작은 연결부다. `supportsRenderBoundary()`로 지원을 확인할 수 있다.
기본에서 true 옵션을 요청하면 createRetainedView/createRetainedHost 생성 시 오류를 던진다.
편집기 초기화·DOM 삽입·비동기 mount를 시작하지 않으며 지원이 되는 것처럼 조용히 넘어가지 않는다.
false가 기본값이고, 일반 보존 루트는 기본 코어에서도 정상 작동한다.

```ts
const Editor = createRetainedHost(initialize); // 두 코어의 명시적 보존 루트

// Concurrent lifecycle 런타임을 선택한 호스트만 전체 자식 갱신을 중단한다.
const FrozenEditor = createRetainedHost(initialize, console.error, {
  freezeChildren: true,
});
```

실제 시연은 기본에서 false, Concurrent에서 true로 연결한다. 별도 빌드의 종류와 capability를
모두 확인해 잘못된 코어를 로드하면 즉시 실패한다.
기본 시연의 숨긴 자식은 native renew를 계속할 수 있으며, 이를 브라우저 테스트에서도 명시적으로 검증한다.

## 검증

| 검증                                                       | 결과                                          |
| ---------------------------------------------------------- | --------------------------------------------- |
| 기본 코어 소스·타입                                        | 3단계 `src/`와 diff 없음                      |
| 기본 재빌드 산출물                                         | ESM·CJS·UMD 원본 해시 일치                    |
| 실험 테스트                                                | 기본 56/56, Concurrent 65/65                  |
| 기본 전체 회귀 / Concurrent 공유·전용 회귀                 | 255/255 / 222/222                             |
| 기존 element                                               | 기본 82 통과·기존 3 skip / Concurrent 85 통과 |
| Chromium 두 코어·두 호스트                                 | 32/32, page JavaScript 오류 없음              |
| TypeScript·수정 파일 ESLint·코어/라이브러리/demo/계측 빌드 | 통과                                          |

기본에서 unsupported 옵션을 초기화 전에 거부하는 검증을 추가했다.
경계의 9개 시나리오는 Concurrent 전용 파일로 옮겨 해당 runner에서 모두 실행한다.
기본 runner는 이 전용 파일을 제외하고 공통 기능·기본 capability의 미지원을 검사한다.
Concurrent에서는 큐 대기, 실제 parked 작업, 부모 props·slot, keyed 이동, 중첩 경계, portal,
unmount·늦은 renew·effect 한 번 재개까지 이전 검증을 유지한다.

브라우저의 숨긴 native 자식에 renew를 100번 호출하면 기본에서는 갱신/effect가 1회 실행되고,
Concurrent에서는 0회다. 재개하면 둘 다 최신 100을 표시한다.
draft·undo·DOM 보존, 활동 자원, 검색 경쟁, 숨김 중 저장, DOM 이동과 최종 제거도 확인했다.

## 크기

Node v24.19.0, 같은 Vite 빌드, source map 제외, gzip level 9와 Node 기본 Brotli 설정이다.
모든 포맷과 해시는 [SIZE_RESULTS_PHASE5.json](./SIZE_RESULTS_PHASE5.json)에 기록한다.

| UMD Brotli                  | 원본 3단계 | 4단계 양쪽 코어 |       5단계 Concurrent 전용 |
| --------------------------- | ---------: | --------------: | --------------------------: |
| 기본 코어                   |     4,758B |          4,859B |            **4,758B (+0B)** |
| Concurrent 코어             |     6,385B |          6,502B | **6,493B (+108B, 약 1.7%)** |
| 기존 helper                 |     1,879B |          1,879B |                      1,879B |
| 선택적 실험 라이브러리 전체 |     1,582B |          2,045B |                      2,114B |

Concurrent ESM/CJS의 Brotli 증가는 각각 119B/120B다.
실험 라이브러리는 소유권·요청·활동·호스트·capability 확인을 모두 포함하며 선택적으로 로드한다.
`measure-core.mjs --concurrent-only`는 기본 source, 기본 번들 또는 기존 helper/element/패키지 설정이
변하면 실패하므로 분리 조건을 재현 과정에서도 확인할 수 있다.

## 성능과 남은 제한

[PERFORMANCE_RESULTS_PHASE5.json](./PERFORMANCE_RESULTS_PHASE5.json)은 4단계와 같은 두 workload를
새 빌드에서 측정한 결과다. 기본에는 지원하지 않는 경계 variant를 만들지 않는다.
각 모듈 인스턴스를 분리하고, 3회 전체 warmup·sample당 200회 warmup·순서를 번갈아 바꾼
9회 중앙값으로 비교한다. 다른 테스트·빌드·벤치마크와 동시에 실행하지 않는다.
기본 비교의 작은 시간 차이는 동일 코드의 실행 변동이며 기능 비용으로 해석하지 않는다.

| Concurrent workload               |    원본 | 일반 갱신 | 활성 경계 | 다른 경계 중단 | 일반 대비 중단 비용 |
| --------------------------------- | ------: | --------: | --------: | -------------: | ------------------: |
| 16 DOM 깊이의 leaf renew 10,000회 |  41.3ms |    40.7ms |    40.2ms |         54.8ms |              +34.6% |
| 자식 64개의 parent renew 2,000회  | 251.6ms |   252.7ms |   256.6ms |        297.0ms |              +17.5% |

일반 갱신과 활성 경계의 작은 차이는 이 측정에서 유의미한 개선·회귀로 단정하지 않는다.
반면 다른 경계가 중단된 경우의 탐색 비용은 두 workload에 모두 남아 있다.

Concurrent에서 경계가 하나라도 숨겨지면 여전히 다른 루트의 갱신에서도 부모를 탐색한다.
이미 시작한 작업은 effect 중복을 방지하기 위해 pause 전에 동기 완료한다.
실제 parked 작업과 effect·재개 정확성을 함께 검사한 pause 시간은
[PAUSE_RESULTS_PHASE5.json](./PAUSE_RESULTS_PHASE5.json)에 기록한다.

| 실제 parked 트리 | pause 중앙값 | 5개 표본의 최댓값 |
| ---------------- | -----------: | ----------------: |
| 1,024개 li       |        3.0ms |            40.4ms |
| 8,192개 li       |       20.9ms |            29.1ms |

pause에서 이전 작업이 정확히 한 번 commit되고, 중단 중 low 갱신은 실행되지 않으며,
재개 시 최신 모델이 한 번 반영됨을 시간 측정과 함께 검증한다.
표본은 로컬 합성 작업의 잔여량과 실행 변동을 포함하며 최악 시간의 상한이 아니다.

큰 parked 트리의 동기 완료는 응답성을 떨어뜨릴 수 있다. 경계 소속 전달을 통한 탐색 감소와
안전한 작업 보류 정책은 다음 개선 대상이다. Concurrent를 선택했다는 이유만으로 이 비용을
허용 가능한 수준이라고 단정하지 않는다. 임의 타이머·직접 DOM 변경의 중단은 계속 명시적 scope의 책임이다.

실행은 [5단계 재현 명령](../../experiments/closure-lifecycle/README.md#5단계--concurrent-전용-경계)을 사용한다.
코어 무수정 1~3단계와 양쪽 코어를 비교한 4단계 브랜치는 그대로 보관한다.
