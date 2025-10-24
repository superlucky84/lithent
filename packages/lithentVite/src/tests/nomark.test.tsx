import { transformWithoutMarker } from '../parser';

const source = `
'use client';
import { render, mount } from 'lithent';

const Demo = mount((_renew, props: { message: string }) => {
  return () => ({ type: 'div', props: {}, children: [props.message] } as any);
});

const Another = mount((_renew, props: { id: number }) => {
  return () => ({ type: 'span', props: {}, children: [String(props.id)] } as any);
});

const root = document.getElementById('app');
if (root) {
  render(Demo({ message: 'hello' }), root as any);
  render(Another({ id: 1 }), root as any);
}
`;

const result = transformWithoutMarker({
  code: source,
  boundaryImportSpecifier: 'lithent/devHelper',
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
    it('should mark transform as successful and inject HMR bootstrap + boundary registration', () => {
      const expectedSnippet =
        'const __lithentModuleId = new URL(import.meta.url).pathname;';

      expect(result.transformed).toBe(true);
      expect(result.code.includes(expectedSnippet)).toBe(true);
      expect(
        result.code.includes(
          "import { createBoundary } from 'lithent/devHelper'"
        )
      ).toBe(true);
      expect(
        result.code.includes(
          "import { mountCallback, getComponentKey } from 'lithent'"
        )
      ).toBe(true);
      expect(result.code.includes('const compKey = getComponentKey();')).toBe(
        true
      );
      const registerMatches =
        result.code.match(/counterBoundary\.register\(compKey\)/g) ?? [];
      const unregisterMatches =
        result.code.match(/mountCallback\(\(\) => \(\) => unregister\(\)\)/g) ??
        [];
      expect(registerMatches).toHaveLength(2);
      expect(unregisterMatches).toHaveLength(2);
    });
  });
}
