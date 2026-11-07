import { test, expect, ready } from './test';
import type { Locator } from '@playwright/test';

const selection = (input: Locator) =>
  input.evaluate(node => {
    const element = node as HTMLInputElement;
    return {
      start: element.selectionStart,
      end: element.selectionEnd,
      direction: element.selectionDirection,
    };
  });

test('forms: trusted keyboard edits keep the caret and follow the native input/change order', async ({
  page,
}, info) => {
  await ready(page, '/e2e/fixtures/forms.html', info.project.name);
  const managed = page.locator('#managed');
  const edit = async (input: Locator) => {
    await input.focus();
    await input.press('End');
    await input.press('ArrowLeft');
    await page.keyboard.type('XY');
    await expect(input).toHaveValue('abcdeXYf');
    expect(await selection(input)).toMatchObject({ start: 7, end: 7 });
    await input.press('Tab');
  };
  await edit(managed);
  await expect(page.locator('#text-value')).toHaveText('abcdeXYf');
  const actual = await page.evaluate(() => [
    ...window.formProbe.events.managed,
  ]);
  await edit(page.locator('#native'));
  expect(actual).toEqual(
    await page.evaluate(() => window.formProbe.events.native)
  );
  expect(actual.every(event => event.trusted)).toBe(true);
  expect(actual.filter(event => event.type === 'input')).toHaveLength(2);
  expect(actual.filter(event => event.type === 'beforeinput')).toHaveLength(2);
  expect(actual.filter(event => event.type === 'change')).toHaveLength(1);
});

test('forms: an unrelated renew preserves the input node, focus and both selection directions', async ({
  page,
}, info) => {
  await ready(page, '/e2e/fixtures/forms.html', info.project.name);
  const input = page.locator('#managed');
  await input.focus();
  for (const [index, direction] of (
    ['forward', 'backward'] as const
  ).entries()) {
    await input.evaluate(
      (node, direction) =>
        (node as HTMLInputElement).setSelectionRange(1, 4, direction),
      direction
    );
    await page.evaluate(() => window.formProbe.renew());
    await expect(page.locator('#revision')).toHaveText(`revision ${index + 1}`);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('abcdef');
    expect(
      await input.evaluate(node => node === window.formProbe.inputs.managed)
    ).toBe(true);
    expect(await selection(input)).toEqual({ start: 1, end: 4, direction });
  }
});

test('forms: reordering other keyed rows keeps the active row node, value, focus and selection', async ({
  page,
}, info) => {
  await ready(page, '/e2e/fixtures/forms.html', info.project.name);
  const input = page.locator('#row-a');
  await input.focus();
  await input.press('End');
  await page.keyboard.type('!');
  await input.evaluate(node =>
    (node as HTMLInputElement).setSelectionRange(2, 5, 'backward')
  );
  await page.evaluate(() => window.formProbe.reorder());
  await expect(page.locator('#rows li')).toHaveText(['a', 'c', 'b']);
  await expect(input).toHaveValue('entry-a!');
  await expect(input).toBeFocused();
  expect(await selection(input)).toEqual({
    start: 2,
    end: 5,
    direction: 'backward',
  });
  expect(
    await page
      .locator('#rows input')
      .evaluateAll(nodes =>
        nodes.every(node => node === window.formProbe.inputs[node.id])
      )
  ).toBe(true);
});

test('forms: Tab and Space keep native focus order and controlled checkbox state across renew', async ({
  page,
}, info) => {
  await ready(page, '/e2e/fixtures/forms.html', info.project.name);
  const toggle = page.locator('#toggle');
  await page.locator('#managed').focus();
  await page.keyboard.press('Tab');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Space');
  await expect(toggle).toBeChecked();
  await expect(page.locator('#checked-value')).toHaveText('true');
  await page.evaluate(() => window.formProbe.renew());
  await expect(page.locator('#revision')).toHaveText('revision 1');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect(page.locator('#checked-value')).toHaveText('false');
  expect(await page.evaluate(() => window.formProbe.checkboxEvents)).toEqual([
    { type: 'change', trusted: true, checked: true },
    { type: 'change', trusted: true, checked: false },
  ]);
  for (const id of ['row-a', 'row-b', 'row-c', 'after']) {
    await page.keyboard.press('Tab');
    await expect(page.locator(`#${id}`)).toBeFocused();
  }
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#row-c')).toBeFocused();
});
