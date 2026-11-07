# C3 같은 행 앱의 memo on/off

2026-10-22. [DC-12 격리 검증](./PARENT_MEMO_ISOLATION_RESULTS.md)에 이어
DESIGN DC-13의 기능 대조를 완료했다. 정본은
[REQUIREMENTS](../performance-improvement/REQUIREMENTS.md),
[DESIGN](../performance-improvement/DESIGN.md),
[IMPLEMENT](../performance-improvement/IMPLEMENT.md),
[수동 체크](../performance-improvement/MANUAL_TEST_CHECKLIST.md)다.
최신 체크포인트는 `d660fdf33578885c9534fec8040ef8b5602bbe23`이고
이번 DC-12/DC-13 후속 결과는 미커밋 작업 트리에 있다.

같은 행 앱에서 memo on은 가중 전체 시간 **−8.12%**, JS **−13.11%**였다.
생성/교체/10k 생성의 전체 시간은 약5% 증가했다. 공식 메모리는1k 생성
**+0.343MB(+8.37%)**, 10k 생성 **+3.231MB(+9.82%)**였다.
통제 앱의 이득과 비용을 확인했으며 **실험 유지·기본 채택 보류**다.

## 비교 대상과 같은 것

두 조건은 같은 isolated core, 같은 행 컴포넌트 앱, **바이트 단위로 같은 production JS**를
사용한다. HTML의 시작 설정 `window.__PARENT_MEMO__`만 false/true다.
`lithent-before`는 off, `lithent`는 on이다. off는 기존 default 원래 앱을 뜻하지 않는다.

모든 동작은 부모 Table을 renew한다. 각 RowView는 incoming `{row, selected, key}`를 받고
on만 setup에서 row identity/id/label/selected를 deps로 등록한다. mutable label과 selected를
값으로 비교한다. 이벤트는 동기화된 props를 읽는다. row 자체 renew, `cacheUpdate`, 수동
VDOM 캐시, benchmark 전용 코어 분기는 없다. **전체 parent 목록 순회는 양쪽에 남는다.**

이는 일반 RowView가 JSX를 반환하는 통제 앱의 기능 효과다. 이전 targeted 앱은 row 자체
renew와 helper 캐시를 사용했으며 여기서는 그 경로를 사용하지 않는다. 원래 cacheUpdate 앱,
다른 retained/cached 앱, React/Preact보다 빠르다는 결과로 해석하지 않는다. 이전 차수의
다른 앱 CPU 표본과 합산하지 않는다.

| 입력                   | SHA-256                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| 같은 Row 앱 source     | `04bc2c708d9b98f749c90543d5436990f946f886349de8c0c8d51da5cb2921fb` |
| 같은 isolated core ESM | `43b80396f380e345986581f59ce2a4cafc178946730179fde0450bda4d12d4f9` |
| 같은 production JS     | `e6782f64db2e0ed4bc2f215fb1af70dede7e28a144473456bd28a3b055e409b9` |
| off HTML               | `27716f8c9e30a6aad8a719097894141b0637a3ce1344cf1381d250ab29dca117` |
| on HTML                | `d833fb399f068146a78fe62d42489bdf1acac84f3045a3f6984a1db5328c89fd` |
| Chrome executable      | `6e156f2271cef44afce9db36a5b920e94518857b94a4160f082696f8c3bd1c9d` |
| Chrome engine          | `b1d0216b347be90a898e9961302916aa1dbf4659f96597ea836dd3eb149574b7` |

upstream 체크포인트는 `ecbff5f54b75244b89b0b14d34f11e32bca59345`다.
실제 CPU/메모리 launcher는 Node20.3.0, 앱 빌드/타입 검사는 pnpm의 Node22.13.0이다.

기본 source/산출물28개·package exports와 실제 sibling targeted 앱은 보존했다.
isolated source17개·세 번들은 앞선 C3와 같으며 알고리즘을 수정하지 않았다.
이전 격리 증거의251회귀(전용33 포함), dual1,070 passed/3 skipped, 실제 package/타입
결과는 같은 해시라 재사용했다. 기본 UMD br4,798B·별도 UMD br5,691B도 같다.
공개 subpath·별도 예산·버전/배포·채택을 추가하지 않았다.

## 새 앱의 정합성과 별도 작업량 진단

새 앱/source 타입 검사를 통과했다. production B3는 양쪽 contracts·공식 isKeyed·
9동작·glyph font를 통과했다. 선택 이동은 class 속성2개/childList0개, partial은 text100개/
childList0개다. 배칭2순서·재생성20회·선택 삭제/교체와 clear의 정확한 제거도 확인했다.
각 행이 독립 컴포넌트라 clear는1,000번의 제거 기록이며 기존 원래 앱의 bulk1회와 다르다.

