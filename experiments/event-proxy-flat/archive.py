"""Archive explicit non-secret inputs/output with independently decoded hashes."""
import base64
import gzip
import hashlib
import json
from pathlib import Path
import sys
out=Path(sys.argv[1]).resolve();logs=Path(sys.argv[2]).resolve();root=Path(__file__).resolve().parents[2]
entries={}
def add(key,p):
    data=p.read_bytes();assert key not in entries
    entries[key]=dict(bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),base64=base64.b64encode(data).decode())
for p in sorted(out.rglob('*')):
    if p.is_file():add('run/'+p.relative_to(out).as_posix(),p)
for p in sorted(Path(__file__).parent.glob('*')):
    if p.is_file():add('tools/'+p.name,p)
for p in sorted(logs.glob('*')):
    if p.is_file():add('validation/'+p.name,p)
for name in ['package.json','pnpm-lock.yaml','vite.config.js','tsconfig.json','lithentConcurrent/alias.js','src/tests/core-eventContract.test.ts']:
    add('repository/'+name,root/name)
payload=json.dumps(dict(format='lithent-event-flat-evidence-v1',entries=entries),separators=(',',':')).encode()
dest=root/'docs/benchmark/event-proxy-flat-evidence.json.gz'
dest.write_bytes(gzip.compress(payload,compresslevel=9,mtime=0))
restored=json.loads(gzip.decompress(dest.read_bytes()))
for key,item in restored['entries'].items():
    data=base64.b64decode(item['base64']);assert len(data)==item['bytes'] and hashlib.sha256(data).hexdigest()==item['sha256'],key
meta=dict(entries=len(entries),compressedBytes=dest.stat().st_size,sha256=hashlib.sha256(dest.read_bytes()).hexdigest())
(root/'docs/benchmark/event-proxy-flat-evidence-manifest.json').write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps(meta,indent=2))
