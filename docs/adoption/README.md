# 도입 승인 체크리스트

- 작성일: 2026-10-07
- 출처: [../ideas/IDEAS.md](../ideas/IDEAS.md) §2.2, 우선순위 3
- 상태: **문서로 끝나는 항목 초안 작성. 약속이 들어간 문장은 메인테이너 확정 필요(아래 "확정 필요").**

기업이 라이브러리를 들여올 때 기능과 무관하게 확인하는 항목들이다. 위젯 하나를 심는 경우에도
보안팀과 아키텍트는 아래 질문에 대한 답을 요구한다.

## 항목별 상태

| 항목 | 심사자의 질문 | 산출물 | 상태 |
|---|---|---|---|
| 지속성 | 2년 뒤에도 유지되나. 메인테이너가 한 명인데 괜찮나 | [VERSIONING.md](./VERSIONING.md) | 초안 — 확정 필요 |
| 보안 | CSP 페이지에서 도나. 취약점은 어디로 신고하나 | [/SECURITY.md](../../SECURITY.md), [SECURITY_REVIEW.md](./SECURITY_REVIEW.md), `e2e/csp.spec.ts` | 작성·검증 완료 — 신고 창구 활성화 필요 |
| 탈출구 | 나중에 걷어낼 수 있나 | [EXIT.md](./EXIT.md) | 작성 완료 |
| 테스트 | 이걸로 만든 컴포넌트를 어떻게 테스트하나 | `lithent/test` (render·쿼리·이벤트 유틸) | 대기 — 설계 필요 |
| 성능 증거 | "가볍다"는 근거가 제3자 숫자로 있나 | js-framework-benchmark 등재, 저사양 기기 실측 | 진행 중 — 로컬 측정·원인 분석 완료, 등재 보류 — [../benchmark/STATUS.md](../benchmark/STATUS.md) |
| 레퍼런스 | 실제로 쓰는 곳이 있나 | 실서비스 사례 1~2건 | 대기 — 적용처 필요 |

## 확정 필요

문서에 적었지만 메인테이너만 약속할 수 있는 것들이다. 확정 전까지는 제안이다.

1. **지원 범위** — "현재 major의 최신 minor에만 보안 수정" ([/SECURITY.md](../../SECURITY.md), [VERSIONING.md](./VERSIONING.md) §2).
2. **응답 기한** — 취약점 신고 접수 확인 7일 ([/SECURITY.md](../../SECURITY.md)).
3. **신고 창구** — GitHub 비공개 취약점 신고. 저장소 설정에서 꺼져 있다(2026-10-07 확인).
   Settings → Code security → Private vulnerability reporting을 켜야 `SECURITY.md`의 링크가 동작한다.
4. **deprecation 기간** — 제거 전 최소 1개 minor 동안 경고 ([VERSIONING.md](./VERSIONING.md) §1).

## 이 작업에서 고친 것

- `renderToString`이 속성 값을 이스케이프하지 않던 문제 (`ssr/src/renderToString.ts`).
  값에 `"`가 있으면 속성 밖으로 빠져나가 마크업으로 해석됐다. 아직 릴리스되지 않았다.

## 공개 위치

여기 문서는 저장소 안의 초안이다. 심사자가 읽는 곳은 문서 사이트이므로, 확정 후 `lithentDocs`에
영어·한국어 페이지로 옮긴다. `SECURITY.md`만 GitHub 관례에 따라 루트에 영어로 두었다.
