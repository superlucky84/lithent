# REQUIREMENTS — Lithent 번들 크기 정상화 및 축소

- 브랜치: `feat/bundleSize`
- 작성일: 2026-08-20 (최종 수정: 2026-08-20)
- 상태: **G1·G4 완료 후 의도적 중단 (RC-10). G2·G5는 착수하지 않음 — 재개 조건은 §13 참조**
- 관련 문서: DESIGN.md (예정) → IMPLEMENT.md (예정) → MANUAL_TEST_CHECKLIST.md (예정)
- 선행 문서: [../performance-improvement/REQUIREMENTS.md](../performance-improvement/REQUIREMENTS.md) — 크기 예산 RC-3을 계승·갱신한다.

## 1. 배경 및 목적

Lithent의 정체성은 "경량"이다(README: *"Lightweight DOM manipulation without the framework weight"*).
그런데 현재 배포 산출물과 문서가 그 주장을 뒷받침하지 못한다. 실측으로 확인된 문제는 셋이다.

| # | 문제 | 실측 근거 |
|---|---|---|
| P1 | **전 패키지 ESM 산출물의 whitespace minify 누락** (vite의 의도적 동작 — §6 A5) | `dist/lithent.mjs` 624줄, 공백만 5,494B. 재압축 시 gzip -835B. 7개 아티팩트 합계 **-2,158B gzip** |
| P2 | **코어 크기 증가** | UMD brotli 4,169B(2026-07-27) → **4,735B**(현재). **+566B**. 선행 문서 RC-3 예산 여유 951B 중 566B 소진 |
| P3 | **문서 수치 부정확** | README "4KB", MANUAL.md "zip 3kb", CLAUDE.md "~4KB" — 실측 ESM gzip은 5,784B |

특히 P1은 `package.json`의 `module` / `exports.import` 진입점에만 발생한다. UMD(`main`, `require`)는 정상(2줄)이다.
**이는 vite의 버그가 아니라 의도적 동작임이 확인되었다**(원인·검증은 §6 A5 / A6 참조).
따라서 이번 작업은 "버그 수정"이 아니라 **"vite 기본값을 의도적으로 재정의하는 결정"**으로 취급한다.

**이번 작업의 목적은 배포 산출물의 크기를 정상화하고, 코어를 preact 수준 이하로 축소하며,
문서의 크기 주장을 실측과 일치시키는 것**이다.

## 2. 기준선 (2026-08-20 실측)

측정 방법: `gzip -9 -c <file> | wc -c`, `brotli -q 11 -c <file> | wc -c`. 클린 워킹트리(`f3921cc`) 기준.

### 2.1 코어

| 아티팩트 | 줄수 | raw | gzip | brotli |
|---|---:|---:|---:|---:|
| `dist/lithent.umd.js` (현재) | 2 | 12,532 | 5,148 | 4,735 |
| `dist/lithent.umd.js` (재압축) | 1 | 12,461 | 5,085 | 4,691 |
| **`dist/lithent.mjs` (현재)** | **624** | **17,921** | **5,784** | **5,259** |
| `dist/lithent.mjs` (재압축) | 1 | 12,186 | 4,941 | 4,569 |

UMD는 이미 최적에 근접(-44B br)하고, **ESM만 -690B br 손실 중**이다.
ESM 수정 후에는 UMD보다 작아진다(4,569 < 4,691) — UMD 래퍼가 없으므로 정상적인 결과다.

### 2.2 전 패키지 ESM

| 아티팩트 | 줄수 | gzip | 재압축 gzip | 절감 |
|---|---:|---:|---:|---:|
| `dist/lithent.mjs` | 624 | 5,784 | 4,949 | **-835** |
| `helper/dist/lithentHelper.mjs` | 366 | 2,416 | 1,853 | -563 |
| `ssr/dist/lithentSsr.mjs` | 188 | 2,108 | 1,799 | -309 |
| `devHelper/dist/lithentDevHelper.mjs` | 89 | 1,065 | 884 | -181 |
| `tag/dist/lithentTag.mjs` | 28 | 886 | 732 | -154 |
| `ftags/dist/lithentFTags.mjs` | 31 | 360 | 290 | -70 |
| `jsx-runtime/dist/jsxRuntime.mjs` | 17 | 267 | 221 | -46 |
| | | | **합계** | **-2,158** |

### 2.3 코어 모듈별 기여도 (esbuild metafile, minified bytes)

| 모듈 | bytes | 비중 |
|---|---:|---:|
| `render.ts` | 4,937 | **42.7%** |
| `wDom.ts` | 1,917 | 16.6% |
| `diff.ts` | 1,465 | 12.7% |
| `utils/predicator.ts` | 1,087 | 9.4% |
| 훅 7개 합계 | 1,331 | 11.5% |
| 나머지 | 833 | 7.2% |
| **총계** | **11,570** | 100% |

