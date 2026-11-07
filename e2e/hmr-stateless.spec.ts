import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect, ready } from './test';

test('HMR: stateless, mount and lmount siblings update repeatedly without replacing the parent', async ({
  page,
}, info) => {
  const core = info.project.name;
  const warnings: string[] = [];
  page.on('console', message => {
    if (message.type() === 'warning' && message.text().includes('Lithent HMR'))
      warnings.push(message.text());
  });
  await ready(page, `/.e2e-work/${core}/stateless.html`, core);
  const token = await page.evaluate(() => {
    const value = crypto.randomUUID();
    (window as unknown as { hmrToken: string }).hmrToken = value;
    return value;
  });
  await page.locator('#parent-increment').click();
  await page.locator('#parent-increment').click();
  await expect(page.locator('#parent-count')).toHaveText('2');
  await expect(page.locator('#mixed-panel')).toHaveCount(1);
  await expect(page.locator('#mixed-inner')).toHaveCount(1);
  const file = resolve('.e2e-work', core, 'Stateless.tsx');
  const original = await readFile(file, 'utf8');
  try {
    for (const version of ['second', 'third', 'fourth']) {
      await writeFile(file, original.replaceAll('original', version));
      await expect(page.locator('.badge')).toHaveText(`${version} badge: Info`);
      await expect(page.locator('#stateless-card h2')).toHaveText(
        `${version} card: Title 2`
      );
      await expect(page.locator('#stateless-default')).toHaveText(
        `${version} default: Label 2`
      );
      await expect(page.locator('#mixed-panel > h3')).toHaveText(
        `${version} panel`
      );
      await expect(page.locator('#mixed-inner h3')).toHaveText(
        `${version} inner`
      );
      await expect(page.locator('#mixed-panel')).toHaveCount(1);
      await expect(page.locator('#mixed-inner')).toHaveCount(1);
      await expect(page.locator('#card-child')).toHaveText('Child 2');
      await expect(page.locator('#parent-count')).toHaveText('2');
      await expect(page.locator('#direct-owner')).toHaveText(
        `${version} direct: Label 2`
      );
      await expect(page.locator('#external-direct-owner')).toHaveText(
        `${version} direct: External 2`
      );
      await expect(page.locator('.stateless-list-item')).toHaveText([
        `${version} list: Item 2`,
        `${version} list: Last`,
      ]);
      expect(
        await page.evaluate(
          () =>
            (window as unknown as { hmrActiveMounts: number }).hmrActiveMounts
        )
      ).toBe(1);
    }
    // Parent redraws must keep using the latest implementations, while the
    // unaffected mounted child keeps its new closure state.
    await page.locator('#mixed-inner button').click();
    await expect(page.locator('#mixed-inner output')).toHaveText('1');
    await page.locator('#parent-increment').click();
    await expect(page.locator('#parent-count')).toHaveText('3');
    await expect(page.locator('#mixed-inner output')).toHaveText('1');
    await expect(page.locator('#stateless-card h2')).toHaveText(
      'fourth card: Title 3'
    );
    await expect(page.locator('#card-child')).toHaveText('Child 3');
    await expect(page.locator('#stateless-default')).toHaveText(
      'fourth default: Label 3'
    );

    // A component can be unmounted during an update, then mounted again from
    // the old importer. That is a successful HMR update, not an invalidation.
    await page.locator('#parent-toggle').click();
    await expect(page.locator('#stateless-card')).toHaveCount(0);
    expect(
      await page.evaluate(
        () => (window as unknown as { hmrActiveMounts: number }).hmrActiveMounts
      )
    ).toBe(0);
    const update = page.waitForEvent('console', {
      predicate: message =>
        message.text().includes('hot updated:') &&
        message.text().includes('Stateless.tsx'),
    });
    await writeFile(file, original.replaceAll('original', 'unmounted'));
    await update;
    await page.locator('#parent-toggle').click();
    await expect(page.locator('.badge')).toHaveText('unmounted badge: Info');
    await expect(page.locator('#mixed-panel > h3')).toHaveText(
      'unmounted panel'
    );
    await expect(page.locator('#parent-count')).toHaveText('3');
    expect(
      await page.evaluate(
        () => (window as unknown as { hmrToken: string }).hmrToken
      )
    ).toBe(token);
    expect(warnings).toEqual([]);
  } finally {
    await writeFile(file, original);
  }
});

test('HMR: empty stateless output can become visible and empty again', async ({
  page,
}, info) => {
  const core = info.project.name;
  await ready(page, `/.e2e-work/${core}/stateless.html`, core);
  await page.locator('#parent-increment').click();
  const file = resolve('.e2e-work', core, 'Stateless.tsx');
  const original = await readFile(file, 'utf8');
  try {
    for (const output of [
      '<div id="empty-output">visible</div>',
      'null',
      '<div id="empty-output">back</div>',
      'false',
    ]) {
      const update = page.waitForEvent('console', {
        predicate: message =>
          message.text().includes('hot updated:') &&
          message.text().includes('Stateless.tsx'),
      });
      await writeFile(
        file,
        original.replace(
          'export const Empty = () => null;',
          `export const Empty = () => ${output};`
        )
      );
      await update;
      if (output === 'null' || output === 'false')
        await expect(page.locator('#empty-output')).toHaveCount(0);
      else
        await expect(page.locator('#empty-output')).toHaveText(
          output.includes('back') ? 'back' : 'visible'
        );
      await expect(page.locator('#parent-count')).toHaveText('1');
      await expect(page.locator('#mixed-panel')).toHaveCount(1);
    }
  } finally {
    await writeFile(file, original);
  }
});
