"""Preserve P3 data without overwriting P1/P2 or mixing timing sessions."""
import hashlib
import json
import pathlib
import sys
import tarfile

out = pathlib.Path(sys.argv[1]).resolve()
root = pathlib.Path.cwd()
dest = root / 'docs/benchmark/c4-key-snapshot-evidence.tar.gz'
manifest_path = root / 'docs/benchmark/c4-key-snapshot-evidence-manifest.json'
assert not dest.exists(), 'Do not overwrite evidence'
assert not manifest_path.exists(), 'Do not overwrite manifest'
entries, links = {}, {}


def add(archive, file, name):
    data = file.read_bytes()
    assert name not in entries
    entries[name] = dict(size=len(data), sha256=hashlib.sha256(data).hexdigest())
    archive.add(file, arcname=name, recursive=False)


with tarfile.open(dest, 'w:gz') as archive:
    groups = [('run', out), ('tools', root / 'experiments/c4-key-snapshot'),
              ('before-restart', out.parent / 'lithent-c4-key-snapshot-20261029'),
              ('before-current-framework-pin', out.parent / 'lithent-c4-key-snapshot-20261030')]
    for prefix, directory in groups:
        if not directory.exists():
            continue
        for file in sorted(directory.rglob('*')):
            name = prefix + '/' + str(file.relative_to(directory))
            if file.is_symlink():
                links[name] = str(file.readlink())
                continue
            if not file.is_file() or 'node_modules' in file.parts:
                continue
            add(archive, file, name)
    for relative in [
        'experiments/c4-owner/boundary.ts', 'experiments/c4-owner/fixture.ts',
        'experiments/c4-owner/measure.mjs', 'experiments/c4-owner/browser.mjs',
        'experiments/c4-owner/analyze.mjs', 'experiments/c4-owner/audit.py',
        'docs/benchmark/production-run.mjs', 'docs/benchmark/official-memory.mjs',
        'docs/benchmark/dc25-keyed-fast-path-final-results.json',
    ]:
        add(archive, root / relative, 'shared-tools/' + relative)
decoded = {}
with tarfile.open(dest, 'r:gz') as archive:
    for member in archive:
        data = archive.extractfile(member).read()
        decoded[member.name] = dict(size=len(data), sha256=hashlib.sha256(data).hexdigest())
assert decoded == entries
manifest = dict(archive=dest.name, size=dest.stat().st_size,
                sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),
                entryCount=len(entries), decodedVerified=True, entries=entries,
                dependencySymlinksExcluded=links)
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({k: v for k, v in manifest.items() if k not in ('entries', 'dependencySymlinksExcluded')}))