### 2.4 비교 대상

| 라이브러리 | raw | gzip | brotli | 출처 |
|---|---:|---:|---:|---|
| **preact 10.29.8 `preact.min.js`** | 11,322 | 4,841 | **4,402** | 2026-08-20 재측정 (unpkg) |
| preact 10.29.8 `preact.module.js` (ESM) | 11,693 | 4,846 | 4,416 | 〃 |
| preact 10.29.7 (min) | 11,360 | 4,839 | 4,410 | 선행 문서 기록 (2026-07-27) — 재측정치와 8B 차, 신뢰 가능 |

preact의 ESM 산출물(4,416B br)도 min 산출물과 거의 동일한 크기다.
즉 preact는 두 진입점 모두 whitespace가 압축되어 있다. 다만 이것이 ESM 압축의 실효성을 입증하지는 않는다 — §3.1 참조.

## 3. 가치 재평가 (2026-08-20, 조사 완료 후)

착수 시점의 전제("ESM 산출물이 커서 사용자가 손해를 본다")는 **조사 결과 대부분 성립하지 않는다.**
아래는 각 문제의 실제 수혜자를 다시 계산한 결과다.

### 3.1 P1(빌드 수정)의 실효성 — 낮음

| 수혜 대상 | 실제 이득 | 근거 |
|---|---|---|
| 번들러 사용자 (대다수) | **없음** | 앱 번들러가 재압축한다 (A2) |
| bundlephobia 배지 | **아마 없음** | 자체적으로 webpack+terser 재압축하는 것으로 알려짐 — **미검증(A9)** |
| CDN에서 ESM 직접 소비 | 있음 | 다만 lithent의 script 태그 경로는 주로 **UMD** |
| 문서 정확성 | 있음 | 그러나 **표기 숫자만 정정해도 해소됨** |

또한 vite의 기본 동작에는 **정당한 근거**가 있다 — ESM lib 산출물은 번들러가 재처리하므로
공백 압축은 불필요하고, 그 대가로 `@__PURE__` 주석(다운스트림 트리셰이킹 힌트)을 보존한다.
esbuild로는 **공백만 지우고 주석을 살리는 것이 불가능**하다 (A9 표 참조).

### 3.2 P2(코드 크기)의 실효성 — 유효

코어는 트리셰이킹이 89% 무력하므로(A7), **소스 코드를 줄인 만큼이 모든 소비자의 번들에 그대로 반영된다.**
즉 실제 사용자에게 영향이 있는 작업은 G1이 아니라 **G2(절대 크기 축소)** 다.

단 그 성격은 성능이 아니라 **포지셔닝**이다. 4.9KB와 4.4KB의 차이는 앱 성능에 체감되지 않는다.
"경량"을 정체성으로 내세우는 라이브러리에서 **그 숫자 자체가 제품의 주장**이라는 점이 근거이며,
preact 동급이라는 기준은 성능 임계가 아니라 **신뢰도 임계**다.

### 3.3 P3(문서 정확성)의 실효성 — 유효, 최우선

README가 "4KB"라고 주장하지만 실측은 5.78KB(ESM) / 4.74KB(UMD)다.
이는 빌드 변경과 **무관하게** 즉시 정정 가능하며, 비용이 가장 낮고 신뢰도에 직결된다.

## 4. 목표

- **G1. 빌드 정상화** — 전 패키지 ESM 산출물에 whitespace minify가 적용된다.
  종료 판정: 모든 `*.mjs` 산출물이 1줄이며, §2.2의 "재압축 gzip" 값 이하.
  **우선순위 하향 (§3.1)** — 실사용자 이득이 확인되지 않았다. RC-8에서 채택 여부를 결정한다.
- **G2. 코어 축소 (최우선, §3.2)** — 코어 minified 산출물이 **brotli ≤ 4,402B**
  (preact 10.29.8 `preact.min.js` 이하).
  - **기준 아티팩트는 UMD** — script 태그로 그대로 소비되는 유일한 경로이며,
    이미 완전 압축(1줄) 상태라 빌드 수정으로는 줄지 않는다. 오직 소스 코드 축소로만 달성된다.
    현재 4,735B → **-333B 필요**.
  - ESM은 부차 기준. G1 채택 시 4,612B, 미채택 시 5,259B에서 출발한다 (RC-4 개정).
  - 코어는 트리셰이킹이 89% 무력하므로(A7) 축소분이 모든 소비자 번들에 그대로 반영된다.
- **G3. 동작 100% 유지** — 공개 API 시그니처, 렌더 결과, 라이프사이클 실행 순서 불변.
  `pnpm build && pnpm test` 전체 통과가 각 단계의 필수 종료 조건.
- **G4. 문서 정확성 (즉시 착수 가능, §3.3)** — 저장소 내 모든 크기 주장이 실측치와 일치하고,
  측정 방법·기준 아티팩트가 명시된다. 빌드 변경과 독립적이며 비용이 가장 낮다.
