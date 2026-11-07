"""Preserve inputs, production bundles, raw samples/traces and failed setup."""
import hashlib
import json
import pathlib
import sys
import tarfile

out = pathlib.Path(sys.argv[1]).resolve()
root = pathlib.Path.cwd()
dest = root / 'docs/benchmark/c4-list-boundary-evidence.tar.gz'
manifest_path = root / 'docs/benchmark/c4-list-boundary-evidence-manifest.json'
assert not dest.exists(), 'Do not overwrite evidence'
assert not manifest_path.exists(), 'Do not overwrite manifest'
entries = {}
links = {}
with tarfile.open(dest, 'w:gz') as archive:
    groups = [('run', out), ('setup-v1', out.parent / 'lithent-c4-20261029'),
              ('tools', root / 'experiments/c4-list-boundary')]
    for prefix, directory in groups:
        for file in sorted(directory.rglob('*')):
            relative = str(file.relative_to(directory))
            name = prefix + '/' + relative
            if file.is_symlink():
                links[name] = str(file.readlink())
                continue
            if not file.is_file() or 'node_modules' in file.parts:
                continue
            data = file.read_bytes()
            entries[name] = dict(size=len(data), sha256=hashlib.sha256(data).hexdigest())
            archive.add(file, arcname=name, recursive=False)
    for file in [root / 'docs/benchmark/production-run.mjs', root / 'docs/benchmark/official-memory.mjs',
                 root / 'docs/benchmark/dc25-keyed-fast-path-final-results.json']:
        name = 'shared-tools/' + file.name
        data = file.read_bytes()
        entries[name] = dict(size=len(data), sha256=hashlib.sha256(data).hexdigest())
        archive.add(file, arcname=name, recursive=False)
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
