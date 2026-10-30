# PR #102 릴리스 — lithent 1.25.4 / lithent-concurrent 0.2.4

저장소 루트의 `main`에서 실행한다. Node 버전은 root `package.json`의 Volta
설정(24.22.1), pnpm 버전은 `packageManager`(12.15.0)를 따른다.

Volta 2.0.2는 pnpm 11 이상을 실행하지 못하므로 pnpm은 Volta로 고정하지 않는다.
Volta의 pnpm을 쓴다면 기본 pnpm을 10.34.9 이상으로 두면 이 저장소 안에서
`packageManager`의 버전으로 자동 전환된다(`volta install pnpm@10.34.9`).
`pnpm -v`가 12.15.0을 출력하는지 먼저 확인한다.

기본 pnpm 10.22.0에서 자동 전환하면 12.15.0의 native binary 설치 script가 실행되지
않아, `~/Library/pnpm/.tools/pnpm/12.15.0/bin/pnpm`이 자리표시 파일로 남고
`ENOEXEC`로 실패한다. 이때는 그 설치의 script를 직접 실행한다.

```sh
node ~/Library/pnpm/.tools/pnpm/12.15.0/node_modules/pnpm/install.js
pnpm -v
```

이번 npm 발행 대상은 아래 두 패키지다.

| 순서 | 패키지               | 이전 → 배포 버전 | 내용                                                       |
| ---- | -------------------- | ---------------- | ---------------------------------------------------------- |
| 1    | `lithent`            | 1.25.3 → 1.25.4  | component/Fragment 행 목록 한 번 삭제, 외부 노드 삭제 수정 |
| 2    | `lithent-concurrent` | 0.2.3 → 0.2.4    | 같은 목록 삭제 변경                                        |

`lithent/helper`, `lithent/devHelper`, JSX runtime, SSR, tag, ftags, element는
root `lithent` tarball에 포함된다. `lithent-concurrent/helper`는 Concurrent
tarball에 포함된다. private workspace 패키지는 별도로 발행하지 않는다.
HMR/parser/template/Vite/MDX 플러그인과 `create-lithent`도 이번 발행 대상에 포함되지 않는다.

Concurrent의 `lithent` peer 범위는 기존 `^1.25.0`이며, 이번 `1.25.4`를 허용한다.

## 1. main·버전·릴리스 기록 확인

```sh
git switch main
git pull --ff-only origin main
git status --short --branch
node -p "require('./package.json').version"
node -p "require('./lithentConcurrent/package.json').version"
```

manifest 버전은 이미 `1.25.4`와 `0.2.4`로 올라 있다. 위 출력이 두 버전과 일치하면
다음 단계로 진행한다. `CHANGELOG.md`의 2026-10-31 절이 이번 릴리스 기록이다.

## 2. 설치·빌드·검증

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

`pnpm build`는 core와 Concurrent, 공개 하위 경로, toolchain을 의존 순서대로 빌드하고
examples와 문서 사이트도 준비한다. `test:dual`은 두 코어와 양쪽 satellite 테스트를 실행한다.
`verify:release`는 실제 pack을 설치한 ESM/CJS·strict 타입 소비자를 검사한다.
이 검증에서 `create-lithent` pack도 준비하지만 실제 발행 대상은 위 두 패키지다.

이전 버전의 임시 tarball이나 기존 `dist`를 발행에 재사용하지 않고,
이번 버전의 manifest로 빌드와 소비자 검증을 통과한 결과를 사용한다.

## 3. 릴리스 기록 커밋·push

검증을 통과한 뒤 미커밋 릴리스 파일을 확인하고 저장한다.
이미 커밋된 파일은 아래 `git add`에 포함돼도 추가 변경을 만들지 않는다.
작업 트리가 깨끗하고 원격과 동기화돼 있다면 다음 단계로 진행한다.

```sh
git diff --check
git diff --stat
git add package.json lithentConcurrent/package.json pnpm-lock.yaml CHANGELOG.md RELEASING.md
git commit -m "chore(release): prepare lithent 1.25.4 and lithent-concurrent 0.2.4"
git push origin main
git status --short --branch
```

