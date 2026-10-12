# PR #95–#97 릴리스

저장소 루트의 `main`에서 실행한다. Node/pnpm 버전은 root `package.json`의
Volta 설정과 `packageManager`를 따른다. 이번 npm 발행 대상은 아래 6개다.

| 패키지                             | 이전 → 배포 버전 | 이유                                   |
| ---------------------------------- | ---------------- | -------------------------------------- |
| `lithent`                          | 1.24.1 → 1.25.0  | lifecycle API 추가, stateless/HMR 수정 |
| `lithent-concurrent`               | 0.1.4 → 0.2.0    | 자식 렌더링 정지 기능, 공통 코어 수정  |
| `@lithent/hmr-parser`              | 0.2.2 → 0.2.3    | HMR 변환·bootstrap 수정                |
| `@lithent/lithent-template-parser` | 0.1.0 → 0.1.1    | 템플릿 의미 보존 수정                  |
| `@lithent/lithent-template-vite`   | 0.1.0 → 0.1.1    | 수정된 parser 의존성 반영              |
| `@lithent/lithent-vite`            | 0.3.3 → 0.3.4    | 수정된 HMR/template 의존성 반영        |

`lithent-concurrent`와 `@lithent/lithent-vite`의 lithent peer 범위는
`^1.25.0`이다. 특히 새 HMR 코드는 새 `lithent/devHelper` 계약을 사용한다.

private인 `lithent-helper`(0.22.0)와 `lithent-dev-helper`(0.21.1)는
root `lithent` tarball에 포함된다. 두 패키지는 따로 발행하지 않는다.
`create-lithent`, MDX, JSX runtime 등은 이번에 별도로 발행할 필요가 없다.
기존 SPA/SSR 템플릿의 `^1.22.1`/`^0.3.3` 범위는 새 core/plugin 버전을 허용한다.

