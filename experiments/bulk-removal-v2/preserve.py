"""Archive the DC-28 bulk-removal v2 staging, tools and candidate patch.

Refuses to overwrite evidence. Before archiving, checks that every repo file
hashed by prepare.mjs (source, test, frozen tools) is unchanged since the
collection. node_modules symlinks are recorded, not archived.
usage (repo root): python3 experiments/bulk-removal-v2/preserve.py STAGING
"""
import hashlib
import io
import json
import pathlib
import subprocess
import sys
import tarfile

out = pathlib.Path(sys.argv[1]).resolve()
root = pathlib.Path.cwd()
dest = root / 'docs/benchmark/bulk-removal-v2-evidence.tar.gz'
manifest_path = root / 'docs/benchmark/bulk-removal-v2-evidence-manifest.json'
assert not dest.exists() and not manifest_path.exists(), 'Do not overwrite evidence'
sha = lambda data: hashlib.sha256(data).hexdigest()

initial = json.loads((out / 'initial.json').read_text())
for rel, expected in initial['files'].items():
    digest = expected if isinstance(expected, str) else expected['sha256']
    assert sha((root / rel).read_bytes()) == digest, f'{rel} changed since prepare'

patch = subprocess.run(
    ['git', 'diff', '--binary', 'HEAD', '--', 'src/render.ts', 'lithentConcurrent/src/render.ts'],
    check=True, capture_output=True).stdout
assert patch, 'candidate patch is empty'

entries, links = {}, {}


def add_bytes(archive, data, name):
    assert name not in entries
    entries[name] = dict(size=len(data), sha256=sha(data))
    info = tarfile.TarInfo(name)
    info.size = len(data)
    info.mtime = 0
    archive.addfile(info, io.BytesIO(data))


with tarfile.open(dest, 'w:gz') as archive:
    for prefix, directory in [('run', out),
                              ('tools', root / 'experiments/bulk-removal-v2'),
                              ('vsync-tools', root / 'experiments/select-vsync-phase')]:
        for file in sorted(directory.rglob('*')):
            name = prefix + '/' + str(file.relative_to(directory))
            if file.is_symlink():
                links[name] = str(file.readlink())
                continue
            if file.is_file() and 'node_modules' not in file.parts:
                add_bytes(archive, file.read_bytes(), name)
    add_bytes(archive, patch, 'candidate/render.patch')
    add_bytes(archive, (root / 'src/tests/core-bulkRemoval.test.tsx').read_bytes(),
              'candidate/core-bulkRemoval.test.tsx')
    for rel in ['docs/benchmark/production-run.mjs',
                'docs/benchmark/dc25-keyed-fast-path-final-results.json']:
        add_bytes(archive, (root / rel).read_bytes(), 'shared-tools/' + rel)

decoded = {}
with tarfile.open(dest, 'r:gz') as archive:
    for member in archive:
        data = archive.extractfile(member).read()
        decoded[member.name] = dict(size=len(data), sha256=sha(data))
assert decoded == entries
manifest = dict(archive=dest.name, size=dest.stat().st_size, sha256=sha(dest.read_bytes()),
                entryCount=len(entries), decodedVerified=True, entries=entries,
                dependencySymlinksExcluded=links)
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({k: v for k, v in manifest.items() if k not in ('entries', 'dependencySymlinksExcluded')}))
