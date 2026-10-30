"""Archive actual stock/control/hinted inputs and samples, without overwrites."""
import hashlib
import json
import pathlib
import sys
import tarfile

out=pathlib.Path(sys.argv[1]).resolve();root=pathlib.Path.cwd()
dest=root/'docs/benchmark/static-dynamic-evidence.tar.gz'
manifest_path=root/'docs/benchmark/static-dynamic-evidence-manifest.json'
assert not dest.exists() and not manifest_path.exists(),'Do not overwrite evidence'
entries={};links={}
def add(archive,file,name):
    data=file.read_bytes();assert name not in entries
    entries[name]=dict(size=len(data),sha256=hashlib.sha256(data).hexdigest())
    archive.add(file,arcname=name,recursive=False)
with tarfile.open(dest,'w:gz') as archive:
    for prefix,directory in [('run',out),('setup',out.parent/'lithent-static-dynamic-20261030-setup'),('abandoned-v1',out.parent/'lithent-static-dynamic-20261030'),('tools',root/'experiments/static-dynamic')]:
        if not directory.exists():continue
        for file in sorted(directory.rglob('*')):
            name=prefix+'/'+str(file.relative_to(directory))
            if file.is_symlink():links[name]=str(file.readlink());continue
            if file.is_file() and 'node_modules' not in file.parts:add(archive,file,name)
    for relative in ['docs/benchmark/production-run.mjs','docs/benchmark/official-memory.mjs','docs/benchmark/dc25-keyed-fast-path-final-results.json']:
        add(archive,root/relative,'shared-tools/'+relative)
decoded={}
with tarfile.open(dest,'r:gz') as archive:
    for member in archive:
        data=archive.extractfile(member).read();decoded[member.name]=dict(size=len(data),sha256=hashlib.sha256(data).hexdigest())
assert decoded==entries
manifest=dict(archive=dest.name,size=dest.stat().st_size,sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),entryCount=len(entries),decodedVerified=True,entries=entries,dependencySymlinksExcluded=links)
manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({k:v for k,v in manifest.items() if k not in ['entries','dependencySymlinksExcluded']}))
