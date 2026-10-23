"""Save explicit non-secret experiment inputs, sources, output and validation."""
import base64
import gzip
import hashlib
import json
from pathlib import Path
import sys

out=Path(sys.argv[1]).resolve()
logs=Path(sys.argv[2]).resolve()
root=Path(__file__).resolve().parents[2]
entries={}
def add(key,path):
    data=path.read_bytes()
    assert key not in entries,key
    entries[key]=dict(bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),base64=base64.b64encode(data).decode())
for p in sorted(out.rglob('*')):
    if p.is_file():add('run/'+p.relative_to(out).as_posix(),p)
for p in sorted(Path(__file__).parent.glob('*')):
    if p.is_file():add('tools/'+p.name,p)
for p in sorted(logs.glob('*')):
    if p.is_file():add('validation/'+p.name,p)
for name in ['package.json','pnpm-lock.yaml','vite.config.js','tsconfig.json','lithentConcurrent/alias.js','src/tests/core-eventContract.test.ts']:
    add('repository/'+name,root/name)
# Preserve the source that exposed the first concurrent shared-teardown failure.
prior=out.parent/'event-proxy-final-20261024'
if prior.exists():
    for name in ['build.json','candidate/source/src/render.ts','candidate/source/src/hook/internal/unmount.ts','candidate/source/src/utils/event.ts']:
        add('superseded/before-native-cleanup-fallback/'+name,prior/name)
payload=json.dumps(dict(format='lithent-event-proxy-evidence-v1',entries=entries),separators=(',',':')).encode()
dest=root/'docs/benchmark/event-proxy-evidence.json.gz'
dest.write_bytes(gzip.compress(payload,compresslevel=9,mtime=0))
# Decode and verify each entry independently of the encoder's in-memory bytes.
restored=json.loads(gzip.decompress(dest.read_bytes()))
for key,entry in restored['entries'].items():
    data=base64.b64decode(entry['base64'])
    assert len(data)==entry['bytes'] and hashlib.sha256(data).hexdigest()==entry['sha256'],key
meta=dict(entries=len(entries),compressedBytes=dest.stat().st_size,sha256=hashlib.sha256(dest.read_bytes()).hexdigest())
(root/'docs/benchmark/event-proxy-evidence-manifest.json').write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps(meta,indent=2))