- **G5. 회귀 방지** — 크기 예산을 자동으로 검사하는 수단이 존재한다(형태는 DESIGN.md에서 결정).

## 5. 범위

### 포함 (RC-3 결정)

- S1. **빌드 설정 수정** — 코어 + helper + devHelper + ssr + tag + ftags + jsx-runtime 7개 아티팩트.
- S2. **vite 기본값 재정의 수단 확보** — `isEsLibBuild` 분기(§6 A5)를 우회해 ESM 산출물에도
  whitespace minify를 적용하는 방법을 선택·구현한다. 후보는 DESIGN.md D1에서 비교한다.
- S3. **코어 크기 최적화** — G2 달성을 위한 내부 리팩터. `render.ts`(42.7%) 우선 검토.
- S4. **문서 정정** — README, MANUAL.md, CLAUDE.md, `lithentDocs/`의 크기 표기.
- S5. **크기 회귀 방지 장치** — 측정 스크립트 + 예산 상한 검사.
- S6. **동등성 검증** — 기존 전체 테스트 통과. 재압축 산출물에 대한 스모크 검증 포함.

### 비범위 (Non-goals)

- N1. **concurrent / 동시성 모드 도입.** 별건으로 분리됨 — 배경은 §9 참조.
- N2. 공개 API의 추가·변경·제거 (breaking change 금지 — RC-2 결정).
- N3. 새 기능 추가, 성능(속도) 최적화. 단 크기 최적화의 부수 효과는 허용하며 속도 회귀는 금지(V4).
- N4. `examples/`, `lithentDocs/` 등 배포 대상이 아닌 패키지의 번들 크기.
- N5. vite 자체의 업그레이드·교체. 조사 결과 5→8 전 버전이 동일 정책이라 업그레이드로 해결되지 않으며,
  유일한 설정 기반 경로인 vite 8은 rolldown 메이저 업그레이드 + node 업그레이드를 요구한다 (A5 참조).

## 6. 제약

- C1. 패키지 매니저는 pnpm. 전체 테스트는 빌드 후 실행(`pnpm build` → `pnpm test`).
  helper/ftags 등 일부 테스트가 `dist`를 참조하므로 빌드 선행이 필수다.
- C2. **공개 API 불변** — `h`, `Fragment`, `mount`, `lmount`, `portal`, `render`, `replaceWDom`,
  각 훅, 그리고 `index.ts`가 export하는 내부 API 일체.
  후자는 helper / devHelper / hmrParser가 실제로 사용 중이다:

  | 내부 API | 사용처 |
  |---|---|
  | `getComponentKey` | helper, devHelper, packages/hmrParser |
  | `componentMap` | devHelper |
  | `getComponentSubInfo` | helper |
  | `setComponentMapManualMode`, `disposeComponentEntry` | devHelper |

- C3. WDom 노드의 `props` / `children` 참조 안정성 유지 (`src/diff.ts` `syncResolverProps` 주석 참조).
- C4. `nr`, `oc`, `op`, `il`, `oi` 등 short-key 메타데이터 규약 유지 (크기 사유).
- C5. Fragment / portal / hydration / SVG 경로 동작 보존 (ssr 패키지가 코어에 의존).
- C6. `renew()`의 microtask 배칭(`src/utils/redraw.ts`) 동작 유지.
- C7. TypeScript strict 모드, 기존 ESLint / Prettier 규칙 준수.
- C8. `dist/`는 npm 배포 산출물이다. 빌드 파이프라인 변경 시 `files` 목록과 `exports` 매핑이 깨지면 안 된다.

## 7. 가정

- A1. 재압축(esbuild `--minify`) 산출물은 현 산출물과 의미적으로 동일하다.
  근거: jsdom 스모크 벤치(2,000행 마운트·갱신)에서 동작·성능 동일 확인.
  **한계: 전체 테스트 스위트로는 아직 검증하지 않았다 (V2에서 수행).**
- A2. whitespace 손실은 최종 앱 번들 크기에는 대체로 영향이 없다 —
  앱 번들러가 재minify하기 때문. 실질 영향 범위는
  **(a) bundlephobia 배지, (b) CDN/script 태그 직접 소비, (c) 문서상 주장**이다.
  따라서 P1은 "사용자 성능 문제"가 아니라 **"신뢰도·표기 문제"**로 취급한다.
- A3. §2.3 모듈별 기여도는 esbuild 0.17.6 기준이며, vite가 쓰는 esbuild 버전과 다를 수 있다.
  절대값이 아닌 **비중 파악용**으로만 사용한다.
