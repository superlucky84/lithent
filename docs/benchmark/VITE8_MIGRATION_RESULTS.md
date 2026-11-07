**Vite 8 전환을 `chore/vite8-migration` 브랜치에서 구현했다.** 코어 런타임 소스는 유지하고 빌드·플러그인·테스트 도구를 전환했다. 비교 기준은 `d594983` 소스를 기존 Vite 5 설정으로 새로 빌드한 산출물이다. 이전 `dist`의 오래된 파일을 대조군으로 쓰지 않았다.

Node 24.22.1 / pnpm 12.15.0 / Vite 8.3.6 / Rolldown 1.2.16을 사용했다. gzip은 level 9, Brotli는 Node 기본 설정이다. JS 브라우저 타깃은 기존 `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`를 명시했다. 소스맵 자동 연결과 기존 크기 예산도 유지했다.

| 실제 UMD   | 이전 raw / gzip / Brotli | 전환 후 raw / gzip / Brotli |      Brotli 감소 |
| ---------- | -----------------------: | --------------------------: | ---------------: |
| base       |  13,015 / 5,325 / 4,925B |     12,589 / 5,211 / 4,835B |  **90B / 1.83%** |
| concurrent |  18,487 / 7,539 / 6,953B |     17,921 / 7,233 / 6,684B | **269B / 3.87%** |

전환 후 element UMD는 Brotli 968B이며 1,000B 예산을 통과했다. Base는 4,925B 예산에서 90B 여유를 확보했다. 이번 전환에 앞선 [축소 조사](./CORE_BUNDLE_ANALYSIS_2026_11.md)의 작은 소스 재작성 후보나 추가 Terser compress는 채택하지 않았다.

**변경은 Vite 버전뿐 아니라 기존 동작을 유지하는 변환 설정을 포함한다.**

- Vite 개발 의존성을 8.3.6, Vitest를 Vite 8을 지원하는 4.1.12, 선언 생성기를 vite-plugin-dts 4.5.4로 올리고 workspace lockfile을 갱신했다. Node 24.22.1 / pnpm 12.15.0 고정은 유지했다.
- 활성 빌드 설정은 `rolldownOptions`와 `import.meta.dirname`을 사용한다. 지원되지 않는 `tryCatchDeoptimization`은 제거했다. dts의 `outputDir`는 `outDir`로 바꿨다. checker는 테스트 중에는 생성하지 않고 실제 빌드에서 타입·린트 검사를 계속 실행한다.
- TypeScript의 모듈 해석은 bundler로 맞췄고, Vitest 4에서 필요해진 Node 전역 타입을 명시했다. MDX playground에는 자동 JSX와 MDX 모듈 타입을 명시했다.
- JSX는 앱의 기존 모드를 따르게 했다. 수동 `h` 경로는 Oxc classic + `development: false`로 설정해 `__self`/`__source`가 DOM 속성으로 들어가지 않게 했다. 예제·문서와 자동 JSX 앱은 Lithent 자동 런타임을 유지한다. 테스트 서버의 기존 esbuild JSX 설정도 Oxc로 전환했다.
- 템플릿 JS/TS 변환은 `transformWithOxc`를 사용한다. 공개 옵션에 있던 JSON/CSS loader는 명시적인 esbuild 의존성으로 기존 경로를 유지했다. 의존성 스캔은 변환 전 템플릿을 읽으므로 `.ltsx`/`.ljsx`에는 TSX/JSX parser를 사용한다. 이 설정이 없으면 화면은 동작해도 의존성 스캔이 실패하고 prebundle을 건너뛰었다.
- HMR 플러그인은 템플릿을 켠 경우에도 일반 TSX의 자동 런타임 설정을 제공한다. 템플릿과 일반 TSX를 함께 쓰는 실제 개발·프로덕션 fixture로 확인했다.
- Vite/템플릿/MDX 플러그인의 Vite peer 범위는 `^8.0.0`으로 바뀐다. 생성 템플릿도 Vite 8과 지원되는 Node 버전을 사용한다. Tailwind 관련 의존성은 Vite 8을 지원하고 설치의 최소 발행 경과 시간도 충족하는 4.3.4로 고정했다. `minimumReleaseAgeExclude` 등 설치 정책 예외는 추가하지 않았다.
- Playwright는 기존 설치 브라우저를 선택할 수 있는 `LITHENT_CHROME` 환경 변수를 지원한다. 기본 동작은 Playwright의 설치 브라우저를 사용한다.
- 생성 템플릿의 Tailwind 자동 스캔은 기존 설정에 선언한 콘텐츠 경로로 제한했다. Git에서 무시하는 사본 경로의 검사에서 발생하던 메모리 급증을 해결하고 SSR의 MDX 경로도 명시했다. SSR CSS 파일은 기존 서버가 찾는 `style` 접두어를 유지한다. 사본 검사에 CSS HTTP 응답 검증과 종료 가능한 `--check` 모드를 추가했고, Concurrent의 bare package alias에는 명시적인 package resolver를 사용한다.

