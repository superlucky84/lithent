"""Bootstrap the weighted change of a pair from official-results.json.

  python3 official-weighted-ci.py OUT candidate:baseline [...] [--limit 0.03]

Resamples within each round (as official-analyze.py does per item), takes the
pooled median of every item and combines them with the official weights.
Prints the 95% interval and the share of resamples at or below the limit. It
does not cover session-to-session or systematic differences.
"""
import json
import math
import random
import statistics as st
import sys
from pathlib import Path

args = sys.argv[1:]
limit = float(args.pop(args.index('--limit') + 1)) if '--limit' in args else 0.03
args = [a for a in args if a != '--limit']
result = json.loads((Path(args[0]) / 'official-results.json').read_text())
weights, cpu = result['summary']['weights'], result['cpu']
N = 4000
pct = lambda x: f'{100 * x:+.2f}%'
for pair in args[1:]:
    names = pair.split(':')
    for metric in ['total', 'script', 'active']:
        rng = random.Random(1)
        changes = []
        for _ in range(N):
            log = 0
            for item, weight in weights.items():
                cand, base = [st.median([v for rows in cpu[name][item].values()
                                         for v in rng.choices([r[metric] for r in rows], k=len(rows))])
                              for name in names]
                log += weight * math.log(cand / base)
            changes.append(math.exp(log / sum(weights.values())) - 1)
        changes.sort()
        print(f"{pair:16} {metric:6} median {pct(changes[N // 2])} "
              f"95% [{pct(changes[int(.025 * N)])}, {pct(changes[int(.975 * N)])}] "
              f"<= {pct(limit)}: {sum(c <= limit for c in changes) / N:.1%}")
