# select1k vsync wait — offline trace analysis

`analyze.py` re-reads preserved official traces and splits each official
click→commit time into main-thread **active** time and idle **wait**. It does
not change any score. Results and interpretation: [보고서](../../docs/benchmark/SELECT_VSYNC_PHASE.md),
[JSON](../../docs/benchmark/select-vsync-phase.json).

Run from the repo root. Each argument is `LABEL=DIR:apps[:base>cand+...]`;
`DIR` must hold `official-{main,reverse}/traces` (or `core-*`/`final-event-*`).

```sh
python3 experiments/select-vsync-phase/analyze.py docs/benchmark/select-vsync-phase.json \
  dc25=/private/tmp/lithent-dc25-20261027:baseline,candidate,react-hooks,react-classes,preact-hooks,preact-classes:baseline\>candidate \
  c4-owner=/private/tmp/lithent-c4-owner-20261029-v2:baseline,candidate,preact-classes:baseline\>candidate \
  key-snapshot=/private/tmp/lithent-c4-key-snapshot-20261030-v2:baseline,candidate,preact-classes:baseline\>candidate \
  static-dynamic=/private/tmp/lithent-static-dynamic-20261030-v2:stock,control,candidate:stock\>candidate \
  dc22-core=DC22/run:baseline,event,c2,combined:baseline\>event+baseline\>c2+baseline\>combined \
  dc22-final=DC22/run@final-event:baseline,event,react-hooks,react-classes,preact-hooks,preact-classes:baseline\>event \
  bulk-v2=/private/tmp/lithent-bulk-removal-v2-20261030:baseline,candidate,rows-baseline,rows-candidate:baseline\>candidate+rows-baseline\>rows-candidate
```

The `/private/tmp` staging directories are the collections whose traces are
also in the committed evidence archives (`dc25-keyed-fast-path-evidence-*`,
`c4-owner-evidence`, `c4-key-snapshot-evidence`, `static-dynamic-evidence`,
`bulk-removal-v2-evidence`).
For DC-22, extract the non-failed traces of
`docs/benchmark/comprehensive-traces-*.tar.gz` (`--exclude='*failed-attempts*'`)
and pass its `run/` directory (`@final-event` selects the six-app final run).

The grid phase is estimated from Viz-thread tasks that follow the measured
frame at ~16.67ms spacing; it is a heuristic and only feeds the phase columns.
Active time counts every main-thread trace event, including untraced tails of
the input task, so it is conservative. It is a diagnostic beside the official
total, not a replacement score.
