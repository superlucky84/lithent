# 성능 작업 마무리 — 2026-10-08

현재 구조에서의 성능 개선 작업을 마무리한다. 마지막 동일 VDOM 조기 반환 후보는 **채택하지 않았다**.
선택·교환·삭제의 JavaScript 시간은 줄었지만, 부분 갱신의 전체 시간은 두 실행 순서에서 모두
늘었다. 이번 자료로 안정적인 전체 성능 개선을 확인하지 못해 기존 경로를 유지한다.

이전 [생성 경로 최적화](./CREATION_PROFILE.md)는 유지한다. 최종 base는 이전 VDOM이 없는
노드의 타입 비교를 생략하며, 동일 VDOM 처리는 기존 `N` 판정 경로를 사용한다.
concurrent에도 이전 노드가 없는 경우의 타입 비교 생략만 적용돼 있다.

## 마지막 후보

base의 `makeNewWDomTree` 입구에서 `originalWDom?.type && newWDom === originalWDom`이면
`nr = 'N'`을 설정하고 즉시 반환하는 후보였다. 기존 캐시가 반환한 행 VDOM의 유형 판별과
일반화·상속 준비를 줄인다. empty 노드는 기존 삭제 판정으로 보내는 조건을 유지했다.

concurrent는 재개 가능한 작업 프레임과 commit 효과를 유지하며 기존 경로를 사용했다.
동일한 공개 동작 계약 테스트를 두 코어에 실행했고, 이 후보를 concurrent에 이식하거나
concurrent 성능 개선을 주장하지 않았다.

기준은 생성 경로 최적화를 포함한 미커밋 코어와 벤치 앱 `8839611`이다.
코어 HEAD는 `039cba6`이므로 HEAD만으로 측정 소스를 식별하면 안 된다.
정확한 소스·core·helper·앱 번들 SHA-256은 원본 JSON의 build 기록에 있다.

## 진단 및 공식 측정

진단은 현재 앱과 코어로 CPU 4배, 준비 6회, 12회 × 2라운드로 실행했다.
두 번째 라운드는 후보 순서를 뒤집었다. 각 칸은 24개 표본의 중앙값이며 페인트를 포함하지 않는다.

| 시나리오 | 현재 | 조기 반환 후보 |
| --- | ---: | ---: |
| 선택 | 1.750ms | 1.100ms |
| 부분 갱신 | 3.450ms | 2.900ms |
| 교환 | 1.750ms | 1.400ms |
| 1행 삭제 | 1.500ms | 1.200ms |
| 1,000행 생성 | 14.050ms | 15.250ms |

갱신 개선과 생성 악화 신호를 함께 확인하기 위해 공식 러너의 **9개 CPU 항목 전체**를 비교했다.
같은 앱·helper와 기존 Vite 5.4.21 프로덕션 설정을 사용했다.
준비 횟수·CPU throttling·GC·새 탭·trace·paint 계산은 변경하지 않았다.

Apple M4, 10코어, 24GB, 시스템 Chrome 154.0.8037.98 headless에서 실행했다.
선택은 코어당 25회, 나머지는 15회로 **290개 표본**이다.
첫 차수는 항목마다 현재 코어를 먼저 측정했다. 부분 갱신의 전체 시간 증가를 확인하려고
해당 항목만 후보 먼저 실행하는 순서로 각 15회 추가했다. 공식 표본 합계는 **320개**다.

첫 차수의 1분 load average는 2.38에서 시작했고 묶음 종료 기록은 약 2.3~6.9였다.
추가 차수는 10.62에서 시작했다. 전용 격리 머신이 아니므로 부하와 paint·프레임 타이밍의 오차가 남는다.

| 공식 항목 | 전체 현재 | 전체 후보 | JS 현재 | JS 후보 |
| --- | ---: | ---: | ---: | ---: |
| 01 1,000행 생성 | 28.479ms | 28.490ms | 9.216ms | 9.195ms |
| 02 1,000행 교체 | 32.946ms | 32.476ms | 12.729ms | 12.593ms |
| 03 부분 갱신, 첫 차수 | 19.057ms | 21.075ms | 6.312ms | 5.641ms |
| 04 선택 | 6.553ms | 6.076ms | 3.299ms | 2.596ms |
| 05 교환 | 19.313ms | 18.560ms | 4.054ms | 3.052ms |
| 06 1행 삭제 | 14.327ms | 13.298ms | 1.656ms | 1.123ms |
| 07 10,000행 생성 | 290.917ms | 295.329ms | 68.579ms | 69.007ms |
| 08 1,000행 추가 | 33.543ms | 32.648ms | 10.164ms | 9.477ms |
| 09 전체 삭제 | 13.400ms | 12.893ms | 10.802ms | 10.193ms |

