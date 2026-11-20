import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect, ready } from './test';

// docs/hmr-propagation: modules without components must pass their updates
// to their importers. They used to be marked as accepting their own updates,
// so Vite dropped every edit: no update and no reload.
test('HMR: modules without components pass updates to their importers', async ({
  page,
}, info) => {
  const core = info.project.name;
  await ready(page, `/.e2e-work/${core}/propagation.html`, core);
  const setToken = () =>
    page.evaluate(() => {
      (window as unknown as { hmrToken: string }).hmrToken = 'kept';
    });
  const readToken = () =>
    page.evaluate(() => (window as unknown as { hmrToken?: string }).hmrToken);
  await setToken();
  await page.locator('#greeting-increment').click();
  await expect(page.locator('#greeting-count')).toHaveText('1');

  const store = resolve('.e2e-work', core, 'greeting-store.ts');
  const entry = resolve('.e2e-work', core, 'propagation-app.tsx');
  const originalStore = await readFile(store, 'utf8');
  const originalEntry = await readFile(entry, 'utf8');
  try {
    // A store module: the importing component takes the update in place.
    await writeFile(
      store,
      originalStore.replace('original label', 'next label')
    );
    await expect(page.locator('#greeting-label')).toHaveText('next label');
    await expect(page.locator('#greeting')).toHaveCount(1);
    expect(await readToken()).toBe('kept');
    // The re-evaluated store starts over, and the component follows it.
    await expect(page.locator('#greeting-count')).toHaveText('0');
    await page.locator('#greeting-increment').click();
    await expect(page.locator('#greeting-count')).toHaveText('1');

    // An entry that only renders: the page reloads once.
    await writeFile(
      entry,
      originalEntry.replace('original entry', 'next entry')
    );
    await expect(page.locator('#greeting-entry')).toHaveText('next entry');
    await expect(page.locator('#greeting')).toHaveCount(1);
    expect(await readToken()).toBeUndefined();
    await expect(page.locator('#greeting-label')).toHaveText('next label');
  } finally {
    await writeFile(store, originalStore);
    await writeFile(entry, originalEntry);
  }
  // Restoring the entry reloads every page open on this server. Wait for it
  // here, or the reload lands on the next test's page.
  await expect(page.locator('#greeting-entry')).toHaveText('original entry');
  await expect(page.locator('#greeting-label')).toHaveText('original label');
});
