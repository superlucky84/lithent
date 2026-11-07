"""Preserve the final default-browser check without replacing the main evidence."""
from pathlib import Path
import gzip
import hashlib
import json
import subprocess
import sys
import tarfile

root = Path(__file__).resolve().parents[2]
out = Path(sys.argv[1]).resolve()
directory = out / 'default-browser'
assert json.loads((directory / 'validation.json').read_text())['pass']
destination = root / 'docs/benchmark'
part = 'dc25-keyed-fast-path-closeout-evidence.tar.gz'
manifest_file = destination / 'dc25-keyed-fast-path-closeout-manifest.json'
assert not (destination / part).exists() and not manifest_file.exists()
source = (root / 'experiments/dc25-keyed-fast-path/audit-archive.py').read_text()
source = source.replace('root = Path(__file__).resolve().parents[2]', f'root = Path({str(root)!r})')
source = source.replace('dc25-keyed-fast-path-evidence-manifest.json', 'dc25-keyed-fast-path-closeout-manifest.json')
source = source.replace('dc25-keyed-fast-path-archive-audit.json', 'dc25-keyed-fast-path-closeout-audit.json')
auditor = directory / 'closeout-auditor.py'
auditor.write_text(source)
files = [('run/default-browser/' + str(file.relative_to(directory)), file)
         for file in directory.rglob('*') if file.is_file() and not file.is_symlink()]
for name in ['default-browser.mjs', 'report.mjs', 'closeout.py', 'README.md']:
    file = root / 'experiments/dc25-keyed-fast-path' / name
    files.append(('repo/' + str(file.relative_to(root)), file))
entries = []
with (destination / part).open('xb') as handle:
    with gzip.GzipFile(filename='', mode='wb', fileobj=handle, mtime=0, compresslevel=6) as compressed:
        with tarfile.open(fileobj=compressed, mode='w|') as archive:
            for name, file in sorted(files):
                data = file.read_bytes()
                metadata = tarfile.TarInfo(name)
                metadata.size, metadata.mode, metadata.mtime = len(data), 0o644, 0
                with file.open('rb') as stream:
                    archive.addfile(metadata, stream)
                entries.append({'path': name, 'part': part, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
with (destination / part).open('rb') as stream:
    digest = hashlib.file_digest(stream, 'sha256').hexdigest()
manifest = {'format': 'dc25-closeout@1', 'command': sys.argv,
            'note': 'Supplemental unchanged-default browser checks and derived report tooling; the original 13 archives and measured inputs are untouched. This snapshot supersedes only the derived report generator/README in the earlier repo tooling snapshot.',
            'parts': [{'file': part, 'sha256': digest, 'bytes': (destination / part).stat().st_size, 'entries': len(entries)}],
            'entries': entries}
manifest_file.write_text(json.dumps(manifest, indent=2) + '\n')
subprocess.run([sys.executable, str(auditor)], check=True)
