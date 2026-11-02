# 릴리스 준비 — lithent 1.25.5

이번 PR은 base 코어의 keyed 목록·캐시 경로 최적화와 릴리스 준비를 포함한다.
main에 merge commit으로 병합한 뒤 이 문서의 발행 절차를 실행한다.

| 패키지    | 이전 → 배포 버전 | 내용                                                                                                 |
| --------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `lithent` | 1.25.4 → 1.25.5  | keyed 위치 매칭, 순서가 유지된 목록의 DOM 배치 생략, 동일 VDOM 조기 반환, 일반 태그 속성 처리 최적화 |

이번 npm 발행 대상은 **`lithent` 하나**다. Concurrent 런타임은 바뀌지 않아
`lithent-concurrent`는 0.2.4를 유지한다. 기존 peer 범위 `^1.25.0`은 1.25.5를 허용한다.
helper·devHelper·JSX runtime·SSR·tag·ftags·element는 root tarball에 포함된다.
private workspace와 HMR/parser/template/Vite/MDX 플러그인, `create-lithent`는 별도 발행하지 않는다.

## 1. main·버전·릴리스 기록 확인

```sh
git switch main
git pull --ff-only origin main
git status --short --branch
node -p "require('./package.json').version"
node -p "require('./lithentConcurrent/package.json').version"
```

root는 `1.25.5`, Concurrent는 `0.2.4`여야 한다. `CHANGELOG.md`의 2026-11-02 절에
성능 결과와 호환성 변경, base Brotli 4,925B를 기록했다.
기존 VDOM을 그대로 반환할 때 getter를 다시 읽지 않는 변경과, reconciliation 도중
기존 키를 직접 수정하는 사용법을 지원하지 않는다는 점을 확인한다.

Node는 root Volta 설정의 24.22.1, pnpm은 `packageManager`의 12.15.0을 사용한다.

```sh
node --version
pnpm --version
```

Volta 2.0.2는 pnpm 11 이상을 실행하지 못하므로 pnpm을 Volta로 고정하지 않는다.
기존에 설치된 pnpm 12.15.0 실행 파일이 있으면 그 디렉터리를 PATH 앞에 둔다.
이 작업 환경에서는 다음 경로로 고정 버전을 직접 실행할 수 있다.

```sh
~/Library/pnpm/.tools/pnpm/12.15.0/bin/pnpm --version
```

## 2. 설치·빌드·검증

pnpm 12는 스크립트 실행 전에 의존성을 검증하고 필요하면 자동 설치한다.
설치는 네트워크에 접근할 수 있는 환경에서 먼저 완료한다. 제한된 환경에서 자동
설치가 실패하면 node_modules 구성이 중단될 수 있으므로, 같은 환경에서 재시도하지 않는다.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test:dual
pnpm verify:concurrent
pnpm verify:release
pnpm size
pnpm exec playwright install chromium
pnpm test:e2e
```

`build`는 공개 하위 경로와 toolchain, examples, 문서 사이트도 준비한다.
`test:dual`은 두 코어와 양쪽 satellite 테스트를 실행한다. `verify:release`는 실제
tarball을 격리 설치해 ESM/CJS·Node16/NodeNext strict 타입 소비자를 검사한다.
이 검사에서 Concurrent와 `create-lithent` pack도 준비하지만 실제 발행 대상은 root뿐이다.

이번 버전의 manifest로 빌드·검증한 산출물을 사용한다. 이전 버전의 tarball이나
빌드 전 dist를 재사용하지 않는다. root 버전은 pnpm lockfile에 별도로 저장되지 않아
버전 변경만으로 `pnpm-lock.yaml`을 수정할 필요는 없다.

## 3. 최종 커밋·원격 동기화 확인

이 PR은 코드·검증 자료·릴리스 파일을 포함한다. 추가 수정 없이 병합했다면
같은 내용을 다시 커밋하지 않는다. 발행할 main이 원격과 동기화되고 작업 트리가
깨끗한지 확인한다.

```sh
git diff --check
git status --short --branch
git log -1 --oneline
```

병합은 merge commit을 사용해 벤치마크 문서가 인용하는 커밋을 유지한다.
PR 생성·병합과 npm 발행은 별도 단계다.

## 4. 로그인·발행 미리보기

```sh
npm whoami
pnpm publish --dry-run --access public --publish-branch main
```

필요하면 `npm login`으로 인증한다. pnpm은 작업 트리와 원격 동기화 상태를 검사한다.
미리보기의 패키지명·버전이 `lithent@1.25.5`인지, 공개 하위 경로와 선언 파일이
포함되는지 확인한다.

## 5. npm 발행

```sh
pnpm publish --access public --publish-branch main
npm view lithent@1.25.5 version
```

registry에서 `1.25.5`를 확인한 뒤 태그 단계로 진행한다. pnpm 11부터 publish는
npm CLI를 거치지 않으며, OTP가 필요하면 pnpm이 직접 묻는다.
인증은 기존 `~/.npmrc` 설정을 사용한다.

## 6. 태그·GitHub 릴리스·문서 사이트

npm 발행에 사용한 동일 커밋에 base 태그만 만든다.

```sh
git tag lithent@1.25.5
git push origin lithent@1.25.5
gh release create lithent@1.25.5 --title lithent@1.25.5 --notes-file <노트 파일>
gh run list --workflow docs.yml --limit 5
```

Concurrent 태그나 npm 발행은 이번 릴리스에 포함하지 않는다.
`.github/workflows/docs.yml`은 `lithent@*` 태그를 받아 전체 workspace를 빌드하고
`gh-pages`를 배포한다. root manifest 변경을 포함하는 main push도 문서 배포를 시작한다.
최종 사이트는 https://superlucky84.github.io/lithent/ 이다.

필요하면 발행 완료 후 수동으로 문서를 배포한다.

```sh
gh workflow run docs.yml --ref main
```

## 검증 근거와 현재 단계

- [코어 변경과 기존 검증](./docs/benchmark/POSITIONAL_KEYS_RESULTS.md).
- [Mac 공식 러너 9항목 양순서 측정](./docs/benchmark/POSITIONAL_KEYS_OFFICIAL_RESULTS.md):
  580표본, 중앙값 기준 가중 전체 −2.59%, JS −6.84%, 평균 기준 가중 전체 −1.88%.
- 배포 전 검토에서 전체 빌드, `test:dual` 1,176통과·3제외, E2E 78개,
  `verify:concurrent`, `verify:release`, 타입·린트·크기 검사를 통과했다.
- 갱신 도중 다른 행의 기존 키를 직접 수정하는 사례는 main과 관찰 차이가 있지만,
  사용자와 지원 범위를 확인해 배포 차단 회귀에서 제외했다. 일반적인 키 유지·변경
  계약과 구분하며, 공개 릴리스 노트에 이 사용법의 지원 범위를 명시했다.

이 기록은 검증과 릴리스 준비에 대한 것이다. npm 발행 완료 기록은 별도다.
