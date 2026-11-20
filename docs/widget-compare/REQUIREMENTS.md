# REQUIREMENTS — 같은 위젯, 네 프레임워크 (widget-compare)

- 브랜치: `ccr-3e48bc24-eapswq` / 기준 커밋 `e80ae93`
- 작성일: 2026-11-20
- 상태: **구현·측정 완료, 병합·배포 전** — [IMPLEMENT.md](./IMPLEMENT.md) 참고
- 관련 문서: [DESIGN.md](./DESIGN.md) → [IMPLEMENT.md](./IMPLEMENT.md) → [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- 출처: [../ideas/IDEAS.md](../ideas/IDEAS.md) §2.1 "외부에 심는 위젯 / SDK", [../widget-template/README.md](../widget-template/README.md) §6-5
- 코드 범위: `showcase/widget-compare/`, `e2e/widget-compare.spec.ts`, CI·문서 배포 연결

## 1. 배경

IDEAS §2.1은 "React SDK는 40KB+, lithent는 4KB + Shadow DOM 격리"를 위젯 자리의 근거로 삼는다.
지금까지 이 문장을 뒷받침하는 측정이 없다. 위젯 템플릿(create-lithent 0.5.0)이 나왔으므로
**같은 위젯**을 다른 프레임워크로 만들어 크기와 로딩을 나란히 보여 줄 수 있다.

증거가 되려면 반박할 곳이 적어야 한다. 그래서:

- 위젯 기능이 같다는 것을 테스트로 보인다.
- 빌드 조건이 같다.
- 커스텀 엘리먼트를 만드는 쪽의 표준 선택지(Lit)를 뺀 "쉬운 상대" 비교를 하지 않는다.
- 결과가 lithent에 불리해도 그대로 싣는다.

## 2. 요구사항

| ID | 요구사항 | 검증 |
|---|---|---|
| RQ-1 | 네 구현(lithent, React, Preact, Lit)이 같은 `<feedback-widget>`이다: 같은 속성·프로퍼티·이벤트·slot·`::part`·CSS 변수, 같은 문구와 CSS | `e2e/widget-compare.spec.ts`가 네 빌드에 같은 시나리오를 돌린다 (CI 3개 브라우저) |
| RQ-2 | lithent 구현은 위젯 템플릿 소스 그대로다 (복사본이 아니다) | 빌드 진입점이 `createLithent/widget/src/main.ts` |
| RQ-3 | 네 빌드가 같은 도구·설정으로 만들어진다 (Vite 라이브러리 모드 IIFE, 같은 target·minify·production 모드) | 빌드 스크립트 하나, 프레임워크별 차이는 JSX import source뿐 |
| RQ-4 | 크기(raw/gzip/brotli)를 빌드할 때마다 새로 잰다 | `dist/sizes.json`, 빌드 로그 |
| RQ-5 | 로딩 시간을 재현 가능한 스크립트로 잰다: 같은 호스트 페이지, 캐시 없음, brotli 전송, 두 프로필(모바일 제한, 제한 없음), 반복 측정의 중앙값과 사분위 | `pnpm --filter lithent-widget-compare measure`, `results.json` |
| RQ-6 | 측정 환경(브라우저·CPU·버전·날짜·커밋·번들 해시)을 결과에 기록하고, 번들이 바뀌었으면 페이지가 알린다 | `results.json`, 페이지의 안내 문구 |
| RQ-7 | 공개 페이지: 크기·로딩 표, 네 위젯을 직접 써 보는 데모, 소스 링크, 측정 방법과 한계 | GitHub Pages `/lithent/widget-compare/` |
| RQ-8 | 위젯을 심은 페이지에 남는 전역 변수를 프레임워크별로 보인다 | E2E가 기대값과 비교, 페이지 표 |

## 3. 비목표

- 앱 전체 렌더 성능 비교 (js-framework-benchmark의 영역, [../benchmark/](../benchmark/) 참고)
- 호스트 페이지에 이미 React가 있는 경우 (위젯이 런타임을 공유하는 구성)
- Svelte·Vue·Solid 등 다른 프레임워크 (후속 후보)
- `@r2wc/react-to-web-component`, `preact-custom-element` 같은 래퍼 라이브러리 비교 (DESIGN DC-3)
- 측정값을 CI에서 매번 다시 재는 일 (공용 러너는 시간 측정이 흔들린다. 크기만 매번 잰다)
