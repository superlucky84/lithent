# 버전·지원 정책 (초안)

- 작성일: 2026-10-07
- 상태: **초안. §1의 deprecation 기간과 §2의 지원 범위는 메인테이너 확정 필요.**

## 1. 버전 규칙

공개 패키지는 semver를 따른다.

| 변경 | 버전 |
|---|---|
| 문서에 있는 API의 제거·시그니처 변경, 문서화된 동작의 비호환 변경 | major |
| API 추가, 새 서브패스 | minor |
| 버그 수정, 성능 개선, 보안 수정 | patch |

- **공개 API의 범위**: 문서 사이트와 각 패키지의 타입 선언(`.d.ts`)에 export된 것.
  `WDom`의 내부 필드처럼 타입에는 보이지만 문서에 없는 것은 공개 API가 아니다.
- **deprecation**: API를 없앨 때는 먼저 minor 릴리스에서 deprecated로 표시하고 대체 방법을
  릴리스 노트에 적는다. 제거는 그 뒤 최소 1개 minor가 지난 다음 major에서 한다.
- **릴리스 노트**: 모든 릴리스는 [/CHANGELOG.md](../../CHANGELOG.md)에 날짜·패키지·버전별로 적는다.

## 2. 패키지와 지원 범위

| 패키지 | 현재 | 안정성 | 보안·버그 수정 |
|---|---|---|---|
| `lithent` | 1.24.0 | 안정 | 1.x의 최신 minor |
| `lithent-concurrent` | 0.1.3 | 0.x — minor에서 비호환 변경 가능 | 최신 릴리스 |
| `create-lithent` | 0.3.4 | 생성기. 생성된 프로젝트는 사용자의 것 | 최신 릴리스 |
| `@lithent/*` (Vite 플러그인, HMR, MDX, 템플릿) | 0.x | 개발 도구. 런타임에 포함되지 않음 | 최신 릴리스 |

`lithent/helper`, `lithent/ssr`, `lithent/element`, `lithent/tag`, `lithent/ftags`,
`lithent/devHelper`, `lithent/jsx-runtime`은 `lithent` 패키지 안의 서브패스다. 저장소 안의
각 폴더 `package.json`에 있는 버전(0.x)은 배포되지 않는 내부 값이고, 사용자에게 적용되는
버전은 `lithent`의 버전 하나다.

## 3. 메인테이너가 한 명이라는 점

사실이다. 이 리스크를 줄이는 것은 약속이 아니라 구조다.

- **코어가 작다.** `lithent` UMD는 brotli 4.8KB, 원본 13.0KB다. 한 사람이 읽고 고칠 수 있는 크기다.
- **런타임 의존성이 없다.** `lithent` 코어는 다른 패키지에 의존하지 않는다
  (`lithent/tag`만 `htm`을 쓴다). 상위 의존성이 끊겨 막히는 일이 없다.
- **MIT 라이선스.** 유지가 멈추면 포크해서 직접 고칠 수 있다.
- **크기 예산이 스크립트로 고정돼 있다.** `pnpm size`는 brotli 기준 코어 4,800B, element 1,000B를
  넘으면 실패한다. 기능이 계속 붙어 감당 못 할 크기가 되지 않는다.
- **도입 단위가 작다.** 위젯·영역 단위로 넣으므로 뺄 때도 그 단위다 → [EXIT.md](./EXIT.md).

## 4. 로드맵

기능 후보와 우선순위는 [../ideas/IDEAS.md](../ideas/IDEAS.md) §4에 있다. 후보 목록이지 일정
약속이 아니다.