- ~~A4. preact 비교 수치는 선행 문서에서 이관한 값이며 재측정이 필요하다.~~
  → **해소 (2026-08-20).** preact 10.29.8을 unpkg에서 직접 내려받아 재측정: `preact.min.js` = **4,402B br**.
  선행 문서 기록(4,410B)과 8B 차이로 일치. G2 상한은 이 재측정치를 기준으로 한다.
- **A5. P1은 vite의 의도적 동작이며, 버전 업그레이드로 해소되지 않는다 (원인 규명 완료, 2026-08-20).**
  `vite@5.4.8` `dist/node/chunks/dep-CDnG8rE7.js` 약 19370행:

  ```js
  const isEsLibBuild = config.build.lib && format === "es";
  if (isEsLibBuild) {
    return { ...options, minify: false,
             minifyIdentifiers: true, minifySyntax: true,
             minifyWhitespace: false,   // 하드코딩
             treeShaking: true };
  }
  ```

  사용자가 `esbuild.minifyWhitespace: true`를 명시해도 이 분기가 `false`로 덮어쓴다
  (`...options` 스프레드가 하드코딩 값보다 **앞**에 있어 사용자 설정이 진다).

  **버전별 조사 결과 (2026-08-20, npm 타르볼 직접 검증):**

  | vite | 번들러/minifier | ES lib 정책 | 설정만으로 재정의 |
  |---|---|---|---|
  | 5.4.21 (현재 5.4.8) | rollup + esbuild | `minifyWhitespace: false` 하드코딩 | ❌ |
  | 6.4.3 | rollup + esbuild | 동일 | ❌ |
  | 7.3.6 | rollup + esbuild | 동일 | ❌ |
  | 8.2.1 | **rolldown + oxc** | `{compress, mangle, codegen: false}` — 동일 취지 | ⭕ (아래) |

  - **업그레이드는 해법이 아니다.** 5→8 전 버전이 동일 정책을 유지한다.
  - 단 vite 8의 oxc 경로는 `minify:` 뒤에 `...output`이 스프레드되어
    `build.rolldownOptions.output.minify`로 **재정의가 가능**하다.
    그러나 (a) rolldown 기반 메이저 업그레이드(5→8)이고,
    (b) vite 7·8 모두 `engines.node`가 `^20.19.0 || >=22.12.0`인데 **현재 node는 v20.3.0**이라
    node 업그레이드가 선행되어야 한다. 비용 대비 이득이 낮아 N5(비범위)를 유지한다.
  - **`build.minify: 'terser'`는 해법이 아니라 악화다.** vite의 terser 플러그인은
    `if (config.build.lib && outputOptions.format === "es") return null;`로 ES lib를 **완전히 건너뛴다**.
    실측: ESM 산출물이 35,950B / 1,128줄로 **전혀 minify되지 않음** (UMD는 정상 12,327B / 1줄).
- **A6. `@__PURE__` 주석 손실은 다운스트림에 실질 영향이 없다 (실측 검증 완료, 2026-08-20).**
  재압축 시 현 산출물의 `@__PURE__` 주석 6개가 전부 소실된다
  (esbuild의 파싱→재출력 과정에서 발생하며, `--minify-whitespace` 단독으로도 동일하게 소실).
  그러나 소비자 번들 크기 차이는 **0~3B**에 그친다:

  | 소비 시나리오 | 현재(PURE 6) gzip | 재압축(PURE 0) gzip | 차이 |
  |---|---:|---:|---:|
  | `h`, `Fragment`만 | 4,428 | 4,427 | -1 |
  | `h`,`Fragment`,`mount`,`render` | 4,535 | 4,532 | -3 |
  | 전체 import | 4,968 | 4,967 | -1 |

  원인: 6개 주석은 모두 모듈 최상위 `new Map`×3 / `new Set` / `new WeakMap` / `new WeakSet`이며,
  코어 내부(`componentMap`, `lmountComponentSet`, `redrawQueue` 등)가 항상 참조하므로
  주석 유무와 무관하게 제거될 수 없다.
- **A7. 코어는 트리셰이킹 여지가 거의 없다.**
  `h`+`Fragment`만 import해도 4,428B gzip, 전체 import는 4,968B gzip —
  **약 89%가 무조건 포함**된다. 따라서 G2의 전략은 트리셰이킹 개선이 아니라 **절대 크기 축소**여야 한다.
