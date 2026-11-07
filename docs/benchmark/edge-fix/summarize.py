"""Instructions per cycle, (count with K cycles - count with 0) / K, of two
variants in ir.sh output lines.

  python3 summarize.py <file> <before> <after>
"""
import sys

lines = [l.split() for l in open(sys.argv[1]) if l.strip() and l[0] != 'A']
names = sys.argv[2:] or ['before', 'after']
ir = {}
for v, app, sc, k, n in lines:
    ir[(v, app, sc, int(k))] = int(n)

order = ['create', 'replace', 'update', 'select', 'swap', 'remove', 'append',
         'clear', 'create10k']
print(f"{'app':6} {'scenario':9} | {names[0] + ' Minstr':>13} | {names[1] + ' Minstr':>13} | change")
for app in sorted({a for (_, a, _, _) in ir}):
    for sc in order:
        per = {}
        for v in names:
            ks = sorted(k for (vv, a, s, k) in ir if (vv, a, s) == (v, app, sc))
            if len(ks) < 2:
                break
            k = ks[-1]
            per[v] = (ir[(v, app, sc, k)] - ir[(v, app, sc, 0)]) / k / 1e6
        if len(per) == 2:
            a, b = per[names[0]], per[names[1]]
            print(f"{app:6} {sc:9} | {a:13.3f} | {b:13.3f} | {100 * (b / a - 1):+6.2f}%")
