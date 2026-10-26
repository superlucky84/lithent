# DC-23 — compact13 유지와 native 이벤트 복원

2026-10-26. 사용자 승인에 따라 기본 이벤트 proxy를 제거했다. compact13은 유지하며 base/concurrent와 공유 portal teardown은 원 callback의 native 직접 등록으로 복원했다. 새 옵션이나 공개 API는 추가하지 않았다. 패키지 버전은 올리지 않았다.

## 선택과 손익

DC-22의 충분한 비교 뒤 제품 크기·메모리·native 연동 단순성을 우선한 후속 결정이다. 원래 cached js-framework-benchmark의 select/partial은 listener rebind가 0이어서 E의 주된 이득을 사용하지 않는다. 같은 최종 비교의 E/B 가중 전체 시간 비율은 1.0044456으로 추가 성능 개선을 입증하지 못했다.

다만 proxy의 일반 inline UI 이득은 실제로 측정됐다. 기존 partial/select 전체 시간 −5.22%/−9.44%, inline JS 갱신 −15.22~−17.95% 이득을 이번 기본 런타임에서는 포기한다. 안정적인 handler를 mounter에 두면 기존 native 재등록 비용을 줄일 수 있다. 모든 앱에서 복원본이 더 빠르다는 뜻은 아니다.

기존 공식 10k heap 중앙값은 B/native **28.160519MB**, E **29.073093MB**다. B를 선택하면 이 비교에서 **0.912574MB** 적다. 이는 보존한 동일 환경 B/E 자료이며 이번에 새로 측정한 heap이 아니다. [DC-22 보고서](./COMPREHENSIVE_RESULTS.md), [공식 CPU/메모리](./comprehensive-final-results.json), [inline UI](./comprehensive-ui-results.json), [이벤트](./comprehensive-event-results.json)에 원자료를 연결한다.

## 복원 범위와 성능 자료 재사용

- `src/render.ts`, `lithentConcurrent/src/render.ts`, `src/hook/internal/unmount.ts`를 `fb481f3`와 정확히 일치시키고 `src/utils/event.ts`를 제거했다.
- compact13의 `src/wDom.ts`, `src/utils/createWDom.ts`를 유지했다. 모든 추적 runtime source(테스트 제외)는 native B 커밋과 일치한다.
- 새 전체 빌드의 base ESM/UMD/CJS SHA-256이 DC-22에서 실제 측정한 고정 B의 세 artifact와 모두 일치한다. 따라서 기존 B CPU/메모리 결과를 재사용하며 새 timing 결과로 표시하지 않는다. concurrent의 속도 개선은 별도로 주장하지 않는다.
- 배포 태그 `lithent@1.25.2`에는 compact13이 없다. 이번 작업은 1.25.2 전체로 되돌리는 작업이 아니다. compact13의 이전 독립 개선율과 DC-22 결과를 더하거나 곱하지 않는다.

최종 고정 네 peer 최저 중앙값 대비 1.10 목표는 native B도 **6/9**다(정순 6/9, 역순 7/9). 기존 E는 합산 6/9, 정순 6/9, 역순 8/9였다. 전 항목 최적 또는 목표 달성으로 표현하지 않는다.

| 공식 CPU 항목  | native B 전체 중앙값(ms) | peer 최저 대비 | ≤1.10 |
| -------------- | -----------------------: | -------------: | ----- |
| 1k 생성        |                  26.2615 |         1.0513 | 통과  |
| 1k 교체        |                  27.8530 |         0.9390 | 통과  |
| 매 10번째 갱신 |                  15.4380 |         1.1215 | 미달  |
| 선택           |                   5.9125 |         1.3958 | 미달  |
| swap           |                  16.6975 |         1.1165 | 미달  |
| 하나 삭제      |                  11.7375 |         0.9680 | 통과  |
| 10k 생성       |                 265.4000 |         1.0019 | 통과  |
| 1k 추가        |                  29.8110 |         1.0236 | 통과  |
| 전체 삭제      |                  11.2900 |         0.9148 | 통과  |

## 실제 크기

Node **24.11.1**, zlib **1.3.1-470d3a2**, gzip level 9와 기본 Brotli 설정으로 두 버전의 실제 bytes를 다시 압축했다. 이전 E bytes는 기존 아카이브에서 꺼내 adoption SHA-256과 대조했다. 과거 Node20의 gzip 수치를 새 수치와 섞지 않았다.