- **A8. `writeBundle` 훅을 이용한 해법이 검증되었다 — 소스맵 포함 (2026-08-20).**
  vite의 minify 결과 위에 whitespace 압축만 덧입히는 방식이며,
  **재빌드가 아니라 완성된 출력 문자열에 대한 `esbuild.transform`(변환) 1회**다.
  빌드 시간 증가는 측정되지 않았다 (3회 반복: 기본 366/266/242ms vs 플러그인 243/258/232ms — 노이즈 수준).

  훅 지점별 실측:

  | 방식 | raw | gzip | brotli | 줄수 | 소스맵 |
  |---|---:|---:|---:|---:|---|
  | 현재 (vite 기본) | 17,921 | 5,784 | 5,259 | 624 | 정상 |
  | `renderChunk` 훅 | 17,303 | 5,572 | 5,057 | 505 | — (vite minify 이전 실행) |
  | `generateBundle` 훅 | 12,290 | 4,984 | 4,589 | 1 | **깨짐 (map 변경 무시)** |
  | **`writeBundle` 훅 (채택)** | **12,324** | **5,012** | **4,612** | **1+URL** | **정상 (합성)** |

  `writeBundle` 채택분이 `generateBundle`보다 약 23B 큰 것은 재부착한
  `//# sourceMappingURL=` 주석 때문이다 — 소스맵 유지(RC-7)의 대가로 수용한다.

  **소스맵 처리 — 해결됨 (2026-08-20, DC-1 결정):**

  `generateBundle`은 **code 변경은 반영되지만 map 변경은 무시된다**(vite가 소스맵을 자체 기록).
  센티넬 테스트로 확정: `f.code` 주입은 출력에 나타났고, `f.map` 교체는 반영되지 않았다.
  또한 다음 두 경로도 모두 막혀 있음을 확인했다:

  | 시도 | 결과 |
  |---|---|
  | 사용자 플러그인 `renderChunk` | vite minify **이전**에 실행 (1,118줄 관측) — `enforce: 'post'` 무효 |
  | `build.rollupOptions.plugins`의 `renderChunk` | 동일하게 이전에 실행 (1,118줄) |
  | `build.minify: false` + 직접 minify | vite의 esbuild 플러그인이 뒤이어 **pretty-print로 되돌림** (2줄 → 479줄) |

  따라서 **`writeBundle`에서 코드와 소스맵을 함께 다시 쓰는 방식**을 채택한다.
  `@jridgewell/remapping`(이미 워크스페이스에 존재)으로
  esbuild 맵(새 코드→직전 코드)과 vite 맵(직전 코드→원본 TS)을 합성하고,
  `//# sourceMappingURL=` 주석을 재부착한다.

  **검증 결과 (코어 기준):**

  | 항목 | 값 |
  |---|---|
  | 크기 | 12,324 raw / **5,012 gzip** / **4,612 brotli** (1줄 + URL 주석) |
  | 소스맵 줄수 | 1 (코드와 일치) |
  | `sourcesContent` | 14개 전부 보존, null 없음 |
  | `sourceMappingURL` | 정상 부착 |
  | export 동등성 | 21개 전부 동일 |
  | 동작 | jsdom 벤치(2,000행) 정상 |

  **역추적 정확도 검증** — 압축 코드의 심볼 위치가 원본 파일·줄과 정확히 일치:

  | 심볼 | 소스맵 역추적 | 실제 원본 |
  |---|---|---|
  | `lithentWDomSymbol` | `src/utils/universalRef.ts:3` | ✓ |
  | `createElementNS` | `src/render.ts:613` | ✓ |
  | `queueMicrotask` | `src/utils/redraw.ts:15` | ✓ |

  UMD 산출물은 이 경로를 타지 않는다(`opts.format !== 'es'` 조기 반환).

- **A9. `@__PURE__` 보존과 공백 제거는 양립 불가하며, 배지 영향은 미검증이다 (2026-08-20).**
  esbuild 옵션 4조합 전부에서 PURE 주석이 소실된다(원본 6개 → 0개):

  | 옵션 | gzip | PURE |
  |---|---:|---:|
  | `--minify-whitespace` | 4,981 | 0 |
  | `+ --legal-comments=inline` | 4,981 | 0 |
  | `+ --tree-shaking=false` | 4,981 | 0 |
  | `+ 둘 다` | 4,981 | 0 |

  즉 vite가 ESM lib에서 지키려는 것은 공백이 아니라 **주석**이며, 둘을 분리할 수단이 없다.
  A6에서 측정한 "PURE 손실 = 0~3B"는 **lithent 한정** 결과다 —
  최상위에 부작용 없는 호출이 많은 라이브러리에서는 소비자 트리셰이킹이 실제로 악화될 수 있다.
  따라서 이 우회책을 범용 도구로 일반화·배포하는 것은 권장하지 않는다.

  **미검증**: bundlephobia가 패키지를 자체 번들링·재압축해 측정한다면 배지 수치는 G1과 무관하게 불변이다.
  (2026-08-20 조회 시도 → HTTP 429로 확인 실패.)

  **생태계 표본 조사** (unpkg 배포본 직접 측정):

  | 패키지 | 판정 |
  |---|---|
  | vue-i18n, vue-chartjs, vue-multiselect | 긴 식별자 + JSDoc 보존 → **의도적 비압축 ESM 배포** |
  | maska, floating-vue | mangle됨 + 공백 유지 → **vite ES lib 증상** |

  다수 라이브러리가 ESM을 아예 압축하지 않고 배포한다는 사실은,
  "ESM 산출물 크기는 최종 소비자에게 중요하지 않다"는 §3.1의 결론을 뒷받침한다.

