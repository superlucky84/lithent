"""GC work per cycle: V8's --trace-gc-nvp lines between the markers of
micro-gc.mjs, summed. Bytes copied and promoted are deterministic with
--predictable; pause times are wall-clock.

  python3 gc.py <name> <app> <scenario> <W> <K>
"""
import os, re, subprocess, sys
variant, app, scenario, W, K = sys.argv[1:6]
out = subprocess.run(['node', '--predictable', '--single-threaded', '--trace-gc-nvp', 'micro-gc.mjs', variant, app, scenario, W, K],
                     capture_output=True, text=True, cwd=os.path.dirname(os.path.abspath(__file__))).stdout
on = False
s = {'scav': 0, 'mc': 0, 'survived': 0, 'promoted': 0, 'pause_s': 0.0, 'pause_ms': 0.0}
for line in out.splitlines():
    if 'MEASURE_START' in line: on = True; continue
    if 'MEASURE_END' in line: break
    if not on or 'gc=' not in line: continue
    f = dict(re.findall(r'(\S+?)=(\S+)', line))
    if f['gc'] == 's':
        s['scav'] += 1; s['survived'] += int(f['new_space_survived']); s['promoted'] += int(f['promoted']); s['pause_s'] += float(f['pause'])
    else:
        s['mc'] += 1; s['pause_ms'] += float(f['pause'])
k = int(K)
print(f"{variant:8} {app:6} {scenario:7} scav/cyc {s['scav']/k:.2f} mc/cyc {s['mc']/k:.3f} copied KB/cyc {(s['survived']+s['promoted'])/k/1024:8.1f} (promoted {s['promoted']/k/1024:7.1f}) pause ms/cyc scav {s['pause_s']/k:.3f} mc {s['pause_ms']/k:.3f}")