## 1. 설치·빌드·검증

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm verify:concurrent
pnpm verify:release
pnpm test
pnpm test:dual
pnpm --filter @lithent/lithent-template-parser test
pnpm --filter @lithent/lithent-template-vite test
pnpm exec vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
LITHENT_CORE=concurrent pnpm exec vitest run --config experiments/closure-lifecycle/vite.config.ts --maxWorkers 2 --minWorkers 1
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm build`는 core → Concurrent → JSX/helper/devHelper → Concurrent helper →
SSR/tag/ftags/element → HMR/parser → template plugin → MDX/Vite plugin 순서로
필요한 의존성부터 준비한다. 모든 공개 런타임의 선언 파일을 먼저 생성한 뒤
toolchain 테스트 코드와 문서를 타입 검사하고 examples와 문서 사이트를 빌드한다.
`verify:release`는 core/Concurrent의 실제 pack과 격리된 ESM/CJS/타입 소비자를
검증한다. 이 검증에 `create-lithent` pack도 포함되지만 이번 발행 대상은 아니다.

workspace 의존성이 있는 플러그인은 `pnpm pack`으로도 확인할 수 있다.

```sh
release_packs=$(mktemp -d /tmp/lithent-release-packs.XXXXXX)
pnpm pack --pack-destination "$release_packs"
pnpm --dir lithentConcurrent pack --pack-destination "$release_packs"
pnpm --dir packages/hmrParser pack --pack-destination "$release_packs"
pnpm --dir packages/lithentTemplateParser pack --pack-destination "$release_packs"
pnpm --dir packages/lithentTemplateVite pack --pack-destination "$release_packs"
pnpm --dir packages/lithentVite pack --pack-destination "$release_packs"
tar -xOf "$release_packs/lithent-lithent-template-vite-0.1.1.tgz" package/package.json
tar -xOf "$release_packs/lithent-lithent-vite-0.3.4.tgz" package/package.json
```

마지막 두 manifest의 공개 `dependencies`에는 `workspace:*` 대신 parser
`0.1.1`, HMR parser `0.2.3`, template plugin `0.1.1`이 들어가야 한다.
pnpm은 [pack/publish 시 workspace 범위를 변환한다](https://pnpm.io/workspaces#publishing-workspace-packages).

## 2. 버전 변경 커밋·push

이번 릴리스의 버전 변경과 CI 수정은 이미 main에 커밋·push했다.
추가 변경이 없고 `git status --short --branch`가 깨끗하면 3번으로 진행한다.
아래 커밋 명령은 추가 릴리스 변경이 있을 때만 실행한다.

```sh
git add .github/workflows/docs.yml package.json lithentConcurrent/package.json helper/package.json devHelper/package.json packages/hmrParser/package.json packages/hmrParser/vite.config.js packages/lithentTemplateParser/package.json packages/lithentTemplateParser/vite.config.js packages/lithentTemplateVite/package.json packages/lithentTemplateVite/vite.config.ts packages/lithentVite/package.json packages/lithentVite/vite.config.ts pnpm-lock.yaml helper/README.md lithentDocs/src/pages/Lifecycle.tsx lithentDocs/src/pages/ConcurrentRendering.tsx CHANGELOG.md RELEASING.md
git commit -m "chore(release): prepare lifecycle, HMR and template fixes"
git push origin main
git status --short --branch
```

`pnpm publish`는 작업 폴더가 깨끗하고 원격과 동기화됐는지 검사한다.
이 저장소의 배포 브랜치는 `main`이므로 아래 명령에 `--publish-branch main`을
명시한다. [pnpm publish 문서](https://pnpm.io/cli/publish)

## 3. npm 발행

```sh
npm whoami
```

로그인이 필요하면 `npm login`을 실행한다. 다음 명령은 **한 개씩** 실행하고,
성공한 뒤 다음으로 진행한다. 필요하면 npm이 요청하는 OTP를 입력한다.

```sh
pnpm publish --access public --publish-branch main
(cd lithentConcurrent && pnpm publish --access public --publish-branch main)
(cd packages/hmrParser && pnpm publish --access public --publish-branch main)
(cd packages/lithentTemplateParser && pnpm publish --access public --publish-branch main)
(cd packages/lithentTemplateVite && pnpm publish --access public --publish-branch main)
(cd packages/lithentVite && pnpm publish --access public --publish-branch main)
```

pnpm 9.12.3에서 `--dir <folder> publish`가 npm에 폴더 이름과 `publish`를
추가 인자로 넘겨 `EUSAGE`가 발생하는 것을 확인했다. 위 명령은 각 폴더에서
실행하고 괄호로 원래 작업 디렉터리를 유지한다. 남은 5개 명령은 모두
`--dry-run`으로 실제 발행 없이 검증했다.

이미 발행한 동일 버전의 패키지는 건너뛴다. 현재 `lithent@1.25.0`은 발행이
확인됐으므로 `lithentConcurrent` 명령부터 진행한다.

의존하는 공개 버전이 먼저 존재해야 한다. 따라서 core → Concurrent,
parser → template plugin → Vite plugin 순서를 지킨다. 중간에 실패하면 이미
성공한 패키지를 다시 발행하지 말고 실패한 명령부터 재개한다.

발행 후 registry의 버전과 플러그인 의존성을 확인한다.

```sh
npm view lithent version
npm view lithent-concurrent version
npm view @lithent/hmr-parser version
npm view @lithent/lithent-template-parser version
npm view @lithent/lithent-template-vite version dependencies --json
npm view @lithent/lithent-vite version dependencies peerDependencies --json
```

## 4. 태그·문서 사이트

모든 npm 발행이 성공한 동일 커밋에 태그를 만들고 명시적으로 push한다.

```sh
git tag lithent@1.25.0
git tag lithent-concurrent@0.2.0
git tag @lithent/hmr-parser@0.2.3
git tag @lithent/lithent-template-parser@0.1.1
git tag @lithent/lithent-template-vite@0.1.1
git tag @lithent/lithent-vite@0.3.4
git push origin lithent@1.25.0 lithent-concurrent@0.2.0 @lithent/hmr-parser@0.2.3 @lithent/lithent-template-parser@0.1.1 @lithent/lithent-template-vite@0.1.1 @lithent/lithent-vite@0.3.4
gh run list --workflow docs.yml --limit 5
```

`.github/workflows/docs.yml`이 `lithent@*` 태그를 받아 전체 workspace를
빌드하고 `gh-pages`로 배포한다. 문서 파일이나 root `package.json`/
`pnpm-lock.yaml`을 변경한 main push도 배포를 시작한다.
최종 사이트는 https://superlucky84.github.io/lithent/ 이다.
필요하면 발행 완료 후 수동으로 다시 배포할 수 있다.

```sh
gh workflow run docs.yml --ref main
```

배포 후 영어/한국어 lifecycle 안내의 최소 버전과 retained-editor 예제,
Concurrent 설치 명령을 확인한다. 이번 준비에서는 해당 안내를 새 버전에 맞췄다.

## 준비 검증 기록 (2026-10-12)

- 전체 `pnpm build`, `pnpm test`, `verify:concurrent`, `verify:release` 통과.
- lifecycle 57개(base)/68개(Concurrent), template Vite 5개 테스트 통과.
- 문서 사이트 TypeScript와 변경 파일 서식 검사 통과.
- 6개 공개 tarball의 버전·공개 파일·workspace 의존성 변환 확인.
- tarball을 격리 환경에 설치해 6개 ESM import와 template-enabled Vite plugin 확인.
- core/Concurrent의 ESM/CJS 소비자와 toolchain의 Bundler/Node16/NodeNext ESM
  타입 소비자 확인(`skipLibCheck: false`). 아직 발행되지 않은 transitive 버전은
  격리 환경에서 동일 tarball로 override하여 검증했다.
- Vite plugin 선언 출력 위치·외부 타입 import, toolchain 선언 상대 경로 수정 후
  네 패키지 재빌드·재pack·격리 타입 검증 통과.
- Actions 실행 `38210218612`의 문서 TS7016 오류는 element 선언 생성과 문서 빌드의
  병렬 실행에서 발생했다. element를 순차 빌드로 옮긴 뒤 `element/dist`가 없는
  상태에서 전체 `pnpm build` 통과를 확인했다.
- 다음 실행 `38212865860`에서는 template Vite 테스트의 `lithent/ssr` import가
  SSR 생성보다 먼저 검사돼 TS2307이 발생했다. 모든 공유 런타임을 toolchain보다
  앞에 배치한 뒤 21개 `dist` 디렉터리가 없는 상태에서 전체 빌드 통과를 확인했다.
- 영문·한국어 lifecycle E2E의 preview 문구 기대값을 최소 지원 버전 안내로 갱신했다.
  전체 브라우저 E2E 64개와 `pnpm test:dual` 통과를 확인했다.
- 릴리스 준비와 CI 수정은 main에 커밋·push했다. 문서 배포 Actions
  [38213507381](https://github.com/superlucky84/lithent/actions/runs/38213507381)도
  전체 빌드와 gh-pages 반영까지 성공했다. `lithent@1.25.0` npm 발행도 확인했다.
  나머지 5개 패키지 발행과 릴리스 태그 push는 남아 있다.
