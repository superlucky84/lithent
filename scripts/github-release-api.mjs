export class GitHubReleaseApi {
  constructor({ repository, token, fetchImpl = fetch, timeoutMs = 15_000 }) {
    if (!token)
      throw new Error('GitHub release recording requires a workflow token');
    this.repository = repository;
    this.token = token;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }
  async request(path, { method = 'GET', body } = {}) {
    const response = await this.fetchImpl(
      `https://api.github.com/repos/${this.repository}/${path}`,
      {
        method,
        redirect: 'error',
        signal: AbortSignal.timeout(this.timeoutMs),
        headers: {
          authorization: `Bearer ${this.token}`,
          accept: 'application/vnd.github+json',
          'content-type': 'application/json',
          'x-github-api-version': '2022-11-28',
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }
    );
    if (method === 'GET' && response.status === 404) return null;
    if (!response.ok)
      throw new Error(`GitHub ${method} ${path}: HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  }
  async tagCommit(tag) {
    const path = tag.split('/').map(encodeURIComponent).join('/');
    const ref = await this.request('git/ref/tags/' + path);
    if (!ref) return null;
    let object = ref.object;
    for (let depth = 0; object?.type === 'tag' && depth < 5; depth++)
      object = (await this.request('git/tags/' + object.sha))?.object;
    if (object?.type !== 'commit' || !/^[a-f0-9]{40}$/.test(object.sha ?? ''))
      throw new Error(`Tag does not resolve to a commit: ${tag}`);
    return object.sha;
  }
  async ensureTag(tag, revision) {
    const existing = await this.tagCommit(tag);
    if (existing) {
      if (existing !== revision)
        throw new Error(`Existing release tag points to another SHA: ${tag}`);
      return 'existing';
    }
    try {
      await this.request('git/refs', {
        method: 'POST',
        body: { ref: 'refs/tags/' + tag, sha: revision },
      });
    } catch (error) {
      if ((await this.tagCommit(tag)) === revision) return 'existing';
      throw error;
    }
    if ((await this.tagCommit(tag)) !== revision)
      throw new Error(`Release tag was not confirmed: ${tag}`);
    return 'created';
  }
  dispatchDocs(tag, revision) {
    return this.request('actions/workflows/docs.yml/dispatches', {
      method: 'POST',
      body: { ref: tag, inputs: { release_sha: revision } },
    });
  }
}
