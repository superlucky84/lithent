import { makeRandom } from './renderSpec';
import { ReplayFailure, replayKeyedPortal } from './keyedPortalReplay';
import type { Row, Rows, Scenario, Update } from './keyedPortalReplay';

export const generateKeyedPortal = (seed: number, steps: number): Scenario => {
  const random = makeRandom(seed);
  const keys = [0, 1, 2, 3, 4, 5];
  const widths = [0, 1, 2] as const;
  const newRow = (key: number): Row => ({
    key,
    inline: random.pick(widths),
    remote: random.pick(widths),
  });
  const initial = random
    .shuffle(keys)
    .slice(0, 2 + random.int(4))
    .map(newRow);
  let rows: Rows = initial;
  const ticks = Array.from({ length: steps }, () => {
    const mounted = rows.flatMap(row => (row ? [row.key] : []));
    const length = random.int(3) === 0 ? 2 + random.int(3) : 1;
    return Array.from({ length }, (): Update => {
      if (mounted.length && random.int(3) === 0) {
        return { bump: random.pick(mounted) };
      }

      const active = rows.filter(row => row !== null);
      const key = random.pick(keys);
      switch (random.int(4)) {
        case 0:
          rows = random.shuffle(rows);
          break;
        case 1:
          if (active.some(row => row.key === key)) {
            rows = rows.map(row => (row?.key === key ? null : row));
          } else {
            active.splice(random.int(active.length + 1), 0, newRow(key));
            rows = active;
          }
          break;
        case 2:
          if (active.length) {
            const change = random.pick(active).key;
            rows = rows.map(row =>
              row?.key === change ? newRow(change) : row
            );
          }
          break;
        case 3:
          rows = random
            .shuffle(keys)
            .slice(0, random.int(keys.length + 1))
            .map(key => active.find(row => row.key === key) ?? newRow(key));
          break;
      }
      return { rows };
    });
  });
  return { initial, ticks };
};

function* removeRanges<T>(items: T[], minLength = 0) {
  for (
    let size = items.length - minLength;
    size >= 1;
    size = Math.floor(size / 2)
  ) {
    for (let i = 0; i + size <= items.length; i += size) {
      yield [...items.slice(0, i), ...items.slice(i + size)];
    }
  }
}

const mapRows = (scenario: Scenario, map: (rows: Rows) => Rows): Scenario => ({
  initial: map(scenario.initial),
  ticks: scenario.ticks.map(tick =>
    tick.map(update => ('rows' in update ? { rows: map(update.rows) } : update))
  ),
});

function* simplifyRows(rows: Rows) {
  yield* removeRanges(rows);
  for (const [i, row] of rows.entries()) {
    if (row === null) continue;
    for (const field of ['inline', 'remote'] as const) {
      for (const width of [0, 1] as const) {
        if (width >= row[field]) break;
        yield rows.map((item, index) =>
          index === i ? { ...row, [field]: width } : item
        );
      }
    }
  }
}

function* candidates(scenario: Scenario): Generator<Scenario> {
  for (const ticks of removeRanges(scenario.ticks)) {
    yield { ...scenario, ticks };
  }
  const keys = new Set<number>();
  for (const row of scenario.initial) if (row) keys.add(row.key);
  for (const update of scenario.ticks.flat()) {
    if ('rows' in update) {
      for (const row of update.rows) if (row) keys.add(row.key);
    }
  }
  for (const key of keys) {
    const smaller = mapRows(scenario, rows =>
      rows.filter(row => row?.key !== key)
    );
    yield {
      ...smaller,
      ticks: smaller.ticks
        .map(tick =>
          tick.filter(update => !('bump' in update && update.bump === key))
        )
        .filter(tick => tick.length),
    };
  }
  for (const initial of simplifyRows(scenario.initial)) {
    yield { ...scenario, initial };
  }
  for (const [i, tick] of scenario.ticks.entries()) {
    const withTick = (next: Update[]) => ({
      ...scenario,
      ticks: scenario.ticks.map((item, index) => (index === i ? next : item)),
    });
    for (const next of removeRanges(tick, 1)) yield withTick(next);
    for (const [j, update] of tick.entries()) {
      if (!('rows' in update)) continue;
      for (const rows of simplifyRows(update.rows)) {
        yield withTick(
          tick.map((item, index) => (index === j ? { rows } : item))
        );
      }
    }
  }
}

export const reduceKeyedPortal = async (
  scenario: Scenario,
  failure: ReplayFailure
) => {
  let current = scenario;
  const limit = 250;
  let attempts = 0;

  // Restart after each accepted reduction. Keep the phase and failed check.
  while (true) {
    let reduced = false;
    for (const candidate of candidates(current)) {
      if (attempts === limit)
        return { scenario: current, attempts, exhausted: true };
      attempts++;
      try {
        await replayKeyedPortal(candidate);
      } catch (error) {
        if (!(error instanceof ReplayFailure)) throw error;
        if (error.phase === failure.phase && error.check === failure.check) {
          current = candidate;
          reduced = true;
          break;
        }
      }
    }
    if (!reduced) return { scenario: current, attempts, exhausted: false };
  }
};
