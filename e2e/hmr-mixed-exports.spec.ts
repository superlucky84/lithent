import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect, ready } from './test';

test('HMR: mixed exports update their importers and clean up remounted roots', async ({
  page,
}, info) => {
  const core = info.project.name;
  await ready(page, `/.e2e-work/${core}/mixed.html`, core);
  const token = await page.evaluate(() => {
    const value = crypto.randomUUID();
    (window as unknown as { hmrToken: string }).hmrToken = value;
    return value;
  });
  await page.locator('#mixed-increment').click();
  await page.locator('#mixed-increment').click();
  const file = resolve('.e2e-work', core, 'Mixed.tsx');
  const original = await readFile(file, 'utf8');
  try {
    await writeFile(file, original.replace('original badge', 'next badge'));
    await expect(page.locator('#mixed-badge')).toHaveText('next badge');
    await expect(page.locator('#mixed-count')).toHaveText('2');
    for (let version = 1; version <= 5; version++) {
      await writeFile(
        file,
        original.replaceAll('original', `version ${version}`)
      );
      await expect(page.locator('#mixed-value')).toHaveText(
        `version ${version} value`
      );
      await expect(page.locator('#mixed-badge')).toHaveText(
        `version ${version} badge`
      );
      await expect(page.locator('#mixed-count')).toHaveText('0');
      await expect(page.locator('main')).toHaveCount(1);
      expect(
        await page.evaluate(
          () => (window as unknown as { hmrActiveRoots: number }).hmrActiveRoots
        )
      ).toBe(1);
      await page.locator('#mixed-increment').click();
      await expect(page.locator('#mixed-count')).toHaveText('1');
    }
    expect(
      await page.evaluate(
        () => (window as unknown as { hmrToken: string }).hmrToken
      )
    ).toBe(token);
  } finally {
    await writeFile(file, original);
  }
});
