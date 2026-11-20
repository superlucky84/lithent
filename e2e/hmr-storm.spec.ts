import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test as plain } from '@playwright/test';
import type { Page } from '@playwright/test';
import { test, expect, ready } from './test';

// docs/hmr-storm: a save must cause a bounded amount of HMR work that then
// stops. Earlier HMR loops each had a different cause and were fixed one by
// one; these tests do not look for a cause, only for activity that goes on:
// HMR updates, reloads, Lithent HMR warnings, and DOM changes (an endless
// replacement logs nothing). Each scenario covers a path that looped before
// or that a fix changed. `pnpm test:e2e:mutations` checks that an injected
// endless replacement fails here.

/** Milliseconds without HMR activity or DOM changes that count as settled. */
const QUIET = 1000;
/** A save still causing activity after this long is a loop. */
const LIMIT = 8000;

type Activity = { updates: number; reloads: number; warnings: number };

const watch = async (page: Page): Promise<Activity> => {
  const activity = { updates: 0, reloads: 0, warnings: 0 };
  page.on('console', message => {
    const text = message.text();
    if (text.startsWith('[vite] hot updated:')) activity.updates++;
    if (text.includes('[Lithent HMR]')) activity.warnings++;
  });
  page.on('load', () => activity.reloads++);
  await page.addInitScript(() => {
    const counter = window as unknown as { stormDomChanges: number };
    counter.stormDomChanges = 0;
    new MutationObserver(records => {
      counter.stormDomChanges += records.length;
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
  });
  return activity;
};

const domChanges = (page: Page) =>
  page
    .evaluate(
      () => (window as unknown as { stormDomChanges?: number }).stormDomChanges
    )
    // A reload replaces the page while it is read: count it as a change.
    .catch(() => -1);

const settle = async (page: Page, activity: Activity, label: string) => {
  const signature = async () =>
    `${activity.updates}/${activity.reloads}/${activity.warnings}/${await domChanges(page)}`;
  const start = Date.now();
  let last = await signature();
  let changed = Date.now();
  while (Date.now() - start < LIMIT) {
    await page.waitForTimeout(100);
    const now = await signature();
    if (now !== last) {
      last = now;
      changed = Date.now();
    } else if (Date.now() - changed >= QUIET) return;
  }
  throw new Error(
    `${label}: HMR still active after ${LIMIT}ms (updates/reloads/warnings/DOM changes ${last})`
  );
};

const until = async (page: Page, condition: () => boolean, label: string) => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > LIMIT) throw new Error(`${label}: timed out`);
    await page.waitForTimeout(50);
  }
};

const sources = (core: string) => {
  const originals = new Map<string, string>();
  const path = (name: string) => resolve('.e2e-work', core, 'storm', name);
  return {
    async edit(name: string, change: (source: string) => string) {
      const file = path(name);
      const current = await readFile(file, 'utf8');
      if (!originals.has(file)) originals.set(file, current);
      const next = change(current);
      if (next === current) throw new Error(`editing ${name} changed nothing`);
      await writeFile(file, next);
    },
    async restore(name: string) {
      const file = path(name);
      const original = originals.get(file);
      if (original === undefined) throw new Error(`${name} was not edited`);
      originals.delete(file);
      await writeFile(file, original);
    },
    async restoreAll() {
      for (const [file, original] of originals) await writeFile(file, original);
      originals.clear();
    },
  };
};

/**
 * One save: the page reaches the expected state, HMR activity stops, and
 * the work it took stays within the given limits.
 */
const save = async (
  page: Page,
  activity: Activity,
  label: string,
  write: () => Promise<void>,
  reached: () => Promise<void>,
  limits: Activity
) => {
  const before = { ...activity };
  await write();
  await reached();
  await settle(page, activity, label);
  const spent = {
    updates: activity.updates - before.updates,
    reloads: activity.reloads - before.reloads,
    warnings: activity.warnings - before.warnings,
  };
  for (const key of ['updates', 'reloads', 'warnings'] as const)
    expect(
      spent[key],
      `${label}: ${key} ${JSON.stringify(spent)}`
    ).toBeLessThanOrEqual(limits[key]);
};

