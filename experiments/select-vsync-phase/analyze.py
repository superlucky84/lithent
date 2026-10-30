"""Offline analysis of preserved official traces: vsync wait in select1k.

Does not change any official score. For each trace it recomputes the official
click->commit window and splits it into
  active = union of main-thread trace events inside the window
  wait   = total - active (idle main thread; in select1k this is waiting for
           the next 60Hz BeginFrame tick in headless Chrome)
For select1k it also records the runner's forced-GC duration (the
EvaluateScript of window.gc() before the click) and the phase of the GC start
and of the click on the BeginFrame grid, estimated from the Viz ticks that
follow the measured frame. The phase estimate is heuristic; samples without a
clean post-frame tick chain are left out of the phase columns only.

usage: python3 analyze.py OUT.json SESSION=DIR:app,app[:pairs] ...
  DIR contains official-main/ and official-reverse/ (or core-main/ ...) with
  traces/; DIR@prefix selects another prefix such as final-event. pairs are base>cand separated by '+'; peers are apps whose name
  contains 'react' or 'preact'.
"""
import glob
import json
import math
import os
import statistics as st
import sys

T = 1000 / 60.0  # ms per BeginFrame tick
ITEMS = ['01_run1k', '02_replace1k', '03_update10th1k_x16', '04_select1k',
         '05_swap1k', '06_remove-one-1k', '07_create10k',
         '08_create1k-after1k_x2', '09_clear1k_x8']
_w = json.load(open('docs/benchmark/dc25-keyed-fast-path-final-results.json'))
W = {r['id']: w for r, w in zip(_w['rows']['pooled'], _w['weights'])}


def official_window(ev):
    clicks = [e for e in ev if e.get('name') == 'EventDispatch'
              and (e.get('args') or {}).get('data', {}).get('type') == 'click']
    assert len(clicks) == 1
    click = clicks[0]
    pid, t0 = click['pid'], click['ts']
    cend = t0 + click['dur']
    logic = [cend]
    for e in ev:
        if e['pid'] != pid or e['ts'] <= cend:
            continue
        n = e.get('name')
        if n in ('Layout', 'FunctionCall', 'FireAnimationFrame') and e.get('ph') == 'X':
            logic.append(e['ts'] + e.get('dur', 0))
        elif n == 'TimerFire' and e.get('ph') == 'X':
            logic.append(e['ts'])
    start_from = max(logic)
    commits = [e for e in ev if e['pid'] == pid and e.get('name') == 'Commit'
               and e.get('ph') == 'X' and e['ts'] > cend]
    after = sorted((c for c in commits if c['ts'] > start_from), key=lambda c: c['ts'])
    commit = after[0] if after else sorted(commits, key=lambda c: c['ts'] + c['dur'])[-1]
    return click, t0, commit


def phase_info(ev, click, t0, commit):
    """Grid phase of the forced-GC start and of the click, or None."""
    names = {(e['pid'], e['tid']): e['args']['name'] for e in ev if e.get('name') == 'thread_name'}
    rel = lambda t: (t - t0) / 1000
    viz = sorted(rel(e['ts']) for e in ev if names.get((e['pid'], e['tid'])) == 'VizCompositorThread'
                 and e.get('ph') == 'X' and e.get('name') == 'RunTask')
    heads = [v for i, v in enumerate(viz) if i == 0 or v - viz[i - 1] > 1.0]
    chain = []
    for h in (h for h in heads if h > rel(commit['ts']) + 8):
        if not chain:
            chain = [h]
        elif abs(h - chain[-1] - T) < 1.2:
            chain.append(h)
        elif h - chain[-1] > T + 1.2:
            break
    if len(chain) < 2:
        return None
    offset = st.median([h - round((h - chain[0]) / T) * T for h in chain])
    main = [e for e in ev if e['pid'] == click['pid'] and e['tid'] == click['tid'] and e.get('ph') == 'X']
    gcs = [e for e in main if e.get('name') == 'EvaluateScript' and e['dur'] > 5000 and e['ts'] < t0]
    if not gcs:
        return None
    gc = max(gcs, key=lambda e: e['ts'])
    return dict(gcDur=gc['dur'] / 1000, gcStartPhase=(rel(gc['ts']) - offset) % T,
                clickPhase=(-offset) % T, gcEndToClick=-rel(gc['ts'] + gc['dur']))


def analyze(file, with_phase):
    ev = json.load(open(file))['traceEvents']
    click, t0, commit = official_window(ev)
    t1 = commit['ts'] + commit['dur']
    iv = sorted((max(e['ts'], t0), min(e['ts'] + e['dur'], t1)) for e in ev
                if e['pid'] == click['pid'] and e['tid'] == click['tid'] and e.get('ph') == 'X'
                and e.get('dur') and e['ts'] < t1 and e['ts'] + e['dur'] > t0)
    busy, end = 0, -1e30
    for a, b in iv:
        if b > end:
            busy += b - max(a, end)
            end = b
    r = dict(total=(t1 - t0) / 1000, active=busy / 1000, wait=(t1 - t0 - busy) / 1000,
             js=click['dur'] / 1000)
    if with_phase:
        p = phase_info(ev, click, t0, commit)
        if p:
            r.update(p)
    return r