선택·교환·삭제의 JS 중앙값은 약 21~32% 감소했다.
공식 1,000행 생성의 JS 차이는 약 -0.2%, 10,000행은 약 +0.6%로,
진단에서의 큰 생성 악화가 공식 조건에서 그대로 재현되지는 않았다.

하지만 부분 갱신의 전체 시간은 첫 차수에서 **약 +10.6%**, 순서를 뒤집은 차수에서도
**18.689 → 20.031ms, 약 +7.2%**였다. 두 차수의 30개씩을 합친 중앙값은
전체 **18.831 → 20.158ms**, JS **6.137 → 5.703ms**다.

첫 차수 9개 항목의 전체 시간 비율에 로컬 결과표 가중치를 적용하면 후보/현재는
**0.9921**(약 -0.8%)이다. 같은 방식의 JS 비율은 **0.9041**이다.
전체 시간의 작은 평균 이득만으로 부분 갱신의 증가를 무시하지 않는다.
가중치는 로컬 `webdriver-ts-results/src/Common.ts`에서 읽었고, 공개 공식 점수는 아니다.
추가 차수는 03만 측정했으므로 첫 차수의 가중 지표에 임의로 합쳐 계산하지 않았다.

환경 오차가 있어 전체 시간 증가의 원인을 조기 반환으로 확정하지는 않는다.
그래도 안정적인 개선을 확인하지 못했으므로 **후보를 되돌렸다**.
새 개선율을 이전 앱·생성 최적화 결과와 더하거나 과거 다른 프레임워크 결과와 섞지 않는다.

## 검증 및 최종 상태

- 후보에서 `pnpm test:dual`, `pnpm test`, core 빌드, 변경 파일 ESLint 통과.
- 후보에서 Playwright **52개 통과**: 이전 VDOM 회수, keyed DOM 정체성, concurrent scheduler 포함.
- A/B 양쪽 공식 keyed 검사와 9개 동작·폰트 검사 통과.
- 새 계약 테스트 3개를 base/concurrent 각각 실행했다. 캐시 출력 재사용 중 컴포넌트 실행과
  갱신 콜백, 변경 시 DOM 반영, frozen props 보존, 이동 후 자식 renew와 unmount,
  동일 객체가 empty로 바뀌는 삭제 동작을 검사한다.
- 후보 제거 후 두 코어의 계약 테스트를 다시 통과했고, 최종 core 빌드와 크기를 확인했다.
  최종 core 번들은 이번 A/B의 현재 코어 스냅샷과 SHA-256이 일치한다.
- 후보 base br는 **4,784B**(+21B), 최종은 **4,763 / 4,800B**(여유 **37B**)다.
  concurrent **6,249 / 9,000B**, element **998 / 1,000B**를 유지한다.

현재 성능 작업의 체크포인트는 완료다. 사용자의 요청으로 성능 수정과 이번 프로파일·검증 자료,
회귀 테스트를 이 문서를 포함한 체크포인트 커밋에 보존한다. 푸시·릴리스·등재 PR은 아직 하지 않았다.
추가 구조 변경이나 최적화 탐색은 별도 작업으로 다룬다.

## 원본과 재현

- [identity-results.json](./identity-results.json): 240개 진단 시간 표본과 공식 320개 표본,
  소스·번들 해시, 환경·검증 기록, 최종 `reject` 결정과 최종 소스 해시.
- [identity-evidence.json.gz](./identity-evidence.json.gz): 진단 번들 두 개와 프로덕션 빌드에
  사용한 앱·core·helper 스냅샷. 압축 파일의 해시는 결과의 `evidenceSHA256`에 있다.
- [core-cachedIdentity.test.tsx](../../src/tests/core-cachedIdentity.test.tsx): 캐시 동작 계약.
- [identity-summarize.mjs](./identity-summarize.mjs): 완결된 표본과 동일 앱·helper, 최종 소스 해시를
  확인한 뒤 원본을 압축 보존한다.

진단은 새 출력 경로에서 다음과 같이 재현한다.

```sh
LITHENT_AUDIT_OUT=/tmp/lithent-identity-rerun \
  LITHENT_AUDIT_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  node docs/benchmark/followup-audit.mjs measure base,identity select,update,swap,remove,create
```

공식 비교는 새 `LITHENT_PRODUCTION_OUT`에서 현재 dist를 `creation-prepare.mjs before`로 보존하고,
`followup-edits.mjs`의 identity 후보를 코어에 적용·빌드한 뒤 `after`로 보존한다.
`production-run.mjs verify lithent-before,lithent`를 통과한 뒤
`production-run.mjs cpu lithent-before,lithent`로 9개 항목을 측정한다.
측정 후 후보를 제거한다. 측정에 사용한 manifest의 HEAD·해시는 현재 상태로 덮어쓰지 않는다.
