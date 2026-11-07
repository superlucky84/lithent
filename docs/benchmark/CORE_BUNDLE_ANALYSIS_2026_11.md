현재 코어는 더 줄일 수 있지만, 확인된 효과는 **기존 코드의 작은 재작성은 한 자릿수 B, Vite 8 전환은 UMD 약 1.8%와 작은 앱 약 4.3%**다. Vite 5의 패치 업데이트나 6·7 전환만으로는 코어 UMD가 줄지 않았다. 수백 B 이상을 목표로 한다면 기능별 의존 관계를 바꾸는 설계가 다음 조사 대상이다. 이것이 가능한 모든 코드 최적화의 상한이라는 뜻은 아니다.

2026-11-07, HEAD `d594983`의 base 코어를 분석했다. Node `24.22.1`, zlib `1.3.2.1-motley-285e94b`, gzip level 9, Node 기본 Brotli를 사용했다. `lithentConcurrent`의 추가 축소는 이번 측정 범위에 포함하지 않았다. 런타임 소스·제품 빌드 설정·루트 의존성·`pnpm-lock.yaml`·`dist`는 변경하지 않았다.

측정·검증·재현 자료는 [실험 디렉터리](../../experiments/core-bundle-analysis/README.md), [용량 원자료](../../experiments/core-bundle-analysis/results.json), [동작 검증](../../experiments/core-bundle-analysis/verification.json)에 있다.

**비교 기준은 저장돼 있던 dist가 아니라 현재 소스의 재빌드다.**

| base UMD                                |     raw |   gzip | Brotli |
| --------------------------------------- | ------: | -----: | -----: |
| 작업 시작 시 기존 `dist/lithent.umd.js` | 12,741B | 5,167B | 4,798B |
| 현재 소스 + 현재 Vite 설정              | 13,015B | 5,325B | 4,925B |

기존 dist는 현재 소스의 산출물이 아니다. `scripts/size-report.js`를 재빌드 없이 실행하면 127B 여유로 보이지만, 현재 소스는 4,925B 예산에 정확히 닿는다. 이번 대조군의 ESM/UMD/CJS는 실제 `vite.config.js`를 로드해서 다시 생성한 JS와 모두 byte/hash가 같았다. 그 확인에서는 checker와 선언 생성 플러그인만 제외했다. 업그레이드 후보의 전체 release build를 통과했다는 뜻은 아니다.

**Vite 8은 실제 절감이 있지만, Vite 5·6·7 사이에는 UMD 차이가 없었다.**

| Vite                           | base UMD raw |   gzip | Brotli |  현재 대비 Brotli |
| ------------------------------ | -----------: | -----: | -----: | ----------------: |
| 현재 5.4.8                     |      13,015B | 5,325B | 4,925B |              기준 |
| 5.4.21                         |      13,015B | 5,325B | 4,925B |                0B |
| 6.4.5                          |      13,015B | 5,325B | 4,925B |                0B |
| 7.3.7                          |      13,015B | 5,325B | 4,925B |                0B |
| 8.3.6, 버전 기본 타깃          |      12,586B | 5,211B | 4,828B |     −97B / −1.97% |
| 8.3.6, 기존 브라우저 타깃 유지 |      12,589B | 5,211B | 4,835B | **−90B / −1.83%** |

기존 타깃은 `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`로 고정했다. 기본 타깃을 높인 효과와 도구 변경 효과를 섞지 않기 위해 두 경우를 따로 쟀다. 현재 Vite에서 `target: 'esnext'`만 바꾼 결과는 현재 산출물과 정확히 같았다.

