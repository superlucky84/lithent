# IMPLEMENT — 1단계 검증 결과

- 작성일: 2026-10-10
- 브랜치: `experiment/closure-lifecycle`
- 기준: `0a3dcc8753317382b5272bd6d399f4eb3793bfb9`
- 상태: **소유권·취소·최신 결과 프로토타입 자동 검증 완료. 공개 API 미출하.**

후속 활동 수명·명시적 화면 보존 검증은 [2단계 결과](./PHASE2.md)에 기록했다.
일반 호스트·Custom Element 시연과 브라우저 검증은 [3단계 결과](./PHASE3.md)를 참고한다.
아래 테스트 개수와 크기는 1단계 당시의 기록이다.

## 결과

코어 수정 없이 기존 `mountCallback`에 연결해서 인스턴스 자원과 비동기 요청을 정리할 수 있다.
이전 요청이 취소를 무시하거나 이미 완료돼 있어도 최신 작업의 성공·오류·pending을 덮지 않는다.
화면 비활성화·DOM 보존·서브트리 렌더 중단의 구현 가능성이나 크기를 이번 결과로 보장하지 않는다.

## 구현 위치

- [실험 소스·사용 예제·재현 명령](../../experiments/closure-lifecycle/README.md)
- `scope.ts`: 한 번만 정리, 예외 격리, 재진입 및 늦은 등록.
- `latest.ts`: 그룹별 요청 취소, 현재 실행에 한정한 observer 호출.
- `lithent.ts`: 초기화에서 핸들을 확보하고 마운트 확정 후 언마운트 정리에 연결.
- 공개 exports, `src/`, `lithentConcurrent/src/`, 일반 helper와 element 변경 없음.

## 자동 검증

| 항목                                         | 결과                         |
| -------------------------------------------- | ---------------------------- |
| base 실험 테스트                             | 24/24 PASS (4개 파일)        |
| concurrent 실험 테스트                       | 동일한 24/24 PASS (4개 파일) |
| TypeScript                                   | PASS                         |
| ESLint (소스·테스트·설정·측정 스크립트)      | PASS                         |
| base·concurrent·helper 및 실험 Vite 빌드     | PASS                         |
| 기존 산출물 재빌드 후 SHA-256 비교           | ESM/CJS/UMD 총 9개 모두 동일 |
| 코어·helper·element 및 공개 패키지 설정 diff | 0                            |

주요 검증: 느린 성공·오류, 오래된 finally, 이미 완료된 작업의 continuation,
동기 work 실패, observer 실패, abort·pending observer 재진입, 독립 그룹,
폐기 후 실행 거부, 정리 예외·중복 폐기, await 이후 등록, 실제 언마운트,
예약된 renew 이후 제거, Custom Element 이동·최종 제거·재연결, Node SSR.
이번 변경은 실험에만 있으므로 기존 전체 회귀 스위트는 다시 실행하지 않았다.

## 크기

Node `v24.19.0`, Vite `5.4.8`, gzip level 9, Node 기본 Brotli 설정.
source map을 제외한 실제 산출물을 압축했다. 실험 번들에서 `lithent`는 external이다.

| 산출물          | raw (B) | gzip (B) | Brotli (B) | 기존 대비                 |
| --------------- | ------: | -------: | ---------: | ------------------------- |
| base UMD        |  12,966 |    5,142 |      4,758 | 0 B 증가, 해시 동일       |
| concurrent UMD  |  17,045 |    6,906 |      6,385 | 0 B 증가, 해시 동일       |
| 기존 helper UMD |   6,145 |    2,134 |      1,879 | 0 B 증가, 해시 동일       |
| 실험 UMD        |   1,482 |      774 |        670 | 선택해서 로드할 때만 추가 |
| 실험 CJS        |   1,255 |      657 |        574 | 별도 실험 파일            |
| 실험 ESM        |   1,920 |      752 |        694 | 앱 번들링 전 수치         |

base UMD와 실험 UMD를 각각 Brotli로 전송하면 합계는 **5,428 B**다.
ESM 앱의 최종 추가 비용은 bundler·tree shaking·압축 설정에 따라 달라진다.
기계 판독 가능한 해시와 전체 크기는 [SIZE_RESULTS.json](./SIZE_RESULTS.json)에 기록했다.

## 다음 단계에서 검증할 것

1. 작업의 수명을 인스턴스와 활동으로 나눠 검색 취소와 저장 계속 진행을 함께 표현한다.
2. 서브트리 보존 전략을 선택하고 자식 renew·부모 diff·이미 예약된 렌더를 차단할 경계를 찾는다.
3. 새 실험에서도 코어 변화량·일반 렌더 비용·선택적 번들 비용을 각각 측정한다.
