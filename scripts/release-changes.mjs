import { execFileSync } from 'node:child_process';
import { readJson } from './artifact-utils.mjs';

export function sourceChangeAdvice(policy, rows, paths) {
  if (paths === null) return null;
  return policy.packages.flatMap(entry => {
    const roots =
      entry.sourcePaths ??
      (entry.directory === '.' ? [] : [entry.directory + '/']);
    const changed = paths.filter(path =>
      roots.some(root =>
        root.endsWith('/') ? path.startsWith(root) : path === root
      )
    );
    const row = rows.find(row => row.name === entry.name);
    return changed.length
      ? [
          {
            name: entry.name,
            files: changed,
            state: row.state,
            warning:
              row.state === 'excluded'
                ? 'Source paths changed but this version will not be published; review the owning package version.'
                : null,
          },
        ]
      : [];
  });
}

export async function readSourceChanges(
  repo,
  { allowDirty = false, eventPath = process.env.GITHUB_EVENT_PATH } = {}
) {
  const gitPaths = args =>
    execFileSync('git', args, { cwd: repo, encoding: 'utf8' })
      .split('\0')
      .filter(Boolean);
  if (allowDirty)
    return {
      basis: 'local-working-tree',
      paths: [
        ...new Set([
          ...gitPaths(['diff', '--name-only', '-z', 'HEAD', '--']),
          ...gitPaths(['ls-files', '--others', '--exclude-standard', '-z']),
        ]),
      ].sort(),
    };
  if (!eventPath) return { basis: 'unavailable', paths: null };
  const event = await readJson(eventPath);
  const base = event.pull_request?.base?.sha ?? event.before;
  if (!base || /^0+$/.test(base)) return { basis: 'unavailable', paths: null };
  if (!/^[0-9a-f]{40}$/.test(base))
    throw new Error('Invalid source comparison SHA');
  return {
    basis: base,
    paths: gitPaths(['diff', '--name-only', '-z', base, 'HEAD', '--']),
  };
}