**CPU 결과는 워밍업 조건에 민감했으며 일반적인 개선 수치로 해석하지 않는다.**

실제 production ESM을 각각 새 브라우저 context에 로드해 같은 1,000행 앱으로 비교했다. 30회 갱신을 측정하고 before/after 순서를 번갈아 실행했다. 각 조건의 표본은 4개다. 렌더링·paint 시간이나 공식 9항목 벤치마크가 아니다.

| 조건                      | base 이전 → 이후, 중앙값 | concurrent 이전 → 이후, 중앙값 |
| ------------------------- | -----------------------: | -----------------------------: |
| 워밍업 5회 후 갱신 30회   |        308.65 → 388.30ms |              380.65 → 711.20ms |
| 워밍업 100회 후 갱신 30회 |          70.85 → 71.60ms |              210.05 → 159.40ms |

짧은 워밍업에서 느려진 관측도 보존했다. 워밍업을 늘리면 base 중앙값 차이는 약 +1.06%였고 concurrent는 순서별 편차가 컸다. 워밍업 조건을 바꿨을 때 결론이 달라지므로 CPU 개선이나 모든 경로의 성능 회귀 부재를 주장하지 않는다. 실제 배포 판단에 공식 성능 점수가 필요하면 기존 고정 러너로 별도 측정해야 한다.

**GC 진단에서는 전환 전후 같은 회수 동작을 확인했다.**

두 워밍업 조건의 총 32 context에서 1,000개 행 컴포넌트를 유지하며 갱신했다. 처음 그린 행 노드 20개는 갱신 후 강제 GC에서 모두 회수됐다. 키 교환·전체 삭제·root 해제 후 행의 컴포넌트 키 1,000개와 이전 노드는 모두 회수됐고 body의 자식도 0개였다. 현재 산출물의 해시가 진단에 사용한 파일과 같은지도 확인했다.

100회 워밍업의 live JS heap 중앙값은 base 2,951,276→2,948,694B, concurrent 3,090,614→3,088,806B였다. 작은 차이를 메모리 개선이라고 보지 않는다. DOM/listener counter는 각 코어의 대조군과 같았다. 이 fixture는 모든 종류의 누수 부재를 증명하지 않는다.

재현 도구와 정확한 조건은 [실험 안내](../../experiments/vite8-migration/README.md)에 있다. [결과 JSON](../../experiments/vite8-migration/results.json)에 두 워밍업의 원자료와 산출물 해시를 보존한다.

**최종 검증은 기존 산출물을 모두 삭제한 빌드까지 통과했다.**

| 검사                        | 결과                                                                              |
| --------------------------- | --------------------------------------------------------------------------------- |
| frozen install / peer 검사  | 통과, 설치 정책 예외 없음                                                         |
| 전체 clean build            | 통과, 검사에 사용한 라이브러리 JS 39개와 해시 일치                                |
| `pnpm test:dual`            | 1,176 통과, 기존 제외 3개 유지                                                    |
| 템플릿 플러그인 전용 테스트 | 5 통과                                                                            |
| Playwright 양코어           | 78 통과                                                                           |
| 고장 주입 negative controls | 5종의 6개 의도한 실패를 모두 검출                                                 |
| `verify:concurrent`         | clean build 후 통과                                                               |
| `verify:release`            | 실제 tarball 격리 설치, ESM/CJS 11개 경로와 엄격한 Node16/NodeNext 타입 검사 통과 |
| SSR scaffold 양코어         | 빌드·코어 식별·선언·SSR·실제 CSS HTTP 응답 통과                                   |
| 혼합 TSX/템플릿 integration | dev·production 상호작용, 실제 prebundle, source map 통과                          |
| 크기 gate                   | base 4,835 / concurrent 6,684 / element 968B, 모두 기존 예산 이내                 |

브라우저는 Chromium 151.0.7922.173을 사용했다. SSR scaffold의 외부 PokeAPI 요청은 실행 환경의 프록시·CA 설정을 사용하는 Node 옵션으로 확인했다. Scaffold의 `--check`는 빌드/SSR/CSS 확인 후 종료하며, 기본 대화형 하이드레이션 확인 모드는 유지한다. 일반 하이드레이션 동작은 위 Playwright suite에서 양코어로 검증했다.

플러그인의 Vite 8 peer 전환은 도구 소비자에게 영향을 준다. npm 배포 단계에서는 새 플러그인 버전과 생성 템플릿의 버전 참조를 함께 정리해야 한다. 이 브랜치는 기존 코어 패키지 버전과 릴리스 태그를 변경하지 않는다.