현재 파이프라인은 Rollup 4.24.0 + esbuild 0.21.5다. 격리 설치한 Vite 5 최신 패치·6·7은 Rollup 4.68.0을 사용했지만 UMD 결과는 여전히 같았다. Vite 8은 Rolldown 1.2.16과 Oxc 기반 도구를 사용한다. Vite만의 독립 효과를 분리한 실험이 아니라 각 버전의 실제 도구 조합 비교다. 엔진 전환은 [공식 마이그레이션 문서](https://vite.dev/guide/migration)에 설명돼 있다.

라이브러리 ESM 파일은 배포 시점에 최종 앱과 다시 번들링된다. 현재 ESM은 raw 19,424B / Brotli 6,007B다. Vite 8 기존 타깃의 실제 `src/` 빌드는 raw 16,967B / Brotli 5,273B였다. 격리 사본의 ESM에는 더 긴 소스 경로 주석이 들어가 raw 17,021B / Brotli 5,299B가 됐다. 이 차이는 첫 소스 경로 주석뿐이며 UMD/CJS는 사본과 실제 경로의 출력이 같았다. ESM 파일 자체의 감소를 사용자의 최종 다운로드 절감으로 그대로 환산하면 안 된다.

**최종 앱으로 다시 번들해도 Vite 8의 감소가 확인됐다.**

모든 앱은 같은 기존 브라우저 타깃, sourcemap 비활성, 하나의 JS 진입점으로 빌드했다. HTML modulepreload 코드, CSS, helper는 넣지 않았다. 아래는 해당 사용례 전체 JS의 Brotli이며 순수 라이브러리만의 크기가 아니다.

| 사용례                       | 현재 Vite로 라이브러리·앱 빌드 | Vite 8로 라이브러리·앱 빌드 |             감소 |
| ---------------------------- | -----------------------------: | --------------------------: | ---------------: |
| `ref(0)`만 사용              |                            52B |                         43B |               9B |
| `h('p', {}, 'hello')`만 사용 |                         4,501B |                      4,309B |             192B |
| `h` + `render`, 정적 문단    |                         4,550B |                      4,369B |             181B |
| `mount` + 클릭 카운터        |                         4,599B |                      4,400B | **199B / 4.33%** |
| 모든 API를 namespace로 유지  |                         5,016B |                      4,789B |             227B |

라이브러리만 Vite 8로 빌드하고 소비자 앱은 Vite 5에 두면 카운터는 4,599→4,550B, 49B 감소였다. 위 199B 전부를 라이브러리 제작자의 Vite 업데이트 효과라고 볼 수는 없다. 사용자의 앱 빌더도 영향을 준다. 이 작은 카운터의 비율을 모든 실제 앱에 일반화하지 않는다.

**코드에서 가장 큰 제약은 `h`·컴포넌트 갱신·diff·DOM 렌더러가 연결돼 있다는 점이다.**

`src/wDom.ts`는 `makeNewWDomTree`와 `wDomUpdate`를 가져온다. `h`는 컴포넌트 태그도 처리하고, 그 컴포넌트는 `renew`를 통해 `replaceWDom`에 도달한다. `replaceWDom`이 diff와 DOM 갱신을 호출하므로 번들러는 문자열 태그만 사용한 작은 앱에서도 이 일반 경로를 유지한다.

```mermaid
flowchart LR
  H["h: 요소 또는 컴포넌트 생성"] --> C["컴포넌트 resolve / renew"]
  C --> W["replaceWDom"]
  W --> D["makeNewWDomTree / diff"]
  W --> R["wDomUpdate / DOM 렌더러"]
  D --> R
  D --> H
```

이것은 단순히 순환 import가 있다는 이유만의 문제가 아니다. 진입점에서 실제로 도달하는 함수 참조가 연결돼 있다. 파일을 나누거나 barrel export를 없애는 작업만으로 이 참조가 사라지지는 않는다. 원본 소스에서 앱을 직접 빌드한 정적 예제도 4,550B로 배포 ESM을 거친 경우와 같았다.

| 모듈                      | Rollup `renderedLength` |
| ------------------------- | ----------------------: |
| `src/render.ts`           |                  14,270 |
| `src/wDom.ts`             |                   6,510 |
| `src/diff.ts`             |                   5,663 |
| `src/utils/predicator.ts` |                   3,246 |

앞의 세 모듈이 전체 36,994 중 약 71.5%다. 이 값은 최종 minify·압축 이전의 코드 기여 지표이며 모듈별 전송 바이트가 아니다. 코어 산출물의 모듈 16개에는 외부 런타임 라이브러리가 없었다. `sideEffects: false`와 Rollup 트리 셰이킹도 이미 적용돼 있다. 실제로 `ref`만 사용하면 코어가 제거되므로 트리 셰이킹 전체가 고장 난 상태는 아니다.

추가로 `entries`, `assign`, `setRedrawAction`은 현재 빌드에서 이미 제거된다. 이 소스 코드를 지우는 정리 작업은 코어 전송량을 줄이지 않는다. 타입 선언과 별도 `.map` 파일, npm 패키지에 동봉한 helper/SSR/example 소스도 이 UMD 전송량에는 포함되지 않는다.

**작은 소스 변경은 직접 만들어 비교했지만 이득이 작았다.**

| 격리 소스 후보                                                | UMD Brotli | 현재 대비 |
| ------------------------------------------------------------- | ---------: | --------: |
| 현재                                                          |     4,925B |      기준 |
| 조상 탐색의 중첩 재귀 함수를 반복문으로 변경                  |     4,918B |       −7B |
| `isPropType`의 own Symbol 확인을 `hasOwnProperty.call`로 변경 |     4,921B |       −4B |
| `getKey`를 optional chaining으로 단축                         |     4,936B |  **+11B** |
| 위 세 변경을 모두 적용                                        |     4,921B |       −4B |

`syncAncestorComponentChildren`은 `Set`과 순회·splice 순서를 유지하면서 다음과 같이 중첩 함수를 없앨 수 있다.

```ts
const visited = new Set<WDom>();
while (parent && !visited.has(parent)) {
  visited.add(parent);
  if (parent.compChild) {
    const index = parent.compChild.indexOf(prevChild);
    if (index !== -1) parent.compChild.splice(index, 1, nextChild);
  }
  parent = parent.getParent ? parent.getParent() : undefined;
}
```

함수 AST 노드는 171→170으로 하나 줄었고 동작 비교도 통과했다. 그러나 7B의 용량 이득만으로 우선 반영할 정도는 아니다. 이 변경의 CPU·heap 효과는 측정하지 않았다. own Symbol 후보 역시 일반 객체의 판별은 유지하지만 Proxy에 대해 `ownKeys` 대신 descriptor 조회를 하므로 관찰 가능한 차이가 있다. 4B를 위해 공개 `isPropType`의 이 동작을 바꾸는 것은 추천하지 않는다.

`getKey` 후보는 소스가 짧아져도 결과가 커진 사례다. Brotli는 반복되는 긴 패턴을 잘 압축하므로 공통 함수 추출·별칭·표현식 단축의 raw 절감과 전송량 절감은 일치하지 않는다. 후보별 절감량도 더해서 예상할 수 없다.

**압축 설정에 남은 여유도 수십 B 수준이었다.**

| 출력 후보                                     | UMD Brotli | 현재 대비 | 판단                             |
| --------------------------------------------- | ---------: | --------: | -------------------------------- |
| Terser 5.18.1→5.51.2, 같은 제한 구문 옵션     |     4,912B |      −13B | 작은 후보; 전용 검증 후 선택     |
| `sourcemap: 'hidden'`                         |     4,896B |      −29B | JS 끝의 map 연결 주석만 생략     |
| Terser 기본 compress 전체                     |     4,857B |      −68B | 기존 함수 scope 보호 정책과 충돌 |
| 주요 inline/변수 이동 옵션을 끈 추가 compress |     4,936B |      +11B | 용량상 채택 근거 없음            |

compress 비교에는 같은 `sourceMappingURL`을 유지하고 source map을 다시 생성했다. 주석을 제거한 효과를 compress 효과로 섞지 않았다. hidden map은 `.map` 자체를 계속 생성하지만 브라우저 자동 연결을 잃는다. 서버가 map을 전송하지 않는 운영 환경이라면 map 파일 삭제가 JS 크기를 90KB 줄여 주는 것은 아니다. [공식 build 옵션](https://vite.dev/config/build-options)에 관련 동작이 명시돼 있다.

현재 `vite.config.js`는 오래된 diff tree를 붙잡지 않도록 독립 parent getter scope를 유지하는 이유로 기본 compress를 제한한다. 기본 compress 전체는 함수 노드 171→170, 자체 변수에 결합된 함수 121→90으로 바뀌었다. Vite 8도 함수 수 171은 유지하지만 변수 결합 수는 118이어서, 기존 압축과 같은 scope라고 단정할 수 없다. 이 AST 수치는 진단 지표이며 GC 안정성이나 메모리 누수의 증거가 아니다. 최신 Terser의 제한 구문 후보는 171/121을 유지했다.

**크게 줄이는 후속 설계는 기능 경계를 명시하는 방향이 유효하다. 절감량은 아직 미측정이다.**

- 정적 문서·위젯 수요가 있다면 컴포넌트 갱신을 참조하지 않는 별도 static 진입점이나 컴파일러 경로를 조사한다. 기존 `h`를 파일만 옮기는 방식으로는 충분하지 않다. 일반 `h`의 동작과 자동 JSX runtime이 어느 경로를 선택할지도 설계해야 한다.
- hydration은 `render`의 네 번째 인자로 코어 렌더러 내부에 들어온다. `ssr/src/hydration.ts`가 이를 실제 사용하므로, 사용하지 않는 앱에서 없애려면 의존성 주입 또는 별도 렌더 경로가 필요하다. 기능 삭제나 기존 인자 무시는 호환되는 최적화가 아니다.
- portal, custom element accessor/upgrade, lifecycle 처리도 일반 렌더 경로에 섞여 있다. 선택 기능으로 분리할 수 있는지는 조사할 만하지만, 플러그인 등록 테이블·간접 호출이 오히려 크기와 실행 비용을 늘릴 수 있다.
- WDom 필드의 추가 property mangling은 공개 타입뿐 아니라 helper·devHelper·SSR 등이 읽는 객체 계약을 바꾼다. compact13의 초기 `undefined` 필드를 지우는 변경 역시 현재의 동일 객체 layout 정책과 충돌한다. 현재 스키마와 keyed LIS·bulk removal 최적화를 단순 삭제한 결과를 동일 기능의 개선이라고 볼 수 없다.

**Vite 8 전환은 루트 버전 문자열만 바꾸는 작업보다 범위가 넓다.**

2026-11-07 npm 조회에서 최신 안정 버전은 8.3.6이었다. [공식 지원 범위](https://vite.dev/releases)에 따르면 5.x는 지원이 끝났고 8.3은 일반 패치, 7.3은 중요·보안 수정, 6.4는 보안 수정을 받는다. 따라서 업그레이드는 크기뿐 아니라 유지보수 관점에서도 검토할 근거가 있다. 프로젝트가 고정한 Node 24.22.1은 이번에 비교한 Vite의 엔진 조건을 충족했다.

1. `vite.config.js`의 `build.rollupOptions`를 `build.rolldownOptions`로 옮기고, 지원되지 않는 `treeshake.tryCatchDeoptimization`을 정리한다. 기존 옵션을 그대로 넘기면 실제로 경고가 났다. 이를 제거하고 native 옵션으로 재빌드해도 UMD/CJS 크기와 bytes는 위 Vite 8 기존 타깃 결과와 같았다.
2. `packages/lithentVite`, `packages/lithentTemplateVite`, `packages/lithentMdx`의 Vite peer 범위가 `^5.0.0`이다. 새 버전에서 확인한 뒤 이 범위와 개발 의존성을 함께 갱신해야 소비자 설치에서도 지원을 선언할 수 있다.
3. 템플릿 플러그인의 `transformWithEsbuild`와 `optimizeDeps.esbuildOptions`, HMR 플러그인의 `esbuild.jsx` 설정을 확인한다. Vite 8은 esbuild를 기본 엔진으로 사용하지 않는다. 기존 transform API를 유지한다면 명시적 esbuild 의존성이 필요하고, 장기적으로 Oxc/Rolldown API 전환을 검토한다. 공식 migration은 기존 설정의 일부 호환 변환과 API deprecation을 설명한다.
4. 현재 Vitest 2.1.2는 자체적으로 Vite `^5.0.0`을 의존한다. 루트 Vite만 바꾼 뒤 기존 테스트가 통과해도 새 Vite의 테스트 도구 조합을 검증한 것으로 볼 수 없다. Vitest와 테스트 설정을 함께 확인한다. checker 0.8.0/dts 2.3.0은 peer 범위만으로 Vite 8 불가라고 단정할 수 없으며 실제 선언 생성·lint/typecheck 빌드를 검증해야 한다.
5. UMD 후처리 `renderChunk`의 호출 순서·sourcemap, CJS/ESM export 및 선언 파일, 양코어 satellites, SSR/hydration, HMR `.tsx/.ltsx`, MDX를 확인한다. 엔진이 바뀌므로 기존 parent getter와 retained-tree GC 시나리오, keyed CPU/heap 비교도 필요하다. 이번 빌드 시간은 단일 프로세스의 순차 실행값으로, 성능 비교 자료로 사용하지 않았다.

권장 순서는 **현재 소스의 용량을 CI에서 항상 재빌드해 확인 → Vite 8을 별도 브랜치에서 생태계와 함께 검증 → 큰 절감이 필요할 때 static/선택 기능 경계 조사**다. 최신 Terser나 반복문 재작성은 그 사이에 독립적으로 검토할 수 있지만 확보하는 공간은 작다. 이번 결과만으로 기존 4,925B 예산을 올리거나 압축·기능 정책을 바꿀 이유는 없다.

검증은 기존 루트 테스트 73파일/462개 통과, 후보 UMD 6개에 대한 jsdom 9단계 DOM·23개 lifecycle 로그·오류·exports 일치, Chromium 151의 6번들×9개 호환 시나리오 일치, 3개 최종 카운터 앱의 클릭 갱신, ESM/CJS exports 일치까지 수행했다. 462개 테스트는 변경하지 않은 소스와 기존 도구 조합에 대한 결과다. 업그레이드 후보의 전체 테스트·release build·HMR·SSR/hydration·GC·CPU 벤치마크가 통과했다는 의미로 확대하지 않는다.
