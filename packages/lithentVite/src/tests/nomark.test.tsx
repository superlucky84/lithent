import { transformWithoutMarker } from '../parser';

const source = `
'use client';
import { render, mount } from 'lithent';

const Demo = mount((_renew, props: { message: string }) => {
  return () => ({ type: 'div', props: {}, children: [props.message] } as any);
});

const root = document.getElementById('app');
if (root) {
  render(Demo({ message: 'hello' }), root as any);
}
`;

const result = transformWithoutMarker({
  code: source,
  boundaryImportSpecifier: 'lithent/devmodetest/createBoundary',
  tagFunctionImportSpecifier: 'lithent',
});

console.log('[no-marker] transformed:', result.transformed);
console.log('[no-marker] code:', result.code);

if (!import.meta.vitest) {
  const pre = document?.getElementById('output');
  if (pre) {
    pre.textContent = result.transformed ? result.code : 'transform skipped';
  }
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('transformWithoutMarker (integration)', () => {
    it('should mark transform as successful and inject HMR bootstrap', () => {
      const expectedSnippet = 'const __lithentModuleId = new URL(import.meta.url).pathname;';

      expect(result.transformed).toBe(true);
      expect(result.code.includes(expectedSnippet)).toBe(true);
      expect(result.code.includes('import { createBoundary }')).toBe(true);
      expect(result.code.includes("import { mountCallback } from 'lithent'"))
        .toBe(true);
      expect(result.code.includes('counterBoundary.register(props)')).toBe(true);
      expect(result.code.includes('mountCallback(() => () => unregister())')).toBe(true);
    });
  });
}
