import { setTimeout as delay } from 'node:timers/promises';

// npm can accept an upload and serve the version only a minute or more later
// (lithent 1.25.6 appeared about 75 seconds after `npm publish` returned), so
// a missing version is retried for five minutes before it counts as absent.
export const visibilityWindow = { attempts: 31, delayMs: 10_000 };

// Registry errors are not retried: they still end the lookup immediately.
export async function waitForVersion(
  registry,
  name,
  version,
  {
    attempts = visibilityWindow.attempts,
    delayMs = visibilityWindow.delayMs,
    wait = delay,
  } = {}
) {
  for (let attempt = 1; ; attempt++) {
    const found = await registry.getVersion(name, version);
    if (found || attempt >= attempts) return found;
    await wait(delayMs);
  }
}

export class NpmRegistry {
  constructor({ fetchImpl = fetch, timeoutMs = 15_000 } = {}) {
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
    this.packages = new Map();
  }
  async request(name, version) {
    const url =
      'https://registry.npmjs.org/' +
      encodeURIComponent(name) +
      (version === undefined ? '' : '/' + encodeURIComponent(version));
    let response;
    try {
      response = await this.fetchImpl(url, {
        headers: { accept: 'application/json', 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      throw new Error(`Registry unavailable for ${name}: ${error.name}`, {
        cause: error,
      });
    }
    if (response.status === 404) return null;
    if (!response.ok)
      throw new Error(`Registry HTTP ${response.status} for ${name}`);
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Invalid registry JSON for ${name}`);
    }
    if (
      !data ||
      data.name !== name ||
      (version !== undefined && data.version !== version)
    )
      throw new Error(`Wrong registry metadata for ${name}`);
    if (
      version === undefined &&
      (!data.versions ||
        typeof data.versions !== 'object' ||
        Array.isArray(data.versions))
    )
      throw new Error(`Missing registry versions for ${name}`);
    return data;
  }
  async getPackage(name, { fresh = false } = {}) {
    if (fresh || !this.packages.has(name))
      this.packages.set(name, this.request(name));
    const data = await this.packages.get(name);
    if (!data) throw new Error(`Registered package is unavailable: ${name}`);
    return data;
  }
  getVersion(name, version) {
    return this.request(name, version);
  }
}