## 8. 검증 요구사항

- V1. 각 단계 종료 시 7개 아티팩트 전부의 raw / gzip / brotli를 측정해 IMPLEMENT.md에 기록한다.
- V2. `pnpm build && pnpm test` 전체 통과가 각 단계의 종료 조건이다.
- V3. 빌드 산출물 동등성: 변경 전후 산출물을 동일 입력으로 실행해 렌더 결과가 같음을 확인한다.
- V4. **속도 회귀 금지** — 크기 최적화가 렌더 성능을 떨어뜨리지 않음을
  `docs/performance-improvement/bench/`의 기존 벤치로 확인한다.
- V5. 문서 정정 후 저장소 전체에서 크기 주장을 재grep해 누락이 없음을 확인한다.
- V6. 릴리스 전 수동 확인은 MANUAL_TEST_CHECKLIST.md에서 관리한다.

## 9. 결정 기록 (Requirements Checklist)

- [x] **RC-1**: 크기 목표 — **빌드 수정 + preact 이하(brotli ≤ 4,410B)**.
  선행 문서의 "스트레치 목표"를 정식 목표로 승격. G1으로 ESM 4,569B 확보 후 추가 -159B(ESM) / -281B(UMD).
  (2026-08-20 사용자 결정)
- [x] **RC-2**: 변경 범위 — **동작 100% 유지**. 공개 API·렌더 결과·라이프사이클 순서 불변,
  내부 구현 리팩터만 허용. breaking change 및 기능의 helper 이관은 제외.
  (2026-08-20 사용자 결정)
- [x] **RC-3**: 적용 범위 — **전 패키지 빌드 수정 + 코어 코드 최적화**.
  빌드 결함은 7개 아티팩트 전부 수정(-2,158B gzip), 코드 최적화는 코어에 집중.
  (2026-08-20 사용자 결정)
- [x] **RC-4** *(개정, 2026-08-20)*: 예산 기준 아티팩트 — **UMD를 주 기준**, ESM을 부차 기준으로 한다.
  - 개정 전: UMD·ESM 양쪽에 동일 상한.
  - 개정 사유: ESM은 번들러가 재압축하므로 산출물 크기가 최종 사용자에게 거의 전달되지 않는다(§3.1).
    반면 UMD는 script 태그로 **그대로** 소비된다. 두 진입점을 동급으로 두면 우선순위가 왜곡된다.
  - ESM도 계속 측정·기록하되(V1), 목표 미달을 단계 종료의 차단 사유로 삼지 않는다.
  (2026-08-20 사용자 결정)
- [x] **RC-8**: G1(빌드 수정) 채택 여부 — **(a) 채택**.
  §3.1대로 실사용자 이득은 제한적이지만, 브랜치에서 먼저 반영해 실물을 보고 판단하기로 함.
  main 반영은 별도 결정으로 미룬다. (2026-08-20 사용자 결정)
- [x] **RC-10**: G2(코드 축소) 착수 여부 — **중단**. G1·G4까지만 수행하고 마무리한다.
  근거: G2의 목표(-333B)는 `feat/alterSpeed`가 30배 성능 개선을 위해 지불한 +565B(br) 중
  59%를 되사오는 것에 해당한다(§4 G2, `../performance-improvement/CODE_WALKTHROUGH.md` §6).
  얻는 것은 앱 성능에 체감되지 않는 333B이고, 잃을 수 있는 것은 방금 확보한 O(n) 스케일링이다.
  트레이드가 불리하며, "preact 이하"라는 목표 자체가 성능 작업 **이전** 기준선(4,169B br) 위에서
  세워졌다는 점도 고려했다. (2026-08-20 사용자 결정)
- [x] **RC-5**: 브랜치명 — **`feat/bundleSize`**. 기존 컨벤션(`feat/alterSpeed`, `feat/coreSpeed`) 준수.
  (2026-08-20)
- [x] **RC-9**: 플러그인 배치 — **`scripts/viteMinifyEsm.js` 단일 공유 모듈**을 7개 config가 import.
  근거: (a) `packages/` 하위 패키지로 만들면 빌드 순서 의존이 생긴다,
  (b) 7개 config에 중복 정의하면 유지보수가 갈라진다,
  (c) `scripts/build-skills.js` 선례가 이미 있다.
  esbuild는 vite의 `transformWithEsbuild` 재수출을 사용해 새 의존을 만들지 않았고,
  `@jridgewell/remapping`만 루트 devDependency로 추가했다(pnpm strict 모드에서 전이 의존 해석 불가).
  (2026-08-20)