const quiet = { updates: 2, reloads: 0, warnings: 0 };

test('HMR storm: component, store, export, cycle and entry edits settle', async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  const core = info.project.name;
  const activity = await watch(page);
  const files = sources(core);
  await ready(page, `/.e2e-work/${core}/storm/index.html`, core);
  const item = page.locator('.storm-item').first();
  const intact = async () => {
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('.storm-outer')).toHaveCount(2);
    await expect(page.locator('.storm-item')).toHaveCount(40);
  };
  const edited = (name: string, from: string, to: string) => () =>
    files.edit(name, source => source.replaceAll(from, to));
  const restored = (name: string) => () => files.restore(name);

  try {
    // Several components in one module, with nested and listed descendants.
    await save(
      page,
      activity,
      'component edit',
      edited('Items.tsx', 'original', 'changed'),
      () => expect(item).toHaveText('item changed 0'),
      quiet
    );
    await expect(page.locator('.storm-inner').first()).toHaveText(
      'inner changed 0'
    );
    await intact();
    await save(
      page,
      activity,
      'component restore',
      restored('Items.tsx'),
      () => expect(item).toHaveText('item original 0'),
      quiet
    );

    // Five saves in quick succession.
    await save(
      page,
      activity,
      'rapid saves',
      async () => {
        for (let version = 1; version <= 5; version++) {
          await files.edit('Items.tsx', source =>
            source.replace(/item (original|v\d)/, `item v${version}`)
          );
          await page.waitForTimeout(40);
        }
      },
      () => expect(item).toHaveText('item v5 0'),
      { updates: 5, reloads: 0, warnings: 0 }
    );
    await intact();
    await save(
      page,
      activity,
      'rapid restore',
      restored('Items.tsx'),
      () => expect(item).toHaveText('item original 0'),
      quiet
    );

    // An edit while the components are unmounted, then mounting them again.
    await page.locator('#storm-toggle').click();
    await expect(page.locator('.storm-outer')).toHaveCount(0);
    const beforeHidden = activity.updates;
    await save(
      page,
      activity,
      'edit while hidden',
      edited('Items.tsx', 'original', 'hidden'),
      () => until(page, () => activity.updates > beforeHidden, 'hidden update'),
      quiet
    );
    await page.locator('#storm-toggle').click();
    await expect(item).toHaveText('item hidden 0');
    await intact();
    await save(
      page,
      activity,
      'hidden restore',
      restored('Items.tsx'),
      () => expect(item).toHaveText('item original 0'),
      quiet
    );

    // A store module without components.
    const store = page.locator('.storm-store').first();
    await save(
      page,
      activity,
      'store edit',
      edited('store.ts', 'store original', 'store changed'),
      () => expect(store).toHaveText('store changed 0'),
      quiet
    );
    await save(
      page,
      activity,
      'store restore',
      restored('store.ts'),
      () => expect(store).toHaveText('store original 0'),
      quiet
    );

    // An ordinary export next to a component: the importer takes it.
    const mixed = page.locator('.storm-mixed');
    await save(
      page,
      activity,
      'export edit',
      edited('Mixed.tsx', 'mixed original', 'mixed changed'),
      () => expect(mixed).toHaveText('mixed changed'),
      { updates: 3, reloads: 0, warnings: 0 }
    );
    await save(
      page,
      activity,
      'export restore',
      restored('Mixed.tsx'),
      () => expect(mixed).toHaveText('mixed original'),
      { updates: 3, reloads: 0, warnings: 0 }
    );
    await intact();

    // A value in a circular import: Vite ends the invalidation chain with a reload.
    const cycle = page.locator('.storm-cycle-b');
    const cycleLimits = { updates: 4, reloads: 1, warnings: 2 };
    await save(
      page,
      activity,
      'cycle edit',
      edited('CycleA.tsx', 'cycle original', 'cycle changed'),
      () => expect(cycle).toHaveText('cycle changed'),
      cycleLimits
    );
    await save(
      page,
      activity,
      'cycle restore',
      restored('CycleA.tsx'),
      () => expect(cycle).toHaveText('cycle original'),
      cycleLimits
    );
    await intact();

    // An entry that only renders: one reload, one app.
    const entryLimits = { updates: 0, reloads: 1, warnings: 0 };
    const reloads = activity.reloads;
    await save(
      page,
      activity,
      'entry edit',
      edited('main.tsx', 'entry: original', 'entry: changed'),
      () => until(page, () => activity.reloads > reloads, 'entry reload'),
      entryLimits
    );
    await intact();
    const reloadsAgain = activity.reloads;
    await save(
      page,
      activity,
      'entry restore',
      restored('main.tsx'),
      () => until(page, () => activity.reloads > reloadsAgain, 'entry reload'),
      entryLimits
    );
    await intact();
  } finally {
    await files.restoreAll();
    await settle(page, activity, 'final restore').catch(() => {});
  }
});