def circ(values):
    a = [2 * math.pi * v / T for v in values]
    s, c = sum(map(math.sin, a)), sum(map(math.cos, a))
    return dict(mean=(math.atan2(s, c) % (2 * math.pi)) * T / (2 * math.pi),
                R=math.hypot(s, c) / len(a), n=len(a))


def stage_dirs(root):
    root, _, only = root.partition('@')
    for prefix in (only,) if only else ('official', 'core', 'final-event'):
        dirs = [(o, f'{root}/{prefix}-{o}/traces') for o in ('main', 'reverse')]
        if all(os.path.isdir(d) for _, d in dirs):
            return dirs
    raise SystemExit('no traces under ' + root)


result = {'scope': __doc__.strip(), 'tickMs': T, 'sessions': {}}
for spec in sys.argv[2:]:
    label, rest = spec.split('=', 1)
    parts = rest.split(':')
    root, apps = parts[0], parts[1].split(',')
    pairs = [p.split('>') for p in parts[2].split('+')] if len(parts) > 2 else []
    data = {}
    for app in apps:
        for item in ITEMS:
            rows = []
            for order, d in stage_dirs(root):
                for f in sorted(glob.glob(f'{d}/{app}-production-keyed_{item}_*.json')):
                    x = analyze(f, item == '04_select1k')
                    x['order'] = order
                    rows.append(x)
            data.setdefault(app, {})[item] = rows
    med = lambda a, i, k, o=None: st.median([r[k] for r in data[a][i] if o is None or r['order'] == o])
    session = {'root': root, 'select': {}, 'items': {}, 'pairs': {}, 'goal': {}}
    for app in apps:
        sel = data[app]['04_select1k']
        ph = [r for r in sel if 'gcStartPhase' in r]
        session['select'][app] = dict(
            n=len(sel), total=med(app, '04_select1k', 'total'), active=med(app, '04_select1k', 'active'),
            wait=med(app, '04_select1k', 'wait'), js=med(app, '04_select1k', 'js'),
            gcDur=st.median([r['gcDur'] for r in ph]) if ph else None,
            gcEndToClick=st.median([r['gcEndToClick'] for r in ph]) if ph else None,
            gcStartPhase=circ([r['gcStartPhase'] for r in ph]) if ph else None,
            clickPhase=circ([r['clickPhase'] for r in ph]) if ph else None)
        session['items'][app] = {i: {k: med(app, i, k) for k in ('total', 'active', 'wait')} for i in ITEMS}
    for base, cand in pairs:
        entry = {}
        for metric in ('total', 'active'):
            for o in (None, 'main', 'reverse'):
                ratios = {i: med(cand, i, metric, o) / med(base, i, metric, o) for i in ITEMS}
                wgm = math.exp(sum(W[i] * math.log(x) for i, x in ratios.items()) / sum(W.values()))
                entry[f'{metric}/{o or "pooled"}'] = dict(weighted=wgm - 1, select=ratios['04_select1k'] - 1)
        session['pairs'][f'{cand}/{base}'] = entry
    peers = [a for a in apps if 'react' in a or 'preact' in a]
    if peers:
        for app in (a for a in apps if a not in peers):
            for metric in ('total', 'active'):
                ratios = {i: med(app, i, metric) / min(med(p, i, metric) for p in peers) for i in ITEMS}
                session['goal'].setdefault(app, {})[metric] = dict(
                    passes=sum(x <= 1.10 for x in ratios.values()), ratios=ratios)
    result['sessions'][label] = session
    print('==', label)
    for app, s in session['select'].items():
        gp = s['gcStartPhase']
        print(f"  {app:15} select total {s['total']:6.3f} active {s['active']:6.3f} wait {s['wait']:5.2f} js {s['js']:5.2f}"
              + (f" | gc {s['gcDur']:5.1f}ms start phase {gp['mean']:5.2f} R {gp['R']:.2f} click phase {s['clickPhase']['mean']:5.2f} (n={gp['n']})" if gp else ''))
    for k, e in session['pairs'].items():
        print(f"  {k:24} weighted total {100*e['total/pooled']['weighted']:+.2f}% (main {100*e['total/main']['weighted']:+.2f} rev {100*e['total/reverse']['weighted']:+.2f})"
              f" active {100*e['active/pooled']['weighted']:+.2f}% (main {100*e['active/main']['weighted']:+.2f} rev {100*e['active/reverse']['weighted']:+.2f})"
              f" | select total {100*e['total/pooled']['select']:+.2f}% active {100*e['active/pooled']['select']:+.2f}%")
    for app, g in session['goal'].items():
        print(f"  goal {app:12} total {g['total']['passes']}/9 (select {g['total']['ratios']['04_select1k']:.3f})  active {g['active']['passes']}/9 (select {g['active']['ratios']['04_select1k']:.3f})")
json.dump(result, open(sys.argv[1], 'x'), indent=1)
