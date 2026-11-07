"""Stream reproducible inputs/results and all trace bytes into bounded archives."""
from pathlib import Path
import gzip
import hashlib
import json
import subprocess
import sys
import tarfile

root = Path(__file__).resolve().parents[2]
out = Path(sys.argv[1]).resolve()
dest = root / 'docs/benchmark'
assert not (dest / 'comprehensive-evidence-manifest.json').exists()

def digest(file):
    result = hashlib.sha256()
    with file.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(block)
    return result.hexdigest()

files = []
for file in sorted(out.rglob('*')):
    if file.is_symlink() or not file.is_file() or 'node_modules' in file.parts:
        continue
    # Evidence output must live outside the run; avoid incidental crash dumps.
    if file.name.startswith('core.') and file.suffix != '.json':
        continue
    files.append(('run/' + str(file.relative_to(out)), file))
for directory in ['src', 'lithentConcurrent/src', 'experiments/comprehensive', 'e2e', 'skills/lithent']:
    for file in sorted((root / directory).rglob('*')):
        if file.is_file() and not file.is_symlink() and 'node_modules' not in file.parts and '__pycache__' not in file.parts:
            files.append(('repo/' + str(file.relative_to(root)), file))
for name in ['README.md','package.json','pnpm-lock.yaml','vite.config.js','tsconfig.json','eslint.config.js','playwright.config.ts','scripts/size-report.js','scripts/emit-declaration-formats.mjs','lithent-agent-addon.md','lithentConcurrent/alias.js','lithentConcurrent/vite.config.js','lithentConcurrent/vitest.config.js','lithentConcurrent/tsconfig.json','lithentConcurrent/package.json','experiments/peer-baseline/statistics.mjs','experiments/keyed-placement/lifetime.test.tsx']:
    files.append(('repo/' + name, root / name))
for name in ['production-run.mjs','official-memory.mjs','targeted-update.mjs','keyed-placement-candidate.patch']:
    files.append(('repo/docs/benchmark/' + name, root / 'docs/benchmark' / name))

traces = [(name,file) for name,file in files if '/traces/' in name]
inputs = [(name,file) for name,file in files if '/traces/' not in name]
groups = [('comprehensive-evidence.tar.gz', inputs)]
chunk = []
size = 0
for item in traces:
    n = item[1].stat().st_size
    assert n < 90 * 1024 ** 2, f'Split large trace before archiving: {item[1]}'
    if chunk and size + n > 64 * 1024 ** 2:
        groups.append((f'comprehensive-traces-{len(groups):03d}.tar.gz',chunk))
        chunk = []
        size = 0
    chunk.append(item)
    size += n
if chunk:
    groups.append((f'comprehensive-traces-{len(groups):03d}.tar.gz',chunk))

manifest = {'format':'tar+gzip, deterministic metadata, every listed input and trace retained','head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'archives':[],'files':{}}
for filename, entries in groups:
    target = dest / filename
    assert not target.exists(), target
    with target.open('xb') as raw:
        with gzip.GzipFile(fileobj=raw,filename='',mode='wb',compresslevel=9,mtime=0) as zipped:
            with tarfile.open(fileobj=zipped,mode='w|') as archive:
                for name, file in entries:
                    info = tarfile.TarInfo(name)
                    info.size = file.stat().st_size
                    info.mode = 0o644
                    info.mtime = 0
                    with file.open('rb') as stream:
                        archive.addfile(info,stream)
                    manifest['files'][name] = {'archive':filename,'bytes':info.size,'sha256':digest(file)}
    assert target.stat().st_size < 100 * 1024 ** 2, target
    manifest['archives'].append({'file':filename,'bytes':target.stat().st_size,'sha256':digest(target),'entries':len(entries)})

assert len(manifest['files']) == len(files)
manifest['traceFiles'] = len(traces)
manifest['totalEntries'] = len(files)
(dest / 'comprehensive-evidence-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'archives':manifest['archives'],'entries':len(files),'traceFiles':len(traces)}))