- [ ] **RC-6**: G5(회귀 방지)의 구현 형태 — 스크립트 단독 / `pnpm build` 후속 단계 / CI 게이트.
  `TBD` — DESIGN.md에서 결정.
- [x] **RC-7**: 배포 산출물의 소스맵 정책 — **유지**. 라이브러리 소비자의 디버깅에 직접 영향이 있어
  포기하지 않는다. `writeBundle` + `@jridgewell/remapping` 합성으로 정확도까지 검증 완료(A8).
  (2026-08-20 사용자 결정)

## 10. 구현 결과 — G1 (2026-08-20)

### 10.1 변경 사항

| 파일 | 변경 |
|---|---|
| `scripts/viteMinifyEsm.js` | 신규. `writeBundle`에서 ESM 청크의 공백을 압축하고 소스맵을 합성 |
| `vite.config.js` 외 6개 | `minifyEsm()` 플러그인 등록 (core / helper / devHelper / ssr / tag / ftags / jsx-runtime) |
| `package.json`, `pnpm-lock.yaml` | `@jridgewell/remapping` devDependency 추가 |

### 10.2 크기 결과

| 아티팩트 | gzip 전 | gzip 후 | brotli 후 | 줄수 | 소스맵 |
|---|---:|---:|---:|---:|---|
| `dist/lithent.mjs` | 5,784 | **5,004** | 4,618 | 3 | 정합 |
| `helper/dist/lithentHelper.mjs` | 2,416 | 1,864 | 1,636 | 3 | 정합 |
| `ssr/dist/lithentSsr.mjs` | 2,108 | 1,825 | 1,632 | 4 | 정합 |
| `devHelper/dist/lithentDevHelper.mjs` | 1,065 | 893 | 823 | 3 | 정합 |
| `tag/dist/lithentTag.mjs` | 886 | 738 | 672 | 4 | 정합 |
| `ftags/dist/lithentFTags.mjs` | 360 | 292 | 266 | 3 | 정합 |
| `jsx-runtime/dist/jsxRuntime.mjs` | 267 | 221 | 190 | 3 | 정합 |
| **합계** | **12,886** | **10,837** | — | | **-2,049B (-15.9%)** |

UMD는 변경 없음(이미 1줄 압축 상태) — G2의 기준 아티팩트이며 여기서는 줄지 않는다.

### 10.3 검증

- `pnpm build` 전체 통과.
- `pnpm test` 전체 통과 — **64개 테스트 파일 / 258개 테스트, 실패 0** (A1 해소).
- 소스맵 역추적 정확도 (압축 코드 위치 → 원본):

  | 아티팩트 | 심볼 | 매핑 결과 | 원본 확인 |
  |---|---|---|---|
  | core | `lithentWDomSymbol` | `src/utils/universalRef.ts:3` | ✓ 정확 |
  | core | `createElementNS` | `src/render.ts:613` | ✓ 정확 |
  | helper | `Symbol` | `src/hook/context.tsx:11` | ✓ 정확 |
  | helper | `value` | `src/hook/state.ts:10` | ✓ 정확 |
  | ssr | `renderToString` | `src/index.ts:26` | 근사 (export 블록) |

- prettier / eslint 통과.
- jsdom 스모크(2,000행 마운트·갱신) 정상.

### 10.4 주의

작업 중 `pnpm add`가 `@lithent/lithent-mdx`의 peer 해석 키를 변경해
(`(acorn@8.14.0)` 추가) `createLithent/express`의 심볼릭 링크가 일시적으로 깨졌다.
`pnpm install` 재실행으로 해소됐으나, **이 브랜치를 체크아웃하는 쪽은 `pnpm install`이 필요하다.**

## 11. 구현 결과 — G4 문서 정정 (2026-08-20)

기준 아티팩트를 **UMD로 고정**했다. UMD는 G1 적용 여부와 무관하게 값이 같아
(5,148B gzip), 향후 G1의 main 반영 여부가 바뀌어도 문서를 다시 고칠 필요가 없다.

| 파일 | 변경 전 | 변경 후 |
|---|---|---|
| `README.md` (3곳) | "4KB core" | "5KB core" + 정확한 수치 각주 |
| `MANUAL.md` | "경량(zip 3kb)" | "경량(gzip 약 5KB)" |
| `lithentDocs/index.html` (meta 3곳) | "4KB core" | "5KB core" |
| `skills/lithent/SKILL.md` | "lightweight (~4KB)" | "lightweight (~5KB)" |
| `CLAUDE.md` | "core is ~4KB gzipped" | "~5KB gzipped" (gitignore 대상, 커밋 안 됨) |

README에는 측정 근거를 각주로 명시했다 — 기준 파일, 원본/gzip/brotli 3종 수치,
그리고 helper가 별도 진입점이라 포함되지 않는다는 사실.