| minified UMD      | E/proxy | native 복원 | 감소 |
| ----------------- | ------: | ----------: | ---: |
| base raw          | 13,252B |     12,759B | 493B |
| base gzip         |  5,395B |      5,187B | 208B |
| base Brotli       |  5,006B |      4,824B | 182B |
| concurrent raw    | 18,914B |     18,419B | 495B |
| concurrent gzip   |  7,669B |      7,484B | 185B |
| concurrent Brotli |  7,076B |      6,903B | 173B |

base guard는 4,800B reference + compact13의 24B = **4,824B**로 복원했고 proxy allowance 182B를 제거했다. concurrent 9,000B와 element 1,000B 기준도 통과했다. 공개 약 4.8KB는 **minified UMD/Brotli**다. gzip은 여전히 5KB를 넘으며, 비축약 ESM은 raw 18,868B/Brotli 5,802B다. 모든 형식이 5KB 미만이라고 주장하지 않는다.

## 동작과 검증

원 함수/handleEvent 객체가 native listener이므로 외부 동일 callback의 dedup/remove와 교체 뒤 상대 순서가 native 규칙을 따른다. 진행 중 target dispatch에서 앞선 listener가 handler를 교체하면 해당 클릭에서 새 handler는 기다릴 수 있다. ancestor 도달 전 교체는 native 전파 규칙을 따른다. [공개 이벤트 계약](../../skills/lithent/reference/events.md)에 구체적으로 기록했다.

- `pnpm build`, `pnpm verify:concurrent`, `pnpm size`, base/concurrent/e2e strict TypeScript와 변경 TypeScript의 ESLint가 통과했다.
- `pnpm test`: **974 passed, 3 existing skipped**. base SSR **15 passed**, concurrent satellites **172 passed**를 추가해 B1/B4의 `test:dual` 하위 suite를 모두 충족했다. 합계 **1,161회 통과**이며 중복을 제거한 고유 테스트 수나 literal `test:dual` 실행으로 표현하지 않는다.
- Playwright **78 passed**, unexpected/flaky/skipped/retry **0**. 양코어 trusted alias·중첩·target/ancestor 교체·예외·native identity/dedup/remove/order·cleanup을 포함하고 기존 SSR/hydration/HMR/CSP/문서·예제/스케줄러 회귀를 유지했다.
- 실제 Node package import/require export map을 확인하고 양코어 ESM/UMD/CJS의 trusted alias/replace와 native 연동을 **18개 package probe**로 검증했다. frozen 함수/handleEvent 객체·동일 frozen Event 재사용도 통과했다.
- 기존 portal/shared target 및 concurrent retry/abandon 회귀는 전체 suite에서 통과했다. 이번에 성능 timing이나 별도 GC/churn 수집을 추가하지 않았다.

기존 build 경고(선택 export 분석, Node deprecation, docs chunk 크기)는 성공/실패와 구분한다. 크기·runtime source·bundle·명령별 로그·브라우저 결과는 [검증 manifest](./native-events-validation.json)와 [증거 archive](./native-events-evidence.tar.gz)에 보존한다.

## 보존과 인계

수정 E의 정확한 구현은 [실험 source](../../experiments/comprehensive/event.ts) 및 커밋 `95d6faf42c860bfb87e180f594287a9e3d717334`에 남아 있다. 별도 브랜치 snapshot `6993a93`, flat `7e838bc`, slot `189ddef`과 C2/K/EK/Fragment 자료도 유지했다. 기존 [evidence manifest](./comprehensive-evidence-manifest.json)와 56개 archive의 byte/hash는 그대로다. 과거 archive의 `repo/` snapshot을 이번 working tree와 같다고 주장하지 않는다.

- done: 이벤트 proxy 제외, compact13 유지, 공개 계약/guard 수정과 최종 검증·자료 보존 완료.
- next: 추가 성능 연구가 필요하면 아직 목표를 넘는 partial/select/swap에서 새 가설을 세운다. 배포/버전 변경은 별도 작업이다.
- blockers: 이번 복원의 실행 블로커 없음. CPU 목표는 6/9로 남는다.
- commit: DC-23 복원·검증과 DC-24 조사 구현은 `4baf0e51483134ab3426817035e06e21f0285022`에 커밋했다. 검증 당시 시작 HEAD는 `463c6cd`이며 JSON/아카이브의 head·uncommitted 값은 당시 이력으로 유지한다. 이후 인계 문서 커밋의 tip은 `git log -1` 및 브랜치 ctxbin을 따른다.

재현 명령과 로그 보존 절차: [검증 도구](../../experiments/native-events/README.md). 정본은 [요구](../performance-improvement/REQUIREMENTS.md), [설계](../performance-improvement/DESIGN.md), [실행](../performance-improvement/IMPLEMENT.md), [검증](../performance-improvement/MANUAL_TEST_CHECKLIST.md)이다.
