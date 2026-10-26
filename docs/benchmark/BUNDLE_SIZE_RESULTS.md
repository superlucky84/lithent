# DC-24 — 추가 번들 크기 조사

2026-10-26. 현재 compact13/native의 번들에서 작은 여유를 찾았다. **검증한 출력 후보의 절감은 수십 바이트다. 기본 빌드·runtime·공개 계약은 변경하지 않았다.** 100~200B 이상을 안전하게 줄일 방법을 이번 조사에서 입증하지는 못했다.

## 실제 결과

Node 24.11.1 / zlib 1.3.1-470d3a2, Terser 5.18.1, Vite 5.4.8을 사용했다. gzip level 9와 기본 Brotli로 같은 bytes를 비교했다. 아래는 base minified UMD의 크기이며 다른 형식의 수치로 일반화하지 않는다.

| 후보                                   |     raw |   gzip | Brotli | 현재 대비 Brotli 감소 |
| -------------------------------------- | ------: | -----: | -----: | --------------------: |
| 현재 compact13/native                  | 12,759B | 5,187B | 4,824B |                  기준 |
| source map 연결 주석만 제거            | 12,719B | 5,155B | 4,798B |                   26B |
| 제한 구문 압축                         | 12,740B | 5,177B | 4,815B |                    9B |
| 제한 구문 + if_return                  | 12,728B | 5,179B | 4,808B |                   16B |
| 제한 구문 + 연결 주석 제거             | 12,700B | 5,145B | 4,788B |                   36B |
| 제한 구문 + if_return + 연결 주석 제거 | 12,688B | 5,147B | 4,779B |                   45B |

압축 결과는 비선형이다. 행별 감소량을 더하지 않으며 Brotli 최저 후보와 gzip 최저 후보도 다르다. 가장 작은 gzip 후보도 5,145B여서 gzip 5KB 미만을 달성하지 못했다.

이름 변경·reprint·제한 구문과 hidden map 조합 **41개 출력**을 탐색했다. 별도 Vite production build **12개**(base 8, concurrent 4)로 대조군과 후보를 재현했다. 결과 파일은 [scan](./bundle-size-scan.json), [실제 빌드](./bundle-size-builds.json), [검증](./bundle-size-proof.json)에 있다.

- 표준 Terser rename-only는 현재 bytes와 같았다. 16개 identifier alphabet 후보는 기본 source map 연결을 유지한 경우 모두 Brotli/gzip이 커졌다.
- 줄바꿈으로 세미콜론을 대체하는 출력은 Brotli 4,836B/gzip 5,192B로 커졌다.
- Rollup generatedCode를 ES2015로 명시한 후보도 현재 bytes와 같았다.
- 제한 구문 압축은 defaults:false에 booleans/comparisons/conditionals/evaluate/properties/typeofs, 별도로 if_return만 켰다. 전체 compress, closure inlining/collapse나 property mangling은 사용하지 않았다.

## source map 주석 후보의 검증과 대가

Vite `build.sourcemap: 'hidden'`은 `.map` 파일을 생성하면서 JS 끝의 `sourceMappingURL` 연결 주석만 생략한다. 실제 두 코어의 ESM/UMD/CJS **6개 형식**을 확인했다.

- 현재 설정의 대조 빌드는 workspace의 여섯 JS와 정확히 일치한다.
- hidden 후보의 JS는 끝 연결 주석을 제외하면 대조군과 정확히 같다. 실행 구문의 AST 전체도 일치한다.
- 여섯 source map 파일 자체도 대조군과 byte/hash가 같으며 mappings/sources가 있다.
- concurrent UMD는 Brotli 6,903→6,868B, gzip 7,484→7,451B다. base ESM은 Brotli 5,802→5,776B다.

이 후보의 대가는 브라우저의 source map 자동 연결이 사라지는 것이다. 수동 로드나 별도 디버깅 도구의 업로드/연결이 필요하다. source map 파일을 없애거나 기능을 제거한 절감은 아니다. 기존 4,800B reference 아래로는 들어가지만 여유가 **2B**뿐이고 현재 4,824B guard 대비 확보하는 공간은 26B다.

초기 AST 검사 도구는 Program.end에 포함된 전체 파일 길이까지 비교해 주석 길이 차이를 실패로 잡았다. 실행 구문인 Program.body 전체를 비교하도록 수정한 뒤 여섯 형식 모두 통과했다. 제품 런타임 실패로 해석하지 않는다.

## 구문 압축은 후보로 보류

실제 base 구문 후보는 기존 **168개 함수와 독립 parent getter 한 개**의 형태를 유지했다. 이 정적 확인만으로 메모리 수명이나 공식 성능을 보장하지 않는다. 새 GC/heap·성능 timing·브라우저 회귀를 수집하지 않았으며 기본 채택으로 표시하지 않는다. 별도로 얻는 9~16B를 위해 현재 parent getter scope 보호 정책을 바꿀 근거는 부족하다.

공개 property 이름/exports, native 이벤트 동작, compact13 필드와 layout을 줄이는 변경은 이번 안전한 출력 후보에 포함하지 않았다. 코어의 중복 소스를 합치는 것 역시 호출 비용·관찰 순서·수명에 영향을 줄 수 있으므로 검증 없이 추가 절감을 약속하지 않는다. 모든 가능한 코드 구조 최적화를 기각한 결과는 아니다.

## 판단과 인계

**사용자는 추가 축소를 보류하고 현재 설정 유지를 확정했다. 작은 절감 경로는 있다. 다만 현재는 26B를 위해 기본 디버깅 편의를 줄이거나, 추가 9~16B를 위해 구문 압축 정책을 바꾸는 일을 우선 추천하지 않는다.** 수동 source map 운영이 이미 확정된 배포라면 hidden map은 실행 구문 변경 없이 쓸 수 있는 선택이다. 수백 바이트 여유가 필요하다면 별도 코드 구조 후보와 성능/수명 검증이 필요하다.

- done: 출력41개·실제 빌드12개, 여섯 형식의 동일 실행 구문/소스맵 검증과 크기 비교를 보존했다.
- next: 이번 조사 완료. 기본 런타임은 [DC-23](./NATIVE_EVENTS_RESULTS.md)을 유지한다. 구문 압축 채택 또는 새 코드 구조 후보는 별도 검증 작업이다.
- blockers: 조사 실행 블로커 없음. 구문 후보의 runtime/heap/performance는 미검증으로 남으며 미채택이다.
- commit: DC-23 복원·검증과 DC-24 조사 구현은 `4baf0e51483134ab3426817035e06e21f0285022`에 커밋했다. 검증 당시 시작 HEAD는 `463c6cd`이며 JSON/아카이브의 head·uncommitted 값은 당시 이력으로 유지한다. 이후 인계 문서 커밋의 tip은 `git log -1` 및 브랜치 ctxbin을 따른다.

증거: [archive](./bundle-size-evidence.tar.gz). 재현은 [도구 안내](../../experiments/native-events/README.md#dc-24-bundle-size-investigation)를 따른다. 정본은 [요구](../performance-improvement/REQUIREMENTS.md), [설계](../performance-improvement/DESIGN.md), [실행](../performance-improvement/IMPLEMENT.md), [체크](../performance-improvement/MANUAL_TEST_CHECKLIST.md)다.
