# base 크기 게이트 해결 — 2026-10-08

**base UMD의 brotli 크기를 4,855 → 4,758B로 줄여 기존 4,800B 게이트를 통과했다.**
한도보다 42B 작다. 코어 소스와 패키지 버전은 변경하지 않았다.

## 변경과 결과

[vite.config.js](../../vite.config.js)에 UMD 출력 전용 `renderChunk` 후처리를 추가했다.
기존 devDependency인 Terser로 지역 변수명을 다시 정리하고 코드를 출력한다.
`compress: false`로 연산 최적화를 끄므로, 이전 diff 트리의 보유를 막는 부모 getter의 별도
함수 스코프도 유지한다. property mangling은 사용하지 않는다. 소스맵은 Rollup의 기존
맵 체인에 연결하며, 원본 14개 파일과 `sourcesContent`가 이전과 일치하는지 검사했다.

| base UMD                 | 수정 전 | 수정 후 |     변화 |
| ------------------------ | ------: | ------: | -------: |
| raw                      | 12,905B | 12,966B |     +61B |
| gzip, level 9            |  5,280B |  5,158B |    -122B |
| brotli, 기존 게이트 설정 |  4,855B |  4,758B | **-97B** |

ESM은 기존 빌드 경로를 유지했다. Vite 전체 minifier를 Terser로 바꾸는 시도에서는 ESM
출력이 커져, 변경을 UMD에 한정했다. 최종 `dist/lithent.mjs`는 변경 전과 바이트 단위로
동일하며 SHA-256은 `64516ce9c8622673133098b6bacb188753aa383f204cf1f6579f299248d2344f`다.
따라서 ESM core를 사용하는 기존 js-framework-benchmark 측정 번들도 그대로 유효하다.
UMD의 CPU 성능은 새로 측정하지 않았다.

concurrent **6,385 / 9,000B**, element **998 / 1,000B**도 그대로이며 `pnpm size` 전체가 통과한다.

## 검증과 원본

- `pnpm build:core`, `pnpm test`, 변경 파일 ESLint 통과.
- `pnpm verify:release` 통과: 세 tarball의 manifest·exports·bin, 별도 설치 환경의 공개 import
  11개와 strict JSX/core/helper 타입을 확인했다.
- 실제 압축 전후 UMD 파일을 Chrome에 직접 로드해 기존 호환성 시나리오 9개를 각각 실행했다.
  **18개 실행 결과가 모두 동일**하다. props 열거, portal 호스트 정리, 보관한 DOM 이벤트,
  destroy 중 버블링과 부모 갱신 후 자식 renew를 포함한다.
- CommonJS UMD 분기의 공개 export 21개가 동일하며, ESM 해시와 소스맵 원본 파일도 동일하다.
- [umd-size-results.json](./umd-size-results.json)에 크기·해시·브라우저 결과를,
  [umd-size-evidence.json.gz](./umd-size-evidence.json.gz)에 두 UMD, 동일 ESM, 소스맵, 빌드 설정과
  검사 코드를 보존했다. 압축 원본의 SHA-256은 결과 파일의 `evidenceSHA256`이다.
  [umd-size-review.mjs](./umd-size-review.mjs)에 이전 dist 디렉터리를 인자로 주면 검사를 재현할 수 있다.
- 측정 당시 HEAD는 `6a54bdf`이며 빌드 설정은 미커밋 상태다. 기존 성능·호환성 원본을 덮어쓰지
  않았다. 버전 변경·커밋·푸시·배포는 이번 검증에서 수행하지 않았다.
