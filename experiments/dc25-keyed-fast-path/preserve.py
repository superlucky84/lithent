"""Stream bounded deterministic evidence archives; never overwrite prior evidence."""
from pathlib import Path
import gzip
import hashlib
import json
import os
import sys
import tarfile

root = Path(__file__).resolve().parents[2]
out = Path(sys.argv[1]).resolve()
destination = root / 'docs/benchmark'
prefix = 'dc25-keyed-fast-path-evidence'
assert not list(destination.glob(prefix + '*.tar.gz'))
assert not (destination / (prefix + '-manifest.json')).exists()

def digest(file):
    value = hashlib.sha256()
    with file.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            value.update(chunk)
    return value.hexdigest()

def walk(directory):
    for parent, dirs, files in os.walk(directory, followlinks=False):
        dirs[:] = sorted(name for name in dirs if name not in {'node_modules', 'npm-cache', '__pycache__', '.git'}
                         and not name.endswith('-cache') and not (Path(parent) / name).is_symlink())
        for name in sorted(files):
            file = Path(parent) / name
            if not file.is_symlink() and name != '.DS_Store':
                yield file

initial = json.loads((out / 'initial.json').read_text())
for name, expected in initial['files'].items():
    assert digest(root / name) == expected, name
for name, expected in initial['sibling']['files'].items():
    assert digest(Path(name)) == expected, name
plan = json.loads((out / 'measurement-plan.json').read_text())
for name, expected in plan['sourceFiles'].items():
    assert digest(root / name) == expected, name
assert json.loads((out / 'final-candidate-audit.json').read_text())['pass']
assert json.loads((out / 'retention.json').read_text())['complete']
assert json.loads((out / 'dispose-results.json').read_text())['complete']
assert json.loads((out / 'browser-checks/command.json').read_text())['status'] == 0

inputs = [('run/' + str(file.relative_to(out)), file) for file in walk(out)]
inputs += [('repo/' + str(file.relative_to(root)), file)
           for file in walk(root / 'experiments/dc25-keyed-fast-path')]
for name in ['src/tests/core-keyedFastPath.test.tsx', 'e2e/server.mjs', 'playwright.config.ts',
             'scripts/emit-declaration-formats.mjs', 'docs/benchmark/dc25-keyed-fast-path-candidate.patch',
             *initial['files']]:
    inputs.append(('repo/' + name, root / name))
inputs = sorted(dict(inputs).items())
limit = 64 * 1024 * 1024
parts, entries = [], []
current = None
tar = compressed = handle = None

def close_part():
    global tar, compressed, handle
    if tar is None:
        return
    tar.close()
    compressed.close()
    handle.close()
    file = destination / current['file']
    current.update(sha256=digest(file), bytes=file.stat().st_size)
    parts.append(current.copy())
    print(json.dumps(current), flush=True)
    tar = compressed = handle = None

for name, file in inputs:
    size = file.stat().st_size
    if tar is None or current['rawBytes'] + size > limit:
        close_part()
        current = {'file': f'{prefix}-{len(parts) + 1:03}.tar.gz', 'rawBytes': 0, 'entries': 0}
        handle = (destination / current['file']).open('xb')
        compressed = gzip.GzipFile(filename='', mode='wb', fileobj=handle, mtime=0, compresslevel=6)
        tar = tarfile.open(fileobj=compressed, mode='w|')
    expected = digest(file)
    metadata = tarfile.TarInfo(name)
    metadata.size, metadata.mode, metadata.mtime = size, 0o644, 0
    with file.open('rb') as source:
        tar.addfile(metadata, source)
    assert digest(file) == expected, 'Input changed during preservation: ' + str(file)
    current['rawBytes'] += size
    current['entries'] += 1
    entries.append({'path': name, 'sha256': expected, 'bytes': size, 'part': current['file']})
close_part()
manifest = {'format': 'dc25-evidence@1', 'head': initial['head'], 'command': sys.argv, 'python': sys.version,
            'parts': parts, 'entries': entries,
            'excluded': 'node_modules, npm-cache, transient caches and symlinks; locks/inventories/build bytes are included. Final Markdown reports remain separate from frozen execution inputs.'}
(destination / (prefix + '-manifest.json')).write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'parts': len(parts), 'entries': len(entries), 'compressedBytes': sum(part['bytes'] for part in parts)}), flush=True)
