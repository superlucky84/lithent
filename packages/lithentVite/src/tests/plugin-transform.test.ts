import { describe, expect, test, vi } from 'vitest';
import { lithentVitePlugin } from '../plugin';

const runTransform = async (source: string, id = '/src/App.tsx') => {
  const plugin = lithentVitePlugin();
  if (!plugin || !plugin.transform) {
    throw new Error('lithentVitePlugin did not provide a transform hook');
  }

  const warn = vi.fn();
  const transform = plugin.transform as (
    this: { warn: typeof warn },
    code: string,
    id: string
  ) => unknown;

  const result = await transform.call({ warn }, source, id);

  return { result, warnings: warn };
};

describe('lithentVitePlugin transform', () => {
  test.skip('주석 마커를 Lithent HMR 부트스트랩 코드로 치환하고 import 를 추가한다', async () => {
    const source = `
'use client';
import { render, mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props) => {
  return () => <div>{props.title}</div>;
});

const root = document.getElementById('root');
if (root) {
  render(<App title="hello" />, root);
}

export default App;
`;

    const { result } = await runTransform(source);

    expect(result).not.toBeNull();
    if (!result) return;

    const transformed = result.code;
    const normalized = transformed.trimStart();

    expect(
      normalized.startsWith(`'use client';\nimport { createBoundary }`)
    ).toBe(true);
    expect(normalized).toContain(
      "import { createBoundary } from 'lithent/devHelper';"
    );
    expect(normalized).toContain("import type { TagFunction } from 'lithent';");
    expect(normalized.indexOf('createBoundary')).toBeLessThan(
      normalized.indexOf("import { render, mount } from 'lithent';")
    );
    expect(normalized).toContain(
      'const __lithentModuleId = new URL(import.meta.url).pathname;'
    );
    expect(normalized).toContain('__lithentSetupHmrHooks();');
    expect(normalized).toContain('const __lithentHmrTargets = ["default"];');
    expect(normalized).not.toContain('/* lithent:hmr-boundary');
    expect(normalized.indexOf('__lithentModuleId')).toBeGreaterThan(
      normalized.indexOf("import { render, mount } from 'lithent';")
    );
  });

  test.skip('이미 필요한 import 가 존재할 때 중복 삽입하지 않는다', async () => {
    const source = `
"use client";
import type { TagFunction } from 'lithent';
import { createBoundary } from 'lithent/devHelper';
import { render, mount } from 'lithent';

/* lithent:hmr-boundary Counter */

export const Counter = mount((renew, props) => {
  return ({ value }: { value: number }) => <span>{value}</span>;
});
`;

    const { result } = await runTransform(source, '/src/Counter.tsx');

    expect(result).not.toBeNull();
    if (!result) return;

    const transformed = result.code;
    const normalized = transformed.trimStart();
    const importOccurrences = transformed.match(
      /createBoundary\s+from\s+'lithent\/devHelper'/g
    );
    const tagImportOccurrences = transformed.match(
      /TagFunction\s+}\s+from\s+'lithent'/g
    );

    expect(importOccurrences).toHaveLength(1);
    expect(tagImportOccurrences).toHaveLength(1);
    expect(normalized).toContain('const __lithentHmrTargets = ["Counter"];');
  });

  test.skip('마커 없이도 Lithent 엔트리를 감지해 HMR 부트스트랩을 삽입한다', async () => {
    const source = `
'use client';
import { render, mount } from 'lithent';

const App = mount((renew, props) => {
  return () => <div>{props.title}</div>;
});

const root = document.getElementById('root');
if (root) {
  render(<App title="auto" />, root);
}

export default App;
`;

    const { result } = await runTransform(source, '/src/App.tsx');

    expect(result).not.toBeNull();
    if (!result) return;

    const transformed = result.code;
    const normalized = transformed.trimStart();
    expect(
      normalized.startsWith(`'use client';\nimport { createBoundary }`)
    ).toBe(true);
    expect(normalized).toContain(
      "import { createBoundary } from 'lithent/devHelper';"
    );
    expect(normalized).toContain("import type { TagFunction } from 'lithent';");
    expect(normalized).toContain('const __lithentHmrTargets = ["default"];');
    expect(normalized.indexOf('createBoundary')).toBeLessThan(
      normalized.indexOf("import { render, mount } from 'lithent';")
    );
    expect(normalized.indexOf('__lithentModuleId')).toBeGreaterThan(
      normalized.indexOf("import { render, mount } from 'lithent';")
    );
  });
});
