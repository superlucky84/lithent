import { transformWithMarker } from '../parser';

const createDefaultMarkerRegex = () =>
  new RegExp(
    '/\\*\\s*lithent:hmr-boundary(?:\\s+([A-Za-z0-9_,\\s]+))?\\s*\\*/'
  );

const markerSourceDefault = `
'use client';
import { render, mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props: { title: string }) => {
  return () => <div>{props.title}</div>;
});

const Secondary = mount((renew, props: { subtitle: string }) => {
  return () => <p>{props.subtitle}</p>;
});

export default App;
`;

const markerSourceNamed = `
"use client";
import type { TagFunction } from 'lithent';
import { createBoundary } from 'lithent/devHelper';
import { render, mount } from 'lithent';

/* lithent:hmr-boundary Counter, Another */

export const Counter = mount((renew, props) => {
  return () => <span>{props.value}</span>;
});

export const Another = mount((renew, props) => {
  return () => <span>{props.value}</span>;
});
`;

const defaultResult = transformWithMarker({
  code: markerSourceDefault,
  markerRegex: createDefaultMarkerRegex(),
  boundaryImportSpecifier: 'lithent/devHelper',
  tagFunctionImportSpecifier: 'lithent',
});

const namedResult = transformWithMarker({
  code: markerSourceNamed,
  markerRegex: createDefaultMarkerRegex(),
  boundaryImportSpecifier: 'lithent/devHelper',
  tagFunctionImportSpecifier: 'lithent',
});

console.log('[marker] transformed default:', defaultResult.transformed);
console.log('[marker] transformed named:', namedResult.transformed);
console.log('[marker] code default:', defaultResult.code);
console.log('[marker] code named:', namedResult.code);

if (!import.meta.vitest) {
  const defaultPre = document?.getElementById('marker-default');
  if (defaultPre) {
    defaultPre.textContent = defaultResult.transformed
      ? defaultResult.code
      : 'transform skipped';
  }

  const namedPre = document?.getElementById('marker-named');
  if (namedPre) {
    namedPre.textContent = namedResult.transformed
      ? namedResult.code
      : 'transform skipped';
  }
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('transformWithMarker', () => {
    it('replaces marker comment with HMR bootstrap and injects helpers', () => {
      expect(defaultResult.transformed).toBe(true);
      expect(defaultResult.code).not.toMatch(/lithent:hmr-boundary/);
      expect(defaultResult.code).toContain(
        "import { createBoundary } from 'lithent/devHelper';"
      );
      expect(defaultResult.code).toContain(
        "import type { TagFunction } from 'lithent';"
      );
      expect(defaultResult.code).toContain(
        "import { mountCallback, getComponentKey } from 'lithent';"
      );
      expect(defaultResult.code).toContain(
        'const __lithentModuleId = new URL(import.meta.url).pathname;'
      );
      expect(defaultResult.code).toContain(
        'const __lithentHmrTargets = ["default"];'
      );
      const registerMatches =
        defaultResult.code.match(/counterBoundary\.register\(compKey\)/g) ?? [];
      const unregisterMatches =
        defaultResult.code.match(
          /mountCallback\(\(\) => \(\) => unregister\(\)\)/g
        ) ?? [];
      expect(registerMatches).toHaveLength(2);
      expect(unregisterMatches).toHaveLength(2);
    });

    it('respects explicit export names declared in the marker', () => {
      expect(namedResult.transformed).toBe(true);
      expect(
        namedResult.code.match(
          /import { createBoundary } from 'lithent\/devHelper';/g
        )
      ).toHaveLength(1);
      expect(namedResult.code).toContain(
        'const __lithentHmrTargets = ["Counter","Another"];'
      );
      const namedRegisters =
        namedResult.code.match(/counterBoundary\.register\(compKey\)/g) ?? [];
      const namedUnregisters =
        namedResult.code.match(
          /mountCallback\(\(\) => \(\) => unregister\(\)\)/g
        ) ?? [];
      expect(namedRegisters).toHaveLength(2);
      expect(namedUnregisters).toHaveLength(2);
    });
  });
}
