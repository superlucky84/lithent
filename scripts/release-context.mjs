import semver from 'semver';
import { assertSuccessfulJobs } from './ci-gate.mjs';
import { releasePolicy } from './release-packages.mjs';

export function assertReleaseContext({
  env = process.env,
  needs,
  requireOidc = true,
}) {
  if (
    env.GITHUB_ACTIONS !== 'true' ||
    env.GITHUB_SERVER_URL !== 'https://github.com' ||
    env.GITHUB_API_URL !== 'https://api.github.com' ||
    env.GITHUB_REPOSITORY !== releasePolicy.repository ||
    env.GITHUB_EVENT_NAME !== 'workflow_dispatch' ||
    env.GITHUB_REF !== 'refs/heads/main' ||
    env.GITHUB_REF_PROTECTED !== 'true' ||
    env.GITHUB_WORKFLOW_REF !==
      `${releasePolicy.repository}/.github/workflows/ci.yml@refs/heads/main` ||
    !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? '') ||
    env.GITHUB_WORKFLOW_SHA !== env.GITHUB_SHA ||
    !/^\d+$/.test(env.GITHUB_RUN_ID ?? '') ||
    !/^[1-9]\d*$/.test(env.GITHUB_RUN_ATTEMPT ?? '') ||
    env.RUNNER_ENVIRONMENT !== 'github-hosted' ||
    env.LITHENT_RELEASE_ENVIRONMENT !== 'npm' ||
    env.LITHENT_NPM_PUBLISH_ENABLED !== 'true'
  )
    throw new Error(
      'Release requires an enabled, protected main run of ci.yml on GitHub-hosted runners'
    );
  assertSuccessfulJobs({
    quality: needs?.quality?.result,
    browser: needs?.browser?.result,
    gate: needs?.gate?.result,
  });
  if (
    requireOidc &&
    (!env.ACTIONS_ID_TOKEN_REQUEST_TOKEN ||
      !env.ACTIONS_ID_TOKEN_REQUEST_URL?.startsWith('https://'))
  )
    throw new Error(
      'npm release requires id-token:write and an OIDC request context'
    );
  if (
    requireOidc &&
    [
      'NODE_AUTH_TOKEN',
      'NPM_TOKEN',
      'NPM_CONFIG__AUTHTOKEN',
      'npm_config__authToken',
    ].some(name => env[name])
  )
    throw new Error('Token fallback is not allowed for npm Trusted Publishing');
  return { id: env.GITHUB_RUN_ID, attempt: Number(env.GITHUB_RUN_ATTEMPT) };
}

export function assertPublishToolchain(nodeVersion, npmVersion) {
  if (
    !semver.valid(nodeVersion) ||
    semver.lt(nodeVersion, '22.14.0') ||
    !semver.valid(npmVersion) ||
    semver.lt(npmVersion, '11.5.1')
  )
    throw new Error(
      'Trusted Publishing requires Node >=22.14.0 and npm >=11.5.1'
    );
}