`pnpm publish`는 작업 트리와 원격 동기화 상태를 검사한다.
배포 브랜치는 `--publish-branch main`으로 명시한다.
[pnpm publish 문서](https://pnpm.io/cli/publish)

## 4. 로그인·배포 미리보기

```sh
npm whoami
```

로그인이 필요하면 `npm login`을 실행한다. 이어서 양쪽 패키지의 발행 내용을 확인한다.

```sh
pnpm publish --dry-run --access public --publish-branch main
(cd lithentConcurrent && pnpm publish --dry-run --access public --publish-branch main)
```

pnpm 9.12.3에서 확인된 `--dir <folder> publish` 인자 전달 문제를 피하려고
Concurrent 명령은 해당 디렉터리 안에서 실행한다. 괄호는 원래 작업 디렉터리를 유지한다.

## 5. npm 발행 — core → Concurrent

아래 명령은 **하나씩** 실행하고 성공을 확인한 뒤 다음으로 진행한다.
pnpm 11부터 `pnpm publish`는 npm CLI를 거치지 않는다. registry가 OTP를
요구하면 pnpm이 직접 묻는다. `--otp <code>` 또는 `PNPM_CONFIG_OTP`로 미리
넘길 수도 있다. 인증은 `~/.npmrc`의 토큰(`npm login`)을 그대로 쓴다.

먼저 core를 발행하고 정확한 버전이 registry에 조회되는지 확인한다.

```sh
pnpm publish --access public --publish-branch main
npm view lithent@1.25.4 version
```

`1.25.4`가 확인되면 Concurrent를 발행한다.

```sh
(cd lithentConcurrent && pnpm publish --access public --publish-branch main)
npm view lithent-concurrent@0.2.4 version
```

한 패키지만 성공한 경우 성공한 버전을 다시 발행하지 않고, 남은 패키지부터 재개한다.
두 버전의 발행을 확인한 뒤 다음 단계로 진행한다.

## 6. 태그·GitHub 릴리스·문서 사이트

두 npm 발행에 사용한 동일 커밋에 태그를 만들고 명시적으로 push한다.

```sh
git tag lithent@1.25.4
git tag lithent-concurrent@0.2.4
git push origin lithent@1.25.4 lithent-concurrent@0.2.4
gh run list --workflow docs.yml --limit 5
```

태그마다 GitHub 릴리스를 만든다. `lithent@1.25.4`가 Latest가 된다.

```sh
gh release create lithent@1.25.4 --title lithent@1.25.4 --notes-file <노트 파일>
gh release create lithent-concurrent@0.2.4 --title lithent-concurrent@0.2.4 --latest=false --notes-file <노트 파일>
```

`.github/workflows/docs.yml`이 `lithent@*` 태그를 받아 전체 workspace를
빌드하고 `gh-pages`로 배포한다. 문서 소스나 root `package.json`/`pnpm-lock.yaml`을
변경한 main push도 문서 배포를 시작한다.
최종 사이트는 https://superlucky84.github.io/lithent/ 이다.

필요하면 발행 완료 후 수동으로 문서를 다시 배포한다.

```sh
gh workflow run docs.yml --ref main
```

## 기존 검증 근거와 현재 단계

PR #102는 main의 `6d27832`로 병합됐다. 런타임 변경은 `findChildWithRemoveElement`
(base·Concurrent) 하나이며, 병합 전 리뷰에서 unit/satellite 테스트, `verify:concurrent`,
Chromium E2E 78개, 크기 guard와 추가 경계 사례 12개가 양쪽 코어에서 통과했다.

공식 벤치마크는 [BULK_REMOVAL_V2_RESULTS](./docs/benchmark/BULK_REMOVAL_V2_RESULTS.md)에 있다.
js-framework-benchmark 앱(일반 element 행) 가중 전체는 −0.09%로 중립이고, 행마다
component가 있는 앱의 1,000행 삭제는 −7.84%(JS −10.40%)였다.

이 기록은 런타임 변경과 성능 측정의 근거다. 위 2번은 `1.25.4`/`0.2.4` manifest로
발행할 결과를 다시 빌드·검증하는 단계이며, npm 발행 완료 기록과 구분한다.