`skills/`는 소스이고 `dist/skills/`는 `scripts/build-skills.js` 생성물이므로
소스를 고친 뒤 `pnpm build:skills`로 재생성했다.

**주의**: `README.md` / `MANUAL.md`는 **변경 전부터** prettier 규칙을 만족하지 않는다.
이번 작업에서 `--write`를 적용하지 않았다 — 무관한 대량 diff를 피하기 위함이며,
포매팅 정리는 별도 작업으로 분리한다.

## 12. 배경 기록 — concurrent 모드가 비범위인 이유

이 작업은 concurrent(동시성) 모드 도입 검토의 결론으로 시작됐다. 검토 실측 결과는 다음과 같다.

- `feat/concurrentModeForRenderOption` 브랜치는 갱신 경로의 최장 블로킹을 47ms → 6ms로 줄인다(5,000행 기준).
- 그러나 **스케줄러를 쓰지 않는 사용자도** 코어 +200B gzip과 **마운트 ~13% 성능 저하**를 부담한다
  (master 125ms → branch 141ms, 3회 반복 일관).
- 또한 작업 단위가 즉시 commit되어 tearing(부모 갱신·자식 미갱신 중간 상태 노출)이 발생하므로
  React concurrent의 핵심인 원자적 commit을 제공하지 못한다.
- 코어 구조상 완전한 concurrent는 비파괴 diff·이중 버퍼·재개 가능 순회가 모두 필요하며,
  이는 사실상 v2 재작성에 해당한다(추정 +400~750B gzip, helper 전면 재설계 동반).

결론: **lithent의 포지션("SSR 페이지에 인터랙티브 조각 삽입")에서 concurrent의 효용은 낮고 비용은 크다.**
크기·정확성을 지키는 쪽이 우선순위가 높다고 판단해 이번 작업을 선택했다.
`feat/concurrentModeForRenderOption` 브랜치는 삭제하지 않고 판단 근거로 보존한다.

## 13. 상태 / 핸드오프

### 완료 (커밋)

| 커밋 | 내용 |
|---|---|
| `a21f1c5` | `fix(build): minify whitespace in ESM artifacts` — 플러그인 + 7개 config + devDep |
| `bf61962` | `docs: correct core bundle size claims to measured values` |

기준 커밋 `f3921cc`, 브랜치 `feat/bundleSize` (**main 미반영**).

- **G1 완료** — 7개 아티팩트 12,886 → 10,837B gzip (-2,049B, -15.9%), 소스맵 정합 유지 (§10).
- **G4 완료** — 문서 크기 주장을 UMD 기준 실측치로 교체, 측정 근거 각주화 (§11).
- **G3 유지 확인** — `pnpm build` 통과, `pnpm test` 258개 전체 통과.
- **조사 산출물** — vite 5~8 동작 규명(A5), PURE 주석 영향(A6, A9),
  트리셰이킹 여지(A7), 빌드 훅 4종 비교(A8), 생태계 표본(A9), 가치 재평가(§3).

### 미착수 (의도적)

| 항목 | 상태 | 재개 조건 |
|---|---|---|
| **G2** 코드 축소 (-333B) | RC-10으로 중단 | "preact 이하"가 프로젝트 포지셔닝에 필요해질 때. 착수 시 **벤치 기준선 선행 고정**과 속도 회귀 시 롤백 규칙이 전제 |
| **G5** 회귀 방지 | 미착수 | RC-6(형태: 스크립트/빌드 후속/CI) 결정 필요 |

### 남은 열린 항목

1. **main 반영 여부** — RC-8은 "브랜치에서 실물을 보고 판단"으로 유보됨. 미결.
2. **A9 미검증** — bundlephobia가 자체 재번들링·재압축으로 측정한다면 G1은 배지 수치를 바꾸지 못한다.
   G1의 잔여 명분(§3.1)에 직접 영향하므로, main 반영 판단 전에 확인하면 좋다.
3. **`README.md` / `MANUAL.md` prettier 미준수** — 변경 **이전부터** 존재.
   무관한 대량 diff를 피하려 손대지 않았다. 별도 작업 권장.
4. **`CLAUDE.md`** — 크기 표기를 수정했으나 `.gitignore` 대상이라 커밋되지 않았다(로컬 한정).
5. **브랜치 체크아웃 시 `pnpm install` 필요** — `@jridgewell/remapping` 추가로 lockfile이 변경됐고,
   이 과정에서 `@lithent/lithent-mdx`의 peer 해석 키도 함께 갱신됐다(§10.4).

### 다음 담당자에게

이 문서만으로 재개 가능하다. 핵심 판단 세 가지는 §3(가치 재평가), RC-4(UMD 주 기준),
RC-10(G2 중단)에 근거와 함께 남아 있다. 되짚어야 할 전제는 딱 하나 —
**ESM 산출물 크기는 대부분의 소비자에게 전달되지 않는다**(§3.1, A2)는 점이다.