같은 source를 별도 diagnostic 상수로 빌드했고 공식 production에서 instrumentation과
진단 interface가 제거됨을 검사했다. 세 fresh context씩의 실제 row updater 수는 다음과 같다.

| 동작                   | memo off | memo on |
| ---------------------- | -------: | ------: |
| create1k               |    1,000 |   1,000 |
| 변경 없는 부모 refresh |    1,000 |       0 |
| 첫 선택                |    1,000 |       1 |
| 선택 이동              |    1,000 |       2 |
| 매10행 label 변경      |    1,000 |     100 |
| 두 행 swap             |    1,000 |       0 |
| 선택 행 삭제 뒤        |      999 |       0 |

각 조건/차수에서 keyed DOM 정체성·label 값·배칭2순서와 선택 제거를 검증했다.
최종 full dispose 뒤 mount/unmount는1,000/1,000이고, 외부에 key1,000개를 유지한
GC 뒤 컴포넌트 등록과 관찰한 VDOM/host는 **6context 모두0개**다.
이 검사는 공식 CPU/메모리 점수가 아니다.

## 공식 CPU 전체9항목

고정 Chrome155.0.8059.85·Apple M4 Pro/12cores/24GB·Vite5.4.21과 기존 공식 runner를
사용한다. 실제 launcher/args/env는 evidence의 `commands/`에 기록한다.
warmup·GC·throttle·paint 계산을 바꾸지 않았다. 03/09는 실제 runner에서1,000행을 준비한다.
순서는01→09→03→05→04→06→02→08→07이며, 각 항목의 off/on 선후를 교대로 바꾸고
두 번째 차수는 모든 항목의 선후를 반대로 실행한다. 재빌드 없이 동일 산출물을 복사했다.
CPU 중 빌드·테스트·다른 benchmark를 병행하지 않았다.

선택25개/그 외15개씩, 두 앱×두 차수 **580표본**이다. 양수는 on이 느린 방향이다.
중앙값은 짝수일 때 가운데 둘의 평균, IQR은 중앙값을 제외한 양쪽 절반의 중앙값이다.
가중 전체는 고정 upstream Common.ts의9 CPU weights/가중 기하평균을 쓴다.
차수별·합산 전체/JS/paint 분포와 min/max도 raw에 보존한다.

| 공식 항목                |         off 전체 ms [IQR] |          on 전체 ms [IQR] | 전체 변화 | off JS ms | on JS ms | JS 변화 |
| ------------------------ | ------------------------: | ------------------------: | --------: | --------: | -------: | ------: |
| `01_run1k`               |    28.264 [28.006–29.069] |    29.743 [29.276–30.144] |    +5.23% |     8.843 |   10.459 | +18.28% |
| `02_replace1k`           |    32.299 [31.973–33.067] |    34.102 [33.471–34.547] |    +5.58% |    12.512 |   14.063 | +12.40% |
| `03_update10th1k_x16`    |    33.199 [32.647–33.509] |    27.218 [26.658–28.083] |   -18.02% |    19.261 |   13.626 | -29.26% |
| `04_select1k`            |    26.187 [25.274–27.167] |    15.066 [14.672–16.159] |   -42.47% |    21.188 |   10.815 | -48.96% |
| `05_swap1k`              |    36.558 [35.242–37.407] |    26.037 [25.688–26.494] |   -28.78% |    20.313 |   10.448 | -48.56% |
| `06_remove-one-1k`       |    21.798 [21.167–22.409] |    16.009 [15.574–16.342] |   -26.56% |     9.596 |    4.557 | -52.51% |
| `07_create10k`           | 300.250 [298.818–302.863] | 315.076 [309.773–318.632] |    +4.94% |    75.326 |   91.143 | +21.00% |
| `08_create1k-after1k_x2` |    38.113 [37.460–39.068] |    37.849 [36.666–39.389] |    -0.69% |    14.024 |   12.852 |  -8.35% |
| `09_clear1k_x8`          |    17.438 [16.495–17.991] |    16.928 [15.862–18.915] |    -2.93% |    14.841 |   14.424 |  -2.81% |