plain(
  'HMR storm: a component that throws and a syntax error settle and recover',
  async ({ page }, info) => {
    plain.setTimeout(120_000);
    const core = info.project.name;
    const activity = await watch(page);
    const files = sources(core);
    await ready(page, `/.e2e-work/${core}/storm/index.html`, core);
    const failing = { updates: 4, reloads: 2, warnings: 6 };

    try {
      // A replacement that throws: bounded retries and invalidations, then stop.
      await save(
        page,
        activity,
        'throwing edit',
        () =>
          files.edit('Thrower.tsx', source =>
            source.replace(
              '() => (\n  <p class="storm-thrower">thrower original</p>\n)',
              "() => {\n  throw new Error('storm-probe');\n}"
            )
          ),
        () =>
          until(
            page,
            () => activity.warnings > 0 || activity.reloads > 1,
            'failure reported'
          ),
        failing
      );
      await save(
        page,
        activity,
        'throwing restore',
        () => files.restore('Thrower.tsx'),
        () =>
          expect(page.locator('.storm-thrower')).toHaveText('thrower original'),
        failing
      );
      await expect(page.locator('main')).toHaveCount(1);

      // A save in the middle of typing, then the finished edit.
      const item = page.locator('.storm-item').first();
      await save(
        page,
        activity,
        'syntax error',
        () =>
          files.edit('Items.tsx', source =>
            source.replace('export const Inner', 'export const Inner = (((')
          ),
        () => page.waitForTimeout(500),
        failing
      );
      await save(
        page,
        activity,
        'syntax fix',
        () =>
          files.edit('Items.tsx', source =>
            source
              .replace('export const Inner = (((', 'export const Inner')
              .replaceAll('item original', 'item fixed')
          ),
        () => expect(item).toHaveText('item fixed 0'),
        failing
      );
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('.storm-outer')).toHaveCount(2);
    } finally {
      await files.restoreAll();
      await settle(page, activity, 'final restore').catch(() => {});
    }
  }
);

test('HMR storm: a layout that renders <html> is replaced repeatedly', async ({
  page,
}, info) => {
  const core = info.project.name;
  const activity = await watch(page);
  const files = sources(core);
  await ready(page, `/.e2e-work/${core}/storm/document.html`, core);
  const title = page.locator('.storm-doc-title');

  try {
    for (const version of ['v1', 'v2', 'v3']) {
      await save(
        page,
        activity,
        `layout ${version}`,
        () =>
          files.edit('Layout.tsx', source =>
            source.replace(/layout (original|v\d)/, `layout ${version}`)
          ),
        () => expect(title).toHaveText(`layout ${version}`),
        { updates: 1, reloads: 0, warnings: 0 }
      );
      await expect(page.locator('.storm-doc-header')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('data-core', core);
    }
    await save(
      page,
      activity,
      'layout restore',
      () => files.restore('Layout.tsx'),
      () => expect(title).toHaveText('layout original'),
      { updates: 1, reloads: 0, warnings: 0 }
    );
  } finally {
    await files.restoreAll();
    await settle(page, activity, 'final restore').catch(() => {});
  }
});
