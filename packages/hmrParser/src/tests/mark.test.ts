import { transformWithMarker } from '../markerParse';

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
      expect(defaultResult.code).toContain('import.meta.hot');
      expect(defaultResult.code).toContain(
        "import { mountCallback, getComponentKey } from 'lithent';"
      );
      expect(defaultResult.code).toContain(
        'const __lithentModuleId = new URL(import.meta.url).pathname;'
      );
      expect(defaultResult.code).toContain(
        'const __lithentHmrTargets = ["App","Secondary"];'
      );
      expect(defaultResult.code).toContain('const knownNames = new Set([');
      expect(defaultResult.code).toContain('...["App","Secondary"]');
      expect(defaultResult.code).toContain('...__lithentHmrTargets');
      expect(defaultResult.code).toContain(
        'const __lithentHotComponent_App = App;'
      );
      expect(defaultResult.code).toContain(
        '__lithentModuleHotStore["App"] = __lithentHotComponent_App;'
      );
      expect(defaultResult.code).toContain(
        'const __lithentHotComponent_Secondary = Secondary;'
      );
      expect(defaultResult.code).toContain(
        '__lithentModuleHotStore["Secondary"] = __lithentHotComponent_Secondary;'
      );
      expect(defaultResult.code).toContain(
        'const __lithentRenderOnce = (factory)'
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
      expect(namedResult.code).toContain('import.meta.hot');
      expect(namedResult.code).toContain('const knownNames = new Set([');
      expect(namedResult.code).toContain('...["Counter","Another"]');
      expect(namedResult.code).toContain('...__lithentHmrTargets');
      expect(namedResult.code).toContain(
        'const __lithentHotComponent_Counter = Counter;'
      );
      expect(namedResult.code).toContain(
        '__lithentModuleHotStore["Counter"] = __lithentHotComponent_Counter;'
      );
      expect(namedResult.code).toContain(
        'const __lithentHotComponent_Another = Another;'
      );
      expect(namedResult.code).toContain(
        '__lithentModuleHotStore["Another"] = __lithentHotComponent_Another;'
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

    it('still injects helpers when code includes snippet text mentioning mountCallback', () => {
      const sourceWithSnippet = [
        "'use client';",
        "import { mount } from 'lithent';",
        '',
        'const doc = "import { h, mountCallback } from \'lithent\';";',
        '',
        '/* lithent:hmr-boundary default */',
        '',
        'const Demo = mount(() => {',
        '  return () => <div>demo</div>;',
        '});',
        '',
        'export default Demo;',
        '',
      ].join('\n');

      const snippetResult = transformWithMarker({
        code: sourceWithSnippet,
        markerRegex: createDefaultMarkerRegex(),
        boundaryImportSpecifier: 'lithent/devHelper',
        tagFunctionImportSpecifier: 'lithent',
      });

      expect(snippetResult.transformed).toBe(true);
      expect(snippetResult.code).toContain(
        "import { mountCallback, getComponentKey } from 'lithent';"
      );
    });
  });
}