| 차수    | 시작→종료 UTC     | 표본 | 전체 가중 변화 | JS 가중 변화 | 시작→종료 1분 load |
| ------- | ----------------- | ---: | -------------: | -----------: | -----------------: |
| main    | 05:12:12→05:20:00 |  290 |         -8.56% |      -13.39% |          3.52→2.48 |
| reverse | 05:30:06→05:37:52 |  290 |         -8.39% |      -12.66% |          2.99→6.25 |
| 합산    | 두 차수           |  580 |         -8.12% |      -13.11% |    배치별 값은 raw |

CPU 두 차수는 모두 완료했으며 **실패0·재시도0**다. 가중 전체는 각각−8.56%/−8.39%로
두 차수 모두 개선 방향이다. 생성·교체·10k 생성의 전체 시간은 약5% 늘었고
선택·부분 갱신·교환·행 삭제는 줄었다. 개별 손해를 포함한 전체 교환으로 평가한다.
동일 해시여도 시간·시스템 부하가 교란 요인이며 p-value/신뢰구간 검정은 하지 않았다.

## 공식 메모리5항목

공식 runner의21/22/23/25/26 항목을 앱·항목·차수당3개, 양순서 **60표본**으로 측정한다.
단위는 runner 표시 MB(bytes/1024²)다. 표본이 적으므로 미세한 차이는 확정하지 않는다.
아래 공식 MB와 다음 절의 CDP heap/DOM/listener를 같은 값으로 섞지 않는다.

로컬 upstream은23/26의 시나리오 객체를 export하지만 메타데이터와 실행 목록에서
비활성화하고 있었다. 첫 측정은21/22의12개 유효 표본 뒤23 진입에서 중단됐다.
실행 목록만 복원한 시도는 빠진 메타데이터 때문에 측정 전에 실패했다. 두 로그와
당시 runner를 보존했다. `official-memory.mjs`는 공식 주석의 메타데이터와 기존
시나리오 객체만 측정 프로세스 안에서 등록하고5항목의 유일성을 사전 검사했다.
시나리오/GC/메모리API·sibling 소스/빌드는 바꾸지 않았다. 동일21/22의12표본은
resume으로 유지한다. CPU 실행 당시의 runner와 현재의 차이가 memory 전용 등록
블록뿐인지도 감사한다. 이 등록 오류2회와 실제 측정 배치 실패/재시도를 구분한다.

| 공식 항목             |           off MB [IQR] |            on MB [IQR] | 차이 MB |   변화 |
| --------------------- | ---------------------: | ---------------------: | ------: | -----: |
| `21_ready-memory`     |    0.649 [0.644–0.651] |    0.651 [0.643–0.651] |  +0.002 | +0.30% |
| `22_run-memory`       |    4.094 [4.088–4.095] |    4.437 [4.432–4.442] |  +0.343 | +8.37% |
| `23_update5-memory`   |    4.249 [4.174–4.276] |    4.560 [4.517–4.561] |  +0.311 | +7.32% |
| `25_run-clear-memory` |    0.952 [0.927–0.954] |    1.028 [1.026–1.032] |  +0.076 | +7.97% |
| `26_run-10k-memory`   | 32.894 [32.849–32.900] | 36.125 [36.067–36.136] |  +3.231 | +9.82% |

메모리 두 차수60표본을 완료했다. 실제 측정 배치의 실패/재시도는0이며, 앞서 설명한
등록/메타데이터 오류2회는 별도 보존했다. 첫 차수는05:38:28 시작,06:05:09 성공 재개,
06:09:06 종료였고, 반대 차수는06:09:12→06:15:34 UTC다. 원래12표본의 완전 일치를
검사했다. 작은 Ready 차이를 확정하지 않으며 시간 간격·부하·소표본 한계를 남긴다.

## production100회 churn과 full dispose의 경계

기존 production retention harness로 각 조건3 fresh context에서 생성/clear100회,
그 뒤1k 목록의 partial100회와 최종 clear를 수행한다. 각 단계에서 GC를 두 번 요청하고
DOM node·listener·JSHeapUsedSize를 기록한다. 이 검사는 root App/Table과 정적 버튼을
계속 mount한 상태다. full root dispose는 위의 별도 diagnostic6context 결과다.

| 조건/차수 | 5회 clear heap MB | 25회 clear | 100회 clear | partial100/clear 뒤 | 5→100 DOM/listener 증가 |
| --------- | ----------------: | ---------: | ----------: | ------------------: | ----------------------: |
| off/1     |             2.103 |      2.116 |       2.131 |               2.156 |                   0 / 0 |
| on/1      |             2.187 |      2.371 |       2.386 |               2.430 |                   0 / 0 |
| on/2      |             2.187 |      2.371 |       2.386 |               2.429 |                   0 / 0 |
| off/2     |             2.103 |      2.115 |       2.131 |               2.156 |                   0 / 0 |
| off/3     |             2.103 |      2.119 |       2.130 |               2.157 |                   0 / 0 |
| on/3      |             2.185 |      2.371 |       2.385 |               2.429 |                   0 / 0 |

