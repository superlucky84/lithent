# 3단계 — 일반 호스트·Custom Element 시연과 브라우저 검증

- 작성일: 2026-10-10
- 브랜치: `experiment/closure-lifecycle`
- 기준 커밋: `e09902f4586df76c4f3a68933d910231c7de9cd5`
- 상태: **호스트 연결 프로토타입 및 Chromium 검증 완료. 공개 API 미출하.**

## 결과

같은 편집기 초기화 함수를 일반 Lithent 호스트와 기존 `defineElement`에 연결할 수 있다.
각 호스트는 독립된 편집 인스턴스를 가지며, 숨겼다가 다시 열 때 그 인스턴스·클로저·DOM을 유지한다.
검색은 활동 수명에, 저장은 인스턴스 수명에 연결한다. 기존 코어·helper·element는 수정하지 않았다.

보존 정책은 **연결된 호스트를 유지한 채 `active=false`로 숨기기**다.
실제 Custom Element 제거는 기존처럼 마이크로태스크에서 폐기하며, 이후 다시 연결하면 새 인스턴스다.
같은 태스크의 DOM 이동은 기존 인스턴스와 진행 중인 활동을 유지한다.

## 구현 위치

- [`host.ts`](../../experiments/closure-lifecycle/src/host.ts): `createRetainedHost(initialize, reportCleanupError?)`.
- [`demo/`](../../experiments/closure-lifecycle/demo): 공통 편집기, 일반 호스트, 기존 element 어댑터와 수명 계수.
- [`browser/hosts.spec.ts`](../../experiments/closure-lifecycle/browser/hosts.spec.ts): 같은 시나리오를 두 코어·두 호스트에서 실행.
- [시연·테스트 실행 명령](../../experiments/closure-lifecycle/README.md#3단계--호스트-연결과-시연).

호스트는 `mount` 컴포넌트다. 빈 DOM 슬롯을 커밋한 뒤 마운트 큐가 끝나는 마이크로태스크에
별도 보존 루트를 만든다. 그 전에 호스트가 제거되면 편집기 초기화와 활동 생성은 실행하지 않는다.
`useOwnerScope`로 바깥 호스트에 정리를 연결하고 `owner.own(view.dispose)`로 내부 루트를 소유한다.
정리 실패는 reporter로 전달해 바깥 호스트 제거를 계속한다. 사용자 reporter는 예외를 던지지 않아야 한다.

`active`의 기본값은 false이며, Boolean true만 활성화한다. prop 변경은 기존 `updateCallback`의
반환 함수를 통해 DOM 커밋 후 show/hide에 연결한다. 동일한 상태 적용은 자원을 다시 만들지 않는다.
코어는 의존성 평가를 업데이터 전에 수행하므로, 이 어댑터는 각 호스트 커밋에서 최신 active를 확인한다.
일반 컴포넌트의 갱신 경로에 추가 체크를 넣지 않는다.

SSR은 빈 호스트 `<div></div>`만 생성하며 내부 편집기를 초기화하지 않는다.
브라우저 초기화는 마운트 확정 뒤 실행한다. 편집기 서버 마크업 생성과 hydration 연동은 이번 구현에 포함하지 않는다.

## 사용 예시

```ts
import { h, render } from 'lithent';
import { defineElement } from 'lithent/element';
import { createRetainedHost } from '../../experiments/closure-lifecycle/src';

const Editor = createRetainedHost(renew => {
  let draft = '';
  return () =>
    h('input', {
      value: draft,
      onInput: (event: Event) => {
        draft = (event.target as HTMLInputElement).value;
        renew();
      },
    });
});

const destroy = render(
  h(Editor, { active: true }),
  document.querySelector<HTMLElement>('#plain')!
);
const Constructor = defineElement('retained-editor', Editor, {
  props: { active: Boolean },
})!;
const element = new Constructor();
element.active = true;
document.body.appendChild(element);
element.active = false; // DOM 연결 유지, 인스턴스·draft 보존
element.active = true;
// 최종 폐기: destroy(); element.remove();
```

`active` property 설정은 속성에 반영하지 않는 기존 element 계약을 따른다.
HTML Boolean 속성은 존재 여부로 해석하므로 숨기려면 property를 false로 설정하거나 속성을 제거한다.
`active="false"`는 활성 상태다. 일반 호스트에서는 부모가 active prop을 변경한다.

## 시연 범위

요청은 로컬 타이머로 모의한다. 느린 검색 A는 900 ms 뒤 완료하며 취소를 무시한다.
빠른 검색 B는 80 ms, 저장은 500 ms다. 취소된 A가 완료돼도 B나 재활성화한 화면을 덮지 않는다.
서버 저장의 롤백이나 실제 네트워크 취소를 검증한 결과로 해석하지 않는다.

활동 중 250 ms 타이머와 외부 알림 구독을 유지한다. 숨김 중에는 두 자원을 정리한다.
재활성화에는 새 활동에서 외부 상태의 최신 값을 읽고 구독을 다시 연결한다.
저장 결과는 숨김 중 모델에 반영하고, 다시 열 때 화면에 표시한다. 저장을 다시 실행하지 않는다.
search pending 초기화는 편집기의 `onActive`에 명시적으로 둔다.

2단계의 지원 경계는 그대로다. 내부 화면은 제공한 관리 갱신을 사용한다.
임의 자식의 독립 renew·기존 effect·portal·중단된 concurrent build까지 자동으로 제어하지 않는다.
일반 서브트리 중단에는 별도 코어 연동이 필요하다.

## 검증 결과

Node `v24.19.0`, Playwright `1.63.0`, headless Chromium `151.0.7922.173`.
기본 Playwright 브라우저 대신 설치된 `/usr/bin/chromium`을 선택했다.

| 항목                                      | 결과                                                       |
| ----------------------------------------- | ---------------------------------------------------------- |
| base 실험 단위 테스트                     | 54/54 PASS, 8개 파일                                       |
| concurrent 실험 단위 테스트               | 동일한 54/54 PASS, 8개 파일                                |
| Chromium 브라우저 테스트                  | base 14/14 + concurrent 14/14, 총 28 PASS                  |
| 기존 element 회귀 테스트                  | base 82 PASS + 3 SKIP, concurrent 85 PASS                  |
| TypeScript / ESLint                       | PASS                                                       |
| 선택형 실험 라이브러리 빌드               | ESM/CJS/UMD PASS                                           |
| 시연 빌드                                 | base·concurrent PASS                                       |
| 빌드한 base 시연의 실행·화면 확인         | 페이지 오류 0, 데스크톱·390 px 모바일 확인, 가로 넘침 없음 |
| 기존 코어·helper 산출물 SHA-256           | ESM/CJS/UMD 9개 모두 기준과 동일                           |
| 코어·helper·element·공개 패키지 설정 diff | 0                                                          |

base의 3개 skip은 기존 스위트가 concurrent에서만 실행하는 deferred render 항목이다.
실험에는 2단계 49개에 호스트 4개와 SSR 1개를 추가했다.
커밋 전 생성 방지, 호스트 prop 변경, 정리 오류 격리, element 이동·제거·재연결을 단위 테스트로 확인했다.

브라우저에서는 초안·undo·DOM 동일성, 취소를 무시한 늦은 결과, 활동 세대와 pending 초기화,
숨김 중 저장 완료·draw 중단, 반복 활동 구독·폴링, 외부 상태 재연결, 영구 제거 후 늦은 결과,
element 속성·프로퍼티 및 같은 태스크 이동을 검증했다. 각 테스트는 실제 로드한 코어도 확인하며
페이지 JavaScript 오류가 있으면 실패한다.
전체 저장소 회귀 스위트, Firefox·WebKit, 포커스·선택 영역·미디어 및 실제 서비스 API는 실행하지 않았다.

## 크기

source map 제외, gzip level 9, Node 기본 Brotli 설정. 선택형 라이브러리는 `lithent` external이다.

| 산출물          | raw (B) | gzip (B) | Brotli (B) | 2단계 대비 Brotli |
| --------------- | ------: | -------: | ---------: | ----------------: |
| base UMD        |  12,966 |    5,142 |      4,758 |               0 B |
| concurrent UMD  |  17,045 |    6,906 |      6,385 |               0 B |
| 기존 helper UMD |   6,145 |    2,134 |      1,879 |               0 B |
| 실험 UMD        |   4,251 |    1,769 |      1,582 |            +114 B |
| 실험 CJS        |   4,048 |    1,647 |      1,489 |            +118 B |
| 실험 ESM        |   6,651 |    1,990 |      1,778 |            +132 B |

**기존 코어 파일 증가는 0 B**, 호스트 어댑터를 추가한 전체 실험 UMD 증가는 Brotli **114 B**다.
base UMD와 실험 UMD를 각각 Brotli로 전송하면 합계는 **6,340 B**다.

시연 앱은 코어·기존 element·실험·편집기·모의 요청·계수 UI를 함께 번들링한다.
base 시연 JS는 Brotli 8,621 B, concurrent는 10,135 B다.
HTML·CSS까지 각각 압축해 합산하면 base 10,251 B, concurrent 11,766 B다.
이는 시연 앱 전체 비용이며 라이브러리의 추가 비용과 구분한다.
해시와 전체 수치는 [SIZE_RESULTS_PHASE3.json](./SIZE_RESULTS_PHASE3.json)에 기록했다.

## 후속 검증

일반 서브트리 중단이 필요하면 자식 renew, 부모 diff, effect와 concurrent commit을 함께 제어하는
코어 연동 후보를 별도 실험으로 비교한다. 현재 호스트 어댑터로 가능한 범위와 코어 추가 비용을 분리해서 평가한다.
state-ref/query 연결과 장기 DOM 분리 보존 정책도 별도로 설계한다.
