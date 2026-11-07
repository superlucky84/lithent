# C3 별도 렌더러 격리와 비참여 앱 비용

2026-10-22. C3 프로토타입을 영문 커밋
`d660fdf33578885c9534fec8040ef8b5602bbe23`
(`perf: preserve C3 parent memo prototype evaluation`)에 보존한 뒤
DESIGN DC-12의 첫 격리 후보를 검증했다. 정본은
[REQUIREMENTS](../performance-improvement/REQUIREMENTS.md),
[DESIGN DC-12](../performance-improvement/DESIGN.md#dc-12--별도-렌더러로-기능을-격리하는-첫-후보),
[IMPLEMENT](../performance-improvement/IMPLEMENT.md),
[수동 체크](../performance-improvement/MANUAL_TEST_CHECKLIST.md)다.

**격리는 검증했으며 기본 runtime과 exports는 보존했다.** 비참여 원래 앱의 공식 CPU
580표본은 합산 가중 전체 **+0.10%**, JS **+0.32%**였다. 차수별 전체는
+0.48%/−0.45%로 방향이 달라 **작은 차이의 의미는 불확실**하다. 기능 이득을
입증한 결과가 아니며 **기본 채택 보류·실험 유지**다.

## 격리 방식과 계약

기본 core의 source/bundle/package exports를 수정하지 않고, 이전
[C3 증거](./parent-memo-evidence.json.gz)의 검증된 source 17개를 새 staging에
복원해 빌드했다. 세 런타임 형식은 이전 후보와 바이트 단위로 일치한다.
알고리즘을 바꾸거나 C1과 결합하지 않았다. 기본 source/산출물 28개와
package.json은 체크포인트와 동일하다.

실험 진입점은 staging의 private package `lithent-parent-memo-experiment`다.
자체 componentMap/Fragment/queue가 있으므로 앱·JSX/helper의 core import를
같은 렌더러로 alias해야 한다. default mount 안에서 isolated hook을 섞는
조합은 setup 오류로 실패한다. ESM/CommonJS 각각의 실제 render/self renew/
dispose와 package self-reference, NodeNext의 `.mts`/`.cts` consumer를 통과했다.
공개 subpath·새 크기 예산·배포를 추가한 것은 아니다.

이전 C3의 incoming deps·복사/Object.is·props key 무효화·nonempty slot fallback,
self 우회·hit callback 생략과 성공 후 memo 게시 계약이 그대로 적용된다.
base의 실패한 전체 parent tree/hook cursor를 자동 롤백하는 기능은 없으며
관련 제한은 [첫 C3 보고서](./PARENT_MEMO_RESULTS.md)에 보존한다.

## 동작과 기준 검사

- staging alias 회귀 **251 passed / 53 files**: 기존 공유 core 218개와 C3 전용 33개.
  기본 runner 409개 전체를 staging에서 돌렸다는 뜻은 아니다.
- 기존 `pnpm test:dual` **1,070 passed·3 skipped / 13 runners**. baseline 테스트이며
  concurrent의 새 memo 기능을 검증한 결과는 아니다.
- staged source·실험 TypeScript, 실제 ESM/CommonJS·consumer 선언과 concurrent
  named import의 의도된 ESM missing export/TS2305 실패를 확인했다.
- 같은 1k 입력 UI를 baseline/isolated 비사용/isolated opt-in 각 3context에서 검증했다.
  변경 없는 부모 refresh는 자식 updater **1,000→0회**, 하나의 props 변경은
  **1,000→1회**였다. 자체 갱신·DOM/state/focus·이동·삭제를 확인했다.
  key 1,000개를 유지한 dispose/GC 뒤 등록·관찰한 VDOM/host는 9context 모두 0개다.
  작업량·한정 회수 검사이며 공식 시간/전체 heap 개선율이 아니다.
- 원래 앱 B3 양쪽 contracts·공식 keyed·9동작·폰트를 통과했다.
  선택은 class 속성 2개·childList 0개, 부분 갱신은 text 100개·childList 0개,
  clear는 1회에 1,000개 제거다. 배칭 2순서·재생성 20회도 통과했다.
- 기본 size gate는 base **4,798/4,800B**, concurrent **6,903/9,000B**,
  element **998/1,000B**로 보존됐다.
- 변경 파일 ESLint/Prettier·`git diff --check`, 압축 증거367개 파일의 SHA-256,
  기본28파일과 로컬 링크141개 검사를 통과했다.

첫 declaration 빌드는 macOS `/tmp`와 `/private/tmp`의 source identity 불일치로
선언을 내보내지 못했다. 해당 시도는 검사/측정에 사용하지 않았다. output을 realpath로
정규화하고 선언 존재를 assert한 새 빌드는 ESM/CommonJS **17쌍**을 생성했다.
실패 로그도 보존한다.

## 공식 CPU 비교 조건

원래 앱·helper를 고정하고 core만 바꿨다. **앱은 `useParentMemo`를 호출하지 않는다.**
따라서 아래 수치는 격리 렌더러를 선택한 비참여 앱의 비용이다. memo 기능의 이득,
기본 렌더러의 성능 변화, 최종 앱의 종단 개선으로 해석하지 않는다.

| 입력               | SHA-256                                                            |
| ------------------ | ------------------------------------------------------------------ |
| 원래 앱            | `4fcb17e3dcd841f628d4130a7d47ca3011550972675ba2da18e324a5f541d632` |
| 같은 helper        | `9f1399db105531d5e4e1e45c8156477741df27888078898c788cab14514f2594` |
| baseline core ESM  | `3aff372ac9a7e8de09f73f5ddcde5c80ef27d7f6dee8bf2221c0e9cc8121a964` |
| isolated core ESM  | `43b80396f380e345986581f59ce2a4cafc178946730179fde0450bda4d12d4f9` |
| baseline app build | `bccc87087a0d7bb132a6d144dfe288fc5ac0c40833a6e1e350b33fa3f8b503f6` |
| isolated app build | `179b5035b81fc11d54c072564529efd06dca8781fc4f2c03cfa2eaa0dedf63c3` |
| Chrome executable  | `6e156f2271cef44afce9db36a5b920e94518857b94a4160f082696f8c3bd1c9d` |
| Chrome engine      | `b1d0216b347be90a898e9961302916aa1dbf4659f96597ea836dd3eb149574b7` |

upstream 체크포인트는 `ecbff5f54b75244b89b0b14d34f11e32bca59345`, Vite 5.4.21,
Chrome 155.0.8059.85, Apple M4 Pro/12 cores/24GB다. upstream의 기존 targeted
실험 앱은 수정하지 않았다. 공식 runner의 warmup·GC·throttle·paint 계산을 유지했고
CPU 중 빌드·단위 테스트·다른 벤치마크를 병행하지 않았다. `03_update10th1k_x16`과
`09_clear1k_x8`는 이 러너에서 1,000행을 준비한다.

항목 순서는 01→09→03→05→04→06→02→08→07이다.
첫 차수는 각 항목의 baseline/isolated 순서를 교대로 바꾸고, 다음 차수는 모든 항목의
선후를 반대로 실행했다. 두 차수는 재컴파일 없이 동일 빌드를 복사했다.
선택은 앱·차수당 25개, 나머지는 15개다. 중앙값은 짝수일 때 가운데 둘의 평균,
IQR은 중앙값을 제외한 양쪽 절반의 중앙값으로 계산한다. 통합 표는 앱당 항목별
30개, 선택 50개다. 차수별 표본도 raw에 별도로 남긴다.

| 공식 항목                |    baseline 전체 ms [IQR] |    isolated 전체 ms [IQR] | 전체 변화 | baseline JS ms | isolated JS ms | JS 변화 |
| ------------------------ | ------------------------: | ------------------------: | --------: | -------------: | -------------: | ------: |
| `01_run1k`               |    27.564 [27.313–28.021] |    27.652 [27.274–28.240] |    +0.32% |          8.187 |          8.231 |  +0.54% |
| `02_replace1k`           |    31.359 [30.866–32.041] |    31.550 [31.163–32.656] |    +0.61% |         11.664 |         11.736 |  +0.62% |
| `03_update10th1k_x16`    |    18.569 [18.034–19.442] |    18.394 [17.868–19.217] |    -0.95% |          6.139 |          6.155 |  +0.27% |
| `04_select1k`            |       7.889 [7.266–8.574] |       8.024 [7.237–9.089] |    +1.71% |          4.431 |          4.413 |  -0.41% |
| `05_swap1k`              |    17.925 [17.188–20.226] |    18.084 [17.292–19.061] |    +0.88% |          3.661 |          3.799 |  +3.77% |
| `06_remove-one-1k`       |    12.504 [12.185–12.701] |    12.393 [12.078–12.711] |    -0.89% |          1.262 |          1.289 |  +2.14% |
| `07_create10k`           | 295.149 [288.942–301.059] | 293.026 [288.676–297.272] |    -0.72% |         64.524 |         64.326 |  -0.31% |
| `08_create1k-after1k_x2` |    31.294 [30.883–32.400] |    31.263 [30.933–31.634] |    -0.10% |          8.158 |          8.094 |  -0.78% |
| `09_clear1k_x8`          |    12.846 [12.337–13.684] |    13.116 [11.690–14.131] |    +2.10% |         10.375 |         10.265 |  -1.06% |

양수는 isolated가 느린 방향이다. 전체/JS/paint의 차수별·합산 중앙값/IQR/min/max는
raw에 모두 보존한다. 가중치는 고정 upstream `webdriver-ts-results/src/Common.ts`의
9 CPU weights를 ID 순서로 적용한 가중 기하평균이며, 원문과 해시도 증거에 포함한다.

| 차수    | 시작→종료 (UTC)   | 표본 | 전체 가중 변화 | JS 가중 변화 | 시작→종료 1분 load |
| ------- | ----------------- | ---: | -------------: | -----------: | -----------------: |
| main    | 04:15:25→04:23:03 |  290 |         +0.48% |       +1.14% |          1.70→3.64 |
| reverse | 04:23:28→04:31:01 |  290 |         -0.45% |       -1.00% |          3.73→4.21 |
| 합산    | 두 차수           |  580 |         +0.10% |       +0.32% |  배치별 load는 raw |

두 차수 모두 완료, **실패0·재시도0**다. 로그에는 항목 시작의 load도 남겼다.
CPU launcher/집계는 Node20.3.0, 별도 renderer 빌드/테스트는 pnpm의 Node22.13.0이다.

작은 비율 차이와 합산값만으로 무비용·개선·회귀를 확정하지 않는다. 같은 해시여도
차수/시간/시스템 부하가 교란 요인이고 paint가 큰 비중을 차지한다. p-value나
신뢰구간 검정은 수행하지 않았다. 어떤 한 항목의 손해만으로 후보를 기각하지 않는다.

## 번들 비용

| 대상                                |  raw B | gzip B | brotli B |
| ----------------------------------- | -----: | -----: | -------: |
| 기본 UMD                            | 12,741 |  5,167 |    4,798 |
| isolated `lithent.mjs`              | 22,832 |  7,518 |    6,859 |
| isolated `lithent.umd.js`           | 15,481 |  6,157 |    5,691 |
| isolated `lithent.cjs`              | 15,293 |  6,191 |    5,724 |
| 원래 앱 production `lithent-before` | 14,815 |  6,163 |    5,689 |
| 원래 앱 production `lithent`        | 17,164 |  7,043 |    6,492 |

UMD/렌더러 크기는 Node22.13/zlib1.3, production 앱 크기는 Node20.3/zlib1.2.13.1-motley,
gzip level9로 계산했다. 서로 다른 압축기 수치를 섞어 증감을 계산하지 않는다.
비참여 앱의 빌드도 br 5,689→6,492B(+803B)다. 별도 렌더러를 선택하면
`useParentMemo`를 호출하지 않아도 내부 검사/스코프 코드와 전송량 비용이 남는다.

기본 앱이 격리 렌더러를 선택하지 않으면 추가 바이트/분기가 0개다.
선택한 렌더러의 전체 비용은 여전히 **br 5,691B**, 기본보다 **893B 증가**,
기존 한도보다 **891B 초과**다. 이 결과는 C3 코드를 작게 만든 개선이 아니며,
별도 패키지의 크기 예산이 승인되었다는 뜻도 아니다.

## 재현·영구 증거와 미완료 작업

[도구/절차](../../experiments/parent-memo-isolated/README.md),
[raw 결과](./parent-memo-isolation-results.json),
[압축 증거](./parent-memo-isolation-evidence.json.gz)를 연결한다.
증거의 `commands.json`은 사용한 source/core/browser override와 순서를 기록한다.

압축 증거 **367파일 / 1,229,298B**, SHA-256
`b8d28232b2c7b29b305b947dd3e6a230ba3e8a0e5fdbef7fc609ac0ca02264d4`. 전체 raw samples·분석, source17개와 세 번들/선언,
기본28파일, package/타입 fixture, 앱 빌드/입력 UI, 러너 source/실행 JS·lock·CSS/font와
기준 검사 로그를 포함한다. 초기 declaration 실패와 required-props consumer fixture의
TS2345 로그도 남겼다. 최종 NodeNext fixture는 기존 h의 TagFunction 계약에 맞는
optional props를 사용하며 코어 타입은 바꾸지 않았다.

정상 trace는 전체의 파일명·크기·SHA-256 inventory와 각 앱/차수의 선택 trace index 0
**4개**를 보존한다. 나머지 정상 trace 내용은 임시 출력에만 있으므로 전체 trace를
영구 보존했다고 주장하지 않는다. raw CPU 표본은 모두 보존한다. 실패 배치가 있다면
그 원본은 별도로 전부 보존하는 정책이다. 브라우저 바이너리 자체는 포함하지 않는다.

다음은 **같은 행 컴포넌트 앱에서 memo on/off의 실제 CPU 이득과 생성/삭제·메모리 비용**
대조다. 전체 peer·공식 메모리 5항목·100회 churn·Phase 5 hardening·Phase 6 전체
통합/채택은 미완료다. concurrent 새 hook은 미지원이다. 공개 진입점/예산은 기능 이득과
비용을 얻은 뒤 판단한다. 기본 runtime·실제 sibling 앱은 보존하며 후보는 실험으로 남긴다.