6context 모두5→100회 clear와 partial100회 뒤 clear의 DOM/listener 증가는0개다.
heap은 on에서5→25회 약0.18MB 증가 후25→100회 약0.015MB 증가했다.
off의25→100회 증가도 약0.015MB였다. 추가 heap의 원인은 아직 귀속하지 못했다.
전체 heap이0으로 회수되었다거나 모든 누수가 없다고 판단하지 않는다.
별도 full dispose의 관찰한 VDOM/host0개와 이 root-mounted 진단을 구분한다.

부분 갱신의 label 문자열과 현재 DOM/data 증가를 곧바로 참조 누수로 해석하지 않는다.
clear 뒤의 잔류와 반복 차수의 추세를 같이 본다. 이 bounded 관찰만으로 모든 예외·사용
패턴의 누수 부재를 보장하지 않는다.

## 전송량·증거·다음 단계

| 조건/파일                 |  raw B | gzip B | brotli B |
| ------------------------- | -----: | -----: | -------: |
| lithent-before/main.js    | 17,597 |  7,189 |    6,604 |
| lithent-before/index.html |    337 |    242 |      157 |
| lithent/main.js           | 17,597 |  7,189 |    6,604 |
| lithent/index.html        |    336 |    240 |      158 |

크기는 Node20.3/zlib1.2.13.1-motley, gzip level9 기준이다.
재현 도구의 자동 타입 검사와 runner snapshot을 새 staging에서 재실행했고,
측정한 source/core/production JS/HTML과 새 빌드의 해시가 모두 일치했다.

두 조건의 JS 크기는 같다. 별도 renderer 자체의 UMD br5,691B는 기본보다893B 증가,
기존4,800B 한도보다891B 초과다. 이번 on/off 대조는 그 전송량 비용을 줄이는 실험이 아니다.
기본 renderer를 선택한 앱의 source/bundle/exports에는 추가 bytes/분기가 없다.

[실험 도구](../../experiments/parent-memo-optin/README.md),
[raw 결과](./parent-memo-optin-results.json),
[압축 증거](./parent-memo-optin-evidence.json.gz)에 연결한다.

압축 증거 **346파일/2,330,654B**, SHA-256
`adf4f6dd3893ff4f6b3587449c2142c5431d0964324e5cba2793cc8deabe2dbc`. 내부에 이전 격리 증거367파일도 중첩 보존했다.
CPU 당시 runner·등록 오류2회·resume·메모리 사전 등록·새 재현 빌드 결과를 포함한다.

전 raw 표본, source/build/types, runner/lock/명령/로그를 보존하며 재사용한 격리 증거도
압축 증거 안에 포함한다. 정상 trace는 전체 파일명/크기/SHA inventory와 각 앱/CPU 차수의
선택 trace index0 **4개**만 내용을 영구 보존한다. 다른 정상 trace 내용은 임시 출력에 있다.
실패가 있으면 실패한 시도는 전부 보존한다. Chrome 바이너리 자체는 포함하지 않는다.
초기 prepare의 sandbox config-temp 쓰기 실패 로그도 남겼고 해당 시도는 측정하지 않았다.

최종 감사: 변경 파일 ESLint/Prettier·`git diff --check`, 증거346파일과 중첩된 이전367파일의
SHA-256, 기본28파일·로컬 링크150개·독립 Python 집계의 일치를 확인했다.

**판정: 실험 유지·기본 채택 보류.** 일반적인 RowView의 부모 재실행을 줄이는 효과는
두 CPU 차수에서 확인했다. 생성/메모리 비용과 추가 heap의 미귀속 원인, 별도 렌더러
크기, 원래 캐시 앱과의 동차수 비교가 남아 있다. 개별 손해 하나로 기각한 것은 아니다.
다음은 **heap 잔류 원인 분석과 실제 cacheUpdate/원래 앱의 같은 차수 대조**다.
C1/C2/C4를 결합하지 않고 기능/앱 구조/렌더러 효과를 각각 비교한다.

전체 React/Preact peers, concurrent 새 hook, 공개 API/크기 예산, 최종 B4/Test Hardening/
Integration과 RC-5/IC-1의 최종 목표 기준은 미완료다. 이번 통제 앱의 기능 결과만으로
전 항목 목표 달성이나 upstream 리뷰 통과를 선언하지 않는다.
